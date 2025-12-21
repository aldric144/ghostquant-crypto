"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph").then(mod => mod.ForceGraph2D), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

interface WhaleMovement {
  id: string;
  symbol: string;
  amount: number;
  value_usd: number;
  from_address: string;
  to_address: string;
  from_label: string | null;
  to_label: string | null;
  movement_type: string;
  risk_score: number;
  timestamp: string;
}

interface GraphNode {
  id: string;
  name: string;
  type: "whale" | "exchange" | "unknown";
  size: number;
  color: string;
  value?: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
  color: string;
  width: number;
}

const nodeColors = {
  whale: "#06b6d4",
  exchange: "#f97316",
  unknown: "#6b7280",
};

export default function WhaleTab() {
  const graphRef = useRef<any>();
  const [movements, setMovements] = useState<WhaleMovement[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [movementsRes, summaryRes] = await Promise.all([
          fetch(`${API_BASE}/whale-intel/movements?limit=50`),
          fetch(`${API_BASE}/whale-intel/summary`)
        ]);

        if (movementsRes.ok) {
          const data = await movementsRes.json();
          setMovements(data.movements || []);
          buildGraph(data.movements || []);
          setConnected(true);
        }

        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setSummary(data);
        }
      } catch (err) {
        console.error("Failed to load whale data:", err);
        setConnected(false);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const buildGraph = (movements: WhaleMovement[]) => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeMap = new Map<string, GraphNode>();

    movements.forEach((movement) => {
      const fromId = movement.from_address?.slice(0, 10) || "unknown";
      const toId = movement.to_address?.slice(0, 10) || "unknown";

      if (!nodeMap.has(fromId)) {
        const isExchange = movement.from_label?.toLowerCase().includes("exchange");
        nodeMap.set(fromId, {
          id: fromId,
          name: movement.from_label || fromId,
          type: isExchange ? "exchange" : "whale",
          size: 8,
          color: isExchange ? nodeColors.exchange : nodeColors.whale,
          value: movement.value_usd,
        });
      }

      if (!nodeMap.has(toId)) {
        const isExchange = movement.to_label?.toLowerCase().includes("exchange");
        nodeMap.set(toId, {
          id: toId,
          name: movement.to_label || toId,
          type: isExchange ? "exchange" : "whale",
          size: 8,
          color: isExchange ? nodeColors.exchange : nodeColors.whale,
          value: movement.value_usd,
        });
      }

      links.push({
        source: fromId,
        target: toId,
        value: movement.value_usd,
        color: movement.risk_score >= 70 ? "#ef4444" : movement.risk_score >= 40 ? "#f59e0b" : "#10b981",
        width: Math.max(1, Math.log10(movement.value_usd) / 2),
      });
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
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
          <div className="text-sm text-gray-400 mb-1">Whale Risk Score</div>
          <div className="text-2xl font-bold text-white">{summary?.risk_score || 0}</div>
          <div className={`text-xs mt-1 ${
            summary?.threat_level === "critical" ? "text-red-400" :
            summary?.threat_level === "high" ? "text-orange-400" : "text-yellow-400"
          }`}>{summary?.threat_level || "Medium"}</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">24h Volume</div>
          <div className="text-2xl font-bold text-white">{formatVolume(summary?.total_volume_24h || 0)}</div>
          <div className="text-xs text-gray-500 mt-1">{summary?.total_movements_24h || 0} movements</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">Exchange Inflow</div>
          <div className="text-2xl font-bold text-red-400">{formatVolume(summary?.exchange_inflow_24h || 0)}</div>
          <div className="text-xs text-gray-500 mt-1">Sell pressure</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">Exchange Outflow</div>
          <div className="text-2xl font-bold text-green-400">{formatVolume(summary?.exchange_outflow_24h || 0)}</div>
          <div className="text-xs text-gray-500 mt-1">Accumulation</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Whale Flow Network</h3>
            <p className="text-sm text-gray-400">Address relationships and fund flows</p>
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

            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-3">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-gray-300">Whale Address</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  <span className="text-gray-300">Exchange</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Recent Movements</h3>
          </div>
          <div className="max-h-[450px] overflow-y-auto">
            {movements.slice(0, 15).map((movement) => (
              <div key={movement.id} className="p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">{movement.symbol}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    movement.risk_score >= 70 ? "bg-red-900/30 text-red-400" :
                    movement.risk_score >= 40 ? "bg-yellow-900/30 text-yellow-400" :
                    "bg-green-900/30 text-green-400"
                  }`}>{movement.risk_score}</span>
                </div>
                <div className="text-xs text-gray-400 mb-1 capitalize">{movement.movement_type?.replace(/_/g, " ")}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{formatTime(movement.timestamp)}</span>
                  <span className="text-cyan-400">{formatVolume(movement.value_usd)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
