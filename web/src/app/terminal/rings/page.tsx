'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import InfoTooltip from '../../../components/ui/InfoTooltip'
import { useEffect, useState, useMemo, useRef } from 'react'
import { useIntelFeed } from '@/hooks/useIntelFeed'

interface RingNode {
  id: string
  entityId: string
  type: 'whale' | 'manipulation' | 'darkpool' | 'smartmoney'
  activityCount: number
  x: number
  y: number
  angle: number
}

interface Ring {
  id: string
  name: string
  nodes: RingNode[]
  severity: 'high' | 'medium' | 'low'
  score: number
  activityCount: number
  timestamp: number
  isNew: boolean
  chains: Set<string>
  tokens: Set<string>
}

type SeverityFilter = 'all' | 'high' | 'medium' | 'low'
type TimeFilter = 'all' | '5min' | '1hr' | '24hr'

export default function RingDetectorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rings, setRings] = useState<Ring[]>([])
  const [selectedRing, setSelectedRing] = useState<Ring | null>(null)
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [animationFrame, setAnimationFrame] = useState(0)
  
  const { latestAlert, alertHistory, connectionStatus } = useIntelFeed()

  const nodeConfig = {
    whale: { color: '#06b6d4', size: 8 },
    manipulation: { color: '#ef4444', size: 10 },
    darkpool: { color: '#6366f1', size: 7 },
    smartmoney: { color: '#a855f7', size: 9 }
  }

  const severityConfig = {
    high: { color: '#ef4444', glow: 20, pulse: true },
    medium: { color: '#fbbf24', glow: 15, pulse: false },
    low: { color: '#6366f1', glow: 10, pulse: false }
  }

  const getNodeType = (alertType: string): RingNode['type'] => {
    const typeStr = alertType.toLowerCase()
    if (typeStr.includes('whale')) return 'whale'
    if (typeStr.includes('manipulation')) return 'manipulation'
    if (typeStr.includes('darkpool')) return 'darkpool'
    return 'smartmoney'
  }

  const generateCircularLayout = (nodeCount: number, centerX: number, centerY: number, radius: number): { x: number; y: number; angle: number }[] => {
    const positions = []
    const angleStep = (2 * Math.PI) / nodeCount
    
    for (let i = 0; i < nodeCount; i++) {
      const angle = i * angleStep - Math.PI / 2 // Start from top
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      positions.push({ x, y, angle })
    }
    
    return positions
  }

  useEffect(() => {
    if (!latestAlert) return

    const alertType = latestAlert.intelligence?.event?.event_type || latestAlert.type || 'alert'
    const score = latestAlert.score || 0
    const severity: 'high' | 'medium' | 'low' = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'
    
    if (!alertType.toLowerCase().includes('manipulation') && 
        !alertType.toLowerCase().includes('coordination') &&
        !alertType.toLowerCase().includes('ring')) {
      return
    }

    const nodeType = getNodeType(alertType)
    const entityId = latestAlert.intelligence?.entity?.entity_id || `entity-${Date.now()}`
    const chain = latestAlert.intelligence?.event?.chain || 'unknown'
    const token = latestAlert.intelligence?.event?.token || 'unknown'

    setRings(prev => {
      const newRings = [...prev]
      
      let targetRing = newRings.find(ring => 
        ring.severity === severity && 
        ring.nodes.length < 30 &&
        (Date.now() - ring.timestamp) < 3600000 // Within 1 hour
      )

      if (!targetRing && newRings.length < 10) {
        const ringId = `ring-${String.fromCharCode(65 + newRings.length)}` // Ring A, B, C...
        targetRing = {
          id: ringId,
          name: `Ring ${String.fromCharCode(65 + newRings.length)}`,
          nodes: [],
          severity,
          score,
          activityCount: 0,
          timestamp: Date.now(),
          isNew: true,
          chains: new Set(),
          tokens: new Set()
        }
        newRings.push(targetRing)

        setTimeout(() => {
          setRings(current => 
            current.map(ring => 
              ring.id === ringId ? { ...ring, isNew: false } : ring
            )
          )
        }, 3000)
      }

      if (targetRing) {
        const newNode: RingNode = {
          id: `node-${Date.now()}-${Math.random()}`,
          entityId,
          type: nodeType,
          activityCount: 1,
          x: 0,
          y: 0,
          angle: 0
        }

        targetRing.nodes.push(newNode)
        targetRing.activityCount++
        targetRing.chains.add(chain)
        targetRing.tokens.add(token)
        targetRing.score = Math.max(targetRing.score, score)
        targetRing.severity = targetRing.score >= 0.7 ? 'high' : targetRing.score >= 0.4 ? 'medium' : 'low'
      }

      return newRings
    })

  }, [latestAlert])

  useEffect(() => {
    if (alertHistory && alertHistory.length > 0) {
      const manipulationAlerts = alertHistory.filter(alert => {
        const alertType = (alert.intelligence?.event?.event_type || alert.type || '').toLowerCase()
        return alertType.includes('manipulation') || 
               alertType.includes('coordination') || 
               alertType.includes('ring')
      })

      if (manipulationAlerts.length > 0) {
        const initialRings: Ring[] = []
        
        const ringCount = Math.min(5, Math.ceil(manipulationAlerts.length / 5))
        
        for (let i = 0; i < ringCount; i++) {
          const ringAlerts = manipulationAlerts.slice(i * 5, (i + 1) * 5)
          const avgScore = ringAlerts.reduce((sum, a) => sum + (a.score || 0), 0) / ringAlerts.length
          const severity: 'high' | 'medium' | 'low' = avgScore >= 0.7 ? 'high' : avgScore >= 0.4 ? 'medium' : 'low'
          
          const nodes: RingNode[] = ringAlerts.map((alert, idx) => {
            const alertType = alert.intelligence?.event?.event_type || alert.type || 'alert'
            return {
              id: `init-node-${i}-${idx}`,
              entityId: alert.intelligence?.entity?.entity_id || `entity-${i}-${idx}`,
              type: getNodeType(alertType),
              activityCount: 1,
              x: 0,
              y: 0,
              angle: 0
            }
          })

          initialRings.push({
            id: `ring-${String.fromCharCode(65 + i)}`,
            name: `Ring ${String.fromCharCode(65 + i)}`,
            nodes,
            severity,
            score: avgScore,
            activityCount: ringAlerts.length,
            timestamp: Date.now() - (i * 60000),
            isNew: false,
            chains: new Set(ringAlerts.map(a => a.intelligence?.event?.chain || 'unknown').filter(Boolean)),
            tokens: new Set(ringAlerts.map(a => a.intelligence?.event?.token || 'unknown').filter(Boolean))
          })
        }

        setRings(initialRings)
      }
    }
  }, [alertHistory])

  const filteredRings = useMemo(() => {
    let filtered = rings

    if (severityFilter !== 'all') {
      filtered = filtered.filter(ring => ring.severity === severityFilter)
    }

    if (timeFilter !== 'all') {
      const now = Date.now()
      const cutoffTime = new Date()
      
      switch (timeFilter) {
        case '5min':
          cutoffTime.setMinutes(cutoffTime.getMinutes() - 5)
          break
        case '1hr':
          cutoffTime.setHours(cutoffTime.getHours() - 1)
          break
        case '24hr':
          cutoffTime.setHours(cutoffTime.getHours() - 24)
          break
      }
      
      filtered = filtered.filter(ring => ring.timestamp >= cutoffTime.getTime())
    }

    return filtered
  }, [rings, severityFilter, timeFilter])

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1)
    }, 50) // 20 FPS

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height

    ctx.fillStyle = '#020617'
    ctx.fillRect(0, 0, width, height)

    const ringCount = filteredRings.length
    if (ringCount === 0) return

    const cols = Math.ceil(Math.sqrt(ringCount))
    const rows = Math.ceil(ringCount / cols)
    const cellWidth = width / cols
    const cellHeight = height / rows

    filteredRings.forEach((ring, ringIndex) => {
      const col = ringIndex % cols
      const row = Math.floor(ringIndex / cols)
      const centerX = col * cellWidth + cellWidth / 2
      const centerY = row * cellHeight + cellHeight / 2
      const radius = Math.min(cellWidth, cellHeight) * 0.35

      const positions = generateCircularLayout(ring.nodes.length, centerX, centerY, radius)
      ring.nodes.forEach((node, i) => {
        node.x = positions[i].x
        node.y = positions[i].y
        node.angle = positions[i].angle
      })

      const config = severityConfig[ring.severity]
      
      if (ring.isNew || (config.pulse && animationFrame % 20 < 10)) {
        const glowRadius = radius + config.glow + (ring.isNew ? 5 : 0)
        const gradient = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, glowRadius)
        gradient.addColorStop(0, `${config.color}00`)
        gradient.addColorStop(0.5, `${config.color}40`)
        gradient.addColorStop(1, `${config.color}00`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(centerX, centerY, glowRadius, 0, 2 * Math.PI)
        ctx.fill()
      }

      ctx.strokeStyle = config.color
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.globalAlpha = 1

      ctx.strokeStyle = config.color
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.3
      for (let i = 0; i < ring.nodes.length; i++) {
        for (let j = i + 1; j < ring.nodes.length; j++) {
          const node1 = ring.nodes[i]
          const node2 = ring.nodes[j]
          
          const waveOffset = (animationFrame + i * 10 + j * 10) % 100
          if (waveOffset < 50) {
            ctx.beginPath()
            ctx.moveTo(node1.x, node1.y)
            ctx.lineTo(node2.x, node2.y)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1

      ring.nodes.forEach(node => {
        const nodeConf = nodeConfig[node.type]
        const nodeSize = nodeConf.size + (ring.isNew ? 2 : 0)

        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeSize * 2)
        gradient.addColorStop(0, `${nodeConf.color}80`)
        gradient.addColorStop(1, `${nodeConf.color}00`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeSize * 2, 0, 2 * Math.PI)
        ctx.fill()

        ctx.fillStyle = nodeConf.color
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI)
        ctx.fill()

        ctx.strokeStyle = '#020617'
        ctx.lineWidth = 2
        ctx.stroke()
      })

      ctx.fillStyle = '#e5e7eb'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(ring.name, centerX, centerY)

      ctx.font = '12px sans-serif'
      ctx.fillStyle = '#9ca3af'
      ctx.fillText(`${ring.nodes.length} entities`, centerX, centerY + 20)
    })

  }, [filteredRings, animationFrame])

  const severityFilters: { type: SeverityFilter; label: string }[] = [
    { type: 'all', label: 'All Rings' },
    { type: 'high', label: 'High Risk' },
    { type: 'medium', label: 'Medium' },
    { type: 'low', label: 'Low' }
  ]

  const timeFilters: { type: TimeFilter; label: string }[] = [
    { type: 'all', label: 'All Time' },
    { type: '5min', label: 'Last 5m' },
    { type: '1hr', label: 'Last 1h' },
    { type: '24hr', label: 'Last 24h' }
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <TerminalBackButton className="mb-4" />
          <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-cyan-400">Ring Detector</h1>
            <InfoTooltip content="Displays confirmed coordination structures that meet strict detection thresholds. Rings shown here have passed multiple validation criteria." />
          </div>
          <p className="text-sm text-gray-400">Manipulation ring and coordinated wallet clusters</p>
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

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-cyan-500/20">
        <div className="flex gap-2">
          {severityFilters.map(filter => (
            <button
              key={filter.type}
              onClick={() => setSeverityFilter(filter.type)}
              className={`
                px-4 py-2 rounded-lg transition-all text-sm font-medium
                ${severityFilter === filter.type
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800/50 text-gray-400 hover:text-cyan-400 hover:bg-slate-800'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {timeFilters.map(filter => (
            <button
              key={filter.type}
              onClick={() => setTimeFilter(filter.type)}
              className={`
                px-4 py-2 rounded-lg transition-all text-sm font-medium
                ${timeFilter === filter.type
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800/50 text-gray-400 hover:text-cyan-400 hover:bg-slate-800'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-400">
          <span>Active Rings:</span>
          <span className="text-cyan-400 font-bold">{filteredRings.length}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Canvas Container */}
        <div className="flex-1 relative bg-slate-950 rounded-lg border border-cyan-500/20 overflow-hidden">
          {filteredRings.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-gray-500 text-lg">No manipulation rings detected</p>
              <p className="text-gray-600 text-sm mt-2">Waiting for coordination events...</p>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-pointer"
              onClick={(e) => {
                const canvas = canvasRef.current
                if (!canvas) return

                const rect = canvas.getBoundingClientRect()
                const x = e.clientX - rect.left
                const y = e.clientY - rect.top

                const ringCount = filteredRings.length
                const cols = Math.ceil(Math.sqrt(ringCount))
                const rows = Math.ceil(ringCount / cols)
                const cellWidth = rect.width / cols
                const cellHeight = rect.height / rows

                filteredRings.forEach((ring, ringIndex) => {
                  const col = ringIndex % cols
                  const row = Math.floor(ringIndex / cols)
                  const centerX = col * cellWidth + cellWidth / 2
                  const centerY = row * cellHeight + cellHeight / 2
                  const radius = Math.min(cellWidth, cellHeight) * 0.35

                  const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
                  if (distance <= radius + 20) {
                    setSelectedRing(ring)
                  }
                })
              }}
            />
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-4 max-w-xs">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="text-gray-300">Whale</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-gray-300">Manipulation Actor</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-400" />
                <span className="text-gray-300">Darkpool</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <span className="text-gray-300">Smart Money</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-cyan-500/20 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
                <span className="text-gray-300 text-xs">High Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-gray-300 text-xs">Medium Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-400" />
                <span className="text-gray-300 text-xs">Low Risk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ring Details Panel */}
        {selectedRing && (
          <div className="hidden md:block w-80 bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-cyan-400">{selectedRing.name}</h3>
              <button
                onClick={() => setSelectedRing(null)}
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Severity Badge */}
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                selectedRing.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                selectedRing.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-indigo-500/20 text-indigo-400'
              }`}>
                {selectedRing.severity.toUpperCase()} RISK
              </span>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Entities:</span>
                <span className="text-cyan-400 font-bold">{selectedRing.nodes.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Activity:</span>
                <span className="text-cyan-400 font-bold">{selectedRing.activityCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Score:</span>
                <span className="text-cyan-400 font-bold">{(selectedRing.score * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Cross-chain Footprint */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Cross-chain Footprint</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedRing.chains).map(chain => (
                  <span key={chain} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                    {chain}
                  </span>
                ))}
              </div>
            </div>

            {/* Tokens */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Tokens</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedRing.tokens).map(token => (
                  <span key={token} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                    {token}
                  </span>
                ))}
              </div>
            </div>

            {/* Entity List */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Entities</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedRing.nodes.map(node => {
                  const config = nodeConfig[node.type]
                  return (
                    <div
                      key={node.id}
                      className="bg-slate-800/50 border border-cyan-500/10 rounded p-2"
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-xs text-gray-400 font-mono truncate">
                          {node.entityId.substring(0, 12)}...
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Type: <span className="text-cyan-400">{node.type}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
