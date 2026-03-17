import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { statRow, statValue } from './styles';

function StatRow({
  label,
  value,
  onValueClick,
}: {
  label: string;
  value: string | number;
  onValueClick?: () => void;
}) {
  return (
    <Box sx={statRow}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          ...statValue,
          ...(onValueClick && { cursor: 'pointer', '&:hover': { color: 'primary.main' } }),
        }}
        onClick={onValueClick}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default StatRow;
