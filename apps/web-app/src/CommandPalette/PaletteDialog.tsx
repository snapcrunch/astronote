import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import InputBase from "@mui/material/InputBase";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

export interface PaletteItem {
  id: string | number;
  label: string;
  disabled?: boolean;
}

export default function PaletteDialog({
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
  items: PaletteItem[];
  renderItem?: (item: PaletteItem, selected: boolean) => React.ReactNode;
  onSelect: (item: PaletteItem) => void;
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
      <OverlayScrollbarsComponent style={{ maxHeight: 300 }} options={{ scrollbars: { autoHide: "move" } }}>
      <List ref={listRef} sx={{ py: 0.5 }}>
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
      </OverlayScrollbarsComponent>
    </Dialog>
  );
}
