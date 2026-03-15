import type { Note } from '@repo/types';
import { getDb } from '../db';

export async function getNoteTagsAsync(noteId: string): Promise<string[]> {
  const db = getDb();
  const rows = await db('note_tags')
    .where('noteId', noteId)
    .orderBy('tag', 'asc')
    .select('tag');
  return rows.map((r) => r.tag);
}

export async function rowToNote(row: Record<string, unknown>): Promise<Note> {
  const id = row.id as string;
  return {
    id,
    title: row.title as string,
    content: row.content as string,
    tags: await getNoteTagsAsync(id), // @TODO Performance issues here.
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
    pinned: Boolean(row.pinned),
  };
}
