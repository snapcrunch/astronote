import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNoteStore } from "../store";
import Dates from "./Dates";
import Statistics from "./Statistics";
import TableOfContents from "./TableOfContents";
import TagManager from "./TagManager";

const INFO_PANEL_WIDTH = 350;

function InfoPanel() {
  const showInfoPanel = useNoteStore((s) => s.showInfoPanel);

  if (!showInfoPanel) return null;

  return (
    <Box
      sx={{
        width: INFO_PANEL_WIDTH,
        minWidth: INFO_PANEL_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderLeft: 1,
        borderColor: "divider",
        bgcolor: "grey.50",
        userSelect: "none",
      }}
    >
      <Box
        sx={{
          px: 2,
          display: "flex",
          alignItems: "center",
          bgcolor: "grey.100",
          borderBottom: 1,
          borderColor: "divider",
          height: 40,
          minHeight: 40,
          boxSizing: "content-box",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Info
        </Typography>
      </Box>
      <Box sx={{ px: 2, py: 1.5, overflow: "auto" }}>
        <TableOfContents />
        <TagManager />
        <Statistics />
        <Dates />
      </Box>
    </Box>
  );
}

export default InfoPanel;
