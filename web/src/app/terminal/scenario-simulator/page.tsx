'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import ModuleErrorBoundary from '../../../components/terminal/ModuleErrorBoundary'
import { useState, useEffect, useMemo } from 'react'
import { normalizeTableRows, safeNumber } from '../../../utils/visualizationNormalizer'
import { generateScenarioProjections, ScenarioProjection } from '../../../utils/syntheticVisualData'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

interface Scenario {
  id: string
  name: string
  type: string
  status: string
  baseCase: number
  bullCase: number
  bearCase: number
  probability: number
  impact: string
  createdAt?: Date
}

function ScenarioSimulatorPageContent() {
  const [showGuide, setShowGuide] = useState(false)
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    fetchData()
    const i = setInterval(fetchData, 30000)
    return () => clearInterval(i) 
  }, [])

  async function fetchData() {
    // Use AbortController with timeout to prevent hung requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    try {
      const r = await fetch(`${API_BASE}/gq-core/scenarios/list`, { signal: controller.signal })
      clearTimeout(timeoutId)
      if (r.ok) { 
        const d = await r.json()
        // Validate API response before setting state
        if (d && Array.isArray(d.scenarios)) { 
          setScenarios(d.scenarios)
        }
      }
    } catch {
      clearTimeout(timeoutId)
      // Error handled by synthetic fallback
    } finally { 
      setLoading(false) 
    }
  }

  // Normalize table data with synthetic fallback
  const tableResult = useMemo(() => {
    const rawData = scenarios.map((s, i) => ({
      id: s.id || `scenario-${i}`,
      name: s.name || 'Unknown',
      type: s.type || 'unknown',
      status: s.status || 'pending_review',
      baseCase: safeNumber(s.baseCase),
      bullCase: safeNumber(s.bullCase),
      bearCase: safeNumber(s.bearCase),
      probability: safeNumber(s.probability),
      impact: s.impact || 'medium'
    }))
    return normalizeTableRows<ScenarioProjection>(
      rawData,
      (ctx) => generateScenarioProjections(ctx),
      { minLength: 1, seed: 'scenario-simulator:table' }
    )
  }, [scenarios])

  const isSyntheticMode = tableResult.isSynthetic
  const tableData = tableResult.data

  // Calculate metrics from normalized data
  const safeMetrics = useMemo(() => ({
    totalScenarios: tableData.length,
    activeSimulations: tableData.filter(s => s.status === 'active').length,
    avgProbability: tableData.length > 0 ? tableData.reduce((sum, s) => sum + safeNumber(s.probability), 0) / tableData.length : 0,
    highImpact: tableData.filter(s => s.impact === 'critical' || s.impact === 'high').length,
    completedToday: tableData.filter(s => s.status === 'completed').length,
    pendingReview: tableData.filter(s => s.status === 'pending_review').length
  }), [tableData])

  const getStatusColor = (s: string) => ({ active: 'bg-blue-500/20 text-blue-400 border-blue-500', completed: 'bg-green-500/20 text-green-400 border-green-500', pending_review: 'bg-yellow-500/20 text-yellow-400 border-yellow-500', archived: 'bg-gray-500/20 text-gray-400 border-gray-500' }[s] || 'bg-gray-500/20 text-gray-400 border-gray-500')
  const getImpactColor = (i: string) => ({ critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-green-400' }[i] || 'text-gray-400')
  const getCaseColor = (v: number) => safeNumber(v) >= 0 ? 'text-green-400' : 'text-red-400'
  
  // NON-BLOCKING: Always render dashboard, never early-return for loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Non-blocking loading/synthetic banner */}
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
                {loading ? 'Fetching scenario data...' : 'Displaying synthesized scenario data'}
              </span>
            </div>
          </div>
        )}

        <div className="mb-8">
          <TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Scenario Simulator</h1>
          <p className="text-gray-400">Multi-scenario analysis for risk assessment and decision support</p>
        </div>

        {/* SYNTHETIC MODE Badge - only show when not loading and in synthetic mode */}
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
            <span className="text-xs text-amber-400/70">Displaying synthesized scenario data</span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Total Scenarios</div><div className="text-2xl font-bold text-cyan-400">{safeMetrics.totalScenarios}</div></div>
          <div className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Active</div><div className="text-2xl font-bold text-blue-400">{safeMetrics.activeSimulations}</div></div>
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Avg Probability</div><div className="text-2xl font-bold text-purple-400">{safeMetrics.avgProbability.toFixed(0)}%</div></div>
          <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">High Impact</div><div className="text-2xl font-bold text-red-400">{safeMetrics.highImpact}</div></div>
          <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Completed</div><div className="text-2xl font-bold text-green-400">{safeMetrics.completedToday}</div></div>
          <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Pending Review</div><div className="text-2xl font-bold text-yellow-400">{safeMetrics.pendingReview}</div></div>
        </div>
        <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Scenario Analysis</h2>
            {isSyntheticMode && <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">Synthetic</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50"><tr><th className="text-left text-xs text-gray-400 p-3">Scenario</th><th className="text-left text-xs text-gray-400 p-3">Type</th><th className="text-center text-xs text-gray-400 p-3">Status</th><th className="text-right text-xs text-gray-400 p-3">Base Case</th><th className="text-right text-xs text-gray-400 p-3">Bull Case</th><th className="text-right text-xs text-gray-400 p-3">Bear Case</th><th className="text-right text-xs text-gray-400 p-3">Probability</th><th className="text-center text-xs text-gray-400 p-3">Impact</th></tr></thead>
              <tbody>
                {tableData.map(s => (
                  <tr key={s.id} className="border-t border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3 font-medium text-cyan-400">{s.name}</td>
                    <td className="p-3 text-white capitalize">{s.type}</td>
                    <td className="p-3 text-center"><span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(s.status)}`}>{s.status.replace('_', ' ')}</span></td>
                    <td className={`p-3 text-right font-medium ${getCaseColor(safeNumber(s.baseCase))}`}>{safeNumber(s.baseCase) >= 0 ? '+' : ''}{safeNumber(s.baseCase).toFixed(1)}%</td>
                    <td className="p-3 text-right font-medium text-green-400">+{safeNumber(s.bullCase).toFixed(1)}%</td>
                    <td className="p-3 text-right font-medium text-red-400">{safeNumber(s.bearCase).toFixed(1)}%</td>
                    <td className="p-3 text-right text-purple-400">{safeNumber(s.probability).toFixed(0)}%</td>
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

export default function ScenarioSimulatorPage() {
  return (
    <ModuleErrorBoundary moduleName="Scenario Simulator">
      <ScenarioSimulatorPageContent />
    </ModuleErrorBoundary>
  )
}
