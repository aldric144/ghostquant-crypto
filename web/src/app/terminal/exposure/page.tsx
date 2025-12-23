'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'

interface ExposureData {
  asset: string
  symbol: string
  longExposure: number
  shortExposure: number
  netExposure: number
  leverage: number
  riskScore: number
  pnl24h: number
  liquidationRisk: 'high' | 'medium' | 'low'
  chain: string
}

interface ExposureByChain {
  chain: string
  totalExposure: number
  longExposure: number
  shortExposure: number
  assetCount: number
}

interface ExposureMetrics {
  totalLongExposure: number
  totalShortExposure: number
  netExposure: number
  avgLeverage: number
  highRiskPositions: number
  totalPnl24h: number
}

interface ExposureAlert {
  id: string
  type: 'liquidation_warning' | 'high_leverage' | 'concentration_risk' | 'pnl_alert'
  asset: string
  message: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  timestamp: Date
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

export default function ExposureAnalyzerPage() {
  const [exposures, setExposures] = useState<ExposureData[]>([])
  const [chainExposures, setChainExposures] = useState<ExposureByChain[]>([])
  const [alerts, setAlerts] = useState<ExposureAlert[]>([])
  const [metrics, setMetrics] = useState<ExposureMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedChain, setSelectedChain] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('netExposure')

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [selectedChain])

  async function fetchData() {
    try {
      const response = await fetch(`${API_BASE}/gq-core/exposure/analysis?chain=${selectedChain}`)
      if (response.ok) {
        const data = await response.json()
        if (data.exposures) {
          setExposures(data.exposures)
          setChainExposures(data.chainExposures || [])
          setAlerts(data.alerts || [])
          setMetrics(data.metrics)
        } else {
          generateMockData()
        }
      } else {
        generateMockData()
      }
    } catch (error) {
      console.error('Error fetching exposure data:', error)
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
    const chains = ['Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Optimism']
    const risks: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low']

    const mockExposures: ExposureData[] = assets.map((asset) => {
      const longExposure = Math.random() * 50000000 + 1000000
      const shortExposure = Math.random() * 30000000 + 500000
      const leverage = Math.random() * 10 + 1
      return {
        asset: asset.name,
        symbol: asset.symbol,
        longExposure,
        shortExposure,
        netExposure: longExposure - shortExposure,
        leverage,
        riskScore: Math.random() * 100,
        pnl24h: (Math.random() - 0.5) * 2000000,
        liquidationRisk: leverage > 8 ? 'high' : leverage > 5 ? 'medium' : 'low',
        chain: chains[Math.floor(Math.random() * chains.length)]
      }
    })

    const mockChainExposures: ExposureByChain[] = chains.map((chain) => {
      const chainAssets = mockExposures.filter(e => e.chain === chain)
      return {
        chain,
        totalExposure: chainAssets.reduce((sum, e) => sum + Math.abs(e.netExposure), 0),
        longExposure: chainAssets.reduce((sum, e) => sum + e.longExposure, 0),
        shortExposure: chainAssets.reduce((sum, e) => sum + e.shortExposure, 0),
        assetCount: chainAssets.length
      }
    })

    const alertTypes: ('liquidation_warning' | 'high_leverage' | 'concentration_risk' | 'pnl_alert')[] = 
      ['liquidation_warning', 'high_leverage', 'concentration_risk', 'pnl_alert']
    const severities: ('critical' | 'high' | 'medium' | 'low')[] = ['critical', 'high', 'medium', 'low']

    const mockAlerts: ExposureAlert[] = Array.from({ length: 8 }, (_, i) => ({
      id: `alert-${i}`,
      type: alertTypes[i % alertTypes.length],
      asset: assets[i % assets.length].symbol,
      message: [
        'Approaching liquidation threshold - reduce leverage',
        'High leverage detected - risk management advised',
        'Concentration risk - exposure exceeds 30% of portfolio',
        'Significant PnL movement - review position',
        'Margin call warning - add collateral',
        'Position size exceeds risk limits',
        'Correlated positions detected - diversification needed',
        'Funding rate impact on position'
      ][i % 8],
      severity: severities[i % severities.length],
      timestamp: new Date(Date.now() - Math.random() * 3600000)
    }))

    const totalLong = mockExposures.reduce((sum, e) => sum + e.longExposure, 0)
    const totalShort = mockExposures.reduce((sum, e) => sum + e.shortExposure, 0)
    const highRisk = mockExposures.filter(e => e.liquidationRisk === 'high').length

    setExposures(mockExposures)
    setChainExposures(mockChainExposures)
    setAlerts(mockAlerts)
    setMetrics({
      totalLongExposure: totalLong,
      totalShortExposure: totalShort,
      netExposure: totalLong - totalShort,
      avgLeverage: mockExposures.reduce((sum, e) => sum + e.leverage, 0) / mockExposures.length,
      highRiskPositions: highRisk,
      totalPnl24h: mockExposures.reduce((sum, e) => sum + e.pnl24h, 0)
    })
  }

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value)
    const sign = value < 0 ? '-' : ''
    if (absValue >= 1e9) return `${sign}$${(absValue / 1e9).toFixed(2)}B`
    if (absValue >= 1e6) return `${sign}$${(absValue / 1e6).toFixed(2)}M`
    if (absValue >= 1e3) return `${sign}$${(absValue / 1e3).toFixed(2)}K`
    return `${sign}$${absValue.toFixed(2)}`
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500'
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-purple-500 bg-purple-500/10 text-purple-300'
      case 'high': return 'border-red-500 bg-red-500/10 text-red-300'
      case 'medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
      case 'low': return 'border-green-500 bg-green-500/10 text-green-300'
      default: return 'border-gray-500 bg-gray-500/10 text-gray-300'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'liquidation_warning': return '⚠️'
      case 'high_leverage': return '📊'
      case 'concentration_risk': return '🎯'
      case 'pnl_alert': return '💰'
      default: return '🔔'
    }
  }

  const chains = ['all', 'Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Optimism']

  const sortedExposures = [...exposures].sort((a, b) => {
    switch (sortBy) {
      case 'netExposure': return Math.abs(b.netExposure) - Math.abs(a.netExposure)
      case 'leverage': return b.leverage - a.leverage
      case 'riskScore': return b.riskScore - a.riskScore
      case 'pnl24h': return b.pnl24h - a.pnl24h
      default: return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Analyzing Exposure Data...</p>
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
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Exposure Analyzer</h1>
          <p className="text-gray-400">Portfolio exposure analysis, risk monitoring, and position management</p>
        </div>

        {/* Exposure Gauge */}
        {metrics && (
          <div className="mb-8 bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Net Exposure Overview</h2>
            <div className="flex items-center gap-8">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-400">Long: {formatCurrency(metrics.totalLongExposure)}</span>
                  <span className="text-red-400">Short: {formatCurrency(metrics.totalShortExposure)}</span>
                </div>
                <div className="relative h-6 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 h-full bg-green-500"
                    style={{ width: `${(metrics.totalLongExposure / (metrics.totalLongExposure + metrics.totalShortExposure)) * 100}%` }}
                  />
                  <div 
                    className="absolute right-0 h-full bg-red-500"
                    style={{ width: `${(metrics.totalShortExposure / (metrics.totalLongExposure + metrics.totalShortExposure)) * 100}%` }}
                  />
                </div>
                <div className="text-center mt-2">
                  <span className={`text-2xl font-bold ${metrics.netExposure >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    Net: {formatCurrency(metrics.netExposure)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Total Long</div>
              <div className="text-xl font-bold text-green-400">{formatCurrency(metrics.totalLongExposure)}</div>
            </div>
            <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Total Short</div>
              <div className="text-xl font-bold text-red-400">{formatCurrency(metrics.totalShortExposure)}</div>
            </div>
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Net Exposure</div>
              <div className={`text-xl font-bold ${metrics.netExposure >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(metrics.netExposure)}
              </div>
            </div>
            <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Avg Leverage</div>
              <div className="text-xl font-bold text-yellow-400">{metrics.avgLeverage.toFixed(1)}x</div>
            </div>
            <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">High Risk Positions</div>
              <div className="text-xl font-bold text-red-400">{metrics.highRiskPositions}</div>
            </div>
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">24h PnL</div>
              <div className={`text-xl font-bold ${metrics.totalPnl24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(metrics.totalPnl24h)}
              </div>
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
            <span className="text-gray-400 text-sm py-1.5">Sort by:</span>
            {[
              { key: 'netExposure', label: 'Exposure' },
              { key: 'leverage', label: 'Leverage' },
              { key: 'riskScore', label: 'Risk' },
              { key: 'pnl24h', label: 'PnL' }
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setSortBy(option.key)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  sortBy === option.key
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exposure Table */}
          <div className="lg:col-span-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20">
              <h2 className="text-lg font-semibold text-white">Position Exposure</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left text-xs text-gray-400 p-3">Asset</th>
                    <th className="text-right text-xs text-gray-400 p-3">Long</th>
                    <th className="text-right text-xs text-gray-400 p-3">Short</th>
                    <th className="text-right text-xs text-gray-400 p-3">Net</th>
                    <th className="text-right text-xs text-gray-400 p-3">Leverage</th>
                    <th className="text-right text-xs text-gray-400 p-3">24h PnL</th>
                    <th className="text-center text-xs text-gray-400 p-3">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedExposures
                    .filter(e => selectedChain === 'all' || e.chain === selectedChain)
                    .map((exposure) => (
                    <tr key={exposure.symbol} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 font-medium">{exposure.symbol}</span>
                          <span className="text-xs text-gray-500">{exposure.chain}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right text-green-400">{formatCurrency(exposure.longExposure)}</td>
                      <td className="p-3 text-right text-red-400">{formatCurrency(exposure.shortExposure)}</td>
                      <td className={`p-3 text-right font-medium ${exposure.netExposure >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(exposure.netExposure)}
                      </td>
                      <td className="p-3 text-right text-yellow-400">{exposure.leverage.toFixed(1)}x</td>
                      <td className={`p-3 text-right ${exposure.pnl24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(exposure.pnl24h)}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getRiskColor(exposure.liquidationRisk)}`}>
                          {exposure.liquidationRisk.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Alerts */}
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20">
              <h2 className="text-lg font-semibold text-white">Risk Alerts</h2>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <div key={alert.id} className={`rounded-lg p-3 border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getAlertIcon(alert.type)}</span>
                      <span className="font-medium text-cyan-400">{alert.asset}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm text-white">{alert.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chain Exposure Distribution */}
        <div className="mt-6 bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Exposure by Chain</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {chainExposures.map((chain) => {
              const maxExposure = Math.max(...chainExposures.map(c => c.totalExposure))
              const percentage = (chain.totalExposure / maxExposure) * 100
              
              return (
                <div key={chain.chain} className="bg-slate-900/50 rounded-lg p-4">
                  <div className="text-sm font-medium text-cyan-400 mb-2">{chain.chain}</div>
                  <div className="text-xl font-bold text-white mb-2">{formatCurrency(chain.totalExposure)}</div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-cyan-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{chain.assetCount} assets</span>
                    <span>L/S: {(chain.longExposure / chain.shortExposure).toFixed(2)}</span>
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
