import { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import Sidebar from './Sidebar';
import NoteEditor from './NoteEditor';
import SettingsView from './SettingsView';
import CollectionsView from './CollectionsView';
import ApiKeysView from './ApiKeysView';
import GraphFooter from './KnowledgeGraph/GraphFooter';
import InfoPanel from './InfoPanel';
import CommandPalette from './CommandPalette';
import Omnibar from './Sidebar/Omnibar';
import LoadingView from './LoadingView';
import LoginView from './LoginView';
import MobileBottomNav from './components/MobileBottomNav';
import { useNoteStore } from './store';
import { useDocumentTitle, useIsMobile } from './hooks';
import { themes } from './themes';

function MainApp() {
  const themeId = useNoteStore((s) => s.settings.theme);
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
  const view = useNoteStore((s) => s.view);
  const isMobile = useIsMobile();
  useDocumentTitle();
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
            {
              element: '#first-tag',
              intro: isMobile
                ? 'Tap a tag to filter notes by that tag. Hold Option and tap to select multiple tags at once.'
                : 'Click a tag to filter notes by that tag. Hold Option and click to select multiple tags at once.',
            },
          ],
          showBullets: true,
          showStepNumbers: false,
          exitOnOverlayClick: true,
        })
        .oncomplete(dismiss)
        .onexit(dismiss)
        .start();
    }, 500);
    return () => clearTimeout(timer);
  }, [introDismissed, updateSettings, isMobile]);

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

function App() {
  const route = useNoteStore((s) => s.route);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) {
          e.preventDefault();
          window.open(href, '_blank', 'noopener,noreferrer');
        }
      } catch {
        // not a valid URL, let browser handle it
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (route === 'loading') return <LoadingView />;
  if (route === 'login') return <LoginView />;
  return <MainApp />;
}

export default App;
