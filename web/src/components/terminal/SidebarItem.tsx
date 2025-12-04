'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface SidebarItemProps {
  href: string
  icon: ReactNode
  label: string
  isCollapsed?: boolean
}

export default function SidebarItem({ href, icon, label, isCollapsed }: SidebarItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
        ${isActive
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-500/20'
          : 'text-gray-400 hover:text-cyan-400 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-cyan-500/10'
        }
        ${isCollapsed ? 'justify-center' : ''}
      `}
    >
      <div className={`flex-shrink-0 ${isActive ? 'text-cyan-400' : ''}`}>
        {icon}
      </div>
      {!isCollapsed && (
        <span className="text-sm font-medium truncate">{label}</span>
      )}
    </Link>
  )
}
