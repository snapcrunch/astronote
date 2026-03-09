import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import InputBase from "@mui/material/InputBase";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { useNoteStore } from "./store";

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  action: () => void;
}

function useCommands(onClose: () => void): Command[] {
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
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
        id: "delete-note",
        label: "Delete Selected Note",
        shortcut: "⌘D",
        disabled: !selectedNoteId,
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
  }, [onClose, selectedNoteId]);
}

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
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

  const filteredRef = useRef(filtered);
  filteredRef.current = filtered;
  const selectedIndexRef = useRef(selectedIndex);
  selectedIndexRef.current = selectedIndex;

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

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      // Use a short timeout to ensure the Dialog has rendered
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const cmds = filteredRef.current;
      const idx = selectedIndexRef.current;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((i) => Math.min(i + 1, cmds.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && cmds[idx] && !cmds[idx].disabled) {
        e.preventDefault();
        cmds[idx].action();
      }
    },
    [],
  );

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
      <InputBase
        inputRef={inputRef}
        fullWidth
        placeholder="Type a command…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
          fontSize: "0.95rem",
        }}
      />
      <List ref={listRef} sx={{ maxHeight: 300, overflow: "auto", py: 0.5 }}>
        {filtered.map((cmd, index) => (
          <ListItemButton
            key={cmd.id}
            selected={index === selectedIndex}
            disabled={cmd.disabled}
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
