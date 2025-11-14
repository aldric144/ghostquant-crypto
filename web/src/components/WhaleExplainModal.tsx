"use client";

import { useEffect, useState } from "react";
import { X, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";

interface Driver {
  type: string;
  desc: string;
  value: string | number;
  unit: string;
  time: string;
}

interface WhaleExplainData {
  symbol: string;
  summary: string;
  confidence: number;
  drivers: Driver[];
  source: string[];
  raw?: any;
}

interface WhaleExplainModalProps {
  symbol: string;
  onClose: () => void;
}

export default function WhaleExplainModal({ symbol, onClose }: WhaleExplainModalProps) {
  const [data, setData] = useState<WhaleExplainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    const fetchExplanation = async () => {
      try {
        if (typeof window !== 'undefined' && (window as any).analytics) {
          (window as any).analytics.track('whale_explain_opened', { symbol });
        }

        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
        const response = await fetch(`${apiBase}/insights/whale-explain?symbol=${symbol}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const explainData = await response.json();
        setData(explainData);
        setError(null);
      } catch (err) {
        console.error('Error fetching whale explanation:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch explanation');
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [symbol]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400 bg-green-400/10 border-green-400/30';
    if (confidence >= 60) return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    return 'text-red-400 bg-red-400/10 border-red-400/30';
  };

  const getDriverIcon = (type: string) => {
    switch (type) {
      case 'onchain_transfer':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'volume_spike':
        return <TrendingUp className="w-4 h-4" />;
      case 'orderbook_imbalance':
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
      return `${Math.floor(diffMins / 1440)}d ago`;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full md:max-w-2xl bg-slate-900 border border-slate-700 rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whale-explain-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
          <div>
            <h2 id="whale-explain-title" className="text-2xl font-bold text-white">
              Whale Activity: {symbol}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Click for explanation — why this asset shows whale activity
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
              <p className="text-red-400 mb-4">Unable to fetch explanation: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {data && (
            <>
              {/* Summary */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <p className="text-lg text-gray-200 leading-relaxed">
                  {data.summary}
                </p>
              </div>

              {/* Confidence */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Confidence:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getConfidenceColor(data.confidence)}`}>
                    {data.confidence}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Source:</span>
                  {data.source.map((src, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400">
                      {src}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top Drivers */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Top Drivers</h3>
                <div className="space-y-3">
                  {data.drivers.map((driver, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          {getDriverIcon(driver.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-white">{driver.desc}</span>
                            <span className="text-sm text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(driver.time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-blue-400">
                              {typeof driver.value === 'number' ? driver.value.toLocaleString() : driver.value}
                            </span>
                            <span className="text-sm text-gray-400">{driver.unit}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Data Toggle */}
              <div>
                <button
                  onClick={() => setShowRaw(!showRaw)}
                  className="text-sm text-blue-400 hover:text-blue-300 underline"
                >
                  {showRaw ? 'Hide' : 'Show'} Raw Data (Developer View)
                </button>
                {showRaw && data.raw && (
                  <pre className="mt-2 bg-slate-950 border border-slate-700 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(data.raw, null, 2)}
                  </pre>
                )}
              </div>

              {/* CTA Links */}
              <div className="flex gap-3">
                <a
                  href={`/ecoscan?symbol=${symbol}`}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-center font-medium transition-colors"
                >
                  View on Ecoscan
                </a>
                <a
                  href={`/alphabrain?symbol=${symbol}`}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-center font-medium transition-colors"
                >
                  View on AlphaBrain
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
