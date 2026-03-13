import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNoteStore } from "../store";
import { useIsMobile } from "../hooks";
import type { ThemeId, DefaultView } from "@repo/types";
import { themes as themeEntries } from "../themes";

function SettingsView() {
  const isMobile = useIsMobile();
  const setView = useNoteStore((s) => s.setView);
  const settings = useNoteStore((s) => s.settings);
  const settingsLoaded = useNoteStore((s) => s.settingsLoaded);
  const updateSettings = useNoteStore((s) => s.updateSettings);

  const [draft, setDraft] = useState(settings);
  const dirty = draft.default_view !== settings.default_view
    || draft.show_info_panel !== settings.show_info_panel
    || draft.theme !== settings.theme;

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({
      default_view: draft.default_view,
      show_info_panel: draft.show_info_panel,
      theme: draft.theme,
    });
  };

  if (!settingsLoaded) return null;

  return (
    <Box
      sx={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: isMobile ? 1.5 : 3,
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "grey.100",
          borderBottom: 1,
          borderColor: "divider",
          height: 40,
          minHeight: 40,
          boxSizing: "content-box",
        }}
      >
        {isMobile && (
          <IconButton size="small" onClick={() => setView("notes")} title="Back">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Settings
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          size="small"
          disabled={!dirty}
          onClick={handleSave}
        >
          Save
        </Button>
      </Box>
      <Box sx={{ flex: 1, px: 3, py: 3, overflow: "auto", bgcolor: "#ECECED" }}>
        <Paper variant="outlined" sx={{ p: 2, mt: 3, bgcolor: "#fff" }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Preferences
          </Typography>
          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              "& th, & td": {
                textAlign: "left",
                py: 0.75,
                px: 1,
                borderBottom: 1,
                borderColor: "divider",
              },
              "& th": {
                fontWeight: 600,
                fontSize: "0.75rem",
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              },
            }}
          >
            <thead>
              <tr>
                <th>Setting</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Typography variant="body2">Default Note View</Typography>
                </td>
                <td>
                  <Select
                    variant="standard"
                    value={draft.default_view}
                    onChange={(e) => setDraft({ ...draft, default_view: e.target.value as DefaultView })}
                    size="small"
                    sx={{ minWidth: 200 }}
                  >
                    <MenuItem value="renderer">Renderer</MenuItem>
                    <MenuItem value="editor">Editor</MenuItem>
                  </Select>
                </td>
              </tr>
              <tr>
                <td>
                  <Typography variant="body2">Show Note Metadata By Default</Typography>
                </td>
                <td>
                  <Select
                    variant="standard"
                    value={draft.show_info_panel ? "yes" : "no"}
                    onChange={(e) => setDraft({ ...draft, show_info_panel: e.target.value === "yes" })}
                    size="small"
                    sx={{ minWidth: 200 }}
                  >
                    <MenuItem value="yes">Open</MenuItem>
                    <MenuItem value="no">Closed</MenuItem>
                  </Select>
                </td>
              </tr>
            </tbody>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default SettingsView;
