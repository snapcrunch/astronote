import { useMemo } from 'react';
import { useNoteStore } from '../store';

export interface Command {
  id: string;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  action: () => void;
}

export function useCommands(
  onClose: () => void,
  onOpenCollectionPicker: () => void,
  onOpenImport: () => void,
  onOpenReset: () => void,
  onOpenClaudeAuth: () => void,
  onOpenClaudePrompt: () => void
): Command[] {
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
  const collections = useNoteStore((s) => s.collections);
  const user = useNoteStore((s) => s.user);
  const claudeAuthenticated = useNoteStore((s) => s.claudeAuthenticated);
  return useMemo(() => {
    const run = (fn: () => void) => () => {
      onClose();
      fn();
    };

    return [
      {
        id: 'focus-search',
        label: 'Focus Search',
        shortcut: '⌘⇧K',
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
        action: () => {
          onClose();
          onOpenCollectionPicker();
        },
      },
      {
        id: 'clear-search',
        label: 'Clear Search',
        action: run(() => {
          useNoteStore.getState().setSearchQuery('');
        }),
      },
      {
        id: 'clear-tags',
        label: 'Clear Tag Filters',
        action: run(() => {
          useNoteStore.setState({ selectedTags: [] });
          useNoteStore.getState().fetchNotes();
        }),
      },
      {
        id: 'import-notes',
        label: 'Import Notes',
        action: () => {
          onClose();
          onOpenImport();
        },
      },
      {
        id: 'export-notes',
        label: 'Export Notes',
        action: run(() => {
          useNoteStore.getState().exportNotes();
        }),
      },
      {
        id: 'manage-collections',
        label: 'Manage Collections',
        action: run(() => {
          useNoteStore.getState().setView('collections');
        }),
      },
      {
        id: 'manage-api-keys',
        label: 'Manage API Keys',
        action: run(() => {
          useNoteStore.getState().setView('keys');
        }),
      },
      {
        id: 'settings',
        label: 'Settings',
        shortcut: '⌘⇧S',
        action: run(() => {
          useNoteStore.getState().setView('settings');
        }),
      },
      {
        id: 'reset-all',
        label: 'Reset All Data',
        action: () => {
          onClose();
          onOpenReset();
        },
      },
      {
        id: 'claude-auth',
        label: 'Authenticate Claude Code',
        disabled: claudeAuthenticated,
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
        action: () => {
          onClose();
          onOpenClaudePrompt();
        },
      },
      {
        id: 'sign-out',
        label: 'Sign Out',
        disabled: !user,
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
