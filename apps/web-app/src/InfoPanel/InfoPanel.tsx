import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import { useNoteStore } from "../store";
import Dates from "./Dates";
import Statistics from "./Statistics";
import TableOfContents from "./TableOfContents";
import TagManager from "./TagManager";
import { infoPanelRoot, infoPanelHeader, infoPanelHeaderTitle, infoPanelContent, infoPanelInlineRoot } from "./styles";

interface InfoPanelProps {
  variant?: "side" | "inline";
}

function InfoPanel({ variant = "side" }: InfoPanelProps) {
  const showInfoPanel = useNoteStore((s) => s.showInfoPanel);

  if (variant === "side") {
    if (!showInfoPanel) return null;

    return (
      <Box sx={infoPanelRoot}>
        <Box sx={infoPanelHeader}>
          <Typography variant="body2" sx={infoPanelHeaderTitle}>
            Info
          </Typography>
        </Box>
        <Box sx={infoPanelContent}>
          <TableOfContents />
          <TagManager />
          <Statistics />
          <Dates />
        </Box>
      </Box>
    );
  }

  return (
    <Collapse in={showInfoPanel}>
      <Box sx={infoPanelInlineRoot}>
        <TableOfContents />
        <TagManager />
        <Statistics />
        <Dates />
      </Box>
    </Collapse>
  );
}

export default InfoPanel;
