"use client";

import { useEffect, useState } from "react";

interface MomentumResult {
  symbol: string;
  momentum_score: number;
  price_change_pct: number;
  volume_24h: number;
  volatility: number;
  sparkline: number[];
  rank: number;
}

interface MomentumResponse {
  period: string;
  period_hours: number;
  results: MomentumResult[];
  total_assets: number;
  timestamp: string;
}

export default function MomentumScreenerPage() {
  const [data, setData] = useState<MomentumResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("24h");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMomentumData();
    const interval = setInterval(fetchMomentumData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [period]);

  const fetchMomentumData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/screener/momentum?period=${period}&limit=25`);
      if (!response.ok) throw new Error("Failed to fetch momentum data");
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err) {
      console.error("Error fetching momentum data:", err);
      setError("Failed to load momentum screener data");
    } finally {
      setLoading(false);
    }
  };

  const getMomentumColor = (score: number) => {
    if (score >= 70) return "text-green-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 50) return "text-gray-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getMomentumBg = (score: number) => {
    if (score >= 70) return "bg-green-900/20 border-green-500/30";
    if (score >= 60) return "bg-blue-900/20 border-blue-500/30";
    if (score >= 50) return "bg-gray-900/20 border-gray-500/30";
    if (score >= 40) return "bg-orange-900/20 border-orange-500/30";
    return "bg-red-900/20 border-red-500/30";
  };

  const renderSparkline = (sparkline: number[]) => {
    if (!sparkline || sparkline.length === 0) return null;

    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;

    const points = sparkline.map((value, index) => {
      const x = (index / (sparkline.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(" ");

    const isPositive = sparkline[sparkline.length - 1] >= sparkline[0];
    const color = isPositive ? "#10b981" : "#ef4444";

    return (
      <svg width="80" height="30" className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8">
            Native Coin Momentum Screener
          </h1>
          <div className="text-gray-400">Loading momentum data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8">
            Native Coin Momentum Screener
          </h1>
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Native Coin Momentum Screener
          </h1>
          <div className="flex gap-2">
            {["1h", "6h", "24h", "7d"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  period === p
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-gray-400 hover:bg-slate-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 mb-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-gray-400 text-sm mb-1">Total Assets</div>
              <div className="text-2xl font-bold text-white">{data?.total_assets || 0}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Period</div>
              <div className="text-2xl font-bold text-blue-400">{data?.period || "24h"}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Top Momentum</div>
              <div className="text-2xl font-bold text-green-400">
                {data?.results[0]?.symbol || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Last Updated</div>
              <div className="text-sm text-gray-400">
                {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : "N/A"}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Momentum Score
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Price Change
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Volume 24h
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Volatility
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {data?.results.map((result) => (
                  <tr
                    key={result.symbol}
                    className={`hover:bg-slate-700/30 transition ${getMomentumBg(result.momentum_score)} border-l-4`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-400">#{result.rank}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-white">{result.symbol}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-2xl font-bold ${getMomentumColor(result.momentum_score)}`}>
                        {result.momentum_score.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div
                        className={`text-lg font-semibold ${
                          result.price_change_pct >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {result.price_change_pct >= 0 ? "+" : ""}
                        {result.price_change_pct.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-300">
                        ${(result.volume_24h / 1_000_000).toFixed(2)}M
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-400">{result.volatility.toFixed(2)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {renderSparkline(result.sparkline)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Auto-refreshes every 60 seconds
        </div>
      </div>
    </div>
  );
}
