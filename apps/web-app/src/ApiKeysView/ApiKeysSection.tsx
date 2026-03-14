import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useNoteStore } from '../store';

function ApiKeysSection() {
  const apiKeys = useNoteStore((s) => s.apiKeys);
  const createApiKey = useNoteStore((s) => s.createApiKey);
  const deleteApiKey = useNoteStore((s) => s.deleteApiKey);
  const [newName, setNewName] = useState('');
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const { token } = await createApiKey(newName.trim());
    setNewName('');
    setCreatedToken(token);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (createdToken) {
      await navigator.clipboard.writeText(createdToken);
      setCopied(true);
    }
  };

  return (
    <>
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
              <th style={{ width: 1 }} />
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((k) => (
              <tr key={k.id}>
                <td>
                  <Typography variant="body2">{k.name}</Typography>
                </td>
                <td>
                  <IconButton
                    size="small"
                    onClick={() => setDeleteTarget({ id: k.id, name: k.name })}
                    title="Delete API key"
                    color="error"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <TextField
                  size="small"
                  variant="standard"
                  placeholder="New API key name…"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newName.trim()) {
                      handleCreate();
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
                  onClick={handleCreate}
                  title="Create API key"
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

      <Dialog
        open={createdToken !== null}
        onClose={() => setCreatedToken(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>API Key Created</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Copy this token now. It will not be shown again.
          </Typography>
          <TextField
            fullWidth
            value={createdToken ?? ''}
            InputProps={{
              readOnly: true,
              sx: { fontFamily: 'monospace', fontSize: '0.8rem' },
              endAdornment: (
                <IconButton size="small" onClick={handleCopy} title="Copy">
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />
          {copied && (
            <Typography variant="caption" color="success.main" sx={{ mt: 1 }}>
              Copied to clipboard
            </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 3, mb: 1 }}>
            Example usage:
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 1.5,
              bgcolor: 'grey.100',
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              m: 0,
            }}
          >
            {`curl ${window.location.origin}/api/auth \\\n  -H "Authorization: Bearer ${createdToken ?? ''}"`}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatedToken(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
      >
        <DialogTitle>Delete API Key</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the API key "{deleteTarget?.name}"?
            Any requests using this key will be rejected.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => {
              if (deleteTarget) {
                deleteApiKey(deleteTarget.id);
                setDeleteTarget(null);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ApiKeysSection;
