import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import Paper from '@mui/material/Paper';
import { useNoteStore } from '../store';

function CollectionsSection() {
  const collections = useNoteStore((s) => s.collections);
  const createCollection = useNoteStore((s) => s.createCollection);
  const deleteCollection = useNoteStore((s) => s.deleteCollection);
  const setDefaultCollection = useNoteStore((s) => s.setDefaultCollection);
  const [newName, setNewName] = useState('');

  return (
    <Paper
      sx={{
        pt: 0,
        px: 2,
        pb: 0,
        borderRadius: 0,
        bgcolor: '#fff',
        boxShadow: 'none',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box
        component="table"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          '& th, & td': {
            textAlign: 'left',
            py: 0.75,
            px: 1,
            borderBottom: 1,
            borderColor: 'divider',
          },
          '& tbody tr:last-child td': {
            borderBottom: 0,
          },
          '& th': {
            fontWeight: 600,
            fontSize: '0.75rem',
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            py: 1.5,
          },
        }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Notes</th>
            <th>Default</th>
            <th style={{ width: 1 }} />
          </tr>
        </thead>
        <tbody>
          {collections.map((c) => (
            <tr key={c.id}>
              <td>
                <Typography variant="body2">{c.name}</Typography>
              </td>
              <td>
                <Typography variant="body2">{c.noteCount}</Typography>
              </td>
              <td>
                <IconButton
                  size="small"
                  onClick={() => setDefaultCollection(c.id)}
                  color={c.isDefault ? 'primary' : 'default'}
                  title={c.isDefault ? 'Default collection' : 'Set as default'}
                >
                  {c.isDefault ? (
                    <StarIcon fontSize="small" />
                  ) : (
                    <StarOutlineIcon fontSize="small" />
                  )}
                </IconButton>
              </td>
              <td>
                <IconButton
                  size="small"
                  onClick={() => deleteCollection(c.id)}
                  title="Delete collection"
                  color="error"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={3}>
              <TextField
                size="small"
                variant="standard"
                placeholder="New collection name…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newName.trim()) {
                    createCollection(newName.trim());
                    setNewName('');
                  }
                }}
                fullWidth
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: '0.875rem' },
                }}
              />
            </td>
            <td>
              <IconButton
                size="small"
                onClick={() => {
                  if (newName.trim()) {
                    createCollection(newName.trim());
                    setNewName('');
                  }
                }}
                title="Create collection"
                disabled={!newName.trim()}
                color="primary"
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </td>
          </tr>
        </tbody>
      </Box>
    </Paper>
  );
}

export default CollectionsSection;
