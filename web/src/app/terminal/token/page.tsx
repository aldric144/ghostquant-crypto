'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useEffect, useState, useMemo } from 'react'
import { useIntelFeed } from '@/hooks/useIntelFeed'
import { predictClient, PredictionResponse } from '@/lib/predictClient'

interface Token {
  id: string
  symbol: string
  name?: string
  address: string
  chain: string
  type: 'stablecoin' | 'memecoin' | 'bluechip' | 'ai' | 'unknown'
  severity: 'high' | 'medium' | 'low'
  score: number
  price?: number
  liquidity?: number
  volatility?: number
  lastSeen: number
  activityCount: number
  holderConcentration: number
  manipulationSignal: number
}

interface TokenActivity {
  id: string
  timestamp: number
  type: string
  severity: 'high' | 'medium' | 'low'
  message: string
  chain?: string
  value?: number
  wallet?: string
}

export default function TokenExplorerPage() {
  const [showGuide, setShowGuide] = useState(false)
  const [tokens, setTokens] = useState<Map<string, Token>>(new Map())
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([])
  const [activities, setActivities] = useState<TokenActivity[]>([])
  
  const [priceDirectionPrediction, setPriceDirectionPrediction] = useState<PredictionResponse | null>(null)
  const [priceDirectionLoading, setPriceDirectionLoading] = useState(false)
  const [confidencePrediction, setConfidencePrediction] = useState<PredictionResponse | null>(null)
  const [confidenceLoading, setConfidenceLoading] = useState(false)
  const [volatilityPrediction, setVolatilityPrediction] = useState<PredictionResponse | null>(null)
  const [volatilityLoading, setVolatilityLoading] = useState(false)
  
  const { latestAlert, alertHistory, connectionStatus } = useIntelFeed()

  const tokenConfig = {
    stablecoin: { color: '#10b981', label: 'Stablecoin', icon: '💵' },
    memecoin: { color: '#f59e0b', label: 'Memecoin', icon: '🐕' },
    bluechip: { color: '#3b82f6', label: 'Bluechip', icon: '💎' },
    ai: { color: '#a855f7', label: 'AI Token', icon: '🤖' },
    unknown: { color: '#6b7280', label: 'Unknown', icon: '❓' }
  }

  const getTokenType = (symbol: string, name?: string): Token['type'] => {
    const str = `${symbol} ${name || ''}`.toLowerCase()
    if (str.includes('usd') || str.includes('dai') || str.includes('usdc') || str.includes('usdt')) return 'stablecoin'
    if (str.includes('doge') || str.includes('shib') || str.includes('pepe') || str.includes('meme')) return 'memecoin'
    if (str.includes('btc') || str.includes('eth') || str.includes('bnb')) return 'bluechip'
    if (str.includes('ai') || str.includes('gpt') || str.includes('neural')) return 'ai'
    return 'unknown'
  }

  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewedTokens')
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse recently viewed tokens', e)
      }
    }
  }, [])

  const addToRecentlyViewed = (tokenId: string) => {
    setRecentlyViewed(prev => {
      const updated = [tokenId, ...prev.filter(id => id !== tokenId)].slice(0, 10)
      localStorage.setItem('recentlyViewedTokens', JSON.stringify(updated))
      return updated
    })
  }

  useEffect(() => {
    if (!latestAlert) return

    const tokenSymbol = latestAlert.intelligence?.event?.token || 'UNKNOWN'
    const chain = latestAlert.intelligence?.event?.chain || 'unknown'
    const score = latestAlert.score || 0
    const severity: 'high' | 'medium' | 'low' = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'
    const tokenId = `${tokenSymbol}-${chain}`
    const tokenType = getTokenType(tokenSymbol)
    const alertType = latestAlert.intelligence?.event?.event_type || latestAlert.type || 'alert'

    setTokens(prev => {
      const newTokens = new Map(prev)
      const existing = newTokens.get(tokenId)

      if (existing) {
        existing.lastSeen = Date.now()
        existing.activityCount++
        existing.score = Math.max(existing.score, score)
        existing.severity = existing.score >= 0.7 ? 'high' : existing.score >= 0.4 ? 'medium' : 'low'
      } else {
        newTokens.set(tokenId, {
          id: tokenId,
          symbol: tokenSymbol,
          name: undefined,
          address: `0x${Math.random().toString(16).substring(2, 42)}`,
          chain,
          type: tokenType,
          severity,
          score,
          price: Math.random() * 1000,
          liquidity: Math.random() * 10000000,
          volatility: Math.random(),
          lastSeen: Date.now(),
          activityCount: 1,
          holderConcentration: Math.random(),
          manipulationSignal: score
        })
      }

      return newTokens
    })

    setActivities(prev => [{
      id: `activity-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type: alertType,
      severity,
      message: `${alertType} detected for ${tokenSymbol}`,
      chain,
      value: Math.random() * 100000,
      wallet: `0x${Math.random().toString(16).substring(2, 10)}...`
    }, ...prev].slice(0, 100))

  }, [latestAlert])

  useEffect(() => {
    if (alertHistory && alertHistory.length > 0) {
      const initialTokens = new Map<string, Token>()
      const initialActivities: TokenActivity[] = []

      alertHistory.forEach((alert, index) => {
        const tokenSymbol = alert.intelligence?.event?.token || 'UNKNOWN'
        const chain = alert.intelligence?.event?.chain || 'unknown'
        const score = alert.score || 0
        const severity: 'high' | 'medium' | 'low' = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'
        const tokenId = `${tokenSymbol}-${chain}`
        const tokenType = getTokenType(tokenSymbol)
        const alertType = alert.intelligence?.event?.event_type || alert.type || 'alert'

        const existing = initialTokens.get(tokenId)
        if (existing) {
          existing.activityCount++
          existing.score = Math.max(existing.score, score)
          existing.severity = existing.score >= 0.7 ? 'high' : existing.score >= 0.4 ? 'medium' : 'low'
        } else {
          initialTokens.set(tokenId, {
            id: tokenId,
            symbol: tokenSymbol,
            name: undefined,
            address: `0x${Math.random().toString(16).substring(2, 42)}`,
            chain,
            type: tokenType,
            severity,
            score,
            price: Math.random() * 1000,
            liquidity: Math.random() * 10000000,
            volatility: Math.random(),
            lastSeen: Date.now() - (index * 60000),
            activityCount: 1,
            holderConcentration: Math.random(),
            manipulationSignal: score
          })
        }

        initialActivities.push({
          id: `init-activity-${index}`,
          timestamp: Date.now() - (index * 60000),
          type: alertType,
          severity,
          message: `${alertType} detected for ${tokenSymbol}`,
          chain,
          value: Math.random() * 100000,
          wallet: `0x${Math.random().toString(16).substring(2, 10)}...`
        })
      })

      setTokens(initialTokens)
      setActivities(initialActivities.slice(0, 100))

      if (initialTokens.size > 0) {
        const firstToken = Array.from(initialTokens.values())[0]
        setSelectedToken(firstToken)
      }
    }
  }, [alertHistory])

  const filteredTokens = useMemo(() => {
    const tokensArray = Array.from(tokens.values())
    
    if (!searchQuery.trim()) return tokensArray

    const query = searchQuery.toLowerCase()
    return tokensArray.filter(token => 
      token.symbol.toLowerCase().includes(query) ||
      token.name?.toLowerCase().includes(query) ||
      token.address.toLowerCase().includes(query) ||
      token.chain.toLowerCase().includes(query)
    )
  }, [tokens, searchQuery])

  const tokenActivities = useMemo(() => {
    if (!selectedToken) return []
    return activities.filter(activity => 
      activity.message.includes(selectedToken.symbol) ||
      activity.chain === selectedToken.chain
    ).slice(0, 20)
  }, [selectedToken, activities])

  const handleSelectToken = (token: Token) => {
    setSelectedToken(token)
    addToRecentlyViewed(token.id)
  }

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - timestamp
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  const handlePredictPriceDirection = async () => {
    if (!selectedToken) return
    
    setPriceDirectionLoading(true)
    setPriceDirectionPrediction(null)
    
    const tokenData = {
      symbol: selectedToken.symbol,
      chain: selectedToken.chain,
      price: selectedToken.price || 0,
      liquidity: selectedToken.liquidity || 0,
      volatility: selectedToken.volatility || 0
    }
    
    const result = await predictClient.predictToken(tokenData)
    setPriceDirectionPrediction(result)
    setPriceDirectionLoading(false)
  }

  const handlePredictConfidence = async () => {
    if (!selectedToken) return
    
    setConfidenceLoading(true)
    setConfidencePrediction(null)
    
    const tokenData = {
      symbol: selectedToken.symbol,
      chain: selectedToken.chain,
      price: selectedToken.price || 0,
      liquidity: selectedToken.liquidity || 0,
      volatility: selectedToken.volatility || 0
    }
    
    const result = await predictClient.predictToken(tokenData)
    setConfidencePrediction(result)
    setConfidenceLoading(false)
  }

  const handlePredictVolatility = async () => {
    if (!selectedToken) return
    
    setVolatilityLoading(true)
    setVolatilityPrediction(null)
    
    const tokenData = {
      symbol: selectedToken.symbol,
      chain: selectedToken.chain,
      price: selectedToken.price || 0,
      liquidity: selectedToken.liquidity || 0,
      volatility: selectedToken.volatility || 0
    }
    
    const result = await predictClient.predictToken(tokenData)
    setVolatilityPrediction(result)
    setVolatilityLoading(false)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <TerminalBackButton className="mb-4" />
          <div>
          <h1 className="text-3xl font-bold text-cyan-400">Token Explorer</h1>
          <p className="text-sm text-gray-400">Token intelligence and price predictions</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          connectionStatus === 'connected' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`} />
          <span className="text-xs font-medium">
            {connectionStatus === 'connected' ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left: Token Search & Recent */}
        <div className="w-80 flex flex-col gap-4 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-slate-900/50 border border-cyan-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Recently Viewed</h3>
              <div className="space-y-1">
                {recentlyViewed.slice(0, 5).map(tokenId => {
                  const token = tokens.get(tokenId)
                  if (!token) return null
                  const config = tokenConfig[token.type]
                  return (
                    <button
                      key={tokenId}
                      onClick={() => handleSelectToken(token)}
                      className="w-full text-left px-2 py-1 rounded hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{config.icon}</span>
                        <span className="text-xs text-cyan-400 font-bold">
                          {token.symbol}
                        </span>
                        <span className="text-xs text-gray-500">
                          {token.chain}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Token List */}
          <div className="flex-1 bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-cyan-500/20">
              <h3 className="text-sm font-semibold text-gray-300">
                Tokens ({filteredTokens.length})
              </h3>
            </div>
            <div className="overflow-y-auto h-full">
              {filteredTokens.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No tokens found
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredTokens.map(token => {
                    const config = tokenConfig[token.type]
                    const isSelected = selectedToken?.id === token.id
                    return (
                      <button
                        key={token.id}
                        onClick={() => handleSelectToken(token)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 border border-cyan-500/50'
                            : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/50 hover:border-cyan-500/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-lg flex-shrink-0">{config.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-cyan-400">
                                  {token.symbol}
                                </span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  token.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                                  token.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {token.severity.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                                  {token.chain}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {token.activityCount} events
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle: Token Dossier */}
        {selectedToken ? (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex-1 bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-y-auto p-6 space-y-6">
              {/* Token Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{tokenConfig[selectedToken.type].icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-cyan-400">
                        {selectedToken.symbol}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {selectedToken.name || 'Unknown Token'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span 
                      className="px-3 py-1 rounded text-sm font-medium"
                      style={{ 
                        backgroundColor: `${tokenConfig[selectedToken.type].color}20`,
                        color: tokenConfig[selectedToken.type].color
                      }}
                    >
                      {tokenConfig[selectedToken.type].label}
                    </span>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      selectedToken.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                      selectedToken.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {selectedToken.severity.toUpperCase()} RISK
                    </span>
                  </div>
                </div>

                {/* Metadata Overview */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Address:</span>
                    <span className="text-cyan-400 ml-2 font-mono text-xs">
                      {selectedToken.address.substring(0, 10)}...{selectedToken.address.substring(selectedToken.address.length - 8)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Chain:</span>
                    <span className="text-cyan-400 ml-2 font-medium">
                      {selectedToken.chain}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Latest Price:</span>
                    <span className="text-cyan-400 ml-2 font-medium">
                      ${selectedToken.price?.toFixed(4) || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Last Seen:</span>
                    <span className="text-cyan-400 ml-2 font-medium">
                      {formatTimestamp(selectedToken.lastSeen)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Liquidity:</span>
                    <span className="text-cyan-400 ml-2 font-medium">
                      ${selectedToken.liquidity?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Volatility:</span>
                    <span className="text-cyan-400 ml-2 font-medium">
                      {((selectedToken.volatility || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Token Behavioral Indicators */}
              <div>
                <h3 className="text-lg font-bold text-cyan-400 mb-3">Behavioral Indicators</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Volatility Score</span>
                      <span className="text-cyan-400 font-bold">
                        {((selectedToken.volatility || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          (selectedToken.volatility || 0) >= 0.7 ? 'bg-red-500' :
                          (selectedToken.volatility || 0) >= 0.4 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(selectedToken.volatility || 0) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Liquidity Score</span>
                      <span className="text-cyan-400 font-bold">
                        {Math.min(((selectedToken.liquidity || 0) / 10000000) * 100, 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${Math.min(((selectedToken.liquidity || 0) / 10000000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Holder Concentration</span>
                      <span className="text-cyan-400 font-bold">
                        {(selectedToken.holderConcentration * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          selectedToken.holderConcentration >= 0.7 ? 'bg-red-500' :
                          selectedToken.holderConcentration >= 0.4 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${selectedToken.holderConcentration * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Manipulation Signal</span>
                      <span className="text-cyan-400 font-bold">
                        {(selectedToken.manipulationSignal * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          selectedToken.manipulationSignal >= 0.7 ? 'bg-red-500' :
                          selectedToken.manipulationSignal >= 0.4 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${selectedToken.manipulationSignal * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Token Activity Timeline */}
              <div>
                <h3 className="text-lg font-bold text-cyan-400 mb-3">Activity Timeline</h3>
                {tokenActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No activities recorded
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tokenActivities.map(activity => (
                      <div
                        key={activity.id}
                        className="bg-slate-800/50 border border-cyan-500/10 rounded p-3 hover:border-cyan-500/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                activity.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                                activity.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {activity.severity.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(activity.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300">{activity.message}</p>
                            <div className="flex gap-3 mt-2 text-xs">
                              {activity.chain && (
                                <span className="text-gray-400">
                                  Chain: <span className="text-cyan-400">{activity.chain}</span>
                                </span>
                              )}
                              {activity.value && (
                                <span className="text-gray-400">
                                  Value: <span className="text-cyan-400">${activity.value.toLocaleString()}</span>
                                </span>
                              )}
                              {activity.wallet && (
                                <span className="text-gray-400">
                                  Wallet: <span className="text-cyan-400 font-mono">{activity.wallet}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-900/50 border border-cyan-500/20 rounded-lg">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500 text-lg">Select a token to view details</p>
            </div>
          </div>
        )}

        {/* Right: AI Prediction Tools */}
        {selectedToken && (
          <div className="w-80 space-y-4 overflow-y-auto">
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-3">🤖 AI Predictions</h3>
              <div className="space-y-3">
                {/* Predict Price Direction Button */}
                <button
                  onClick={handlePredictPriceDirection}
                  disabled={priceDirectionLoading}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {priceDirectionLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    'Predict Price Direction'
                  )}
                </button>

                {/* Price Direction Result */}
                {priceDirectionPrediction && (
                  <div className={`p-4 rounded-lg border animate-pulse ${
                    priceDirectionPrediction.success 
                      ? 'bg-slate-800/50 border-cyan-500/30' 
                      : 'bg-red-900/20 border-red-500/50'
                  }`} style={{ animationDuration: '3s', animationIterationCount: '1' }}>
                    {priceDirectionPrediction.success ? (
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-cyan-400">Price Direction</h5>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Direction:</span>
                            <span className={`px-2 py-1 rounded font-bold ${
                              priceDirectionPrediction.direction === 'up' ? 'bg-green-500/20 text-green-400' :
                              priceDirectionPrediction.direction === 'down' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {priceDirectionPrediction.direction?.toUpperCase() || 'FLAT'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Confidence:</span>
                            <span className="text-cyan-400 font-bold">
                              {((priceDirectionPrediction.confidence || 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Score:</span>
                            <span className="text-cyan-400 font-bold">
                              {priceDirectionPrediction.risk_score?.toFixed(3) || 'N/A'}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-cyan-500/20">
                            <span className="text-gray-400">Model: </span>
                            <span className="text-cyan-400">
                              {priceDirectionPrediction.model_name} v{priceDirectionPrediction.version}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-400 text-sm">
                        <span className="font-semibold">Error:</span> {priceDirectionPrediction.error}
                      </div>
                    )}
                  </div>
                )}

                {/* Predict Confidence Button */}
                <button
                  onClick={handlePredictConfidence}
                  disabled={confidenceLoading}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {confidenceLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    'Predict Confidence'
                  )}
                </button>

                {/* Confidence Result */}
                {confidencePrediction && (
                  <div className={`p-4 rounded-lg border animate-pulse ${
                    confidencePrediction.success 
                      ? 'bg-slate-800/50 border-cyan-500/30' 
                      : 'bg-red-900/20 border-red-500/50'
                  }`} style={{ animationDuration: '3s', animationIterationCount: '1' }}>
                    {confidencePrediction.success ? (
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold text-cyan-400">Confidence Analysis</h5>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-400">Confidence</span>
                            <span className="text-cyan-400 font-bold">
                              {((confidencePrediction.confidence || 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                (confidencePrediction.confidence || 0) >= 0.7 ? 'bg-green-500' :
                                (confidencePrediction.confidence || 0) >= 0.4 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${(confidencePrediction.confidence || 0) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Classification:</span>
                          <span className={`px-2 py-1 rounded font-bold ${
                            confidencePrediction.classification === 'high' ? 'bg-green-500/20 text-green-400' :
                            confidencePrediction.classification === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {confidencePrediction.classification?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-cyan-500/20 text-xs">
                          <span className="text-gray-400">Model: </span>
                          <span className="text-cyan-400">
                            {confidencePrediction.model_name} v{confidencePrediction.version}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-400 text-sm">
                        <span className="font-semibold">Error:</span> {confidencePrediction.error}
                      </div>
                    )}
                  </div>
                )}

                {/* Predict Volatility Risk Button */}
                <button
                  onClick={handlePredictVolatility}
                  disabled={volatilityLoading}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {volatilityLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    'Predict Volatility Risk'
                  )}
                </button>

                {/* Volatility Result */}
                {volatilityPrediction && (
                  <div className={`p-4 rounded-lg border animate-pulse ${
                    volatilityPrediction.success 
                      ? 'bg-slate-800/50 border-cyan-500/30' 
                      : 'bg-red-900/20 border-red-500/50'
                  }`} style={{ animationDuration: '3s', animationIterationCount: '1' }}>
                    {volatilityPrediction.success ? (
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-cyan-400">Volatility Risk</h5>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Volatility Score:</span>
                            <span className="text-cyan-400 font-bold">
                              {(1 - (volatilityPrediction.confidence || 0)).toFixed(3)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Classification:</span>
                            <span className={`px-2 py-1 rounded font-bold ${
                              (1 - (volatilityPrediction.confidence || 0)) >= 0.7 ? 'bg-red-500/20 text-red-400' :
                              (1 - (volatilityPrediction.confidence || 0)) >= 0.4 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {(1 - (volatilityPrediction.confidence || 0)) >= 0.7 ? 'HIGH' :
                               (1 - (volatilityPrediction.confidence || 0)) >= 0.4 ? 'MEDIUM' : 'LOW'}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-cyan-500/20">
                            <span className="text-gray-400">Model: </span>
                            <span className="text-cyan-400">
                              {volatilityPrediction.model_name} v{volatilityPrediction.version}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-400 text-sm">
                        <span className="font-semibold">Error:</span> {volatilityPrediction.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
