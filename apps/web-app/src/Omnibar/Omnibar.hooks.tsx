import { useCallback, useEffect, useRef, useState } from 'react';
import { useNoteStore } from '../store';

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
