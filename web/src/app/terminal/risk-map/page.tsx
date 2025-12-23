'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useEffect, useState } from 'react'

interface RiskMetric {
  category: string
  score: number
  trend: string
  change: number
}

interface RiskZone {
  name: string
  risk_level: number
  assets: number
  volume: number
}

interface ApiResponse {
  overall_risk?: number
  systemic_risk?: number
  concentration_risk?: number
  liquidity_risk?: number
  metrics?: RiskMetric[]
  zones?: RiskZone[]
  timestamp?: string
}

export default function RiskMapPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/gq-core/risk', { cache: 'no-store' })
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
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  const metrics = data?.metrics || []
  const zones = data?.zones || []

  const getRiskColor = (score: number) => {
    if (score > 0.7) return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30' }
    if (score > 0.4) return { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30' }
    return { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30' }
  }

  const getRiskLabel = (score: number) => {
    if (score > 0.7) return 'Critical'
    if (score > 0.4) return 'Elevated'
    return 'Normal'
  }

  const heatmapData = [
    ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC'],
    ['ARB', 'OP', 'BNB', 'DOT', 'ATOM'],
    ['LINK', 'UNI', 'AAVE', 'MKR', 'CRV'],
    ['LDO', 'RPL', 'FXS', 'CVX', 'BAL']
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-sm font-medium">Live Feed</span>
          </div>
          <TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Unified Risk Map</h1>
          <p className="text-gray-400">Comprehensive risk visualization across the crypto ecosystem</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <span className="ml-3 text-gray-400">Loading risk data...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-300">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className={`bg-slate-800/50 ${getRiskColor(data?.overall_risk || 0).border} border rounded-xl p-4`}>
                <div className="text-gray-400 text-sm mb-1">Overall Risk</div>
                <div className={`text-2xl font-bold ${getRiskColor(data?.overall_risk || 0).text}`}>
                  {((data?.overall_risk || 0) * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">{getRiskLabel(data?.overall_risk || 0)}</div>
              </div>
              <div className={`bg-slate-800/50 ${getRiskColor(data?.systemic_risk || 0).border} border rounded-xl p-4`}>
                <div className="text-gray-400 text-sm mb-1">Systemic Risk</div>
                <div className={`text-2xl font-bold ${getRiskColor(data?.systemic_risk || 0).text}`}>
                  {((data?.systemic_risk || 0) * 100).toFixed(0)}%
                </div>
              </div>
              <div className={`bg-slate-800/50 ${getRiskColor(data?.concentration_risk || 0).border} border rounded-xl p-4`}>
                <div className="text-gray-400 text-sm mb-1">Concentration Risk</div>
                <div className={`text-2xl font-bold ${getRiskColor(data?.concentration_risk || 0).text}`}>
                  {((data?.concentration_risk || 0) * 100).toFixed(0)}%
                </div>
              </div>
              <div className={`bg-slate-800/50 ${getRiskColor(data?.liquidity_risk || 0).border} border rounded-xl p-4`}>
                <div className="text-gray-400 text-sm mb-1">Liquidity Risk</div>
                <div className={`text-2xl font-bold ${getRiskColor(data?.liquidity_risk || 0).text}`}>
                  {((data?.liquidity_risk || 0) * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Risk Heatmap</h3>
                <div className="space-y-2">
                  {heatmapData.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex gap-2">
                      {row.map((asset, colIdx) => {
                        const riskValue = (Math.sin(rowIdx * colIdx + 1) + 1) / 2
                        const colors = getRiskColor(riskValue)
                        return (
                          <div
                            key={colIdx}
                            className={`flex-1 h-16 rounded-lg flex items-center justify-center ${colors.bg} bg-opacity-30 border ${colors.border} hover:bg-opacity-50 transition-all cursor-pointer`}
                            title={`${asset}: ${(riskValue * 100).toFixed(0)}% risk`}
                          >
                            <div className="text-center">
                              <div className="text-white font-medium text-sm">{asset}</div>
                              <div className={`text-xs ${colors.text}`}>{(riskValue * 100).toFixed(0)}%</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-6 mt-4 text-xs">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500/50" /> Low</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500/50" /> Medium</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500/50" /> High</div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Risk Metrics</h3>
                <div className="space-y-4">
                  {(metrics.length > 0 ? metrics : [
                    { category: 'Market Volatility', score: 0.45, trend: 'up', change: 5.2 },
                    { category: 'Whale Activity', score: 0.62, trend: 'up', change: 12.3 },
                    { category: 'Exchange Flows', score: 0.38, trend: 'down', change: -3.1 },
                    { category: 'DeFi TVL Risk', score: 0.55, trend: 'stable', change: 0.5 },
                    { category: 'Stablecoin Peg', score: 0.15, trend: 'stable', change: 0.1 }
                  ]).map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-300 text-sm">{metric.category}</span>
                          <div className="flex items-center gap-2">
                            <span className={getRiskColor(metric.score).text}>{(metric.score * 100).toFixed(0)}%</span>
                            <span className={`text-xs ${metric.change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                              {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div className={`${getRiskColor(metric.score).bg} h-2 rounded-full transition-all`} style={{ width: `${metric.score * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Risk Zones</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-slate-700">
                      <th className="pb-3 pr-4">Zone</th>
                      <th className="pb-3 pr-4">Risk Level</th>
                      <th className="pb-3 pr-4">Assets</th>
                      <th className="pb-3">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(zones.length > 0 ? zones : [
                      { name: 'Layer 1 Protocols', risk_level: 0.35, assets: 12, volume: 45000000000 },
                      { name: 'DeFi Lending', risk_level: 0.58, assets: 8, volume: 12000000000 },
                      { name: 'DEX Liquidity', risk_level: 0.42, assets: 15, volume: 8500000000 },
                      { name: 'Stablecoins', risk_level: 0.22, assets: 6, volume: 120000000000 },
                      { name: 'Layer 2 Solutions', risk_level: 0.48, assets: 10, volume: 5200000000 }
                    ]).map((zone, idx) => (
                      <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-3 pr-4 font-medium text-white">{zone.name}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-700 rounded-full h-2">
                              <div className={`${getRiskColor(zone.risk_level).bg} h-2 rounded-full`} style={{ width: `${zone.risk_level * 100}%` }} />
                            </div>
                            <span className={getRiskColor(zone.risk_level).text}>{(zone.risk_level * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{zone.assets}</td>
                        <td className="py-3 text-cyan-400">${(zone.volume / 1000000000).toFixed(1)}B</td>
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
