'use client'

import { useState } from 'react'
import InsightPanel from './InsightPanel'

export default function NavBar() {
  const [insightPanelOpen, setInsightPanelOpen] = useState(false)

  return (
    <>
      <nav className="bg-slate-950 border-b border-blue-900/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="text-2xl font-bold text-blue-400">GhostQuant</div>
            <div className="flex space-x-6">
              <a href="/" className="text-gray-300 hover:text-blue-400 transition">Dashboard</a>
              <a href="/alphabrain" className="text-gray-300 hover:text-blue-400 transition">AlphaBrain</a>
              <a href="/ecoscan" className="text-gray-300 hover:text-blue-400 transition">Ecoscan 🗺️</a>
              <a href="/iqmeter" className="text-gray-300 hover:text-blue-400 transition">IQ Meter</a>
              <a href="/backtests" className="text-gray-300 hover:text-blue-400 transition">Backtests</a>
            </div>
          </div>
          <button
            onClick={() => setInsightPanelOpen(true)}
            className="px-4 py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg text-[#D4AF37] font-medium transition-colors flex items-center gap-2"
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
