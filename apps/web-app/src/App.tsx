import { useEffect } from "react";
import Box from "@mui/material/Box";
import Sidebar from "./Sidebar";
import NoteEditor from "./NoteEditor";
import InfoPanel from "./InfoPanel";
import CommandPalette from "./CommandPalette";
import { useNoteStore, restoreFromUrl } from "./store";

function App() {
  const fetchNotes = useNoteStore((s) => s.fetchNotes);
  const fetchTags = useNoteStore((s) => s.fetchTags);
  const fetchCollections = useNoteStore((s) => s.fetchCollections);

  useEffect(() => {
    fetchNotes();
    fetchTags();
    fetchCollections();
  }, [fetchNotes, fetchTags, fetchCollections]);

  useEffect(() => {
    const onPopState = () => restoreFromUrl();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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
