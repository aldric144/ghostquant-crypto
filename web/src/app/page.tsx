'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SignalCard from '@/components/SignalCard'
import Heatmap from '@/components/Heatmap'
import TopMovers from '@/components/TopMovers'
import SwipeTabs from '@/components/mobile/SwipeTabs'
import TileCard from '@/components/mobile/TileCard'
import SectionHeader from '@/components/mobile/SectionHeader'
import { useIntelFeed } from '@/hooks/useIntelFeed'

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

const swipeTabs = [
  { id: 'feed', label: 'Feed', href: '/' },
  { id: 'whales', label: 'Whales', href: '/details/whales' },
  { id: 'billionaires', label: 'Billionaires', href: '/details/billionaires' },
  { id: 'institutions', label: 'Institutions', href: '/details/institutions' },
  { id: 'derivatives', label: 'Derivatives', href: '/details/derivatives' },
  { id: 'darkpools', label: 'Dark Pools', href: '/details/darkpools' },
  { id: 'ai', label: 'AI Alerts', href: '/details/ai' }
]

export default function Home() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [updatedTiles, setUpdatedTiles] = useState<Set<string>>(new Set())
  const [tileData, setTileData] = useState({
    whale: { value: '1,247', trend: '+8%', severity: 'low' as 'low' | 'medium' | 'high' },
    billionaire: { value: '$18.7B', trend: '+2.4%', severity: 'low' as 'low' | 'medium' | 'high' },
    institution: { value: '$847M', trend: '+15%', severity: 'low' as 'low' | 'medium' | 'high' },
    derivative: { value: '$12.4B', trend: '+6%', severity: 'low' as 'low' | 'medium' | 'high' },
    darkpool: { value: '$1.8B', trend: '+22%', severity: 'medium' as 'low' | 'medium' | 'high' },
    ai: { value: '127', trend: '+8', severity: 'low' as 'low' | 'medium' | 'high' },
    manipulation: { value: '0', trend: '0', severity: 'low' as 'low' | 'medium' | 'high' },
    intelligence: { value: '0', trend: '0', severity: 'low' as 'low' | 'medium' | 'high' }
  })
  const router = useRouter()
  
  const { latestAlert, connectionStatus } = useIntelFeed()

  useEffect(() => {
    if (!latestAlert) return

    const alertType = latestAlert.intelligence?.event?.event_type || latestAlert.type || 'unknown'
    const score = latestAlert.score || 0
    const severity: 'low' | 'medium' | 'high' = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'

    let tileKey: string | null = null
    
    if (alertType.includes('whale') || alertType.includes('whale_move')) {
      tileKey = 'whale'
    } else if (alertType.includes('manipulation')) {
      tileKey = 'manipulation'
    } else if (alertType.includes('signal') || alertType.includes('ai')) {
      tileKey = 'ai'
    } else if (alertType.includes('intelligence')) {
      tileKey = 'intelligence'
    } else if (alertType.includes('derivative')) {
      tileKey = 'derivative'
    } else if (alertType.includes('darkpool') || alertType.includes('dark_pool')) {
      tileKey = 'darkpool'
    } else if (alertType.includes('institution')) {
      tileKey = 'institution'
    } else if (alertType.includes('billionaire')) {
      tileKey = 'billionaire'
    }

    if (tileKey) {
      setTileData(prev => ({
        ...prev,
        [tileKey]: {
          ...prev[tileKey as keyof typeof prev],
          severity
        }
      }))

      setUpdatedTiles(prev => new Set(prev).add(tileKey!))
      
      setTimeout(() => {
        setUpdatedTiles(prev => {
          const newSet = new Set(prev)
          newSet.delete(tileKey!)
          return newSet
        })
      }, 2000)
    }
  }, [latestAlert])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [signalsRes, assetsRes] = await Promise.all([
          fetch('/api/signals/latest?limit=100'),
          fetch('/api/assets')
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

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'border-red-500/50 bg-red-900/10'
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-900/10'
      case 'low':
      default:
        return 'border-blue-900/30 bg-slate-900/50'
    }
  }

  const getAnimationClass = (tileKey: string) => {
    return updatedTiles.has(tileKey) ? 'animate-pulse ring-2 ring-blue-400' : ''
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* SwipeTabs - Mobile Navigation */}
      <div className="md:hidden -mx-6">
        <SwipeTabs tabs={swipeTabs} activeTab="feed" />
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-800/30 rounded-lg p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-400 mb-2">GhostQuant Dashboard</h1>
            <p className="text-sm md:text-base text-gray-400">Private crypto-native research & signal platform</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
              connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
              connectionStatus === 'error' ? 'bg-red-400' :
              'bg-gray-400'
            }`} />
            <span className="text-xs text-gray-400">
              {connectionStatus === 'connected' ? 'Live' :
               connectionStatus === 'connecting' ? 'Connecting...' :
               connectionStatus === 'error' ? 'Error' :
               'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Preview Tiles Section - Mobile First */}
      <div className="space-y-4">
        <SectionHeader 
          title="Intelligence Overview" 
          subtitle="Tap any tile for detailed insights"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <TileCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Global Overview"
            value={`${signals.length} Signals`}
            trend={{ direction: 'up', value: '+12%' }}
            description="Active market signals across all assets"
            onClick={() => router.push('/')}
          />
          
          <TileCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            title="Whale Activity"
            value={tileData.whale.value}
            trend={{ direction: 'up', value: tileData.whale.trend }}
            description="Large wallet movements detected"
            onClick={() => router.push('/details/whales')}
            className={`${getSeverityColor(tileData.whale.severity)} ${getAnimationClass('whale')}`}
          />
          
          <TileCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            }
            title="Billionaire Flow"
            value={tileData.billionaire.value}
            trend={{ direction: 'up', value: tileData.billionaire.trend }}
            description="Ultra-wealthy wallet holdings"
            onClick={() => router.push('/details/billionaires')}
            className={`${getSeverityColor(tileData.billionaire.severity)} ${getAnimationClass('billionaire')}`}
          />
          
          <TileCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            title="Institutional Flow"
            value={tileData.institution.value}
            trend={{ direction: 'up', value: tileData.institution.trend }}
            description="Smart money positioning"
            onClick={() => router.push('/details/institutions')}
            className={`${getSeverityColor(tileData.institution.severity)} ${getAnimationClass('institution')}`}
          />
          
          <TileCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            }
            title="Derivative Alerts"
            value={tileData.derivative.value}
            trend={{ direction: 'up', value: tileData.derivative.trend }}
            description="Open interest & funding rates"
            onClick={() => router.push('/details/derivatives')}
            className={`${getSeverityColor(tileData.derivative.severity)} ${getAnimationClass('derivative')}`}
          />
          
          <TileCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
            title="Dark Pool Signals"
            value={tileData.darkpool.value}
            trend={{ direction: 'up', value: tileData.darkpool.trend }}
            description="OTC and private transactions"
            onClick={() => router.push('/details/darkpools')}
            className={`${getSeverityColor(tileData.darkpool.severity)} ${getAnimationClass('darkpool')}`}
          />
          
          <TileCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
            title="AI Insights"
            value={tileData.ai.value}
            trend={{ direction: 'up', value: tileData.ai.trend }}
            description="Machine learning predictions"
            onClick={() => router.push('/details/ai')}
            className={`${getSeverityColor(tileData.ai.severity)} ${getAnimationClass('ai')}`}
          />
          
          <TileCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            title="Manipulation Alerts"
            value={tileData.manipulation.value}
            trend={{ direction: 'neutral', value: tileData.manipulation.trend }}
            description="Coordinated activity detection"
            onClick={() => router.push('/details/darkpools')}
            className={`${getSeverityColor(tileData.manipulation.severity)} ${getAnimationClass('manipulation')}`}
          />
          
          <TileCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            title="Intelligence Feed"
            value={tileData.intelligence.value}
            trend={{ direction: 'neutral', value: tileData.intelligence.trend }}
            description="Real-time intelligence updates"
            onClick={() => router.push('/')}
            className={`${getSeverityColor(tileData.intelligence.severity)} ${getAnimationClass('intelligence')}`}
          />
          
          <TileCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            title="Market Overview"
            value={`${assets.length} Assets`}
            trend={{ direction: 'neutral', value: '0%' }}
            description="Total tracked cryptocurrencies"
            onClick={() => router.push('/assets')}
          />
        </div>
      </div>

      {/* Latest Signals */}
      <div className="space-y-4">
        <SectionHeader 
          title="Latest Signals" 
          subtitle="Real-time trading signals"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <div className="space-y-3 md:space-y-4">
          {signals.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 md:p-8 text-center text-gray-400">
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

      {/* Top Movers */}
      <div className="space-y-4">
        <SectionHeader 
          title="Top Movers" 
          subtitle="Highest momentum assets"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 md:p-6">
          <TopMovers limit={100} sort="momentum" />
        </div>
      </div>

      {/* Market Heatmap */}
      <div className="space-y-4">
        <SectionHeader 
          title="Market Heatmap" 
          subtitle="Visual market overview"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
            </svg>
          }
        />
        <Heatmap signals={signals} assets={assets} />
      </div>
    </div>
  )
}
