'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useEffect, useState, useMemo } from 'react'
import { useIntelFeed } from '@/hooks/useIntelFeed'

interface TimelineEvent {
  id: string
  timestamp: number
  type: string
  severity: 'high' | 'medium' | 'low'
  score: number
  message: string
  token?: string
  wallet?: string
  chain?: string
  intelligence?: any
  isNew: boolean
}

type TimeFilter = 'all' | '5min' | '1hr' | '24hr' | '7days'

export default function AITimelinePage() {
  const [showGuide, setShowGuide] = useState(false)
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const { latestAlert, alertHistory, connectionStatus } = useIntelFeed()

  const getEventColor = (type: string): string => {
    const typeStr = type.toLowerCase()
    if (typeStr.includes('manipulation')) return '#ef4444' // red
    if (typeStr.includes('whale')) return '#06b6d4' // cyan
    if (typeStr.includes('ai') || typeStr.includes('signal')) return '#fbbf24' // yellow
    if (typeStr.includes('stablecoin')) return '#10b981' // green
    if (typeStr.includes('derivative')) return '#f97316' // orange
    if (typeStr.includes('billionaire') || typeStr.includes('institution')) return '#a855f7' // purple
    if (typeStr.includes('darkpool')) return '#6366f1' // indigo
    return '#06b6d4' // default cyan
  }

  const getEventIcon = (type: string): string => {
    const typeStr = type.toLowerCase()
    if (typeStr.includes('whale')) return '🐋'
    if (typeStr.includes('manipulation')) return '⚠️'
    if (typeStr.includes('ai') || typeStr.includes('signal')) return '🤖'
    if (typeStr.includes('stablecoin')) return '💵'
    if (typeStr.includes('derivative')) return '📊'
    if (typeStr.includes('billionaire')) return '💎'
    if (typeStr.includes('institution')) return '🏛️'
    if (typeStr.includes('darkpool')) return '🕶️'
    return '📡'
  }

  useEffect(() => {
    if (!latestAlert) return

    const alertType = latestAlert.intelligence?.event?.event_type || latestAlert.type || 'alert'
    const score = latestAlert.score || 0
    const severity: 'high' | 'medium' | 'low' = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'
    
    const newEvent: TimelineEvent = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type: alertType,
      severity,
      score,
      message: alertType,
      token: latestAlert.intelligence?.event?.token || undefined,
      wallet: latestAlert.intelligence?.entity?.entity_id || undefined,
      chain: latestAlert.intelligence?.event?.chain || undefined,
      intelligence: latestAlert.intelligence,
      isNew: true
    }

    setEvents(prev => [newEvent, ...prev].slice(0, 500)) // Cap at 500 events

    setTimeout(() => {
      setEvents(prev => 
        prev.map(event => 
          event.id === newEvent.id ? { ...event, isNew: false } : event
        )
      )
    }, 3000)

  }, [latestAlert])

  useEffect(() => {
    if (alertHistory && alertHistory.length > 0) {
      const initialEvents: TimelineEvent[] = alertHistory.map((alert, index) => {
        const alertType = alert.intelligence?.event?.event_type || alert.type || 'alert'
        const score = alert.score || 0
        const severity: 'high' | 'medium' | 'low' = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'
        
        return {
          id: `init-${index}`,
          timestamp: Date.now() - (index * 60000), // Spread over time
          type: alertType,
          severity,
          score,
          message: alertType,
          token: alert.intelligence?.event?.token || undefined,
          wallet: alert.intelligence?.entity?.entity_id || undefined,
          chain: alert.intelligence?.event?.chain || undefined,
          intelligence: alert.intelligence,
          isNew: false
        }
      })
      
      setEvents(initialEvents.slice(0, 500))
    }
  }, [alertHistory])

  const timeFilteredEvents = useMemo(() => {
    if (activeTimeFilter === 'all') return events

    const now = Date.now()
    const cutoffTime = new Date()
    
    switch (activeTimeFilter) {
      case '5min':
        cutoffTime.setMinutes(cutoffTime.getMinutes() - 5)
        break
      case '1hr':
        cutoffTime.setHours(cutoffTime.getHours() - 1)
        break
      case '24hr':
        cutoffTime.setHours(cutoffTime.getHours() - 24)
        break
      case '7days':
        cutoffTime.setDate(cutoffTime.getDate() - 7)
        break
    }
    
    return events.filter(event => event.timestamp >= cutoffTime.getTime())
  }, [events, activeTimeFilter])

  const searchFilteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return timeFilteredEvents

    const query = searchQuery.toLowerCase()
    return timeFilteredEvents.filter(event => 
      event.message.toLowerCase().includes(query) ||
      event.type.toLowerCase().includes(query) ||
      event.token?.toLowerCase().includes(query) ||
      event.wallet?.toLowerCase().includes(query) ||
      event.chain?.toLowerCase().includes(query)
    )
  }, [timeFilteredEvents, searchQuery])

  const groupedEvents = useMemo(() => {
    const now = Date.now()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStart = today.getTime()
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStart = yesterday.getTime()
    
    const thisWeek = new Date(today)
    thisWeek.setDate(thisWeek.getDate() - 7)
    const thisWeekStart = thisWeek.getTime()

    const groups: { [key: string]: TimelineEvent[] } = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Older': []
    }

    searchFilteredEvents.forEach(event => {
      if (event.timestamp >= todayStart) {
        groups['Today'].push(event)
      } else if (event.timestamp >= yesterdayStart) {
        groups['Yesterday'].push(event)
      } else if (event.timestamp >= thisWeekStart) {
        groups['This Week'].push(event)
      } else {
        groups['Older'].push(event)
      }
    })

    return groups
  }, [searchFilteredEvents])

  const timeFilters: { type: TimeFilter; label: string }[] = [
    { type: 'all', label: 'All Time' },
    { type: '5min', label: 'Last 5 min' },
    { type: '1hr', label: 'Last 1 hour' },
    { type: '24hr', label: 'Last 24 hours' },
    { type: '7days', label: 'Last 7 days' }
  ]

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - timestamp
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <TerminalBackButton className="mb-4" />
          <div>
          <h1 className="text-3xl font-bold text-cyan-400">AI Timeline</h1>
          <p className="text-sm text-gray-400">Chronological intelligence event stream</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          connectionStatus === 'connected' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`} />
          <span className="text-xs font-medium">
            {connectionStatus === 'connected' ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by token, wallet, chain, message, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-slate-900/50 border border-cyan-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Time Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-cyan-500/20">
        {timeFilters.map(filter => (
          <button
            key={filter.type}
            onClick={() => setActiveTimeFilter(filter.type)}
            className={`
              px-4 py-2 rounded-lg transition-all text-sm font-medium
              ${activeTimeFilter === filter.type
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800/50 text-gray-400 hover:text-cyan-400 hover:bg-slate-800'
              }
            `}
          >
            {filter.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-400">
          <span>Total Events:</span>
          <span className="text-cyan-400 font-bold">{searchFilteredEvents.length}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        {searchFilteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg">No events found</p>
            <p className="text-gray-600 text-sm mt-2">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedEvents).map(([groupName, groupEvents]) => {
              if (groupEvents.length === 0) return null

              return (
                <div key={groupName}>
                  {/* Group Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-lg font-bold text-cyan-400">{groupName}</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-transparent" />
                    <span className="text-xs text-gray-500">{groupEvents.length} events</span>
                  </div>

                  {/* Timeline Events */}
                  <div className="relative pl-8 space-y-4">
                    {/* Vertical Line */}
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 via-cyan-500/20 to-transparent" />

                    {groupEvents.map((event, index) => {
                      const color = getEventColor(event.type)
                      const icon = getEventIcon(event.type)

                      return (
                        <div
                          key={event.id}
                          className={`
                            relative transition-all duration-500
                            ${event.isNew 
                              ? 'animate-pulse opacity-0 translate-y-3' 
                              : 'opacity-100 translate-y-0'
                            }
                          `}
                          style={{
                            animation: event.isNew ? 'slideIn 0.5s ease-out forwards' : 'none'
                          }}
                        >
                          {/* Timeline Dot */}
                          <div 
                            className="absolute left-[-1.75rem] top-3 w-4 h-4 rounded-full border-2 border-slate-950 z-10"
                            style={{ backgroundColor: color }}
                          />

                          {/* Event Card */}
                          <div 
                            className={`
                              bg-slate-900/50 border rounded-lg p-4 hover:border-cyan-500/30 transition-all
                              ${event.isNew ? 'shadow-lg shadow-cyan-500/20' : ''}
                            `}
                            style={{ borderColor: `${color}20` }}
                          >
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div className="text-2xl flex-shrink-0">{icon}</div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                {/* Header */}
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <span 
                                    className="text-xs px-2 py-0.5 rounded font-medium"
                                    style={{ 
                                      backgroundColor: `${color}20`,
                                      color: color
                                    }}
                                  >
                                    {event.type}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    event.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                                    event.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {event.severity.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(event.timestamp)}
                                  </span>
                                  {event.isNew && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 animate-pulse">
                                      NEW
                                    </span>
                                  )}
                                </div>

                                {/* Message */}
                                <p className="text-sm text-gray-300 mb-2">
                                  {event.message}
                                </p>

                                {/* Metadata */}
                                {(event.token || event.chain || event.wallet) && (
                                  <div className="flex flex-wrap gap-3 text-xs">
                                    {event.token && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-500">Token:</span>
                                        <span className="text-cyan-400 font-medium">{event.token}</span>
                                      </div>
                                    )}
                                    {event.chain && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-500">Chain:</span>
                                        <span className="text-cyan-400 font-medium">{event.chain}</span>
                                      </div>
                                    )}
                                    {event.wallet && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-500">Wallet:</span>
                                        <span className="text-cyan-400 font-mono text-xs">
                                          {event.wallet.substring(0, 8)}...{event.wallet.substring(event.wallet.length - 6)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Score */}
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full transition-all"
                                      style={{ 
                                        width: `${event.score * 100}%`,
                                        backgroundColor: color
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500 font-mono">
                                    {(event.score * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      
      {/* Module Guide Panel */}
      <ModuleGuide
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        content={getModuleGuideContent('Timeline')}
      />
    </div>

      {/* Inline CSS for slide-in animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
