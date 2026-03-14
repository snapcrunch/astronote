import type { Note } from '@repo/types';
import { getDb } from '../db';
import { rowToNote } from './helpers';

export async function getNoteById(id: string): Promise<Note | null> {
  const db = getDb();
  const row = await db('notes').where('id', id).first();
  if (!row) return null;
  return rowToNote(row);
}
