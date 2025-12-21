"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph").then(mod => mod.ForceGraph2D), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

interface DarkpoolEvent {
  id: string;
  symbol: string;
  volume_usd: number;
  price: number;
  side: string;
  venue: string;
  execution_type: string;
  institutional_flag: boolean;
  timestamp: string;
  impact_score: number;
  anomaly_detected: boolean;
}

interface GraphNode {
  id: string;
  name: string;
  type: "trade" | "venue" | "symbol";
  size: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
  color: string;
  width: number;
}

export default function DarkpoolTab() {
  const graphRef = useRef<any>();
  const [events, setEvents] = useState<DarkpoolEvent[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [eventsRes, summaryRes] = await Promise.all([
          fetch(`${API_BASE}/darkpool/activity?limit=50`),
          fetch(`${API_BASE}/darkpool/summary`)
        ]);

        if (eventsRes.ok) {
          const data = await eventsRes.json();
          setEvents(data.events || []);
          buildGraph(data.events || []);
          setConnected(true);
        }

        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setSummary(data);
        }
      } catch (err) {
        console.error("Failed to load darkpool data:", err);
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
    venues.forEach((venue) => {
      nodeMap.set(venue, {
        id: venue,
        name: venue,
        type: "venue",
        size: 14,
        color: "#6366f1",
      });
    });

    const symbols = Array.from(new Set(events.map(e => e.symbol)));
    symbols.forEach((symbol) => {
      nodeMap.set(symbol, {
        id: symbol,
        name: symbol,
        type: "symbol",
        size: 12,
        color: "#06b6d4",
      });
    });

    events.forEach((event, index) => {
      if (nodeMap.has(event.symbol) && nodeMap.has(event.venue)) {
        links.push({
          source: event.symbol,
          target: event.venue,
          color: event.side === "buy" ? "#10b981" : "#ef4444",
          width: Math.max(1, Math.log10(event.volume_usd) / 3),
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
          <div className="text-sm text-gray-400 mb-1">Risk Score</div>
          <div className="text-2xl font-bold text-white">{summary?.risk_score || 0}</div>
          <div className={`text-xs mt-1 ${
            summary?.threat_level === "critical" ? "text-red-400" :
            summary?.threat_level === "high" ? "text-orange-400" : "text-yellow-400"
          }`}>{summary?.threat_level || "Medium"}</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">24h Volume</div>
          <div className="text-2xl font-bold text-white">{formatVolume(summary?.total_volume_24h || 0)}</div>
          <div className="text-xs text-gray-500 mt-1">Darkpool activity</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">24h Trades</div>
          <div className="text-2xl font-bold text-white">{summary?.total_trades_24h || events.length}</div>
          <div className="text-xs text-gray-500 mt-1">Block trades</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">Anomalies</div>
          <div className="text-2xl font-bold text-orange-400">{events.filter(e => e.anomaly_detected).length}</div>
          <div className="text-xs text-gray-500 mt-1">Unusual patterns</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Darkpool Flow Network</h3>
            <p className="text-sm text-gray-400">Symbol-venue relationships</p>
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

            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-indigo-500/20 rounded-lg p-3">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-gray-300">Symbol</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-gray-300">Venue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-gray-300">Buy Flow</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-gray-300">Sell Flow</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Recent Trades</h3>
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
                  <span className="text-indigo-400">{formatVolume(event.volume_usd)}</span>
                </div>
                {event.anomaly_detected && (
                  <div className="mt-1 text-xs text-orange-400">Anomaly detected</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
