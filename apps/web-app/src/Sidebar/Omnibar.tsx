import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { omnibarRef, omnibarKeyDownHandler } from './refs';
import { useSearch } from './hooks';

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
                <img
                  id="omnibar-planet-icon"
                  src="/favicon.svg"
                  alt=""
                  width={20}
                  height={20}
                  style={{
                    cursor: 'pointer',
                    opacity: 0.75,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.75';
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
              <InputAdornment position="end">
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
