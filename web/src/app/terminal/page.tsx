'use client'

import ModuleGuide, { ModuleGuideButton } from '../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../components/terminal/moduleGuideContent'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TerminalIndexPage() {
  const [showGuide, setShowGuide] = useState(false)

  const router = useRouter()

  useEffect(() => {
    router.replace('/terminal/home')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting to Terminal Home...</p>
      </div>
    </div>
  )
}
