'use client';

/**
 * Constellation WebSocket Provider - Phase 10
 * 
 * Provides real-time WebSocket connectivity for the Constellation Fusion Pipeline.
 * Manages connections to:
 * - /gde/constellation/stream - Main fusion event stream
 * - /gde/constellation/timeline/stream - Threat timeline stream
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

// Types for WebSocket events
export interface StreamEvent {
  event_type: string;
  payload: Record<string, unknown>;
  source_engine: string;
  timestamp: string;
  event_id: string;
}

export interface TimelineEvent {
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

export interface RiskUpdate {
  systemic_risk: {
    global_risk_score: number;
    risk_category: string;
    total_nodes: number;
    total_clusters: number;
    high_risk_nodes: number;
    risk_velocity: number;
    risk_momentum: number;
  };
  high_risk_nodes: Array<{
    node_id: string;
    adjusted_risk_score: number;
    risk_category: string;
  }>;
}

export interface LabelUpdate {
  entity_classifications?: Record<string, {
    node_id: string;
    predicted_type: string;
    confidence: number;
  }>;
  cluster_classifications?: Record<string, {
    cluster_id: string;
    predicted_label: string;
    confidence: number;
  }>;
}

interface ConstellationWebSocketContextType {
  // Connection state
  isConnected: boolean;
  isTimelineConnected: boolean;
  connectionError: string | null;
  
  // Event streams
  latestEvent: StreamEvent | null;
  latestTimelineEvent: TimelineEvent | null;
  latestRiskUpdate: RiskUpdate | null;
  latestLabelUpdate: LabelUpdate | null;
  
  // Event history
  recentEvents: StreamEvent[];
  recentTimelineEvents: TimelineEvent[];
  
  // Actions
  subscribe: (eventTypes: string[]) => void;
  unsubscribe: (eventTypes: string[]) => void;
  requestNarrative: (windowMinutes?: number) => void;
  
  // Stats
  stats: {
    eventsReceived: number;
    timelineEventsReceived: number;
    lastHeartbeat: string | null;
  };
}

const ConstellationWebSocketContext = createContext<ConstellationWebSocketContextType | null>(null);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

// Convert HTTP URL to WebSocket URL
const getWebSocketUrl = (path: string): string => {
  const baseUrl = API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
  return `${baseUrl}${path}`;
};

interface ConstellationWebSocketProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
  maxReconnectAttempts?: number;
}

export function ConstellationWebSocketProvider({
  children,
  autoConnect = true,
  maxReconnectAttempts = 5,
}: ConstellationWebSocketProviderProps) {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isTimelineConnected, setIsTimelineConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Event state
  const [latestEvent, setLatestEvent] = useState<StreamEvent | null>(null);
  const [latestTimelineEvent, setLatestTimelineEvent] = useState<TimelineEvent | null>(null);
  const [latestRiskUpdate, setLatestRiskUpdate] = useState<RiskUpdate | null>(null);
  const [latestLabelUpdate, setLatestLabelUpdate] = useState<LabelUpdate | null>(null);
  
  // Event history
  const [recentEvents, setRecentEvents] = useState<StreamEvent[]>([]);
  const [recentTimelineEvents, setRecentTimelineEvents] = useState<TimelineEvent[]>([]);
  
  // Stats
  const [stats, setStats] = useState({
    eventsReceived: 0,
    timelineEventsReceived: 0,
    lastHeartbeat: null as string | null,
  });
  
  // WebSocket refs
  const mainWsRef = useRef<WebSocket | null>(null);
  const timelineWsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle main stream messages
  const handleMainMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.event_type === 'heartbeat') {
        setStats(prev => ({ ...prev, lastHeartbeat: data.timestamp }));
        return;
      }
      
      if (data.event_type === 'connection') {
        console.log('Connected to constellation stream:', data.payload);
        return;
      }
      
      // Handle different event types
      const streamEvent: StreamEvent = {
        event_type: data.event_type,
        payload: data.payload,
        source_engine: data.source_engine,
        timestamp: data.timestamp,
        event_id: data.event_id,
      };
      
      setLatestEvent(streamEvent);
      setRecentEvents(prev => [streamEvent, ...prev.slice(0, 49)]);
      setStats(prev => ({ ...prev, eventsReceived: prev.eventsReceived + 1 }));
      
      // Handle specific event types
      if (data.event_type === 'risk_update') {
        setLatestRiskUpdate(data.payload as RiskUpdate);
      } else if (data.event_type === 'label_update') {
        setLatestLabelUpdate(data.payload as LabelUpdate);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, []);
  
  // Handle timeline stream messages
  const handleTimelineMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'connected' || data.type === 'initial_events') {
        if (data.events) {
          setRecentTimelineEvents(data.events);
        }
        return;
      }
      
      if (data.type === 'timeline_event') {
        const timelineEvent: TimelineEvent = data.event;
        setLatestTimelineEvent(timelineEvent);
        setRecentTimelineEvents(prev => [timelineEvent, ...prev.slice(0, 49)]);
        setStats(prev => ({ ...prev, timelineEventsReceived: prev.timelineEventsReceived + 1 }));
      }
      
      if (data.type === 'narrative') {
        // Handle narrative response
        console.log('Received narrative:', data.narrative);
      }
    } catch (error) {
      console.error('Error parsing timeline WebSocket message:', error);
    }
  }, []);
  
  // Connect to main stream
  const connectMainStream = useCallback(() => {
    if (mainWsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    try {
      const ws = new WebSocket(getWebSocketUrl('/gde/constellation/stream'));
      
      ws.onopen = () => {
        console.log('Main constellation stream connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
      };
      
      ws.onmessage = handleMainMessage;
      
      ws.onclose = () => {
        console.log('Main constellation stream disconnected');
        setIsConnected(false);
        
        // Attempt reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(connectMainStream, delay);
        }
      };
      
      ws.onerror = (error) => {
        console.error('Main stream WebSocket error:', error);
        setConnectionError('Failed to connect to constellation stream');
      };
      
      mainWsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionError('Failed to create WebSocket connection');
    }
  }, [handleMainMessage, maxReconnectAttempts]);
  
  // Connect to timeline stream
  const connectTimelineStream = useCallback(() => {
    if (timelineWsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    try {
      const ws = new WebSocket(getWebSocketUrl('/gde/constellation/timeline/stream'));
      
      ws.onopen = () => {
        console.log('Timeline stream connected');
        setIsTimelineConnected(true);
      };
      
      ws.onmessage = handleTimelineMessage;
      
      ws.onclose = () => {
        console.log('Timeline stream disconnected');
        setIsTimelineConnected(false);
        
        // Attempt reconnect after delay
        setTimeout(connectTimelineStream, 5000);
      };
      
      ws.onerror = (error) => {
        console.error('Timeline stream WebSocket error:', error);
      };
      
      timelineWsRef.current = ws;
    } catch (error) {
      console.error('Failed to create timeline WebSocket:', error);
    }
  }, [handleTimelineMessage]);
  
  // Subscribe to event types
  const subscribe = useCallback((eventTypes: string[]) => {
    if (mainWsRef.current?.readyState === WebSocket.OPEN) {
      mainWsRef.current.send(JSON.stringify({
        action: 'subscribe',
        event_types: eventTypes,
      }));
    }
  }, []);
  
  // Unsubscribe from event types
  const unsubscribe = useCallback((eventTypes: string[]) => {
    if (mainWsRef.current?.readyState === WebSocket.OPEN) {
      mainWsRef.current.send(JSON.stringify({
        action: 'unsubscribe',
        event_types: eventTypes,
      }));
    }
  }, []);
  
  // Request narrative from timeline
  const requestNarrative = useCallback((windowMinutes: number = 60) => {
    if (timelineWsRef.current?.readyState === WebSocket.OPEN) {
      timelineWsRef.current.send(JSON.stringify({
        action: 'get_narrative',
        window_minutes: windowMinutes,
      }));
    }
  }, []);
  
  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connectMainStream();
      connectTimelineStream();
    }
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      mainWsRef.current?.close();
      timelineWsRef.current?.close();
    };
  }, [autoConnect, connectMainStream, connectTimelineStream]);
  
  const contextValue: ConstellationWebSocketContextType = {
    isConnected,
    isTimelineConnected,
    connectionError,
    latestEvent,
    latestTimelineEvent,
    latestRiskUpdate,
    latestLabelUpdate,
    recentEvents,
    recentTimelineEvents,
    subscribe,
    unsubscribe,
    requestNarrative,
    stats,
  };
  
  return (
    <ConstellationWebSocketContext.Provider value={contextValue}>
      {children}
    </ConstellationWebSocketContext.Provider>
  );
}

// Hook to use the WebSocket context
export function useConstellationWebSocket() {
  const context = useContext(ConstellationWebSocketContext);
  if (!context) {
    throw new Error('useConstellationWebSocket must be used within a ConstellationWebSocketProvider');
  }
  return context;
}

export default ConstellationWebSocketProvider;
