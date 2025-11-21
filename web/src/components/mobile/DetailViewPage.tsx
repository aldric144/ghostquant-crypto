'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface DetailViewPageProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  children: ReactNode
}

export default function DetailViewPage({ title, subtitle, icon, children }: DetailViewPageProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-blue-900/30 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3 flex-1">
            {icon && <div className="text-blue-400">{icon}</div>}
            <div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
              {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  )
}
