import type { Note } from '@repo/types';
import { getDb } from '../db';
import { getNoteTagsAsync } from './helpers';

export async function createNote(
  note: Note,
  collectionId?: number
): Promise<Note> {
  const db = getDb();
  await db('notes').insert({
    id: note.id,
    title: note.title,
    content: note.content,
    pinned: note.pinned ? 1 : 0,
    collectionId: collectionId ?? null,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  });
  for (const tag of note.tags) {
    await db('note_tags')
      .insert({ noteId: note.id, tag })
      .onConflict(['noteId', 'tag'])
      .ignore();
  }
  return { ...note, tags: await getNoteTagsAsync(note.id) };
}
