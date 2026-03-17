import { getDb } from '../../db';

export async function setDefault(params: {
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

  // Only reset isDefault for collections owned by this user
  const userCollectionIds = db('users_collections')
    .where('user_id', userId)
    .select('collection_id');
  await db('collections')
    .whereIn('id', userCollectionIds)
    .update({ isDefault: 0 });
  await db('collections').where('id', id).update({ isDefault: 1 });
  return true;
}
