'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Redirect-only page for /backtests route.
 * 
 * The backtests UI is now ONLY mounted at /terminal/backtests.
 * This page exists solely to redirect users who navigate to /backtests
 * to the correct terminal route.
 * 
 * This is a routing ownership fix - the actual UI lives at /terminal/backtests
 * which is wrapped in ModuleErrorBoundary with synthetic fallback.
 */
export default function BacktestsRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the terminal backtests route
    router.replace('/terminal/backtests')
  }, [router])

  // Show a brief loading state while redirecting
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p className="text-gray-400 text-sm">Redirecting to Backtests Console...</p>
      </div>
    </div>
  )
}
