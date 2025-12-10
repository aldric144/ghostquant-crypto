/**
 * HydraRequestAdapter - Phase 10 Isolated Fix
 * 
 * Request wrapper for Hydra API calls.
 * Constructs proper payloads and handles the ingest + detect flow.
 * 
 * This is a NEW isolated module - does NOT modify any existing code.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

export interface HydraIngestEvent {
  entity: string;
  timestamp: string;
  amount: number;
  chain: string;
  type: string;
  direction: string;
}

export interface HydraIngestResponse {
  success: boolean;
  count: number;
  error?: string;
  timestamp: string;
}

export interface HydraDetectResponse {
  success: boolean;
  report?: {
    cluster: {
      cluster_id: string;
      heads: string[];
      relays: string[];
      proxies: string[];
      risk_level: string;
      risk_score: number;
      indicators: Record<string, number>;
      narrative: string;
      timestamp: string;
    };
    summary: string;
    recommendations: string[];
  };
  error?: string;
  timestamp: string;
}

export interface HydraAdapterResponse {
  success: boolean;
  ingestResult?: HydraIngestResponse;
  detectResult?: HydraDetectResponse;
  error?: string;
  logs: string[];
}

/**
 * Generates synthetic events for the given heads
 * This creates the event data needed for Hydra detection
 */
function generateEventsForHeads(heads: string[]): HydraIngestEvent[] {
  const events: HydraIngestEvent[] = [];
  const now = new Date();
  const chains = ['ethereum', 'polygon', 'arbitrum', 'optimism'];
  const types = ['transfer', 'swap', 'bridge', 'deposit'];
  
  // Generate events for each head with coordinated patterns
  heads.forEach((head, headIndex) => {
    // Each head gets multiple events to establish patterns
    for (let i = 0; i < 5; i++) {
      const timestamp = new Date(now.getTime() - (i * 10 + headIndex * 5) * 60000);
      
      events.push({
        entity: head,
        timestamp: timestamp.toISOString(),
        amount: Math.floor(Math.random() * 100000) + 10000,
        chain: chains[headIndex % chains.length],
        type: types[i % types.length],
        direction: i % 2 === 0 ? 'in' : 'out',
      });
    }
  });

  // Add cross-head events to establish coordination
  for (let i = 0; i < heads.length - 1; i++) {
    const timestamp = new Date(now.getTime() - (i * 3) * 60000);
    events.push({
      entity: heads[i],
      timestamp: timestamp.toISOString(),
      amount: Math.floor(Math.random() * 50000) + 5000,
      chain: 'ethereum',
      type: 'transfer',
      direction: 'out',
    });
    events.push({
      entity: heads[i + 1],
      timestamp: new Date(timestamp.getTime() + 30000).toISOString(),
      amount: Math.floor(Math.random() * 50000) + 5000,
      chain: 'ethereum',
      type: 'transfer',
      direction: 'in',
    });
  }

  return events;
}

/**
 * Ingests events into the Hydra engine
 */
