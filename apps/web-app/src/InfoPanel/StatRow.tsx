import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { statRow, statValue } from './styles';

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <Box sx={statRow}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" sx={statValue}>
        {value}
      </Typography>
    </Box>
  );
}

export default StatRow;
