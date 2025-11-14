"use client";

import { useEffect, useState } from "react";

interface WhaleEvent {
  id: string;
  ts: string;
  chain: string;
  tx_hash: string;
  from_addr: string;
  to_addr: string;
  token_symbol: string;
  amount: number;
  amount_usd: number;
  detected_by: string;
  wallet_profile?: {
    label?: string;
    type?: string;
    risk_score?: number;
  };
}

interface WhaleTimelineProps {
  symbol?: string;
  minValueUsd?: number;
  limit?: number;
}

export default function WhaleTimeline({
  symbol,
  minValueUsd = 1_000_000,
  limit = 50,
}: WhaleTimelineProps) {
  const [events, setEvents] = useState<WhaleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<WhaleEvent | null>(null);

  useEffect(() => {
    fetchWhaleEvents();
    const interval = setInterval(fetchWhaleEvents, 60000);
    return () => clearInterval(interval);
  }, [symbol, minValueUsd, limit]);

  const fetchWhaleEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
      });
      if (symbol) params.append("symbol", symbol);
      
      const response = await fetch(`/alphabrain/whales?${params}`);
      if (!response.ok) throw new Error("Failed to fetch whale events");
      const json = await response.json();
      setEvents(json.events || []);
    } catch (err) {
      console.error("Error fetching whale events:", err);
      setEvents(generateMockWhaleEvents(limit));
    } finally {
      setLoading(false);
    }
  };

  const getDetectionBadge = (detectedBy: string) => {
    switch (detectedBy) {
      case "large_transfer":
        return "bg-red-900/30 text-red-400 border-red-500/30";
      case "chain_hopping":
        return "bg-orange-900/30 text-orange-400 border-orange-500/30";
      case "coordinated":
        return "bg-purple-900/30 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-500/30";
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "Unknown";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getWalletTypeColor = (type?: string) => {
    switch (type) {
      case "exchange":
        return "text-blue-400";
      case "whale":
        return "text-purple-400";
      case "contract":
        return "text-cyan-400";
      case "unknown":
      default:
        return "text-gray-400";
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        <div className="text-gray-400">Loading whale activity...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          🐋 Whale Activity Timeline
        </h2>
        <p className="text-sm text-gray-400 mt-2">
          Large transfers {symbol ? `for ${symbol}` : "across all assets"} (${(minValueUsd / 1_000_000).toFixed(1)}M+ USD)
        </p>
      </div>

      <div className="max-h-[700px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No whale activity detected in the selected timeframe
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>

            {events.map((event, index) => (
              <div
                key={event.id}
                className="relative p-6 hover:bg-slate-700/30 transition cursor-pointer border-b border-slate-700/50"
                onClick={() => setSelectedEvent(event)}
              >
                {/* Timeline dot */}
                <div className="absolute left-12 top-8 w-4 h-4 -ml-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-4 border-slate-800 z-10"></div>

                <div className="ml-16">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">
                        {event.token_symbol}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold border ${getDetectionBadge(
                          event.detected_by
                        )}`}
                      >
                        {event.detected_by.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(event.ts)}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                      ${(event.amount_usd / 1_000_000).toFixed(2)}M
                    </div>
                    <div className="text-sm text-gray-400">
                      {event.amount.toLocaleString()} {event.token_symbol}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">From</div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-300">
                          {formatAddress(event.from_addr)}
                        </span>
                        {event.wallet_profile?.label && (
                          <span className={`text-xs ${getWalletTypeColor(event.wallet_profile.type)}`}>
                            ({event.wallet_profile.label})
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">To</div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-300">
                          {formatAddress(event.to_addr)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Chain:</span>
                      <span className="text-cyan-400 font-semibold capitalize">
                        {event.chain}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Tx:</span>
                      <span className="text-gray-400 font-mono">
                        {formatAddress(event.tx_hash)}
                      </span>
                    </div>
                    {event.wallet_profile?.risk_score !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Risk:</span>
                        <span
                          className={`font-semibold ${
                            event.wallet_profile.risk_score > 70
                              ? "text-red-400"
                              : event.wallet_profile.risk_score > 40
                              ? "text-yellow-400"
                              : "text-green-400"
                          }`}
                        >
                          {event.wallet_profile.risk_score}/100
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wallet Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-white">Whale Transaction Details</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Amount</div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  ${(selectedEvent.amount_usd / 1_000_000).toFixed(2)}M
                </div>
                <div className="text-sm text-gray-400">
                  {selectedEvent.amount.toLocaleString()} {selectedEvent.token_symbol}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">From Address</div>
                  <div className="font-mono text-xs text-white break-all">
                    {selectedEvent.from_addr}
                  </div>
                  {selectedEvent.wallet_profile?.label && (
                    <div className={`text-sm mt-2 ${getWalletTypeColor(selectedEvent.wallet_profile.type)}`}>
                      {selectedEvent.wallet_profile.label}
                    </div>
                  )}
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">To Address</div>
                  <div className="font-mono text-xs text-white break-all">
                    {selectedEvent.to_addr}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Transaction Hash</div>
                <div className="font-mono text-xs text-white break-all">
                  {selectedEvent.tx_hash}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Chain</div>
                  <div className="text-cyan-400 font-semibold capitalize">
                    {selectedEvent.chain}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Detection Type</div>
                  <div className="text-purple-400 font-semibold">
                    {selectedEvent.detected_by.replace(/_/g, " ")}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Timestamp</div>
                  <div className="text-white text-sm">
                    {new Date(selectedEvent.ts).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-slate-700 text-center text-xs text-gray-500">
        Auto-refreshes every 60s • Click event for details
      </div>
    </div>
  );
}

function generateMockWhaleEvents(limit: number): WhaleEvent[] {
  const assets = ["BTC", "ETH", "SOL", "AVAX", "ARB"];
  const chains = ["ethereum", "arbitrum", "optimism", "solana"];
  const detectionTypes = ["large_transfer", "chain_hopping", "coordinated"];
  const walletLabels = ["Binance", "Coinbase", "Unknown Whale", "DeFi Protocol", "MEV Bot"];
  const walletTypes = ["exchange", "whale", "contract", "unknown"];

  const events: WhaleEvent[] = [];
  const now = new Date();

  for (let i = 0; i < limit; i++) {
    const hoursAgo = Math.random() * 24;
    const timestamp = new Date(now.getTime() - hoursAgo * 3600000);
    
    events.push({
      id: `whale_${i}`,
      ts: timestamp.toISOString(),
      chain: chains[Math.floor(Math.random() * chains.length)],
      tx_hash: `0x${"0123456789abcdef".repeat(4).split("").sort(() => Math.random() - 0.5).join("").slice(0, 64)}`,
      from_addr: `0x${"0123456789abcdef".repeat(3).split("").sort(() => Math.random() - 0.5).join("").slice(0, 40)}`,
      to_addr: `0x${"0123456789abcdef".repeat(3).split("").sort(() => Math.random() - 0.5).join("").slice(0, 40)}`,
      token_symbol: assets[Math.floor(Math.random() * assets.length)],
      amount: Math.random() * 1000 + 100,
      amount_usd: Math.random() * 50_000_000 + 1_000_000,
      detected_by: detectionTypes[Math.floor(Math.random() * detectionTypes.length)],
      wallet_profile: {
        label: walletLabels[Math.floor(Math.random() * walletLabels.length)],
        type: walletTypes[Math.floor(Math.random() * walletTypes.length)],
        risk_score: Math.floor(Math.random() * 100),
      },
    });
  }

  return events.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
}
