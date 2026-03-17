import { getDb } from '../../db';
import { getById } from './get';

export async function remove(params: {
  userId: number;
  id: number;
}): Promise<boolean> {
  const { userId, id } = params;
  const db = getDb();
  const existing = await getById({ userId, id });
  if (!existing) {
    return false;
  }
  await db('note_tags').where('noteId', id).delete();
  await db('users_notes').where('note_id', id).delete();
  await db('notes').where('id', id).delete();
  return true;
}

export async function archive(params: {
  userId: number;
  id: number;
}): Promise<boolean> {
  const { userId, id } = params;
  const db = getDb();
  const existing = await getById({ userId, id });
  if (!existing) {
    return false;
  }

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
