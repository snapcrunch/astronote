import { getDb } from '../db';

export async function resetAll(userId: number): Promise<void> {
  const db = getDb();
  await db('note_tags').delete();
  await db('tags').delete();
  await db('notes').delete();
  await db('collections').delete();
  await db('settings').where('user_id', userId).delete();
}
