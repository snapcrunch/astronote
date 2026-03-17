import { getDb } from '../../db';
import { get } from './get';

export async function patch(patch: Record<string, unknown>): Promise<void> {
  const db = getDb();
  const current = await get();
  const merged = { ...current, ...patch };
  const value = JSON.stringify(merged);

  await db('keyval').where('key', 'settings').update({ value });
}
