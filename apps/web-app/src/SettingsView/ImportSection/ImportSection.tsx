import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useImport } from "./hooks";

function ImportSection() {
  const { dragOver, setDragOver, status, progress, fileInputRef, handleDrop, handleFileInput } = useImport();

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2, mt: 3, bgcolor: "#fff" }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Import Notes
        </Typography>
        <Box
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: 2,
            borderStyle: "dashed",
            borderColor: dragOver ? "primary.main" : "divider",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            cursor: "pointer",
            bgcolor: dragOver ? "action.hover" : "transparent",
            transition: "all 0.15s",
          }}
        >
          <UploadFileIcon sx={{ fontSize: 32, color: "text.secondary", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Drag and drop markdown files or a .zip file here, or click to browse.
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.mdown,.mkd,.mkdn,.mdwn,.mdtxt,.mdtext,.txt,.zip"
            multiple
            onChange={handleFileInput}
            hidden
          />
        </Box>
        {status && (
          <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
            {status}
          </Typography>
        )}
      </Paper>
      <Dialog open={progress !== null}>
        <DialogTitle>Importing Notes</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <DialogContentText sx={{ mb: 2 }}>
            {progress && `Importing note ${progress.current} of ${progress.total}...`}
          </DialogContentText>
          <LinearProgress
            variant="determinate"
            value={progress ? (progress.current / progress.total) * 100 : 0}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ImportSection;
