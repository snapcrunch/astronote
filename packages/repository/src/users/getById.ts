import { getDb } from '../db';

interface UserRow {
  id: number;
  email: string;
  password: string;
  salt: string;
}

export async function getUserById(id: number): Promise<UserRow | null> {
  const db = getDb();
  const row = await db('users').where('id', id).first();
  if (!row) {
    return null;
  }
  return row as UserRow;
}
