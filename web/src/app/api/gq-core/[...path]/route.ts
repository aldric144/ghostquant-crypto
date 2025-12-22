/**
 * GQ-Core API Proxy Route
 * 
 * Layer 3: Frontend Fallback Firewall
 * 
 * Forwards all /api/gq-core/* requests to the backend /gq-core/* endpoints.
 * Implements automatic retry with synthetic fallback to prevent blank UI states.
 * 
 * Features:
 * - Automatic retry on failure (up to 2 attempts)
 * - Synthetic fallback data generation
 * - Source indicator (real vs synthetic)
 * - Never returns empty/null data
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://ghostquant-mewzi.ondigitalocean.app';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

// Synthetic fallback data generators for each endpoint
const syntheticFallbacks: Record<string, () => Record<string, unknown>> = {
  'overview': () => ({
    risk: { overall_score: 0.65, threat_level: 'medium', distribution: { high: 15, medium: 35, low: 50 }, top_risks: [], trend: 'stable' },
    whales: { total_whales: 1250, active_24h: 89, total_volume: 4500000000, top_whales: [], recent_movements: [] },
    rings: { total_rings: 12, active_rings: 3, rings: [], severity_distribution: { high: 2, medium: 5, low: 5 } },
    anomalies: { total_anomalies: 14, critical_count: 2, outliers: [], patterns: [] },
    system: { websocket: { status: 'connected', clients: 5, latency_ms: 45 }, worker: { status: 'running', pid: 1, events_processed: 15000, errors: 0 }, redis: { status: 'connected', latency_ms: 12, total_events: 50000 }, engines: {}, uptime_seconds: 86400, mode: 'synthetic' }
  }),
  'risk': () => ({
    overall_score: 0.65,
    threat_level: 'medium',
    distribution: { high: 15, medium: 35, low: 50 },
    top_risks: generateSyntheticRisks(10),
    trend: 'stable'
  }),
  'whales': () => ({
    total_whales: 1250,
    active_24h: 89,
    total_volume: 4500000000,
    top_whales: generateSyntheticWhales(10),
    recent_movements: generateSyntheticMovements(20)
  }),
  'trends': () => ({
    hourly_activity: generateSyntheticHourlyActivity(),
    heatmap: generateSyntheticHeatmap(),
    events: generateSyntheticEvents(15),
    categories: ['whale', 'manipulation', 'darkpool', 'stablecoin', 'derivatives']
  }),
  'map': () => ({
    hot_zones: generateSyntheticHotZones(8),
    connections: generateSyntheticConnections(20),
    threat_count: 54,
    market_sentiment: 'neutral'
  }),
  'anomalies': () => ({
    total_anomalies: 14,
    critical_count: 2,
    outliers: generateSyntheticOutliers(10),
    patterns: generateSyntheticPatterns(5)
  }),
  'entities': () => ({
    total_entities: 10289,
    active_entities: 1450,
    entities: generateSyntheticEntities(20),
    categories: { whale: 1250, institution: 450, manipulation: 89, darkpool: 120, stablecoin: 200, derivatives: 180 }
  }),
  'narratives': () => ({
    summary: 'Market showing moderate activity with elevated whale movements. Risk levels stable.',
    top_threats: ['Large whale accumulation detected', 'Unusual darkpool activity', 'Cross-chain bridge flows elevated'],
    topics: ['DeFi', 'L2 Scaling', 'Stablecoin Flows', 'Whale Movements']
  }),
  'rings': () => ({
    total_rings: 12,
    active_rings: 3,
    rings: generateSyntheticRings(3),
    severity_distribution: { high: 2, medium: 5, low: 5 }
  }),
  'system-status': () => ({
    websocket: { status: 'connected', clients: 5, latency_ms: 45 },
    worker: { status: 'running', pid: 1, events_processed: 15000, errors: 0 },
    redis: { status: 'connected', latency_ms: 12, total_events: 50000 },
    engines: { unified_risk: 'online', whale_intel: 'online', manipulation: 'online', darkpool: 'online', stablecoin: 'online', derivatives: 'online' },
    uptime_seconds: 86400,
    mode: 'synthetic'
  }),
  'health': () => ({
    status: 'healthy',
    service: 'gq-core',
    version: '1.0.0'
  }),
  'ecosystems': () => ({
    ecosystems: generateSyntheticEcosystems()
  }),
};

// Helper functions for synthetic data generation
function generateSyntheticRisks(count: number) {
  const symbols = ['ETH', 'BTC', 'SOL', 'MATIC', 'ARB', 'OP', 'AVAX', 'DOT', 'LINK', 'ATOM'];
  const types = ['whale_movement', 'manipulation', 'darkpool', 'liquidation', 'bridge_flow'];
  return Array.from({ length: count }, (_, i) => ({
    id: `risk-${i}`,
    symbol: symbols[i % symbols.length],
    type: types[i % types.length],
    score: 0.5 + Math.random() * 0.5,
    chain: ['ethereum', 'solana', 'arbitrum', 'polygon'][i % 4],
    timestamp: new Date(Date.now() - i * 300000).toISOString()
  }));
}

function generateSyntheticWhales(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `whale-${i}`,
    address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    label: ['Smart Money', 'Institution', 'Market Maker', 'DeFi Whale'][i % 4],
    balance_usd: 10000000 + Math.random() * 990000000,
    pnl_24h: (Math.random() - 0.5) * 2000000,
    activity_score: 0.5 + Math.random() * 0.5,
    chains: ['ethereum', 'solana', 'arbitrum'].slice(0, 1 + (i % 3))
  }));
}

function generateSyntheticMovements(count: number) {
  const types = ['transfer', 'swap', 'bridge', 'deposit', 'withdraw'];
  const tokens = ['ETH', 'USDC', 'USDT', 'WBTC', 'SOL'];
  return Array.from({ length: count }, (_, i) => ({
    id: `movement-${i}`,
    whale_id: `whale-${i % 10}`,
    type: types[i % types.length],
    amount_usd: 100000 + Math.random() * 9900000,
    token: tokens[i % tokens.length],
    chain: ['ethereum', 'solana', 'arbitrum', 'polygon'][i % 4],
    timestamp: new Date(Date.now() - i * 60000).toISOString()
  }));
}

function generateSyntheticHourlyActivity() {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    value: 50 + Math.random() * 100,
    type: 'activity'
  }));
}

function generateSyntheticHeatmap() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const result = [];
  for (const day of days) {
    for (let hour = 0; hour < 24; hour++) {
      result.push({ day, hour, value: Math.random() * 100 });
    }
  }
  return result;
}

function generateSyntheticEvents(count: number) {
  const types = ['whale_alert', 'manipulation_detected', 'large_transfer', 'liquidation', 'bridge_flow'];
  const severities = ['high', 'medium', 'low'];
  return Array.from({ length: count }, (_, i) => ({
    id: `event-${i}`,
    type: types[i % types.length],
    description: `Synthetic event ${i + 1}`,
    severity: severities[i % severities.length],
    timestamp: new Date(Date.now() - i * 120000).toISOString()
  }));
}

function generateSyntheticHotZones(count: number) {
  const chains = ['ethereum', 'solana', 'arbitrum', 'polygon', 'optimism', 'avalanche', 'bsc', 'base'];
  return chains.slice(0, count).map((chain, i) => ({
    id: chain,
    name: chain.charAt(0).toUpperCase() + chain.slice(1),
    risk_score: 0.3 + Math.random() * 0.6,
    threat_count: Math.floor(5 + Math.random() * 20),
    volume_24h: 100000000 + Math.random() * 900000000
  }));
}

function generateSyntheticConnections(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `conn-${i}`,
    source: `entity-${i % 10}`,
    target: `entity-${(i + 5) % 10}`,
    weight: Math.random(),
    type: ['transfer', 'swap', 'bridge'][i % 3]
  }));
}

function generateSyntheticOutliers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `outlier-${i}`,
    type: ['volume_spike', 'price_deviation', 'activity_burst'][i % 3],
    severity: ['high', 'medium', 'low'][i % 3],
    value: Math.random() * 100,
    timestamp: new Date(Date.now() - i * 180000).toISOString()
  }));
}

function generateSyntheticPatterns(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `pattern-${i}`,
    name: ['Accumulation', 'Distribution', 'Wash Trading', 'Spoofing', 'Layering'][i % 5],
    confidence: 0.6 + Math.random() * 0.4,
    occurrences: Math.floor(5 + Math.random() * 20)
  }));
}

function generateSyntheticEntities(count: number) {
  const types = ['whale', 'institution', 'manipulation', 'darkpool', 'stablecoin', 'derivatives'];
  return Array.from({ length: count }, (_, i) => ({
    id: `entity-${i}`,
    address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    type: types[i % types.length],
    risk_score: Math.random(),
    activity_count: Math.floor(10 + Math.random() * 100),
    last_active: new Date(Date.now() - i * 300000).toISOString()
  }));
}

function generateSyntheticRings(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `ring-${String.fromCharCode(65 + i)}`,
    name: `Ring ${String.fromCharCode(65 + i)}`,
    nodes: Array.from({ length: 8 + Math.floor(Math.random() * 7) }, (_, j) => ({
      id: `node-${i}-${j}`,
      address: `0x${Math.random().toString(16).slice(2, 10)}`,
      type: ['wallet', 'contract', 'exchange'][j % 3],
      activity_count: Math.floor(5 + Math.random() * 50)
    })),
    severity: (['high', 'medium', 'low'] as const)[i % 3],
    score: 0.4 + Math.random() * 0.5,
    activity_count: Math.floor(20 + Math.random() * 80),
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    chains: ['ethereum', 'arbitrum', 'polygon'].slice(0, 1 + (i % 3)),
    tokens: ['ETH', 'USDC', 'USDT'].slice(0, 1 + (i % 3)),
    pattern_type: ['wash_trading', 'coordinated_pump', 'layering'][i % 3],
    confidence: 0.5 + Math.random() * 0.4,
    volume: 1000000 + Math.random() * 9000000
  }));
}

function generateSyntheticEcosystems() {
  const chains = ['ethereum', 'solana', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'bsc', 'base'];
  return chains.map(chain => ({
    id: chain,
    name: chain.charAt(0).toUpperCase() + chain.slice(1),
    tvl: 1000000000 + Math.random() * 9000000000,
    volume_24h: 100000000 + Math.random() * 900000000,
    risk_score: 0.3 + Math.random() * 0.6,
    emi_score: 50 + Math.random() * 40
  }));
}

function getSyntheticFallback(path: string): Record<string, unknown> {
  // Handle ecosystem/{chain} paths
  if (path.startsWith('ecosystems/')) {
    const chain = path.replace('ecosystems/', '');
    return {
      id: chain,
      name: chain.charAt(0).toUpperCase() + chain.slice(1),
      symbol: chain.toUpperCase().slice(0, 3),
      metrics: {
        tvl: 1000000000 + Math.random() * 9000000000,
        volume_24h: 100000000 + Math.random() * 900000000,
        tx_count_24h: Math.floor(1000000 + Math.random() * 5000000),
        active_addresses_24h: Math.floor(100000 + Math.random() * 500000),
        gas_price: 10 + Math.random() * 100,
        tps: 100 + Math.random() * 1000
      },
      risk: {
        score: 0.3 + Math.random() * 0.6,
        level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        whale_movements: Math.floor(10 + Math.random() * 50)
      },
      top_protocols: ['Uniswap', 'Aave', 'Lido', 'MakerDAO', 'Curve'].map(name => ({
        name,
        tvl: 1000000000 + Math.random() * 4000000000,
        volume_24h: 100000000 + Math.random() * 900000000
      }))
    };
  }
  
  const generator = syntheticFallbacks[path];
  return generator ? generator() : {};
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function proxyRequest(request: NextRequest, path: string[]) {
  const targetPath = path.join('/');
  const targetUrl = `${BACKEND_URL}/gq-core/${targetPath}`;
  
  let lastError: Error | null = null;
  
  // Retry loop with exponential backoff
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Forward authorization header if present
      const authHeader = request.headers.get('Authorization');
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }
      
      const fetchOptions: RequestInit = {
        method: request.method,
        headers,
      };
      
      // Forward body for POST/PUT/PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const body = await request.json();
          fetchOptions.body = JSON.stringify(body);
        } catch {
          // No body or invalid JSON - continue without body
        }
      }
      
      const response = await fetch(targetUrl, fetchOptions);
      
      // Get response data
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      // If successful, ensure source field is present
      if (response.ok && typeof data === 'object' && data !== null) {
        if (!data.source) {
          data.source = 'real';
        }
        if (!data.timestamp) {
          data.timestamp = new Date().toISOString();
        }
      }
      
      // Return response with same status
      return NextResponse.json(data, { status: response.status });
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`[GQ-Core Proxy] Attempt ${attempt + 1}/${MAX_RETRIES} failed for ${targetUrl}:`, error);
      
      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }
  
  // All retries failed - return synthetic fallback
  console.error(`[GQ-Core Proxy] All retries failed for ${targetUrl}, returning synthetic fallback`);
  
  const syntheticData = getSyntheticFallback(targetPath);
  
  return NextResponse.json({
    source: 'synthetic',
    timestamp: new Date().toISOString(),
    ...syntheticData,
    fallback_reason: `Backend unavailable: ${lastError?.message || 'Unknown error'}`,
    retry_count: MAX_RETRIES
  }, { status: 200 }); // Return 200 with synthetic data to prevent UI errors
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path);
}
