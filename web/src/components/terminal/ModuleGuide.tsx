'use client'

import { useState } from 'react'

export interface ModuleGuideContent {
  moduleName: string
  overview: {
    description: string
    intelligenceType: string
    questionsAnswered: string[]
  }
  howToUse: {
    steps: string[]
    importantInputs: string[]
    commonMistakes: string[]
  }
  understandingResults: {
    confidenceTiers: {
      name: string
      description: string
    }[]
    riskScores?: string
    probabilityBands?: string
    alertsVsConfirmations?: string
  }
  dataAndConfidence: {
    liveDataDescription: string
    syntheticDataDescription: string
    multiSourceAggregation?: string
    fallbackBehavior: string
  }
  importantNotes: string[]
}

// Default content template that can be overridden per module
export const defaultModuleGuideContent: Omit<ModuleGuideContent, 'moduleName' | 'overview'> = {
  howToUse: {
    steps: [
      'Review the dashboard metrics and visualizations',
      'Identify patterns or anomalies in the data',
      'Use filters to narrow down specific areas of interest',
      'Cross-reference findings with other GhostQuant modules'
    ],
    importantInputs: [
      'Time range selection',
      'Asset or entity filters',
      'Confidence threshold settings'
    ],
    commonMistakes: [
      'Relying on a single data point without context',
      'Ignoring confidence indicators',
      'Not cross-referencing with other intelligence sources'
    ]
  },
  understandingResults: {
    confidenceTiers: [
      { name: 'Early Signal', description: 'Initial detection with limited data points. Requires further validation.' },
      { name: 'Emerging Pattern', description: 'Multiple correlated signals detected. Pattern is forming but not yet confirmed.' },
      { name: 'Confirmed Structure', description: 'High-confidence detection with strong multi-source validation.' },
      { name: 'Synthesized Risk', description: 'AI-generated assessment when live data is unavailable. Weighted accordingly.' }
    ],
    riskScores: 'Risk scores range from 0-100, where higher values indicate greater risk. Scores above 70 warrant immediate attention.',
    probabilityBands: 'Probability bands show the range of likely outcomes. Wider bands indicate greater uncertainty.',
    alertsVsConfirmations: 'Alerts are early warnings that require investigation. Confirmations are validated findings with high confidence.'
  },
  dataAndConfidence: {
    liveDataDescription: 'Live data is sourced from real-time blockchain feeds, exchange APIs, and on-chain analytics.',
    syntheticDataDescription: 'When live data is unavailable, synthetic intelligence is used to preserve continuity and is weighted accordingly.',
    multiSourceAggregation: 'GhostQuant aggregates data from multiple independent sources to improve accuracy and reduce single-source bias.',
    fallbackBehavior: 'When live streams are unavailable, the system automatically switches to synthetic data mode while maintaining analytical continuity.'
  },
  importantNotes: [
    'This module provides informational and analytical intelligence only.',
    'Results should not be construed as financial or investment advice.',
    'Outcomes are not guaranteed and are subject to data availability, latency, and market conditions.',
    'Always perform your own due diligence before making any decisions based on this intelligence.',
    'Past patterns do not guarantee future results.'
  ]
}

interface ModuleGuideProps {
  isOpen: boolean
  onClose: () => void
  content: ModuleGuideContent
}

type TabId = 'overview' | 'howToUse' | 'results' | 'data' | 'notes'

const tabs: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'howToUse', label: 'How to Use' },
  { id: 'results', label: 'Understanding Results' },
  { id: 'data', label: 'Data & Confidence' },
  { id: 'notes', label: 'Important Notes' }
]

