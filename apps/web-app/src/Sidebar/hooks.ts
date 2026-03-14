import { useCallback, useEffect, useRef, useState } from 'react';
import { useNoteStore, useFilteredNotes } from '../store';
import { useIsMobile } from '../hooks';
import { omnibarRef, omnibarKeyDownHandler } from './refs';

export function useOmnibar(onRenameSelectedNote?: () => void) {
  const isMobile = useIsMobile();
  const onRenameSelectedNoteRef = useRef(onRenameSelectedNote);
  onRenameSelectedNoteRef.current = onRenameSelectedNote;

  useEffect(() => {
    if (!isMobile) omnibarRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.key === 'k') {
        e.preventDefault();
        omnibarRef.current?.focus();
        omnibarRef.current?.select();
      }
      if (e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        const { view, setView } = useNoteStore.getState();
        if (view !== 'settings') setView('settings');
      }
      if (e.metaKey && e.shiftKey && e.key === 'd') {
        e.preventDefault();
        const { selectedNoteId, deleteNote } = useNoteStore.getState();
        if (selectedNoteId) deleteNote(selectedNoteId);
      }
      if (e.metaKey && e.shiftKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        const { selectedNoteId } = useNoteStore.getState();
        if (selectedNoteId) onRenameSelectedNoteRef.current?.();
      }
      if (
        (e.key === 'ArrowDown' || e.key === 'ArrowUp') &&
        (!document.activeElement || document.activeElement === document.body)
      ) {
        e.preventDefault();
        const { notes, selectedNoteId, setSelectedNoteId } =
          useNoteStore.getState();
        if (notes.length === 0) return;
        if (!selectedNoteId) {
          setSelectedNoteId(notes[0]!.id);
          return;
        }
        const currentIndex = notes.findIndex((n) => n.id === selectedNoteId);
        if (e.key === 'ArrowDown' && currentIndex < notes.length - 1) {
          setSelectedNoteId(notes[currentIndex + 1]!.id);
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
          setSelectedNoteId(notes[currentIndex - 1]!.id);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return omnibarRef;
}

export function useSearch() {
  const setSearchQuery = useNoteStore((s) => s.setSearchQuery);
  const [localQuery, setLocalQuery] = useState(
    () => useNoteStore.getState().searchQuery
  );
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalQuery(value);
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => setSearchQuery(value), 250);
    },
    [setSearchQuery]
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

export function useNoteList() {
  const notes = useFilteredNotes();
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
  const setSelectedNoteId = useNoteStore((s) => s.setSelectedNoteId);
  const createNote = useNoteStore((s) => s.createNote);
  const listRef = useRef<HTMLUListElement>(null);

  const focusNoteAtIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= notes.length) return;
      setSelectedNoteId(notes[index]!.id);
      const items =
        listRef.current?.querySelectorAll<HTMLElement>('[role="button"]');
      items?.[index]?.focus();
    },
    [notes, setSelectedNoteId]
  );

  const handleOmnibarKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && notes.length > 0) {
        e.preventDefault();
        focusNoteAtIndex(0);
        return;
      }
      if (e.key === 'Enter') {
        const query = (e.target as HTMLInputElement).value.trim();
        if (!query) return;
        const exactMatch = notes.find(
          (n) => n.title.toLowerCase() === query.toLowerCase()
        );
        if (exactMatch) {
          setSelectedNoteId(exactMatch.id);
        } else {
          createNote(query);
        }
      }
    },
    [notes, setSelectedNoteId, createNote, focusNoteAtIndex]
  );

  // Keep the shared handler in sync so Omnibar can delegate to it
  useEffect(() => {
    omnibarKeyDownHandler.current = handleOmnibarKeyDown;
    return () => {
      omnibarKeyDownHandler.current = null;
    };
  }, [handleOmnibarKeyDown]);

  const handleListItemKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusNoteAtIndex(index + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (index === 0) {
          omnibarRef.current?.focus();
        } else {
          focusNoteAtIndex(index - 1);
        }
      }
    },
    [focusNoteAtIndex]
  );

  return {
    notes,
    selectedNoteId,
    setSelectedNoteId,
    listRef,
    handleListItemKeyDown,
  };
}
