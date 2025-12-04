"use client";

import { useState, useEffect } from "react";
import { Search, TrendingUp, TrendingDown, Activity, Filter } from "lucide-react";
import MomentumCard from "@/components/MomentumCard";
import BuyModal from "@/components/BuyModal";
import RankChangeFeed from "@/components/RankChangeFeed";
import ClustersPanel from "@/components/ClustersPanel";
import { useWebSocket } from "@/hooks/useWebSocket";

interface MomentumCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_1h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  momentum_score: number;
  sub_scores: {
    price_momentum: number;
    volume_spike: number;
    rsi_signal: number;
    ma_cross: number;
    pretrend_bonus: number;
    whale_bonus: number;
  };
  whale_confidence: number;
  pretrend_prob: number;
  sparkline_7d: number[];
  action: string;
  confidence: number;
  cluster_id?: number;
  cluster_label?: string;
}

export default function MomentumPage() {
  const [coins, setCoins] = useState<MomentumCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [whaleOnly, setWhaleOnly] = useState(false);
  const [minMarketCap, setMinMarketCap] = useState<number | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<MomentumCoin | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [sortBy, setSortBy] = useState("momentum_score");
  const [showClusters, setShowClusters] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

  const { isConnected, lastMessage } = useWebSocket(`${apiBase.replace('http', 'ws')}/ws/momentum`);

  const fetchMomentum = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "50",
        sort: sortBy,
        whale_only: whaleOnly.toString(),
      });

      if (minMarketCap) {
        params.append("min_marketcap", minMarketCap.toString());
      }

      const response = await fetch(`${apiBase}/market/momentum?${params}`);
      if (!response.ok) throw new Error("Failed to fetch momentum data");

      const data = await response.json();
      // Handle new API response format
      const results = data.results || [];
      const transformedCoins = results.map((coin: any) => ({
        id: coin.id || coin.coin_id,
        symbol: coin.symbol?.toUpperCase() || '',
        name: coin.name || '',
        image: coin.image || '',
        current_price: coin.price || coin.current_price || 0,
        market_cap: coin.market_cap || 0,
        market_cap_rank: coin.rank || coin.market_cap_rank || 0,
        total_volume: coin.volume_24h || coin.total_volume || 0,
        price_change_percentage_1h: coin.change_1h || coin.price_change_percentage_1h || 0,
        price_change_percentage_24h: coin.change_24h || coin.price_change_percentage_24h || 0,
        price_change_percentage_7d: coin.change_7d || coin.price_change_percentage_7d || 0,
        momentum_score: coin.momentum_score || Math.abs(coin.change_24h || 0) * 10,
        sub_scores: coin.sub_scores || {
          price_momentum: Math.abs(coin.change_24h || 0) * 5,
          volume_spike: 0,
          rsi_signal: 50,
          ma_cross: 0,
          pretrend_bonus: 0,
          whale_bonus: 0
        },
        whale_confidence: coin.whale_confidence || 0.5,
        pretrend_prob: coin.pretrend_prob || 0,
        sparkline_7d: coin.sparkline_7d || [],
        action: coin.change_24h > 0 ? 'BUY' : 'SELL',
        confidence: Math.min(Math.abs(coin.change_24h || 0) / 10, 1),
        cluster_id: coin.cluster_id,
        cluster_label: coin.cluster_label
      }));
      setCoins(transformedCoins);
      setTotalPages(data.total_pages || 1);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMomentum();
  }, [page, sortBy, whaleOnly, minMarketCap]);

  useEffect(() => {
    if (lastMessage && lastMessage.type === "top_update") {
      const updates = lastMessage.data || [];
      setCoins((prevCoins) => {
        const updatedCoins = [...prevCoins];
        updates.forEach((update: any) => {
          const index = updatedCoins.findIndex((c) => c.id === update.id);
          if (index !== -1) {
            updatedCoins[index] = { ...updatedCoins[index], ...update };
          }
        });
        return updatedCoins;
      });
    }
  }, [lastMessage]);

  const filteredCoins = coins.filter((coin) =>
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuyClick = (coin: MomentumCoin) => {
    setSelectedCoin(coin);
    setShowBuyModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Momentum Screener
              </h1>
              <p className="text-slate-400 mt-2">
                Full CoinGecko universe with AI-powered momentum scoring
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isConnected && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-400">Live</span>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search coins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="momentum_score">Momentum Score</option>
              <option value="market_cap">Market Cap</option>
              <option value="total_volume">Volume</option>
              <option value="price_change_percentage_24h">24h Change</option>
            </select>

            {/* Whale Filter */}
            <button
              onClick={() => setWhaleOnly(!whaleOnly)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                whaleOnly
                  ? "bg-purple-500/20 border-purple-500 text-purple-400"
                  : "bg-slate-800/50 border-slate-700 text-slate-400"
              }`}
            >
              <Activity className="inline mr-2" size={16} />
              Whale Movers Only
            </button>

            {/* Clusters */}
            <button
              onClick={() => setShowClusters(!showClusters)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                showClusters
                  ? "bg-blue-500/20 border-blue-500 text-blue-400"
                  : "bg-slate-800/50 border-slate-700 text-slate-400"
              }`}
            >
              <Filter className="inline mr-2" size={16} />
              View Clusters
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Momentum List */}
          <div className="lg:col-span-3">
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
                <p className="text-slate-400 mt-4">Loading momentum data...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                Error: {error}
              </div>
            )}

            {!loading && !error && filteredCoins.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                No coins found matching your filters.
              </div>
            )}

            {!loading && !error && filteredCoins.length > 0 && (
              <div className="space-y-4">
                {filteredCoins.map((coin) => (
                  <MomentumCard
                    key={coin.id}
                    coin={coin}
                    onBuyClick={() => handleBuyClick(coin)}
                  />
                ))}

                {/* Pagination */}
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {showClusters ? (
              <ClustersPanel />
            ) : (
              <RankChangeFeed />
            )}
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      {showBuyModal && selectedCoin && (
        <BuyModal
          coin={selectedCoin}
          onClose={() => setShowBuyModal(false)}
        />
      )}
    </div>
  );
}
