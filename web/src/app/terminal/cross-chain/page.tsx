'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useEffect, useState } from 'react'

interface MapNode {
  id: string
  label: string
  type: string
  chain: string
  risk_score: number
  connections: number
}

interface MapEdge {
  source: string
  target: string
  weight: number
  type: string
}

interface ApiResponse {
  nodes?: MapNode[]
  edges?: MapEdge[]
  total_nodes?: number
  total_edges?: number
  timestamp?: string
}

export default function CrossChainGraphPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null)
  const [chainFilter, setChainFilter] = useState<string>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/gq-core/map', { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const result = await response.json()
        setData(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const nodes = data?.nodes || []
  const edges = data?.edges || []
  
  const chains = Array.from(new Set(nodes.map(n => n.chain))).filter(Boolean)
  const filteredNodes = chainFilter === 'all' ? nodes : nodes.filter(n => n.chain === chainFilter)
  
  const highRiskNodes = nodes.filter(n => n.risk_score > 0.7).length
  const bridgeEdges = edges.filter(e => e.type === 'bridge').length

  const getRiskColor = (score: number) => {
    if (score > 0.7) return 'text-red-400 bg-red-500/20'
    if (score > 0.4) return 'text-yellow-400 bg-yellow-500/20'
    return 'text-green-400 bg-green-500/20'
  }

  const getChainColor = (chain: string) => {
    const colors: Record<string, string> = {
      ethereum: 'bg-blue-500',
      bitcoin: 'bg-orange-500',
      solana: 'bg-purple-500',
      polygon: 'bg-violet-500',
      arbitrum: 'bg-cyan-500',
      optimism: 'bg-red-500',
      avalanche: 'bg-rose-500',
      bsc: 'bg-yellow-500'
    }
    return colors[chain?.toLowerCase()] || 'bg-gray-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-sm font-medium">Live Feed</span>
          </div>
          <TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Cross-Chain Entity Graph</h1>
          <p className="text-gray-400">Multi-chain entity relationships and fund flow visualization</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <span className="ml-3 text-gray-400">Loading graph data...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-300">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Total Nodes</div>
                <div className="text-2xl font-bold text-white">{data?.total_nodes || nodes.length}</div>
              </div>
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Total Edges</div>
                <div className="text-2xl font-bold text-cyan-400">{data?.total_edges || edges.length}</div>
              </div>
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">High Risk Entities</div>
                <div className="text-2xl font-bold text-red-400">{highRiskNodes}</div>
              </div>
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Bridge Connections</div>
                <div className="text-2xl font-bold text-purple-400">{bridgeEdges}</div>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setChainFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  chainFilter === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
                }`}
              >All Chains</button>
              {chains.map(chain => (
                <button
                  key={chain}
                  onClick={() => setChainFilter(chain)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    chainFilter === chain ? 'bg-cyan-600 text-white' : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${getChainColor(chain)}`} />
                  {chain}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Entity Network</h3>
                <div className="relative h-96 bg-slate-900/50 rounded-lg overflow-hidden">
                  <svg className="w-full h-full">
                    {filteredNodes.slice(0, 20).map((node, idx) => {
                      const angle = (idx / Math.min(filteredNodes.length, 20)) * 2 * Math.PI
                      const radius = 120
                      const cx = 200 + radius * Math.cos(angle)
                      const cy = 180 + radius * Math.sin(angle)
                      const nodeSize = 8 + (node.connections || 1) * 2
                      
                      return (
                        <g key={node.id}>
                          {edges.filter(e => e.source === node.id || e.target === node.id).slice(0, 3).map((edge, edgeIdx) => {
                            const targetNode = filteredNodes.find(n => n.id === (edge.source === node.id ? edge.target : edge.source))
                            if (!targetNode) return null
                            const targetIdx = filteredNodes.indexOf(targetNode)
                            if (targetIdx === -1 || targetIdx >= 20) return null
                            const targetAngle = (targetIdx / Math.min(filteredNodes.length, 20)) * 2 * Math.PI
                            const tx = 200 + radius * Math.cos(targetAngle)
                            const ty = 180 + radius * Math.sin(targetAngle)
                            return (
                              <line
                                key={`${edge.source}-${edge.target}-${edgeIdx}`}
                                x1={cx} y1={cy} x2={tx} y2={ty}
                                stroke={edge.type === 'bridge' ? '#8b5cf6' : '#0891b2'}
                                strokeWidth={1}
                                strokeOpacity={0.3}
                              />
                            )
                          })}
                          <circle
                            cx={cx} cy={cy} r={nodeSize}
                            className={`cursor-pointer transition-all ${
                              selectedNode?.id === node.id ? 'stroke-white stroke-2' : ''
                            }`}
                            fill={node.risk_score > 0.7 ? '#ef4444' : node.risk_score > 0.4 ? '#f59e0b' : '#22c55e'}
                            fillOpacity={0.8}
                            onClick={() => setSelectedNode(node)}
                          />
                          <text x={cx} y={cy + nodeSize + 12} textAnchor="middle" className="fill-gray-400 text-xs">
                            {node.label?.slice(0, 8)}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                  <div className="absolute bottom-4 left-4 flex gap-4 text-xs">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> Low Risk</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" /> Medium</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /> High Risk</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {selectedNode ? 'Selected Entity' : 'Entity Details'}
                </h3>
                {selectedNode ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-gray-400 text-sm">ID</div>
                      <div className="text-white font-mono text-sm break-all">{selectedNode.id}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Label</div>
                      <div className="text-white">{selectedNode.label}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Type</div>
                      <div className="text-cyan-400">{selectedNode.type}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Chain</div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getChainColor(selectedNode.chain)}`} />
                        <span className="text-white">{selectedNode.chain}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Risk Score</div>
                      <div className={`inline-block px-2 py-1 rounded text-sm font-medium ${getRiskColor(selectedNode.risk_score)}`}>
                        {(selectedNode.risk_score * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Connections</div>
                      <div className="text-white">{selectedNode.connections}</div>
                    </div>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="w-full mt-4 px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
                    >Clear Selection</button>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    Click on a node in the graph to view details
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Entity List</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-slate-700">
                      <th className="pb-3 pr-4">Entity</th>
                      <th className="pb-3 pr-4">Type</th>
                      <th className="pb-3 pr-4">Chain</th>
                      <th className="pb-3 pr-4">Risk</th>
                      <th className="pb-3">Connections</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNodes.slice(0, 10).map((node, idx) => (
                      <tr 
                        key={idx} 
                        className="border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer"
                        onClick={() => setSelectedNode(node)}
                      >
                        <td className="py-3 pr-4">
                          <div className="font-medium text-white">{node.label}</div>
                          <div className="text-xs text-gray-500 font-mono">{node.id.slice(0, 16)}...</div>
                        </td>
                        <td className="py-3 pr-4 text-cyan-400">{node.type}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getChainColor(node.chain)}`} />
                            <span className="text-white">{node.chain}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(node.risk_score)}`}>
                            {(node.risk_score * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3 text-gray-400">{node.connections}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
