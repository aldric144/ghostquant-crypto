'use client'

import { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export default function SectionHeader({ title, subtitle, icon, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && <div className="text-blue-400">{icon}</div>}
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
