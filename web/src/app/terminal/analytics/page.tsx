'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
;

import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, Clock } from 'lucide-react';
import {
  RiskIndexCard,
  WhaleActivityCard,
  EntitySummaryCard,
  AnomalyFeedCard,
  MarketTrendsGraph,
  GlobalHeatMapDemo,
  NarrativeInsightPanel,
} from '@/components/analytics';

const REFRESH_INTERVAL = 12000; // 12 seconds

export default function AnalyticsDashboardPage() {
  const [showGuide, setShowGuide] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshToken(t => t + 1);
      setLastRefresh(new Date());
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 1000);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshToken(t => t + 1);
    setLastRefresh(new Date());
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatLastRefresh = () => {
    return lastRefresh.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900/20 to-cyan-800/20 border border-cyan-500/30 rounded-lg p-6">
        <TerminalBackButton className="mb-4" />
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">Analytics Dashboard</h1>
              <p className="text-gray-400">Real-time market intelligence and threat analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Last update: {formatLastRefresh()}</span>
            </div>
            <button
              onClick={handleManualRefresh}
              className={`p-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg transition-all ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5 text-cyan-400" />
            </button>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-full border border-cyan-500/30">
              DEMO MODE
            </span>
          </div>
        </div>
      </div>

      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RiskIndexCard refreshToken={refreshToken} />
        <WhaleActivityCard refreshToken={refreshToken} />
        <EntitySummaryCard refreshToken={refreshToken} />
      </div>

      {/* Middle Row - Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketTrendsGraph refreshToken={refreshToken} />
        <GlobalHeatMapDemo refreshToken={refreshToken} />
      </div>

      {/* Bottom Row - Feed and Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnomalyFeedCard refreshToken={refreshToken} />
        <NarrativeInsightPanel refreshToken={refreshToken} />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-cyan-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Auto-refreshing every {REFRESH_INTERVAL / 1000} seconds</span>
        </div>
        <p className="text-xs text-gray-500">
          All data shown is synthetic demo data for demonstration purposes only.
        </p>
      </div>
    
      {/* Module Guide Panel */}
      <ModuleGuide
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        content={getModuleGuideContent('Analytics Dashboard')}
      />
    </div>
  );
}
