'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

export default function ThreatTimelinePage() {
  const [showGuide, setShowGuide] = useState(false)
  const [events, setEvents] = useState<{id:string,title:string,severity:string,timestamp:Date,source:string,status:string}[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [metrics, setMetrics] = useState({ totalEvents: 0, criticalEvents: 0, activeThreats: 0, resolvedToday: 0, threatLevel: 'moderate' })

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 20000); return () => clearInterval(i) }, [])

  async function fetchData() {
    try {
      const r = await fetch(`${API_BASE}/gq-core/threats/timeline`)
      if (r.ok) { const d = await r.json(); if (d.events) { setEvents(d.events); setMetrics(d.metrics || metrics) } else generateMockData() } else generateMockData()
    } catch { generateMockData() } finally { setLoading(false) }
  }

  function generateMockData() {
    const titles = ['Suspicious Wallet', 'Large Fund Movement', 'Smart Contract Exploit', 'Flash Loan Attack', 'Rug Pull Warning', 'Whale Accumulation', 'Exchange Outflow', 'Governance Attack']
    const severities = ['critical', 'high', 'medium', 'low']
    const sources = ['On-Chain Monitor', 'Social Sentinel', 'Exchange Feed', 'Protocol Scanner']
    const statuses = ['active', 'investigating', 'mitigated', 'resolved']
    const mockEvents = Array.from({ length: 25 }, (_, i) => ({
      id: `event-${i}`, title: titles[i % 8], severity: severities[Math.floor(Math.random() * 4)],
      timestamp: new Date(Date.now() - Math.random() * 86400000), source: sources[i % 4], status: statuses[Math.floor(Math.random() * 4)]
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    setEvents(mockEvents)
    const critical = mockEvents.filter(e => e.severity === 'critical').length
    setMetrics({ totalEvents: mockEvents.length, criticalEvents: critical, activeThreats: mockEvents.filter(e => e.status === 'active').length, resolvedToday: mockEvents.filter(e => e.status === 'resolved').length, threatLevel: critical > 3 ? 'high' : critical > 1 ? 'moderate' : 'low' })
  }

  const getSeverityColor = (sev: string) => ({ critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-green-500' }[sev] || 'bg-gray-500')
  const getStatusColor = (status: string) => ({ active: 'text-red-400', investigating: 'text-yellow-400', mitigated: 'text-blue-400', resolved: 'text-green-400' }[status] || 'text-gray-400')
  const getThreatColor = (level: string) => ({ low: 'text-green-400', moderate: 'text-yellow-400', high: 'text-red-400' }[level] || 'text-gray-400')
  const severities = ['all', 'critical', 'high', 'medium', 'low']
  const filtered = events.filter(e => selectedSeverity === 'all' || e.severity === selectedSeverity)

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8"><TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Threat Timeline</h1><p className="text-gray-400">Chronological view of security events and threat evolution</p></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Total Events</div><div className="text-2xl font-bold text-cyan-400">{metrics.totalEvents}</div></div>
          <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Critical</div><div className="text-2xl font-bold text-red-400">{metrics.criticalEvents}</div></div>
          <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Active</div><div className="text-2xl font-bold text-yellow-400">{metrics.activeThreats}</div></div>
          <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Resolved</div><div className="text-2xl font-bold text-green-400">{metrics.resolvedToday}</div></div>
          <div className="bg-slate-800/50 border border-orange-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Threat Level</div><div className={`text-2xl font-bold uppercase ${getThreatColor(metrics.threatLevel)}`}>{metrics.threatLevel}</div></div>
        </div>
        <div className="flex gap-2 mb-6">{severities.map(s => <button key={s} onClick={() => setSelectedSeverity(s)} className={`px-3 py-1.5 rounded-lg text-sm capitalize ${selectedSeverity === s ? 'bg-cyan-500 text-black font-semibold' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}>{s === 'all' ? 'All' : s}</button>)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Event Timeline</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700" />
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {filtered.map(event => (
                  <div key={event.id} className="relative pl-10">
                    <div className={`absolute left-2 w-5 h-5 rounded-full ${getSeverityColor(event.severity)} flex items-center justify-center`}><div className="w-2 h-2 bg-white rounded-full" /></div>
                    <div className="bg-slate-800/80 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2"><span className="font-medium text-white">{event.title}</span><span className={`text-sm ${getStatusColor(event.status)}`}>{event.status}</span></div>
                      <div className="flex items-center justify-between text-xs"><span className="text-cyan-400">{event.source}</span><span className="text-gray-500">{new Date(event.timestamp).toLocaleString()}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Severity Breakdown</h2>
            <div className="space-y-3">
              {['critical', 'high', 'medium', 'low'].map(sev => {
                const count = events.filter(e => e.severity === sev).length
                const pct = (count / events.length) * 100 || 0
                return <div key={sev}><div className="flex justify-between text-sm mb-1"><span className="text-gray-400 capitalize">{sev}</span><span className="text-white">{count}</span></div><div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full ${getSeverityColor(sev)} rounded-full`} style={{ width: `${pct}%` }} /></div></div>
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
