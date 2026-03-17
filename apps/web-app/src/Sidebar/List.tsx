import { useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import Box from '@mui/material/Box';
import MuiList from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import type { Note } from '@repo/types';
import { useNoteStore } from '../store';

interface NestedMenuItemProps {
  label: string;
  leftIcon?: React.ReactNode;
  parentMenuOpen: boolean;
  children: React.ReactNode;
}

function NestedMenuItem({
  label,
  leftIcon,
  parentMenuOpen,
  children,
}: NestedMenuItemProps) {
  const menuItemRef = useRef<HTMLLIElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!parentMenuOpen) setIsOpen(false);
  }, [parentMenuOpen]);

  return (
    <>
      <MenuItem
        ref={menuItemRef}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {leftIcon && <ListItemIcon>{leftIcon}</ListItemIcon>}
        <ListItemText>{label}</ListItemText>
        <ChevronRightIcon fontSize="small" sx={{ color: 'text.secondary' }} />
      </MenuItem>
      <Menu
        anchorEl={menuItemRef.current}
        open={isOpen && parentMenuOpen}
        onClose={() => setIsOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        style={{ pointerEvents: 'none' }}
        MenuListProps={{
          dense: true,
          style: { pointerEvents: 'auto' },
          onMouseLeave: () => setIsOpen(false),
        }}
        autoFocus={false}
        disableAutoFocus
      >
        {children}
      </Menu>
    </>
  );
}

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  listRef: React.RefObject<HTMLUListElement | null>;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onItemKeyDown: (e: React.KeyboardEvent, index: number) => void;
  onRenameNote?: (noteId: string, currentTitle: string) => void;
}

function formatDate(dateStr: string) {
  return moment(dateStr).fromNow();
}

function useIsScrollable(
  contentRef: React.RefObject<HTMLElement | null>,
  viewportRef: React.RefObject<HTMLElement | null>
) {
  const [scrollable, setScrollable] = useState(false);
  const check = useCallback(() => {
    const content = contentRef.current;
    const viewport = viewportRef.current;
    if (content && viewport) {
      setScrollable(content.scrollHeight > viewport.clientHeight);
    } else if (content) {
      setScrollable(content.scrollHeight > content.clientHeight);
    }
  }, [contentRef, viewportRef]);
  useEffect(() => {
    const content = contentRef.current;
    const viewport = viewportRef.current;
    if (!content) return;
    check();
    const ro = new ResizeObserver(check);
    ro.observe(content);
    if (viewport) ro.observe(viewport);
    return () => ro.disconnect();
  }, [contentRef, viewportRef, check]);
  return scrollable;
}

