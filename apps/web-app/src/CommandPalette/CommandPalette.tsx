import { useCallback, useEffect, useMemo, useState } from "react";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { useNoteStore } from "../store";
import { ImportDropZone } from "../SettingsView/ImportSection";
import { useCommands } from "./hooks";
import PaletteDialog from "./PaletteDialog";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [collectionPickerOpen, setCollectionPickerOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const resetAll = useNoteStore((s) => s.resetAll);
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

  const commands = useCommands(handleClose, handleOpenCollectionPicker, handleOpenImport, handleOpenReset);

  const commandItems = useMemo(
    () => commands.map((c) => ({ id: c.id, label: c.label, disabled: c.disabled, shortcut: c.shortcut, action: c.action })),
    [commands],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.key === "p") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.metaKey && e.shiftKey && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        setCollectionPickerOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const collectionItems = useMemo(
    () => collections.map((c) => ({ id: c.id, label: c.name })),
    [collections],
  );

  const handleSelectCommand = useCallback(
    (item: { id: string | number }) => {
      const cmd = commands.find((c) => c.id === item.id);
      cmd?.action();
    },
    [commands],
  );

  const handleSelectCollection = useCallback(
    (item: { id: string | number }) => {
      setCollectionPickerOpen(false);
      useNoteStore.getState().setActiveCollectionId(item.id as number);
    },
    [],
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
                primaryTypographyProps={{ fontSize: "0.9rem" }}
              />
              {cmd?.shortcut && (
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: "grey.200",
                    color: "text.secondary",
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
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
              primaryTypographyProps={{ fontSize: "0.9rem" }}
            />
            {item.id === activeCollectionId && (
              <Typography
                variant="caption"
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 0.5,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                Active
              </Typography>
            )}
          </>
        )}
      />
      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="sm" fullWidth>
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
          <Button onClick={handleConfirmReset} color="error">Reset</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
