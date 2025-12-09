
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://ghostquant-mewzi.ondigitalocean.app';

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
  const { limit = 200, sort = 'momentum' } = params || {};
  const response = await fetch(`${API_BASE}/market/top-movers?limit=${limit}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch assets: ${response.status}`);
  }
  
  const result = await response.json();
  // Handle new API response format
  if (result.data) {
    const gainers = result.data.gainers || [];
    const losers = result.data.losers || [];
    return [...gainers, ...losers].map((coin: any) => ({
      coin_id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image || '',
      price: coin.price || 0,
      market_cap: coin.market_cap || 0,
      market_cap_rank: coin.rank || 0,
      total_volume: coin.volume_24h || 0,
      momentum_score: Math.abs(coin.change_24h || 0) * 10,
      trend_score: coin.change_24h > 0 ? 1 : -1,
      pretrend: 0,
      whale_confidence: 0.5,
      signal: coin.change_24h > 0 ? 'bullish' : 'bearish',
      price_change_percentage_24h: coin.change_24h,
      price_change_percentage_7d: coin.change_7d,
      last_updated: coin.last_updated || new Date().toISOString()
    }));
  }
  return result;
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
export const whaleExplainCache = new CacheManager(120);
export const liquidityCache = new CacheManager(60);

export interface LiquidityData {
  symbol: string;
  timestamp: string;
  cex_liquidity: {
    bid_price: number;
    ask_price: number;
    mid_price: number;
    bid_size: number;
    ask_size: number;
    spread_bps: number;
    spread_pct: number;
    avg_spread_1h_bps: number;
    last_updated: string;
  } | null;
  dex_liquidity: Array<{
    pool_id: number;
    chain: string;
    address: string;
    pair: string;
    fee_bps: number;
    tvl_usd: number | null;
    volume_24h: number | null;
    depth_1pct: number | null;
    last_updated: string | null;
  }> | null;
  derivatives: {
    funding_rate_8h: number | null;
    open_interest: number | null;
    basis_bps: number | null;
    liquidations_1h: number | null;
    last_updated: string;
  } | null;
  liquidity_score: number | null;
  slippage_estimates: {
    buy: {
      [key: string]: {
        slippage_bps: number | null;
        effective_price: number | null;
      };
    };
    sell: {
      [key: string]: {
        slippage_bps: number | null;
        effective_price: number | null;
      };
    };
  } | null;
}

/**
 * Fetch comprehensive liquidity data for an asset
 */
export async function fetchLiquidity(
  symbol: string,
  includeDex: boolean = true
): Promise<LiquidityData> {
  const cacheKey = `liquidity:${symbol}:${includeDex}`;
  const cached = liquidityCache.get<LiquidityData>(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch(
    `${API_BASE}/liquidity/asset/${symbol}?include_dex=${includeDex}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch liquidity for ${symbol}: ${response.status}`);
  }
  
  const data = await response.json();
  liquidityCache.set(cacheKey, data);
  return data;
} // 120s cache
