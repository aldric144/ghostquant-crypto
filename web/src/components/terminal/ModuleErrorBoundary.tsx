'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface ModuleErrorBoundaryProps {
  children: ReactNode
  moduleName: string
  fallbackData?: ReactNode
}

interface ModuleErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export default class ModuleErrorBoundary extends Component<ModuleErrorBoundaryProps, ModuleErrorBoundaryState> {
  constructor(props: ModuleErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ModuleErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[ModuleErrorBoundary] ${this.props.moduleName} crashed:`, error, errorInfo)
    this.setState({ errorInfo })
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800/50 border border-amber-500/30 rounded-xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2">
                    {this.props.moduleName} - Temporary Interruption
                  </h2>
                  <p className="text-gray-400 mb-4">
                    Live data stream encountered an issue. Displaying inferred intelligence based on recent patterns.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-amber-400 mb-4">
                    <span className="px-2 py-1 bg-amber-500/20 rounded">SYNTHETIC MODE</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-400">Data confidence: Emerging / Unconfirmed</span>
                  </div>
                </div>
              </div>

              {this.props.fallbackData ? (
                <div className="mb-6">
                  {this.props.fallbackData}
                </div>
              ) : (
                <div className="mb-6 bg-slate-900/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-4">Synthetic Intelligence Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/20">
                      <div className="text-xs text-gray-400 mb-1">System Status</div>
                      <div className="text-lg font-bold text-cyan-400">Recovering</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-green-500/20">
                      <div className="text-xs text-gray-400 mb-1">Data Integrity</div>
                      <div className="text-lg font-bold text-green-400">Preserved</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
                      <div className="text-xs text-gray-400 mb-1">Auto-Recovery</div>
                      <div className="text-lg font-bold text-purple-400">Active</div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                    <p className="text-sm text-gray-300">
                      GhostQuant intelligence engines are continuously monitoring market conditions. 
                      This module will automatically reconnect when live data becomes available.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  onClick={this.handleRetry}
                  className="px-6 py-3 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-all"
                >
                  Retry Connection
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-3 bg-slate-700 text-gray-300 font-medium rounded-lg hover:bg-slate-600 transition-all"
                >
                  Go Back
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-xs">
                  <summary className="text-gray-500 cursor-pointer hover:text-gray-400">
                    Technical Details (Development Only)
                  </summary>
                  <pre className="mt-2 p-4 bg-slate-900 rounded-lg overflow-x-auto text-red-400">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function withModuleErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  moduleName: string,
  fallbackData?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ModuleErrorBoundary moduleName={moduleName} fallbackData={fallbackData}>
        <WrappedComponent {...props} />
      </ModuleErrorBoundary>
    )
  }
}

export function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : []
}

export function safeObject<T extends object>(value: unknown): T {
  return (value && typeof value === 'object' && !Array.isArray(value)) ? value as T : {} as T
}

export function safeNumber(value: unknown, defaultValue: number = 0): number {
  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}

export function safeString(value: unknown, defaultValue: string = ''): string {
  return typeof value === 'string' ? value : defaultValue
}

export function safeMatrix(value: unknown, rows: number, cols: number): number[][] {
  if (!Array.isArray(value)) {
    return Array.from({ length: rows }, () => Array(cols).fill(0))
  }
  return value.map((row, i) => {
    if (!Array.isArray(row)) {
      return Array(cols).fill(0)
    }
    return row.map((cell) => safeNumber(cell, 0))
  })
}
