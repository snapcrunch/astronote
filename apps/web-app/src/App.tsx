import { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import Sidebar from './Sidebar';
import NoteEditor from './NoteEditor';
import SettingsView from './SettingsView';
import CollectionsView from './CollectionsView';
import InfoPanel from './InfoPanel';
import CommandPalette from './CommandPalette';
import Omnibar from './Sidebar/Omnibar';
import LoadingView from './LoadingView';
import LoginView from './LoginView';
import { useNoteStore } from './store';
import { useIsMobile } from './hooks';
import { themes } from './themes';

function MainApp() {
  const themeId = useNoteStore((s) => s.settings.theme);
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
  const view = useNoteStore((s) => s.view);
  const isMobile = useIsMobile();
  const introDismissed = useNoteStore((s) => s.settings.intro_dismissed);
  const updateSettings = useNoteStore((s) => s.updateSettings);

  useEffect(() => {
    if (introDismissed) return;
    const timer = setTimeout(() => {
      const dismiss = () => updateSettings({ intro_dismissed: true });
      introJs()
        .setOptions({
          steps: [
            {
              element: '#omnibar-planet-icon',
              intro: isMobile
                ? 'Tap the planet icon to open the command palette.'
                : 'Click the planet icon to open the command palette.',
            },
          ],
          showBullets: false,
          showStepNumbers: false,
          exitOnOverlayClick: true,
        })
        .oncomplete(dismiss)
        .onexit(dismiss)
        .start();
    }, 500);
    return () => clearTimeout(timer);
  }, [introDismissed, updateSettings]);

  const isNotes = view === 'notes';
  const showNoteView = isMobile && (selectedNoteId !== null || !isNotes);

  const contentView =
    view === 'settings' ? (
      <SettingsView />
    ) : view === 'collections' ? (
      <CollectionsView />
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
                display: showNoteView ? 'none' : 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Sidebar />
            </Box>
            {showNoteView && contentView}
          </>
        ) : (
          <>
            <Omnibar />
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <Sidebar />
              {contentView}
              <InfoPanel />
            </Box>
          </>
        )}
        <CommandPalette />
      </Box>
    </ThemeProvider>
  );
}

function App() {
  const route = useNoteStore((s) => s.route);

  if (route === 'loading') return <LoadingView />;
  if (route === 'login') return <LoginView />;
  return <MainApp />;
}

export default App;
