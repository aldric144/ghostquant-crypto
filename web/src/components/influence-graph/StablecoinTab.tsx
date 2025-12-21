"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph").then(mod => mod.ForceGraph2D), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

interface StablecoinFlow {
  id: string;
  stablecoin: string;
  amount: number;
  flow_type: string;
  chain: string;
  from_address: string;
  to_address: string;
  from_label: string | null;
  to_label: string | null;
  tx_hash: string;
  timestamp: string;
  risk_score: number;
}

interface GraphNode {
  id: string;
  name: string;
  type: "stablecoin" | "address" | "exchange";
  size: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
  color: string;
  width: number;
  value: number;
}

const stablecoinColors: Record<string, string> = {
  USDT: "#26a17b",
  USDC: "#2775ca",
  DAI: "#f5ac37",
  BUSD: "#f0b90b",
  default: "#10b981",
};

export default function StablecoinTab() {
  const graphRef = useRef<any>();
  const [flows, setFlows] = useState<StablecoinFlow[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [flowsRes, summaryRes] = await Promise.all([
          fetch(`${API_BASE}/stablecoin/flows?limit=50`),
          fetch(`${API_BASE}/stablecoin/summary`)
        ]);

        if (flowsRes.ok) {
          const data = await flowsRes.json();
          setFlows(data.flows || []);
          buildGraph(data.flows || []);
          setConnected(true);
        }

        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setSummary(data);
        }
      } catch (err) {
        console.error("Failed to load stablecoin data:", err);
        setConnected(false);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const buildGraph = (flows: StablecoinFlow[]) => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeMap = new Map<string, GraphNode>();

    const stablecoins = Array.from(new Set(flows.map(f => f.stablecoin)));
    stablecoins.forEach((coin) => {
      nodeMap.set(coin, {
        id: coin,
        name: coin,
        type: "stablecoin",
        size: 14,
        color: stablecoinColors[coin] || stablecoinColors.default,
      });
    });

    flows.forEach((flow, index) => {
      const fromId = flow.from_label || flow.from_address?.slice(0, 8) || `from-${index}`;
      const toId = flow.to_label || flow.to_address?.slice(0, 8) || `to-${index}`;

      if (!nodeMap.has(fromId)) {
        const isExchange = flow.from_label?.toLowerCase().includes("exchange");
        nodeMap.set(fromId, {
          id: fromId,
          name: flow.from_label || fromId,
          type: isExchange ? "exchange" : "address",
          size: 8,
          color: isExchange ? "#f97316" : "#6b7280",
        });
      }

      if (!nodeMap.has(toId)) {
        const isExchange = flow.to_label?.toLowerCase().includes("exchange");
        nodeMap.set(toId, {
          id: toId,
          name: flow.to_label || toId,
          type: isExchange ? "exchange" : "address",
          size: 8,
          color: isExchange ? "#f97316" : "#6b7280",
        });
      }

      links.push({
        source: fromId,
        target: toId,
        color: stablecoinColors[flow.stablecoin] || stablecoinColors.default,
        width: Math.max(1, Math.log10(flow.amount) / 3),
        value: flow.amount,
      });

      if (nodeMap.has(flow.stablecoin)) {
        links.push({
          source: flow.stablecoin,
          target: fromId,
          color: stablecoinColors[flow.stablecoin] || stablecoinColors.default,
          width: 1,
          value: flow.amount,
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
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
          <div className="text-sm text-gray-400 mb-1">Market Cap</div>
          <div className="text-2xl font-bold text-white">{formatVolume(summary?.total_market_cap || 0)}</div>
          <div className="text-xs text-gray-500 mt-1">Total stablecoins</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">24h Volume</div>
          <div className="text-2xl font-bold text-white">{formatVolume(summary?.total_volume_24h || 0)}</div>
          <div className="text-xs text-gray-500 mt-1">Transfer volume</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">Net Exchange Flow</div>
          <div className={`text-2xl font-bold ${(summary?.net_exchange_flow_24h || 0) >= 0 ? "text-red-400" : "text-green-400"}`}>
            {formatVolume(Math.abs(summary?.net_exchange_flow_24h || 0))}
          </div>
          <div className="text-xs text-gray-500 mt-1">{(summary?.net_exchange_flow_24h || 0) >= 0 ? "Inflow" : "Outflow"}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Stablecoin Flow Network</h3>
            <p className="text-sm text-gray-400">Address and exchange relationships</p>
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

            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-green-500/20 rounded-lg p-3">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stablecoinColors.USDT }} />
                  <span className="text-gray-300">USDT</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stablecoinColors.USDC }} />
                  <span className="text-gray-300">USDC</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stablecoinColors.DAI }} />
                  <span className="text-gray-300">DAI</span>
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
            <h3 className="text-lg font-semibold text-white">Recent Flows</h3>
          </div>
          <div className="max-h-[450px] overflow-y-auto">
            {flows.slice(0, 15).map((flow) => (
              <div key={flow.id} className="p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">{flow.stablecoin}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    flow.risk_score >= 70 ? "bg-red-900/30 text-red-400" :
                    flow.risk_score >= 40 ? "bg-yellow-900/30 text-yellow-400" :
                    "bg-green-900/30 text-green-400"
                  }`}>{flow.risk_score}</span>
                </div>
                <div className="text-xs text-gray-400 mb-1 capitalize">{flow.flow_type?.replace(/_/g, " ")}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{flow.chain}</span>
                  <span className="text-green-400">{formatVolume(flow.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
