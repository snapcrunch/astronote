import { getDb } from '../../db';

export async function record(userId: number): Promise<void> {
  const db = getDb();
  await db('backup_history').insert({
    user_id: userId,
    timestamp: new Date().toISOString(),
  });
}
