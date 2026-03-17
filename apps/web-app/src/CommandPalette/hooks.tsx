import { useMemo } from 'react';
import { useNoteStore } from '../store';

export type Platform = 'desktop' | 'mobile';

export interface Command {
  id: string;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  platforms: Platform[];
  action: () => void;
}

export function useCommands(callbacks: {
  onClose: () => void;
  onOpenCollectionPicker: () => void;
  onOpenImport: () => void;
  onOpenReset: () => void;
  onOpenClaudeAuth: () => void;
  onOpenClaudePrompt: () => void;
}): Command[] {
  const {
    onClose,
    onOpenCollectionPicker,
    onOpenImport,
    onOpenReset,
    onOpenClaudeAuth,
    onOpenClaudePrompt,
  } = callbacks;
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
  const collections = useNoteStore((s) => s.collections);
  const user = useNoteStore((s) => s.user);
  const claudeAuthenticated = useNoteStore((s) => s.claudeAuthenticated);
  return useMemo(() => {
    const run = (fn: () => void) => () => {
      onClose();
      fn();
    };

    const both: Platform[] = ['desktop', 'mobile'];

    return [
      {
        id: 'focus-search',
        label: 'Focus Search',
        shortcut: '⌘⇧K',
        platforms: ['desktop'],
        action: run(() => {
          const el = document.querySelector<HTMLInputElement>(
            'input[placeholder*="Search"]'
          );
          el?.focus();
        }),
      },
      {
        id: 'delete-note',
        label: 'Delete Selected Note',
        shortcut: '⌘⇧D',
        disabled: !selectedNoteId,
        platforms: ['desktop'],
        action: run(() => {
          const { selectedNoteId, deleteNote } = useNoteStore.getState();
          if (selectedNoteId) deleteNote(selectedNoteId);
        }),
      },
      {
        id: 'change-collection',
        label: 'Change Collection',
        shortcut: '⌘⇧C',
        disabled: collections.length <= 1,
        platforms: both,
        action: () => {
          onClose();
          onOpenCollectionPicker();
        },
      },
      {
        id: 'clear-search',
        label: 'Clear Search',
        platforms: both,
        action: run(() => {
          useNoteStore.getState().setSearchQuery('');
        }),
      },
      {
        id: 'clear-tags',
        label: 'Clear Tag Filters',
        platforms: both,
        action: run(() => {
          useNoteStore.setState({ selectedTags: [] });
          useNoteStore.getState().fetchNotes();
        }),
      },
      {
        id: 'import-notes',
        label: 'Import Notes',
        platforms: both,
        action: () => {
          onClose();
          onOpenImport();
        },
      },
      {
        id: 'export-notes',
        label: 'Export Notes',
        platforms: both,
        action: run(() => {
          useNoteStore.getState().exportNotes();
        }),
      },
      {
        id: 'manage-collections',
        label: 'Manage Collections',
        platforms: both,
        action: run(() => {
          useNoteStore.getState().setView('collections');
        }),
      },
      {
        id: 'manage-api-keys',
        label: 'Manage API Keys',
        platforms: both,
        action: run(() => {
          useNoteStore.getState().setView('keys');
        }),
      },
      {
        id: 'settings',
        label: 'Manage Settings',
        shortcut: '⌘⇧S',
        platforms: both,
        action: run(() => {
          useNoteStore.getState().setView('settings');
        }),
      },
      {
        id: 'reset-all',
        label: 'Reset All Data',
        platforms: both,
        action: () => {
          onClose();
          onOpenReset();
        },
      },
      {
        id: 'claude-auth',
        label: 'Authenticate Claude Code',
        disabled: claudeAuthenticated,
        platforms: both,
        action: () => {
          onClose();
          onOpenClaudeAuth();
        },
      },
      {
        id: 'claude-prompt',
        label: 'Ask Claude',
        shortcut: '⌘⇧Z',
        disabled: !claudeAuthenticated,
        platforms: both,
        action: () => {
          onClose();
          onOpenClaudePrompt();
        },
      },
      {
        id: 'sign-out',
        label: 'Sign Out',
        disabled: !user,
        platforms: both,
        action: run(() => {
          useNoteStore.getState().signOut();
        }),
      },
    ];
  }, [
    onClose,
    onOpenCollectionPicker,
    onOpenImport,
    onOpenReset,
    onOpenClaudeAuth,
    onOpenClaudePrompt,
    selectedNoteId,
    collections,
    claudeAuthenticated,
    user,
  ]);
}
