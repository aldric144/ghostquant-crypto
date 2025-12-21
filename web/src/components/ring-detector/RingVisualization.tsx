"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useIntelFeed } from "@/hooks/useIntelFeed";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

interface RingNode {
  id: string;
  entityId: string;
  type: "whale" | "manipulation" | "darkpool" | "smartmoney";
  activityCount: number;
  x: number;
  y: number;
  angle: number;
}

interface Ring {
  id: string;
  name: string;
  nodes: RingNode[];
  severity: "high" | "medium" | "low";
  score: number;
  activityCount: number;
  timestamp: number;
  isNew: boolean;
  chains: string[];
  tokens: string[];
  wallets: string[];
  exchanges: string[];
  volume: number;
  patternType: string;
  confidence: number;
}

interface RingVisualizationProps {
  severityFilter: "all" | "high" | "medium" | "low";
  timeFilter: "all" | "5m" | "1h" | "24h";
}

const severityColors = {
  high: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", color: "#ef4444" },
  medium: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30", color: "#fbbf24" },
  low: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30", color: "#22c55e" },
};

const nodeConfig = {
  whale: { color: "#06b6d4", size: 8 },
  manipulation: { color: "#ef4444", size: 10 },
  darkpool: { color: "#6366f1", size: 7 },
  smartmoney: { color: "#a855f7", size: 9 },
};

const severityConfig = {
  high: { color: "#ef4444", glow: 20, pulse: true },
  medium: { color: "#fbbf24", glow: 15, pulse: false },
  low: { color: "#6366f1", glow: 10, pulse: false },
};

