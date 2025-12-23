'use client'

import { useState, useRef, useEffect } from 'react'

interface InfoTooltipProps {
  content: string
  className?: string
}

export default function InfoTooltip({ content, className = '' }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState<'top' | 'bottom'>('top')
  const tooltipRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isVisible && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const spaceAbove = rect.top
      const spaceBelow = window.innerHeight - rect.bottom
      setPosition(spaceAbove > 100 ? 'top' : 'bottom')
    }
  }, [isVisible])

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="w-4 h-4 flex items-center justify-center rounded-full bg-slate-700/50 hover:bg-slate-600/50 text-gray-400 hover:text-cyan-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        aria-label="More information"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`absolute z-50 w-64 px-3 py-2 text-xs text-gray-300 bg-slate-800 border border-cyan-500/30 rounded-lg shadow-lg ${
            position === 'top' 
              ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' 
              : 'top-full mt-2 left-1/2 -translate-x-1/2'
          }`}
        >
          {content}
          <div 
            className={`absolute w-2 h-2 bg-slate-800 border-cyan-500/30 transform rotate-45 left-1/2 -translate-x-1/2 ${
              position === 'top' 
                ? 'top-full -mt-1 border-r border-b' 
                : 'bottom-full -mb-1 border-l border-t'
            }`}
          />
        </div>
      )}
    </div>
  )
}
