import { useCallback, useEffect, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import CenterFocusStrongOutlined from '@mui/icons-material/CenterFocusStrongOutlined';
import { useTheme } from '@mui/material/styles';
import CytoscapeComponent from 'react-cytoscapejs';
import type cytoscape from 'cytoscape';
import { useNoteStore } from '../store';
import { useFullGraphElements } from '../hooks/useGraphElements';
import { getGraphStylesheet } from './graphStyles';

function KnowledgeGraph() {
  const fetchGraphNotes = useNoteStore((s) => s.fetchGraphNotes);
  const graphNotes = useNoteStore((s) => s.graphNotes);
  const graphNotesLoaded = useNoteStore((s) => s.graphNotesLoaded);
  const theme = useTheme();
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    fetchGraphNotes();
  }, [fetchGraphNotes]);

  const { nodes, edges } = useFullGraphElements(graphNotes);
  const elements = useMemo(() => [...nodes, ...edges], [nodes, edges]);
  const stylesheet = useMemo(() => getGraphStylesheet(theme), [theme]);

  const handleCy = useCallback((cy: cytoscape.Core) => {
    cyRef.current = cy;
  }, []);

  const handleFit = useCallback(() => {
    cyRef.current?.fit(undefined, 40);
  }, []);

  if (!graphNotesLoaded) {
    return (
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (elements.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">No notes to display</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 'auto' }}>
          Knowledge Graph
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 16,
                height: 2,
                bgcolor: 'primary.light',
                borderRadius: 1,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Link
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 16,
                height: 2,
                bgcolor: 'secondary.light',
                borderRadius: 1,
                backgroundImage:
                  'repeating-linear-gradient(90deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)',
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Shared tag
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleFit} title="Fit to screen">
          <CenterFocusStrongOutlined fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <CytoscapeComponent
          elements={elements}
          stylesheet={stylesheet}
          layout={{
            name: 'cose',
            animate: true,
            nodeRepulsion: () => 500000,
            idealEdgeLength: () => 300,
            nodeOverlap: 80,
            gravity: 0.05,
            numIter: 2500,
            maxSimulationTime: 5000,
            padding: 60,
          } as cytoscape.LayoutOptions}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          cy={handleCy}
          userPanningEnabled
          userZoomingEnabled
          boxSelectionEnabled={false}
        />
      </Box>
    </Box>
  );
}

export default KnowledgeGraph;
