import { useEffect } from "react";
import Box from "@mui/material/Box";
import Sidebar from "./Sidebar";
import NoteEditor from "./NoteEditor";
import InfoPanel from "./InfoPanel";
import CommandPalette from "./CommandPalette";
import { useNoteStore } from "./store";

function App() {
  const fetchNotes = useNoteStore((s) => s.fetchNotes);
  const fetchTags = useNoteStore((s) => s.fetchTags);

  useEffect(() => {
    fetchNotes();
    fetchTags();
  }, [fetchNotes, fetchTags]);

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <Sidebar />
      <NoteEditor />
      <InfoPanel />
      <CommandPalette />
    </Box>
  );
}

export default App;
