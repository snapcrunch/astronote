import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import Tag from "../components/Tag";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useNoteStore } from "../store";
import { useIsMobile } from "../hooks";

function Tags() {
  const isMobile = useIsMobile();
  const tags = useNoteStore((s) => s.tags);
  const sortedTags = useMemo(() => [...tags].sort((a, b) => a.tag.localeCompare(b.tag)), [tags]);
  const selectedTags = useNoteStore((s) => s.selectedTags);
  const toggleTag = useNoteStore((s) => s.toggleTag);
  const [open, setOpen] = useState(!isMobile);

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
        <OverlayScrollbarsComponent style={{ maxHeight: 400 }} options={{ scrollbars: { autoHide: "move" }, overflow: { x: "hidden" } }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, pt: 0.5, pb: 1, mx: -1.5, px: 1.5 }}>
            {sortedTags.map(({ tag, count }) => (
              <Tag key={tag} label={tag} count={count} selected={selectedTags.includes(tag)} onClick={() => toggleTag(tag)} />
            ))}
          </Box>
        </OverlayScrollbarsComponent>
      </Collapse>
    </Box>
  );
}

export default Tags;
