'use client'

import { useEffect, useState } from 'react'

interface Backtest {
  run_id: string
  params_json: any
  start_date: string
  end_date: string
  sharpe: number
  max_dd: number
  cagr: number
  trade_count: number
}

export default function BacktestsPage() {
  const [backtests, setBacktests] = useState<Backtest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBacktests = async () => {
      try {
        const response = await fetch('/api/backtests')
        if (response.ok) {
          const data = await response.json()
          setBacktests(data.results || [])
        }
      } catch (error) {
        console.error('Error fetching backtests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBacktests()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-800/30 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-blue-400 mb-2">Backtests</h1>
        <p className="text-gray-400">Historical strategy performance analysis</p>
      </div>

      {backtests.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">No backtests available yet</div>
          <div className="text-sm text-gray-500">
            Run a backtest using the CLI:
            <code className="block mt-2 bg-slate-900 p-2 rounded">
              python -m backtest.run --strategy trend_v1 --asset ETH --start 2024-01-01 --end 2024-06-01 --synthetic
            </code>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {backtests.map((backtest) => (
            <div key={backtest.run_id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-blue-400">
                    {backtest.params_json?.asset || 'Unknown'} - {backtest.params_json?.strategy || 'Unknown'}
                  </h3>
                  <div className="text-sm text-gray-400 mt-1">
                    {new Date(backtest.start_date).toLocaleDateString()} - {new Date(backtest.end_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  ID: {backtest.run_id.substring(0, 8)}...
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-1">Sharpe Ratio</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {(backtest.sharpe ?? 0) !== 0 ? backtest.sharpe.toFixed(2) : 'N/A'}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-1">Max Drawdown</div>
                  <div className="text-2xl font-bold text-red-400">
                    {(backtest.max_dd ?? 0) !== 0 ? `${(backtest.max_dd * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-1">CAGR</div>
                  <div className="text-2xl font-bold text-green-400">
                    {(backtest.cagr ?? 0) !== 0 ? `${(backtest.cagr * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-1">Trades</div>
                  <div className="text-2xl font-bold text-gray-300">
                    {backtest.trade_count ?? 0}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
