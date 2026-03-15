import type { Note, AuthUser } from '@repo/types';
import * as repository from '@repo/repository';

export async function removeTag(
  user: AuthUser,
  noteId: string,
  tag: string
): Promise<Note | null> {
  const normalizedTag = tag.toLowerCase();
  await repository.removeNoteTag(noteId, normalizedTag);
  return repository.getNoteById(user.id, noteId);
}
