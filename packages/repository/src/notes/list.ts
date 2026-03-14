import type { Note } from '@repo/types';
import { getDb } from '../db';
import { rowToNote } from './helpers';

export async function getNotes(
  userId: number,
  query?: string,
  tags?: string[],
  collectionId?: number
): Promise<Note[]> {
  const db = getDb();
  let q = db('notes')
    .join('users_notes', 'notes.id', 'users_notes.note_id')
    .where('users_notes.user_id', userId)
    .andWhere('notes.archived', 0);

  if (collectionId != null) {
    q = q.andWhere('notes.collectionId', collectionId);
  }

  if (query) {
    const pattern = `%${query}%`;
    q = q.andWhere(function () {
      this.where('notes.title', 'like', pattern).orWhere(
        'notes.content',
        'like',
        pattern
      );
    });
  }

  if (tags && tags.length > 0) {
    for (const tag of tags) {
      q = q.andWhere(
        'notes.id',
        'in',
        db('note_tags').where('tag', tag).select('noteId')
      );
    }
  }

  const rows = await q.select('notes.*').orderBy([
    { column: 'notes.pinned', order: 'desc' },
    { column: 'notes.updatedAt', order: 'desc' },
  ]);
  return Promise.all(rows.map(rowToNote));
}

export async function getNoteCount(userId: number): Promise<number> {
  const db = getDb();
  const result = await db('notes')
    .join('users_notes', 'notes.id', 'users_notes.note_id')
    .where('users_notes.user_id', userId)
    .andWhere('notes.archived', 0)
    .count('* as count')
    .first();
  return Number(result?.count ?? 0);
}

export async function getNotesForExport(
  userId: number
): Promise<{ note: Note; collectionName: string | null }[]> {
  const db = getDb();
  const rows = await db('notes')
    .join('users_notes', 'notes.id', 'users_notes.note_id')
    .leftJoin('collections', 'notes.collectionId', 'collections.id')
    .where('users_notes.user_id', userId)
    .andWhere('notes.archived', 0)
    .select('notes.*', 'collections.name as collectionName')
    .orderBy('notes.updatedAt', 'desc');

  const results: { note: Note; collectionName: string | null }[] = [];
  for (const row of rows) {
    const note = await rowToNote(row);
    results.push({
      note,
      collectionName: (row.collectionName as string) ?? null,
    });
  }
  return results;
}
