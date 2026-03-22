import { getDb } from '../../db';

export async function remove(params: {
  userId: number;
  id: string;
}): Promise<{ storagePath: string } | null> {
  const db = getDb();
  const row = await db('attachments')
    .select('storagePath')
    .where({ id: params.id, userId: params.userId })
    .first();
  if (!row) return null;
  await db('attachments').where({ id: params.id, userId: params.userId }).delete();
  return { storagePath: row.storagePath };
}

export async function removeAllByNoteId(params: {
  userId: number;
  noteId: number;
}): Promise<{ storagePath: string }[]> {
  const db = getDb();
  const rows = await db('attachments')
    .select('storagePath')
    .where({ noteId: params.noteId, userId: params.userId });
  if (rows.length > 0) {
    await db('attachments')
      .where({ noteId: params.noteId, userId: params.userId })
      .delete();
  }
  return rows;
}
