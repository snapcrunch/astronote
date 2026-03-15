import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputBase from '@mui/material/InputBase';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { WebClient } from '@repo/astronote-client/WebClient';
import { useNoteStore, useSelectedNote } from '../store';

const client = new WebClient();

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

type ChatStatus = 'idle' | 'streaming' | 'error';

interface ClaudeChatDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ClaudeChatDialog({ open, onClose }: ClaudeChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const selectedNote = useSelectedNote();
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll during streaming
  useEffect(() => {
    if (status === 'streaming' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSubmit = useCallback(() => {
    const prompt = input.trim();
    if (!prompt || status === 'streaming') return;

    setInput('');
    setStatus('streaming');
    setError('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: prompt },
      { role: 'assistant', text: '' },
    ]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    client.streamClaudePrompt(
      prompt,
      (text) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = { ...last, text: last.text + text };
          }
          return updated;
        });
      },
      (sid) => {
        setStatus('idle');
        if (sid) setSessionId(sid);
        setTimeout(() => inputRef.current?.focus(), 50);
        const s = useNoteStore.getState();
        s.fetchNotes();
        s.fetchTags();
        s.fetchCollections();
        s.fetchSettings();
      },
      (message) => {
        setStatus('error');
        setError(message);
      },
      controller.signal,
      sessionId ?? undefined,
      !sessionId ? selectedNote?.title : undefined,
    );
  }, [input, status, sessionId, selectedNote]);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    setStatus('idle');
  }, []);

  const handleNewChat = useCallback(() => {
    if (status === 'streaming') {
      abortControllerRef.current?.abort();
    }
    setMessages([]);
    setInput('');
    setStatus('idle');
    setError('');
    setSessionId(null);
    abortControllerRef.current = null;
  }, [status]);

  const handleClose = useCallback(() => {
    if (status === 'streaming') {
      abortControllerRef.current?.abort();
      setStatus('idle');
    }
    onClose();
  }, [status, onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>Claude</DialogTitle>
      <DialogContent
        ref={scrollRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          maxHeight: '60vh',
          overflowY: 'auto',
          '&&': { pt: 1.5 },
          pb: 1.5,
        }}
      >
        {messages.length === 0 && status === 'idle' && (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            Ask Claude anything about your notes.
          </Typography>
        )}
        {messages.map((msg, i) =>
          msg.text ? (
            <Box
              key={i}
              sx={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                px: 1.5,
                py: 1,
                borderRadius: 2,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '0.9rem',
              }}
            >
              {msg.text}
            </Box>
          ) : null
        )}
        {status === 'streaming' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <CircularProgress size={16} />
          </Box>
        )}
        {status === 'error' && (
          <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>
        )}
      </DialogContent>
      <Box sx={{ px: 3, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
        <InputBase
          inputRef={inputRef}
          fullWidth
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={status === 'streaming'}
          sx={{ fontSize: '0.9rem' }}
        />
      </Box>
      <DialogActions>
        {status === 'streaming' && (
          <Button onClick={handleStop}>Stop</Button>
        )}
        {messages.length > 0 && status !== 'streaming' && (
          <Button onClick={handleNewChat}>New Chat</Button>
        )}
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
