"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Use Next.js API proxy routes for system endpoints to avoid routing issues
// The proxy routes forward requests to the backend
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

// Get WebSocket URL from API_BASE (convert https to wss)
const getWsUrl = () => {
  const base = API_BASE.replace(/^http/, "ws");
  return `${base}/ws/system`;
};

interface SocketHealth {
  connection: "connected" | "disconnected";
  reconnectCount: number;
  latency: number;
  lastAlert: string | null;
}

interface Performance {
  fps: number;
  memoryUsage: number;
  cpuLoad: string;
}

interface RedisFeed {
  totalEvents: number;
  feedVelocity: number;
  lastMessage: string | null;
  severity: {
    high: number;
    medium: number;
    low: number;
  };
}

interface WorkerStatus {
  running: boolean;
  simulationMode: boolean;
  loopSpeed: number;
  queueSize: number;
  processingErrors: number;
}

interface Uptime {
  sessionUptime: number;
  lastReload: string;
}

interface Diagnostics {
  timelineEvents: number;
  graphNodes: number;
  graphEdges: number;
  ringSystems: number;
  ghostmindInsights: number;
  entityCacheSize: number;
}

interface ConfirmationModal {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  isDanger: boolean;
}

export default function SettingsPageV2() {
  const [socketHealth, setSocketHealth] = useState<SocketHealth>({
    connection: "disconnected",
    reconnectCount: 0,
    latency: 0,
    lastAlert: null,
  });
  const [performance, setPerformance] = useState<Performance>({
    fps: 0,
    memoryUsage: 0,
    cpuLoad: "browser",
  });
  const [redisFeed, setRedisFeed] = useState<RedisFeed>({
    totalEvents: 0,
    feedVelocity: 0,
    lastMessage: null,
    severity: { high: 0, medium: 0, low: 0 },
  });
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus>({
    running: false,
    simulationMode: false,
    loopSpeed: 50,
    queueSize: 0,
    processingErrors: 0,
  });
  const [uptime, setUptime] = useState<Uptime>({
    sessionUptime: 0,
    lastReload: new Date().toISOString(),
  });
  const [diagnostics, setDiagnostics] = useState<Diagnostics>({
    timelineEvents: 0,
    graphNodes: 0,
    graphEdges: 0,
    ringSystems: 0,
    ghostmindInsights: 0,
    entityCacheSize: 0,
  });
  const [simulationRate, setSimulationRate] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<ConfirmationModal>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDanger: false,
  });

  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(Date.now());
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  const fetchAllData = useCallback(async () => {
    try {
      // Use Next.js API proxy routes to avoid routing issues
      // These proxy routes forward requests to the backend
      const [socketRes, perfRes, redisRes, workerRes, uptimeRes, diagRes] = await Promise.allSettled([
        fetch(`/api/system/socket-health`),
        fetch(`/api/system/performance`),
        fetch(`/api/system/redis-feed`),
        fetch(`/api/system/workers/status`),
        fetch(`/api/system/uptime`),
        fetch(`/api/system/diagnostics`),
      ]);

      if (socketRes.status === "fulfilled" && socketRes.value.ok) {
        setSocketHealth(await socketRes.value.json());
      }
      if (perfRes.status === "fulfilled" && perfRes.value.ok) {
        setPerformance(await perfRes.value.json());
      }
      if (redisRes.status === "fulfilled" && redisRes.value.ok) {
        setRedisFeed(await redisRes.value.json());
      }
      if (workerRes.status === "fulfilled" && workerRes.value.ok) {
        setWorkerStatus(await workerRes.value.json());
      }
      if (uptimeRes.status === "fulfilled" && uptimeRes.value.ok) {
        setUptime(await uptimeRes.value.json());
      }
      if (diagRes.status === "fulfilled" && diagRes.value.ok) {
        setDiagnostics(await diagRes.value.json());
      }
    } catch (error) {
      console.error("Failed to fetch system data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const connectWebSocket = () => {
      const wsUrl = getWsUrl();
      console.log("[Settings V2] Connecting to WebSocket:", wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log("[Settings V2] WebSocket connected");
        setWsConnected(true);
        setSocketHealth(prev => ({ ...prev, connection: "connected" }));
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case "system_status":
              setSocketHealth({
                connection: message.data.connection,
                reconnectCount: message.data.reconnectCount || 0,
                latency: message.data.latency || 0,
                lastAlert: message.data.lastAlert,
              });
              break;
            case "worker_status":
              setWorkerStatus({
                running: message.data.running,
                simulationMode: message.data.simulationMode || false,
                loopSpeed: message.data.loopSpeed || 50,
                queueSize: message.data.queueSize || 0,
                processingErrors: message.data.processingErrors || 0,
              });
              break;
            case "redis_feed":
              setRedisFeed({
                totalEvents: message.data.totalEvents || 0,
                feedVelocity: message.data.feedVelocity || 0,
                lastMessage: message.data.lastMessage,
                severity: message.data.severity || { high: 0, medium: 0, low: 0 },
              });
              break;
            case "engine_metrics":
              setDiagnostics({
                timelineEvents: message.data.timelineEvents || 0,
                graphNodes: message.data.graphNodes || 0,
                graphEdges: message.data.graphEdges || 0,
                ringSystems: message.data.ringSystems || 0,
                ghostmindInsights: message.data.ghostmindInsights || 0,
                entityCacheSize: message.data.entityCacheSize || 0,
              });
              break;
            case "connection":
              console.log("[Settings V2] Connection confirmed:", message.message);
              break;
          }
        } catch (error) {
          console.error("[Settings V2] Failed to parse WebSocket message:", error);
        }
      };
      
      ws.onclose = () => {
        console.log("[Settings V2] WebSocket disconnected");
        setWsConnected(false);
        setSocketHealth(prev => ({ ...prev, connection: "disconnected" }));
        
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
      
      ws.onerror = (error) => {
        console.error("[Settings V2] WebSocket error:", error);
        setWsConnected(false);
      };
    };
    
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Initial data fetch (WebSocket will handle real-time updates)
  useEffect(() => {
    fetchAllData();
    // Only poll every 30 seconds as a fallback - WebSocket handles real-time updates
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  useEffect(() => {
    let animationFrameId: number;

    const calculateFPS = () => {
      frameCountRef.current++;
      const now = Date.now();
      const elapsed = now - lastFrameTimeRef.current;

      if (elapsed >= 1000) {
        setPerformance((prev) => ({
          ...prev,
          fps: Math.round((frameCountRef.current * 1000) / elapsed),
        }));
        frameCountRef.current = 0;
        lastFrameTimeRef.current = now;
      }

      animationFrameId = requestAnimationFrame(calculateFPS);
    };

    animationFrameId = requestAnimationFrame(calculateFPS);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    const updateMemory = () => {
      if ("memory" in window.performance && (window.performance as unknown as { memory: { usedJSHeapSize: number } }).memory) {
        const mem = (window.performance as unknown as { memory: { usedJSHeapSize: number } }).memory;
        const usedMB = mem.usedJSHeapSize / 1048576;
        setPerformance((prev) => ({ ...prev, memoryUsage: Math.round(usedMB) }));
      }
    };

    updateMemory();
    const interval = setInterval(updateMemory, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const showConfirmation = (title: string, message: string, onConfirm: () => void, isDanger = false) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, isDanger });
  };

  const closeConfirmation = () => {
    setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: () => {}, isDanger: false });
  };

  const handleConfirm = () => {
    confirmModal.onConfirm();
    closeConfirmation();
  };

  const handleStartSimulator = async () => {
    try {
      await fetch(`/api/simulation/start`, { method: "POST" });
      fetchAllData();
    } catch (error) {
      console.error("Failed to start simulator:", error);
    }
  };

  const handleStopSimulator = async () => {
    try {
      await fetch(`/api/simulation/stop`, { method: "POST" });
      fetchAllData();
    } catch (error) {
      console.error("Failed to stop simulator:", error);
    }
  };

  const handleSetSimulationRate = async (rate: number) => {
    setSimulationRate(rate);
    try {
      await fetch(`/api/simulation/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rate }),
      });
    } catch (error) {
      console.error("Failed to set simulation rate:", error);
    }
  };

  const handleClearLocalStorage = () => {
    showConfirmation(
      "Clear localStorage",
      "This will clear all locally stored data including recently viewed entities and preferences. Continue?",
      () => {
        localStorage.clear();
        alert("localStorage cleared successfully");
      }
    );
  };

  const handleResetEntityCache = () => {
    showConfirmation(
      "Reset Entity Cache",
      "This will reset the entity cache on the server. Continue?",
      async () => {
        try {
          await fetch(`/api/system/data/reset-entity-cache`, { method: "POST" });
          localStorage.removeItem("entityCache");
          alert("Entity cache reset successfully");
          fetchAllData();
        } catch (error) {
          alert("Failed to reset entity cache");
        }
      }
    );
  };

  const handleResetGhostMind = () => {
    showConfirmation(
      "Reset GhostMind Memory",
      "This will reset GhostMind conversation history on the server. Continue?",
      async () => {
        try {
          await fetch(`/api/system/data/reset-ghostmind`, { method: "POST" });
          localStorage.removeItem("ghostmindMemory");
          alert("GhostMind memory reset successfully");
          fetchAllData();
        } catch (error) {
          alert("Failed to reset GhostMind memory");
        }
      }
    );
  };

  const handleDownloadSnapshot = async () => {
    try {
      const response = await fetch(`/api/system/data/download-snapshot`);
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ghostquant-snapshot-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download snapshot:", error);
    }
  };

  const handleFlushRedis = () => {
    showConfirmation(
      "Flush Redis Feed",
      "DANGER: This will flush the Redis intelligence feed. This action cannot be undone. Continue?",
      async () => {
        try {
          await fetch(`/api/danger/flush-redis`, { method: "POST" });
          alert("Redis feed flushed successfully");
          fetchAllData();
        } catch (error) {
          alert("Failed to flush Redis feed");
        }
      },
      true
    );
  };

  const handleKillWorkers = () => {
    showConfirmation(
      "Kill Workers",
      "DANGER: This will stop all background intelligence workers. Intelligence processing will halt. Continue?",
      async () => {
        try {
          await fetch(`/api/danger/kill-workers`, { method: "POST" });
          alert("Workers killed successfully");
          fetchAllData();
        } catch (error) {
          alert("Failed to kill workers");
        }
      },
      true
    );
  };

  const handleRestartWorkers = () => {
    showConfirmation(
      "Restart Workers",
      "This will restart all background intelligence workers. Continue?",
      async () => {
        try {
          await fetch(`/api/danger/restart-workers`, { method: "POST" });
          alert("Workers restarted successfully");
          fetchAllData();
        } catch (error) {
          alert("Failed to restart workers");
        }
      },
      true
    );
  };

  const handleReloadConnections = () => {
    showConfirmation(
      "Reload Client Connections",
      "This will signal all clients to reload their connections. Continue?",
      async () => {
        try {
          await fetch(`/api/danger/reload-client`, { method: "POST" });
          alert("Reload signal sent successfully");
          fetchAllData();
        } catch (error) {
          alert("Failed to send reload signal");
        }
      },
      true
    );
  };

  const handleStartWorkers = async () => {
    try {
      await fetch(`/api/system/workers/start`, { method: "POST" });
      fetchAllData();
    } catch (error) {
      console.error("Failed to start workers:", error);
    }
  };

  const handleStopWorkers = async () => {
    try {
      await fetch(`/api/system/workers/stop`, { method: "POST" });
      fetchAllData();
    } catch (error) {
      console.error("Failed to stop workers:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading system diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">System Intelligence & Settings V2</h1>
          <p className="text-sm text-gray-400">Real-time platform health monitoring and configuration</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          socketHealth.connection === "connected"
            ? "bg-green-500/20 text-green-400"
            : "bg-red-500/20 text-red-400"
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            socketHealth.connection === "connected" ? "bg-green-400 animate-pulse" : "bg-red-400"
          }`} />
          <span className="text-xs font-medium">
            {socketHealth.connection === "connected" ? "Live" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto">
        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">WebSocket & Socket.IO Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Connection:</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  socketHealth.connection === "connected"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {socketHealth.connection.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Reconnect Count:</span>
                <span className="text-xs text-cyan-400 font-medium">{socketHealth.reconnectCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Latency:</span>
                <span className="text-xs text-cyan-400 font-medium">{socketHealth.latency}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Last Alert:</span>
                <span className="text-xs text-cyan-400 font-medium">
                  {socketHealth.lastAlert || "Waiting..."}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">Redis Intelligence Feed</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Total Events:</span>
                <span className="text-xs text-cyan-400 font-medium">{redisFeed.totalEvents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Feed Velocity:</span>
                <span className="text-xs text-cyan-400 font-medium">{redisFeed.feedVelocity.toFixed(1)} msg/min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Last Message:</span>
                <span className="text-xs text-cyan-400 font-medium">
                  {redisFeed.lastMessage || "N/A"}
                </span>
              </div>
              <div className="pt-2 border-t border-cyan-500/20">
                <div className="text-xs text-gray-400 mb-2">Severity Distribution:</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-400">High:</span>
                    <span className="text-xs text-red-400 font-medium">{redisFeed.severity.high}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-yellow-400">Medium:</span>
                    <span className="text-xs text-yellow-400 font-medium">{redisFeed.severity.medium}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Low:</span>
                    <span className="text-xs text-gray-400 font-medium">{redisFeed.severity.low}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">Worker Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Intelligence Worker:</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  workerStatus.running
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {workerStatus.running ? "RUNNING" : "STOPPED"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Simulation Mode:</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  workerStatus.simulationMode
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}>
                  {workerStatus.simulationMode ? "ON" : "OFF"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Loop Speed:</span>
                <span className="text-xs text-cyan-400 font-medium">{workerStatus.loopSpeed}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Queue Size:</span>
                <span className="text-xs text-cyan-400 font-medium">{workerStatus.queueSize}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Processing Errors:</span>
                <span className={`text-xs font-medium ${workerStatus.processingErrors > 0 ? "text-red-400" : "text-green-400"}`}>
                  {workerStatus.processingErrors}
                </span>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleStartWorkers}
                  disabled={workerStatus.running}
                  className="flex-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded text-xs text-green-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start
                </button>
                <button
                  onClick={handleStopWorkers}
                  disabled={!workerStatus.running}
                  className="flex-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-xs text-red-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Stop
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">System Uptime</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Session Uptime:</span>
                <span className="text-xs text-cyan-400 font-medium">{formatUptime(uptime.sessionUptime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Last Reload:</span>
                <span className="text-xs text-cyan-400 font-medium">{formatTimestamp(uptime.lastReload)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">Performance</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">FPS:</span>
                  <span className="text-xs text-cyan-400 font-medium">{performance.fps}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all"
                    style={{ width: `${Math.min((performance.fps / 60) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Memory Usage:</span>
                  <span className="text-xs text-cyan-400 font-medium">{performance.memoryUsage} MB</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${Math.min((performance.memoryUsage / 500) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">CPU Load:</span>
                <span className="text-xs text-cyan-400 font-medium">{performance.cpuLoad === "browser" ? "Browser Only" : "Server"}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">Terminal Diagnostics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Timeline Events:</span>
                <span className="text-xs text-cyan-400 font-medium">{diagnostics.timelineEvents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Graph Nodes:</span>
                <span className="text-xs text-cyan-400 font-medium">{diagnostics.graphNodes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Graph Edges:</span>
                <span className="text-xs text-cyan-400 font-medium">{diagnostics.graphEdges}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Ring Systems:</span>
                <span className="text-xs text-cyan-400 font-medium">{diagnostics.ringSystems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">GhostMind Insights:</span>
                <span className="text-xs text-cyan-400 font-medium">{diagnostics.ghostmindInsights}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Entity Cache Size:</span>
                <span className="text-xs text-cyan-400 font-medium">{diagnostics.entityCacheSize}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">Simulation Controls</h3>
            <div className="space-y-3">
              <button
                onClick={handleStartSimulator}
                disabled={workerStatus.simulationMode}
                className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-xs text-green-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Intel Simulator
              </button>
              <button
                onClick={handleStopSimulator}
                disabled={!workerStatus.simulationMode}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-xs text-red-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Stop Intel Simulator
              </button>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Event Rate:</span>
                  <span className="text-xs text-cyan-400 font-medium">{simulationRate} events/sec</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={simulationRate}
                  onChange={(e) => handleSetSimulationRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">Data Tools</h3>
            <div className="space-y-2">
              <button
                onClick={handleClearLocalStorage}
                className="w-full px-4 py-2 bg-slate-800/50 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/50 rounded-lg text-xs text-gray-300 hover:text-cyan-400 font-medium transition-all"
              >
                Clear localStorage
              </button>
              <button
                onClick={handleResetEntityCache}
                className="w-full px-4 py-2 bg-slate-800/50 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/50 rounded-lg text-xs text-gray-300 hover:text-cyan-400 font-medium transition-all"
              >
                Reset Entity Cache
              </button>
              <button
                onClick={handleResetGhostMind}
                className="w-full px-4 py-2 bg-slate-800/50 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/50 rounded-lg text-xs text-gray-300 hover:text-cyan-400 font-medium transition-all"
              >
                Reset GhostMind Memory
              </button>
              <button
                onClick={handleDownloadSnapshot}
                className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-xs text-cyan-400 font-medium transition-all"
              >
                Download Intelligence Snapshot
              </button>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 hover:border-red-500/50 transition-all">
            <h3 className="text-sm font-bold text-red-400 mb-3">Danger Zone</h3>
            <div className="space-y-2">
              <button
                onClick={handleFlushRedis}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-xs text-red-400 font-medium transition-all"
              >
                Flush Redis Feed
              </button>
              <button
                onClick={handleKillWorkers}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-xs text-red-400 font-medium transition-all"
              >
                Kill Workers
              </button>
              <button
                onClick={handleRestartWorkers}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-xs text-red-400 font-medium transition-all"
              >
                Restart Workers
              </button>
              <button
                onClick={handleReloadConnections}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-xs text-red-400 font-medium transition-all"
              >
                Reload Client Connections
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`bg-slate-900 border ${confirmModal.isDanger ? "border-red-500/30" : "border-cyan-500/30"} rounded-lg p-6 max-w-md w-full mx-4`}>
            <h3 className={`text-lg font-bold ${confirmModal.isDanger ? "text-red-400" : "text-cyan-400"} mb-2`}>
              {confirmModal.title}
            </h3>
            <p className="text-sm text-gray-300 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={closeConfirmation}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-gray-500/20 rounded-lg text-sm text-gray-300 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2 ${confirmModal.isDanger ? "bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-400" : "bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/50 text-cyan-400"} border rounded-lg text-sm font-medium transition-all`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
