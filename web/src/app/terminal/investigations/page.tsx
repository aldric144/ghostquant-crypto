'use client'

import { useState, useEffect } from 'react'

interface SavedInvestigation {
  id: string
  title: string
  description: string
  entities: string[]
  createdAt: string
  updatedAt: string
}

export default function SavedInvestigationsPage() {
  const [investigations, setInvestigations] = useState<SavedInvestigation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load saved investigations from localStorage
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

  return (
    <div className="space-y-6">
      <div className="bg-[#0d1321] border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
          <span className="text-cyan-400 text-sm font-medium">Module Online</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Saved Investigations</h1>
        <p className="mt-2 text-cyan-300 font-semibold">
          Module Activated - Intelligence Coming Online
        </p>
        <p className="mt-3 text-gray-400">
          Your saved investigation workspaces. Create investigations from the Entity Explorer or Ring Detector to track complex entity relationships.
        </p>
      </div>

      <div className="bg-[#0d1321] border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Your Investigations</h2>
          <span className="text-xs text-gray-400">{investigations.length} investigations saved</span>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <span>Loading saved investigations...</span>
          </div>
        ) : investigations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-2">No saved investigations yet</p>
            <p className="text-gray-500 text-sm">
              Use the Entity Explorer or Ring Detector to create and save investigation workspaces.
            </p>
            <button
              disabled
              className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/30 opacity-50 cursor-not-allowed"
            >
              Create New Investigation (Coming Soon)
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {investigations.map((inv) => (
              <div
                key={inv.id}
                className="p-4 bg-slate-900/50 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{inv.title}</h3>
                    {inv.description && (
                      <p className="text-gray-400 text-sm mt-1">{inv.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{inv.entities.length} entities</span>
                      <span>Created {new Date(inv.createdAt).toLocaleDateString()}</span>
                      {inv.updatedAt !== inv.createdAt && (
                        <span>Updated {new Date(inv.updatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeInvestigation(inv.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete investigation"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
