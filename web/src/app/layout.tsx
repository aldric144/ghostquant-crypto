import type { Metadata } from 'next'
import './globals.css'

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
        <nav className="bg-slate-950 border-b border-blue-900/30 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="text-2xl font-bold text-blue-400">GhostQuant</div>
              <div className="flex space-x-6">
                <a href="/" className="text-gray-300 hover:text-blue-400 transition">Dashboard</a>
                <a href="/alphabrain" className="text-gray-300 hover:text-blue-400 transition">AlphaBrain</a>
                <a href="/ecoscan" className="text-gray-300 hover:text-blue-400 transition">Ecoscan 🗺️</a>
                <a href="/backtests" className="text-gray-300 hover:text-blue-400 transition">Backtests</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