function NoteList({
  notes,
  selectedNoteId,
  listRef,
  onSelectNote,
  onDeleteNote,
  onItemKeyDown,
  onRenameNote,
}: NoteListProps) {
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const isScrollable = useIsScrollable(listRef, scrollViewportRef);
  const searchQuery = useNoteStore((s) => s.searchQuery);
  const loadingNotes = useNoteStore((s) => s.loadingNotes);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    noteId: string;
  } | null>(null);
  const allTags = useNoteStore((s) => s.tags);
  const collections = useNoteStore((s) => s.collections);
  const activeCollectionId = useNoteStore((s) => s.activeCollectionId);
  const addTag = useNoteStore((s) => s.addTag);
  const removeTag = useNoteStore((s) => s.removeTag);
  const updateNote = useNoteStore((s) => s.updateNote);

  const contextMenuNote = contextMenu
    ? notes.find((n) => n.id === contextMenu.noteId)
    : null;

  const handleContextMenu = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, noteId });
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (contextMenu) onDeleteNote(contextMenu.noteId);
    handleClose();
  };

  const handleToggleTag = (tag: string) => {
    if (!contextMenuNote) return;
    if (contextMenuNote.tags.includes(tag)) {
      removeTag(contextMenuNote.id, tag);
    } else {
      addTag(contextMenuNote.id, tag);
    }
  };

  const handleTogglePin = () => {
    if (!contextMenuNote) return;
    updateNote(contextMenuNote.id, { pinned: !contextMenuNote.pinned });
    handleClose();
  };

  const handleMoveToCollection = (collectionId: number) => {
    if (!contextMenuNote) return;
    updateNote(contextMenuNote.id, { collectionId });
    handleClose();
  };

  const handleRenameClick = () => {
    if (!contextMenu) return;
    const note = notes.find((n) => n.id === contextMenu.noteId);
    if (!note) return;
    onRenameNote?.(contextMenu.noteId, note.title);
    handleClose();
  };

  return (
    <>
      <div ref={scrollViewportRef} style={{ flex: 1, overflow: 'hidden' }}>
        <OverlayScrollbarsComponent
          style={{ height: '100%', overscrollBehavior: 'none' }}
          options={{ scrollbars: { autoHide: 'move' } }}
        >
          <MuiList ref={listRef} sx={{ pt: 0 }} disablePadding>
            {loadingNotes &&
              notes.length === 0 &&
              Array.from({ length: 6 }, (_, i) => (
                <Box
                  key={i}
                  sx={{
                    px: 2,
                    py: 0.25,
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Skeleton
                    variant="text"
                    width="60%"
                    sx={{ fontSize: '0.875rem' }}
                  />
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Skeleton
                      variant="text"
                      width={70}
                      sx={{ fontSize: '0.75rem' }}
                    />
                    <Skeleton
                      variant="text"
                      width={50}
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Box>
                </Box>
              ))}
            {notes.map((note, index) => (
              <ListItemButton
                key={note.id}
                selected={note.id === selectedNoteId}
                onMouseDown={(e) => {
                  if (e.button !== 2) onSelectNote(note.id);
                }}
                onContextMenu={(e) => handleContextMenu(e, note.id)}
                onKeyDown={(e) => onItemKeyDown(e, index)}
                disableRipple
                sx={{
                  mx: 0,
                  borderRadius: 0,
                  py: 0.25,
                  px: 2,
                  borderBottom:
                    isScrollable && index === notes.length - 1 ? 0 : 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  transition: 'background-color 75ms ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  '&.Mui-focusVisible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '-2px',
                  },
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '&.Mui-focusVisible': {
                      bgcolor: 'primary.main',
                    },
                    '& .MuiListItemText-secondary': {
                      color: 'primary.contrastText',
                      opacity: 0.7,
                    },
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box
                      component="span"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      {note.pinned && (
                        <PushPinIcon
                          sx={{
                            fontSize: 12,
                            flexShrink: 0,
                            color: 'error.main',
                          }}
                        />
                      )}
                      <Box
                        component="span"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {note.title}
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box
                      component="span"
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        noWrap
                        component="span"
                        sx={{ flexShrink: 0 }}
                      >
                        {formatDate(note.updatedAt)}
                      </Typography>
                      <Typography
                        variant="caption"
                        noWrap
                        component="span"
                        sx={{ flexShrink: 1, minWidth: 0 }}
                      >
                        {note.tags.join(', ')}
                      </Typography>
                    </Box>
                  }
                  primaryTypographyProps={{
                    variant: 'body2',
                    component: 'div',
                    fontWeight: 500,
                    sx: { lineHeight: 1.2 },
                  }}
                  secondaryTypographyProps={{
                    component: 'div',
                  }}
                />
              </ListItemButton>
            ))}
            {notes.length === 0 && !loadingNotes && searchQuery && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No notes found.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Press Enter to create &quot;{searchQuery}&quot;
                </Typography>
              </Box>
            )}
            {notes.length === 0 && !loadingNotes && !searchQuery && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No notes yet. Type in the search bar and press Enter to create
                  one.
                </Typography>
              </Box>
            )}
          </MuiList>
        </OverlayScrollbarsComponent>
      </div>
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        MenuListProps={{ dense: true }}
      >
        <MenuItem onClick={handleTogglePin}>
          <ListItemIcon>
            {contextMenuNote?.pinned ? (
              <PushPinIcon fontSize="small" />
            ) : (
              <PushPinOutlinedIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {contextMenuNote?.pinned ? 'Unpin' : 'Pin'}
          </ListItemText>
        </MenuItem>
        <NestedMenuItem
          parentMenuOpen={contextMenu !== null}
          label="Tags"
          leftIcon={<LocalOfferIcon fontSize="small" />}
        >
          {allTags.length === 0 ? (
            <MenuItem disabled>
              <ListItemText>No tags</ListItemText>
            </MenuItem>
          ) : (
            [...allTags]
              .sort((a, b) => a.tag.localeCompare(b.tag))
              .map(({ tag }) => {
                const isApplied = contextMenuNote?.tags.includes(tag) ?? false;
                return (
                  <MenuItem
                    key={tag}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleTag(tag);
                    }}
                  >
                    <ListItemIcon>
                      {isApplied ? (
                        <CheckIcon fontSize="small" />
                      ) : (
                        <CheckIcon
                          fontSize="small"
                          sx={{ visibility: 'hidden' }}
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText>{tag}</ListItemText>
                  </MenuItem>
                );
              })
          )}
        </NestedMenuItem>
        <NestedMenuItem
          parentMenuOpen={contextMenu !== null}
          label="Collection"
          leftIcon={<DriveFileMoveOutlinedIcon fontSize="small" />}
        >
          {collections.filter((c) => c.id !== activeCollectionId).length ===
          0 ? (
            <MenuItem disabled>
              <ListItemText>No other collections</ListItemText>
            </MenuItem>
          ) : (
            collections
              .filter((c) => c.id !== activeCollectionId)
              .map((c) => (
                <MenuItem
                  key={c.id}
                  onClick={() => handleMoveToCollection(c.id)}
                >
                  <ListItemText inset>{c.name}</ListItemText>
                </MenuItem>
              ))
          )}
        </NestedMenuItem>
        <MenuItem onClick={handleRenameClick}>
          <ListItemIcon>
            <DriveFileRenameOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

export default NoteList;
