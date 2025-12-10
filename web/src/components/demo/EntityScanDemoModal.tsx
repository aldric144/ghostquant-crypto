'use client';

import React, { useState, useEffect } from 'react';
import { X, Scan, AlertTriangle, Shield, Users, Activity, Flag } from 'lucide-react';

interface EntityScanData {
  entity: {
    address: string;
    entity_type: string;
    risk_score: number;
    confidence: number;
    first_seen: string;
    last_seen: string;
    transaction_count: number;
    total_volume: number;
    flags: string[];
    connections: number;
    cluster_id: string | null;
  };
  behavioral_dna: {
    dna_id: string;
    entity: string;
    behavioral_signature: string;
    pattern_consistency: number;
    classification: string;
    anomaly_detection: Array<{ type: string; severity: string; timestamp: string }>;
  };
  actor_profile: {
    profile_id: string;
    entity: string;
    actor_type: string;
    risk_category: string;
    threat_level: number;
    behavioral_traits: string[];
    known_associations: string[];
    recommendation: string;
  };
  fusion_analysis: {
    fusion_id: string;
    entity: string;
    unified_risk_score: number;
    confidence: number;
    recommendation: string;
    meta_signals: Record<string, number>;
  };
  scan_summary: {
    entity_type: string;
    overall_risk: number;
    confidence: number;
    classification: string;
    threat_category: string;
    recommendation: string;
    transaction_volume: number;
    transaction_count: number;
    first_seen: string;
    last_seen: string;
    cluster_id: string | null;
    risk_factor_count: number;
    behavioral_traits: string[];
    known_associations_count: number;
  };
  risk_factors: Array<{
    factor: string;
    severity: string;
    description: string;
    score?: number;
    flags?: string[];
    count?: number;
  }>;
  demo_mode: boolean;
}

interface EntityScanDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

export default function EntityScanDemoModal({ isOpen, onClose }: EntityScanDemoModalProps) {
  const [data, setData] = useState<EntityScanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchEntityScan();
    }
  }, [isOpen]);

  const fetchEntityScan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/demo/scan`);
      if (!response.ok) throw new Error('Failed to fetch entity scan');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-slate-900/95 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Scan className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Entity Scan Demo</h2>
              <p className="text-sm text-gray-400">Synthetic entity analysis for demonstration</p>
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
                onClick={fetchEntityScan}
                className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {data && !loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-400">Risk Score</span>
                  </div>
                  <span className={`text-3xl font-bold ${getRiskColor(data.scan_summary.overall_risk)}`}>
                    {data.scan_summary.overall_risk}
                  </span>
                  <span className="text-gray-400">/100</span>
                </div>
                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-400">Confidence</span>
                  </div>
                  <span className="text-2xl font-bold text-cyan-400">
                    {(data.scan_summary.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-400">Entity Type</span>
                  </div>
                  <span className="text-lg font-semibold text-white capitalize">
                    {data.scan_summary.entity_type}
                  </span>
                </div>
                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Flag className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-400">Risk Factors</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-400">
                    {data.scan_summary.risk_factor_count}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Entity Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-400">Address</span>
                    <p className="text-white font-mono text-xs truncate">{data.entity.address}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Classification</span>
                    <p className="text-white capitalize">{data.scan_summary.classification}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Threat Category</span>
                    <p className={`capitalize font-semibold ${data.scan_summary.threat_category === 'high' ? 'text-red-400' : data.scan_summary.threat_category === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                      {data.scan_summary.threat_category}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Transactions</span>
                    <p className="text-white">{data.scan_summary.transaction_count.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Total Volume</span>
                    <p className="text-white">${data.scan_summary.transaction_volume.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Connections</span>
                    <p className="text-white">{data.entity.connections}</p>
                  </div>
                </div>
              </div>

              {data.risk_factors.length > 0 && (
                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Risk Factors</h3>
                  <div className="space-y-3">
                    {data.risk_factors.map((factor, idx) => (
                      <div key={idx} className={`p-3 border rounded-lg ${getSeverityColor(factor.severity)}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">{factor.factor}</span>
                          <span className="text-xs uppercase px-2 py-1 rounded bg-black/20">
                            {factor.severity}
                          </span>
                        </div>
                        <p className="text-sm opacity-80">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.entity.flags.length > 0 && (
                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Entity Flags</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.entity.flags.map((flag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm">
                        {flag.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Behavioral Traits</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.scan_summary.behavioral_traits.map((trait, idx) => (
                      <span key={idx} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full text-sm">
                        {trait.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Fusion Signals</h3>
                  <div className="space-y-2">
                    {Object.entries(data.fusion_analysis.meta_signals).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-gray-400 capitalize text-sm">{key.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${value > 70 ? 'bg-red-500' : value > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <span className="text-white text-sm w-8">{value.toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-cyan-400" />
                  <span className="text-cyan-400 font-semibold">Demo Mode Active</span>
                </div>
                <button
                  onClick={fetchEntityScan}
                  className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
                >
                  Scan New Entity
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
