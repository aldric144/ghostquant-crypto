"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph").then(mod => mod.ForceGraph2D), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

interface ManipulationAlert {
  id: string;
  symbol: string;
  type: string;
  severity: string;
  confidence: number;
  description: string;
  volume_affected: number;
  addresses_involved: number;
  exchange: string;
  timestamp: string;
  recommended_action: string;
}

interface GraphNode {
  id: string;
  name: string;
  type: "alert" | "exchange" | "address";
  size: number;
  color: string;
  severity?: string;
}

interface GraphLink {
  source: string;
  target: string;
  color: string;
  width: number;
}

const severityColors = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#10b981",
};

export default function ManipulationTab() {
  const graphRef = useRef<any>();
  const [alerts, setAlerts] = useState<ManipulationAlert[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [alertsRes, summaryRes] = await Promise.all([
          fetch(`${API_BASE}/manipulation/alerts?limit=50`),
          fetch(`${API_BASE}/manipulation/summary`)
        ]);

        if (alertsRes.ok) {
          const data = await alertsRes.json();
          setAlerts(data.alerts || []);
          buildGraph(data.alerts || []);
          setConnected(true);
        }

        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setSummary(data);
        }
      } catch (err) {
        console.error("Failed to load manipulation data:", err);
        setConnected(false);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const buildGraph = (alerts: ManipulationAlert[]) => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeMap = new Map<string, GraphNode>();

    const exchanges = Array.from(new Set(alerts.map(a => a.exchange)));
    exchanges.forEach((exchange) => {
      nodeMap.set(exchange, {
        id: exchange,
        name: exchange,
        type: "exchange",
        size: 14,
        color: "#6366f1",
      });
    });

    alerts.forEach((alert, index) => {
      const alertId = `alert-${alert.symbol}-${index}`;
      const color = severityColors[alert.severity as keyof typeof severityColors] || severityColors.medium;
      
      nodeMap.set(alertId, {
        id: alertId,
        name: `${alert.symbol} - ${alert.type}`,
        type: "alert",
        size: 8 + (alert.confidence * 6),
        color,
        severity: alert.severity,
      });

      if (nodeMap.has(alert.exchange)) {
        links.push({
          source: alertId,
          target: alert.exchange,
          color,
          width: Math.max(1, alert.confidence * 3),
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

    if (node.severity === "critical") {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size + 3, 0, 2 * Math.PI, false);
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 2 / globalScale;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

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

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
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
          <div className="text-sm text-gray-400 mb-1">24h Alerts</div>
          <div className="text-2xl font-bold text-white">{summary?.total_alerts_24h || alerts.length}</div>
          <div className="text-xs text-gray-500 mt-1">Detected patterns</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">Critical Alerts</div>
          <div className="text-2xl font-bold text-red-400">{summary?.critical_alerts || alerts.filter(a => a.severity === "critical").length}</div>
          <div className="text-xs text-gray-500 mt-1">Require attention</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="text-sm text-gray-400 mb-1">Avg Confidence</div>
          <div className="text-2xl font-bold text-white">
            {alerts.length > 0 ? ((alerts.reduce((sum, a) => sum + a.confidence, 0) / alerts.length) * 100).toFixed(0) : 0}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Detection accuracy</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Manipulation Network</h3>
            <p className="text-sm text-gray-400">Alert patterns and exchange relationships</p>
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

            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-red-500/20 rounded-lg p-3">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-gray-300">Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  <span className="text-gray-300">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="text-gray-300">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-gray-300">Exchange</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
          </div>
          <div className="max-h-[450px] overflow-y-auto">
            {alerts.slice(0, 15).map((alert) => (
              <div key={alert.id} className="p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">{alert.symbol}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    alert.severity === "critical" ? "bg-red-900/30 text-red-400" :
                    alert.severity === "high" ? "bg-orange-900/30 text-orange-400" :
                    "bg-yellow-900/30 text-yellow-400"
                  }`}>{alert.severity}</span>
                </div>
                <div className="text-xs text-gray-400 mb-1 capitalize">{alert.type?.replace(/_/g, " ")}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{alert.exchange}</span>
                  <span className="text-red-400">{formatVolume(alert.volume_affected)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
