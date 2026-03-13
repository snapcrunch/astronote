import axios, { type AxiosInstance } from "axios";
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
  tags?: string[];
  collectionId?: number | null;
  pinned?: boolean;
}

export class WebClient {
  private http: AxiosInstance;

  constructor(baseURL = "") {
    this.http = axios.create({ baseURL });
  }

  // Settings

  async fetchSettings(): Promise<Settings> {
    const { data } = await this.http.get<Settings>("/api/settings");
    return data;
  }

  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    const { data } = await this.http.patch<Settings>("/api/settings", updates);
    return data;
  }

  async resetAll(): Promise<Collection> {
    const { data } = await this.http.post<Collection>("/api/settings/reset");
    return data;
  }

  // Tags

  async fetchTags(collectionId?: number): Promise<Tag[]> {
    const { data } = await this.http.get<Tag[]>("/api/tags", {
      params: collectionId != null ? { collectionId } : {},
    });
    return data;
  }

  // Collections

  async fetchCollections(): Promise<Collection[]> {
    const { data } = await this.http.get<Collection[]>("/api/collections");
    return data;
  }

  async createCollection(name: string): Promise<void> {
    await this.http.post("/api/collections", { name });
  }

  async deleteCollection(id: number): Promise<void> {
    await this.http.delete(`/api/collections/${id}`);
  }

  async setDefaultCollection(id: number): Promise<Collection[]> {
    const { data } = await this.http.post<Collection[]>(`/api/collections/${id}/default`);
    return data;
  }

  // Notes

  async fetchNotes(params?: FetchNotesParams): Promise<Note[]> {
    const { data } = await this.http.get<Note[]>("/api/notes", {
      params: {
        ...(params?.q ? { q: params.q } : {}),
        ...(params?.tags?.length ? { tags: params.tags.join(",") } : {}),
        ...(params?.collectionId != null ? { collectionId: params.collectionId } : {}),
      },
    });
    return data;
  }

  async createNote(params: CreateNoteParams): Promise<Note> {
    const { data } = await this.http.post<Note>("/api/notes", params);
    return data;
  }

  async updateNote(id: string, updates: Partial<Pick<Note, "title" | "content" | "pinned">> & { collectionId?: number }): Promise<Note> {
    const { data } = await this.http.patch<Note>(`/api/notes/${id}`, updates);
    return data;
  }

  async deleteNote(id: string): Promise<void> {
    await this.http.delete(`/api/notes/${id}`);
  }

  async addTag(noteId: string, tag: string): Promise<Note> {
    const { data } = await this.http.post<Note>(`/api/notes/${noteId}/tags`, { tag });
    return data;
  }

  async removeTag(noteId: string, tag: string): Promise<Note> {
    const { data } = await this.http.delete<Note>(`/api/notes/${noteId}/tags/${encodeURIComponent(tag)}`);
    return data;
  }

  async exportNotes(): Promise<void> {
    const { data } = await this.http.get("/api/notes/export", { responseType: "blob" });
    const blob = new Blob([data], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notes.zip";
    a.click();
    URL.revokeObjectURL(url);
  }
}
