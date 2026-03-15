import { spawn, type ChildProcess } from 'node:child_process';
import { logger } from '@repo/logger';

const TIMEOUT_MS = 120_000;

export interface PromptOptions {
  dbPath: string;
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

function systemPrompt(dbPath: string, activeNoteTitle?: string): string {
  let msg = `You are operating within a note taking application. Data is stored in a SQLite database located here: ${dbPath}. To read or modify data, use the sqlite3 command-line tool directly (e.g. sqlite3 '${dbPath}' "SELECT ..."). Do not attempt to create scripts or use other tools to interact with the database.`;
  if (activeNoteTitle) {
    msg += ` The user is currently viewing a note titled "${activeNoteTitle}".`;
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

  function finish() {
    finished = true;
  }

  const escapedPrompt = text.replace(/'/g, "'\\''");
  const escapedSystem = systemPrompt(options.dbPath, options.activeNoteTitle).replace(/'/g, "'\\''");

  let command = `claude -p '${escapedPrompt}' --system-prompt '${escapedSystem}' --output-format stream-json --verbose --allowedTools 'Bash(sqlite3*)' WebSearch WebFetch`;
  if (options.sessionId) {
    const escapedSessionId = options.sessionId.replace(/'/g, "'\\''");
    command += ` --resume '${escapedSessionId}'`;
  }

  logger.info({ command }, 'claude: spawning CLI process');

  const child = spawn(command, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    env: {
      ...process.env,
      CI: '1',
    },
  });

  const timeout = setTimeout(() => {
    child.kill();
    if (!finished) {
      onError('Prompt timed out after 120 seconds');
      finish();
    }
  }, TIMEOUT_MS);

  child.stdout.on('data', (data: Buffer) => {
    if (finished) return;

    lineBuffer += data.toString();
    const lines = lineBuffer.split('\n');
    lineBuffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const msg = JSON.parse(trimmed);
        logger.debug({ type: msg.type, subtype: msg.subtype, keys: Object.keys(msg) }, 'claude: parsed stream-json line');

        if (msg.type === 'system' && msg.subtype === 'init' && msg.session_id) {
          sessionId = msg.session_id;
          logger.info({ sessionId }, 'claude: session started');
        } else if (msg.type === 'assistant' && msg.message?.content) {
          for (const block of msg.message.content) {
            if (block.type === 'text' && block.text) {
              onChunk(block.text);
            }
          }
          if (msg.session_id) sessionId = msg.session_id;
        } else if (msg.type === 'result' && msg.session_id) {
          sessionId = msg.session_id;
          logger.info({ sessionId }, 'claude: result received');
        }
      } catch {
        logger.warn({ line: trimmed.slice(0, 200) }, 'claude: failed to parse stdout line');
      }
    }
  });

  child.stderr.on('data', (data: Buffer) => {
    stderr += data.toString();
  });

  child.on('close', (code) => {
    clearTimeout(timeout);
    logger.info({ code, sessionId, stderrLength: stderr.length }, 'claude: process closed');
    if (stderr) {
      logger.debug({ stderr: stderr.slice(0, 500) }, 'claude: stderr output');
    }
    if (finished) return;
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
    if (finished) return;
    onError(err.message);
    finish();
  });

  return {
    kill() {
      clearTimeout(timeout);
      child.kill();
      finished = true;
    },
  };
}
