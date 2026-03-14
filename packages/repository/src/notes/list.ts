import type { Note } from '@repo/types';
import { getDb } from '../db';
import { rowToNote } from './helpers';

export async function getNotes(
  query?: string,
  tags?: string[],
  collectionId?: number
): Promise<Note[]> {
  const db = getDb();
  let q = db('notes').where('archived', 0);

  if (collectionId != null) {
    q = q.andWhere('collectionId', collectionId);
  }

  if (query) {
    const pattern = `%${query}%`;
    q = q.andWhere(function () {
      this.where('title', 'like', pattern).orWhere('content', 'like', pattern);
    });
  }

  if (tags && tags.length > 0) {
    for (const tag of tags) {
      q = q.andWhere(
        'id',
        'in',
        db('note_tags').where('tag', tag).select('noteId')
      );
    }
  }

  const rows = await q.orderBy([
    { column: 'pinned', order: 'desc' },
    { column: 'updatedAt', order: 'desc' },
  ]);
  return Promise.all(rows.map(rowToNote));
}

export async function getNoteCount(): Promise<number> {
  const db = getDb();
  const result = await db('notes')
    .where('archived', 0)
    .count('* as count')
    .first();
  return Number(result?.count ?? 0);
}

export async function getNotesForExport(): Promise<
  { note: Note; collectionName: string | null }[]
> {
  const db = getDb();
  const rows = await db('notes')
    .leftJoin('collections', 'notes.collectionId', 'collections.id')
    .where('notes.archived', 0)
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
