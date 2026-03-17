import type { Note, AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function removeTag(
  user: AuthUser,
  noteId: string,
  tag: string
): Promise<Note | null> {
  const normalizedTag = tag.toLowerCase();
  await repository.notes.removeTag(noteId, normalizedTag);
  return repository.notes.getById(user.id, noteId);
}
