'use client'

import { useState, useEffect } from 'react'

interface SavedAsset {
  symbol: string
  name: string
  savedAt: string
}

export default function SavedAssetsPage() {
  const [assets, setAssets] = useState<SavedAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load saved assets from localStorage
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

  return (
    <div className="space-y-6">
      <div className="bg-[#0d1321] border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
          <span className="text-cyan-400 text-sm font-medium">Module Online</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Saved Assets</h1>
        <p className="mt-2 text-cyan-300 font-semibold">
          Module Activated - Intelligence Coming Online
        </p>
        <p className="mt-3 text-gray-400">
          Your watchlist of tracked assets. Save assets from the All Assets page to monitor them here.
        </p>
      </div>

      <div className="bg-[#0d1321] border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Your Watchlist</h2>
          <span className="text-xs text-gray-400">{assets.length} assets saved</span>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <span>Loading saved assets...</span>
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-8">
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
          <div className="space-y-2">
            {assets.map((asset) => (
              <div
                key={asset.symbol}
                className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 transition-all"
              >
                <div>
                  <span className="text-white font-medium">{asset.symbol}</span>
                  {asset.name && <span className="text-gray-400 ml-2 text-sm">{asset.name}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    Saved {new Date(asset.savedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => removeAsset(asset.symbol)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Remove from watchlist"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
