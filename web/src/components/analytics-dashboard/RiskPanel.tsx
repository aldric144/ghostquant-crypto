"use client";

import { RiskData } from "./index";

interface RiskPanelProps {
  data: RiskData | null;
  isLoading: boolean;
  compact?: boolean;
  onViewMore?: () => void;
}

export default function RiskPanel({ data, isLoading, compact, onViewMore }: RiskPanelProps) {
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

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-400";
    if (score >= 60) return "text-orange-400";
    if (score >= 40) return "text-yellow-400";
    return "text-green-400";
  };

  const getRiskBgColor = (score: number) => {
    if (score >= 80) return "bg-red-500/20 border-red-500/30";
    if (score >= 60) return "bg-orange-500/20 border-orange-500/30";
    if (score >= 40) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-green-500/20 border-green-500/30";
  };

  return (
    <div className={`bg-slate-800/50 rounded-xl border border-cyan-500/20 p-6 ${compact ? "" : "min-h-[500px]"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Risk Analytics</h3>
        </div>
        {compact && onViewMore && (
          <button onClick={onViewMore} className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
            View More →
          </button>
        )}
      </div>

      {/* Global Risk Score */}
      <div className={`${getRiskBgColor(data.globalScore)} border rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Global Risk Score</span>
          <span className={`text-3xl font-bold ${getRiskColor(data.globalScore)}`}>{data.globalScore}</span>
        </div>
        <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              data.globalScore >= 80 ? "bg-red-500" : data.globalScore >= 60 ? "bg-orange-500" : data.globalScore >= 40 ? "bg-yellow-500" : "bg-green-500"
            }`}
            style={{ width: `${data.globalScore}%` }}
          ></div>
        </div>
      </div>

      {/* Risk Distribution */}
      {!compact && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Risk Distribution</h4>
          <div className="space-y-2">
            {data.distribution.map((item) => (
              <div key={item.level} className="flex items-center gap-3">
                <span className="text-sm text-gray-300 w-20">{item.level}</span>
                <div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      item.level === "Critical" ? "bg-red-500" : item.level === "High" ? "bg-orange-500" : item.level === "Medium" ? "bg-yellow-500" : "bg-green-500"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Risks */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3">Top Risks</h4>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {data.topRisks.slice(0, compact ? 3 : 10).map((risk, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">#{i + 1}</span>
                <div>
                  <p className="text-sm text-white font-mono">{risk.entity}</p>
                  <p className="text-xs text-gray-400">{risk.type} • {risk.chain}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${getRiskColor(risk.score)}`}>{risk.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
