/**
 * Unified Prediction Service
 * 
 * Provides a single entry point for all prediction operations.
 * NEVER throws - always returns a valid response with synthetic fallback.
 * Implements AbortController timeout to prevent hung requests.
 */

import { generateSyntheticPrediction, SyntheticPredictionInput, PredictionResult } from '../synthetic/generateSyntheticPrediction'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'
const DEFAULT_TIMEOUT = 8000 // 8 seconds

/**
 * Safe string helper - ensures we always have a valid string
 */
export function safeString(value: unknown, fallback: string = ''): string {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return fallback
  return String(value)
}

/**
 * Safe number helper - ensures we always have a valid number
 */
export function safeNumber(value: unknown, fallback: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) return value
  const parsed = Number(value)
  return isNaN(parsed) ? fallback : parsed
}

/**
 * Safe array helper - ensures we always have a valid array
 */
export function safeArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? value : fallback
}

/**
 * Safe confidence tier helper - ensures valid confidence tier type
 */
function safeConfidenceTier(value: unknown): 'Low' | 'Medium' | 'High' {
  const str = typeof value === 'string' ? value : ''
  if (str === 'Low' || str === 'low') return 'Low'
  if (str === 'High' || str === 'high') return 'High'
  return 'Medium'
}

/**
 * Safe classification helper - ensures valid classification type
 */
function safeClassification(value: unknown): 'low' | 'medium' | 'high' | 'critical' {
  const str = typeof value === 'string' ? value.toLowerCase() : ''
  if (str === 'low') return 'low'
  if (str === 'high') return 'high'
  if (str === 'critical') return 'critical'
  return 'medium'
}

/**
 * Normalize prediction response to ensure consistent structure
 */
function normalizePrediction(data: Record<string, unknown>): PredictionResult {
  return {
    success: true,
    synthetic: false,
    predictionId: safeString(data.predictionId || data.prediction_id, `pred-${Date.now()}`),
    predictionType: safeString(data.predictionType || data.prediction_type, 'general'),
    riskScore: safeNumber(data.riskScore || data.risk_score, 50),
    confidence: safeNumber(data.confidence, 0.7),
    confidenceTier: safeConfidenceTier(data.confidenceTier || data.confidence_tier),
    classification: safeClassification(data.classification),
    timeHorizon: safeString(data.timeHorizon || data.time_horizon, '24h'),
    summary: safeString(data.summary, 'Prediction analysis complete.'),
    explanation: safeString(data.explanation, 'Analysis based on available market data.'),
    signals: safeArray(data.signals, []),
    probabilityBands: data.probabilityBands as Record<string, number> || {
      low: 0.2,
      medium: 0.5,
      high: 0.3
    },
    engineSources: safeArray(data.engineSources || data.engine_sources, ['GhostPredictor']),
    timestamp: safeString(data.timestamp, new Date().toISOString())
  }
}

/**
 * Run a prediction with automatic synthetic fallback
 * NEVER throws - always returns a valid PredictionResult
 */
export async function runPrediction(input: SyntheticPredictionInput): Promise<PredictionResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

  try {
    const response = await fetch(`${API_BASE}/gq-core/predict`, {
      method: 'POST',
      body: JSON.stringify(input),
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`[PredictionService] API returned ${response.status}, using synthetic fallback`)
      return generateSyntheticPrediction(input)
    }

    const data = await response.json()
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      console.warn('[PredictionService] Invalid response structure, using synthetic fallback')
      return generateSyntheticPrediction(input)
    }

    return normalizePrediction(data)
  } catch (error) {
    clearTimeout(timeoutId)
    console.warn('[PredictionService] Request failed, using synthetic fallback:', error)
    return generateSyntheticPrediction(input)
  }
}

/**
 * Run entity prediction
 */
export async function runEntityPrediction(entityAddress: string): Promise<PredictionResult> {
  return runPrediction({
    type: 'entity',
    entity: entityAddress,
    context: { source: 'entity-analysis' }
  })
}

/**
 * Run token prediction
 */
export async function runTokenPrediction(token: string, chain?: string): Promise<PredictionResult> {
  return runPrediction({
    type: 'token',
    token,
    chain: chain || 'ethereum',
    context: { source: 'token-analysis' }
  })
}

/**
 * Run chain prediction
 */
export async function runChainPrediction(chain: string): Promise<PredictionResult> {
  return runPrediction({
    type: 'chain',
    chain,
    context: { source: 'chain-analysis' }
  })
}

/**
 * Run risk prediction
 */
export async function runRiskPrediction(input: SyntheticPredictionInput): Promise<PredictionResult> {
  return runPrediction({
    ...input,
    type: 'risk',
    context: { ...input.context, source: 'risk-analysis' }
  })
}

/**
 * Run scenario prediction
 */
export async function runScenarioPrediction(scenario: string, parameters?: Record<string, unknown>): Promise<PredictionResult> {
  return runPrediction({
    type: 'scenario',
    scenario,
    context: { parameters, source: 'scenario-analysis' }
  })
}

/**
 * Run backtest prediction
 */
export async function runBacktestPrediction(strategy: string, parameters?: Record<string, unknown>): Promise<PredictionResult> {
  return runPrediction({
    type: 'backtest',
    strategy,
    context: { parameters, source: 'backtest-analysis' }
  })
}

/**
 * Run forecast prediction
 */
export async function runForecastPrediction(asset: string, horizon?: string): Promise<PredictionResult> {
  return runPrediction({
    type: 'forecast',
    asset,
    timeHorizon: horizon || '24h',
    context: { source: 'forecast-analysis' }
  })
}

export default {
  runPrediction,
  runEntityPrediction,
  runTokenPrediction,
  runChainPrediction,
  runRiskPrediction,
  runScenarioPrediction,
  runBacktestPrediction,
  runForecastPrediction,
  safeString,
  safeNumber,
  safeArray
}
