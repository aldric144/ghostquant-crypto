/**
 * Phantom Deception Engine™ - Frontend Client
 * TypeScript client for fraud detection and deception analysis
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

export interface PhantomAnalyzeRequest {
  transcript: string;
  metadata?: Record<string, any>;
}

export interface PhantomSignature {
  label: string;
  score: number;
  pattern: string;
  risk_level: string;
}

export interface PhantomResult {
  id: string;
  timestamp: string;
  deception_score: number;
  intent_score: number;
  synthetic_probability: number;
  actor_type: string;
  classification: string;
  flags: string[];
  summary: string;
  narrative: string;
  features_used: Record<string, any>;
  signature?: PhantomSignature;
}

export interface AnalyzeResponse {
  success: boolean;
  result?: PhantomResult;
  error?: string;
  timestamp: string;
}

export interface BatchResponse {
  success: boolean;
  results: PhantomResult[];
  count: number;
  errors: number;
  timestamp: string;
}

export interface SignatureType {
  label: string;
  description: string;
  risk_level: string;
  characteristics: string[];
}

export interface SignatureTypesResponse {
  success: boolean;
  signature_types: SignatureType[];
  count: number;
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  engine: string;
  signature_types: number;
  timestamp: string;
}

/**
 * Phantom API Client
 */
export const phantomClient = {
  /**
   * Analyze transcript for deception indicators
   */
  async analyze(transcript: string, metadata?: Record<string, any>): Promise<AnalyzeResponse> {
    try {
      const response = await fetch(`${API_BASE}/phantom/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript, metadata }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP error ${response.status}`,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PhantomClient] Analyze error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Batch analyze multiple transcripts
   */
  async batch(items: PhantomAnalyzeRequest[]): Promise<BatchResponse> {
    try {
      const response = await fetch(`${API_BASE}/phantom/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        return {
          success: false,
          results: [],
          count: 0,
          errors: items.length,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PhantomClient] Batch error:', error);
      return {
        success: false,
        results: [],
        count: 0,
        errors: items.length,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get all signature types
   */
  async getSignatureTypes(): Promise<SignatureTypesResponse> {
    try {
      const response = await fetch(`${API_BASE}/phantom/signature-types`);

      if (!response.ok) {
        return {
          success: false,
          signature_types: [],
          count: 0,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PhantomClient] Get signature types error:', error);
      return {
        success: false,
        signature_types: [],
        count: 0,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Health check
   */
  async health(): Promise<HealthResponse | { success: false; error: string }> {
    try {
      const response = await fetch(`${API_BASE}/phantom/health`);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP error ${response.status}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PhantomClient] Health check error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
