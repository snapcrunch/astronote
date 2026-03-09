import { useMemo } from "react";
import { create } from "zustand";
import type { Note } from "@repo/types";

const API_BASE = "/api/notes";

interface Tag {
  tag: string;
  count: number;
}

type View = "notes" | "settings";

interface NoteStore {
  notes: Note[];
  tags: Tag[];
  selectedNoteId: string | null;
  searchQuery: string;
  selectedTags: string[];
  editOnCreate: boolean;
  saving: boolean;
  archiving: boolean;
  view: View;
  showInfoPanel: boolean;

  setView: (view: View) => void;
  toggleInfoPanel: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedNoteId: (id: string | null) => void;
  toggleTag: (tag: string) => void;
  fetchNotes: () => Promise<void>;
  fetchTags: () => Promise<void>;
  createNote: (title: string) => Promise<void>;
  updateNote: (id: string, updates: Partial<Pick<Note, "title" | "content">>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  tags: [],
  selectedNoteId: null,
  searchQuery: "",
  selectedTags: [],
  editOnCreate: false,
  saving: false,
  archiving: false,
  view: "notes",
  showInfoPanel: true,

  toggleInfoPanel: () => set((s) => ({ showInfoPanel: !s.showInfoPanel })),
  setView: (view) => set({ view, ...(view === "settings" ? { selectedNoteId: null } : {}) }),
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchNotes();
  },
  setSelectedNoteId: (id) => set({ selectedNoteId: id, ...(id ? { view: "notes" } : {}) }),
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

  fetchNotes: async () => {
    const { searchQuery, selectedTags } = get();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    const qs = params.toString();
    const url = qs ? `${API_BASE}?${qs}` : API_BASE;
    const res = await fetch(url);
    const notes: Note[] = await res.json();
    set({ notes });
  },

  createNote: async (title) => {
    set({ saving: true });
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const note: Note = await res.json();
      set({ searchQuery: "", selectedNoteId: note.id, editOnCreate: true });
      await get().fetchNotes();
      get().fetchTags();
    } finally {
      set({ saving: false });
    }
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
        return {
          notes: state.notes.filter((n) => n.id !== id),
          selectedNoteId: next?.id ?? null,
        };
      });
      get().fetchTags();
    } finally {
      set({ archiving: false });
    }
  },
}));

export function useFilteredNotes() {
  const notes = useNoteStore((s) => s.notes);
  return useMemo(() => notes, [notes]);
}

export function useStatusMessage() {
  const saving = useNoteStore((s) => s.saving);
  const archiving = useNoteStore((s) => s.archiving);
  if (archiving) return "Archiving note...";
  if (saving) return "Saving note...";
  return null;
}

export function useSelectedNote() {
  const notes = useNoteStore((s) => s.notes);
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
  return useMemo(
    () => notes.find((n) => n.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );
}
