/**
 * Global Threat Constellation Map™ - TypeScript Client
 * 6 methods for 3D intelligence visualization API
 */

interface ConstellationNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  z: number;
  risk_level: number;
  color: string;
  size: number;
  metadata: Record<string, any>;
}

interface ConstellationEdge {
  source_id: string;
  target_id: string;
  strength: number;
  correlation: number;
  color: string;
  metadata: Record<string, any>;
}

interface ConstellationMap {
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
  global_risk_score: number;
  timestamp: string;
  metadata: Record<string, any>;
}

interface ConstellationSummary {
  total_nodes: number;
  total_edges: number;
  dominant_risk: string;
  high_risk_entities: string[];
  clusters_detected: number;
  hydra_heads_detected: number;
  notes: string;
}

interface IngestResponse {
  success: boolean;
  error?: string;
  timestamp: string;
}

interface MapResponse {
  success: boolean;
  map?: ConstellationMap;
  error?: string;
  timestamp: string;
}

interface SummaryResponse {
  success: boolean;
  summary?: ConstellationSummary;
  error?: string;
  timestamp: string;
}

interface NodesResponse {
  success: boolean;
  nodes?: ConstellationNode[];
  error?: string;
  timestamp: string;
}

interface EdgesResponse {
  success: boolean;
  edges?: ConstellationEdge[];
  error?: string;
  timestamp: string;
}

interface HealthResponse {
  status: string;
  engine: string;
  version: string;
  retention_hours: number;
  total_intelligence: number;
  latest_map_nodes: number;
  latest_map_edges: number;
  timestamp: string;
}

class GlobalConstellationClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  /**
   * Ingest multi-domain intelligence
   */
  async ingest(intelligence: Record<string, any>): Promise<IngestResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/constellation/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ intelligence }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get full constellation map
   */
  async getMap(): Promise<MapResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/constellation/map`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          map: undefined,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        map: undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get constellation summary
   */
  async getSummary(): Promise<SummaryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/constellation/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          summary: undefined,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        summary: undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get constellation nodes only
   */
  async getNodes(): Promise<NodesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/constellation/nodes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          nodes: undefined,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        nodes: undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get constellation edges only
   */
  async getEdges(): Promise<EdgesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/constellation/edges`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          edges: undefined,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        edges: undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Health check
   */
  async health(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/constellation/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          status: 'error',
          engine: 'Global Threat Constellation Map™',
          version: '1.0.0',
          retention_hours: 72,
          total_intelligence: 0,
          latest_map_nodes: 0,
          latest_map_edges: 0,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        status: 'error',
        engine: 'Global Threat Constellation Map™',
        version: '1.0.0',
        retention_hours: 72,
        total_intelligence: 0,
        latest_map_nodes: 0,
        latest_map_edges: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const globalConstellation = new GlobalConstellationClient();

export type {
  ConstellationNode,
  ConstellationEdge,
  ConstellationMap,
  ConstellationSummary,
  IngestResponse,
  MapResponse,
  SummaryResponse,
  NodesResponse,
  EdgesResponse,
  HealthResponse,
};
