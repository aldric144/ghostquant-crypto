'use client'

import { useEffect, useState } from 'react'
import SignalCard from '@/components/SignalCard'
import Heatmap from '@/components/Heatmap'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

interface Signal {
  asset_id: number
  ts: string
  trend_score: number
  pretrend_prob: number
  action: string
  confidence: number
  rationale: any
}

interface Asset {
  asset_id: number
  symbol: string
  chain: string | null
  address: string | null
  sector: string | null
  risk_tags: string[] | null
}

export default function Home() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [signalsRes, assetsRes] = await Promise.all([
          fetch(`${API_BASE}/signals/latest?limit=100`),
          fetch(`${API_BASE}/assets`)
        ])
        
        const signalsData = await signalsRes.json()
        const assetsData = await assetsRes.json()
        
        setSignals(signalsData)
        setAssets(assetsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getAssetSymbol = (assetId: number) => {
    const asset = assets.find(a => a.asset_id === assetId)
    return asset?.symbol || `Asset ${assetId}`
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
        <h1 className="text-3xl font-bold text-blue-400 mb-2">GhostQuant Dashboard</h1>
        <p className="text-gray-400">Private crypto-native research & signal platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">Latest Signals</h2>
          <div className="space-y-4">
            {signals.length === 0 ? (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center text-gray-400">
                No signals available yet. The system is collecting data...
              </div>
            ) : (
              signals.slice(0, 10).map((signal, idx) => (
                <SignalCard
                  key={idx}
                  symbol={getAssetSymbol(signal.asset_id)}
                  signal={signal}
                />
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-blue-400 mb-4">Market Heatmap</h2>
          <Heatmap signals={signals} assets={assets} />
        </div>
      </div>
    </div>
  )
}
