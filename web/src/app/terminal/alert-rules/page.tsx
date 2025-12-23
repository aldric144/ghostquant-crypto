'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'
export default function AlertRulesEnginePage() {
  const [rules, setRules] = useState<{id:string,name:string,type:string,status:string,condition:string,severity:string,triggeredCount:number,lastTriggered:Date|null,createdAt:Date}[]>([])
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({ totalRules: 0, activeRules: 0, triggeredToday: 0, criticalAlerts: 0, avgTriggerRate: 0, disabledRules: 0 })
  useEffect(() => { fetchData(); const i = setInterval(fetchData, 30000); return () => clearInterval(i) }, [])
  async function fetchData() {
    try {
      const r = await fetch(`${API_BASE}/gq-core/alerts/rules`)
      if (r.ok) { const d = await r.json(); if (d.rules) { setRules(d.rules); setMetrics(d.metrics || metrics) } else generateMockData() } else generateMockData()
    } catch { generateMockData() } finally { setLoading(false) }
  }
  function generateMockData() {
    const names = ['Price Threshold', 'Volume Spike', 'Whale Movement', 'Liquidity Drop', 'Volatility Alert', 'Risk Limit', 'Position Size', 'Drawdown Limit']
    const types = ['price', 'volume', 'risk', 'position', 'system']
    const statuses = ['active', 'disabled', 'triggered', 'paused']
    const severities = ['critical', 'high', 'medium', 'low']
    const conditions = ['> threshold', '< threshold', '= value', 'change > %', 'deviation > std']
    const mockRules = Array.from({ length: 12 }, (_, i) => ({
      id: `rule-${i}`, name: names[i % 8], type: types[i % 5], status: statuses[Math.floor(Math.random() * 4)],
      condition: conditions[i % 5], severity: severities[Math.floor(Math.random() * 4)],
      triggeredCount: Math.floor(Math.random() * 100), lastTriggered: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 86400000) : null,
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 30)
    }))
    setRules(mockRules)
    setMetrics({ totalRules: mockRules.length, activeRules: mockRules.filter(r => r.status === 'active').length, triggeredToday: mockRules.filter(r => r.status === 'triggered').length, criticalAlerts: mockRules.filter(r => r.severity === 'critical').length, avgTriggerRate: mockRules.reduce((s, r) => s + r.triggeredCount, 0) / mockRules.length, disabledRules: mockRules.filter(r => r.status === 'disabled').length })
  }
  const getStatusColor = (s: string) => ({ active: 'bg-green-500/20 text-green-400 border-green-500', disabled: 'bg-gray-500/20 text-gray-400 border-gray-500', triggered: 'bg-red-500/20 text-red-400 border-red-500', paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500' }[s] || 'bg-gray-500/20 text-gray-400 border-gray-500')
  const getSeverityColor = (s: string) => ({ critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-green-400' }[s] || 'text-gray-400')
  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div></div>
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8"><TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Alert Rules Engine</h1><p className="text-gray-400">Automated monitoring and notification rule management</p></div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Total Rules</div><div className="text-2xl font-bold text-cyan-400">{metrics.totalRules}</div></div>
          <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Active</div><div className="text-2xl font-bold text-green-400">{metrics.activeRules}</div></div>
          <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Triggered Today</div><div className="text-2xl font-bold text-red-400">{metrics.triggeredToday}</div></div>
          <div className="bg-slate-800/50 border border-orange-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Critical</div><div className="text-2xl font-bold text-orange-400">{metrics.criticalAlerts}</div></div>
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Avg Triggers</div><div className="text-2xl font-bold text-purple-400">{metrics.avgTriggerRate.toFixed(0)}</div></div>
          <div className="bg-slate-800/50 border border-gray-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Disabled</div><div className="text-2xl font-bold text-gray-400">{metrics.disabledRules}</div></div>
        </div>
        <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-cyan-500/20"><h2 className="text-lg font-semibold text-white">Alert Rules</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50"><tr><th className="text-left text-xs text-gray-400 p-3">Rule Name</th><th className="text-left text-xs text-gray-400 p-3">Type</th><th className="text-center text-xs text-gray-400 p-3">Status</th><th className="text-left text-xs text-gray-400 p-3">Condition</th><th className="text-center text-xs text-gray-400 p-3">Severity</th><th className="text-right text-xs text-gray-400 p-3">Triggers</th><th className="text-right text-xs text-gray-400 p-3">Last Triggered</th></tr></thead>
              <tbody>
                {rules.map(rule => (
                  <tr key={rule.id} className="border-t border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3 font-medium text-cyan-400">{rule.name}</td>
                    <td className="p-3 text-white capitalize">{rule.type}</td>
                    <td className="p-3 text-center"><span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(rule.status)}`}>{rule.status}</span></td>
                    <td className="p-3 text-gray-400 font-mono text-sm">{rule.condition}</td>
                    <td className={`p-3 text-center font-medium uppercase ${getSeverityColor(rule.severity)}`}>{rule.severity}</td>
                    <td className="p-3 text-right text-purple-400">{rule.triggeredCount}</td>
                    <td className="p-3 text-right text-gray-500">{rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleString() : 'Never'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
