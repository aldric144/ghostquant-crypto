'use client'

import { useState } from 'react'
import Sidebar from '@/components/terminal/Sidebar'
import SidebarMobile from '@/components/terminal/SidebarMobile'
import VoiceCopilotProvider from '@/providers/VoiceCopilotProvider'

export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <VoiceCopilotProvider>
      <div className="flex h-screen overflow-hidden bg-slate-950">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Sidebar */}
        <SidebarMobile 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header with Menu Button */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-cyan-500/20 bg-slate-950">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-slate-800/50 transition-all"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-cyan-400">Intelligence Terminal</h1>
            </div>
            <div className="w-10" />
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </VoiceCopilotProvider>
  )
}
