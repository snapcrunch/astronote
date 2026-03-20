import type { Theme } from '@mui/material/styles';
import type { StylesheetStyle } from 'cytoscape';

export function getGraphStylesheet(theme: Theme): StylesheetStyle[] {
  return [
    {
      selector: 'node',
      style: {
        'background-color': theme.palette.primary.main,
        label: 'data(label)',
        color: theme.palette.text.primary,
        'font-size': '9px',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 4,
        width: 10,
        height: 10,
        'text-max-width': '200px',
        'text-wrap': 'ellipsis',
      },
    },
    {
      selector: 'node[?focused]',
      style: {
        'background-color': theme.palette.warning.main,
        'border-width': 2,
        'border-color': theme.palette.warning.dark,
        width: 14,
        height: 14,
      },
    },
    {
      selector: 'edge[type="wikilink"]',
      style: {
        'line-color': theme.palette.primary.light,
        'target-arrow-color': theme.palette.primary.light,
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        width: 1,
        'arrow-scale': 0.6,
      },
    },
    {
      selector: 'edge[type="shared-tag"]',
      style: {
        'line-color': theme.palette.secondary.light,
        'line-style': 'dashed',
        'curve-style': 'bezier',
        width: 0.75,
        opacity: 0.5,
      },
    },
  ];
}
