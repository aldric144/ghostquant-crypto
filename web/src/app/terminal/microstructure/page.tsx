'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import ModuleErrorBoundary from '../../../components/terminal/ModuleErrorBoundary'
import { useEffect, useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
import { normalizeBarSeries, normalizeLineSeries, normalizeTableRows, safeNumber } from '../../../utils/visualizationNormalizer'
import { generateVolumeChangeData, generateVolatilityMomentumData, generatePriceChangeData, generateMarketTrends, VolatilityMomentumPoint, PriceChangePoint, MarketTrend } from '../../../utils/syntheticVisualData'

interface TrendData {
  symbol: string
  price_change_24h: number
  volume_change_24h: number
  volatility: number
  momentum: number
  trend_direction: string
}

interface ApiResponse {
  trends?: TrendData[]
  total_trends?: number
  market_sentiment?: string
  timestamp?: string
}

function ExchangeMicrostructureScannerPageContent() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/gq-core/trends', { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const result = await response.json()
        setData(result)
      } catch {
        // Error handled by synthetic fallback
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const trends = data?.trends || []
  
  // Normalize volume data for bar chart
  const volumeResult = useMemo(() => {
    const rawData = trends.slice(0, 10).map(t => ({
      name: t.symbol,
      value: Math.abs(safeNumber(t.volume_change_24h))
    }))
    return normalizeBarSeries(
      rawData,
      (ctx) => generateVolumeChangeData(ctx).map(p => ({ name: p.name, value: Math.abs(p.value) })),
      { minLength: 3, seed: 'microstructure:volume' }
    )
  }, [trends])

  // Normalize volatility/momentum data for line chart
  const volatilityResult = useMemo(() => {
    const rawData = trends.slice(0, 10).map(t => ({
      name: t.symbol,
      volatility: safeNumber(t.volatility) * 100,
      momentum: safeNumber(t.momentum) * 100
    }))
    return normalizeLineSeries<VolatilityMomentumPoint>(
      rawData,
      (ctx) => generateVolatilityMomentumData(ctx),
      ['volatility', 'momentum'],
      { minLength: 3, seed: 'microstructure:volatility' }
    )
  }, [trends])

  // Normalize price change data for area chart
  const priceChangeResult = useMemo(() => {
    const rawData = trends.slice(0, 10).map(t => ({
      name: t.symbol,
      change: safeNumber(t.price_change_24h)
    }))
    return normalizeLineSeries<PriceChangePoint>(
      rawData,
      (ctx) => generatePriceChangeData(ctx),
      ['change'],
      { minLength: 3, seed: 'microstructure:pricechange' }
    )
  }, [trends])

  // Normalize table data
  const tableResult = useMemo(() => {
    const rawData = trends.slice(0, 15).map((t, i) => ({
      id: `trend-${i}`,
      symbol: t.symbol,
      price_change_24h: safeNumber(t.price_change_24h),
      volume_change_24h: safeNumber(t.volume_change_24h),
      volatility: safeNumber(t.volatility),
      momentum: safeNumber(t.momentum),
      trend_direction: t.trend_direction || 'neutral'
    }))
    return normalizeTableRows<MarketTrend>(
      rawData,
      (ctx) => generateMarketTrends(ctx),
      { minLength: 1, seed: 'microstructure:table' }
    )
  }, [trends])

  // Check if any visualization is using synthetic data
  const isSyntheticMode = volumeResult.isSynthetic || volatilityResult.isSynthetic || priceChangeResult.isSynthetic || tableResult.isSynthetic

  // Calculate metrics from normalized data
  const tableData = tableResult.data
  const avgVolatility = tableData.length > 0 
    ? (tableData.reduce((sum, t) => sum + safeNumber(t.volatility), 0) / tableData.length * 100).toFixed(1)
    : '0'
  const bullishCount = tableData.filter(t => t.trend_direction === 'bullish').length
  const bearishCount = tableData.filter(t => t.trend_direction === 'bearish').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isSyntheticMode ? 'bg-amber-400' : 'bg-cyan-400'}`} />
            <span className={`text-sm font-medium ${isSyntheticMode ? 'text-amber-400' : 'text-cyan-400'}`}>
              {isSyntheticMode ? 'Synthetic Mode' : 'Live Feed'}
            </span>
          </div>
          <TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Exchange Microstructure Scanner</h1>
          <p className="text-gray-400">Real-time order flow analysis and market microstructure patterns</p>
        </div>

        {/* SYNTHETIC MODE Badge */}
        {isSyntheticMode && (
          <div className="mb-6 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-amber-400">SYNTHETIC MODE</span>
            </div>
            <div className="group relative">
              <svg className="w-4 h-4 text-amber-400/70 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute left-0 top-6 w-72 p-3 bg-slate-800 border border-amber-500/30 rounded-lg text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                Synthetic data is displayed to preserve continuity while live data initializes.
              </div>
            </div>
            <span className="text-xs text-amber-400/70">Displaying synthesized market data</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <span className="ml-3 text-gray-400">Loading market data...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Total Assets</div>
                <div className="text-2xl font-bold text-white">{data?.total_trends || tableData.length}</div>
              </div>
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Avg Volatility</div>
                <div className="text-2xl font-bold text-cyan-400">{avgVolatility}%</div>
              </div>
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Bullish Signals</div>
                <div className="text-2xl font-bold text-green-400">{bullishCount}</div>
              </div>
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Bearish Signals</div>
                <div className="text-2xl font-bold text-red-400">{bearishCount}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Volume Change (24h)</h3>
                  {volumeResult.isSynthetic && <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">Synthetic</span>}
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeResult.data}>
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0891b2', borderRadius: '8px' }} />
                      <Bar dataKey="value" fill="#0891b2" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Volatility vs Momentum</h3>
                  {volatilityResult.isSynthetic && <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">Synthetic</span>}
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={volatilityResult.data}>
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0891b2', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="volatility" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} name="Volatility %" />
                      <Line type="monotone" dataKey="momentum" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} name="Momentum %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Price Change Distribution</h3>
                {priceChangeResult.isSynthetic && <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">Synthetic</span>}
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceChangeResult.data}>
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0891b2', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="change" stroke="#0891b2" fill="#0891b2" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Market Microstructure Data</h3>
                {tableResult.isSynthetic && <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">Synthetic</span>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-slate-700">
                      <th className="pb-3 pr-4">Symbol</th>
                      <th className="pb-3 pr-4">Price Change</th>
                      <th className="pb-3 pr-4">Volume Change</th>
                      <th className="pb-3 pr-4">Volatility</th>
                      <th className="pb-3 pr-4">Momentum</th>
                      <th className="pb-3">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((trend) => (
                      <tr key={trend.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-3 pr-4 font-medium text-white">{trend.symbol}</td>
                        <td className={`py-3 pr-4 ${safeNumber(trend.price_change_24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {safeNumber(trend.price_change_24h) >= 0 ? '+' : ''}{safeNumber(trend.price_change_24h).toFixed(2)}%
                        </td>
                        <td className={`py-3 pr-4 ${safeNumber(trend.volume_change_24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {safeNumber(trend.volume_change_24h) >= 0 ? '+' : ''}{safeNumber(trend.volume_change_24h).toFixed(2)}%
                        </td>
                        <td className="py-3 pr-4 text-yellow-400">{(safeNumber(trend.volatility) * 100).toFixed(1)}%</td>
                        <td className="py-3 pr-4 text-purple-400">{(safeNumber(trend.momentum) * 100).toFixed(1)}%</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            trend.trend_direction === 'bullish' ? 'bg-green-500/20 text-green-400' 
                            : trend.trend_direction === 'bearish' ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-500/20 text-gray-400'
                          }`}>{trend.trend_direction}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function ExchangeMicrostructureScannerPage() {
  return (
    <ModuleErrorBoundary moduleName="Exchange Microstructure Scanner">
      <ExchangeMicrostructureScannerPageContent />
    </ModuleErrorBoundary>
  )
}
