"use client";

import { EntityData } from "./index";

interface EntityPanelProps {
  data: EntityData | null;
  isLoading: boolean;
  compact?: boolean;
  onViewMore?: () => void;
}

export default function EntityPanel({ data, isLoading, compact, onViewMore }: EntityPanelProps) {
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

  const categoryColors: Record<string, string> = {
    Exchange: "bg-blue-500",
    DeFi: "bg-purple-500",
    Whale: "bg-cyan-500",
    "Smart Money": "bg-green-500",
    Institutional: "bg-yellow-500",
    Other: "bg-gray-500",
  };

  const trendIcons: Record<string, string> = {
    up: "↑",
    down: "↓",
    stable: "→",
  };

  const trendColors: Record<string, string> = {
    up: "text-green-400",
    down: "text-red-400",
    stable: "text-gray-400",
  };

  return (
    <div className={`bg-slate-800/50 rounded-xl border border-cyan-500/20 p-6 ${compact ? "" : "min-h-[500px]"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Entity Analytics</h3>
        </div>
        {compact && onViewMore && (
          <button onClick={onViewMore} className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
            View More →
          </button>
        )}
      </div>

      {/* Active Entities Count */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Active Entities</span>
          <span className="text-3xl font-bold text-purple-400">{data.activeEntities.toLocaleString()}</span>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Entity Categories</h4>
        <div className="space-y-2">
          {data.categories.slice(0, compact ? 4 : 6).map((cat) => (
            <div key={cat.name} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${categoryColors[cat.name] || "bg-gray-500"}`}></div>
              <span className="text-sm text-gray-300 flex-1">{cat.name}</span>
              <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${categoryColors[cat.name] || "bg-gray-500"}`} style={{ width: `${cat.percentage}%` }}></div>
              </div>
              <span className="text-xs text-gray-400 w-12 text-right">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Movement Patterns */}
      {!compact && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Movement Patterns</h4>
          <div className="grid grid-cols-2 gap-2">
            {data.movementPatterns.map((pattern) => (
              <div key={pattern.pattern} className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">{pattern.pattern}</span>
                  <span className={`text-sm ${trendColors[pattern.trend]}`}>{trendIcons[pattern.trend]}</span>
                </div>
                <p className="text-lg font-bold text-white">{pattern.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distribution */}
      {!compact && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Status Distribution</h4>
          <div className="flex gap-2">
            {data.distribution.map((dist) => (
              <div key={dist.type} className="flex-1 bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">{dist.type}</p>
                <p className="text-lg font-bold text-white">{dist.count.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
