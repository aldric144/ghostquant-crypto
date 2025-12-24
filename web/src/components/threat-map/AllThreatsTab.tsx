"use client";

import { useEffect, useState } from "react";
import { ThreatEvent, fetchAllThreats, fetchRiskDashboard, fetchThreatHeatmap, RiskDashboard, ThreatHeatmapData, generateSyntheticThreats, generateSyntheticRiskDashboard, generateSyntheticHeatmap } from "@/lib/threatMapClient";
import ThreatRiskDial from "./ThreatRiskDial";
import ThreatCard from "./ThreatCard";
import ThreatHeatmap from "./ThreatHeatmap";

export default function AllThreatsTab() {
  const [threats, setThreats] = useState<ThreatEvent[]>([]);
  const [dashboard, setDashboard] = useState<RiskDashboard | null>(null);
  const [heatmapData, setHeatmapData] = useState<ThreatHeatmapData[]>([]);
  const [heatmapCategories, setHeatmapCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [threatsData, dashboardData, heatmapRes] = await Promise.all([
          fetchAllThreats({ limit: 100 }),
          fetchRiskDashboard(),
          fetchThreatHeatmap()
        ]);
        setThreats(threatsData.threats);
        setDashboard(dashboardData);
        setHeatmapData(heatmapRes.heatmap);
        setHeatmapCategories(heatmapRes.categories);
      } catch {
        // Use synthetic fallback data when API fails
        const syntheticThreats = generateSyntheticThreats();
        const syntheticDashboard = generateSyntheticRiskDashboard();
        const syntheticHeatmap = generateSyntheticHeatmap();
        setThreats(syntheticThreats.threats);
        setDashboard(syntheticDashboard);
        setHeatmapData(syntheticHeatmap.heatmap);
        setHeatmapCategories(syntheticHeatmap.categories);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredThreats = threats.filter((threat) => {
    if (severityFilter !== "all" && threat.severity !== severityFilter) return false;
    if (sourceFilter !== "all" && threat.source !== sourceFilter) return false;
    return true;
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "fear": return "text-red-400";
      case "greed": return "text-green-400";
      default: return "text-yellow-400";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return "↑";
      case "decreasing": return "↓";
      default: return "→";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "increasing": return "text-red-400";
      case "decreasing": return "text-green-400";
      default: return "text-yellow-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 flex flex-col items-center">
          <ThreatRiskDial score={dashboard?.overall_risk_score || 0} size="lg" />
          <div className="mt-2 text-sm text-gray-400">{dashboard?.threat_level || "Unknown"}</div>
          <div className={`text-xs mt-1 ${getSentimentColor(dashboard?.market_sentiment || "neutral")}`}>
            Market: {(dashboard?.market_sentiment || "neutral").toUpperCase()}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <h4 className="text-sm font-semibold text-gray-400 mb-4">Category Breakdown</h4>
          <div className="space-y-3">
            {dashboard?.categories && Object.entries(dashboard.categories).map(([key, cat]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 capitalize">{key}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${
                    cat.risk_score >= 60 ? "text-red-400" :
                    cat.risk_score >= 40 ? "text-yellow-400" : "text-green-400"
                  }`}>
                    {cat.risk_score}
                  </span>
                  <span className={`text-xs ${getTrendColor(cat.trend)}`}>
                    {getTrendIcon(cat.trend)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 col-span-1 md:col-span-2">
          <h4 className="text-sm font-semibold text-gray-400 mb-4">Critical Threats</h4>
          <div className="space-y-2">
            {dashboard?.recent_critical_threats?.slice(0, 3).map((threat) => (
              <div key={threat.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-red-900/30 text-red-400">
                    {(threat.severity || "unknown").toUpperCase()}
                  </span>
                  <span className="text-sm text-white">{threat.symbol}</span>
                  <span className="text-sm text-gray-400 capitalize">{threat.type.replace(/_/g, " ")}</span>
                </div>
                <span className="text-xs text-gray-500">{threat.source}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ThreatHeatmap data={heatmapData} categories={heatmapCategories} />

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">All Threats Feed</h3>
            <p className="text-sm text-gray-400">Aggregated from Hydra, Whale Intel, Constellation, Stablecoin, Darkpool, Derivatives</p>
          </div>
          <div className="flex gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="all">All Sources</option>
              <option value="hydra">Hydra</option>
              <option value="whales">Whales</option>
              <option value="constellation">Constellation</option>
              <option value="stablecoin">Stablecoin</option>
              <option value="darkpool">Darkpool</option>
              <option value="derivatives">Derivatives</option>
            </select>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
          {filteredThreats.map((threat) => (
            <ThreatCard key={threat.id} threat={threat} />
          ))}
        </div>
      </div>
    </div>
  );
}
