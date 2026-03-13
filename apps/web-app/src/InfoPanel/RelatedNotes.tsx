import { useMemo } from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
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
    <>
      <SectionHeading>Related Notes</SectionHeading>
      <List dense disablePadding sx={{ mt: -1 }}>
        {relatedNotes.map((n) => (
          <ListItemButton
            key={n.id}
            onClick={() => setSelectedNoteId(n.id)}
            sx={{ mx: -2, px: 2 }}
          >
            <ListItemText
              primary={n.title}
              primaryTypographyProps={{
                variant: "body2",
                noWrap: true,
                color: "text.secondary",
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </>
  );
}

export default RelatedNotes;
