import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import SectionHeading from "./SectionHeading";
import Tag from "../components/Tag";
import { useNoteStore, useSelectedNote } from "../store";
import { tagInput, tagList } from "./styles";

function TagManager() {
  const note = useSelectedNote();
  const [input, setInput] = useState("");
  const addTag = useNoteStore((s) => s.addTag);
  const removeTag = useNoteStore((s) => s.removeTag);
  const allTags = useNoteStore((s) => s.tags);

  if (!note) return null;

  const { id: noteId, tags } = note;
  const suggestions = allTags.map((t) => t.tag).filter((t) => !tags.includes(t)).sort();

  const handleChange = (_: unknown, value: string | null) => {
    if (!value?.trim()) return;
    const tag = value.trim().toLowerCase().replace(/^#/, "");
    if (tag && !tags.includes(tag)) {
      addTag(noteId, tag);
    }
    setInput("");
  };

  return (
    <>
      <SectionHeading>Tags</SectionHeading>
      <Autocomplete
        freeSolo
        disableClearable
        size="small"
        fullWidth
        options={suggestions}
        inputValue={input}
        onInputChange={(_, value, reason) => {
          if (reason !== "reset") setInput(value);
        }}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField {...params} placeholder="Add a tag…" sx={tagInput} />
        )}
      />
      <Box sx={tagList}>
        {tags.map((tag) => (
          <Tag key={tag} label={tag} onRemoved={() => removeTag(noteId, tag)} />
        ))}
      </Box>
    </>
  );
}

export default TagManager;
