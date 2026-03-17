import type { Note } from '@repo/types';
import { getDb } from '../../db';
import { rowToNote } from './helpers';

export async function getById(
  userId: number,
  id: string
): Promise<Note | null> {
  const db = getDb();
  const row = await db('notes')
    .join('users_notes', 'notes.id', 'users_notes.note_id')
    .where('users_notes.user_id', userId)
    .andWhere('notes.id', id)
    .select('notes.*')
    .first();
  if (!row) {
    return null;
  }
  return rowToNote(row);
}
