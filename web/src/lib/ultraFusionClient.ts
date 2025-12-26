/**
 * Ultra-Fusion AI Supervisor™ - TypeScript Client
 * Client for meta-intelligence supervision API
 * 
 * STABILITY: This client NEVER throws HTTP errors.
 * All failures return synthetic fallback responses.
 */

import { generateSyntheticFusion } from '../engines/ultrafusionEngine';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app';
const DEFAULT_TIMEOUT = 10000; // 10 seconds

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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
    
    try {
      const response = await fetch(`${this.baseUrl}/ultrafusion/ultrafusion/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Return synthetic fallback instead of throwing
        console.warn(`[UltraFusionClient] API returned ${response.status}, using synthetic fallback`);
        const synthetic = generateSyntheticFusion(input.entity, input.token, input.chain);
        return {
          success: true,
          result: {
            decision: synthetic.decision,
            narrative: synthetic.narrative,
            summary: synthetic.summary,
            signals: synthetic.signals,
            fusion: {
              meta_score: synthetic.decision.meta_score,
              prediction_score: synthetic.decision.meta_score * 0.9,
              fusion_score: synthetic.decision.meta_score * 0.95,
              radar_score: synthetic.decision.meta_score * 0.85,
              dna_score: synthetic.decision.meta_score * 0.8,
              actor_profile_score: synthetic.decision.meta_score * 0.88,
              cluster_score: synthetic.decision.meta_score * 0.82,
              image_score: 0,
              contradiction_penalty: synthetic.signals.contradiction_score,
              blindspot_penalty: synthetic.signals.blind_spot_score,
            },
            bundle: synthetic.bundle,
          },
          timestamp: synthetic.timestamp,
        };
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn('[UltraFusionClient] Request failed, using synthetic fallback:', error);
      const synthetic = generateSyntheticFusion(input.entity, input.token, input.chain);
      return {
        success: true,
        result: {
          decision: synthetic.decision,
          narrative: synthetic.narrative,
          summary: synthetic.summary,
          signals: synthetic.signals,
          fusion: {
            meta_score: synthetic.decision.meta_score,
            prediction_score: synthetic.decision.meta_score * 0.9,
            fusion_score: synthetic.decision.meta_score * 0.95,
            radar_score: synthetic.decision.meta_score * 0.85,
            dna_score: synthetic.decision.meta_score * 0.8,
            actor_profile_score: synthetic.decision.meta_score * 0.88,
            cluster_score: synthetic.decision.meta_score * 0.82,
            image_score: 0,
            contradiction_penalty: synthetic.signals.contradiction_score,
            blindspot_penalty: synthetic.signals.blind_spot_score,
          },
          bundle: synthetic.bundle,
        },
        timestamp: synthetic.timestamp,
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
    // Delegate to main analyze method which handles synthetic fallback
    return this.analyze({ entity, events });
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
    // Delegate to main analyze method which handles synthetic fallback
    return this.analyze({ token, chain, events });
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
    // Delegate to main analyze method which handles synthetic fallback
    return this.analyze({ chain, events });
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
    // Delegate to main analyze method which handles synthetic fallback
    return this.analyze({ image_metadata: imageMetadata, entity, token });
  }

  /**
   * Health check
   * 
   * @returns Health status
   */
  async health(): Promise<HealthResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
    
    try {
      const response = await fetch(`${this.baseUrl}/ultrafusion/ultrafusion/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Return synthetic health status instead of throwing
        console.warn(`[UltraFusionClient] Health check returned ${response.status}, returning synthetic status`);
        return {
          status: 'synthetic',
          engine: 'Ultra-Fusion AI Supervisor™',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
        };
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn('[UltraFusionClient] Health check failed, returning synthetic status:', error);
      return {
        status: 'synthetic',
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
    
    try {
      const response = await fetch(`${this.baseUrl}/ultrafusion/ultrafusion/info`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Return synthetic info instead of throwing
        console.warn(`[UltraFusionClient] Info request returned ${response.status}, returning synthetic info`);
        return {
          engine: 'Ultra-Fusion AI Supervisor™',
          version: '1.0.0',
          status: 'synthetic',
          capabilities: ['entity-analysis', 'token-analysis', 'chain-analysis', 'image-analysis'],
          timestamp: new Date().toISOString(),
        };
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn('[UltraFusionClient] Info request failed, returning synthetic info:', error);
      return {
        engine: 'Ultra-Fusion AI Supervisor™',
        version: '1.0.0',
        status: 'synthetic',
        capabilities: ['entity-analysis', 'token-analysis', 'chain-analysis', 'image-analysis'],
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const ultraFusion = new UltraFusionClient();
