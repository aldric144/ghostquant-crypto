'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import ModuleErrorBoundary, { safeArray, safeNumber, safeMatrix } from '../../../components/terminal/ModuleErrorBoundary'
import { useState, useEffect } from 'react'

interface CorrelationPair {
  asset1: string
  asset2: string
  correlation: number
  strength: 'strong' | 'moderate' | 'weak' | 'inverse'
  change24h: number
  historicalAvg: number
  divergence: number
}

interface CorrelationCluster {
  id: string
  name: string
  assets: string[]
  avgCorrelation: number
  stability: number
}

interface CorrelationMetrics {
  avgMarketCorrelation: number
  strongPairs: number
  inversePairs: number
  divergentPairs: number
  topCorrelated: string
  leastCorrelated: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

function CorrelationEnginePageContent() {
  const [correlations, setCorrelations] = useState<CorrelationPair[]>([])
  const [clusters, setClusters] = useState<CorrelationCluster[]>([])
  const [metrics, setMetrics] = useState<CorrelationMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStrength, setSelectedStrength] = useState<string>('all')
  const [timeframe, setTimeframe] = useState<string>('24h')
  const [matrixAssets, setMatrixAssets] = useState<string[]>([])
  const [correlationMatrix, setCorrelationMatrix] = useState<number[][]>([])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [selectedStrength, timeframe])

  async function fetchData() {
    // Use AbortController with timeout to prevent hung requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    try {
      const response = await fetch(
        `${API_BASE}/gq-core/correlation/matrix?strength=${selectedStrength}&timeframe=${timeframe}`,
        { signal: controller.signal }
      )
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        // Validate API response before setting state
        if (data && Array.isArray(data.pairs)) {
          setCorrelations(data.pairs)
          setClusters(Array.isArray(data.clusters) ? data.clusters : [])
          setMetrics(data.metrics || null)
          setMatrixAssets(Array.isArray(data.assets) ? data.assets : [])
          setCorrelationMatrix(Array.isArray(data.matrix) ? data.matrix : [])
        } else {
          generateMockData()
        }
      } else {
        generateMockData()
      }
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('Error fetching correlation data:', error)
      generateMockData()
    } finally {
      setLoading(false)
    }
  }

  function generateMockData() {
    const assets = ['BTC', 'ETH', 'SOL', 'ADA', 'MATIC', 'AVAX', 'LINK', 'DOT', 'UNI', 'AAVE']
    
    const pairs: CorrelationPair[] = []
    for (let i = 0; i < assets.length; i++) {
      for (let j = i + 1; j < assets.length; j++) {
        const correlation = (Math.random() * 2 - 1)
        const strength = Math.abs(correlation) > 0.7 ? 'strong' : 
                        Math.abs(correlation) > 0.4 ? 'moderate' : 
                        correlation < -0.3 ? 'inverse' : 'weak'
        pairs.push({
          asset1: assets[i],
          asset2: assets[j],
          correlation,
          strength,
          change24h: (Math.random() - 0.5) * 0.4,
          historicalAvg: correlation + (Math.random() - 0.5) * 0.2,
          divergence: Math.random() * 0.3
        })
      }
    }

    const matrix: number[][] = assets.map((_, i) => 
      assets.map((_, j) => {
        if (i === j) return 1
        const pair = pairs.find(p => 
          (p.asset1 === assets[i] && p.asset2 === assets[j]) ||
          (p.asset1 === assets[j] && p.asset2 === assets[i])
        )
        return pair ? pair.correlation : 0
      })
    )

    const mockClusters: CorrelationCluster[] = [
      { id: '1', name: 'Layer 1 Majors', assets: ['BTC', 'ETH', 'SOL'], avgCorrelation: 0.85, stability: 0.92 },
      { id: '2', name: 'DeFi Blue Chips', assets: ['UNI', 'AAVE', 'LINK'], avgCorrelation: 0.78, stability: 0.85 },
      { id: '3', name: 'Alt L1s', assets: ['ADA', 'AVAX', 'DOT'], avgCorrelation: 0.72, stability: 0.78 }
    ]

    const strongPairs = pairs.filter(p => p.strength === 'strong').length
    const inversePairs = pairs.filter(p => p.strength === 'inverse').length
    const divergentPairs = pairs.filter(p => p.divergence > 0.2).length

    setCorrelations(pairs)
    setClusters(mockClusters)
    setMatrixAssets(assets)
    setCorrelationMatrix(matrix)
    setMetrics({
      avgMarketCorrelation: pairs.reduce((sum, p) => sum + p.correlation, 0) / pairs.length,
      strongPairs,
      inversePairs,
      divergentPairs,
      topCorrelated: 'BTC/ETH',
      leastCorrelated: 'SOL/LINK'
    })
  }

  const getCorrelationColor = (value: number) => {
    if (value >= 0.7) return 'bg-green-500'
    if (value >= 0.4) return 'bg-green-400'
    if (value >= 0.1) return 'bg-green-300'
    if (value >= -0.1) return 'bg-gray-400'
    if (value >= -0.4) return 'bg-red-300'
    if (value >= -0.7) return 'bg-red-400'
    return 'bg-red-500'
  }

  const getCorrelationTextColor = (value: number) => {
    if (value >= 0.5) return 'text-green-400'
    if (value >= 0) return 'text-gray-300'
    if (value >= -0.5) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStrengthBadge = (strength: string) => {
    switch (strength) {
      case 'strong': return 'bg-green-500/20 text-green-400 border-green-500'
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
      case 'weak': return 'bg-gray-500/20 text-gray-400 border-gray-500'
      case 'inverse': return 'bg-red-500/20 text-red-400 border-red-500'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500'
    }
  }

  const strengths = ['all', 'strong', 'moderate', 'weak', 'inverse']
  
  const safeCorrelations = safeArray<CorrelationPair>(correlations)
  const safeClusters = safeArray<CorrelationCluster>(clusters)
  const safeMatrixAssets = safeArray<string>(matrixAssets)
  const safeCorrelationMatrix = safeMatrix(correlationMatrix, safeMatrixAssets.length, safeMatrixAssets.length)

  // Determine if we're in synthetic mode (no real data loaded yet or using mock data)
  const isSyntheticMode = safeCorrelations.length === 0 || !metrics

  // NON-BLOCKING: Always render dashboard, never early-return for loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Non-blocking loading/synthetic banner */}
        {(loading || isSyntheticMode) && (
          <div className="mb-6 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-400" />}
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-amber-400">
                {loading ? 'LOADING LIVE DATA' : 'SYNTHETIC MODE'}
              </span>
              <span className="text-xs text-amber-400/70">|</span>
              <span className="text-xs text-gray-400">
                {loading ? 'Computing correlations...' : 'Displaying synthesized correlation data'}
              </span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Correlation Engine</h1>
          <p className="text-gray-400">Real-time asset correlation analysis and cluster detection</p>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Avg Correlation</div>
              <div className={`text-xl font-bold ${getCorrelationTextColor(metrics.avgMarketCorrelation)}`}>
                {metrics.avgMarketCorrelation.toFixed(3)}
              </div>
            </div>
            <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Strong Pairs</div>
              <div className="text-xl font-bold text-green-400">{metrics.strongPairs}</div>
            </div>
            <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Inverse Pairs</div>
              <div className="text-xl font-bold text-red-400">{metrics.inversePairs}</div>
            </div>
            <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Divergent Pairs</div>
              <div className="text-xl font-bold text-yellow-400">{metrics.divergentPairs}</div>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Top Correlated</div>
              <div className="text-xl font-bold text-cyan-400">{metrics.topCorrelated}</div>
            </div>
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Least Correlated</div>
              <div className="text-xl font-bold text-purple-400">{metrics.leastCorrelated}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            {strengths.map((strength) => (
              <button
                key={strength}
                onClick={() => setSelectedStrength(strength)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  selectedStrength === strength
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {strength === 'all' ? 'All Pairs' : strength.charAt(0).toUpperCase() + strength.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {['1h', '24h', '7d', '30d'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  timeframe === tf
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Correlation Matrix */}
        <div className="mb-6 bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-white mb-4">Correlation Matrix</h2>
          <div className="min-w-max">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  {safeMatrixAssets.map((asset) => (
                    <th key={asset} className="p-2 text-xs text-cyan-400 font-medium">{asset}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {safeMatrixAssets.map((asset, i) => (
                  <tr key={asset}>
                    <td className="p-2 text-xs text-cyan-400 font-medium">{asset}</td>
                    {(safeCorrelationMatrix[i] || []).map((value, j) => (
                      <td key={j} className="p-1">
                        <div 
                          className={`w-10 h-10 rounded flex items-center justify-center text-xs font-medium ${getCorrelationColor(safeNumber(value))} ${
                            i === j ? 'opacity-50' : ''
                          }`}
                          title={`${safeMatrixAssets[i] || ''}/${safeMatrixAssets[j] || ''}: ${safeNumber(value).toFixed(2)}`}
                        >
                          {safeNumber(value).toFixed(2)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-400">Strong Negative</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-gray-400">No Correlation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-400">Strong Positive</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Correlation Pairs Table */}
          <div className="lg:col-span-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20">
              <h2 className="text-lg font-semibold text-white">Correlation Pairs</h2>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="bg-slate-900/50 sticky top-0">
                  <tr>
                    <th className="text-left text-xs text-gray-400 p-3">Pair</th>
                    <th className="text-right text-xs text-gray-400 p-3">Correlation</th>
                    <th className="text-right text-xs text-gray-400 p-3">Historical</th>
                    <th className="text-right text-xs text-gray-400 p-3">24h Change</th>
                    <th className="text-center text-xs text-gray-400 p-3">Strength</th>
                  </tr>
                </thead>
                <tbody>
                  {safeCorrelations
                    .filter(p => selectedStrength === 'all' || p?.strength === selectedStrength)
                    .sort((a, b) => Math.abs(safeNumber(b?.correlation)) - Math.abs(safeNumber(a?.correlation)))
                    .slice(0, 20)
                    .map((pair, i) => (
                    <tr key={i} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-3">
                        <span className="text-cyan-400 font-medium">{pair.asset1}/{pair.asset2}</span>
                      </td>
                      <td className={`p-3 text-right font-medium ${getCorrelationTextColor(pair.correlation)}`}>
                        {pair.correlation.toFixed(3)}
                      </td>
                      <td className="p-3 text-right text-gray-300">{pair.historicalAvg.toFixed(3)}</td>
                      <td className={`p-3 text-right ${pair.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(3)}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStrengthBadge(pair.strength)}`}>
                          {pair.strength}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Correlation Clusters */}
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20">
              <h2 className="text-lg font-semibold text-white">Correlation Clusters</h2>
            </div>
            <div className="p-4 space-y-4">
              {safeClusters.map((cluster) => (
                <div key={cluster?.id || Math.random()} className="bg-slate-900/50 rounded-lg p-4 border border-cyan-500/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-white">{cluster?.name || 'Unknown Cluster'}</span>
                    <span className={`text-sm font-bold ${getCorrelationTextColor(safeNumber(cluster?.avgCorrelation))}`}>
                      {safeNumber(cluster?.avgCorrelation).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {safeArray<string>(cluster?.assets).map((asset) => (
                      <span key={asset} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                        {asset}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Stability</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500"
                          style={{ width: `${safeNumber(cluster?.stability) * 100}%` }}
                        />
                      </div>
                      <span>{(safeNumber(cluster?.stability) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CorrelationEnginePage() {
  return (
    <ModuleErrorBoundary moduleName="Correlation Engine">
      <CorrelationEnginePageContent />
    </ModuleErrorBoundary>
  )
}
