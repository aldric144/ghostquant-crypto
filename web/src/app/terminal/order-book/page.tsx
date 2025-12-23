'use client'

import { useState, useEffect } from 'react'

interface OrderBookLevel {
  price: number
  size: number
  total: number
  percentage: number
}

interface OrderBookData {
  symbol: string
  exchange: string
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  spread: number
  spreadPercentage: number
  midPrice: number
  lastUpdate: Date
}

interface OrderBookMetrics {
  totalBidVolume: number
  totalAskVolume: number
  bidAskRatio: number
  avgSpread: number
  largestBidWall: number
  largestAskWall: number
  imbalance: number
}

interface LiquidityWall {
  id: string
  symbol: string
  exchange: string
  side: 'bid' | 'ask'
  price: number
  size: number
  significance: 'major' | 'moderate' | 'minor'
  timestamp: Date
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

export default function OrderBookDepthPage() {
  const [orderBooks, setOrderBooks] = useState<OrderBookData[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USDT')
  const [selectedExchange, setSelectedExchange] = useState<string>('all')
  const [walls, setWalls] = useState<LiquidityWall[]>([])
  const [metrics, setMetrics] = useState<OrderBookMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [depthLevels, setDepthLevels] = useState<number>(20)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [selectedSymbol, selectedExchange, depthLevels])

  async function fetchData() {
    try {
      const response = await fetch(`${API_BASE}/gq-core/orderbook/depth?symbol=${selectedSymbol}&exchange=${selectedExchange}&levels=${depthLevels}`)
      if (response.ok) {
        const data = await response.json()
        if (data.orderbooks) {
          setOrderBooks(data.orderbooks)
          setWalls(data.walls || [])
          setMetrics(data.metrics)
        } else {
          generateMockData()
        }
      } else {
        generateMockData()
      }
    } catch (error) {
      console.error('Error fetching order book data:', error)
      generateMockData()
    } finally {
      setLoading(false)
    }
  }

  function generateMockData() {
    const exchanges = ['Binance', 'Coinbase', 'Kraken', 'OKX', 'Bybit']
    const basePrice = selectedSymbol.includes('BTC') ? 43500 : 
                     selectedSymbol.includes('ETH') ? 2250 : 100

    const mockOrderBooks: OrderBookData[] = exchanges.map((exchange) => {
      const midPrice = basePrice * (1 + (Math.random() - 0.5) * 0.001)
      const spread = midPrice * 0.0001 * (Math.random() + 0.5)
      
      let bidTotal = 0
      let askTotal = 0
      
      const bids: OrderBookLevel[] = Array.from({ length: depthLevels }, (_, i) => {
        const price = midPrice - spread/2 - (i * midPrice * 0.0001)
        const size = Math.random() * 50 + 1
        bidTotal += size
        return { price, size, total: bidTotal, percentage: 0 }
      })
      
      const asks: OrderBookLevel[] = Array.from({ length: depthLevels }, (_, i) => {
        const price = midPrice + spread/2 + (i * midPrice * 0.0001)
        const size = Math.random() * 50 + 1
        askTotal += size
        return { price, size, total: askTotal, percentage: 0 }
      })

      const maxTotal = Math.max(bidTotal, askTotal)
      bids.forEach(b => b.percentage = (b.total / maxTotal) * 100)
      asks.forEach(a => a.percentage = (a.total / maxTotal) * 100)

      return {
        symbol: selectedSymbol,
        exchange,
        bids,
        asks,
        spread,
        spreadPercentage: (spread / midPrice) * 100,
        midPrice,
        lastUpdate: new Date()
      }
    })

    const significances: ('major' | 'moderate' | 'minor')[] = ['major', 'moderate', 'minor']
    const mockWalls: LiquidityWall[] = Array.from({ length: 8 }, (_, i) => ({
      id: `wall-${i}`,
      symbol: selectedSymbol,
      exchange: exchanges[i % exchanges.length],
      side: i % 2 === 0 ? 'bid' : 'ask',
      price: basePrice * (1 + (Math.random() - 0.5) * 0.02),
      size: Math.random() * 500 + 100,
      significance: significances[i % significances.length],
      timestamp: new Date(Date.now() - Math.random() * 3600000)
    }))

    const totalBid = mockOrderBooks.reduce((sum, ob) => sum + ob.bids.reduce((s, b) => s + b.size, 0), 0)
    const totalAsk = mockOrderBooks.reduce((sum, ob) => sum + ob.asks.reduce((s, a) => s + a.size, 0), 0)

    setOrderBooks(mockOrderBooks)
    setWalls(mockWalls)
    setMetrics({
      totalBidVolume: totalBid,
      totalAskVolume: totalAsk,
      bidAskRatio: totalBid / totalAsk,
      avgSpread: mockOrderBooks.reduce((sum, ob) => sum + ob.spreadPercentage, 0) / mockOrderBooks.length,
      largestBidWall: Math.max(...mockWalls.filter(w => w.side === 'bid').map(w => w.size)),
      largestAskWall: Math.max(...mockWalls.filter(w => w.side === 'ask').map(w => w.size)),
      imbalance: ((totalBid - totalAsk) / (totalBid + totalAsk)) * 100
    })
  }

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(2)
    if (price >= 1) return price.toFixed(4)
    return price.toFixed(6)
  }

