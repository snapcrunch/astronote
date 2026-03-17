import type { Note, UpdateNoteInput, AuthUser } from '@repo/types';
import repository from '@repo/repository';
import { trimNoteContent } from '../../util/notes';

export async function update(
  user: AuthUser,
  id: string,
  input: UpdateNoteInput
): Promise<Note | null> {
  const existing = await repository.notes.getById({ userId: user.id, id });
  if (!existing) {
    return null;
  }

  const updated = await repository.notes.update({
    userId: user.id,
    id,
    updates: {
      title: input.title,
      content: input.content?.trim(),
      pinned: input.pinned,
      collectionId: input.collectionId,
      updatedAt: new Date().toISOString(),
    },
  });
  return updated ? trimNoteContent(updated) : null;
}
