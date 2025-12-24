/**
 * Global Visualization Normalizer
 * 
 * Ensures all chart/graph/table data is valid before rendering.
 * Auto-injects synthetic fallback data when live data is unavailable.
 */

// Deterministic pseudo-random number generator (mulberry32)
function seededRandom(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }
  return function() {
    h |= 0
    h = h + 0x6D2B79F5 | 0
    let t = Math.imul(h ^ h >>> 15, 1 | h)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// Result wrapper for normalized data
export interface NormalizedResult<T> {
  data: T
  isSynthetic: boolean
  syntheticReason?: 'empty' | 'invalid-shape' | 'non-numeric' | 'too-short' | 'unavailable'
  warnings?: string[]
}

// Common visualization point types
export interface TimeSeriesPoint {
  t: number
  y: number
  synthetic?: boolean
}

export interface BarPoint {
  name: string
  value: number
  synthetic?: boolean
}

export interface ScatterPoint {
  x: number
  y: number
  synthetic?: boolean
}

export interface LinePoint {
  name: string
  [key: string]: number | string | boolean | undefined
  synthetic?: boolean
}

export interface TableRow {
  id: string
  [key: string]: unknown
  synthetic?: boolean
}

// Normalization options
export interface NormalizeOptions {
  minLength?: number
  coerceNumbers?: boolean
  seed?: string
}

// Safe number coercion
export function safeNumber(value: unknown, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value
  }
  const num = Number(value)
  return isNaN(num) || !isFinite(num) ? defaultValue : num
}

// Safe string coercion
export function safeString(value: unknown, defaultValue: string = ''): string {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return defaultValue
  return String(value)
}

// Safe array coercion
export function safeArray<T>(value: unknown, defaultValue: T[] = []): T[] {
  if (Array.isArray(value)) return value as T[]
  return defaultValue
}

/**
 * Normalize time series data for line/area charts
 */
export function normalizeTimeSeries(
  data: unknown,
  fallbackGenerator: (ctx: { seed: string; minLength: number; nowAnchor: number }) => TimeSeriesPoint[],
  options: NormalizeOptions = {}
): NormalizedResult<TimeSeriesPoint[]> {
  const { minLength = 5, seed = 'timeseries' } = options
  const nowAnchor = Math.floor(Date.now() / 3600000) * 3600000 // Round to hour
  const warnings: string[] = []

  // Check if data is valid array
  if (!Array.isArray(data)) {
    return {
      data: fallbackGenerator({ seed, minLength, nowAnchor }),
      isSynthetic: true,
      syntheticReason: 'invalid-shape',
      warnings: ['Input was not an array']
    }
  }

  // Check minimum length
  if (data.length < minLength) {
    return {
      data: fallbackGenerator({ seed, minLength, nowAnchor }),
      isSynthetic: true,
      syntheticReason: 'too-short',
      warnings: [`Array had ${data.length} items, minimum is ${minLength}`]
    }
  }

  // Validate and coerce each point
  const normalized: TimeSeriesPoint[] = []
  for (const point of data) {
    if (!point || typeof point !== 'object') {
      warnings.push('Skipped invalid point')
      continue
    }
    const t = safeNumber((point as Record<string, unknown>).t || (point as Record<string, unknown>).timestamp || (point as Record<string, unknown>).time)
    const y = safeNumber((point as Record<string, unknown>).y || (point as Record<string, unknown>).value)
    if (t > 0) {
      normalized.push({ t, y })
    }
  }

  if (normalized.length < minLength) {
    return {
      data: fallbackGenerator({ seed, minLength, nowAnchor }),
      isSynthetic: true,
      syntheticReason: 'non-numeric',
      warnings
    }
  }

  return { data: normalized, isSynthetic: false, warnings }
}

/**
 * Normalize bar chart data
 */
