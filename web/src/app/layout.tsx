import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'
import BottomNavBar from '@/components/mobile/BottomNavBar'

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
      <body className="bg-slate-900 text-gray-100">
        <NavBar />
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
        <BottomNavBar />
      </body>
    </html>
  )
}
