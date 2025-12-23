'use client'

import { useState } from 'react'

interface InterpretationNoticeProps {
  className?: string
  defaultExpanded?: boolean
}

export default function InterpretationNotice({ className = '', defaultExpanded = false }: InterpretationNoticeProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={`bg-slate-800/30 border border-cyan-500/10 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-gray-400">How to Interpret Results</span>
        </div>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-gray-400 leading-relaxed">
            GhostQuant provides intelligence insights derived from pattern detection and multi-engine synthesis. 
            The platform aggregates signals across multiple specialized engines, each operating with different 
            detection thresholds and time windows.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Some indicators represent early or emerging activity and may not be confirmed events. 
            Certain outputs are probabilistic and update as new data becomes available. 
            Counts and metrics may differ between modules due to varying confidence thresholds.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            For confirmed structures and definitive counts, refer to the specialized engine modules 
            (Ring Detector, Manipulation Detector, etc.) which apply strict detection criteria.
          </p>
        </div>
      )}
    </div>
  )
}
