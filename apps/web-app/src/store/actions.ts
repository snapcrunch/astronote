import type { StoreApi } from "zustand";
import type { Note, Collection, Settings } from "@repo/types";
import type { NoteStore, Tag, View } from "./types";
import { syncUrl, parseUrl } from "./util";

type Set = StoreApi<NoteStore>["setState"];
type Get = StoreApi<NoteStore>["getState"];

const API_BASE = "/api/notes";

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
      const res = await fetch("/api/settings");
      const settings: Settings = await res.json();
      set({ settings, settingsLoaded: true });
      // Apply the setting only if the URL didn't explicitly specify
      if (initialShowInfoPanel === null) {
        set({ showInfoPanel: settings.show_info_panel });
      }
    },
    updateSettings: async (updates: Partial<Settings>) => {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const settings: Settings = await res.json();
      set({ settings });
    },
    resetAll: async () => {
      const res = await fetch("/api/settings/reset", { method: "POST" });
      const defaultCollection: Collection = await res.json();
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
      const noteId = view === "settings" ? null : get().selectedNoteId;
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
      const res = await fetch("/api/tags");
      const tags: Tag[] = await res.json();
      set({ tags });
    },

    fetchCollections: async () => {
      const res = await fetch("/api/collections");
      const collections: Collection[] = await res.json();
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
      await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      await get().fetchCollections();
    },

    deleteCollection: async (id: number) => {
      await fetch(`/api/collections/${id}`, { method: "DELETE" });
      await get().fetchCollections();
    },

    setDefaultCollection: async (id: number) => {
      const res = await fetch(`/api/collections/${id}/default`, { method: "POST" });
      const collections: Collection[] = await res.json();
      set({ collections });
    },

    fetchNotes: async () => {
      const { searchQuery, selectedTags, activeCollectionId } = get();
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
      if (activeCollectionId != null) params.set("collectionId", String(activeCollectionId));
      const qs = params.toString();
      const url = qs ? `${API_BASE}?${qs}` : API_BASE;
      const res = await fetch(url);
      const notes: Note[] = await res.json();
      set({ notes });
    },

    createNote: async (title: string, content?: string) => {
      set({ saving: true });
      try {
        const { activeCollectionId } = get();
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, collectionId: activeCollectionId }),
        });
        const note: Note = await res.json();
        set({ searchQuery: "", selectedNoteId: note.id, editOnCreate: true, view: "notes" });
        syncUrl({ view: "notes", selectedNoteId: note.id, showInfoPanel: get().showInfoPanel, settingDefault: sd() });
        await get().fetchNotes();
        get().fetchTags();
      } finally {
        set({ saving: false });
      }
    },

    importNote: async (title: string, content: string) => {
      const { activeCollectionId } = get();
      await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, collectionId: activeCollectionId }),
      });
    },

    updateNote: async (id: string, updates: Partial<Pick<Note, "title" | "content">>) => {
      set({ saving: true });
      try {
        const res = await fetch(`${API_BASE}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        const updated: Note = await res.json();
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? updated : n)),
        }));
        get().fetchTags();
      } finally {
        set({ saving: false });
      }
    },

    deleteNote: async (id: string) => {
      set({ archiving: true });
      try {
        await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
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
      const res = await fetch(`${API_BASE}/${noteId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag }),
      });
      const updated: Note = await res.json();
      set((state) => ({
        notes: state.notes.map((n) => (n.id === noteId ? updated : n)),
      }));
      get().fetchTags();
    },

    removeTag: async (noteId: string, tag: string) => {
      const res = await fetch(`${API_BASE}/${noteId}/tags/${encodeURIComponent(tag)}`, {
        method: "DELETE",
      });
      const updated: Note = await res.json();
      set((state) => ({
        notes: state.notes.map((n) => (n.id === noteId ? updated : n)),
      }));
      get().fetchTags();
    },
  };
}
