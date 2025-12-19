"use client";

import { useEffect, useState } from "react";
import ThreatRiskDial from "./ThreatRiskDial";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://ghostquant-mewzi.ondigitalocean.app';

interface WhaleMovement {
  id: string;
  symbol: string;
  amount: number;
  value_usd: number;
  from_address: string;
  to_address: string;
  from_label: string | null;
  to_label: string | null;
  tx_hash: string;
  timestamp: string;
  movement_type: string;
  risk_score: number;
}

export default function WhalesTab() {
  const [movements, setMovements] = useState<WhaleMovement[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [movementsRes, summaryRes] = await Promise.all([
          fetch(`${API_BASE}/whale-intel/movements?limit=50`),
          fetch(`${API_BASE}/whale-intel/summary`)
        ]);

        if (movementsRes.ok) {
          const movementsData = await movementsRes.json();
          setMovements(movementsData.movements || []);
        }

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setSummary(summaryData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load whale data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
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

  const truncateAddress = (addr: string) => {
    if (!addr) return "Unknown";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "exchange_deposit": return "📥";
      case "exchange_withdrawal": return "📤";
      case "whale_transfer": return "🐋";
      case "accumulation": return "📈";
      case "distribution": return "📉";
      default: return "💰";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 flex flex-col items-center">
          <ThreatRiskDial score={summary?.risk_score || 45} label="Whale Risk" />
          <div className="mt-2 text-sm text-gray-400">{summary?.threat_level || "Medium"}</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">24h Whale Volume</div>
          <div className="text-2xl font-bold text-white">{formatVolume(summary?.total_volume_24h || 0)}</div>
          <div className="text-xs text-gray-500 mt-2">{summary?.total_movements_24h || 0} movements</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">Exchange Inflow</div>
          <div className="text-2xl font-bold text-red-400">{formatVolume(summary?.exchange_inflow_24h || 0)}</div>
          <div className="text-xs text-gray-500 mt-2">Potential sell pressure</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">Exchange Outflow</div>
          <div className="text-2xl font-bold text-green-400">{formatVolume(summary?.exchange_outflow_24h || 0)}</div>
          <div className="text-xs text-gray-500 mt-2">Accumulation signal</div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Live Whale Movements</h3>
          <p className="text-sm text-gray-400">Real-time large holder activity</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Symbol</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Value</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">From</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">To</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {movements.map((movement) => (
                <tr key={movement.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3 text-sm text-gray-400">{formatTime(movement.timestamp)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getMovementIcon(movement.movement_type)}</span>
                      <span className="text-sm text-gray-400 capitalize">{movement.movement_type?.replace(/_/g, " ")}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-white">{movement.symbol}</td>
                  <td className="px-4 py-3 text-sm text-right text-white">{formatVolume(movement.value_usd)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-gray-400">{movement.from_label || truncateAddress(movement.from_address)}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-gray-400">{movement.to_label || truncateAddress(movement.to_address)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      movement.risk_score >= 70 ? "bg-red-900/30 text-red-400" :
                      movement.risk_score >= 40 ? "bg-yellow-900/30 text-yellow-400" :
                      "bg-green-900/30 text-green-400"
                    }`}>
                      {movement.risk_score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
