'use client'

import { useState, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

interface HydraCluster {
  cluster_id: string
  heads: string[]
  relays: string[]
  proxies: string[]
  risk_level: string
  risk_score: number
  indicators: Record<string, number>
  narrative: string
  timestamp: string
}

interface HydraDetectResponse {
  success: boolean
  report?: {
    cluster: HydraCluster
    summary: string
    recommendations: string[]
  }
  error?: string
  timestamp: string
}

interface HydraIndicators {
  sync_index: number
  burst_index: number
  chain_hop_index: number
  cross_ratio: number
  deception_index: number
  manipulation_intent_score: number
  volatility_tension_score: number
  anomaly_density: number
  ring_overlap_rate: number
  relay_dependency: number
  proxy_density: number
  temporal_escalation: number
  structural_cohesion: number
  fragmentation_score: number
  operational_depth: number
}

export default function HydraConsolePage() {
  const [originAddress, setOriginAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HydraDetectResponse | null>(null)
  const [cluster, setCluster] = useState<HydraCluster | null>(null)
  const [indicators, setIndicators] = useState<HydraIndicators | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchCluster = async () => {
    try {
      const response = await fetch(`${API_BASE}/hydra/hydra/cluster`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.cluster) {
          setCluster(data.cluster)
        }
      }
    } catch (err) {
      console.error('Failed to fetch cluster:', err)
    }
  }

  const fetchIndicators = async () => {
    try {
      const response = await fetch(`${API_BASE}/hydra/hydra/indicators`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.indicators) {
          setIndicators(data.indicators)
        }
      }
    } catch (err) {
      console.error('Failed to fetch indicators:', err)
    }
  }

  useEffect(() => {
    fetchCluster()
    fetchIndicators()
    const interval = setInterval(() => {
      fetchCluster()
      fetchIndicators()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleDetect = async () => {
    if (!originAddress) {
      setError('Please enter an origin address')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${API_BASE}/hydra/hydra/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ origin_address: originAddress }),
      })

      const data: HydraDetectResponse = await response.json()

      if (data.success) {
        setResult(data)
        fetchCluster()
        fetchIndicators()
      } else {
        setError(data.error || 'Detection failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30'
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30'
      case 'elevated': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30'
      case 'moderate': return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/30'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  const getIndicatorColor = (value: number) => {
    if (value >= 0.8) return 'text-red-500'
    if (value >= 0.6) return 'text-orange-500'
    if (value >= 0.4) return 'text-yellow-500'
    if (value >= 0.2) return 'text-blue-400'
    return 'text-green-400'
  }

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-red-400 flex items-center gap-3">
            <span className="text-4xl">🐉</span>
            Operation Hydra Console
          </h1>
          <p className="text-gray-400 mt-2">
            Multi-Head Coordinated Network Detection Engine
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Origin Address
            </label>
            <input
              type="text"
              value={originAddress}
              onChange={(e) => setOriginAddress(e.target.value)}
              placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
              className="w-full px-4 py-2 bg-slate-900/50 border border-red-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-red-500/50"
            />
          </div>

          <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4 flex items-end">
            <button
              onClick={handleDetect}
              disabled={loading}
              className="w-full px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Detecting...
                </span>
              ) : (
                'Run Hydra Detection'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cluster && (
            <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-400 mb-4">Latest Hydra Cluster</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Risk Level</span>
                  <span className={`px-3 py-1 rounded border ${getRiskColor(cluster.risk_level)}`}>
                    {cluster.risk_level?.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Risk Score</span>
                  <span className="text-2xl font-bold text-red-400">
                    {(cluster.risk_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Hydra Heads ({cluster.heads?.length || 0})</span>
                  <div className="mt-1 space-y-1">
                    {cluster.heads?.slice(0, 3).map((head, idx) => (
                      <div key={idx} className="text-xs font-mono text-gray-300 truncate">
                        {head}
                      </div>
                    ))}
                    {(cluster.heads?.length || 0) > 3 && (
                      <div className="text-xs text-gray-500">+{cluster.heads.length - 3} more</div>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Relays ({cluster.relays?.length || 0})</span>
                  <div className="mt-1 space-y-1">
                    {cluster.relays?.slice(0, 3).map((relay, idx) => (
                      <div key={idx} className="text-xs font-mono text-gray-300 truncate">
                        {relay}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {indicators && (
            <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-400 mb-4">Threat Indicators</h2>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(indicators).map(([key, value]) => (
                  <div key={key} className="bg-slate-900/50 rounded-lg p-2">
                    <div className="text-xs text-gray-400 capitalize">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className={`text-lg font-semibold ${getIndicatorColor(value)}`}>
                      {(value * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {result?.report && (
          <div className="mt-6 space-y-6">
            <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-400 mb-4">Detection Report</h2>
              <p className="text-gray-300 mb-4">{result.report.summary}</p>
              {result.report.recommendations?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Recommendations</h3>
                  <ul className="space-y-1">
                    {result.report.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-gray-300 text-sm">- {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {result.report.cluster?.narrative && (
              <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-red-400 mb-4">Intelligence Narrative</h2>
                <p className="text-gray-300 whitespace-pre-wrap text-sm">
                  {result.report.cluster.narrative}
                </p>
              </div>
            )}
          </div>
        )}

        {!cluster && !indicators && !result && !error && !loading && (
          <div className="text-center py-12 text-gray-500">
            Enter an origin address to run Hydra detection, or wait for live data to load
          </div>
        )}
      </div>
    </div>
  )
}
