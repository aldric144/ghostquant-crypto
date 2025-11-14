"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Fish, ShoppingCart } from "lucide-react";
import WhaleExplainModal from "./WhaleExplainModal";

interface TopMover {
  coin_id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  momentum_score: number;
  trend_score: number;
  pretrend: number;
  whale_confidence: number;
  signal: string;
  price_change_percentage_1h?: number;
  price_change_percentage_24h?: number;
  price_change_percentage_7d?: number;
  sparkline_7d?: { price: number[] };
  last_updated: string;
}

interface TopMoversProps {
  limit?: number;
  sort?: string;
}

export default function TopMovers({ limit = 100, sort = "momentum" }: TopMoversProps) {
  const [coins, setCoins] = useState<TopMover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [whaleModalSymbol, setWhaleModalSymbol] = useState<string | null>(null);
  const fetchTopMovers = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
      const response = await fetch(`${apiBase}/dashboard/top-movers?limit=${limit}&sort=${sort}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const data = await response.json();
      setCoins(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Error fetching top movers:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopMovers();
    
    const interval = setInterval(fetchTopMovers, 30000);
    
    return () => clearInterval(interval);
  }, [limit, sort]);

  const handleBuy = (coin: TopMover) => {
    console.log(`Marked ${coin.symbol} as interested`);
    alert(`Marked ${coin.name} (${coin.symbol}) as interested!`);
  };

  const handleWhaleClick = (symbol: string) => {
    setWhaleModalSymbol(symbol);
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "BUY":
        return "text-green-400 bg-green-400/10 border-green-400/30";
      case "SELL":
        return "text-red-400 bg-red-400/10 border-red-400/30";
      case "TRIM":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/30";
    }
  };

  const renderSparkline = (sparkline?: { price: number[] }) => {
    if (!sparkline || !sparkline.price || sparkline.price.length === 0) {
      return null;
    }

    const prices = sparkline.price;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;

    if (range === 0) return null;

    const points = prices.map((price, i) => {
      const x = (i / (prices.length - 1)) * 100;
      const y = 100 - ((price - min) / range) * 100;
      return `${x},${y}`;
    }).join(" ");

    const isPositive = prices[prices.length - 1] >= prices[0];

    return (
      <svg className="w-24 h-8 hidden md:block" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
        <p className="text-red-400 mb-4">Error: {error}</p>
        {lastUpdated && (
          <p className="text-sm text-gray-400 mb-4">
            Data may be stale — last updated {lastUpdated.toLocaleTimeString()}
          </p>
        )}
        <button
          onClick={fetchTopMovers}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Rank</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Coin</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Price</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">24h %</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Momentum</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">PreTrend</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Whale</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Signal</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Chart</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin, index) => (
              <tr
                key={coin.coin_id}
                className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-3 px-4 text-gray-400">#{index + 1}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="font-semibold">{coin.symbol}</div>
                      <div className="text-sm text-gray-400">{coin.name}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  ${coin.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={coin.price_change_percentage_24h && coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}>
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-semibold">{coin.momentum_score?.toFixed(1)}</span>
                    {coin.momentum_score >= 70 && <TrendingUp className="w-4 h-4 text-green-400" />}
                    {coin.momentum_score < 40 && <TrendingDown className="w-4 h-4 text-red-400" />}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={coin.pretrend >= 0.6 ? "text-green-400 font-semibold" : ""}>
                    {(coin.pretrend * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  {coin.whale_confidence > 0.6 ? (
                    <button
                      onClick={() => handleWhaleClick(coin.symbol)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full hover:bg-amber-500/30 transition-colors cursor-pointer"
                      aria-haspopup="dialog"
                      title="Click for explanation — why this asset shows whale activity"
                    >
                      <Fish className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-amber-400">{(coin.whale_confidence * 100).toFixed(0)}%</span>
                    </button>
                  ) : (
                    <span className="text-gray-500 text-xs">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSignalColor(coin.signal)}`}>
                    {coin.signal}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  {renderSparkline(coin.sparkline_7d)}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleBuy(coin)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 mx-auto"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Buy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-3">
        {coins.map((coin, index) => (
          <div
            key={coin.coin_id}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                <div>
                  <div className="font-semibold text-lg">{coin.symbol}</div>
                  <div className="text-sm text-gray-400">{coin.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-semibold">
                  ${coin.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </div>
                <div className={coin.price_change_percentage_24h && coin.price_change_percentage_24h >= 0 ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-xs text-gray-400 mb-1">Momentum</div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{coin.momentum_score?.toFixed(1)}</span>
                  {coin.momentum_score >= 70 && <TrendingUp className="w-4 h-4 text-green-400" />}
                  {coin.momentum_score < 40 && <TrendingDown className="w-4 h-4 text-red-400" />}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">PreTrend</div>
                <div className={coin.pretrend >= 0.6 ? "text-green-400 font-semibold" : ""}>
                  {(coin.pretrend * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSignalColor(coin.signal)}`}>
                  {coin.signal}
                </span>
                {coin.whale_confidence > 0.6 && (
                  <button
                    onClick={() => handleWhaleClick(coin.symbol)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full hover:bg-amber-500/30 transition-colors cursor-pointer"
                    aria-haspopup="dialog"
                    title="Click for explanation — why this asset shows whale activity"
                  >
                    <Fish className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-400">{(coin.whale_confidence * 100).toFixed(0)}%</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => handleBuy(coin)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>

      {lastUpdated && (
        <div className="text-center text-sm text-gray-400 mt-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {whaleModalSymbol && (
        <WhaleExplainModal
          symbol={whaleModalSymbol}
          onClose={() => setWhaleModalSymbol(null)}
        />
      )}
    </div>
  );
}
