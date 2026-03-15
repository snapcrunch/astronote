import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import type {
  Note,
  Collection,
  Settings,
  ApiKey,
  ApiKeyWithToken,
} from '@repo/types';

export interface User {
  id: number;
  email: string;
}

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
  createdAt?: string;
  updatedAt?: string;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export interface ClaudeAuthStatus {
  authenticated: boolean;
  output: string;
}

export class WebClient {
  private http: AxiosInstance;
  private refreshPromise: Promise<boolean> | null = null;

  onAuthFailure?: () => void;

  constructor(baseURL = '') {
    this.http = axios.create({ baseURL });

    this.http.interceptors.request.use((config) => {
      const token = localStorage.getItem('astronote.token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.http.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as RetryableConfig | undefined;
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/api/auth')
        ) {
          originalRequest._retry = true;
          const refreshed = await this.refresh();
          if (refreshed) {
            originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('astronote.token')}`;
            return this.http(originalRequest);
          }
          this.onAuthFailure?.();
        }
        return Promise.reject(error);
      }
    );
  }

  private async refresh(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    this.refreshPromise = this.doRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    return result;
  }

  private async doRefresh(): Promise<boolean> {
    const refreshToken = localStorage.getItem('astronote.refreshToken');
    if (!refreshToken) {
      return false;
    }
    try {
      const { data } = await this.http.post<{
        token: string;
        refreshToken: string;
      }>('/api/auth/refresh', { refreshToken });
      localStorage.setItem('astronote.token', data.token);
      localStorage.setItem('astronote.refreshToken', data.refreshToken);
      return true;
    } catch {
      localStorage.removeItem('astronote.token');
      localStorage.removeItem('astronote.refreshToken');
      return false;
    }
  }

  // Auth

  async getUser(): Promise<User> {
    const { data } = await this.http.get<User>('/api/auth');
    return data;
  }

  async login(email: string, password: string): Promise<void> {
    const { data } = await this.http.post<{
      token: string;
      refreshToken: string;
    }>('/api/auth', { email, password });
    localStorage.setItem('astronote.token', data.token);
    localStorage.setItem('astronote.refreshToken', data.refreshToken);
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('astronote.refreshToken');
    if (refreshToken) {
      try {
        await this.http.post('/api/auth/logout', { refreshToken });
      } catch {
        // Best-effort server-side invalidation
      }
    }
    localStorage.removeItem('astronote.token');
    localStorage.removeItem('astronote.refreshToken');
  }

  // Settings

  async fetchSettings(): Promise<Settings> {
    const { data } = await this.http.get<Settings>('/api/settings');
    return data;
  }

  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    const { data } = await this.http.patch<Settings>('/api/settings', updates);
    return data;
  }

  async resetAll(): Promise<Collection> {
    const { data } = await this.http.post<Collection>('/api/settings/reset');
    return data;
  }

  // Tags

  async fetchTags(collectionId?: number): Promise<Tag[]> {
    const { data } = await this.http.get<Tag[]>('/api/tags', {
      params: collectionId != null ? { collectionId } : {},
    });
    return data;
  }

  // Collections

  async fetchCollections(): Promise<Collection[]> {
    const { data } = await this.http.get<Collection[]>('/api/collections');
    return data;
  }

  async createCollection(name: string): Promise<void> {
    await this.http.post('/api/collections', { name });
  }

  async deleteCollection(id: number): Promise<void> {
    await this.http.delete(`/api/collections/${id}`);
  }

  async setDefaultCollection(id: number): Promise<Collection[]> {
    const { data } = await this.http.post<Collection[]>(
      `/api/collections/${id}/default`
    );
    return data;
  }

  // API Keys

  async fetchApiKeys(): Promise<ApiKey[]> {
    const { data } = await this.http.get<ApiKey[]>('/api/keys');
    return data;
  }

  async createApiKey(name: string): Promise<ApiKeyWithToken> {
    const { data } = await this.http.post<ApiKeyWithToken>('/api/keys', {
      name,
    });
    return data;
  }

  async deleteApiKey(id: string): Promise<void> {
    await this.http.delete(`/api/keys/${id}`);
  }

  // Notes

  async fetchNotes(params?: FetchNotesParams): Promise<Note[]> {
    const { data } = await this.http.get<Note[]>('/api/notes', {
      params: {
        ...(params?.q ? { q: params.q } : {}),
        ...(params?.tags?.length ? { tags: params.tags.join(',') } : {}),
        ...(params?.collectionId != null
          ? { collectionId: params.collectionId }
          : {}),
      },
    });
    return data;
  }

  async createNote(params: CreateNoteParams): Promise<Note> {
    const { data } = await this.http.post<Note>('/api/notes', params);
    return data;
  }

  async updateNote(
    id: string,
    updates: Partial<Pick<Note, 'title' | 'content' | 'pinned'>> & {
      collectionId?: number;
    }
  ): Promise<Note> {
    const { data } = await this.http.patch<Note>(`/api/notes/${id}`, updates);
    return data;
  }

  async deleteNote(id: string): Promise<void> {
    await this.http.delete(`/api/notes/${id}`);
  }

  async addTag(noteId: string, tag: string): Promise<Note> {
    const { data } = await this.http.post<Note>(`/api/notes/${noteId}/tags`, {
      tag,
    });
    return data;
  }

  async removeTag(noteId: string, tag: string): Promise<Note> {
    const { data } = await this.http.delete<Note>(
      `/api/notes/${noteId}/tags/${encodeURIComponent(tag)}`
    );
    return data;
  }

  // Claude Auth

  async fetchClaudeAuthStatus(): Promise<ClaudeAuthStatus> {
    const { data } = await this.http.get<ClaudeAuthStatus>("/api/claude/auth/status");
    return data;
  }

  async startClaudeLogin(): Promise<{ url: string }> {
    const { data } = await this.http.post<{ url: string }>("/api/claude/auth/login");
    return data;
  }

  async submitClaudeAuthCode(code: string): Promise<{ success: boolean; output: string }> {
    const { data } = await this.http.post<{ success: boolean; output: string }>("/api/claude/auth/callback", { code });
    return data;
  }

  async streamClaudePrompt(
    prompt: string,
    onChunk: (text: string) => void,
    onDone: (sessionId: string | null) => void,
    onError: (message: string) => void,
    signal?: AbortSignal,
    sessionId?: string,
    activeNoteTitle?: string,
  ): Promise<void> {
    const baseURL = this.http.defaults.baseURL ?? "";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const token = localStorage.getItem('astronote.token');
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(`${baseURL}/api/claude/prompt`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          prompt,
          ...(sessionId ? { sessionId } : {}),
          ...(activeNoteTitle ? { activeNoteTitle } : {}),
        }),
        signal,
      });
    } catch (err: any) {
      if (err.name === "AbortError") return;
      onError(err.message ?? "Network error");
      return;
    }

    if (!response.ok) {
      try {
        const body = await response.json();
        onError(body.error ?? `HTTP ${response.status}`);
      } catch {
        onError(`HTTP ${response.status}`);
      }
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError("No response body");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6);
          try {
            const event = JSON.parse(json);
            if (event.type === "chunk") {
              onChunk(event.text);
            } else if (event.type === "done") {
              onDone(event.sessionId ?? null);
              return;
            } else if (event.type === "error") {
              onError(event.message);
              return;
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
      // Stream ended without a done/error event
      onDone(null);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      onError(err.message ?? "Stream error");
    }
  }

  async exportNotes(): Promise<void> {
    const { data } = await this.http.get('/api/notes/export', {
      responseType: 'blob',
    });
    const blob = new Blob([data], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes.zip';
    a.click();
    URL.revokeObjectURL(url);
  }
}
