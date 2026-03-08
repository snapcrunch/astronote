import { useCallback, useRef } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { useNoteStore } from "./store";

const MIN_WIDTH = 350;
const MAX_WIDTH = 700;

function Sidebar() {
  const sidebarWidth = useNoteStore((s) => s.sidebarWidth);
  const setSidebarWidth = useNoteStore((s) => s.setSidebarWidth);
  const dragging = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;

      const onMouseMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        setSidebarWidth(ev.clientX);
      };

      const onMouseUp = () => {
        dragging.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [setSidebarWidth],
  );

  const notes = useNoteStore((s) => s.getFilteredNotes());
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
  const searchQuery = useNoteStore((s) => s.searchQuery);
  const setSearchQuery = useNoteStore((s) => s.setSearchQuery);
  const setSelectedNoteId = useNoteStore((s) => s.setSelectedNoteId);
  const createNote = useNoteStore((s) => s.createNote);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && searchQuery.trim()) {
        const exactMatch = notes.find(
          (n) => n.title.toLowerCase() === searchQuery.trim().toLowerCase(),
        );
        if (exactMatch) {
          setSelectedNoteId(exactMatch.id);
        } else {
          createNote(searchQuery.trim());
        }
      }
    },
    [searchQuery, notes, setSelectedNoteId, createNote],
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Box
      sx={{
        width: sidebarWidth,
        minWidth: MIN_WIDTH,
        maxWidth: MAX_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.50",
        position: "relative",
      }}
    >
      <Box sx={{ p: 2, pb: 1, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          Astronote
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
          {notes.length} {notes.length === 1 ? "Note" : "Notes"}
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Search or create a note…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "background.paper",
              borderRadius: 2,
            },
          }}
        />
      </Box>
      <List sx={{ flex: 1, overflow: "auto", pt: 0 }}>
        {notes.map((note) => (
          <ListItemButton
            key={note.id}
            selected={note.id === selectedNoteId}
            onClick={() => setSelectedNoteId(note.id)}
            sx={{
              mx: 0,
              borderRadius: 0,
              mb: 0.5,
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": {
                  bgcolor: "primary.dark",
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
        {notes.length === 0 && searchQuery && (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No notes found.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Press Enter to create "{searchQuery}"
            </Typography>
          </Box>
        )}
        {notes.length === 0 && !searchQuery && (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No notes yet. Type in the search bar and press Enter to create one.
            </Typography>
          </Box>
        )}
      </List>
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 4,
          height: "100%",
          cursor: "col-resize",
          bgcolor: "divider",
          "&:hover": {
            bgcolor: "primary.main",
          },
        }}
      />
    </Box>
  );
}

export default Sidebar;
