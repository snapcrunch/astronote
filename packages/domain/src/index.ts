import { v4 as uuidv4 } from "uuid";
import type { Note, CreateNoteInput, UpdateNoteInput } from "@repo/types";
import * as repository from "@repo/repository";

export function listNotes(query?: string): Note[] {
  return repository.getNotes(query);
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
  return repository.createNote(note);
}

export function updateNote(id: string, input: UpdateNoteInput): Note | null {
  return repository.updateNote(id, {
    ...input,
    updatedAt: new Date().toISOString(),
  });
}

export function deleteNote(id: string): boolean {
  return repository.deleteNote(id);
}

export function archiveNote(id: string): boolean {
  return repository.archiveNote(id);
}
