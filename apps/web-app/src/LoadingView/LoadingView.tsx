import { useEffect } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Logo from '../components/icons/Logo';
import { useNoteStore } from '../store';

export default function LoadingView() {
  const init = useNoteStore((s) => s.init);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    init().then((fn) => {
      cleanup = fn;
    });
    return () => cleanup?.();
  }, [init]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 3,
      }}
    >
      <Logo width={80} height={80} />
      <Typography variant="h5">Astronote</Typography>
      <CircularProgress size={28} />
    </Box>
  );
}
