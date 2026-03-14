import { useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { sectionHeading } from './styles';

interface SectionHeadingProps {
  children: React.ReactNode;
  content?: React.ReactNode;
  first?: boolean;
  last?: boolean;
  defaultOpen?: boolean;
}

function SectionHeading({
  children,
  content,
  first = false,
  last = false,
  defaultOpen = true,
}: SectionHeadingProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (content === undefined) {
    return (
      <Typography
        variant="caption"
        sx={sectionHeading(first, open, last)}
        onClick={() => setOpen((o) => !o)}
        style={{ cursor: 'pointer' }}
      >
        {children}
      </Typography>
    );
  }

  return (
    <Box>
      <Typography
        variant="caption"
        sx={sectionHeading(first, open, last)}
        onClick={() => setOpen((o) => !o)}
        style={{ cursor: 'pointer' }}
      >
        {children}
      </Typography>
      <Collapse in={open}>{content}</Collapse>
    </Box>
  );
}

export default SectionHeading;
