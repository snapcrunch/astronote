import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Box from '@mui/material/Box';
import { useNoteStore } from '../store';

function MobileBottomNav() {
  const view = useNoteStore((s) => s.view);
  const setView = useNoteStore((s) => s.setView);
  const setSelectedNoteId = useNoteStore((s) => s.setSelectedNoteId);

  const value = view === 'notes' ? 0 : 1;

  return (
    <Box
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavigation
        sx={{ minHeight: 0, height: 40 }}
        value={value}
        onChange={(_, newValue) => {
          if (newValue === 0) {
            setSelectedNoteId(null);
            setView('notes');
          } else {
            setView('settings');
          }
        }}
        showLabels
      >
        <BottomNavigationAction
          label="Notes"
          icon={<DescriptionOutlinedIcon />}
        />
        <BottomNavigationAction
          label="Settings"
          icon={<SettingsOutlinedIcon />}
        />
      </BottomNavigation>
    </Box>
  );
}

export default MobileBottomNav;
