"use client";

import { TrendData } from "./index";

interface TrendPanelProps {
  data: TrendData | null;
  isLoading: boolean;
  compact?: boolean;
  onViewMore?: () => void;
}

export default function TrendPanel({ data, isLoading, compact, onViewMore }: TrendPanelProps) {
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

  const typeColors: Record<string, string> = {
    manipulation: "bg-red-500",
    whale: "bg-blue-500",
    darkpool: "bg-purple-500",
    stablecoin: "bg-green-500",
  };

  // Defensive: ensure arrays exist and handle empty arrays
  const hourlyActivity = Array.isArray(data.hourlyActivity) ? data.hourlyActivity : [];
  const heatmap = Array.isArray(data.heatmap) ? data.heatmap : [];
  const events = Array.isArray(data.events) ? data.events : [];
  
  const maxValue = hourlyActivity.length > 0 ? Math.max(...hourlyActivity.map((h) => h.value || 0)) : 1;

  return (
    <div className={`bg-slate-800/50 rounded-xl border border-cyan-500/20 p-6 ${compact ? "" : "min-h-[500px]"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Trend Analytics</h3>
        </div>
        {compact && onViewMore && (
          <button onClick={onViewMore} className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
            View More →
          </button>
        )}
      </div>

      {/* 24h Activity Chart */}
      {hourlyActivity.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">24h Activity</h4>
          <div className="h-24 flex items-end gap-0.5">
            {hourlyActivity.map((point, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t transition-all hover:opacity-80 ${typeColors[point.type] || "bg-cyan-500"}`}
                style={{ height: `${((point.value || 0) / maxValue) * 100}%`, minHeight: "4px" }}
                title={`${point.hour}: ${point.value} (${point.type})`}
              ></div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">0:00</span>
            <span className="text-xs text-gray-500">12:00</span>
            <span className="text-xs text-gray-500">23:00</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${color}`}></div>
            <span className="text-xs text-gray-400 capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Weekly Heatmap */}
      {!compact && heatmap.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Weekly Heatmap</h4>
          <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="contents">
                {Array.from({ length: 24 }, (_, hour) => {
                  const point = heatmap.find((h) => h.day === day && h.hour === hour);
                  const intensity = point ? Math.max(0.1, (point.value || 0) / 100) : 0.05;
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="w-full aspect-square rounded-sm transition-all border border-slate-700/30"
                      style={{
                        backgroundColor: `rgba(34, 211, 238, ${intensity})`,
                      }}
                      title={`${day} ${hour}:00 - ${point?.value || 0}`}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
          {/* Day labels */}
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      )}

      {/* Recent Events */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-2">Recent Events</h4>
        <div className="space-y-1 max-h-[120px] overflow-y-auto">
          {events.slice(0, compact ? 4 : 8).map((event, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-700/50 rounded px-2 py-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${typeColors[event.type] || "bg-gray-500"}`}></div>
                <span className="text-xs text-gray-300 capitalize">{event.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white font-medium">{event.count}</span>
                <span className="text-xs text-gray-500">{event.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
