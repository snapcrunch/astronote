import { Router } from "express";
import { spawn } from "node:child_process";
import { z } from "zod";

export const claudePromptRouter = Router();

const promptSchema = z.object({
  prompt: z.string().min(1).max(4000),
});

const TIMEOUT_MS = 120_000;

/**
 * POST /api/claude/prompt
 *
 * Streams the output of the `claude` CLI as Server-Sent Events.
 * Body: { "prompt": "..." }
 *
 * SSE event types:
 *   - chunk: { type: "chunk", text: "..." }
 *   - done:  { type: "done" }
 *   - error: { type: "error", message: "..." }
 */
claudePromptRouter.post("/", (req, res) => {
  const parsed = promptSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid prompt" });
    return;
  }

  const { prompt } = parsed.data;

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let stderr = "";
  let finished = false;

  function sendEvent(obj: object) {
    if (!finished) {
      res.write(`data: ${JSON.stringify(obj)}\n\n`);
    }
  }

  function finish() {
    if (!finished) {
      finished = true;
      res.end();
    }
  }

  const escaped = prompt.replace(/'/g, "'\\''");
  const command = `claude -p '${escaped}' --output-format text`;
  const child = spawn(command, {
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
    env: {
      ...process.env,
      CI: "1",
    },
  });

  const timeout = setTimeout(() => {
    child.kill();
    sendEvent({ type: "error", message: "Prompt timed out after 120 seconds" });
    finish();
  }, TIMEOUT_MS);

  child.stdout.on("data", (data: Buffer) => {
    sendEvent({ type: "chunk", text: data.toString() });
  });

  child.stderr.on("data", (data: Buffer) => {
    stderr += data.toString();
  });

  child.on("close", (code) => {
    clearTimeout(timeout);
    if (code === 0) {
      sendEvent({ type: "done" });
    } else {
      sendEvent({ type: "error", message: stderr.trim() || `Process exited with code ${code}` });
    }
    finish();
  });

  child.on("error", (err) => {
    clearTimeout(timeout);
    sendEvent({ type: "error", message: err.message });
    finish();
  });

  res.on("close", () => {
    clearTimeout(timeout);
    child.kill();
    finished = true;
  });
});
