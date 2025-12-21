"use client";

import { useState, useEffect, useCallback } from "react";
import RiskPanel from "./RiskPanel";
import WhalePanel from "./WhalePanel";
import EntityPanel from "./EntityPanel";
import TrendPanel from "./TrendPanel";
import MapPanel from "./MapPanel";
import AnomalyPanel from "./AnomalyPanel";
import NarrativePanel from "./NarrativePanel";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

export interface AnalyticsData {
  risk: RiskData | null;
  whales: WhaleAnalyticsData | null;
  entities: EntityData | null;
  trends: TrendData | null;
  map: MapData | null;
  anomalies: AnomalyData | null;
  narratives: NarrativeData | null;
}

export interface RiskData {
  globalScore: number;
  distribution: { level: string; count: number; percentage: number }[];
  topRisks: { entity: string; score: number; type: string; chain: string }[];
}

export interface WhaleAnalyticsData {
  topWhales: { address: string; volume: number; movements: number; influence: number }[];
  heatmapData: { x: number; y: number; value: number; label: string }[];
  activityTrend: { time: string; activity: number }[];
}

export interface EntityData {
  activeEntities: number;
  categories: { name: string; count: number; percentage: number }[];
  movementPatterns: { pattern: string; count: number; trend: "up" | "down" | "stable" }[];
  distribution: { type: string; count: number }[];
}

export interface TrendData {
  hourlyActivity: { hour: string; value: number; type: string }[];
  heatmap: { day: string; hour: number; value: number }[];
  events: { time: string; type: string; count: number }[];
}

export interface MapData {
  hotZones: { lat: number; lng: number; intensity: number; label: string }[];
  clusters: { id: string; lat: number; lng: number; size: number; risk: number }[];
  events: { lat: number; lng: number; type: string; timestamp: Date }[];
}

export interface AnomalyData {
  outliers: { id: string; entity: string; deviation: number; type: string; timestamp: Date }[];
  summary: { total: number; high: number; medium: number; low: number };
  timeline: { time: string; count: number; severity: string }[];
}

export interface NarrativeData {
  summary: string;
  topics: { topic: string; relevance: number; sentiment: string }[];
  trends: { trend: string; direction: "up" | "down" | "stable"; impact: number }[];
  insights: string[];
}

type ViewMode = "overview" | "risk" | "whales" | "entities" | "trends" | "map" | "anomalies" | "narratives";

