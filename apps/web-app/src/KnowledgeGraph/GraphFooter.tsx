import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
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
import cytoscape from 'cytoscape';
import type { ElementDefinition, StylesheetStyle } from 'cytoscape';
import fcose from 'cytoscape-fcose';
import { useNoteStore } from '../store';
import { useFullGraphElements } from '../hooks/useGraphElements';
import { getGraphStylesheet } from './graphStyles';

cytoscape.use(fcose);

const DEFAULT_HEIGHT_VH = 40;
const MIN_HEIGHT = 120;
const HANDLE_HEIGHT = 5;

const LAYOUT: cytoscape.LayoutOptions = {
  name: 'fcose',
  animate: true,
  quality: 'proof',
  nodeSeparation: 150,
  nodeRepulsion: () => 500000,
  idealEdgeLength: () => 200,
  gravity: 0.1,
  tilingPaddingVertical: 80,
  tilingPaddingHorizontal: 80,
  padding: 30,
} as cytoscape.LayoutOptions;

interface GraphCanvasProps {
  elements: ElementDefinition[];
  stylesheet: StylesheetStyle[];
  onCy: (cy: cytoscape.Core) => void;
}

const GraphCanvas = memo(function GraphCanvas({
  elements,
  stylesheet,
  onCy,
}: GraphCanvasProps) {
  return (
    <CytoscapeComponent
      elements={elements}
      stylesheet={stylesheet}
      layout={LAYOUT}
      style={{ width: '100%', height: '100%', position: 'absolute' }}
      cy={onCy}
      userPanningEnabled
      userZoomingEnabled
      boxSelectionEnabled={false}
    />
  );
});

function GraphFooter() {
  const showGraphFooter = useNoteStore((s) => s.showGraphFooter);
  const toggleGraphFooter = useNoteStore((s) => s.toggleGraphFooter);
  const graphNotes = useNoteStore((s) => s.graphNotes);
  const graphNotesLoaded = useNoteStore((s) => s.graphNotesLoaded);
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId);
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
    cy.on('layoutstop', () => {
      // Reposition edgeless nodes as a vertical list on the left
      const isolatedNodes = cy.nodes().filter((n) => n.degree(false) === 0);
      if (isolatedNodes.nonempty()) {
        const connectedNodes = cy.nodes().filter((n) => n.degree(false) > 0);
        let leftX: number;
        if (connectedNodes.nonempty()) {
          leftX = connectedNodes.boundingBox().x1 - 150;
        } else {
          leftX = 0;
        }
        const spacing = 40;
        const startY =
          connectedNodes.nonempty()
            ? connectedNodes.boundingBox().y1
            : 0;
        isolatedNodes.forEach((node, i) => {
          node.position({ x: leftX, y: startY + i * spacing });
        });
      }

      cy.fit(undefined, 20);
      cy.minZoom(cy.zoom());
      const noteId = useNoteStore.getState().selectedNoteId;
      if (noteId) {
        const node = cy.getElementById(String(noteId));
        if (node.nonempty()) {
          cy.animate({
            center: { eles: node },
            duration: 1200,
            easing: 'ease-in-out-cubic',
          });
        }
      }
    });
    cy.on('tap', 'node', (e) => {
      const noteId = Number(e.target.id());
      if (!isNaN(noteId)) {
        useNoteStore.getState().setSelectedNoteId(noteId);
      }
    });
  }, []);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !selectedNoteId || !showGraphFooter) return;
    const node = cy.getElementById(String(selectedNoteId));
    if (node.nonempty()) {
      cy.animate({
        center: { eles: node },
        duration: 1200,
        easing: 'ease-in-out-cubic',
      });
    }
  }, [selectedNoteId, showGraphFooter]);

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
          borderBottom: showGraphFooter ? 1 : 0,
          borderColor: 'divider',
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
            overflow: 'hidden',
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
            <GraphCanvas
              elements={elements}
              stylesheet={stylesheet}
              onCy={handleCy}
            />
          )}
        </Box>
      )}
    </Box>
  );
}

export default GraphFooter;
