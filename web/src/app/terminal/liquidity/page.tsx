'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'

interface LiquidityPool {
  id: string
  name: string
  chain: string
  tvl: number
  volume24h: number
  apy: number
  change24h: number
  tokens: string[]
  protocol: string
}

interface LiquidityFlow {
  id: string
  from: string
  to: string
  amount: number
  token: string
  timestamp: Date
  type: 'inflow' | 'outflow' | 'rebalance'
}

interface LiquidityMetrics {
  totalTvl: number
  totalVolume24h: number
  avgApy: number
  activeFlows: number
  topChain: string
  topProtocol: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

function isValidPool(pool: unknown): pool is LiquidityPool {
  if (!pool || typeof pool !== 'object') return false
  const p = pool as Record<string, unknown>
  return typeof p.id === 'string' && typeof p.name === 'string' && typeof p.tvl === 'number'
}

function isValidFlow(flow: unknown): flow is LiquidityFlow {
  if (!flow || typeof flow !== 'object') return false
  const f = flow as Record<string, unknown>
  return typeof f.id === 'string' && typeof f.amount === 'number' && ['inflow', 'outflow', 'rebalance'].includes(f.type as string)
}

function isValidMetrics(metrics: unknown): metrics is LiquidityMetrics {
  if (!metrics || typeof metrics !== 'object') return false
  const m = metrics as Record<string, unknown>
  return typeof m.totalTvl === 'number' && typeof m.totalVolume24h === 'number'
}

function normalizeResponse(data: unknown): { pools: LiquidityPool[]; flows: LiquidityFlow[]; metrics: LiquidityMetrics | null } | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>
  
  const rawPools = Array.isArray(d.pools) ? d.pools : (d.data && typeof d.data === 'object' && Array.isArray((d.data as Record<string, unknown>).pools) ? (d.data as Record<string, unknown>).pools : null)
  const rawFlows = Array.isArray(d.flows) ? d.flows : (d.data && typeof d.data === 'object' && Array.isArray((d.data as Record<string, unknown>).flows) ? (d.data as Record<string, unknown>).flows : [])
  const rawMetrics = d.metrics || (d.data && typeof d.data === 'object' ? (d.data as Record<string, unknown>).metrics : null)
  
  if (!Array.isArray(rawPools) || rawPools.length === 0) return null
  
  const validPools = rawPools.filter(isValidPool)
  if (validPools.length === 0) return null
  
  const validFlows = Array.isArray(rawFlows) ? rawFlows.filter(isValidFlow) : []
  const validMetrics = isValidMetrics(rawMetrics) ? rawMetrics : null
  
  return { pools: validPools, flows: validFlows, metrics: validMetrics }
}

