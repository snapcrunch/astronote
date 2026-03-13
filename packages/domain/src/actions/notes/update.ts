import type { Note, UpdateNoteInput } from "@repo/types";
import * as repository from "@repo/repository";

export async function update(id: string, input: UpdateNoteInput): Promise<Note | null> {
  const existing = await repository.getNoteById(id);
  if (!existing) return null;

  const updated = await repository.updateNote(id, {
    title: input.title,
    content: input.content,
    pinned: input.pinned,
    collectionId: input.collectionId,
    updatedAt: new Date().toISOString(),
  });
  return updated;
}
