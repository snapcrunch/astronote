import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { useNoteStore } from '../store';
import { useIsMobile } from '../hooks';
import type { BackupInterval, BackupMechanism, DefaultView } from '@repo/types';

function SettingsView() {
  const isMobile = useIsMobile();
  const setView = useNoteStore((s) => s.setView);
  const settings = useNoteStore((s) => s.settings);
  const settingsLoaded = useNoteStore((s) => s.settingsLoaded);
  const updateSettings = useNoteStore((s) => s.updateSettings);
  const performBackup = useNoteStore((s) => s.performBackup);

  const [backingUp, setBackingUp] = useState(false);
  const [sshUrl, setSshUrl] = useState(settings.backup_repo_ssh_url);
  const [sshKey, setSshKey] = useState(settings.backup_ssh_private_key);

  useEffect(() => {
    setSshUrl(settings.backup_repo_ssh_url);
  }, [settings.backup_repo_ssh_url]);

  useEffect(() => {
    setSshKey(settings.backup_ssh_private_key);
  }, [settings.backup_ssh_private_key]);

  if (!settingsLoaded) return null;

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
          Settings
        </Typography>
      </Box>
      <OverlayScrollbarsComponent
        style={{ flex: 1 }}
        options={{ scrollbars: { autoHide: 'move' } }}
      >
        <Box sx={{ bgcolor: '#ECECED', minHeight: '100%' }}>
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
                '& td:last-child': {
                  textAlign: 'right',
                },
                '& tr:last-child td': {
                  borderBottom: 0,
                },
                '& th': {
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                },
              }}
            >
              <tbody>
                <tr>
                  <td>
                    <Typography variant="body2">Default Note View</Typography>
                  </td>
                  <td>
                    <Select
                      variant="standard"
                      value={settings.default_view}
                      onChange={(e) =>
                        updateSettings({
                          default_view: e.target.value as DefaultView,
                        })
                      }
                      size="small"
                      sx={{ minWidth: 200, fontSize: '0.875rem' }}
                    >
                      <MenuItem value="renderer">Renderer</MenuItem>
                      <MenuItem value="editor">Editor</MenuItem>
                    </Select>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Typography variant="body2">
                      Show Note Metadata By Default
                    </Typography>
                  </td>
                  <td>
                    <Select
                      variant="standard"
                      value={settings.show_info_panel ? 'yes' : 'no'}
                      onChange={(e) =>
                        updateSettings({
                          show_info_panel: e.target.value === 'yes',
                        })
                      }
                      size="small"
                      sx={{ minWidth: 200, fontSize: '0.875rem' }}
                    >
                      <MenuItem value="yes">Yes</MenuItem>
                      <MenuItem value="no">No</MenuItem>
                    </Select>
                  </td>
                </tr>
              </tbody>
              <tbody>
                <tr>
                  <td colSpan={2} style={{ textAlign: 'left' }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        py: 0.75,
                      }}
                    >
                      Backups
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Typography variant="body2">Backup Mechanism</Typography>
                  </td>
                  <td>
                    <Select
                      variant="standard"
                      value={settings.backup_mechanism}
                      onChange={(e) =>
                        updateSettings({
                          backup_mechanism: e.target.value as BackupMechanism,
                        })
                      }
                      size="small"
                      sx={{ minWidth: 200, fontSize: '0.875rem' }}
                    >
                      <MenuItem value="disabled">Disabled</MenuItem>
                      <MenuItem value="git">Git</MenuItem>
                    </Select>
                  </td>
                </tr>
                {settings.backup_mechanism === 'git' && (
                  <tr>
                    <td>
                      <Typography variant="body2">
                        Repository SSH URL
                      </Typography>
                    </td>
                    <td>
                      <InputBase
                        value={sshUrl}
                        onChange={(e) => setSshUrl(e.target.value)}
                        onBlur={() => {
                          if (sshUrl !== settings.backup_repo_ssh_url) {
                            updateSettings({ backup_repo_ssh_url: sshUrl });
                          }
                        }}
                        placeholder="git@github.com:user/repo.git"
                        size="small"
                        sx={{
                          fontSize: '0.875rem',
                          width: '100%',
                          '& input': { textAlign: 'right' },
                        }}
                      />
                    </td>
                  </tr>
                )}
                {settings.backup_mechanism === 'git' && (
                  <tr>
                    <td style={{ verticalAlign: 'top' }}>
                      <Typography variant="body2" sx={{ pt: 0.5 }}>
                        Private SSH Key
                      </Typography>
                    </td>
                    <td>
                      <InputBase
                        value={sshKey}
                        onChange={(e) => setSshKey(e.target.value)}
                        onBlur={() => {
                          if (sshKey !== settings.backup_ssh_private_key) {
                            updateSettings({ backup_ssh_private_key: sshKey });
                          }
                        }}
                        multiline
                        minRows={4}
                        placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                        sx={{
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          width: '100%',
                          '& textarea': { textAlign: 'right' },
                        }}
                      />
                    </td>
                  </tr>
                )}
                {settings.backup_mechanism === 'git' && (
                  <tr>
                    <td>
                      <Typography variant="body2">Backup Interval</Typography>
                    </td>
                    <td>
                      <Select
                        variant="standard"
                        value={settings.backup_interval}
                        onChange={(e) =>
                          updateSettings({
                            backup_interval: e.target.value as BackupInterval,
                          })
                        }
                        size="small"
                        sx={{ minWidth: 200, fontSize: '0.875rem' }}
                      >
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="hourly">Hourly</MenuItem>
                      </Select>
                      {settings.backup_interval === 'none' && (
                        <FormHelperText sx={{ textAlign: 'right' }}>
                          Automated backups will not be performed.
                        </FormHelperText>
                      )}
                    </td>
                  </tr>
                )}
                {settings.backup_mechanism === 'git' && (
                  <tr>
                    <td>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={backingUp}
                        onClick={async () => {
                          setBackingUp(true);
                          try {
                            await performBackup();
                          } finally {
                            setBackingUp(false);
                          }
                        }}
                      >
                        {backingUp ? 'Backing up...' : 'Perform Backup Now'}
                      </Button>
                    </td>
                    <td />
                  </tr>
                )}
              </tbody>
            </Box>
          </Paper>
        </Box>
      </OverlayScrollbarsComponent>
    </Box>
  );
}

export default SettingsView;
