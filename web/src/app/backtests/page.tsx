'use client'

import { useEffect, useState } from 'react'

interface Backtest {
  run_id: string
  strategy: string
  symbol: string
  params_json: any
  start_date: string
  end_date: string
  status: string
  created_at: string
  sharpe: number
  max_dd: number
  cagr: number
  trade_count: number
}

interface Asset {
  asset_id: number
  symbol: string
  chain: string | null
  address: string | null
  sector: string
  risk_tags: string[]
}

export default function BacktestsPage() {
  const [backtests, setBacktests] = useState<Backtest[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [creatingAsset, setCreatingAsset] = useState(false)
  const [assetError, setAssetError] = useState('')
  const [assetFormData, setAssetFormData] = useState({
    symbol: '',
    sector: '',
    risk_tags: ''
  })
  const [formData, setFormData] = useState({
    strategy: 'trend_v1',
    symbol: 'BTC',
    timeframe: '1d',
    start_date: '2024-01-01',
    end_date: '2024-06-01',
    initial_capital: 10000,
    params: {}
  })

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

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets')
      if (response.ok) {
        const data = await response.json()
        setAssets(data)
        if (data.length > 0 && !formData.symbol) {
          setFormData({ ...formData, symbol: data[0].symbol })
        }
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
    }
  }

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingAsset(true)
    setAssetError('')

    try {
      const payload: any = {
        symbol: assetFormData.symbol.trim().toUpperCase(),
        sector: assetFormData.sector.trim() || null,
        risk_tags: assetFormData.risk_tags
          ? assetFormData.risk_tags.split(',').map(t => t.trim()).filter(t => t)
          : []
      }

      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create asset')
      }

      const newAsset = await response.json()
      
      await fetchAssets()
      
      setFormData({ ...formData, symbol: newAsset.symbol })
      
      setShowAssetModal(false)
      setAssetFormData({ symbol: '', sector: '', risk_tags: '' })
    } catch (error: any) {
      setAssetError(error.message || 'Failed to create asset')
    } finally {
      setCreatingAsset(false)
    }
  }

  useEffect(() => {
    fetchBacktests()
    fetchAssets()
    
    const interval = setInterval(fetchBacktests, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch('/api/backtests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newBacktest = await response.json()
        setBacktests([newBacktest, ...backtests])
        setShowForm(false)
        setFormData({
          strategy: 'trend_v1',
          symbol: 'BTC',
          timeframe: '1d',
          start_date: '2024-01-01',
          end_date: '2024-06-01',
          initial_capital: 10000,
          params: {}
        })
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to create backtest'}`)
      }
    } catch (error) {
      console.error('Error creating backtest:', error)
      alert('Failed to create backtest')
    } finally {
      setCreating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'running':
        return 'text-yellow-400'
      case 'pending':
        return 'text-blue-400'
      case 'failed':
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusBadge = (status: string) => {
    const color = getStatusColor(status)
    return (
      <span className={`text-xs font-semibold px-2 py-1 rounded ${color} bg-slate-900`}>
        {status.toUpperCase()}
      </span>
    )
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-400 mb-2">Backtests</h1>
            <p className="text-gray-400">Historical strategy performance analysis</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {showForm ? 'Cancel' : 'Run Backtest'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">Create New Backtest</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Asset
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    {assets.length > 0 ? (
                      assets.map((asset) => (
                        <option key={asset.asset_id} value={asset.symbol}>
                          {asset.symbol}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="BTC">BTC</option>
                        <option value="ETH">ETH</option>
                        <option value="SOL">SOL</option>
                      </>
                    )}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAssetModal(true)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition-colors"
                    title="Add new asset"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Strategy
                </label>
                <select
                  value={formData.strategy}
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="trend_v1">Trend V1 (MA Crossover)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Initial Capital ($)
                </label>
                <input
                  type="number"
                  value={formData.initial_capital}
                  onChange={(e) => setFormData({ ...formData, initial_capital: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
                  min="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Timeframe
                </label>
                <select
                  value={formData.timeframe}
                  onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="1h">1 Hour</option>
                  <option value="4h">4 Hours</option>
                  <option value="1d">1 Day</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Run Backtest'}
              </button>
            </div>
          </form>
        </div>
      )}

      {backtests.length === 0 && !showForm ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">No backtests available yet</div>
          <div className="text-sm text-gray-500">
            Click the "Run Backtest" button above to create your first backtest
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {backtests.map((backtest) => (
            <div key={backtest.run_id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-blue-400">
                      {backtest.symbol} - {backtest.strategy}
                    </h3>
                    {getStatusBadge(backtest.status)}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {new Date(backtest.start_date).toLocaleDateString()} - {new Date(backtest.end_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  ID: {backtest.run_id.substring(0, 8)}...
                </div>
              </div>

              {backtest.status === 'completed' && (
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
              )}

              {(backtest.status === 'pending' || backtest.status === 'running') && (
                <div className="bg-slate-900 rounded-lg p-4 text-center">
                  <div className="text-gray-400">
                    {backtest.status === 'pending' ? 'Waiting to start...' : 'Running backtest...'}
                  </div>
                  <div className="mt-2">
                    <div className="animate-pulse inline-block h-2 w-2 rounded-full bg-blue-400 mr-1"></div>
                    <div className="animate-pulse inline-block h-2 w-2 rounded-full bg-blue-400 mr-1" style={{ animationDelay: '0.2s' }}></div>
                    <div className="animate-pulse inline-block h-2 w-2 rounded-full bg-blue-400" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}

              {(backtest.status === 'failed' || backtest.status === 'error') && (
                <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
                  <div className="text-red-400 font-medium">Backtest failed</div>
                  <div className="text-sm text-gray-400 mt-1">Please try again or check the logs</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAssetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Add New Asset</h3>
            
            {assetError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
                {assetError}
              </div>
            )}

            <form onSubmit={handleCreateAsset}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Symbol <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={assetFormData.symbol}
                    onChange={(e) => setAssetFormData({ ...assetFormData, symbol: e.target.value })}
                    placeholder="e.g., AVAX, MATIC"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
                    required
                    maxLength={12}
                    pattern="[A-Za-z0-9]{2,12}"
                  />
                  <p className="mt-1 text-xs text-gray-500">2-12 alphanumeric characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sector <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={assetFormData.sector}
                    onChange={(e) => setAssetFormData({ ...assetFormData, sector: e.target.value })}
                    placeholder="e.g., Layer1, DeFi, Gaming"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Risk Tags <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={assetFormData.risk_tags}
                    onChange={(e) => setAssetFormData({ ...assetFormData, risk_tags: e.target.value })}
                    placeholder="e.g., high-cap, liquid, volatile"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Comma-separated tags</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssetModal(false)
                    setAssetFormData({ symbol: '', sector: '', risk_tags: '' })
                    setAssetError('')
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition-colors"
                  disabled={creatingAsset}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={creatingAsset}
                >
                  {creatingAsset ? 'Creating...' : 'Create Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
