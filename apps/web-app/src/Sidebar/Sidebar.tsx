import { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useNoteStore, useStatusMessage } from "../store";
import { useIsMobile } from "../hooks";
import { useOmnibar, useNoteList } from "./hooks";
import Omnibar from "./Omnibar";
import NoteList from "./List";
import Tags from "./Tags";
import RenameDialog from "./RenameDialog";

const SIDEBAR_WIDTH = 475;

function Sidebar() {
  const isMobile = useIsMobile();
  const [renameDialog, setRenameDialog] = useState<{ noteId: string; title: string } | null>(null);
  const updateNote = useNoteStore((s) => s.updateNote);

  const handleRenameSelectedNote = useCallback(() => {
    const { selectedNoteId, notes } = useNoteStore.getState();
    if (!selectedNoteId) return;
    const note = notes.find((n) => n.id === selectedNoteId);
    if (!note) return;
    setRenameDialog({ noteId: note.id, title: note.title });
  }, []);

  useOmnibar(handleRenameSelectedNote);
  const { notes, selectedNoteId, setSelectedNoteId, listRef, handleListItemKeyDown } = useNoteList();
  const collections = useNoteStore((s) => s.collections);
  const activeCollectionId = useNoteStore((s) => s.activeCollectionId);
  const setActiveCollectionId = useNoteStore((s) => s.setActiveCollectionId);
  const deleteNote = useNoteStore((s) => s.deleteNote);
  const statusMessage = useStatusMessage();

  return (
    <Box
      sx={{
        width: isMobile ? "100%" : SIDEBAR_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.50",
        userSelect: "none",
        borderRight: isMobile ? 0 : 1,
        borderColor: "divider",
      }}
    >
      {isMobile && <Omnibar />}
      {collections.length > 1 && (
        <Box sx={{ borderBottom: 1, borderColor: "divider", height: 40, minHeight: 40, boxSizing: "content-box", display: "flex", alignItems: "center" }}>
          <Select
            value={activeCollectionId ?? ""}
            onChange={(e) => setActiveCollectionId(e.target.value as number)}
            size="small"
            fullWidth
            sx={{
              fontSize: "0.85rem",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              bgcolor: "background.paper",
            }}
          >
            {collections.map((c) => (
              <MenuItem key={c.id} value={c.id} sx={{ fontSize: "0.85rem" }}>
                Collection: {c.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}
      <NoteList
        notes={notes}
        selectedNoteId={selectedNoteId}
        listRef={listRef}
        onSelectNote={(id) => setSelectedNoteId(selectedNoteId === id ? null : id)}
        onDeleteNote={deleteNote}
        onItemKeyDown={handleListItemKeyDown}
        onRenameNote={(noteId, title) => setRenameDialog({ noteId, title })}
      />
      <Tags />
      <Box sx={{ borderTop: 1, borderColor: "divider", px: 2, py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="caption" color="text.secondary">
          {notes.length} {notes.length === 1 ? "Note" : "Notes"}
        </Typography>
        {statusMessage && (
          <Typography variant="caption" color="text.secondary">
            {statusMessage}
          </Typography>
        )}
      </Box>
      <RenameDialog
        open={renameDialog !== null}
        currentTitle={renameDialog?.title ?? ""}
        onConfirm={(newTitle) => {
          if (renameDialog) updateNote(renameDialog.noteId, { title: newTitle });
          setRenameDialog(null);
        }}
        onClose={() => setRenameDialog(null)}
      />
    </Box>
  );
}

export default Sidebar;
