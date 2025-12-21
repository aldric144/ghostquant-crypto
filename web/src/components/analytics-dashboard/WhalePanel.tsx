"use client";

import { WhaleAnalyticsData } from "./index";

interface WhalePanelProps {
  data: WhaleAnalyticsData | null;
  isLoading: boolean;
  compact?: boolean;
  onViewMore?: () => void;
}

export default function WhalePanel({ data, isLoading, compact, onViewMore }: WhalePanelProps) {
  if (isLoading || !data) {
    return (
      <div className={`bg-slate-800/50 rounded-xl border border-cyan-500/20 p-6 ${compact ? "" : "min-h-[500px]"}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `$${(vol / 1e3).toFixed(2)}K`;
    return `$${vol.toFixed(2)}`;
  };

  // Defensive: ensure arrays exist and handle empty arrays
  const topWhales = Array.isArray(data.topWhales) ? data.topWhales : [];
  const activityTrend = Array.isArray(data.activityTrend) ? data.activityTrend : [];
  
  const totalVolume = topWhales.reduce((sum, w) => sum + (w.volume || 0), 0);
  const totalMovements = topWhales.reduce((sum, w) => sum + (w.movements || 0), 0);
  const avgInfluence = topWhales.length > 0 ? topWhales.reduce((sum, w) => sum + (w.influence || 0), 0) / topWhales.length : 0;

  return (
    <div className={`bg-slate-800/50 rounded-xl border border-cyan-500/20 p-6 ${compact ? "" : "min-h-[500px]"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Whale Analytics</h3>
        </div>
        {compact && onViewMore && (
          <button onClick={onViewMore} className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
            View More →
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Total Volume</p>
          <p className="text-lg font-bold text-cyan-400">{formatVolume(totalVolume)}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Movements</p>
          <p className="text-lg font-bold text-green-400">{totalMovements.toLocaleString()}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Avg Influence</p>
          <p className="text-lg font-bold text-purple-400">{avgInfluence.toFixed(1)}</p>
        </div>
      </div>

      {/* Activity Trend Mini Chart */}
      {!compact && activityTrend.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">24h Activity Trend</h4>
          <div className="h-20 flex items-end gap-1">
            {activityTrend.map((point, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-cyan-500/50 to-cyan-400/80 rounded-t transition-all hover:from-cyan-400/60 hover:to-cyan-300/90"
                style={{ height: `${point.activity}%` }}
                title={`${point.time}: ${point.activity}`}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* Top Whales */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3">Top Whales</h4>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {data.topWhales.slice(0, compact ? 4 : 10).map((whale, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-5">#{i + 1}</span>
                <div>
                  <p className="text-sm text-white font-mono">{whale.address}</p>
                  <p className="text-xs text-gray-400">{whale.movements} movements</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-cyan-400">{formatVolume(whale.volume)}</p>
                <p className="text-xs text-gray-400">Inf: {whale.influence.toFixed(1)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
