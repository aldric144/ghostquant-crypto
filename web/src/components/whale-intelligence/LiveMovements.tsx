"use client";

import { memo, useEffect, useState } from "react";
import type { WhaleMovement } from "./index";

interface LiveMovementsProps {
  movements: WhaleMovement[];
  showFullFeed?: boolean;
}

function LiveMovements({ movements, showFullFeed = false }: LiveMovementsProps) {
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Simulate live connection status
    const interval = setInterval(() => {
      setIsLive(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatAmount = (amount: number): string => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
    return `$${amount.toFixed(2)}`;
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "inflow":
        return (
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      case "outflow":
        return (
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "inflow":
        return "bg-green-500/20 border-green-500/30";
      case "outflow":
        return "bg-red-500/20 border-red-500/30";
      default:
        return "bg-blue-500/20 border-blue-500/30";
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/20 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Live Movements</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
            <span className="text-xs text-gray-500">{isLive ? "Live" : "Disconnected"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{movements.length} events</span>
        </div>
      </div>

      <div className={`overflow-y-auto ${showFullFeed ? "h-[600px]" : "h-[400px]"}`}>
        <div className="divide-y divide-slate-700/50">
          {movements.map((movement) => (
            <div
              key={movement.id}
              className="p-4 hover:bg-slate-700/20 transition-colors animate-fadeIn"
            >
              <div className="flex items-start gap-3">
                {/* Type Icon */}
                <div className={`p-2 rounded-lg border ${getTypeColor(movement.type)}`}>
                  {getTypeIcon(movement.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-cyan-400 font-mono text-sm truncate">
                      {movement.address}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${getRiskBadge(movement.risk)}`}>
                      {movement.risk.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 capitalize">{movement.type}</span>
                    <span className={movement.type === "inflow" ? "text-green-400" : movement.type === "outflow" ? "text-red-400" : "text-blue-400"}>
                      {formatAmount(movement.amount)}
                    </span>
                    <span className="text-white font-medium">{movement.token}</span>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {movement.chain}
                    </span>
                    {movement.exchange && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {movement.exchange}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatTime(movement.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Amount Badge */}
                <div className="text-right">
                  <div className={`text-lg font-bold ${movement.type === "inflow" ? "text-green-400" : movement.type === "outflow" ? "text-red-400" : "text-blue-400"}`}>
                    {movement.type === "inflow" ? "+" : movement.type === "outflow" ? "-" : ""}
                    {formatAmount(movement.amount)}
                  </div>
                  <div className="text-xs text-gray-500">{movement.token}</div>
                </div>
              </div>
            </div>
          ))}

          {movements.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p>Waiting for whale movements...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(LiveMovements);