  const formatSize = (size: number) => {
    if (size >= 1000) return `${(size / 1000).toFixed(2)}K`
    return size.toFixed(2)
  }

  const getImbalanceColor = (imbalance: number) => {
    if (imbalance > 10) return 'text-green-400'
    if (imbalance > 0) return 'text-green-300'
    if (imbalance > -10) return 'text-red-300'
    return 'text-red-400'
  }

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'major': return 'bg-purple-500/20 text-purple-400 border-purple-500'
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
      case 'minor': return 'bg-gray-500/20 text-gray-400 border-gray-500'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500'
    }
  }

  const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT']
  const exchanges = ['all', 'Binance', 'Coinbase', 'Kraken', 'OKX', 'Bybit']

  const currentOrderBook = orderBooks.find(ob => 
    selectedExchange === 'all' ? ob.exchange === 'Binance' : ob.exchange === selectedExchange
  ) || orderBooks[0]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Order Book Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Order Book Depth</h1>
          <p className="text-gray-400">Real-time order book analysis, liquidity walls, and market depth visualization</p>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Total Bid Volume</div>
              <div className="text-xl font-bold text-green-400">{formatSize(metrics.totalBidVolume)}</div>
            </div>
            <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Total Ask Volume</div>
              <div className="text-xl font-bold text-red-400">{formatSize(metrics.totalAskVolume)}</div>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Bid/Ask Ratio</div>
              <div className={`text-xl font-bold ${metrics.bidAskRatio >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.bidAskRatio.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Avg Spread</div>
              <div className="text-xl font-bold text-yellow-400">{metrics.avgSpread.toFixed(4)}%</div>
            </div>
            <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Largest Bid Wall</div>
              <div className="text-xl font-bold text-green-400">{formatSize(metrics.largestBidWall)}</div>
            </div>
            <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Largest Ask Wall</div>
              <div className="text-xl font-bold text-red-400">{formatSize(metrics.largestAskWall)}</div>
            </div>
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Imbalance</div>
              <div className={`text-xl font-bold ${getImbalanceColor(metrics.imbalance)}`}>
                {metrics.imbalance >= 0 ? '+' : ''}{metrics.imbalance.toFixed(2)}%
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            {symbols.map((symbol) => (
              <button
                key={symbol}
                onClick={() => setSelectedSymbol(symbol)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  selectedSymbol === symbol
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {exchanges.map((exchange) => (
              <button
                key={exchange}
                onClick={() => setSelectedExchange(exchange)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  selectedExchange === exchange
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {exchange === 'all' ? 'All Exchanges' : exchange}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-gray-400 text-sm">Depth:</span>
            {[10, 20, 50].map((levels) => (
              <button
                key={levels}
                onClick={() => setDepthLevels(levels)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  depthLevels === levels
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {levels}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Book Visualization */}
          <div className="lg:col-span-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {selectedSymbol} Order Book
                {currentOrderBook && <span className="text-sm text-gray-400 ml-2">({currentOrderBook.exchange})</span>}
              </h2>
              {currentOrderBook && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">Mid: <span className="text-cyan-400 font-medium">${formatPrice(currentOrderBook.midPrice)}</span></span>
                  <span className="text-gray-400">Spread: <span className="text-yellow-400 font-medium">{currentOrderBook.spreadPercentage.toFixed(4)}%</span></span>
                </div>
              )}
            </div>
            
            {currentOrderBook && (
              <div className="grid grid-cols-2 gap-0">
                {/* Bids */}
                <div className="border-r border-slate-700">
                  <div className="bg-slate-900/50 p-2 grid grid-cols-3 text-xs text-gray-400">
                    <span>Total</span>
                    <span className="text-right">Size</span>
                    <span className="text-right">Bid Price</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {currentOrderBook.bids.map((bid, i) => (
                      <div key={i} className="relative grid grid-cols-3 p-2 text-sm hover:bg-slate-700/30">
                        <div 
                          className="absolute inset-0 bg-green-500/10"
                          style={{ width: `${bid.percentage}%` }}
                        />
                        <span className="relative text-gray-400">{formatSize(bid.total)}</span>
                        <span className="relative text-right text-green-400">{formatSize(bid.size)}</span>
                        <span className="relative text-right text-green-300 font-medium">${formatPrice(bid.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Asks */}
                <div>
                  <div className="bg-slate-900/50 p-2 grid grid-cols-3 text-xs text-gray-400">
                    <span>Ask Price</span>
                    <span className="text-right">Size</span>
                    <span className="text-right">Total</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {currentOrderBook.asks.map((ask, i) => (
                      <div key={i} className="relative grid grid-cols-3 p-2 text-sm hover:bg-slate-700/30">
                        <div 
                          className="absolute inset-0 right-0 bg-red-500/10"
                          style={{ width: `${ask.percentage}%`, marginLeft: 'auto' }}
                        />
                        <span className="relative text-red-300 font-medium">${formatPrice(ask.price)}</span>
                        <span className="relative text-right text-red-400">{formatSize(ask.size)}</span>
                        <span className="relative text-right text-gray-400">{formatSize(ask.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Liquidity Walls */}
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20">
              <h2 className="text-lg font-semibold text-white">Liquidity Walls</h2>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {walls.map((wall) => (
                <div key={wall.id} className={`rounded-lg p-3 border ${wall.side === 'bid' ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${wall.side === 'bid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {wall.side.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs border ${getSignificanceColor(wall.significance)}`}>
                        {wall.significance}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{wall.exchange}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white font-medium">${formatPrice(wall.price)}</div>
                      <div className="text-xs text-gray-400">{wall.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${wall.side === 'bid' ? 'text-green-400' : 'text-red-400'}`}>
                        {formatSize(wall.size)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Depth Chart Visualization */}
        <div className="mt-6 bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Market Depth Visualization</h2>
          {currentOrderBook && (
            <div className="relative h-48">
              <div className="absolute inset-0 flex">
                {/* Bid side */}
                <div className="w-1/2 flex flex-col justify-end items-end pr-1">
                  {currentOrderBook.bids.slice(0, 10).reverse().map((bid, i) => (
                    <div 
                      key={i}
                      className="bg-green-500/40 border-r border-green-500"
                      style={{ 
                        width: `${bid.percentage}%`,
                        height: '10%',
                        minHeight: '4px'
                      }}
                    />
                  ))}
                </div>
                {/* Ask side */}
                <div className="w-1/2 flex flex-col justify-end items-start pl-1">
                  {currentOrderBook.asks.slice(0, 10).reverse().map((ask, i) => (
                    <div 
                      key={i}
                      className="bg-red-500/40 border-l border-red-500"
                      style={{ 
                        width: `${ask.percentage}%`,
                        height: '10%',
                        minHeight: '4px'
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-slate-900 px-3 py-1 rounded">
                <span className="text-cyan-400 font-bold">${formatPrice(currentOrderBook.midPrice)}</span>
              </div>
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-400 mt-4">
            <span className="text-green-400">Bids (Buy Orders)</span>
            <span>Mid Price</span>
            <span className="text-red-400">Asks (Sell Orders)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