export function normalizeBarSeries(
  data: unknown,
  fallbackGenerator: (ctx: { seed: string; minLength: number }) => BarPoint[],
  options: NormalizeOptions = {}
): NormalizedResult<BarPoint[]> {
  const { minLength = 3, seed = 'barseries' } = options
  const warnings: string[] = []

  if (!Array.isArray(data)) {
    return {
      data: fallbackGenerator({ seed, minLength }),
      isSynthetic: true,
      syntheticReason: 'invalid-shape',
      warnings: ['Input was not an array']
    }
  }

  if (data.length < minLength) {
    return {
      data: fallbackGenerator({ seed, minLength }),
      isSynthetic: true,
      syntheticReason: 'too-short',
      warnings: [`Array had ${data.length} items, minimum is ${minLength}`]
    }
  }

  const normalized: BarPoint[] = []
  for (const point of data) {
    if (!point || typeof point !== 'object') {
      warnings.push('Skipped invalid point')
      continue
    }
    const p = point as Record<string, unknown>
    const name = safeString(p.name || p.label || p.symbol, `Item ${normalized.length + 1}`)
    const value = safeNumber(p.value || p.volume || p.amount)
    normalized.push({ name, value })
  }

  if (normalized.length < minLength) {
    return {
      data: fallbackGenerator({ seed, minLength }),
      isSynthetic: true,
      syntheticReason: 'non-numeric',
      warnings
    }
  }

  return { data: normalized, isSynthetic: false, warnings }
}

/**
 * Normalize line chart data with multiple series
 */
export function normalizeLineSeries<T extends LinePoint>(
  data: unknown,
  fallbackGenerator: (ctx: { seed: string; minLength: number }) => T[],
  requiredKeys: string[],
  options: NormalizeOptions = {}
): NormalizedResult<T[]> {
  const { minLength = 3, seed = 'lineseries' } = options
  const warnings: string[] = []

  if (!Array.isArray(data)) {
    return {
      data: fallbackGenerator({ seed, minLength }),
      isSynthetic: true,
      syntheticReason: 'invalid-shape',
      warnings: ['Input was not an array']
    }
  }

  if (data.length < minLength) {
    return {
      data: fallbackGenerator({ seed, minLength }),
      isSynthetic: true,
      syntheticReason: 'too-short',
      warnings: [`Array had ${data.length} items, minimum is ${minLength}`]
    }
  }

  const normalized: T[] = []
  for (const point of data) {
    if (!point || typeof point !== 'object') {
      warnings.push('Skipped invalid point')
      continue
    }
    const p = point as Record<string, unknown>
    const normalizedPoint: Record<string, unknown> = {
      name: safeString(p.name || p.label || p.symbol, `Item ${normalized.length + 1}`)
    }
    
    for (const key of requiredKeys) {
      normalizedPoint[key] = safeNumber(p[key])
    }
    
    normalized.push(normalizedPoint as T)
  }

  if (normalized.length < minLength) {
    return {
      data: fallbackGenerator({ seed, minLength }),
      isSynthetic: true,
      syntheticReason: 'non-numeric',
      warnings
    }
  }

  return { data: normalized as T[], isSynthetic: false, warnings }
}

/**
 * Normalize scatter plot data
 */
export function normalizeScatterSeries(
  data: unknown,
  fallbackGenerator: (ctx: { seed: string; minLength: number }) => ScatterPoint[],
  options: NormalizeOptions = {}
): NormalizedResult<ScatterPoint[]> {
  const { minLength = 5, seed = 'scatter' } = options
  const warnings: string[] = []

  if (!Array.isArray(data)) {
    return {
      data: fallbackGenerator({ seed, minLength }),
      isSynthetic: true,
      syntheticReason: 'invalid-shape',
      warnings: ['Input was not an array']
    }
  }

  if (data.length < minLength) {
    return {
      data: fallbackGenerator({ seed, minLength }),
      isSynthetic: true,
      syntheticReason: 'too-short',
      warnings: [`Array had ${data.length} items, minimum is ${minLength}`]
    }
  }

  const normalized: ScatterPoint[] = []
  for (const point of data) {
    if (!point || typeof point !== 'object') {
      warnings.push('Skipped invalid point')
      continue
    }
    const p = point as Record<string, unknown>
    const x = safeNumber(p.x)
    const y = safeNumber(p.y)
    normalized.push({ x, y })
  }

  if (normalized.length < minLength) {
    return {
      data: fallbackGenerator({ seed, minLength }),
      isSynthetic: true,
      syntheticReason: 'non-numeric',
      warnings
    }
  }

  return { data: normalized, isSynthetic: false, warnings }
}

