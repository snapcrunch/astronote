import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ImportDropZone from './ImportDropZone';

function ImportSection() {
  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 3, bgcolor: '#fff' }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Import Notes
      </Typography>
      <ImportDropZone />
    </Paper>
  );
}

export default ImportSection;
