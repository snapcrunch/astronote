import { useCallback, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import CytoscapeComponent from 'react-cytoscapejs';
import type cytoscape from 'cytoscape';
import { useNoteStore, useSelectedNote } from '../store';
import { useLocalGraphElements } from '../hooks/useGraphElements';
import { getGraphStylesheet } from '../KnowledgeGraph/graphStyles';
import { sectionHeading } from './styles';
import type { SxProps, Theme } from '@mui/material/styles';

interface LocalGraphProps {
  sx?: SxProps<Theme>;
}

function LocalGraph({ sx }: LocalGraphProps) {
  const note = useSelectedNote();
  const notes = useNoteStore((s) => s.notes);
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const graphElements = useLocalGraphElements(note, notes);
  const elements = useMemo(() => {
    if (!graphElements) return [];
    return [...graphElements.nodes, ...graphElements.edges];
  }, [graphElements]);

  const stylesheet = useMemo(() => getGraphStylesheet(theme), [theme]);

  const handleCy = useCallback((cy: cytoscape.Core) => {
    cyRef.current = cy;
  }, []);

  if (!note || elements.length <= 1) return null;

  return (
    <Box
      sx={[
        { display: 'flex', flexDirection: 'column' },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box sx={{ px: 2, '& > *': { mb: 0, mt: 0 } }}>
        <Typography
          variant="caption"
          sx={sectionHeading(false, open, true)}
          onClick={() => setOpen((o) => !o)}
          style={{ cursor: 'pointer' }}
        >
          Graph
        </Typography>
      </Box>
      {open && (
        <Box sx={{ height: 200, mx: 2, position: 'relative' }}>
          <CytoscapeComponent
            elements={elements}
            stylesheet={stylesheet}
            layout={{
              name: 'concentric',
              concentric: (node: cytoscape.NodeSingular) =>
                node.data('focused') ? 2 : 1,
              levelWidth: () => 1,
              animate: false,
              padding: 10,
            } as cytoscape.LayoutOptions}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            cy={handleCy}
            userPanningEnabled
            userZoomingEnabled
            boxSelectionEnabled={false}
          />
        </Box>
      )}
    </Box>
  );
}

export default LocalGraph;
