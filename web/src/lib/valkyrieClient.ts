/**
 * Valkyrie Threat Warning System™ - Frontend Client
 * TypeScript client for Valkyrie API with 5 methods
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ValkyrieAlert {
  id: string;
  timestamp: string;
  entity: string;
  actor_type: string;
  risk_score: number;
  severity_level: 'green' | 'yellow' | 'orange' | 'red' | 'purple';
  trigger_type: string;
  reason: string;
  summary: string;
  escalation_level: number;
  metadata: Record<string, any>;
}

export interface ValkyrieEscalation {
  level: number;
  level_name: string;
  summary: string;
  alert_count_5m: number;
  alert_count_15m: number;
  critical_alerts: number;
  timestamp: string;
}

export interface ValkyrieResponse {
  success: boolean;
  alerts?: ValkyrieAlert[];
  count?: number;
  escalation?: ValkyrieEscalation;
  timestamp: string;
  error?: string;
}

export interface IngestResponse {
  success: boolean;
  alert?: ValkyrieAlert;
  message: string;
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  engine: string;
  alert_count: number;
  escalation_level: number;
  trigger_types: number;
  timestamp: string;
}

/**
 * Valkyrie API Client
 */
export const valkyrieClient = {
  /**
   * Ingest event and generate threat alert
   */
  async ingest(event: Record<string, any>): Promise<IngestResponse> {
    try {
      const response = await fetch(`${API_BASE}/valkyrie/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event }),
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP error ${response.status}`,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[ValkyrieClient] Ingest error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get recent alerts from feed
   */
  async getAlerts(limit: number = 100): Promise<ValkyrieResponse> {
    try {
      const response = await fetch(`${API_BASE}/valkyrie/alerts?limit=${limit}`);

      if (!response.ok) {
        return {
          success: false,
          alerts: [],
          count: 0,
          timestamp: new Date().toISOString(),
          error: `HTTP error ${response.status}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[ValkyrieClient] Get alerts error:', error);
      return {
        success: false,
        alerts: [],
        count: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Get latest N alerts
   */
  async getLatest(limit: number = 50): Promise<ValkyrieResponse> {
    try {
      const response = await fetch(`${API_BASE}/valkyrie/latest?limit=${limit}`);

      if (!response.ok) {
        return {
          success: false,
          alerts: [],
          count: 0,
          timestamp: new Date().toISOString(),
          error: `HTTP error ${response.status}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[ValkyrieClient] Get latest error:', error);
      return {
        success: false,
        alerts: [],
        count: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Get current escalation status
   */
  async getEscalation(): Promise<{ success: boolean; escalation?: ValkyrieEscalation; timestamp: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/valkyrie/escalation`);

      if (!response.ok) {
        return {
          success: false,
          timestamp: new Date().toISOString(),
          error: `HTTP error ${response.status}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[ValkyrieClient] Get escalation error:', error);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Health check
   */
  async health(): Promise<HealthResponse | { success: false; error: string }> {
    try {
      const response = await fetch(`${API_BASE}/valkyrie/health`);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP error ${response.status}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[ValkyrieClient] Health check error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
