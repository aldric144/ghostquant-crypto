import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import BottomNavBar from '@/components/mobile/BottomNavBar'
import DebugConsole from '@/components/DebugConsole'
import { CopilotUIRoot } from '@/components/CopilotUI'

export const metadata: Metadata = {
  title: 'GhostQuant',
  description: 'Autonomous Intelligence for the Global Financial System',
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
      <body className="bg-[#0a0e1a] text-gray-100">
        <NavBar />
        <main>
          {children}
        </main>
        <Footer />
        <BottomNavBar />
        <DebugConsole />
        <CopilotUIRoot />
      </body>
    </html>
  )
}
