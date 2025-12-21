"use client";

import { memo, useEffect, useState, useCallback } from "react";
import type { WhaleData, WhaleMovement } from "./index";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

interface WhaleDetailModalProps {
  whale: WhaleData;
  onClose: () => void;
}

function WhaleDetailModal({ whale, onClose }: WhaleDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "movements" | "connections">("overview");
  const [movements, setMovements] = useState<WhaleMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWhaleDetails = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/whale-intel/address/${whale.address}`);
      if (response.ok) {
        const data = await response.json();
        if (data.movements) {
          setMovements(data.movements);
        } else {
          // Generate mock movements
          setMovements(generateMockMovements(15));
        }
      } else {
        setMovements(generateMockMovements(15));
      }
    } catch (error) {
      console.error("Error fetching whale details:", error);
      setMovements(generateMockMovements(15));
    } finally {
      setIsLoading(false);
    }
  }, [whale.address]);

  useEffect(() => {
    fetchWhaleDetails();
  }, [fetchWhaleDetails]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const formatVolume = (vol: number): string => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `$${(vol / 1e3).toFixed(2)}K`;
    return `$${vol.toFixed(2)}`;
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleString();
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "low":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/10 w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Whale Profile</h2>
                  {whale.label && <p className="text-sm text-gray-400">{whale.label}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-mono text-sm">{whale.address}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(whale.address)}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {whale.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs bg-slate-700 text-gray-300 rounded-full"
              >
                {tag}
              </span>
            ))}
            <span className={`px-3 py-1 text-xs rounded-full border ${getRiskColor(whale.risk)}`}>
              {whale.risk.toUpperCase()} RISK
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {[
            { id: "overview", label: "Overview" },
            { id: "movements", label: "Movements" },
            { id: "connections", label: "Connections" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Total Volume</div>
                <div className="text-xl font-bold text-green-400">{formatVolume(whale.volume)}</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Movements</div>
                <div className="text-xl font-bold text-blue-400">{whale.movements.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Influence Score</div>
                <div className="text-xl font-bold text-cyan-400">{whale.influenceScore.toFixed(1)}</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Primary Chain</div>
                <div className="text-xl font-bold text-white">{whale.chain}</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Last Active</div>
                <div className="text-lg font-bold text-white">{formatTime(whale.lastActive)}</div>
              </div>
              {whale.exchanges && whale.exchanges.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Exchanges</div>
                  <div className="text-sm text-white">{whale.exchanges.join(", ")}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === "movements" && (
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-700/50 rounded-lg animate-pulse"></div>
                ))
              ) : (
                movements.map((movement) => (
                  <div
                    key={movement.id}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          movement.type === "inflow"
                            ? "bg-green-500/20"
                            : movement.type === "outflow"
                            ? "bg-red-500/20"
                            : "bg-blue-500/20"
                        }`}
                      >
                        {movement.type === "inflow" ? (
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        ) : movement.type === "outflow" ? (
                          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-white capitalize">{movement.type}</div>
                        <div className="text-xs text-gray-500">
                          {movement.chain} {movement.exchange && `• ${movement.exchange}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-bold ${
                          movement.type === "inflow"
                            ? "text-green-400"
                            : movement.type === "outflow"
                            ? "text-red-400"
                            : "text-blue-400"
                        }`}
                      >
                        {formatVolume(movement.amount)} {movement.token}
                      </div>
                      <div className="text-xs text-gray-500">{formatTime(movement.timestamp)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "connections" && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-400">Connection graph coming soon</p>
              <p className="text-sm text-gray-500 mt-2">
                View related wallets, shared transactions, and entity clusters
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Last updated: {formatTime(new Date())}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(`https://etherscan.io/address/${whale.address}`, "_blank")}
              className="px-4 py-2 text-sm bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              View on Explorer
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateMockMovements(count: number): WhaleMovement[] {
  const types: ("inflow" | "outflow" | "transfer")[] = ["inflow", "outflow", "transfer"];
  const tokens = ["ETH", "BTC", "USDT", "USDC", "BNB", "MATIC"];
  const chains = ["Ethereum", "BSC", "Polygon", "Arbitrum"];
  const risks: ("high" | "medium" | "low")[] = ["high", "medium", "low"];
  const exchanges = ["Binance", "Coinbase", "Kraken", "Uniswap"];

  return Array.from({ length: count }, (_, i) => ({
    id: `mov-${i}-${Date.now()}`,
    address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    type: types[Math.floor(Math.random() * types.length)],
    amount: Math.random() * 5000000 + 100000,
    token: tokens[Math.floor(Math.random() * tokens.length)],
    chain: chains[Math.floor(Math.random() * chains.length)],
    timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
    exchange: Math.random() > 0.5 ? exchanges[Math.floor(Math.random() * exchanges.length)] : undefined,
    risk: risks[Math.floor(Math.random() * risks.length)],
  })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export default memo(WhaleDetailModal);
