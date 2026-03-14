import type { Note, UpdateNoteInput, AuthUser } from '@repo/types';
import * as repository from '@repo/repository';

export async function update(
  user: AuthUser,
  id: string,
  input: UpdateNoteInput
): Promise<Note | null> {
  const existing = await repository.getNoteById(user.id, id);
  if (!existing) {
    return null;
  }

  const updated = await repository.updateNote(user.id, id, {
    title: input.title,
    content: input.content,
    pinned: input.pinned,
    collectionId: input.collectionId,
    updatedAt: new Date().toISOString(),
  });
  return updated;
}
