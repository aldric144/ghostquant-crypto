"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph").then(mod => mod.ForceGraph2D), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

interface Liquidation {
  id: string;
  symbol: string;
  side: string;
  value: number;
  price: number;
  quantity: number;
  exchange: string;
  leverage: number;
  timestamp: string;
}

interface DerivativesOverview {
  total_open_interest: number;
  total_volume_24h: number;
  total_liquidations_24h: number;
  avg_funding_rate: number;
  long_short_ratio: number;
  top_assets: Array<{
    symbol: string;
    open_interest: number;
    volume_24h: number;
    funding_rate: number;
    liquidations_24h: number;
    long_short_ratio: number;
  }>;
  risk_score: number;
  threat_level: string;
}

interface GraphNode {
  id: string;
  name: string;
  type: "symbol" | "exchange" | "liquidation";
  size: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
  color: string;
  width: number;
}

export default function DerivativesTab() {
  const graphRef = useRef<any>();
  const [overview, setOverview] = useState<DerivativesOverview | null>(null);
  const [liquidations, setLiquidations] = useState<Liquidation[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [overviewRes, liquidationsRes] = await Promise.all([
          fetch(`${API_BASE}/derivatives/overview`),
          fetch(`${API_BASE}/derivatives/liquidations?limit=50`)
        ]);

        if (overviewRes.ok) {
          const data = await overviewRes.json();
          setOverview(data);
          setConnected(true);
        }

        if (liquidationsRes.ok) {
          const data = await liquidationsRes.json();
          setLiquidations(data.liquidations || []);
          buildGraph(data.liquidations || []);
        }
      } catch (err) {
        console.error("Failed to load derivatives data:", err);
        setConnected(false);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const buildGraph = (liquidations: Liquidation[]) => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeMap = new Map<string, GraphNode>();

    const exchanges = Array.from(new Set(liquidations.map(l => l.exchange)));
    exchanges.forEach((exchange) => {
      nodeMap.set(exchange, {
        id: exchange,
        name: exchange,
        type: "exchange",
        size: 14,
        color: "#6366f1",
      });
    });

    const symbols = Array.from(new Set(liquidations.map(l => l.symbol)));
    symbols.forEach((symbol) => {
      nodeMap.set(symbol, {
        id: symbol,
        name: symbol,
        type: "symbol",
        size: 12,
        color: "#f97316",
      });
    });

    liquidations.forEach((liq, index) => {
      if (nodeMap.has(liq.symbol) && nodeMap.has(liq.exchange)) {
        links.push({
          source: liq.symbol,
          target: liq.exchange,
          color: liq.side === "long" ? "#ef4444" : "#10b981",
          width: Math.max(1, Math.log10(liq.value) / 3),
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

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(4)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">Risk Score</div>
          <div className="text-2xl font-bold text-white">{overview?.risk_score || 0}</div>
          <div className={`text-xs mt-1 ${
            overview?.threat_level === "critical" ? "text-red-400" :
            overview?.threat_level === "high" ? "text-orange-400" : "text-yellow-400"
          }`}>{overview?.threat_level || "Medium"}</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">Open Interest</div>
          <div className="text-2xl font-bold text-white">{formatVolume(overview?.total_open_interest || 0)}</div>
          <div className="text-xs text-gray-500 mt-1">Total positions</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">24h Volume</div>
          <div className="text-2xl font-bold text-white">{formatVolume(overview?.total_volume_24h || 0)}</div>
          <div className="text-xs text-gray-500 mt-1">Trading volume</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">24h Liquidations</div>
          <div className="text-2xl font-bold text-red-400">{formatVolume(overview?.total_liquidations_24h || 0)}</div>
          <div className="text-xs text-gray-500 mt-1">{liquidations.length} events</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">Long/Short Ratio</div>
          <div className={`text-2xl font-bold ${(overview?.long_short_ratio || 1) > 1 ? "text-green-400" : "text-red-400"}`}>
            {(overview?.long_short_ratio || 1).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Funding: {formatPercent(overview?.avg_funding_rate || 0)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Derivatives Network</h3>
            <p className="text-sm text-gray-400">Symbol-exchange liquidation relationships</p>
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

            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-orange-500/20 rounded-lg p-3">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  <span className="text-gray-300">Symbol</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-gray-300">Exchange</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-gray-300">Long Liquidation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-gray-300">Short Liquidation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Recent Liquidations</h3>
          </div>
          <div className="max-h-[450px] overflow-y-auto">
            {liquidations.slice(0, 15).map((liq) => (
              <div key={liq.id} className="p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">{liq.symbol}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    liq.side === "long" ? "bg-red-900/30 text-red-400" : "bg-green-900/30 text-green-400"
                  }`}>{liq.side.toUpperCase()}</span>
                </div>
                <div className="text-xs text-gray-400 mb-1">{liq.exchange} | {liq.leverage}x</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{formatTime(liq.timestamp)}</span>
                  <span className="text-orange-400">{formatVolume(liq.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {overview?.top_assets && overview.top_assets.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Top Assets by Open Interest</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Symbol</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Open Interest</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">24h Volume</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Funding Rate</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Liquidations</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">L/S Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {overview.top_assets.slice(0, 10).map((asset) => (
                  <tr key={asset.symbol} className="hover:bg-slate-700/30 transition">
                    <td className="px-4 py-3 text-sm font-semibold text-white">{asset.symbol}</td>
                    <td className="px-4 py-3 text-sm text-right text-white">{formatVolume(asset.open_interest)}</td>
                    <td className="px-4 py-3 text-sm text-right text-white">{formatVolume(asset.volume_24h)}</td>
                    <td className={`px-4 py-3 text-sm text-right ${asset.funding_rate >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatPercent(asset.funding_rate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-400">{formatVolume(asset.liquidations_24h)}</td>
                    <td className={`px-4 py-3 text-sm text-right ${asset.long_short_ratio > 1 ? "text-green-400" : "text-red-400"}`}>
                      {asset.long_short_ratio.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
