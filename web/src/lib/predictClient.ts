/**
 * GhostPredictor™ Prediction Client
 * 
 * TypeScript client for interacting with the GhostPredictor™ ML API.
 * Provides methods for event, entity, token, ring, and chain predictions.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export interface PredictionResponse {
  success: boolean;
  error?: string;
  model_name?: string;
  version?: number;
  risk_score?: number;
  confidence?: number;
  classification?: string;
  manipulation_probability?: number;
  behavioral_risk?: string;
  direction?: string;
  ring_probability?: number;
  pressure_score?: number;
}

export interface BatchPredictionResponse {
  success: boolean;
  error?: string;
  model_name?: string;
  version?: number;
  predictions?: Array<{
    success: boolean;
    error?: string;
    risk_score?: number;
    confidence?: number;
    classification?: string;
  }>;
  total?: number;
  successful?: number;
}

export interface ChampionResponse {
  success: boolean;
  error?: string;
  model_name?: string;
  version?: number;
  f1_score?: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  timestamp?: string;
  file_path?: string;
}

export class PredictClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_BASE;
  }

  /**
   * Predict risk level for a given event
   * 
   * @param event - Event data object
   * @returns Prediction with risk score, confidence, and classification
   */
  async predictEvent(event: Record<string, any>): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event }),
      });

      if (!response.ok) {
        console.error(`[PredictClient] Event prediction failed: ${response.status}`);
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PredictClient] Error in predictEvent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Predict manipulation probability and behavioral risk for an entity
   * 
   * @param entity - Entity data object
   * @returns Prediction with manipulation probability and behavioral risk
   */
  async predictEntity(entity: Record<string, any>): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict/entity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entity }),
      });

      if (!response.ok) {
        console.error(`[PredictClient] Entity prediction failed: ${response.status}`);
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PredictClient] Error in predictEntity:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Predict price direction for a token
   * 
   * @param token - Token data object
   * @returns Prediction with direction (up/down/flat) and confidence
   */
  async predictToken(token: Record<string, any>): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        console.error(`[PredictClient] Token prediction failed: ${response.status}`);
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PredictClient] Error in predictToken:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Predict ring formation probability
   * 
   * @param entities - Array of entity data objects
   * @returns Prediction with ring formation probability
   */
  async predictRing(entities: Array<Record<string, any>>): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict/ring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entities }),
      });

      if (!response.ok) {
        console.error(`[PredictClient] Ring prediction failed: ${response.status}`);
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PredictClient] Error in predictRing:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Predict chain pressure score
   * 
   * @param chain - Chain data object
   * @returns Prediction with pressure score and classification
   */
  async predictChain(chain: Record<string, any>): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict/chain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chain }),
      });

      if (!response.ok) {
        console.error(`[PredictClient] Chain prediction failed: ${response.status}`);
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PredictClient] Error in predictChain:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Predict risk for multiple events in batch
   * 
   * @param events - Array of event data objects
   * @returns Batch prediction results with statistics
   */
  async predictBatch(events: Array<Record<string, any>>): Promise<BatchPredictionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        console.error(`[PredictClient] Batch prediction failed: ${response.status}`);
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PredictClient] Error in predictBatch:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get champion model metadata
   * 
   * @returns Champion model information including name, version, and metrics
   */
  async getChampion(): Promise<ChampionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict/champion`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`[PredictClient] Get champion failed: ${response.status}`);
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PredictClient] Error in getChampion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const predictClient = new PredictClient();
