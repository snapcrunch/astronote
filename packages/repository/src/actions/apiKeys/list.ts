import { getDb } from '../../db';

export async function list(
  userId: number
): Promise<Array<{ id: string; name: string }>> {
  const db = getDb();
  return db('api_keys')
    .where('user_id', userId)
    .select('id', 'name')
    .orderBy('name', 'asc');
}
