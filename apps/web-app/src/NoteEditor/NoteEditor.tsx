import { useState, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNoteStore, useSelectedNote } from "../store";
import { useIsMobile } from "../hooks";
import InfoPanel from "../InfoPanel";
import MarkdownEditor from "../MarkdownEditor";
import CodeBlock from "./CodeBlock";
import { headingComponents } from "./HeadingWithId";
import { useDebouncedNoteUpdate, useEditingState } from "./hooks";
import Placeholder from "./Placeholder";
import * as styles from "./styles";

function NoteEditor() {
  const isMobile = useIsMobile();
  const showInfoPanel = useNoteStore((s) => s.showInfoPanel);
  const toggleInfoPanel = useNoteStore((s) => s.toggleInfoPanel);
  const setSelectedNoteId = useNoteStore((s) => s.setSelectedNoteId);
  const note = useSelectedNote();
  const updateNote = useNoteStore((s) => s.updateNote);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const { editing, setEditing } = useEditingState(note?.id);
  const { debouncedUpdateNote, flushPendingUpdate } = useDebouncedNoteUpdate(updateNote);

  const flushAndExitEdit = useCallback(() => {
    flushPendingUpdate();
    setEditing(false);
  }, [flushPendingUpdate, setEditing]);

  useEffect(() => {
    if (editing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedNoteId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editing, setSelectedNoteId]);

  if (!note) {
    return <Placeholder />;
  }

  return (
    <Box sx={styles.root}>
      <Box sx={styles.toolbar(isMobile)}>
        {isMobile && (
          <IconButton size="small" onClick={() => setSelectedNoteId(null)} title="Back">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}
        <Box sx={styles.titleWrapper}>
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
        {!isMobile && (
          <IconButton
            size="small"
            onClick={toggleInfoPanel}
            title={showInfoPanel ? "Hide info panel" : "Show info panel"}
            color={showInfoPanel ? "primary" : "default"}
          >
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      {isMobile && mobileInfoOpen ? (
        <InfoPanel variant="inline" />
      ) : (
        <Box sx={styles.contentArea(isMobile)}>
          {editing ? (
            <MarkdownEditor
              value={note.content}
              onChange={(content) => debouncedUpdateNote(note.id, { content })}
              onEscape={flushAndExitEdit}
              autoFocus
            />
          ) : (
            <Box sx={styles.markdownContent}>
              <Markdown remarkPlugins={[remarkGfm]} components={{ pre: CodeBlock, ...headingComponents }}>{note.content}</Markdown>
            </Box>
          )}
        </Box>
      )}
      {isMobile && (
        <Box
          onClick={() => setMobileInfoOpen((prev) => !prev)}
          sx={styles.mobileInfoToggle}
        >
          <InfoOutlinedIcon sx={{ fontSize: 16, color: mobileInfoOpen ? "primary.main" : "text.secondary" }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: mobileInfoOpen ? "primary.main" : "text.secondary" }}>
            Info
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default NoteEditor;
