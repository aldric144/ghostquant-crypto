import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import NavBar from '@/components/NavBar'
import BottomNavBar from '@/components/mobile/BottomNavBar'
import DebugConsole from '@/components/DebugConsole'
import { CopilotUIRoot } from '@/components/CopilotUI'

export const metadata: Metadata = {
  title: 'GhostQuant',
  description: 'Private crypto-native research & signal platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://aframe.io/releases/1.4.0/aframe.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="bg-slate-900 text-gray-100">
        <NavBar />
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
        <BottomNavBar />
        <DebugConsole />
        <CopilotUIRoot />
      </body>
    </html>
  )
}
