import { useMemo } from "react";
import { create } from "zustand";
import type { Note } from "@repo/types";

const API_BASE = "/api/notes";

interface NoteStore {
  notes: Note[];
  selectedNoteId: string | null;
  searchQuery: string;
  editOnCreate: boolean;

  setSearchQuery: (query: string) => void;
  setSelectedNoteId: (id: string | null) => void;
  fetchNotes: () => Promise<void>;
  createNote: (title: string) => Promise<void>;
  updateNote: (id: string, updates: Partial<Pick<Note, "title" | "content">>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  selectedNoteId: null,
  searchQuery: "",
  editOnCreate: false,

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchNotes();
  },
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),

  fetchNotes: async () => {
    const query = get().searchQuery;
    const url = query ? `${API_BASE}?q=${encodeURIComponent(query)}` : API_BASE;
    const res = await fetch(url);
    const notes: Note[] = await res.json();
    set({ notes });
  },

  createNote: async (title) => {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const note: Note = await res.json();
    set({ searchQuery: "", selectedNoteId: note.id, editOnCreate: true });
    await get().fetchNotes();
  },

  updateNote: async (id, updates) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const updated: Note = await res.json();
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updated : n)),
    }));
  },

  deleteNote: async (id) => {
    await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
    }));
  },
}));

export function useFilteredNotes() {
  const notes = useNoteStore((s) => s.notes);
  return useMemo(() => notes, [notes]);
}

export function useSelectedNote() {
  const notes = useNoteStore((s) => s.notes);
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
  return useMemo(
    () => notes.find((n) => n.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );
}
