'use client'

import DetailViewPage from '@/components/mobile/DetailViewPage'
import TileCard from '@/components/mobile/TileCard'
import ChartPreview from '@/components/mobile/ChartPreview'

export default function BillionairesPage() {
  return (
    <DetailViewPage
      title="Billionaire Activity"
      subtitle="Ultra-high net worth wallet tracking"
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TileCard
            title="Tracked Billionaires"
            value="342"
            trend={{ direction: 'up', value: '+3' }}
            description="Known ultra-wealthy wallets"
          />
          <TileCard
            title="Combined Holdings"
            value="$18.7B"
            trend={{ direction: 'up', value: '+2.4%' }}
            description="Total portfolio value"
          />
          <TileCard
            title="Active Today"
            value="89"
            trend={{ direction: 'neutral', value: '0%' }}
            description="Wallets with transactions"
          />
        </div>

        <ChartPreview title="Billionaire Holdings Trend (30 Days)" />

        <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Billionaire Insights</h3>
          <p className="text-gray-400">
            Ultra-wealthy wallet analytics will be integrated in Phase 2. This page will display:
          </p>
          <ul className="list-disc list-inside text-gray-400 mt-2 space-y-1">
            <li>Known billionaire wallet addresses</li>
            <li>Portfolio composition and changes</li>
            <li>Entry/exit patterns and timing</li>
            <li>Correlation with market movements</li>
          </ul>
        </div>
      </div>
    </DetailViewPage>
  )
}
