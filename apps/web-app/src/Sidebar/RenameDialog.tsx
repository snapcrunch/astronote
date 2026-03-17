import { useEffect, useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import InputBase from '@mui/material/InputBase';

interface RenameDialogProps {
  open: boolean;
  currentTitle: string;
  onConfirm: (newTitle: string) => void;
  onClose: () => void;
}

function RenameDialog({
  open,
  currentTitle,
  onConfirm,
  onClose,
}: RenameDialogProps) {
  const [value, setValue] = useState(currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(currentTitle);
      const timer = setTimeout(() => {
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open, currentTitle]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed && trimmed !== currentTitle) {
        onConfirm(trimmed);
      } else {
        onClose();
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            position: 'fixed',
            top: '20%',
            m: 0,
            borderRadius: 2,
            overflow: 'hidden',
          },
        },
      }}
    >
      <InputBase
        inputRef={inputRef}
        fullWidth
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{
          px: 2,
          py: 1.5,
        }}
      />
    </Dialog>
  );
}

export default RenameDialog;
