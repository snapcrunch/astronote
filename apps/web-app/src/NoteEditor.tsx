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
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNoteStore, useSelectedNote } from "./store";
import type { ThemeId, DefaultView } from "@repo/types";
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
          value={settings.default_view}
          onChange={(e) => updateSettings({ default_view: e.target.value as DefaultView })}
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
          value={settings.show_info_panel ? "yes" : "no"}
          onChange={(e) => updateSettings({ show_info_panel: e.target.value === "yes" })}
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
          value={settings.theme}
          onChange={(e) => updateSettings({ theme: e.target.value as ThemeId })}
          size="small"
          sx={{ minWidth: 200 }}
        >
          {Object.entries(themeEntries)
            .sort(([, a], [, b]) => a.label.localeCompare(b.label))
            .map(([id, { label }]) => (
              <MenuItem key={id} value={id}>{label}</MenuItem>
            ))}
        </Select>
      </Box>
    </Box>
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
