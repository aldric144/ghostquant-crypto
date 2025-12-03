declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.module.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module 'react-plotly.js' {
  import { Component } from 'react';
  import Plotly from 'plotly.js';
  
  interface PlotParams {
    data: Plotly.Data[];
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    frames?: Plotly.Frame[];
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    onInitialized?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
    onPurge?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
    onError?: (err: Error) => void;
    divId?: string;
    revision?: number;
    onSelected?: (event: Plotly.PlotSelectionEvent) => void;
    onRelayout?: (event: Plotly.PlotRelayoutEvent) => void;
    onClick?: (event: Plotly.PlotMouseEvent) => void;
    onHover?: (event: Plotly.PlotHoverEvent) => void;
    onUnhover?: (event: Plotly.PlotMouseEvent) => void;
  }
  
  class Plot extends Component<PlotParams> {}
  export default Plot;
}

declare module 'react-force-graph' {
  import { ForwardRefExoticComponent, RefAttributes } from 'react';
  
  interface GraphData {
    nodes: any[];
    links: any[];
  }
  
  interface ForceGraphProps {
    graphData?: GraphData;
    backgroundColor?: string;
    nodeRelSize?: number;
    nodeCanvasObject?: (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => void;
    nodeCanvasObjectMode?: () => string;
    linkColor?: (link: any) => string;
    linkWidth?: (link: any) => number;
    linkDirectionalParticles?: number;
    linkDirectionalParticleWidth?: number;
    linkDirectionalParticleColor?: (link: any) => string;
    onNodeClick?: (node: any, event: MouseEvent) => void;
    onNodeHover?: (node: any | null, prevNode: any | null) => void;
    cooldownTicks?: number;
    enableZoomInteraction?: boolean;
    enablePanInteraction?: boolean;
    width?: number;
    height?: number;
    [key: string]: any;
  }
  
  interface ForceGraphMethods {
    d3Force: (forceName: string, force?: any) => any;
    d3ReheatSimulation: () => void;
    zoomToFit: (duration?: number, padding?: number) => void;
    centerAt: (x?: number, y?: number, duration?: number) => void;
    zoom: (scale?: number, duration?: number) => void;
  }
  
  const ForceGraph2D: ForwardRefExoticComponent<ForceGraphProps & RefAttributes<ForceGraphMethods>>;
  const ForceGraph3D: ForwardRefExoticComponent<ForceGraphProps & RefAttributes<ForceGraphMethods>>;
  const ForceGraphVR: ForwardRefExoticComponent<ForceGraphProps & RefAttributes<ForceGraphMethods>>;
  const ForceGraphAR: ForwardRefExoticComponent<ForceGraphProps & RefAttributes<ForceGraphMethods>>;
  export { ForceGraph2D, ForceGraph3D, ForceGraphVR, ForceGraphAR };
  export default ForceGraph2D;
}

declare module 'react-globe.gl' {
  import { ForwardRefExoticComponent, RefAttributes } from 'react';
  
  interface GlobeProps {
    globeImageUrl?: string;
    backgroundColor?: string;
    pointsData?: any[];
    pointLat?: string | ((d: any) => number);
    pointLng?: string | ((d: any) => number);
    pointColor?: string | ((d: any) => string);
    pointAltitude?: number | string | ((d: any) => number);
    pointRadius?: number | string | ((d: any) => number);
    pointLabel?: string | ((d: any) => string);
    onPointClick?: (point: any, event: MouseEvent) => void;
    onPointHover?: (point: any | null, prevPoint: any | null) => void;
    arcsData?: any[];
    arcColor?: string | ((d: any) => string | string[]);
    arcAltitude?: number | string | ((d: any) => number);
    arcStroke?: number | string | ((d: any) => number);
    arcDashLength?: number | string | ((d: any) => number);
    arcDashGap?: number | string | ((d: any) => number);
    arcDashAnimateTime?: number | string | ((d: any) => number);
    arcLabel?: string | ((d: any) => string);
    onArcClick?: (arc: any, event: MouseEvent) => void;
    onArcHover?: (arc: any | null, prevArc: any | null) => void;
    ringsData?: any[];
    ringLat?: string | ((d: any) => number);
    ringLng?: string | ((d: any) => number);
    ringColor?: string | ((d: any) => string | string[]);
    ringAltitude?: number | string | ((d: any) => number);
    ringMaxRadius?: number | string | ((d: any) => number);
    ringPropagationSpeed?: number | string | ((d: any) => number);
    ringRepeatPeriod?: number | string | ((d: any) => number);
    width?: number;
    height?: number;
    [key: string]: any;
  }
  
  interface GlobeMethods {
    pointOfView: (pov?: { lat?: number; lng?: number; altitude?: number }, transitionMs?: number) => any;
    pauseAnimation: () => void;
    resumeAnimation: () => void;
    controls: () => any;
    scene: () => any;
    camera: () => any;
    renderer: () => any;
  }
  
  const Globe: ForwardRefExoticComponent<GlobeProps & RefAttributes<GlobeMethods>>;
  export default Globe;
}
