import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import type { SxProps, Theme } from "@mui/material/styles";
import SectionHeading from "./SectionHeading";
import { useNoteStore, useSelectedNote } from "../store";
import { tagInput, tagInputWrapper } from "./styles";

function TagManager() {
  const note = useSelectedNote();
  const [input, setInput] = useState("");
  const addTag = useNoteStore((s) => s.addTag);
  const removeTag = useNoteStore((s) => s.removeTag);
  const allTags = useNoteStore((s) => s.tags);

  if (!note) return null;

  const { id: noteId, tags } = note;
  const suggestions = allTags
    .map((t) => t.tag)
    .filter((t) => !tags.includes(t))
    .sort();

  const handleChange = (_: unknown, value: string | null) => {
    if (!value?.trim()) return;
    const tag = value.trim().toLowerCase().replace(/^#/, "");
    if (tag && !tags.includes(tag)) {
      addTag(noteId, tag);
    }
    setInput("");
  };

  return (
    <SectionHeading
      content={
        <>
          <Box sx={tagInputWrapper}>
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
              slotProps={{
                popper: {
                  modifiers: [{ name: "offset", options: { offset: [0, 5] } }],
                  sx: { width: "320px !important" },
                },
                listbox: {
                  sx: {
                    "& .MuiAutocomplete-option": {
                      fontSize: "0.8rem",
                      py: 0.5,
                      px: 1.5,
                      minHeight: "unset",
                    },
                  },
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Add a tag…"
                  sx={[
                    tagInput,
                    tags.length === 0
                      ? { "& .MuiOutlinedInput-root": { borderBottom: "none" } }
                      : {},
                  ] as SxProps<Theme>}
                />
              )}
            />
          </Box>
          {tags.length > 0 && (
            <List dense disablePadding sx={{ mx: -2, mt: -1 }}>
              {tags.map((tag, index) => (
                <ListItem
                  key={tag}
                  disablePadding
                  secondaryAction={
                    <IconButton edge="end" size="small" onClick={() => removeTag(noteId, tag)}>
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  }
                  sx={{
                    py: 0.25,
                    px: 2,
                    borderBottom: index < tags.length - 1 ? 1 : 0,
                    borderColor: "divider",
                    bgcolor: index % 2 === 0 ? "background.paper" : "grey.50",
                  }}
                >
                  <ListItemText
                    primary={tag}
                    primaryTypographyProps={{ variant: "body2", noWrap: true }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </>
      }
    >
      Tags
    </SectionHeading>
  );
}

export default TagManager;
