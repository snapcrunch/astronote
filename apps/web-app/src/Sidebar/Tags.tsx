import { useMemo } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { useNoteStore } from "../store";

function Tags() {
  const tags = useNoteStore((s) => s.tags);
  const sortedTags = useMemo(() => [...tags].sort((a, b) => a.tag.localeCompare(b.tag)), [tags]);
  const selectedTags = useNoteStore((s) => s.selectedTags);
  const toggleTag = useNoteStore((s) => s.toggleTag);

  if (tags.length === 0) return null;

  return (
    <Box
      sx={{
        borderTop: 1,
        borderColor: "divider",
        px: 1.5,
        py: 1,
        display: "flex",
        flexWrap: "wrap",
        gap: 0.5,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600, width: "100%" }}>
        Tags
      </Typography>
      {sortedTags.map(({ tag, count }) => (
        <Chip
          key={tag}
          label={`${tag} (${count})`}
          size="small"
          variant={selectedTags.includes(tag) ? "filled" : "outlined"}
          color={selectedTags.includes(tag) ? "primary" : "default"}
          onClick={() => toggleTag(tag)}
          sx={{ fontSize: "0.85rem", height: 28, cursor: "pointer" }}
        />
      ))}
    </Box>
  );
}

export default Tags;
