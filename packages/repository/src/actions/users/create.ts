import { getDb } from '../../db';

export async function create(params: {
  email: string;
  password: string;
  salt: string;
}): Promise<{ id: number }> {
  const { email, password, salt } = params;
  const db = getDb();
  const [row] = await db('users')
    .insert({ email, password, salt })
    .returning('id');
  return { id: row.id };
}
