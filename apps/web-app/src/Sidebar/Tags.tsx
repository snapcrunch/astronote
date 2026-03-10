import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import { useNoteStore } from "../store";

function Tags() {
  const tags = useNoteStore((s) => s.tags);
  const sortedTags = useMemo(() => [...tags].sort((a, b) => a.tag.localeCompare(b.tag)), [tags]);
  const selectedTags = useNoteStore((s) => s.selectedTags);
  const toggleTag = useNoteStore((s) => s.toggleTag);
  const [open, setOpen] = useState(true);

  if (tags.length === 0) return null;

  return (
    <Box
      sx={{
        borderTop: 1,
        borderColor: "divider",
        px: 1.5,
        pt: 1,
      }}
    >
      <Box
        onClick={() => setOpen((prev) => !prev)}
        sx={{ display: "flex", alignItems: "center", borderBottom: 1, borderColor: open ? "divider" : "transparent", pb: 0.5, mb: 0.5, mx: -1.5, px: 1.5, cursor: "pointer", minHeight: 32 }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Tags
        </Typography>
      </Box>
      <Collapse in={open}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, pt: 0.5, pb: 1 }}>
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
      </Collapse>
    </Box>
  );
}

export default Tags;
