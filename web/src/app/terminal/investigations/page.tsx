'use client'

import { useState, useEffect } from 'react'

interface SavedInvestigation {
  id: string
  title: string
  description: string
  entities: string[]
  createdAt: string
  updatedAt: string
  status?: string
  priority?: string
}

export default function SavedInvestigationsPage() {
  const [investigations, setInvestigations] = useState<SavedInvestigation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ghostquant_saved_investigations')
      if (saved) {
        setInvestigations(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to load saved investigations:', e)
    }
    setIsLoading(false)
  }, [])

  const removeInvestigation = (id: string) => {
    const updated = investigations.filter(inv => inv.id !== id)
    setInvestigations(updated)
    localStorage.setItem('ghostquant_saved_investigations', JSON.stringify(updated))
  }

  const filteredInvestigations = investigations.filter(inv => {
    const matchesSearch = !searchQuery || 
      inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status?: string) => {
    if (status === 'active') return 'text-green-400 bg-green-500/20 border-green-500/30'
    if (status === 'pending') return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    if (status === 'closed') return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30'
  }

  const getPriorityColor = (priority?: string) => {
    if (priority === 'critical') return 'text-red-400'
    if (priority === 'high') return 'text-orange-400'
    if (priority === 'medium') return 'text-yellow-400'
    return 'text-gray-400'
  }

  const totalEntities = investigations.reduce((sum, inv) => sum + inv.entities.length, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-purple-400 text-sm font-medium">Investigation Hub</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Saved Investigations</h1>
          <p className="text-gray-400">Track complex entity relationships and ongoing investigations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Total Investigations</div>
            <div className="text-2xl font-bold text-white">{investigations.length}</div>
          </div>
          <div className="bg-slate-800/50 border border-green-500/20 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Active</div>
            <div className="text-2xl font-bold text-green-400">
              {investigations.filter(i => i.status === 'active').length}
            </div>
          </div>
          <div className="bg-slate-800/50 border border-yellow-500/20 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-400">
              {investigations.filter(i => i.status === 'pending').length}
            </div>
          </div>
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Total Entities</div>
            <div className="text-2xl font-bold text-cyan-400">{totalEntities}</div>
          </div>
        </div>

        {investigations.length > 0 && (
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search investigations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 md:max-w-xs px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
            <div className="flex gap-2">
              {['all', 'active', 'pending', 'closed'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                    statusFilter === status ? 'bg-purple-600 text-white' : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
                  }`}
                >{status}</button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your Investigations</h2>
            <span className="text-xs text-gray-400">{filteredInvestigations.length} investigations</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <span className="ml-3 text-gray-400">Loading investigations...</span>
            </div>
          ) : investigations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <p className="text-gray-400 mb-2">No saved investigations yet</p>
              <p className="text-gray-500 text-sm">
                Use the Entity Explorer or Ring Detector to create and save investigation workspaces.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInvestigations.map((inv) => (
                <div
                  key={inv.id}
                  className="p-5 bg-slate-900/50 rounded-lg border border-purple-500/10 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{inv.title}</h3>
                        {inv.priority && (
                          <span className={`text-xs font-medium ${getPriorityColor(inv.priority)}`}>
                            {inv.priority.toUpperCase()}
                          </span>
                        )}
                      </div>
                      {inv.description && (
                        <p className="text-gray-400 text-sm line-clamp-2">{inv.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeInvestigation(inv.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete investigation"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(inv.status)}`}>
                        {inv.status || 'new'}
                      </span>
                      <span className="text-purple-400 text-sm">{inv.entities.length} entities</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {inv.updatedAt !== inv.createdAt 
                        ? `Updated ${new Date(inv.updatedAt).toLocaleDateString()}`
                        : `Created ${new Date(inv.createdAt).toLocaleDateString()}`
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
