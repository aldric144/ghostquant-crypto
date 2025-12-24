/**
 * Synthetic Visual Data Generators
 * 
 * Deterministic, seeded generators for all visualization types.
 * Used when live data is unavailable to maintain visual continuity.
 */

import { seededRandom, TimeSeriesPoint, BarPoint, ScatterPoint, LinePoint, TableRow } from './visualizationNormalizer'

// Context types for generators
interface TimeSeriesContext {
  seed: string
  minLength: number
  nowAnchor: number
}

interface BarContext {
  seed: string
  minLength: number
}

interface MatrixContext {
  seed: string
  rows: number
  cols: number
}

// Common crypto symbols for realistic data
const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'SOL', 'AVAX', 'ARB', 'OP', 'MATIC', 'LINK', 'UNI', 'AAVE', 'DOT', 'ATOM']
const EXCHANGES = ['Binance', 'Coinbase', 'Kraken', 'OKX', 'Bybit', 'KuCoin', 'Gate.io', 'Bitfinex']

/**
 * Generate synthetic volume change data (24h)
 */
export function generateVolumeChangeData(ctx: BarContext): BarPoint[] {
  const rand = seededRandom(ctx.seed + ':volume')
  const count = Math.max(ctx.minLength, 10)
  
  return CRYPTO_SYMBOLS.slice(0, count).map(symbol => ({
    name: symbol,
    value: Math.round((rand() * 200 - 50) * 100) / 100, // -50% to +150%
    synthetic: true
  }))
}

/**
 * Generate synthetic volatility vs momentum data
 */
export interface VolatilityMomentumPoint extends LinePoint {
  name: string
  volatility: number
  momentum: number
  synthetic?: boolean
}

export function generateVolatilityMomentumData(ctx: BarContext): VolatilityMomentumPoint[] {
  const rand = seededRandom(ctx.seed + ':volatility')
  const count = Math.max(ctx.minLength, 10)
  
  return CRYPTO_SYMBOLS.slice(0, count).map(symbol => ({
    name: symbol,
    volatility: Math.round(rand() * 80 * 100) / 100, // 0-80%
    momentum: Math.round((rand() * 100 - 50) * 100) / 100, // -50 to +50
    synthetic: true
  }))
}

/**
 * Generate synthetic price change distribution data
 */
export interface PriceChangePoint extends LinePoint {
  name: string
  change: number
  synthetic?: boolean
}

export function generatePriceChangeData(ctx: BarContext): PriceChangePoint[] {
  const rand = seededRandom(ctx.seed + ':pricechange')
  const count = Math.max(ctx.minLength, 10)
  
  return CRYPTO_SYMBOLS.slice(0, count).map(symbol => ({
    name: symbol,
    change: Math.round((rand() * 40 - 20) * 100) / 100, // -20% to +20%
    synthetic: true
  }))
}

/**
 * Generate synthetic forecast bands data
 */
export interface ForecastBandPoint extends TimeSeriesPoint {
  upper: number
  lower: number
  predicted: number
  synthetic?: boolean
}

export function generateForecastBands(ctx: TimeSeriesContext): ForecastBandPoint[] {
  const rand = seededRandom(ctx.seed + ':forecast')
  const count = Math.max(ctx.minLength, 24)
  const baseValue = 100
  const points: ForecastBandPoint[] = []
  
  let currentValue = baseValue
  for (let i = 0; i < count; i++) {
    const timestamp = ctx.nowAnchor - (count - i) * 3600000 // Hourly intervals
    const change = (rand() - 0.5) * 5
    currentValue = Math.max(50, Math.min(150, currentValue + change))
    
    const uncertainty = 5 + rand() * 10
    points.push({
      t: timestamp,
      y: currentValue,
      predicted: currentValue + (rand() - 0.5) * 3,
      upper: currentValue + uncertainty,
      lower: currentValue - uncertainty,
      synthetic: true
    })
  }
  
  return points
}

/**
 * Generate synthetic scenario projection data
 */
