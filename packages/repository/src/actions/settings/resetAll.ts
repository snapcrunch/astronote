import { getDb } from '../../db';

export async function resetAll(userId: number): Promise<void> {
  const db = getDb();

  const noteIds = await db('users_notes')
    .where('user_id', userId)
    .pluck('note_id');

  if (noteIds.length > 0) {
    await db('note_tags').whereIn('noteId', noteIds).delete();
    await db('users_notes').where('user_id', userId).delete();
    await db('notes').whereIn('id', noteIds).delete();
  }

  const collectionIds = await db('users_collections')
    .where('user_id', userId)
    .pluck('collection_id');

  if (collectionIds.length > 0) {
    await db('users_collections').where('user_id', userId).delete();
    await db('collections').whereIn('id', collectionIds).delete();
  }

  await db('settings').where('user_id', userId).delete();
}
