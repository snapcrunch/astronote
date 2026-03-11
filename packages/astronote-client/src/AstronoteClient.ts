import type { Note, Collection, Settings } from "@repo/types";

export interface Tag {
  tag: string;
  count: number;
}

export interface FetchNotesParams {
  q?: string;
  tags?: string[];
  collectionId?: number;
}

export interface CreateNoteParams {
  title: string;
  content?: string;
  collectionId?: number | null;
}

export interface AstronoteClient {
  // Settings
  fetchSettings(): Promise<Settings>;
  updateSettings(updates: Partial<Settings>): Promise<Settings>;
  resetAll(): Promise<Collection>;

  // Tags
  fetchTags(): Promise<Tag[]>;

  // Collections
  fetchCollections(): Promise<Collection[]>;
  createCollection(name: string): Promise<void>;
  deleteCollection(id: number): Promise<void>;
  setDefaultCollection(id: number): Promise<Collection[]>;

  // Notes
  fetchNotes(params?: FetchNotesParams): Promise<Note[]>;
  createNote(params: CreateNoteParams): Promise<Note>;
  updateNote(id: string, updates: Partial<Pick<Note, "title" | "content" | "pinned">>): Promise<Note>;
  deleteNote(id: string): Promise<void>;
  addTag(noteId: string, tag: string): Promise<Note>;
  removeTag(noteId: string, tag: string): Promise<Note>;
}
