'use client'

import DetailViewPage from '@/components/mobile/DetailViewPage'
import TileCard from '@/components/mobile/TileCard'
import ChartPreview from '@/components/mobile/ChartPreview'

export default function DarkPoolsPage() {
  return (
    <DetailViewPage
      title="Dark Pool Signals"
      subtitle="OTC and private transaction monitoring"
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TileCard
            title="OTC Volume"
            value="$1.8B"
            trend={{ direction: 'up', value: '+22%' }}
            description="Last 24 hours"
          />
          <TileCard
            title="Large Transfers"
            value="347"
            trend={{ direction: 'up', value: '+11%' }}
            description="Transactions >$1M"
          />
          <TileCard
            title="Exchange Deposits"
            value="$428M"
            trend={{ direction: 'down', value: '-5%' }}
            description="From OTC wallets"
          />
        </div>

        <ChartPreview title="Dark Pool Activity (30 Days)" />

        <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Dark Pool Intelligence</h3>
          <p className="text-gray-400">
            Dark pool tracking will be integrated in Phase 2. This page will display:
          </p>
          <ul className="list-disc list-inside text-gray-400 mt-2 space-y-1">
            <li>OTC desk transaction monitoring</li>
            <li>Large private transfer detection</li>
            <li>Exchange deposit/withdrawal patterns</li>
            <li>Correlation with market impact</li>
          </ul>
        </div>
      </div>
    </DetailViewPage>
  )
}
