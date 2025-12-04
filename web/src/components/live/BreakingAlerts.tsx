'use client'

import { useEffect, useState } from 'react'
import { useIntelFeed } from '@/hooks/useIntelFeed'

interface BreakingAlert {
  id: string
  timestamp: string
  type: string
  severity: 'high' | 'medium' | 'low'
  score: number
  message: string
  isNew: boolean
}

const MAX_ALERTS = 20

export default function BreakingAlerts() {
  const [breakingAlerts, setBreakingAlerts] = useState<BreakingAlert[]>([])
  const { latestAlert } = useIntelFeed()

  useEffect(() => {
    if (!latestAlert) return

    const score = latestAlert.score || 0
    const severity: 'high' | 'medium' | 'low' = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'

    if (severity !== 'high' && score < 0.7) return

    const alertType = latestAlert.intelligence?.event?.event_type || latestAlert.type || 'alert'
    const message = getAlertMessage(alertType, latestAlert)

    const newAlert: BreakingAlert = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: latestAlert.timestamp || new Date().toISOString(),
      type: alertType,
      severity,
      score,
      message,
      isNew: true
    }

    setBreakingAlerts(prev => {
      const updated = [newAlert, ...prev].slice(0, MAX_ALERTS)
      return updated
    })

    setTimeout(() => {
      setBreakingAlerts(prev => 
        prev.map(alert => 
          alert.id === newAlert.id ? { ...alert, isNew: false } : alert
        )
      )
    }, 3000)
  }, [latestAlert])

  const getAlertMessage = (type: string, alert: any): string => {
    const typeStr = type.toLowerCase()
    
    if (typeStr.includes('whale')) {
      return `🐋 Large whale movement detected - ${alert.intelligence?.entity?.entity_id || 'Unknown wallet'}`
    } else if (typeStr.includes('manipulation')) {
      return `⚠️ Manipulation pattern detected - Coordinated activity identified`
    } else if (typeStr.includes('signal') || typeStr.includes('ai')) {
      return `🤖 AI Signal: High-confidence trading opportunity detected`
    } else if (typeStr.includes('derivative')) {
      return `📊 Derivatives Alert: Significant funding rate or OI change`
    } else if (typeStr.includes('darkpool') || typeStr.includes('dark_pool')) {
      return `🌙 Dark Pool Activity: Large OTC transaction detected`
    } else if (typeStr.includes('institution')) {
      return `🏛️ Institutional Flow: Smart money movement detected`
    } else if (typeStr.includes('billionaire')) {
      return `💎 Billionaire Activity: Ultra-wealthy wallet movement`
    } else {
      return `⚡ Critical Intelligence Alert`
    }
  }

  const getAlertIcon = (type: string) => {
    const typeStr = type.toLowerCase()
    
    if (typeStr.includes('whale')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    } else if (typeStr.includes('manipulation')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    } else if (typeStr.includes('signal') || typeStr.includes('ai')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    } else if (typeStr.includes('derivative')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      )
    } else if (typeStr.includes('darkpool') || typeStr.includes('dark_pool')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )
    } else {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  if (breakingAlerts.length === 0) {
    return null
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-red-900/20 to-slate-900 border border-red-500/30 rounded-lg">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-red-500/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs md:text-sm font-bold text-red-400 uppercase tracking-wider">
            Breaking Alerts
          </span>
        </div>
        <div className="text-xs text-gray-400 hidden md:block">
          {breakingAlerts.length} critical {breakingAlerts.length === 1 ? 'alert' : 'alerts'}
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="flex animate-scroll-left hover:pause-animation">
          {breakingAlerts.concat(breakingAlerts).map((alert, idx) => (
            <div
              key={`${alert.id}-${idx}`}
              className={`
                flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 
                border-r border-red-500/20 whitespace-nowrap flex-shrink-0
                transition-all duration-300
                ${alert.isNew ? 'bg-red-500/20 animate-pulse' : 'bg-transparent'}
              `}
            >
              <div className="flex items-center gap-2">
                <div className="text-red-400">
                  {getAlertIcon(alert.type)}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-bold bg-red-500/20 text-red-400 rounded border border-red-500/30">
                    {alert.score.toFixed(2)}
                  </span>
                  
                  <span className="text-xs md:text-sm text-gray-300">
                    {alert.message}
                  </span>
                  
                  <span className="text-xs text-gray-500 hidden md:inline">
                    {formatTimestamp(alert.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 60s linear infinite;
        }

        .pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
