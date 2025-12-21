"use client";

import { memo } from "react";

interface SuggestedQueriesProps {
  onQuerySelect: (query: string) => void;
}

const SUGGESTED_QUERIES = [
  {
    label: "Summarize the last 10 minutes",
    query: "Summarize the last 10 minutes of intelligence data",
    icon: "clock",
  },
  {
    label: "Show current manipulation risks",
    query: "Show current manipulation risks across all chains",
    icon: "alert",
  },
  {
    label: "Explain today's whale flows",
    query: "Explain today's whale flows and large transactions",
    icon: "whale",
  },
  {
    label: "Which entities are most active?",
    query: "Which entities are most active in the last 24 hours?",
    icon: "users",
  },
  {
    label: "What rings are forming right now?",
    query: "What manipulation rings are forming right now?",
    icon: "ring",
  },
  {
    label: "What chain has the highest risk?",
    query: "What chain has the highest risk level currently?",
    icon: "chain",
  },
  {
    label: "Today's cross-chain threats",
    query: "Analyze today's cross-chain threats and suspicious bridge activity",
    icon: "bridge",
  },
];

const IconComponent = memo(function IconComponent({ icon }: { icon: string }) {
  switch (icon) {
    case "clock":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "alert":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case "whale":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case "users":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case "ring":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12a3 3 0 106 0 3 3 0 00-6 0z" />
        </svg>
      );
    case "chain":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    case "bridge":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
    default:
      return null;
  }
});

function SuggestedQueries({ onQuerySelect }: SuggestedQueriesProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Suggested Queries</h3>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUERIES.map((item, index) => (
          <button
            key={index}
            onClick={() => onQuerySelect(item.query)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 rounded-lg text-sm text-gray-300 hover:text-white transition-all group"
          >
            <span className="text-cyan-500 group-hover:text-cyan-400">
              <IconComponent icon={item.icon} />
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(SuggestedQueries);
