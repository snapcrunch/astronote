import { v4 as uuidv4 } from "uuid";
import type { Note, CreateNoteInput, UpdateNoteInput } from "@repo/types";
import * as repository from "@repo/repository";

export function parseTags(text: string): string[] {
  // Strip code blocks and inline code before parsing tags
  const stripped = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "");
  const matches = stripped.match(/#[a-zA-Z][a-zA-Z0-9]*/g);
  if (!matches) return [];
  const unique = new Set(matches.map((t) => t.toLowerCase()));
  return [...unique];
}

export function listTags(): { tag: string; count: number }[] {
  return repository.getTags();
}

export function listNotes(query?: string, tags?: string[]): Note[] {
  return repository.getNotes(query, tags);
}

export function getNote(id: string): Note | null {
  return repository.getNoteById(id);
}

export function createNote(input: CreateNoteInput): Note {
  const now = new Date().toISOString();
  const note: Note = {
    id: uuidv4(),
    title: input.title,
    content: input.content ?? "",
    createdAt: now,
    updatedAt: now,
  };
  const created = repository.createNote(note);
  const tags = parseTags(`${created.title} ${created.content}`);
  repository.incrementTags(tags);
  return created;
}

export function updateNote(id: string, input: UpdateNoteInput): Note | null {
  const existing = repository.getNoteById(id);
  if (!existing) return null;

  const oldTags = parseTags(`${existing.title} ${existing.content}`);

  const updated = repository.updateNote(id, {
    ...input,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return null;

  const newTags = parseTags(`${updated.title} ${updated.content}`);

  const added = newTags.filter((t) => !oldTags.includes(t));
  const removed = oldTags.filter((t) => !newTags.includes(t));

  repository.incrementTags(added);
  repository.decrementTags(removed);

  return updated;
}

export function deleteNote(id: string): boolean {
  return repository.deleteNote(id);
}

export function archiveNote(id: string): boolean {
  const existing = repository.getNoteById(id);
  if (!existing) return false;

  const tags = parseTags(`${existing.title} ${existing.content}`);
  const archived = repository.archiveNote(id);
  if (archived) {
    repository.decrementTags(tags);
  }
  return archived;
}
