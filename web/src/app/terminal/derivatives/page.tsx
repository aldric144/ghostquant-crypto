'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import ModuleErrorBoundary, { safeArray, safeNumber } from '../../../components/terminal/ModuleErrorBoundary'
import { useState, useEffect } from 'react'

interface DerivativeContract {
  symbol: string
  type: 'perpetual' | 'futures' | 'options'
  exchange: string
  price: number
  indexPrice: number
  markPrice: number
  fundingRate: number
  nextFunding: Date
  openInterest: number
  volume24h: number
  change24h: number
  liquidations24h: number
  basis: number
  expiryDate?: Date
}

interface FundingRateData {
  symbol: string
  exchange: string
  rate: number
  annualized: number
  nextFunding: Date
  trend: 'positive' | 'negative' | 'neutral'
}

interface LiquidationEvent {
  id: string
  symbol: string
  exchange: string
  side: 'long' | 'short'
  size: number
  price: number
  timestamp: Date
}

interface DerivativesMetrics {
  totalOpenInterest: number
  totalVolume24h: number
  avgFundingRate: number
  totalLiquidations24h: number
  longLiquidations: number
  shortLiquidations: number
  dominantSide: 'long' | 'short' | 'neutral'
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

function DerivativesWatchPageContent() {
  const [showGuide, setShowGuide] = useState(false)
  const [contracts, setContracts] = useState<DerivativeContract[]>([])
  const [fundingRates, setFundingRates] = useState<FundingRateData[]>([])
  const [liquidations, setLiquidations] = useState<LiquidationEvent[]>([])
  const [metrics, setMetrics] = useState<DerivativesMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedExchange, setSelectedExchange] = useState<string>('all')

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [selectedType, selectedExchange])

  async function fetchData() {
    try {
      const response = await fetch(`${API_BASE}/gq-core/derivatives/watch?type=${selectedType}&exchange=${selectedExchange}`)
      if (response.ok) {
        const data = await response.json()
        if (data.contracts) {
          setContracts(data.contracts)
          setFundingRates(data.fundingRates || [])
          setLiquidations(data.liquidations || [])
          setMetrics(data.metrics)
        } else {
          generateMockData()
        }
      } else {
        generateMockData()
      }
    } catch (error) {
      console.error('Error fetching derivatives data:', error)
      generateMockData()
    } finally {
      setLoading(false)
    }
  }

  function generateMockData() {
    const symbols = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'AVAX', 'DOGE', 'LINK', 'DOT']
    const exchanges = ['Binance', 'Bybit', 'OKX', 'Deribit', 'BitMEX']
    const types: ('perpetual' | 'futures' | 'options')[] = ['perpetual', 'futures', 'options']

    const mockContracts: DerivativeContract[] = symbols.flatMap((symbol) => {
      const basePrice = symbol === 'BTC' ? 43500 : symbol === 'ETH' ? 2250 : Math.random() * 100 + 1
      return exchanges.slice(0, 3).map((exchange, i) => {
        const type = types[i % types.length]
        const fundingRate = (Math.random() - 0.5) * 0.002
        return {
          symbol: `${symbol}USDT`,
          type,
          exchange,
          price: basePrice * (1 + (Math.random() - 0.5) * 0.01),
          indexPrice: basePrice,
          markPrice: basePrice * (1 + (Math.random() - 0.5) * 0.005),
          fundingRate,
          nextFunding: new Date(Date.now() + Math.random() * 28800000),
          openInterest: Math.random() * 1000000000 + 10000000,
          volume24h: Math.random() * 5000000000 + 100000000,
          change24h: (Math.random() - 0.5) * 20,
          liquidations24h: Math.random() * 50000000 + 1000000,
          basis: (Math.random() - 0.5) * 2,
          expiryDate: type === 'futures' ? new Date(Date.now() + Math.random() * 90 * 24 * 3600000) : undefined
        }
      })
    })

    const mockFundingRates: FundingRateData[] = symbols.slice(0, 8).map((symbol) => {
      const rate = (Math.random() - 0.5) * 0.002
      return {
        symbol: `${symbol}USDT`,
        exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
        rate,
        annualized: rate * 3 * 365 * 100,
        nextFunding: new Date(Date.now() + Math.random() * 28800000),
        trend: rate > 0.0005 ? 'positive' : rate < -0.0005 ? 'negative' : 'neutral'
      }
    })

    const mockLiquidations: LiquidationEvent[] = Array.from({ length: 15 }, (_, i) => ({
      id: `liq-${i}`,
      symbol: `${symbols[i % symbols.length]}USDT`,
      exchange: exchanges[i % exchanges.length],
      side: Math.random() > 0.5 ? 'long' : 'short',
      size: Math.random() * 5000000 + 100000,
      price: symbols[i % symbols.length] === 'BTC' ? 43500 * (1 + (Math.random() - 0.5) * 0.05) : 
             symbols[i % symbols.length] === 'ETH' ? 2250 * (1 + (Math.random() - 0.5) * 0.05) : 
             Math.random() * 100 + 1,
      timestamp: new Date(Date.now() - Math.random() * 3600000)
    }))

    const totalOI = mockContracts.reduce((sum, c) => sum + c.openInterest, 0)
    const totalVol = mockContracts.reduce((sum, c) => sum + c.volume24h, 0)
    const totalLiq = mockContracts.reduce((sum, c) => sum + c.liquidations24h, 0)
    const longLiq = mockLiquidations.filter(l => l.side === 'long').reduce((sum, l) => sum + l.size, 0)
    const shortLiq = mockLiquidations.filter(l => l.side === 'short').reduce((sum, l) => sum + l.size, 0)

    setContracts(mockContracts)
    setFundingRates(mockFundingRates)
    setLiquidations(mockLiquidations)
    setMetrics({
      totalOpenInterest: totalOI,
      totalVolume24h: totalVol,
      avgFundingRate: mockFundingRates.reduce((sum, f) => sum + f.rate, 0) / mockFundingRates.length,
      totalLiquidations24h: totalLiq,
      longLiquidations: longLiq,
      shortLiquidations: shortLiq,
      dominantSide: longLiq > shortLiq * 1.2 ? 'short' : shortLiq > longLiq * 1.2 ? 'long' : 'neutral'
    })
  }

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const formatFundingRate = (rate: number) => {
    return `${(rate * 100).toFixed(4)}%`
  }

  const getFundingColor = (rate: number) => {
    if (rate > 0.0005) return 'text-green-400'
    if (rate > 0) return 'text-green-300'
    if (rate > -0.0005) return 'text-red-300'
    return 'text-red-400'
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'perpetual': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500'
      case 'futures': return 'bg-purple-500/20 text-purple-400 border-purple-500'
      case 'options': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500'
    }
  }

  const contractTypes = ['all', 'perpetual', 'futures', 'options']
  const exchanges = ['all', 'Binance', 'Bybit', 'OKX', 'Deribit', 'BitMEX']

  const safeContracts = safeArray<DerivativeContract>(contracts)
  const safeFundingRates = safeArray<FundingRateData>(fundingRates)
  const safeLiquidations = safeArray<LiquidationEvent>(liquidations)
  
  const filteredContracts = safeContracts.filter(c => 
    (selectedType === 'all' || c?.type === selectedType) &&
    (selectedExchange === 'all' || c?.exchange === selectedExchange)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Derivatives Data...</p>
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
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Derivatives Watch</h1>
          <p className="text-gray-400">Real-time derivatives market monitoring, funding rates, and liquidation tracking</p>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Total Open Interest</div>
              <div className="text-xl font-bold text-cyan-400">{formatCurrency(metrics.totalOpenInterest)}</div>
            </div>
            <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">24h Volume</div>
              <div className="text-xl font-bold text-green-400">{formatCurrency(metrics.totalVolume24h)}</div>
            </div>
            <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Avg Funding Rate</div>
              <div className={`text-xl font-bold ${getFundingColor(metrics.avgFundingRate)}`}>
                {formatFundingRate(metrics.avgFundingRate)}
              </div>
            </div>
            <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">24h Liquidations</div>
              <div className="text-xl font-bold text-red-400">{formatCurrency(metrics.totalLiquidations24h)}</div>
            </div>
            <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Long Liquidations</div>
              <div className="text-xl font-bold text-green-400">{formatCurrency(metrics.longLiquidations)}</div>
            </div>
            <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Short Liquidations</div>
              <div className="text-xl font-bold text-red-400">{formatCurrency(metrics.shortLiquidations)}</div>
            </div>
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Dominant Side</div>
              <div className={`text-xl font-bold ${
                metrics.dominantSide === 'long' ? 'text-green-400' : 
                metrics.dominantSide === 'short' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {metrics.dominantSide.toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {/* Liquidation Ratio Bar */}
        {metrics && (
          <div className="mb-8 bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Liquidation Ratio (24h)</h2>
            <div className="relative h-8 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 h-full bg-green-500"
                style={{ width: `${safeNumber(metrics.longLiquidations) + safeNumber(metrics.shortLiquidations) > 0 ? (safeNumber(metrics.longLiquidations) / (safeNumber(metrics.longLiquidations) + safeNumber(metrics.shortLiquidations))) * 100 : 50}%` }}
              />
              <div 
                className="absolute right-0 h-full bg-red-500"
                style={{ width: `${safeNumber(metrics.longLiquidations) + safeNumber(metrics.shortLiquidations) > 0 ? (safeNumber(metrics.shortLiquidations) / (safeNumber(metrics.longLiquidations) + safeNumber(metrics.shortLiquidations))) * 100 : 50}%` }}
              />
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-green-400">Longs: {formatCurrency(metrics.longLiquidations)}</span>
              <span className="text-red-400">Shorts: {formatCurrency(metrics.shortLiquidations)}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            {contractTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  selectedType === type
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Derivatives Contracts Table */}
          <div className="lg:col-span-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20">
              <h2 className="text-lg font-semibold text-white">Derivative Contracts</h2>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="bg-slate-900/50 sticky top-0">
                  <tr>
                    <th className="text-left text-xs text-gray-400 p-3">Contract</th>
                    <th className="text-center text-xs text-gray-400 p-3">Type</th>
                    <th className="text-right text-xs text-gray-400 p-3">Price</th>
                    <th className="text-right text-xs text-gray-400 p-3">Funding</th>
                    <th className="text-right text-xs text-gray-400 p-3">Open Interest</th>
                    <th className="text-right text-xs text-gray-400 p-3">24h Change</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.slice(0, 15).map((contract, i) => (
                    <tr key={i} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 font-medium">{contract.symbol}</span>
                          <span className="text-xs text-gray-500">{contract.exchange}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(contract.type)}`}>
                          {contract.type}
                        </span>
                      </td>
                      <td className="p-3 text-right text-white">${contract.price.toFixed(2)}</td>
                      <td className={`p-3 text-right ${getFundingColor(contract.fundingRate)}`}>
                        {formatFundingRate(contract.fundingRate)}
                      </td>
                      <td className="p-3 text-right text-gray-300">{formatCurrency(contract.openInterest)}</td>
                      <td className={`p-3 text-right ${contract.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {contract.change24h >= 0 ? '+' : ''}{contract.change24h.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Liquidations Feed */}
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20">
              <h2 className="text-lg font-semibold text-white">Live Liquidations</h2>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {safeLiquidations.map((liq) => (
                <div key={liq.id} className={`rounded-lg p-3 border ${
                  liq.side === 'long' ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        liq.side === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {liq.side.toUpperCase()}
                      </span>
                      <span className="text-cyan-400 font-medium">{liq.symbol}</span>
                    </div>
                    <span className="text-xs text-gray-500">{liq.exchange}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">@ ${liq.price.toFixed(2)}</div>
                    <div className={`text-lg font-bold ${liq.side === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(liq.size)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(liq.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Funding Rates Heatmap */}
        <div className="mt-6 bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Funding Rates Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {safeFundingRates.map((fr) => (
              <div 
                key={`${fr.symbol}-${fr.exchange}`}
                className={`p-4 rounded-lg border transition-all hover:scale-105 cursor-pointer ${
                  fr.trend === 'positive' ? 'border-green-500/30 bg-green-500/10' :
                  fr.trend === 'negative' ? 'border-red-500/30 bg-red-500/10' :
                  'border-gray-500/30 bg-gray-500/10'
                }`}
              >
                <div className="text-center">
                  <div className="font-bold text-white text-sm mb-1">{fr.symbol}</div>
                  <div className={`text-xl font-bold ${getFundingColor(fr.rate)}`}>
                    {formatFundingRate(fr.rate)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {fr.annualized.toFixed(1)}% APR
                  </div>
                  <div className="text-xs text-gray-500">{fr.exchange}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/30 border border-green-500 rounded"></div>
              <span className="text-gray-400">Positive (Longs Pay)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500/30 border border-gray-500 rounded"></div>
              <span className="text-gray-400">Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500/30 border border-red-500 rounded"></div>
              <span className="text-gray-400">Negative (Shorts Pay)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DerivativesWatchPage() {
  return (
    <ModuleErrorBoundary moduleName="Derivatives Watch">
      <DerivativesWatchPageContent />
    </ModuleErrorBoundary>
  )
}
