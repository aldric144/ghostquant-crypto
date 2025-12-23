'use client'

import { useState } from 'react'

interface ConfidenceLegendProps {
  className?: string
}

const confidenceTiers = [
  {
    tier: 'Early Signal',
    description: 'Initial indicator detected from a single engine or data source. May require additional confirmation.',
    color: 'bg-blue-500/20 border-blue-500/50 text-blue-400'
  },
  {
    tier: 'Emerging Pattern',
    description: 'Multiple signals aligning across time windows or data sources. Pattern is forming but not yet confirmed.',
    color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
  },
  {
    tier: 'Confirmed Structure',
    description: 'Engine-specific threshold crossed. Pattern meets strict detection criteria within a specialized module.',
    color: 'bg-green-500/20 border-green-500/50 text-green-400'
  },
  {
    tier: 'Synthesized Risk',
    description: 'Cross-engine executive assessment aggregating multiple confirmed structures and emerging patterns.',
    color: 'bg-purple-500/20 border-purple-500/50 text-purple-400'
  }
]

export default function ConfidenceLegend({ className = '' }: ConfidenceLegendProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 border border-cyan-500/20 hover:border-cyan-500/40 rounded-lg text-xs text-gray-400 hover:text-cyan-400 transition-all ${className}`}
        aria-label="View confidence legend"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Confidence Guide</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
              <h2 className="text-lg font-semibold text-white">Confidence Tier Legend</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {confidenceTiers.map((item) => (
                <div
                  key={item.tier}
                  className={`p-3 rounded-lg border ${item.color}`}
                >
                  <div className="font-medium mb-1">{item.tier}</div>
                  <div className="text-xs text-gray-400">{item.description}</div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-cyan-500/20">
              <p className="text-xs text-gray-500 leading-relaxed">
                Different modules operate at different confidence tiers. Differences in counts between modules are expected and reflect the varying thresholds and detection criteria used by each specialized engine.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
