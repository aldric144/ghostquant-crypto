'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarMobileProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  href: string
  label: string
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

export default function SidebarMobile({ isOpen, onClose }: SidebarMobileProps) {
  const pathname = usePathname()
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Dashboard
  const dashboard: MenuSection = {
    title: 'Dashboard',
    items: [
      { href: '/terminal/home', label: 'Dashboard Home' },
    ]
  }

  // A. Core Market Intelligence
  const coreMarketIntelligence: MenuSection = {
    title: 'Core Market Intelligence',
    items: [
      { href: '/assets', label: 'All Assets' },
      { href: '/momentum', label: 'Momentum' },
      { href: '/screener', label: 'Screener' },
      { href: '/alphabrain', label: 'AlphaBrain' },
      { href: '/ecoscan', label: 'Ecoscan' },
      { href: '/iqmeter', label: 'IQ Meter' },
      { href: '/backtests', label: 'Backtests' },
      { href: '/whale-intelligence', label: 'Whale Intelligence' },
      { href: '/terminal/liquidity', label: 'Liquidity Flow' },
      { href: '/terminal/sentiment', label: 'Market Sentiment' },
      { href: '/terminal/volatility', label: 'Volatility Monitor' },
    ]
  }

  // B. Autonomous Intelligence Engines
  const autonomousEngines: MenuSection = {
    title: 'Autonomous Intelligence Engines',
    items: [
      { href: '/threat-map', label: 'Threat Map' },
      { href: '/terminal/constellation', label: 'Global Constellation 3D Map' },
      { href: '/terminal/hydra', label: 'Hydra Coordinated Actor Detection' },
      { href: '/terminal/ultrafusion', label: 'UltraFusion Meta-AI' },
      { href: '/entity-explorer', label: 'Entity Explorer' },
      { href: '/terminal/actor', label: 'Threat Actor Profiler' },
      { href: '/terminal/dna', label: 'Behavioral DNA Engine' },
      { href: '/terminal/radar', label: 'Global Radar Heatmap' },
      { href: '/terminal/sentinel', label: 'Sentinel Command Console' },
      { href: '/terminal/genesis', label: 'Genesis Archive' },
      { href: '/ai-timeline', label: 'AI Timeline' },
      { href: '/ring-detector', label: 'Ring Detector' },
      { href: '/influence-graph', label: 'Influence Graph' },
    ]
  }

  // C. Institutional Intelligence
  const institutionalModules: MenuSection = {
    title: 'Institutional Intelligence',
    items: [
      { href: '/ghostmind', label: 'GhostMind AI' },
      { href: '/terminal/mempool', label: 'Mempool Manipulation Radar' },
      { href: '/terminal/microstructure', label: 'Exchange Microstructure Scanner' },
      { href: '/terminal/cross-chain', label: 'Cross-Chain Entity Graph' },
      { href: '/terminal/predict', label: 'Prediction Engine' },
      { href: '/terminal/entity-scanner', label: 'Entity Scanner' },
      { href: '/terminal/risk-map', label: 'Risk Map' },
      { href: '/analytics-dashboard', label: 'Analytics Dashboard' },
      { href: '/terminal/correlation', label: 'Correlation Engine' },
      { href: '/terminal/exposure', label: 'Exposure Analyzer' },
      { href: '/terminal/order-book', label: 'Order Book Depth' },
      { href: '/terminal/derivatives', label: 'Derivatives Watch' },
    ]
  }

  // Risk & AI Engines (Wave B)
  const riskAIEngines: MenuSection = {
    title: 'Risk & AI Engines',
    items: [
      { href: '/terminal/smart-money', label: 'Smart Money Tracker' },
      { href: '/terminal/time-series-risk', label: 'Time-Series Risk' },
      { href: '/terminal/network-anomaly', label: 'Network Anomaly Engine' },
      { href: '/terminal/manipulation-detector', label: 'Price Manipulation Detector' },
      { href: '/terminal/signal-confidence', label: 'Signal Confidence Engine' },
      { href: '/terminal/threat-timeline', label: 'Threat Timeline' },
      { href: '/terminal/event-fusion', label: 'Event Fusion Engine' },
      { href: '/terminal/pattern-recognition', label: 'Pattern Recognition Core' },
      { href: '/terminal/predictive-risk', label: 'Predictive Risk Engine' },
      { href: '/terminal/ai-forecast', label: 'AI Forecast Engine' },
    ]
  }

  // Governance & System Control (Wave C)
  const governanceSystemControl: MenuSection = {
    title: 'Governance & System',
    items: [
      { href: '/terminal/strategy-backtester', label: 'Strategy Backtester' },
      { href: '/terminal/scenario-simulator', label: 'Scenario Simulator' },
      { href: '/terminal/alert-rules', label: 'Alert Rules Engine' },
      { href: '/terminal/compliance-report', label: 'Compliance / Audit Log' },
      { href: '/terminal/system-telemetry', label: 'System Telemetry' },
      { href: '/terminal/governance-console', label: 'Governance Console' },
    ]
  }

  // D. Workspace
  const userWorkspace: MenuSection = {
    title: 'Workspace',
    items: [
      { href: '/terminal/saved-assets', label: 'Saved Assets' },
      { href: '/terminal/investigations', label: 'Saved Investigations' },
    ]
  }

  // E. Account
  const accountSystem: MenuSection = {
    title: 'Account',
    items: [
      { href: '/terminal/billing', label: 'Subscription & Billing' },
      { href: '/settings', label: 'Account Settings' },
      { href: '/settings-v2', label: 'System Intelligence & Settings V2' },
    ]
  }

  const allSections = [dashboard, coreMarketIntelligence, autonomousEngines, institutionalModules, riskAIEngines, governanceSystemControl, userWorkspace, accountSystem]

  const handleLogout = () => {
    localStorage.removeItem('ghostquant_session')
    window.location.href = '/'
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide-out Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-slate-950 border-r border-cyan-500/20 z-50
        transform transition-transform duration-300 md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-cyan-400">Intelligence</h2>
            <p className="text-xs text-gray-500">Terminal</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-slate-800/50 transition-all"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 overflow-y-auto h-[calc(100vh-180px)]">
          {allSections.map((section) => (
            <div key={section.title} className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-sm
                        ${isActive 
                          ? 'bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400' 
                          : 'text-gray-400 hover:text-cyan-400 hover:bg-slate-800/50'
                        }
                      `}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
          
          {/* Logout Button */}
          <div className="mt-4 pt-4 border-t border-cyan-500/20">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-lg transition-all duration-200 w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm"
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cyan-500/20 bg-slate-950">
          <div className="text-xs text-gray-500">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span>System Online</span>
            </div>
            <div>GhostQuant v2.0</div>
          </div>
        </div>
      </aside>
    </>
  )
}
