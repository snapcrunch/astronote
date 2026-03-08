import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Note } from "./types";

interface NoteEditorProps {
  note: Note | null;
  onUpdateNote: (id: string, updates: Partial<Pick<Note, "title" | "content">>) => void;
}

function NoteEditor({ note, onUpdateNote }: NoteEditorProps) {
  if (!note) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Select a note or create a new one
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
      <Box sx={{ p: 3, pb: 1 }}>
        <TextField
          fullWidth
          variant="standard"
          value={note.title}
          onChange={(e) => onUpdateNote(note.id, { title: e.target.value })}
          slotProps={{
            input: {
              disableUnderline: true,
              sx: {
                fontSize: "1.75rem",
                fontWeight: 600,
              },
            },
          }}
        />
        <Typography variant="caption" color="text.secondary">
          Last updated{" "}
          {new Date(note.updatedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, px: 3, pb: 3, overflow: "auto" }}>
        <TextField
          fullWidth
          multiline
          variant="standard"
          placeholder="Start writing…"
          value={note.content}
          onChange={(e) => onUpdateNote(note.id, { content: e.target.value })}
          slotProps={{
            input: {
              disableUnderline: true,
              sx: {
                fontSize: "1rem",
                lineHeight: 1.8,
                alignItems: "flex-start",
              },
            },
          }}
          sx={{
            height: "100%",
            "& .MuiInputBase-root": {
              height: "100%",
            },
            "& .MuiInputBase-input": {
              height: "100% !important",
              overflow: "auto !important",
            },
          }}
        />
      </Box>
    </Box>
  );
}

export default NoteEditor;
