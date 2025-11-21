'use client'

import DetailViewPage from '@/components/mobile/DetailViewPage'
import TileCard from '@/components/mobile/TileCard'
import ChartPreview from '@/components/mobile/ChartPreview'

export default function InstitutionsPage() {
  return (
    <DetailViewPage
      title="Institutional Flow"
      subtitle="Smart money and institutional wallet activity"
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TileCard
            title="Institutional Wallets"
            value="2,847"
            trend={{ direction: 'up', value: '+24' }}
            description="Tracked smart money addresses"
          />
          <TileCard
            title="Net Flow"
            value="$847M"
            trend={{ direction: 'up', value: '+15%' }}
            description="Inflow vs outflow (24h)"
          />
          <TileCard
            title="Sentiment"
            value="Bullish"
            trend={{ direction: 'up', value: '+8%' }}
            description="Based on positioning"
          />
        </div>

        <ChartPreview title="Institutional Flow Trend (14 Days)" />

        <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Institutional Analytics</h3>
          <p className="text-gray-400">
            Institutional flow data will be integrated in Phase 2. This page will display:
          </p>
          <ul className="list-disc list-inside text-gray-400 mt-2 space-y-1">
            <li>Identified institutional wallet addresses</li>
            <li>Net inflow/outflow tracking</li>
            <li>Positioning changes and rebalancing</li>
            <li>Correlation with price action</li>
          </ul>
        </div>
      </div>
    </DetailViewPage>
  )
}
