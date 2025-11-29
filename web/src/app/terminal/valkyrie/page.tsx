'use client';

/**
 * Valkyrie Threat Warning System™ - Live Alert Wall
 * Real-time threat monitoring with 5-level escalation protocol
 */

import { useState, useEffect } from 'react';
import { valkyrieClient, ValkyrieAlert, ValkyrieEscalation } from '@/lib/valkyrieClient';

export default function ValkyriePage() {
  const [alerts, setAlerts] = useState<ValkyrieAlert[]>([]);
  const [escalation, setEscalation] = useState<ValkyrieEscalation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await valkyrieClient.getLatest(50);
        if (response.success && response.alerts) {
          setAlerts(response.alerts);
          if (response.escalation) {
            setEscalation(response.escalation);
          }
          setError(null);
        } else {
          setError(response.error || 'Failed to fetch alerts');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'purple': return 'bg-purple-500/20 border-purple-500 text-purple-300';
      case 'red': return 'bg-red-500/20 border-red-500 text-red-300';
      case 'orange': return 'bg-orange-500/20 border-orange-500 text-orange-300';
      case 'yellow': return 'bg-yellow-500/20 border-yellow-500 text-yellow-300';
      case 'green': return 'bg-green-500/20 border-green-500 text-green-300';
      default: return 'bg-gray-500/20 border-gray-500 text-gray-300';
    }
  };

  const getEscalationColor = (level: number) => {
    switch (level) {
      case 4: return 'bg-purple-500';
      case 3: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 1: return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getActorIcon = (actorType: string) => {
    switch (actorType) {
      case 'PREDATOR': return '🔴';
      case 'SYNDICATE': return '🟦';
      case 'WHALE': return '🟪';
      case 'INSIDER': return '🟨';
      case 'GHOST': return '🟩';
      case 'MANIPULATOR': return '🔶';
      case 'ARBITRAGE BOT': return '🔷';
      case 'COORDINATED ACTOR': return '🟧';
      default: return '⚫';
    }
  };

  const metrics = {
    last5m: alerts.filter(a => {
      const alertTime = new Date(a.timestamp).getTime();
      const now = Date.now();
      return (now - alertTime) < 5 * 60 * 1000;
    }).length,
    last15m: alerts.filter(a => {
      const alertTime = new Date(a.timestamp).getTime();
      const now = Date.now();
      return (now - alertTime) < 15 * 60 * 1000;
    }).length,
    last1h: alerts.filter(a => {
      const alertTime = new Date(a.timestamp).getTime();
      const now = Date.now();
      return (now - alertTime) < 60 * 60 * 1000;
    }).length,
    triggerTypes: Array.from(new Set(alerts.map(a => a.trigger_type))),
    highRiskActors: alerts.filter(a => ['PREDATOR', 'SYNDICATE', 'MANIPULATOR'].includes(a.actor_type)),
    topEntities: Array.from(new Set(alerts.map(a => a.entity))).slice(0, 5),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-cyan-400 p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading Valkyrie System...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-cyan-400 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-cyan-300">
          ⚡ Valkyrie Threat Warning System™
        </h1>
        <p className="text-cyan-500">
          Autonomous Real-Time Alert Engine with 5-Level Escalation Protocol
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-300">Error: {error}</p>
        </div>
      )}

      {/* Escalation Monitor */}
      {escalation && (
        <div className="mb-8 p-6 bg-gray-900/50 border-2 border-cyan-500/30 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">
            🎯 Escalation Monitor
          </h2>
          
          {/* Escalation Meter */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">
                Level {escalation.level}: {escalation.level_name}
              </span>
              <span className="text-sm text-cyan-500">
                {new Date(escalation.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden border border-cyan-500/30">
              <div
                className={`h-full transition-all duration-500 ${getEscalationColor(escalation.level)} ${
                  escalation.level >= 3 ? 'animate-pulse' : ''
                }`}
                style={{ width: `${(escalation.level / 4) * 100}%` }}
              />
              
              {/* Level markers */}
              <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-bold text-white">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-black/50 rounded-lg border border-cyan-500/20">
            <p className="text-cyan-300 leading-relaxed">{escalation.summary}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-3 bg-black/50 rounded-lg border border-cyan-500/20 text-center">
              <div className="text-2xl font-bold text-cyan-300">{escalation.alert_count_5m}</div>
              <div className="text-xs text-cyan-500">Alerts (5m)</div>
            </div>
            <div className="p-3 bg-black/50 rounded-lg border border-cyan-500/20 text-center">
              <div className="text-2xl font-bold text-cyan-300">{escalation.alert_count_15m}</div>
              <div className="text-xs text-cyan-500">Alerts (15m)</div>
            </div>
            <div className="p-3 bg-black/50 rounded-lg border border-cyan-500/20 text-center">
              <div className="text-2xl font-bold text-red-300">{escalation.critical_alerts}</div>
              <div className="text-xs text-cyan-500">Critical</div>
            </div>
          </div>
        </div>
      )}

      {/* Aggregated Metrics Panel */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-900/50 border-2 border-cyan-500/30 rounded-lg">
          <div className="text-sm text-cyan-500 mb-1">Alerts (5m)</div>
          <div className="text-3xl font-bold text-cyan-300">{metrics.last5m}</div>
        </div>
        <div className="p-4 bg-gray-900/50 border-2 border-cyan-500/30 rounded-lg">
          <div className="text-sm text-cyan-500 mb-1">Alerts (15m)</div>
          <div className="text-3xl font-bold text-cyan-300">{metrics.last15m}</div>
        </div>
        <div className="p-4 bg-gray-900/50 border-2 border-cyan-500/30 rounded-lg">
          <div className="text-sm text-cyan-500 mb-1">Alerts (1h)</div>
          <div className="text-3xl font-bold text-cyan-300">{metrics.last1h}</div>
        </div>
        <div className="p-4 bg-gray-900/50 border-2 border-cyan-500/30 rounded-lg">
          <div className="text-sm text-cyan-500 mb-1">High-Risk Actors</div>
          <div className="text-3xl font-bold text-red-300">{metrics.highRiskActors.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Alert Wall */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">
            🚨 Live Alert Wall
          </h2>
          
          <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
            {alerts.length === 0 ? (
              <div className="p-8 bg-gray-900/50 border-2 border-cyan-500/30 rounded-lg text-center">
                <p className="text-cyan-500">No alerts detected. System nominal.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-2 transition-all ${getSeverityColor(alert.severity_level)} ${
                    alert.severity_level === 'red' || alert.severity_level === 'purple'
                      ? 'animate-pulse shadow-lg shadow-' + alert.severity_level + '-500/50'
                      : ''
                  }`}
                >
                  {/* Alert Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getActorIcon(alert.actor_type)}</span>
                      <div>
                        <div className="font-bold text-lg">{alert.trigger_type}</div>
                        <div className="text-xs opacity-75">
                          {alert.actor_type} • Risk: {alert.risk_score.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-75">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-xs font-bold uppercase mt-1">
                        {alert.severity_level}
                      </div>
                    </div>
                  </div>

                  {/* Alert Body */}
                  <div className="mb-2">
                    <p className="text-sm leading-relaxed">{alert.reason}</p>
                  </div>

                  {/* Alert Footer */}
                  <div className="flex items-center justify-between text-xs opacity-75">
                    <span>Entity: {alert.entity.substring(0, 16)}...</span>
                    <span>Escalation: Level {alert.escalation_level}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alert Timeline + Top Triggers */}
        <div className="space-y-8">
          {/* Alert Timeline */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-cyan-300">
              📊 Alert Timeline
            </h2>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {alerts.slice(0, 20).map((alert, idx) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 p-2 bg-gray-900/50 border border-cyan-500/20 rounded-lg"
                >
                  <div className={`w-3 h-3 rounded-full ${getEscalationColor(alert.escalation_level)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{alert.trigger_type}</div>
                    <div className="text-xs text-cyan-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-xs font-bold uppercase opacity-75">
                    {alert.severity_level}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Trigger Types */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-cyan-300">
              🎯 Top Triggers
            </h2>
            
            <div className="space-y-2">
              {metrics.triggerTypes.slice(0, 8).map((trigger, idx) => {
                const count = alerts.filter(a => a.trigger_type === trigger).length;
                return (
                  <div
                    key={idx}
                    className="p-3 bg-gray-900/50 border border-cyan-500/20 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">{trigger}</span>
                      <span className="text-sm font-bold text-cyan-300">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500"
                        style={{ width: `${(count / alerts.length) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Entities */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-cyan-300">
              👤 Top Entities
            </h2>
            
            <div className="space-y-2">
              {metrics.topEntities.map((entity, idx) => {
                const count = alerts.filter(a => a.entity === entity).length;
                return (
                  <div
                    key={idx}
                    className="p-3 bg-gray-900/50 border border-cyan-500/20 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono truncate flex-1">
                        {entity.substring(0, 20)}...
                      </span>
                      <span className="text-sm font-bold text-cyan-300 ml-2">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
