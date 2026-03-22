import path from 'node:path';
import fs from 'node:fs/promises';
import type { AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function remove(
  user: AuthUser,
  id: string,
  dataDir: string
): Promise<boolean> {
  const result = await repository.attachments.remove({ userId: user.id, id });
  if (!result) return false;
  const absolutePath = path.join(dataDir, result.storagePath);
  await fs.unlink(absolutePath).catch(() => {});
  return true;
}

export async function removeAllByNoteId(
  user: AuthUser,
  noteId: number,
  dataDir: string
): Promise<void> {
  const rows = await repository.attachments.removeAllByNoteId({
    userId: user.id,
    noteId,
  });
  for (const row of rows) {
    const absolutePath = path.join(dataDir, row.storagePath);
    await fs.unlink(absolutePath).catch(() => {});
  }
}
