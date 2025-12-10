'use client';

import React, { useState, useEffect } from 'react';
import { X, TrendingUp, AlertTriangle, Activity, Brain, Target } from 'lucide-react';

interface PredictionData {
  prediction: {
    prediction_id: string;
    timestamp: string;
    entity: string;
    prediction_type: string;
    risk_level: string;
    confidence: number;
    timeframe: string;
    indicators: Array<{ name: string; value: number }>;
    recommendation: string;
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
    recommendation: string;
  };
  forecast_summary: {
    risk_trajectory: string;
    confidence_score: number;
    behavioral_classification: string;
    threat_level: number;
    recommended_action: string;
    timeframe: string;
    key_indicators: Array<{ name: string; severity: string }>;
    pattern_consistency: number;
    anomaly_count: number;
  };
  demo_mode: boolean;
}

interface PredictionDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

export default function PredictionDemoModal({ isOpen, onClose }: PredictionDemoModalProps) {
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPrediction();
    }
  }, [isOpen]);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/demo/predict`);
      if (!response.ok) throw new Error('Failed to fetch prediction');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-cyan-400 bg-cyan-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-slate-900/95 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Behavioral Prediction Demo</h2>
              <p className="text-sm text-gray-400">Synthetic forecast data for demonstration</p>
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
                onClick={fetchPrediction}
                className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {data && !loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-400">Risk Trajectory</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(data.forecast_summary.risk_trajectory)}`}>
                    {data.forecast_summary.risk_trajectory.toUpperCase()}
                  </span>
                </div>
                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-400">Confidence</span>
                  </div>
                  <span className="text-2xl font-bold text-cyan-400">
                    {(data.forecast_summary.confidence_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-400">Classification</span>
                  </div>
                  <span className="text-lg font-semibold text-white capitalize">
                    {data.forecast_summary.behavioral_classification}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Prediction Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-400">Entity</span>
                    <p className="text-white font-mono text-xs truncate">{data.prediction.entity}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Type</span>
                    <p className="text-white capitalize">{data.prediction.prediction_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Timeframe</span>
                    <p className="text-white">{data.prediction.timeframe}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Recommendation</span>
                    <p className="text-cyan-400 font-semibold">{data.prediction.recommendation}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Key Indicators</h3>
                <div className="space-y-2">
                  {data.forecast_summary.key_indicators.map((indicator, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                      <span className="text-gray-300 capitalize">{indicator.name.replace('_', ' ')}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(indicator.severity)}`}>
                        {indicator.severity.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Behavioral DNA</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Signature</span>
                      <span className="text-cyan-400 font-mono text-sm">{data.behavioral_dna.behavioral_signature}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pattern Consistency</span>
                      <span className="text-white">{(data.behavioral_dna.pattern_consistency * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Anomalies Detected</span>
                      <span className="text-orange-400">{data.behavioral_dna.anomaly_detection.length}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Actor Profile</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Actor Type</span>
                      <span className="text-white capitalize">{data.actor_profile.actor_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Threat Level</span>
                      <span className="text-orange-400">{data.actor_profile.threat_level}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Category</span>
                      <span className={`capitalize ${data.actor_profile.risk_category === 'high' ? 'text-red-400' : data.actor_profile.risk_category === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                        {data.actor_profile.risk_category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-cyan-400" />
                  <span className="text-cyan-400 font-semibold">Demo Mode Active</span>
                </div>
                <button
                  onClick={fetchPrediction}
                  className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
                >
                  Generate New Prediction
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
