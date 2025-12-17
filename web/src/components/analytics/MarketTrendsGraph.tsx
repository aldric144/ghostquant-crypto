'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity } from 'lucide-react';

interface MarketTrendPoint {
  timestamp: string;
  risk_index: number;
}

interface MarketData {
  global_risk_index: number;
  trend_24h: MarketTrendPoint[];
  demo_mode: boolean;
}

interface MarketTrendsGraphProps {
  refreshToken: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

export default function MarketTrendsGraph({ refreshToken }: MarketTrendsGraphProps) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    fetch(`${API_BASE_URL}/demo/analytics/market`)
      .then(res => res.json())
      .then(result => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    
    return () => { cancelled = true; };
  }, [refreshToken]);

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return '#f87171';
    if (risk >= 40) return '#facc15';
    return '#4ade80';
  };

  if (loading && !data) {
    return (
      <div className="p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-40 bg-slate-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-slate-900/50 border border-red-500/30 rounded-xl">
        <p className="text-red-400 text-sm">Failed to load trend data</p>
      </div>
    );
  }

  if (!data || !data.trend_24h) return null;

  const maxRisk = Math.max(...data.trend_24h.map(p => p.risk_index));
  const minRisk = Math.min(...data.trend_24h.map(p => p.risk_index));
  const range = maxRisk - minRisk || 1;

  const points = data.trend_24h.map((point, index) => {
    const x = (index / (data.trend_24h.length - 1)) * 100;
    const y = 100 - ((point.risk_index - minRisk) / range) * 80 - 10;
    return { x, y, risk: point.risk_index };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = pathD + ` L 100 100 L 0 100 Z`;

  return (
    <div className="p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Risk Trend (24h)</h3>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>
      
      <div className="relative h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="riskGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={getRiskColor(data.global_risk_index)} stopOpacity="0.3" />
              <stop offset="100%" stopColor={getRiskColor(data.global_risk_index)} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {[20, 40, 60, 80].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
          ))}
          
          <path d={areaD} fill="url(#riskGradient)" />
          
          <path d={pathD} fill="none" stroke={getRiskColor(data.global_risk_index)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          
          {points.length > 0 && (
            <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill={getRiskColor(data.global_risk_index)} />
          )}
        </svg>
        
        <div className="absolute top-0 right-0 text-xs text-gray-500">{maxRisk}</div>
        <div className="absolute bottom-0 right-0 text-xs text-gray-500">{minRisk}</div>
      </div>

      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>24h ago</span>
        <span>12h ago</span>
        <span>Now</span>
      </div>
    </div>
  );
}
