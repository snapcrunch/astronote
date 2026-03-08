import { useEffect } from "react";
import Box from "@mui/material/Box";
import Sidebar from "./Sidebar";
import NoteEditor from "./NoteEditor";
import { useNoteStore } from "./store";

function App() {
  const fetchNotes = useNoteStore((s) => s.fetchNotes);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <Sidebar />
      <NoteEditor />
    </Box>
  );
}

export default App;
