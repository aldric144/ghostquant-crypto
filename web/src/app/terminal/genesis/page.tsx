'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useEffect, useState } from 'react'

interface Narrative {
  id: string
  title: string
  summary: string
  category: string
  severity: string
  timestamp: string
  tags: string[]
  impact_score: number
}

interface ApiResponse {
  narratives?: Narrative[]
  total_narratives?: number
  timestamp?: string
}

export default function GenesisArchivePage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/gq-core/narratives', { cache: 'no-store' })
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
  }, [])

  const narratives = data?.narratives || []
  const categories = Array.from(new Set(narratives.map(n => n.category))).filter(Boolean)
  
  const filteredNarratives = narratives.filter(n => {
    const matchesCategory = categoryFilter === 'all' || n.category === categoryFilter
    const matchesSearch = !searchQuery || 
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getSeverityColor = (severity: string) => {
    if (severity === 'critical') return 'text-red-400 bg-red-500/20 border-red-500/30'
    if (severity === 'high') return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
    if (severity === 'medium') return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    return 'text-green-400 bg-green-500/20 border-green-500/30'
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      exploit: 'bg-red-500',
      manipulation: 'bg-orange-500',
      regulation: 'bg-blue-500',
      market: 'bg-green-500',
      protocol: 'bg-purple-500',
      hack: 'bg-pink-500'
    }
    return colors[category?.toLowerCase()] || 'bg-gray-500'
  }

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      })
    } catch {
      return timestamp
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-amber-400 text-sm font-medium">Archive Active</span>
          </div>
          <TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Genesis Archive</h1>
          <p className="text-gray-400">Historical intelligence archive of market events and incidents</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <span className="ml-3 text-gray-400">Loading archive...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-300">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/50 border border-amber-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Total Events</div>
                <div className="text-2xl font-bold text-white">{data?.total_narratives || narratives.length}</div>
              </div>
              <div className="bg-slate-800/50 border border-red-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Critical</div>
                <div className="text-2xl font-bold text-red-400">{narratives.filter(n => n.severity === 'critical').length}</div>
              </div>
              <div className="bg-slate-800/50 border border-orange-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">High Severity</div>
                <div className="text-2xl font-bold text-orange-400">{narratives.filter(n => n.severity === 'high').length}</div>
              </div>
              <div className="bg-slate-800/50 border border-amber-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Categories</div>
                <div className="text-2xl font-bold text-amber-400">{categories.length}</div>
              </div>
            </div>

            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    categoryFilter === 'all' ? 'bg-amber-600 text-white' : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
                  }`}
                >All</button>
                {categories.slice(0, 5).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      categoryFilter === cat ? 'bg-amber-600 text-white' : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${getCategoryColor(cat)}`} />
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredNarratives.slice(0, 10).map((narrative, idx) => (
                <div key={idx} className="bg-slate-800/50 border border-amber-500/20 rounded-xl p-6 hover:border-amber-500/40 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-2 h-2 rounded-full ${getCategoryColor(narrative.category)}`} />
                        <span className="text-gray-400 text-sm">{narrative.category}</span>
                        <span className="text-gray-600">|</span>
                        <span className="text-gray-500 text-sm">{formatDate(narrative.timestamp)}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{narrative.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{narrative.summary}</p>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded text-xs font-medium border ${getSeverityColor(narrative.severity)}`}>
                        {narrative.severity?.toUpperCase()}
                      </span>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Impact</div>
                        <div className="text-amber-400 font-bold">{(narrative.impact_score * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {narrative.tags?.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-700/50 text-gray-400 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {filteredNarratives.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No events found matching your criteria
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
