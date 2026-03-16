import { getDb } from '../db';

interface UserRow {
  id: number;
  email: string;
}

export async function listUsers(): Promise<UserRow[]> {
  const db = getDb();
  return db('users').select('id', 'email');
}
