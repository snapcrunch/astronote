import { v4 as uuidv4 } from "uuid";
import type { Note, Collection, CreateNoteInput, UpdateNoteInput, Settings } from "@repo/types";
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

export async function listTags(collectionId?: number): Promise<{ tag: string; count: number }[]> {
  return repository.getTags(collectionId);
}

export async function listNotes(query?: string, tags?: string[], collectionId?: number): Promise<Note[]> {
  return repository.getNotes(query, tags, collectionId);
}

export async function getNote(id: string): Promise<Note | null> {
  return repository.getNoteById(id);
}

export async function createNote(input: CreateNoteInput & { tags?: string[]; collectionId?: number }): Promise<Note> {
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

export async function updateNote(id: string, input: UpdateNoteInput): Promise<Note | null> {
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

export async function addTag(noteId: string, tag: string): Promise<Note | null> {
  const normalizedTag = tag.toLowerCase();
  await repository.addNoteTag(noteId, normalizedTag);
  return repository.getNoteById(noteId);
}

export async function removeTag(noteId: string, tag: string): Promise<Note | null> {
  const normalizedTag = tag.toLowerCase();
  await repository.removeNoteTag(noteId, normalizedTag);
  return repository.getNoteById(noteId);
}

export async function deleteNote(id: string): Promise<boolean> {
  return repository.deleteNote(id);
}

export async function archiveNote(id: string): Promise<boolean> {
  return repository.archiveNote(id);
}

export async function exportNotes() {
  return repository.getNotesForExport();
}

// Collections

export async function listCollections(): Promise<Collection[]> {
  return repository.getCollections();
}

export async function createCollection(name: string): Promise<Collection> {
  return repository.createCollection(name);
}

export async function deleteCollection(id: number): Promise<boolean> {
  return repository.deleteCollection(id);
}

export async function setDefaultCollection(id: number): Promise<boolean> {
  return repository.setDefaultCollection(id);
}

// Settings

export async function getSettings(): Promise<Settings> {
  return repository.getSettings();
}

export async function updateSettings(updates: Partial<Settings>): Promise<Settings> {
  return repository.updateSettings(updates);
}

export async function resetAll(): Promise<Collection> {
  return repository.resetAll();
}
