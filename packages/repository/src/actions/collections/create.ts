import type { Collection } from '@repo/types';
import { getDb } from '../../db';

export async function create(
  userId: number,
  name: string
): Promise<Collection> {
  const db = getDb();
  const [id] = await db('collections').insert({ name });
  await db('users_collections').insert({
    user_id: userId,
    collection_id: id,
  });
  return { id: id!, name, isDefault: false, noteCount: 0 };
}
