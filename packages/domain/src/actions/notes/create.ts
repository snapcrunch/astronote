import { v4 as uuidv4 } from "uuid";
import type { Note, CreateNoteInput } from "@repo/types";
import * as repository from "@repo/repository";

export async function create(input: CreateNoteInput & { tags?: string[]; collectionId?: number }): Promise<Note> {
  const now = new Date().toISOString();
  const tags = (input.tags ?? []).map((t) => t.toLowerCase());
  const note: Note = {
    id: uuidv4(),
    title: input.title,
    content: input.content ?? "",
    tags,
    pinned: input.pinned ?? false,
    createdAt: now,
    updatedAt: now,
  };
  const created = await repository.createNote(note, input.collectionId);
  await repository.incrementTags(tags);
  return created;
}
