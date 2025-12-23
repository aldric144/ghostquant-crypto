'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useEffect, useState, useMemo, useRef } from 'react'
import { useIntelFeed } from '@/hooks/useIntelFeed'
import { predictClient, PredictionResponse } from '@/lib/predictClient'

interface Entity {
  id: string
  address: string
  name?: string
  type: 'whale' | 'billionaire' | 'institution' | 'manipulation' | 'darkpool' | 'smartmoney' | 'unknown'
  severity: 'high' | 'medium' | 'low'
  score: number
  chains: Set<string>
  tokens: Set<string>
  lastSeen: number
  activityCount: number
  rings: string[]
  connections: string[]
}

interface Activity {
  id: string
  timestamp: number
  type: string
  severity: 'high' | 'medium' | 'low'
  message: string
  chain?: string
  token?: string
}

export default function EntityExplorerPage() {
  const [entities, setEntities] = useState<Map<string, Entity>>(new Map())
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [manipulationPrediction, setManipulationPrediction] = useState<PredictionResponse | null>(null)
  const [manipulationLoading, setManipulationLoading] = useState(false)
  const [behavioralPrediction, setBehavioralPrediction] = useState<PredictionResponse | null>(null)
  const [behavioralLoading, setBehavioralLoading] = useState(false)
  const [chainPrediction, setChainPrediction] = useState<PredictionResponse | null>(null)
  const [chainLoading, setChainLoading] = useState(false)
  
  const { latestAlert, alertHistory, connectionStatus } = useIntelFeed()

  const entityConfig = {
    whale: { color: '#06b6d4', label: 'Whale', icon: '🐋' },
    billionaire: { color: '#a855f7', label: 'Billionaire', icon: '💎' },
    institution: { color: '#3b82f6', label: 'Institution', icon: '🏛️' },
    manipulation: { color: '#ef4444', label: 'Manipulation', icon: '⚠️' },
    darkpool: { color: '#6366f1', label: 'Darkpool', icon: '🕶️' },
    smartmoney: { color: '#10b981', label: 'Smart Money', icon: '🧠' },
    unknown: { color: '#6b7280', label: 'Unknown', icon: '❓' }
  }

  const getEntityType = (alertType: string): Entity['type'] => {
    const typeStr = alertType.toLowerCase()
    if (typeStr.includes('whale')) return 'whale'
    if (typeStr.includes('billionaire')) return 'billionaire'
    if (typeStr.includes('institution')) return 'institution'
    if (typeStr.includes('manipulation')) return 'manipulation'
    if (typeStr.includes('darkpool')) return 'darkpool'
    if (typeStr.includes('smart')) return 'smartmoney'
    return 'unknown'
  }

  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewedEntities')
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse recently viewed entities', e)
      }
    }
  }, [])

  const addToRecentlyViewed = (entityId: string) => {
    setRecentlyViewed(prev => {
      const updated = [entityId, ...prev.filter(id => id !== entityId)].slice(0, 10)
      localStorage.setItem('recentlyViewedEntities', JSON.stringify(updated))
      return updated
    })
  }

  useEffect(() => {
    if (!latestAlert) return

    const alertType = latestAlert.intelligence?.event?.event_type || latestAlert.type || 'alert'
    const score = latestAlert.score || 0
    const severity: 'high' | 'medium' | 'low' = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'
    const entityId = latestAlert.intelligence?.entity?.entity_id || `entity-${Date.now()}`
    const chain = latestAlert.intelligence?.event?.chain || 'unknown'
    const token = latestAlert.intelligence?.event?.token || 'unknown'
    const entityType = getEntityType(alertType)

    setEntities(prev => {
      const newEntities = new Map(prev)
      const existing = newEntities.get(entityId)

      if (existing) {
        existing.chains.add(chain)
        existing.tokens.add(token)
        existing.lastSeen = Date.now()
        existing.activityCount++
        existing.score = Math.max(existing.score, score)
        existing.severity = existing.score >= 0.7 ? 'high' : existing.score >= 0.4 ? 'medium' : 'low'
      } else {
        newEntities.set(entityId, {
          id: entityId,
          address: entityId,
          name: undefined,
          type: entityType,
          severity,
          score,
          chains: new Set([chain]),
          tokens: new Set([token]),
          lastSeen: Date.now(),
          activityCount: 1,
          rings: [],
          connections: []
        })
      }

      return newEntities
    })

    setActivities(prev => [{
      id: `activity-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type: alertType,
      severity,
      message: alertType,
      chain,
      token
    }, ...prev].slice(0, 100))

  }, [latestAlert])

  useEffect(() => {
    if (alertHistory && alertHistory.length > 0) {
      const initialEntities = new Map<string, Entity>()
      const initialActivities: Activity[] = []

      alertHistory.forEach((alert, index) => {
        const alertType = alert.intelligence?.event?.event_type || alert.type || 'alert'
        const score = alert.score || 0
        const severity: 'high' | 'medium' | 'low' = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'
        const entityId = alert.intelligence?.entity?.entity_id || `entity-${index}`
        const chain = alert.intelligence?.event?.chain || 'unknown'
        const token = alert.intelligence?.event?.token || 'unknown'
        const entityType = getEntityType(alertType)

        const existing = initialEntities.get(entityId)
        if (existing) {
          existing.chains.add(chain)
          existing.tokens.add(token)
          existing.activityCount++
          existing.score = Math.max(existing.score, score)
          existing.severity = existing.score >= 0.7 ? 'high' : existing.score >= 0.4 ? 'medium' : 'low'
        } else {
          initialEntities.set(entityId, {
            id: entityId,
            address: entityId,
            name: undefined,
            type: entityType,
            severity,
            score,
            chains: new Set([chain]),
            tokens: new Set([token]),
            lastSeen: Date.now() - (index * 60000),
            activityCount: 1,
            rings: [],
            connections: []
          })
        }

        initialActivities.push({
          id: `init-activity-${index}`,
          timestamp: Date.now() - (index * 60000),
          type: alertType,
          severity,
          message: alertType,
          chain,
          token
        })
      })

      setEntities(initialEntities)
      setActivities(initialActivities.slice(0, 100))

      if (initialEntities.size > 0) {
        const firstEntity = Array.from(initialEntities.values())[0]
        setSelectedEntity(firstEntity)
      }
    }
  }, [alertHistory])

  const filteredEntities = useMemo(() => {
    const entitiesArray = Array.from(entities.values())
    
    if (!searchQuery.trim()) return entitiesArray

    const query = searchQuery.toLowerCase()
    return entitiesArray.filter(entity => 
      entity.address.toLowerCase().includes(query) ||
      entity.name?.toLowerCase().includes(query) ||
      Array.from(entity.tokens).some(token => token.toLowerCase().includes(query)) ||
      Array.from(entity.chains).some(chain => chain.toLowerCase().includes(query))
    )
  }, [entities, searchQuery])

  const entityActivities = useMemo(() => {
    if (!selectedEntity) return []
    return activities.filter(activity => 
      activity.message.includes(selectedEntity.address) ||
      activity.message.includes(selectedEntity.id)
    ).slice(0, 20)
  }, [selectedEntity, activities])

  const handleSelectEntity = (entity: Entity) => {
    setSelectedEntity(entity)
    addToRecentlyViewed(entity.id)
  }

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

  useEffect(() => {
    if (!selectedEntity || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height
    const centerX = width / 2
    const centerY = height / 2

    ctx.fillStyle = '#020617'
    ctx.fillRect(0, 0, width, height)

    const config = entityConfig[selectedEntity.type]
    const centralRadius = 15

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centralRadius * 3)
    gradient.addColorStop(0, `${config.color}80`)
    gradient.addColorStop(1, `${config.color}00`)
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, centralRadius * 3, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = config.color
    ctx.beginPath()
    ctx.arc(centerX, centerY, centralRadius, 0, 2 * Math.PI)
    ctx.fill()

    ctx.strokeStyle = '#020617'
    ctx.lineWidth = 3
    ctx.stroke()

    const connectionCount = Math.min(selectedEntity.connections.length, 10)
    const radius = Math.min(width, height) * 0.35
    const angleStep = (2 * Math.PI) / Math.max(connectionCount, 1)

    for (let i = 0; i < connectionCount; i++) {
      const angle = i * angleStep
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      const nodeRadius = 8

      ctx.strokeStyle = `${config.color}40`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()

      ctx.fillStyle = config.color
      ctx.beginPath()
      ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI)
      ctx.fill()

      ctx.strokeStyle = '#020617'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    ctx.fillStyle = '#e5e7eb'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(config.icon, centerX, centerY)

  }, [selectedEntity])

  const getBehavioralInsights = (entity: Entity) => {
    const insights = []

    if (entity.score >= 0.7) {
      insights.push('High-risk entity with suspicious activity patterns')
    } else if (entity.score >= 0.4) {
      insights.push('Moderate risk with some concerning behaviors')
    } else {
      insights.push('Low risk entity with normal activity')
    }

    if (entity.chains.size > 3) {
      insights.push(`Active across ${entity.chains.size} chains - significant cross-chain presence`)
    }

    if (entity.activityCount > 10) {
      insights.push(`High activity volume (${entity.activityCount} events) - frequent trader`)
    }

    if (entity.type === 'manipulation') {
      insights.push('Identified as potential manipulation actor - monitor closely')
    }

    if (entity.rings.length > 0) {
      insights.push(`Member of ${entity.rings.length} manipulation ring(s) - coordinated behavior detected`)
    }

    return insights
  }

  const handlePredictManipulation = async () => {
    if (!selectedEntity) return
    
    setManipulationLoading(true)
    setManipulationPrediction(null)
    
    const entityData = {
      id: selectedEntity.id,
      address: selectedEntity.address,
      type: selectedEntity.type,
      score: selectedEntity.score,
      chain_count: selectedEntity.chains.size,
      token_count: selectedEntity.tokens.size,
      activity_count: selectedEntity.activityCount
    }
    
    const result = await predictClient.predictEntity(entityData)
    setManipulationPrediction(result)
    setManipulationLoading(false)
  }

  const handlePredictBehavioral = async () => {
    if (!selectedEntity) return
    
    setBehavioralLoading(true)
    setBehavioralPrediction(null)
    
    const entityData = {
      id: selectedEntity.id,
      address: selectedEntity.address,
      type: selectedEntity.type,
      score: selectedEntity.score,
      chain_count: selectedEntity.chains.size,
      token_count: selectedEntity.tokens.size,
      activity_count: selectedEntity.activityCount
    }
    
    const result = await predictClient.predictEntity(entityData)
    setBehavioralPrediction(result)
    setBehavioralLoading(false)
  }

  const handlePredictChainPressure = async () => {
    if (!selectedEntity) return
    
    setChainLoading(true)
    setChainPrediction(null)
    
    const firstChain = Array.from(selectedEntity.chains)[0] || 'unknown'
    const chainData = {
      name: firstChain,
      entity_count: 1,
      activity_count: selectedEntity.activityCount
    }
    
    const result = await predictClient.predictChain(chainData)
    setChainPrediction(result)
    setChainLoading(false)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <TerminalBackButton className="mb-4" />
          <div>
          <h1 className="text-3xl font-bold text-cyan-400">Entity Explorer</h1>
          <p className="text-sm text-gray-400">Deep-dive intelligence dossiers</p>
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

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left: Entity Selector */}
        <div className="w-80 flex flex-col gap-4 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-slate-900/50 border border-cyan-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Recently Viewed</h3>
              <div className="space-y-1">
                {recentlyViewed.slice(0, 5).map(entityId => {
                  const entity = entities.get(entityId)
                  if (!entity) return null
                  const config = entityConfig[entity.type]
                  return (
                    <button
                      key={entityId}
                      onClick={() => handleSelectEntity(entity)}
                      className="w-full text-left px-2 py-1 rounded hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{config.icon}</span>
                        <span className="text-xs text-gray-400 font-mono truncate">
                          {entity.address.substring(0, 12)}...
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Entity List */}
          <div className="flex-1 bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-cyan-500/20">
              <h3 className="text-sm font-semibold text-gray-300">
                Entities ({filteredEntities.length})
              </h3>
            </div>
            <div className="overflow-y-auto h-full p-2 space-y-1">
              {filteredEntities.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No entities found
                </div>
              ) : (
                filteredEntities.map(entity => {
                  const config = entityConfig[entity.type]
                  const isSelected = selectedEntity?.id === entity.id
                  return (
                    <button
                      key={entity.id}
                      onClick={() => handleSelectEntity(entity)}
                      className={`
                        w-full text-left p-2 rounded transition-all
                        ${isSelected 
                          ? 'bg-cyan-500/20 border border-cyan-500/50' 
                          : 'hover:bg-slate-800/50 border border-transparent'
                        }
                      `}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0">{config.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-400 font-mono truncate">
                            {entity.address.substring(0, 16)}...
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              entity.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                              entity.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {entity.severity.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {entity.activityCount} events
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Middle: Entity Dossier */}
        {selectedEntity ? (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex-1 bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-y-auto p-6 space-y-6">
              {/* Entity Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{entityConfig[selectedEntity.type].icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-cyan-400">
                        {selectedEntity.name || `Entity ${selectedEntity.address.substring(0, 8)}...`}
                      </h2>
                      <p className="text-sm text-gray-400 font-mono">
                        {selectedEntity.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span 
                      className="px-3 py-1 rounded text-sm font-medium"
                      style={{ 
                        backgroundColor: `${entityConfig[selectedEntity.type].color}20`,
                        color: entityConfig[selectedEntity.type].color
                      }}
                    >
                      {entityConfig[selectedEntity.type].label}
                    </span>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      selectedEntity.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                      selectedEntity.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {selectedEntity.severity.toUpperCase()} RISK
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Last Seen:</span>
                    <span className="text-cyan-400 ml-2 font-medium">
                      {formatTimestamp(selectedEntity.lastSeen)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Activity Count:</span>
                    <span className="text-cyan-400 ml-2 font-medium">
                      {selectedEntity.activityCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Risk Score:</span>
                    <span className="text-cyan-400 ml-2 font-medium">
                      {(selectedEntity.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Connections:</span>
                    <span className="text-cyan-400 ml-2 font-medium">
                      {selectedEntity.connections.length}
                    </span>
                  </div>
                </div>

                {/* Chains & Tokens */}
                <div className="mt-4 space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Chains ({selectedEntity.chains.size})</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selectedEntity.chains).map(chain => (
                        <span key={chain} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                          {chain}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Tokens ({selectedEntity.tokens.size})</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selectedEntity.tokens).map(token => (
                        <span key={token} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                          {token}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Prediction Buttons */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-3">🤖 AI Predictions</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={handlePredictManipulation}
                      disabled={manipulationLoading}
                      className="px-4 py-2 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {manipulationLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        'Predict Manipulation Risk'
                      )}
                    </button>
                    <button
                      onClick={handlePredictBehavioral}
                      disabled={behavioralLoading}
                      className="px-4 py-2 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {behavioralLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        'Predict Behavioral Score'
                      )}
                    </button>
                    <button
                      onClick={handlePredictChainPressure}
                      disabled={chainLoading}
                      className="px-4 py-2 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {chainLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        'Predict Cross-Chain Pressure'
                      )}
                    </button>
                  </div>

                  {/* Manipulation Risk Result */}
                  {manipulationPrediction && (
                    <div className={`mt-3 p-4 rounded-lg border ${
                      manipulationPrediction.success 
                        ? 'bg-slate-800/50 border-cyan-500/30' 
                        : 'bg-red-900/20 border-red-500/50'
                    }`}>
                      {manipulationPrediction.success ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-semibold text-cyan-400">Manipulation Risk Prediction</h5>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              manipulationPrediction.classification === 'high' ? 'bg-red-500/20 text-red-400' :
                              manipulationPrediction.classification === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {manipulationPrediction.classification?.toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-400">Risk Score:</span>
                              <span className="text-cyan-400 ml-2 font-bold">
                                {manipulationPrediction.risk_score?.toFixed(3)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Confidence:</span>
                              <span className="text-cyan-400 ml-2 font-bold">
                                {manipulationPrediction.confidence?.toFixed(3)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Model:</span>
                              <span className="text-cyan-400 ml-2 font-medium">
                                {manipulationPrediction.model_name} v{manipulationPrediction.version}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Timestamp:</span>
                              <span className="text-cyan-400 ml-2 font-medium">
                                {new Date().toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-red-400 text-sm">
                          <span className="font-semibold">Error:</span> {manipulationPrediction.error}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Behavioral Score Result */}
                  {behavioralPrediction && (
                    <div className={`mt-3 p-4 rounded-lg border ${
                      behavioralPrediction.success 
                        ? 'bg-slate-800/50 border-cyan-500/30' 
                        : 'bg-red-900/20 border-red-500/50'
                    }`}>
                      {behavioralPrediction.success ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-semibold text-cyan-400">Behavioral Score Prediction</h5>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              behavioralPrediction.behavioral_risk === 'high' ? 'bg-red-500/20 text-red-400' :
                              behavioralPrediction.behavioral_risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {behavioralPrediction.behavioral_risk?.toUpperCase()}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-400">Manipulation Probability</span>
                                <span className="text-cyan-400 font-bold">
                                  {((behavioralPrediction.manipulation_probability || 0) * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    (behavioralPrediction.manipulation_probability || 0) >= 0.7 ? 'bg-red-500' :
                                    (behavioralPrediction.manipulation_probability || 0) >= 0.4 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${(behavioralPrediction.manipulation_probability || 0) * 100}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-400">Confidence</span>
                                <span className="text-cyan-400 font-bold">
                                  {((behavioralPrediction.confidence || 0) * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-cyan-500 rounded-full"
                                  style={{ width: `${(behavioralPrediction.confidence || 0) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            Model: <span className="text-cyan-400">{behavioralPrediction.model_name} v{behavioralPrediction.version}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-red-400 text-sm">
                          <span className="font-semibold">Error:</span> {behavioralPrediction.error}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chain Pressure Result */}
                  {chainPrediction && (
                    <div className={`mt-3 p-4 rounded-lg border ${
                      chainPrediction.success 
                        ? 'bg-slate-800/50 border-cyan-500/30' 
                        : 'bg-red-900/20 border-red-500/50'
                    }`}>
                      {chainPrediction.success ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-semibold text-cyan-400">Cross-Chain Pressure Prediction</h5>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              chainPrediction.classification === 'high' ? 'bg-red-500/20 text-red-400' :
                              chainPrediction.classification === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {chainPrediction.classification?.toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-400">Pressure Score:</span>
                              <span className="text-cyan-400 ml-2 font-bold">
                                {chainPrediction.pressure_score?.toFixed(3)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Confidence:</span>
                              <span className="text-cyan-400 ml-2 font-bold">
                                {chainPrediction.confidence?.toFixed(3)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Model:</span>
                              <span className="text-cyan-400 ml-2 font-medium">
                                {chainPrediction.model_name} v{chainPrediction.version}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Timestamp:</span>
                              <span className="text-cyan-400 ml-2 font-medium">
                                {new Date().toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-red-400 text-sm">
                          <span className="font-semibold">Error:</span> {chainPrediction.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Timeline */}
              <div>
                <h3 className="text-lg font-bold text-cyan-400 mb-3">Activity Timeline</h3>
                {entityActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No activities recorded
                  </div>
                ) : (
                  <div className="space-y-2">
                    {entityActivities.map(activity => {
                      const config = entityConfig[getEntityType(activity.type)]
                      return (
                        <div
                          key={activity.id}
                          className="bg-slate-800/50 border border-cyan-500/10 rounded p-3 hover:border-cyan-500/30 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl flex-shrink-0">{config.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  activity.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                                  activity.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {activity.severity.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(activity.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300">{activity.message}</p>
                              {(activity.chain || activity.token) && (
                                <div className="flex gap-2 mt-2 text-xs">
                                  {activity.chain && (
                                    <span className="text-gray-400">
                                      Chain: <span className="text-cyan-400">{activity.chain}</span>
                                    </span>
                                  )}
                                  {activity.token && (
                                    <span className="text-gray-400">
                                      Token: <span className="text-cyan-400">{activity.token}</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Ring Membership */}
              {selectedEntity.rings.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-cyan-400 mb-3">Ring Membership</h3>
                  <div className="space-y-2">
                    {selectedEntity.rings.map(ringId => (
                      <div
                        key={ringId}
                        className="bg-red-500/10 border border-red-500/30 rounded p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-red-400 font-bold">{ringId}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                            MANIPULATION RING
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Intelligence Panel */}
              <div>
                <h3 className="text-lg font-bold text-cyan-400 mb-3">AI Intelligence</h3>
                <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 rounded-lg p-4 space-y-3">
                  {getBehavioralInsights(selectedEntity).map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-gray-300">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-900/50 border border-cyan-500/20 rounded-lg">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500 text-lg">Select an entity to view details</p>
            </div>
          </div>
        )}

        {/* Right: Mini Graphs & Analytics */}
        {selectedEntity && (
          <div className="hidden lg:block w-80 space-y-4 overflow-y-auto">
            {/* Mini Influence Graph */}
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-3">Influence Network</h3>
              <canvas
                ref={canvasRef}
                className="w-full h-64 rounded"
              />
              <div className="mt-3 text-xs text-gray-400 text-center">
                {selectedEntity.connections.length} connections
              </div>
            </div>

            {/* Behavioral Analytics */}
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-3">Behavioral Analytics</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Cross-chain Activity</span>
                    <span className="text-cyan-400 font-bold">{selectedEntity.chains.size} chains</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${Math.min((selectedEntity.chains.size / 5) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Token Diversity</span>
                    <span className="text-cyan-400 font-bold">{selectedEntity.tokens.size} tokens</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${Math.min((selectedEntity.tokens.size / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Activity Volume</span>
                    <span className="text-cyan-400 font-bold">{selectedEntity.activityCount} events</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${Math.min((selectedEntity.activityCount / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Risk Score</span>
                    <span className="text-cyan-400 font-bold">{(selectedEntity.score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        selectedEntity.severity === 'high' ? 'bg-red-500' :
                        selectedEntity.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${selectedEntity.score * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-3">Quick Stats</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Entity Type:</span>
                  <span className="text-cyan-400 font-medium">
                    {entityConfig[selectedEntity.type].label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Severity:</span>
                  <span className={`font-medium ${
                    selectedEntity.severity === 'high' ? 'text-red-400' :
                    selectedEntity.severity === 'medium' ? 'text-yellow-400' :
                    'text-gray-400'
                  }`}>
                    {selectedEntity.severity.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Rings:</span>
                  <span className="text-cyan-400 font-medium">
                    {selectedEntity.rings.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Last Activity:</span>
                  <span className="text-cyan-400 font-medium">
                    {formatTimestamp(selectedEntity.lastSeen)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
