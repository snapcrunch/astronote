import { useCallback, useEffect, useMemo, useState } from 'react';
import { WebClient } from '@repo/astronote-client/WebClient';
import { useNoteStore } from '../store';

const client = new WebClient();

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const resp = (err as { response?: { data?: Record<string, string> } })
      .response;
    if (resp?.data?.error) return resp.data.error;
    if (resp?.data?.output) return resp.data.output;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

type ClaudeAuthStep =
  | 'idle'
  | 'loading-url'
  | 'awaiting-code'
  | 'submitting'
  | 'success'
  | 'error';

export function useClaudeAuth() {
  const [claudeAuthOpen, setClaudeAuthOpen] = useState(false);
  const [claudeAuthStep, setClaudeAuthStep] = useState<ClaudeAuthStep>('idle');
  const [claudeAuthUrl, setClaudeAuthUrl] = useState('');
  const [claudeAuthCode, setClaudeAuthCode] = useState('');
  const [claudeAuthError, setClaudeAuthError] = useState('');
  const fetchClaudeAuthStatus = useNoteStore((s) => s.fetchClaudeAuthStatus);

  const handleOpenClaudeAuth = useCallback(async () => {
    setClaudeAuthOpen(true);
    setClaudeAuthStep('loading-url');
    setClaudeAuthUrl('');
    setClaudeAuthCode('');
    setClaudeAuthError('');
    try {
      const { url } = await client.startClaudeLogin();
      setClaudeAuthUrl(url);
      setClaudeAuthStep('awaiting-code');
    } catch (err: unknown) {
      setClaudeAuthError(extractErrorMessage(err, 'Failed to start login'));
      setClaudeAuthStep('error');
    }
  }, []);

  const handleClaudeAuthClose = useCallback(() => {
    setClaudeAuthOpen(false);
    setClaudeAuthStep('idle');
  }, []);

  const handleSubmitClaudeCode = useCallback(async () => {
    setClaudeAuthStep('submitting');
    setClaudeAuthError('');
    try {
      await client.submitClaudeAuthCode(claudeAuthCode);
      setClaudeAuthStep('success');
      await fetchClaudeAuthStatus();
    } catch (err: unknown) {
      setClaudeAuthError(extractErrorMessage(err, 'Authentication failed'));
      setClaudeAuthStep('error');
    }
  }, [claudeAuthCode, fetchClaudeAuthStatus]);

  return {
    claudeAuthOpen,
    claudeAuthStep,
    claudeAuthUrl,
    claudeAuthCode,
    claudeAuthError,
    setClaudeAuthCode,
    handleOpenClaudeAuth,
    handleClaudeAuthClose,
    handleSubmitClaudeCode,
  };
}

export function usePaletteKeyboardShortcuts(
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setCollectionPickerOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setClaudeChatOpen: React.Dispatch<React.SetStateAction<boolean>>
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.metaKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setCollectionPickerOpen((prev) => !prev);
      }
      if (e.metaKey && e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        setClaudeChatOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setOpen, setCollectionPickerOpen, setClaudeChatOpen]);
}

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
