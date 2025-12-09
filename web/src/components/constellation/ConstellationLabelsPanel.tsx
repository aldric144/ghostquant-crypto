'use client';

/**
 * Constellation Labels Panel - Phase 10
 * 
 * Displays entity classifications and cluster labels from the AI labeling engine.
 * Shows predicted entity types (whale, CEX, MEV bot, mixer, etc.) and cluster labels.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useConstellationWebSocket } from './ConstellationWebSocketProvider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

interface EntityClassification {
  node_id: string;
  predicted_type: string;
  confidence: number;
  alternative_types: Array<{ type: string; confidence: number }>;
  behavioral_signals: Record<string, boolean>;
}

interface ClusterClassification {
  cluster_id: string;
  predicted_label: string;
  confidence: number;
  entity_composition: Record<string, number>;
  behavioral_patterns: string[];
  threat_indicators: string[];
  cohesion_score: number;
}

interface LabelsData {
  entity_classifications: Record<string, EntityClassification>;
  cluster_classifications: Record<string, ClusterClassification>;
  entity_type_counts: Record<string, number>;
  cluster_label_counts: Record<string, number>;
}

const getEntityTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    whale: '#00bfff',
    cex_wallet: '#00ff88',
    dex_wallet: '#88ff00',
    mev_bot: '#ff8800',
    darknet_mixer: '#ff0040',
    tornado_mixer: '#ff0080',
    exploit_vector: '#ff0000',
    smart_contract: '#8888ff',
    risk_agent: '#ff4444',
    institutional: '#00ffcc',
    retail_wallet: '#888888',
    bridge_contract: '#aa88ff',
    liquidity_pool: '#44aaff',
    unknown: '#666666',
  };
  return colors[type] || '#888888';
};

const getClusterLabelColor = (label: string): string => {
  const colors: Record<string, string> = {
    coordinated_trading: '#ff8800',
    wash_trading_ring: '#ff0040',
    whale_pod: '#00bfff',
    mev_network: '#ff4400',
    mixer_cluster: '#ff0080',
    exploit_network: '#ff0000',
    institutional_group: '#00ffcc',
    exchange_ecosystem: '#00ff88',
    defi_protocol: '#8888ff',
    nft_community: '#ff88ff',
    airdrop_farmers: '#ffcc00',
    sybil_cluster: '#ff4444',
    legitimate_activity: '#44ff44',
    unknown: '#666666',
  };
  return colors[label] || '#888888';
};

const formatEntityType = (type: string): string => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatClusterLabel = (label: string): string => {
  return label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function ConstellationLabelsPanel() {
  const [labelsData, setLabelsData] = useState<LabelsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'entities' | 'clusters'>('entities');
  
  // Try to use WebSocket context if available
  let wsContext: ReturnType<typeof useConstellationWebSocket> | null = null;
  try {
    wsContext = useConstellationWebSocket();
  } catch {
    // WebSocket context not available, will use polling
  }
  
  // Fetch labels data from API
  const fetchLabelsData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/gde/constellation/labels`);
      if (!response.ok) {
        throw new Error('Failed to fetch labels data');
      }
      const data = await response.json();
      if (data.success && data.labels) {
        setLabelsData(data.labels);
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
    if (wsContext?.latestLabelUpdate) {
      // WebSocket updates trigger a fresh fetch to get complete data
      fetchLabelsData();
      setLoading(false);
    }
  }, [wsContext?.latestLabelUpdate, fetchLabelsData]);
  
  // Initial fetch and polling
  useEffect(() => {
    fetchLabelsData();
    const interval = setInterval(fetchLabelsData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchLabelsData]);
  
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Entity Labels</h3>
        </div>
        <div style={styles.loading}>Loading labels...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Entity Labels</h3>
        </div>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }
  
  const entityCount = Object.keys(labelsData?.entity_classifications || {}).length;
  const clusterCount = Object.keys(labelsData?.cluster_classifications || {}).length;
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>AI Classification</h3>
      </div>
      
      {/* Tab Buttons */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'entities' ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab('entities')}
        >
          Entities ({entityCount})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'clusters' ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab('clusters')}
        >
          Clusters ({clusterCount})
        </button>
      </div>
      
      {/* Entity Type Distribution */}
      {activeTab === 'entities' && labelsData?.entity_type_counts && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Type Distribution</div>
          <div style={styles.distributionGrid}>
            {Object.entries(labelsData.entity_type_counts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([type, count]) => (
                <div key={type} style={styles.distributionItem}>
                  <div 
                    style={{
                      ...styles.typeIndicator,
                      backgroundColor: getEntityTypeColor(type),
                    }}
                  />
                  <span style={styles.typeName}>{formatEntityType(type)}</span>
                  <span style={styles.typeCount}>{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* Entity Classifications List */}
      {activeTab === 'entities' && labelsData?.entity_classifications && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Recent Classifications</div>
          <div style={styles.classificationsList}>
            {Object.values(labelsData.entity_classifications)
              .sort((a, b) => b.confidence - a.confidence)
              .slice(0, 10)
              .map((entity) => (
                <div key={entity.node_id} style={styles.classificationItem}>
                  <div style={styles.classificationHeader}>
                    <span style={styles.entityId}>
                      {entity.node_id.slice(0, 10)}...
                    </span>
                    <span 
                      style={{
                        ...styles.entityType,
                        color: getEntityTypeColor(entity.predicted_type),
                      }}
                    >
                      {formatEntityType(entity.predicted_type)}
                    </span>
                  </div>
                  <div style={styles.confidenceBar}>
                    <div 
                      style={{
                        ...styles.confidenceFill,
                        width: `${entity.confidence * 100}%`,
                        backgroundColor: getEntityTypeColor(entity.predicted_type),
                      }}
                    />
                  </div>
                  <div style={styles.confidenceText}>
                    {(entity.confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* Cluster Label Distribution */}
      {activeTab === 'clusters' && labelsData?.cluster_label_counts && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Label Distribution</div>
          <div style={styles.distributionGrid}>
            {Object.entries(labelsData.cluster_label_counts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([label, count]) => (
                <div key={label} style={styles.distributionItem}>
                  <div 
                    style={{
                      ...styles.typeIndicator,
                      backgroundColor: getClusterLabelColor(label),
                    }}
                  />
                  <span style={styles.typeName}>{formatClusterLabel(label)}</span>
                  <span style={styles.typeCount}>{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* Cluster Classifications List */}
      {activeTab === 'clusters' && labelsData?.cluster_classifications && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Active Clusters</div>
          <div style={styles.classificationsList}>
            {Object.values(labelsData.cluster_classifications)
              .sort((a, b) => b.confidence - a.confidence)
              .slice(0, 10)
              .map((cluster) => (
                <div key={cluster.cluster_id} style={styles.clusterItem}>
                  <div style={styles.classificationHeader}>
                    <span style={styles.clusterId}>
                      {cluster.cluster_id}
                    </span>
                    <span 
                      style={{
                        ...styles.clusterLabel,
                        color: getClusterLabelColor(cluster.predicted_label),
                      }}
                    >
                      {formatClusterLabel(cluster.predicted_label)}
                    </span>
                  </div>
                  
                  {/* Threat Indicators */}
                  {cluster.threat_indicators && cluster.threat_indicators.length > 0 && (
                    <div style={styles.threatIndicators}>
                      {cluster.threat_indicators.map((indicator, idx) => (
                        <span key={idx} style={styles.threatBadge}>
                          {indicator.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Cohesion Score */}
                  <div style={styles.cohesionBar}>
                    <div 
                      style={{
                        ...styles.cohesionFill,
                        width: `${cluster.cohesion_score * 100}%`,
                      }}
                    />
                  </div>
                  <div style={styles.cohesionText}>
                    Cohesion: {(cluster.cohesion_score * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {entityCount === 0 && clusterCount === 0 && (
        <div style={styles.empty}>
          No classifications available yet.
          <br />
          Labels will appear as entities are detected.
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
    marginBottom: '12px',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#ffffff',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  tab: {
    flex: 1,
    padding: '8px 12px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(100, 100, 150, 0.3)',
    borderRadius: '4px',
    color: '#888888',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  activeTab: {
    backgroundColor: 'rgba(100, 100, 255, 0.2)',
    borderColor: 'rgba(100, 100, 255, 0.5)',
    color: '#ffffff',
  },
  section: {
    marginTop: '12px',
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#888888',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  distributionGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  distributionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    padding: '4px 0',
  },
  typeIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '2px',
  },
  typeName: {
    flex: 1,
    color: '#aaaaaa',
  },
  typeCount: {
    color: '#ffffff',
    fontFamily: 'monospace',
    fontWeight: 600,
  },
  classificationsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    maxHeight: '300px',
    overflowY: 'auto' as const,
  },
  classificationItem: {
    padding: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
  },
  classificationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  entityId: {
    fontSize: '11px',
    color: '#888888',
    fontFamily: 'monospace',
  },
  entityType: {
    fontSize: '11px',
    fontWeight: 600,
  },
  confidenceBar: {
    height: '3px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '4px',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s',
  },
  confidenceText: {
    fontSize: '10px',
    color: '#666666',
    marginTop: '2px',
  },
  clusterItem: {
    padding: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
  },
  clusterId: {
    fontSize: '11px',
    color: '#888888',
    fontFamily: 'monospace',
  },
  clusterLabel: {
    fontSize: '11px',
    fontWeight: 600,
  },
  threatIndicators: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '4px',
    marginTop: '6px',
  },
  threatBadge: {
    padding: '2px 6px',
    backgroundColor: 'rgba(255, 0, 64, 0.2)',
    color: '#ff4444',
    fontSize: '9px',
    borderRadius: '2px',
    textTransform: 'uppercase' as const,
  },
  cohesionBar: {
    height: '3px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '6px',
  },
  cohesionFill: {
    height: '100%',
    backgroundColor: '#4488ff',
    borderRadius: '2px',
    transition: 'width 0.3s',
  },
  cohesionText: {
    fontSize: '10px',
    color: '#666666',
    marginTop: '2px',
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
    lineHeight: 1.5,
  },
};

export default ConstellationLabelsPanel;
