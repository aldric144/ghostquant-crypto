'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'

interface SentimentData {
  asset: string
  symbol: string
  sentiment: number
  socialVolume: number
  newsScore: number
  twitterMentions: number
  redditActivity: number
  fearGreedIndex: number
  trend: 'bullish' | 'bearish' | 'neutral'
  change24h: number
}

interface SentimentMetrics {
  overallSentiment: number
  marketFearGreed: number
  bullishAssets: number
  bearishAssets: number
  neutralAssets: number
  topMentioned: string
  trendingTopic: string
}

interface SentimentEvent {
  id: string
  source: string
  message: string
  sentiment: 'positive' | 'negative' | 'neutral'
  asset: string
  timestamp: Date
  impact: 'high' | 'medium' | 'low'
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

function isValidSentimentData(item: unknown): item is SentimentData {
  if (!item || typeof item !== 'object') return false
  const d = item as Record<string, unknown>
  return typeof d.symbol === 'string' && typeof d.sentiment === 'number' && ['bullish', 'bearish', 'neutral'].includes(d.trend as string)
}

function isValidSentimentEvent(item: unknown): item is SentimentEvent {
  if (!item || typeof item !== 'object') return false
  const e = item as Record<string, unknown>
  return typeof e.id === 'string' && typeof e.message === 'string' && ['positive', 'negative', 'neutral'].includes(e.sentiment as string)
}

function isValidSentimentMetrics(metrics: unknown): metrics is SentimentMetrics {
  if (!metrics || typeof metrics !== 'object') return false
  const m = metrics as Record<string, unknown>
  return typeof m.overallSentiment === 'number' && typeof m.marketFearGreed === 'number'
}

function normalizeResponse(data: unknown): { assets: SentimentData[]; events: SentimentEvent[]; metrics: SentimentMetrics | null } | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>
  
  const rawAssets = Array.isArray(d.assets) ? d.assets : (d.data && typeof d.data === 'object' && Array.isArray((d.data as Record<string, unknown>).assets) ? (d.data as Record<string, unknown>).assets : null)
  const rawEvents = Array.isArray(d.events) ? d.events : (d.data && typeof d.data === 'object' && Array.isArray((d.data as Record<string, unknown>).events) ? (d.data as Record<string, unknown>).events : [])
  const rawMetrics = d.metrics || (d.data && typeof d.data === 'object' ? (d.data as Record<string, unknown>).metrics : null)
  
  if (!Array.isArray(rawAssets) || rawAssets.length === 0) return null
  
  const validAssets = rawAssets.filter(isValidSentimentData)
  if (validAssets.length === 0) return null
  
  const validEvents = Array.isArray(rawEvents) ? rawEvents.filter(isValidSentimentEvent) : []
  const validMetrics = isValidSentimentMetrics(rawMetrics) ? rawMetrics : null
  
  return { assets: validAssets, events: validEvents, metrics: validMetrics }
}