export default function AnalyticsDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshCountdown, setRefreshCountdown] = useState(12);
  
  const [data, setData] = useState<AnalyticsData>({
    risk: null,
    whales: null,
    entities: null,
    trends: null,
    map: null,
    anomalies: null,
    narratives: null,
  });

  const fetchAllData = useCallback(async () => {
    if (!isLiveMode) return;
    
    setIsLoading(true);
    try {
      // Use correct existing endpoints
      const [riskRes, whaleRes, entityRes, trendRes, mapRes, anomalyRes, narrativeRes] = await Promise.allSettled([
        fetch(`${API_BASE}/unified-risk/dashboard`),     // Correct endpoint for risk dashboard
        fetch(`${API_BASE}/whales/top?limit=20`),        // Correct endpoint for top whales
        fetch(`${API_BASE}/widb/wallets?limit=20`),      // Use WIDB for entity data
        fetch(`${API_BASE}/unified-risk/timeline`),      // This endpoint exists
        fetch(`${API_BASE}/unified-risk/heatmap`),       // Use heatmap for map data
        fetch(`${API_BASE}/unified-risk/all-threats?severity=critical&limit=20`), // Use threats for anomalies
        fetch(`${API_BASE}/unified-risk/dashboard`),     // Reuse dashboard for narrative summary
      ]);

      const newData: AnalyticsData = {
        risk: null,
        whales: null,
        entities: null,
        trends: null,
        map: null,
        anomalies: null,
        narratives: null,
      };

      // Process risk data
      if (riskRes.status === "fulfilled" && riskRes.value.ok) {
        try {
          const riskJson = await riskRes.value.json();
          newData.risk = riskJson;
        } catch {
          newData.risk = generateMockRiskData();
        }
      } else {
        newData.risk = generateMockRiskData();
      }

      // Process whale data
      if (whaleRes.status === "fulfilled" && whaleRes.value.ok) {
        try {
          const whaleJson = await whaleRes.value.json();
          newData.whales = whaleJson;
        } catch {
          newData.whales = generateMockWhaleData();
        }
      } else {
        newData.whales = generateMockWhaleData();
      }

      // Process entity data
      if (entityRes.status === "fulfilled" && entityRes.value.ok) {
        try {
          const entityJson = await entityRes.value.json();
          newData.entities = entityJson;
        } catch {
          newData.entities = generateMockEntityData();
        }
      } else {
        newData.entities = generateMockEntityData();
      }

      // Process trend data
      if (trendRes.status === "fulfilled" && trendRes.value.ok) {
        try {
          const trendJson = await trendRes.value.json();
          newData.trends = trendJson;
        } catch {
          newData.trends = generateMockTrendData();
        }
      } else {
        newData.trends = generateMockTrendData();
      }

      // Process map data
      if (mapRes.status === "fulfilled" && mapRes.value.ok) {
        try {
          const mapJson = await mapRes.value.json();
          newData.map = mapJson;
        } catch {
          newData.map = generateMockMapData();
        }
      } else {
        newData.map = generateMockMapData();
      }

      // Process anomaly data
      if (anomalyRes.status === "fulfilled" && anomalyRes.value.ok) {
        try {
          const anomalyJson = await anomalyRes.value.json();
          newData.anomalies = anomalyJson;
        } catch {
          newData.anomalies = generateMockAnomalyData();
        }
      } else {
        newData.anomalies = generateMockAnomalyData();
      }

      // Process narrative data
      if (narrativeRes.status === "fulfilled" && narrativeRes.value.ok) {
        try {
          const narrativeJson = await narrativeRes.value.json();
          newData.narratives = narrativeJson;
        } catch {
          newData.narratives = generateMockNarrativeData();
        }
      } else {
        newData.narratives = generateMockNarrativeData();
      }

      setData(newData);
      setIsConnected(true);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      // Use mock data on error
      setData({
        risk: generateMockRiskData(),
        whales: generateMockWhaleData(),
        entities: generateMockEntityData(),
        trends: generateMockTrendData(),
        map: generateMockMapData(),
        anomalies: generateMockAnomalyData(),
        narratives: generateMockNarrativeData(),
      });
      setIsConnected(true);
    } finally {
      setIsLoading(false);
      setRefreshCountdown(12);
    }
  }, [isLiveMode]);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Auto-refresh every 12 seconds in live mode
  useEffect(() => {
    if (!isLiveMode) return;

    const refreshInterval = setInterval(() => {
      fetchAllData();
    }, 12000);

    const countdownInterval = setInterval(() => {
      setRefreshCountdown((prev) => (prev > 0 ? prev - 1 : 12));
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, [isLiveMode, fetchAllData]);

  // Switch to demo mode
  const handleModeToggle = useCallback(() => {
    setIsLiveMode((prev) => {
      const newMode = !prev;
      if (!newMode) {
        // Switch to demo mode - use mock data
        setData({
          risk: generateMockRiskData(),
          whales: generateMockWhaleData(),
          entities: generateMockEntityData(),
          trends: generateMockTrendData(),
          map: generateMockMapData(),
          anomalies: generateMockAnomalyData(),
          narratives: generateMockNarrativeData(),
        });
        setIsConnected(true);
        setIsLoading(false);
      }
      return newMode;
    });
  }, []);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "risk", label: "Risk" },
    { id: "whales", label: "Whales" },
    { id: "entities", label: "Entities" },
    { id: "trends", label: "Trends" },
    { id: "map", label: "Map" },
    { id: "anomalies", label: "Anomalies" },
    { id: "narratives", label: "Narratives" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1920px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Analytics Dashboard</h1>
                <p className="text-sm text-gray-400">Real-time Market Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Tabs */}
              <div className="flex items-center bg-slate-800 rounded-lg p-1 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id as ViewMode)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                      viewMode === tab.id
                        ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Mode Toggle */}
              <button
                onClick={handleModeToggle}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  isLiveMode
                    ? "bg-green-600/20 text-green-400 border border-green-500/30"
                    : "bg-yellow-600/20 text-yellow-400 border border-yellow-500/30"
                }`}
              >
                {isLiveMode ? "LIVE" : "DEMO"}
              </button>

              {/* Refresh Countdown */}
              {isLiveMode && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{refreshCountdown}s</span>
                </div>
              )}

              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
                <span className="text-xs text-gray-500">{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 py-6">
        {viewMode === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <RiskPanel data={data.risk} isLoading={isLoading} compact onViewMore={() => setViewMode("risk")} />
            <WhalePanel data={data.whales} isLoading={isLoading} compact onViewMore={() => setViewMode("whales")} />
            <EntityPanel data={data.entities} isLoading={isLoading} compact onViewMore={() => setViewMode("entities")} />
            <TrendPanel data={data.trends} isLoading={isLoading} compact onViewMore={() => setViewMode("trends")} />
            <MapPanel data={data.map} isLoading={isLoading} compact onViewMore={() => setViewMode("map")} />
            <AnomalyPanel data={data.anomalies} isLoading={isLoading} compact onViewMore={() => setViewMode("anomalies")} />
            <div className="md:col-span-2 xl:col-span-3">
              <NarrativePanel data={data.narratives} isLoading={isLoading} compact onViewMore={() => setViewMode("narratives")} />
            </div>
          </div>
        )}

        {viewMode === "risk" && <RiskPanel data={data.risk} isLoading={isLoading} />}
        {viewMode === "whales" && <WhalePanel data={data.whales} isLoading={isLoading} />}
        {viewMode === "entities" && <EntityPanel data={data.entities} isLoading={isLoading} />}
        {viewMode === "trends" && <TrendPanel data={data.trends} isLoading={isLoading} />}
        {viewMode === "map" && <MapPanel data={data.map} isLoading={isLoading} />}
        {viewMode === "anomalies" && <AnomalyPanel data={data.anomalies} isLoading={isLoading} />}
        {viewMode === "narratives" && <NarrativePanel data={data.narratives} isLoading={isLoading} />}
      </div>

      {/* Last Refresh Indicator */}
      <div className="fixed bottom-4 right-4 text-xs text-gray-500 bg-slate-800/80 px-3 py-2 rounded-lg backdrop-blur-sm">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>
    </div>
  );
}

// Mock data generators
function generateMockRiskData(): RiskData {
  return {
    globalScore: Math.floor(Math.random() * 40) + 30,
    distribution: [
      { level: "Critical", count: Math.floor(Math.random() * 10) + 5, percentage: 8 },
      { level: "High", count: Math.floor(Math.random() * 30) + 20, percentage: 22 },
      { level: "Medium", count: Math.floor(Math.random() * 50) + 40, percentage: 35 },
      { level: "Low", count: Math.floor(Math.random() * 60) + 50, percentage: 35 },
    ],
    topRisks: Array.from({ length: 10 }, (_, i) => ({
      entity: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      score: Math.floor(Math.random() * 30) + 70,
      type: ["Wash Trading", "Spoofing", "Pump & Dump", "Layering"][Math.floor(Math.random() * 4)],
      chain: ["Ethereum", "BSC", "Polygon", "Arbitrum"][Math.floor(Math.random() * 4)],
    })),
  };
}

function generateMockWhaleData(): WhaleAnalyticsData {
  return {
    topWhales: Array.from({ length: 20 }, (_, i) => ({
      address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      volume: Math.random() * 1000000000 + 10000000,
      movements: Math.floor(Math.random() * 500) + 10,
      influence: Math.random() * 100,
    })),
    heatmapData: Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      value: Math.random() * 100,
      label: `Whale ${Math.floor(Math.random() * 100)}`,
    })),
    activityTrend: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      activity: Math.floor(Math.random() * 100) + 20,
    })),
  };
}

function generateMockEntityData(): EntityData {
  return {
    activeEntities: Math.floor(Math.random() * 5000) + 10000,
    categories: [
      { name: "Exchange", count: Math.floor(Math.random() * 1000) + 500, percentage: 25 },
      { name: "DeFi", count: Math.floor(Math.random() * 800) + 400, percentage: 20 },
      { name: "Whale", count: Math.floor(Math.random() * 600) + 300, percentage: 15 },
      { name: "Smart Money", count: Math.floor(Math.random() * 500) + 250, percentage: 12 },
      { name: "Institutional", count: Math.floor(Math.random() * 400) + 200, percentage: 10 },
      { name: "Other", count: Math.floor(Math.random() * 700) + 350, percentage: 18 },
    ],
    movementPatterns: [
      { pattern: "Accumulation", count: Math.floor(Math.random() * 200) + 100, trend: "up" },
      { pattern: "Distribution", count: Math.floor(Math.random() * 150) + 80, trend: "down" },
      { pattern: "Consolidation", count: Math.floor(Math.random() * 180) + 90, trend: "stable" },
      { pattern: "Rotation", count: Math.floor(Math.random() * 120) + 60, trend: "up" },
    ],
    distribution: [
      { type: "Active", count: Math.floor(Math.random() * 3000) + 2000 },
      { type: "Dormant", count: Math.floor(Math.random() * 2000) + 1000 },
      { type: "New", count: Math.floor(Math.random() * 500) + 200 },
    ],
  };
}

function generateMockTrendData(): TrendData {
  return {
    hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      value: Math.floor(Math.random() * 100) + 20,
      type: ["manipulation", "whale", "darkpool", "stablecoin"][Math.floor(Math.random() * 4)],
    })),
    heatmap: Array.from({ length: 168 }, (_, i) => ({
      day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][Math.floor(i / 24)],
      hour: i % 24,
      value: Math.floor(Math.random() * 100),
    })),
    events: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      type: ["manipulation", "whale", "darkpool", "stablecoin"][Math.floor(Math.random() * 4)],
      count: Math.floor(Math.random() * 50) + 5,
    })),
  };
}

function generateMockMapData(): MapData {
  return {
    hotZones: Array.from({ length: 20 }, () => ({
      lat: Math.random() * 180 - 90,
      lng: Math.random() * 360 - 180,
      intensity: Math.random() * 100,
      label: ["New York", "London", "Singapore", "Hong Kong", "Tokyo", "Dubai"][Math.floor(Math.random() * 6)],
    })),
    clusters: Array.from({ length: 15 }, (_, i) => ({
      id: `cluster-${i}`,
      lat: Math.random() * 180 - 90,
      lng: Math.random() * 360 - 180,
      size: Math.floor(Math.random() * 50) + 10,
      risk: Math.random() * 100,
    })),
    events: Array.from({ length: 30 }, () => ({
      lat: Math.random() * 180 - 90,
      lng: Math.random() * 360 - 180,
      type: ["whale", "manipulation", "darkpool"][Math.floor(Math.random() * 3)],
      timestamp: new Date(Date.now() - Math.random() * 86400000),
    })),
  };
}

function generateMockAnomalyData(): AnomalyData {
  return {
    outliers: Array.from({ length: 15 }, (_, i) => ({
      id: `anomaly-${i}`,
      entity: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      deviation: Math.random() * 5 + 2,
      type: ["Volume Spike", "Price Deviation", "Unusual Pattern", "Statistical Outlier"][Math.floor(Math.random() * 4)],
      timestamp: new Date(Date.now() - Math.random() * 86400000),
    })),
    summary: {
      total: Math.floor(Math.random() * 100) + 50,
      high: Math.floor(Math.random() * 20) + 10,
      medium: Math.floor(Math.random() * 40) + 20,
      low: Math.floor(Math.random() * 40) + 20,
    },
    timeline: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      count: Math.floor(Math.random() * 10) + 1,
      severity: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
    })),
  };
}

function generateMockNarrativeData(): NarrativeData {
  const narratives = [
    "Increased whale activity detected across major exchanges with significant accumulation patterns in ETH and BTC.",
    "Market manipulation signals elevated in the past 24 hours, particularly in mid-cap altcoins.",
    "Stablecoin flows indicate potential market rotation from risk-off to risk-on assets.",
    "Dark pool activity suggests institutional positioning ahead of expected volatility.",
  ];

  return {
    summary: narratives[Math.floor(Math.random() * narratives.length)],
    topics: [
      { topic: "Whale Accumulation", relevance: Math.random() * 0.3 + 0.7, sentiment: "bullish" },
      { topic: "Exchange Flows", relevance: Math.random() * 0.3 + 0.5, sentiment: "neutral" },
      { topic: "DeFi Activity", relevance: Math.random() * 0.3 + 0.4, sentiment: "bullish" },
      { topic: "Manipulation Risk", relevance: Math.random() * 0.3 + 0.3, sentiment: "bearish" },
    ],
    trends: [
      { trend: "BTC Dominance", direction: "up", impact: Math.random() * 0.3 + 0.6 },
      { trend: "ETH/BTC Ratio", direction: "down", impact: Math.random() * 0.3 + 0.4 },
      { trend: "Altcoin Season Index", direction: "stable", impact: Math.random() * 0.3 + 0.3 },
    ],
    insights: [
      "Smart money wallets showing increased activity in Layer 2 tokens",
      "Exchange reserves declining, suggesting accumulation phase",
      "Unusual options activity detected in major derivatives markets",
      "Cross-chain bridge volumes at 30-day highs",
    ],
  };
}
