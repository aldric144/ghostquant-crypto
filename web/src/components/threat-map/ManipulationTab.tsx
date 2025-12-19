"use client";

import { useEffect, useState } from "react";
import { ManipulationAlert, fetchManipulationAlerts, fetchManipulationSummary, fetchWashTradingDetection } from "@/lib/threatMapClient";
import ThreatRiskDial from "./ThreatRiskDial";

export default function ManipulationTab() {
  const [alerts, setAlerts] = useState<ManipulationAlert[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [washTrading, setWashTrading] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [alertsData, summaryData, washData] = await Promise.all([
          fetchManipulationAlerts({ limit: 50 }),
          fetchManipulationSummary(),
          fetchWashTradingDetection({ limit: 20 })
        ]);
        setAlerts(alertsData.alerts);
        setSummary(summaryData);
        setWashTrading(washData.detections);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load manipulation data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-900/30 text-red-400 border-red-500/30";
      case "high": return "bg-orange-900/30 text-orange-400 border-orange-500/30";
      case "medium": return "bg-yellow-900/30 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-green-900/30 text-green-400 border-green-500/30";
      default: return "bg-gray-900/30 text-gray-400 border-gray-500/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "wash_trading": return "🔄";
      case "spoofing": return "👻";
      case "layering": return "📚";
      case "pump_and_dump": return "📈";
      case "front_running": return "🏃";
      default: return "⚠️";
    }
  };

  const formatVolume = (value: number) => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 flex flex-col items-center">
          <ThreatRiskDial score={summary?.risk_score || 0} label="Manipulation Risk" />
          <div className="mt-2 text-sm text-gray-400">{summary?.threat_level || "Unknown"}</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">24h Alerts</div>
          <div className="text-2xl font-bold text-white">{summary?.total_alerts_24h || 0}</div>
          <div className="text-xs text-gray-500 mt-2">Detected patterns</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">Critical Alerts</div>
          <div className="text-2xl font-bold text-red-400">{summary?.critical_alerts || 0}</div>
          <div className="text-xs text-gray-500 mt-2">Requires attention</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">Wash Trading</div>
          <div className="text-2xl font-bold text-orange-400">{washTrading.length}</div>
          <div className="text-xs text-gray-500 mt-2">Active detections</div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Manipulation Alerts</h3>
          <p className="text-sm text-gray-400">Real-time market manipulation detection</p>
        </div>

        <div className="divide-y divide-slate-700">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 hover:bg-slate-700/30 transition">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{alert.symbol}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 capitalize">{alert.type.replace(/_/g, " ")}</div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{formatTime(alert.timestamp)}</span>
              </div>

              <p className="text-sm text-gray-300 mb-3">{alert.description}</p>

              <div className="grid grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Confidence</span>
                  <div className="text-white font-semibold">{(alert.confidence * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <span className="text-gray-500">Volume Affected</span>
                  <div className="text-white font-semibold">{formatVolume(alert.volume_affected)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Addresses</span>
                  <div className="text-white font-semibold">{alert.addresses_involved}</div>
                </div>
                <div>
                  <span className="text-gray-500">Exchange</span>
                  <div className="text-white font-semibold">{alert.exchange}</div>
                </div>
              </div>

              <div className="mt-3 p-2 bg-slate-900/50 rounded text-xs text-gray-400">
                <span className="text-gray-500">Recommended:</span> {alert.recommended_action}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
