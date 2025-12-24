/**
 * Global Threat Map API Client
 * Provides access to all threat detection and monitoring endpoints
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://ghostquant-mewzi.ondigitalocean.app';

// ============================================================================
// Types
// ============================================================================

export interface ThreatEvent {
  id: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symbol: string;
  type: string;
  description: string;
  confidence: number;
  impact_score: number;
  value_at_risk: number;
  timestamp: string;
  metadata?: {
    addresses_involved?: number;
    exchanges_affected?: number;
    duration_hours?: number;
  };
}

export interface DarkpoolEvent {
  id: string;
  symbol: string;
  volume_usd: number;
  price: number;
  side: 'buy' | 'sell';
  venue: string;
  execution_type: string;
  institutional_flag: boolean;
  timestamp: string;
  impact_score: number;
  anomaly_detected: boolean;
}

export interface ManipulationAlert {
  id: string;
  symbol: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  volume_affected: number;
  addresses_involved: number;
  exchange: string;
  timestamp: string;
  recommended_action: string;
}

export interface StablecoinFlow {
  id: string;
  stablecoin: string;
  amount: number;
  flow_type: string;
  chain: string;
  from_address: string;
  to_address: string;
  from_label: string | null;
  to_label: string | null;
  tx_hash: string;
  timestamp: string;
  risk_score: number;
}

export interface Liquidation {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  value: number;
  price: number;
  quantity: number;
  exchange: string;
  leverage: number;
  timestamp: string;
}

export interface DerivativesOverview {
  total_open_interest: number;
  total_volume_24h: number;
  total_liquidations_24h: number;
  avg_funding_rate: number;
  long_short_ratio: number;
  top_assets: Array<{
    symbol: string;
    open_interest: number;
    volume_24h: number;
    funding_rate: number;
    liquidations_24h: number;
    long_short_ratio: number;
  }>;
  risk_score: number;
  threat_level: string;
  timestamp: string;
}

export interface RiskDashboard {
  overall_risk_score: number;
  threat_level: string;
  categories: {
    [key: string]: {
      risk_score: number;
      active_threats: number;
      trend: 'increasing' | 'decreasing' | 'stable';
      top_threat: string;
    };
  };
  recent_critical_threats: ThreatEvent[];
  market_sentiment: 'fear' | 'neutral' | 'greed';
  last_updated: string;
}

export interface ThreatHeatmapData {
  symbol: string;
  whales: number;
  manipulation: number;
  darkpool: number;
  stablecoin: number;
  derivatives: number;
  overall: number;
}

export interface TimelineDataPoint {
  timestamp: string;
  overall_risk: number;
  threat_count: number;
  critical_count: number;
  categories: {
    whales: number;
    manipulation: number;
    darkpool: number;
    stablecoin: number;
    derivatives: number;
  };
}

// ============================================================================
// API Functions - Unified Risk
// ============================================================================

export async function fetchAllThreats(params?: {
  limit?: number;
  severity?: string;
  source?: string;
}): Promise<{ threats: ThreatEvent[]; count: number; summary: any }> {
  const { limit = 100, severity, source } = params || {};
  const queryParams = new URLSearchParams({ limit: limit.toString() });
  if (severity) queryParams.append('severity', severity);
  if (source) queryParams.append('source', source);

  const response = await fetch(`${API_BASE}/unified-risk/all-threats?${queryParams}`);
  if (!response.ok) throw new Error(`Failed to fetch threats: ${response.status}`);
  return response.json();
}

export async function fetchRiskDashboard(): Promise<RiskDashboard> {
  const response = await fetch(`${API_BASE}/unified-risk/dashboard`);
  if (!response.ok) throw new Error(`Failed to fetch risk dashboard: ${response.status}`);
  return response.json();
}

export async function fetchThreatTimeline(params?: {
  hours?: number;
  interval?: string;
}): Promise<{ timeline: TimelineDataPoint[]; hours: number; interval: string }> {
  const { hours = 24, interval = '1h' } = params || {};
  const queryParams = new URLSearchParams({
    hours: hours.toString(),
    interval
  });

  const response = await fetch(`${API_BASE}/unified-risk/timeline?${queryParams}`);
  if (!response.ok) throw new Error(`Failed to fetch threat timeline: ${response.status}`);
  return response.json();
}

export async function fetchThreatHeatmap(): Promise<{ heatmap: ThreatHeatmapData[]; categories: string[] }> {
  const response = await fetch(`${API_BASE}/unified-risk/heatmap`);
  if (!response.ok) throw new Error(`Failed to fetch threat heatmap: ${response.status}`);
  return response.json();
}

export async function fetchSymbolThreats(symbol: string, limit?: number): Promise<{
  symbol: string;
  threats: ThreatEvent[];
  risk_score: number;
  threat_level: string;
}> {
  const queryParams = new URLSearchParams({ limit: (limit || 50).toString() });
  const response = await fetch(`${API_BASE}/unified-risk/symbol/${symbol}?${queryParams}`);
  if (!response.ok) throw new Error(`Failed to fetch symbol threats: ${response.status}`);
  return response.json();
}

// ============================================================================
// API Functions - Darkpool
// ============================================================================

export async function fetchDarkpoolActivity(params?: {
  limit?: number;
  symbol?: string;
  min_volume_usd?: number;
}): Promise<{ events: DarkpoolEvent[]; count: number }> {
  const { limit = 50, symbol, min_volume_usd } = params || {};
  const queryParams = new URLSearchParams({ limit: limit.toString() });
  if (symbol) queryParams.append('symbol', symbol);
  if (min_volume_usd) queryParams.append('min_volume_usd', min_volume_usd.toString());

  const response = await fetch(`${API_BASE}/darkpool/activity?${queryParams}`);
  if (!response.ok) throw new Error(`Failed to fetch darkpool activity: ${response.status}`);
  return response.json();
}

export async function fetchDarkpoolSummary(): Promise<{
  total_volume_24h: number;
  total_trades_24h: number;
  risk_score: number;
  threat_level: string;
}> {
  const response = await fetch(`${API_BASE}/darkpool/summary`);
  if (!response.ok) throw new Error(`Failed to fetch darkpool summary: ${response.status}`);
  return response.json();
}

export async function fetchInstitutionalFlow(params?: {
  symbol?: string;
  timeframe?: string;
}): Promise<{
  net_flow: number;
  buy_volume: number;
  sell_volume: number;
  flow_direction: string;
  confidence: number;
}> {
  const { symbol, timeframe = '24h' } = params || {};
  const queryParams = new URLSearchParams({ timeframe });
  if (symbol) queryParams.append('symbol', symbol);

  const response = await fetch(`${API_BASE}/darkpool/institutional-flow?${queryParams}`);
  if (!response.ok) throw new Error(`Failed to fetch institutional flow: ${response.status}`);
  return response.json();
}

// ============================================================================
// API Functions - Manipulation
// ============================================================================

export async function fetchManipulationAlerts(params?: {
  limit?: number;
  symbol?: string;
  severity?: string;
}): Promise<{ alerts: ManipulationAlert[]; count: number }> {
  const { limit = 50, symbol, severity } = params || {};
  const queryParams = new URLSearchParams({ limit: limit.toString() });
  if (symbol) queryParams.append('symbol', symbol);
  if (severity) queryParams.append('severity', severity);

  const response = await fetch(`${API_BASE}/manipulation/alerts?${queryParams}`);
  if (!response.ok) throw new Error(`Failed to fetch manipulation alerts: ${response.status}`);
  return response.json();
}

export async function fetchManipulationSummary(): Promise<{
  total_alerts_24h: number;
  critical_alerts: number;
  risk_score: number;
  threat_level: string;
}> {
  const response = await fetch(`${API_BASE}/manipulation/summary`);
  if (!response.ok) throw new Error(`Failed to fetch manipulation summary: ${response.status}`);
  return response.json();
}

export async function fetchWashTradingDetection(params?: {
  limit?: number;
  min_confidence?: number;
}): Promise<{ detections: any[]; count: number }> {
  const { limit = 50, min_confidence = 0.5 } = params || {};
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    min_confidence: min_confidence.toString()
  });

  const response = await fetch(`${API_BASE}/manipulation/wash-trading?${queryParams}`);
  if (!response.ok) throw new Error(`Failed to fetch wash trading detection: ${response.status}`);
  return response.json();
}

// ============================================================================
// API Functions - Stablecoin
// ============================================================================

export async function fetchStablecoinFlows(params?: {
  limit?: number;
  stablecoin?: string;
  min_amount?: number;
}): Promise<{ flows: StablecoinFlow[]; count: number }> {
  const { limit = 50, stablecoin, min_amount } = params || {};
  const queryParams = new URLSearchParams({ limit: limit.toString() });
  if (stablecoin) queryParams.append('stablecoin', stablecoin);
  if (min_amount) queryParams.append('min_amount', min_amount.toString());

  const response = await fetch(`${API_BASE}/stablecoin/flows?${queryParams}`);
  if (!response.ok) throw new Error(`Failed to fetch stablecoin flows: ${response.status}`);
  return response.json();
}

export async function fetchStablecoinSummary(): Promise<{
  total_market_cap: number;
  total_volume_24h: number;
  net_exchange_flow_24h: number;
  stablecoins: any[];
  risk_score: number;
  threat_level: string;
}> {
  const response = await fetch(`${API_BASE}/stablecoin/summary`);
  if (!response.ok) throw new Error(`Failed to fetch stablecoin summary: ${response.status}`);
  return response.json();
}

export async function fetchDepegAlerts(threshold?: number): Promise<{ alerts: any[]; count: number }> {
  const queryParams = new URLSearchParams({ threshold: (threshold || 0.01).toString() });
  const response = await fetch(`${API_BASE}/stablecoin/depeg-alerts?${queryParams}`);
  if (!response.ok) throw new Error(`Failed to fetch depeg alerts: ${response.status}`);
  return response.json();
}

// ============================================================================
// API Functions - Derivatives
// ============================================================================

export async function fetchDerivativesOverview(): Promise<DerivativesOverview> {
  const response = await fetch(`${API_BASE}/derivatives/overview`);
  if (!response.ok) throw new Error(`Failed to fetch derivatives overview: ${response.status}`);
  return response.json();
}

export async function fetchLiquidations(params?: {
  limit?: number;
  symbol?: string;
  min_value?: number;
}): Promise<{ liquidations: Liquidation[]; count: number; total_value: number }> {
  const { limit = 50, symbol, min_value } = params || {};
  const queryParams = new URLSearchParams({ limit: limit.toString() });
  if (symbol) queryParams.append('symbol', symbol);
  if (min_value) queryParams.append('min_value', min_value.toString());

  const response = await fetch(`${API_BASE}/derivatives/liquidations?${queryParams}`);
  if (!response.ok) throw new Error(`Failed to fetch liquidations: ${response.status}`);
  return response.json();
}

export async function fetchFundingRates(symbol?: string): Promise<{ funding_rates: any[]; count: number }> {
  const queryParams = symbol ? new URLSearchParams({ symbol }) : new URLSearchParams();
  const response = await fetch(`${API_BASE}/derivatives/funding-rates?${queryParams}`);
  if (!response.ok) throw new Error(`Failed to fetch funding rates: ${response.status}`);
  return response.json();
}

export async function fetchOpenInterest(params?: {
  symbol?: string;
  timeframe?: string;
}): Promise<{ open_interest_data: any[]; total_open_interest: number }> {
  const { symbol, timeframe = '24h' } = params || {};
  const queryParams = new URLSearchParams({ timeframe });
  if (symbol) queryParams.append('symbol', symbol);

  const response = await fetch(`${API_BASE}/derivatives/open-interest?${queryParams}`);
  if (!response.ok) throw new Error(`Failed to fetch open interest: ${response.status}`);
  return response.json();
}

export async function fetchDerivativesRiskAlerts(limit?: number): Promise<{ alerts: any[]; count: number }> {
  const queryParams = new URLSearchParams({ limit: (limit || 20).toString() });
  const response = await fetch(`${API_BASE}/derivatives/risk-alerts?${queryParams}`);
  if (!response.ok) throw new Error(`Failed to fetch derivatives risk alerts: ${response.status}`);
  return response.json();
}

// ============================================================================
// Synthetic Data Generators (Fallback when API unavailable)
// ============================================================================

export function generateSyntheticThreats(): { threats: ThreatEvent[]; count: number; summary: any } {
  const sources = ['hydra', 'whales', 'constellation', 'stablecoin', 'darkpool', 'derivatives'];
  const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
  const types = ['whale_movement', 'price_manipulation', 'liquidity_drain', 'wash_trading', 'flash_loan', 'depeg_risk'];
  const symbols = ['BTC', 'ETH', 'SOL', 'USDT', 'USDC', 'BNB', 'XRP', 'ADA'];
  
  const threats: ThreatEvent[] = Array.from({ length: 20 }, (_, i) => ({
    id: `threat-${i}-${Date.now()}`,
    source: sources[i % sources.length],
    severity: severities[Math.min(Math.floor(i / 5), 3)],
    symbol: symbols[i % symbols.length],
    type: types[i % types.length],
    description: `Detected ${types[i % types.length].replace(/_/g, ' ')} activity on ${symbols[i % symbols.length]}`,
    confidence: 0.65 + Math.random() * 0.3,
    impact_score: 40 + Math.floor(Math.random() * 50),
    value_at_risk: 100000 + Math.floor(Math.random() * 900000),
    timestamp: new Date(Date.now() - i * 1800000).toISOString(),
    metadata: { addresses_involved: 2 + Math.floor(Math.random() * 10), exchanges_affected: 1 + Math.floor(Math.random() * 3) }
  }));
  
  return { threats, count: threats.length, summary: { total: threats.length, critical: 3, high: 5 } };
}

export function generateSyntheticRiskDashboard(): RiskDashboard {
  return {
    overall_risk_score: 45 + Math.floor(Math.random() * 20),
    threat_level: 'ELEVATED',
    categories: {
      whales: { risk_score: 52, active_threats: 8, trend: 'increasing', top_threat: 'Large accumulation detected' },
      manipulation: { risk_score: 38, active_threats: 4, trend: 'stable', top_threat: 'Wash trading suspected' },
      darkpool: { risk_score: 45, active_threats: 6, trend: 'decreasing', top_threat: 'Institutional selling' },
      stablecoin: { risk_score: 28, active_threats: 2, trend: 'stable', top_threat: 'Minor depeg risk' },
      derivatives: { risk_score: 55, active_threats: 9, trend: 'increasing', top_threat: 'High leverage positions' }
    },
    recent_critical_threats: [
      { id: 'crit-1', source: 'whales', severity: 'critical', symbol: 'BTC', type: 'whale_movement', description: 'Large BTC transfer to exchange', confidence: 0.92, impact_score: 85, value_at_risk: 5000000, timestamp: new Date().toISOString() },
      { id: 'crit-2', source: 'derivatives', severity: 'critical', symbol: 'ETH', type: 'liquidation_cascade', description: 'Potential liquidation cascade', confidence: 0.88, impact_score: 78, value_at_risk: 3200000, timestamp: new Date(Date.now() - 3600000).toISOString() }
    ],
    market_sentiment: 'fear',
    last_updated: new Date().toISOString()
  };
}

export function generateSyntheticHeatmap(): { heatmap: ThreatHeatmapData[]; categories: string[] } {
  const symbols = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'MATIC'];
  const heatmap: ThreatHeatmapData[] = symbols.map(symbol => ({
    symbol,
    whales: 20 + Math.floor(Math.random() * 60),
    manipulation: 15 + Math.floor(Math.random() * 50),
    darkpool: 25 + Math.floor(Math.random() * 45),
    stablecoin: 10 + Math.floor(Math.random() * 30),
    derivatives: 30 + Math.floor(Math.random() * 55),
    overall: 25 + Math.floor(Math.random() * 50)
  }));
  return { heatmap, categories: ['whales', 'manipulation', 'darkpool', 'stablecoin', 'derivatives'] };
}

export function generateSyntheticDarkpoolActivity(): { events: DarkpoolEvent[]; count: number } {
  const symbols = ['BTC', 'ETH', 'SOL', 'BNB'];
  const venues = ['Paradigm', 'Galaxy', 'Cumberland', 'Jump'];
  const events: DarkpoolEvent[] = Array.from({ length: 15 }, (_, i) => ({
    id: `dp-${i}-${Date.now()}`,
    symbol: symbols[i % symbols.length],
    volume_usd: 500000 + Math.floor(Math.random() * 4500000),
    price: 40000 + Math.random() * 20000,
    side: i % 2 === 0 ? 'buy' : 'sell',
    venue: venues[i % venues.length],
    execution_type: 'block',
    institutional_flag: true,
    timestamp: new Date(Date.now() - i * 1200000).toISOString(),
    impact_score: 30 + Math.floor(Math.random() * 50),
    anomaly_detected: i < 3
  }));
  return { events, count: events.length };
}

export function generateSyntheticManipulationAlerts(): { alerts: ManipulationAlert[]; count: number } {
  const symbols = ['BTC', 'ETH', 'SOL', 'DOGE', 'SHIB'];
  const types = ['wash_trading', 'spoofing', 'layering', 'pump_dump'];
  const exchanges = ['Binance', 'Coinbase', 'Kraken', 'OKX'];
  const alerts: ManipulationAlert[] = Array.from({ length: 10 }, (_, i) => ({
    id: `manip-${i}-${Date.now()}`,
    symbol: symbols[i % symbols.length],
    type: types[i % types.length],
    severity: i < 2 ? 'critical' : i < 5 ? 'high' : 'medium',
    confidence: 0.7 + Math.random() * 0.25,
    description: `${types[i % types.length].replace(/_/g, ' ')} detected on ${symbols[i % symbols.length]}`,
    volume_affected: 100000 + Math.floor(Math.random() * 900000),
    addresses_involved: 2 + Math.floor(Math.random() * 8),
    exchange: exchanges[i % exchanges.length],
    timestamp: new Date(Date.now() - i * 2400000).toISOString(),
    recommended_action: 'Monitor closely and consider reducing exposure'
  }));
  return { alerts, count: alerts.length };
}

export function generateSyntheticStablecoinFlows(): { flows: StablecoinFlow[]; count: number } {
  const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD'];
  const chains = ['Ethereum', 'BSC', 'Polygon', 'Arbitrum'];
  const flows: StablecoinFlow[] = Array.from({ length: 12 }, (_, i) => ({
    id: `flow-${i}-${Date.now()}`,
    stablecoin: stablecoins[i % stablecoins.length],
    amount: 1000000 + Math.floor(Math.random() * 9000000),
    flow_type: i % 2 === 0 ? 'exchange_inflow' : 'exchange_outflow',
    chain: chains[i % chains.length],
    from_address: `0x${Math.random().toString(16).slice(2, 10)}...`,
    to_address: `0x${Math.random().toString(16).slice(2, 10)}...`,
    from_label: i % 3 === 0 ? 'Binance Hot Wallet' : null,
    to_label: i % 4 === 0 ? 'Unknown Whale' : null,
    tx_hash: `0x${Math.random().toString(16).slice(2, 66)}`,
    timestamp: new Date(Date.now() - i * 1800000).toISOString(),
    risk_score: 20 + Math.floor(Math.random() * 60)
  }));
  return { flows, count: flows.length };
}

export function generateSyntheticDerivativesOverview(): DerivativesOverview {
  return {
    total_open_interest: 45000000000,
    total_volume_24h: 120000000000,
    total_liquidations_24h: 85000000,
    avg_funding_rate: 0.0012,
    long_short_ratio: 1.15,
    top_assets: [
      { symbol: 'BTC', open_interest: 18000000000, volume_24h: 45000000000, funding_rate: 0.0015, liquidations_24h: 32000000, long_short_ratio: 1.2 },
      { symbol: 'ETH', open_interest: 12000000000, volume_24h: 28000000000, funding_rate: 0.0018, liquidations_24h: 25000000, long_short_ratio: 1.1 },
      { symbol: 'SOL', open_interest: 3500000000, volume_24h: 8000000000, funding_rate: 0.0022, liquidations_24h: 8000000, long_short_ratio: 1.3 }
    ],
    risk_score: 55,
    threat_level: 'ELEVATED',
    timestamp: new Date().toISOString()
  };
}
