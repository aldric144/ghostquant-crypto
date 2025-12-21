"use client";

import { NarrativeData } from "./index";

interface NarrativePanelProps {
  data: NarrativeData | null;
  isLoading: boolean;
  compact?: boolean;
  onViewMore?: () => void;
}

export default function NarrativePanel({ data, isLoading, compact, onViewMore }: NarrativePanelProps) {
  if (isLoading || !data) {
    return (
      <div className={`bg-slate-800/50 rounded-xl border border-cyan-500/20 p-6 ${compact ? "" : "min-h-[300px]"}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "text-green-400 bg-green-500/20";
      case "bearish":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case "up":
        return "↑";
      case "down":
        return "↓";
      default:
        return "→";
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case "up":
        return "text-green-400";
      case "down":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className={`bg-slate-800/50 rounded-xl border border-cyan-500/20 p-6 ${compact ? "" : "min-h-[300px]"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">AI Narrative Engine</h3>
        </div>
        {compact && onViewMore && (
          <button onClick={onViewMore} className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
            View More →
          </button>
        )}
      </div>

      {/* Main Summary */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-indigo-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{data.summary}</p>
        </div>
      </div>

      {compact ? (
        // Compact view - just show topics
        <div className="flex flex-wrap gap-2">
          {data.topics.slice(0, 4).map((topic) => (
            <div key={topic.topic} className={`px-3 py-1.5 rounded-full text-xs ${getSentimentColor(topic.sentiment)}`}>
              {topic.topic}
            </div>
          ))}
        </div>
      ) : (
        // Full view
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Topics */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Key Topics</h4>
            <div className="space-y-2">
              {data.topics.map((topic) => (
                <div key={topic.topic} className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{topic.topic}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getSentimentColor(topic.sentiment)}`}>{topic.sentiment}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-600 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${topic.relevance * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trends */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Market Trends</h4>
            <div className="space-y-2">
              {data.trends.map((trend) => (
                <div key={trend.trend} className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${getDirectionColor(trend.direction)}`}>{getDirectionIcon(trend.direction)}</span>
                    <span className="text-sm text-white">{trend.trend}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${trend.impact * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-400">{(trend.impact * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">AI Insights</h4>
            <div className="space-y-2">
              {data.insights.map((insight, i) => (
                <div key={i} className="bg-slate-700/50 rounded-lg p-3 flex items-start gap-2">
                  <div className="w-5 h-5 bg-cyan-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-cyan-400">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-300">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
