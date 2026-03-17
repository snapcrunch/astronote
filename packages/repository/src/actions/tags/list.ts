import { getDb } from '../../db';

export async function list(
  userId: number,
  collectionId?: number
): Promise<{ tag: string; count: number }[]> {
  const db = getDb();

  let q = db('note_tags')
    .join('notes', 'note_tags.noteId', 'notes.id')
    .join('users_notes', 'notes.id', 'users_notes.note_id')
    .where('users_notes.user_id', userId)
    .andWhere('notes.archived', 0);

  if (collectionId != null) {
    q = q.andWhere('notes.collectionId', collectionId);
  }

  const rows = await q
    .select('note_tags.tag as tag')
    .count('* as count')
    .groupBy('note_tags.tag')
    .orderBy('count', 'desc')
    .orderBy('tag', 'asc');

  return rows.map((r) => ({ tag: String(r.tag), count: Number(r.count) }));
}