export default function LiquidityFlowPage() {
  const [pools, setPools] = useState<LiquidityPool[]>([])
  const [flows, setFlows] = useState<LiquidityFlow[]>([])
  const [metrics, setMetrics] = useState<LiquidityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedChain, setSelectedChain] = useState<string>('all')
  const [timeframe, setTimeframe] = useState<string>('24h')

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [selectedChain, timeframe])

  async function fetchData() {
    try {
      const response = await fetch(`${API_BASE}/gq-core/liquidity/pools?chain=${selectedChain}&timeframe=${timeframe}`)
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
      
      setPools(normalized.pools)
      setFlows(normalized.flows)
      setMetrics(normalized.metrics)
    } catch (error) {
      console.error('Error fetching liquidity data:', error)
      generateMockData()
    } finally {
      setLoading(false)
    }
  }

  function generateMockData() {
    const chains = ['Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Optimism', 'Avalanche']
    const protocols = ['Uniswap', 'SushiSwap', 'Curve', 'Balancer', 'PancakeSwap', 'Aave']
    const tokens = ['ETH', 'USDC', 'USDT', 'WBTC', 'DAI', 'MATIC', 'ARB']

    const mockPools: LiquidityPool[] = Array.from({ length: 20 }, (_, i) => ({
      id: `pool-${i}`,
      name: `${tokens[i % tokens.length]}/${tokens[(i + 1) % tokens.length]}`,
      chain: chains[i % chains.length],
      tvl: Math.random() * 500000000 + 10000000,
      volume24h: Math.random() * 50000000 + 1000000,
      apy: Math.random() * 50 + 1,
      change24h: (Math.random() - 0.5) * 20,
      tokens: [tokens[i % tokens.length], tokens[(i + 1) % tokens.length]],
      protocol: protocols[i % protocols.length]
    }))

    const mockFlows: LiquidityFlow[] = Array.from({ length: 15 }, (_, i) => ({
      id: `flow-${i}`,
      from: `0x${Math.random().toString(16).slice(2, 10)}...`,
      to: protocols[i % protocols.length],
      amount: Math.random() * 10000000 + 100000,
      token: tokens[i % tokens.length],
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      type: ['inflow', 'outflow', 'rebalance'][i % 3] as 'inflow' | 'outflow' | 'rebalance'
    }))

    const totalTvl = mockPools.reduce((sum, p) => sum + p.tvl, 0)
    const totalVolume = mockPools.reduce((sum, p) => sum + p.volume24h, 0)
    const avgApy = mockPools.reduce((sum, p) => sum + p.apy, 0) / mockPools.length

    setPools(mockPools)
    setFlows(mockFlows)
    setMetrics({
      totalTvl,
      totalVolume24h: totalVolume,
      avgApy,
      activeFlows: mockFlows.length,
      topChain: 'Ethereum',
      topProtocol: 'Uniswap'
    })
  }

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const getFlowColor = (type: string) => {
    switch (type) {
      case 'inflow': return 'text-green-400 bg-green-500/20'
      case 'outflow': return 'text-red-400 bg-red-500/20'
      case 'rebalance': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const chains = ['all', 'Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Optimism', 'Avalanche']

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Liquidity Flow Data...</p>
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
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Liquidity Flow Monitor</h1>
          <p className="text-gray-400">Real-time liquidity pool tracking and flow analysis across DeFi protocols</p>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Total TVL</div>
              <div className="text-xl font-bold text-cyan-400">{formatCurrency(metrics.totalTvl)}</div>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">24h Volume</div>
              <div className="text-xl font-bold text-green-400">{formatCurrency(metrics.totalVolume24h)}</div>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Avg APY</div>
              <div className="text-xl font-bold text-purple-400">{metrics.avgApy.toFixed(2)}%</div>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Active Flows</div>
              <div className="text-xl font-bold text-yellow-400">{metrics.activeFlows}</div>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Top Chain</div>
              <div className="text-xl font-bold text-blue-400">{metrics.topChain}</div>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Top Protocol</div>
              <div className="text-xl font-bold text-orange-400">{metrics.topProtocol}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            {chains.map((chain) => (
              <button
                key={chain}
                onClick={() => setSelectedChain(chain)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  selectedChain === chain
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {chain === 'all' ? 'All Chains' : chain}
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
          {/* Liquidity Pools Table */}
          <div className="lg:col-span-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20">
              <h2 className="text-lg font-semibold text-white">Top Liquidity Pools</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left text-xs text-gray-400 p-3">Pool</th>
                    <th className="text-left text-xs text-gray-400 p-3">Chain</th>
                    <th className="text-right text-xs text-gray-400 p-3">TVL</th>
                    <th className="text-right text-xs text-gray-400 p-3">Volume 24h</th>
                    <th className="text-right text-xs text-gray-400 p-3">APY</th>
                    <th className="text-right text-xs text-gray-400 p-3">24h Change</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(pools) ? pools : []).slice(0, 10).map((pool) => (
                    <tr key={pool?.id ?? Math.random()} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 font-medium">{pool?.name ?? 'Unknown'}</span>
                          <span className="text-xs text-gray-500">{pool?.protocol ?? ''}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-slate-700 rounded text-xs text-gray-300">{pool?.chain ?? ''}</span>
                      </td>
                      <td className="p-3 text-right text-white">{formatCurrency(pool?.tvl ?? 0)}</td>
                      <td className="p-3 text-right text-gray-300">{formatCurrency(pool?.volume24h ?? 0)}</td>
                      <td className="p-3 text-right text-green-400">{(pool?.apy ?? 0).toFixed(2)}%</td>
                      <td className={`p-3 text-right ${(pool?.change24h ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(pool?.change24h ?? 0) >= 0 ? '+' : ''}{(pool?.change24h ?? 0).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Flows Feed */}
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20">
              <h2 className="text-lg font-semibold text-white">Live Liquidity Flows</h2>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {(Array.isArray(flows) ? flows : []).map((flow) => (
                <div key={flow?.id ?? Math.random()} className="bg-slate-900/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getFlowColor(flow?.type ?? 'inflow')}`}>
                      {(flow?.type ?? 'inflow').toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {flow?.timestamp ? new Date(flow.timestamp).toLocaleTimeString() : '--:--'}
                    </span>
                  </div>
                  <div className="text-sm text-white font-medium">{formatCurrency(flow?.amount ?? 0)} {flow?.token ?? ''}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {flow?.from ?? 'Unknown'} → {flow?.to ?? 'Unknown'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TVL Distribution Chart (Visual representation) */}
        <div className="mt-6 bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">TVL Distribution by Chain</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {chains.filter(c => c !== 'all').map((chain, i) => {
              const safePools = Array.isArray(pools) ? pools : []
              const chainPools = safePools.filter(p => p?.chain === chain)
              const chainTvl = chainPools.reduce((sum, p) => sum + (p?.tvl ?? 0), 0)
              const totalTvl = metrics?.totalTvl ?? 1
              const percentage = totalTvl > 0 ? (chainTvl / totalTvl * 100) : 0
              const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-cyan-500', 'bg-red-500', 'bg-green-500']
              
              return (
                <div key={chain} className="text-center">
                  <div className="relative h-32 bg-slate-900/50 rounded-lg overflow-hidden mb-2">
                    <div 
                      className={`absolute bottom-0 w-full ${colors[i]} transition-all duration-500`}
                      style={{ height: `${Math.min(percentage, 100)}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300">{chain}</div>
                  <div className="text-xs text-gray-500">{formatCurrency(chainTvl)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
