import { useState, useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNoteStore, useSelectedNote } from "./store";
import MarkdownEditor from "./MarkdownEditor";

function NoteEditor() {
  const view = useNoteStore((s) => s.view);
  const note = useSelectedNote();
  const updateNote = useNoteStore((s) => s.updateNote);
  const [editing, setEditing] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const pendingUpdate = useRef<{ id: string; updates: Parameters<typeof updateNote>[1] } | null>(null);

  const debouncedUpdateNote = useCallback(
    (id: string, updates: Parameters<typeof updateNote>[1]) => {
      pendingUpdate.current = { id, updates };
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        pendingUpdate.current = null;
        updateNote(id, updates);
      }, 500);
    },
    [updateNote],
  );

  const flushAndExitEdit = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    if (pendingUpdate.current) {
      const { id, updates } = pendingUpdate.current;
      pendingUpdate.current = null;
      updateNote(id, updates);
    }
    setEditing(false);
  }, [updateNote]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  useEffect(() => {
    const { editOnCreate } = useNoteStore.getState();
    if (editOnCreate) {
      setEditing(true);
      useNoteStore.setState({ editOnCreate: false });
    } else {
      setEditing(false);
    }
  }, [note?.id]);

  if (view === "settings") {
    return (
      <Box
        sx={{
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "grey.100",
            borderBottom: 1,
            borderColor: "divider",
            height: 40,
            minHeight: 40,
            boxSizing: "content-box",
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Settings
          </Typography>
        </Box>
        <Box sx={{ flex: 1, px: 3, py: 3, overflow: "auto" }}>
          <Typography variant="body2" color="text.secondary">
            Settings will appear here.
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!note) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Select a note or create a new one.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Press ⌘⇧P to open the command palette.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 3,
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "grey.100",
          borderBottom: 1,
          borderColor: "divider",
          height: 40,
          minHeight: 40,
          boxSizing: "content-box",
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
            {note.title}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={() => setEditing((prev) => !prev)}
          title={editing ? "View" : "Edit"}
        >
          {editing ? <VisibilityIcon fontSize="small" /> : <EditIcon fontSize="small" />}
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, px: 3, pb: 3, overflow: "auto" }}>
        {editing ? (
          <MarkdownEditor
            value={note.content}
            onChange={(content) => debouncedUpdateNote(note.id, { content })}
            onEscape={flushAndExitEdit}
            autoFocus
          />
        ) : (
          <Box
            sx={{
              "& table": {
                borderCollapse: "collapse",
                width: "100%",
                my: 2,
              },
              "& th, & td": {
                border: 1,
                borderColor: "divider",
                px: 1.5,
                py: 0.75,
                textAlign: "left",
              },
              "& th": {
                bgcolor: "grey.100",
                fontWeight: 600,
              },
              "& pre": {
                bgcolor: "grey.100",
                p: 2,
                borderRadius: 1,
                overflow: "auto",
                fontSize: "0.875rem",
              },
              "& code": {
                fontSize: "0.875rem",
                bgcolor: "grey.100",
                px: 0.5,
                borderRadius: 0.5,
              },
              "& pre code": {
                bgcolor: "transparent",
                px: 0,
              },
              "& blockquote": {
                borderLeft: 4,
                borderColor: "grey.300",
                pl: 2,
                ml: 0,
                color: "text.secondary",
                fontStyle: "italic",
              },
              "& img": {
                maxWidth: "100%",
              },
              "& a": {
                color: "primary.main",
              },
              "& hr": {
                border: "none",
                borderTop: 1,
                borderColor: "divider",
                my: 2,
              },
            }}
          >
            <Markdown remarkPlugins={[remarkGfm]}>{note.content}</Markdown>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default NoteEditor;
