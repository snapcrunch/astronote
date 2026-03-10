import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import SectionHeading from "./SectionHeading";
import Tag from "../components/Tag";
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
      <SectionHeading>Tags</SectionHeading>
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
          <Tag key={tag} label={tag} onRemoved={() => removeTag(noteId, tag)} />
        ))}
      </Box>
    </>
  );
}

export default TagManager;
