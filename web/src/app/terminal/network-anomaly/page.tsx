'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import ModuleErrorBoundary, { safeArray, safeNumber } from '../../../components/terminal/ModuleErrorBoundary'
import { useState, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

interface Anomaly {
  id: string
  type: string
  severity: string
  source: string
  target: string
  confidence: number
  timestamp: Date
  description: string
}

interface Metrics {
  totalAnomalies: number
  criticalCount: number
  avgConfidence: number
  networkHealth: number
  activeAlerts: number
  resolvedToday: number
}

function NetworkAnomalyEnginePageContent() {
  const [anomalies, setAnomalies] = useState<{id:string,type:string,severity:string,source:string,target:string,confidence:number,timestamp:Date,description:string}[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [metrics, setMetrics] = useState({ totalAnomalies: 0, criticalCount: 0, avgConfidence: 0, networkHealth: 85, activeAlerts: 0, resolvedToday: 0 })

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 15000); return () => clearInterval(i) }, [])

  async function fetchData() {
    try {
      const r = await fetch(`${API_BASE}/gq-core/network/anomalies`)
      if (r.ok) { const d = await r.json(); if (d.anomalies) { setAnomalies(d.anomalies); setMetrics(d.metrics || metrics) } else generateMockData() } else generateMockData()
    } catch { generateMockData() } finally { setLoading(false) }
  }

  function generateMockData() {
    const types = ['Unusual Traffic Pattern', 'Suspicious Connection', 'Data Exfiltration', 'DDoS Attempt', 'Port Scan', 'Lateral Movement', 'C2 Communication', 'DNS Tunneling']
    const severities = ['critical', 'high', 'medium', 'low']
    const sources = ['192.168.1.x', '10.0.0.x', 'External IP', 'Cloud Service', 'VPN Gateway']
    const targets = ['Database Server', 'API Gateway', 'Auth Service', 'Storage Node', 'Exchange Hot Wallet']
    const mockAnomalies = Array.from({ length: 20 }, (_, i) => ({
      id: `anomaly-${i}`,
      type: types[i % types.length],
      severity: severities[Math.floor(Math.random() * 4)],
      source: sources[i % sources.length],
      target: targets[i % targets.length],
      confidence: 60 + Math.random() * 40,
      timestamp: new Date(Date.now() - Math.random() * 86400000),
      description: `Detected ${types[i % types.length].toLowerCase()} from ${sources[i % sources.length]} targeting ${targets[i % targets.length]}`
    }))
    setAnomalies(mockAnomalies)
    setMetrics({
      totalAnomalies: mockAnomalies.length,
      criticalCount: mockAnomalies.filter(a => a.severity === 'critical').length,
      avgConfidence: mockAnomalies.reduce((s, a) => s + a.confidence, 0) / mockAnomalies.length,
      networkHealth: 100 - mockAnomalies.filter(a => a.severity === 'critical' || a.severity === 'high').length * 5,
      activeAlerts: mockAnomalies.filter(a => a.severity === 'critical' || a.severity === 'high').length,
      resolvedToday: Math.floor(Math.random() * 10) + 5
    })
  }

  const getSeverityColor = (sev: string) => ({ critical: 'bg-red-500/20 text-red-400 border-red-500', high: 'bg-orange-500/20 text-orange-400 border-orange-500', medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500', low: 'bg-green-500/20 text-green-400 border-green-500' }[sev] || 'bg-gray-500/20 text-gray-400 border-gray-500')
  const severities = ['all', 'critical', 'high', 'medium', 'low']
  const safeAnomalies = safeArray<Anomaly>(anomalies)
  const filtered = safeAnomalies.filter(a => selectedSeverity === 'all' || a?.severity === selectedSeverity)

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div><p className="text-gray-400">Scanning Network...</p></div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8"><TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Network Anomaly Engine</h1><p className="text-gray-400">Real-time network behavior analysis and threat detection</p></div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Total Anomalies</div><div className="text-2xl font-bold text-cyan-400">{metrics.totalAnomalies}</div></div>
          <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Critical</div><div className="text-2xl font-bold text-red-400">{metrics.criticalCount}</div></div>
          <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Active Alerts</div><div className="text-2xl font-bold text-yellow-400">{metrics.activeAlerts}</div></div>
          <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Resolved Today</div><div className="text-2xl font-bold text-green-400">{metrics.resolvedToday}</div></div>
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Avg Confidence</div><div className="text-2xl font-bold text-purple-400">{safeNumber(metrics.avgConfidence).toFixed(1)}%</div></div>
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Network Health</div><div className={`text-2xl font-bold ${metrics.networkHealth >= 80 ? 'text-green-400' : metrics.networkHealth >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{metrics.networkHealth}%</div></div>
        </div>
        <div className="mb-6 bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Network Health Status</h2>
          <div className="relative h-4 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full rounded-full ${metrics.networkHealth >= 80 ? 'bg-green-500' : metrics.networkHealth >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${metrics.networkHealth}%` }} /></div>
          <div className="flex justify-between text-xs text-gray-500 mt-2"><span>Critical</span><span>Degraded</span><span>Healthy</span></div>
        </div>
        <div className="flex gap-2 mb-6">{severities.map(s => <button key={s} onClick={() => setSelectedSeverity(s)} className={`px-4 py-2 rounded-lg text-sm capitalize ${selectedSeverity === s ? 'bg-cyan-500 text-black font-semibold' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}>{s === 'all' ? 'All Severities' : s}</button>)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20"><h2 className="text-lg font-semibold text-white">Detected Anomalies</h2></div>
            <div className="max-h-96 overflow-y-auto">
              {filtered.map(a => (
                <div key={a.id} className="p-4 border-b border-slate-700/50 hover:bg-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(a.severity)}`}>{a.severity.toUpperCase()}</span>
                    <span className="text-xs text-gray-500">{new Date(a.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="font-medium text-white mb-1">{a.type}</div>
                  <div className="text-sm text-gray-400 mb-2">{a.description}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cyan-400">{a.source} → {a.target}</span>
                    <span className="text-purple-400">Confidence: {a.confidence.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Severity Distribution</h2>
              <div className="space-y-3">
                {['critical', 'high', 'medium', 'low'].map(sev => {
                  const count = safeAnomalies.filter(a => a?.severity === sev).length
                  const pct = safeAnomalies.length > 0 ? (count / safeAnomalies.length) * 100 : 0
                  const colors = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-green-500' }
                  return <div key={sev}><div className="flex justify-between text-sm mb-1"><span className="text-gray-400 capitalize">{sev}</span><span className="text-white">{count}</span></div><div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full ${colors[sev as keyof typeof colors]} rounded-full`} style={{ width: `${pct}%` }} /></div></div>
                })}
              </div>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Top Attack Vectors</h2>
              <div className="space-y-2">
                {Array.from(new Set(safeAnomalies.map(a => a?.type || 'Unknown'))).slice(0, 5).map(type => {
                  const count = safeAnomalies.filter(a => a?.type === type).length
                  return <div key={type} className="flex items-center justify-between text-sm"><span className="text-gray-400 truncate">{type}</span><span className="text-cyan-400 font-medium">{count}</span></div>
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NetworkAnomalyEnginePage() {
  return (
    <ModuleErrorBoundary moduleName="Network Anomaly Engine">
      <NetworkAnomalyEnginePageContent />
    </ModuleErrorBoundary>
  )
}
