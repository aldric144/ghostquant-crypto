'use client'

import DetailViewPage from '@/components/mobile/DetailViewPage'
import TileCard from '@/components/mobile/TileCard'
import ChartPreview from '@/components/mobile/ChartPreview'

export default function AIPage() {
  return (
    <DetailViewPage
      title="AI Insights"
      subtitle="Machine learning signals and predictions"
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TileCard
            title="Active Signals"
            value="127"
            trend={{ direction: 'up', value: '+8' }}
            description="High-confidence predictions"
          />
          <TileCard
            title="Accuracy (7D)"
            value="78.4%"
            trend={{ direction: 'up', value: '+2.1%' }}
            description="Signal hit rate"
          />
          <TileCard
            title="Model Confidence"
            value="High"
            trend={{ direction: 'up', value: '+5%' }}
            description="Current market regime"
          />
        </div>

        <ChartPreview title="AI Signal Performance (30 Days)" />

        <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">AI-Powered Analytics</h3>
          <p className="text-gray-400">
            AI insights will be integrated in Phase 2. This page will display:
          </p>
          <ul className="list-disc list-inside text-gray-400 mt-2 space-y-1">
            <li>Machine learning price predictions</li>
            <li>Pattern recognition and anomaly detection</li>
            <li>Sentiment analysis from multiple sources</li>
            <li>Risk scoring and portfolio optimization</li>
          </ul>
        </div>
      </div>
    </DetailViewPage>
  )
}
