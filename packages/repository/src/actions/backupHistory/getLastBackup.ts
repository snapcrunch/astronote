import { getDb } from '../../db';

export async function getLast(userId: number): Promise<string | null> {
  const db = getDb();
  const row = await db('backup_history')
    .where('user_id', userId)
    .orderBy('timestamp', 'desc')
    .first();
  return row ? (row.timestamp as string) : null;
}
