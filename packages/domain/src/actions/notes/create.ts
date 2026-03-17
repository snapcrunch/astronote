import type { Note, CreateNoteInput, AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function create(
  user: AuthUser,
  input: CreateNoteInput & { tags?: string[]; collectionId?: number }
): Promise<Note> {
  const now = new Date().toISOString();
  const tags = (input.tags ?? []).map((t) => t.toLowerCase());
  let id: number;
  if (input.id) {
    const existing = await repository.notes.getById({
      userId: user.id,
      id: input.id,
    });
    id = existing
      ? Math.floor((performance.timeOrigin + performance.now()) * 1000)
      : input.id;
  } else {
    id = Math.floor((performance.timeOrigin + performance.now()) * 1000);
  }
  const note: Note = {
    id,
    title: input.title,
    content: (input.content ?? '').trim(),
    tags,
    pinned: input.pinned ?? false,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
  let collectionId = input.collectionId;
  if (collectionId == null) {
    const defaultCollection = await repository.collections.getDefault(user.id);
    if (!defaultCollection) {
      throw new Error('No default collection exists');
    }
    collectionId = defaultCollection.id;
  }

  const created = await repository.notes.create({
    userId: user.id,
    note,
    collectionId,
  });
  await repository.notes.incrementTags(tags);
  return created;
}
