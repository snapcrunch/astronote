import { useState } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Paper from "@mui/material/Paper";

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

export default ResetSection;
