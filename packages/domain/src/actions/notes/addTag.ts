import type { Note, AuthUser } from '@repo/types';
import * as repository from '@repo/repository';

export async function addTag(
  user: AuthUser,
  noteId: string,
  tag: string
): Promise<Note | null> {
  const normalizedTag = tag.toLowerCase();
  await repository.addNoteTag(noteId, normalizedTag);
  return repository.getNoteById(user.id, noteId);
}
