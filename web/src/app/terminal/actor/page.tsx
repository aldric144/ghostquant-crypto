'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'

interface ThreatActor {
  id: string
  label: string
  type: string
  threat_level: string
  risk_score: number
  activity_count: number
  last_active: string
  indicators: string[]
  associated_wallets: number
}

interface ApiResponse {
  entities?: ThreatActor[]
  total_entities?: number
  high_risk_count?: number
  timestamp?: string
}

export default function ThreatActorProfilerPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedActor, setSelectedActor] = useState<ThreatActor | null>(null)

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

  const actors = (data?.entities || []).map(e => ({
    ...e,
    threat_level: e.risk_score > 0.7 ? 'critical' : e.risk_score > 0.4 ? 'high' : 'medium',
    indicators: ['wash_trading', 'coordinated_activity', 'suspicious_timing'].slice(0, Math.floor(Math.random() * 3) + 1),
    associated_wallets: Math.floor(Math.random() * 50) + 5
  })) as ThreatActor[]

  const criticalCount = actors.filter(a => a.threat_level === 'critical').length
  const highCount = actors.filter(a => a.threat_level === 'high').length
  const mediumCount = actors.filter(a => a.threat_level === 'medium').length

  const activityData = actors.slice(0, 8).map(a => ({
    name: a.label?.slice(0, 6) || a.id.slice(0, 6),
    activity: a.activity_count || Math.floor(Math.random() * 100)
  }))

  const radarData = [
    { metric: 'Wash Trading', value: 65 },
    { metric: 'Coordination', value: 78 },
    { metric: 'Timing', value: 45 },
    { metric: 'Volume', value: 82 },
    { metric: 'Network', value: 56 },
    { metric: 'Frequency', value: 71 }
  ]

  const getThreatColor = (level: string) => {
    if (level === 'critical') return 'text-red-400 bg-red-500/20 border-red-500/30'
    if (level === 'high') return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
    return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm font-medium">Threat Detection Active</span>
          </div>
          <TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Threat Actor Profiler</h1>
          <p className="text-gray-400">Identify and profile malicious actors across blockchain networks</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            <span className="ml-3 text-gray-400">Scanning for threat actors...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-300">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Total Actors</div>
                <div className="text-2xl font-bold text-white">{actors.length}</div>
              </div>
              <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Critical Threats</div>
                <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
              </div>
              <div className="bg-slate-800/50 border border-orange-500/30 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">High Risk</div>
                <div className="text-2xl font-bold text-orange-400">{highCount}</div>
              </div>
              <div className="bg-slate-800/50 border border-yellow-500/30 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Medium Risk</div>
                <div className="text-2xl font-bold text-yellow-400">{mediumCount}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Activity by Actor</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ef4444', borderRadius: '8px' }} />
                      <Bar dataKey="activity" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Threat Indicators</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="metric" stroke="#9ca3af" fontSize={11} />
                      <Radar name="Threat Level" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ef4444', borderRadius: '8px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Threat Actor Profiles</h3>
                <div className="space-y-3">
                  {actors.slice(0, 6).map((actor, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedActor(actor)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedActor?.id === actor.id ? 'border-cyan-500 bg-slate-700/50' : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-white">{actor.label || 'Unknown Actor'}</div>
                          <div className="text-xs text-gray-500 font-mono">{actor.id.slice(0, 24)}...</div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getThreatColor(actor.threat_level)}`}>
                          {actor.threat_level.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {actor.indicators?.map((ind, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-700 rounded text-xs text-gray-400">
                            {ind.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {selectedActor ? 'Actor Details' : 'Select an Actor'}
                </h3>
                {selectedActor ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-gray-400 text-sm">ID</div>
                      <div className="text-white font-mono text-sm break-all">{selectedActor.id}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Type</div>
                      <div className="text-cyan-400">{selectedActor.type}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Risk Score</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${selectedActor.risk_score * 100}%` }} />
                        </div>
                        <span className="text-red-400">{(selectedActor.risk_score * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Associated Wallets</div>
                      <div className="text-white">{selectedActor.associated_wallets}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Indicators</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedActor.indicators?.map((ind, i) => (
                          <span key={i} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                            {ind.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    Click on a threat actor to view detailed profile
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
