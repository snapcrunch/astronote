import type { Settings } from '@repo/types';
import { getDb } from '../../db';
import { get } from './get';

export async function update(
  userId: number,
  updates: Partial<Settings>
): Promise<Settings> {
  const db = getDb();
  const current = await get(userId);
  const merged = { ...current, ...updates };
  const value = JSON.stringify(merged);

  const existing = await db('settings')
    .where('key', 'settings')
    .andWhere('user_id', userId)
    .first();

  if (existing) {
    await db('settings')
      .where('key', 'settings')
      .andWhere('user_id', userId)
      .update({ value });
  } else {
    await db('settings').insert({ user_id: userId, key: 'settings', value });
  }

  return merged;
}
