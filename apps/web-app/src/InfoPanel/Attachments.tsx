import { useRef, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import type { Attachment } from '@repo/types';
import SectionHeading from './SectionHeading';
import { useNoteStore, useSelectedNote } from '../store';

const EMPTY: Attachment[] = [];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Attachments() {
  const note = useSelectedNote();
  const noteId = note?.id;
  const attachments = useNoteStore((s) =>
    noteId != null ? s.attachments[noteId] ?? EMPTY : EMPTY
  );
  const uploadAttachment = useNoteStore((s) => s.uploadAttachment);
  const deleteAttachment = useNoteStore((s) => s.deleteAttachment);
  const getAttachmentUrl = useNoteStore((s) => s.getAttachmentUrl);
  const uploadingAttachment = useNoteStore((s) => s.uploadingAttachment);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = useCallback(
    async (files: Iterable<File>) => {
      if (!note) return;
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        await uploadAttachment(note.id, file);
      }
    },
    [note, uploadAttachment]
  );

  if (!note) return null;

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) uploadFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer?.files;
    if (files?.length) uploadFiles(files);
  };

  return (
    <SectionHeading
      content={
        <>
          <Box sx={{ px: 2, py: 0.5 }}>
            <Box
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                py: 0.5,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: dragOver ? 'action.hover' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              <UploadFileIcon
                sx={{ fontSize: 20, color: 'text.secondary', mb: 0.25 }}
              />
              <Typography variant="caption" color="text.secondary" display="block">
                {uploadingAttachment
                  ? 'Uploading...'
                  : 'Drop files here or click to browse'}
              </Typography>
            </Box>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={handleFileInput}
            />
          </Box>
          {attachments.length > 0 && (
            <List dense disablePadding sx={{ mx: -2, borderTop: 1, borderColor: 'divider' }}>
              {attachments.map((att, index) => (
                <ListItem
                  key={att.id}
                  disablePadding
                  draggable
                  onDragStart={(e) => {
                    const isImage = att.mimeType.startsWith('image/');
                    const md = isImage
                      ? `![${att.filename}](attachment:${att.id})`
                      : `[${att.filename}](attachment:${att.id})`;
                    e.dataTransfer.setData('text/plain', md);
                    e.dataTransfer.setData('application/x-astronote-attachment', 'true');
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 0.25 }}>
                      <IconButton
                        edge="end"
                        size="small"
                        component="a"
                        href={getAttachmentUrl(att.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Download"
                      >
                        <DownloadIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => deleteAttachment(note.id, att.id)}
                        title="Delete"
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  }
                  sx={{
                    py: 0.25,
                    px: 2,
                    cursor: 'grab',
                    borderBottom:
                      index < attachments.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <ListItemText
                    primary={att.filename}
                    secondary={formatFileSize(att.size)}
                    primaryTypographyProps={{
                      variant: 'body2',
                      noWrap: true,
                      sx: { maxWidth: 140 },
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </>
      }
    >
      Attachments
    </SectionHeading>
  );
}

export default Attachments;
