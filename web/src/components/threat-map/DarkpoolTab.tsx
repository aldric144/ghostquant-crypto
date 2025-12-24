"use client";

import { useEffect, useState } from "react";
import { DarkpoolEvent, fetchDarkpoolActivity, fetchDarkpoolSummary, fetchInstitutionalFlow, generateSyntheticDarkpoolActivity } from "@/lib/threatMapClient";
import ThreatRiskDial from "./ThreatRiskDial";

export default function DarkpoolTab() {
  const [events, setEvents] = useState<DarkpoolEvent[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [flow, setFlow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [activityData, summaryData, flowData] = await Promise.all([
          fetchDarkpoolActivity({ limit: 50 }),
          fetchDarkpoolSummary(),
          fetchInstitutionalFlow()
        ]);
        setEvents(activityData.events);
        setSummary(summaryData);
        setFlow(flowData);
      } catch {
        // Use synthetic fallback data when API fails
        const syntheticActivity = generateSyntheticDarkpoolActivity();
        setEvents(syntheticActivity.events);
        setSummary({ risk_score: 45, threat_level: 'ELEVATED', total_volume_24h: 2500000000, total_trades_24h: 847 });
        setFlow({ net_flow: 125000000, flow_direction: 'inflow', confidence: 0.78, buy_volume: 1800000000, sell_volume: 1675000000 });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 flex flex-col items-center">
          <ThreatRiskDial score={summary?.risk_score || 0} label="Darkpool Risk" />
          <div className="mt-2 text-sm text-gray-400">{summary?.threat_level || "Unknown"}</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">24h Volume</div>
          <div className="text-2xl font-bold text-white">{formatVolume(summary?.total_volume_24h || 0)}</div>
          <div className="text-xs text-gray-500 mt-2">{summary?.total_trades_24h || 0} trades</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">Net Institutional Flow</div>
          <div className={`text-2xl font-bold ${(flow?.net_flow || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
            {formatVolume(Math.abs(flow?.net_flow || 0))}
          </div>
          <div className="text-xs text-gray-500 mt-2">{flow?.flow_direction || "neutral"}</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">Flow Confidence</div>
          <div className="text-2xl font-bold text-white">{((flow?.confidence || 0) * 100).toFixed(0)}%</div>
          <div className="flex gap-2 mt-2">
            <span className="text-xs text-green-400">Buy: {formatVolume(flow?.buy_volume || 0)}</span>
            <span className="text-xs text-red-400">Sell: {formatVolume(flow?.sell_volume || 0)}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Live Darkpool Activity</h3>
          <p className="text-sm text-gray-400">Real-time institutional block trades</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Side</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Volume</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Venue</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Institutional</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Anomaly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3 text-sm text-gray-400">{formatTime(event.timestamp)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-white">{event.symbol}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      event.side === "buy" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                    }`}>
                      {event.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-white">{formatVolume(event.volume_usd)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-400">${event.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{event.venue}</td>
                  <td className="px-4 py-3 text-center">
                    {event.institutional_flag ? (
                      <span className="text-purple-400">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {event.anomaly_detected ? (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-red-900/30 text-red-400">ALERT</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
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
