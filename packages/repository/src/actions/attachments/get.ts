import { getDb } from '../../db';

interface AttachmentRow {
  id: string;
  noteId: number;
  filename: string;
  mimeType: string;
  size: number;
  storagePath: string;
  createdAt: string;
}

export async function getById(params: {
  userId: number;
  id: string;
}): Promise<AttachmentRow | null> {
  const db = getDb();
  const row = await db('attachments')
    .select('id', 'noteId', 'filename', 'mimeType', 'size', 'storagePath', 'createdAt')
    .where({ id: params.id, userId: params.userId })
    .first();
  return row ?? null;
}
