import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import CenterFocusStrongOutlined from '@mui/icons-material/CenterFocusStrongOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import ExpandLessOutlined from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';
import { useTheme } from '@mui/material/styles';
import CytoscapeComponent from 'react-cytoscapejs';
import type cytoscape from 'cytoscape';
import { useNoteStore } from '../store';
import { useFullGraphElements } from '../hooks/useGraphElements';
import { getGraphStylesheet } from './graphStyles';

const DEFAULT_HEIGHT_VH = 40;
const MIN_HEIGHT = 120;
const HANDLE_HEIGHT = 5;

function GraphFooter() {
  const showGraphFooter = useNoteStore((s) => s.showGraphFooter);
  const toggleGraphFooter = useNoteStore((s) => s.toggleGraphFooter);
  const graphNotes = useNoteStore((s) => s.graphNotes);
  const graphNotesLoaded = useNoteStore((s) => s.graphNotesLoaded);
  const theme = useTheme();
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [everOpened, setEverOpened] = useState(showGraphFooter);

  useEffect(() => {
    if (showGraphFooter && !everOpened) setEverOpened(true);
  }, [showGraphFooter, everOpened]);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const currentHeight = useRef(
    Math.round(window.innerHeight * (DEFAULT_HEIGHT_VH / 100))
  );

  const { nodes, edges } = useFullGraphElements(graphNotes);
  const elements = useMemo(() => [...nodes, ...edges], [nodes, edges]);
  const stylesheet = useMemo(() => getGraphStylesheet(theme), [theme]);

  const handleCy = useCallback((cy: cytoscape.Core) => {
    cyRef.current = cy;
  }, []);

  const handleFit = useCallback(() => {
    cyRef.current?.fit(undefined, 20);
  }, []);

  const handleClose = useCallback(() => {
    if (showGraphFooter) toggleGraphFooter();
  }, [showGraphFooter, toggleGraphFooter]);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startY.current = e.clientY;
    startHeight.current = currentHeight.current;
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !panelRef.current) return;
      const delta = startY.current - e.clientY;
      const maxHeight = window.innerHeight - 100;
      const next = Math.max(MIN_HEIGHT, Math.min(maxHeight, startHeight.current + delta));
      panelRef.current.style.height = `${next}px`;
      currentHeight.current = next;
    };

    const onMouseUp = () => {
      dragging.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <Box
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <Box
        onMouseDown={onDragStart}
        sx={{
          position: 'absolute',
          top: -Math.floor(HANDLE_HEIGHT / 2),
          left: 0,
          right: 0,
          height: HANDLE_HEIGHT,
          cursor: 'row-resize',
          zIndex: 1,
          display: showGraphFooter ? 'block' : 'none',
        }}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 3,
          height: 40,
          minHeight: 40,
          boxSizing: 'content-box',
          bgcolor: 'grey.100',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={toggleGraphFooter}
      >
        {showGraphFooter ? (
          <ExpandMoreOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
        ) : (
          <ExpandLessOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
        )}
        <Typography
          variant="body1"
          sx={{ fontWeight: 600, mr: 'auto' }}
          noWrap
        >
          Knowledge Graph
        </Typography>
        {showGraphFooter && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 1.5,
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
                    width: 12,
                    height: 1.5,
                    bgcolor: 'secondary.light',
                    borderRadius: 1,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Shared tag
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleFit();
              }}
              title="Fit to screen"
            >
              <CenterFocusStrongOutlined sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              title="Close"
            >
              <CloseOutlined sx={{ fontSize: 16 }} />
            </IconButton>
          </>
        )}
      </Box>
      {everOpened && (
        <Box
          ref={panelRef}
          sx={{
            height: currentHeight.current,
            position: 'relative',
            display: showGraphFooter ? 'block' : 'none',
          }}
        >
          {!graphNotesLoaded ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <CircularProgress size={20} />
            </Box>
          ) : elements.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                No notes to display
              </Typography>
            </Box>
          ) : (
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
                padding: 30,
              } as cytoscape.LayoutOptions}
              style={{ width: '100%', height: '100%', position: 'absolute' }}
              cy={handleCy}
              userPanningEnabled
              userZoomingEnabled
              boxSelectionEnabled={false}
            />
          )}
        </Box>
      )}
    </Box>
  );
}

export default GraphFooter;
