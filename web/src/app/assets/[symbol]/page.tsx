'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import LineChart from '@/components/Charts/LineChart'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

export default function AssetPage() {
  const params = useParams()
  const symbol = params.symbol as string
  const [signals, setSignals] = useState<any[]>([])
  const [factors, setFactors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [signalsRes, factorsRes] = await Promise.all([
          fetch(`${API_BASE}/signals/asset/${symbol}?limit=500`),
          fetch(`${API_BASE}/factors/asset/${symbol}?limit=1000`)
        ])
        
        const signalsData = await signalsRes.json()
        const factorsData = await factorsRes.json()
        
        setSignals(signalsData)
        setFactors(factorsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [symbol])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    )
  }

  const latestSignal = signals[0]

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-800/30 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-blue-400 mb-2">{symbol}</h1>
        {latestSignal && (
          <div className="flex items-center space-x-6 text-gray-300">
            <div>
              <span className="text-gray-400">Action:</span>{' '}
              <span className="font-semibold">{latestSignal.action}</span>
            </div>
            <div>
              <span className="text-gray-400">TrendScore:</span>{' '}
              <span className="font-semibold">{latestSignal.trend_score?.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-gray-400">Pre-Trend:</span>{' '}
              <span className="font-semibold">{((latestSignal.pretrend_prob || 0) * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">TrendScore History</h2>
          <LineChart
            data={signals.slice(0, 100).reverse()}
            xKey="ts"
            yKey="trend_score"
            title="TrendScore"
          />
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">Pre-Trend Probability</h2>
          <LineChart
            data={signals.slice(0, 100).reverse()}
            xKey="ts"
            yKey="pretrend_prob"
            title="Pre-Trend"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">Momentum</h2>
          <div className="space-y-3">
            {factors.slice(0, 1).map((f, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">1H</span>
                  <span className="font-semibold">{f.mom_1h?.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">24H</span>
                  <span className="font-semibold">{f.mom_24h?.toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">Derivatives</h2>
          <div className="space-y-3">
            {factors.slice(0, 1).map((f, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Funding Flip</span>
                  <span className="font-semibold">{f.funding_flip ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">OI Shift</span>
                  <span className="font-semibold">{f.oi_shift?.toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">On-Chain</h2>
          <div className="space-y-3">
            {factors.slice(0, 1).map((f, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Flow Score</span>
                  <span className="font-semibold">{f.flow_score?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">TVL Accel</span>
                  <span className="font-semibold">{f.tvl_accel?.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-400 mb-4">Signal Timeline</h2>
        <div className="space-y-3">
          {signals.slice(0, 20).map((signal, idx) => (
            <div key={idx} className="border-l-4 border-blue-600 pl-4 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">{signal.action}</span>
                <span className="text-sm text-gray-400">
                  {new Date(signal.ts).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                Score: {signal.trend_score?.toFixed(1)} | Confidence: {((signal.confidence || 0) * 100).toFixed(0)}%
              </div>
              {signal.rationale?.top_drivers && (
                <div className="text-xs text-gray-500 mt-1">
                  {signal.rationale.top_drivers.map((d: any) => d.name).join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
