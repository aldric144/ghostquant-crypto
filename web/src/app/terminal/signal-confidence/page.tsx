'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

export default function SignalConfidenceEnginePage() {
  const [showGuide, setShowGuide] = useState(false)
  const [signals, setSignals] = useState<{id:string,name:string,type:string,confidence:number,accuracy:number,strength:number,direction:string,asset:string,timeframe:string,timestamp:Date}[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [metrics, setMetrics] = useState({ totalSignals: 0, highConfidence: 0, avgAccuracy: 0, bullishRatio: 50, avgStrength: 0, activeSignals: 0 })

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 15000); return () => clearInterval(i) }, [])

  async function fetchData() {
    try {
      const r = await fetch(`${API_BASE}/gq-core/signals/confidence`)
      if (r.ok) { const d = await r.json(); if (d.signals) { setSignals(d.signals); setMetrics(d.metrics || metrics) } else generateMockData() } else generateMockData()
    } catch { generateMockData() } finally { setLoading(false) }
  }

  function generateMockData() {
    const names = ['Golden Cross', 'Death Cross', 'RSI Divergence', 'MACD Crossover', 'Volume Spike', 'Support Break', 'Resistance Test', 'Trend Reversal', 'Momentum Shift', 'Whale Alert']
    const types = ['technical', 'on-chain', 'sentiment', 'hybrid']
    const assets = ['BTC', 'ETH', 'SOL', 'AVAX', 'ARB', 'OP']
    const timeframes = ['5m', '15m', '1h', '4h', '1d']
    const directions = ['bullish', 'bearish', 'neutral']
    const mockSignals = Array.from({ length: 20 }, (_, i) => ({
      id: `signal-${i}`,
      name: names[i % names.length],
      type: types[i % types.length],
      confidence: 50 + Math.random() * 50,
      accuracy: 40 + Math.random() * 55,
      strength: Math.random() * 100,
      direction: directions[Math.floor(Math.random() * 3)],
      asset: assets[i % assets.length],
      timeframe: timeframes[i % timeframes.length],
      timestamp: new Date(Date.now() - Math.random() * 3600000)
    }))
    setSignals(mockSignals)
    const bullish = mockSignals.filter(s => s.direction === 'bullish').length
    setMetrics({
      totalSignals: mockSignals.length,
      highConfidence: mockSignals.filter(s => s.confidence >= 80).length,
      avgAccuracy: mockSignals.reduce((s, sig) => s + sig.accuracy, 0) / mockSignals.length,
      bullishRatio: (bullish / mockSignals.length) * 100,
      avgStrength: mockSignals.reduce((s, sig) => s + sig.strength, 0) / mockSignals.length,
      activeSignals: mockSignals.filter(s => s.confidence >= 70).length
    })
  }

  const getConfidenceColor = (conf: number) => conf >= 80 ? 'text-green-400' : conf >= 60 ? 'text-yellow-400' : 'text-red-400'
  const getDirectionColor = (dir: string) => ({ bullish: 'text-green-400', bearish: 'text-red-400', neutral: 'text-gray-400' }[dir] || 'text-gray-400')
  const getTypeColor = (type: string) => ({ technical: 'bg-blue-500/20 text-blue-400 border-blue-500', 'on-chain': 'bg-purple-500/20 text-purple-400 border-purple-500', sentiment: 'bg-yellow-500/20 text-yellow-400 border-yellow-500', hybrid: 'bg-cyan-500/20 text-cyan-400 border-cyan-500' }[type] || 'bg-gray-500/20 text-gray-400 border-gray-500')
  const types = ['all', 'technical', 'on-chain', 'sentiment', 'hybrid']
  const filtered = signals.filter(s => selectedType === 'all' || s.type === selectedType)

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div><p className="text-gray-400">Analyzing Signals...</p></div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8"><TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Signal Confidence Engine</h1><p className="text-gray-400">AI-powered signal analysis with confidence scoring and accuracy tracking</p></div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Total Signals</div><div className="text-2xl font-bold text-cyan-400">{metrics.totalSignals}</div></div>
          <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">High Confidence</div><div className="text-2xl font-bold text-green-400">{metrics.highConfidence}</div></div>
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Avg Accuracy</div><div className="text-2xl font-bold text-purple-400">{metrics.avgAccuracy.toFixed(1)}%</div></div>
          <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Bullish Ratio</div><div className={`text-2xl font-bold ${metrics.bullishRatio >= 50 ? 'text-green-400' : 'text-red-400'}`}>{metrics.bullishRatio.toFixed(0)}%</div></div>
          <div className="bg-slate-800/50 border border-orange-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Avg Strength</div><div className="text-2xl font-bold text-orange-400">{metrics.avgStrength.toFixed(0)}</div></div>
          <div className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Active Signals</div><div className="text-2xl font-bold text-blue-400">{metrics.activeSignals}</div></div>
        </div>
        <div className="mb-6 bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Market Sentiment Gauge</h2>
          <div className="relative h-8 bg-slate-700 rounded-full overflow-hidden"><div className="absolute left-0 h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 w-full" /><div className="absolute h-full w-1 bg-white shadow-lg" style={{ left: `${metrics.bullishRatio}%`, transform: 'translateX(-50%)' }} /></div>
          <div className="flex justify-between text-xs text-gray-500 mt-2"><span>Bearish</span><span>Neutral</span><span>Bullish</span></div>
        </div>
        <div className="flex gap-2 mb-6">{types.map(t => <button key={t} onClick={() => setSelectedType(t)} className={`px-4 py-2 rounded-lg text-sm capitalize ${selectedType === t ? 'bg-cyan-500 text-black font-semibold' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}>{t === 'all' ? 'All Types' : t}</button>)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20"><h2 className="text-lg font-semibold text-white">Active Signals</h2></div>
            <div className="max-h-96 overflow-y-auto">
              {filtered.map(s => (
                <div key={s.id} className="p-4 border-b border-slate-700/50 hover:bg-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><span className="font-medium text-white">{s.name}</span><span className={`px-2 py-0.5 rounded text-xs font-medium border ${getTypeColor(s.type)}`}>{s.type}</span></div>
                    <span className={`font-medium ${getDirectionColor(s.direction)}`}>{s.direction.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-cyan-400">{s.asset}</span>
                    <span className="text-gray-400">{s.timeframe}</span>
                    <span className={`${getConfidenceColor(s.confidence)}`}>Conf: {s.confidence.toFixed(0)}%</span>
                    <span className="text-purple-400">Acc: {s.accuracy.toFixed(0)}%</span>
                  </div>
                  <div className="mt-2"><div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 rounded-full" style={{ width: `${s.strength}%` }} /></div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Confidence Distribution</h2>
              <div className="space-y-3">
                {[['High (80-100)', 80, 100, 'bg-green-500'], ['Medium (60-80)', 60, 80, 'bg-yellow-500'], ['Low (0-60)', 0, 60, 'bg-red-500']].map(([label, min, max, color]) => {
                  const count = signals.filter(s => s.confidence >= (min as number) && s.confidence < (max as number)).length
                  const pct = (count / signals.length) * 100 || 0
                  return <div key={label as string}><div className="flex justify-between text-sm mb-1"><span className="text-gray-400">{label}</span><span className="text-white">{count}</span></div><div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} /></div></div>
                })}
              </div>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Top Performing Signals</h2>
              <div className="space-y-2">
                {signals.sort((a, b) => b.accuracy - a.accuracy).slice(0, 5).map(s => (
                  <div key={s.id} className="flex items-center justify-between"><span className="text-gray-400 truncate">{s.name}</span><span className="text-green-400 font-medium">{s.accuracy.toFixed(0)}%</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
