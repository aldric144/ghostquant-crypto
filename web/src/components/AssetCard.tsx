"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Fish, Eye, EyeOff, ShoppingCart } from "lucide-react";
import Sparkline from "./Sparkline";
import type { Asset } from "@/lib/api";

interface AssetCardProps {
  asset: Asset;
  onBuyClick: (asset: Asset) => void;
  onWatchToggle: (asset: Asset, watched: boolean) => void;
  onWhaleClick: (symbol: string) => void;
  isWatched: boolean;
  compact?: boolean;
}

export default function AssetCard({
  asset,
  onBuyClick,
  onWatchToggle,
  onWhaleClick,
  isWatched,
  compact = true,
}: AssetCardProps) {
  const [expanded, setExpanded] = useState(!compact);

  const formatPrice = (price: number) => {
    if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${(cap / 1e3).toFixed(2)}K`;
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
    return `$${(vol / 1e3).toFixed(2)}K`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
    if (score >= 70) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    if (score >= 60) return "text-blue-400 bg-blue-400/10 border-blue-400/30";
    return "text-slate-400 bg-slate-400/10 border-slate-400/30";
  };

  const getSignalColor = (signal: string) => {
    if (signal === "BUY") return "text-green-400 bg-green-400/10 border-green-400/30";
    if (signal === "HOLD") return "text-blue-400 bg-blue-400/10 border-blue-400/30";
    if (signal === "EXIT") return "text-red-400 bg-red-400/10 border-red-400/30";
    return "text-slate-400 bg-slate-400/10 border-slate-400/30";
  };

  const priceChange = asset.price_change_percentage_24h || 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg hover:border-blue-500/50 transition-all">
      {/* Compact View */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Coin Image & Info */}
          <img
            src={asset.image}
            alt={asset.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48';
            }}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold truncate">{asset.symbol.toUpperCase()}</h3>
              
              {/* Whale Badge - Clickable */}
              {asset.whale_confidence >= 0.6 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onWhaleClick(asset.symbol);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-400 hover:bg-purple-500/30 transition-colors cursor-pointer"
                  aria-label={`View whale activity for ${asset.symbol}`}
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <Fish size={12} />
                  <span className="hidden sm:inline">{Math.round(asset.whale_confidence * 100)}%</span>
                </button>
              )}

              {/* Signal Badge */}
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSignalColor(asset.signal)}`}>
                {asset.signal}
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-400 truncate">{asset.name}</p>
            
            {/* Price & Change */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm sm:text-base font-semibold">{formatPrice(asset.price)}</span>
              <span className={`text-xs sm:text-sm flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Sparkline - Hidden on mobile */}
          <div className="hidden md:block flex-shrink-0">
            {asset.sparkline_7d && asset.sparkline_7d.length > 0 && (
              <Sparkline
                data={asset.sparkline_7d.slice(-24)}
                width={80}
                height={30}
                className="opacity-70"
              />
            )}
          </div>

          {/* Scores */}
          <div className="hidden lg:flex flex-col gap-1 flex-shrink-0 min-w-[80px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Trend:</span>
              <span className="font-semibold text-blue-400">{asset.trend_score.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">PreTrend:</span>
              <span className="font-semibold text-cyan-400">{(asset.pretrend * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWatchToggle(asset, !isWatched);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isWatched
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700'
              }`}
              aria-label={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              {isWatched ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuyClick(asset);
              }}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <span className="hidden sm:inline">Buy</span>
              <ShoppingCart size={18} className="sm:hidden" />
            </button>
          </div>
        </div>

        {/* Expanded View */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
            {/* Mobile Sparkline */}
            <div className="md:hidden">
              {asset.sparkline_7d && asset.sparkline_7d.length > 0 && (
                <div className="bg-slate-900/50 rounded p-2">
                  <Sparkline
                    data={asset.sparkline_7d.slice(-24)}
                    width={200}
                    height={40}
                  />
                </div>
              )}
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-slate-400 text-xs">Market Cap</div>
                <div className="font-semibold">{formatMarketCap(asset.market_cap)}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs">Volume 24h</div>
                <div className="font-semibold">{formatVolume(asset.total_volume)}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs">Rank</div>
                <div className="font-semibold">#{asset.market_cap_rank}</div>
              </div>
              <div className="lg:hidden">
                <div className="text-slate-400 text-xs">Trend Score</div>
                <div className="font-semibold text-blue-400">{asset.trend_score.toFixed(1)}</div>
              </div>
              <div className="lg:hidden">
                <div className="text-slate-400 text-xs">PreTrend</div>
                <div className="font-semibold text-cyan-400">{(asset.pretrend * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs">Momentum</div>
                <div className="font-semibold text-yellow-400">{asset.momentum_score.toFixed(1)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Expand Button */}
        {compact && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400 hover:text-blue-400 transition-colors"
          >
            {expanded ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
    </div>
  );
}
