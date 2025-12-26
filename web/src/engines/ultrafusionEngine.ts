/**
 * UltraFusion Local Engine
 * 
 * Aggregates intelligence from local engine states and cached results.
 * Provides synthetic fusion when backend is unavailable.
 * NEVER throws - always returns a valid response.
 */

import { safeString, safeNumber, safeArray } from '../services/predictionService'

// Engine cache for storing results from other engines
interface EngineCacheEntry {
  data: Record<string, unknown>
  timestamp: number
  source: string
}

const engineCache: Map<string, EngineCacheEntry> = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Store engine result in cache
 */
export function cacheEngineResult(engineKey: string, data: Record<string, unknown>, source: string = 'live'): void {
  engineCache.set(engineKey, {
    data,
    timestamp: Date.now(),
    source
  })
}

/**
 * Get cached engine result
 */
export function getCachedEngineResult(engineKey: string): EngineCacheEntry | null {
  const entry = engineCache.get(engineKey)
  if (!entry) return null
  
  // Check if cache is still valid
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    engineCache.delete(engineKey)
    return null
  }
  
  return entry
}

/**
 * Clear all cached results
 */
export function clearEngineCache(): void {
  engineCache.clear()
}

// UltraFusion types
export interface UltraFusionSignals {
  contradiction_score: number
  agreement_score: number
  anomaly_amplification: number
  threat_amplification: number
  cross_ratio: number
  multi_chain_pressure: number
  temporal_escalation: number
  blind_spot_score: number
  data_completeness: number
}

export interface UltraFusionDecision {
  classification: string
  meta_score: number
  confidence: number
  recommendations: string[]
  contradictions: string[]
  blindspots: string[]
}

export interface UltraFusionNarrative {
  identity_view: string
  behavioral_interpretation: string
  fusion_analysis: string
  timeline_synthesis: string
  pattern_justification: string
  threat_projection: string
  contradictions_analysis: string
  blindspots_analysis: string
  analyst_verdict: string
  full_narrative: string
}

export interface UltraFusionSummary {
  id: string
  timestamp: string
  entity: string
  classification: string
  meta_score: number
  confidence: number
  executive_summary: string
  key_findings: string[]
  critical_alerts: string[]
  data_sources: string[]
}

export interface UltraFusionResult {
  success: boolean
  synthetic: boolean
  decision: UltraFusionDecision
  narrative: UltraFusionNarrative
  summary: UltraFusionSummary
  signals: UltraFusionSignals
  bundle: {
    sources: string[]
    entity: string
    token: string
    chain: string
  }
  timestamp: string
  error?: string
}

/**
 * Seeded random for deterministic synthetic results
 */
