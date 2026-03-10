import { useMemo } from "react";
import { useNoteStore } from "./store";

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
