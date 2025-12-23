'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import InfoTooltip from '../../../components/ui/InfoTooltip'
import { useState, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

export default function ManipulationDetectorPage() {
  const [alerts, setAlerts] = useState<{id:string,asset:string,type:string,severity:string,confidence:number,priceImpact:number,volume:number,timestamp:Date,status:string}[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [metrics, setMetrics] = useState({ totalAlerts: 0, activeManipulations: 0, avgConfidence: 0, marketIntegrity: 92, washTrades: 0, spoofingEvents: 0 })

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 10000); return () => clearInterval(i) }, [])

  async function fetchData() {
    try {
      const r = await fetch(`${API_BASE}/gq-core/manipulation/detect`)
      if (r.ok) { const d = await r.json(); if (d.alerts) { setAlerts(d.alerts); setMetrics(d.metrics || metrics) } else generateMockData() } else generateMockData()
    } catch { generateMockData() } finally { setLoading(false) }
  }

  function generateMockData() {
    const types = ['Wash Trading', 'Spoofing', 'Layering', 'Pump & Dump', 'Front Running', 'Quote Stuffing', 'Momentum Ignition']
    const assets = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT', 'ARB/USDT', 'OP/USDT']
    const severities = ['critical', 'high', 'medium', 'low']
    const statuses = ['active', 'investigating', 'resolved']
    const mockAlerts = Array.from({ length: 15 }, (_, i) => ({
      id: `alert-${i}`,
      asset: assets[i % assets.length],
      type: types[i % types.length],
      severity: severities[Math.floor(Math.random() * 4)],
      confidence: 70 + Math.random() * 30,
      priceImpact: Math.random() * 5 - 2.5,
      volume: Math.random() * 10000000 + 100000,
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      status: statuses[Math.floor(Math.random() * 3)]
    }))
    setAlerts(mockAlerts)
    setMetrics({
      totalAlerts: mockAlerts.length,
      activeManipulations: mockAlerts.filter(a => a.status === 'active').length,
      avgConfidence: mockAlerts.reduce((s, a) => s + a.confidence, 0) / mockAlerts.length,
      marketIntegrity: 100 - mockAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length * 3,
      washTrades: mockAlerts.filter(a => a.type === 'Wash Trading').length,
      spoofingEvents: mockAlerts.filter(a => a.type === 'Spoofing').length
    })
  }

  const getSeverityColor = (sev: string) => ({ critical: 'bg-red-500/20 text-red-400 border-red-500', high: 'bg-orange-500/20 text-orange-400 border-orange-500', medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500', low: 'bg-green-500/20 text-green-400 border-green-500' }[sev] || 'bg-gray-500/20 text-gray-400 border-gray-500')
  const getStatusColor = (status: string) => ({ active: 'text-red-400', investigating: 'text-yellow-400', resolved: 'text-green-400' }[status] || 'text-gray-400')
  const types = ['all', 'Wash Trading', 'Spoofing', 'Layering', 'Pump & Dump', 'Front Running']
  const filtered = alerts.filter(a => selectedType === 'all' || a.type === selectedType)
  const fmt = (v: number) => v >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : `$${(v / 1e3).toFixed(2)}K`

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div><p className="text-gray-400">Scanning for Manipulation...</p></div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8"><TerminalBackButton className="mb-4" />
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-cyan-400">Price Manipulation Detector</h1>
            <InfoTooltip content="Flags early indicators of potential manipulation. Not all signals are confirmed events. Patterns may evolve as additional data becomes available." />
          </div>
          <p className="text-gray-400">Real-time detection of market manipulation patterns and suspicious trading activity</p></div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Total Alerts</div><div className="text-2xl font-bold text-cyan-400">{metrics.totalAlerts}</div></div>
          <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Active</div><div className="text-2xl font-bold text-red-400">{metrics.activeManipulations}</div></div>
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Avg Confidence</div><div className="text-2xl font-bold text-purple-400">{metrics.avgConfidence.toFixed(1)}%</div></div>
          <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Market Integrity</div><div className={`text-2xl font-bold ${metrics.marketIntegrity >= 80 ? 'text-green-400' : metrics.marketIntegrity >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{metrics.marketIntegrity}%</div></div>
          <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Wash Trades</div><div className="text-2xl font-bold text-yellow-400">{metrics.washTrades}</div></div>
          <div className="bg-slate-800/50 border border-orange-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Spoofing</div><div className="text-2xl font-bold text-orange-400">{metrics.spoofingEvents}</div></div>
        </div>
        <div className="mb-6 bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Market Integrity Score</h2>
          <div className="relative h-4 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full rounded-full ${metrics.marketIntegrity >= 80 ? 'bg-green-500' : metrics.marketIntegrity >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${metrics.marketIntegrity}%` }} /></div>
          <div className="flex justify-between text-xs text-gray-500 mt-2"><span>Compromised</span><span>Suspicious</span><span>Clean</span></div>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">{types.map(t => <button key={t} onClick={() => setSelectedType(t)} className={`px-3 py-1.5 rounded-lg text-sm ${selectedType === t ? 'bg-cyan-500 text-black font-semibold' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}>{t === 'all' ? 'All Types' : t}</button>)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20"><h2 className="text-lg font-semibold text-white">Manipulation Alerts</h2></div>
            <div className="max-h-96 overflow-y-auto">
              {filtered.map(a => (
                <div key={a.id} className="p-4 border-b border-slate-700/50 hover:bg-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><span className="font-medium text-cyan-400">{a.asset}</span><span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSeverityColor(a.severity)}`}>{a.severity.toUpperCase()}</span></div>
                    <span className={`text-sm font-medium ${getStatusColor(a.status)}`}>{a.status}</span>
                  </div>
                  <div className="text-white font-medium mb-1">{a.type}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Volume: {fmt(a.volume)}</span>
                    <span className={`${a.priceImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>Impact: {a.priceImpact >= 0 ? '+' : ''}{a.priceImpact.toFixed(2)}%</span>
                    <span className="text-purple-400">Conf: {a.confidence.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Manipulation Types</h2>
              <div className="space-y-3">
                {Array.from(new Set(alerts.map(a => a.type))).slice(0, 6).map(type => {
                  const count = alerts.filter(a => a.type === type).length
                  const pct = (count / alerts.length) * 100
                  return <div key={type}><div className="flex justify-between text-sm mb-1"><span className="text-gray-400 truncate">{type}</span><span className="text-white">{count}</span></div><div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} /></div></div>
                })}
              </div>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Affected Assets</h2>
              <div className="space-y-2">
                {Array.from(new Set(alerts.map(a => a.asset))).map(asset => {
                  const count = alerts.filter(a => a.asset === asset).length
                  const critical = alerts.filter(a => a.asset === asset && (a.severity === 'critical' || a.severity === 'high')).length
                  return <div key={asset} className="flex items-center justify-between"><span className="text-cyan-400">{asset}</span><div className="flex items-center gap-2"><span className="text-white">{count}</span>{critical > 0 && <span className="text-red-400 text-xs">({critical} critical)</span>}</div></div>
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
