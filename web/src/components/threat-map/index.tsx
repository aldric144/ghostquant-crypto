"use client";

import { useState } from "react";
import AllThreatsTab from "./AllThreatsTab";
import WhalesTab from "./WhalesTab";
import ManipulationTab from "./ManipulationTab";
import DarkpoolTab from "./DarkpoolTab";
import StablecoinTab from "./StablecoinTab";
import DerivativesTab from "./DerivativesTab";
import AITimelineTab from "./AITimelineTab";

type TabId = "all" | "whales" | "manipulation" | "darkpool" | "stablecoin" | "derivatives" | "timeline";

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: "all", label: "All Threats", icon: "🎯" },
  { id: "whales", label: "Whales", icon: "🐋" },
  { id: "manipulation", label: "Manipulation", icon: "⚠️" },
  { id: "darkpool", label: "Darkpool", icon: "🌑" },
  { id: "stablecoin", label: "Stablecoin", icon: "💵" },
  { id: "derivatives", label: "Derivatives", icon: "📊" },
  { id: "timeline", label: "AI Timeline", icon: "🤖" },
];

export default function GlobalThreatMap() {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const renderTabContent = () => {
    switch (activeTab) {
      case "all":
        return <AllThreatsTab />;
      case "whales":
        return <WhalesTab />;
      case "manipulation":
        return <ManipulationTab />;
      case "darkpool":
        return <DarkpoolTab />;
      case "stablecoin":
        return <StablecoinTab />;
      case "derivatives":
        return <DerivativesTab />;
      case "timeline":
        return <AITimelineTab />;
      default:
        return <AllThreatsTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Global Threat Map</h1>
          <p className="text-gray-400">
            Real-time threat detection and risk analysis across all market dimensions
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
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                    : "bg-slate-800/50 text-gray-400 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="transition-all duration-300">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
