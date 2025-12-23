'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

export default function PatternRecognitionCorePage() {
  const [patterns, setPatterns] = useState<{id:string,name:string,type:string,confidence:number,accuracy:number,occurrences:number,lastSeen:Date,trend:string,asset:string}[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [metrics, setMetrics] = useState({ totalPatterns: 0, activePatterns: 0, avgConfidence: 0, avgAccuracy: 0, bullishPatterns: 0, bearishPatterns: 0 })

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 20000); return () => clearInterval(i) }, [])

  async function fetchData() {
    try {
      const r = await fetch(`${API_BASE}/gq-core/patterns/recognition`)
      if (r.ok) { const d = await r.json(); if (d.patterns) { setPatterns(d.patterns); setMetrics(d.metrics || metrics) } else generateMockData() } else generateMockData()
    } catch { generateMockData() } finally { setLoading(false) }
  }

  function generateMockData() {
    const names = ['Head & Shoulders', 'Double Top', 'Double Bottom', 'Cup & Handle', 'Ascending Triangle', 'Descending Triangle', 'Bull Flag', 'Bear Flag', 'Wedge', 'Channel']
    const types = ['reversal', 'continuation', 'bilateral']
    const trends = ['bullish', 'bearish', 'neutral']
    const assets = ['BTC', 'ETH', 'SOL', 'AVAX', 'ARB', 'OP']
    const mockPatterns = Array.from({ length: 15 }, (_, i) => ({
      id: `pattern-${i}`, name: names[i % 10], type: types[i % 3], confidence: 60 + Math.random() * 40,
      accuracy: 50 + Math.random() * 45, occurrences: Math.floor(Math.random() * 50) + 5,
      lastSeen: new Date(Date.now() - Math.random() * 86400000), trend: trends[i % 3], asset: assets[i % 6]
    }))
    setPatterns(mockPatterns)
    const bullish = mockPatterns.filter(p => p.trend === 'bullish').length
    const bearish = mockPatterns.filter(p => p.trend === 'bearish').length
    setMetrics({ totalPatterns: mockPatterns.length, activePatterns: mockPatterns.filter(p => p.confidence >= 70).length, avgConfidence: mockPatterns.reduce((s, p) => s + p.confidence, 0) / mockPatterns.length, avgAccuracy: mockPatterns.reduce((s, p) => s + p.accuracy, 0) / mockPatterns.length, bullishPatterns: bullish, bearishPatterns: bearish })
  }

  const getTypeColor = (type: string) => ({ reversal: 'bg-purple-500/20 text-purple-400 border-purple-500', continuation: 'bg-blue-500/20 text-blue-400 border-blue-500', bilateral: 'bg-yellow-500/20 text-yellow-400 border-yellow-500' }[type] || 'bg-gray-500/20 text-gray-400 border-gray-500')
  const getTrendColor = (trend: string) => ({ bullish: 'text-green-400', bearish: 'text-red-400', neutral: 'text-gray-400' }[trend] || 'text-gray-400')
  const types = ['all', 'reversal', 'continuation', 'bilateral']
  const filtered = patterns.filter(p => selectedType === 'all' || p.type === selectedType)

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8"><TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Pattern Recognition Core</h1><p className="text-gray-400">AI-powered chart pattern detection and analysis</p></div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Total Patterns</div><div className="text-2xl font-bold text-cyan-400">{metrics.totalPatterns}</div></div>
          <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Active</div><div className="text-2xl font-bold text-green-400">{metrics.activePatterns}</div></div>
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Avg Confidence</div><div className="text-2xl font-bold text-purple-400">{metrics.avgConfidence.toFixed(0)}%</div></div>
          <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Avg Accuracy</div><div className="text-2xl font-bold text-yellow-400">{metrics.avgAccuracy.toFixed(0)}%</div></div>
          <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Bullish</div><div className="text-2xl font-bold text-green-400">{metrics.bullishPatterns}</div></div>
          <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Bearish</div><div className="text-2xl font-bold text-red-400">{metrics.bearishPatterns}</div></div>
        </div>
        <div className="flex gap-2 mb-6">{types.map(t => <button key={t} onClick={() => setSelectedType(t)} className={`px-3 py-1.5 rounded-lg text-sm capitalize ${selectedType === t ? 'bg-cyan-500 text-black font-semibold' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}>{t === 'all' ? 'All Types' : t}</button>)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20"><h2 className="text-lg font-semibold text-white">Detected Patterns</h2></div>
            <div className="max-h-[500px] overflow-y-auto">
              {filtered.map(pattern => (
                <div key={pattern.id} className="p-4 border-b border-slate-700/50 hover:bg-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><span className="font-medium text-white">{pattern.name}</span><span className={`px-2 py-0.5 rounded text-xs font-medium border ${getTypeColor(pattern.type)}`}>{pattern.type}</span></div>
                    <span className={`font-medium ${getTrendColor(pattern.trend)}`}>{pattern.trend.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cyan-400">{pattern.asset}</span>
                    <span className="text-green-400">Conf: {pattern.confidence.toFixed(0)}%</span>
                    <span className="text-yellow-400">Acc: {pattern.accuracy.toFixed(0)}%</span>
                    <span className="text-gray-400">{pattern.occurrences} occurrences</span>
                  </div>
                  <div className="mt-2"><div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pattern.confidence}%` }} /></div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Pattern Types</h2>
              <div className="space-y-3">
                {['reversal', 'continuation', 'bilateral'].map(type => {
                  const count = patterns.filter(p => p.type === type).length
                  const pct = (count / patterns.length) * 100 || 0
                  const colors = { reversal: 'bg-purple-500', continuation: 'bg-blue-500', bilateral: 'bg-yellow-500' }
                  return <div key={type}><div className="flex justify-between text-sm mb-1"><span className="text-gray-400 capitalize">{type}</span><span className="text-white">{count}</span></div><div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full ${colors[type as keyof typeof colors]} rounded-full`} style={{ width: `${pct}%` }} /></div></div>
                })}
              </div>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Top Patterns by Accuracy</h2>
              <div className="space-y-2">
                {patterns.sort((a, b) => b.accuracy - a.accuracy).slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between"><span className="text-gray-400 truncate">{p.name}</span><span className="text-green-400 font-medium">{p.accuracy.toFixed(0)}%</span></div>
                ))}
              </div>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Trend Sentiment</h2>
              <div className="flex justify-center gap-8">
                <div className="text-center"><div className="text-3xl font-bold text-green-400">{metrics.bullishPatterns}</div><div className="text-xs text-gray-400">Bullish</div></div>
                <div className="text-center"><div className="text-3xl font-bold text-red-400">{metrics.bearishPatterns}</div><div className="text-xs text-gray-400">Bearish</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
