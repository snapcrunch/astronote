import { useState, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import JSZip from "jszip";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNoteStore } from "../store";

function isMarkdownFile(name: string): boolean {
  return /\.(md|markdown|mdown|mkd|mkdn|mdwn|mdtxt|mdtext|txt)$/i.test(name);
}

function titleFromFilename(name: string): string {
  const basename = name.includes("/") ? name.split("/").pop()! : name;
  return basename.replace(/\.[^.]+$/, "");
}

interface Frontmatter {
  title?: string;
  tags?: string[];
  collection?: string;
  pinned?: boolean;
}

function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const raw = match[1]!;
  const body = match[2]!;
  const frontmatter: Frontmatter = {};

  for (const line of raw.split(/\r?\n/)) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim().toLowerCase();
    const value = line.slice(sep + 1).trim();
    if (key === "title" && value) {
      frontmatter.title = value;
    } else if (key === "tags" && value) {
      frontmatter.tags = value.split(",").map((t) => t.trim()).filter(Boolean);
    } else if (key === "collection" && value) {
      frontmatter.collection = value;
    } else if (key === "pinned") {
      frontmatter.pinned = value.toLowerCase() === "true";
    }
  }

  return { frontmatter, body };
}

function ImportSection() {
  const importNote = useNoteStore((s) => s.importNote);
  const fetchNotes = useNoteStore((s) => s.fetchNotes);
  const fetchTags = useNoteStore((s) => s.fetchTags);
  const fetchCollections = useNoteStore((s) => s.fetchCollections);
  const createCollection = useNoteStore((s) => s.createCollection);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolveCollectionId = useCallback(
    async (name: string): Promise<number> => {
      const collections = useNoteStore.getState().collections;
      const existing = collections.find((c) => c.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing.id;
      await createCollection(name);
      const updated = useNoteStore.getState().collections;
      const created = updated.find((c) => c.name.toLowerCase() === name.toLowerCase());
      return created!.id;
    },
    [createCollection],
  );

  const importMarkdownFiles = useCallback(
    async (files: { name: string; content: string }[]) => {
      const validFiles = files.filter((f) => titleFromFilename(f.name));
      if (validFiles.length === 0) {
        setStatus("No markdown files found.");
        setTimeout(() => setStatus(null), 3000);
        return;
      }

      setProgress({ current: 0, total: validFiles.length });
      useNoteStore.setState({ importing: true });

      try {
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i]!;
          const { frontmatter, body } = parseFrontmatter(file.content);
          const title = frontmatter.title || titleFromFilename(file.name);
          const tags = frontmatter.tags;
          let collectionId: number | undefined;
          if (frontmatter.collection) {
            collectionId = await resolveCollectionId(frontmatter.collection);
          }
          await importNote(title, body, { tags, collectionId, pinned: frontmatter.pinned });
          setProgress({ current: i + 1, total: validFiles.length });
        }
        await fetchNotes();
        fetchTags();
        fetchCollections();
      } finally {
        useNoteStore.setState({ importing: false });
        setProgress(null);
      }
    },
    [importNote, fetchNotes, fetchTags, fetchCollections, resolveCollectionId],
  );

  const processFiles = useCallback(
    async (fileList: File[]) => {
      const mdFiles: { name: string; content: string }[] = [];
      let zipFile: File | null = null;

      for (const file of fileList) {
        if (file.name.endsWith(".zip")) {
          zipFile = file;
        } else if (isMarkdownFile(file.name)) {
          const content = await file.text();
          mdFiles.push({ name: file.name, content });
        }
      }

      if (zipFile) {
        const buf = await zipFile.arrayBuffer();
        const zip = await JSZip.loadAsync(buf);
        const entries = Object.entries(zip.files);
        for (const [path, entry] of entries) {
          if (entry.dir) continue;
          if (!isMarkdownFile(path)) continue;
          const content = await entry.async("string");
          mdFiles.push({ name: path, content });
        }
      }

      if (mdFiles.length === 0) {
        setStatus("No markdown files found.");
        setTimeout(() => setStatus(null), 3000);
        return;
      }

      await importMarkdownFiles(mdFiles);
    },
    [importMarkdownFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [processFiles],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) processFiles(files);
      e.target.value = "";
    },
    [processFiles],
  );

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
