import type {
  Note,
  NoteSummary,
  Collection,
  Settings,
  ApiKey,
} from '@repo/types';
import type { Tag, User } from '@repo/astronote-client/WebClient';

export type { Tag, User };

export type Route = 'loading' | 'login' | 'app';
export type View = 'notes' | 'settings' | 'collections' | 'keys';

export interface NoteStore {
  route: Route;
  user: User | null;
  notes: NoteSummary[];
  tags: Tag[];
  collections: Collection[];
  activeCollectionId: number | null;
  selectedNoteId: number | null;
  searchQuery: string;
  selectedTags: string[];
  claudeAuthenticated: boolean;
  editOnCreate: boolean;
  saving: boolean;
  renaming: boolean;
  tagging: boolean;
  creatingCollection: boolean;
  deletingCollection: boolean;
  archiving: boolean;
  loadingNotes: boolean;
  noteContentCache: Record<number, string>;
  loadingNoteContent: boolean;
  settings: Settings;
  settingsLoaded: boolean;
  apiKeys: ApiKey[];
  graphData: {
    nodes: { id: number; label: string }[];
    edges: { source: number; target: number; type: 'wikilink' | 'shared-tag' }[];
  };
  graphDataLoaded: boolean;
  view: View;
  showInfoPanel: boolean;
  showGraphFooter: boolean;

  init: () => Promise<() => void>;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  resetAll: () => Promise<void>;
  setView: (view: View) => void;
  toggleInfoPanel: () => void;
  toggleGraphFooter: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedNoteId: (id: number | null) => void;
  setActiveCollectionId: (id: number) => void;
  toggleTag: (tag: string, accumulate?: boolean) => void;
  fetchClaudeAuthStatus: () => Promise<void>;
  fetchNotes: () => Promise<void>;
  fetchNoteContent: (id: number) => Promise<void>;
  fetchTags: () => Promise<void>;
  fetchCollections: () => Promise<void>;
  createCollection: (name: string) => Promise<void>;
  deleteCollection: (id: number) => Promise<void>;
  setDefaultCollection: (id: number) => Promise<void>;
  createNote: (title: string, content?: string) => Promise<void>;
  importNote: (
    title: string,
    content: string,
    opts?: {
      id?: number;
      tags?: string[];
      collectionId?: number;
      pinned?: boolean;
      createdAt?: string;
      updatedAt?: string;
    }
  ) => Promise<void>;
  importing: boolean;
  importedCount: number;
  updateNote: (
    id: number,
    updates: Partial<Pick<Note, 'title' | 'content' | 'pinned'>> & {
      collectionId?: number;
    }
  ) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  addTag: (noteId: number, tag: string) => Promise<void>;
  removeTag: (noteId: number, tag: string) => Promise<void>;
  exportNotes: () => Promise<void>;
  performBackup: () => Promise<void>;
  fetchGraph: () => Promise<void>;
  fetchApiKeys: () => Promise<void>;
  createApiKey: (name: string) => Promise<{ token: string }>;
  deleteApiKey: (id: string) => Promise<void>;
}
