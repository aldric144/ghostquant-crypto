'use client'

import DetailViewPage from '@/components/mobile/DetailViewPage'
import TileCard from '@/components/mobile/TileCard'
import ChartPreview from '@/components/mobile/ChartPreview'

export default function DerivativesPage() {
  return (
    <DetailViewPage
      title="Derivative Alerts"
      subtitle="Futures, options, and perpetual swap signals"
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TileCard
            title="Open Interest"
            value="$12.4B"
            trend={{ direction: 'up', value: '+6%' }}
            description="Total across all exchanges"
          />
          <TileCard
            title="Funding Rate"
            value="0.08%"
            trend={{ direction: 'down', value: '-0.02%' }}
            description="8-hour weighted average"
          />
          <TileCard
            title="Liquidations"
            value="$247M"
            trend={{ direction: 'down', value: '-18%' }}
            description="Last 24 hours"
          />
        </div>

        <ChartPreview title="Open Interest Trend (7 Days)" />

        <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Derivatives Intelligence</h3>
          <p className="text-gray-400">
            Derivatives analytics will be integrated in Phase 2. This page will display:
          </p>
          <ul className="list-disc list-inside text-gray-400 mt-2 space-y-1">
            <li>Real-time open interest tracking</li>
            <li>Funding rate anomalies and alerts</li>
            <li>Liquidation cascades and levels</li>
            <li>Options flow and gamma exposure</li>
          </ul>
        </div>
      </div>
    </DetailViewPage>
  )
}
