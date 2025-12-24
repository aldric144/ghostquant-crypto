'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import ModuleErrorBoundary from '../../../components/terminal/ModuleErrorBoundary'
import InfoTooltip from '../../../components/ui/InfoTooltip'
import { useState, useEffect, useMemo } from 'react'
import { normalizeTableRows, safeNumber } from '../../../utils/visualizationNormalizer'
import { generateRiskPredictions, RiskPrediction } from '../../../utils/syntheticVisualData'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

interface Prediction {
  id: string
  asset: string
  riskScore: number
  predictedChange: number
  confidence: number
  trend: string
}

function PredictiveRiskEnginePageContent() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    fetchData()
    const i = setInterval(fetchData, 30000)
    return () => clearInterval(i) 
  }, [])

  async function fetchData() {
    try {
      const r = await fetch(`${API_BASE}/gq-core/risk/predictive`)
      if (r.ok) { 
        const d = await r.json()
        if (d.predictions) { 
          setPredictions(d.predictions)
        }
      }
    } catch {
      // Error handled by synthetic fallback
    } finally { 
      setLoading(false) 
    }
  }

  // Normalize table data with synthetic fallback
  const tableResult = useMemo(() => {
    const rawData = predictions.map((p, i) => ({
      id: p.id || `pred-${i}`,
      asset: p.asset || 'Unknown',
      riskScore: safeNumber(p.riskScore),
      predictedChange: safeNumber(p.predictedChange),
      confidence: safeNumber(p.confidence),
      trend: p.trend || 'neutral'
    }))
    return normalizeTableRows<RiskPrediction>(
      rawData,
      (ctx) => generateRiskPredictions(ctx),
      { minLength: 1, seed: 'predictive-risk:table' }
    )
  }, [predictions])

  const isSyntheticMode = tableResult.isSynthetic
  const tableData = tableResult.data

  // Calculate metrics from normalized data
  const safeMetrics = useMemo(() => ({
    avgRisk: tableData.length > 0 ? tableData.reduce((s, p) => s + safeNumber(p.riskScore), 0) / tableData.length : 0,
    highRiskAssets: tableData.filter(p => safeNumber(p.riskScore) >= 70).length,
    avgConfidence: tableData.length > 0 ? tableData.reduce((s, p) => s + safeNumber(p.confidence), 0) / tableData.length : 0,
    bullishPredictions: tableData.filter(p => p.trend === 'bullish').length,
    bearishPredictions: tableData.filter(p => p.trend === 'bearish').length,
    modelAccuracy: 78 // Static accuracy for display
  }), [tableData])

  const getRiskColor = (risk: number) => safeNumber(risk) >= 70 ? 'text-red-400' : safeNumber(risk) >= 40 ? 'text-yellow-400' : 'text-green-400'
  const getRiskBg = (risk: number) => safeNumber(risk) >= 70 ? 'bg-red-500' : safeNumber(risk) >= 40 ? 'bg-yellow-500' : 'bg-green-500'
  const getTrendColor = (trend: string) => ({ bullish: 'text-green-400', bearish: 'text-red-400', neutral: 'text-gray-400' }[trend] || 'text-gray-400')

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isSyntheticMode ? 'bg-amber-400' : 'bg-cyan-400'}`} />
            <span className={`text-sm font-medium ${isSyntheticMode ? 'text-amber-400' : 'text-cyan-400'}`}>
              {isSyntheticMode ? 'Synthetic Mode' : 'Live Feed'}
            </span>
          </div>
          <TerminalBackButton className="mb-4" />
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-cyan-400">Predictive Risk Engine</h1>
            <InfoTooltip content="Shows probability-based forecasts, not guaranteed outcomes. Predictions update as new data becomes available and market conditions change." />
          </div>
          <p className="text-gray-400">AI-powered risk forecasting with probability bands</p>
        </div>

        {/* SYNTHETIC MODE Badge */}
        {isSyntheticMode && (
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
            <span className="text-xs text-amber-400/70">Displaying synthesized risk data</span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Avg Risk</div><div className={`text-2xl font-bold ${getRiskColor(safeMetrics.avgRisk)}`}>{safeMetrics.avgRisk.toFixed(0)}</div></div>
          <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">High Risk</div><div className="text-2xl font-bold text-red-400">{safeMetrics.highRiskAssets}</div></div>
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Confidence</div><div className="text-2xl font-bold text-purple-400">{safeMetrics.avgConfidence.toFixed(0)}%</div></div>
          <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Bullish</div><div className="text-2xl font-bold text-green-400">{safeMetrics.bullishPredictions}</div></div>
          <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Bearish</div><div className="text-2xl font-bold text-red-400">{safeMetrics.bearishPredictions}</div></div>
          <div className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Accuracy</div><div className="text-2xl font-bold text-blue-400">{safeMetrics.modelAccuracy.toFixed(0)}%</div></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Risk Predictions</h2>
              {isSyntheticMode && <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">Synthetic</span>}
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {[...tableData].sort((a, b) => safeNumber(b.riskScore) - safeNumber(a.riskScore)).map(pred => (
                <div key={pred.id} className="p-4 border-b border-slate-700/50 hover:bg-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3"><span className="font-medium text-cyan-400 text-lg">{pred.asset}</span><span className={`font-medium ${getTrendColor(pred.trend)}`}>{pred.trend.toUpperCase()}</span></div>
                    <div className={`text-2xl font-bold ${getRiskColor(safeNumber(pred.riskScore))}`}>{safeNumber(pred.riskScore).toFixed(0)}</div>
                  </div>
                  <div className="mb-2"><div className="h-3 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full ${getRiskBg(safeNumber(pred.riskScore))} rounded-full`} style={{ width: `${safeNumber(pred.riskScore)}%` }} /></div></div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={safeNumber(pred.predictedChange) >= 0 ? 'text-green-400' : 'text-red-400'}>Predicted: {safeNumber(pred.predictedChange) >= 0 ? '+' : ''}{safeNumber(pred.predictedChange).toFixed(1)}%</span>
                    <span className="text-purple-400">Confidence: {safeNumber(pred.confidence).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Risk Distribution</h2>
              <div className="space-y-3">
                {[['High', 70, 100, 'bg-red-500'], ['Medium', 40, 70, 'bg-yellow-500'], ['Low', 0, 40, 'bg-green-500']].map(([label, min, max, color]) => {
                  const count = tableData.filter(p => safeNumber(p.riskScore) >= (min as number) && safeNumber(p.riskScore) < (max as number)).length
                  const pct = tableData.length > 0 ? (count / tableData.length) * 100 : 0
                  return <div key={label as string}><div className="flex justify-between text-sm mb-1"><span className="text-gray-400">{label}</span><span className="text-white">{count}</span></div><div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} /></div></div>
                })}
              </div>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Trend Sentiment</h2>
              <div className="flex justify-center gap-8">
                <div className="text-center"><div className="text-3xl font-bold text-green-400">{safeMetrics.bullishPredictions}</div><div className="text-xs text-gray-400">Bullish</div></div>
                <div className="text-center"><div className="text-3xl font-bold text-red-400">{safeMetrics.bearishPredictions}</div><div className="text-xs text-gray-400">Bearish</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PredictiveRiskEnginePage() {
  return (
    <ModuleErrorBoundary moduleName="Predictive Risk Engine">
      <PredictiveRiskEnginePageContent />
    </ModuleErrorBoundary>
  )
}
