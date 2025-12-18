'use client';

import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketData {
  global_risk_index: number;
  volatility_index: number;
  liquidity_stress: number;
  manipulation_pressure: number;
  demo_mode: boolean;
}

interface RiskIndexCardProps {
  refreshToken: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

export default function RiskIndexCard({ refreshToken }: RiskIndexCardProps) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevRisk, setPrevRisk] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    fetch(`${API_BASE_URL}/demo/analytics/market`)
      .then(res => res.json())
      .then(result => {
        if (!cancelled) {
          if (data) setPrevRisk(data.global_risk_index);
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
    if (risk >= 70) return 'text-red-400';
    if (risk >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskBgColor = (risk: number) => {
    if (risk >= 70) return 'bg-red-500/20 border-red-500/30';
    if (risk >= 40) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-green-500/20 border-green-500/30';
  };

  const getTrend = () => {
    if (prevRisk === null || !data) return null;
    const diff = data.global_risk_index - prevRisk;
    if (diff > 2) return <TrendingUp className="w-4 h-4 text-red-400" />;
    if (diff < -2) return <TrendingDown className="w-4 h-4 text-green-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  if (loading && !data) {
    return (
      <div className="p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-slate-700 rounded mb-4"></div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-12 bg-slate-700 rounded"></div>
          <div className="h-12 bg-slate-700 rounded"></div>
          <div className="h-12 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-slate-900/50 border border-red-500/30 rounded-xl">
        <p className="text-red-400 text-sm">Failed to load risk data</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Global Risk Index</h3>
        </div>
        {getTrend()}
      </div>
      
      <div className={`p-4 rounded-lg border mb-4 ${getRiskBgColor(data.global_risk_index)}`}>
        <div className="flex items-baseline gap-2">
          <span className={`text-5xl font-bold ${getRiskColor(data.global_risk_index)}`}>
            {data.global_risk_index}
          </span>
          <span className="text-gray-400">/100</span>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          {data.global_risk_index >= 70 ? 'Critical Risk Level' : 
           data.global_risk_index >= 40 ? 'Elevated Risk Level' : 'Normal Risk Level'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Volatility</p>
          <p className={`text-lg font-semibold ${getRiskColor(data.volatility_index)}`}>
            {data.volatility_index}
          </p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Liquidity</p>
          <p className={`text-lg font-semibold ${getRiskColor(data.liquidity_stress)}`}>
            {data.liquidity_stress}
          </p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Manipulation</p>
          <p className={`text-lg font-semibold ${getRiskColor(data.manipulation_pressure)}`}>
            {data.manipulation_pressure}
          </p>
        </div>
      </div>
    </div>
  );
}
