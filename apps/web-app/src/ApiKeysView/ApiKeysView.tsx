import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { useNoteStore } from '../store';
import { useIsMobile } from '../hooks';
import ApiKeysSection from './ApiKeysSection';

function ApiKeysView() {
  const isMobile = useIsMobile();
  const setView = useNoteStore((s) => s.setView);

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: isMobile ? 1.5 : 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'grey.100',
          borderBottom: 1,
          borderColor: 'divider',
          height: 40,
          minHeight: 40,
          boxSizing: 'content-box',
        }}
      >
        {isMobile && (
          <IconButton
            size="small"
            onClick={() => setView('notes')}
            title="Back"
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          API Keys
        </Typography>
      </Box>
      <OverlayScrollbarsComponent
        style={{ flex: 1 }}
        options={{ scrollbars: { autoHide: 'move' } }}
      >
        <Box sx={{ bgcolor: '#ECECED', minHeight: '100%' }}>
          <ApiKeysSection />
        </Box>
      </OverlayScrollbarsComponent>
    </Box>
  );
}

export default ApiKeysView;
