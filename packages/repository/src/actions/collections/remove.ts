import { getDb } from '../../db';

export async function remove(params: {
  userId: number;
  id: number;
}): Promise<boolean> {
  const { userId, id } = params;
  const db = getDb();
  const owns = await db('users_collections')
    .where({ user_id: userId, collection_id: id })
    .first();
  if (!owns) {
    return false;
  }
  await db('notes').where('collectionId', id).update({ collectionId: null });
  await db('users_collections').where('collection_id', id).delete();
  const deleted = await db('collections').where('id', id).delete();
  return deleted > 0;
}
