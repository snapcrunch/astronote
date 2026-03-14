import { useState, useEffect, useRef, useCallback } from 'react';
import { useNoteStore } from '../store';

type UpdateNoteFn = ReturnType<typeof useNoteStore.getState>['updateNote'];

export function useDebouncedNoteUpdate(updateNote: UpdateNoteFn) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const pendingUpdate = useRef<{
    id: string;
    updates: Parameters<UpdateNoteFn>[1];
  } | null>(null);

  const debouncedUpdateNote = useCallback(
    (id: string, updates: Parameters<UpdateNoteFn>[1]) => {
      pendingUpdate.current = { id, updates };
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        pendingUpdate.current = null;
        updateNote(id, updates);
      }, 500);
    },
    [updateNote]
  );

  const flushPendingUpdate = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    if (pendingUpdate.current) {
      const { id, updates } = pendingUpdate.current;
      pendingUpdate.current = null;
      updateNote(id, updates);
    }
  }, [updateNote]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return { debouncedUpdateNote, flushPendingUpdate };
}

export function useEditingState(noteId: string | undefined) {
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const { editOnCreate, settings } = useNoteStore.getState();
    if (editOnCreate) {
      setEditing(true);
      useNoteStore.setState({ editOnCreate: false });
    } else {
      setEditing(settings.default_view === 'editor');
    }
  }, [noteId]);

  return { editing, setEditing };
}
