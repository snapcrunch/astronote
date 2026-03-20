import type { StoreApi } from 'zustand';
import type { Note, Settings } from '@repo/types';
import { WebClient } from '@repo/astronote-client/WebClient';
import type { NoteStore, Tag, View } from './types';
import { syncUrl, parseUrl } from './util';

type Set = StoreApi<NoteStore>['setState'];
type Get = StoreApi<NoteStore>['getState'];

const client = new WebClient();

interface CreateActionsParams {
  set: Set;
  get: Get;
  initialShowInfoPanel: boolean | null;
}

export function createActions({
  set,
  get,
  initialShowInfoPanel,
}: CreateActionsParams) {
  client.onAuthFailure = () => {
    set({ user: null, route: 'login' });
    window.history.replaceState(null, '', '/login');
  };

  const sd = () => get().settings.show_info_panel;

  function restoreFromUrl() {
    const { view, selectedNoteId, showInfoPanel } = parseUrl();
    const resolved = showInfoPanel ?? get().settings.show_info_panel;
    set({ view, selectedNoteId, showInfoPanel: resolved });
  }

  let initPromise: Promise<() => void> | null = null;
  const inFlightNoteContent = new Map<number, Promise<void>>();

  return {
    init: async () => {
      if (initPromise) return initPromise;
      initPromise = (async () => {
        try {
          const user = await client.getUser();
          set({ user });
        } catch {
          set({ user: null, route: 'login' });
          window.history.replaceState(null, '', '/login');
          initPromise = null;
          return () => {};
        }

        set({ route: 'app' });
        // Fetch collections first so activeCollectionId is set before fetching notes
        await get().fetchCollections();
        Promise.all([
          get().fetchNotes(),
          get().fetchTags(),
          get().fetchApiKeys(),
          get().fetchSettings(),
          get().fetchClaudeAuthStatus(),
        ]);
        window.addEventListener('popstate', restoreFromUrl);
        return () => window.removeEventListener('popstate', restoreFromUrl);
      })();
      return initPromise;
    },

    login: async (email: string, password: string) => {
      await client.login(email, password);
      set({ route: 'loading' });
      await get().init();
    },

    signOut: async () => {
      await client.logout();
      initPromise = null;
      set({
        route: 'login',
        user: null,
        notes: [],
        tags: [],
        collections: [],
        apiKeys: [],
        activeCollectionId: null,
        selectedNoteId: null,
        searchQuery: '',
        selectedTags: [],
        settingsLoaded: false,
        editOnCreate: false,
        importing: false,
        importedCount: 0,
        saving: false,
        renaming: false,
        tagging: false,
        creatingCollection: false,
        deletingCollection: false,
        archiving: false,
        noteContentCache: {},
        view: 'notes',
      });
      window.history.replaceState(null, '', '/login');
    },

    fetchClaudeAuthStatus: async () => {
      try {
        const status = await client.fetchClaudeAuthStatus();
        set({ claudeAuthenticated: status.authenticated });
      } catch {
        set({ claudeAuthenticated: false });
      }
    },

    fetchSettings: async () => {
      const settings = await client.fetchSettings();
      set({ settings, settingsLoaded: true });
      // Apply the setting only if the URL didn't explicitly specify
      if (initialShowInfoPanel === null) {
        set({ showInfoPanel: settings.show_info_panel });
      }
    },

    updateSettings: async (updates: Partial<Settings>) => {
      const settings = await client.updateSettings(updates);
      set({ settings });
    },

    resetAll: async () => {
      await client.resetAll();
      set({
        activeCollectionId: null,
        selectedNoteId: null,
        searchQuery: '',
        selectedTags: [],
        noteContentCache: {},
        view: 'notes',
      });
      syncUrl({
        view: 'notes',
        selectedNoteId: null,
        showInfoPanel: get().showInfoPanel,
        settingDefault: sd(),
      });
      await Promise.all([get().fetchCollections(), get().fetchSettings()]);
    },

    toggleInfoPanel: () => {
      const next = !get().showInfoPanel;
      set({ showInfoPanel: next });
      syncUrl({
        view: get().view,
        selectedNoteId: get().selectedNoteId,
        showInfoPanel: next,
        settingDefault: sd(),
      });
    },

    setView: (view: View) => {
      const noteId = view === 'notes' ? get().selectedNoteId : null;
      set({ view, selectedNoteId: noteId });
      syncUrl({
        view,
        selectedNoteId: noteId,
        showInfoPanel: get().showInfoPanel,
        settingDefault: sd(),
      });
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
      get().fetchNotes();
    },

    setSelectedNoteId: (id: number | null) => {
      const view = id ? 'notes' : get().view;
      set({ selectedNoteId: id, view });
      syncUrl({
        view,
        selectedNoteId: id,
        showInfoPanel: get().showInfoPanel,
        settingDefault: sd(),
      });
    },

    setActiveCollectionId: (id: number) => {
      set({
        activeCollectionId: id,
        selectedNoteId: null,
        notes: [],
        noteContentCache: {},
      });
      syncUrl({
        view: 'notes',
        selectedNoteId: null,
        showInfoPanel: get().showInfoPanel,
        settingDefault: sd(),
      });
      get().fetchNotes();
      get().fetchTags();
    },

    toggleTag: (tag: string, accumulate = false) => {
      const current = get().selectedTags;
      let next: string[];
      if (accumulate) {
        next = current.includes(tag)
          ? current.filter((t) => t !== tag)
          : [...current, tag];
      } else {
        next = current.length === 1 && current[0] === tag ? [] : [tag];
      }
      set({ selectedTags: next });
      get().fetchNotes();
    },

    fetchTags: async () => {
      const tags: Tag[] = await client.fetchTags(
        get().activeCollectionId ?? undefined
      );
      set({ tags });
    },

    fetchCollections: async () => {
      const collections = await client.fetchCollections();
      const { activeCollectionId } = get();
      if (activeCollectionId == null && collections.length > 0) {
        const defaultCol =
          collections.find((c) => c.isDefault) ?? collections[0]!;
        set({ collections, activeCollectionId: defaultCol.id });
      } else {
        set({ collections });
      }
    },

    createCollection: async (name: string) => {
      set({ creatingCollection: true });
      try {
        await client.createCollection(name);
        await get().fetchCollections();
      } finally {
        set({ creatingCollection: false });
      }
    },

    deleteCollection: async (id: number) => {
      set({ deletingCollection: true });
      try {
        const { activeCollectionId } = get();
        await client.deleteCollection(id);
        if (activeCollectionId === id) {
          set({ activeCollectionId: null, selectedNoteId: null });
        }
        await get().fetchCollections();
        await Promise.all([get().fetchNotes(), get().fetchTags()]);
      } finally {
        set({ deletingCollection: false });
      }
    },

    setDefaultCollection: async (id: number) => {
      const collections = await client.setDefaultCollection(id);
      set({ collections });
    },

    fetchNotes: async () => {
      set({ loadingNotes: true });
      try {
        const { searchQuery, selectedTags, activeCollectionId } = get();
        const notes = await client.fetchNotes({
          q: searchQuery || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          collectionId: activeCollectionId ?? undefined,
        });
        set({ notes });
      } finally {
        set({ loadingNotes: false });
      }
    },

    fetchNoteContent: async (id: number) => {
      if (get().noteContentCache[id] !== undefined) return;
      if (inFlightNoteContent.has(id)) return inFlightNoteContent.get(id);
      const promise = (async () => {
        set({ loadingNoteContent: true });
        try {
          const note = await client.fetchNote(id);
          set((state) => ({
            noteContentCache: { ...state.noteContentCache, [id]: note.content },
          }));
        } finally {
          set({ loadingNoteContent: false });
        }
      })();
      inFlightNoteContent.set(id, promise);
      try {
        await promise;
      } finally {
        inFlightNoteContent.delete(id);
      }
    },

    createNote: async (title: string, content?: string) => {
      set({ saving: true });
      try {
        const { activeCollectionId } = get();
        const note = await client.createNote({
          title,
          content,
          collectionId: activeCollectionId,
        });
        set((state) => ({
          searchQuery: '',
          selectedNoteId: note.id,
          editOnCreate: true,
          view: 'notes',
          noteContentCache: {
            ...state.noteContentCache,
            [note.id]: note.content,
          },
        }));
        syncUrl({
          view: 'notes',
          selectedNoteId: note.id,
          showInfoPanel: get().showInfoPanel,
          settingDefault: sd(),
        });
        await get().fetchNotes();
        get().fetchTags();
      } finally {
        set({ saving: false });
      }
    },

    importNote: async (
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
    ) => {
      const collectionId = opts?.collectionId ?? get().activeCollectionId;
      await client.createNote({
        id: opts?.id,
        title,
        content,
        tags: opts?.tags,
        collectionId,
        pinned: opts?.pinned,
        createdAt: opts?.createdAt,
        updatedAt: opts?.updatedAt,
      });
    },

    updateNote: async (
      id: number,
      updates: Partial<Pick<Note, 'title' | 'content' | 'pinned'>> & {
        collectionId?: number;
      }
    ) => {
      const isRename =
        updates.title !== undefined && updates.content === undefined;
      set(isRename ? { renaming: true } : { saving: true });
      try {
        const updated = await client.updateNote(id, updates);
        const { content: _, ...summary } = updated;
        if (updates.collectionId !== undefined) {
          set((state) => ({
            noteContentCache: {
              ...state.noteContentCache,
              [id]: updated.content,
            },
          }));
          await get().fetchNotes();
          await get().fetchCollections();
        } else {
          set((state) => ({
            notes: state.notes.map((n) => (n.id === id ? summary : n)),
            noteContentCache: {
              ...state.noteContentCache,
              [id]: updated.content,
            },
          }));
          if (updates.pinned !== undefined) {
            await get().fetchNotes();
          }
        }
        get().fetchTags();
      } finally {
        set(isRename ? { renaming: false } : { saving: false });
      }
    },

    deleteNote: async (id: number) => {
      set({ archiving: true });
      try {
        await client.deleteNote(id);
        set((state) => {
          const { [id]: _, ...remainingCache } = state.noteContentCache;
          if (state.selectedNoteId !== id) {
            return {
              notes: state.notes.filter((n) => n.id !== id),
              noteContentCache: remainingCache,
            };
          }
          const index = state.notes.findIndex((n) => n.id === id);
          const next = state.notes[index - 1] ?? state.notes[index + 1] ?? null;
          const nextId = next?.id ?? null;
          syncUrl({
            view: state.view,
            selectedNoteId: nextId,
            showInfoPanel: state.showInfoPanel,
            settingDefault: state.settings.show_info_panel,
          });
          return {
            notes: state.notes.filter((n) => n.id !== id),
            selectedNoteId: nextId,
            noteContentCache: remainingCache,
          };
        });
        get().fetchTags();
      } finally {
        set({ archiving: false });
      }
    },

    addTag: async (noteId: number, tag: string) => {
      set({ tagging: true });
      try {
        const updated = await client.addTag(noteId, tag);
        const { content: _, ...summary } = updated;
        set((state) => ({
          notes: state.notes.map((n) => (n.id === noteId ? summary : n)),
          noteContentCache: {
            ...state.noteContentCache,
            [noteId]: updated.content,
          },
        }));
        get().fetchTags();
      } finally {
        set({ tagging: false });
      }
    },

    removeTag: async (noteId: number, tag: string) => {
      set({ tagging: true });
      try {
        const updated = await client.removeTag(noteId, tag);
        const { content: _, ...summary } = updated;
        set((state) => ({
          notes: state.notes.map((n) => (n.id === noteId ? summary : n)),
          noteContentCache: {
            ...state.noteContentCache,
            [noteId]: updated.content,
          },
        }));
        get().fetchTags();
      } finally {
        set({ tagging: false });
      }
    },

    exportNotes: async () => {
      await client.exportNotes();
    },

    performBackup: async () => {
      await client.performBackup();
    },

    toggleGraphFooter: () => {
      const next = !get().showGraphFooter;
      set({ showGraphFooter: next });
      if (next && !get().graphNotesLoaded) {
        get().fetchGraphNotes();
      }
    },

    fetchGraphNotes: async () => {
      const { activeCollectionId } = get();
      const notes = await client.fetchNotes({
        collectionId: activeCollectionId ?? undefined,
        includeContent: true,
      } as const);
      set({ graphNotes: notes, graphNotesLoaded: true });
    },

    fetchApiKeys: async () => {
      const apiKeys = await client.fetchApiKeys();
      set({ apiKeys });
    },

    createApiKey: async (name: string) => {
      const result = await client.createApiKey(name);
      await get().fetchApiKeys();
      return { token: result.token };
    },

    deleteApiKey: async (id: string) => {
      await client.deleteApiKey(id);
      await get().fetchApiKeys();
    },
  };
}
