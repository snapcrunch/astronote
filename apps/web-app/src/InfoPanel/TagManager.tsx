import { useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useNoteStore, useSelectedNote } from "../store";

function TagManager() {
  const note = useSelectedNote();
  const [input, setInput] = useState("");
  const addTag = useNoteStore((s) => s.addTag);
  const removeTag = useNoteStore((s) => s.removeTag);

  if (!note) return null;

  const { id: noteId, tags } = note;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      const tag = input.trim().toLowerCase().replace(/^#/, "");
      if (tag && !tags.includes(tag)) {
        addTag(noteId, tag);
      }
      setInput("");
    }
  };

  return (
    <>
      <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mt: 2, mb: 1, pt: 0.5, pb: 0.5, mx: -2, px: 2, borderTop: 1, borderBottom: 1, borderColor: "divider" }}>
        Tags
      </Typography>
      <TextField
        size="small"
        fullWidth
        placeholder="Add a tag…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{
          mb: 1,
          "& .MuiOutlinedInput-root": { fontSize: "0.8rem", bgcolor: "background.paper" },
          "& .MuiOutlinedInput-input": { py: 0.75 },
        }}
      />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            onDelete={() => removeTag(noteId, tag)}
            color="primary"
            sx={{ fontSize: "0.8rem", height: 24, borderRadius: 1 }}
          />
        ))}
      </Box>
    </>
  );
}

export default TagManager;
