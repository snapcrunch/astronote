import { useState, useCallback, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";
import { useNoteStore, useSelectedNote } from "../store";
import { useIsMobile } from "../hooks";
import InfoPanel from "../InfoPanel";
import MarkdownEditor from "../MarkdownEditor";
import CodeBlock from "./CodeBlock";
import { headingComponents } from "./HeadingWithId";
import { useDebouncedNoteUpdate, useEditingState } from "./hooks";
import Placeholder from "./Placeholder";
import * as styles from "./styles";

// Rehype plugin: stamps each task-list checkbox with a stable data-checkbox-index
// attribute during processing, before React ever touches it.
function rehypeNumberCheckboxes() {
  return (tree: Root) => {
    let index = 0;
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "input" && node.properties?.type === "checkbox") {
        node.properties["data-checkbox-index"] = index++;
      }
    });
  };
}

const rehypePlugins = [rehypeNumberCheckboxes];

function NoteEditor() {
  const isMobile = useIsMobile();
  const showInfoPanel = useNoteStore((s) => s.showInfoPanel);
  const toggleInfoPanel = useNoteStore((s) => s.toggleInfoPanel);
  const setSelectedNoteId = useNoteStore((s) => s.setSelectedNoteId);
  const note = useSelectedNote();
  const updateNote = useNoteStore((s) => s.updateNote);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [checkboxContent, setCheckboxContent] = useState<string | null>(null);
  const { editing, setEditing } = useEditingState(note?.id);
  const { debouncedUpdateNote, flushPendingUpdate } = useDebouncedNoteUpdate(updateNote);

  const flushAndExitEdit = useCallback(() => {
    flushPendingUpdate();
    setEditing(false);
  }, [flushPendingUpdate, setEditing]);

  const editingRef = useRef(editing);
  editingRef.current = editing;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !editingRef.current) {
        e.preventDefault();
        setEditing(true);
        return;
      }
      if (e.key !== "Escape") return;
      if (editingRef.current) {
        flushAndExitEdit();
        return;
      }
      setSelectedNoteId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSelectedNoteId, flushAndExitEdit, setEditing]);

  // Clear optimistic checkbox state when switching notes or entering edit mode
  useEffect(() => { setCheckboxContent(null); }, [note?.id, editing]);

  if (!note) {
    return <Placeholder />;
  }

  const displayContent = checkboxContent ?? note.content;

  const handleCheckboxToggle = (index: number) => {
    let count = 0;
    const newContent = displayContent.replace(/\[([ x])\]/g, (match, state) => {
      if (count++ === index) return `[${state === " " ? "x" : " "}]`;
      return match;
    });
    setCheckboxContent(newContent);
    updateNote(note.id, { content: newContent });
  };

  const markdownComponents = {
    pre: CodeBlock,
    ...headingComponents,
    input({ checked, type, "data-checkbox-index": dataIndex, ...props }: React.ComponentPropsWithoutRef<"input"> & { "data-checkbox-index"?: number }) {
      if (type !== "checkbox") return <input type={type} checked={checked} {...props} />;
      return (
        <input
          type="checkbox"
          checked={checked}
          onChange={() => handleCheckboxToggle(Number(dataIndex))}
          style={{ cursor: "pointer" }}
        />
      );
    },
  };

  return (
    <Box sx={styles.root} onKeyDown={(e) => { if (e.key === "Escape" && editingRef.current) e.stopPropagation(); }}>
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
              <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={rehypePlugins} components={markdownComponents}>{displayContent}</Markdown>
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
