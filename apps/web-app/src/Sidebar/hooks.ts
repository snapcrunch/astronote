import { useCallback, useEffect, useRef, useState } from "react";
import { useNoteStore, useFilteredNotes } from "../store";

export function useOmnibar() {
  const omnibarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    omnibarRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "k") {
        e.preventDefault();
        omnibarRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return omnibarRef;
}

export function useSearch() {
  const setSearchQuery = useNoteStore((s) => s.setSearchQuery);
  const [localQuery, setLocalQuery] = useState(() => useNoteStore.getState().searchQuery);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalQuery(value);
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => setSearchQuery(value), 250);
    },
    [setSearchQuery],
  );

  // Sync local query when store resets it (e.g. after note creation)
  useEffect(() => {
    return useNoteStore.subscribe((state, prev) => {
      if (state.searchQuery !== prev.searchQuery) {
        setLocalQuery(state.searchQuery);
      }
    });
  }, []);

  return { localQuery, handleSearchChange };
}

export function useNoteList(
  omnibarRef: React.RefObject<HTMLInputElement | null>,
  localQuery: string,
) {
  const notes = useFilteredNotes();
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
  const setSelectedNoteId = useNoteStore((s) => s.setSelectedNoteId);
  const createNote = useNoteStore((s) => s.createNote);
  const listRef = useRef<HTMLUListElement>(null);

  const focusNoteAtIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= notes.length) return;
      setSelectedNoteId(notes[index]!.id);
      const items = listRef.current?.querySelectorAll<HTMLElement>('[role="button"]');
      items?.[index]?.focus();
    },
    [notes, setSelectedNoteId],
  );

  const handleOmnibarKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.key === "ArrowDown" || e.key === "ArrowUp") && notes.length > 0) {
        e.preventDefault();
        focusNoteAtIndex(0);
        return;
      }
      if (e.key === "Enter" && localQuery.trim()) {
        const exactMatch = notes.find(
          (n) => n.title.toLowerCase() === localQuery.trim().toLowerCase(),
        );
        if (exactMatch) {
          setSelectedNoteId(exactMatch.id);
        } else {
          createNote(localQuery.trim());
        }
      }
    },
    [localQuery, notes, setSelectedNoteId, createNote, focusNoteAtIndex],
  );

  const handleListItemKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusNoteAtIndex(index + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (index === 0) {
          omnibarRef.current?.focus();
        } else {
          focusNoteAtIndex(index - 1);
        }
      }
    },
    [focusNoteAtIndex, omnibarRef],
  );

  return { notes, selectedNoteId, setSelectedNoteId, listRef, handleOmnibarKeyDown, handleListItemKeyDown };
}
