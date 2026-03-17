import { getDb } from '../../db';

export async function create(params: {
  userId: number;
  id: string;
  name: string;
  token: string;
}): Promise<void> {
  const { userId, id, name, token } = params;
  const db = getDb();
  await db('api_keys').insert({ id, name, token, user_id: userId });
}
