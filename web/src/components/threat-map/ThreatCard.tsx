"use client";

import { ThreatEvent } from "@/lib/threatMapClient";

interface ThreatCardProps {
  threat: ThreatEvent;
  onClick?: () => void;
}

export default function ThreatCard({ threat, onClick }: ThreatCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-900/30 text-red-400 border-red-500/30";
      case "high":
        return "bg-orange-900/30 text-orange-400 border-orange-500/30";
      case "medium":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-green-900/30 text-green-400 border-green-500/30";
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-500/30";
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "whales":
        return "🐋";
      case "manipulation":
        return "⚠️";
      case "darkpool":
        return "🌑";
      case "stablecoin":
        return "💵";
      case "derivatives":
        return "📊";
      case "hydra":
        return "🐉";
      case "constellation":
        return "✨";
      default:
        return "🔍";
    }
  };

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const formatValue = (value: number) => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div
      className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getSourceIcon(threat.source)}</span>
          <div>
            <span className="font-semibold text-white">{threat.symbol}</span>
            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold border ${getSeverityColor(threat.severity)}`}>
              {threat.severity.toUpperCase()}
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-500">{formatTimestamp(threat.timestamp)}</span>
      </div>

      <div className="mb-3">
        <div className="text-sm text-gray-300 capitalize">{threat.type.replace(/_/g, " ")}</div>
        <div className="text-xs text-gray-500 mt-1">{threat.description}</div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-slate-900/50 rounded p-2">
          <div className="text-gray-500">Value at Risk</div>
          <div className="text-white font-semibold">{formatValue(threat.value_at_risk)}</div>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <div className="text-gray-500">Confidence</div>
          <div className="text-white font-semibold">{(threat.confidence * 100).toFixed(0)}%</div>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <div className="text-gray-500">Impact</div>
          <div className="text-white font-semibold">{threat.impact_score.toFixed(0)}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        <span className="capitalize">{threat.source}</span>
        {threat.metadata?.addresses_involved && (
          <span>{threat.metadata.addresses_involved} addresses</span>
        )}
        {threat.metadata?.exchanges_affected && (
          <span>{threat.metadata.exchanges_affected} exchanges</span>
        )}
      </div>
    </div>
  );
}
