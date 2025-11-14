"use client";

import { useEffect, useState } from "react";

interface TopFeature {
  feature: string;
  contribution: number;
  note: string;
}

interface ScoredCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank?: number;
  total_volume: number;
  price_change_percentage_1h?: number;
  price_change_percentage_24h?: number;
  price_change_percentage_7d?: number;
  score: number;
  confidence: number;
  top_features: TopFeature[];
  risk_flags: string[];
  why: string;
  liquidity_score: number;
  cross_exchange_count: number;
  sparkline_7d?: number[];
  trade_readiness?: string;
  suggested_pair?: {
    exchange: string;
    pair: string;
  };
  estimated_slippage_pct?: number;
}

interface ScreenerResponse {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  results: ScoredCoin[];
  timestamp: string;
}

interface TopCoinsResponse {
  count: number;
  results: ScoredCoin[];
  filters: any;
  timestamp: string;
}

export default function NativeScreenerPage() {
  const [data, setData] = useState<ScreenerResponse | null>(null);
  const [topCoins, setTopCoins] = useState<TopCoinsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<ScoredCoin | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchScreenerData();
    fetchTopCoins();
    const interval = setInterval(() => {
      fetchScreenerData();
      fetchTopCoins();
    }, 60000);
    return () => clearInterval(interval);
  }, [page, search, minScore]);

  const fetchScreenerData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });
      if (minScore !== null) params.append("min_score", minScore.toString());
      if (search) params.append("search", search);

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
      const response = await fetch(`${API_BASE}/screener/list?${params}`);
      if (!response.ok) throw new Error("Failed to fetch screener data");
      const json = await response.json();
      
      const normalized = {
        ...json,
        results: (json.results || []).map((c: any) => ({
          ...c,
          score: Number.isFinite(c.momentum_score) ? c.momentum_score : (c.score ?? 0),
          confidence: Number.isFinite(c.confidence) ? c.confidence : 0,
          liquidity_score: Number.isFinite(c.liquidity_score) ? c.liquidity_score : 0,
          risk_flags: Array.isArray(c.risk_flags) ? c.risk_flags : [],
          cross_exchange_count: c.cross_exchange_count ?? 0,
        })),
      };
      
      setData(normalized);
      setError(null);
    } catch (err) {
      console.error("Error fetching screener data:", err);
      setError("Failed to load screener data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopCoins = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
      const response = await fetch(`${API_BASE}/screener/top_coins?limit=10`);
      if (!response.ok) throw new Error("Failed to fetch top coins");
      const json = await response.json();
      
      const normalized = {
        ...json,
        results: (json.results || []).map((c: any) => ({
          ...c,
          score: Number.isFinite(c.momentum_score) ? c.momentum_score : (c.score ?? 0),
          confidence: Number.isFinite(c.confidence) ? c.confidence : 0,
          liquidity_score: Number.isFinite(c.liquidity_score) ? c.liquidity_score : 0,
          risk_flags: Array.isArray(c.risk_flags) ? c.risk_flags : [],
          cross_exchange_count: c.cross_exchange_count ?? 0,
          top_features: Array.isArray(c.top_features) ? c.top_features : [],
          suggested_pair: c.suggested_pair ?? null,
          why: typeof c.why === 'string' ? c.why : "",
          sparkline_7d: Array.isArray(c.sparkline_7d) ? c.sparkline_7d : [],
        })),
      };
      
      setTopCoins(normalized);
    } catch (err) {
      console.error("Error fetching top coins:", err);
    }
  };

  const handleCoinClick = (coin: ScoredCoin) => {
    setSelectedCoin(coin);
  };

  const exportToCSV = () => {
    if (!topCoins?.results) return;
    
    const headers = ["Rank", "Symbol", "Name", "Score", "Confidence", "Liquidity", "Exchanges", "Trade Readiness"];
    const rows = topCoins.results.map((coin, idx) => [
      idx + 1,
      coin.symbol,
      coin.name,
      (coin.score || 0).toFixed(2),
      ((coin.confidence || 0) * 100).toFixed(2),
      (coin.liquidity_score || 0).toFixed(2),
      coin.cross_exchange_count || 0,
      coin.trade_readiness || "N/A"
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `top-coins-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 70) return "text-blue-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 50) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const getTradeReadinessBadge = (readiness?: string) => {
    if (readiness === "Ready") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (readiness === "Watch") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const renderSparkline = (sparkline?: number[]) => {
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
      <svg width="60" height="24" className="inline-block">
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

  const renderMobileCard = (coin: ScoredCoin, rank: number) => (
    <div
      key={coin.symbol}
      onClick={() => handleCoinClick(coin)}
      className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-4 hover:bg-slate-700/50 transition cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-gray-400">#{rank}</div>
          <div>
            <div className="text-xl font-bold text-white">{coin.symbol}</div>
            <div className="text-sm text-gray-400">{coin.name}</div>
          </div>
        </div>
        <div className={`text-3xl font-bold ${getScoreColor(coin.score)}`}>
          {coin.score.toFixed(0)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-xs text-gray-400">Price</div>
          <div className="text-sm font-semibold text-white">
            ${coin.current_price.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">24h Change</div>
          <div className={`text-sm font-semibold ${
            (coin.price_change_percentage_24h || 0) >= 0 ? "text-green-400" : "text-red-400"
          }`}>
            {(coin.price_change_percentage_24h || 0) >= 0 ? "+" : ""}
            {(coin.price_change_percentage_24h || 0).toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Confidence</div>
          <div className="text-sm font-semibold text-blue-400">
            {(coin.confidence * 100).toFixed(0)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Exchanges</div>
          <div className="text-sm font-semibold text-purple-400">
            {coin.cross_exchange_count || 0}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-400 mb-2">
        {coin.why}
      </div>

      {coin.risk_flags && Array.isArray(coin.risk_flags) && coin.risk_flags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {coin.risk_flags.map((flag) => (
            <span key={flag} className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30">
              {flag}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const renderDesktopRow = (coin: ScoredCoin, rank: number) => (
    <tr
      key={coin.symbol}
      onClick={() => handleCoinClick(coin)}
      className="hover:bg-slate-700/30 transition cursor-pointer border-l-4 border-transparent hover:border-blue-500"
    >
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-lg font-bold text-gray-400">#{rank}</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div>
            <div className="text-lg font-bold text-white">{coin.symbol}</div>
            <div className="text-xs text-gray-400">{coin.name}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center">
        {renderSparkline(coin.sparkline_7d)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right">
        <div className="text-sm text-gray-300">
          ${coin.current_price.toFixed(2)}
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right">
        <div className={`text-sm font-semibold ${
          (coin.price_change_percentage_1h || 0) >= 0 ? "text-green-400" : "text-red-400"
        }`}>
          {(coin.price_change_percentage_1h || 0) >= 0 ? "+" : ""}
          {(coin.price_change_percentage_1h || 0).toFixed(2)}%
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right">
        <div className={`text-sm font-semibold ${
          (coin.price_change_percentage_24h || 0) >= 0 ? "text-green-400" : "text-red-400"
        }`}>
          {(coin.price_change_percentage_24h || 0) >= 0 ? "+" : ""}
          {(coin.price_change_percentage_24h || 0).toFixed(2)}%
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getScoreBg(coin.score)}/20 border-2 ${getScoreBg(coin.score)}`}>
          <span className={`text-xl font-bold ${getScoreColor(coin.score)}`}>
            {coin.score.toFixed(0)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <div className="text-sm text-blue-400">{(coin.confidence * 100).toFixed(0)}%</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getScoreBg(coin.liquidity_score || 0)}`}
            style={{ width: `${Math.max(0, Math.min(100, coin.liquidity_score || 0))}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-1">{(coin.liquidity_score || 0).toFixed(0)}</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <div className="text-sm text-purple-400">{coin.cross_exchange_count || 0}</div>
      </td>
    </tr>
  );

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8">
            Native Coin Momentum Screener
          </h1>
          <div className="text-gray-400">Loading screener data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8">
            Native Coin Momentum Screener
          </h1>
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Native Coin Momentum Screener
          </h1>
          <div className="text-sm text-gray-400">
            {data?.total || 0} coins • Updated {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : "N/A"}
          </div>
        </div>

        {topCoins && topCoins.results.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 md:p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-white">Top Coins Watchlist</h2>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-sm"
              >
                Export CSV
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {topCoins.results.slice(0, 10).map((coin) => (
                <div
                  key={coin.symbol}
                  onClick={() => handleCoinClick(coin)}
                  className="bg-slate-900/50 rounded-lg p-3 border border-slate-700 hover:border-blue-500 transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-lg font-bold text-white">{coin.symbol}</div>
                    <div className={`text-2xl font-bold ${getScoreColor(coin.score)}`}>
                      {coin.score.toFixed(0)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">{coin.name}</div>
                  {coin.trade_readiness && (
                    <div className={`text-xs px-2 py-1 rounded border ${getTradeReadinessBadge(coin.trade_readiness)}`}>
                      {coin.trade_readiness}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by symbol or name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Min Score"
              value={minScore || ""}
              onChange={(e) => {
                setMinScore(e.target.value ? parseFloat(e.target.value) : null);
                setPage(1);
              }}
              className="w-full md:w-32 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {isMobile ? (
          <div className="space-y-3">
            {data?.results.map((coin, idx) => 
              renderMobileCard(coin, (page - 1) * 50 + idx + 1)
            )}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Symbol</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Trend</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">1h</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">24h</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Score</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Conf</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Liquidity</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Exchanges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {data?.results.map((coin, idx) => 
                    renderDesktopRow(coin, (page - 1) * 50 + idx + 1)
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {data && data.total_pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition"
            >
              Previous
            </button>
            <span className="text-gray-400">
              Page {page} of {data.total_pages}
            </span>
            <button
              onClick={() => setPage(Math.min(data.total_pages, page + 1))}
              disabled={page === data.total_pages}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition"
            >
              Next
            </button>
          </div>
        )}

        {selectedCoin && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedCoin(null)}>
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedCoin.symbol}</h2>
                  <p className="text-gray-400">{selectedCoin.name}</p>
                </div>
                <button
                  onClick={() => setSelectedCoin(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Composite Score</div>
                  <div className={`text-4xl font-bold ${getScoreColor(selectedCoin.score)}`}>
                    {selectedCoin.score.toFixed(1)}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Confidence</div>
                  <div className="text-4xl font-bold text-blue-400">
                    {(selectedCoin.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {Array.isArray(selectedCoin.top_features) && selectedCoin.top_features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">Top Features</h3>
                  <div className="space-y-2">
                    {selectedCoin.top_features.map((feature, idx) => (
                      <div key={idx} className="bg-slate-900/50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-gray-300">{feature.feature}</span>
                          <span className="text-sm text-blue-400">{feature.contribution.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-400">{feature.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(selectedCoin.risk_flags) && selectedCoin.risk_flags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">Risk Flags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCoin.risk_flags.map((flag) => (
                      <span key={flag} className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-sm">
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCoin.suggested_pair && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">Suggested Pair</h3>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Exchange</div>
                    <div className="text-lg font-semibold text-white mb-3">{selectedCoin.suggested_pair.exchange}</div>
                    <div className="text-sm text-gray-400 mb-1">Pair</div>
                    <div className="text-lg font-semibold text-white mb-3">{selectedCoin.suggested_pair.pair}</div>
                    {selectedCoin.estimated_slippage_pct !== undefined && (
                      <>
                        <div className="text-sm text-gray-400 mb-1">Estimated Slippage</div>
                        <div className="text-lg font-semibold text-yellow-400">{selectedCoin.estimated_slippage_pct.toFixed(2)}%</div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {selectedCoin.why && (
                <div className="text-sm text-gray-400 italic">
                  {selectedCoin.why}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          Auto-refreshes every 60 seconds
        </div>
      </div>
    </div>
  );
}
