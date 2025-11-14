"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Filter, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import AssetCard from "@/components/AssetCard";
import WhaleExplainModal from "@/components/WhaleExplainModal";
import BuyModal from "@/components/BuyModal";
import { fetchAllAssets, assetsCache, type Asset } from "@/lib/api";

export default function AllAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"momentum" | "trend_score" | "whale_confidence" | "market_cap" | "price_change">("momentum");
  const [filterSignal, setFilterSignal] = useState<string>("all");
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [whaleModalSymbol, setWhaleModalSymbol] = useState<string | null>(null);
  const [buyModalAsset, setBuyModalAsset] = useState<Asset | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ghostquant_watchlist');
      if (saved) {
        setWatchlist(new Set(JSON.parse(saved)));
      }
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ghostquant_watchlist', JSON.stringify(Array.from(watchlist)));
    } catch (err) {
      console.error('Failed to save watchlist:', err);
    }
  }, [watchlist]);

  const fetchAssets = async () => {
    try {
      setError(null);
      
      const cached = assetsCache.get<Asset[]>('all-assets');
      if (cached) {
        setAssets(cached);
        setLoading(false);
        return;
      }

      const data = await fetchAllAssets({ limit: 500, sort: sortBy });
      setAssets(data);
      assetsCache.set('all-assets', data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error("Error fetching assets:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch assets");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    
    const interval = setInterval(fetchAssets, 30000);
    
    return () => clearInterval(interval);
  }, [sortBy]);

  const handleRefresh = () => {
    assetsCache.clear();
    setLoading(true);
    fetchAssets();
  };

  const handleWatchToggle = (asset: Asset, watched: boolean) => {
    setWatchlist(prev => {
      const newSet = new Set(prev);
      if (watched) {
        newSet.add(asset.symbol);
      } else {
        newSet.delete(asset.symbol);
      }
      return newSet;
    });
  };

  const handleBuyClick = (asset: Asset) => {
    setBuyModalAsset(asset);
    
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('buy_clicked', {
        symbol: asset.symbol,
        price: asset.price,
        source: 'all_assets_page',
      });
    }
  };

  const handleWhaleClick = (symbol: string) => {
    setWhaleModalSymbol(symbol);
    
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('whale_explain_opened', {
        symbol,
        source: 'all_assets_page',
      });
    }
  };

  const filteredAndSortedAssets = useMemo(() => {
    let filtered = assets;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        asset =>
          asset.symbol.toLowerCase().includes(query) ||
          asset.name.toLowerCase().includes(query)
      );
    }

    if (filterSignal !== "all") {
      filtered = filtered.filter(asset => asset.signal === filterSignal);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "momentum":
          return b.momentum_score - a.momentum_score;
        case "trend_score":
          return b.trend_score - a.trend_score;
        case "whale_confidence":
          return b.whale_confidence - a.whale_confidence;
        case "market_cap":
          return b.market_cap - a.market_cap;
        case "price_change":
          return (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [assets, searchQuery, filterSignal, sortBy]);

  if (loading && assets.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-blue-400">All Assets</h1>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading assets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && assets.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-blue-400">All Assets</h1>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <p className="text-red-400 mb-4">Error: {error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">All Assets</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Full market universe: {filteredAndSortedAssets.length} of {assets.length} assets
            {lastUpdated && (
              <span className="ml-2 text-xs text-slate-500">
                • Updated {Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago
              </span>
            )}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by symbol or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Sort By */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="momentum">Momentum Score</option>
                <option value="trend_score">Trend Score</option>
                <option value="whale_confidence">Whale Activity</option>
                <option value="market_cap">Market Cap</option>
                <option value="price_change">24h Change</option>
              </select>
            </div>

            {/* Signal Filter */}
            <select
              value={filterSignal}
              onChange={(e) => setFilterSignal(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Signals</option>
              <option value="BUY">Buy</option>
              <option value="HOLD">Hold</option>
              <option value="EXIT">Exit</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 text-sm"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-400" />
              <span className="text-gray-400">
                Gainers: {assets.filter(a => (a.price_change_percentage_24h || 0) > 0).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown size={16} className="text-red-400" />
              <span className="text-gray-400">
                Losers: {assets.filter(a => (a.price_change_percentage_24h || 0) < 0).length}
              </span>
            </div>
            <div className="text-gray-400">
              Watchlist: {watchlist.size}
            </div>
          </div>
        </div>

        {/* Assets Grid */}
        {filteredAndSortedAssets.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">No assets found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedAssets.map((asset) => (
              <AssetCard
                key={asset.symbol}
                asset={asset}
                onBuyClick={handleBuyClick}
                onWatchToggle={handleWatchToggle}
                onWhaleClick={handleWhaleClick}
                isWatched={watchlist.has(asset.symbol)}
                compact={true}
              />
            ))}
          </div>
        )}

        {/* Load More Hint */}
        {assets.length >= 500 && (
          <div className="mt-6 text-center text-sm text-gray-400">
            Showing first 500 assets. Use search and filters to find specific assets.
          </div>
        )}
      </div>

      {/* Modals */}
      {whaleModalSymbol && (
        <WhaleExplainModal
          symbol={whaleModalSymbol}
          onClose={() => setWhaleModalSymbol(null)}
        />
      )}

      {buyModalAsset && (
        <BuyModal
          coin={{
            id: buyModalAsset.coin_id || buyModalAsset.symbol,
            symbol: buyModalAsset.symbol,
            name: buyModalAsset.name,
            image: buyModalAsset.image,
            current_price: buyModalAsset.price,
            market_cap: buyModalAsset.market_cap,
            total_volume: buyModalAsset.total_volume,
            price_change_percentage_24h: buyModalAsset.price_change_percentage_24h || 0,
            momentum_score: buyModalAsset.momentum_score,
            sub_scores: {
              price_momentum: 0,
              volume_spike: 0,
              rsi_signal: 0,
              ma_cross: 0,
              pretrend_bonus: 0,
              whale_bonus: 0,
            },
            whale_confidence: buyModalAsset.whale_confidence,
            pretrend_prob: buyModalAsset.pretrend,
            action: buyModalAsset.signal,
            confidence: 0,
          }}
          onClose={() => setBuyModalAsset(null)}
        />
      )}
    </div>
  );
}
