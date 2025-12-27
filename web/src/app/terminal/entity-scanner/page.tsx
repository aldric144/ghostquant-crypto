'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface Entity {
  id: string
  label: string
  type: string
  risk_score: number
  activity_level: string
  last_seen: string
  total_volume: number
  transaction_count: number
}

interface ApiResponse {
  entities?: Entity[]
  total_entities?: number
  high_risk_count?: number
  timestamp?: string
}

export default function EntityScannerPage() {
  const [showGuide, setShowGuide] = useState(false)
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [riskFilter, setRiskFilter] = useState<string>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/gq-core/entities', { cache: 'no-store' })
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

  const entities = data?.entities || []
  
  const filteredEntities = riskFilter === 'all' ? entities 
    : riskFilter === 'high' ? entities.filter(e => e.risk_score > 0.7)
    : riskFilter === 'medium' ? entities.filter(e => e.risk_score > 0.4 && e.risk_score <= 0.7)
    : entities.filter(e => e.risk_score <= 0.4)

  const highRisk = entities.filter(e => e.risk_score > 0.7).length
  const mediumRisk = entities.filter(e => e.risk_score > 0.4 && e.risk_score <= 0.7).length
  const lowRisk = entities.filter(e => e.risk_score <= 0.4).length

  const pieData = [
    { name: 'High Risk', value: highRisk, color: '#ef4444' },
    { name: 'Medium Risk', value: mediumRisk, color: '#f59e0b' },
    { name: 'Low Risk', value: lowRisk, color: '#22c55e' }
  ]

  const volumeData = entities.slice(0, 8).map(e => ({
    name: e.label?.slice(0, 8) || e.id.slice(0, 8),
    volume: e.total_volume / 1000000
  }))

  const getRiskColor = (score: number) => {
    if (score > 0.7) return 'text-red-400 bg-red-500/20'
    if (score > 0.4) return 'text-yellow-400 bg-yellow-500/20'
    return 'text-green-400 bg-green-500/20'
  }

  const getRiskMeter = (score: number) => {
    const percentage = score * 100
    const color = score > 0.7 ? 'bg-red-500' : score > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
    return (
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-sm font-medium">Live Feed</span>
          </div>
          <TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Predictive Entity Scanner</h1>
          <p className="text-gray-400">ML-powered entity classification and risk prediction</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <span className="ml-3 text-gray-400">Scanning entities...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-300">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Total Entities</div>
                <div className="text-2xl font-bold text-white">{data?.total_entities || entities.length}</div>
              </div>
              <div className="bg-slate-800/50 border border-red-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">High Risk</div>
                <div className="text-2xl font-bold text-red-400">{highRisk}</div>
              </div>
              <div className="bg-slate-800/50 border border-yellow-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Medium Risk</div>
                <div className="text-2xl font-bold text-yellow-400">{mediumRisk}</div>
              </div>
              <div className="bg-slate-800/50 border border-green-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Low Risk</div>
                <div className="text-2xl font-bold text-green-400">{lowRisk}</div>
              </div>
            </div>

            <div className="mb-6 flex gap-2">
              {['all', 'high', 'medium', 'low'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setRiskFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                    riskFilter === filter ? 'bg-cyan-600 text-white' : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
                  }`}
                >{filter === 'all' ? 'All Entities' : `${filter} Risk`}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0891b2', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-2 bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Entity Volume (M)</h3>
                <div className="h-48">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEntities.slice(0, 9).map((entity, idx) => (
                <div key={idx} className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-500/40 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-white">{entity.label || 'Unknown Entity'}</div>
                      <div className="text-xs text-gray-500 font-mono">{entity.id.slice(0, 20)}...</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(entity.risk_score)}`}>
                      {(entity.risk_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="text-xs text-gray-400 mb-1">Risk Level</div>
                    {getRiskMeter(entity.risk_score)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-gray-400 text-xs">Type</div>
                      <div className="text-cyan-400">{entity.type}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Activity</div>
                      <div className="text-white">{entity.activity_level}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Transactions</div>
                      <div className="text-white">{entity.transaction_count?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Volume</div>
                      <div className="text-white">${(entity.total_volume / 1000000).toFixed(2)}M</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
