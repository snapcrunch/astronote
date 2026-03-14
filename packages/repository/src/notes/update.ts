import type { Note } from '@repo/types';
import { getDb } from '../db';
import { getNoteById } from './get';

export async function updateNote(
  userId: number,
  id: string,
  updates: {
    title?: string;
    content?: string;
    pinned?: boolean;
    collectionId?: number;
    updatedAt: string;
  }
): Promise<Note | null> {
  const db = getDb();
  const existing = await getNoteById(userId, id);
  if (!existing) {
    return null;
  }

  const title = updates.title ?? existing.title;
  const content = updates.content ?? existing.content;
  const pinned =
    updates.pinned !== undefined ? updates.pinned : existing.pinned;

  const dbUpdate: Record<string, unknown> = {
    title,
    content,
    pinned,
    updatedAt: updates.updatedAt,
  };
  if (updates.collectionId !== undefined) {
    dbUpdate.collectionId = updates.collectionId;
  }

  await db('notes').where('id', id).update(dbUpdate);

  return { ...existing, title, content, pinned, updatedAt: updates.updatedAt };
}
