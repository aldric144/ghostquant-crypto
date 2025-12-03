/**
 * Demo Client
 * API client for GhostQuant Demo Terminal
 */

const DEMO_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface DemoEvent {
  event_id: string;
  timestamp: string;
  event_type: string;
  severity: string;
  source_address: string;
  target_address?: string;
  amount: number;
  token: string;
  chain: string;
  risk_score: number;
  description: string;
  metadata: Record<string, any>;
}

export interface DemoEntity {
  address: string;
  entity_type: string;
  risk_score: number;
  confidence: number;
  first_seen: string;
  last_seen: string;
  transaction_count: number;
  total_volume: number;
  flags: string[];
  connections: number;
  cluster_id?: string;
  metadata: Record<string, any>;
}

export interface DemoPrediction {
  prediction_id: string;
  timestamp: string;
  entity: string;
  prediction_type: string;
  risk_level: string;
  confidence: number;
  timeframe: string;
  indicators: Array<{ name: string; value: number }>;
  recommendation: string;
  metadata: Record<string, any>;
}

export interface DemoFusion {
  fusion_id: string;
  timestamp: string;
  entity: string;
  meta_signals: Record<string, number>;
  engine_contributions: Record<string, any>;
  unified_risk_score: number;
  confidence: number;
  recommendation: string;
  metadata: Record<string, any>;
}

export interface DemoSentinel {
  timestamp: string;
  engine_status: Record<string, any>;
  active_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  low_alerts: number;
  system_health: number;
  uptime: number;
  metadata: Record<string, any>;
}

export interface DemoConstellation {
  timestamp: string;
  total_entities: number;
  threat_clusters: Array<any>;
  supernovas: number;
  wormholes: number;
  nebulas: number;
  global_risk_level: number;
  regions: Record<string, any>;
  metadata: Record<string, any>;
}

export interface DemoHydra {
  detection_id: string;
  timestamp: string;
  attack_type: string;
  severity: string;
  confidence: number;
  relay_chain: string[];
  coordination_score: number;
  entities_involved: number;
  attack_signature: string;
  recommendation: string;
  metadata: Record<string, any>;
}

export interface DemoUltraFusion {
  analysis_id: string;
  timestamp: string;
  entity: string;
  behavioral_anomaly_score: number;
  network_threat_level: number;
  predictive_risk_index: number;
  manipulation_probability: number;
  entity_confidence_score: number;
  systemic_pressure_gauge: number;
  overall_assessment: string;
  metadata: Record<string, any>;
}

export interface DemoDNA {
  dna_id: string;
  timestamp: string;
  entity: string;
  behavioral_signature: string;
  pattern_consistency: number;
  anomaly_detection: Array<any>;
  risk_evolution: Array<{ day: number; risk: number }>;
  classification: string;
  metadata: Record<string, any>;
}

export interface DemoActorProfile {
  profile_id: string;
  timestamp: string;
  entity: string;
  actor_type: string;
  risk_category: string;
  threat_level: number;
  behavioral_traits: string[];
  known_associations: string[];
  activity_timeline: Array<any>;
  recommendation: string;
  metadata: Record<string, any>;
}

export interface DemoCortexPattern {
  pattern_id: string;
  timestamp: string;
  pattern_name: string;
  frequency: string;
  confidence: number;
  first_detected: string;
  last_detected: string;
  occurrences: number;
  entities_involved: string[];
  pattern_description: string;
  metadata: Record<string, any>;
}

export interface DemoAccessRequest {
  name: string;
  organization: string;
  email: string;
  phone?: string;
  use_case: string;
  questions?: string;
}

export interface DemoToken {
  token_id: string;
  symbol: string;
  name: string;
  chain: string;
  price: number;
  market_cap: number;
  volume_24h: number;
  change_24h: number;
  risk_score: number;
  liquidity_score: number;
  whale_activity: number;
  metadata: Record<string, any>;
}

class DemoClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${DEMO_API_BASE}/demo-api`;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Demo API error: ${response.statusText}`);
    }
    return response.json();
  }

  private async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Demo API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getPrediction(): Promise<DemoPrediction> {
    return this.fetch<DemoPrediction>('/prediction');
  }

  async getFusion(): Promise<DemoFusion> {
    return this.fetch<DemoFusion>('/fusion');
  }

  async getSentinel(): Promise<DemoSentinel> {
    return this.fetch<DemoSentinel>('/sentinel');
  }

  async getConstellation(): Promise<DemoConstellation> {
    return this.fetch<DemoConstellation>('/constellation');
  }

  async getHydra(): Promise<DemoHydra> {
    return this.fetch<DemoHydra>('/hydra');
  }

  async getUltraFusion(): Promise<DemoUltraFusion> {
    return this.fetch<DemoUltraFusion>('/ultrafusion');
  }

  async getDNA(): Promise<DemoDNA> {
    return this.fetch<DemoDNA>('/dna');
  }

  async getActor(): Promise<DemoActorProfile> {
    return this.fetch<DemoActorProfile>('/actor');
  }

  async getCortex(): Promise<DemoCortexPattern> {
    return this.fetch<DemoCortexPattern>('/cortex');
  }

  async getEvent(): Promise<DemoEvent> {
    return this.fetch<DemoEvent>('/event');
  }

  async getEntity(): Promise<DemoEntity> {
    return this.fetch<DemoEntity>('/entity');
  }

  async getFeed(count: number = 10): Promise<DemoEvent[]> {
    return this.fetch<DemoEvent[]>(`/feed?count=${count}`);
  }

  async getHealth(): Promise<any> {
    return this.fetch<any>('/health');
  }

  async getInfo(): Promise<any> {
    return this.fetch<any>('/info');
  }

  async requestAccess(request: DemoAccessRequest): Promise<any> {
    return this.post<any>('/request-access', request);
  }
}

export const demoClient = new DemoClient();
