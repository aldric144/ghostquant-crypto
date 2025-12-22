'use client';

/**
 * Deployment Health Dashboard
 * 
 * Layer 4: Deployment Health Dashboard
 * 
 * Protected admin route showing:
 * - Backend endpoint health table
 * - Worker status
 * - Redis status
 * - Last deployment SHA
 * - GQ-Core uptime
 * - Frontend proxy routes
 * - Real-time vs synthetic mode
 * - WebSocket status
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SourceIndicator, DataSourceBadge } from '@/components/SourceIndicator';

interface EndpointHealth {
  path: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: string;
  source: 'real' | 'synthetic';
}

interface WorkerStatus {
  running: boolean;
  pid: number;
  eventsProcessed: number;
  errors: number;
  uptime: number;
}

interface RedisStatus {
  connected: boolean;
  latency: number;
  totalEvents: number;
  lastMessage: string | null;
}

interface EngineStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
}

interface HealthData {
  backend: {
    endpoints: EndpointHealth[];
    workers: WorkerStatus;
    redis: RedisStatus;
    engines: EngineStatus[];
    lastDeploySha: string;
    uptime: number;
  };
  frontend: {
    proxyRoutes: string[];
    mode: 'real' | 'synthetic' | 'mixed';
    wsStatus: 'connected' | 'disconnected';
    lastUpdate: string;
  };
}

const GQ_CORE_ENDPOINTS = [
  '/gq-core/overview',
  '/gq-core/risk',
  '/gq-core/whales',
  '/gq-core/trends',
  '/gq-core/map',
  '/gq-core/anomalies',
  '/gq-core/entities',
  '/gq-core/narratives',
  '/gq-core/rings',
  '/gq-core/system-status',
  '/gq-core/health',
  '/gq-core/ecosystems',
  '/gq-core/ecosystems/ethereum',
];

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://ghostquant-mewzi.ondigitalocean.app';

export default function HealthDashboard() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const checkEndpointHealth = useCallback(async (path: string): Promise<EndpointHealth> => {
    const startTime = Date.now();
    try {
      const response = await fetch(`/api${path}`, { 
        method: 'GET',
        cache: 'no-store'
      });
      const responseTime = Date.now() - startTime;
      
      let source: 'real' | 'synthetic' = 'real';
      if (response.ok) {
        try {
          const data = await response.json();
          source = data.source === 'synthetic' ? 'synthetic' : 'real';
        } catch {
          // Ignore JSON parse errors
        }
      }
      
      return {
        path,
        status: response.ok ? 'healthy' : response.status >= 500 ? 'down' : 'degraded',
        responseTime,
        lastCheck: new Date().toISOString(),
        source,
      };
    } catch {
      return {
        path,
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        source: 'synthetic',
      };
    }
  }, []);

  const fetchHealthData = useCallback(async () => {
    setLoading(true);
    
    // Check all endpoints in parallel
    const endpointResults = await Promise.all(
      GQ_CORE_ENDPOINTS.map(checkEndpointHealth)
    );
    
    // Get system status
    let systemStatus = {
      websocket: { status: 'disconnected', clients: 0, latency_ms: 0 },
      worker: { status: 'stopped', pid: 0, events_processed: 0, errors: 0 },
      redis: { status: 'disconnected', latency_ms: 0, total_events: 0 },
      engines: {} as Record<string, string>,
      uptime_seconds: 0,
      mode: 'unknown',
    };
    
    try {
      const statusResponse = await fetch('/api/gq-core/system-status');
      if (statusResponse.ok) {
        const data = await statusResponse.json();
        systemStatus = data;
      }
    } catch {
      // Use defaults
    }
    
    // Determine frontend mode
    const syntheticCount = endpointResults.filter(e => e.source === 'synthetic').length;
    const realCount = endpointResults.filter(e => e.source === 'real').length;
    let mode: 'real' | 'synthetic' | 'mixed' = 'real';
    if (syntheticCount === endpointResults.length) {
      mode = 'synthetic';
    } else if (syntheticCount > 0) {
      mode = 'mixed';
    }
    
    const healthData: HealthData = {
      backend: {
        endpoints: endpointResults,
        workers: {
          running: systemStatus.worker?.status === 'running',
          pid: systemStatus.worker?.pid || 0,
          eventsProcessed: systemStatus.worker?.events_processed || 0,
          errors: systemStatus.worker?.errors || 0,
          uptime: systemStatus.uptime_seconds || 0,
        },
        redis: {
          connected: systemStatus.redis?.status === 'connected',
          latency: systemStatus.redis?.latency_ms || 0,
          totalEvents: systemStatus.redis?.total_events || 0,
          lastMessage: null,
        },
        engines: Object.entries(systemStatus.engines || {}).map(([name, status]) => ({
          name,
          status: status === 'online' ? 'online' : status === 'degraded' ? 'degraded' : 'offline',
        })),
        lastDeploySha: 'main',
        uptime: systemStatus.uptime_seconds || 0,
      },
      frontend: {
        proxyRoutes: GQ_CORE_ENDPOINTS,
        mode,
        wsStatus: systemStatus.websocket?.status === 'connected' ? 'connected' : 'disconnected',
        lastUpdate: new Date().toISOString(),
      },
    };
    
    setHealthData(healthData);
    setLastRefresh(new Date());
    setLoading(false);
  }, [checkEndpointHealth]);

  useEffect(() => {
    fetchHealthData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchHealthData, autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'connected':
        return 'text-green-400';
      case 'degraded':
      case 'mixed':
        return 'text-yellow-400';
      case 'down':
      case 'offline':
      case 'disconnected':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'connected':
        return 'bg-green-500/10';
      case 'degraded':
      case 'mixed':
        return 'bg-yellow-500/10';
      case 'down':
      case 'offline':
      case 'disconnected':
        return 'bg-red-500/10';
      default:
        return 'bg-gray-500/10';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">Deployment Health Dashboard</h1>
            <p className="text-gray-400 mt-1">Layer 4: Real-time system monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded bg-gray-700 border-gray-600"
              />
              Auto-refresh (30s)
            </label>
            <button
              onClick={fetchHealthData}
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh Now'}
            </button>
          </div>
        </div>

        {/* Last Refresh */}
        <div className="text-sm text-gray-500 mb-6">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>

        {healthData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Backend Endpoint Health */}
            <div className="bg-[#111827] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-cyan-500 rounded-full"></span>
                Backend Endpoint Health
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-2">Endpoint</th>
                      <th className="text-center py-2">Status</th>
                      <th className="text-center py-2">Response</th>
                      <th className="text-center py-2">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthData.backend.endpoints.map((endpoint) => (
                      <tr key={endpoint.path} className="border-b border-gray-800">
                        <td className="py-2 font-mono text-xs">{endpoint.path}</td>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusBg(endpoint.status)} ${getStatusColor(endpoint.status)}`}>
                            {endpoint.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2 text-center text-gray-400">
                          {endpoint.responseTime}ms
                        </td>
                        <td className="py-2 text-center">
                          <SourceIndicator source={endpoint.source} showLabel size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* System Status Cards */}
            <div className="space-y-6">
              {/* Worker Status */}
              <div className="bg-[#111827] rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${healthData.backend.workers.running ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  Worker Status
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-400 text-sm">Status</div>
                    <div className={`text-lg font-semibold ${healthData.backend.workers.running ? 'text-green-400' : 'text-red-400'}`}>
                      {healthData.backend.workers.running ? 'Running' : 'Stopped'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">PID</div>
                    <div className="text-lg font-semibold">{healthData.backend.workers.pid || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Events Processed</div>
                    <div className="text-lg font-semibold">{healthData.backend.workers.eventsProcessed.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Errors</div>
                    <div className={`text-lg font-semibold ${healthData.backend.workers.errors > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {healthData.backend.workers.errors}
                    </div>
                  </div>
                </div>
              </div>

              {/* Redis Status */}
              <div className="bg-[#111827] rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${healthData.backend.redis.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  Redis Status
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-400 text-sm">Connection</div>
                    <div className={`text-lg font-semibold ${healthData.backend.redis.connected ? 'text-green-400' : 'text-red-400'}`}>
                      {healthData.backend.redis.connected ? 'Connected' : 'Disconnected'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Latency</div>
                    <div className="text-lg font-semibold">{healthData.backend.redis.latency}ms</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Total Events</div>
                    <div className="text-lg font-semibold">{healthData.backend.redis.totalEvents.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">GQ-Core Uptime</div>
                    <div className="text-lg font-semibold">{formatUptime(healthData.backend.uptime)}</div>
                  </div>
                </div>
              </div>

              {/* Engine Status */}
              <div className="bg-[#111827] rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-semibold mb-4">Intelligence Engines</h2>
                <div className="grid grid-cols-2 gap-2">
                  {healthData.backend.engines.length > 0 ? (
                    healthData.backend.engines.map((engine) => (
                      <div key={engine.name} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                        <span className="text-sm capitalize">{engine.name.replace(/_/g, ' ')}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusBg(engine.status)} ${getStatusColor(engine.status)}`}>
                          {engine.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-gray-500 text-sm">No engine data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Frontend Status */}
            <div className="bg-[#111827] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                Frontend Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Data Mode</span>
                  <DataSourceBadge 
                    source={healthData.frontend.mode === 'real' ? 'real' : healthData.frontend.mode === 'synthetic' ? 'synthetic' : 'unknown'} 
                    timestamp={healthData.frontend.lastUpdate}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">WebSocket Status</span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusBg(healthData.frontend.wsStatus)} ${getStatusColor(healthData.frontend.wsStatus)}`}>
                    {healthData.frontend.wsStatus.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Proxy Routes</span>
                  <span className="text-cyan-400">{healthData.frontend.proxyRoutes.length} routes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Backend URL</span>
                  <span className="text-xs font-mono text-gray-500">{BACKEND_URL}</span>
                </div>
              </div>
            </div>

            {/* Deployment Info */}
            <div className="bg-[#111827] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                Deployment Info
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Last Deploy Branch</span>
                  <span className="font-mono text-sm">{healthData.backend.lastDeploySha}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Healthy Endpoints</span>
                  <span className="text-green-400">
                    {healthData.backend.endpoints.filter(e => e.status === 'healthy').length} / {healthData.backend.endpoints.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Live Data Sources</span>
                  <span className="text-cyan-400">
                    {healthData.backend.endpoints.filter(e => e.source === 'real').length} / {healthData.backend.endpoints.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Synthetic Fallbacks</span>
                  <span className={healthData.backend.endpoints.filter(e => e.source === 'synthetic').length > 0 ? 'text-yellow-400' : 'text-green-400'}>
                    {healthData.backend.endpoints.filter(e => e.source === 'synthetic').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !healthData && (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading health data...</div>
          </div>
        )}
      </div>
    </div>
  );
}
