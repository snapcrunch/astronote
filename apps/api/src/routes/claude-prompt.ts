import { Router } from 'express';
import { z } from 'zod';
import domain from '@repo/domain';

const promptSchema = z.object({
  prompt: z.string().min(1).max(4000),
});

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
export function claudePromptRouter(dbPath: string): Router {
  const router = Router();

  router.post('/', (req, res) => {
    const parsed = promptSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: parsed.error.issues[0]?.message ?? 'Invalid prompt' });
      return;
    }

    const { prompt } = parsed.data;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let done = false;

    function sendEvent(obj: object) {
      if (!done) {
        res.write(`data: ${JSON.stringify(obj)}\n\n`);
      }
    }

    const handle = domain.claude.prompt(
      prompt,
      { dbPath },
      {
        onChunk: (text) => sendEvent({ type: 'chunk', text }),
        onDone: () => {
          sendEvent({ type: 'done' });
          done = true;
          res.end();
        },
        onError: (message) => {
          sendEvent({ type: 'error', message });
          done = true;
          res.end();
        },
      }
    );

    res.on('close', () => {
      handle.kill();
      done = true;
    });
  });

  return router;
}
