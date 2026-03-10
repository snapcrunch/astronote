import { useMemo } from "react";
import { create } from "zustand";
import type { DefaultView } from "@repo/types";
import type { NoteStore } from "./types";
import { parseUrl } from "./util";
import { createActions } from "./actions";

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
  ...createActions({ set, get, initialShowInfoPanel: initialUrl.showInfoPanel }),
}));

export function useFilteredNotes() {
  const notes = useNoteStore((s) => s.notes);
  return useMemo(() => notes, [notes]);
}

export function useStatusMessage() {
  const saving = useNoteStore((s) => s.saving);
  const archiving = useNoteStore((s) => s.archiving);
  const importing = useNoteStore((s) => s.importing);
  if (importing) return "Importing notes...";
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
