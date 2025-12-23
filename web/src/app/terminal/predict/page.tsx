'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'
import { predictClient, PredictionResponse, BatchPredictionResponse, ChampionResponse } from '@/lib/predictClient'

interface PredictionHistoryItem {
  id: string
  type: 'event' | 'entity' | 'token' | 'chain' | 'batch'
  timestamp: number
  result: PredictionResponse | BatchPredictionResponse
  icon: string
}

export default function PredictionConsolePage() {
  const [eventForm, setEventForm] = useState({
    value: '',
    chain: '',
    timestamp: '',
    type: '',
    token: '',
    wallet: ''
  })
  const [entityForm, setEntityForm] = useState({
    entity_id: '',
    chains: '',
    tokens: '',
    tx_count: '',
    volume_usd: ''
  })
  const [tokenForm, setTokenForm] = useState({
    token: '',
    price: '',
    volume: '',
    volatility: '',
    market_cap: '',
    liquidity: ''
  })
  const [chainForm, setChainForm] = useState({
    chain: '',
    tps: '',
    gas: '',
    load: '',
    mev_risk: ''
  })
  const [batchForm, setBatchForm] = useState('')

  const [expandedForm, setExpandedForm] = useState<string | null>('event')

  const [eventLoading, setEventLoading] = useState(false)
  const [entityLoading, setEntityLoading] = useState(false)
  const [tokenLoading, setTokenLoading] = useState(false)
  const [chainLoading, setChainLoading] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)

  const [activeResult, setActiveResult] = useState<{ type: string; result: any; rawJson?: string } | null>(null)
  const [showAnimation, setShowAnimation] = useState(false)
  const [showRawJson, setShowRawJson] = useState(false)

  const [champion, setChampion] = useState<ChampionResponse | null>(null)

  const [history, setHistory] = useState<PredictionHistoryItem[]>([])
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)

  useEffect(() => {
    const loadChampion = async () => {
      try {
        const result = await predictClient.getChampion()
        if (result.success) {
          setChampion(result)
        }
      } catch (error) {
        console.error('Failed to load champion:', error)
      }
    }
    loadChampion()
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('ghostquant_predict_history')
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse prediction history', e)
      }
    }
  }, [])

  const addToHistory = (type: 'event' | 'entity' | 'token' | 'chain' | 'batch', result: any) => {
    const icons = {
      event: '⚡',
      entity: '👤',
      token: '💰',
      chain: '⛓️',
      batch: '🗂️'
    }

    const newItem: PredictionHistoryItem = {
      id: `${type}-${Date.now()}`,
      type,
      timestamp: Date.now(),
      result,
      icon: icons[type]
    }

    const updated = [newItem, ...history].slice(0, 20)
    setHistory(updated)
    localStorage.setItem('ghostquant_predict_history', JSON.stringify(updated))
  }

  const formatTimestamp = (timestamp: number): string => {
    const diffMs = Date.now() - timestamp
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffSecs < 60) return `${diffSecs}s ago`
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    
    return new Date(timestamp).toLocaleDateString()
  }

  const resetEventForm = () => {
    setEventForm({ value: '', chain: '', timestamp: '', type: '', token: '', wallet: '' })
  }

  const resetEntityForm = () => {
    setEntityForm({ entity_id: '', chains: '', tokens: '', tx_count: '', volume_usd: '' })
  }

  const resetTokenForm = () => {
    setTokenForm({ token: '', price: '', volume: '', volatility: '', market_cap: '', liquidity: '' })
  }

  const resetChainForm = () => {
    setChainForm({ chain: '', tps: '', gas: '', load: '', mev_risk: '' })
  }

  const resetBatchForm = () => {
    setBatchForm('')
  }

  const handlePredictEvent = async () => {
    try {
      setEventLoading(true)

      const formData = {
        value: parseFloat(eventForm.value) || 0,
        chain: eventForm.chain || 'unknown',
        timestamp: parseInt(eventForm.timestamp) || Date.now(),
        type: eventForm.type || 'unknown',
        token: eventForm.token || 'unknown',
        wallet: eventForm.wallet || 'unknown'
      }

      const result = await predictClient.predictEvent(formData)
      setActiveResult({ type: 'Event Risk', result, rawJson: JSON.stringify(result, null, 2) })
      setShowAnimation(true)
      setShowRawJson(false)
      setTimeout(() => setShowAnimation(false), 3000)
      
      if (result.success) {
        addToHistory('event', result)
      }
    } catch (error) {
      console.error('Event prediction error:', error)
      setActiveResult({
        type: 'Event Risk',
        result: { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
        rawJson: JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2)
      })
    } finally {
      setEventLoading(false)
    }
  }

  const handlePredictEntity = async () => {
    try {
      setEntityLoading(true)

      const formData = {
        entity_id: entityForm.entity_id || 'unknown',
        chains: entityForm.chains || 'unknown',
        tokens: entityForm.tokens || 'unknown',
        tx_count: parseInt(entityForm.tx_count) || 0,
        volume_usd: parseFloat(entityForm.volume_usd) || 0
      }

      const result = await predictClient.predictEntity(formData)
      setActiveResult({ type: 'Entity Manipulation Risk', result, rawJson: JSON.stringify(result, null, 2) })
      setShowAnimation(true)
      setShowRawJson(false)
      setTimeout(() => setShowAnimation(false), 3000)
      
      if (result.success) {
        addToHistory('entity', result)
      }
    } catch (error) {
      console.error('Entity prediction error:', error)
      setActiveResult({
        type: 'Entity Manipulation Risk',
        result: { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
        rawJson: JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2)
      })
    } finally {
      setEntityLoading(false)
    }
  }

  const handlePredictToken = async () => {
    try {
      setTokenLoading(true)

      const formData = {
        token: tokenForm.token || 'unknown',
        price: parseFloat(tokenForm.price) || 0,
        volume: parseFloat(tokenForm.volume) || 0,
        volatility: parseFloat(tokenForm.volatility) || 0,
        market_cap: parseFloat(tokenForm.market_cap) || 0,
        liquidity: parseFloat(tokenForm.liquidity) || 0
      }

      const result = await predictClient.predictToken(formData)
      setActiveResult({ type: 'Token Price Direction', result, rawJson: JSON.stringify(result, null, 2) })
      setShowAnimation(true)
      setShowRawJson(false)
      setTimeout(() => setShowAnimation(false), 3000)
      
      if (result.success) {
        addToHistory('token', result)
      }
    } catch (error) {
      console.error('Token prediction error:', error)
      setActiveResult({
        type: 'Token Price Direction',
        result: { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
        rawJson: JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2)
      })
    } finally {
      setTokenLoading(false)
    }
  }

  const handlePredictChain = async () => {
    try {
      setChainLoading(true)

      const formData = {
        chain: chainForm.chain || 'unknown',
        tps: parseFloat(chainForm.tps) || 0,
        gas: parseFloat(chainForm.gas) || 0,
        load: parseFloat(chainForm.load) || 0,
        mev_risk: parseFloat(chainForm.mev_risk) || 0
      }

      const result = await predictClient.predictChain(formData)
      setActiveResult({ type: 'Chain Pressure', result, rawJson: JSON.stringify(result, null, 2) })
      setShowAnimation(true)
      setShowRawJson(false)
      setTimeout(() => setShowAnimation(false), 3000)
      
      if (result.success) {
        addToHistory('chain', result)
      }
    } catch (error) {
      console.error('Chain prediction error:', error)
      setActiveResult({
        type: 'Chain Pressure',
        result: { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
        rawJson: JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2)
      })
    } finally {
      setChainLoading(false)
    }
  }

  const handlePredictBatch = async () => {
    try {
      setBatchLoading(true)

      let events: any[]
      try {
        const parsed = JSON.parse(batchForm)
        if (!Array.isArray(parsed)) {
          throw new Error('Input must be a JSON array')
        }
        events = parsed
      } catch (parseError) {
        setActiveResult({
          type: 'Batch Prediction',
          result: { success: false, error: 'Invalid JSON format. Please provide a valid JSON array.' },
          rawJson: JSON.stringify({ success: false, error: 'Invalid JSON' }, null, 2)
        })
        return
      }

      const result = await predictClient.predictBatch(events)
      setActiveResult({ type: 'Batch Prediction', result, rawJson: JSON.stringify(result, null, 2) })
      setShowAnimation(true)
      setShowRawJson(false)
      setTimeout(() => setShowAnimation(false), 3000)
      
      if (result.success) {
        addToHistory('batch', result)
      }
    } catch (error) {
      console.error('Batch prediction error:', error)
      setActiveResult({
        type: 'Batch Prediction',
        result: { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
        rawJson: JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2)
      })
    } finally {
      setBatchLoading(false)
    }
  }

  const handleHistoryClick = (item: PredictionHistoryItem) => {
    const typeLabels = {
      event: 'Event Risk',
      entity: 'Entity Manipulation Risk',
      token: 'Token Price Direction',
      chain: 'Chain Pressure',
      batch: 'Batch Prediction'
    }
    setActiveResult({ type: typeLabels[item.type], result: item.result, rawJson: JSON.stringify(item.result, null, 2) })
    setSelectedHistoryId(item.id)
    setShowRawJson(false)
  }

  const generateSparkline = (): string => {
    const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
    const recentPredictions = history.slice(0, 10).reverse()
    
    if (recentPredictions.length === 0) return '▁▁▁▁▁▁▁▁'
    
    const values = recentPredictions.map(item => {
      if ('confidence' in item.result && typeof item.result.confidence === 'number') {
        return item.result.confidence
      }
      if ('risk_score' in item.result && typeof item.result.risk_score === 'number') {
        return 1 - item.result.risk_score
      }
      return 0.5
    })
    
    return values.map(v => blocks[Math.min(7, Math.floor(v * 8))]).join('')
  }

  const getRiskCounts = () => {
    const counts = { high: 0, medium: 0, low: 0 }
    history.slice(0, 20).forEach(item => {
      if ('classification' in item.result && item.result.classification) {
        const cls = item.result.classification.toLowerCase()
        if (cls === 'high') counts.high++
        else if (cls === 'medium') counts.medium++
        else if (cls === 'low') counts.low++
      }
    })
    const total = counts.high + counts.medium + counts.low || 1
    return {
      high: (counts.high / total) * 100,
      medium: (counts.medium / total) * 100,
      low: (counts.low / total) * 100
    }
  }

  const riskCounts = getRiskCounts()

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Champion Status Bar */}
      {champion && champion.success && (
        <div className="mb-4 px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Champion Model:</span>
              <span className="text-sm font-semibold text-cyan-400">{champion.model_name || 'Unknown'}</span>
            </div>
            <div className="text-sm text-gray-400">
              Version: <span className="text-cyan-400">{champion.version || '—'}</span>
            </div>
            {champion.f1_score !== undefined && (
              <div className="text-sm text-gray-400">
                F1 Score: <span className="text-cyan-400">{champion.f1_score.toFixed(4)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-cyan-400">Prediction Console</h1>
        <p className="text-sm text-gray-400">AI-powered risk predictions and analysis</p>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Panel: Input Forms */}
        <div className="w-80 flex flex-col gap-3 overflow-y-auto pr-2">
          {/* Event Form */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedForm(expandedForm === 'event' ? null : 'event')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span className="text-sm font-semibold text-cyan-400">Event Prediction</span>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedForm === 'event' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedForm === 'event' && (
              <div className="p-4 space-y-3 border-t border-cyan-500/20">
                <input type="number" placeholder="Value" value={eventForm.value} onChange={(e) => setEventForm({ ...eventForm, value: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="text" placeholder="Chain" value={eventForm.chain} onChange={(e) => setEventForm({ ...eventForm, chain: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="number" placeholder="Timestamp" value={eventForm.timestamp} onChange={(e) => setEventForm({ ...eventForm, timestamp: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="text" placeholder="Type" value={eventForm.type} onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="text" placeholder="Token" value={eventForm.token} onChange={(e) => setEventForm({ ...eventForm, token: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="text" placeholder="Wallet" value={eventForm.wallet} onChange={(e) => setEventForm({ ...eventForm, wallet: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <div className="flex gap-2">
                  <button onClick={handlePredictEvent} disabled={eventLoading} className="flex-1 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium">
                    {eventLoading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Predicting...</span> : '➡️ Predict'}
                  </button>
                  <button onClick={resetEventForm} className="px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-gray-400 hover:bg-slate-700/50 transition-all font-medium">Reset</button>
                </div>
              </div>
            )}
          </div>

          {/* Entity Form */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <button onClick={() => setExpandedForm(expandedForm === 'entity' ? null : 'entity')} className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-2"><span className="text-lg">👤</span><span className="text-sm font-semibold text-cyan-400">Entity Prediction</span></div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedForm === 'entity' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {expandedForm === 'entity' && (
              <div className="p-4 space-y-3 border-t border-cyan-500/20">
                <input type="text" placeholder="Entity ID" value={entityForm.entity_id} onChange={(e) => setEntityForm({ ...entityForm, entity_id: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="text" placeholder="Chains" value={entityForm.chains} onChange={(e) => setEntityForm({ ...entityForm, chains: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="text" placeholder="Tokens" value={entityForm.tokens} onChange={(e) => setEntityForm({ ...entityForm, tokens: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="number" placeholder="TX Count" value={entityForm.tx_count} onChange={(e) => setEntityForm({ ...entityForm, tx_count: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="number" placeholder="Volume USD" value={entityForm.volume_usd} onChange={(e) => setEntityForm({ ...entityForm, volume_usd: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <div className="flex gap-2">
                  <button onClick={handlePredictEntity} disabled={entityLoading} className="flex-1 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium">
                    {entityLoading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Predicting...</span> : '➡️ Predict'}
                  </button>
                  <button onClick={resetEntityForm} className="px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-gray-400 hover:bg-slate-700/50 transition-all font-medium">Reset</button>
                </div>
              </div>
            )}
          </div>

          {/* Token Form */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <button onClick={() => setExpandedForm(expandedForm === 'token' ? null : 'token')} className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-2"><span className="text-lg">💰</span><span className="text-sm font-semibold text-cyan-400">Token Prediction</span></div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedForm === 'token' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {expandedForm === 'token' && (
              <div className="p-4 space-y-3 border-t border-cyan-500/20">
                <input type="text" placeholder="Token" value={tokenForm.token} onChange={(e) => setTokenForm({ ...tokenForm, token: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="number" placeholder="Price" value={tokenForm.price} onChange={(e) => setTokenForm({ ...tokenForm, price: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="number" placeholder="Volume" value={tokenForm.volume} onChange={(e) => setTokenForm({ ...tokenForm, volume: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="number" placeholder="Volatility" value={tokenForm.volatility} onChange={(e) => setTokenForm({ ...tokenForm, volatility: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="number" placeholder="Market Cap" value={tokenForm.market_cap} onChange={(e) => setTokenForm({ ...tokenForm, market_cap: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="number" placeholder="Liquidity" value={tokenForm.liquidity} onChange={(e) => setTokenForm({ ...tokenForm, liquidity: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <div className="flex gap-2">
                  <button onClick={handlePredictToken} disabled={tokenLoading} className="flex-1 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium">
                    {tokenLoading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Predicting...</span> : '➡️ Predict'}
                  </button>
                  <button onClick={resetTokenForm} className="px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-gray-400 hover:bg-slate-700/50 transition-all font-medium">Reset</button>
                </div>
              </div>
            )}
          </div>

          {/* Chain Form */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <button onClick={() => setExpandedForm(expandedForm === 'chain' ? null : 'chain')} className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-2"><span className="text-lg">⛓️</span><span className="text-sm font-semibold text-cyan-400">Chain Prediction</span></div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedForm === 'chain' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {expandedForm === 'chain' && (
              <div className="p-4 space-y-3 border-t border-cyan-500/20">
                <input type="text" placeholder="Chain" value={chainForm.chain} onChange={(e) => setChainForm({ ...chainForm, chain: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="number" placeholder="TPS" value={chainForm.tps} onChange={(e) => setChainForm({ ...chainForm, tps: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="number" placeholder="Gas" value={chainForm.gas} onChange={(e) => setChainForm({ ...chainForm, gas: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="number" placeholder="Load" value={chainForm.load} onChange={(e) => setChainForm({ ...chainForm, load: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <input type="number" placeholder="MEV Risk" value={chainForm.mev_risk} onChange={(e) => setChainForm({ ...chainForm, mev_risk: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50" />
                <div className="flex gap-2">
                  <button onClick={handlePredictChain} disabled={chainLoading} className="flex-1 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium">
                    {chainLoading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Predicting...</span> : '➡️ Predict'}
                  </button>
                  <button onClick={resetChainForm} className="px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-gray-400 hover:bg-slate-700/50 transition-all font-medium">Reset</button>
                </div>
              </div>
            )}
          </div>

          {/* Batch Form */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <button onClick={() => setExpandedForm(expandedForm === 'batch' ? null : 'batch')} className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-2"><span className="text-lg">🗂️</span><span className="text-sm font-semibold text-cyan-400">Batch Prediction</span></div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedForm === 'batch' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {expandedForm === 'batch' && (
              <div className="p-4 space-y-3 border-t border-cyan-500/20">
                <textarea placeholder='[{"value": 100, "chain": "ethereum"}, ...]' value={batchForm} onChange={(e) => setBatchForm(e.target.value)} rows={6} className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 font-mono" />
                <p className="text-xs text-gray-500">Paste JSON array of events</p>
                <div className="flex gap-2">
                  <button onClick={handlePredictBatch} disabled={batchLoading} className="flex-1 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium">
                    {batchLoading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Predicting...</span> : '➡️ Predict Batch'}
                  </button>
                  <button onClick={resetBatchForm} className="px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-gray-400 hover:bg-slate-700/50 transition-all font-medium">Reset</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Middle Panel: Result Cards */}
        <div className="flex-1 flex items-center justify-center overflow-y-auto p-4">
          {activeResult ? (
            <div className={`w-full max-w-2xl bg-slate-900/50 border rounded-lg p-8 animate-fadeIn ${showAnimation && activeResult.result.success && activeResult.result.classification === 'high' ? 'ring-4 ring-red-500/50 animate-pulse border-red-500/50' : showAnimation ? 'ring-4 ring-cyan-500/50 animate-pulse border-cyan-500/50' : 'border-cyan-500/30'}`}>
              {activeResult.result.success ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-cyan-400 mb-2">{activeResult.type}</h2>
                    <p className="text-sm text-gray-400">Predicted {formatTimestamp(Date.now())}</p>
                  </div>

                  {activeResult.type === 'Batch Prediction' && 'total' in activeResult.result && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-slate-800/50 rounded-lg"><p className="text-xs text-gray-400 mb-1">Total</p><p className="text-2xl font-bold text-cyan-400">{activeResult.result.total}</p></div>
                      <div className="text-center p-4 bg-slate-800/50 rounded-lg"><p className="text-xs text-gray-400 mb-1">Successful</p><p className="text-2xl font-bold text-green-400">{activeResult.result.successful}</p></div>
                      <div className="text-center p-4 bg-slate-800/50 rounded-lg"><p className="text-xs text-gray-400 mb-1">Failed</p><p className="text-2xl font-bold text-red-400">{(activeResult.result.total || 0) - (activeResult.result.successful || 0)}</p></div>
                    </div>
                  )}

                  {activeResult.type !== 'Batch Prediction' && (
                    <div className="grid grid-cols-2 gap-6">
                      {activeResult.result.risk_score !== undefined && <div className="text-center p-4 bg-slate-800/50 rounded-lg"><p className="text-xs text-gray-400 mb-1">Risk Score</p><p className="text-3xl font-bold text-cyan-400">{activeResult.result.risk_score.toFixed(3)}</p></div>}
                      {activeResult.result.confidence !== undefined && <div className="text-center p-4 bg-slate-800/50 rounded-lg"><p className="text-xs text-gray-400 mb-1">Confidence</p><p className="text-3xl font-bold text-cyan-400">{(activeResult.result.confidence * 100).toFixed(1)}%</p></div>}
                      {activeResult.result.direction && <div className="text-center p-4 bg-slate-800/50 rounded-lg"><p className="text-xs text-gray-400 mb-1">Direction</p><p className={`text-3xl font-bold ${activeResult.result.direction === 'up' ? 'text-green-400' : activeResult.result.direction === 'down' ? 'text-red-400' : 'text-gray-400'}`}>{activeResult.result.direction.toUpperCase()}</p></div>}
                      {activeResult.result.pressure_score !== undefined && <div className="text-center p-4 bg-slate-800/50 rounded-lg"><p className="text-xs text-gray-400 mb-1">Pressure</p><p className="text-3xl font-bold text-cyan-400">{activeResult.result.pressure_score.toFixed(3)}</p></div>}
                      {activeResult.result.manipulation_probability !== undefined && <div className="text-center p-4 bg-slate-800/50 rounded-lg"><p className="text-xs text-gray-400 mb-1">Manipulation</p><p className="text-3xl font-bold text-cyan-400">{(activeResult.result.manipulation_probability * 100).toFixed(1)}%</p></div>}
                      {activeResult.result.ring_probability !== undefined && <div className="text-center p-4 bg-slate-800/50 rounded-lg"><p className="text-xs text-gray-400 mb-1">Ring</p><p className="text-3xl font-bold text-cyan-400">{(activeResult.result.ring_probability * 100).toFixed(1)}%</p></div>}
                    </div>
                  )}

                  {activeResult.result.classification && (
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-2">Classification</p>
                      <span className={`inline-block px-6 py-3 rounded-lg text-xl font-bold ${activeResult.result.classification === 'high' ? 'bg-red-500/20 text-red-400' : activeResult.result.classification === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>{activeResult.result.classification.toUpperCase()}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-cyan-500/20">
                    <button onClick={() => setShowRawJson(!showRawJson)} className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-sm text-cyan-400 hover:bg-slate-700/50 transition-all">{showRawJson ? '▼ Hide Raw JSON' : '▶ Show Raw JSON'}</button>
                    {showRawJson && activeResult.rawJson && <pre className="mt-3 p-4 bg-slate-950/50 border border-cyan-500/20 rounded-lg text-xs text-gray-300 overflow-x-auto">{activeResult.rawJson}</pre>}
                  </div>

                  <div className="pt-4 border-t border-cyan-500/20 text-center">
                    <p className="text-sm text-gray-400">Model: <span className="text-cyan-400 font-medium">{activeResult.result.model_name} v{activeResult.result.version}</span></p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">Prediction Failed</h3>
                  <p className="text-sm text-gray-400">{activeResult.result.error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
              <h3 className="text-xl font-bold text-gray-400 mb-2">No Prediction Yet</h3>
              <p className="text-sm text-gray-500">Fill out a form and run a prediction</p>
            </div>
          )}
        </div>

        {/* Right Panel: Mini Graphs */}
        <div className="w-80 flex flex-col gap-4 overflow-hidden">
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">Analytics</h3>
            <div><p className="text-xs text-gray-400 mb-2">Confidence Trend</p><div className="font-mono text-2xl text-cyan-400 tracking-wider">{generateSparkline()}</div></div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Risk Distribution</p>
              <div className="space-y-2">
                <div><div className="flex justify-between text-xs mb-1"><span className="text-red-400">High</span><span className="text-gray-500">{riskCounts.high.toFixed(0)}%</span></div><div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-red-500/70 transition-all duration-500" style={{ width: `${riskCounts.high}%` }}></div></div></div>
                <div><div className="flex justify-between text-xs mb-1"><span className="text-yellow-400">Medium</span><span className="text-gray-500">{riskCounts.medium.toFixed(0)}%</span></div><div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-yellow-500/70 transition-all duration-500" style={{ width: `${riskCounts.medium}%` }}></div></div></div>
                <div><div className="flex justify-between text-xs mb-1"><span className="text-green-400">Low</span><span className="text-gray-500">{riskCounts.low.toFixed(0)}%</span></div><div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-green-500/70 transition-all duration-500" style={{ width: `${riskCounts.low}%` }}></div></div></div>
              </div>
            </div>
            {activeResult && activeResult.result.success && activeResult.result.ring_probability !== undefined && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Ring Formation</p>
                <div className="flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full relative" style={{ background: `conic-gradient(from 0deg, #06b6d4 0%, #06b6d4 ${activeResult.result.ring_probability * 100}%, #1e293b ${activeResult.result.ring_probability * 100}%, #1e293b 100%)` }}>
                    <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center"><span className="text-lg font-bold text-cyan-400">{(activeResult.result.ring_probability * 100).toFixed(0)}%</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden flex-1 flex flex-col">
            <div className="px-4 py-3 border-b border-cyan-500/20"><h3 className="text-sm font-semibold text-cyan-400">History</h3><p className="text-xs text-gray-500 mt-1">{history.length} predictions</p></div>
            <div className="flex-1 overflow-y-auto p-2">
              {history.length === 0 ? <div className="text-center py-8 text-gray-500 text-sm">No predictions yet</div> : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <button key={item.id} onClick={() => handleHistoryClick(item)} className={`w-full text-left p-3 rounded-lg transition-all ${selectedHistoryId === item.id ? 'bg-cyan-500/20 border border-cyan-500/50 animate-pulse' : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/50 hover:border-cyan-500/20'}`} style={{ animationDuration: selectedHistoryId === item.id ? '2s' : undefined }}>
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1"><span className="text-xs font-semibold text-cyan-400 capitalize">{item.type}</span><span className="text-xs text-gray-500">{formatTimestamp(item.timestamp)}</span></div>
                          {item.result.success && (
                            <div className="space-y-1">
                              {item.type === 'batch' && 'total' in item.result && <p className="text-xs text-gray-400">Total: <span className="text-cyan-400 font-medium">{item.result.total}</span> | Success: <span className="text-green-400 font-medium">{item.result.successful}</span></p>}
                              {item.type !== 'batch' && 'risk_score' in item.result && item.result.risk_score !== undefined && <p className="text-xs text-gray-400">Score: <span className="text-cyan-400 font-medium">{item.result.risk_score.toFixed(3)}</span></p>}
                              {'classification' in item.result && item.result.classification && <span className={`inline-block text-xs px-2 py-0.5 rounded ${item.result.classification === 'high' ? 'bg-red-500/20 text-red-400' : item.result.classification === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>{item.result.classification.toUpperCase()}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 400ms ease-out; }
      `}</style>
    </div>
  )
}
