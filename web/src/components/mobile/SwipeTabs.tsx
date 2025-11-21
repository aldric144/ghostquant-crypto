'use client'

import { useState, useRef, useEffect } from 'react'

interface Tab {
  id: string
  label: string
  href?: string
}

interface SwipeTabsProps {
  tabs: Tab[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
}

export default function SwipeTabs({ tabs, activeTab, onTabChange }: SwipeTabsProps) {
  const [active, setActive] = useState(activeTab || tabs[0]?.id)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleTabClick = (tabId: string, href?: string) => {
    setActive(tabId)
    onTabChange?.(tabId)
    if (href) {
      window.location.href = href
    }
  }

  useEffect(() => {
    if (activeTab) {
      setActive(activeTab)
    }
  }, [activeTab])

  return (
    <div className="bg-slate-900/50 border-b border-blue-900/30">
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto scrollbar-hide px-4 py-2 [-webkit-overflow-scrolling:touch]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id, tab.href)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all shrink-0
              ${active === tab.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                : 'text-gray-400 hover:text-gray-300 hover:bg-slate-800/50'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
