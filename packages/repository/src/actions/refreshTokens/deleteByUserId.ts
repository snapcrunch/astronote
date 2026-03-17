import { getDb } from '../../db';

export async function deleteByUserId(userId: number): Promise<void> {
  const db = getDb();
  await db('refresh_tokens').where('user_id', userId).delete();
}
