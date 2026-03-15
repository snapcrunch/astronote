import { getDb } from '../db';

export async function deleteRefreshTokensByUserId(
  userId: number
): Promise<void> {
  const db = getDb();
  await db('refresh_tokens').where('user_id', userId).delete();
}
