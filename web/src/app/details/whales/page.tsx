'use client'

import DetailViewPage from '@/components/mobile/DetailViewPage'
import TileCard from '@/components/mobile/TileCard'
import ChartPreview from '@/components/mobile/ChartPreview'

export default function WhalesPage() {
  return (
    <DetailViewPage
      title="Whale Activity"
      subtitle="Large wallet movements and accumulation patterns"
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TileCard
            title="Active Whales"
            value="1,247"
            trend={{ direction: 'up', value: '+12%' }}
            description="Wallets with >$1M in activity"
          />
          <TileCard
            title="Total Volume"
            value="$2.4B"
            trend={{ direction: 'up', value: '+8%' }}
            description="Last 24 hours"
          />
          <TileCard
            title="Accumulation"
            value="67%"
            trend={{ direction: 'up', value: '+5%' }}
            description="Whales buying vs selling"
          />
        </div>

        <ChartPreview title="Whale Activity Trend (7 Days)" />

        <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Recent Whale Movements</h3>
          <p className="text-gray-400">
            Detailed whale tracking data will be integrated in Phase 2. This page will display:
          </p>
          <ul className="list-disc list-inside text-gray-400 mt-2 space-y-1">
            <li>Real-time whale wallet transactions</li>
            <li>Accumulation/distribution patterns</li>
            <li>Whale wallet clustering analysis</li>
            <li>Historical movement correlations</li>
          </ul>
        </div>
      </div>
    </DetailViewPage>
  )
}
