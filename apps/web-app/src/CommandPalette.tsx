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

function useCommands(onClose: () => void, onOpenCollectionPicker: () => void): Command[] {
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
        id: "change-collection",
        label: "Change Collection",
        shortcut: "⌘⇧C",
        action: () => {
          onClose();
          onOpenCollectionPicker();
        },
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
      {
        id: "settings",
        label: "Settings",
        action: run(() => {
          useNoteStore.getState().setView("settings");
        }),
      },
    ];
  }, [onClose, onOpenCollectionPicker, selectedNoteId]);
}

function PaletteDialog({
  open,
  onClose,
  placeholder,
  items,
  renderItem,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  placeholder: string;
  items: { id: string | number; label: string; disabled?: boolean }[];
  renderItem?: (item: { id: string | number; label: string; disabled?: boolean }, selected: boolean) => React.ReactNode;
  onSelect: (item: { id: string | number; label: string }) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  const filteredRef = useRef(filtered);
  filteredRef.current = filtered;
  const selectedIndexRef = useRef(selectedIndex);
  selectedIndexRef.current = selectedIndex;

  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const list = filteredRef.current;
      const idx = selectedIndexRef.current;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((i) => Math.min(i + 1, list.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && list[idx] && !list[idx].disabled) {
        e.preventDefault();
        onSelect(list[idx]);
      }
    },
    [onSelect],
  );

  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        placeholder={placeholder}
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
        {filtered.map((item, index) => (
          <ListItemButton
            key={item.id}
            selected={index === selectedIndex}
            disabled={item.disabled}
            onClick={() => onSelect(item)}
            onMouseEnter={() => setSelectedIndex(index)}
            sx={{ px: 2, py: 0.75 }}
          >
            {renderItem ? (
              renderItem(item, index === selectedIndex)
            ) : (
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: "0.9rem" }}
              />
            )}
          </ListItemButton>
        ))}
        {filtered.length === 0 && (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No results found.
            </Typography>
          </Box>
        )}
      </List>
    </Dialog>
  );
}

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [collectionPickerOpen, setCollectionPickerOpen] = useState(false);
  const collections = useNoteStore((s) => s.collections);
  const activeCollectionId = useNoteStore((s) => s.activeCollectionId);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpenCollectionPicker = useCallback(() => {
    setCollectionPickerOpen(true);
  }, []);

  const commands = useCommands(handleClose, handleOpenCollectionPicker);

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
    </>
  );
}

export default CommandPalette;
