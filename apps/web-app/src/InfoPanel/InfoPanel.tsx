import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNoteStore } from "../store";
import Dates from "./Dates";
import Statistics from "./Statistics";
import TableOfContents from "./TableOfContents";
import TagManager from "./TagManager";
import { infoPanelRoot, infoPanelHeader, infoPanelHeaderTitle, infoPanelContent } from "./styles";

function InfoPanel() {
  const showInfoPanel = useNoteStore((s) => s.showInfoPanel);

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

export default InfoPanel;
