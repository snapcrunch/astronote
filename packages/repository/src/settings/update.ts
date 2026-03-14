import type { Settings } from '@repo/types';
import { getDb } from '../db';
import { getSettings } from './get';

export async function updateSettings(
  updates: Partial<Settings>
): Promise<Settings> {
  const db = getDb();
  const current = await getSettings();
  const merged = { ...current, ...updates };
  const value = JSON.stringify(merged);
  await db('settings').where('key', 'settings').update({ value });
  return merged;
}
