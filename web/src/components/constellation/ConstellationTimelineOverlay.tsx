'use client';

/**
 * Constellation Timeline Overlay - Phase 10
 * 
 * Animated threat timeline overlay for the Constellation 3D Map.
 * Displays a 60-120 minute rolling threat narrative with real-time updates.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useConstellationWebSocket } from './ConstellationWebSocketProvider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

interface TimelineEvent {
  event_id: string;
  event_type: string;
  severity: string;
  title: string;
  description: string;
  timestamp: string;
  entities_involved: string[];
  clusters_involved: string[];
  risk_impact: number;
  narrative_text: string;
}

interface ThreatNarrative {
  window_start: string;
  window_end: string;
  total_events: number;
  critical_events: number;
  high_events: number;
  dominant_threat_type: string;
  risk_trend: string;
  key_entities: string[];
  key_clusters: string[];
  summary: string;
  detailed_narrative: string;
}

interface TimelineData {
  events: TimelineEvent[];
  narrative: ThreatNarrative;
  stats: {
    total_events: number;
    window_minutes: number;
    connected_clients: number;
  };
}

const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    critical: '#ff0040',
    high: '#ff4444',
    medium: '#ff8800',
    low: '#ffcc00',
    info: '#4488ff',
  };
  return colors[severity] || '#888888';
};

const getSeverityBgColor = (severity: string): string => {
  const colors: Record<string, string> = {
    critical: 'rgba(255, 0, 64, 0.2)',
    high: 'rgba(255, 68, 68, 0.2)',
    medium: 'rgba(255, 136, 0, 0.2)',
    low: 'rgba(255, 204, 0, 0.2)',
    info: 'rgba(68, 136, 255, 0.2)',
  };
  return colors[severity] || 'rgba(136, 136, 136, 0.2)';
};

const getEventTypeIcon = (eventType: string): string => {
  const icons: Record<string, string> = {
    hydra_detection: '🐉',
    whale_movement: '🐋',
    large_transfer: '💸',
    cluster_formation: '🌐',
    risk_spike: '📈',
    entity_flagged: '🚩',
    mixer_activity: '🌀',
    exploit_detected: '💥',
    coordination_detected: '🔗',
    anomaly_detected: '⚠️',
    label_assigned: '🏷️',
    system_alert: '🔔',
  };
  return icons[eventType] || '📌';
};

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} mins ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  return `${diffHours} hours ago`;
};

interface ConstellationTimelineOverlayProps {
  windowMinutes?: number;
  maxEvents?: number;
  position?: 'left' | 'right' | 'bottom';
  collapsed?: boolean;
  onEventClick?: (event: TimelineEvent) => void;
}

export function ConstellationTimelineOverlay({
  windowMinutes = 60,
  maxEvents = 20,
  position = 'right',
  collapsed: initialCollapsed = false,
  onEventClick,
}: ConstellationTimelineOverlayProps) {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [animatingEventId, setAnimatingEventId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Try to use WebSocket context if available
  let wsContext: ReturnType<typeof useConstellationWebSocket> | null = null;
  try {
    wsContext = useConstellationWebSocket();
  } catch {
    // WebSocket context not available, will use polling
  }
  
  // Fetch timeline data from API
  const fetchTimelineData = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/gde/constellation/timeline?window_minutes=${windowMinutes}&limit=${maxEvents}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch timeline data');
      }
      const data = await response.json();
      if (data.success && data.timeline) {
        setTimelineData(data.timeline);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [windowMinutes, maxEvents]);
  
  // Handle new events from WebSocket
  useEffect(() => {
    if (wsContext?.latestTimelineEvent) {
      const newEvent = wsContext.latestTimelineEvent;
      
      // Animate new event
      setAnimatingEventId(newEvent.event_id);
      setTimeout(() => setAnimatingEventId(null), 1000);
      
      // Add to timeline
      setTimelineData(prev => {
        if (!prev) return null;
        
        const updatedEvents = [newEvent, ...prev.events].slice(0, maxEvents);
        return {
          ...prev,
          events: updatedEvents,
          stats: {
            ...prev.stats,
            total_events: prev.stats.total_events + 1,
          },
        };
      });
      
      // Scroll to top to show new event
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }
  }, [wsContext?.latestTimelineEvent, maxEvents]);
  
  // Initial fetch and polling
  useEffect(() => {
    fetchTimelineData();
    const interval = setInterval(fetchTimelineData, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [fetchTimelineData]);
  
  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      zIndex: 100,
    };
    
    switch (position) {
      case 'left':
        return { ...base, left: '16px', top: '16px', bottom: '16px' };
      case 'right':
        return { ...base, right: '16px', top: '16px', bottom: '16px' };
      case 'bottom':
        return { ...base, left: '16px', right: '16px', bottom: '16px', height: '200px' };
      default:
        return { ...base, right: '16px', top: '16px', bottom: '16px' };
    }
  };
  
  if (collapsed) {
    return (
      <div style={{ ...getPositionStyles(), width: '48px', height: 'auto', bottom: 'auto' }}>
        <button
          style={styles.expandButton}
          onClick={() => setCollapsed(false)}
          title="Show Timeline"
        >
          <span style={styles.expandIcon}>📜</span>
          {timelineData && timelineData.narrative.critical_events > 0 && (
            <span style={styles.alertBadge}>
              {timelineData.narrative.critical_events}
            </span>
          )}
        </button>
      </div>
    );
  }
  
  return (
    <div style={{ ...styles.container, ...getPositionStyles() }}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>Threat Timeline</h3>
          <span style={styles.windowBadge}>{windowMinutes}m</span>
        </div>
        <button
          style={styles.collapseButton}
          onClick={() => setCollapsed(true)}
          title="Collapse"
        >
          ×
        </button>
      </div>
      
      {/* Narrative Summary */}
      {timelineData?.narrative && (
        <div style={styles.narrativeSection}>
          <div style={styles.narrativeSummary}>
            {timelineData.narrative.summary}
          </div>
          <div style={styles.narrativeStats}>
            <span style={styles.statItem}>
              <span style={styles.statValue}>{timelineData.narrative.total_events}</span>
              <span style={styles.statLabel}>events</span>
            </span>
            {timelineData.narrative.critical_events > 0 && (
              <span style={{ ...styles.statItem, color: '#ff0040' }}>
                <span style={styles.statValue}>{timelineData.narrative.critical_events}</span>
                <span style={styles.statLabel}>critical</span>
              </span>
            )}
            {timelineData.narrative.high_events > 0 && (
              <span style={{ ...styles.statItem, color: '#ff4444' }}>
                <span style={styles.statValue}>{timelineData.narrative.high_events}</span>
                <span style={styles.statLabel}>high</span>
              </span>
            )}
            <span style={styles.statItem}>
              <span 
                style={{
                  ...styles.statValue,
                  color: timelineData.narrative.risk_trend === 'increasing' ? '#ff4444' :
                         timelineData.narrative.risk_trend === 'decreasing' ? '#44ff44' : '#888888',
                }}
              >
                {timelineData.narrative.risk_trend === 'increasing' ? '↑' :
                 timelineData.narrative.risk_trend === 'decreasing' ? '↓' : '→'}
              </span>
              <span style={styles.statLabel}>trend</span>
            </span>
          </div>
        </div>
      )}
      
      {/* Events List */}
      <div style={styles.eventsContainer} ref={scrollRef}>
        {loading && !timelineData && (
          <div style={styles.loading}>Loading timeline...</div>
        )}
        
        {error && (
          <div style={styles.error}>{error}</div>
        )}
        
        {timelineData?.events && timelineData.events.length === 0 && (
          <div style={styles.empty}>
            No events in the last {windowMinutes} minutes.
            <br />
            The constellation is quiet.
          </div>
        )}
        
        {timelineData?.events && timelineData.events.map((event, index) => (
          <div
            key={event.event_id}
            style={{
              ...styles.eventItem,
              backgroundColor: getSeverityBgColor(event.severity),
              borderLeftColor: getSeverityColor(event.severity),
              animation: animatingEventId === event.event_id ? 'fadeIn 0.5s ease-out' : undefined,
              opacity: animatingEventId === event.event_id ? 1 : 0.9,
            }}
            onClick={() => onEventClick?.(event)}
          >
            {/* Timeline connector */}
            {index < (timelineData.events.length - 1) && (
              <div style={styles.timelineConnector} />
            )}
            
            {/* Event content */}
            <div style={styles.eventHeader}>
              <span style={styles.eventIcon}>
                {getEventTypeIcon(event.event_type)}
              </span>
              <span style={styles.eventTime}>
                {formatTimeAgo(event.timestamp)}
              </span>
              <span 
                style={{
                  ...styles.severityBadge,
                  backgroundColor: getSeverityColor(event.severity),
                }}
              >
                {event.severity.toUpperCase()}
              </span>
            </div>
            
            <div style={styles.eventTitle}>{event.title}</div>
            
            <div style={styles.eventNarrative}>
              {event.narrative_text}
            </div>
            
            {/* Entities involved */}
            {event.entities_involved && event.entities_involved.length > 0 && (
              <div style={styles.entitiesRow}>
                {event.entities_involved.slice(0, 3).map((entity, idx) => (
                  <span key={idx} style={styles.entityTag}>
                    {entity.slice(0, 8)}...
                  </span>
                ))}
                {event.entities_involved.length > 3 && (
                  <span style={styles.moreTag}>
                    +{event.entities_involved.length - 3}
                  </span>
                )}
              </div>
            )}
            
            {/* Risk impact bar */}
            {event.risk_impact > 0 && (
              <div style={styles.riskImpactBar}>
                <div 
                  style={{
                    ...styles.riskImpactFill,
                    width: `${event.risk_impact * 100}%`,
                    backgroundColor: getSeverityColor(event.severity),
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Footer with connection status */}
      <div style={styles.footer}>
        {wsContext && (
          <div style={styles.connectionStatus}>
            <div 
              style={{
                ...styles.statusDot,
                backgroundColor: wsContext.isTimelineConnected ? '#44ff44' : '#ff4444',
              }}
            />
            <span style={styles.statusText}>
              {wsContext.isTimelineConnected ? 'Live Stream' : 'Polling'}
            </span>
          </div>
        )}
        <span style={styles.lastUpdate}>
          {timelineData?.stats?.total_events || 0} total events
        </span>
      </div>
      
      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '320px',
    backgroundColor: 'rgba(15, 15, 25, 0.95)',
    borderRadius: '12px',
    border: '1px solid rgba(100, 100, 150, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(100, 100, 150, 0.2)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#ffffff',
  },
  windowBadge: {
    padding: '2px 6px',
    backgroundColor: 'rgba(100, 100, 255, 0.2)',
    color: '#8888ff',
    fontSize: '10px',
    borderRadius: '4px',
    fontWeight: 600,
  },
  collapseButton: {
    width: '24px',
    height: '24px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#888888',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
  },
  expandButton: {
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(15, 15, 25, 0.95)',
    border: '1px solid rgba(100, 100, 150, 0.3)',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  expandIcon: {
    fontSize: '20px',
  },
  alertBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '18px',
    height: '18px',
    backgroundColor: '#ff0040',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: 700,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  narrativeSection: {
    padding: '12px 16px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderBottom: '1px solid rgba(100, 100, 150, 0.2)',
  },
  narrativeSummary: {
    fontSize: '12px',
    color: '#cccccc',
    lineHeight: 1.4,
    marginBottom: '8px',
  },
  narrativeStats: {
    display: 'flex',
    gap: '12px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  statLabel: {
    fontSize: '9px',
    color: '#666666',
    textTransform: 'uppercase',
  },
  eventsContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
  },
  eventItem: {
    position: 'relative',
    padding: '10px 12px',
    marginBottom: '8px',
    borderRadius: '6px',
    borderLeft: '3px solid',
    cursor: 'pointer',
    transition: 'transform 0.2s, opacity 0.2s',
  },
  timelineConnector: {
    position: 'absolute',
    left: '-2px',
    bottom: '-12px',
    width: '1px',
    height: '12px',
    backgroundColor: 'rgba(100, 100, 150, 0.3)',
  },
  eventHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  eventIcon: {
    fontSize: '14px',
  },
  eventTime: {
    fontSize: '10px',
    color: '#888888',
    flex: 1,
  },
  severityBadge: {
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '8px',
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: '0.5px',
  },
  eventTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '4px',
  },
  eventNarrative: {
    fontSize: '11px',
    color: '#aaaaaa',
    lineHeight: 1.3,
  },
  entitiesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginTop: '6px',
  },
  entityTag: {
    padding: '2px 6px',
    backgroundColor: 'rgba(100, 100, 150, 0.2)',
    color: '#888888',
    fontSize: '9px',
    borderRadius: '3px',
    fontFamily: 'monospace',
  },
  moreTag: {
    padding: '2px 6px',
    backgroundColor: 'rgba(100, 100, 150, 0.3)',
    color: '#aaaaaa',
    fontSize: '9px',
    borderRadius: '3px',
  },
  riskImpactBar: {
    height: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '1px',
    marginTop: '6px',
    overflow: 'hidden',
  },
  riskImpactFill: {
    height: '100%',
    borderRadius: '1px',
    transition: 'width 0.3s',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    borderTop: '1px solid rgba(100, 100, 150, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  connectionStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
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
  lastUpdate: {
    fontSize: '10px',
    color: '#666666',
  },
  loading: {
    color: '#888888',
    fontSize: '12px',
    textAlign: 'center',
    padding: '40px 20px',
  },
  error: {
    color: '#ff4444',
    fontSize: '12px',
    textAlign: 'center',
    padding: '40px 20px',
  },
  empty: {
    color: '#666666',
    fontSize: '12px',
    textAlign: 'center',
    padding: '40px 20px',
    lineHeight: 1.5,
  },
};

export default ConstellationTimelineOverlay;
