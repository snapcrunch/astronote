import { v4 as uuidv4 } from 'uuid';
import type { Note, CreateNoteInput, AuthUser } from '@repo/types';
import repository from '@repo/repository';

export async function create(
  user: AuthUser,
  input: CreateNoteInput & { tags?: string[]; collectionId?: number }
): Promise<Note> {
  const now = new Date().toISOString();
  const tags = (input.tags ?? []).map((t) => t.toLowerCase());
  const note: Note = {
    id: uuidv4(),
    title: input.title,
    content: input.content ?? '',
    tags,
    pinned: input.pinned ?? false,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
  const created = await repository.notes.create({
    userId: user.id,
    note,
    collectionId: input.collectionId,
  });
  await repository.notes.incrementTags(tags);
  return created;
}
