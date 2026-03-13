import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Paper from "@mui/material/Paper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNoteStore } from "../store";
import { useIsMobile } from "../hooks";
import type { ThemeId, DefaultView } from "@repo/types";
import { themes as themeEntries } from "../themes";
import ImportSection from "./ImportSection";

function ResetSection({ onReset }: { onReset: () => Promise<void> }) {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    setOpen(false);
    await onReset();
  };

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2, mt: 3, bgcolor: "#fff" }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Reset
        </Typography>
        <Button variant="outlined" color="error" onClick={() => setOpen(true)}>
          Reset All Data
        </Button>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Reset All Data</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete all notes, collections, and tags, and
            revert all settings to their default values. This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirm} color="error">Reset</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function SettingsView() {
  const isMobile = useIsMobile();
  const setView = useNoteStore((s) => s.setView);
  const collections = useNoteStore((s) => s.collections);
  const deleteCollection = useNoteStore((s) => s.deleteCollection);
  const setDefaultCollection = useNoteStore((s) => s.setDefaultCollection);
  const settings = useNoteStore((s) => s.settings);
  const settingsLoaded = useNoteStore((s) => s.settingsLoaded);
  const updateSettings = useNoteStore((s) => s.updateSettings);
  const resetAll = useNoteStore((s) => s.resetAll);

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
        <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fff" }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Collections
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
                      color={c.isDefault ? "primary" : "default"}
                      title={c.isDefault ? "Default collection" : "Set as default"}
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
            </tbody>
          </Box>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, mt: 3, bgcolor: "#fff" }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Default Note View
          </Typography>
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
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
            Show Note Metadata By Default
          </Typography>
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
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
            Theme
          </Typography>
          <Select
            variant="standard"
            value={draft.theme}
            onChange={(e) => setDraft({ ...draft, theme: e.target.value as ThemeId })}
            size="small"
            sx={{ minWidth: 200 }}
          >
            {Object.entries(themeEntries)
              .sort(([, a], [, b]) => a.label.localeCompare(b.label))
              .map(([id, { label }]) => (
                <MenuItem key={id} value={id}>{label}</MenuItem>
              ))}
          </Select>
        </Paper>
        <ImportSection />
        <ResetSection onReset={resetAll} />
      </Box>
    </Box>
  );
}

export default SettingsView;
