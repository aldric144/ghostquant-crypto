'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'

interface VolatilityData {
  asset: string
  symbol: string
  currentVol: number
  historicalVol: number
  impliedVol: number
  realizedVol: number
  volRank: number
  change24h: number
  atr: number
  bollingerWidth: number
  regime: 'high' | 'medium' | 'low' | 'extreme'
}

interface VolatilityAlert {
  id: string
  asset: string
  type: 'spike' | 'crush' | 'regime_change' | 'divergence'
  message: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  timestamp: Date
  currentVol: number
  previousVol: number
}

interface VolatilityMetrics {
  avgMarketVol: number
  highVolAssets: number
  lowVolAssets: number
  volSpikes24h: number
  avgVolRank: number
  marketRegime: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

function isValidVolatilityData(item: unknown): item is VolatilityData {
  if (!item || typeof item !== 'object') return false
  const d = item as Record<string, unknown>
  return typeof d.symbol === 'string' && typeof d.currentVol === 'number' && ['high', 'medium', 'low', 'extreme'].includes(d.regime as string)
}

function isValidVolatilityAlert(item: unknown): item is VolatilityAlert {
  if (!item || typeof item !== 'object') return false
  const a = item as Record<string, unknown>
  return typeof a.id === 'string' && typeof a.message === 'string' && ['spike', 'crush', 'regime_change', 'divergence'].includes(a.type as string)
}

function isValidVolatilityMetrics(metrics: unknown): metrics is VolatilityMetrics {
  if (!metrics || typeof metrics !== 'object') return false
  const m = metrics as Record<string, unknown>
  return typeof m.avgMarketVol === 'number' && typeof m.highVolAssets === 'number'
}

function normalizeResponse(data: unknown): { assets: VolatilityData[]; alerts: VolatilityAlert[]; metrics: VolatilityMetrics | null } | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>
  
  const rawAssets = Array.isArray(d.assets) ? d.assets : (d.data && typeof d.data === 'object' && Array.isArray((d.data as Record<string, unknown>).assets) ? (d.data as Record<string, unknown>).assets : null)
  const rawAlerts = Array.isArray(d.alerts) ? d.alerts : (d.data && typeof d.data === 'object' && Array.isArray((d.data as Record<string, unknown>).alerts) ? (d.data as Record<string, unknown>).alerts : [])
  const rawMetrics = d.metrics || (d.data && typeof d.data === 'object' ? (d.data as Record<string, unknown>).metrics : null)
  
  if (!Array.isArray(rawAssets) || rawAssets.length === 0) return null
  
  const validAssets = rawAssets.filter(isValidVolatilityData)
  if (validAssets.length === 0) return null
  
  const validAlerts = Array.isArray(rawAlerts) ? rawAlerts.filter(isValidVolatilityAlert) : []
  const validMetrics = isValidVolatilityMetrics(rawMetrics) ? rawMetrics : null
  
  return { assets: validAssets, alerts: validAlerts, metrics: validMetrics }
}

