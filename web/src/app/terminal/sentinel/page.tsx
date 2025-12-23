'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import React, { useState, useEffect } from 'react';
import { sentinel } from '@/lib/sentinelClient';
import type { SentinelDashboard, SentinelPanelStatus, SentinelAlert } from '@/lib/sentinelClient';

export default function SentinelPage() {
  const [dashboard, setDashboard] = useState<SentinelDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const response = await sentinel.getDashboard();
      
      if (response.success && response.dashboard) {
        setDashboard(response.dashboard);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch dashboard');
      }
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getThreatColor = (level: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-600',
      high: 'bg-red-500',
      elevated: 'bg-orange-500',
      moderate: 'bg-yellow-500',
      low: 'bg-green-400',
      minimal: 'bg-green-600',
    };
    return colors[level] || 'bg-gray-500';
  };

  const getPanelBorderColor = (riskScore: number) => {
    if (riskScore > 0.70) {
      return 'border-red-500 animate-pulse';
    } else if (riskScore < 0.30) {
      return 'border-green-500';
    } else {
      return 'border-cyan-500';
    }
  };

  const getAlertColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-900 border-red-700 text-red-200',
      high: 'bg-orange-900 border-orange-700 text-orange-200',
      medium: 'bg-yellow-900 border-yellow-700 text-yellow-200',
      low: 'bg-blue-900 border-blue-700 text-blue-200',
    };
    return colors[severity] || 'bg-gray-900 border-gray-700 text-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading Sentinel Command Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* LEFT PANEL - Global Overview */}
      <div className="w-80 bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto">
        <TerminalBackButton className="mb-4" />
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Sentinel Command Console</h2>

        {/* Global Threat Gauge */}
        {dashboard && dashboard.global_status && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-cyan-500">
            <h3 className="text-lg font-semibold mb-2 text-cyan-300">Global Threat Level</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl font-bold">{(dashboard.global_status.global_risk_level * 100).toFixed(1)}%</span>
              <span className={`px-3 py-1 rounded text-sm font-semibold ${getThreatColor(dashboard.global_status.threat_level)}`}>
                {dashboard.global_status.threat_level.toUpperCase()}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${dashboard.global_status.global_risk_level * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Active Engines List */}
        {dashboard && dashboard.heartbeat && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-cyan-300">Active Engines</h3>
            <div className="space-y-2">
              {dashboard.heartbeat.active_engines.map((engine, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <span className="text-sm">{engine}</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                    <span className="text-xs text-gray-400">
                      {dashboard.heartbeat.latency_map[engine]?.toFixed(0)}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fusion Score */}
        {dashboard && dashboard.global_status && (
          <div className="mb-6 p-3 bg-gray-800 rounded">
            <div className="text-sm text-gray-400 mb-1">Fusion Score</div>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-700 rounded-full h-2 mr-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${dashboard.global_status.fusion_score * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold text-cyan-400">
                {(dashboard.global_status.fusion_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {/* Hydra Heads */}
        {dashboard && dashboard.global_status && (
          <div className="mb-6 p-3 bg-gray-800 rounded">
            <div className="text-sm text-gray-400">Hydra Heads</div>
            <div className="text-3xl font-bold text-red-400">{dashboard.global_status.hydra_heads}</div>
          </div>
        )}

        {/* Constellation Clusters */}
        {dashboard && dashboard.global_status && (
          <div className="mb-6 p-3 bg-gray-800 rounded">
            <div className="text-sm text-gray-400">Constellation Clusters</div>
            <div className="text-3xl font-bold text-purple-400">{dashboard.global_status.constellation_clusters}</div>
          </div>
        )}

        {/* Top Threat Entities */}
        {dashboard && dashboard.top_threat_entities && dashboard.top_threat_entities.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-red-400">Top Threat Entities</h3>
            <div className="space-y-2">
              {dashboard.top_threat_entities.slice(0, 5).map((entity, idx) => (
                <div key={idx} className="p-2 bg-gray-800 rounded text-xs font-mono truncate">
                  {entity}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time Since Last Update */}
        {dashboard && (
          <div className="p-3 bg-gray-800 rounded text-xs">
            <div className="text-gray-400">Last Update</div>
            <div className="font-mono">{new Date(dashboard.timestamp).toLocaleTimeString()}</div>
          </div>
        )}

        {/* Live Heartbeat Card */}
        {dashboard && dashboard.heartbeat && (
          <div className="mt-4 p-3 bg-gray-800 rounded border border-green-500">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-400">System Load</span>
              <span className="text-lg font-bold text-green-400">
                {(dashboard.heartbeat.system_load * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* CENTER PANEL - Real-Time Command Console (4x2 Grid) */}
      <div className="flex-1 bg-black p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-cyan-400">Intelligence Panels</h2>

        {dashboard && dashboard.panels && (
          <div className="grid grid-cols-2 gap-4">
            {dashboard.panels.map((panel, idx) => (
              <div
                key={idx}
                className={`p-4 bg-gray-900 rounded-lg border-2 ${getPanelBorderColor(panel.risk_score)} transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-cyan-300">{panel.panel_name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    panel.status === 'operational' ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {panel.status.toUpperCase()}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-1">Risk Score</div>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-700 rounded-full h-2 mr-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          panel.risk_score > 0.70 ? 'bg-red-500' :
                          panel.risk_score > 0.40 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${panel.risk_score * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold">
                      {(panel.risk_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  {Object.entries(panel.data).slice(0, 4).map(([key, value], dataIdx) => (
                    <div key={dataIdx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-mono text-cyan-300">
                        {typeof value === 'number' ? value.toFixed(2) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  Updated: {new Date(panel.last_updated).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {!dashboard?.panels && (
          <div className="text-center text-gray-500 py-12">
            No panel data available
          </div>
        )}
      </div>

      {/* RIGHT PANEL - Live Alerts Feed */}
      <div className="w-80 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-red-400">Live Alerts Feed</h2>

        {dashboard && dashboard.alerts && dashboard.alerts.length > 0 ? (
          <div className="space-y-3">
            {dashboard.alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-3 rounded border ${getAlertColor(alert.severity)} transition-all duration-300 hover:scale-105`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    alert.severity === 'critical' ? 'bg-red-600' :
                    alert.severity === 'high' ? 'bg-orange-600' :
                    alert.severity === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-xs font-semibold mb-1 text-gray-300">
                  {alert.source_engine}
                </div>

                <div className="text-sm mb-2">
                  {alert.message}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Risk Score:</span>
                  <span className="font-bold">
                    {(alert.risk_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <div className="text-4xl mb-2">✅</div>
            <div>No active alerts</div>
            <div className="text-xs mt-2">All systems nominal</div>
          </div>
        )}

        {/* Operational Summary */}
        {dashboard && dashboard.summary && (
          <div className="mt-6 p-4 bg-gray-800 rounded border border-cyan-500">
            <h3 className="text-sm font-semibold mb-2 text-cyan-300">Operational Summary</h3>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
              {dashboard.summary}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
