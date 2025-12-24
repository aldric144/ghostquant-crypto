"use client";

import { useEffect, useState } from "react";
import { StablecoinFlow, fetchStablecoinFlows, fetchStablecoinSummary, fetchDepegAlerts, generateSyntheticStablecoinFlows } from "@/lib/threatMapClient";
import ThreatRiskDial from "./ThreatRiskDial";

export default function StablecoinTab() {
  const [flows, setFlows] = useState<StablecoinFlow[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [depegAlerts, setDepegAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [flowsData, summaryData, depegData] = await Promise.all([
          fetchStablecoinFlows({ limit: 50 }),
          fetchStablecoinSummary(),
          fetchDepegAlerts()
        ]);
        setFlows(flowsData.flows);
        setSummary(summaryData);
        setDepegAlerts(depegData.alerts);
      } catch {
        // Use synthetic fallback data when API fails
        const syntheticFlows = generateSyntheticStablecoinFlows();
        setFlows(syntheticFlows.flows);
        setSummary({
          risk_score: 28,
          threat_level: 'NORMAL',
          total_market_cap: 145000000000,
          total_volume_24h: 85000000000,
          net_exchange_flow_24h: -2500000000,
          stablecoins: [
            { symbol: 'USDT', price: 1.0001, market_cap: 95000000000, volume_24h: 55000000000, peg_deviation: 0.0001 },
            { symbol: 'USDC', price: 0.9999, market_cap: 42000000000, volume_24h: 25000000000, peg_deviation: -0.0001 },
            { symbol: 'DAI', price: 1.0002, market_cap: 5500000000, volume_24h: 3500000000, peg_deviation: 0.0002 },
            { symbol: 'BUSD', price: 1.0000, market_cap: 2500000000, volume_24h: 1500000000, peg_deviation: 0.0000 }
          ]
        });
        setDepegAlerts([]);
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
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getStablecoinColor = (stablecoin: string) => {
    switch (stablecoin) {
      case "USDT": return "text-green-400";
      case "USDC": return "text-blue-400";
      case "DAI": return "text-yellow-400";
      case "BUSD": return "text-orange-400";
      default: return "text-gray-400";
    }
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
          <ThreatRiskDial score={summary?.risk_score || 0} label="Stablecoin Risk" />
          <div className="mt-2 text-sm text-gray-400">{summary?.threat_level || "Unknown"}</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">Total Market Cap</div>
          <div className="text-2xl font-bold text-white">{formatVolume(summary?.total_market_cap || 0)}</div>
          <div className="text-xs text-gray-500 mt-2">Combined stablecoins</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">24h Volume</div>
          <div className="text-2xl font-bold text-white">{formatVolume(summary?.total_volume_24h || 0)}</div>
          <div className="text-xs text-gray-500 mt-2">Transfer volume</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">Net Exchange Flow</div>
          <div className={`text-2xl font-bold ${(summary?.net_exchange_flow_24h || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
            {formatVolume(Math.abs(summary?.net_exchange_flow_24h || 0))}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {(summary?.net_exchange_flow_24h || 0) >= 0 ? "Inflow" : "Outflow"}
          </div>
        </div>
      </div>

      {depegAlerts.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-red-400 mb-3">Depeg Alerts</h3>
          <div className="space-y-2">
            {depegAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${getStablecoinColor(alert.stablecoin)}`}>{alert.stablecoin}</span>
                  <span className="text-gray-400">Price: ${alert.current_price?.toFixed(4)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400">Deviation: {(alert.deviation * 100).toFixed(2)}%</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    alert.severity === "critical" ? "bg-red-900/50 text-red-400" :
                    alert.severity === "high" ? "bg-orange-900/50 text-orange-400" :
                    "bg-yellow-900/50 text-yellow-400"
                  }`}>
                    {alert.severity?.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {summary?.stablecoins?.map((coin: any) => (
          <div key={coin.symbol} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold ${getStablecoinColor(coin.symbol)}`}>{coin.symbol}</span>
              <span className="text-xs text-gray-500">${coin.price?.toFixed(4)}</span>
            </div>
            <div className="text-sm text-gray-400">Market Cap: {formatVolume(coin.market_cap)}</div>
            <div className="text-sm text-gray-400">24h Volume: {formatVolume(coin.volume_24h)}</div>
            <div className={`text-sm ${coin.peg_deviation > 0.005 ? "text-red-400" : "text-green-400"}`}>
              Peg: {coin.peg_deviation > 0 ? "+" : ""}{(coin.peg_deviation * 100).toFixed(3)}%
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Large Stablecoin Flows</h3>
          <p className="text-sm text-gray-400">Significant stablecoin movements</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Stablecoin</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">From</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">To</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {flows.map((flow) => (
                <tr key={flow.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3 text-sm text-gray-400">{formatTime(flow.timestamp)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${getStablecoinColor(flow.stablecoin)}`}>{flow.stablecoin}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-white">{formatVolume(flow.amount)}</td>
                  <td className="px-4 py-3 text-sm text-gray-400 capitalize">{flow.flow_type.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-gray-400">{flow.from_label || truncateAddress(flow.from_address)}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-gray-400">{flow.to_label || truncateAddress(flow.to_address)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      flow.risk_score >= 70 ? "bg-red-900/30 text-red-400" :
                      flow.risk_score >= 40 ? "bg-yellow-900/30 text-yellow-400" :
                      "bg-green-900/30 text-green-400"
                    }`}>
                      {flow.risk_score}
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
