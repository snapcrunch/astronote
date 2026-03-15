import { getDb } from '../db';

export async function getApiKeyById(
  id: string,
  userId: number
): Promise<boolean> {
  const db = getDb();
  const row = await db('api_keys')
    .where({ id, user_id: userId })
    .select('id')
    .first();
  return row != null;
}
