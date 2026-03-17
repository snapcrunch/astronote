import { getDb } from '../../db';

export async function create(
  userId: number,
  token: string,
  expiresAt: string
): Promise<void> {
  const db = getDb();
  await db('refresh_tokens').insert({
    user_id: userId,
    token,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  });
}
