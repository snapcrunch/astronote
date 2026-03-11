import type { Note, Collection, Settings } from "@repo/types";
import type { AstronoteClient, Tag, FetchNotesParams, CreateNoteParams } from "./AstronoteClient.js";

declare global {
  interface Window {
    electronAPI: AstronoteClient;
  }
}

export class DesktopClient implements AstronoteClient {
  private api = window.electronAPI;

  // Settings

  async fetchSettings(): Promise<Settings> {
    return this.api.fetchSettings();
  }

  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    return this.api.updateSettings(updates);
  }

  async resetAll(): Promise<Collection> {
    return this.api.resetAll();
  }

  // Tags

  async fetchTags(): Promise<Tag[]> {
    return this.api.fetchTags();
  }

  // Collections

  async fetchCollections(): Promise<Collection[]> {
    return this.api.fetchCollections();
  }

  async createCollection(name: string): Promise<void> {
    return this.api.createCollection(name);
  }

  async deleteCollection(id: number): Promise<void> {
    return this.api.deleteCollection(id);
  }

  async setDefaultCollection(id: number): Promise<Collection[]> {
    return this.api.setDefaultCollection(id);
  }

  // Notes

  async fetchNotes(params?: FetchNotesParams): Promise<Note[]> {
    return this.api.fetchNotes(params);
  }

  async createNote(params: CreateNoteParams): Promise<Note> {
    return this.api.createNote(params);
  }

  async updateNote(id: string, updates: Partial<Pick<Note, "title" | "content" | "pinned">>): Promise<Note> {
    return this.api.updateNote(id, updates);
  }

  async deleteNote(id: string): Promise<void> {
    return this.api.deleteNote(id);
  }

  async addTag(noteId: string, tag: string): Promise<Note> {
    return this.api.addTag(noteId, tag);
  }

  async removeTag(noteId: string, tag: string): Promise<Note> {
    return this.api.removeTag(noteId, tag);
  }
}
