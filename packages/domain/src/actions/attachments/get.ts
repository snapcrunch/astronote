import path from 'node:path';
import type { Attachment, AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function get(
  user: AuthUser,
  id: string,
  dataDir: string
): Promise<{ attachment: Attachment; absolutePath: string } | null> {
  const row = await repository.attachments.getById({ userId: user.id, id });
  if (!row) return null;
  const absolutePath = path.join(dataDir, row.storagePath);
  const { storagePath: _, ...attachment } = row;
  return { attachment, absolutePath };
}
