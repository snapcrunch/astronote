import { useEffect } from 'react';
import { useSelectedNote } from '../store';

export function useDocumentTitle() {
  const note = useSelectedNote();

  useEffect(() => {
    document.title = note ? `${note.title} — Astronote` : 'Astronote';
    return () => {
      document.title = 'Astronote';
    };
  }, [note]);
}
