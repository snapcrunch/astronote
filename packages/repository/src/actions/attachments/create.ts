import { getDb } from '../../db';

export async function create(params: {
  id: string;
  noteId: number;
  userId: number;
  filename: string;
  mimeType: string;
  size: number;
  storagePath: string;
  createdAt: string;
}): Promise<void> {
  const db = getDb();
  await db('attachments').insert({
    id: params.id,
    noteId: params.noteId,
    userId: params.userId,
    filename: params.filename,
    mimeType: params.mimeType,
    size: params.size,
    storagePath: params.storagePath,
    createdAt: params.createdAt,
  });
}
