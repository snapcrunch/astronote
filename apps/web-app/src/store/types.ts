import type { Note, Collection, Settings, ApiKey } from '@repo/types';
import type { Tag, User } from '@repo/astronote-client/WebClient';

export type { Tag, User };

export type Route = 'loading' | 'login' | 'app';
export type View = 'notes' | 'settings' | 'collections' | 'keys';

export interface NoteStore {
  route: Route;
  user: User | null;
  notes: Note[];
  tags: Tag[];
  collections: Collection[];
  activeCollectionId: number | null;
  selectedNoteId: string | null;
  searchQuery: string;
  selectedTags: string[];
  editOnCreate: boolean;
  saving: boolean;
  archiving: boolean;
  settings: Settings;
  settingsLoaded: boolean;
  apiKeys: ApiKey[];
  view: View;
  showInfoPanel: boolean;

  init: () => Promise<() => void>;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  resetAll: () => Promise<void>;
  setView: (view: View) => void;
  toggleInfoPanel: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedNoteId: (id: string | null) => void;
  setActiveCollectionId: (id: number) => void;
  toggleTag: (tag: string) => void;
  fetchNotes: () => Promise<void>;
  fetchTags: () => Promise<void>;
  fetchCollections: () => Promise<void>;
  createCollection: (name: string) => Promise<void>;
  deleteCollection: (id: number) => Promise<void>;
  setDefaultCollection: (id: number) => Promise<void>;
  createNote: (title: string, content?: string) => Promise<void>;
  importNote: (
    title: string,
    content: string,
    opts?: { tags?: string[]; collectionId?: number; pinned?: boolean }
  ) => Promise<void>;
  importing: boolean;
  updateNote: (
    id: string,
    updates: Partial<Pick<Note, 'title' | 'content' | 'pinned'>> & {
      collectionId?: number;
    }
  ) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addTag: (noteId: string, tag: string) => Promise<void>;
  removeTag: (noteId: string, tag: string) => Promise<void>;
  exportNotes: () => Promise<void>;
  fetchApiKeys: () => Promise<void>;
  createApiKey: (name: string) => Promise<{ token: string }>;
  deleteApiKey: (id: string) => Promise<void>;
}
