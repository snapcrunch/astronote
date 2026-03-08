import { useCallback } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import type { Note } from "@repo/types";

const SIDEBAR_WIDTH = 320;

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectNote: (id: string) => void;
  onCreateNote: (title: string) => void;
}

function Sidebar({
  notes,
  selectedNoteId,
  searchQuery,
  onSearchChange,
  onSelectNote,
  onCreateNote,
}: SidebarProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && searchQuery.trim()) {
        const exactMatch = notes.find(
          (n) => n.title.toLowerCase() === searchQuery.trim().toLowerCase(),
        );
        if (exactMatch) {
          onSelectNote(exactMatch.id);
        } else {
          onCreateNote(searchQuery.trim());
        }
      }
    },
    [searchQuery, notes, onSelectNote, onCreateNote],
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
        width: SIDEBAR_WIDTH,
        minWidth: SIDEBAR_WIDTH,
        height: "100%",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.50",
      }}
    >
      <Box sx={{ p: 2, pb: 1 }}>
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
          onChange={(e) => onSearchChange(e.target.value)}
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
            onClick={() => onSelectNote(note.id)}
            sx={{
              mx: 1,
              borderRadius: 2,
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
    </Box>
  );
}

export default Sidebar;
