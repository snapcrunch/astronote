import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { omnibarRef, omnibarKeyDownHandler } from './refs';
import { useSearch } from './hooks';
import SaveStatusIndicator from '../NoteEditor/SaveStatusIndicator';
import { kbdSx } from '../themes';

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
                <Typography variant="caption" sx={kbdSx}>
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
