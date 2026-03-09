import { useCallback, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { useNoteStore, useFilteredNotes } from "./store";

const SIDEBAR_WIDTH = 475;

function Sidebar() {
  const omnibarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "k") {
        e.preventDefault();
        omnibarRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const notes = useFilteredNotes();
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
  const searchQuery = useNoteStore((s) => s.searchQuery);
  const setSearchQuery = useNoteStore((s) => s.setSearchQuery);
  const setSelectedNoteId = useNoteStore((s) => s.setSelectedNoteId);
  const createNote = useNoteStore((s) => s.createNote);

  const listRef = useRef<HTMLUListElement>(null);

  const focusNoteAtIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= notes.length) return;
      setSelectedNoteId(notes[index]!.id);
      const items = listRef.current?.querySelectorAll<HTMLElement>('[role="button"]');
      items?.[index]?.focus();
    },
    [notes, setSelectedNoteId],
  );

  const handleOmnibarKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.key === "ArrowDown" || e.key === "ArrowUp") && notes.length > 0) {
        e.preventDefault();
        focusNoteAtIndex(0);
        return;
      }
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
    [searchQuery, notes, setSelectedNoteId, createNote, focusNoteAtIndex],
  );

  const handleListItemKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusNoteAtIndex(index + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (index === 0) {
          omnibarRef.current?.focus();
        } else {
          focusNoteAtIndex(index - 1);
        }
      }
    },
    [focusNoteAtIndex],
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
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.50",
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <TextField
          inputRef={omnibarRef}
          fullWidth
          size="small"
          placeholder="Search or create a note…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleOmnibarKeyDown}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
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
                    ⌘K
                  </Typography>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "background.paper",
              borderRadius: 0,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          }}
        />
      </Box>
      <List ref={listRef} sx={{ flex: 1, overflow: "auto", pt: 0 }} disablePadding>
        {notes.map((note, index) => (
          <ListItemButton
            key={note.id}
            selected={note.id === selectedNoteId}
            onClick={() => setSelectedNoteId(note.id)}
            onKeyDown={(e) => handleListItemKeyDown(e, index)}
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
      <Box sx={{ borderTop: 1, borderColor: "divider", px: 2, py: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {notes.length} {notes.length === 1 ? "Note" : "Notes"}
        </Typography>
      </Box>
    </Box>
  );
}

export default Sidebar;
