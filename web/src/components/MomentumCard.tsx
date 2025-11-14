"use client";

import { TrendingUp, TrendingDown, Activity, Zap, Brain, Whale } from "lucide-react";

interface MomentumCardProps {
  coin: {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    total_volume: number;
    price_change_percentage_24h: number;
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
    action: string;
    confidence: number;
    sparkline_7d?: number[];
  };
  onBuyClick: () => void;
}

export default function MomentumCard({ coin, onBuyClick }: MomentumCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-green-500";
    if (score >= 70) return "from-yellow-500 to-amber-500";
    if (score >= 60) return "from-blue-500 to-cyan-500";
    return "from-slate-500 to-slate-600";
  };

  const getActionColor = (action: string) => {
    if (action === "BUY") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (action === "HOLD") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (action === "EXIT") return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  };

  const formatPrice = (price: number) => {
    if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${price.toFixed(6)}`;
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${(cap / 1e3).toFixed(2)}K`;
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-all">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Coin Info */}
        <div className="flex items-center gap-3 flex-1">
          <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">{coin.symbol.toUpperCase()}</h3>
              {coin.whale_confidence >= 0.6 && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-400">
                  <Whale size={12} />
                  Whale
                </div>
              )}
              {coin.pretrend_prob >= 0.7 && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/30 rounded text-xs text-cyan-400">
                  <Brain size={12} />
                  PreTrend
                </div>
              )}
            </div>
            <p className="text-sm text-slate-400">{coin.name}</p>
            <div className="flex items-center gap-4 mt-1 text-sm">
              <span className="text-white font-medium">{formatPrice(coin.current_price)}</span>
              <span className={coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}>
                {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                {coin.price_change_percentage_24h.toFixed(2)}%
              </span>
              <span className="text-slate-500">MCap: {formatMarketCap(coin.market_cap)}</span>
            </div>
          </div>
        </div>

        {/* Center: Momentum Score */}
        <div className="flex flex-col items-center">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getScoreColor(coin.momentum_score)} flex items-center justify-center shadow-lg`}>
            <div className="text-center">
              <div className="text-2xl font-bold">{coin.momentum_score.toFixed(0)}</div>
              <div className="text-xs opacity-80">Score</div>
            </div>
          </div>
          <div className={`mt-2 px-3 py-1 rounded-full border text-xs font-medium ${getActionColor(coin.action)}`}>
            {coin.action}
          </div>
        </div>

        {/* Right: Sub-scores & Action */}
        <div className="flex flex-col gap-2 min-w-[200px]">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <TrendingUp size={12} className="text-blue-400" />
              <span className="text-slate-400">Momentum:</span>
              <span className="text-white font-medium">{coin.sub_scores.price_momentum.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity size={12} className="text-purple-400" />
              <span className="text-slate-400">Volume:</span>
              <span className="text-white font-medium">{coin.sub_scores.volume_spike.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={12} className="text-yellow-400" />
              <span className="text-slate-400">RSI:</span>
              <span className="text-white font-medium">{coin.sub_scores.rsi_signal.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={12} className="text-green-400" />
              <span className="text-slate-400">MA Cross:</span>
              <span className="text-white font-medium">{coin.sub_scores.ma_cross.toFixed(1)}</span>
            </div>
          </div>

          {/* Bonuses */}
          {(coin.sub_scores.pretrend_bonus > 0 || coin.sub_scores.whale_bonus > 0) && (
            <div className="flex gap-2 text-xs">
              {coin.sub_scores.pretrend_bonus > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded">
                  <Brain size={10} className="text-cyan-400" />
                  <span className="text-cyan-400">+{coin.sub_scores.pretrend_bonus.toFixed(1)}</span>
                </div>
              )}
              {coin.sub_scores.whale_bonus > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded">
                  <Whale size={10} className="text-purple-400" />
                  <span className="text-purple-400">+{coin.sub_scores.whale_bonus.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onBuyClick}
            className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Sparkline */}
      {coin.sparkline_7d && coin.sparkline_7d.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <div className="h-12 flex items-end gap-0.5">
            {coin.sparkline_7d.slice(-24).map((price, i) => {
              const min = Math.min(...coin.sparkline_7d!);
              const max = Math.max(...coin.sparkline_7d!);
              const height = ((price - min) / (max - min)) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 bg-blue-500/30 rounded-t"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
