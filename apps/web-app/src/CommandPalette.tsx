import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { useNoteStore } from "./store";

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
}

function useCommands(onClose: () => void): Command[] {
  return useMemo(() => {
    const run = (fn: () => void) => () => {
      onClose();
      fn();
    };

    return [
      {
        id: "focus-search",
        label: "Focus Search",
        shortcut: "⌘K",
        action: run(() => {
          const el = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
          el?.focus();
        }),
      },
      {
        id: "new-note",
        label: "New Note",
        action: run(() => {
          const title = prompt("Note title:");
          if (title?.trim()) useNoteStore.getState().createNote(title.trim());
        }),
      },
      {
        id: "delete-note",
        label: "Delete Selected Note",
        shortcut: "⌘D",
        action: run(() => {
          const { selectedNoteId, deleteNote } = useNoteStore.getState();
          if (selectedNoteId) deleteNote(selectedNoteId);
        }),
      },
      {
        id: "clear-search",
        label: "Clear Search",
        action: run(() => {
          useNoteStore.getState().setSearchQuery("");
        }),
      },
      {
        id: "clear-tags",
        label: "Clear Tag Filters",
        action: run(() => {
          useNoteStore.setState({ selectedTags: [] });
          useNoteStore.getState().fetchNotes();
        }),
      },
    ];
  }, [onClose]);
}

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const commands = useCommands(handleClose);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.key === "p") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    }
  };

  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            position: "fixed",
            top: "20%",
            m: 0,
            borderRadius: 2,
            overflow: "hidden",
          },
        },
      }}
    >
      <TextField
        autoFocus
        fullWidth
        placeholder="Type a command…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 0,
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
            borderBottom: 1,
            borderColor: "divider",
          },
        }}
      />
      <List ref={listRef} sx={{ maxHeight: 300, overflow: "auto", py: 0.5 }}>
        {filtered.map((cmd, index) => (
          <ListItemButton
            key={cmd.id}
            selected={index === selectedIndex}
            onClick={() => cmd.action()}
            onMouseEnter={() => setSelectedIndex(index)}
            sx={{ px: 2, py: 0.75 }}
          >
            <ListItemText
              primary={cmd.label}
              primaryTypographyProps={{ fontSize: "0.9rem" }}
            />
            {cmd.shortcut && (
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
          </ListItemButton>
        ))}
        {filtered.length === 0 && (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No commands found.
            </Typography>
          </Box>
        )}
      </List>
    </Dialog>
  );
}

export default CommandPalette;
