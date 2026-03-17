import { useState, useCallback, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';
import { useNoteStore, useSelectedNote } from '../store';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { useIsMobile } from '../hooks';
import InfoPanel from '../InfoPanel';
import MarkdownEditor from '../MarkdownEditor';
import CodeBlock from './CodeBlock';
import { headingComponents } from './HeadingWithId';
import rehypeWikiLinks from './rehypeWikiLinks';
import WikiLink from './WikiLink';
import { useDebouncedNoteUpdate, useEditingState } from './hooks';
import Placeholder from './Placeholder';
import * as styles from './styles';

// Rehype plugin: stamps each task-list checkbox with a stable data-checkbox-index
// attribute during processing, before React ever touches it.
function rehypeNumberCheckboxes() {
  return (tree: Root) => {
    let index = 0;
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'input' && node.properties?.type === 'checkbox') {
        node.properties['data-checkbox-index'] = index++;
      }
    });
  };
}

const rehypePlugins = [rehypeNumberCheckboxes, rehypeWikiLinks];

function NoteEditor() {
  const isMobile = useIsMobile();
  const showInfoPanel = useNoteStore((s) => s.showInfoPanel);
  const toggleInfoPanel = useNoteStore((s) => s.toggleInfoPanel);
  const setSelectedNoteId = useNoteStore((s) => s.setSelectedNoteId);
  const note = useSelectedNote();
  const notes = useNoteStore((s) => s.notes);
  const updateNote = useNoteStore((s) => s.updateNote);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [checkboxContent, setCheckboxContent] = useState<string | null>(null);
  const { editing, setEditing } = useEditingState(note?.id);
  const { debouncedUpdateNote, flushPendingUpdate } =
    useDebouncedNoteUpdate(updateNote);

  const flushAndExitEdit = useCallback(() => {
    flushPendingUpdate();
    setEditing(false);
  }, [flushPendingUpdate, setEditing]);

  const editingRef = useRef(editing);
  editingRef.current = editing;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('[role="dialog"]')) return;
      if (e.key !== 'Escape') return;
      if (editingRef.current) {
        flushAndExitEdit();
        return;
      }
      setSelectedNoteId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedNoteId, flushAndExitEdit, setEditing]);

  // Clear optimistic checkbox state when switching notes or entering edit mode
  useEffect(() => {
    setCheckboxContent(null);
  }, [note?.id, editing]);

  if (!note) {
    return <Placeholder />;
  }

  const displayContent = checkboxContent ?? note.content;

  const handleCheckboxToggle = (index: number) => {
    let count = 0;
    const newContent = displayContent.replace(/\[([ x])\]/g, (match, state) => {
      if (count++ === index) return `[${state === ' ' ? 'x' : ' '}]`;
      return match;
    });
    setCheckboxContent(newContent);
    updateNote(note.id, { content: newContent });
  };

  const markdownComponents = {
    pre: CodeBlock,
    ...headingComponents,
    'wiki-link': WikiLink,
    input({
      checked,
      type,
      'data-checkbox-index': dataIndex,
      ...props
    }: React.ComponentPropsWithoutRef<'input'> & {
      'data-checkbox-index'?: number;
    }) {
      if (type !== 'checkbox')
        return <input type={type} checked={checked} {...props} />;
      return (
        <input
          type="checkbox"
          checked={checked}
          onChange={() => handleCheckboxToggle(Number(dataIndex))}
          style={{ cursor: 'pointer' }}
        />
      );
    },
  };

  return (
    <Box
      sx={styles.root}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && editingRef.current) e.stopPropagation();
      }}
    >
      <Box sx={styles.toolbar(isMobile)}>
        {isMobile && (
          <IconButton
            size="small"
            onClick={() => setSelectedNoteId(null)}
            title="Back"
          >
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
          title={editing ? 'View' : 'Edit'}
        >
          {editing ? (
            <VisibilityIcon fontSize="small" />
          ) : (
            <EditIcon fontSize="small" />
          )}
        </IconButton>
        {!isMobile && (
          <IconButton
            size="small"
            onClick={toggleInfoPanel}
            title={showInfoPanel ? 'Hide info panel' : 'Show info panel'}
            color={showInfoPanel ? 'primary' : 'default'}
          >
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      {isMobile && mobileInfoOpen ? (
        <InfoPanel variant="inline" />
      ) : (
        <OverlayScrollbarsComponent
          style={{ flex: 1 }}
          options={{ scrollbars: { autoHide: 'move' } }}
        >
          <Box sx={styles.contentAreaInner(isMobile)}>
            {editing ? (
              <MarkdownEditor
                value={note.content}
                onChange={(content) => {
                  if (content !== note.content)
                    debouncedUpdateNote(note.id, { content });
                }}
                onEscape={flushAndExitEdit}
                autoFocus
                notes={notes}
                currentNoteId={note.id}
              />
            ) : (
              <Box sx={styles.markdownContent}>
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={rehypePlugins}
                  components={markdownComponents}
                >
                  {displayContent}
                </Markdown>
              </Box>
            )}
          </Box>
        </OverlayScrollbarsComponent>
      )}
      {isMobile && (
        <Box
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            pb: 'env(safe-area-inset-bottom)',
          }}
        >
          <BottomNavigation
            sx={{ minHeight: 0, height: 40 }}
            value={mobileInfoOpen ? 1 : 0}
            onChange={(_, newValue) => setMobileInfoOpen(newValue === 1)}
            showLabels
          >
            <BottomNavigationAction
              label="Note"
              icon={<DescriptionOutlinedIcon />}
            />
            <BottomNavigationAction label="Info" icon={<InfoOutlinedIcon />} />
          </BottomNavigation>
        </Box>
      )}
    </Box>
  );
}

export default NoteEditor;
