"use client";

import { useState } from "react";
import RingVisualization from "./RingVisualization";

type SeverityFilter = "all" | "high" | "medium" | "low";
type TimeFilter = "all" | "5m" | "1h" | "24h";

interface Tab {
  id: string;
  label: string;
  type: "severity" | "time";
  value: SeverityFilter | TimeFilter;
}

const severityTabs: Tab[] = [
  { id: "all", label: "All Rings", type: "severity", value: "all" },
  { id: "high", label: "High Risk", type: "severity", value: "high" },
  { id: "medium", label: "Medium", type: "severity", value: "medium" },
  { id: "low", label: "Low", type: "severity", value: "low" },
];

const timeTabs: Tab[] = [
  { id: "time-all", label: "All Time", type: "time", value: "all" },
  { id: "time-5m", label: "Last 5m", type: "time", value: "5m" },
  { id: "time-1h", label: "Last 1h", type: "time", value: "1h" },
  { id: "time-24h", label: "Last 24h", type: "time", value: "24h" },
];

export default function RingDetector() {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Ring Detector</h1>
          <p className="text-gray-400">
            Real-time manipulation ring and coordinated wallet cluster detection
          </p>
        </div>

        <div className="mb-6 overflow-x-auto">
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <span className="text-sm text-gray-500 self-center mr-2">Severity:</span>
              {severityTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSeverityFilter(tab.value as SeverityFilter)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    severityFilter === tab.value
                      ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/25"
                      : "bg-slate-800/50 text-gray-400 hover:bg-slate-700/50 hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <span className="text-sm text-gray-500 self-center mr-2">Time:</span>
              {timeTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTimeFilter(tab.value as TimeFilter)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    timeFilter === tab.value
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                      : "bg-slate-800/50 text-gray-400 hover:bg-slate-700/50 hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="transition-all duration-300">
          <RingVisualization
            severityFilter={severityFilter}
            timeFilter={timeFilter}
          />
        </div>
      </div>
    </div>
  );
}