export default function ModuleGuide({ isOpen, onClose, content }: ModuleGuideProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  if (!isOpen) return null

  const renderOverview = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-cyan-400 mb-2">What This Module Does</h4>
        <p className="text-sm text-gray-300 leading-relaxed">{content.overview.description}</p>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-cyan-400 mb-2">Intelligence Type</h4>
        <p className="text-sm text-gray-300 leading-relaxed">{content.overview.intelligenceType}</p>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-cyan-400 mb-2">Questions This Module Helps Answer</h4>
        <ul className="space-y-2">
          {content.overview.questionsAnswered.map((question, idx) => (
            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-cyan-500 mt-0.5">?</span>
              <span>{question}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  const renderHowToUse = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-cyan-400 mb-2">Step-by-Step Instructions</h4>
        <ol className="space-y-2">
          {content.howToUse.steps.map((step, idx) => (
            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-cyan-500 font-semibold min-w-[20px]">{idx + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-cyan-400 mb-2">Important Inputs</h4>
        <ul className="space-y-1">
          {content.howToUse.importantInputs.map((input, idx) => (
            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-cyan-500">-</span>
              <span>{input}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-cyan-400 mb-2">Common Mistakes to Avoid</h4>
        <ul className="space-y-1">
          {content.howToUse.commonMistakes.map((mistake, idx) => (
            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-amber-500">!</span>
              <span>{mistake}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  const renderResults = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-cyan-400 mb-2">Confidence Tiers</h4>
        <div className="space-y-3">
          {content.understandingResults.confidenceTiers.map((tier, idx) => (
            <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-sm font-semibold text-cyan-300 mb-1">{tier.name}</div>
              <p className="text-sm text-gray-400">{tier.description}</p>
            </div>
          ))}
        </div>
      </div>
      {content.understandingResults.riskScores && (
        <div>
          <h4 className="text-sm font-semibold text-cyan-400 mb-2">Risk Scores</h4>
          <p className="text-sm text-gray-300">{content.understandingResults.riskScores}</p>
        </div>
      )}
      {content.understandingResults.probabilityBands && (
        <div>
          <h4 className="text-sm font-semibold text-cyan-400 mb-2">Probability Bands</h4>
          <p className="text-sm text-gray-300">{content.understandingResults.probabilityBands}</p>
        </div>
      )}
      {content.understandingResults.alertsVsConfirmations && (
        <div>
          <h4 className="text-sm font-semibold text-cyan-400 mb-2">Alerts vs Confirmations</h4>
          <p className="text-sm text-gray-300">{content.understandingResults.alertsVsConfirmations}</p>
        </div>
      )}
    </div>
  )

  const renderData = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-cyan-400 mb-2">Live Data</h4>
        <p className="text-sm text-gray-300">{content.dataAndConfidence.liveDataDescription}</p>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-cyan-400 mb-2">Synthetic Data</h4>
        <p className="text-sm text-gray-300">{content.dataAndConfidence.syntheticDataDescription}</p>
      </div>
      {content.dataAndConfidence.multiSourceAggregation && (
        <div>
          <h4 className="text-sm font-semibold text-cyan-400 mb-2">Multi-Source Aggregation</h4>
          <p className="text-sm text-gray-300">{content.dataAndConfidence.multiSourceAggregation}</p>
        </div>
      )}
      <div>
        <h4 className="text-sm font-semibold text-cyan-400 mb-2">Fallback Behavior</h4>
        <p className="text-sm text-gray-300">{content.dataAndConfidence.fallbackBehavior}</p>
      </div>
      <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-3 mt-4">
        <p className="text-sm text-gray-400 italic">
          When live data is unavailable, synthetic intelligence is used to preserve continuity and is weighted accordingly.
        </p>
      </div>
    </div>
  )

  const renderNotes = () => (
    <div className="space-y-3">
      {content.importantNotes.map((note, idx) => (
        <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 flex items-start gap-3">
          <span className="text-gray-500 text-sm">*</span>
          <p className="text-sm text-gray-300">{note}</p>
        </div>
      ))}
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'howToUse':
        return renderHowToUse()
      case 'results':
        return renderResults()
      case 'data':
        return renderData()
      case 'notes':
        return renderNotes()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-900 border-l border-cyan-500/30 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-cyan-500/30 flex items-center justify-between bg-slate-900/95">
        <div>
          <h3 className="text-lg font-semibold text-cyan-400">Module Guide</h3>
          <p className="text-xs text-gray-500">{content.moduleName}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Close guide"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cyan-500/20 bg-slate-900/95 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/50'
                : 'text-gray-500 hover:text-gray-300 hover:bg-slate-800/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-cyan-500/20 bg-slate-900/95">
        <p className="text-xs text-gray-500 text-center">
          GhostQuant Intelligence Platform
        </p>
      </div>
    </div>
  )
}

// Button component for consistent placement
export function ModuleGuideButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-sm font-medium text-cyan-400 bg-slate-800/50 border border-cyan-500/30 rounded-lg hover:bg-slate-800 hover:border-cyan-500/50 transition-colors flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Module Guide
    </button>
  )
}
