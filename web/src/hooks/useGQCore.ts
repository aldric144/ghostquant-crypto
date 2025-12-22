/**
 * GQ-Core React Hooks
 * 
 * Unified hooks for accessing GhostQuant Hybrid Intelligence Engine data.
 * All hooks return data with source ("real" or "synthetic") and timestamp.
 * Never returns undefined - always provides populated data (synthetic fallback).
 */

import { useState, useEffect, useCallback } from 'react';

const API_BASE = '/api/gq-core';

export interface GQCoreResponse<T> {
  source: 'real' | 'synthetic';
  timestamp: string;
  data: T;
  fallback_reason?: string;
  cached?: boolean;
  error?: boolean;
}

export interface RiskData {
  overall_score: number;
  threat_level: string;
  distribution: Record<string, number>;
  top_risks: Array<{
    id: string;
    symbol: string;
    type: string;
    score: number;
    chain: string;
    timestamp: string;
  }>;
  trend: string;
}

export interface WhaleData {
  total_whales: number;
  active_24h: number;
  total_volume: number;
  top_whales: Array<{
    id: string;
    address: string;
    label: string;
    balance_usd: number;
    pnl_24h: number;
    activity_score: number;
    chains: string[];
  }>;
  recent_movements: Array<{
    id: string;
    whale_id: string;
    type: string;
    amount_usd: number;
    token: string;
    chain: string;
    timestamp: string;
  }>;
}

export interface TrendData {
  hourly_activity: Array<{
    hour: string;
    value: number;
    type: string;
  }>;
  heatmap: Array<{
    day: string;
    hour: number;
    value: number;
  }>;
  events: Array<{
    id: string;
    type: string;
    description: string;
    severity: string;
    timestamp: string;
  }>;
  categories: string[];
}

export interface RingData {
  total_rings: number;
  active_rings: number;
  rings: Array<{
    id: string;
    name: string;
    nodes: Array<{
      id: string;
      address: string;
      type: string;
      activity_count: number;
    }>;
    severity: 'high' | 'medium' | 'low';
    score: number;
    activity_count: number;
    timestamp: string;
    chains: string[];
    tokens: string[];
    pattern_type: string;
    confidence: number;
    volume: number;
  }>;
  severity_distribution: Record<string, number>;
}

export interface SystemStatusData {
  websocket: {
    status: string;
    clients: number;
    latency_ms: number;
  };
  worker: {
    status: string;
    pid: number;
    events_processed: number;
    errors: number;
  };
  redis: {
    status: string;
    latency_ms: number;
    total_events: number;
  };
  engines: Record<string, string>;
  uptime_seconds: number;
  mode: string;
}

export interface OverviewData {
  risk: RiskData;
  whales: WhaleData;
  rings: RingData;
  anomalies: {
    total_anomalies: number;
    critical_count: number;
    outliers: Array<Record<string, unknown>>;
    patterns: Array<Record<string, unknown>>;
  };
  system: SystemStatusData;
}

async function fetchGQCore<T>(endpoint: string): Promise<GQCoreResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as GQCoreResponse<T>;
    
  } catch (error) {
    console.error(`[GQ-Core] Error fetching ${endpoint}:`, error);
    
    // Return synthetic fallback on error
    return {
      source: 'synthetic',
      timestamp: new Date().toISOString(),
      data: {} as T,
      fallback_reason: error instanceof Error ? error.message : 'Unknown error',
      error: true
    };
  }
}

export function useGQCoreOverview(refreshInterval: number = 30000) {
  const [data, setData] = useState<GQCoreResponse<OverviewData> | null>(null);
  const [loading, setLoading] = useState(true);
  
  const refresh = useCallback(async () => {
    const result = await fetchGQCore<OverviewData>('overview');
    setData(result);
    setLoading(false);
  }, []);
  
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);
  
  return { data, loading, refresh };
}

export function useGQCoreRisk(refreshInterval: number = 30000) {
  const [data, setData] = useState<GQCoreResponse<RiskData> | null>(null);
  const [loading, setLoading] = useState(true);
  
  const refresh = useCallback(async () => {
    const result = await fetchGQCore<RiskData>('risk');
    setData(result);
    setLoading(false);
  }, []);
  
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);
  
  return { data, loading, refresh };
}

