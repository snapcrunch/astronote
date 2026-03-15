import { getDb } from '../db';

export async function createApiKey(
  userId: number,
  id: string,
  name: string,
  token: string
): Promise<void> {
  const db = getDb();
  await db('api_keys').insert({ id, name, token, user_id: userId });
}
