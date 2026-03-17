import { getDb } from '../../db';

export async function deleteByToken(token: string): Promise<void> {
  const db = getDb();
  await db('refresh_tokens').where('token', token).delete();
}
