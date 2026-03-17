import { getDb } from '../../db';

export async function update(
  settings: Record<string, unknown>
): Promise<void> {
  const db = getDb();
  const value = JSON.stringify(settings);

  const existing = await db('keyval').where('key', 'settings').first();

  if (existing) {
    await db('keyval').where('key', 'settings').update({ value });
  } else {
    await db('keyval').insert({ key: 'settings', value });
  }
}
