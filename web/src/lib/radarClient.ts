/**
 * Radar Client - TypeScript client for Global Manipulation Radar Heatmap API
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface RadarHeatmap {
  success: boolean;
  timeframe: string;
  timeframe_hours: number;
  event_count: number;
  chains: Record<string, number>;
  entities: Record<string, number>;
  tokens: Record<string, number>;
  networks: Record<string, number>;
  clusters: Array<{
    cluster_id: any;
    score: number;
    entities: string[];
    size: number;
    risk_level: string;
  }>;
  timestamp: string;
  error?: string;
}

export interface RadarSummary {
  success: boolean;
  global_risk_score: number;
  global_risk_level: string;
  top_entities: Array<{
    address: string;
    score: number;
    risk_level: string;
  }>;
  chain_trends: Array<{
    chain: string;
    score: number;
    risk_level: string;
  }>;
  network_volatility: Array<{
    network: string;
    score: number;
    risk_level: string;
  }>;
  cluster_activity: Array<{
    cluster_id: any;
    size: number;
    score: number;
    risk_level: string;
  }>;
  manipulation_spikes: number;
  total_events: number;
  last_update: string;
  timestamp: string;
  error?: string;
}

export interface RadarSpikes {
  success: boolean;
  timeframe: string;
  manipulation_spikes: Array<{
    entity: string;
    score: number;
  }>;
  volatility_spikes: Array<{
    token: string;
    score: number;
  }>;
  chain_pressure_bursts: Array<{
    chain: string;
    score: number;
  }>;
  synchronized_clusters: Array<{
    cluster_id: any;
    score: number;
    entities: string[];
    size: number;
    risk_level: string;
  }>;
  spike_count: number;
  timestamp: string;
  error?: string;
}

export interface RadarTop {
  success: boolean;
  limit: number;
  top_entities: Array<{
    address: string;
    score: number;
    risk_level: string;
  }>;
  top_tokens: Array<{
    symbol: string;
    score: number;
    risk_level: string;
  }>;
  top_chains: Array<{
    chain: string;
    score: number;
    risk_level: string;
  }>;
  top_networks: Array<{
    network: string;
    score: number;
    risk_level: string;
  }>;
  timestamp: string;
  error?: string;
}

export interface RadarClusters {
  success: boolean;
  clusters: Array<{
    cluster_id: any;
    entities: string[];
    score: number;
    size: number;
    risk_level: string;
  }>;
  cluster_count: number;
  high_risk_clusters: number;
  timestamp: string;
  error?: string;
}

export interface RadarEvent {
  chain?: string;
  entity?: string;
  address?: string;
  token?: string;
  symbol?: string;
  network?: string;
  manipulation_risk?: number;
  volatility?: number;
  ring_probability?: number;
  chain_pressure?: number;
  anomaly_score?: number;
  cluster_id?: any;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface RadarIngestResult {
  success: boolean;
  event_risk?: number;
  chain_score?: number;
  entity_score?: number;
  token_score?: number;
  network_score?: number;
  total_events?: number;
  error?: string;
}

/**
 * Get global manipulation risk heatmap
 */
export async function getHeatmap(timeframe: string = '1h'): Promise<RadarHeatmap> {
  try {
    const response = await fetch(`${API_BASE}/radar/heatmap?timeframe=${timeframe}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    return {
      success: false,
      timeframe,
      timeframe_hours: 1,
      event_count: 0,
      chains: {},
      entities: {},
      tokens: {},
      networks: {},
      clusters: [],
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get global intelligence summary
 */
export async function getSummary(): Promise<RadarSummary> {
  try {
    const response = await fetch(`${API_BASE}/radar/summary`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching summary:', error);
    return {
      success: false,
      global_risk_score: 0,
      global_risk_level: 'unknown',
      top_entities: [],
      chain_trends: [],
      network_volatility: [],
      cluster_activity: [],
      manipulation_spikes: 0,
      total_events: 0,
      last_update: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get top high-risk entities, tokens, and chains
 */
export async function getTop(limit: number = 20): Promise<RadarTop> {
  try {
    const response = await fetch(`${API_BASE}/radar/top?limit=${limit}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching top:', error);
    return {
      success: false,
      limit,
      top_entities: [],
      top_tokens: [],
      top_chains: [],
      top_networks: [],
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get global coordinated clusters
 */
export async function getClusters(): Promise<RadarClusters> {
  try {
    const response = await fetch(`${API_BASE}/radar/clusters`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching clusters:', error);
    return {
      success: false,
      clusters: [],
      cluster_count: 0,
      high_risk_clusters: 0,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get manipulation and volatility spikes
 */
export async function getSpikes(timeframe: string = '1h'): Promise<RadarSpikes> {
  try {
    const response = await fetch(`${API_BASE}/radar/spikes?timeframe=${timeframe}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching spikes:', error);
    return {
      success: false,
      timeframe,
      manipulation_spikes: [],
      volatility_spikes: [],
      chain_pressure_bursts: [],
      synchronized_clusters: [],
      spike_count: 0,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Ingest new event into radar system
 */
export async function ingest(event: RadarEvent): Promise<RadarIngestResult> {
  try {
    const response = await fetch(`${API_BASE}/radar/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error ingesting event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
