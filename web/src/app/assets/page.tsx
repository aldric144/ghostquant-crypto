"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Asset {
  symbol: string;
  chain: string;
  sector: string;
}

interface Signal {
  asset_id: number;
  ts: string;
  trend_score: number;
  pretrend_prob: number;
  action: string;
  confidence: number;
}

interface AssetWithSignal extends Asset {
  asset_id: number;
  latest_signal: Signal | null;
  price: number;
  change_24h: number;
}

export default function AllAssetsPage() {
  const [assets, setAssets] = useState<AssetWithSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"symbol" | "trendscore" | "pretrend" | "change">("trendscore");
  const [filterSignal, setFilterSignal] = useState<string>("all");

  useEffect(() => {
    fetchAllAssets();
    const interval = setInterval(fetchAllAssets, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAllAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      const assetsRes = await fetch('/api/assets');
      if (!assetsRes.ok) throw new Error("Failed to fetch assets");
      const assetsData = await assetsRes.json();

      const signalsRes = await fetch('/api/signals/latest?limit=100');
      if (!signalsRes.ok) throw new Error("Failed to fetch signals");
      const signalsData = await signalsRes.json();

      const combined = assetsData.map((asset: Asset & { asset_id: number }) => {
        const signal = signalsData.find((s: any) => s.asset_id === asset.asset_id);
        return {
          ...asset,
          latest_signal: signal || null,
          price: signal ? (Math.random() * 1000 + 100) : 0, // Mock price
          change_24h: signal ? (Math.random() * 20 - 10) : 0, // Mock 24h change
        };
      });

      setAssets(combined);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching assets:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  };

  const getSignalColor = (action: string): string => {
    if (action === "STRONG_BUY") return "text-green-400";
    if (action === "BUY") return "text-green-300";
    if (action === "ACCUMULATE") return "text-yellow-400";
    if (action === "HOLD") return "text-gray-400";
    if (action === "REDUCE") return "text-orange-400";
    return "text-red-400"; // SELL
  };

  const getSignalBgColor = (action: string): string => {
    if (action === "STRONG_BUY") return "bg-green-500/20 border-green-500";
    if (action === "BUY") return "bg-green-500/10 border-green-500/50";
    if (action === "ACCUMULATE") return "bg-yellow-500/10 border-yellow-500/50";
    if (action === "HOLD") return "bg-gray-500/10 border-gray-500/50";
    if (action === "REDUCE") return "bg-orange-500/10 border-orange-500/50";
    return "bg-red-500/10 border-red-500/50"; // SELL
  };

  const sortedAssets = [...assets].sort((a, b) => {
    if (sortBy === "symbol") return a.symbol.localeCompare(b.symbol);
    if (sortBy === "trendscore") {
      const aScore = a.latest_signal?.trend_score || 0;
      const bScore = b.latest_signal?.trend_score || 0;
      return bScore - aScore;
    }
    if (sortBy === "pretrend") {
      const aPretrend = a.latest_signal?.pretrend_prob || 0;
      const bPretrend = b.latest_signal?.pretrend_prob || 0;
      return bPretrend - aPretrend;
    }
    if (sortBy === "change") {
      return b.change_24h - a.change_24h;
    }
    return 0;
  });

  const filteredAssets = filterSignal === "all" 
    ? sortedAssets 
    : sortedAssets.filter(a => a.latest_signal?.action === filterSignal);

  if (loading && assets.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B1622] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-[#D4AF37]">All Assets</h1>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading assets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B1622] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-[#D4AF37]">All Assets</h1>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <p className="text-red-400">Error: {error}</p>
            <button
              onClick={fetchAllAssets}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1622] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">All Assets</h1>
          <p className="text-gray-400">
            Overview of all {assets.length} tracked assets with latest signals
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm text-gray-400 mr-2">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#1A2332] border border-gray-700 rounded px-3 py-2 text-white"
            >
              <option value="trendscore">TrendScore (High to Low)</option>
              <option value="pretrend">Pre-Trend (High to Low)</option>
              <option value="change">24h Change</option>
              <option value="symbol">Symbol (A-Z)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mr-2">Filter by Signal:</label>
            <select
              value={filterSignal}
              onChange={(e) => setFilterSignal(e.target.value)}
              className="bg-[#1A2332] border border-gray-700 rounded px-3 py-2 text-white"
            >
              <option value="all">All Signals</option>
              <option value="STRONG_BUY">Strong Buy</option>
              <option value="BUY">Buy</option>
              <option value="ACCUMULATE">Accumulate</option>
              <option value="HOLD">Hold</option>
              <option value="REDUCE">Reduce</option>
              <option value="SELL">Sell</option>
            </select>
          </div>
          <div className="ml-auto">
            <button
              onClick={fetchAllAssets}
              className="px-4 py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded text-[#D4AF37]"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <Link
              key={asset.symbol}
              href={`/assets/${asset.symbol}`}
              className="block"
            >
              <div
                className={`bg-[#1A2332] rounded-lg p-6 border-2 hover:scale-105 transition-all cursor-pointer ${
                  asset.latest_signal
                    ? getSignalBgColor(asset.latest_signal.action)
                    : "border-gray-700"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{asset.symbol}</h3>
                    <p className="text-sm text-gray-400 capitalize">
                      {asset.chain || asset.sector}
                    </p>
                  </div>
                  {asset.latest_signal && (
                    <div
                      className={`px-3 py-1 rounded text-sm font-bold ${getSignalColor(
                        asset.latest_signal.action
                      )}`}
                    >
                      {asset.latest_signal.action}
                    </div>
                  )}
                </div>

                {/* Metrics */}
                {asset.latest_signal ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">TrendScore</span>
                      <span className="text-lg font-bold text-[#D4AF37]">
                        {asset.latest_signal.trend_score.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Pre-Trend</span>
                      <span className="text-lg font-bold text-blue-400">
                        {(asset.latest_signal.pretrend_prob * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Confidence</span>
                      <span className="text-lg font-bold text-gray-300">
                        {(asset.latest_signal.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">24h Change</span>
                      <span
                        className={`text-lg font-bold ${
                          asset.change_24h >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {asset.change_24h >= 0 ? "+" : ""}
                        {asset.change_24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No signal data available
                  </div>
                )}

                {/* View Details Link */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <span className="text-sm text-[#D4AF37] hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No assets match the selected filter
          </div>
        )}
      </div>
    </div>
  );
}
