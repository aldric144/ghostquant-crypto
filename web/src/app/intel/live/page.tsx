'use client'

import { useEffect, useState, useMemo } from 'react'
import { useIntelFeed } from '@/hooks/useIntelFeed'

interface Alert {
  id: string
  timestamp: string
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

type CategoryFilter = 'all' | 'whale' | 'manipulation' | 'intelligence' | 'ai' | 'derivatives' | 'darkpool' | 'institutions' | 'billionaire'
type SeverityFilter = 'all' | 'high' | 'medium' | 'low'
type TimeFilter = '5min' | '1hr' | '24hr' | 'all'

export default function IntelLivePage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const { latestAlert, alertHistory, connectionStatus } = useIntelFeed()

  useEffect(() => {
    if (!latestAlert) return

    const score = latestAlert.score || 0
    const severity: 'high' | 'medium' | 'low' = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'
    const alertType = latestAlert.intelligence?.event?.event_type || latestAlert.type || 'alert'
    
    const newAlert: Alert = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: latestAlert.timestamp || new Date().toISOString(),
      type: alertType,
      severity,
      score,
      message: getAlertMessage(alertType, latestAlert),
      token: latestAlert.intelligence?.event?.token || undefined,
      wallet: latestAlert.intelligence?.entity?.entity_id || undefined,
      chain: latestAlert.intelligence?.event?.chain || undefined,
      intelligence: latestAlert.intelligence,
      isNew: true
    }

    setAlerts(prev => [newAlert, ...prev])

    setTimeout(() => {
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === newAlert.id ? { ...alert, isNew: false } : alert
        )
      )
    }, 3000)
  }, [latestAlert])

  useEffect(() => {
    if (alertHistory.length > 0) {
      const historicalAlerts = alertHistory.map((alert, idx) => {
        const score = alert.score || 0
        const severity: 'high' | 'medium' | 'low' = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'
        const alertType = alert.intelligence?.event?.event_type || alert.type || 'alert'
        
        return {
          id: `history-${idx}-${Date.now()}`,
          timestamp: alert.timestamp || new Date().toISOString(),
          type: alertType,
          severity,
          score,
          message: getAlertMessage(alertType, alert),
          token: alert.intelligence?.event?.token || undefined,
          wallet: alert.intelligence?.entity?.entity_id || undefined,
          chain: alert.intelligence?.event?.chain || undefined,
          intelligence: alert.intelligence,
          isNew: false
        }
      })
      
      setAlerts(prev => {
        const existingIds = new Set(prev.map(a => a.id))
        const newAlerts = historicalAlerts.filter(a => !existingIds.has(a.id))
        return [...prev, ...newAlerts]
      })
    }
  }, [alertHistory])

  const getAlertMessage = (type: string, alert: any): string => {
    const typeStr = type.toLowerCase()
    
    if (typeStr.includes('whale')) {
      return `Large whale movement detected - ${alert.intelligence?.entity?.entity_id || 'Unknown wallet'}`
    } else if (typeStr.includes('manipulation')) {
      return `Manipulation pattern detected - Coordinated activity identified`
    } else if (typeStr.includes('signal') || typeStr.includes('ai')) {
      return `AI Signal: High-confidence trading opportunity detected`
    } else if (typeStr.includes('derivative')) {
      return `Derivatives Alert: Significant funding rate or OI change`
    } else if (typeStr.includes('darkpool') || typeStr.includes('dark_pool')) {
      return `Dark Pool Activity: Large OTC transaction detected`
    } else if (typeStr.includes('institution')) {
      return `Institutional Flow: Smart money movement detected`
    } else if (typeStr.includes('billionaire')) {
      return `Billionaire Activity: Ultra-wealthy wallet movement`
    } else {
      return `Intelligence Alert: ${type}`
    }
  }

  const getAlertIcon = (type: string) => {
    const typeStr = type.toLowerCase()
    
    if (typeStr.includes('whale')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    } else if (typeStr.includes('manipulation')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    } else if (typeStr.includes('signal') || typeStr.includes('ai')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    } else if (typeStr.includes('derivative')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      )
    } else if (typeStr.includes('darkpool') || typeStr.includes('dark_pool')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )
    } else if (typeStr.includes('institution')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    } else if (typeStr.includes('billionaire')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    } else {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  }

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'border-l-red-500 bg-red-900/10'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-900/10'
      case 'low':
      default:
        return 'border-l-blue-500 bg-blue-900/10'
    }
  }

  const getSeverityBadgeColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low':
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const filteredAlerts = useMemo(() => {
    let filtered = [...alerts]

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(alert => {
        const typeStr = alert.type.toLowerCase()
        return typeStr.includes(categoryFilter)
      })
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter)
    }

    if (timeFilter !== 'all') {
      const now = new Date()
      const cutoffTime = new Date()
      
      switch (timeFilter) {
        case '5min':
          cutoffTime.setMinutes(now.getMinutes() - 5)
          break
        case '1hr':
          cutoffTime.setHours(now.getHours() - 1)
          break
        case '24hr':
          cutoffTime.setHours(now.getHours() - 24)
          break
      }
      
      filtered = filtered.filter(alert => new Date(alert.timestamp) >= cutoffTime)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(alert => 
        alert.message.toLowerCase().includes(query) ||
        alert.type.toLowerCase().includes(query) ||
        alert.token?.toLowerCase().includes(query) ||
        alert.wallet?.toLowerCase().includes(query) ||
        alert.chain?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [alerts, categoryFilter, severityFilter, timeFilter, searchQuery])

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'whale', label: 'Whale' },
    { id: 'manipulation', label: 'Manipulation' },
    { id: 'intelligence', label: 'Intelligence' },
    { id: 'ai', label: 'AI Signals' },
    { id: 'derivatives', label: 'Derivatives' },
    { id: 'darkpool', label: 'Dark Pool' },
    { id: 'institutions', label: 'Institutions' },
    { id: 'billionaire', label: 'Billionaire' }
  ]

  const severities: { id: SeverityFilter; label: string; color: string }[] = [
    { id: 'all', label: 'All', color: 'text-gray-400' },
    { id: 'high', label: 'High', color: 'text-red-400' },
    { id: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { id: 'low', label: 'Low', color: 'text-blue-400' }
  ]

  const timeFilters: { id: TimeFilter; label: string }[] = [
    { id: 'all', label: 'All Time' },
    { id: '5min', label: 'Last 5 min' },
    { id: '1hr', label: 'Last 1 hour' },
    { id: '24hr', label: 'Last 24 hours' }
  ]

  return (
    <div className="min-h-screen bg-slate-950 pb-20 md:pb-6">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-800/30 rounded-lg p-4 md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-400 mb-2">
                Live Intelligence Feed
              </h1>
              <p className="text-sm md:text-base text-gray-400">
                Real-time market intelligence alerts and signals
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                connectionStatus === 'error' ? 'bg-red-400' :
                'bg-gray-400'
              }`} />
              <span className="text-xs text-gray-400">
                {connectionStatus === 'connected' ? 'Live' :
                 connectionStatus === 'connecting' ? 'Connecting...' :
                 connectionStatus === 'error' ? 'Error' :
                 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Filter Bar */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by token, wallet, chain, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 pl-10 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Category Filters */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`
                    px-3 py-1.5 text-xs font-medium rounded-lg border transition-all
                    ${categoryFilter === cat.id
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                      : 'bg-slate-800 text-gray-400 border-slate-700 hover:border-slate-600'
                    }
                  `}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Severity & Time Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Severity Filters */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Severity</label>
              <div className="flex flex-wrap gap-2">
                {severities.map(sev => (
                  <button
                    key={sev.id}
                    onClick={() => setSeverityFilter(sev.id)}
                    className={`
                      px-3 py-1.5 text-xs font-medium rounded-lg border transition-all
                      ${severityFilter === sev.id
                        ? `bg-${sev.id === 'high' ? 'red' : sev.id === 'medium' ? 'yellow' : sev.id === 'low' ? 'blue' : 'slate'}-500/20 ${sev.color} border-${sev.id === 'high' ? 'red' : sev.id === 'medium' ? 'yellow' : sev.id === 'low' ? 'blue' : 'slate'}-500/50`
                        : 'bg-slate-800 text-gray-400 border-slate-700 hover:border-slate-600'
                      }
                    `}
                  >
                    {sev.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Filters */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Time Range</label>
              <div className="flex flex-wrap gap-2">
                {timeFilters.map(time => (
                  <button
                    key={time.id}
                    onClick={() => setTimeFilter(time.id)}
                    className={`
                      px-3 py-1.5 text-xs font-medium rounded-lg border transition-all
                      ${timeFilter === time.id
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                        : 'bg-slate-800 text-gray-400 border-slate-700 hover:border-slate-600'
                      }
                    `}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-xs text-gray-400">
            Showing {filteredAlerts.length} {filteredAlerts.length === 1 ? 'alert' : 'alerts'}
          </div>
        </div>

        {/* Alert Feed */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8 text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-400">No alerts match your filters</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredAlerts.map((alert, idx) => (
              <div
                key={alert.id}
                className={`
                  bg-slate-900/50 border border-slate-700 rounded-lg p-4 
                  border-l-4 ${getSeverityColor(alert.severity)}
                  transition-all duration-300
                  ${alert.isNew ? 'animate-pulse ring-2 ring-blue-400' : ''}
                  ${idx > 20 ? 'opacity-70' : ''}
                  ${idx > 40 ? 'opacity-50' : ''}
                  ${idx > 60 ? 'opacity-30' : ''}
                `}
                style={{
                  animationDelay: `${idx * 50}ms`
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 p-2 rounded-lg
                    ${alert.severity === 'high' ? 'bg-red-500/10 text-red-400' :
                      alert.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-blue-500/10 text-blue-400'
                    }
                  `}>
                    {getAlertIcon(alert.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`
                          px-2 py-0.5 text-xs font-bold rounded border
                          ${getSeverityBadgeColor(alert.severity)}
                        `}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium bg-slate-800 text-gray-400 rounded border border-slate-700">
                          {alert.type}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-bold bg-slate-800 text-blue-400 rounded border border-slate-700">
                          {alert.score.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {getTimeAgo(alert.timestamp)}
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 mb-2">
                      {alert.message}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatTimestamp(alert.timestamp)}</span>
                      {alert.chain && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          {alert.chain}
                        </span>
                      )}
                      {alert.token && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {alert.token}
                        </span>
                      )}
                      {alert.wallet && (
                        <span className="flex items-center gap-1 truncate max-w-xs">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          {alert.wallet}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Indicator */}
        {filteredAlerts.length > 50 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              Showing {Math.min(filteredAlerts.length, 100)} of {filteredAlerts.length} alerts
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
