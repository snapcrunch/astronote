import { getDb } from '../db';

interface UserRow {
  id: number;
  email: string;
  password: string;
  salt: string;
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const db = getDb();
  const row = await db('users').where('email', email).first();
  if (!row) {
    return null;
  }
  return row as UserRow;
}
