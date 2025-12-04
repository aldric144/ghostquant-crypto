/**
 * Sentinel Command Console™ - TypeScript Client
 * 5 methods for real-time command center API
 */

interface SentinelHeartbeat {
  active_engines: string[];
  engine_health: Record<string, string>;
  latency_map: Record<string, number>;
  system_load: number;
  timestamp: string;
}

interface SentinelPanelStatus {
  panel_name: string;
  status: string;
  risk_score: number;
  data: Record<string, any>;
  last_updated: string;
}

interface SentinelGlobalStatus {
  global_risk_level: number;
  threat_level: string;
  hydra_heads: number;
  constellation_clusters: number;
  fusion_score: number;
  active_threats: number;
  system_health: string;
  timestamp: string;
}

interface SentinelAlert {
  alert_id: string;
  severity: string;
  source_engine: string;
  message: string;
  risk_score: number;
  timestamp: string;
  metadata: Record<string, any>;
}

interface SentinelDashboard {
  heartbeat: SentinelHeartbeat;
  global_status: SentinelGlobalStatus;
  panels: SentinelPanelStatus[];
  alerts: SentinelAlert[];
  top_threat_entities: string[];
  heatmap_snapshot: Record<string, any>;
  summary: string;
  timestamp: string;
}

interface DashboardResponse {
  success: boolean;
  dashboard?: SentinelDashboard;
  error?: string;
  timestamp: string;
}

interface HeartbeatResponse {
  success: boolean;
  heartbeat?: SentinelHeartbeat;
  error?: string;
  timestamp: string;
}

interface PanelsResponse {
  success: boolean;
  panels?: SentinelPanelStatus[];
  error?: string;
  timestamp: string;
}

interface SummaryResponse {
  success: boolean;
  summary?: string;
  error?: string;
  timestamp: string;
}

interface AlertsResponse {
  success: boolean;
  alerts?: SentinelAlert[];
  error?: string;
  timestamp: string;
}

class SentinelClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  /**
   * Get complete Sentinel dashboard
   */
  async getDashboard(): Promise<DashboardResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/sentinel/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          dashboard: undefined,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        dashboard: undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get engine heartbeat
   */
  async getHeartbeat(): Promise<HeartbeatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/sentinel/heartbeat`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          heartbeat: undefined,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        heartbeat: undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get all control panels
   */
  async getPanels(): Promise<PanelsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/sentinel/panels`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          panels: undefined,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        panels: undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get operational summary
   */
  async getSummary(): Promise<SummaryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/sentinel/summary`, {
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
   * Get triggered alerts
   */
  async getAlerts(): Promise<AlertsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/sentinel/alerts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          alerts: undefined,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        alerts: undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const sentinel = new SentinelClient();

export type {
  SentinelHeartbeat,
  SentinelPanelStatus,
  SentinelGlobalStatus,
  SentinelAlert,
  SentinelDashboard,
  DashboardResponse,
  HeartbeatResponse,
  PanelsResponse,
  SummaryResponse,
  AlertsResponse,
};
