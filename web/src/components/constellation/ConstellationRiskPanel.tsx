'use client';

/**
 * Constellation Risk Panel - Phase 10
 * 
 * Displays real-time risk metrics from the AI Constellation Risk Model.
 * Shows node-level, cluster-level, and system-wide risk scores.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useConstellationWebSocket } from './ConstellationWebSocketProvider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

interface SystemicRisk {
  global_risk_score: number;
  risk_category: string;
  total_nodes: number;
  total_clusters: number;
  high_risk_nodes: number;
  critical_clusters: number;
  risk_concentration: number;
  systemic_threat_level: number;
  risk_velocity: number;
  risk_momentum: number;
  top_risk_factors: Array<[string, number]>;
  risk_forecast: {
    '1h': number;
    '6h': number;
    '24h': number;
  };
}

interface HighRiskNode {
  node_id: string;
  adjusted_risk_score: number;
  risk_category: string;
  risk_trend: string;
  confidence: number;
}

interface RiskData {
  systemic_risk: SystemicRisk;
  high_risk_nodes: HighRiskNode[];
}

const getRiskColor = (category: string): string => {
  const colors: Record<string, string> = {
    critical: '#ff0040',
    high: '#ff4444',
    elevated: '#ff8800',
    moderate: '#ffcc00',
    low: '#44ff44',
    minimal: '#00ff88',
  };
  return colors[category] || '#888888';
};

const getRiskBgColor = (category: string): string => {
  const colors: Record<string, string> = {
    critical: 'rgba(255, 0, 64, 0.15)',
    high: 'rgba(255, 68, 68, 0.15)',
    elevated: 'rgba(255, 136, 0, 0.15)',
    moderate: 'rgba(255, 204, 0, 0.15)',
    low: 'rgba(68, 255, 68, 0.15)',
    minimal: 'rgba(0, 255, 136, 0.15)',
  };
  return colors[category] || 'rgba(136, 136, 136, 0.15)';
};

const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

const formatTrend = (velocity: number, momentum: number): { text: string; color: string } => {
  if (velocity > 0.05) {
    return { text: 'Increasing', color: '#ff4444' };
  } else if (velocity < -0.05) {
    return { text: 'Decreasing', color: '#44ff44' };
  }
  return { text: 'Stable', color: '#888888' };
};

export function ConstellationRiskPanel() {
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Try to use WebSocket context if available
  let wsContext: ReturnType<typeof useConstellationWebSocket> | null = null;
  try {
    wsContext = useConstellationWebSocket();
  } catch {
    // WebSocket context not available, will use polling
  }
  
  // Fetch risk data from API
  const fetchRiskData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/gde/constellation/risk`);
      if (!response.ok) {
        throw new Error('Failed to fetch risk data');
      }
      const data = await response.json();
      if (data.success && data.risk) {
        setRiskData({
          systemic_risk: data.risk.systemic_risk,
          high_risk_nodes: Object.values(data.risk.node_risks || {}).filter(
            (n: unknown) => {
              const node = n as HighRiskNode;
              return node.risk_category === 'high' || node.risk_category === 'critical';
            }
          ).slice(0, 10) as HighRiskNode[],
        });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Update from WebSocket if available
  useEffect(() => {
    if (wsContext?.latestRiskUpdate) {
      setRiskData({
        systemic_risk: wsContext.latestRiskUpdate.systemic_risk as unknown as SystemicRisk,
        high_risk_nodes: wsContext.latestRiskUpdate.high_risk_nodes as HighRiskNode[],
      });
      setLoading(false);
    }
  }, [wsContext?.latestRiskUpdate]);
  
  // Initial fetch and polling
  useEffect(() => {
    fetchRiskData();
    const interval = setInterval(fetchRiskData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchRiskData]);
  
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Risk Model</h3>
        </div>
        <div style={styles.loading}>Loading risk data...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Risk Model</h3>
        </div>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }
  
  if (!riskData) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Risk Model</h3>
        </div>
        <div style={styles.empty}>No risk data available</div>
      </div>
    );
  }
  
  const { systemic_risk } = riskData;
  const trend = formatTrend(systemic_risk.risk_velocity, systemic_risk.risk_momentum);
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>AI Risk Model</h3>
        <div 
          style={{
            ...styles.riskBadge,
            backgroundColor: getRiskBgColor(systemic_risk.risk_category),
            color: getRiskColor(systemic_risk.risk_category),
          }}
        >
          {systemic_risk.risk_category.toUpperCase()}
        </div>
      </div>
      
      {/* Global Risk Score */}
      <div style={styles.globalRisk}>
        <div style={styles.riskScore}>
          <span style={{ color: getRiskColor(systemic_risk.risk_category) }}>
            {formatPercent(systemic_risk.global_risk_score)}
          </span>
        </div>
        <div style={styles.riskLabel}>Global Risk Score</div>
        <div style={{ ...styles.trend, color: trend.color }}>
          {trend.text}
        </div>
      </div>
      
      {/* Risk Metrics Grid */}
      <div style={styles.metricsGrid}>
        <div style={styles.metric}>
          <div style={styles.metricValue}>{systemic_risk.total_nodes}</div>
          <div style={styles.metricLabel}>Nodes</div>
        </div>
        <div style={styles.metric}>
          <div style={styles.metricValue}>{systemic_risk.total_clusters}</div>
          <div style={styles.metricLabel}>Clusters</div>
        </div>
        <div style={styles.metric}>
          <div style={{ ...styles.metricValue, color: '#ff4444' }}>
            {systemic_risk.high_risk_nodes}
          </div>
          <div style={styles.metricLabel}>High Risk</div>
        </div>
        <div style={styles.metric}>
          <div style={{ ...styles.metricValue, color: '#ff0040' }}>
            {systemic_risk.critical_clusters}
          </div>
          <div style={styles.metricLabel}>Critical</div>
        </div>
      </div>
      
      {/* Risk Forecast */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Risk Forecast</div>
        <div style={styles.forecastGrid}>
          <div style={styles.forecastItem}>
            <div style={styles.forecastLabel}>1h</div>
            <div style={styles.forecastValue}>
              {formatPercent(systemic_risk.risk_forecast?.['1h'] || 0)}
            </div>
          </div>
          <div style={styles.forecastItem}>
            <div style={styles.forecastLabel}>6h</div>
            <div style={styles.forecastValue}>
              {formatPercent(systemic_risk.risk_forecast?.['6h'] || 0)}
            </div>
          </div>
          <div style={styles.forecastItem}>
            <div style={styles.forecastLabel}>24h</div>
            <div style={styles.forecastValue}>
              {formatPercent(systemic_risk.risk_forecast?.['24h'] || 0)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Risk Factors */}
      {systemic_risk.top_risk_factors && systemic_risk.top_risk_factors.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Top Risk Factors</div>
          <div style={styles.factorsList}>
            {systemic_risk.top_risk_factors.slice(0, 5).map(([factor, score], index) => (
              <div key={factor} style={styles.factorItem}>
                <span style={styles.factorName}>
                  {factor.replace(/_/g, ' ')}
                </span>
                <span style={styles.factorScore}>
                  {typeof score === 'number' ? score.toFixed(2) : score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* High Risk Nodes */}
      {riskData.high_risk_nodes && riskData.high_risk_nodes.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>High Risk Entities</div>
          <div style={styles.nodesList}>
            {riskData.high_risk_nodes.slice(0, 5).map((node) => (
              <div key={node.node_id} style={styles.nodeItem}>
                <span style={styles.nodeId}>
                  {node.node_id.slice(0, 10)}...
                </span>
                <span 
                  style={{
                    ...styles.nodeRisk,
                    color: getRiskColor(node.risk_category),
                  }}
                >
                  {formatPercent(node.adjusted_risk_score)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Connection Status */}
      {wsContext && (
        <div style={styles.connectionStatus}>
          <div 
            style={{
              ...styles.statusDot,
              backgroundColor: wsContext.isConnected ? '#44ff44' : '#ff4444',
            }}
          />
          <span style={styles.statusText}>
            {wsContext.isConnected ? 'Live' : 'Polling'}
          </span>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'rgba(20, 20, 30, 0.9)',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid rgba(100, 100, 150, 0.3)',
    minWidth: '280px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#ffffff',
  },
  riskBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  globalRisk: {
    textAlign: 'center' as const,
    marginBottom: '16px',
    padding: '16px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
  },
  riskScore: {
    fontSize: '36px',
    fontWeight: 700,
    fontFamily: 'monospace',
  },
  riskLabel: {
    fontSize: '12px',
    color: '#888888',
    marginTop: '4px',
  },
  trend: {
    fontSize: '11px',
    marginTop: '8px',
    fontWeight: 500,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    marginBottom: '16px',
  },
  metric: {
    textAlign: 'center' as const,
    padding: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
  },
  metricValue: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  metricLabel: {
    fontSize: '10px',
    color: '#888888',
    marginTop: '2px',
  },
  section: {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(100, 100, 150, 0.2)',
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#888888',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  forecastGrid: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  forecastItem: {
    textAlign: 'center' as const,
  },
  forecastLabel: {
    fontSize: '10px',
    color: '#666666',
  },
  forecastValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  factorsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  factorItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    padding: '4px 0',
  },
  factorName: {
    color: '#aaaaaa',
    textTransform: 'capitalize' as const,
  },
  factorScore: {
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  nodesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  nodeItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    padding: '4px 0',
  },
  nodeId: {
    color: '#aaaaaa',
    fontFamily: 'monospace',
  },
  nodeRisk: {
    fontWeight: 600,
    fontFamily: 'monospace',
  },
  connectionStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '12px',
    paddingTop: '8px',
    borderTop: '1px solid rgba(100, 100, 150, 0.2)',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  statusText: {
    fontSize: '10px',
    color: '#666666',
  },
  loading: {
    color: '#888888',
    fontSize: '12px',
    textAlign: 'center' as const,
    padding: '20px',
  },
  error: {
    color: '#ff4444',
    fontSize: '12px',
    textAlign: 'center' as const,
    padding: '20px',
  },
  empty: {
    color: '#666666',
    fontSize: '12px',
    textAlign: 'center' as const,
    padding: '20px',
  },
};

export default ConstellationRiskPanel;
