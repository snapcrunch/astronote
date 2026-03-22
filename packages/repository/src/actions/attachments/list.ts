import type { Attachment } from '@repo/types';
import { getDb } from '../../db';

export async function listByNoteId(params: {
  userId: number;
  noteId: number;
}): Promise<Attachment[]> {
  const db = getDb();
  return db('attachments')
    .select('id', 'noteId', 'filename', 'mimeType', 'size', 'createdAt')
    .where({ noteId: params.noteId, userId: params.userId });
}
