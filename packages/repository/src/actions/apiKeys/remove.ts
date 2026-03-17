import { getDb } from '../../db';

export async function remove(params: {
  userId: number;
  id: string;
}): Promise<boolean> {
  const { userId, id } = params;
  const db = getDb();
  const count = await db('api_keys').where({ id, user_id: userId }).delete();
  return count > 0;
}
