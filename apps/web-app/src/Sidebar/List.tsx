import { useState } from "react";
import Box from "@mui/material/Box";
import MuiList from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Note } from "@repo/types";
interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  localQuery: string;
  listRef: React.RefObject<HTMLUListElement | null>;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onItemKeyDown: (e: React.KeyboardEvent, index: number) => void;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function NoteList({ notes, selectedNoteId, localQuery, listRef, onSelectNote, onDeleteNote, onItemKeyDown }: NoteListProps) {
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; noteId: string } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, noteId });
  };

  const handleClose = () => setContextMenu(null);

  const handleDelete = () => {
    if (contextMenu) {
      onDeleteNote(contextMenu.noteId);
    }
    handleClose();
  };

  return (
    <>
      <MuiList ref={listRef} sx={{ flex: 1, overflow: "auto", pt: 0 }} disablePadding>
        {notes.map((note, index) => (
          <ListItemButton
            key={note.id}
            selected={note.id === selectedNoteId}
            onClick={() => onSelectNote(note.id)}
            onContextMenu={(e) => handleContextMenu(e, note.id)}
            onKeyDown={(e) => onItemKeyDown(e, index)}
            sx={{
              mx: 0,
              borderRadius: 0,
              py: 0.5,
              px: 2,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: index % 2 === 0 ? "background.paper" : "grey.50",
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                "&.Mui-focusVisible": {
                  bgcolor: "primary.main",
                },
                "& .MuiListItemText-secondary": {
                  color: "primary.contrastText",
                  opacity: 0.7,
                },
              },
            }}
          >
            <ListItemText
              primary={note.title}
              secondary={formatDate(note.updatedAt)}
              primaryTypographyProps={{
                noWrap: true,
                fontWeight: 500,
              }}
              secondaryTypographyProps={{
                variant: "caption",
                noWrap: true,
              }}
            />
          </ListItemButton>
        ))}
        {notes.length === 0 && localQuery && (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No notes found.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Press Enter to create "{localQuery}"
            </Typography>
          </Box>
        )}
        {notes.length === 0 && !localQuery && (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No notes yet. Type in the search bar and press Enter to create one.
            </Typography>
          </Box>
        )}
      </MuiList>
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
        }
      >
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export default NoteList;
