'use client'

import { useState } from 'react'
import InsightPanel from './InsightPanel'

export default function NavBar() {
  const [insightPanelOpen, setInsightPanelOpen] = useState(false)

  return (
    <>
      <nav className="bg-slate-950 border-b border-blue-900/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-8 flex-1 min-w-0">
            <div className="text-2xl font-bold text-blue-400 shrink-0">GhostQuant</div>
            <div className="flex flex-1 min-w-0 gap-4 md:gap-6 overflow-x-auto scrollbar-hide whitespace-nowrap [-webkit-overflow-scrolling:touch] md:overflow-visible">
              <a href="/" className="text-gray-300 hover:text-blue-400 transition shrink-0">Dashboard</a>
              <a href="/assets" className="text-gray-300 hover:text-blue-400 transition shrink-0">All Assets</a>
              <a href="/momentum" className="text-gray-300 hover:text-blue-400 transition shrink-0">Momentum 🚀</a>
              <a href="/screener" className="text-gray-300 hover:text-blue-400 transition shrink-0">Screener</a>
              <a href="/alphabrain" className="text-gray-300 hover:text-blue-400 transition shrink-0">AlphaBrain</a>
              <a href="/ecoscan" className="text-gray-300 hover:text-blue-400 transition shrink-0">Ecoscan 🗺️</a>
              <a href="/iqmeter" className="text-gray-300 hover:text-blue-400 transition shrink-0">IQ Meter</a>
              <a href="/backtests" className="text-gray-300 hover:text-blue-400 transition shrink-0">Backtests</a>
            </div>
          </div>
          <button
            onClick={() => setInsightPanelOpen(true)}
            className="px-4 py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg text-[#D4AF37] font-medium transition-colors flex items-center gap-2 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Insights
          </button>
        </div>
      </nav>
      <InsightPanel isOpen={insightPanelOpen} onClose={() => setInsightPanelOpen(false)} />
    </>
  )
}
