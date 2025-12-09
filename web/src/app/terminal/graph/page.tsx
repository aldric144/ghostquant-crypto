'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useIntelFeed } from '@/hooks/useIntelFeed'

const ForceGraph2D = dynamic(() => import('react-force-graph').then(mod => mod.ForceGraph2D), { ssr: false })

interface GraphNode {
  id: string
  name: string
  type: 'whale' | 'billionaire' | 'institution' | 'manipulation' | 'darkpool' | 'contract' | 'ai'
  size: number
  color: string
  pulse: boolean
  timestamp: number
  x?: number
  y?: number
  vx?: number
  vy?: number
}

interface GraphLink {
  source: string
  target: string
  type: 'whale' | 'manipulation' | 'stablecoin' | 'derivatives' | 'darkpool' | 'default'
  strength: number
  color: string
  width: number
  timestamp: number
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

type FilterType = 'all' | 'whale' | 'institution' | 'manipulation' | 'darkpool' | 'stablecoin' | 'derivatives'

export default function InfluenceGraphPage() {
  const graphRef = useRef<any>()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })
  const [showAlertPanel, setShowAlertPanel] = useState(true)
  const [recentAlerts, setRecentAlerts] = useState<any[]>([])
  const [pulsingNodes, setPulsingNodes] = useState<Set<string>>(new Set())
  const { latestAlert, alertHistory, connectionStatus } = useIntelFeed()

  const nodeConfig = {
    whale: { color: '#06b6d4', size: 12 }, // cyan
    billionaire: { color: '#a855f7', size: 14 }, // purple
    institution: { color: '#3b82f6', size: 13 }, // blue
    manipulation: { color: '#ef4444', size: 11 }, // red
    darkpool: { color: '#6366f1', size: 10 }, // indigo
    contract: { color: '#10b981', size: 9 }, // green
    ai: { color: '#fbbf24', size: 11 } // yellow
  }

  const edgeConfig = {
    whale: { color: '#06b6d4', width: 2 },
    manipulation: { color: '#ef4444', width: 3 },
    stablecoin: { color: '#10b981', width: 2 },
    derivatives: { color: '#f97316', width: 2 },
    darkpool: { color: '#6366f1', width: 2 },
    default: { color: '#06b6d4', width: 1 }
  }

  const getNodeType = (alertType: string): GraphNode['type'] => {
    const typeStr = alertType.toLowerCase()
    if (typeStr.includes('whale')) return 'whale'
    if (typeStr.includes('billionaire')) return 'billionaire'
    if (typeStr.includes('institution')) return 'institution'
    if (typeStr.includes('manipulation')) return 'manipulation'
    if (typeStr.includes('darkpool')) return 'darkpool'
    if (typeStr.includes('contract')) return 'contract'
    if (typeStr.includes('ai') || typeStr.includes('signal')) return 'ai'
    return 'whale' // default
  }

  const getEdgeType = (alertType: string): GraphLink['type'] => {
    const typeStr = alertType.toLowerCase()
    if (typeStr.includes('whale')) return 'whale'
    if (typeStr.includes('manipulation')) return 'manipulation'
    if (typeStr.includes('stablecoin')) return 'stablecoin'
    if (typeStr.includes('derivative')) return 'derivatives'
    if (typeStr.includes('darkpool')) return 'darkpool'
    return 'default'
  }

  const generateNodeId = (type: string, index: number) => {
    return `${type}-${Date.now()}-${index}`
  }

  useEffect(() => {
    if (!latestAlert) return

    const alertType = latestAlert.intelligence?.event?.event_type || latestAlert.type || 'alert'
    const score = latestAlert.score || 0
    const nodeType = getNodeType(alertType)
    const edgeType = getEdgeType(alertType)
    
    setGraphData(prev => {
      const newNodes = [...prev.nodes]
      const newLinks = [...prev.links]

      const nodeId = generateNodeId(nodeType, newNodes.length)
      const config = nodeConfig[nodeType]
      
      const newNode: GraphNode = {
        id: nodeId,
        name: alertType,
        type: nodeType,
        size: config.size,
        color: config.color,
        pulse: score >= 0.7, // High severity alerts pulse
        timestamp: Date.now()
      }

      newNodes.push(newNode)

      if (newNodes.length > 1) {
        const randomIndex = Math.floor(Math.random() * (newNodes.length - 1))
        const targetNode = newNodes[randomIndex]
        const edgeConf = edgeConfig[edgeType]
        
        const newLink: GraphLink = {
          source: nodeId,
          target: targetNode.id,
          type: edgeType,
          strength: score,
          color: edgeConf.color,
          width: edgeConf.width,
          timestamp: Date.now()
        }

        newLinks.push(newLink)
      }

      const cappedNodes = newNodes.slice(-200)
      const cappedLinks = newLinks.slice(-300)

      const nodeIds = new Set(cappedNodes.map(n => n.id))
      const validLinks = cappedLinks.filter(l => 
        nodeIds.has(typeof l.source === 'string' ? l.source : (l.source as any).id) &&
        nodeIds.has(typeof l.target === 'string' ? l.target : (l.target as any).id)
      )

      return { nodes: cappedNodes, links: validLinks }
    })

    if (score >= 0.7) {
      setPulsingNodes(prev => {
        const newSet = new Set(prev)
        const nodeId = generateNodeId(nodeType, graphData.nodes.length)
        newSet.add(nodeId)
        setTimeout(() => {
          setPulsingNodes(current => {
            const updated = new Set(current)
            updated.delete(nodeId)
            return updated
          })
        }, 3000)
        return newSet
      })
    }

    setRecentAlerts(prev => [latestAlert, ...prev].slice(0, 5))

  }, [latestAlert])

  useEffect(() => {
    if (alertHistory && alertHistory.length > 0) {
      setRecentAlerts(alertHistory.slice(0, 5))
      
      const initialNodes: GraphNode[] = []
      const initialLinks: GraphLink[] = []

      alertHistory.slice(0, 20).forEach((alert, index) => {
        const alertType = alert.intelligence?.event?.event_type || alert.type || 'alert'
        const score = alert.score || 0
        const nodeType = getNodeType(alertType)
        const edgeType = getEdgeType(alertType)
        const config = nodeConfig[nodeType]
        
        const nodeId = `init-${nodeType}-${index}`
        
        initialNodes.push({
          id: nodeId,
          name: alertType,
          type: nodeType,
          size: config.size,
          color: config.color,
          pulse: false,
          timestamp: Date.now() - (index * 1000)
        })

        if (index > 0) {
          const edgeConf = edgeConfig[edgeType]
          initialLinks.push({
            source: nodeId,
            target: `init-${getNodeType(alertHistory[index - 1].type || 'alert')}-${index - 1}`,
            type: edgeType,
            strength: score,
            color: edgeConf.color,
            width: edgeConf.width,
            timestamp: Date.now() - (index * 1000)
          })
        }
      })

      setGraphData({ nodes: initialNodes, links: initialLinks })
    }
  }, [alertHistory])

  const filteredGraphData = useMemo(() => {
    if (activeFilter === 'all') return graphData

    const filteredNodes = graphData.nodes.filter(node => {
      switch (activeFilter) {
        case 'whale':
          return node.type === 'whale' || node.type === 'billionaire'
        case 'institution':
          return node.type === 'institution'
        case 'manipulation':
          return node.type === 'manipulation'
        case 'darkpool':
          return node.type === 'darkpool'
        case 'stablecoin':
          return node.type === 'contract'
        case 'derivatives':
          return node.type === 'ai'
        default:
          return true
      }
    })

    const nodeIds = new Set(filteredNodes.map(n => n.id))
    const filteredLinks = graphData.links.filter(link =>
      nodeIds.has(typeof link.source === 'string' ? link.source : (link.source as any).id) &&
      nodeIds.has(typeof link.target === 'string' ? link.target : (link.target as any).id)
    )

    return { nodes: filteredNodes, links: filteredLinks }
  }, [graphData, activeFilter])

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name
    const fontSize = 12 / globalScale
    ctx.font = `${fontSize}px Sans-Serif`
    
    ctx.beginPath()
    ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI, false)
    ctx.fillStyle = node.color
    ctx.fill()

    if (pulsingNodes.has(node.id)) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.size * 2, 0, 2 * Math.PI, false)
      ctx.strokeStyle = node.color
      ctx.lineWidth = 2 / globalScale
      ctx.globalAlpha = 0.5
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#e5e7eb'
    ctx.fillText(label.substring(0, 20), node.x, node.y + node.size + fontSize + 2)
  }, [pulsingNodes])

  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const start = link.source
    const end = link.target

    if (typeof start !== 'object' || typeof end !== 'object') return

    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.strokeStyle = link.color
    ctx.lineWidth = link.width / globalScale
    ctx.stroke()

    const arrowLength = 10 / globalScale
    const arrowWidth = 6 / globalScale
    const angle = Math.atan2(end.y - start.y, end.x - start.x)
    
    const arrowX = end.x - Math.cos(angle) * (end.size || 5)
    const arrowY = end.y - Math.sin(angle) * (end.size || 5)

    ctx.beginPath()
    ctx.moveTo(arrowX, arrowY)
    ctx.lineTo(
      arrowX - arrowLength * Math.cos(angle - Math.PI / 6),
      arrowY - arrowLength * Math.sin(angle - Math.PI / 6)
    )
    ctx.lineTo(
      arrowX - arrowLength * Math.cos(angle + Math.PI / 6),
      arrowY - arrowLength * Math.sin(angle + Math.PI / 6)
    )
    ctx.closePath()
    ctx.fillStyle = link.color
    ctx.fill()
  }, [])

  const filters: { type: FilterType; label: string; icon: string }[] = [
    { type: 'all', label: 'All', icon: '🌐' },
    { type: 'whale', label: 'Whale', icon: '🐋' },
    { type: 'institution', label: 'Institution', icon: '🏛️' },
    { type: 'manipulation', label: 'Manipulation', icon: '⚠️' },
    { type: 'darkpool', label: 'Darkpool', icon: '🕶️' },
    { type: 'stablecoin', label: 'Stablecoin', icon: '💵' },
    { type: 'derivatives', label: 'Derivatives', icon: '📊' }
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">Influence Graph</h1>
          <p className="text-sm text-gray-400">Real-time entity relationship network</p>
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
        {/* Graph Container */}
        <div className="flex-1 relative bg-slate-950 rounded-lg border border-cyan-500/20 overflow-hidden">
          <ForceGraph2D
            ref={graphRef}
            graphData={filteredGraphData}
            backgroundColor="#020617"
            nodeRelSize={6}
            nodeCanvasObject={nodeCanvasObject}
            linkCanvasObject={linkCanvasObject}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            linkDirectionalParticleWidth={2}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            warmupTicks={100}
            cooldownTicks={0}
            enableNodeDrag={true}
            enableZoomInteraction={true}
            enablePanInteraction={true}
          />

          {/* Legend Panel */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-4 max-w-xs">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="text-gray-300">Whale</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <span className="text-gray-300">Billionaire</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-gray-300">Institution</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-gray-300">Manipulation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-400" />
                <span className="text-gray-300">Darkpool</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-gray-300">Smart Contract</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-gray-300">AI Highlighted</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-cyan-500/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Nodes:</span>
                <span className="text-cyan-400 font-bold">{filteredGraphData.nodes.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-400">Edges:</span>
                <span className="text-cyan-400 font-bold">{filteredGraphData.links.length}</span>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-3">
            <div className="text-xs text-gray-400">Filter: <span className="text-cyan-400 font-medium">{activeFilter === 'all' ? 'All Entities' : filters.find(f => f.type === activeFilter)?.label}</span></div>
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
                  const nodeType = getNodeType(alertType)
                  const color = nodeConfig[nodeType].color
                  
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
              recentAlerts.map((alert, idx) => {
                const alertType = alert.intelligence?.event?.event_type || alert.type || 'alert'
                const score = alert.score || 0
                const severity = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'
                const nodeType = getNodeType(alertType)
                const color = nodeConfig[nodeType].color
                
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
