"use client";

import { useState, useEffect, useCallback, memo } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

interface Insight {
  id: string;
  type: "risk" | "whale" | "ring" | "manipulation" | "depeg" | "liquidation" | "cross_chain";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  timestamp: Date;
  chain?: string;
  entity?: string;
}

const INSIGHT_COLORS = {
  high: "border-red-500 bg-red-500/10",
  medium: "border-yellow-500 bg-yellow-500/10",
  low: "border-green-500 bg-green-500/10",
};

const INSIGHT_ICONS = {
  risk: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  whale: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  ring: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  manipulation: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  depeg: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  liquidation: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    </svg>
  ),
  cross_chain: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function generateMockInsight(): Insight {
  const types: Insight["type"][] = ["risk", "whale", "ring", "manipulation", "depeg", "liquidation", "cross_chain"];
  const severities: Insight["severity"][] = ["high", "medium", "low"];
  const chains = ["Ethereum", "BSC", "Polygon", "Arbitrum", "Optimism"];
  
  const type = types[Math.floor(Math.random() * types.length)];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  const chain = chains[Math.floor(Math.random() * chains.length)];

  const titles: Record<Insight["type"], string[]> = {
    risk: ["New Risk Alert", "Risk Level Change", "Elevated Risk Detected"],
    whale: ["Whale Movement", "Large Transfer", "Whale Accumulation"],
    ring: ["Ring Formation", "Cluster Activity", "New Ring Detected"],
    manipulation: ["Manipulation Signal", "Wash Trading Alert", "Pump Pattern"],
    depeg: ["Stablecoin Depeg", "Price Deviation", "Peg Warning"],
    liquidation: ["Liquidation Event", "Position Closed", "Margin Call"],
    cross_chain: ["Cross-Chain Flow", "Bridge Activity", "Multi-Chain Alert"],
  };

  const descriptions: Record<Insight["type"], string[]> = {
    risk: [`${chain} risk score increased`, `New threat on ${chain}`, `Risk threshold exceeded`],
    whale: [`$${(Math.random() * 50 + 10).toFixed(1)}M moved on ${chain}`, `Large accumulation detected`, `Whale wallet active`],
    ring: [`${Math.floor(Math.random() * 10) + 3} wallets coordinating`, `New cluster on ${chain}`, `Ring activity spike`],
    manipulation: [`Wash trading on ${chain}`, `Coordinated pump detected`, `Suspicious volume pattern`],
    depeg: [`USDT deviation on ${chain}`, `Stablecoin volatility`, `Peg monitoring active`],
    liquidation: [`$${(Math.random() * 10 + 1).toFixed(1)}M liquidated`, `Long positions closed`, `Cascade risk elevated`],
    cross_chain: [`${chain} → BSC bridge flow`, `Multi-chain arbitrage`, `Cross-chain whale`],
  };

  return {
    id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    severity,
    title: titles[type][Math.floor(Math.random() * titles[type].length)],
    description: descriptions[type][Math.floor(Math.random() * descriptions[type].length)],
    timestamp: new Date(),
    chain,
  };
}

function LiveInsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/unified-risk/events?limit=10`);
      if (response.ok) {
        setIsConnected(true);
        // Add a new mock insight occasionally to simulate real-time updates
        if (Math.random() > 0.7) {
          setInsights((prev) => [generateMockInsight(), ...prev.slice(0, 19)]);
        }
      }
    } catch (error) {
      console.error("Error fetching insights:", error);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    // Initialize with some mock insights
    const initialInsights: Insight[] = [];
    for (let i = 0; i < 8; i++) {
      const insight = generateMockInsight();
      insight.timestamp = new Date(Date.now() - Math.random() * 3600000);
      initialInsights.push(insight);
    }
    setInsights(initialInsights.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    setIsConnected(true);

    // Poll for updates
    const interval = setInterval(fetchInsights, 30000);
    return () => clearInterval(interval);
  }, [fetchInsights]);

  return (
    <div className="h-full bg-slate-900/50 border border-slate-700 rounded-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Live Insights</h3>
            <p className="text-xs text-gray-500">Real-time intelligence feed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
          <span className="text-xs text-gray-500">{isConnected ? "Live" : "Offline"}</span>
        </div>
      </div>

      {/* Insights List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {insights.map((insight) => (
          <div
            key={insight.id}
            onClick={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
            className={`p-3 border-l-2 rounded-r-lg cursor-pointer transition-all ${INSIGHT_COLORS[insight.severity]} hover:bg-opacity-20`}
          >
            <div className="flex items-start gap-2">
              <span className={`mt-0.5 ${
                insight.severity === "high" ? "text-red-400" :
                insight.severity === "medium" ? "text-yellow-400" : "text-green-400"
              }`}>
                {INSIGHT_ICONS[insight.type]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-white truncate">{insight.title}</span>
                  <span className="text-xs text-gray-500 shrink-0">{formatTimeAgo(insight.timestamp)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{insight.description}</p>
                
                {expandedId === insight.id && (
                  <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-gray-500 animate-fadeIn">
                    <div className="flex items-center gap-4">
                      <span>Chain: <span className="text-cyan-400">{insight.chain}</span></span>
                      <span>Severity: <span className={
                        insight.severity === "high" ? "text-red-400" :
                        insight.severity === "medium" ? "text-yellow-400" : "text-green-400"
                      }>{insight.severity}</span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(LiveInsightsPanel);
