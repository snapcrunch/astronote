import { useState, useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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
import LinearProgress from "@mui/material/LinearProgress";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import JSZip from "jszip";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNoteStore, useSelectedNote } from "./store";
import TextField from "@mui/material/TextField";
import type { ThemeId, DefaultView, AuthMethod } from "@repo/types";
import { themes as themeEntries } from "./themes";
import MarkdownEditor from "./MarkdownEditor";
import { slugify } from "./utils";

function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return extractText((children as React.ReactElement<{ children?: React.ReactNode }>).props.children);
  }
  return "";
}

function HeadingWithId({ level, children, ...props }: React.PropsWithChildren<{ level: number } & React.HTMLAttributes<HTMLHeadingElement>>) {
  const Tag = `h${level}` as React.ElementType;
  const id = slugify(extractText(children));
  return <Tag id={id} {...props}>{children}</Tag>;
}

const headingComponents = {
  h1: (props: React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) => <HeadingWithId level={1} {...props} />,
  h2: (props: React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) => <HeadingWithId level={2} {...props} />,
  h3: (props: React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) => <HeadingWithId level={3} {...props} />,
  h4: (props: React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) => <HeadingWithId level={4} {...props} />,
  h5: (props: React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) => <HeadingWithId level={5} {...props} />,
  h6: (props: React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) => <HeadingWithId level={6} {...props} />,
};

function CodeBlock({ children, ...props }: React.PropsWithChildren<React.ComponentPropsWithoutRef<"pre">>) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const code = (children as any)?.props?.children ?? "";
    navigator.clipboard.writeText(String(code).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        component="pre"
        {...props}
        sx={{
          bgcolor: "grey.100",
          p: 2,
          borderRadius: 1,
          overflow: "auto",
          fontSize: "0.875rem",
          border: 1,
          borderColor: "divider",
        }}
      >
        {children}
      </Box>
      <IconButton
        size="small"
        onClick={handleCopy}
        title="Copy to clipboard"
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          opacity: 0.7,
          "&:hover": { opacity: 1, bgcolor: "background.paper" },
          width: 28,
          height: 28,
        }}
      >
        {copied ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
      </IconButton>
    </Box>
  );
}

function SettingsView() {
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
    || draft.theme !== settings.theme
    || draft.auth_method !== settings.auth_method
    || draft.auth_username !== settings.auth_username
    || draft.auth_password !== settings.auth_password;

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({
      default_view: draft.default_view,
      show_info_panel: draft.show_info_panel,
      theme: draft.theme,
      auth_method: draft.auth_method,
      auth_username: draft.auth_username,
      auth_password: draft.auth_password,
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
          px: 3,
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
      <Box sx={{ flex: 1, px: 3, py: 3, overflow: "auto" }}>
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
        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
          Default View
        </Typography>
        <Select
          value={draft.default_view}
          onChange={(e) => setDraft({ ...draft, default_view: e.target.value as DefaultView })}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="renderer">Renderer</MenuItem>
          <MenuItem value="editor">Editor</MenuItem>
        </Select>
        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
          Show Info Panel
        </Typography>
        <Select
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
        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
          Authentication
        </Typography>
        <Select
          value={draft.auth_method}
          onChange={(e) => setDraft({ ...draft, auth_method: e.target.value as AuthMethod })}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="none">None</MenuItem>
          <MenuItem value="basic">HTTP Basic Auth</MenuItem>
        </Select>
        {draft.auth_method === "basic" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1.5, maxWidth: 300 }}>
            <TextField
              label="Username"
              size="small"
              value={draft.auth_username}
              onChange={(e) => setDraft({ ...draft, auth_username: e.target.value })}
            />
            <TextField
              label="Password"
              size="small"
              type="password"
              value={draft.auth_password}
              onChange={(e) => setDraft({ ...draft, auth_password: e.target.value })}
            />
          </Box>
        )}
        <ImportSection />
        <ResetSection onReset={resetAll} />
      </Box>
    </Box>
  );
}

function isMarkdownFile(name: string): boolean {
  return /\.(md|markdown|mdown|mkd|mkdn|mdwn|mdtxt|mdtext|txt)$/i.test(name);
}

function titleFromFilename(name: string): string {
  const basename = name.includes("/") ? name.split("/").pop()! : name;
  return basename.replace(/\.[^.]+$/, "");
}

