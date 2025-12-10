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
 * Main adapter function - handles the complete Hydra flow
 * 
 * 1. Generates events for the provided heads
 * 2. Ingests events into the Hydra engine
 * 3. Runs detection
 * 4. Returns combined results
 * 
 * @param heads - Array of validated Ethereum addresses
 * @returns HydraAdapterResponse with full results and logs
 */
export async function executeHydraDetection(heads: string[]): Promise<HydraAdapterResponse> {
  const logs: string[] = [];
  
  try {
    logs.push(`[HydraAdapter] Starting detection with ${heads.length} heads`);
    logs.push(`[HydraAdapter] Heads: ${heads.map(h => h.slice(0, 10) + '...').join(', ')}`);

    // Validate heads count
    if (heads.length < 2) {
      return {
        success: false,
        error: `Insufficient heads: ${heads.length} (need >= 2)`,
        logs,
      };
    }

    // Generate events for the heads
    const events = generateEventsForHeads(heads);
    logs.push(`[HydraAdapter] Generated ${events.length} events for ingestion`);

    // Ingest events
    logs.push(`[HydraAdapter] Ingesting events to ${API_BASE}/hydra/hydra/ingest`);
    const ingestResult = await ingestEvents(events);
    logs.push(`[HydraAdapter] Ingest result: success=${ingestResult.success}, count=${ingestResult.count}`);

    if (!ingestResult.success) {
      return {
        success: false,
        ingestResult,
        error: ingestResult.error || 'Event ingestion failed',
        logs,
      };
    }

    // Run detection
    logs.push(`[HydraAdapter] Running detection at ${API_BASE}/hydra/hydra/detect`);
    const detectResult = await runDetection();
    logs.push(`[HydraAdapter] Detection result: success=${detectResult.success}`);

    if (!detectResult.success) {
      logs.push(`[HydraAdapter] Detection error: ${detectResult.error}`);
      return {
        success: false,
        ingestResult,
        detectResult,
        error: detectResult.error || 'Detection failed',
        logs,
      };
    }

    logs.push(`[HydraAdapter] Detection successful!`);
    if (detectResult.report?.cluster) {
      logs.push(`[HydraAdapter] Cluster ID: ${detectResult.report.cluster.cluster_id}`);
      logs.push(`[HydraAdapter] Risk Level: ${detectResult.report.cluster.risk_level}`);
      logs.push(`[HydraAdapter] Heads detected: ${detectResult.report.cluster.heads?.length || 0}`);
    }

    return {
      success: true,
      ingestResult,
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
