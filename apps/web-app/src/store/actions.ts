import type { StoreApi } from "zustand";
import type { Note, Settings } from "@repo/types";
import { WebClient } from "@repo/astronote-client/WebClient";
import type { NoteStore, Tag, View } from "./types";
import { syncUrl, parseUrl } from "./util";

type Set = StoreApi<NoteStore>["setState"];
type Get = StoreApi<NoteStore>["getState"];

const client = new WebClient();

interface CreateActionsParams {
  set: Set;
  get: Get;
  initialShowInfoPanel: boolean | null;
}

export function createActions({ set, get, initialShowInfoPanel }: CreateActionsParams) {
  const sd = () => get().settings.show_info_panel;

  function restoreFromUrl() {
    const { view, selectedNoteId, showInfoPanel } = parseUrl();
    const resolved = showInfoPanel ?? get().settings.show_info_panel;
    set({ view, selectedNoteId, showInfoPanel: resolved });
  }

  return {
    init: () => {
      get().fetchNotes();
      get().fetchTags();
      get().fetchCollections();
      get().fetchSettings();
      window.addEventListener("popstate", restoreFromUrl);
      return () => window.removeEventListener("popstate", restoreFromUrl);
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
      const defaultCollection = await client.resetAll();
      set({
        notes: [],
        tags: [],
        collections: [defaultCollection],
        activeCollectionId: defaultCollection.id,
        selectedNoteId: null,
        searchQuery: "",
        selectedTags: [],
        view: "notes",
      });
      syncUrl({ view: "notes", selectedNoteId: null, showInfoPanel: get().showInfoPanel, settingDefault: sd() });
      await get().fetchSettings();
    },

    toggleInfoPanel: () => {
      const next = !get().showInfoPanel;
      set({ showInfoPanel: next });
      syncUrl({ view: get().view, selectedNoteId: get().selectedNoteId, showInfoPanel: next, settingDefault: sd() });
    },

    setView: (view: View) => {
      const noteId = view === "notes" ? get().selectedNoteId : null;
      set({ view, selectedNoteId: noteId });
      syncUrl({ view, selectedNoteId: noteId, showInfoPanel: get().showInfoPanel, settingDefault: sd() });
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
      get().fetchNotes();
    },

    setSelectedNoteId: (id: string | null) => {
      const view = id ? "notes" : get().view;
      set({ selectedNoteId: id, view });
      syncUrl({ view, selectedNoteId: id, showInfoPanel: get().showInfoPanel, settingDefault: sd() });
    },

    setActiveCollectionId: (id: number) => {
      set({ activeCollectionId: id, selectedNoteId: null });
      syncUrl({ view: "notes", selectedNoteId: null, showInfoPanel: get().showInfoPanel, settingDefault: sd() });
      get().fetchNotes();
      get().fetchTags();
    },

    toggleTag: (tag: string) => {
      const current = get().selectedTags;
      const next = current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag];
      set({ selectedTags: next });
      get().fetchNotes();
    },

    fetchTags: async () => {
      const tags: Tag[] = await client.fetchTags(get().activeCollectionId ?? undefined);
      set({ tags });
    },

    fetchCollections: async () => {
      const collections = await client.fetchCollections();
      const { activeCollectionId } = get();
      if (activeCollectionId == null && collections.length > 0) {
        const defaultCol = collections.find((c) => c.isDefault) ?? collections[0]!;
        set({ collections, activeCollectionId: defaultCol.id });
        get().fetchNotes();
      } else {
        set({ collections });
      }
    },

    createCollection: async (name: string) => {
      await client.createCollection(name);
      await get().fetchCollections();
    },

    deleteCollection: async (id: number) => {
      await client.deleteCollection(id);
      await get().fetchCollections();
    },

    setDefaultCollection: async (id: number) => {
      const collections = await client.setDefaultCollection(id);
      set({ collections });
    },

    fetchNotes: async () => {
      const { searchQuery, selectedTags, activeCollectionId } = get();
      const notes = await client.fetchNotes({
        q: searchQuery || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        collectionId: activeCollectionId ?? undefined,
      });
      set({ notes });
    },

    createNote: async (title: string, content?: string) => {
      set({ saving: true });
      try {
        const { activeCollectionId } = get();
        const note = await client.createNote({ title, content, collectionId: activeCollectionId });
        set({ searchQuery: "", selectedNoteId: note.id, editOnCreate: true, view: "notes" });
        syncUrl({ view: "notes", selectedNoteId: note.id, showInfoPanel: get().showInfoPanel, settingDefault: sd() });
        await get().fetchNotes();
        get().fetchTags();
      } finally {
        set({ saving: false });
      }
    },

    importNote: async (title: string, content: string, opts?: { tags?: string[]; collectionId?: number; pinned?: boolean }) => {
      const collectionId = opts?.collectionId ?? get().activeCollectionId;
      await client.createNote({ title, content, tags: opts?.tags, collectionId, pinned: opts?.pinned });
    },

    updateNote: async (id: string, updates: Partial<Pick<Note, "title" | "content" | "pinned">>) => {
      set({ saving: true });
      try {
        const updated = await client.updateNote(id, updates);
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? updated : n)),
        }));
        if (updates.pinned !== undefined) {
          await get().fetchNotes();
        }
        get().fetchTags();
      } finally {
        set({ saving: false });
      }
    },

    deleteNote: async (id: string) => {
      set({ archiving: true });
      try {
        await client.deleteNote(id);
        set((state) => {
          if (state.selectedNoteId !== id) {
            return { notes: state.notes.filter((n) => n.id !== id) };
          }
          const index = state.notes.findIndex((n) => n.id === id);
          const next = state.notes[index - 1] ?? state.notes[index + 1] ?? null;
          const nextId = next?.id ?? null;
          syncUrl({ view: state.view, selectedNoteId: nextId, showInfoPanel: state.showInfoPanel, settingDefault: state.settings.show_info_panel });
          return {
            notes: state.notes.filter((n) => n.id !== id),
            selectedNoteId: nextId,
          };
        });
        get().fetchTags();
      } finally {
        set({ archiving: false });
      }
    },

    addTag: async (noteId: string, tag: string) => {
      const updated = await client.addTag(noteId, tag);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === noteId ? updated : n)),
      }));
      get().fetchTags();
    },

    removeTag: async (noteId: string, tag: string) => {
      const updated = await client.removeTag(noteId, tag);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === noteId ? updated : n)),
      }));
      get().fetchTags();
    },

    exportNotes: async () => {
      await client.exportNotes();
    },
  };
}
