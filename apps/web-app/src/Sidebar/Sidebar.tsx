import Box from "@mui/material/Box";
import { useOmnibar, useSearch, useNoteList } from "./hooks";
import Omnibar from "./Omnibar";
import NoteList from "./List";

const SIDEBAR_WIDTH = 475;

function Sidebar() {
  const omnibarRef = useOmnibar();
  const { localQuery, handleSearchChange } = useSearch();
  const { notes, selectedNoteId, setSelectedNoteId, listRef, handleOmnibarKeyDown, handleListItemKeyDown } = useNoteList(omnibarRef, localQuery);

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.50",
        borderRight: 1,
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
        onSelectNote={setSelectedNoteId}
        onItemKeyDown={handleListItemKeyDown}
      />
    </Box>
  );
}

export default Sidebar;
