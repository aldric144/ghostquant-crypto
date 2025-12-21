"use client";

import { AnomalyData } from "./index";

interface AnomalyPanelProps {
  data: AnomalyData | null;
  isLoading: boolean;
  compact?: boolean;
  onViewMore?: () => void;
}

export default function AnomalyPanel({ data, isLoading, compact, onViewMore }: AnomalyPanelProps) {
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "low":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  const getDeviationColor = (deviation: number) => {
    if (deviation >= 4) return "text-red-400";
    if (deviation >= 3) return "text-orange-400";
    if (deviation >= 2) return "text-yellow-400";
    return "text-green-400";
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`bg-slate-800/50 rounded-xl border border-cyan-500/20 p-6 ${compact ? "" : "min-h-[500px]"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Anomaly Detection</h3>
        </div>
        {compact && onViewMore && (
          <button onClick={onViewMore} className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
            View More →
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-slate-700/50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-lg font-bold text-white">{data.summary.total}</p>
        </div>
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2 text-center">
          <p className="text-xs text-red-400">High</p>
          <p className="text-lg font-bold text-red-400">{data.summary.high}</p>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-2 text-center">
          <p className="text-xs text-yellow-400">Medium</p>
          <p className="text-lg font-bold text-yellow-400">{data.summary.medium}</p>
        </div>
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-2 text-center">
          <p className="text-xs text-green-400">Low</p>
          <p className="text-lg font-bold text-green-400">{data.summary.low}</p>
        </div>
      </div>

      {/* Timeline Chart */}
      {!compact && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">24h Timeline</h4>
          <div className="h-16 flex items-end gap-0.5">
            {data.timeline.map((point, i) => {
              const maxCount = Math.max(...data.timeline.map((t) => t.count));
              const height = (point.count / maxCount) * 100;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t transition-all ${
                    point.severity === "high" ? "bg-red-500" : point.severity === "medium" ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ height: `${height}%`, minHeight: "4px" }}
                  title={`${point.time}: ${point.count} (${point.severity})`}
                ></div>
              );
            })}
          </div>
        </div>
      )}

      {/* Outliers List */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-2">Recent Outliers</h4>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {data.outliers.slice(0, compact ? 3 : 8).map((outlier) => (
            <div key={outlier.id} className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white font-mono">{outlier.entity}</span>
                <span className={`text-sm font-bold ${getDeviationColor(outlier.deviation)}`}>{outlier.deviation.toFixed(1)}σ</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{outlier.type}</span>
                <span className="text-xs text-gray-500">{formatTime(outlier.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly Types */}
      {!compact && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Anomaly Types</h4>
          <div className="flex flex-wrap gap-2">
            {["Volume Spike", "Price Deviation", "Unusual Pattern", "Statistical Outlier"].map((type) => {
              const count = data.outliers.filter((o) => o.type === type).length;
              return (
                <div key={type} className="bg-slate-700/50 rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <span className="text-xs text-gray-300">{type}</span>
                  <span className="text-xs font-bold text-cyan-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
