import type { Note, AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function removeTag(
  user: AuthUser,
  noteId: number,
  tag: string
): Promise<Note | null> {
  const normalizedTag = tag.toLowerCase();
  await repository.notes.removeTag({ noteId, tag: normalizedTag });
  return repository.notes.getById({ userId: user.id, id: noteId });
}
