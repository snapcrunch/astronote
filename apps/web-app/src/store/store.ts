import { useMemo } from 'react';
import { create } from 'zustand';
import type { DefaultView } from '@repo/types';
import type { NoteStore } from './types';
import { parseUrl } from './util';
import { createActions } from './actions';

const initialUrl = parseUrl();

export const useNoteStore = create<NoteStore>((set, get) => ({
  route: 'loading',
  user: null,
  notes: [],
  tags: [],
  collections: [],
  apiKeys: [],
  graphData: { nodes: [], edges: [] },
  graphDataLoaded: false,
  activeCollectionId: null,
  selectedNoteId: initialUrl.selectedNoteId,
  searchQuery: '',
  selectedTags: [],
  settings: {
    default_view: 'renderer' as DefaultView,
    show_info_panel: true,
    theme: 'default' as const,
    intro_dismissed: false,
    backup_mechanism: 'disabled' as const,
    backup_ssh_private_key: '',
    backup_interval: 'daily' as const,
    backup_repo_ssh_url: '',
  },
  settingsLoaded: false,
  claudeAuthenticated: false,
  editOnCreate: false,
  importing: false,
  importedCount: 0,
  saving: false,
  renaming: false,
  tagging: false,
  creatingCollection: false,
  deletingCollection: false,
  archiving: false,
  loadingNotes: false,
  noteContentCache: {},
  loadingNoteContent: false,
  view: initialUrl.view,
  showInfoPanel: initialUrl.showInfoPanel ?? true,
  showGraphFooter: initialUrl.showGraphFooter,
  ...createActions({
    set,
    get,
    initialShowInfoPanel: initialUrl.showInfoPanel,
  }),
}));

export function useFilteredNotes() {
  const notes = useNoteStore((s) => s.notes);
  return useMemo(
    () =>
      [...notes].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }),
    [notes]
  );
}

export function useStatusMessage() {
  const saving = useNoteStore((s) => s.saving);
  const archiving = useNoteStore((s) => s.archiving);
  const importing = useNoteStore((s) => s.importing);
  if (importing) return 'Importing notes...';
  if (archiving) return 'Archiving note...';
  if (saving) return 'Saving note...';
  return null;
}

export function useSelectedNote() {
  const notes = useNoteStore((s) => s.notes);
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
  const contentCache = useNoteStore((s) => s.noteContentCache);
  return useMemo(() => {
    const summary = notes.find((n) => n.id === selectedNoteId);
    if (!summary) return null;
    const content = contentCache[summary.id];
    if (content === undefined) return null;
    return { ...summary, content };
  }, [notes, selectedNoteId, contentCache]);
}
