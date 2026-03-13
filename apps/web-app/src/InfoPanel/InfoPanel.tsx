import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useNoteStore } from "../store";
import Dates from "./Dates";
import Statistics from "./Statistics";
import TableOfContents from "./TableOfContents";
import TagManager from "./TagManager";
import RelatedNotes from "./RelatedNotes";
import { infoPanelRoot, infoPanelHeader, infoPanelHeaderTitle, infoPanelContentInner } from "./styles";

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
        <OverlayScrollbarsComponent style={{ flex: 1 }} options={{ scrollbars: { autoHide: "move" } }}>
          <Box sx={infoPanelContentInner}>
            <TableOfContents />
            <TagManager />
            <Statistics />
            <Dates />
            <RelatedNotes />
          </Box>
        </OverlayScrollbarsComponent>
      </Box>
    );
  }

  return (
    <OverlayScrollbarsComponent style={{ flex: 1 }} options={{ scrollbars: { autoHide: "move" } }}>
      <Box sx={infoPanelContentInner}>
        <TableOfContents />
        <TagManager />
        <Statistics />
        <Dates />
      </Box>
    </OverlayScrollbarsComponent>
  );
}

export default InfoPanel;
