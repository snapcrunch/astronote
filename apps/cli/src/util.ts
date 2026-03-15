import path from 'node:path';
import type { Command } from 'commander';
import { initDatabase, closeDatabase } from '@repo/repository';
import type { AuthUser } from '@repo/types';

export function getDbPath(program: Command): string {
  return (
    program.opts().db ??
    process.env.DB_PATH ??
    path.join(process.cwd(), 'astronote.db')
  );
}

export function getUser(program: Command): AuthUser {
  const id = Number(program.opts().userId);
  if (!id || isNaN(id)) {
    console.error('Error: --user-id is required');
    process.exit(1);
  }
  return { id, email: '' };
}

export async function run<T>(
  program: Command,
  fn: () => Promise<T>
): Promise<void> {
  await initDatabase(getDbPath(program));
  try {
    const result = await fn();
    if (result !== undefined) {
      console.log(JSON.stringify(result, null, 2));
    }
  } finally {
    await closeDatabase();
  }
}
