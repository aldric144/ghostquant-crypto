"use client";

import { useEffect, useState } from "react";

interface Alert {
  alert_id: string;
  alert_type: string;
  asset: string;
  severity: string;
  title: string;
  message: string;
  timestamp: string;
  pretrend_prob?: number;
  trend_score?: number;
  action?: string;
  value_usd?: number;
  chain?: string;
  tx_hash?: string;
}

interface AlertsResponse {
  alerts: Alert[];
  total_alerts: number;
  momentum_count?: number;
  whale_count?: number;
  lookback_hours: number;
  timestamp: string;
}

interface AlertsPanelProps {
  lookbackHours?: number;
  limit?: number;
  autoRefresh?: boolean;
}

export default function AlertsPanel({
  lookbackHours = 24,
  limit = 50,
  autoRefresh = true,
}: AlertsPanelProps) {
  const [data, setData] = useState<AlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "momentum" | "whale">("all");

  useEffect(() => {
    fetchAlerts();
    if (autoRefresh) {
      const interval = setInterval(fetchAlerts, 60000);
      return () => clearInterval(interval);
    }
  }, [lookbackHours, limit, autoRefresh]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/alerts/all?lookback_hours=${lookbackHours}&limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch alerts");
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-900/30 text-red-400 border-red-500/50";
      case "high":
        return "bg-orange-900/30 text-orange-400 border-orange-500/50";
      case "medium":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-500/50";
      case "low":
        return "bg-blue-900/30 text-blue-400 border-blue-500/50";
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-500/50";
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case "momentum":
        return "📈";
      case "whale":
        return "🐋";
      case "bridge_flow":
        return "🌉";
      default:
        return "🔔";
    }
  };

  const getAlertTypeBadge = (type: string) => {
    switch (type) {
      case "momentum":
        return "bg-blue-900/30 text-blue-400 border-blue-500/30";
      case "whale":
        return "bg-purple-900/30 text-purple-400 border-purple-500/30";
      case "bridge_flow":
        return "bg-green-900/30 text-green-400 border-green-500/30";
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-500/30";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const filteredAlerts = data?.alerts.filter((alert) => {
    if (filter === "all") return true;
    return alert.alert_type === filter;
  }) || [];

  if (loading && !data) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        <div className="text-gray-400">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Active Alerts
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {filteredAlerts.length} alerts
            </span>
            {autoRefresh && (
              <span className="text-xs text-gray-500">• Auto-refresh</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-gray-400 hover:bg-slate-600"
            }`}
          >
            All ({data?.total_alerts || 0})
          </button>
          <button
            onClick={() => setFilter("momentum")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === "momentum"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-gray-400 hover:bg-slate-600"
            }`}
          >
            📈 Momentum ({data?.momentum_count || 0})
          </button>
          <button
            onClick={() => setFilter("whale")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === "whale"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-gray-400 hover:bg-slate-600"
            }`}
          >
            🐋 Whale ({data?.whale_count || 0})
          </button>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No alerts found for the selected filter
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.alert_id}
                className="p-4 hover:bg-slate-700/30 transition cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getAlertTypeIcon(alert.alert_type)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold border ${getAlertTypeBadge(
                          alert.alert_type
                        )}`}
                      >
                        {alert.alert_type.replace(/_/g, " ").toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(alert.timestamp)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1">
                      {alert.title}
                    </h3>

                    <p className="text-sm text-gray-300 mb-2">{alert.message}</p>

                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Asset:</span>
                        <span className="text-white font-semibold">{alert.asset}</span>
                      </div>

                      {alert.pretrend_prob !== undefined && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Pre-Trend:</span>
                          <span className="text-blue-400 font-semibold">
                            {(alert.pretrend_prob * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}

                      {alert.trend_score !== undefined && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">TrendScore:</span>
                          <span className="text-purple-400 font-semibold">
                            {alert.trend_score.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {alert.action && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Action:</span>
                          <span className="text-green-400 font-semibold">
                            {alert.action}
                          </span>
                        </div>
                      )}

                      {alert.value_usd !== undefined && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Value:</span>
                          <span className="text-yellow-400 font-semibold">
                            ${(alert.value_usd / 1_000_000).toFixed(2)}M
                          </span>
                        </div>
                      )}

                      {alert.chain && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Chain:</span>
                          <span className="text-cyan-400 font-semibold capitalize">
                            {alert.chain}
                          </span>
                        </div>
                      )}

                      {alert.tx_hash && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Tx:</span>
                          <span className="text-gray-400 font-mono text-xs">
                            {alert.tx_hash.slice(0, 10)}...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-700 text-center text-xs text-gray-500">
        Last updated: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : "N/A"}
        {autoRefresh && " • Refreshes every 60s"}
      </div>
    </div>
  );
}
