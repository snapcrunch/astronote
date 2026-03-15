import { getDb } from '../db';
import { getSettings } from './get';

export async function patchSettings(
  patch: Record<string, unknown>
): Promise<void> {
  const db = getDb();
  const current = await getSettings();
  const merged = { ...current, ...patch };
  const value = JSON.stringify(merged);

  await db('keyval').where('key', 'settings').update({ value });
}