/**
 * Normalize matrix data (for heatmaps, correlation matrices)
 */
export function normalizeMatrix(
  data: unknown,
  fallbackGenerator: (ctx: { seed: string; rows: number; cols: number }) => number[][],
  rows: number,
  cols: number,
  options: NormalizeOptions = {}
): NormalizedResult<number[][]> {
  const { seed = 'matrix' } = options
  const warnings: string[] = []

  if (!Array.isArray(data)) {
    return {
      data: fallbackGenerator({ seed, rows, cols }),
      isSynthetic: true,
      syntheticReason: 'invalid-shape',
      warnings: ['Input was not an array']
    }
  }

  if (data.length < rows) {
    return {
      data: fallbackGenerator({ seed, rows, cols }),
      isSynthetic: true,
      syntheticReason: 'too-short',
      warnings: [`Matrix had ${data.length} rows, expected ${rows}`]
    }
  }

  const normalized: number[][] = []
  for (let i = 0; i < rows; i++) {
    const row = data[i]
    if (!Array.isArray(row)) {
      warnings.push(`Row ${i} was not an array`)
      normalized.push(Array(cols).fill(0))
      continue
    }
    const normalizedRow: number[] = []
    for (let j = 0; j < cols; j++) {
      normalizedRow.push(safeNumber(row[j]))
    }
    normalized.push(normalizedRow)
  }

  const hasValidData = normalized.some(row => row.some(val => val !== 0))
  if (!hasValidData) {
    return {
      data: fallbackGenerator({ seed, rows, cols }),
      isSynthetic: true,
      syntheticReason: 'non-numeric',
      warnings
    }
  }

  return { data: normalized, isSynthetic: false, warnings }
}

/**
 * Normalize table row data
 */
export function normalizeTableRows<T extends TableRow>(
  data: unknown,
  fallbackGenerator: (ctx: { seed: string; minLength: number }) => T[],
  options: NormalizeOptions = {}
): NormalizedResult<T[]> {
  const { minLength = 1, seed = 'table' } = options
  const warnings: string[] = []

  if (!Array.isArray(data)) {
    return {
      data: fallbackGenerator({ seed, minLength }),
      isSynthetic: true,
      syntheticReason: 'invalid-shape',
      warnings: ['Input was not an array']
    }
  }

  if (data.length === 0) {
    return {
      data: fallbackGenerator({ seed, minLength }),
      isSynthetic: true,
      syntheticReason: 'empty',
      warnings: ['Array was empty']
    }
  }

  const normalized: T[] = []
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    if (!row || typeof row !== 'object') {
      warnings.push(`Skipped invalid row at index ${i}`)
      continue
    }
    const r = row as Record<string, unknown>
    const normalizedRow = {
      ...r,
      id: safeString(r.id, `row-${i}`)
    } as T
    normalized.push(normalizedRow)
  }

  if (normalized.length < minLength) {
    return {
      data: fallbackGenerator({ seed, minLength }),
      isSynthetic: true,
      syntheticReason: 'too-short',
      warnings
    }
  }

  return { data: normalized, isSynthetic: false, warnings }
}

// Export seeded random for use in synthetic generators
export { seededRandom }
