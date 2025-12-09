/**
 * Ultra-Fusion AI Supervisor™ - TypeScript Client
 * Client for meta-intelligence supervision API
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

export interface SupervisorInput {
  entity?: string;
  token?: string;
  chain?: string;
  image_metadata?: Record<string, any>;
  events?: Array<Record<string, any>>;
}

export interface SupervisorSignals {
  contradiction_score: number;
  agreement_score: number;
  anomaly_amplification: number;
  threat_amplification: number;
  cross_ratio: number;
  multi_chain_pressure: number;
  temporal_escalation: number;
  blind_spot_score: number;
  data_completeness: number;
}

export interface SupervisorFusion {
  meta_score: number;
  prediction_score: number;
  fusion_score: number;
  radar_score: number;
  dna_score: number;
  actor_profile_score: number;
  cluster_score: number;
  image_score: number;
  contradiction_penalty: number;
  blindspot_penalty: number;
}

export interface SupervisorDecision {
  classification: string;
  meta_score: number;
  confidence: number;
  recommendations: string[];
  contradictions: string[];
  blindspots: string[];
}

export interface SupervisorNarrative {
  identity_view: string;
  behavioral_interpretation: string;
  fusion_analysis: string;
  timeline_synthesis: string;
  pattern_justification: string;
  threat_projection: string;
  contradictions_analysis: string;
  blindspots_analysis: string;
  analyst_verdict: string;
  full_narrative: string;
}

export interface SupervisorSummary {
  id: string;
  timestamp: string;
  entity: string;
  classification: string;
  meta_score: number;
  confidence: number;
  executive_summary: string;
  key_findings: string[];
  critical_alerts: string[];
  data_sources: string[];
}

export interface SupervisorOutput {
  decision: SupervisorDecision;
  narrative: SupervisorNarrative;
  summary: SupervisorSummary;
  signals: SupervisorSignals;
  fusion: SupervisorFusion;
  bundle: {
    sources: string[];
    entity: string;
    token: string;
    chain: string;
  };
}

export interface AnalyzeResponse {
  success: boolean;
  result?: SupervisorOutput;
  error?: string;
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  engine: string;
  version: string;
  timestamp: string;
}

export class UltraFusionClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  /**
   * Complete meta-intelligence analysis
   * 
   * @param input - Supervisor input data
   * @returns Complete supervisor output
   */
  async analyze(input: SupervisorInput): Promise<AnalyzeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ultrafusion/ultrafusion/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[UltraFusionClient] Error in analyze:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Entity-focused meta-intelligence analysis
   * 
   * @param entity - Entity address
   * @param events - Optional event list
   * @returns Entity-focused supervisor output
   */
  async analyzeEntity(
    entity: string,
    events?: Array<Record<string, any>>
  ): Promise<AnalyzeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ultrafusion/ultrafusion/entity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entity, events }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[UltraFusionClient] Error in analyzeEntity:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Token-focused meta-intelligence analysis
   * 
   * @param token - Token symbol
   * @param chain - Optional chain name
   * @param events - Optional event list
   * @returns Token-focused supervisor output
   */
  async analyzeToken(
    token: string,
    chain?: string,
    events?: Array<Record<string, any>>
  ): Promise<AnalyzeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ultrafusion/ultrafusion/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, chain, events }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[UltraFusionClient] Error in analyzeToken:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Chain-focused meta-intelligence analysis
   * 
   * @param chain - Chain name
   * @param events - Optional event list
   * @returns Chain-focused supervisor output
   */
  async analyzeChain(
    chain: string,
    events?: Array<Record<string, any>>
  ): Promise<AnalyzeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ultrafusion/ultrafusion/chain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chain, events }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[UltraFusionClient] Error in analyzeChain:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Image-focused meta-intelligence analysis with Oracle Eye
   * 
   * @param imageMetadata - Image metadata
   * @param entity - Optional entity address
   * @param token - Optional token symbol
   * @returns Image-focused supervisor output
   */
  async analyzeImage(
    imageMetadata: Record<string, any>,
    entity?: string,
    token?: string
  ): Promise<AnalyzeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ultrafusion/ultrafusion/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_metadata: imageMetadata,
          entity,
          token,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[UltraFusionClient] Error in analyzeImage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Health check
   * 
   * @returns Health status
   */
  async health(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ultrafusion/ultrafusion/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[UltraFusionClient] Error in health:', error);
      return {
        status: 'error',
        engine: 'Ultra-Fusion AI Supervisor™',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get API information
   * 
   * @returns API information
   */
  async info(): Promise<Record<string, any>> {
    try {
      const response = await fetch(`${this.baseUrl}/ultrafusion/ultrafusion/info`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[UltraFusionClient] Error in info:', error);
      return {
        engine: 'Ultra-Fusion AI Supervisor™',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const ultraFusion = new UltraFusionClient();
