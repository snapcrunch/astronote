declare module 'cytoscape-fcose' {
  const ext: cytoscape.Ext;
  export default ext;
}

declare module 'react-cytoscapejs' {
  import type { Component } from 'react';
  import type cytoscape from 'cytoscape';

  interface CytoscapeComponentProps {
    elements: cytoscape.ElementDefinition[];
    stylesheet?: cytoscape.StylesheetStyle[];
    layout?: cytoscape.LayoutOptions;
    style?: React.CSSProperties;
    cy?: (cy: cytoscape.Core) => void;
    userPanningEnabled?: boolean;
    userZoomingEnabled?: boolean;
    boxSelectionEnabled?: boolean;
    autoungrabify?: boolean;
    autounselectify?: boolean;
    [key: string]: unknown;
  }

  export default class CytoscapeComponent extends Component<CytoscapeComponentProps> {}
}
