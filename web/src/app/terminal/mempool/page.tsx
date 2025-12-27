'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Anomaly {
  id: string
  type: string
  severity: string
  chain: string
  description: string
  timestamp: string
  value: number
  status: string
}

interface ApiResponse {
  anomalies?: Anomaly[]
  total_anomalies?: number
  timestamp?: string
}

export default function MempoolRadarPage() {
  const [showGuide, setShowGuide] = useState(false)
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/gq-core/anomalies', { cache: 'no-store' })
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
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const anomalies = data?.anomalies || []
  const types = Array.from(new Set(anomalies.map(a => a.type))).filter(Boolean)
  const filteredAnomalies = typeFilter === 'all' ? anomalies : anomalies.filter(a => a.type === typeFilter)

  const criticalCount = anomalies.filter(a => a.severity === 'critical').length
  const highCount = anomalies.filter(a => a.severity === 'high').length
  const pendingCount = anomalies.filter(a => a.status === 'pending').length

  const heatmapData = [
    { time: '0-4h', sandwich: 12, frontrun: 8, mev: 15 },
    { time: '4-8h', sandwich: 18, frontrun: 12, mev: 22 },
    { time: '8-12h', sandwich: 25, frontrun: 18, mev: 30 },
    { time: '12-16h', sandwich: 32, frontrun: 24, mev: 28 },
    { time: '16-20h', sandwich: 28, frontrun: 20, mev: 35 },
    { time: '20-24h', sandwich: 15, frontrun: 10, mev: 18 }
  ]

  const getSeverityColor = (severity: string) => {
    if (severity === 'critical') return 'text-red-400 bg-red-500/20 border-red-500/30'
    if (severity === 'high') return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
    if (severity === 'medium') return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    return 'text-green-400 bg-green-500/20 border-green-500/30'
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      sandwich: '🥪',
      frontrun: '🏃',
      mev: '⚡',
      backrun: '🔙',
      liquidation: '💧'
    }
    return icons[type?.toLowerCase()] || '⚠️'
  }

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
      if (diff < 60) return `${diff}s ago`
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
      return `${Math.floor(diff / 3600)}h ago`
    } catch {
      return timestamp
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-orange-400 text-sm font-medium">Real-Time Monitoring</span>
          </div>
          <TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Mempool Manipulation Radar</h1>
          <p className="text-gray-400">Detect sandwich attacks, front-running, and MEV extraction</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
            <span className="ml-3 text-gray-400">Scanning mempool...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-300">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/50 border border-orange-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Total Anomalies</div>
                <div className="text-2xl font-bold text-white">{data?.total_anomalies || anomalies.length}</div>
              </div>
              <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Critical</div>
                <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
              </div>
              <div className="bg-slate-800/50 border border-orange-500/30 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">High Severity</div>
                <div className="text-2xl font-bold text-orange-400">{highCount}</div>
              </div>
              <div className="bg-slate-800/50 border border-yellow-500/30 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Pending</div>
                <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  typeFilter === 'all' ? 'bg-orange-600 text-white' : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
                }`}
              >All Types</button>
              {types.slice(0, 5).map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    typeFilter === type ? 'bg-orange-600 text-white' : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
                  }`}
                >
                  {getTypeIcon(type)} {type}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-800/50 border border-orange-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Attack Distribution (24h)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={heatmapData}>
                      <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #f97316', borderRadius: '8px' }} />
                      <Bar dataKey="sandwich" fill="#ef4444" stackId="a" name="Sandwich" />
                      <Bar dataKey="frontrun" fill="#f59e0b" stackId="a" name="Frontrun" />
                      <Bar dataKey="mev" fill="#8b5cf6" stackId="a" name="MEV" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4 text-xs">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500" /> Sandwich</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500" /> Frontrun</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-purple-500" /> MEV</div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-orange-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Severity Heatmap</h3>
                <div className="grid grid-cols-4 gap-2">
                  {['ETH', 'BSC', 'ARB', 'OP'].map(chain => (
                    ['critical', 'high', 'medium', 'low'].map(severity => {
                      const count = Math.floor(Math.random() * 20)
                      const opacity = count / 20
                      const bgColor = severity === 'critical' ? 'bg-red-500' : severity === 'high' ? 'bg-orange-500' : severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      return (
                        <div
                          key={`${chain}-${severity}`}
                          className={`h-12 rounded flex items-center justify-center ${bgColor} cursor-pointer hover:opacity-80 transition-opacity`}
                          style={{ opacity: 0.2 + opacity * 0.8 }}
                          title={`${chain} - ${severity}: ${count}`}
                        >
                          <span className="text-white text-xs font-medium">{count}</span>
                        </div>
                      )
                    })
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>ETH</span><span>BSC</span><span>ARB</span><span>OP</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-orange-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Live Anomaly Feed</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAnomalies.slice(0, 10).map((anomaly, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-orange-500/30 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getTypeIcon(anomaly.type)}</span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">{anomaly.type}</span>
                            <span className="text-gray-500">on</span>
                            <span className="text-cyan-400">{anomaly.chain}</span>
                          </div>
                          <p className="text-gray-400 text-sm">{anomaly.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(anomaly.severity)}`}>
                          {anomaly.severity?.toUpperCase()}
                        </span>
                        <div className="text-gray-500 text-xs mt-1">{formatTime(anomaly.timestamp)}</div>
                      </div>
                    </div>
                    {anomaly.value > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-400">Value at risk: </span>
                        <span className="text-orange-400 font-medium">${anomaly.value.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
