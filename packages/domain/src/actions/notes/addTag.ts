import type { Note } from "@repo/types";
import * as repository from "@repo/repository";

export async function addTag(noteId: string, tag: string): Promise<Note | null> {
  const normalizedTag = tag.toLowerCase();
  await repository.addNoteTag(noteId, normalizedTag);
  return repository.getNoteById(noteId);
}
