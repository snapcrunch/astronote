import { useMemo } from "react";
import moment from "moment";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useNoteStore, useSelectedNote } from "../store";
import SectionHeading from "./SectionHeading";

function RelatedNotes() {
  const note = useSelectedNote();
  const notes = useNoteStore((s) => s.notes);
  const setSelectedNoteId = useNoteStore((s) => s.setSelectedNoteId);

  const relatedNotes = useMemo(() => {
    if (!note || note.tags.length === 0) return [];
    const tagSet = new Set(note.tags);
    return notes
      .filter((n) => n.id !== note.id && n.tags.some((t) => tagSet.has(t)))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [note, notes]);

  if (!note || relatedNotes.length === 0) return null;

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <Box sx={{ px: 2, "& > *": { mb: 0 } }}>
        <SectionHeading>Related Notes</SectionHeading>
      </Box>
      <OverlayScrollbarsComponent style={{ flex: 1 }} options={{ scrollbars: { autoHide: "move" }, overflow: { x: "hidden" } }}>
      <List dense disablePadding>
        {relatedNotes.map((n, index) => (
          <ListItemButton
            key={n.id}
            onClick={() => setSelectedNoteId(n.id)}
            disableRipple
            sx={{
              px: 2,
              py: 0.25,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: index % 2 === 0 ? "background.paper" : "grey.50",
            }}
          >
            <ListItemText
              primary={n.title}
              secondary={
                <Box component="span" sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Typography variant="caption" noWrap component="span" sx={{ flexShrink: 0 }}>
                    {moment(n.updatedAt).fromNow()}
                  </Typography>
                  <Typography variant="caption" noWrap component="span" sx={{ flexShrink: 1, minWidth: 0 }}>
                    {n.tags.join(", ")}
                  </Typography>
                </Box>
              }
              primaryTypographyProps={{
                variant: "body2",
                component: "div",
                fontWeight: 500,
                noWrap: true,
                sx: { lineHeight: 1.2 },
              }}
              secondaryTypographyProps={{
                component: "div",
              }}
            />
          </ListItemButton>
        ))}
      </List>
      </OverlayScrollbarsComponent>
    </Box>
  );
}

export default RelatedNotes;
