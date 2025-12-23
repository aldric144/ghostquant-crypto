'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'

interface SavedAsset {
  symbol: string
  name: string
  savedAt: string
  price?: number
  change24h?: number
}

export default function SavedAssetsPage() {
  const [assets, setAssets] = useState<SavedAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ghostquant_saved_assets')
      if (saved) {
        setAssets(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to load saved assets:', e)
    }
    setIsLoading(false)
  }, [])

  const removeAsset = (symbol: string) => {
    const updated = assets.filter(a => a.symbol !== symbol)
    setAssets(updated)
    localStorage.setItem('ghostquant_saved_assets', JSON.stringify(updated))
  }

  const filteredAssets = assets.filter(a => 
    !searchQuery || 
    a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-sm font-medium">Watchlist Active</span>
          </div>
          <TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Saved Assets</h1>
          <p className="text-gray-400">Your personal watchlist of tracked cryptocurrency assets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Total Saved</div>
            <div className="text-2xl font-bold text-white">{assets.length}</div>
          </div>
          <div className="bg-slate-800/50 border border-green-500/20 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Gainers</div>
            <div className="text-2xl font-bold text-green-400">
              {assets.filter(a => (a.change24h || 0) > 0).length}
            </div>
          </div>
          <div className="bg-slate-800/50 border border-red-500/20 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Losers</div>
            <div className="text-2xl font-bold text-red-400">
              {assets.filter(a => (a.change24h || 0) < 0).length}
            </div>
          </div>
        </div>

        {assets.length > 0 && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search your watchlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        )}

        <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your Watchlist</h2>
            <span className="text-xs text-gray-400">{filteredAssets.length} assets</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              <span className="ml-3 text-gray-400">Loading saved assets...</span>
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <p className="text-gray-400 mb-2">No saved assets yet</p>
              <p className="text-gray-500 text-sm">
                Visit the All Assets page and click the bookmark icon to save assets to your watchlist.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.symbol}
                  className="p-4 bg-slate-900/50 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-white font-bold text-lg">{asset.symbol}</div>
                      {asset.name && <div className="text-gray-400 text-sm">{asset.name}</div>}
                    </div>
                    <button
                      onClick={() => removeAsset(asset.symbol)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      title="Remove from watchlist"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {asset.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-medium">${asset.price.toLocaleString()}</span>
                      {asset.change24h !== undefined && (
                        <span className={`text-sm font-medium ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Saved {new Date(asset.savedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
