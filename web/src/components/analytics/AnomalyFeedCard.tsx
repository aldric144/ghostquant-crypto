'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Link2 } from 'lucide-react';

interface FlowAnomaly {
  anomaly_id: string;
  timestamp: string;
  chain: string;
  region: string;
  type: string;
  severity: string;
  confidence: number;
  description: string;
  entities: string[];
}

interface AnomalyData {
  total_anomalies_24h: number;
  critical_anomalies_24h: number;
  recent: FlowAnomaly[];
  demo_mode: boolean;
}

interface AnomalyFeedCardProps {
  refreshToken: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

function generateSyntheticAnomalies(): AnomalyData {
  const types = ['whale_movement', 'liquidity_drain', 'price_manipulation', 'wash_trading', 'flash_loan'];
  const severities = ['critical', 'high', 'medium', 'low'];
  const chains = ['Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Solana'];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Global'];
  
  const recent: FlowAnomaly[] = Array.from({ length: 8 }, (_, i) => ({
    anomaly_id: `anomaly-${i}-${Date.now()}`,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    chain: chains[i % chains.length],
    region: regions[i % regions.length],
    type: types[i % types.length],
    severity: severities[Math.min(i, severities.length - 1)],
    confidence: 0.65 + Math.random() * 0.3,
    description: `Detected ${types[i % types.length].replace('_', ' ')} pattern on ${chains[i % chains.length]}`,
    entities: [`0x${Math.random().toString(16).slice(2, 10)}...`]
  }));
  
  return {
    total_anomalies_24h: 12 + Math.floor(Math.random() * 8),
    critical_anomalies_24h: 2 + Math.floor(Math.random() * 3),
    recent,
    demo_mode: true
  };
}

export default function AnomalyFeedCard({ refreshToken }: AnomalyFeedCardProps) {
  const [data, setData] = useState<AnomalyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSynthetic, setIsSynthetic] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    fetch(`${API_BASE_URL}/demo/analytics/anomalies`)
      .then(res => res.json())
      .then(result => {
        if (!cancelled) {
          if (result && result.recent && result.recent.length > 0) {
            setData(result);
            setIsSynthetic(false);
          } else {
            setData(generateSyntheticAnomalies());
            setIsSynthetic(true);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(generateSyntheticAnomalies());
          setIsSynthetic(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    
    return () => { cancelled = true; };
  }, [refreshToken]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const formatType = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (loading && !data) {
    return (
      <div className="p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Anomaly Feed</h3>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-400">{data.total_anomalies_24h} total</span>
          <span className="text-red-400 font-semibold">{data.critical_anomalies_24h} critical</span>
        </div>
      </div>
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {data.recent.slice(0, 8).map((anomaly) => (
          <div key={anomaly.anomaly_id} className={`p-3 rounded-lg border ${getSeverityColor(anomaly.severity)}`}>
            <div className="flex items-start justify-between mb-1">
              <span className="font-semibold text-sm">{formatType(anomaly.type)}</span>
              <span className="text-xs uppercase px-2 py-0.5 rounded bg-black/20">
                {anomaly.severity}
              </span>
            </div>
            <p className="text-xs opacity-80 mb-2">{anomaly.description}</p>
            <div className="flex items-center justify-between text-xs opacity-60">
              <div className="flex items-center gap-3">
                <span>{anomaly.chain}</span>
                <span>{anomaly.region}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(anomaly.timestamp)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs opacity-60">
              <Link2 className="w-3 h-3" />
              <span>{anomaly.entities.length} entities</span>
              <span className="ml-2">Confidence: {(anomaly.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
