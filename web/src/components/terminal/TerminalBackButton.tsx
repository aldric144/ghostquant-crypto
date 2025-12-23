'use client'

import { useRouter } from 'next/navigation'

interface TerminalBackButtonProps {
  fallbackPath?: string
  className?: string
}

export default function TerminalBackButton({ 
  fallbackPath = '/terminal', 
  className = '' 
}: TerminalBackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    // Check if there's history to go back to
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      // Fallback to terminal home if no history (deep link)
      router.push(fallbackPath)
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm ${className}`}
      aria-label="Go back"
    >
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M10 19l-7-7m0 0l7-7m-7 7h18" 
        />
      </svg>
      <span>Back</span>
    </button>
  )
}