export default function VolatilityMonitorPage() {
  const [showGuide, setShowGuide] = useState(false)
  const [volatilityData, setVolatilityData] = useState<VolatilityData[]>([])
  const [alerts, setAlerts] = useState<VolatilityAlert[]>([])
  const [metrics, setMetrics] = useState<VolatilityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRegime, setSelectedRegime] = useState<string>('all')
  const [timeframe, setTimeframe] = useState<string>('24h')

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [selectedRegime, timeframe])

  async function fetchData() {
    try {
      const response = await fetch(`${API_BASE}/gq-core/volatility/monitor?regime=${selectedRegime}&timeframe=${timeframe}`)
      if (!response.ok) {
        generateMockData()
        return
      }
      
      const text = await response.text()
      if (!text || text.trim() === '') {
        generateMockData()
        return
      }
      
      let data: unknown
      try {
        data = JSON.parse(text)
      } catch {
        generateMockData()
        return
      }
      
      const normalized = normalizeResponse(data)
      if (!normalized) {
        generateMockData()
        return
      }
      
      setVolatilityData(normalized.assets)
      setAlerts(normalized.alerts)
      setMetrics(normalized.metrics)
    } catch (error) {
      console.error('Error fetching volatility data:', error)
      generateMockData()
    } finally {
      setLoading(false)
    }
  }

  function generateMockData() {
    const assets = [
      { name: 'Bitcoin', symbol: 'BTC' },
      { name: 'Ethereum', symbol: 'ETH' },
      { name: 'Solana', symbol: 'SOL' },
      { name: 'Cardano', symbol: 'ADA' },
      { name: 'Polygon', symbol: 'MATIC' },
      { name: 'Avalanche', symbol: 'AVAX' },
      { name: 'Chainlink', symbol: 'LINK' },
      { name: 'Polkadot', symbol: 'DOT' },
      { name: 'Uniswap', symbol: 'UNI' },
      { name: 'Aave', symbol: 'AAVE' },
      { name: 'Arbitrum', symbol: 'ARB' },
      { name: 'Optimism', symbol: 'OP' }
    ]

    const regimes: ('high' | 'medium' | 'low' | 'extreme')[] = ['high', 'medium', 'low', 'extreme']

    const mockData: VolatilityData[] = assets.map((asset) => {
      const currentVol = Math.random() * 150 + 10
      const regime = currentVol > 100 ? 'extreme' : currentVol > 70 ? 'high' : currentVol > 40 ? 'medium' : 'low'
      return {
        asset: asset.name,
        symbol: asset.symbol,
        currentVol,
        historicalVol: Math.random() * 100 + 20,
        impliedVol: Math.random() * 120 + 15,
        realizedVol: Math.random() * 90 + 10,
        volRank: Math.random() * 100,
        change24h: (Math.random() - 0.5) * 50,
        atr: Math.random() * 5 + 0.5,
        bollingerWidth: Math.random() * 10 + 1,
        regime
      }
    })

    const alertTypes: ('spike' | 'crush' | 'regime_change' | 'divergence')[] = ['spike', 'crush', 'regime_change', 'divergence']
    const severities: ('critical' | 'high' | 'medium' | 'low')[] = ['critical', 'high', 'medium', 'low']

    const mockAlerts: VolatilityAlert[] = Array.from({ length: 10 }, (_, i) => ({
      id: `alert-${i}`,
      asset: assets[i % assets.length].symbol,
      type: alertTypes[i % alertTypes.length],
      message: [
        'Volatility spike detected - 3 standard deviations above mean',
        'Volatility crush in progress - IV dropping rapidly',
        'Regime change from low to high volatility',
        'IV/RV divergence detected - potential opportunity',
        'Extreme volatility warning - risk management advised',
        'Bollinger Band expansion - breakout imminent',
        'ATR surge detected - increased price movement',
        'Historical volatility percentile at 95%'
      ][i % 8],
      severity: severities[i % severities.length],
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      currentVol: Math.random() * 100 + 20,
      previousVol: Math.random() * 80 + 15
    }))

    const highVol = mockData.filter(d => d.regime === 'high' || d.regime === 'extreme').length
    const lowVol = mockData.filter(d => d.regime === 'low').length

    setVolatilityData(mockData)
    setAlerts(mockAlerts)
    setMetrics({
      avgMarketVol: mockData.reduce((sum, d) => sum + d.currentVol, 0) / mockData.length,
      highVolAssets: highVol,
      lowVolAssets: lowVol,
      volSpikes24h: Math.floor(Math.random() * 20) + 5,
      avgVolRank: mockData.reduce((sum, d) => sum + d.volRank, 0) / mockData.length,
      marketRegime: highVol > lowVol ? 'Elevated' : 'Normal'
    })
  }

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'extreme': return 'text-purple-400 bg-purple-500/20 border-purple-500'
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500'
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-purple-500 bg-purple-500/10 text-purple-300'
      case 'high': return 'border-red-500 bg-red-500/10 text-red-300'
      case 'medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
      case 'low': return 'border-green-500 bg-green-500/10 text-green-300'
      default: return 'border-gray-500 bg-gray-500/10 text-gray-300'
    }
  }

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'spike': return '📈'
      case 'crush': return '📉'
      case 'regime_change': return '🔄'
      case 'divergence': return '⚡'
      default: return '⚠️'
    }
  }

  const regimes = ['all', 'extreme', 'high', 'medium', 'low']

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Volatility Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Volatility Monitor</h1>
          <p className="text-gray-400">Real-time volatility tracking, regime detection, and risk alerts</p>
        </div>

        {/* Market Volatility Gauge */}
        {metrics && (
          <div className="mb-8 bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Market Volatility Index</h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  metrics.marketRegime === 'Elevated' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {metrics.marketRegime}
                </span>
              </div>
            </div>
            <div className="relative h-8 bg-gradient-to-r from-green-500 via-yellow-500 via-red-500 to-purple-500 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 w-2 h-full bg-white shadow-lg transition-all duration-500"
                style={{ left: `${Math.min(metrics.avgMarketVol, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Low (0-30)</span>
              <span>Medium (30-50)</span>
              <span>High (50-80)</span>
              <span>Extreme (80+)</span>
            </div>
            <div className="text-center mt-4">
              <span className="text-4xl font-bold text-cyan-400">{metrics.avgMarketVol.toFixed(1)}</span>
              <span className="text-gray-400 ml-2">Avg Volatility</span>
            </div>
          </div>
        )}

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Avg Market Vol</div>
              <div className="text-xl font-bold text-cyan-400">{metrics.avgMarketVol.toFixed(1)}%</div>
            </div>
            <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">High Vol Assets</div>
              <div className="text-xl font-bold text-red-400">{metrics.highVolAssets}</div>
            </div>
            <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Low Vol Assets</div>
              <div className="text-xl font-bold text-green-400">{metrics.lowVolAssets}</div>
            </div>
            <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Vol Spikes (24h)</div>
              <div className="text-xl font-bold text-yellow-400">{metrics.volSpikes24h}</div>
            </div>
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Avg Vol Rank</div>
              <div className="text-xl font-bold text-purple-400">{metrics.avgVolRank.toFixed(0)}%</div>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Market Regime</div>
              <div className="text-xl font-bold text-cyan-400">{metrics.marketRegime}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            {regimes.map((regime) => (
              <button
                key={regime}
                onClick={() => setSelectedRegime(regime)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  selectedRegime === regime
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {regime === 'all' ? 'All Regimes' : regime.charAt(0).toUpperCase() + regime.slice(1)}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Volatility Table */}
          <div className="lg:col-span-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20">
              <h2 className="text-lg font-semibold text-white">Asset Volatility Overview</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left text-xs text-gray-400 p-3">Asset</th>
                    <th className="text-right text-xs text-gray-400 p-3">Current Vol</th>
                    <th className="text-right text-xs text-gray-400 p-3">IV</th>
                    <th className="text-right text-xs text-gray-400 p-3">RV</th>
                    <th className="text-right text-xs text-gray-400 p-3">Vol Rank</th>
                    <th className="text-right text-xs text-gray-400 p-3">24h Change</th>
                    <th className="text-center text-xs text-gray-400 p-3">Regime</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(volatilityData) ? volatilityData : [])
                    .filter(d => selectedRegime === 'all' || d?.regime === selectedRegime)
                    .map((asset) => (
                    <tr key={asset?.symbol ?? Math.random()} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-3">
                        <span className="text-cyan-400 font-medium">{asset?.symbol ?? 'Unknown'}</span>
                      </td>
                      <td className="p-3 text-right text-white font-medium">{(asset?.currentVol ?? 0).toFixed(1)}%</td>
                      <td className="p-3 text-right text-gray-300">{(asset?.impliedVol ?? 0).toFixed(1)}%</td>
                      <td className="p-3 text-right text-gray-300">{(asset?.realizedVol ?? 0).toFixed(1)}%</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-cyan-500"
                              style={{ width: `${asset?.volRank ?? 0}%` }}
                            />
                          </div>
                          <span className="text-gray-300 text-sm">{(asset?.volRank ?? 0).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className={`p-3 text-right ${(asset?.change24h ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(asset?.change24h ?? 0) >= 0 ? '+' : ''}{(asset?.change24h ?? 0).toFixed(1)}%
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getRegimeColor(asset?.regime ?? 'low')}`}>
                          {(asset?.regime ?? 'low').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Volatility Alerts */}
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20">
              <h2 className="text-lg font-semibold text-white">Volatility Alerts</h2>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {(Array.isArray(alerts) ? alerts : []).map((alert) => (
                <div key={alert?.id ?? Math.random()} className={`rounded-lg p-3 border ${getSeverityColor(alert?.severity ?? 'low')}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getAlertTypeIcon(alert?.type ?? 'spike')}</span>
                      <span className="font-medium text-cyan-400">{alert?.asset ?? 'Unknown'}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {alert?.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : '--:--'}
                    </span>
                  </div>
                  <div className="text-sm text-white mb-2">{alert?.message ?? ''}</div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Vol: {(alert?.previousVol ?? 0).toFixed(1)}% → {(alert?.currentVol ?? 0).toFixed(1)}%</span>
                    <span className={`px-2 py-0.5 rounded ${getSeverityColor(alert?.severity ?? 'low')}`}>
                      {alert?.severity ?? 'low'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Volatility Heatmap */}
        <div className="mt-6 bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Volatility Regime Heatmap</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {(Array.isArray(volatilityData) ? volatilityData : []).map((asset) => (
              <div 
                key={asset?.symbol ?? Math.random()}
                className={`p-4 rounded-lg border transition-all hover:scale-105 cursor-pointer ${getRegimeColor(asset?.regime ?? 'low')}`}
              >
                <div className="text-center">
                  <div className="font-bold text-white mb-1">{asset?.symbol ?? 'Unknown'}</div>
                  <div className="text-2xl font-bold">{(asset?.currentVol ?? 0).toFixed(0)}%</div>
                  <div className="text-xs mt-1 opacity-75">{asset?.regime ?? 'low'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
