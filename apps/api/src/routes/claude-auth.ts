import { Router } from "express";
import { spawn, execFile } from "node:child_process";

export const claudeAuthRouter = Router();

/**
 * Holds the running `claude auth login` process so we can feed it the
 * OAuth code that the user obtains from the browser.
 */
let loginProcess: ReturnType<typeof spawn> | null = null;

function killLoginProcess() {
  if (loginProcess) {
    loginProcess.kill();
    loginProcess = null;
  }
}

/**
 * POST /api/claude/auth/login
 *
 * Starts the Claude Code CLI OAuth flow. Returns the OAuth URL that the
 * caller should open in their browser to obtain an auth code.
 *
 * The CLI normally tries to open a browser itself — we suppress that by
 * setting BROWSER to "echo", which causes the URL to be printed to stdout
 * instead. We capture it and return it in the response.
 *
 * The spawned process is kept alive — it is waiting for the auth code on
 * stdin. Use POST /callback to submit the code.
 */
claudeAuthRouter.post("/login", async (_req, res) => {
  killLoginProcess();

  try {
    const child = spawn("claude", ["auth", "login"], {
      env: {
        ...process.env,
        // Prevent the CLI from opening a real browser — "echo" causes the
        // URL to be printed to stdout so we can capture it.
        BROWSER: "echo",
      },
      stdio: ["pipe", "pipe", "pipe"],
    });

    loginProcess = child;

    // Clean up reference if the process exits on its own.
    child.on("close", () => {
      if (loginProcess === child) {
        loginProcess = null;
      }
    });

    let stdout = "";
    let stderr = "";

    const urlPromise = new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timed out waiting for OAuth URL from CLI"));
      }, 15_000);

      const tryExtractUrl = (combined: string) => {
        const match = combined.match(/https:\/\/\S+/);
        if (match) {
          clearTimeout(timeout);
          resolve(match[0]);
        }
      };

      child.stdout?.on("data", (data: Buffer) => {
        stdout += data.toString();
        tryExtractUrl(stdout + stderr);
      });

      child.stderr?.on("data", (data: Buffer) => {
        stderr += data.toString();
        tryExtractUrl(stdout + stderr);
      });

      child.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      child.on("close", (code) => {
        clearTimeout(timeout);
        reject(
          new Error(
            `claude auth login exited with code ${code} before producing a URL. stdout: ${stdout} stderr: ${stderr}`,
          ),
        );
      });
    });

    const url = await urlPromise;
    res.json({ url });
  } catch (err: any) {
    killLoginProcess();
    res.status(500).json({ error: err.message ?? "Failed to start OAuth flow" });
  }
});

/**
 * POST /api/claude/auth/callback
 *
 * Submits the OAuth code to the waiting `claude auth login` process.
 * Body: { "code": "<the code from the browser>" }
 *
 * The code is written to the CLI process's stdin. We then wait for
 * the process to exit and report success or failure.
 */
claudeAuthRouter.post("/callback", async (req, res) => {
  const { code } = req.body ?? {};

  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "Missing required field: code" });
    return;
  }

  if (!loginProcess) {
    res.status(409).json({
      error: "No login flow in progress. Call POST /api/claude/auth/login first.",
    });
    return;
  }

  try {
    const child = loginProcess;

    const exitPromise = new Promise<{ success: boolean; output: string }>(
      (resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Timed out waiting for CLI to accept the code"));
        }, 30_000);

        let stdout = "";
        let stderr = "";

        child.stdout?.on("data", (data: Buffer) => {
          stdout += data.toString();
        });

        child.stderr?.on("data", (data: Buffer) => {
          stderr += data.toString();
        });

        child.on("close", (exitCode) => {
          clearTimeout(timeout);
          resolve({
            success: exitCode === 0,
            output: (stdout + stderr).trim(),
          });
        });

        child.on("error", (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      },
    );

    // Write the code to stdin followed by a newline so the CLI accepts it.
    child.stdin?.write(code + "\n");
    child.stdin?.end();

    const result = await exitPromise;
    loginProcess = null;

    if (result.success) {
      res.json({ success: true, output: result.output });
    } else {
      res.status(400).json({ success: false, output: result.output });
    }
  } catch (err: any) {
    killLoginProcess();
    res.status(500).json({ error: err.message ?? "Failed to submit code" });
  }
});

/**
 * GET /api/claude/auth/status
 *
 * Returns the current authentication status of the Claude Code CLI.
 */
claudeAuthRouter.get("/status", async (_req, res) => {
  try {
    const result = await new Promise<{ authenticated: boolean; output: string }>(
      (resolve, reject) => {
        execFile("claude", ["auth", "status"], (err, stdout, stderr) => {
          if (err && (err as any).code === "ENOENT") {
            reject(new Error("claude CLI not found"));
            return;
          }
          const exitCode = err ? (err as any).code ?? 1 : 0;
          resolve({
            authenticated: exitCode === 0,
            output: (stdout || stderr).trim(),
          });
        });
      },
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to check auth status" });
  }
});

/**
 * POST /api/claude/auth/logout
 *
 * Logs out of the Claude Code CLI.
 */
claudeAuthRouter.post("/logout", async (_req, res) => {
  try {
    await new Promise<void>((resolve, reject) => {
      execFile("claude", ["auth", "logout"], (err) => {
        if (err && (err as any).code === "ENOENT") {
          reject(new Error("claude CLI not found"));
          return;
        }
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

    killLoginProcess();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to logout" });
  }
});
