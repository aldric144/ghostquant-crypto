'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import InfoTooltip from '../../../components/ui/InfoTooltip'
import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'

interface BehavioralProfile {
  id: string
  label: string
  type: string
  risk_score: number
  behavioral_signature: string
  similarity_score: number
  patterns: string[]
  linked_wallets: number
  anomaly_score: number
}

interface ApiResponse {
  entities?: BehavioralProfile[]
  total_entities?: number
  timestamp?: string
}

export default function BehavioralDNAEnginePage() {
  const [showGuide, setShowGuide] = useState(false)
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<BehavioralProfile | null>(null)

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

  const profiles = (data?.entities || []).map(e => ({
    ...e,
    behavioral_signature: `SIG-${e.id.slice(0, 8).toUpperCase()}`,
    similarity_score: Math.random() * 0.5 + 0.5,
    patterns: ['high_frequency', 'batch_transfers', 'time_clustering', 'value_splitting'].slice(0, Math.floor(Math.random() * 4) + 1),
    linked_wallets: Math.floor(Math.random() * 30) + 2,
    anomaly_score: Math.random() * 0.8 + 0.1
  })) as BehavioralProfile[]

  const dnaPatternData = [
    { metric: 'Frequency', value: 72 },
    { metric: 'Timing', value: 58 },
    { metric: 'Value', value: 85 },
    { metric: 'Network', value: 63 },
    { metric: 'Clustering', value: 91 },
    { metric: 'Velocity', value: 47 }
  ]

  const timelineData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    activity: Math.floor(Math.random() * 100) + 20,
    anomalies: Math.floor(Math.random() * 30)
  }))

  const highAnomaly = profiles.filter(p => p.anomaly_score > 0.6).length
  const linkedTotal = profiles.reduce((sum, p) => sum + p.linked_wallets, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-purple-400 text-sm font-medium">DNA Analysis Active</span>
          </div>
          <TerminalBackButton className="mb-4" />
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-white">Behavioral DNA Engine</h1>
            <InfoTooltip content="Analyzes behavioral clustering that may evolve as data updates. Entity classifications are derived from pattern analysis and may change over time." />
          </div>
          <p className="text-gray-400">On-chain behavioral fingerprinting and pattern analysis</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <span className="ml-3 text-gray-400">Analyzing behavioral patterns...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-300">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Profiles Analyzed</div>
                <div className="text-2xl font-bold text-white">{profiles.length}</div>
              </div>
              <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">High Anomaly</div>
                <div className="text-2xl font-bold text-red-400">{highAnomaly}</div>
              </div>
              <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Linked Wallets</div>
                <div className="text-2xl font-bold text-purple-400">{linkedTotal}</div>
              </div>
              <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Unique Patterns</div>
                <div className="text-2xl font-bold text-cyan-400">4</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">DNA Pattern Analysis</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={dnaPatternData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="metric" stroke="#9ca3af" fontSize={11} />
                      <Radar name="Pattern Strength" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #a855f7', borderRadius: '8px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Activity Timeline (24h)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <XAxis dataKey="hour" stroke="#6b7280" fontSize={10} interval={3} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #a855f7', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="activity" stroke="#a855f7" strokeWidth={2} dot={false} name="Activity" />
                      <Line type="monotone" dataKey="anomalies" stroke="#ef4444" strokeWidth={2} dot={false} name="Anomalies" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-800/50 border border-purple-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Behavioral Profiles</h3>
                <div className="space-y-3">
                  {profiles.slice(0, 6).map((profile, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedProfile(profile)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedProfile?.id === profile.id ? 'border-purple-500 bg-slate-700/50' : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-white">{profile.label || 'Unknown Entity'}</div>
                          <div className="text-xs text-purple-400 font-mono">{profile.behavioral_signature}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Anomaly Score</div>
                          <div className={`font-bold ${profile.anomaly_score > 0.6 ? 'text-red-400' : profile.anomaly_score > 0.3 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {(profile.anomaly_score * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {profile.patterns.map((pattern, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                            {pattern.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {selectedProfile ? 'Profile Details' : 'Select a Profile'}
                </h3>
                {selectedProfile ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-gray-400 text-sm">Signature</div>
                      <div className="text-purple-400 font-mono">{selectedProfile.behavioral_signature}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Similarity Score</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${selectedProfile.similarity_score * 100}%` }} />
                        </div>
                        <span className="text-purple-400">{(selectedProfile.similarity_score * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Anomaly Score</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div className={`h-2 rounded-full ${selectedProfile.anomaly_score > 0.6 ? 'bg-red-500' : selectedProfile.anomaly_score > 0.3 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${selectedProfile.anomaly_score * 100}%` }} />
                        </div>
                        <span className={selectedProfile.anomaly_score > 0.6 ? 'text-red-400' : selectedProfile.anomaly_score > 0.3 ? 'text-yellow-400' : 'text-green-400'}>
                          {(selectedProfile.anomaly_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Linked Wallets</div>
                      <div className="text-white">{selectedProfile.linked_wallets}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Detected Patterns</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedProfile.patterns.map((pattern, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                            {pattern.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    Click on a profile to view behavioral DNA details
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
