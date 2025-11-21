'use client'

import { ReactNode } from 'react'

interface TileCardProps {
  icon?: ReactNode
  title: string
  value?: string | number
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    value: string
  }
  description?: string
  onClick?: () => void
  className?: string
}

export default function TileCard({
  icon,
  title,
  value,
  trend,
  description,
  onClick,
  className = ''
}: TileCardProps) {
  const trendColor = trend?.direction === 'up' 
    ? 'text-green-400' 
    : trend?.direction === 'down' 
    ? 'text-red-400' 
    : 'text-gray-400'

  return (
    <div
      onClick={onClick}
      className={`
        bg-slate-900/50 border border-blue-900/30 rounded-lg p-4
        hover:bg-slate-900/70 hover:border-blue-500/50 transition-all
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <div className="text-blue-400">{icon}</div>}
          <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        </div>
        {trend && (
          <div className={`text-xs font-medium ${trendColor}`}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}
          </div>
        )}
      </div>
      
      {value && (
        <div className="text-2xl font-bold text-white mb-1">
          {value}
        </div>
      )}
      
      {description && (
        <p className="text-xs text-gray-400 line-clamp-2">
          {description}
        </p>
      )}
    </div>
  )
}
