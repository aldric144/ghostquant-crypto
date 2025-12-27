'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState } from 'react'
import { ultraFusion, AnalyzeResponse } from '@/lib/ultraFusionClient'
import HydraResetControls from '@/components/hydra/HydraResetControls'
import { generateSyntheticFusion, UltraFusionResult } from '@/engines/ultrafusionEngine'

export default function UltraFusionConsolePage() {
  const [showGuide, setShowGuide] = useState(false)
  const [entity, setEntity] = useState('')
  const [token, setToken] = useState('')
  const [chain, setChain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [syntheticMode, setSyntheticMode] = useState(false)

  // Clear Input handler - clears all input fields only, preserves results
  const handleClearInput = () => {
    setEntity('')
    setToken('')
    setChain('')
  }

  // Reset Console handler - clears inputs + results + resets to initial state
  const handleResetConsole = () => {
    setEntity('')
    setToken('')
    setChain('')
    setResult(null)
    setSyntheticMode(false)
    setLoading(false)
  }

  const handleAnalyze = async () => {
    // If no input provided, show guidance text (don't run analysis)
    if (!entity && !token && !chain) {
      // Show guidance - don't set syntheticMode, just return
      return
    }

    setLoading(true)
    setSyntheticMode(false)

    try {
      const response = await ultraFusion.analyze({
        entity: entity || undefined,
        token: token || undefined,
        chain: chain || undefined,
      })

      // UltraFusionClient now ALWAYS returns success with synthetic fallback
      // Check if result is synthetic (using type-safe property access)
      if (response.result && 'synthetic' in response.result && response.result.synthetic) {
        setSyntheticMode(true)
      }
      
      // If response has no valid result, generate synthetic fallback
      if (!response.result) {
        const syntheticResult = generateSyntheticFusion(entity, token, chain)
        const syntheticResponse: AnalyzeResponse = {
          success: true,
          result: syntheticResult as unknown as AnalyzeResponse['result'],
          timestamp: new Date().toISOString()
        }
        setResult(syntheticResponse)
        setSyntheticMode(true)
      } else {
        setResult(response)
      }
    } catch {
      // This should never happen as UltraFusionClient never throws
      // But if it does, generate synthetic result instead of showing error
      const syntheticResult = generateSyntheticFusion(entity, token, chain)
      const syntheticResponse: AnalyzeResponse = {
        success: true,
        result: syntheticResult as unknown as AnalyzeResponse['result'],
        timestamp: new Date().toISOString()
      }
      setResult(syntheticResponse)
      setSyntheticMode(true)
    } finally {
      setLoading(false)
    }
  }

  const getClassificationColor = (classification: string) => {
    switch (classification?.toLowerCase()) {
      case 'critical': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'elevated': return 'text-yellow-500'
      case 'moderate': return 'text-blue-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
            <span className="text-4xl">⚡</span>
            UltraFusion Console
          </h1>
          <p className="text-gray-400 mt-2">
            Meta-intelligence analysis across all 11 detection engines
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Entity Address
            </label>
            <input
              type="text"
              value={entity}
              onChange={(e) => setEntity(e.target.value)}
              placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
              className="w-full px-4 py-2 bg-slate-900/50 border border-cyan-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token Symbol
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="BTC, ETH, USDT..."
              className="w-full px-4 py-2 bg-slate-900/50 border border-cyan-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Chain
            </label>
            <input
              type="text"
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              placeholder="ethereum, bsc, polygon..."
              className="w-full px-4 py-2 bg-slate-900/50 border border-cyan-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        <div className="mb-4">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analyzing...
              </span>
            ) : (
              'Run Meta-Analysis'
            )}
          </button>
        </div>

        {/* Reset Controls - Matching Hydra Console layout */}
        <div className="mb-8">
          <HydraResetControls
            onClearInput={handleClearInput}
            onResetConsole={handleResetConsole}
            isLoading={loading}
          />
        </div>

        {syntheticMode && (
          <div className="mb-8 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 flex items-center gap-2">
            <span className="text-lg">🔮</span>
            <span>Synthetic Intelligence Mode — {!entity && !token && !chain ? 'Enter an entity, token, or chain to analyze' : 'Live data unavailable, showing synthetic analysis'}</span>
          </div>
        )}

        {result?.result && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">Decision</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Classification</div>
                  <div className={`text-2xl font-bold ${getClassificationColor(result.result.decision.classification)}`}>
                    {result.result.decision.classification}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Meta Score</div>
                  <div className="text-2xl font-bold text-cyan-400">
                    {(result.result.decision.meta_score * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Confidence</div>
                  <div className="text-2xl font-bold text-green-400">
                    {(result.result.decision.confidence * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Timestamp</div>
                  <div className="text-sm text-gray-300">
                    {new Date(result.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {result.result.decision.recommendations.length > 0 && (
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-cyan-400 mb-4">Recommendations</h2>
                <ul className="space-y-2">
                  {result.result.decision.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400">-</span>
                      <span className="text-gray-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">Meta Signals</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(result.result.signals).map(([key, value]) => (
                  <div key={key} className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 capitalize">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className="text-lg font-semibold text-gray-200">
                      {typeof value === 'number' ? (value * 100).toFixed(1) + '%' : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result.result.narrative?.analyst_verdict && (
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-cyan-400 mb-4">Analyst Verdict</h2>
                <p className="text-gray-300 whitespace-pre-wrap">
                  {result.result.narrative.analyst_verdict}
                </p>
              </div>
            )}

            {result.result.summary && (
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-cyan-400 mb-4">Executive Summary</h2>
                <p className="text-gray-300 mb-4">
                  {result.result.summary.executive_summary}
                </p>
                {result.result.summary.key_findings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Key Findings</h3>
                    <ul className="space-y-1">
                      {result.result.summary.key_findings.map((finding, idx) => (
                        <li key={idx} className="text-gray-300 text-sm">- {finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!result && !syntheticMode && !loading && (
          <div className="text-center py-12 text-gray-500">
            Enter an entity address, token, or chain to run meta-analysis
          </div>
        )}
      </div>
    </div>
  )
}