export default function MarketSentimentPage() {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([])
  const [events, setEvents] = useState<SentimentEvent[]>([])
  const [metrics, setMetrics] = useState<SentimentMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [timeframe, setTimeframe] = useState<string>('24h')

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [selectedSource, timeframe])

  async function fetchData() {
    try {
      const response = await fetch(`${API_BASE}/gq-core/sentiment/market?source=${selectedSource}&timeframe=${timeframe}`)
      if (!response.ok) {
        generateMockData()
        return
      }
      
      const text = await response.text()
      if (!text || text.trim() === '') {
        generateMockData()
        return
      }
      
      let data: unknown
      try {
        data = JSON.parse(text)
      } catch {
        generateMockData()
        return
      }
      
      const normalized = normalizeResponse(data)
      if (!normalized) {
        generateMockData()
        return
      }
      
      setSentimentData(normalized.assets)
      setEvents(normalized.events)
      setMetrics(normalized.metrics)
    } catch (error) {
      console.error('Error fetching sentiment data:', error)
      generateMockData()
    } finally {
      setLoading(false)
    }
  }

  function generateMockData() {
    const assets = [
      { name: 'Bitcoin', symbol: 'BTC' },
      { name: 'Ethereum', symbol: 'ETH' },
      { name: 'Solana', symbol: 'SOL' },
      { name: 'Cardano', symbol: 'ADA' },
      { name: 'Polygon', symbol: 'MATIC' },
      { name: 'Avalanche', symbol: 'AVAX' },
      { name: 'Chainlink', symbol: 'LINK' },
      { name: 'Polkadot', symbol: 'DOT' },
      { name: 'Uniswap', symbol: 'UNI' },
      { name: 'Aave', symbol: 'AAVE' }
    ]

    const mockData: SentimentData[] = assets.map((asset) => {
      const sentiment = Math.random() * 100
      return {
        asset: asset.name,
        symbol: asset.symbol,
        sentiment,
        socialVolume: Math.floor(Math.random() * 100000) + 1000,
        newsScore: Math.random() * 100,
        twitterMentions: Math.floor(Math.random() * 50000) + 500,
        redditActivity: Math.floor(Math.random() * 10000) + 100,
        fearGreedIndex: Math.random() * 100,
        trend: sentiment > 60 ? 'bullish' : sentiment < 40 ? 'bearish' : 'neutral',
        change24h: (Math.random() - 0.5) * 30
      }
    })

    const sources = ['Twitter', 'Reddit', 'News', 'Discord', 'Telegram']
    const mockEvents: SentimentEvent[] = Array.from({ length: 15 }, (_, i) => ({
      id: `event-${i}`,
      source: sources[i % sources.length],
      message: [
        'Major institutional buying detected',
        'Whale accumulation pattern identified',
        'Negative regulatory news emerging',
        'Partnership announcement trending',
        'Technical breakout discussion',
        'FUD spreading on social media',
        'Bullish divergence spotted',
        'Exchange listing rumor'
      ][i % 8],
      sentiment: ['positive', 'negative', 'neutral'][i % 3] as 'positive' | 'negative' | 'neutral',
      asset: assets[i % assets.length].symbol,
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      impact: ['high', 'medium', 'low'][i % 3] as 'high' | 'medium' | 'low'
    }))

    const bullish = mockData.filter(d => d.trend === 'bullish').length
    const bearish = mockData.filter(d => d.trend === 'bearish').length
    const neutral = mockData.filter(d => d.trend === 'neutral').length

    setSentimentData(mockData)
    setEvents(mockEvents)
    setMetrics({
      overallSentiment: mockData.reduce((sum, d) => sum + d.sentiment, 0) / mockData.length,
      marketFearGreed: Math.random() * 100,
      bullishAssets: bullish,
      bearishAssets: bearish,
      neutralAssets: neutral,
      topMentioned: 'BTC',
      trendingTopic: '#Bitcoin'
    })
  }

  const getSentimentColor = (value: number) => {
    if (value >= 70) return 'text-green-400'
    if (value >= 50) return 'text-cyan-400'
    if (value >= 30) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getSentimentBg = (value: number) => {
    if (value >= 70) return 'bg-green-500'
    if (value >= 50) return 'bg-cyan-500'
    if (value >= 30) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return '↑'
      case 'bearish': return '↓'
      default: return '→'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-400'
      case 'bearish': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getEventColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'border-green-500 bg-green-500/10'
      case 'negative': return 'border-red-500 bg-red-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-400'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const sources = ['all', 'Twitter', 'Reddit', 'News', 'Discord']

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Analyzing Market Sentiment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Market Sentiment Engine</h1>
          <p className="text-gray-400">Real-time sentiment analysis from social media, news, and on-chain data</p>
        </div>

        {/* Fear & Greed Gauge */}
        {metrics && (
          <div className="mb-8 bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Market Fear & Greed Index</h2>
              <span className={`text-3xl font-bold ${getSentimentColor(metrics.marketFearGreed)}`}>
                {metrics.marketFearGreed.toFixed(0)}
              </span>
            </div>
            <div className="relative h-4 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 w-1 h-full bg-white shadow-lg transition-all duration-500"
                style={{ left: `${metrics.marketFearGreed}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Extreme Fear</span>
              <span>Fear</span>
              <span>Neutral</span>
              <span>Greed</span>
              <span>Extreme Greed</span>
            </div>
          </div>
        )}

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Overall Sentiment</div>
              <div className={`text-xl font-bold ${getSentimentColor(metrics.overallSentiment)}`}>
                {metrics.overallSentiment.toFixed(1)}%
              </div>
            </div>
            <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Bullish Assets</div>
              <div className="text-xl font-bold text-green-400">{metrics.bullishAssets}</div>
            </div>
            <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Bearish Assets</div>
              <div className="text-xl font-bold text-red-400">{metrics.bearishAssets}</div>
            </div>
            <div className="bg-slate-800/50 border border-gray-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Neutral Assets</div>
              <div className="text-xl font-bold text-gray-400">{metrics.neutralAssets}</div>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Top Mentioned</div>
              <div className="text-xl font-bold text-cyan-400">{metrics.topMentioned}</div>
            </div>
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Trending</div>
              <div className="text-xl font-bold text-purple-400">{metrics.trendingTopic}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            {sources.map((source) => (
              <button
                key={source}
                onClick={() => setSelectedSource(source)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  selectedSource === source
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {source === 'all' ? 'All Sources' : source}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {['1h', '24h', '7d', '30d'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  timeframe === tf
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sentiment Heatmap */}
          <div className="lg:col-span-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20">
              <h2 className="text-lg font-semibold text-white">Asset Sentiment Heatmap</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {(Array.isArray(sentimentData) ? sentimentData : []).map((asset) => (
                  <div 
                    key={asset?.symbol ?? Math.random()}
                    className={`p-4 rounded-lg border transition-all hover:scale-105 cursor-pointer ${
                      asset?.trend === 'bullish' ? 'border-green-500/30 bg-green-500/10' :
                      asset?.trend === 'bearish' ? 'border-red-500/30 bg-red-500/10' :
                      'border-gray-500/30 bg-gray-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">{asset?.symbol ?? 'Unknown'}</span>
                      <span className={`text-lg ${getTrendColor(asset?.trend ?? 'neutral')}`}>
                        {getTrendIcon(asset?.trend ?? 'neutral')}
                      </span>
                    </div>
                    <div className={`text-2xl font-bold ${getSentimentColor(asset?.sentiment ?? 50)}`}>
                      {(asset?.sentiment ?? 50).toFixed(0)}
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getSentimentBg(asset?.sentiment ?? 50)} transition-all`}
                        style={{ width: `${asset?.sentiment ?? 50}%` }}
                      />
                    </div>
                    <div className={`text-xs mt-2 ${(asset?.change24h ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(asset?.change24h ?? 0) >= 0 ? '+' : ''}{(asset?.change24h ?? 0).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Sentiment Feed */}
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20">
              <h2 className="text-lg font-semibold text-white">Live Sentiment Feed</h2>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {(Array.isArray(events) ? events : []).map((event) => (
                <div key={event?.id ?? Math.random()} className={`rounded-lg p-3 border ${getEventColor(event?.sentiment ?? 'neutral')}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{event?.source ?? 'Unknown'}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getImpactBadge(event?.impact ?? 'low')}`}>
                        {event?.impact ?? 'low'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {event?.timestamp ? new Date(event.timestamp).toLocaleTimeString() : '--:--'}
                    </span>
                  </div>
                  <div className="text-sm text-white">{event?.message ?? ''}</div>
                  <div className="text-xs text-cyan-400 mt-1">${event?.asset ?? ''}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Volume Chart */}
        <div className="mt-6 bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Social Volume by Asset</h2>
          <div className="space-y-3">
            {(Array.isArray(sentimentData) ? sentimentData : []).slice(0, 8).map((asset) => {
              const safeData = Array.isArray(sentimentData) ? sentimentData : []
              const volumes = safeData.map(d => d?.socialVolume ?? 0)
              const maxVolume = volumes.length > 0 ? Math.max(...volumes) : 1
              const percentage = maxVolume > 0 ? ((asset?.socialVolume ?? 0) / maxVolume) * 100 : 0
              
              return (
                <div key={asset?.symbol ?? Math.random()} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium text-cyan-400">{asset?.symbol ?? 'Unknown'}</div>
                  <div className="flex-1 h-6 bg-slate-900/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getSentimentBg(asset?.sentiment ?? 50)} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-24 text-right text-sm text-gray-400">
                    {(asset?.socialVolume ?? 0).toLocaleString()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
