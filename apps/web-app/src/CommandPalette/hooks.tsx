import { useMemo } from "react";
import { useNoteStore } from "../store";

export interface Command {
  id: string;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  action: () => void;
}

export function useCommands(onClose: () => void, onOpenCollectionPicker: () => void): Command[] {
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
  return useMemo(() => {
    const run = (fn: () => void) => () => {
      onClose();
      fn();
    };

    return [
      {
        id: "focus-search",
        label: "Focus Search",
        shortcut: "⌘⇧K",
        action: run(() => {
          const el = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
          el?.focus();
        }),
      },
      {
        id: "delete-note",
        label: "Delete Selected Note",
        shortcut: "⌘⇧D",
        disabled: !selectedNoteId,
        action: run(() => {
          const { selectedNoteId, deleteNote } = useNoteStore.getState();
          if (selectedNoteId) deleteNote(selectedNoteId);
        }),
      },
      {
        id: "change-collection",
        label: "Change Collection",
        shortcut: "⌘⇧C",
        action: () => {
          onClose();
          onOpenCollectionPicker();
        },
      },
      {
        id: "clear-search",
        label: "Clear Search",
        action: run(() => {
          useNoteStore.getState().setSearchQuery("");
        }),
      },
      {
        id: "clear-tags",
        label: "Clear Tag Filters",
        action: run(() => {
          useNoteStore.setState({ selectedTags: [] });
          useNoteStore.getState().fetchNotes();
        }),
      },
      {
        id: "settings",
        label: "Settings",
        shortcut: "⌘⇧S",
        action: run(() => {
          useNoteStore.getState().setView("settings");
        }),
      },
    ];
  }, [onClose, onOpenCollectionPicker, selectedNoteId]);
}
