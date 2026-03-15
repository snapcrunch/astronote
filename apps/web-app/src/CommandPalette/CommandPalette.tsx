import { useCallback, useEffect, useMemo, useState } from 'react';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { WebClient } from '@repo/astronote-client/WebClient';
import { useNoteStore } from '../store';
import { ImportDropZone } from '../SettingsView/ImportSection';
import { useCommands } from './hooks';
import PaletteDialog from './PaletteDialog';
import ClaudeChatDialog from './ClaudeChatDialog';

const client = new WebClient();

type ClaudeAuthStep = "idle" | "loading-url" | "awaiting-code" | "submitting" | "success" | "error";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [collectionPickerOpen, setCollectionPickerOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [claudeAuthOpen, setClaudeAuthOpen] = useState(false);
  const [claudeAuthStep, setClaudeAuthStep] = useState<ClaudeAuthStep>("idle");
  const [claudeAuthUrl, setClaudeAuthUrl] = useState("");
  const [claudeAuthCode, setClaudeAuthCode] = useState("");
  const [claudeAuthError, setClaudeAuthError] = useState("");
  const [claudeChatOpen, setClaudeChatOpen] = useState(false);
  const resetAll = useNoteStore((s) => s.resetAll);
  const fetchClaudeAuthStatus = useNoteStore((s) => s.fetchClaudeAuthStatus);
  const collections = useNoteStore((s) => s.collections);
  const activeCollectionId = useNoteStore((s) => s.activeCollectionId);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpenCollectionPicker = useCallback(() => {
    setCollectionPickerOpen(true);
  }, []);

  const handleOpenImport = useCallback(() => {
    setImportOpen(true);
  }, []);

  const handleOpenReset = useCallback(() => {
    setResetOpen(true);
  }, []);

  const handleConfirmReset = useCallback(async () => {
    setResetOpen(false);
    await resetAll();
  }, [resetAll]);

  const handleOpenClaudeAuth = useCallback(async () => {
    setClaudeAuthOpen(true);
    setClaudeAuthStep("loading-url");
    setClaudeAuthUrl("");
    setClaudeAuthCode("");
    setClaudeAuthError("");
    try {
      const { url } = await client.startClaudeLogin();
      setClaudeAuthUrl(url);
      setClaudeAuthStep("awaiting-code");
    } catch (err: any) {
      setClaudeAuthError(err?.response?.data?.error ?? err.message ?? "Failed to start login");
      setClaudeAuthStep("error");
    }
  }, []);

  const handleClaudeAuthClose = useCallback(() => {
    setClaudeAuthOpen(false);
    setClaudeAuthStep("idle");
  }, []);

  const handleSubmitClaudeCode = useCallback(async () => {
    setClaudeAuthStep("submitting");
    setClaudeAuthError("");
    try {
      await client.submitClaudeAuthCode(claudeAuthCode);
      setClaudeAuthStep("success");
      await fetchClaudeAuthStatus();
    } catch (err: any) {
      setClaudeAuthError(err?.response?.data?.error ?? err?.response?.data?.output ?? err.message ?? "Authentication failed");
      setClaudeAuthStep("error");
    }
  }, [claudeAuthCode, fetchClaudeAuthStatus]);

  const handleOpenClaudeChat = useCallback(() => {
    setClaudeChatOpen(true);
  }, []);

  const commands = useCommands(
    handleClose,
    handleOpenCollectionPicker,
    handleOpenImport,
    handleOpenReset,
    handleOpenClaudeAuth,
    handleOpenClaudeChat
  );

  const commandItems = useMemo(
    () =>
      commands.map((c) => ({
        id: c.id,
        label: c.label,
        disabled: c.disabled,
        shortcut: c.shortcut,
        action: c.action,
      })),
    [commands]
  );

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
      if (e.metaKey && e.shiftKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        setClaudeChatOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const collectionItems = useMemo(
    () => collections.map((c) => ({ id: c.id, label: c.name })),
    [collections]
  );

  const handleSelectCommand = useCallback(
    (item: { id: string | number }) => {
      const cmd = commands.find((c) => c.id === item.id);
      cmd?.action();
    },
    [commands]
  );

  const handleSelectCollection = useCallback(
    (item: { id: string | number }) => {
      setCollectionPickerOpen(false);
      useNoteStore.getState().setActiveCollectionId(item.id as number);
    },
    []
  );

  return (
    <>
      <PaletteDialog
        open={open}
        onClose={handleClose}
        placeholder="Type a command…"
        items={commandItems}
        onSelect={handleSelectCommand}
        renderItem={(item) => {
          const cmd = commandItems.find((c) => c.id === item.id);
          return (
            <>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.9rem' }}
              />
              {cmd?.shortcut && (
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: 'grey.200',
                    color: 'text.secondary',
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cmd.shortcut}
                </Typography>
              )}
            </>
          );
        }}
      />
      <PaletteDialog
        open={collectionPickerOpen}
        onClose={() => setCollectionPickerOpen(false)}
        placeholder="Select a collection…"
        items={collectionItems}
        onSelect={handleSelectCollection}
        renderItem={(item) => (
          <>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: '0.9rem' }}
            />
            {item.id === activeCollectionId && (
              <Typography
                variant="caption"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 0.5,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                Active
              </Typography>
            )}
          </>
        )}
      />
      <Dialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import Notes</DialogTitle>
        <DialogContent>
          <ImportDropZone />
        </DialogContent>
      </Dialog>
      <Dialog open={resetOpen} onClose={() => setResetOpen(false)}>
        <DialogTitle>Reset All Data</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete all notes, collections, and tags, and
            revert all settings to their default values. This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmReset} color="error">
            Reset
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={claudeAuthOpen} onClose={handleClaudeAuthClose} maxWidth="sm" fullWidth>
        <DialogTitle>Authenticate Claude Code</DialogTitle>
        <DialogContent>
          {claudeAuthStep === "loading-url" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
              <CircularProgress size={20} />
              <Typography>Starting authentication flow...</Typography>
            </Box>
          )}
          {claudeAuthStep === "awaiting-code" && (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Open the following URL in your browser to authenticate, then enter the code you receive below.
              </DialogContentText>
              <Link href={claudeAuthUrl} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: "break-all", display: "block", mb: 2 }}>
                {claudeAuthUrl}
              </Link>
              <TextField
                autoFocus
                fullWidth
                label="Authentication Code"
                value={claudeAuthCode}
                onChange={(e) => setClaudeAuthCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && claudeAuthCode.trim()) {
                    handleSubmitClaudeCode();
                  }
                }}
              />
            </>
          )}
          {claudeAuthStep === "submitting" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
              <CircularProgress size={20} />
              <Typography>Authenticating...</Typography>
            </Box>
          )}
          {claudeAuthStep === "success" && (
            <Alert severity="success">Claude Code authenticated successfully.</Alert>
          )}
          {claudeAuthStep === "error" && (
            <Alert severity="error" sx={{ mb: 1 }}>{claudeAuthError}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          {claudeAuthStep === "awaiting-code" && (
            <Button onClick={handleSubmitClaudeCode} disabled={!claudeAuthCode.trim()}>Submit</Button>
          )}
          <Button onClick={handleClaudeAuthClose}>
            {claudeAuthStep === "success" ? "Done" : "Cancel"}
          </Button>
        </DialogActions>
      </Dialog>
      <ClaudeChatDialog
        open={claudeChatOpen}
        onClose={() => setClaudeChatOpen(false)}
      />
    </>
  );
}
