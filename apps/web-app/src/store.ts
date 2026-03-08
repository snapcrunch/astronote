import { useMemo } from "react";
import { create } from "zustand";
import type { Note } from "@repo/types";
import seedNotes from "./notes.json";

const initialNotes: Note[] = seedNotes.map((n) => ({
  id: crypto.randomUUID(),
  title: n.title,
  content: n.content,
  createdAt: n.created,
  updatedAt: n.updated,
}));

interface NoteStore {
  notes: Note[];
  selectedNoteId: string | null;
  searchQuery: string;
  sidebarWidth: number;

  setSearchQuery: (query: string) => void;
  setSidebarWidth: (width: number) => void;
  setSelectedNoteId: (id: string | null) => void;
  createNote: (title: string) => void;
  updateNote: (id: string, updates: Partial<Pick<Note, "title" | "content">>) => void;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: initialNotes,
  selectedNoteId: null,
  searchQuery: "",
  sidebarWidth: 350,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSidebarWidth: (width) => set({ sidebarWidth: Math.min(700, Math.max(350, width)) }),
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),

  createNote: (title) => {
    const now = new Date().toISOString();
    const note: Note = {
      id: crypto.randomUUID(),
      title,
      content: "",
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      notes: [note, ...state.notes],
      selectedNoteId: note.id,
      searchQuery: "",
    }));
  },

  updateNote: (id, updates) => {
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id
          ? { ...n, ...updates, updatedAt: new Date().toISOString() }
          : n,
      ),
    }));
  },
}));

export function useFilteredNotes() {
  const notes = useNoteStore((s) => s.notes);
  const searchQuery = useNoteStore((s) => s.searchQuery);
  return useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q),
    );
  }, [notes, searchQuery]);
}

export function useSelectedNote() {
  const notes = useNoteStore((s) => s.notes);
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
  return useMemo(
    () => notes.find((n) => n.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );
}
