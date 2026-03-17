import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { useNoteStore, useSelectedNote } from '../store';
import Statistics from './Statistics';
import TableOfContents from './TableOfContents';
import TagManager from './TagManager';
import RelatedNotes from './RelatedNotes';
import StatRow from './StatRow';
import { formatDateTime } from './util';
import {
  infoPanelRoot,
  infoPanelHeader,
  infoPanelContentInner,
} from './styles';

interface InfoPanelProps {
  variant?: 'side' | 'inline';
}

function InfoPanel({ variant = 'side' }: InfoPanelProps) {
  const showInfoPanel = useNoteStore((s) => s.showInfoPanel);
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
  const note = useSelectedNote();

  if (variant === 'side') {
    if (!showInfoPanel || !selectedNoteId) return null;

    return (
      <Box sx={infoPanelRoot}>
        <Box sx={infoPanelHeader}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, textTransform: 'uppercase' }}
          >
            Note Attributes
          </Typography>
        </Box>
        {note && (
          <Box sx={{ px: 2, py: 0.5 }}>
            <StatRow
              label="ID"
              value={note.id}
              onValueClick={() =>
                navigator.clipboard.writeText(String(note.id))
              }
            />
            <StatRow label="Created" value={formatDateTime(note.createdAt)} />
            <StatRow label="Modified" value={formatDateTime(note.updatedAt)} />
          </Box>
        )}
        <Box sx={infoPanelContentInner}>
          <TableOfContents />
          <TagManager />
          <Statistics />
        </Box>
        <RelatedNotes sx={{ flex: 1, minHeight: 0 }} />
      </Box>
    );
  }

  return (
    <OverlayScrollbarsComponent
      style={{ flex: 1 }}
      options={{ scrollbars: { autoHide: 'move' } }}
    >
      {note && (
        <Box sx={{ px: 2, py: 0.5 }}>
          <StatRow label="Created" value={formatDateTime(note.createdAt)} />
          <StatRow label="Modified" value={formatDateTime(note.updatedAt)} />
        </Box>
      )}
      <Box sx={infoPanelContentInner}>
        <TableOfContents />
        <TagManager />
        <Statistics />
      </Box>
    </OverlayScrollbarsComponent>
  );
}

export default InfoPanel;
