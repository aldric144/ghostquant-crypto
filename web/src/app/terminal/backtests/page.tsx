'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import ModuleErrorBoundary from '../../../components/terminal/ModuleErrorBoundary'
import { useState, useEffect, useMemo } from 'react'
import { normalizeTableRows, safeNumber } from '../../../utils/visualizationNormalizer'
import { generateBacktestCurves, BacktestResult } from '../../../utils/syntheticVisualData'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

interface Backtest {
  id: string
  name: string
  strategy: string
  status: string
  startDate?: string
  endDate?: string
  totalReturn: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  trades: number
}

function BacktestsPageContent() {
  const [showGuide, setShowGuide] = useState(false)
  const [backtests, setBacktests] = useState<Backtest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    fetchData()
    const i = setInterval(fetchData, 30000)
    return () => clearInterval(i) 
  }, [])

  async function fetchData() {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    try {
      const r = await fetch(`${API_BASE}/gq-core/strategy/backtests`, { signal: controller.signal })
      clearTimeout(timeoutId)
      if (r.ok) { 
        const d = await r.json()
        if (d && Array.isArray(d.backtests)) { 
          setBacktests(d.backtests)
        }
      }
    } catch {
      clearTimeout(timeoutId)
    } finally { 
      setLoading(false) 
    }
  }

  const tableResult = useMemo(() => {
    const rawData = backtests.map((bt, i) => ({
      id: bt.id || `bt-${i}`,
      name: bt.name || `Backtest #${1000 + i}`,
      strategy: bt.strategy || 'Unknown',
      status: bt.status || 'queued',
      totalReturn: safeNumber(bt.totalReturn),
      sharpeRatio: safeNumber(bt.sharpeRatio),
      maxDrawdown: safeNumber(bt.maxDrawdown),
      winRate: safeNumber(bt.winRate),
      trades: safeNumber(bt.trades)
    }))
    return normalizeTableRows<BacktestResult>(
      rawData,
      (ctx) => generateBacktestCurves(ctx),
      { minLength: 1, seed: 'backtests:table' }
    )
  }, [backtests])

  const isSyntheticMode = tableResult.isSynthetic
  const tableData = tableResult.data

  const safeMetrics = useMemo(() => ({
    totalBacktests: tableData.length,
    avgReturn: tableData.length > 0 ? tableData.reduce((s, b) => s + safeNumber(b.totalReturn), 0) / tableData.length : 0,
    avgSharpe: tableData.length > 0 ? tableData.reduce((s, b) => s + safeNumber(b.sharpeRatio), 0) / tableData.length : 0,
    avgWinRate: tableData.length > 0 ? tableData.reduce((s, b) => s + safeNumber(b.winRate), 0) / tableData.length : 0,
    completedToday: tableData.filter(b => b.status === 'completed').length,
    runningNow: tableData.filter(b => b.status === 'running').length
  }), [tableData])

  const getStatusColor = (s: string) => ({ completed: 'bg-green-500/20 text-green-400 border-green-500', running: 'bg-blue-500/20 text-blue-400 border-blue-500', queued: 'bg-yellow-500/20 text-yellow-400 border-yellow-500', failed: 'bg-red-500/20 text-red-400 border-red-500' }[s] || 'bg-gray-500/20 text-gray-400 border-gray-500')
  const getReturnColor = (r: number) => safeNumber(r) >= 0 ? 'text-green-400' : 'text-red-400'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {(loading || isSyntheticMode) && (
          <div className="mb-6 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-400" />}
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-amber-400">
                {loading ? 'LOADING LIVE DATA' : 'SYNTHETIC MODE'}
              </span>
              <span className="text-xs text-amber-400/70">|</span>
              <span className="text-xs text-gray-400">
                {loading ? 'Fetching backtest data...' : 'Displaying synthesized backtest data'}
              </span>
            </div>
          </div>
        )}

        <div className="mb-8">
          <TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Backtests Console</h1>
          <p className="text-gray-400">Historical strategy performance analysis and validation</p>
        </div>

        {!loading && isSyntheticMode && (
          <div className="mb-6 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-amber-400">SYNTHETIC MODE</span>
            </div>
            <div className="group relative">
              <svg className="w-4 h-4 text-amber-400/70 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute left-0 top-6 w-72 p-3 bg-slate-800 border border-amber-500/30 rounded-lg text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                Synthetic data is displayed to preserve continuity while live data initializes.
              </div>
            </div>
            <span className="text-xs text-amber-400/70">Displaying synthesized backtest data</span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Total Backtests</div><div className="text-2xl font-bold text-cyan-400">{safeMetrics.totalBacktests}</div></div>
          <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Avg Return</div><div className={`text-2xl font-bold ${getReturnColor(safeMetrics.avgReturn)}`}>{safeMetrics.avgReturn >= 0 ? '+' : ''}{safeMetrics.avgReturn.toFixed(1)}%</div></div>
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Avg Sharpe</div><div className="text-2xl font-bold text-purple-400">{safeMetrics.avgSharpe.toFixed(2)}</div></div>
          <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Avg Win Rate</div><div className="text-2xl font-bold text-yellow-400">{safeMetrics.avgWinRate.toFixed(0)}%</div></div>
          <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Completed</div><div className="text-2xl font-bold text-green-400">{safeMetrics.completedToday}</div></div>
          <div className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Running</div><div className="text-2xl font-bold text-blue-400">{safeMetrics.runningNow}</div></div>
        </div>
        <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Backtest Results</h2>
            {isSyntheticMode && <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">Synthetic</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50"><tr><th className="text-left text-xs text-gray-400 p-3">Name</th><th className="text-left text-xs text-gray-400 p-3">Strategy</th><th className="text-center text-xs text-gray-400 p-3">Status</th><th className="text-right text-xs text-gray-400 p-3">Return</th><th className="text-right text-xs text-gray-400 p-3">Sharpe</th><th className="text-right text-xs text-gray-400 p-3">Max DD</th><th className="text-right text-xs text-gray-400 p-3">Win Rate</th><th className="text-right text-xs text-gray-400 p-3">Trades</th></tr></thead>
              <tbody>
                {tableData.map(bt => (
                  <tr key={bt.id} className="border-t border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3 font-medium text-cyan-400">{bt.name}</td>
                    <td className="p-3 text-white">{bt.strategy}</td>
                    <td className="p-3 text-center"><span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(bt.status)}`}>{bt.status}</span></td>
                    <td className={`p-3 text-right font-medium ${getReturnColor(safeNumber(bt.totalReturn))}`}>{safeNumber(bt.totalReturn) >= 0 ? '+' : ''}{safeNumber(bt.totalReturn).toFixed(1)}%</td>
                    <td className="p-3 text-right text-purple-400">{safeNumber(bt.sharpeRatio).toFixed(2)}</td>
                    <td className="p-3 text-right text-red-400">-{safeNumber(bt.maxDrawdown).toFixed(1)}%</td>
                    <td className="p-3 text-right text-yellow-400">{safeNumber(bt.winRate).toFixed(0)}%</td>
                    <td className="p-3 text-right text-gray-400">{safeNumber(bt.trades)}</td>
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

export default function BacktestsPage() {
  return (
    <ModuleErrorBoundary moduleName="Backtests Console">
      <BacktestsPageContent />
    </ModuleErrorBoundary>
  )
}
