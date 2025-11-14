
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export interface Asset {
  coin_id: string | null;
  symbol: string;
  name: string;
  image: string;
  price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  momentum_score: number;
  trend_score: number;
  pretrend: number;
  whale_confidence: number;
  signal: string;
  price_change_percentage_1h?: number;
  price_change_percentage_24h?: number;
  price_change_percentage_7d?: number;
  sparkline_7d?: number[];
  last_updated: string | null;
}

export interface WhaleExplainResponse {
  symbol: string;
  summary: string;
  confidence: number;
  drivers: Array<{
    type: string;
    desc: string;
    value: string | number;
    unit: string;
    time: string;
  }>;
  source: string[];
  data_type?: string;
  note?: string;
  raw?: any;
}

export interface LiquidityResponse {
  symbol: string;
  best_exchanges: Array<{
    exchange: string;
    pair: string;
    url: string;
    volume_24h: number;
  }>;
  slippage_1pct_size?: number;
}

export async function fetchAllAssets(params?: {
  limit?: number;
  sort?: string;
}): Promise<Asset[]> {
  const { limit = 500, sort = 'momentum' } = params || {};
  const response = await fetch(`${API_BASE}/dashboard/top-movers?limit=${limit}&sort=${sort}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch assets: ${response.status}`);
  }
  
  return response.json();
}

export async function fetchWhaleExplain(symbol: string): Promise<WhaleExplainResponse> {
  const encodedSymbol = encodeURIComponent(symbol);
  
  let response = await fetch(`${API_BASE}/insights/whale-explain?symbol=${encodedSymbol}`);
  
  if (response.status === 404) {
    response = await fetch(`${API_BASE}/insights/whale-explain-lite?symbol=${encodedSymbol}`);
  }
  
  if (!response.ok) {
    throw new Error(`Failed to fetch whale explanation: ${response.status}`);
  }
  
  return response.json();
}

export async function fetchLiquidity(symbol: string): Promise<LiquidityResponse> {
  return {
    symbol,
    best_exchanges: [
      {
        exchange: 'Binance',
        pair: `${symbol}/USDT`,
        url: `https://www.binance.com/en/trade/${symbol}_USDT`,
        volume_24h: 1000000000,
      },
      {
        exchange: 'Coinbase',
        pair: `${symbol}/USD`,
        url: `https://www.coinbase.com/price/${symbol.toLowerCase()}`,
        volume_24h: 500000000,
      },
      {
        exchange: 'Kraken',
        pair: `${symbol}/USD`,
        url: `https://www.kraken.com/prices/${symbol.toLowerCase()}`,
        volume_24h: 250000000,
      },
    ],
    slippage_1pct_size: 100000,
  };
}

export class CacheManager {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number;

  constructor(ttlSeconds: number = 30) {
    this.ttl = ttlSeconds * 1000;
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const assetsCache = new CacheManager(30); // 30s cache
export const whaleExplainCache = new CacheManager(120); // 120s cache
