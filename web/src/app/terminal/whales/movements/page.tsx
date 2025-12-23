'use client'

import TerminalBackButton from '../../../../components/terminal/TerminalBackButton'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

interface WhaleMovement {
  from_address: string
  to_address: string
  symbol: string
  usd_value: number
  timestamp: string
}

export default function WhaleMovementsPage() {
  const [movements, setMovements] = useState<WhaleMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchMovements()
    
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchMovements, 10000) // Refresh every 10 seconds
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoRefresh])

  const fetchMovements = async () => {
    try {
      const response = await fetch(`${API_BASE}/whales/movements?limit=100`)
      if (response.ok) {
        const data = await response.json()
        setMovements(data)
      } else {
        // Use demo data if API not available
        setMovements(generateDemoMovements(100))
      }
    } catch (err) {
      console.error('Error fetching movements:', err)
      setMovements(generateDemoMovements(100))
    } finally {
      setLoading(false)
    }
  }

  const generateDemoMovements = (count: number): WhaleMovement[] => {
    const symbols = ['ETH', 'BTC', 'USDT', 'USDC', 'WBTC', 'DAI', 'LINK', 'UNI']
    return Array.from({ length: count }, (_, i) => ({
      from_address: `0x${Math.random().toString(16).slice(2, 42)}`,
      to_address: `0x${Math.random().toString(16).slice(2, 42)}`,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      usd_value: Math.random() * 10000000 + 100000,
      timestamp: new Date(Date.now() - i * 60000 * Math.random() * 10).toISOString()
    }))
  }

  const formatUSD = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  const getValueColor = (value: number) => {
    if (value >= 10000000) return '#ff4444'
    if (value >= 1000000) return '#ffaa00'
    if (value >= 100000) return '#00ff88'
    return '#00ccff'
  }

  const getSymbolEmoji = (symbol: string) => {
    const emojis: Record<string, string> = {
      'BTC': '₿',
      'ETH': 'Ξ',
      'USDT': '💵',
      'USDC': '💵',
      'WBTC': '₿',
      'DAI': '◈',
      'LINK': '⬡',
      'UNI': '🦄'
    }
    return emojis[symbol] || '●'
  }

  return (
    <div style={{ padding: '24px', color: '#e0e0e0', minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/terminal/whales">
            <button style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '8px', color: '#888', cursor: 'pointer' }}>
              ← Back
            </button>
          </Link>
          <TerminalBackButton className="mb-4" />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6666', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🌊</span>
            Global Whale Movement Stream
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: autoRefresh ? '#00ff88' : '#666',
                animation: autoRefresh ? 'pulse 2s infinite' : 'none'
              }} 
            />
            <span style={{ fontSize: '12px', color: '#888' }}>
              {autoRefresh ? 'Live' : 'Paused'}
            </span>
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              padding: '8px 16px',
              background: autoRefresh ? 'rgba(255, 102, 102, 0.2)' : 'rgba(0, 255, 136, 0.2)',
              border: `1px solid ${autoRefresh ? '#ff6666' : '#00ff88'}`,
              borderRadius: '8px',
              color: autoRefresh ? '#ff6666' : '#00ff88',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {autoRefresh ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={fetchMovements}
            style={{
              padding: '8px 16px',
              background: 'rgba(0, 204, 255, 0.2)',
              border: '1px solid #00ccff',
              borderRadius: '8px',
              color: '#00ccff',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '24px', 
        marginBottom: '24px', 
        padding: '16px', 
        background: 'rgba(255, 255, 255, 0.05)', 
        borderRadius: '12px' 
      }}>
        <div>
          <span style={{ color: '#888', fontSize: '12px' }}>Total Movements: </span>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>{movements.length}</span>
        </div>
        <div>
          <span style={{ color: '#888', fontSize: '12px' }}>Total Volume: </span>
          <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
            {formatUSD(movements.reduce((sum, m) => sum + m.usd_value, 0))}
          </span>
        </div>
        <div>
          <span style={{ color: '#888', fontSize: '12px' }}>Avg Movement: </span>
          <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>
            {formatUSD(movements.reduce((sum, m) => sum + m.usd_value, 0) / Math.max(movements.length, 1))}
          </span>
        </div>
      </div>

      {/* Movement Stream */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌊</div>
          Loading movement stream...
        </div>
      ) : (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <th style={{ padding: '16px', textAlign: 'left', color: '#888', fontSize: '12px', fontWeight: 'normal' }}>Time</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#888', fontSize: '12px', fontWeight: 'normal' }}>From</th>
                <th style={{ padding: '16px', textAlign: 'center', color: '#888', fontSize: '12px', fontWeight: 'normal' }}>Token</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#888', fontSize: '12px', fontWeight: 'normal' }}>To</th>
                <th style={{ padding: '16px', textAlign: 'right', color: '#888', fontSize: '12px', fontWeight: 'normal' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement, i) => (
                <tr 
                  key={i}
                  style={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.2s ease',
                    animation: i < 5 ? 'fadeIn 0.5s ease' : 'none'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px', color: '#888', fontSize: '12px' }}>
                    {formatTime(movement.timestamp)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/terminal/whales/${movement.from_address}`}>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#00ccff', cursor: 'pointer' }}>
                        {movement.from_address.slice(0, 10)}...{movement.from_address.slice(-6)}
                      </span>
                    </Link>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      padding: '4px 8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      <span>{getSymbolEmoji(movement.symbol)}</span>
                      <span>{movement.symbol}</span>
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/terminal/whales/${movement.to_address}`}>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#00ccff', cursor: 'pointer' }}>
                        {movement.to_address.slice(0, 10)}...{movement.to_address.slice(-6)}
                      </span>
                    </Link>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span style={{ 
                      color: getValueColor(movement.usd_value), 
                      fontWeight: 'bold',
                      fontSize: movement.usd_value >= 1000000 ? '14px' : '12px'
                    }}>
                      {formatUSD(movement.usd_value)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; background: rgba(0, 255, 136, 0.1); }
          to { opacity: 1; background: transparent; }
        }
      `}</style>
    </div>
  )
}
