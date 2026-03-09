import { v4 as uuidv4 } from "uuid";
import type { Note, CreateNoteInput, UpdateNoteInput } from "@repo/types";
import * as repository from "@repo/repository";

export function parseTags(text: string): string[] {
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

export function createNote(input: CreateNoteInput & { tags?: string[] }): Note {
  const now = new Date().toISOString();
  const tags = (input.tags ?? []).map((t) => t.toLowerCase());
  const note: Note = {
    id: uuidv4(),
    title: input.title,
    content: input.content ?? "",
    tags,
    createdAt: now,
    updatedAt: now,
  };
  const created = repository.createNote(note);
  repository.incrementTags(tags);
  return created;
}

export function updateNote(id: string, input: UpdateNoteInput): Note | null {
  const existing = repository.getNoteById(id);
  if (!existing) return null;

  const updated = repository.updateNote(id, {
    ...input,
    updatedAt: new Date().toISOString(),
  });
  return updated;
}

export function addTag(noteId: string, tag: string): Note | null {
  const normalizedTag = tag.toLowerCase();
  repository.addNoteTag(noteId, normalizedTag);
  return repository.getNoteById(noteId);
}

export function removeTag(noteId: string, tag: string): Note | null {
  const normalizedTag = tag.toLowerCase();
  repository.removeNoteTag(noteId, normalizedTag);
  return repository.getNoteById(noteId);
}

export function deleteNote(id: string): boolean {
  return repository.deleteNote(id);
}

export function archiveNote(id: string): boolean {
  return repository.archiveNote(id);
}
