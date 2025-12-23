'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'

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

export default function ExchangeMicrostructureScannerPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/gq-core/trends', { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const result = await response.json()
        setData(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const trends = data?.trends || []
  
  const volumeData = trends.slice(0, 10).map(t => ({
    name: t.symbol,
    volume: Math.abs(t.volume_change_24h)
  }))

  const volatilityData = trends.slice(0, 10).map(t => ({
    name: t.symbol,
    volatility: t.volatility * 100,
    momentum: t.momentum * 100
  }))

  const priceChangeData = trends.slice(0, 10).map(t => ({
    name: t.symbol,
    change: t.price_change_24h
  }))

  const avgVolatility = trends.length > 0 
    ? (trends.reduce((sum, t) => sum + t.volatility, 0) / trends.length * 100).toFixed(1)
    : '0'
  const bullishCount = trends.filter(t => t.trend_direction === 'bullish').length
  const bearishCount = trends.filter(t => t.trend_direction === 'bearish').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-sm font-medium">Live Feed</span>
          </div>
          <TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Exchange Microstructure Scanner</h1>
          <p className="text-gray-400">Real-time order flow analysis and market microstructure patterns</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <span className="ml-3 text-gray-400">Loading market data...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-300">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Total Assets</div>
                <div className="text-2xl font-bold text-white">{data?.total_trends || trends.length}</div>
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
                <h3 className="text-lg font-semibold text-white mb-4">Volume Change (24h)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeData}>
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0891b2', borderRadius: '8px' }} />
                      <Bar dataKey="volume" fill="#0891b2" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Volatility vs Momentum</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={volatilityData}>
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
              <h3 className="text-lg font-semibold text-white mb-4">Price Change Distribution</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceChangeData}>
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0891b2', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="change" stroke="#0891b2" fill="#0891b2" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Market Microstructure Data</h3>
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
                    {trends.slice(0, 15).map((trend, idx) => (
                      <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-3 pr-4 font-medium text-white">{trend.symbol}</td>
                        <td className={`py-3 pr-4 ${trend.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trend.price_change_24h >= 0 ? '+' : ''}{trend.price_change_24h.toFixed(2)}%
                        </td>
                        <td className={`py-3 pr-4 ${trend.volume_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trend.volume_change_24h >= 0 ? '+' : ''}{trend.volume_change_24h.toFixed(2)}%
                        </td>
                        <td className="py-3 pr-4 text-yellow-400">{(trend.volatility * 100).toFixed(1)}%</td>
                        <td className="py-3 pr-4 text-purple-400">{(trend.momentum * 100).toFixed(1)}%</td>
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
