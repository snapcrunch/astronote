import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import * as styles from './styles';

function Placeholder() {
  return (
    <Box sx={styles.emptyStateContainer}>
      <Typography variant="h6" color="text.secondary">
        Select a note or create a new one.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Press ⌘⇧P to open the command palette.
      </Typography>
    </Box>
  );
}

export default Placeholder;