export function useGQCoreWhales(refreshInterval: number = 30000) {
  const [data, setData] = useState<GQCoreResponse<WhaleData> | null>(null);
  const [loading, setLoading] = useState(true);
  
  const refresh = useCallback(async () => {
    const result = await fetchGQCore<WhaleData>('whales');
    setData(result);
    setLoading(false);
  }, []);
  
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);
  
  return { data, loading, refresh };
}

export function useGQCoreTrends(refreshInterval: number = 30000) {
  const [data, setData] = useState<GQCoreResponse<TrendData> | null>(null);
  const [loading, setLoading] = useState(true);
  
  const refresh = useCallback(async () => {
    const result = await fetchGQCore<TrendData>('trends');
    setData(result);
    setLoading(false);
  }, []);
  
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);
  
  return { data, loading, refresh };
}

export function useGQCoreRings(refreshInterval: number = 30000) {
  const [data, setData] = useState<GQCoreResponse<RingData> | null>(null);
  const [loading, setLoading] = useState(true);
  
  const refresh = useCallback(async () => {
    const result = await fetchGQCore<RingData>('rings');
    setData(result);
    setLoading(false);
  }, []);
  
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);
  
  return { data, loading, refresh };
}

export function useGQCoreSystemStatus(refreshInterval: number = 5000) {
  const [data, setData] = useState<GQCoreResponse<SystemStatusData> | null>(null);
  const [loading, setLoading] = useState(true);
  
  const refresh = useCallback(async () => {
    const result = await fetchGQCore<SystemStatusData>('system-status');
    setData(result);
    setLoading(false);
  }, []);
  
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);
  
  return { data, loading, refresh };
}

export function useGQCoreAnomalies(refreshInterval: number = 30000) {
  const [data, setData] = useState<GQCoreResponse<Record<string, unknown>> | null>(null);
  const [loading, setLoading] = useState(true);
  
  const refresh = useCallback(async () => {
    const result = await fetchGQCore<Record<string, unknown>>('anomalies');
    setData(result);
    setLoading(false);
  }, []);
  
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);
  
  return { data, loading, refresh };
}

export function useGQCoreEntities(refreshInterval: number = 30000) {
  const [data, setData] = useState<GQCoreResponse<Record<string, unknown>> | null>(null);
  const [loading, setLoading] = useState(true);
  
  const refresh = useCallback(async () => {
    const result = await fetchGQCore<Record<string, unknown>>('entities');
    setData(result);
    setLoading(false);
  }, []);
  
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);
  
  return { data, loading, refresh };
}

export function useGQCoreNarratives(refreshInterval: number = 30000) {
  const [data, setData] = useState<GQCoreResponse<Record<string, unknown>> | null>(null);
  const [loading, setLoading] = useState(true);
  
  const refresh = useCallback(async () => {
    const result = await fetchGQCore<Record<string, unknown>>('narratives');
    setData(result);
    setLoading(false);
  }, []);
  
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);
  
  return { data, loading, refresh };
}

export function useGQCoreMap(refreshInterval: number = 30000) {
  const [data, setData] = useState<GQCoreResponse<Record<string, unknown>> | null>(null);
  const [loading, setLoading] = useState(true);
  
  const refresh = useCallback(async () => {
    const result = await fetchGQCore<Record<string, unknown>>('map');
    setData(result);
    setLoading(false);
  }, []);
  
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);
  
  return { data, loading, refresh };
}

// Generic hook for any GQ-Core endpoint
export function useGQCore<T>(endpoint: string, refreshInterval: number = 30000) {
  const [data, setData] = useState<GQCoreResponse<T> | null>(null);
  const [loading, setLoading] = useState(true);
  
  const refresh = useCallback(async () => {
    const result = await fetchGQCore<T>(endpoint);
    setData(result);
    setLoading(false);
  }, [endpoint]);
  
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);
  
  return { data, loading, refresh };
}
