'use client'

import { useState, useEffect } from 'react'
import { predictClient, PredictionResponse } from '@/lib/predictClient'

interface PredictionHistoryItem {
  id: string
  type: 'event' | 'entity' | 'token' | 'chain'
  timestamp: number
  result: PredictionResponse
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

  const [expandedForm, setExpandedForm] = useState<string | null>('event')

  const [eventLoading, setEventLoading] = useState(false)
  const [entityLoading, setEntityLoading] = useState(false)
  const [tokenLoading, setTokenLoading] = useState(false)
  const [chainLoading, setChainLoading] = useState(false)

  const [eventResult, setEventResult] = useState<PredictionResponse | null>(null)
  const [entityResult, setEntityResult] = useState<PredictionResponse | null>(null)
  const [tokenResult, setTokenResult] = useState<PredictionResponse | null>(null)
  const [chainResult, setChainResult] = useState<PredictionResponse | null>(null)

  const [activeResult, setActiveResult] = useState<{ type: string; result: PredictionResponse } | null>(null)
  const [showAnimation, setShowAnimation] = useState(false)

  const [history, setHistory] = useState<PredictionHistoryItem[]>([])
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)

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

  const addToHistory = (type: 'event' | 'entity' | 'token' | 'chain', result: PredictionResponse) => {
    const icons = {
      event: '⚡',
      entity: '👤',
      token: '💰',
      chain: '⛓️'
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

  const handlePredictEvent = async () => {
    try {
      setEventLoading(true)
      setEventResult(null)

      const formData = {
        value: parseFloat(eventForm.value) || 0,
        chain: eventForm.chain || 'unknown',
        timestamp: parseInt(eventForm.timestamp) || Date.now(),
        type: eventForm.type || 'unknown',
        token: eventForm.token || 'unknown',
        wallet: eventForm.wallet || 'unknown'
      }

      const result = await predictClient.predictEvent(formData)
      setEventResult(result)
      setActiveResult({ type: 'Event Risk', result })
      setShowAnimation(true)
      setTimeout(() => setShowAnimation(false), 3000)
      
      if (result.success) {
        addToHistory('event', result)
      }
    } catch (error) {
      console.error('Event prediction error:', error)
      setEventResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setEventLoading(false)
    }
  }

  const handlePredictEntity = async () => {
    try {
      setEntityLoading(true)
      setEntityResult(null)

      const formData = {
        entity_id: entityForm.entity_id || 'unknown',
        chains: entityForm.chains || 'unknown',
        tokens: entityForm.tokens || 'unknown',
        tx_count: parseInt(entityForm.tx_count) || 0,
        volume_usd: parseFloat(entityForm.volume_usd) || 0
      }

      const result = await predictClient.predictEntity(formData)
      setEntityResult(result)
      setActiveResult({ type: 'Entity Manipulation Risk', result })
      setShowAnimation(true)
      setTimeout(() => setShowAnimation(false), 3000)
      
      if (result.success) {
        addToHistory('entity', result)
      }
    } catch (error) {
      console.error('Entity prediction error:', error)
      setEntityResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setEntityLoading(false)
    }
  }

  const handlePredictToken = async () => {
    try {
      setTokenLoading(true)
      setTokenResult(null)

      const formData = {
        token: tokenForm.token || 'unknown',
        price: parseFloat(tokenForm.price) || 0,
        volume: parseFloat(tokenForm.volume) || 0,
        volatility: parseFloat(tokenForm.volatility) || 0,
        market_cap: parseFloat(tokenForm.market_cap) || 0,
        liquidity: parseFloat(tokenForm.liquidity) || 0
      }

      const result = await predictClient.predictToken(formData)
      setTokenResult(result)
      setActiveResult({ type: 'Token Price Direction', result })
      setShowAnimation(true)
      setTimeout(() => setShowAnimation(false), 3000)
      
      if (result.success) {
        addToHistory('token', result)
      }
    } catch (error) {
      console.error('Token prediction error:', error)
      setTokenResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setTokenLoading(false)
    }
  }

  const handlePredictChain = async () => {
    try {
      setChainLoading(true)
      setChainResult(null)

      const formData = {
        chain: chainForm.chain || 'unknown',
        tps: parseFloat(chainForm.tps) || 0,
        gas: parseFloat(chainForm.gas) || 0,
        load: parseFloat(chainForm.load) || 0,
        mev_risk: parseFloat(chainForm.mev_risk) || 0
      }

      const result = await predictClient.predictChain(formData)
      setChainResult(result)
      setActiveResult({ type: 'Chain Pressure', result })
      setShowAnimation(true)
      setTimeout(() => setShowAnimation(false), 3000)
      
      if (result.success) {
        addToHistory('chain', result)
      }
    } catch (error) {
      console.error('Chain prediction error:', error)
      setChainResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setChainLoading(false)
    }
  }

  const handleHistoryClick = (item: PredictionHistoryItem) => {
    const typeLabels = {
      event: 'Event Risk',
      entity: 'Entity Manipulation Risk',
      token: 'Token Price Direction',
      chain: 'Chain Pressure'
    }
    setActiveResult({ type: typeLabels[item.type], result: item.result })
    setSelectedHistoryId(item.id)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-cyan-400">Prediction Console</h1>
        <p className="text-sm text-gray-400">AI-powered risk predictions and analysis</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Panel: Prediction Forms */}
        <div className="w-80 flex flex-col gap-3 overflow-y-auto">
          {/* Event Prediction Form */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedForm(expandedForm === 'event' ? null : 'event')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span className="text-sm font-semibold text-cyan-400">Event Prediction</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${expandedForm === 'event' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedForm === 'event' && (
              <div className="p-4 space-y-3 border-t border-cyan-500/20">
                <input
                  type="number"
                  placeholder="Value"
                  value={eventForm.value}
                  onChange={(e) => setEventForm({ ...eventForm, value: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="text"
                  placeholder="Chain"
                  value={eventForm.chain}
                  onChange={(e) => setEventForm({ ...eventForm, chain: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="number"
                  placeholder="Timestamp"
                  value={eventForm.timestamp}
                  onChange={(e) => setEventForm({ ...eventForm, timestamp: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="text"
                  placeholder="Type"
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="text"
                  placeholder="Token"
                  value={eventForm.token}
                  onChange={(e) => setEventForm({ ...eventForm, token: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="text"
                  placeholder="Wallet"
                  value={eventForm.wallet}
                  onChange={(e) => setEventForm({ ...eventForm, wallet: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  onClick={handlePredictEvent}
                  disabled={eventLoading}
                  className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {eventLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Predicting...
                    </span>
                  ) : (
                    '➡️ Predict Event Risk'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Entity Prediction Form */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedForm(expandedForm === 'entity' ? null : 'entity')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                <span className="text-sm font-semibold text-cyan-400">Entity Prediction</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${expandedForm === 'entity' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedForm === 'entity' && (
              <div className="p-4 space-y-3 border-t border-cyan-500/20">
                <input
                  type="text"
                  placeholder="Entity ID"
                  value={entityForm.entity_id}
                  onChange={(e) => setEntityForm({ ...entityForm, entity_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="text"
                  placeholder="Chains (comma-separated)"
                  value={entityForm.chains}
                  onChange={(e) => setEntityForm({ ...entityForm, chains: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="text"
                  placeholder="Tokens (comma-separated)"
                  value={entityForm.tokens}
                  onChange={(e) => setEntityForm({ ...entityForm, tokens: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="number"
                  placeholder="Transaction Count"
                  value={entityForm.tx_count}
                  onChange={(e) => setEntityForm({ ...entityForm, tx_count: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="number"
                  placeholder="Volume USD"
                  value={entityForm.volume_usd}
                  onChange={(e) => setEntityForm({ ...entityForm, volume_usd: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  onClick={handlePredictEntity}
                  disabled={entityLoading}
                  className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {entityLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Predicting...
                    </span>
                  ) : (
                    '➡️ Predict Entity Manipulation Risk'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Token Prediction Form */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedForm(expandedForm === 'token' ? null : 'token')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">💰</span>
                <span className="text-sm font-semibold text-cyan-400">Token Prediction</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${expandedForm === 'token' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedForm === 'token' && (
              <div className="p-4 space-y-3 border-t border-cyan-500/20">
                <input
                  type="text"
                  placeholder="Token Symbol"
                  value={tokenForm.token}
                  onChange={(e) => setTokenForm({ ...tokenForm, token: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={tokenForm.price}
                  onChange={(e) => setTokenForm({ ...tokenForm, price: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="number"
                  placeholder="Volume"
                  value={tokenForm.volume}
                  onChange={(e) => setTokenForm({ ...tokenForm, volume: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="number"
                  placeholder="Volatility"
                  value={tokenForm.volatility}
                  onChange={(e) => setTokenForm({ ...tokenForm, volatility: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="number"
                  placeholder="Market Cap"
                  value={tokenForm.market_cap}
                  onChange={(e) => setTokenForm({ ...tokenForm, market_cap: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="number"
                  placeholder="Liquidity"
                  value={tokenForm.liquidity}
                  onChange={(e) => setTokenForm({ ...tokenForm, liquidity: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  onClick={handlePredictToken}
                  disabled={tokenLoading}
                  className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {tokenLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Predicting...
                    </span>
                  ) : (
                    '➡️ Predict Token Price Direction'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Chain Prediction Form */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedForm(expandedForm === 'chain' ? null : 'chain')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">⛓️</span>
                <span className="text-sm font-semibold text-cyan-400">Chain Prediction</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${expandedForm === 'chain' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedForm === 'chain' && (
              <div className="p-4 space-y-3 border-t border-cyan-500/20">
                <input
                  type="text"
                  placeholder="Chain Name"
                  value={chainForm.chain}
                  onChange={(e) => setChainForm({ ...chainForm, chain: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="number"
                  placeholder="TPS (Transactions per second)"
                  value={chainForm.tps}
                  onChange={(e) => setChainForm({ ...chainForm, tps: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="number"
                  placeholder="Gas Price"
                  value={chainForm.gas}
                  onChange={(e) => setChainForm({ ...chainForm, gas: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="number"
                  placeholder="Network Load"
                  value={chainForm.load}
                  onChange={(e) => setChainForm({ ...chainForm, load: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="number"
                  placeholder="MEV Risk"
                  value={chainForm.mev_risk}
                  onChange={(e) => setChainForm({ ...chainForm, mev_risk: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  onClick={handlePredictChain}
                  disabled={chainLoading}
                  className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {chainLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Predicting...
                    </span>
                  ) : (
                    '➡️ Predict Chain Pressure'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Middle Panel: Prediction Output */}
        <div className="flex-1 flex items-center justify-center overflow-y-auto p-4">
          {activeResult ? (
            <div 
              className={`w-full max-w-2xl bg-slate-900/50 border rounded-lg p-8 animate-slideUp ${
                showAnimation ? 'ring-4 ring-cyan-500/50 animate-pulse' : 'border-cyan-500/30'
              }`}
              style={{ animationDuration: showAnimation ? '3s' : undefined }}
            >
              {activeResult.result.success ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-cyan-400 mb-2">{activeResult.type}</h2>
                    <p className="text-sm text-gray-400">
                      Predicted {formatTimestamp(Date.now())}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {activeResult.result.risk_score !== undefined && (
                      <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Risk Score</p>
                        <p className="text-3xl font-bold text-cyan-400">
                          {activeResult.result.risk_score.toFixed(3)}
                        </p>
                      </div>
                    )}
                    {activeResult.result.confidence !== undefined && (
                      <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Confidence</p>
                        <p className="text-3xl font-bold text-cyan-400">
                          {(activeResult.result.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {activeResult.result.direction && (
                      <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Direction</p>
                        <p className={`text-3xl font-bold ${
                          activeResult.result.direction === 'up' ? 'text-green-400' :
                          activeResult.result.direction === 'down' ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                          {activeResult.result.direction.toUpperCase()}
                        </p>
                      </div>
                    )}
                    {activeResult.result.pressure_score !== undefined && (
                      <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Pressure Score</p>
                        <p className="text-3xl font-bold text-cyan-400">
                          {activeResult.result.pressure_score.toFixed(3)}
                        </p>
                      </div>
                    )}
                  </div>

                  {activeResult.result.classification && (
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-2">Classification</p>
                      <span className={`inline-block px-6 py-3 rounded-lg text-xl font-bold ${
                        activeResult.result.classification === 'high' ? 'bg-red-500/20 text-red-400' :
                        activeResult.result.classification === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {activeResult.result.classification.toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="pt-6 border-t border-cyan-500/20 text-center">
                    <p className="text-sm text-gray-400">
                      Model: <span className="text-cyan-400 font-medium">
                        {activeResult.result.model_name} v{activeResult.result.version}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">Prediction Failed</h3>
                  <p className="text-sm text-gray-400">{activeResult.result.error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-400 mb-2">No Prediction Yet</h3>
              <p className="text-sm text-gray-500">Fill out a form and run a prediction to see results</p>
            </div>
          )}
        </div>

        {/* Right Panel: Prediction History */}
        <div className="w-80 flex flex-col gap-4 overflow-hidden">
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden flex-1 flex flex-col">
            <div className="px-4 py-3 border-b border-cyan-500/20">
              <h3 className="text-sm font-semibold text-cyan-400">Prediction History</h3>
              <p className="text-xs text-gray-500 mt-1">{history.length} predictions</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No predictions yet
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleHistoryClick(item)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedHistoryId === item.id
                          ? 'bg-cyan-500/20 border border-cyan-500/50 animate-pulse'
                          : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/50 hover:border-cyan-500/20'
                      }`}
                      style={{ animationDuration: selectedHistoryId === item.id ? '2s' : undefined }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-cyan-400 capitalize">
                              {item.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(item.timestamp)}
                            </span>
                          </div>
                          {item.result.success && (
                            <div className="space-y-1">
                              {item.result.risk_score !== undefined && (
                                <p className="text-xs text-gray-400">
                                  Score: <span className="text-cyan-400 font-medium">
                                    {item.result.risk_score.toFixed(3)}
                                  </span>
                                </p>
                              )}
                              {item.result.classification && (
                                <span className={`inline-block text-xs px-2 py-0.5 rounded ${
                                  item.result.classification === 'high' ? 'bg-red-500/20 text-red-400' :
                                  item.result.classification === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {item.result.classification.toUpperCase()}
                                </span>
                              )}
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
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
