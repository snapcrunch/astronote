import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile, spawn } from 'node:child_process';
import { logger } from '@repo/logger';

const TIMEOUT_MS = 120_000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.resolve(
  __dirname,
  '../../../../../apps/cli/src/index.ts'
);

const ADMIN_COMMANDS = ['create-user', 'seed', 'help-all', 'help'];

let cachedHelp: string | null = null;

function fetchCliHelp(): Promise<string> {
  if (cachedHelp) {
    return Promise.resolve(cachedHelp);
  }

  return new Promise((resolve, reject) => {
    execFile(
      'node',
      ['--import', 'tsx', CLI_PATH, 'help-all'],
      (err, stdout) => {
        if (err) {
          reject(err);
          return;
        }
        const lines = stdout
          .split('\n')
          .filter((line) => {
            const trimmed = line.trim();
            return !ADMIN_COMMANDS.some((cmd) =>
              trimmed.startsWith(`astronote ${cmd}`)
            );
          })
          .join('\n');
        cachedHelp = lines;
        resolve(lines);
      }
    );
  });
}

export interface PromptOptions {
  dbPath: string;
  userId: number;
  sessionId?: string;
  activeNoteTitle?: string;
}

export interface PromptCallbacks {
  onChunk: (text: string) => void;
  onDone: (sessionId: string | null) => void;
  onError: (message: string) => void;
}

export interface PromptHandle {
  kill: () => void;
}

function buildSystemPrompt(options: PromptOptions, cliHelp: string): string {
  const { dbPath, userId } = options;
  const cliPrefix = `node --import tsx ${CLI_PATH} --user-id ${userId} --db '${dbPath}'`;

  let msg = `You are operating within a note taking application. To interact with the user's data, use the astronote CLI. The CLI is invoked as:

  ${cliPrefix} <command>

Available commands:
${cliHelp}

All commands return JSON. Do not use sqlite3 or any other tool to access the database directly.`;

  if (options.activeNoteTitle) {
    msg += `\n\nThe user is currently viewing a note titled "${options.activeNoteTitle}".`;
  }
  return msg;
}

export function prompt(
  text: string,
  options: PromptOptions,
  callbacks: PromptCallbacks
): PromptHandle {
  const { onChunk, onDone, onError } = callbacks;

  let stderr = '';
  let finished = false;
  let sessionId: string | null = null;
  let lineBuffer = '';
  let child: ReturnType<typeof spawn> | null = null;

  function finish() {
    finished = true;
  }

  const timeout = setTimeout(() => {
    child?.kill();
    if (!finished) {
      onError('Prompt timed out after 120 seconds');
      finish();
    }
  }, TIMEOUT_MS);

  fetchCliHelp()
    .then((cliHelp) => {
      if (finished) {
        return;
      }

      const escapedPrompt = text.replace(/'/g, "'\\''");
      const escapedSystem = buildSystemPrompt(options, cliHelp).replace(
        /'/g,
        "'\\''"
      );

      const cliPrefix = `node --import tsx ${CLI_PATH}`;
      let command = `claude -p '${escapedPrompt}' --system-prompt '${escapedSystem}' --output-format stream-json --verbose --allowedTools 'Bash(${cliPrefix} *)' WebSearch WebFetch`;
      if (options.sessionId) {
        const escapedSessionId = options.sessionId.replace(/'/g, "'\\''");
        command += ` --resume '${escapedSessionId}'`;
      }

      logger.info({ command }, 'claude: spawning CLI process');

      child = spawn(command, {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
        env: {
          ...process.env,
          CI: '1',
        },
      });

      child.stdout!.on('data', (data: Buffer) => {
        if (finished) {
          return;
        }

        lineBuffer += data.toString();
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            continue;
          }
          try {
            const msg = JSON.parse(trimmed);

            if (
              msg.type === 'system' &&
              msg.subtype === 'init' &&
              msg.session_id
            ) {
              sessionId = msg.session_id;
            } else if (msg.type === 'assistant' && msg.message?.content) {
              for (const block of msg.message.content) {
                if (block.type === 'text' && block.text) {
                  onChunk(block.text);
                }
              }
              if (msg.session_id) {
                sessionId = msg.session_id;
              }
            } else if (msg.type === 'result' && msg.session_id) {
              sessionId = msg.session_id;
            }
          } catch {
            // skip malformed lines
          }
        }
      });

      child.stderr!.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timeout);
        logger.info(
          { code, sessionId, stderrLength: stderr.length },
          'claude: process closed'
        );
        if (finished) {
          return;
        }
        if (code === 0) {
          onDone(sessionId);
        } else {
          onError(stderr.trim() || `Process exited with code ${code}`);
        }
        finish();
      });

      child.on('error', (err) => {
        clearTimeout(timeout);
        logger.error({ err }, 'claude: process error');
        if (finished) {
          return;
        }
        onError(err.message);
        finish();
      });
    })
    .catch((err: Error) => {
      clearTimeout(timeout);
      if (!finished) {
        onError(`Failed to fetch CLI help: ${err.message}`);
        finish();
      }
    });

  return {
    kill() {
      clearTimeout(timeout);
      child?.kill();
      finished = true;
    },
  };
}
