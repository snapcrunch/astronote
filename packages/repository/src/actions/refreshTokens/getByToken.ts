import { getDb } from '../../db';

export interface RefreshTokenRow {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
}

export async function getByToken(
  token: string
): Promise<RefreshTokenRow | null> {
  const db = getDb();
  const row = await db('refresh_tokens').where('token', token).first();
  if (!row) {
    return null;
  }
  return row as RefreshTokenRow;
}
