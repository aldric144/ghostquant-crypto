'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AlphaBrainSummary {
  regime: string
  top_asset: string
  confidence: number
}

interface EcoscanSummary {
  top_ecosystem: string
  emi_score: number
  whale_activity: string
  wcf: number
}

interface InsightPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function InsightPanel({ isOpen, onClose }: InsightPanelProps) {
  const [alphaBrainData, setAlphaBrainData] = useState<AlphaBrainSummary | null>(null)
  const [ecoscanData, setEcoscanData] = useState<EcoscanSummary | null>(null)
  const [insight, setInsight] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    setLoading(true)
    try {
      const alphaBrainRes = await fetch(`${process.env.NEXT_PUBLIC_ALPHABRAIN_API || 'http://localhost:8081'}/alphabrain/summary`)
      const alphaBrainJson = await alphaBrainRes.json()
      
      const ecoscanRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'}/ecoscan/summary`)
      const ecoscanJson = await ecoscanRes.json()

      const alphaBrain: AlphaBrainSummary = {
        regime: alphaBrainJson.regime?.current_regime || 'Unknown',
        top_asset: alphaBrainJson.portfolio?.top_picks?.[0]?.asset || 'N/A',
        confidence: alphaBrainJson.fusion?.confidence || 0
      }

      const ecoscan: EcoscanSummary = {
        top_ecosystem: ecoscanJson.top_ecosystems?.[0]?.chain || 'N/A',
        emi_score: ecoscanJson.top_ecosystems?.[0]?.emi_score || 0,
        whale_activity: ecoscanJson.whale_summary?.net_flow > 0 ? 'accumulation' : 'distribution',
        wcf: ecoscanJson.whale_summary?.wcf || 0
      }

      setAlphaBrainData(alphaBrain)
      setEcoscanData(ecoscan)

      generateInsight(alphaBrain, ecoscan)
    } catch (error) {
      console.error('Error fetching insight data:', error)
      setInsight('Unable to fetch market insights. Please check service connectivity.')
    } finally {
      setLoading(false)
    }
  }

  const generateInsight = (alphaBrain: AlphaBrainSummary, ecoscan: EcoscanSummary) => {
    const regimeText = alphaBrain.regime === 'risk_on' ? 'bullish' : 
                       alphaBrain.regime === 'risk_off' ? 'bearish' : 'neutral'
    
    const whaleText = ecoscan.whale_activity === 'accumulation' ? 
      'Whale inflows suggest smart money is accumulating' : 
      'Whale outflows indicate distribution phase'
    
    const emiText = ecoscan.emi_score > 70 ? 'strong momentum' : 
                    ecoscan.emi_score > 50 ? 'moderate momentum' : 'weak momentum'
    
    const confidenceText = alphaBrain.confidence > 0.8 ? 'High confidence' : 
                          alphaBrain.confidence > 0.6 ? 'Moderate confidence' : 'Low confidence'

    const summary = `Market regime is ${regimeText} with ${alphaBrain.top_asset} showing strongest signals. ` +
                   `${ecoscan.top_ecosystem} ecosystem displays ${emiText} (EMI: ${ecoscan.emi_score.toFixed(1)}). ` +
                   `${whaleText} with WCF at ${ecoscan.wcf.toFixed(1)}. ` +
                   `AlphaFusion ${confidenceText}: ${(alphaBrain.confidence * 100).toFixed(0)}% - ` +
                   `${alphaBrain.confidence > 0.7 ? 'Bullish bias confirmed' : 'Cautious positioning advised'}.`

    setInsight(summary)
  }

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(insight)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    } else {
      alert('Speech synthesis not supported in this browser')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-[#0B1622]/95 backdrop-blur-xl border-l-2 border-[#D4AF37] z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#D4AF37]">AI Insights</h2>
                  <p className="text-sm text-gray-400 mt-1">GhostQuant Market Analyst</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
                </div>
              ) : (
                <>
                  {/* Insight Summary */}
                  <div className="bg-gray-900/50 rounded-lg p-4 mb-6 border border-gray-800">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-300 leading-relaxed">{insight}</p>
                      </div>
                    </div>
                  </div>

                  {/* Speak Button */}
                  <button
                    onClick={handleSpeak}
                    className="w-full mb-6 px-4 py-3 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg text-[#D4AF37] font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    Speak Insight
                  </button>

                  {/* Key Metrics */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Key Metrics</h3>

                    {/* AlphaBrain Metrics */}
                    {alphaBrainData && (
                      <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">AlphaBrain Confidence</span>
                          <span className="text-lg font-bold text-[#D4AF37]">
                            {(alphaBrainData.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#D4AF37] to-yellow-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${alphaBrainData.confidence * 100}%` }}
                          />
                        </div>
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Regime:</span>
                            <span className="text-white font-medium">{alphaBrainData.regime}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Top Asset:</span>
                            <span className="text-white font-medium">{alphaBrainData.top_asset}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ecoscan Metrics */}
                    {ecoscanData && (
                      <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Ecosystem Momentum (EMI)</span>
                          <span className="text-lg font-bold text-[#D4AF37]">
                            {ecoscanData.emi_score.toFixed(1)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-[#D4AF37] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${ecoscanData.emi_score}%` }}
                          />
                        </div>
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Top Ecosystem:</span>
                            <span className="text-white font-medium">{ecoscanData.top_ecosystem}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Whale Activity:</span>
                            <span className={`font-medium ${ecoscanData.whale_activity === 'accumulation' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {ecoscanData.whale_activity}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">WCF:</span>
                            <span className="text-white font-medium">{ecoscanData.wcf.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={fetchData}
                    className="w-full mt-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 font-medium transition-colors"
                  >
                    Refresh Insights
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
