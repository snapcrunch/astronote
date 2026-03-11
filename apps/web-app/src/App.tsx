import { useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Sidebar from "./Sidebar";
import NoteEditor from "./NoteEditor";
import SettingsView from "./SettingsView";
import InfoPanel from "./InfoPanel";
import CommandPalette from "./CommandPalette";
import { useNoteStore } from "./store";
import { useIsMobile } from "./hooks";
import { themes } from "./themes";

function App() {
  const init = useNoteStore((s) => s.init);
  const themeId = useNoteStore((s) => s.settings.theme);
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
  const view = useNoteStore((s) => s.view);
  const isMobile = useIsMobile();
  useEffect(() => init(), [init]);

  const isSettings = view === "settings";
  const showNoteView = isMobile && (selectedNoteId !== null || isSettings);

  const contentView = isSettings ? <SettingsView /> : <NoteEditor />;

  return (
    <ThemeProvider theme={themes[themeId].theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100%" }}>
        {isMobile ? (
          showNoteView ? contentView : <Sidebar />
        ) : (
          <>
            <Sidebar />
            {contentView}
            <InfoPanel />
          </>
        )}
        <CommandPalette />
      </Box>
    </ThemeProvider>
  );
}

export default App;
