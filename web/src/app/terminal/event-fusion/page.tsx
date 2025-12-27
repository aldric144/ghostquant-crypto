'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

export default function EventFusionEnginePage() {
  const [showGuide, setShowGuide] = useState(false)
  const [events, setEvents] = useState<{id:string,name:string,sources:string[],confidence:number,impact:string,category:string,timestamp:Date,correlations:number}[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [metrics, setMetrics] = useState({ totalEvents: 0, fusedEvents: 0, avgConfidence: 0, avgCorrelations: 0, highImpact: 0, sourcesActive: 0 })

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 15000); return () => clearInterval(i) }, [])

  async function fetchData() {
    try {
      const r = await fetch(`${API_BASE}/gq-core/events/fusion`)
      if (r.ok) { const d = await r.json(); if (d.events) { setEvents(d.events); setMetrics(d.metrics || metrics) } else generateMockData() } else generateMockData()
    } catch { generateMockData() } finally { setLoading(false) }
  }

  function generateMockData() {
    const names = ['Market Crash Signal', 'Whale Movement Cluster', 'Protocol Vulnerability', 'Liquidity Crisis', 'Governance Attack', 'Exchange Anomaly', 'Smart Contract Event', 'Network Congestion']
    const categories = ['market', 'security', 'protocol', 'network', 'governance']
    const impacts = ['critical', 'high', 'medium', 'low']
    const allSources = ['On-Chain', 'Social', 'Exchange', 'Protocol', 'Network', 'News']
    const mockEvents = Array.from({ length: 20 }, (_, i) => ({
      id: `event-${i}`, name: names[i % 8], sources: allSources.slice(0, Math.floor(Math.random() * 4) + 2),
      confidence: 60 + Math.random() * 40, impact: impacts[Math.floor(Math.random() * 4)],
      category: categories[i % 5], timestamp: new Date(Date.now() - Math.random() * 86400000), correlations: Math.floor(Math.random() * 8) + 2
    }))
    setEvents(mockEvents)
    setMetrics({ totalEvents: mockEvents.length, fusedEvents: mockEvents.filter(e => e.sources.length > 2).length, avgConfidence: mockEvents.reduce((s, e) => s + e.confidence, 0) / mockEvents.length, avgCorrelations: mockEvents.reduce((s, e) => s + e.correlations, 0) / mockEvents.length, highImpact: mockEvents.filter(e => e.impact === 'critical' || e.impact === 'high').length, sourcesActive: 6 })
  }

  const getImpactColor = (impact: string) => ({ critical: 'bg-red-500/20 text-red-400 border-red-500', high: 'bg-orange-500/20 text-orange-400 border-orange-500', medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500', low: 'bg-green-500/20 text-green-400 border-green-500' }[impact] || 'bg-gray-500/20 text-gray-400 border-gray-500')
  const categories = ['all', 'market', 'security', 'protocol', 'network', 'governance']
  const filtered = events.filter(e => selectedCategory === 'all' || e.category === selectedCategory)

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8"><TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Event Fusion Engine</h1><p className="text-gray-400">Multi-source event correlation and intelligence fusion</p></div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Total Events</div><div className="text-2xl font-bold text-cyan-400">{metrics.totalEvents}</div></div>
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Fused Events</div><div className="text-2xl font-bold text-purple-400">{metrics.fusedEvents}</div></div>
          <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Avg Confidence</div><div className="text-2xl font-bold text-green-400">{metrics.avgConfidence.toFixed(0)}%</div></div>
          <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Avg Correlations</div><div className="text-2xl font-bold text-yellow-400">{metrics.avgCorrelations.toFixed(1)}</div></div>
          <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">High Impact</div><div className="text-2xl font-bold text-red-400">{metrics.highImpact}</div></div>
          <div className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Sources Active</div><div className="text-2xl font-bold text-blue-400">{metrics.sourcesActive}</div></div>
        </div>
        <div className="flex gap-2 mb-6">{categories.map(c => <button key={c} onClick={() => setSelectedCategory(c)} className={`px-3 py-1.5 rounded-lg text-sm capitalize ${selectedCategory === c ? 'bg-cyan-500 text-black font-semibold' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}>{c === 'all' ? 'All Categories' : c}</button>)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20"><h2 className="text-lg font-semibold text-white">Fused Events</h2></div>
            <div className="max-h-[500px] overflow-y-auto">
              {filtered.map(event => (
                <div key={event.id} className="p-4 border-b border-slate-700/50 hover:bg-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{event.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getImpactColor(event.impact)}`}>{event.impact.toUpperCase()}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">{event.sources.map(s => <span key={s} className="px-2 py-0.5 bg-slate-700 rounded text-xs text-cyan-400">{s}</span>)}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{event.correlations} correlations</span>
                    <span className="text-green-400">Conf: {event.confidence.toFixed(0)}%</span>
                    <span className="text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Source Distribution</h2>
              <div className="space-y-3">
                {['On-Chain', 'Social', 'Exchange', 'Protocol', 'Network', 'News'].map(source => {
                  const count = events.filter(e => e.sources.includes(source)).length
                  const pct = (count / events.length) * 100 || 0
                  return <div key={source}><div className="flex justify-between text-sm mb-1"><span className="text-gray-400">{source}</span><span className="text-white">{count}</span></div><div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} /></div></div>
                })}
              </div>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Impact Distribution</h2>
              <div className="grid grid-cols-2 gap-4">
                {['critical', 'high', 'medium', 'low'].map(impact => {
                  const count = events.filter(e => e.impact === impact).length
                  const colors = { critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-green-400' }
                  return <div key={impact} className="text-center"><div className={`text-2xl font-bold ${colors[impact as keyof typeof colors]}`}>{count}</div><div className="text-xs text-gray-400 capitalize">{impact}</div></div>
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
