'use client'

import { useEffect, useState } from 'react'

type FetchState =
  | { status: 'idle' | 'loading' }
  | { status: 'success'; payload: unknown }
  | { status: 'error'; error: string }

export function ModuleActivatedPlaceholder({
  title,
  description,
  gqCorePath,
}: {
  title: string
  description?: string
  gqCorePath?: string
}) {
  const [state, setState] = useState<FetchState>({ status: 'idle' })

  useEffect(() => {
    if (!gqCorePath) return

    let cancelled = false
    setState({ status: 'loading' })

    fetch(`/api/gq-core/${gqCorePath}`, { cache: 'no-store' })
      .then(async (r) => {
        const payload = (await r.json().catch(() => null)) as unknown
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`)
        }
        return payload
      })
      .then((payload) => {
        if (cancelled) return
        setState({ status: 'success', payload })
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setState({
          status: 'error',
          error: e instanceof Error ? e.message : 'Unknown error',
        })
      })

    return () => {
      cancelled = true
    }
  }, [gqCorePath])

  return (
    <div className="space-y-6">
      <div className="bg-[#0d1321] border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
          <span className="text-cyan-400 text-sm font-medium">Module Online</span>
        </div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-cyan-300 font-semibold">
          Module Activated - Intelligence Coming Online
        </p>
        {description && <p className="mt-3 text-gray-400">{description}</p>}
      </div>

      <div className="bg-[#0d1321] border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Live Data Link</h2>
          {gqCorePath ? (
            <span className="text-xs text-gray-400 font-mono">/gq-core/{gqCorePath}</span>
          ) : (
            <span className="text-xs text-gray-500">No GQ-Core feed configured</span>
          )}
        </div>

        {gqCorePath ? (
          <div className="mt-4">
            {(state.status === 'loading' || state.status === 'idle') && (
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                <span>Loading intelligence feed...</span>
              </div>
            )}

            {state.status === 'error' && (
              <div className="text-sm text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                Feed temporarily unavailable ({state.error}). This module is activated and will
                display intelligence as soon as the engine is online.
              </div>
            )}

            {state.status === 'success' && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-green-400 text-sm">Data Connected</span>
                </div>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words overflow-x-auto bg-slate-900/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {JSON.stringify(state.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-4 text-gray-400 text-sm">
            This module is activated. Intelligence will appear here once the data pipeline is
            connected.
          </p>
        )}
      </div>
    </div>
  )
}
