'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'

interface WhaleAddress {
  address: string
  first_seen: string
  last_seen: string
  total_volume_usd: number
  num_movements: number
  tags: string[]
  risk_score: number
  influence_score: number
}

interface WhaleStats {
  total_whales_tracked: number
  total_movements_recorded: number
  top_10_volume_usd: number
  recent_movement_count: number
}

export default function WhaleIntelligenceDashboard() {
  const [showGuide, setShowGuide] = useState(false)
  const [topWhales, setTopWhales] = useState<WhaleAddress[]>([])
  const [stats, setStats] = useState<WhaleStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<WhaleAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTopWhales()
    fetchStats()
  }, [])

  const fetchTopWhales = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/whales/top?limit=50`)
      if (response.ok) {
        const data = await response.json()
        setTopWhales(data)
      } else {
        // Use demo data if API not available
        setTopWhales(generateDemoWhales(50))
      }
    } catch (err) {
      console.error('Error fetching top whales:', err)
      setTopWhales(generateDemoWhales(50))
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/whales/stats/summary`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setStats({
          total_whales_tracked: 1247,
          total_movements_recorded: 15832,
          top_10_volume_usd: 2500000000,
          recent_movement_count: 342
        })
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
      setStats({
        total_whales_tracked: 1247,
        total_movements_recorded: 15832,
        top_10_volume_usd: 2500000000,
        recent_movement_count: 342
      })
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    try {
      setSearching(true)
      const response = await fetch(`${API_BASE}/whales/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      } else {
        // Filter demo data for search
        const filtered = topWhales.filter(w => 
          w.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        setSearchResults(filtered)
      }
    } catch (err) {
      console.error('Error searching whales:', err)
      const filtered = topWhales.filter(w => 
        w.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(filtered)
    } finally {
      setSearching(false)
    }
  }

  const generateDemoWhales = (count: number): WhaleAddress[] => {
    const tags = ['exchange', 'defi', 'nft', 'whale', 'institutional', 'market-maker']
    return Array.from({ length: count }, (_, i) => ({
      address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      first_seen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      last_seen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      total_volume_usd: Math.random() * 100000000 + 1000000,
      num_movements: Math.floor(Math.random() * 500) + 10,
      tags: [tags[Math.floor(Math.random() * tags.length)]],
      risk_score: Math.random() * 100,
      influence_score: 100 - i * 1.5
    }))
  }

  const formatUSD = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const getInfluenceColor = (score: number) => {
    if (score >= 80) return '#00ff88'
    if (score >= 60) return '#00ccff'
    if (score >= 40) return '#ffcc00'
    return '#ff6666'
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return '#ff4444'
    if (score >= 40) return '#ffaa00'
    return '#00ff88'
  }

  const displayWhales = searchResults.length > 0 ? searchResults : topWhales

  return (
    <div style={{ padding: '24px', color: '#e0e0e0', minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)' }}>
      <div style={{ marginBottom: '32px' }}>
        <TerminalBackButton className="mb-4" />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#00ccff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>🐋</span>
          Whale Intelligence Database
        </h1>
        <p style={{ color: '#888', fontSize: '14px' }}>
          Track, analyze, and monitor whale wallet activity across the blockchain ecosystem
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(0, 204, 255, 0.1)', border: '1px solid rgba(0, 204, 255, 0.3)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Whales Tracked</div>
            <div style={{ color: '#00ccff', fontSize: '24px', fontWeight: 'bold' }}>{stats.total_whales_tracked.toLocaleString()}</div>
          </div>
          <div style={{ background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Total Movements</div>
            <div style={{ color: '#00ff88', fontSize: '24px', fontWeight: 'bold' }}>{stats.total_movements_recorded.toLocaleString()}</div>
          </div>
          <div style={{ background: 'rgba(255, 204, 0, 0.1)', border: '1px solid rgba(255, 204, 0, 0.3)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Top 10 Volume</div>
            <div style={{ color: '#ffcc00', fontSize: '24px', fontWeight: 'bold' }}>{formatUSD(stats.top_10_volume_usd)}</div>
          </div>
          <div style={{ background: 'rgba(255, 102, 102, 0.1)', border: '1px solid rgba(255, 102, 102, 0.3)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Recent Activity</div>
            <div style={{ color: '#ff6666', fontSize: '24px', fontWeight: 'bold' }}>{stats.recent_movement_count}</div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <input
          type="text"
          placeholder="Search whale address or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#e0e0e0',
            fontSize: '14px'
          }}
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #00ccff 0%, #0088cc 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
            opacity: searching ? 0.7 : 1
          }}
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
        <Link href="/terminal/whales/movements">
          <button
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #ff6666 0%, #cc4444 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Live Movements
          </button>
        </Link>
      </div>

      {/* Influence Heatmap */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>
          Influence Heatmap (Top 20)
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {displayWhales.slice(0, 20).map((whale, i) => (
            <Link key={i} href={`/terminal/whales/${whale.address}`}>
              <div
                style={{
                  width: `${Math.max(60, whale.influence_score)}px`,
                  height: `${Math.max(40, whale.influence_score * 0.6)}px`,
                  background: getInfluenceColor(whale.influence_score),
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: 0.8,
                  transition: 'all 0.2s ease'
                }}
                title={`${whale.address}\nInfluence: ${whale.influence_score.toFixed(1)}`}
              >
                <span style={{ fontSize: '10px', color: '#000', fontWeight: 'bold' }}>
                  {whale.influence_score.toFixed(0)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Whale Table */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>
          {searchResults.length > 0 ? `Search Results (${searchResults.length})` : 'Top 50 Whales'}
        </h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            Loading whale data...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888', fontSize: '12px' }}>Rank</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888', fontSize: '12px' }}>Address</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888', fontSize: '12px' }}>Tags</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#888', fontSize: '12px' }}>Volume</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#888', fontSize: '12px' }}>Movements</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#888', fontSize: '12px' }}>Influence</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#888', fontSize: '12px' }}>Risk</th>
                </tr>
              </thead>
              <tbody>
                {displayWhales.map((whale, i) => (
                  <tr 
                    key={i} 
                    style={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onClick={() => window.location.href = `/terminal/whales/${whale.address}`}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px', color: '#666' }}>#{i + 1}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', color: '#00ccff' }}>
                      {whale.address}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {whale.tags.map((tag, j) => (
                        <span 
                          key={j}
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            background: 'rgba(0, 204, 255, 0.2)',
                            borderRadius: '4px',
                            fontSize: '11px',
                            marginRight: '4px'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#00ff88' }}>
                      {formatUSD(whale.total_volume_usd)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>
                      {whale.num_movements}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <span style={{ color: getInfluenceColor(whale.influence_score) }}>
                        {whale.influence_score.toFixed(1)}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <span style={{ color: getRiskColor(whale.risk_score) }}>
                        {whale.risk_score.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
