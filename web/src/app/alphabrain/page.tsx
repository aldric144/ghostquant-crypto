'use client';

import { useEffect, useState } from 'react';

interface RegimeData {
  regime: string;
  confidence: number;
  exposure_multiplier: number;
  interpretation: string;
  macro_data: {
    vix: number;
    dxy: number;
    yield_spread: number;
    spy_momentum: number;
  };
}

interface TopPick {
  symbol: string;
  weight: number;
  smart_beta_score: number;
  rationale: string;
}

interface PortfolioMetrics {
  expected_return: number;
  volatility: number;
  sharpe: number;
  max_weight: number;
  herfindahl_index: number;
  effective_n_assets: number;
}

interface AlphaBrainSummary {
  regime: RegimeData;
  portfolio: {
    weights: Record<string, number>;
    metrics: PortfolioMetrics;
    top_picks: TopPick[];
  };
  playbook_recommendation: {
    primary_strategy: string;
    rationale: string;
  };
  narrative: {
    n_narratives: number;
    avg_sentiment: number;
    overall_tone: string;
  };
}

export default function AlphaBrainPage() {
  const [summary, setSummary] = useState<AlphaBrainSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/alphabrain/summary');
      if (!response.ok) throw new Error('Failed to fetch AlphaBrain summary');
      const data = await response.json();
      setSummary(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">Loading AlphaBrain...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">No data available</div>
      </div>
    );
  }

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'risk_on': return 'text-green-400';
      case 'risk_off': return 'text-orange-400';
      case 'crisis': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSentimentColor = (tone: string) => {
    switch (tone) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-400">AlphaBrain Intelligence</h1>
        <div className="text-sm text-gray-400">
          Institutional-Grade Quant Analytics
        </div>
      </div>

      {/* Macro Regime */}
      <div className="bg-slate-800 border border-blue-900/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-300 mb-4">Macro Regime</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Classification:</span>
                <span className={`text-lg font-bold ${getRegimeColor(summary.regime.regime)}`}>
                  {summary.regime.regime.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Confidence:</span>
                <span className="text-white font-semibold">
                  {(summary.regime.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Exposure Multiplier:</span>
                <span className="text-white font-semibold">
                  {summary.regime.exposure_multiplier.toFixed(2)}x
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-300 bg-slate-900 p-4 rounded">
              {summary.regime.interpretation}
            </div>
          </div>
        </div>
        
        {summary.regime.macro_data && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-3 rounded">
              <div className="text-xs text-gray-400">VIX</div>
              <div className="text-lg font-semibold text-white">
                {summary.regime.macro_data.vix.toFixed(1)}
              </div>
            </div>
            <div className="bg-slate-900 p-3 rounded">
              <div className="text-xs text-gray-400">DXY</div>
              <div className="text-lg font-semibold text-white">
                {summary.regime.macro_data.dxy.toFixed(1)}
              </div>
            </div>
            <div className="bg-slate-900 p-3 rounded">
              <div className="text-xs text-gray-400">Yield Spread</div>
              <div className="text-lg font-semibold text-white">
                {summary.regime.macro_data.yield_spread.toFixed(2)}%
              </div>
            </div>
            <div className="bg-slate-900 p-3 rounded">
              <div className="text-xs text-gray-400">SPY Momentum</div>
              <div className="text-lg font-semibold text-white">
                {(summary.regime.macro_data.spy_momentum * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Portfolio Recommendation */}
      <div className="bg-slate-800 border border-blue-900/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-300 mb-4">Portfolio Recommendation</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 p-4 rounded">
            <div className="text-sm text-gray-400">Expected Return</div>
            <div className="text-2xl font-bold text-green-400">
              {(summary.portfolio.metrics.expected_return * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-slate-900 p-4 rounded">
            <div className="text-sm text-gray-400">Volatility</div>
            <div className="text-2xl font-bold text-orange-400">
              {(summary.portfolio.metrics.volatility * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-slate-900 p-4 rounded">
            <div className="text-sm text-gray-400">Sharpe Ratio</div>
            <div className="text-2xl font-bold text-blue-400">
              {summary.portfolio.metrics.sharpe.toFixed(2)}
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-blue-200 mb-3">Top Picks</h3>
        <div className="space-y-2">
          {summary.portfolio.top_picks.map((pick, idx) => (
            <div key={idx} className="bg-slate-900 p-4 rounded flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-gray-500">#{idx + 1}</div>
                <div>
                  <div className="text-lg font-semibold text-white">{pick.symbol}</div>
                  <div className="text-sm text-gray-400">{pick.rationale}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-400">
                  {(pick.weight * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">
                  Score: {pick.smart_beta_score.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Institutional Playbook */}
      <div className="bg-slate-800 border border-blue-900/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-300 mb-4">Institutional Playbook</h2>
        <div className="bg-slate-900 p-4 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Recommended Strategy:</span>
            <span className="text-lg font-bold text-yellow-400">
              {summary.playbook_recommendation.primary_strategy?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="text-sm text-gray-300 mt-3">
            {summary.playbook_recommendation.rationale}
          </div>
        </div>
      </div>

      {/* Narrative Analysis */}
      <div className="bg-slate-800 border border-blue-900/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-300 mb-4">Narrative Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-4 rounded">
            <div className="text-sm text-gray-400">Narratives Tracked</div>
            <div className="text-2xl font-bold text-white">
              {summary.narrative.n_narratives}
            </div>
          </div>
          <div className="bg-slate-900 p-4 rounded">
            <div className="text-sm text-gray-400">Avg Sentiment</div>
            <div className="text-2xl font-bold text-white">
              {summary.narrative.avg_sentiment.toFixed(2)}
            </div>
          </div>
          <div className="bg-slate-900 p-4 rounded">
            <div className="text-sm text-gray-400">Overall Tone</div>
            <div className={`text-2xl font-bold ${getSentimentColor(summary.narrative.overall_tone)}`}>
              {summary.narrative.overall_tone.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Metrics */}
      <div className="bg-slate-800 border border-blue-900/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-300 mb-4">Risk Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-3 rounded">
            <div className="text-sm text-gray-400">Max Weight</div>
            <div className="text-lg font-semibold text-white">
              {(summary.portfolio.metrics.max_weight * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-slate-900 p-3 rounded">
            <div className="text-sm text-gray-400">Concentration</div>
            <div className="text-lg font-semibold text-white">
              {summary.portfolio.metrics.herfindahl_index.toFixed(3)}
            </div>
          </div>
          <div className="bg-slate-900 p-3 rounded">
            <div className="text-sm text-gray-400">Effective N Assets</div>
            <div className="text-lg font-semibold text-white">
              {summary.portfolio.metrics.effective_n_assets.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