export interface ScenarioProjection extends TableRow {
  id: string
  name: string
  type: string
  status: string
  baseCase: number
  bullCase: number
  bearCase: number
  probability: number
  impact: string
  synthetic?: boolean
}

export function generateScenarioProjections(ctx: BarContext): ScenarioProjection[] {
  const rand = seededRandom(ctx.seed + ':scenario')
  const count = Math.max(ctx.minLength, 8)
  
  const names = ['Market Correction', 'Bull Rally', 'Regulatory Shift', 'Black Swan Event', 'Liquidity Crisis', 'Protocol Upgrade', 'Mass Adoption', 'Stablecoin Depeg']
  const types = ['market', 'regulatory', 'technical', 'economic', 'geopolitical']
  const statuses = ['active', 'completed', 'pending_review', 'archived']
  const impacts = ['critical', 'high', 'medium', 'low']
  
  return Array.from({ length: count }, (_, i) => ({
    id: `syn-scenario-${i}`,
    name: names[i % names.length],
    type: types[Math.floor(rand() * types.length)],
    status: statuses[Math.floor(rand() * statuses.length)],
    baseCase: Math.round((rand() * 20 - 10) * 10) / 10,
    bullCase: Math.round((rand() * 50 + 10) * 10) / 10,
    bearCase: Math.round(-(rand() * 50 + 10) * 10) / 10,
    probability: Math.round(rand() * 100),
    impact: impacts[Math.floor(rand() * impacts.length)],
    synthetic: true
  }))
}

/**
 * Generate synthetic backtest curve data
 */
export interface BacktestResult extends TableRow {
  id: string
  name: string
  strategy: string
  status: string
  totalReturn: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  trades: number
  synthetic?: boolean
}

export function generateBacktestCurves(ctx: BarContext): BacktestResult[] {
  const rand = seededRandom(ctx.seed + ':backtest')
  const count = Math.max(ctx.minLength, 10)
  
  const strategies = ['Momentum Alpha', 'Mean Reversion', 'Trend Following', 'Arbitrage Bot', 'Market Making', 'Volatility Harvest', 'DCA Strategy', 'Grid Trading']
  const statuses = ['completed', 'running', 'queued', 'failed']
  
  return Array.from({ length: count }, (_, i) => ({
    id: `syn-backtest-${i}`,
    name: `Backtest #${1000 + i}`,
    strategy: strategies[i % strategies.length],
    status: statuses[Math.floor(rand() * statuses.length)],
    totalReturn: Math.round((rand() * 100 - 20) * 10) / 10,
    sharpeRatio: Math.round(rand() * 3 * 100) / 100,
    maxDrawdown: Math.round(rand() * 30 * 10) / 10,
    winRate: Math.round((40 + rand() * 40) * 10) / 10,
    trades: Math.floor(rand() * 500) + 50,
    synthetic: true
  }))
}

/**
 * Generate synthetic correlation matrix
 */
export function generateCorrelationMatrix(ctx: MatrixContext): number[][] {
  const rand = seededRandom(ctx.seed + ':correlation')
  const matrix: number[][] = []
  
  for (let i = 0; i < ctx.rows; i++) {
    const row: number[] = []
    for (let j = 0; j < ctx.cols; j++) {
      if (i === j) {
        row.push(1.0) // Diagonal is always 1
      } else if (j < i) {
        row.push(matrix[j][i]) // Symmetric
      } else {
        row.push(Math.round((rand() * 2 - 1) * 100) / 100) // -1 to 1
      }
    }
    matrix.push(row)
  }
  
  return matrix
}

/**
 * Generate synthetic forecast data
 */
export interface ForecastData extends TableRow {
  id: string
  asset: string
  currentPrice: number
  predictedPrice: number
  change: number
  confidence: number
  trend: string
  synthetic?: boolean
}

