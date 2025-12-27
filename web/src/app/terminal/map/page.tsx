'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useEffect, useState, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useIntelFeed } from '@/hooks/useIntelFeed'

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false })

interface ThreatPoint {
  id: string
  lat: number
  lng: number
  type: 'whale' | 'manipulation' | 'ai' | 'darkpool' | 'stablecoin' | 'derivatives'
  severity: 'high' | 'medium' | 'low'
  size: number
  color: string
  label: string
  timestamp: number
}

interface ThreatArc {
  id: string
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  type: 'whale' | 'manipulation' | 'ai' | 'darkpool' | 'stablecoin' | 'derivatives'
  color: string
  label: string
  timestamp: number
}

type FilterType = 'all' | 'whale' | 'manipulation' | 'ai' | 'darkpool' | 'stablecoin' | 'derivatives'

export default function ThreatMapPage() {
  const globeRef = useRef<any>()
  const [showGuide, setShowGuide] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [threatPoints, setThreatPoints] = useState<ThreatPoint[]>([])
  const [threatArcs, setThreatArcs] = useState<ThreatArc[]>([])
  const [showAlertPanel, setShowAlertPanel] = useState(true)
  const [recentAlerts, setRecentAlerts] = useState<any[]>([])
  
  const { latestAlert, alertHistory, connectionStatus } = useIntelFeed()

  const getTypeColor = (type: string): string => {
    const typeMap: Record<string, string> = {
      whale: '#06b6d4', // cyan
      manipulation: '#ef4444', // red
      ai: '#fbbf24', // yellow
      darkpool: '#8b5cf6', // purple
      stablecoin: '#10b981', // green
      derivatives: '#f97316', // orange
      intelligence: '#06b6d4',
      signal: '#fbbf24',
      institution: '#8b5cf6',
      billionaire: '#06b6d4'
    }
    
    const lowerType = type.toLowerCase()
    for (const key in typeMap) {
      if (lowerType.includes(key)) {
        return typeMap[key]
      }
    }
    return '#06b6d4' // default cyan
  }

  const generateRandomCoords = () => ({
    lat: (Math.random() - 0.5) * 180,
    lng: (Math.random() - 0.5) * 360
  })

  useEffect(() => {
    if (!latestAlert) return

    const alertType = latestAlert.intelligence?.event?.event_type || latestAlert.type || 'alert'
    const score = latestAlert.score || 0
    const severity: 'high' | 'medium' | 'low' = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'
    
    let threatType: ThreatPoint['type'] = 'ai'
    const typeStr = alertType.toLowerCase()
    if (typeStr.includes('whale')) threatType = 'whale'
    else if (typeStr.includes('manipulation')) threatType = 'manipulation'
    else if (typeStr.includes('darkpool')) threatType = 'darkpool'
    else if (typeStr.includes('stablecoin')) threatType = 'stablecoin'
    else if (typeStr.includes('derivative')) threatType = 'derivatives'
    else if (typeStr.includes('ai') || typeStr.includes('signal')) threatType = 'ai'

    const color = getTypeColor(alertType)
    const coords = generateRandomCoords()
    
    const newPoint: ThreatPoint = {
      id: `point-${Date.now()}-${Math.random()}`,
      lat: coords.lat,
      lng: coords.lng,
      type: threatType,
      severity,
      size: severity === 'high' ? 1.5 : severity === 'medium' ? 1.0 : 0.7,
      color,
      label: `${alertType} - ${severity}`,
      timestamp: Date.now()
    }

    setThreatPoints(prev => [newPoint, ...prev].slice(0, 100)) // Keep last 100 points

    if (Math.random() > 0.5) {
      const endCoords = generateRandomCoords()
      const newArc: ThreatArc = {
        id: `arc-${Date.now()}-${Math.random()}`,
        startLat: coords.lat,
        startLng: coords.lng,
        endLat: endCoords.lat,
        endLng: endCoords.lng,
        type: threatType,
        color,
        label: `${alertType} flow`,
        timestamp: Date.now()
      }
      setThreatArcs(prev => [newArc, ...prev].slice(0, 50)) // Keep last 50 arcs
    }

    setRecentAlerts(prev => [latestAlert, ...prev].slice(0, 10))

  }, [latestAlert])

  useEffect(() => {
    if (alertHistory && alertHistory.length > 0) {
      setRecentAlerts(alertHistory.slice(0, 10))
    }
  }, [alertHistory])

  const filteredPoints = useMemo(() => {
    if (activeFilter === 'all') return threatPoints
    return threatPoints.filter(point => point.type === activeFilter)
  }, [threatPoints, activeFilter])

  const filteredArcs = useMemo(() => {
    if (activeFilter === 'all') return threatArcs
    return threatArcs.filter(arc => arc.type === activeFilter)
  }, [threatArcs, activeFilter])

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true
      globeRef.current.controls().autoRotateSpeed = 0.5
    }
  }, [])

  const filters: { type: FilterType; label: string; icon: string }[] = [
    { type: 'all', label: 'All Threats', icon: '🌐' },
    { type: 'whale', label: 'Whale', icon: '🐋' },
    { type: 'manipulation', label: 'Manipulation', icon: '⚠️' },
    { type: 'ai', label: 'AI Signals', icon: '🤖' },
    { type: 'darkpool', label: 'Darkpool', icon: '🕶️' },
    { type: 'stablecoin', label: 'Stablecoin', icon: '💵' },
    { type: 'derivatives', label: 'Derivatives', icon: '📊' }
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <TerminalBackButton className="mb-4" />
          <div>
          <h1 className="text-3xl font-bold text-cyan-400">Global Threat Map</h1>
          <p className="text-sm text-gray-400">Real-time intelligence visualization</p>
        </div>
        <div className="flex items-center gap-3">
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
          <button
            onClick={() => setShowAlertPanel(!showAlertPanel)}
            className="md:hidden px-3 py-1.5 rounded-lg bg-slate-800/50 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
          >
            {showAlertPanel ? 'Hide' : 'Show'} Alerts
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-cyan-500/20">
        {filters.map(filter => (
          <button
            key={filter.type}
            onClick={() => setActiveFilter(filter.type)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium
              ${activeFilter === filter.type
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800/50 text-gray-400 hover:text-cyan-400 hover:bg-slate-800'
              }
            `}
          >
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Globe Container */}
        <div className="flex-1 relative bg-slate-950 rounded-lg border border-cyan-500/20 overflow-hidden">
          <Globe
            ref={globeRef}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            backgroundColor="rgba(15, 23, 42, 1)"
            
            pointsData={filteredPoints}
            pointLat="lat"
            pointLng="lng"
            pointColor="color"
            pointAltitude={0.01}
            pointRadius={(d: any) => d.size}
            pointLabel={(d: any) => d.label}
            
            arcsData={filteredArcs}
            arcStartLat="startLat"
            arcStartLng="startLng"
            arcEndLat="endLat"
            arcEndLng="endLng"
            arcColor="color"
            arcDashLength={0.4}
            arcDashGap={0.2}
            arcDashAnimateTime={2000}
            arcStroke={0.5}
            arcLabel={(d: any) => d.label}
            
            ringsData={filteredPoints.filter(p => p.severity === 'high')}
            ringLat="lat"
            ringLng="lng"
            ringColor="color"
            ringMaxRadius={5}
            ringPropagationSpeed={2}
            ringRepeatPeriod={1500}
          />

          {/* Legend Panel */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-4 max-w-xs">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="text-gray-300">Whale Activity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-gray-300">Manipulation Ring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-gray-300">AI Signal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <span className="text-gray-300">Darkpool Flow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-gray-300">Stablecoin</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400" />
                <span className="text-gray-300">Derivatives</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-cyan-500/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Active Threats:</span>
                <span className="text-cyan-400 font-bold">{filteredPoints.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-400">Active Flows:</span>
                <span className="text-cyan-400 font-bold">{filteredArcs.length}</span>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-3">
            <div className="text-xs text-gray-400">Filter: <span className="text-cyan-400 font-medium">{activeFilter === 'all' ? 'All Threats' : filters.find(f => f.type === activeFilter)?.label}</span></div>
          </div>
        </div>

        {/* Alert Feed Panel (Desktop) */}
        {showAlertPanel && (
          <div className="hidden md:block w-80 bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 overflow-y-auto">
            <h3 className="text-lg font-bold text-cyan-400 mb-3">Recent Alerts</h3>
            <div className="space-y-2">
              {recentAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No alerts yet. Waiting for intelligence...
                </div>
              ) : (
                recentAlerts.map((alert, idx) => {
                  const alertType = alert.intelligence?.event?.event_type || alert.type || 'alert'
                  const score = alert.score || 0
                  const severity = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'
                  const color = getTypeColor(alertType)
                  
                  return (
                    <div
                      key={idx}
                      className="bg-slate-800/50 border border-cyan-500/10 rounded-lg p-3 hover:border-cyan-500/30 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div 
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              severity === 'high' ? 'bg-red-500/20 text-red-400' :
                              severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {severity.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-300 line-clamp-2">
                            {alertType}
                          </p>
                          {alert.intelligence?.event?.token && (
                            <p className="text-xs text-cyan-400 mt-1">
                              {alert.intelligence.event.token}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Alert Panel */}
      {showAlertPanel && (
        <div className="md:hidden mt-4 bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 max-h-64 overflow-y-auto">
          <h3 className="text-lg font-bold text-cyan-400 mb-3">Recent Alerts</h3>
          <div className="space-y-2">
            {recentAlerts.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                No alerts yet. Waiting for intelligence...
              </div>
            ) : (
              recentAlerts.slice(0, 5).map((alert, idx) => {
                const alertType = alert.intelligence?.event?.event_type || alert.type || 'alert'
                const score = alert.score || 0
                const severity = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'
                const color = getTypeColor(alertType)
                
                return (
                  <div
                    key={idx}
                    className="bg-slate-800/50 border border-cyan-500/10 rounded-lg p-2"
                  >
                    <div className="flex items-start gap-2">
                      <div 
                        className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            severity === 'high' ? 'bg-red-500/20 text-red-400' :
                            severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 truncate">
                          {alertType}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
