import path from 'node:path';
import fs from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import type { Attachment, AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function upload(
  user: AuthUser,
  noteId: number,
  file: { originalname: string; mimetype: string; size: number; path: string },
  dataDir: string
): Promise<Attachment> {
  const note = await repository.notes.getById({ userId: user.id, id: noteId });
  if (!note) {
    throw new Error('Note not found');
  }

  const id = uuidv4();
  const ext = path.extname(file.originalname) || '';
  const storagePath = path.join('attachments', String(user.id), `${id}${ext}`);
  const absolutePath = path.join(dataDir, storagePath);

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.rename(file.path, absolutePath);

  const now = new Date().toISOString();
  await repository.attachments.create({
    id,
    noteId,
    userId: user.id,
    filename: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    storagePath,
    createdAt: now,
  });

  return { id, noteId, filename: file.originalname, mimeType: file.mimetype, size: file.size, createdAt: now };
}
