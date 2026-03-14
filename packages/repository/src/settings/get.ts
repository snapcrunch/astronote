import type { Settings } from '@repo/types';
import { DEFAULT_SETTINGS } from '@repo/types';
import { getDb } from '../db';

export async function getSettings(userId: number): Promise<Settings> {
  const db = getDb();
  const row = await db('settings').where('key', 'settings').andWhere('user_id', userId).first();
  if (!row) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...JSON.parse(row.value as string) };
}