async function ingestEvents(events: HydraIngestEvent[]): Promise<HydraIngestResponse> {
  const response = await fetch(`${API_BASE}/hydra/hydra/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ events }),
  });

  return response.json();
}

/**
 * Runs Hydra detection
 */
async function runDetection(): Promise<HydraDetectResponse> {
  const response = await fetch(`${API_BASE}/hydra/hydra/detect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}

/**
 * Adapter detect response from the backend adapter endpoint
 */
interface AdapterDetectResponse {
  success: boolean;
  cluster?: {
    cluster_id: string;
    heads: string[];
    relays: string[];
    proxies: string[];
    risk_level: string;
    risk_score: number;
    indicators: Record<string, number>;
    narrative: string;
    timestamp: string;
    source?: string;
  };
  error?: string;
  timestamp: string;
}

/**
 * Main adapter function - handles the complete Hydra flow via the adapter endpoint
 * 
 * This function now calls the /hydra-adapter/detect endpoint which:
 * 1. Normalizes input (handles demo/bootstrap modes)
 * 2. Ensures ≥2 heads are always present
 * 3. Generates events and runs detection
 * 4. Returns the cluster result
 * 
 * @param heads - Array of validated Ethereum addresses
 * @param mode - Optional mode: "demo" or "bootstrap" for special handling
 * @returns HydraAdapterResponse with full results and logs
 */
export async function executeHydraDetection(heads: string[], mode?: string): Promise<HydraAdapterResponse> {
  const logs: string[] = [];
  
  try {
    logs.push(`[HydraAdapter] Starting detection with ${heads.length} heads via adapter endpoint`);
    if (mode) {
      logs.push(`[HydraAdapter] Mode: ${mode}`);
    }
    if (heads.length > 0) {
      logs.push(`[HydraAdapter] Heads: ${heads.map(h => h.slice(0, 10) + '...').join(', ')}`);
    }

    // Call the adapter endpoint which handles normalization and ensures ≥2 heads
    logs.push(`[HydraAdapter] Calling ${API_BASE}/hydra-adapter/detect`);
    
    const response = await fetch(`${API_BASE}/hydra-adapter/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        heads: heads.length > 0 ? heads : undefined,
        mode: mode 
      }),
    });

    const adapterResult: AdapterDetectResponse = await response.json();
    logs.push(`[HydraAdapter] Adapter result: success=${adapterResult.success}`);

    if (!adapterResult.success) {
      logs.push(`[HydraAdapter] Adapter error: ${adapterResult.error}`);
      return {
        success: false,
        error: adapterResult.error || 'Detection failed',
        logs,
      };
    }

    logs.push(`[HydraAdapter] Detection successful!`);
    if (adapterResult.cluster) {
      logs.push(`[HydraAdapter] Cluster ID: ${adapterResult.cluster.cluster_id}`);
      logs.push(`[HydraAdapter] Risk Level: ${adapterResult.cluster.risk_level}`);
      logs.push(`[HydraAdapter] Heads detected: ${adapterResult.cluster.heads?.length || 0}`);
      logs.push(`[HydraAdapter] Source: ${adapterResult.cluster.source || 'unknown'}`);
    }

    // Convert adapter response to the expected format
    const detectResult: HydraDetectResponse = {
      success: true,
      report: adapterResult.cluster ? {
        cluster: adapterResult.cluster,
        summary: adapterResult.cluster.narrative,
        recommendations: [
          'Monitor these addresses for coordinated activity',
          'Review transaction patterns for potential manipulation',
          'Consider adding to watchlist for ongoing surveillance'
        ],
      } : undefined,
      timestamp: adapterResult.timestamp,
    };

    return {
      success: true,
      detectResult,
      logs,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logs.push(`[HydraAdapter] Error: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
      logs,
    };
  }
}

/**
 * Execute Hydra detection in demo mode
 * Uses predefined demo addresses to demonstrate the system
 */
export async function executeHydraDemoDetection(): Promise<HydraAdapterResponse> {
  return executeHydraDetection([], 'demo');
}

/**
 * Execute Hydra detection in bootstrap mode
 * Uses well-known token addresses for initial system setup
 */
export async function executeHydraBootstrapDetection(): Promise<HydraAdapterResponse> {
  return executeHydraDetection([], 'bootstrap');
}

/**
 * Fetches the latest Hydra cluster
 */
export async function fetchHydraCluster() {
  const response = await fetch(`${API_BASE}/hydra/hydra/cluster`);
  return response.json();
}

/**
 * Fetches the latest Hydra indicators
 */
export async function fetchHydraIndicators() {
  const response = await fetch(`${API_BASE}/hydra/hydra/indicators`);
  return response.json();
}

/**
 * Fetches Hydra health status
 */
export async function fetchHydraHealth() {
  const response = await fetch(`${API_BASE}/hydra/hydra/health`);
  return response.json();
}

export default {
  executeHydraDetection,
  fetchHydraCluster,
  fetchHydraIndicators,
  fetchHydraHealth,
};
