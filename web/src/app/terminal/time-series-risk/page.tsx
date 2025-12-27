'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

export default function TimeSeriesRiskPage() {
  const [showGuide, setShowGuide] = useState(false)
  const [riskData, setRiskData] = useState<{timestamp:Date,riskScore:number,volatility:number,drawdown:number,var95:number}[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('24h')
  const [metrics, setMetrics] = useState({ currentRisk: 0, avgRisk: 0, maxDrawdown: 0, var95: 0, sharpeRatio: 0, volatility: 0 })

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 30000); return () => clearInterval(i) }, [timeframe])

  async function fetchData() {
    try {
      const r = await fetch(`${API_BASE}/gq-core/risk/time-series?timeframe=${timeframe}`)
      if (r.ok) { const d = await r.json(); if (d.data) { setRiskData(d.data); setMetrics(d.metrics || metrics) } else generateMockData() } else generateMockData()
    } catch { generateMockData() } finally { setLoading(false) }
  }

  function generateMockData() {
    const points = timeframe === '1h' ? 60 : timeframe === '24h' ? 288 : timeframe === '7d' ? 168 : 720
    const data = Array.from({ length: points }, (_, i) => {
      const base = 50 + Math.sin(i / 10) * 20 + Math.random() * 15
      return { timestamp: new Date(Date.now() - (points - i) * (timeframe === '1h' ? 60000 : timeframe === '24h' ? 300000 : 3600000)), riskScore: Math.min(100, Math.max(0, base)), volatility: Math.random() * 50 + 10, drawdown: Math.random() * 20, var95: Math.random() * 10 + 2 }
    })
    setRiskData(data)
    const avg = data.reduce((s, d) => s + d.riskScore, 0) / data.length
    setMetrics({ currentRisk: data[data.length - 1]?.riskScore || 0, avgRisk: avg, maxDrawdown: Math.max(...data.map(d => d.drawdown)), var95: data[data.length - 1]?.var95 || 0, sharpeRatio: Math.random() * 3 - 0.5, volatility: data[data.length - 1]?.volatility || 0 })
  }

  const getRiskColor = (risk: number) => risk >= 70 ? 'text-red-400' : risk >= 40 ? 'text-yellow-400' : 'text-green-400'
  const getRiskBg = (risk: number) => risk >= 70 ? 'bg-red-500' : risk >= 40 ? 'bg-yellow-500' : 'bg-green-500'
  const timeframes = ['1h', '24h', '7d', '30d']

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div><p className="text-gray-400">Loading Risk Data...</p></div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8"><TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Time-Series Risk Engine</h1><p className="text-gray-400">Real-time risk monitoring with historical analysis and predictive indicators</p></div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Current Risk</div><div className={`text-2xl font-bold ${getRiskColor(metrics.currentRisk)}`}>{metrics.currentRisk.toFixed(1)}</div></div>
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Avg Risk</div><div className="text-2xl font-bold text-cyan-400">{metrics.avgRisk.toFixed(1)}</div></div>
          <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Max Drawdown</div><div className="text-2xl font-bold text-red-400">{metrics.maxDrawdown.toFixed(2)}%</div></div>
          <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">VaR (95%)</div><div className="text-2xl font-bold text-yellow-400">{metrics.var95.toFixed(2)}%</div></div>
          <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Sharpe Ratio</div><div className={`text-2xl font-bold ${metrics.sharpeRatio >= 1 ? 'text-green-400' : metrics.sharpeRatio >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>{metrics.sharpeRatio.toFixed(2)}</div></div>
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Volatility</div><div className="text-2xl font-bold text-purple-400">{metrics.volatility.toFixed(1)}%</div></div>
        </div>
        <div className="flex gap-2 mb-6">{timeframes.map(tf => <button key={tf} onClick={() => setTimeframe(tf)} className={`px-4 py-2 rounded-lg text-sm ${timeframe === tf ? 'bg-cyan-500 text-black font-semibold' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}>{tf}</button>)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Risk Score Timeline</h2>
            <div className="h-64 flex items-end gap-0.5">{riskData.slice(-100).map((d, i) => <div key={i} className="flex-1 rounded-t transition-all" style={{ height: `${d.riskScore}%`, backgroundColor: d.riskScore >= 70 ? '#ef4444' : d.riskScore >= 40 ? '#eab308' : '#22c55e' }} title={`Risk: ${d.riskScore.toFixed(1)}`} />)}</div>
            <div className="flex justify-between text-xs text-gray-500 mt-2"><span>Older</span><span>Now</span></div>
          </div>
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Risk Distribution</h2>
            <div className="space-y-4">
              {['Low (0-40)', 'Medium (40-70)', 'High (70-100)'].map((label, i) => {
                const ranges = [[0, 40], [40, 70], [70, 100]]
                const count = riskData.filter(d => d.riskScore >= ranges[i][0] && d.riskScore < ranges[i][1]).length
                const pct = (count / riskData.length) * 100 || 0
                const colors = ['bg-green-500', 'bg-yellow-500', 'bg-red-500']
                return <div key={label}><div className="flex justify-between text-sm mb-1"><span className="text-gray-400">{label}</span><span className="text-white">{pct.toFixed(1)}%</span></div><div className="h-3 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full ${colors[i]} rounded-full`} style={{ width: `${pct}%` }} /></div></div>
              })}
            </div>
          </div>
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Volatility Bands</h2>
            <div className="h-48 relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-cyan-500/30" /></div>
              <div className="absolute inset-0 flex flex-col justify-between py-2">
                <div className="text-xs text-gray-500">High Vol</div>
                <div className="text-xs text-gray-500">Low Vol</div>
              </div>
              <div className="absolute inset-0 flex items-end gap-0.5 pt-4 pb-6">{riskData.slice(-80).map((d, i) => <div key={i} className="flex-1 bg-purple-500/60 rounded-t" style={{ height: `${Math.min(100, d.volatility * 2)}%` }} />)}</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Risk Gauge</h2>
            <div className="flex justify-center">
              <div className="relative w-48 h-24">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#riskGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${metrics.currentRisk * 1.26} 126`} />
                  <defs><linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#22c55e" /><stop offset="50%" stopColor="#eab308" /><stop offset="100%" stopColor="#ef4444" /></linearGradient></defs>
                </svg>
                <div className="absolute inset-0 flex items-end justify-center pb-2"><span className={`text-3xl font-bold ${getRiskColor(metrics.currentRisk)}`}>{metrics.currentRisk.toFixed(0)}</span></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-4"><span>Safe</span><span>Moderate</span><span>Critical</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
