import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Alert {
  timestamp: string;
  score: number;
  alert: boolean;
  intelligence: any;
  type?: string;
  [key: string]: any;
}

interface ConnectionStats {
  connected: boolean;
  connectionType: 'websocket' | 'socketio' | null;
  reconnectAttempts: number;
  lastConnected: string | null;
  messagesReceived: number;
}

interface UseIntelFeedReturn {
  latestAlert: Alert | null;
  alertHistory: Alert[];
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  stats: ConnectionStats;
  reconnect: () => void;
}

const MAX_HISTORY_SIZE = 50;
const WEBSOCKET_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws/alerts';
const SOCKETIO_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const useIntelFeed = (): UseIntelFeedReturn => {
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null);
  const [alertHistory, setAlertHistory] = useState<Alert[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');
  const [stats, setStats] = useState<ConnectionStats>({
    connected: false,
    connectionType: null,
    reconnectAttempts: 0,
    lastConnected: null,
    messagesReceived: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const useSocketIORef = useRef(false);

  const addToHistory = useCallback((alert: Alert) => {
    setAlertHistory((prev) => {
      const newHistory = [alert, ...prev];
      return newHistory.slice(0, MAX_HISTORY_SIZE);
    });
  }, []);

  const handleMessage = useCallback((data: any) => {
    try {
      let alert: Alert;

      if (typeof data === 'string') {
        const parsed = JSON.parse(data);
        alert = parsed.data || parsed;
      } else {
        alert = data.data || data;
      }

      if (alert && alert.alert) {
        setLatestAlert(alert);
        addToHistory(alert);
        
        setStats((prev) => ({
          ...prev,
          messagesReceived: prev.messagesReceived + 1,
        }));
      }
    } catch (error) {
      console.error('[useIntelFeed] Error parsing message:', error);
    }
  }, [addToHistory]);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    console.log('[useIntelFeed] Attempting WebSocket connection...');
    setConnectionStatus('connecting');

    try {
      const ws = new WebSocket(WEBSOCKET_URL);

      ws.onopen = () => {
        console.log('[useIntelFeed] WebSocket connected');
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        
        setStats((prev) => ({
          ...prev,
          connected: true,
          connectionType: 'websocket',
          reconnectAttempts: 0,
          lastConnected: new Date().toISOString(),
        }));
      };

      ws.onmessage = (event) => {
        handleMessage(event.data);
      };

      ws.onerror = (error) => {
        console.error('[useIntelFeed] WebSocket error:', error);
        setConnectionStatus('error');
      };

      ws.onclose = () => {
        console.log('[useIntelFeed] WebSocket closed, falling back to Socket.IO...');
        setConnectionStatus('disconnected');
        setStats((prev) => ({ ...prev, connected: false }));
        
        useSocketIORef.current = true;
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSocketIO();
        }, 1000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[useIntelFeed] WebSocket connection failed:', error);
      useSocketIORef.current = true;
      connectSocketIO();
    }
  }, [handleMessage]);

  const connectSocketIO = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    console.log('[useIntelFeed] Attempting Socket.IO connection...');
    setConnectionStatus('connecting');

    try {
      const socket = io(SOCKETIO_URL, {
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
      });

      socket.on('connect', () => {
        console.log('[useIntelFeed] Socket.IO connected');
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        
        setStats((prev) => ({
          ...prev,
          connected: true,
          connectionType: 'socketio',
          reconnectAttempts: 0,
          lastConnected: new Date().toISOString(),
        }));

        socket.emit('subscribe', { room: 'alerts' });
      });

      socket.on('message', (data) => {
        if (data.type === 'alert') {
          handleMessage(data);
        }
      });

      socket.on('disconnect', () => {
        console.log('[useIntelFeed] Socket.IO disconnected');
        setConnectionStatus('disconnected');
        setStats((prev) => ({ ...prev, connected: false }));
      });

      socket.on('connect_error', (error) => {
        console.error('[useIntelFeed] Socket.IO connection error:', error);
        setConnectionStatus('error');
        reconnectAttemptsRef.current += 1;
        
        setStats((prev) => ({
          ...prev,
          reconnectAttempts: reconnectAttemptsRef.current,
        }));
      });

      socket.on('subscribed', (data) => {
        console.log('[useIntelFeed] Subscribed to room:', data.room);
      });

      socketRef.current = socket;
    } catch (error) {
      console.error('[useIntelFeed] Socket.IO connection failed:', error);
      setConnectionStatus('error');
    }
  }, [handleMessage]);

  const reconnect = useCallback(() => {
    console.log('[useIntelFeed] Manual reconnect triggered');
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    reconnectAttemptsRef.current = 0;
    useSocketIORef.current = false;
    
    setStats((prev) => ({
      ...prev,
      reconnectAttempts: 0,
    }));
    
    connectWebSocket();
  }, [connectWebSocket]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [connectWebSocket]);

  return {
    latestAlert,
    alertHistory,
    connectionStatus,
    stats,
    reconnect,
  };
};
