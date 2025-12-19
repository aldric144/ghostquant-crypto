"use client";

import { useEffect, useState } from "react";
import { TimelineDataPoint, fetchThreatTimeline } from "@/lib/threatMapClient";
import ThreatTimeline from "./ThreatTimeline";
import ThreatRiskDial from "./ThreatRiskDial";

export default function AITimelineTab() {
  const [timeline, setTimeline] = useState<TimelineDataPoint[]>([]);
  const [hours, setHours] = useState(24);
  const [interval, setInterval] = useState("1h");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchThreatTimeline({ hours, interval });
        setTimeline(data.timeline);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load timeline data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [hours, interval]);

  const currentRisk = timeline.length > 0 ? timeline[timeline.length - 1].overall_risk : 0;
  const avgRisk = timeline.length > 0 
    ? timeline.reduce((sum, t) => sum + t.overall_risk, 0) / timeline.length 
    : 0;
  const maxRisk = timeline.length > 0 
    ? Math.max(...timeline.map(t => t.overall_risk)) 
    : 0;
  const totalThreats = timeline.reduce((sum, t) => sum + t.threat_count, 0);
  const totalCritical = timeline.reduce((sum, t) => sum + t.critical_count, 0);

  const getRiskTrend = () => {
    if (timeline.length < 2) return "stable";
    const recent = timeline.slice(-6);
    const older = timeline.slice(-12, -6);
    const recentAvg = recent.reduce((s, t) => s + t.overall_risk, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((s, t) => s + t.overall_risk, 0) / older.length : recentAvg;
    if (recentAvg > olderAvg + 5) return "increasing";
    if (recentAvg < olderAvg - 5) return "decreasing";
    return "stable";
  };

  const trend = getRiskTrend();

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">AI Threat Timeline</h2>
          <p className="text-sm text-gray-400">Historical risk analysis powered by GhostQuant AI</p>
        </div>
        <div className="flex gap-2">
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value={6}>Last 6 hours</option>
            <option value={12}>Last 12 hours</option>
            <option value={24}>Last 24 hours</option>
            <option value={48}>Last 48 hours</option>
            <option value={168}>Last 7 days</option>
          </select>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="15m">15 min</option>
            <option value="30m">30 min</option>
            <option value="1h">1 hour</option>
            <option value="4h">4 hours</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 flex flex-col items-center">
          <ThreatRiskDial score={currentRisk} label="Current Risk" />
          <div className={`mt-2 text-sm ${
            trend === "increasing" ? "text-red-400" :
            trend === "decreasing" ? "text-green-400" : "text-yellow-400"
          }`}>
            {trend === "increasing" ? "↑ Rising" :
             trend === "decreasing" ? "↓ Falling" : "→ Stable"}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">Average Risk</div>
          <div className={`text-2xl font-bold ${
            avgRisk >= 60 ? "text-red-400" :
            avgRisk >= 40 ? "text-yellow-400" : "text-green-400"
          }`}>
            {avgRisk.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 mt-2">Over {hours}h period</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">Peak Risk</div>
          <div className={`text-2xl font-bold ${
            maxRisk >= 60 ? "text-red-400" :
            maxRisk >= 40 ? "text-yellow-400" : "text-green-400"
          }`}>
            {maxRisk.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 mt-2">Maximum recorded</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">Total Threats</div>
          <div className="text-2xl font-bold text-white">{totalThreats}</div>
          <div className="text-xs text-gray-500 mt-2">Detected events</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">Critical Events</div>
          <div className="text-2xl font-bold text-red-400">{totalCritical}</div>
          <div className="text-xs text-gray-500 mt-2">High severity</div>
        </div>
      </div>

      <ThreatTimeline data={timeline} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Category Trends</h3>
          <div className="space-y-4">
            {["whales", "manipulation", "darkpool", "stablecoin", "derivatives"].map((cat) => {
              const values = timeline.map(t => t.categories[cat as keyof typeof t.categories]);
              const current = values.length > 0 ? values[values.length - 1] : 0;
              const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
              const max = values.length > 0 ? Math.max(...values) : 0;

              return (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-300 capitalize w-24">{cat}</span>
                    <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          current >= 60 ? "bg-red-500" :
                          current >= 40 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${current}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-500">Avg: {avg.toFixed(0)}</span>
                    <span className="text-gray-500">Max: {max.toFixed(0)}</span>
                    <span className={`font-semibold ${
                      current >= 60 ? "text-red-400" :
                      current >= 40 ? "text-yellow-400" : "text-green-400"
                    }`}>
                      {current.toFixed(0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">AI Analysis</h3>
          <div className="space-y-4 text-sm text-gray-300">
            <p>
              Based on the last {hours} hours of data, the overall market risk is{" "}
              <span className={`font-semibold ${
                avgRisk >= 60 ? "text-red-400" :
                avgRisk >= 40 ? "text-yellow-400" : "text-green-400"
              }`}>
                {avgRisk >= 60 ? "elevated" : avgRisk >= 40 ? "moderate" : "low"}
              </span>
              {" "}with a {trend} trend.
            </p>
            <p>
              {totalCritical > 0 ? (
                <>
                  There have been <span className="text-red-400 font-semibold">{totalCritical} critical events</span> detected
                  during this period. Monitor positions closely and consider reducing exposure.
                </>
              ) : (
                <>
                  No critical events have been detected during this period. Market conditions appear stable
                  for normal trading activity.
                </>
              )}
            </p>
            <p>
              {trend === "increasing" ? (
                <>
                  Risk levels are <span className="text-red-400">increasing</span>. Consider implementing
                  protective measures and monitoring whale activity closely.
                </>
              ) : trend === "decreasing" ? (
                <>
                  Risk levels are <span className="text-green-400">decreasing</span>. Market conditions
                  are improving, but maintain vigilance for sudden changes.
                </>
              ) : (
                <>
                  Risk levels are <span className="text-yellow-400">stable</span>. Continue normal
                  monitoring and maintain current risk management strategies.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