export default function RingVisualization({ severityFilter, timeFilter }: RingVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rings, setRings] = useState<Ring[]>([]);
  const [selectedRing, setSelectedRing] = useState<Ring | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationFrame, setAnimationFrame] = useState(0);

  const { latestAlert, alertHistory, connectionStatus } = useIntelFeed();

  const getNodeType = (alertType: string): RingNode["type"] => {
    const typeStr = alertType.toLowerCase();
    if (typeStr.includes("whale")) return "whale";
    if (typeStr.includes("manipulation")) return "manipulation";
    if (typeStr.includes("darkpool")) return "darkpool";
    return "smartmoney";
  };

  const generateCircularLayout = (
    nodeCount: number,
    centerX: number,
    centerY: number,
    radius: number
  ): { x: number; y: number; angle: number }[] => {
    const positions = [];
    const angleStep = (2 * Math.PI) / Math.max(nodeCount, 1);

    for (let i = 0; i < nodeCount; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      positions.push({ x, y, angle });
    }

    return positions;
  };

  const fetchRings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoints = [
        "/manipulation/rings",
        "/manipulation/cluster-events",
        "/unified-risk/rings",
        "/darkpool/cluster",
        "/whale-intel/clusters",
      ];

      const windowParam = timeFilter !== "all" ? `?window=${timeFilter}` : "";

      const responses = await Promise.allSettled(
        endpoints.map((endpoint) =>
          fetch(`${API_BASE}${endpoint}${windowParam}`).then((res) =>
            res.ok ? res.json() : null
          )
        )
      );

      const allRings: Ring[] = [];
      let ringIndex = 0;

      responses.forEach((result, idx) => {
        if (result.status === "fulfilled" && result.value) {
          const data = result.value;
          const ringList = Array.isArray(data) ? data : data.rings || data.clusters || [];
          const source = endpoints[idx].split("/")[1];

          ringList.forEach((ring: Record<string, unknown>) => {
            const score = (ring.score as number) || (ring.risk_score as number) || (ring.severity_score as number) || 0;
            const severity: "high" | "medium" | "low" =
              score >= 0.8 ? "high" : score >= 0.4 ? "medium" : "low";

            const wallets = (ring.wallets as string[]) || (ring.addresses as string[]) || [];
            const nodeCount = wallets.length || (ring.node_count as number) || Math.floor(Math.random() * 10) + 3;

            const nodes: RingNode[] = [];
            for (let i = 0; i < nodeCount; i++) {
              nodes.push({
                id: `node-${ringIndex}-${i}`,
                entityId: wallets[i] || `entity-${ringIndex}-${i}`,
                type: getNodeType((ring.pattern_type as string) || source),
                activityCount: 1,
                x: 0,
                y: 0,
                angle: 0,
              });
            }

            allRings.push({
              id: `ring-${ringIndex}`,
              name: (ring.name as string) || `Ring ${String.fromCharCode(65 + (ringIndex % 26))}`,
              nodes,
              severity,
              score,
              activityCount: (ring.activity_count as number) || nodeCount,
              timestamp: ring.timestamp
                ? new Date(ring.timestamp as string).getTime()
                : Date.now() - ringIndex * 60000,
              isNew: false,
              chains: (ring.chains as string[]) || [(ring.chain as string) || "ethereum"],
              tokens: (ring.tokens as string[]) || [(ring.token as string) || "unknown"],
              wallets,
              exchanges: (ring.exchanges as string[]) || [(ring.exchange as string) || "unknown"],
              volume: (ring.volume as number) || (ring.total_volume as number) || 0,
              patternType: (ring.pattern_type as string) || (ring.type as string) || source,
              confidence: (ring.confidence as number) || score,
            });

            ringIndex++;
          });
        }
      });

      allRings.sort((a, b) => b.score - a.score);
      setRings(allRings.slice(0, 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rings");
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchRings();
    const interval = setInterval(fetchRings, 30000);
    return () => clearInterval(interval);
  }, [fetchRings]);

  useEffect(() => {
    if (!latestAlert) return;

    const alertType = latestAlert.intelligence?.event?.event_type || latestAlert.type || "alert";
    const score = latestAlert.score || 0;

    if (
      !alertType.toLowerCase().includes("manipulation") &&
      !alertType.toLowerCase().includes("coordination") &&
      !alertType.toLowerCase().includes("ring") &&
      !alertType.toLowerCase().includes("cluster")
    ) {
      return;
    }

    const severity: "high" | "medium" | "low" = score >= 0.8 ? "high" : score >= 0.4 ? "medium" : "low";
    const nodeType = getNodeType(alertType);
    const entityId = latestAlert.intelligence?.entity?.entity_id || `entity-${Date.now()}`;

    setRings((prev) => {
      const newRings = [...prev];

      let targetRing = newRings.find(
        (ring) =>
          ring.severity === severity &&
          ring.nodes.length < 30 &&
          Date.now() - ring.timestamp < 3600000
      );

      if (!targetRing && newRings.length < 20) {
        const ringId = `ring-live-${Date.now()}`;
        targetRing = {
          id: ringId,
          name: `Ring ${String.fromCharCode(65 + (newRings.length % 26))}`,
          nodes: [],
          severity,
          score,
          activityCount: 0,
          timestamp: Date.now(),
          isNew: true,
          chains: [],
          tokens: [],
          wallets: [],
          exchanges: [],
          volume: 0,
          patternType: alertType,
          confidence: score,
        };
        newRings.unshift(targetRing);

        setTimeout(() => {
          setRings((current) =>
            current.map((ring) =>
              ring.id === ringId ? { ...ring, isNew: false } : ring
            )
          );
        }, 3000);
      }

      if (targetRing) {
        const newNode: RingNode = {
          id: `node-${Date.now()}-${Math.random()}`,
          entityId,
          type: nodeType,
          activityCount: 1,
          x: 0,
          y: 0,
          angle: 0,
        };

        targetRing.nodes.push(newNode);
        targetRing.activityCount++;
        targetRing.score = Math.max(targetRing.score, score);
        targetRing.severity = targetRing.score >= 0.8 ? "high" : targetRing.score >= 0.4 ? "medium" : "low";
      }

      return newRings;
    });
  }, [latestAlert]);

  const filteredRings = useMemo(() => {
    let filtered = rings;

    if (severityFilter !== "all") {
      filtered = filtered.filter((ring) => ring.severity === severityFilter);
    }

    if (timeFilter !== "all") {
      const cutoffTime = new Date();

      switch (timeFilter) {
        case "5m":
          cutoffTime.setMinutes(cutoffTime.getMinutes() - 5);
          break;
        case "1h":
          cutoffTime.setHours(cutoffTime.getHours() - 1);
          break;
        case "24h":
          cutoffTime.setHours(cutoffTime.getHours() - 24);
          break;
      }

      filtered = filtered.filter((ring) => ring.timestamp >= cutoffTime.getTime());
    }

    return filtered;
  }, [rings, severityFilter, timeFilter]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame((prev) => prev + 1);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, width, height);

    const ringCount = filteredRings.length;
    if (ringCount === 0) return;

    const cols = Math.ceil(Math.sqrt(ringCount));
    const rows = Math.ceil(ringCount / cols);
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    filteredRings.forEach((ring, ringIndex) => {
      const col = ringIndex % cols;
      const row = Math.floor(ringIndex / cols);
      const centerX = col * cellWidth + cellWidth / 2;
      const centerY = row * cellHeight + cellHeight / 2;
      const radius = Math.min(cellWidth, cellHeight) * 0.35;

      const positions = generateCircularLayout(ring.nodes.length, centerX, centerY, radius);
      ring.nodes.forEach((node, i) => {
        if (positions[i]) {
          node.x = positions[i].x;
          node.y = positions[i].y;
          node.angle = positions[i].angle;
        }
      });

      const config = severityConfig[ring.severity];

      if (ring.isNew || (config.pulse && animationFrame % 20 < 10)) {
        const glowRadius = radius + config.glow + (ring.isNew ? 5 : 0);
        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          radius,
          centerX,
          centerY,
          glowRadius
        );
        gradient.addColorStop(0, `${config.color}00`);
        gradient.addColorStop(0.5, `${config.color}40`);
        gradient.addColorStop(1, `${config.color}00`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, glowRadius, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.strokeStyle = config.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = config.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < ring.nodes.length; i++) {
        for (let j = i + 1; j < ring.nodes.length; j++) {
          const node1 = ring.nodes[i];
          const node2 = ring.nodes[j];

          const waveOffset = (animationFrame + i * 10 + j * 10) % 100;
          if (waveOffset < 50) {
            ctx.beginPath();
            ctx.moveTo(node1.x, node1.y);
            ctx.lineTo(node2.x, node2.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      ring.nodes.forEach((node) => {
        const nodeConf = nodeConfig[node.type];
        const nodeSize = nodeConf.size + (ring.isNew ? 2 : 0);

        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          nodeSize * 2
        );
        gradient.addColorStop(0, `${nodeConf.color}80`);
        gradient.addColorStop(1, `${nodeConf.color}00`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize * 2, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = nodeConf.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = "#020617";
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      ctx.fillStyle = "#e5e7eb";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ring.name, centerX, centerY);

      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText(`${ring.nodes.length} entities`, centerX, centerY + 20);
    });
  }, [filteredRings, animationFrame]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ringCount = filteredRings.length;
    if (ringCount === 0) return;

    const cols = Math.ceil(Math.sqrt(ringCount));
    const rows = Math.ceil(ringCount / cols);
    const cellWidth = rect.width / cols;
    const cellHeight = rect.height / rows;

    filteredRings.forEach((ring, ringIndex) => {
      const col = ringIndex % cols;
      const row = Math.floor(ringIndex / cols);
      const centerX = col * cellWidth + cellWidth / 2;
      const centerY = row * cellHeight + cellHeight / 2;
      const radius = Math.min(cellWidth, cellHeight) * 0.35;

      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      if (distance <= radius + 20) {
        setSelectedRing(ring);
      }
    });
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading && rings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error && rings.length === 0) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              connectionStatus === "connected"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-400 animate-pulse"
                  : "bg-red-400"
              }`}
            />
            <span className="text-xs font-medium">
              {connectionStatus === "connected" ? "Live" : "Disconnected"}
            </span>
          </div>
          <span className="text-sm text-gray-400">
            {filteredRings.length} active rings
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-gray-400">High</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-gray-400">Medium</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-400">Low</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Ring Network Visualization</h3>
            <p className="text-sm text-gray-400">Click on a ring to view details</p>
          </div>
          <div className="relative h-96">
            {filteredRings.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-gray-500 text-lg">No manipulation rings detected</p>
                <p className="text-gray-600 text-sm mt-2">
                  Adjust filters or wait for new activity
                </p>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-pointer"
                onClick={handleCanvasClick}
              />
            )}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Ring List</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredRings.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No rings to display</div>
            ) : (
              <div className="divide-y divide-slate-700">
                {filteredRings.map((ring) => {
                  const severityStyle = severityColors[ring.severity];
                  return (
                    <div
                      key={ring.id}
                      className={`p-4 hover:bg-slate-700/50 cursor-pointer transition-colors ${
                        selectedRing?.id === ring.id ? "bg-slate-700/50" : ""
                      }`}
                      onClick={() => setSelectedRing(ring)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{ring.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${severityStyle.bg} ${severityStyle.text}`}
                        >
                          {ring.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{ring.nodes.length} wallets</span>
                        <span>{formatTime(ring.timestamp)}</span>
                        <span>{(ring.confidence * 100).toFixed(0)}% conf</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedRing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedRing.name}</h3>
                <p className="text-sm text-gray-400">{selectedRing.patternType}</p>
              </div>
              <button
                onClick={() => setSelectedRing(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Severity</div>
                  <div
                    className={`text-lg font-bold ${severityColors[selectedRing.severity].text}`}
                  >
                    {selectedRing.severity.toUpperCase()}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Confidence</div>
                  <div className="text-lg font-bold text-cyan-400">
                    {(selectedRing.confidence * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Volume</div>
                  <div className="text-lg font-bold text-white">
                    {formatVolume(selectedRing.volume)}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Wallet Count</div>
                  <div className="text-lg font-bold text-white">{selectedRing.nodes.length}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Wallets in Ring</h4>
                  <div className="bg-slate-800/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    {selectedRing.wallets.length > 0 ? (
                      <div className="space-y-1">
                        {selectedRing.wallets.map((wallet, i) => (
                          <div key={i} className="text-xs font-mono text-cyan-400">
                            {wallet.substring(0, 10)}...{wallet.substring(wallet.length - 8)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        {selectedRing.nodes.length} wallets detected
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Exchanges</h4>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      {selectedRing.exchanges.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedRing.exchanges.map((exchange, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded"
                            >
                              {exchange}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">No exchange data</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Chains</h4>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      {selectedRing.chains.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedRing.chains.map((chain, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded"
                            >
                              {chain}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">No chain data</div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Tokens</h4>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    {selectedRing.tokens.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedRing.tokens.map((token, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded"
                          >
                            {token}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">No token data</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Pattern Type</h4>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <span className="text-sm text-white">{selectedRing.patternType}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setSelectedRing(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
