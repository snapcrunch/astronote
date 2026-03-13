import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNoteStore } from "../store";
import Dates from "./Dates";
import Statistics from "./Statistics";
import TableOfContents from "./TableOfContents";
import TagManager from "./TagManager";
import RelatedNotes from "./RelatedNotes";
import { infoPanelRoot, infoPanelHeader, infoPanelHeaderTitle, infoPanelContent, infoPanelInlineContent } from "./styles";

interface InfoPanelProps {
  variant?: "side" | "inline";
}

function InfoPanel({ variant = "side" }: InfoPanelProps) {
  const showInfoPanel = useNoteStore((s) => s.showInfoPanel);
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);

  if (variant === "side") {
    if (!showInfoPanel || !selectedNoteId) return null;

    return (
      <Box sx={infoPanelRoot}>
        <Box sx={infoPanelHeader}>
          <Typography variant="body2" sx={infoPanelHeaderTitle}>
            Note Metadata
          </Typography>
        </Box>
        <Box sx={infoPanelContent}>
          <TableOfContents />
          <TagManager />
          <Statistics />
          <Dates />
          <RelatedNotes />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={infoPanelInlineContent}>
      <TableOfContents />
      <TagManager />
      <Statistics />
      <Dates />
    </Box>
  );
}

export default InfoPanel;
