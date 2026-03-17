import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import CheckIcon from '@mui/icons-material/Check';
import { useNoteStore } from '../store';

function useActivityStatus(
  busy: boolean,
  activeText: string,
  doneText: string
) {
  const [showDone, setShowDone] = useState(false);
  const prev = useRef(busy);

  useEffect(() => {
    if (prev.current && !busy) {
      setShowDone(true);
      const timer = setTimeout(() => setShowDone(false), 2000);
      return () => clearTimeout(timer);
    }
    prev.current = busy;
  }, [busy]);

  if (busy) return { visible: true, text: activeText, done: false };
  if (showDone) return { visible: true, text: doneText, done: true };
  return { visible: false, text: '', done: false };
}

function SaveStatusIndicator() {
  const saving = useNoteStore((s) => s.saving);
  const renaming = useNoteStore((s) => s.renaming);
  const tagging = useNoteStore((s) => s.tagging);
  const importing = useNoteStore((s) => s.importing);
  const importedCount = useNoteStore((s) => s.importedCount);
  const creatingCollection = useNoteStore((s) => s.creatingCollection);
  const deletingCollection = useNoteStore((s) => s.deletingCollection);

  const saveStatus = useActivityStatus(saving, 'Saving...', 'Saved');
  const renameStatus = useActivityStatus(renaming, 'Renaming...', 'Renamed');
  const tagStatus = useActivityStatus(
    tagging,
    'Updating tags...',
    'Tags updated'
  );
  const importStatus = useActivityStatus(
    importing,
    'Importing notes...',
    `Imported ${importedCount} note${importedCount === 1 ? '' : 's'}`
  );
  const createCollectionStatus = useActivityStatus(
    creatingCollection,
    'Creating collection...',
    'Collection created'
  );
  const deleteCollectionStatus = useActivityStatus(
    deletingCollection,
    'Deleting collection...',
    'Collection deleted'
  );

  const allStatuses = [
    saveStatus,
    renameStatus,
    tagStatus,
    importStatus,
    createCollectionStatus,
    deleteCollectionStatus,
  ];

  // Prefer in-progress statuses over done statuses
  const current =
    allStatuses.find((s) => s.visible && !s.done) ??
    allStatuses.find((s) => s.visible) ??
    null;

  if (!current) return null;

  return (
    <Fade in timeout={{ enter: 150, exit: 400 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {current.done && (
          <CheckIcon sx={{ fontSize: 14, color: 'success.main' }} />
        )}
        <Typography
          variant="caption"
          sx={{
            color: current.done ? 'success.main' : 'text.secondary',
            whiteSpace: 'nowrap',
          }}
        >
          {current.text}
        </Typography>
      </Box>
    </Fade>
  );
}

export default SaveStatusIndicator;
