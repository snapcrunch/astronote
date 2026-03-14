import { getDb } from '../db';
import { getNoteById } from './get';

export async function deleteNote(id: string): Promise<boolean> {
  const db = getDb();
  const existing = await getNoteById(id);
  if (!existing) return false;
  await db('note_tags').where('noteId', id).delete();
  await db('notes').where('id', id).delete();
  return true;
}

export async function archiveNote(id: string): Promise<boolean> {
  const db = getDb();
  const existing = await getNoteById(id);
  if (!existing) return false;

  for (const tag of existing.tags) {
    await db('tags').where('tag', tag).decrement('count', 1);
  }
  await db('tags').where('count', '<=', 0).delete();

  await db('note_tags').where('noteId', id).delete();
  await db('notes').where('id', id).update({
    archived: 1,
    updatedAt: new Date().toISOString(),
  });
  return true;
}
