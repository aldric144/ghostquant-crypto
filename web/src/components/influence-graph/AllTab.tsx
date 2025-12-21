"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph").then(mod => mod.ForceGraph2D), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

interface GraphNode {
  id: string;
  name: string;
  type: "whale" | "institution" | "manipulation" | "darkpool" | "stablecoin" | "derivatives";
  size: number;
  color: string;
  value?: number;
  timestamp: number;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
  strength: number;
  color: string;
  width: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface UnifiedThreat {
  id: string;
  source: string;
  severity: string;
  symbol: string;
  type: string;
  description: string;
  confidence: number;
  impact_score: number;
  value_at_risk: number;
  timestamp: string;
}

const nodeConfig = {
  whale: { color: "#06b6d4", size: 12 },
  institution: { color: "#3b82f6", size: 14 },
  manipulation: { color: "#ef4444", size: 11 },
  darkpool: { color: "#6366f1", size: 10 },
  stablecoin: { color: "#10b981", size: 9 },
  derivatives: { color: "#f97316", size: 11 },
};

export default function AllTab() {
  const graphRef = useRef<any>();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [threats, setThreats] = useState<UnifiedThreat[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [threatsRes, dashboardRes] = await Promise.all([
          fetch(`${API_BASE}/unified-risk/all-threats?limit=100`),
          fetch(`${API_BASE}/unified-risk/dashboard`)
        ]);

        if (threatsRes.ok) {
          const data = await threatsRes.json();
          setThreats(data.threats || []);
          buildGraph(data.threats || []);
          setConnected(true);
        }

        if (dashboardRes.ok) {
          const data = await dashboardRes.json();
          setSummary(data);
        }
      } catch (err) {
        console.error("Failed to load unified risk data:", err);
        setConnected(false);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const buildGraph = (threats: UnifiedThreat[]) => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeMap = new Map<string, GraphNode>();

    threats.slice(0, 50).forEach((threat, index) => {
      const nodeType = getNodeType(threat.source);
      const config = nodeConfig[nodeType];
      const nodeId = `${threat.source}-${threat.symbol}-${index}`;

      if (!nodeMap.has(nodeId)) {
        const node: GraphNode = {
          id: nodeId,
          name: `${threat.symbol} - ${threat.type}`,
          type: nodeType,
          size: config.size + (threat.impact_score / 20),
          color: config.color,
          value: threat.value_at_risk,
          timestamp: Date.now(),
        };
        nodes.push(node);
        nodeMap.set(nodeId, node);
      }

      if (index > 0 && nodes.length > 1) {
        const targetIndex = Math.floor(Math.random() * (nodes.length - 1));
        links.push({
          source: nodeId,
          target: nodes[targetIndex].id,
          type: threat.source,
          strength: threat.confidence,
          color: config.color,
          width: Math.max(1, threat.impact_score / 30),
        });
      }
    });

    setGraphData({ nodes, links });
  };

  const getNodeType = (source: string): GraphNode["type"] => {
    const s = source.toLowerCase();
    if (s.includes("whale")) return "whale";
    if (s.includes("institution") || s.includes("entity")) return "institution";
    if (s.includes("manipulation")) return "manipulation";
    if (s.includes("darkpool")) return "darkpool";
    if (s.includes("stablecoin")) return "stablecoin";
    if (s.includes("derivative")) return "derivatives";
    return "whale";
  };

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const fontSize = 10 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;

    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size + 2, 0, 2 * Math.PI, false);
    ctx.strokeStyle = node.color;
    ctx.lineWidth = 1 / globalScale;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(node.name.substring(0, 15), node.x, node.y + node.size + fontSize + 2);
  }, []);

  const formatVolume = (value: number) => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            connected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          }`}>
            <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
            <span className="text-xs font-medium">{connected ? "Connected" : "Disconnected"}</span>
          </div>
          <div className="text-sm text-gray-400">
            {graphData.nodes.length} nodes | {graphData.links.length} edges
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">Overall Risk</div>
          <div className="text-2xl font-bold text-white">{summary?.overall_risk_score || 0}</div>
          <div className={`text-xs mt-1 ${
            summary?.threat_level === "critical" ? "text-red-400" :
            summary?.threat_level === "high" ? "text-orange-400" :
            summary?.threat_level === "medium" ? "text-yellow-400" : "text-green-400"
          }`}>{summary?.threat_level || "Unknown"}</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">Active Threats</div>
          <div className="text-2xl font-bold text-white">{threats.length}</div>
          <div className="text-xs text-gray-500 mt-1">Across all sources</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">Critical Alerts</div>
          <div className="text-2xl font-bold text-red-400">
            {threats.filter(t => t.severity === "critical").length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Require attention</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">Market Sentiment</div>
          <div className="text-2xl font-bold text-white capitalize">{summary?.market_sentiment || "Neutral"}</div>
          <div className="text-xs text-gray-500 mt-1">Current mood</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Entity Relationship Graph</h3>
            <p className="text-sm text-gray-400">Unified view of all entity connections</p>
          </div>
          <div className="h-[500px] relative">
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
              backgroundColor="#0f172a"
              nodeRelSize={6}
              nodeCanvasObject={nodeCanvasObject}
              linkColor={(link: any) => link.color}
              linkWidth={(link: any) => link.width}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.005}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
              warmupTicks={100}
              cooldownTicks={0}
              enableNodeDrag={true}
              enableZoomInteraction={true}
              enablePanInteraction={true}
            />

            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-3">
              <h4 className="text-xs font-bold text-cyan-400 mb-2">Legend</h4>
              <div className="space-y-1 text-xs">
                {Object.entries(nodeConfig).map(([type, config]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                    <span className="text-gray-300 capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <p className="text-sm text-gray-400">Latest entity events</p>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {threats.slice(0, 15).map((threat) => (
              <div key={threat.id} className="p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">{threat.symbol}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    threat.severity === "critical" ? "bg-red-900/30 text-red-400" :
                    threat.severity === "high" ? "bg-orange-900/30 text-orange-400" :
                    threat.severity === "medium" ? "bg-yellow-900/30 text-yellow-400" :
                    "bg-green-900/30 text-green-400"
                  }`}>{threat.severity}</span>
                </div>
                <div className="text-xs text-gray-400 mb-1">{threat.type}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{threat.source}</span>
                  <span className="text-cyan-400">{formatVolume(threat.value_at_risk)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
