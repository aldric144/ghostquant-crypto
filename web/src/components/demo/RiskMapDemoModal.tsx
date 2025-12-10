'use client';

import React, { useState, useEffect } from 'react';
import { X, Map, AlertTriangle, Globe, Activity, Shield, Zap, Server } from 'lucide-react';

interface RiskMapData {
  constellation: {
    timestamp: string;
    total_entities: number;
    threat_clusters: Array<{
      name: string;
      type: string;
      entities: number;
      risk: number;
    }>;
    supernovas: number;
    wormholes: number;
    nebulas: number;
    global_risk_level: number;
    regions: Record<string, { threat_level: number; entities: number }>;
  };
  hydra_detection: {
    detection_id: string;
    attack_type: string;
    severity: string;
    confidence: number;
    relay_chain: string[];
    coordination_score: number;
    entities_involved: number;
    recommendation: string;
  };
  sentinel_status: {
    timestamp: string;
    active_alerts: number;
    critical_alerts: number;
    high_alerts: number;
    medium_alerts: number;
    low_alerts: number;
    system_health: number;
    uptime: number;
  };
  chain_metrics: Array<{
    chain_name: string;
    threat_level: number;
    active_threats: number;
    monitored_entities: number;
    network_health: number;
    congestion_level: string;
  }>;
  global_summary: {
    global_risk_level: number;
    total_monitored_entities: number;
    active_threat_clusters: number;
    supernovas_detected: number;
    wormholes_active: number;
    nebulas_forming: number;
    system_health: number;
    system_uptime: number;
    total_active_alerts: number;
    critical_alerts: number;
    high_alerts: number;
    chains_monitored: number;
    total_chain_threats: number;
    average_chain_threat_level: number;
  };
  threat_overview: {
    latest_hydra_detection: {
      attack_type: string;
      severity: string;
      confidence: number;
      entities_involved: number;
      coordination_score: number;
      recommendation: string;
    };
    regional_threats: Record<string, {
      threat_level: number;
      entities_at_risk: number;
      status: string;
    }>;
    top_threat_clusters: Array<{
      name: string;
      type: string;
      risk: number;
      entities: number;
    }>;
    chain_status: Array<{
      chain: string;
      threat_level: number;
      active_threats: number;
      network_health: number;
      congestion: string;
    }>;
  };
  demo_mode: boolean;
}

interface RiskMapDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

export default function RiskMapDemoModal({ isOpen, onClose }: RiskMapDemoModalProps) {
  const [data, setData] = useState<RiskMapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRiskMap();
    }
  }, [isOpen]);

  const fetchRiskMap = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/demo/riskmap`);
      if (!response.ok) throw new Error('Failed to fetch risk map');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getRiskColor = (level: number) => {
    if (level >= 70) return 'text-red-400';
    if (level >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'elevated': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'normal': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-slate-900/95 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Map className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Global Risk Map Demo</h2>
              <p className="text-sm text-gray-400">Synthetic threat visualization for demonstration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400">{error}</p>
              <button
                onClick={fetchRiskMap}
                className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {data && !loading && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-400">Global Risk</span>
                  </div>
                  <span className={`text-3xl font-bold ${getRiskColor(data.global_summary.global_risk_level)}`}>
                    {data.global_summary.global_risk_level}
                  </span>
                  <span className="text-gray-400">/100</span>
                </div>
                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-400">Active Alerts</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-400">
                    {data.global_summary.total_active_alerts}
                  </span>
                  <span className="text-red-400 text-sm ml-2">({data.global_summary.critical_alerts} critical)</span>
                </div>
                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-400">System Health</span>
                  </div>
                  <span className="text-2xl font-bold text-green-400">
                    {(data.global_summary.system_health * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-400">Monitored Entities</span>
                  </div>
                  <span className="text-2xl font-bold text-cyan-400">
                    {data.global_summary.total_monitored_entities.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 border border-orange-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">Latest Hydra Detection</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-400">Attack Type</span>
                    <p className="text-white font-semibold">{data.threat_overview.latest_hydra_detection.attack_type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Severity</span>
                    <p className={`font-semibold capitalize ${data.threat_overview.latest_hydra_detection.severity === 'critical' ? 'text-red-400' : 'text-orange-400'}`}>
                      {data.threat_overview.latest_hydra_detection.severity}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Confidence</span>
                    <p className="text-cyan-400 font-semibold">{(data.threat_overview.latest_hydra_detection.confidence * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Entities Involved</span>
                    <p className="text-white font-semibold">{data.threat_overview.latest_hydra_detection.entities_involved}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Regional Threats</h3>
                  <div className="space-y-3">
                    {Object.entries(data.threat_overview.regional_threats).map(([region, info]) => (
                      <div key={region} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                        <span className="text-gray-300">{region}</span>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm ${getRiskColor(info.threat_level)}`}>
                            {info.threat_level}/100
                          </span>
                          <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(info.status)}`}>
                            {info.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Threat Clusters</h3>
                  <div className="space-y-3">
                    {data.threat_overview.top_threat_clusters.map((cluster, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                        <div>
                          <span className="text-gray-300">{cluster.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({cluster.type})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 text-sm">{cluster.entities} entities</span>
                          <span className={`font-semibold ${getRiskColor(cluster.risk)}`}>
                            {cluster.risk}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Chain Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {data.threat_overview.chain_status.map((chain, idx) => (
                    <div key={idx} className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">{chain.chain}</span>
                        <span className={`text-sm font-bold ${getRiskColor(chain.threat_level)}`}>
                          {chain.threat_level}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Threats</span>
                          <span className="text-orange-400">{chain.active_threats}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Health</span>
                          <span className="text-green-400">{(chain.network_health * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Congestion</span>
                          <span className={`capitalize ${chain.congestion === 'high' ? 'text-red-400' : chain.congestion === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                            {chain.congestion}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                  <span className="text-3xl font-bold text-red-400">{data.global_summary.supernovas_detected}</span>
                  <p className="text-sm text-gray-400 mt-1">Supernovas</p>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
                  <span className="text-3xl font-bold text-purple-400">{data.global_summary.wormholes_active}</span>
                  <p className="text-sm text-gray-400 mt-1">Wormholes</p>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
                  <span className="text-3xl font-bold text-blue-400">{data.global_summary.nebulas_forming}</span>
                  <p className="text-sm text-gray-400 mt-1">Nebulas</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-cyan-400" />
                  <span className="text-cyan-400 font-semibold">Demo Mode Active</span>
                </div>
                <button
                  onClick={fetchRiskMap}
                  className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
                >
                  Refresh Risk Map
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
