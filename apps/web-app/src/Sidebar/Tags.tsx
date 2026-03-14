import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { useNoteStore } from '../store';
import { useIsMobile } from '../hooks';

function Tags() {
  const isMobile = useIsMobile();
  const tags = useNoteStore((s) => s.tags);
  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => a.tag.localeCompare(b.tag)),
    [tags]
  );
  const selectedTags = useNoteStore((s) => s.selectedTags);
  const toggleTag = useNoteStore((s) => s.toggleTag);
  const [open, setOpen] = useState(!isMobile);

  if (tags.length === 0) return null;

  return (
    <Box
      sx={{
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Box
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: open ? 'divider' : 'transparent',
          px: 1.5,
          cursor: 'pointer',
          height: 40,
          bgcolor: 'grey.200',
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, textTransform: 'uppercase' }}
        >
          Tags
        </Typography>
      </Box>
      <Collapse in={open}>
        <OverlayScrollbarsComponent
          style={{ maxHeight: 400, overscrollBehavior: 'none' }}
          options={{
            scrollbars: { autoHide: 'move' },
            overflow: { x: 'hidden' },
          }}
        >
          <List dense disablePadding>
            {sortedTags.map(({ tag, count }, index) => {
              const selected = selectedTags.includes(tag);
              return (
                <ListItemButton
                  key={tag}
                  selected={selected}
                  onClick={() => toggleTag(tag)}
                  disableRipple
                  sx={{
                    py: 0.25,
                    px: 1.5,
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: index % 2 === 0 ? 'background.paper' : 'grey.50',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.dark' },
                    },
                  }}
                >
                  <ListItemText
                    primary={tag}
                    primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: selected
                        ? 'primary.contrastText'
                        : 'text.secondary',
                      opacity: selected ? 0.7 : 1,
                    }}
                  >
                    {count}
                  </Typography>
                </ListItemButton>
              );
            })}
          </List>
        </OverlayScrollbarsComponent>
      </Collapse>
    </Box>
  );
}

export default Tags;
