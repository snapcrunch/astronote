import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNoteStore, useStatusMessage } from "../store";
import { useIsMobile } from "../hooks";
import { useOmnibar, useSearch, useNoteList } from "./hooks";
import Omnibar from "./Omnibar";
import NoteList from "./List";
import Tags from "./Tags";

const SIDEBAR_WIDTH = 475;

function Sidebar() {
  const isMobile = useIsMobile();
  const omnibarRef = useOmnibar();
  const { localQuery, handleSearchChange } = useSearch();
  const { notes, selectedNoteId, setSelectedNoteId, listRef, handleOmnibarKeyDown, handleListItemKeyDown } = useNoteList(omnibarRef, localQuery);
  const deleteNote = useNoteStore((s) => s.deleteNote);
  const statusMessage = useStatusMessage();

  return (
    <Box
      sx={{
        width: isMobile ? "100%" : SIDEBAR_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.50",
        userSelect: "none",
        borderRight: isMobile ? 0 : 1,
        borderColor: "divider",
      }}
    >
      <Omnibar
        omnibarRef={omnibarRef}
        localQuery={localQuery}
        onSearchChange={handleSearchChange}
        onKeyDown={handleOmnibarKeyDown}
      />
      <NoteList
        notes={notes}
        selectedNoteId={selectedNoteId}
        localQuery={localQuery}
        listRef={listRef}
        onSelectNote={(id) => setSelectedNoteId(selectedNoteId === id ? null : id)}
        onDeleteNote={deleteNote}
        onItemKeyDown={handleListItemKeyDown}
      />
      <Tags />
      <Box sx={{ borderTop: 1, borderColor: "divider", px: 2, py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="caption" color="text.secondary">
          {notes.length} {notes.length === 1 ? "Note" : "Notes"}
        </Typography>
        {statusMessage && (
          <Typography variant="caption" color="text.secondary">
            {statusMessage}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default Sidebar;
