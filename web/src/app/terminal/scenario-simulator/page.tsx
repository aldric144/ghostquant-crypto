'use client'
import { useState, useEffect } from 'react'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'
export default function ScenarioSimulatorPage() {
  const [scenarios, setScenarios] = useState<{id:string,name:string,type:string,status:string,baseCase:number,bullCase:number,bearCase:number,probability:number,impact:string,createdAt:Date}[]>([])
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({ totalScenarios: 0, activeSimulations: 0, avgProbability: 0, highImpact: 0, completedToday: 0, pendingReview: 0 })
  useEffect(() => { fetchData(); const i = setInterval(fetchData, 30000); return () => clearInterval(i) }, [])
  async function fetchData() {
    try {
      const r = await fetch(`${API_BASE}/gq-core/scenarios/list`)
      if (r.ok) { const d = await r.json(); if (d.scenarios) { setScenarios(d.scenarios); setMetrics(d.metrics || metrics) } else generateMockData() } else generateMockData()
    } catch { generateMockData() } finally { setLoading(false) }
  }
  function generateMockData() {
    const names = ['Market Crash', 'Bull Run', 'Regulatory Change', 'Black Swan Event', 'Liquidity Crisis', 'Protocol Exploit', 'Mass Adoption', 'Stablecoin Depeg']
    const types = ['market', 'regulatory', 'technical', 'economic', 'geopolitical']
    const statuses = ['active', 'completed', 'pending_review', 'archived']
    const impacts = ['critical', 'high', 'medium', 'low']
    const mockScenarios = Array.from({ length: 10 }, (_, i) => ({
      id: `scenario-${i}`, name: names[i % 8], type: types[i % 5], status: statuses[Math.floor(Math.random() * 4)],
      baseCase: Math.random() * 20 - 10, bullCase: Math.random() * 50 + 10, bearCase: -(Math.random() * 50 + 10),
      probability: Math.random() * 100, impact: impacts[Math.floor(Math.random() * 4)], createdAt: new Date(Date.now() - Math.random() * 86400000 * 30)
    }))
    setScenarios(mockScenarios)
    setMetrics({ totalScenarios: mockScenarios.length, activeSimulations: mockScenarios.filter(s => s.status === 'active').length, avgProbability: mockScenarios.reduce((sum, s) => sum + s.probability, 0) / mockScenarios.length, highImpact: mockScenarios.filter(s => s.impact === 'critical' || s.impact === 'high').length, completedToday: mockScenarios.filter(s => s.status === 'completed').length, pendingReview: mockScenarios.filter(s => s.status === 'pending_review').length })
  }
  const getStatusColor = (s: string) => ({ active: 'bg-blue-500/20 text-blue-400 border-blue-500', completed: 'bg-green-500/20 text-green-400 border-green-500', pending_review: 'bg-yellow-500/20 text-yellow-400 border-yellow-500', archived: 'bg-gray-500/20 text-gray-400 border-gray-500' }[s] || 'bg-gray-500/20 text-gray-400 border-gray-500')
  const getImpactColor = (i: string) => ({ critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-green-400' }[i] || 'text-gray-400')
  const getCaseColor = (v: number) => v >= 0 ? 'text-green-400' : 'text-red-400'
  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div></div>
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8"><h1 className="text-3xl font-bold text-cyan-400 mb-2">Scenario Simulator</h1><p className="text-gray-400">Multi-scenario analysis for risk assessment and decision support</p></div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Total Scenarios</div><div className="text-2xl font-bold text-cyan-400">{metrics.totalScenarios}</div></div>
          <div className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Active</div><div className="text-2xl font-bold text-blue-400">{metrics.activeSimulations}</div></div>
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Avg Probability</div><div className="text-2xl font-bold text-purple-400">{metrics.avgProbability.toFixed(0)}%</div></div>
          <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">High Impact</div><div className="text-2xl font-bold text-red-400">{metrics.highImpact}</div></div>
          <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Completed</div><div className="text-2xl font-bold text-green-400">{metrics.completedToday}</div></div>
          <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Pending Review</div><div className="text-2xl font-bold text-yellow-400">{metrics.pendingReview}</div></div>
        </div>
        <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-cyan-500/20"><h2 className="text-lg font-semibold text-white">Scenario Analysis</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50"><tr><th className="text-left text-xs text-gray-400 p-3">Scenario</th><th className="text-left text-xs text-gray-400 p-3">Type</th><th className="text-center text-xs text-gray-400 p-3">Status</th><th className="text-right text-xs text-gray-400 p-3">Base Case</th><th className="text-right text-xs text-gray-400 p-3">Bull Case</th><th className="text-right text-xs text-gray-400 p-3">Bear Case</th><th className="text-right text-xs text-gray-400 p-3">Probability</th><th className="text-center text-xs text-gray-400 p-3">Impact</th></tr></thead>
              <tbody>
                {scenarios.map(s => (
                  <tr key={s.id} className="border-t border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3 font-medium text-cyan-400">{s.name}</td>
                    <td className="p-3 text-white capitalize">{s.type}</td>
                    <td className="p-3 text-center"><span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(s.status)}`}>{s.status.replace('_', ' ')}</span></td>
                    <td className={`p-3 text-right font-medium ${getCaseColor(s.baseCase)}`}>{s.baseCase >= 0 ? '+' : ''}{s.baseCase.toFixed(1)}%</td>
                    <td className="p-3 text-right font-medium text-green-400">+{s.bullCase.toFixed(1)}%</td>
                    <td className="p-3 text-right font-medium text-red-400">{s.bearCase.toFixed(1)}%</td>
                    <td className="p-3 text-right text-purple-400">{s.probability.toFixed(0)}%</td>
                    <td className={`p-3 text-center font-medium uppercase ${getImpactColor(s.impact)}`}>{s.impact}</td>
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
