"use client";

import { TimelineDataPoint } from "@/lib/threatMapClient";

interface ThreatTimelineProps {
  data: TimelineDataPoint[];
}

export default function ThreatTimeline({ data }: ThreatTimelineProps) {
  const maxRisk = Math.max(...data.map((d) => d.overall_risk), 100);
  const maxThreats = Math.max(...data.map((d) => d.threat_count), 1);

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getBarColor = (risk: number) => {
    if (risk >= 80) return "bg-red-500";
    if (risk >= 60) return "bg-orange-500";
    if (risk >= 40) return "bg-yellow-500";
    if (risk >= 20) return "bg-green-500";
    return "bg-blue-500";
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">AI Threat Timeline</h3>
        <p className="text-sm text-gray-400">Historical risk analysis</p>
      </div>

      <div className="p-4">
        <div className="flex items-end gap-1 h-48">
          {data.slice(-24).map((point, index) => {
            const height = (point.overall_risk / maxRisk) * 100;
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group relative"
              >
                <div
                  className={`w-full rounded-t transition-all duration-300 ${getBarColor(point.overall_risk)} hover:opacity-80`}
                  style={{ height: `${height}%` }}
                ></div>
                
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                  <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs whitespace-nowrap">
                    <div className="text-white font-semibold">{formatTime(point.timestamp)}</div>
                    <div className="text-gray-400">Risk: {point.overall_risk.toFixed(0)}</div>
                    <div className="text-gray-400">Threats: {point.threat_count}</div>
                    <div className="text-red-400">Critical: {point.critical_count}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{data.length > 0 ? formatTime(data[0].timestamp) : ""}</span>
          <span>{data.length > 0 ? formatTime(data[data.length - 1].timestamp) : ""}</span>
        </div>
      </div>

      <div className="p-4 border-t border-slate-700">
        <div className="grid grid-cols-5 gap-2">
          {["whales", "manipulation", "darkpool", "stablecoin", "derivatives"].map((cat) => {
            const latestValue = data.length > 0 ? data[data.length - 1].categories[cat as keyof typeof data[0]["categories"]] : 0;
            return (
              <div key={cat} className="text-center">
                <div className="text-xs text-gray-500 capitalize">{cat}</div>
                <div className={`text-sm font-semibold ${
                  latestValue >= 60 ? "text-red-400" : 
                  latestValue >= 40 ? "text-yellow-400" : "text-green-400"
                }`}>
                  {latestValue.toFixed(0)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
