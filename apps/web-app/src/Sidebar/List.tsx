import { useCallback, useEffect, useState } from "react";
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

function useIsScrollable(ref: React.RefObject<HTMLElement | null>) {
  const [scrollable, setScrollable] = useState(false);
  const check = useCallback(() => {
    const el = ref.current;
    setScrollable(el ? el.scrollHeight > el.clientHeight : false);
  }, [ref]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, check]);
  return scrollable;
}

function NoteList({ notes, selectedNoteId, localQuery, listRef, onSelectNote, onDeleteNote, onItemKeyDown }: NoteListProps) {
  const isScrollable = useIsScrollable(listRef);
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
            onMouseDown={() => onSelectNote(note.id)}
            onContextMenu={(e) => handleContextMenu(e, note.id)}
            onKeyDown={(e) => onItemKeyDown(e, index)}
            disableRipple
            sx={{
              mx: 0,
              borderRadius: 0,
              py: 0.25,
              px: 2,
              borderBottom: (isScrollable && index === notes.length - 1) ? 0 : 1,
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
              secondary={
                <Box component="span" sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Typography variant="caption" noWrap component="span" sx={{ flexShrink: 0 }}>
                    {formatDate(note.updatedAt)}
                  </Typography>
                  <Typography variant="caption" noWrap component="span" sx={{ flexShrink: 1, minWidth: 0 }}>
                    {note.tags.join(", ")}
                  </Typography>
                </Box>
              }
              primaryTypographyProps={{
                variant: "body2",
                noWrap: true,
                fontWeight: 500,
                sx: { lineHeight: 1.2 },
              }}
              secondaryTypographyProps={{
                component: "div",
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
        slotProps={{
          paper: {
            sx: { minWidth: 100, py: 0.25 },
          },
        }}
      >
        <MenuItem onClick={handleDelete} dense sx={{ py: 0.25, px: 1, minHeight: 0 }}>
          <ListItemIcon sx={{ minWidth: 22 }}>
            <DeleteIcon sx={{ fontSize: 14 }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>Delete</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}

export default NoteList;
