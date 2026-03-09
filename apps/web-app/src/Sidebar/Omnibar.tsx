import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
interface OmnibarProps {
  omnibarRef: React.RefObject<HTMLInputElement | null>;
  localQuery: string;
  onSearchChange: (value: string) => void;
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
}

function Omnibar({ omnibarRef, localQuery, onSearchChange, onKeyDown }: OmnibarProps) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <TextField
        inputRef={omnibarRef}
        fullWidth
        size="small"
        placeholder="Search or create a note…"
        value={localQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={onKeyDown}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: "grey.200",
                    color: "text.secondary",
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  ⌘K
                </Typography>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "background.paper",
            borderRadius: 0,
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        }}
      />
    </Box>
  );
}

export default Omnibar;
