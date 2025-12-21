"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph").then(mod => mod.ForceGraph2D), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

interface InstitutionalFlow {
  net_flow: number;
  buy_volume: number;
  sell_volume: number;
  flow_direction: string;
  confidence: number;
}

interface DarkpoolEvent {
  id: string;
  symbol: string;
  volume_usd: number;
  price: number;
  side: string;
  venue: string;
  institutional_flag: boolean;
  timestamp: string;
  impact_score: number;
}

interface GraphNode {
  id: string;
  name: string;
  type: "institution" | "fund" | "exchange";
  size: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
  color: string;
  width: number;
}

const nodeColors = {
  institution: "#3b82f6",
  fund: "#8b5cf6",
  exchange: "#f97316",
};

export default function InstitutionTab() {
  const graphRef = useRef<any>();
  const [flow, setFlow] = useState<InstitutionalFlow | null>(null);
  const [events, setEvents] = useState<DarkpoolEvent[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [flowRes, eventsRes] = await Promise.all([
          fetch(`${API_BASE}/darkpool/institutional-flow?timeframe=24h`),
          fetch(`${API_BASE}/darkpool/activity?limit=50`)
        ]);

        if (flowRes.ok) {
          const data = await flowRes.json();
          setFlow(data);
          setConnected(true);
        }

        if (eventsRes.ok) {
          const data = await eventsRes.json();
          const institutionalEvents = (data.events || []).filter((e: DarkpoolEvent) => e.institutional_flag);
          setEvents(institutionalEvents);
          buildGraph(institutionalEvents);
        }
      } catch (err) {
        console.error("Failed to load institutional data:", err);
        setConnected(false);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const buildGraph = (events: DarkpoolEvent[]) => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeMap = new Map<string, GraphNode>();

    const venues = Array.from(new Set(events.map(e => e.venue)));
    venues.forEach((venue, i) => {
      nodeMap.set(venue, {
        id: venue,
        name: venue,
        type: "exchange",
        size: 12,
        color: nodeColors.exchange,
      });
    });

    events.forEach((event, index) => {
      const instId = `inst-${event.symbol}-${index}`;
      if (!nodeMap.has(instId)) {
        nodeMap.set(instId, {
          id: instId,
          name: `${event.symbol} Block`,
          type: "institution",
          size: 8 + Math.log10(event.volume_usd),
          color: nodeColors.institution,
        });
      }

      if (nodeMap.has(event.venue)) {
        links.push({
          source: instId,
          target: event.venue,
          value: event.volume_usd,
          color: event.side === "buy" ? "#10b981" : "#ef4444",
          width: Math.max(1, event.impact_score / 30),
        });
      }
    });

    setGraphData({ nodes: Array.from(nodeMap.values()), links });
  };

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const fontSize = 10 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;

    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color;
    ctx.fill();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(node.name.substring(0, 12), node.x, node.y + node.size + fontSize + 2);
  }, []);

  const formatVolume = (value: number) => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          connected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
        }`}>
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
          <span className="text-xs font-medium">{connected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">Net Institutional Flow</div>
          <div className={`text-2xl font-bold ${(flow?.net_flow || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
            {formatVolume(Math.abs(flow?.net_flow || 0))}
          </div>
          <div className="text-xs text-gray-500 mt-1 capitalize">{flow?.flow_direction || "Neutral"}</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">Buy Volume</div>
          <div className="text-2xl font-bold text-green-400">{formatVolume(flow?.buy_volume || 0)}</div>
          <div className="text-xs text-gray-500 mt-1">Institutional buys</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">Sell Volume</div>
          <div className="text-2xl font-bold text-red-400">{formatVolume(flow?.sell_volume || 0)}</div>
          <div className="text-xs text-gray-500 mt-1">Institutional sells</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">Confidence</div>
          <div className="text-2xl font-bold text-white">{((flow?.confidence || 0) * 100).toFixed(0)}%</div>
          <div className="text-xs text-gray-500 mt-1">Signal strength</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Institutional Flow Network</h3>
            <p className="text-sm text-gray-400">Block trades and venue relationships</p>
          </div>
          <div className="h-[450px] relative">
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
              enableNodeDrag={true}
              enableZoomInteraction={true}
            />

            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-blue-500/20 rounded-lg p-3">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-gray-300">Institution</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  <span className="text-gray-300">Exchange/Venue</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Block Trades</h3>
          </div>
          <div className="max-h-[450px] overflow-y-auto">
            {events.slice(0, 15).map((event) => (
              <div key={event.id} className="p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">{event.symbol}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    event.side === "buy" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                  }`}>{event.side.toUpperCase()}</span>
                </div>
                <div className="text-xs text-gray-400 mb-1">{event.venue}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{formatTime(event.timestamp)}</span>
                  <span className="text-blue-400">{formatVolume(event.volume_usd)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
