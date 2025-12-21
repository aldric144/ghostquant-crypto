"use client";

import { useState } from "react";
import AllEventsTab from "./AllEventsTab";

type TabId = "all" | "5m" | "1h" | "24h" | "7d";

interface Tab {
  id: TabId;
  label: string;
  window: string;
}

const tabs: Tab[] = [
  { id: "all", label: "All Time", window: "" },
  { id: "5m", label: "Last 5 min", window: "5m" },
  { id: "1h", label: "Last 1 hour", window: "1h" },
  { id: "24h", label: "Last 24 hours", window: "24h" },
  { id: "7d", label: "Last 7 days", window: "7d" },
];

export default function AITimeline() {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const currentWindow = tabs.find(t => t.id === activeTab)?.window || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">AI Timeline</h1>
          <p className="text-gray-400">
            Chronological intelligence event stream powered by GhostQuant AI
          </p>
        </div>

        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/25"
                    : "bg-slate-800/50 text-gray-400 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="transition-all duration-300">
          <AllEventsTab timeWindow={currentWindow} />
        </div>
      </div>
    </div>
  );
}
