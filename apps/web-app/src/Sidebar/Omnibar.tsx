import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { omnibarRef, omnibarKeyDownHandler } from './refs';
import { useSearch } from './hooks';
import SaveStatusIndicator from '../NoteEditor/SaveStatusIndicator';

function Omnibar() {
  const { localQuery, handleSearchChange } = useSearch();

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        height: 48,
        minHeight: 48,
        boxSizing: 'content-box',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <TextField
        inputRef={omnibarRef}
        fullWidth
        size="small"
        placeholder="Search or create a note…"
        value={localQuery}
        onChange={(e) => handleSearchChange(e.target.value)}
        onKeyDown={(e) =>
          omnibarKeyDownHandler.current?.(
            e as React.KeyboardEvent<HTMLInputElement>
          )
        }
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <MoreVertIcon
                  sx={{
                    cursor: 'pointer',
                    fontSize: 20,
                  }}
                  onClick={() => {
                    document.dispatchEvent(
                      new KeyboardEvent('keydown', {
                        key: 'p',
                        metaKey: true,
                        shiftKey: true,
                        bubbles: true,
                      })
                    );
                  }}
                />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end" sx={{ gap: 1 }}>
                <SaveStatusIndicator />
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: 'grey.200',
                    color: 'text.secondary',
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ⌘⇧K
                </Typography>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.paper',
            borderRadius: 0,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
        }}
      />
    </Box>
  );
}

export default Omnibar;
