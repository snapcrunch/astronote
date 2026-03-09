import { useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Sidebar from "./Sidebar";
import NoteEditor from "./NoteEditor";
import InfoPanel from "./InfoPanel";
import CommandPalette from "./CommandPalette";
import { useNoteStore, restoreFromUrl } from "./store";
import { themes } from "./themes";

function App() {
  const fetchNotes = useNoteStore((s) => s.fetchNotes);
  const fetchTags = useNoteStore((s) => s.fetchTags);
  const fetchCollections = useNoteStore((s) => s.fetchCollections);
  const fetchSettings = useNoteStore((s) => s.fetchSettings);
  const themeId = useNoteStore((s) => s.settings.theme);

  useEffect(() => {
    fetchNotes();
    fetchTags();
    fetchCollections();
    fetchSettings();
  }, [fetchNotes, fetchTags, fetchCollections, fetchSettings]);

  useEffect(() => {
    const onPopState = () => restoreFromUrl();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <ThemeProvider theme={themes[themeId].theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100%" }}>
        <Sidebar />
        <NoteEditor />
        <InfoPanel />
        <CommandPalette />
      </Box>
    </ThemeProvider>
  );
}

export default App;
