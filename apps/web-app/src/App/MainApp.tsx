import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Sidebar from '../Sidebar';
import NoteEditor from '../NoteEditor';
import SettingsView from '../SettingsView';
import CollectionsView from '../CollectionsView';
import ApiKeysView from '../ApiKeysView';
import GraphFooter from '../KnowledgeGraph/GraphFooter';
import InfoPanel from '../InfoPanel';
import CommandPalette from '../CommandPalette';
import Omnibar from '../Omnibar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useNoteStore } from '../store';
import { useDocumentTitle, useIsMobile } from '../hooks';
import { themes } from '../themes';
import { useIntroTour } from './App.hooks';

function MainApp() {
  const themeId = useNoteStore((s) => s.settings.theme);
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
  const view = useNoteStore((s) => s.view);
  const isMobile = useIsMobile();
  useDocumentTitle();
  useIntroTour(isMobile);

  const isNotes = view === 'notes';
  const showNoteView = isMobile && (selectedNoteId !== null || !isNotes);

  const contentView =
    view === 'settings' ? (
      <SettingsView />
    ) : view === 'collections' ? (
      <CollectionsView />
    ) : view === 'keys' ? (
      <ApiKeysView />
    ) : (
      <NoteEditor />
    );

  return (
    <ThemeProvider theme={themes[themeId].theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {isMobile ? (
          <>
            <Box
              sx={{
                flexDirection: 'column',
                height: '100%',
                display: showNoteView ? 'none' : 'flex',
              }}
            >
              <Sidebar />
            </Box>
            <Fade
              key={view}
              in={showNoteView}
              mountOnEnter
              unmountOnExit
              timeout={150}
            >
              <Box
                sx={{
                  display: 'flex',
                  flex: 1,
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {contentView}
              </Box>
            </Fade>
            {selectedNoteId === null && <MobileBottomNav />}
          </>
        ) : (
          <>
            <Omnibar />
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <Sidebar />
              <Fade key={view} in timeout={150}>
                <Box sx={{ display: 'flex', flex: 1 }}>{contentView}</Box>
              </Fade>
              <InfoPanel />
            </Box>
            <GraphFooter />
          </>
        )}
        <CommandPalette />
      </Box>
    </ThemeProvider>
  );
}

export default MainApp;
