'use client'

import { useEffect, useState, useRef } from 'react'
import { useIntelFeed } from '@/hooks/useIntelFeed'

type TabType = 'alerts' | 'intelligence' | 'signals' | 'manipulation' | 'system'

export default function DebugConsole() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('system')
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [fps, setFps] = useState(60)
  const [apiLatency, setApiLatency] = useState<number | null>(null)
  const [alertCount, setAlertCount] = useState(0)
  const [eventsPerSec, setEventsPerSec] = useState(0)
  const [signalsPerSec, setSignalsPerSec] = useState(0)
  const [recentAlerts, setRecentAlerts] = useState<any[]>([])
  const [activityPulse, setActivityPulse] = useState(false)
  
  const consoleRef = useRef<HTMLDivElement>(null)
  const frameCountRef = useRef(0)
  const lastFrameTimeRef = useRef(Date.now())
  const eventCountRef = useRef(0)
  const lastEventTimeRef = useRef(Date.now())
  
  const { latestAlert, alertHistory, connectionStatus, stats } = useIntelFeed()

  useEffect(() => {
    const savedState = localStorage.getItem('debugConsole')
    if (savedState) {
      try {
        const { isOpen: savedOpen, position: savedPosition } = JSON.parse(savedState)
        setIsOpen(savedOpen || false)
        if (savedPosition) {
          setPosition(savedPosition)
        } else {
          setPosition({ x: window.innerWidth - 420, y: window.innerHeight - 520 })
        }
      } catch (e) {
        setPosition({ x: window.innerWidth - 420, y: window.innerHeight - 520 })
      }
    } else {
      setPosition({ x: window.innerWidth - 420, y: window.innerHeight - 520 })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('debugConsole', JSON.stringify({ isOpen, position }))
  }, [isOpen, position])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (latestAlert) {
      setAlertCount(prev => prev + 1)
      setRecentAlerts(prev => [latestAlert, ...prev].slice(0, 50))
      eventCountRef.current++
      
      setActivityPulse(true)
      setTimeout(() => setActivityPulse(false), 500)
    }
  }, [latestAlert])

  useEffect(() => {
    const fpsInterval = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastFrameTimeRef.current
      const currentFps = Math.round((frameCountRef.current * 1000) / elapsed)
      setFps(currentFps)
      frameCountRef.current = 0
      lastFrameTimeRef.current = now
    }, 1000)

    const eventsInterval = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastEventTimeRef.current
      const eps = Math.round((eventCountRef.current * 1000) / elapsed)
      setEventsPerSec(eps)
      eventCountRef.current = 0
      lastEventTimeRef.current = now
    }, 1000)

    const animationFrame = () => {
      frameCountRef.current++
      requestAnimationFrame(animationFrame)
    }
    requestAnimationFrame(animationFrame)

    return () => {
      clearInterval(fpsInterval)
      clearInterval(eventsInterval)
    }
  }, [])

  useEffect(() => {
    const testLatency = async () => {
      try {
        const start = Date.now()
        await fetch('/api/health')
        const end = Date.now()
        setApiLatency(end - start)
      } catch (e) {
        setApiLatency(null)
      }
    }

    testLatency()
    const interval = setInterval(testLatency, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  const getConnectionColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-400'
      case 'connecting':
        return 'text-yellow-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getConnectionIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return '●'
      case 'connecting':
        return '◐'
      case 'error':
        return '✕'
      default:
        return '○'
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900/90 backdrop-blur-sm border border-blue-500/30 rounded-lg px-3 py-2 text-xs text-blue-400 hover:bg-slate-800/90 transition-all shadow-lg"
        >
          <span className="font-mono">Ctrl+Shift+G</span> Debug Console
        </button>
      </div>
    )
  }

  return (
    <div
      ref={consoleRef}
      className={`fixed z-50 ${isMinimized ? 'w-64' : 'w-96 md:w-[400px]'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 32px)'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={`
        bg-slate-900/95 backdrop-blur-md border border-blue-500/30 rounded-lg shadow-2xl
        ${activityPulse ? 'ring-2 ring-blue-400 animate-pulse' : ''}
      `}>
        {/* Header */}
        <div className="drag-handle cursor-move bg-gradient-to-r from-blue-900/40 to-blue-800/40 border-b border-blue-500/30 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="text-xs font-bold text-blue-400">DEBUG CONSOLE</span>
            <span className={`text-xs ${getConnectionColor(connectionStatus)} animate-pulse`}>
              {getConnectionIcon(connectionStatus)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMinimized ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-red-400 transition-colors p-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Tabs */}
            <div className="flex border-b border-slate-700 overflow-x-auto">
              {[
                { id: 'system' as TabType, label: 'System', icon: '⚙️' },
                { id: 'alerts' as TabType, label: 'Alerts', icon: '🔔' },
                { id: 'intelligence' as TabType, label: 'Intel', icon: '🧠' },
                { id: 'signals' as TabType, label: 'Signals', icon: '📊' },
                { id: 'manipulation' as TabType, label: 'Manip', icon: '⚠️' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 px-2 py-1.5 text-xs font-medium transition-all whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-slate-800/50'
                    }
                  `}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-3 max-h-96 overflow-y-auto text-xs font-mono space-y-2">
              {activeTab === 'system' && (
                <div className="space-y-2">
                  <div className="bg-slate-800/50 rounded p-2 space-y-1">
                    <div className="text-gray-400 font-bold mb-1">Connection Status</div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">WebSocket:</span>
                      <span className={getConnectionColor(connectionStatus)}>
                        {connectionStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="text-blue-400">{stats.connectionType?.toUpperCase() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reconnects:</span>
                      <span className="text-yellow-400">{stats.reconnectAttempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Connected:</span>
                      <span className="text-gray-400 text-[10px]">
                        {stats.lastConnected ? new Date(stats.lastConnected).toLocaleTimeString() : 'Never'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded p-2 space-y-1">
                    <div className="text-gray-400 font-bold mb-1">Performance</div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">FPS:</span>
                      <span className={fps >= 50 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'}>
                        {fps}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">API Latency:</span>
                      <span className={
                        apiLatency === null ? 'text-gray-400' :
                        apiLatency < 100 ? 'text-green-400' :
                        apiLatency < 300 ? 'text-yellow-400' : 'text-red-400'
                      }>
                        {apiLatency === null ? 'N/A' : `${apiLatency}ms`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Events/sec:</span>
                      <span className="text-blue-400">{eventsPerSec}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Signals/sec:</span>
                      <span className="text-purple-400">{signalsPerSec}</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded p-2 space-y-1">
                    <div className="text-gray-400 font-bold mb-1">Activity (Last 1 min)</div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Alerts:</span>
                      <span className="text-green-400">{alertCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Messages Received:</span>
                      <span className="text-blue-400">{stats.messagesReceived}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">History Size:</span>
                      <span className="text-gray-400">{alertHistory.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'alerts' && (
                <div className="space-y-1">
                  <div className="text-gray-400 font-bold mb-2">Recent Alerts ({recentAlerts.length})</div>
                  {recentAlerts.length === 0 ? (
                    <div className="text-gray-500 text-center py-4">No alerts yet</div>
                  ) : (
                    recentAlerts.slice(0, 10).map((alert, idx) => (
                      <div key={idx} className="bg-slate-800/50 rounded p-2 space-y-1">
                        <div className="flex justify-between items-start">
                          <span className={`
                            px-1.5 py-0.5 rounded text-[10px] font-bold
                            ${alert.score >= 0.7 ? 'bg-red-500/20 text-red-400' :
                              alert.score >= 0.4 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'}
                          `}>
                            {alert.score?.toFixed(2) || 'N/A'}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'N/A'}
                          </span>
                        </div>
                        <div className="text-gray-300 text-[10px] truncate">
                          {alert.intelligence?.event?.event_type || alert.type || 'Unknown'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'intelligence' && (
                <div className="space-y-2">
                  <div className="text-gray-400 font-bold mb-2">Intelligence Feed</div>
                  <div className="bg-slate-800/50 rounded p-2">
                    <div className="text-gray-500 text-center py-4">
                      Intelligence data will appear here
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'signals' && (
                <div className="space-y-2">
                  <div className="text-gray-400 font-bold mb-2">AI Signals</div>
                  <div className="bg-slate-800/50 rounded p-2">
                    <div className="text-gray-500 text-center py-4">
                      Signal data will appear here
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'manipulation' && (
                <div className="space-y-2">
                  <div className="text-gray-400 font-bold mb-2">Manipulation Detection</div>
                  <div className="bg-slate-800/50 rounded p-2">
                    <div className="text-gray-500 text-center py-4">
                      Manipulation alerts will appear here
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-700 px-3 py-1.5 flex items-center justify-between text-[10px]">
              <span className="text-gray-500">Ctrl+Shift+G to toggle</span>
              <span className="text-gray-600">v1.0.0</span>
            </div>
          </>
        )}

        {isMinimized && (
          <div className="px-3 py-2 text-xs text-gray-400">
            <div className="flex items-center justify-between">
              <span>Status: <span className={getConnectionColor(connectionStatus)}>{connectionStatus}</span></span>
              <span>FPS: {fps}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