export function generateForecastData(ctx: BarContext): ForecastData[] {
  const rand = seededRandom(ctx.seed + ':forecast')
  const count = Math.max(ctx.minLength, 10)
  
  const prices: Record<string, number> = {
    BTC: 43500, ETH: 2280, SOL: 98, AVAX: 38, ARB: 1.2,
    OP: 3.1, MATIC: 0.85, LINK: 14.5, UNI: 6.2, AAVE: 92
  }
  
  return CRYPTO_SYMBOLS.slice(0, count).map((asset, i) => {
    const currentPrice = prices[asset] || 100
    const change = Math.round((rand() * 30 - 15) * 10) / 10
    const predictedPrice = Math.round(currentPrice * (1 + change / 100) * 100) / 100
    const confidence = Math.round((60 + rand() * 35) * 10) / 10
    const trend = change > 3 ? 'bullish' : change < -3 ? 'bearish' : 'neutral'
    
    return {
      id: `syn-forecast-${i}`,
      asset,
      currentPrice,
      predictedPrice,
      change,
      confidence,
      trend,
      synthetic: true
    }
  })
}

/**
 * Generate synthetic risk prediction data
 */
export interface RiskPrediction extends TableRow {
  id: string
  asset: string
  riskScore: number
  predictedChange: number
  confidence: number
  trend: string
  synthetic?: boolean
}

export function generateRiskPredictions(ctx: BarContext): RiskPrediction[] {
  const rand = seededRandom(ctx.seed + ':risk')
  const count = Math.max(ctx.minLength, 10)
  
  const trends = ['bullish', 'bearish', 'neutral']
  
  return CRYPTO_SYMBOLS.slice(0, count).map((asset, i) => ({
    id: `syn-risk-${i}`,
    asset,
    riskScore: Math.round(rand() * 100),
    predictedChange: Math.round((rand() * 40 - 20) * 10) / 10,
    confidence: Math.round((60 + rand() * 35) * 10) / 10,
    trend: trends[Math.floor(rand() * trends.length)],
    synthetic: true
  }))
}

/**
 * Generate synthetic market trend data
 */
export interface MarketTrend extends TableRow {
  id: string
  symbol: string
  price_change_24h: number
  volume_change_24h: number
  volatility: number
  momentum: number
  trend_direction: string
  synthetic?: boolean
}

export function generateMarketTrends(ctx: BarContext): MarketTrend[] {
  const rand = seededRandom(ctx.seed + ':trends')
  const count = Math.max(ctx.minLength, 15)
  
  const directions = ['bullish', 'bearish', 'neutral']
  
  return CRYPTO_SYMBOLS.slice(0, count).map((symbol, i) => ({
    id: `syn-trend-${i}`,
    symbol,
    price_change_24h: Math.round((rand() * 20 - 10) * 100) / 100,
    volume_change_24h: Math.round((rand() * 200 - 50) * 100) / 100,
    volatility: Math.round(rand() * 0.5 * 1000) / 1000,
    momentum: Math.round((rand() - 0.5) * 1000) / 1000,
    trend_direction: directions[Math.floor(rand() * directions.length)],
    synthetic: true
  }))
}

/**
 * Generate synthetic time series for generic charts
 */
export function generateTimeSeries(ctx: TimeSeriesContext): TimeSeriesPoint[] {
  const rand = seededRandom(ctx.seed + ':timeseries')
  const count = Math.max(ctx.minLength, 24)
  const points: TimeSeriesPoint[] = []
  
  let value = 100
  for (let i = 0; i < count; i++) {
    const timestamp = ctx.nowAnchor - (count - i) * 3600000
    value = Math.max(50, Math.min(150, value + (rand() - 0.5) * 10))
    points.push({
      t: timestamp,
      y: Math.round(value * 100) / 100,
      synthetic: true
    })
  }
  
  return points
}

/**
 * Generate synthetic scatter data
 */
export function generateScatterData(ctx: BarContext): ScatterPoint[] {
  const rand = seededRandom(ctx.seed + ':scatter')
  const count = Math.max(ctx.minLength, 20)
  
  return Array.from({ length: count }, () => ({
    x: Math.round(rand() * 100 * 100) / 100,
    y: Math.round(rand() * 100 * 100) / 100,
    synthetic: true
  }))
}
