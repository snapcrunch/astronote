import { getDb } from '../db';

export async function deleteApiKey(
  userId: number,
  id: string
): Promise<boolean> {
  const db = getDb();
  const count = await db('api_keys')
    .where({ id, user_id: userId })
    .delete();
  return count > 0;
}
