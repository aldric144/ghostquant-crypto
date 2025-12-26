'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/terminal/Sidebar'
import SidebarMobile from '@/components/terminal/SidebarMobile'
import VoiceCopilotProvider from '@/providers/VoiceCopilotProvider'
import ModuleErrorBoundary from '@/components/terminal/ModuleErrorBoundary'

// Helper to get module name from pathname
function getModuleNameFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length >= 2) {
    // Convert path segment to readable name (e.g., "whale-intel" -> "Whale Intel")
    const moduleName = segments[segments.length - 1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    return moduleName
  }
  return 'Intelligence Module'
}

// Client wrapper to get pathname and wrap children in ModuleErrorBoundary
function ModuleWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const moduleName = getModuleNameFromPath(pathname)
  
  return (
    <ModuleErrorBoundary moduleName={moduleName}>
      {children}
    </ModuleErrorBoundary>
  )
}

function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem('ghostquant_session')
    if (session) {
      try {
        const parsed = JSON.parse(session)
        if (new Date(parsed.expires) > new Date()) {
          setIsAuthenticated(true)
          return
        }
      } catch {
        // Invalid session
      }
    }
    setIsAuthenticated(false)
    setShowUpgradeModal(true)
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated && showUpgradeModal) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#0d1321] border border-cyan-500/30 rounded-2xl p-8 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-cyan-500/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Premium Access Required</h2>
            <p className="text-gray-400">
              The Intelligence Terminal requires an active subscription. Sign in or upgrade to access autonomous market intelligence.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/pricing"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/40 transition-all"
            >
              View Pricing
            </Link>
            <Link
              href="/auth/login"
              className="w-full py-3 bg-transparent border border-cyan-500/50 text-white font-medium rounded-xl hover:bg-cyan-500/10 transition-all"
            >
              Sign In
            </Link>
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-400 text-sm"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <VoiceCopilotProvider>
      <SubscriptionGate>
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

            {/* Page Content - Wrapped in ModuleErrorBoundary for crash protection */}
            <main className="flex-1 overflow-y-auto p-6">
              <ModuleWrapper>
                {children}
              </ModuleWrapper>
            </main>
          </div>
        </div>
      </SubscriptionGate>
    </VoiceCopilotProvider>
  )
}
