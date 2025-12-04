'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TerminalUltrafusionPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/ultrafusion')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting to UltraFusion...</p>
      </div>
    </div>
  )
}
