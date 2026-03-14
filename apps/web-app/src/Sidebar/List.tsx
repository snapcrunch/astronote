import { useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import Box from '@mui/material/Box';
import MuiList from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CheckIcon from '@mui/icons-material/Check';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import type { Note } from '@repo/types';
import { useNoteStore } from '../store';

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
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    noteId: string;
  } | null>(null);
  const [tagsMenuOpen, setTagsMenuOpen] = useState(false);
  const [moveMenuOpen, setMoveMenuOpen] = useState(false);
  const tagsMenuAnchorRef = useRef<HTMLLIElement>(null);
  const moveMenuAnchorRef = useRef<HTMLLIElement>(null);
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
    setTagsMenuOpen(false);
    setMoveMenuOpen(false);
  };

  const handleClose = () => {
    setContextMenu(null);
    setTagsMenuOpen(false);
    setMoveMenuOpen(false);
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

  const menuItemSx = { py: 0.25, px: 1, minHeight: 0 };
  const menuIconSx = { minWidth: 22 };
  const menuTextSx = { fontSize: '0.8rem' };

  return (
    <>
      <div ref={scrollViewportRef} style={{ flex: 1, overflow: 'hidden' }}>
        <OverlayScrollbarsComponent
          style={{ height: '100%', overscrollBehavior: 'none' }}
          options={{ scrollbars: { autoHide: 'move' } }}
        >
          <MuiList ref={listRef} sx={{ pt: 0 }} disablePadding>
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
                  bgcolor: index % 2 === 0 ? 'background.paper' : 'grey.50',
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
            {notes.length === 0 && searchQuery && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No notes found.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Press Enter to create "{searchQuery}"
                </Typography>
              </Box>
            )}
            {notes.length === 0 && !searchQuery && (
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
        slotProps={{ paper: { sx: { minWidth: 100, py: 0.25 } } }}
      >
        <MenuItem onClick={handleTogglePin} dense sx={menuItemSx}>
          <ListItemIcon sx={menuIconSx}>
            {contextMenuNote?.pinned ? (
              <PushPinIcon sx={{ fontSize: 14 }} />
            ) : (
              <PushPinOutlinedIcon sx={{ fontSize: 14 }} />
            )}
          </ListItemIcon>
          <Typography variant="body2" sx={menuTextSx}>
            {contextMenuNote?.pinned ? 'Unpin' : 'Pin'}
          </Typography>
        </MenuItem>
        <MenuItem
          ref={tagsMenuAnchorRef}
          onClick={() => setTagsMenuOpen(true)}
          dense
          sx={menuItemSx}
        >
          <ListItemIcon sx={menuIconSx}>
            <LocalOfferIcon sx={{ fontSize: 14 }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ ...menuTextSx, flex: 1 }}>
            Tags
          </Typography>
          <ChevronRightIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
        </MenuItem>
        <MenuItem
          ref={moveMenuAnchorRef}
          onClick={() => setMoveMenuOpen(true)}
          dense
          sx={menuItemSx}
        >
          <ListItemIcon sx={menuIconSx}>
            <DriveFileMoveOutlinedIcon sx={{ fontSize: 14 }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ ...menuTextSx, flex: 1 }}>
            Collection
          </Typography>
          <ChevronRightIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
        </MenuItem>
        <MenuItem onClick={handleRenameClick} dense sx={menuItemSx}>
          <ListItemIcon sx={menuIconSx}>
            <DriveFileRenameOutlineIcon sx={{ fontSize: 14 }} />
          </ListItemIcon>
          <Typography variant="body2" sx={menuTextSx}>
            Rename
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleDelete} dense sx={menuItemSx}>
          <ListItemIcon sx={menuIconSx}>
            <DeleteIcon sx={{ fontSize: 14 }} />
          </ListItemIcon>
          <Typography variant="body2" sx={menuTextSx}>
            Delete
          </Typography>
        </MenuItem>
      </Menu>
      <Menu
        open={tagsMenuOpen}
        onClose={() => setTagsMenuOpen(false)}
        anchorEl={tagsMenuAnchorRef.current}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        style={{ pointerEvents: 'none' }}
        MenuListProps={{ style: { pointerEvents: 'auto' } }}
        autoFocus={false}
        slotProps={{ paper: { sx: { minWidth: 120, py: 0.25 } } }}
      >
        {allTags.length === 0 ? (
          <MenuItem disabled dense sx={menuItemSx}>
            <Typography
              variant="body2"
              sx={{ ...menuTextSx, color: 'text.secondary' }}
            >
              No tags
            </Typography>
          </MenuItem>
        ) : (
          [...allTags]
            .sort((a, b) => a.tag.localeCompare(b.tag))
            .map(({ tag }) => {
              const isApplied = contextMenuNote?.tags.includes(tag) ?? false;
              return (
                <MenuItem
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  dense
                  sx={menuItemSx}
                >
                  <ListItemIcon sx={menuIconSx}>
                    {isApplied && <CheckIcon sx={{ fontSize: 14 }} />}
                  </ListItemIcon>
                  <Typography variant="body2" sx={menuTextSx}>
                    {tag}
                  </Typography>
                </MenuItem>
              );
            })
        )}
      </Menu>
      <Menu
        open={moveMenuOpen}
        onClose={() => setMoveMenuOpen(false)}
        anchorEl={moveMenuAnchorRef.current}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        style={{ pointerEvents: 'none' }}
        MenuListProps={{ style: { pointerEvents: 'auto' } }}
        autoFocus={false}
        slotProps={{ paper: { sx: { minWidth: 120, py: 0.25 } } }}
      >
        {collections.filter((c) => c.id !== activeCollectionId).length === 0 ? (
          <MenuItem disabled dense sx={menuItemSx}>
            <Typography
              variant="body2"
              sx={{ ...menuTextSx, color: 'text.secondary' }}
            >
              No other collections
            </Typography>
          </MenuItem>
        ) : (
          collections
            .filter((c) => c.id !== activeCollectionId)
            .map((c) => (
              <MenuItem
                key={c.id}
                onClick={() => handleMoveToCollection(c.id)}
                dense
                sx={menuItemSx}
              >
                <Typography variant="body2" sx={menuTextSx}>
                  {c.name}
                </Typography>
              </MenuItem>
            ))
        )}
      </Menu>
    </>
  );
}

export default NoteList;
