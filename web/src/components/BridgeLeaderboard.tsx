"use client";

import { useEffect, useState } from "react";

interface BridgeEntry {
  bridge: string;
  total_volume_usd: number;
  inflows_usd: number;
  outflows_usd: number;
  net_flow_usd: number;
  tx_count: number;
  sentiment: string;
}

interface ChainEntry {
  chain: string;
  total_volume_usd: number;
  inflows_usd: number;
  outflows_usd: number;
  net_flow_usd: number;
  sentiment: string;
}

interface LeaderboardResponse {
  period: string;
  period_hours: number;
  bridge_leaderboard: BridgeEntry[];
  chain_leaderboard: ChainEntry[];
  total_volume_usd: number;
  total_net_flow_usd: number;
  timestamp: string;
}

interface BridgeLeaderboardProps {
  defaultPeriod?: string;
  showChains?: boolean;
}

export default function BridgeLeaderboard({ 
  defaultPeriod = "24h",
  showChains = true 
}: BridgeLeaderboardProps) {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(defaultPeriod);
  const [view, setView] = useState<"bridges" | "chains">("bridges");

  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 60000);
    return () => clearInterval(interval);
  }, [period]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/ecoscan/bridge-leaderboard?period=${period}&limit=20`);
      if (!response.ok) throw new Error("Failed to fetch leaderboard data");
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching leaderboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "strong_inflow":
        return "text-green-400";
      case "moderate_inflow":
        return "text-green-300";
      case "balanced":
        return "text-gray-400";
      case "moderate_outflow":
        return "text-orange-300";
      case "strong_outflow":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "strong_inflow":
        return "bg-green-900/30 text-green-400 border-green-500/30";
      case "moderate_inflow":
        return "bg-green-900/20 text-green-300 border-green-500/20";
      case "balanced":
        return "bg-gray-900/30 text-gray-400 border-gray-500/30";
      case "moderate_outflow":
        return "bg-orange-900/20 text-orange-300 border-orange-500/20";
      case "strong_outflow":
        return "bg-red-900/30 text-red-400 border-red-500/30";
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-500/30";
    }
  };

  const formatSentiment = (sentiment: string) => {
    return sentiment.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading && !data) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        <div className="text-gray-400">Loading bridge flow data...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Bridge Flow Leaderboard
          </h2>
          <div className="flex gap-2">
            {["1h", "24h", "7d"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                  period === p
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-gray-400 hover:bg-slate-600"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total Volume</div>
            <div className="text-2xl font-bold text-white">
              ${((data?.total_volume_usd || 0) / 1_000_000).toFixed(1)}M
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Net Flow</div>
            <div
              className={`text-2xl font-bold ${
                (data?.total_net_flow_usd || 0) >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {(data?.total_net_flow_usd || 0) >= 0 ? "+" : ""}
              ${((data?.total_net_flow_usd || 0) / 1_000_000).toFixed(1)}M
            </div>
          </div>
        </div>

        {showChains && (
          <div className="flex gap-2">
            <button
              onClick={() => setView("bridges")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                view === "bridges"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-gray-400 hover:bg-slate-600"
              }`}
            >
              Bridges
            </button>
            <button
              onClick={() => setView("chains")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                view === "chains"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-gray-400 hover:bg-slate-600"
              }`}
            >
              Chains
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        {view === "bridges" ? (
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                  Bridge
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">
                  Volume
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">
                  Inflows
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">
                  Outflows
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">
                  Net Flow
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase">
                  Sentiment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data?.bridge_leaderboard.map((entry, index) => (
                <tr key={entry.bridge} className="hover:bg-slate-700/30 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-gray-400 font-bold">#{index + 1}</div>
                      <div className="text-white font-semibold capitalize">
                        {entry.bridge.replace(/_/g, " ")}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-white font-semibold">
                      ${(entry.total_volume_usd / 1_000_000).toFixed(2)}M
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-green-400">
                      ${(entry.inflows_usd / 1_000_000).toFixed(2)}M
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-red-400">
                      ${(entry.outflows_usd / 1_000_000).toFixed(2)}M
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div
                      className={`font-semibold ${
                        entry.net_flow_usd >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {entry.net_flow_usd >= 0 ? "+" : ""}
                      ${(entry.net_flow_usd / 1_000_000).toFixed(2)}M
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSentimentBadge(
                        entry.sentiment
                      )}`}
                    >
                      {formatSentiment(entry.sentiment)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                  Chain
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">
                  Volume
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">
                  Inflows
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">
                  Outflows
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">
                  Net Flow
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase">
                  Sentiment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data?.chain_leaderboard.map((entry, index) => (
                <tr key={entry.chain} className="hover:bg-slate-700/30 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-gray-400 font-bold">#{index + 1}</div>
                      <div className="text-white font-semibold capitalize">{entry.chain}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-white font-semibold">
                      ${(entry.total_volume_usd / 1_000_000).toFixed(2)}M
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-green-400">
                      ${(entry.inflows_usd / 1_000_000).toFixed(2)}M
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-red-400">
                      ${(entry.outflows_usd / 1_000_000).toFixed(2)}M
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div
                      className={`font-semibold ${
                        entry.net_flow_usd >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {entry.net_flow_usd >= 0 ? "+" : ""}
                      ${(entry.net_flow_usd / 1_000_000).toFixed(2)}M
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSentimentBadge(
                        entry.sentiment
                      )}`}
                    >
                      {formatSentiment(entry.sentiment)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="p-4 border-t border-slate-700 text-center text-xs text-gray-500">
        Last updated: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : "N/A"} • Auto-refreshes every 60s
      </div>
    </div>
  );
}
