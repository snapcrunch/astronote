import { getDb } from '../../db';

export async function get(): Promise<Record<string, unknown>> {
  const db = getDb();
  const row = await db('keyval').where('key', 'settings').first();
  if (!row) {
    throw new Error('System settings could not be found.');
  }
  return JSON.parse(row.value as string);
}
