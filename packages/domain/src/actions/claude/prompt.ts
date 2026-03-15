import { EOL } from 'node:os';
import { spawn, type ChildProcess } from 'node:child_process';

const TIMEOUT_MS = 120_000;

export interface PromptOptions {
  dbPath: string;
}

export interface PromptCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

export interface PromptHandle {
  kill: () => void;
}

const createPrompt = (txt: string, dbPath: string) =>
  `You are operating within a note taking application. Data is stored in a SQLite database located here: ${dbPath}. Here is the user's prompt:${EOL}${EOL}${txt}`;

export function prompt(
  text: string,
  options: PromptOptions,
  callbacks: PromptCallbacks
): PromptHandle {
  const { onChunk, onDone, onError } = callbacks;

  let stderr = '';
  let finished = false;

  function finish() {
    finished = true;
  }

  const escaped = createPrompt(text, options.dbPath).replace(/'/g, "'\\''");
  const command = `claude -p '${escaped}' --output-format text --allowedTools 'Bash(sqlite3*)'`;
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
    if (!finished) onChunk(data.toString());
  });

  child.stderr.on('data', (data: Buffer) => {
    stderr += data.toString();
  });

  child.on('close', (code) => {
    clearTimeout(timeout);
    if (finished) return;
    if (code === 0) {
      onDone();
    } else {
      onError(stderr.trim() || `Process exited with code ${code}`);
    }
    finish();
  });

  child.on('error', (err) => {
    clearTimeout(timeout);
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
