'use client'

import { useEffect, useState, useRef } from 'react'
import { useIntelFeed } from '@/hooks/useIntelFeed'

interface ConfirmationModal {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
}

export default function SettingsPage() {
  const [fps, setFps] = useState(0)
  const [memoryUsage, setMemoryUsage] = useState(0)
  const [uptime, setUptime] = useState(0)
  const [lastReload, setLastReload] = useState(Date.now())
  const [reconnectCount, setReconnectCount] = useState(0)
  const [latency, setLatency] = useState(0)
  const [workerRunning, setWorkerRunning] = useState(true)
  const [simulationMode, setSimulationMode] = useState(true)
  const [simulationRate, setSimulationRate] = useState(5)
  const [darkMode, setDarkMode] = useState(true)
  const [cyanGlow, setCyanGlow] = useState(true)
  const [compactMode, setCompactMode] = useState(false)
  const [confirmModal, setConfirmModal] = useState<ConfirmationModal>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })
  
  const { latestAlert, alertHistory, connectionStatus } = useIntelFeed()
  const frameCountRef = useRef(0)
  const lastFrameTimeRef = useRef(Date.now())
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    let animationFrameId: number

    const calculateFPS = () => {
      frameCountRef.current++
      const now = Date.now()
      const elapsed = now - lastFrameTimeRef.current

      if (elapsed >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed))
        frameCountRef.current = 0
        lastFrameTimeRef.current = now
      }

      animationFrameId = requestAnimationFrame(calculateFPS)
    }

    animationFrameId = requestAnimationFrame(calculateFPS)

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  useEffect(() => {
    const updateMemory = () => {
      if ('memory' in performance && (performance as any).memory) {
        const mem = (performance as any).memory
        const usedMB = mem.usedJSHeapSize / 1048576
        setMemoryUsage(Math.round(usedMB))
      }
    }

    updateMemory()
    const interval = setInterval(updateMemory, 2000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(Date.now() - startTimeRef.current)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const start = Date.now()
      setTimeout(() => {
        setLatency(Date.now() - start)
      }, 0)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const formatUptime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const entityCount = alertHistory ? new Set(alertHistory.map(a => a.intelligence?.entity?.entity_id).filter(Boolean)).size : 0
  const tokenCount = alertHistory ? new Set(alertHistory.map(a => a.intelligence?.event?.token).filter(Boolean)).size : 0
  const chainCount = alertHistory ? new Set(alertHistory.map(a => a.intelligence?.event?.chain).filter(Boolean)).size : 0
  const highRiskCount = alertHistory ? alertHistory.filter(a => (a.score || 0) >= 0.7).length : 0
  const mediumRiskCount = alertHistory ? alertHistory.filter(a => (a.score || 0) >= 0.4 && (a.score || 0) < 0.7).length : 0
  const lowRiskCount = alertHistory ? alertHistory.filter(a => (a.score || 0) < 0.4).length : 0

  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm
    })
  }

  const closeConfirmation = () => {
    setConfirmModal({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {}
    })
  }

  const handleConfirm = () => {
    confirmModal.onConfirm()
    closeConfirmation()
  }

  const handleClearLocalStorage = () => {
    showConfirmation(
      'Clear localStorage',
      'This will clear all locally stored data including recently viewed entities and preferences. Continue?',
      () => {
        localStorage.clear()
        alert('localStorage cleared successfully')
      }
    )
  }

  const handleResetEntityCache = () => {
    showConfirmation(
      'Reset Entity Cache',
      'This will reset the entity cache. Continue?',
      () => {
        localStorage.removeItem('entityCache')
        alert('Entity cache reset successfully')
      }
    )
  }

  const handleResetGhostMind = () => {
    showConfirmation(
      'Reset GhostMind Memory',
      'This will reset GhostMind conversation history. Continue?',
      () => {
        localStorage.removeItem('ghostmindMemory')
        alert('GhostMind memory reset successfully')
      }
    )
  }

  const handleDownloadSnapshot = () => {
    const snapshot = {
      timestamp: Date.now(),
      alerts: alertHistory,
      entities: entityCount,
      tokens: tokenCount,
      chains: chainCount,
      connectionStatus
    }

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ghostquant-snapshot-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFlushRedis = () => {
    showConfirmation(
      'Flush Redis Feed',
      '⚠️ DANGER: This will flush the Redis intelligence feed. This action cannot be undone. Continue?',
      () => {
        alert('Redis flush command sent (simulated)')
      }
    )
  }

  const handleKillWorkers = () => {
    showConfirmation(
      'Kill Workers',
      '⚠️ DANGER: This will stop all background intelligence workers. Intelligence processing will halt. Continue?',
      () => {
        setWorkerRunning(false)
        alert('Workers stopped (simulated)')
      }
    )
  }

  const handleRestartWorkers = () => {
    showConfirmation(
      'Restart Workers',
      'This will restart all background intelligence workers. Continue?',
      () => {
        setWorkerRunning(true)
        alert('Workers restarted (simulated)')
      }
    )
  }

  const handleReloadConnections = () => {
    showConfirmation(
      'Reload Client Connections',
      'This will reload all WebSocket and Socket.IO connections. Continue?',
      () => {
        setReconnectCount(prev => prev + 1)
        setLastReload(Date.now())
        alert('Connections reloaded (simulated)')
      }
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">System Intelligence & Settings</h1>
          <p className="text-sm text-gray-400">Platform health monitoring and configuration</p>
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

      {/* Main Content - Three Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto">
        {/* Left Column - System Health */}
        <div className="space-y-4">
          {/* WebSocket & Socket.IO Status */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">WebSocket & Socket.IO Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Connection:</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  connectionStatus === 'connected' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {connectionStatus === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Reconnect Count:</span>
                <span className="text-xs text-cyan-400 font-medium">{reconnectCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Latency:</span>
                <span className="text-xs text-cyan-400 font-medium">{latency}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Last Alert:</span>
                <span className="text-xs text-cyan-400 font-medium">
                  {latestAlert ? 'Just now' : 'Waiting...'}
                </span>
              </div>
            </div>
          </div>

          {/* Redis Intelligence Feed */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">Redis Intelligence Feed</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Total Events:</span>
                <span className="text-xs text-cyan-400 font-medium">{alertHistory?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Feed Velocity:</span>
                <span className="text-xs text-cyan-400 font-medium">
                  {alertHistory && alertHistory.length > 0 ? '~5 msg/min' : '0 msg/min'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Last Message:</span>
                <span className="text-xs text-cyan-400 font-medium">
                  {latestAlert ? 'Just now' : 'N/A'}
                </span>
              </div>
              <div className="pt-2 border-t border-cyan-500/20">
                <div className="text-xs text-gray-400 mb-2">Severity Distribution:</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-400">High:</span>
                    <span className="text-xs text-red-400 font-medium">{highRiskCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-yellow-400">Medium:</span>
                    <span className="text-xs text-yellow-400 font-medium">{mediumRiskCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Low:</span>
                    <span className="text-xs text-gray-400 font-medium">{lowRiskCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Worker Status */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">Worker Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Intelligence Worker:</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  workerRunning 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {workerRunning ? 'RUNNING' : 'STOPPED'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Simulation Mode:</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  simulationMode 
                    ? 'bg-yellow-500/20 text-yellow-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {simulationMode ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Loop Speed:</span>
                <span className="text-xs text-cyan-400 font-medium">50ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Queue Size:</span>
                <span className="text-xs text-cyan-400 font-medium">{alertHistory?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Processing Errors:</span>
                <span className="text-xs text-green-400 font-medium">0</span>
              </div>
            </div>
          </div>

          {/* System Uptime */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">System Uptime</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Session Uptime:</span>
                <span className="text-xs text-cyan-400 font-medium">{formatUptime(uptime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Last Reload:</span>
                <span className="text-xs text-cyan-400 font-medium">
                  {formatTimestamp(lastReload)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Performance & Metrics */}
        <div className="space-y-4">
          {/* Performance */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">Performance</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">FPS:</span>
                  <span className="text-xs text-cyan-400 font-medium">{fps}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full transition-all"
                    style={{ width: `${Math.min((fps / 60) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Memory Usage:</span>
                  <span className="text-xs text-cyan-400 font-medium">{memoryUsage} MB</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${Math.min((memoryUsage / 500) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">CPU Load:</span>
                <span className="text-xs text-cyan-400 font-medium">Browser Only</span>
              </div>
            </div>
          </div>

          {/* Data Metrics */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">Data Metrics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Entities Tracked:</span>
                <span className="text-xs text-cyan-400 font-medium">{entityCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Rings Detected:</span>
                <span className="text-xs text-cyan-400 font-medium">
                  {alertHistory ? alertHistory.filter(a => a.type?.toLowerCase().includes('manipulation')).length : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Active Tokens:</span>
                <span className="text-xs text-cyan-400 font-medium">{tokenCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Active Chains:</span>
                <span className="text-xs text-cyan-400 font-medium">{chainCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Alerts (Last Hour):</span>
                <span className="text-xs text-cyan-400 font-medium">{alertHistory?.length || 0}</span>
              </div>
              <div className="pt-2 border-t border-cyan-500/20">
                <div className="text-xs text-gray-400 mb-2">Risk Ratio:</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="text-xs text-red-400 mb-1">High: {highRiskCount}</div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${alertHistory?.length ? (highRiskCount / alertHistory.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-yellow-400 mb-1">Med: {mediumRiskCount}</div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 rounded-full"
                        style={{ width: `${alertHistory?.length ? (mediumRiskCount / alertHistory.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 mb-1">Low: {lowRiskCount}</div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-500 rounded-full"
                        style={{ width: `${alertHistory?.length ? (lowRiskCount / alertHistory.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Diagnostics */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">Terminal Diagnostics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Timeline Events:</span>
                <span className="text-xs text-cyan-400 font-medium">{alertHistory?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Graph Nodes:</span>
                <span className="text-xs text-cyan-400 font-medium">{Math.min(entityCount * 2, 200)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Graph Edges:</span>
                <span className="text-xs text-cyan-400 font-medium">{Math.min(entityCount * 3, 300)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Ring Systems:</span>
                <span className="text-xs text-cyan-400 font-medium">
                  {Math.min(Math.floor((alertHistory?.filter(a => a.type?.toLowerCase().includes('manipulation')).length || 0) / 5), 10)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">GhostMind Insights:</span>
                <span className="text-xs text-cyan-400 font-medium">{alertHistory?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Entity Cache Size:</span>
                <span className="text-xs text-cyan-400 font-medium">{entityCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Settings & Controls */}
        <div className="space-y-4">
          {/* UI Theme Controls */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">UI Theme Controls</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Dark Mode:</span>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    darkMode 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                      : 'bg-slate-800 text-gray-400 border border-gray-500/20'
                  }`}
                >
                  {darkMode ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Cyan Glow:</span>
                <button
                  onClick={() => setCyanGlow(!cyanGlow)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    cyanGlow 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                      : 'bg-slate-800 text-gray-400 border border-gray-500/20'
                  }`}
                >
                  {cyanGlow ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Compact Mode:</span>
                <button
                  onClick={() => setCompactMode(!compactMode)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    compactMode 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                      : 'bg-slate-800 text-gray-400 border border-gray-500/20'
                  }`}
                >
                  {compactMode ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">Simulation Controls</h3>
            <div className="space-y-3">
              <button
                onClick={() => setSimulationMode(true)}
                disabled={simulationMode}
                className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-xs text-green-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Intel Simulator
              </button>
              <button
                onClick={() => setSimulationMode(false)}
                disabled={!simulationMode}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-xs text-red-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Stop Intel Simulator
              </button>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Event Rate:</span>
                  <span className="text-xs text-cyan-400 font-medium">{simulationRate} events/sec</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={simulationRate}
                  onChange={(e) => setSimulationRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Data Tools */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">Data Tools</h3>
            <div className="space-y-2">
              <button
                onClick={handleClearLocalStorage}
                className="w-full px-4 py-2 bg-slate-800/50 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/50 rounded-lg text-xs text-gray-300 hover:text-cyan-400 font-medium transition-all"
              >
                Clear localStorage
              </button>
              <button
                onClick={handleResetEntityCache}
                className="w-full px-4 py-2 bg-slate-800/50 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/50 rounded-lg text-xs text-gray-300 hover:text-cyan-400 font-medium transition-all"
              >
                Reset Entity Cache
              </button>
              <button
                onClick={handleResetGhostMind}
                className="w-full px-4 py-2 bg-slate-800/50 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/50 rounded-lg text-xs text-gray-300 hover:text-cyan-400 font-medium transition-all"
              >
                Reset GhostMind Memory
              </button>
              <button
                onClick={handleDownloadSnapshot}
                className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-xs text-cyan-400 font-medium transition-all"
              >
                Download Intelligence Snapshot
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 hover:border-red-500/50 transition-all">
            <h3 className="text-sm font-bold text-red-400 mb-3">⚠️ Danger Zone</h3>
            <div className="space-y-2">
              <button
                onClick={handleFlushRedis}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-xs text-red-400 font-medium transition-all"
              >
                Flush Redis Feed
              </button>
              <button
                onClick={handleKillWorkers}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-xs text-red-400 font-medium transition-all"
              >
                Kill Workers
              </button>
              <button
                onClick={handleRestartWorkers}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-xs text-red-400 font-medium transition-all"
              >
                Restart Workers
              </button>
              <button
                onClick={handleReloadConnections}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-xs text-red-400 font-medium transition-all"
              >
                Reload Client Connections
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-cyan-400 mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-gray-300 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={closeConfirmation}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-gray-500/20 rounded-lg text-sm text-gray-300 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-sm text-red-400 font-medium transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