function ImportSection() {
  const importNote = useNoteStore((s) => s.importNote);
  const fetchNotes = useNoteStore((s) => s.fetchNotes);
  const fetchTags = useNoteStore((s) => s.fetchTags);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          await importNote(titleFromFilename(file.name), file.content);
          setProgress({ current: i + 1, total: validFiles.length });
        }
        await fetchNotes();
        fetchTags();
      } finally {
        useNoteStore.setState({ importing: false });
        setProgress(null);
      }
    },
    [importNote, fetchNotes, fetchTags],
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
      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
        Import
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

function ResetSection({ onReset }: { onReset: () => Promise<void> }) {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    setOpen(false);
    await onReset();
  };

  return (
    <>
      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
        Reset
      </Typography>
      <Button variant="outlined" color="error" onClick={() => setOpen(true)}>
        Reset All Data
      </Button>
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

function NoteEditor() {
  const view = useNoteStore((s) => s.view);
  const showInfoPanel = useNoteStore((s) => s.showInfoPanel);
  const toggleInfoPanel = useNoteStore((s) => s.toggleInfoPanel);
  const note = useSelectedNote();
  const updateNote = useNoteStore((s) => s.updateNote);
  const [editing, setEditing] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const pendingUpdate = useRef<{ id: string; updates: Parameters<typeof updateNote>[1] } | null>(null);

  const debouncedUpdateNote = useCallback(
    (id: string, updates: Parameters<typeof updateNote>[1]) => {
      pendingUpdate.current = { id, updates };
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        pendingUpdate.current = null;
        updateNote(id, updates);
      }, 500);
    },
    [updateNote],
  );

  const flushAndExitEdit = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    if (pendingUpdate.current) {
      const { id, updates } = pendingUpdate.current;
      pendingUpdate.current = null;
      updateNote(id, updates);
    }
    setEditing(false);
  }, [updateNote]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  useEffect(() => {
    const { editOnCreate, settings } = useNoteStore.getState();
    if (editOnCreate) {
      setEditing(true);
      useNoteStore.setState({ editOnCreate: false });
    } else {
      setEditing(settings.default_view === "editor");
    }
  }, [note?.id]);

  if (view === "settings") {
    return <SettingsView />;
  }

  if (!note) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Select a note or create a new one.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Press ⌘⇧P to open the command palette.
        </Typography>
      </Box>
    );
  }

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
          px: 3,
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
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
            {note.title}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={() => setEditing((prev) => !prev)}
          title={editing ? "View" : "Edit"}
        >
          {editing ? <VisibilityIcon fontSize="small" /> : <EditIcon fontSize="small" />}
        </IconButton>
        <IconButton
          size="small"
          onClick={toggleInfoPanel}
          title={showInfoPanel ? "Hide info panel" : "Show info panel"}
          color={showInfoPanel ? "primary" : "default"}
        >
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, px: 3, pb: 3, overflow: "auto" }}>
        {editing ? (
          <MarkdownEditor
            value={note.content}
            onChange={(content) => debouncedUpdateNote(note.id, { content })}
            onEscape={flushAndExitEdit}
            autoFocus
          />
        ) : (
          <Box
            sx={{
              "& table": {
                borderCollapse: "collapse",
                width: "100%",
                my: 2,
              },
              "& th, & td": {
                border: 1,
                borderColor: "divider",
                px: 1.5,
                py: 0.75,
                textAlign: "left",
              },
              "& th": {
                bgcolor: "grey.100",
                fontWeight: 600,
              },
              "& code": {
                fontSize: "0.875rem",
                bgcolor: "grey.100",
                px: 0.5,
                borderRadius: 0.5,
              },
              "& pre code": {
                bgcolor: "transparent",
                px: 0,
              },
              "& blockquote": {
                borderLeft: 4,
                borderColor: "grey.300",
                pl: 2,
                ml: 0,
                color: "text.secondary",
                fontStyle: "italic",
              },
              "& img": {
                maxWidth: "100%",
              },
              "& a": {
                color: "primary.main",
              },
              "& hr": {
                border: "none",
                borderTop: 1,
                borderColor: "divider",
                my: 2,
              },
            }}
          >
            <Markdown remarkPlugins={[remarkGfm]} components={{ pre: CodeBlock, ...headingComponents }}>{note.content}</Markdown>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default NoteEditor;
