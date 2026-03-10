import { create } from "zustand";
import type { Note, Collection, Settings, DefaultView } from "@repo/types";
import type { Tag, View, NoteStore } from "./types";
import { buildUrl, parseUrl } from "./util";

const API_BASE = "/api/notes";

function syncUrl(view: View, selectedNoteId: string | null, showInfoPanel: boolean) {
  const settingDefault = useNoteStore.getState().settings.show_info_panel;
  const url = buildUrl(view, selectedNoteId, showInfoPanel, settingDefault);
  if (url !== window.location.pathname + window.location.search) {
    window.history.pushState(null, "", url);
  }
}

const initialUrl = parseUrl();

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  tags: [],
  collections: [],
  activeCollectionId: null,
  selectedNoteId: initialUrl.selectedNoteId,
  searchQuery: "",
  selectedTags: [],
  settings: { default_view: "renderer" as DefaultView, show_info_panel: true, theme: "default" as const, auth_method: "none" as const, auth_username: "", auth_password: "" },
  settingsLoaded: false,
  editOnCreate: false,
  importing: false,
  saving: false,
  archiving: false,
  view: initialUrl.view,
  showInfoPanel: initialUrl.showInfoPanel ?? true,

  fetchSettings: async () => {
    const res = await fetch("/api/settings");
    const settings: Settings = await res.json();
    set({ settings, settingsLoaded: true });
    // Apply the setting only if the URL didn't explicitly specify
    if (initialUrl.showInfoPanel === null) {
      set({ showInfoPanel: settings.show_info_panel });
    }
  },
  updateSettings: async (updates) => {
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
    syncUrl("notes", null, get().showInfoPanel);
    await get().fetchSettings();
  },
  toggleInfoPanel: () => {
    const next = !get().showInfoPanel;
    set({ showInfoPanel: next });
    syncUrl(get().view, get().selectedNoteId, next);
  },
  setView: (view) => {
    const noteId = view === "settings" ? null : get().selectedNoteId;
    set({ view, selectedNoteId: noteId });
    syncUrl(view, noteId, get().showInfoPanel);
  },
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchNotes();
  },
  setSelectedNoteId: (id) => {
    const view = id ? "notes" : get().view;
    set({ selectedNoteId: id, view });
    syncUrl(view, id, get().showInfoPanel);
  },
  setActiveCollectionId: (id) => {
    set({ activeCollectionId: id, selectedNoteId: null });
    syncUrl("notes", null, get().showInfoPanel);
    get().fetchNotes();
  },
  toggleTag: (tag) => {
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

  createCollection: async (name) => {
    await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await get().fetchCollections();
  },

  deleteCollection: async (id) => {
    await fetch(`/api/collections/${id}`, { method: "DELETE" });
    await get().fetchCollections();
  },

  setDefaultCollection: async (id) => {
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

  createNote: async (title, content) => {
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
      syncUrl("notes", note.id, get().showInfoPanel);
      await get().fetchNotes();
      get().fetchTags();
    } finally {
      set({ saving: false });
    }
  },

  importNote: async (title, content) => {
    const { activeCollectionId } = get();
    await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, collectionId: activeCollectionId }),
    });
  },

  updateNote: async (id, updates) => {
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

  deleteNote: async (id) => {
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
        syncUrl(state.view, nextId, state.showInfoPanel);
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

  addTag: async (noteId, tag) => {
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

  removeTag: async (noteId, tag) => {
    const res = await fetch(`${API_BASE}/${noteId}/tags/${encodeURIComponent(tag)}`, {
      method: "DELETE",
    });
    const updated: Note = await res.json();
    set((state) => ({
      notes: state.notes.map((n) => (n.id === noteId ? updated : n)),
    }));
    get().fetchTags();
  },
}));

export function restoreFromUrl() {
  const { view, selectedNoteId, showInfoPanel } = parseUrl();
  const resolved = showInfoPanel ?? useNoteStore.getState().settings.show_info_panel;
  useNoteStore.setState({ view, selectedNoteId, showInfoPanel: resolved });
}