function seededRandom(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  }
  h = Math.abs(h)
  
  return () => {
    h = Math.imul(h ^ (h >>> 15), 1 | h)
    h = (h + Math.imul(h ^ (h >>> 7), 61 | h)) ^ h
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Generate synthetic UltraFusion result from local engine states
 */
export function generateSyntheticFusion(
  entity?: string,
  token?: string,
  chain?: string
): UltraFusionResult {
  const seedStr = `${entity || ''}:${token || ''}:${chain || ''}:${new Date().toDateString()}`
  const rand = seededRandom(seedStr)
  
  // Try to aggregate from cached engine results
  const whaleData = getCachedEngineResult('whale-intelligence')
  const hydraData = getCachedEngineResult('hydra')
  const correlationData = getCachedEngineResult('correlation')
  const networkData = getCachedEngineResult('network-anomaly')
  const predictionData = getCachedEngineResult('prediction')
  
  // Calculate meta score from cached data or generate synthetic
  let metaScore = 0.5 + rand() * 0.3
  let confidence = 0.6 + rand() * 0.25
  
  const dataSources: string[] = []
  
  if (whaleData) {
    metaScore = (metaScore + safeNumber(whaleData.data.risk_score, 0.5)) / 2
    dataSources.push('Whale Intelligence')
  }
  if (hydraData) {
    metaScore = (metaScore + safeNumber(hydraData.data.risk_score, 0.5)) / 2
    dataSources.push('Hydra Detection')
  }
  if (correlationData) {
    dataSources.push('Correlation Engine')
  }
  if (networkData) {
    dataSources.push('Network Anomaly')
  }
  if (predictionData) {
    confidence = (confidence + safeNumber(predictionData.data.confidence, 0.7)) / 2
    dataSources.push('Prediction Engine')
  }
  
  // If no cached data, use synthetic sources
  if (dataSources.length === 0) {
    dataSources.push('Synthetic-Whale', 'Synthetic-Hydra', 'Synthetic-Correlation', 'Synthetic-Network', 'Synthetic-Prediction')
  }
  
  // Determine classification
  let classification: string
  if (metaScore >= 0.8) {
    classification = 'CRITICAL'
  } else if (metaScore >= 0.6) {
    classification = 'HIGH'
  } else if (metaScore >= 0.4) {
    classification = 'ELEVATED'
  } else if (metaScore >= 0.2) {
    classification = 'MODERATE'
  } else {
    classification = 'LOW'
  }
  
  const entityStr = entity || token || chain || 'Unknown Entity'
  
  // Generate signals
  const signals: UltraFusionSignals = {
    contradiction_score: Math.round(rand() * 30) / 100,
    agreement_score: Math.round((60 + rand() * 35) * 100) / 10000,
    anomaly_amplification: Math.round(rand() * 50) / 100,
    threat_amplification: Math.round(metaScore * 100) / 100,
    cross_ratio: Math.round((40 + rand() * 40) * 100) / 10000,
    multi_chain_pressure: Math.round(rand() * 60) / 100,
    temporal_escalation: Math.round(rand() * 40) / 100,
    blind_spot_score: Math.round(rand() * 25) / 100,
    data_completeness: Math.round((70 + rand() * 25) * 100) / 10000
  }
  
  // Generate decision
  const decision: UltraFusionDecision = {
    classification,
    meta_score: Math.round(metaScore * 1000) / 1000,
    confidence: Math.round(confidence * 1000) / 1000,
    recommendations: [
      `Monitor ${entityStr} for continued activity patterns`,
      'Review cross-chain transaction flows',
      'Consider adding to watchlist for ongoing surveillance',
      'Analyze historical behavior for pattern matching'
    ],
    contradictions: signals.contradiction_score > 0.2 ? [
      'Some engine signals show conflicting risk assessments',
      'Volume patterns inconsistent with price movements'
    ] : [],
    blindspots: signals.blind_spot_score > 0.15 ? [
      'Limited historical data available',
      'Cross-chain activity may not be fully captured'
    ] : []
  }
  
  // Generate narrative
  const narrative: UltraFusionNarrative = {
    identity_view: `Entity ${entityStr} shows ${classification.toLowerCase()} risk characteristics based on behavioral analysis.`,
    behavioral_interpretation: `Activity patterns suggest ${metaScore > 0.5 ? 'elevated' : 'normal'} operational complexity with ${confidence > 0.7 ? 'high' : 'moderate'} confidence.`,
    fusion_analysis: `Meta-intelligence fusion across ${dataSources.length} engines indicates ${classification.toLowerCase()} threat level.`,
    timeline_synthesis: `Recent activity shows ${rand() > 0.5 ? 'increasing' : 'stable'} engagement over the analysis period.`,
    pattern_justification: `Risk assessment based on ${dataSources.join(', ')} correlation analysis.`,
    threat_projection: `Projected threat level: ${classification}. Confidence: ${Math.round(confidence * 100)}%.`,
    contradictions_analysis: decision.contradictions.length > 0 
      ? `${decision.contradictions.length} contradictions detected in engine outputs.`
      : 'No significant contradictions detected across engine outputs.',
    blindspots_analysis: decision.blindspots.length > 0
      ? `${decision.blindspots.length} potential blind spots identified in analysis coverage.`
      : 'Analysis coverage appears comprehensive with minimal blind spots.',
    analyst_verdict: `Based on meta-intelligence fusion, ${entityStr} presents a ${classification.toLowerCase()} risk profile with ${Math.round(confidence * 100)}% confidence. ${metaScore > 0.6 ? 'Recommend enhanced monitoring.' : 'Standard monitoring protocols sufficient.'}`,
    full_narrative: `UltraFusion Meta-Analysis Report\n\nEntity: ${entityStr}\nClassification: ${classification}\nMeta Score: ${Math.round(metaScore * 100)}%\nConfidence: ${Math.round(confidence * 100)}%\n\nThis analysis aggregates intelligence from ${dataSources.length} detection engines to provide a comprehensive risk assessment. ${metaScore > 0.5 ? 'Elevated risk indicators warrant continued surveillance.' : 'Risk indicators within normal parameters.'}`
  }
  
  // Generate summary
  const summary: UltraFusionSummary = {
    id: `uf-${Date.now().toString(16)}`,
    timestamp: new Date().toISOString(),
    entity: entityStr,
    classification,
    meta_score: Math.round(metaScore * 1000) / 1000,
    confidence: Math.round(confidence * 1000) / 1000,
    executive_summary: `Meta-intelligence analysis of ${entityStr} indicates ${classification.toLowerCase()} risk level with ${Math.round(confidence * 100)}% confidence. Analysis aggregated from ${dataSources.length} intelligence engines.`,
    key_findings: [
      `Risk classification: ${classification}`,
      `Meta score: ${Math.round(metaScore * 100)}%`,
      `Data sources: ${dataSources.length} engines`,
      `Signal agreement: ${Math.round(signals.agreement_score * 100)}%`
    ],
    critical_alerts: metaScore > 0.7 ? [
      'Elevated risk indicators detected',
      'Recommend enhanced monitoring protocols'
    ] : [],
    data_sources: dataSources
  }
  
  return {
    success: true,
    synthetic: true,
    decision,
    narrative,
    summary,
    signals,
    bundle: {
      sources: dataSources,
      entity: entity || '',
      token: token || '',
      chain: chain || ''
    },
    timestamp: new Date().toISOString()
  }
}

/**
 * Run UltraFusion analysis with automatic synthetic fallback
 * NEVER throws - always returns a valid UltraFusionResult
 */
export async function runUltraFusion(
  entity?: string,
  token?: string,
  chain?: string
): Promise<UltraFusionResult> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)
  
  try {
    const response = await fetch(`${API_BASE}/ultrafusion/ultrafusion/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity, token, chain }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.warn(`[UltraFusionEngine] API returned ${response.status}, using synthetic fallback`)
      return generateSyntheticFusion(entity, token, chain)
    }
    
    const data = await response.json()
    
    if (!data.success || !data.result) {
      console.warn('[UltraFusionEngine] Invalid response, using synthetic fallback')
      return generateSyntheticFusion(entity, token, chain)
    }
    
    // Normalize and return live result
    return {
      success: true,
      synthetic: false,
      decision: data.result.decision,
      narrative: data.result.narrative,
      summary: data.result.summary,
      signals: data.result.signals,
      bundle: data.result.bundle,
      timestamp: data.timestamp
    }
  } catch (error) {
    clearTimeout(timeoutId)
    console.warn('[UltraFusionEngine] Request failed, using synthetic fallback:', error)
    return generateSyntheticFusion(entity, token, chain)
  }
}

export default {
  runUltraFusion,
  generateSyntheticFusion,
  cacheEngineResult,
  getCachedEngineResult,
  clearEngineCache
}
