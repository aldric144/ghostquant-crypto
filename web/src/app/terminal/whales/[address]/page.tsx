'use client'

import TerminalBackButton from '../../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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

interface WhaleMovement {
  from_address: string
  to_address: string
  symbol: string
  usd_value: number
  timestamp: string
}

interface WhaleProfile {
  whale: WhaleAddress
  recent_movements: WhaleMovement[]
  counterparties: string[]
  behavior_summary: string
}

export default function WhaleProfilePage() {
  const params = useParams()
  const address = params.address as string
  
  const [profile, setProfile] = useState<WhaleProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newTag, setNewTag] = useState('')
  const [addingTag, setAddingTag] = useState(false)

  useEffect(() => {
    if (address) {
      fetchWhaleProfile()
    }
  }, [address])

  const fetchWhaleProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/whales/${encodeURIComponent(address)}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        // Use demo data if API not available
        setProfile(generateDemoProfile(address))
      }
    } catch (err) {
      console.error('Error fetching whale profile:', err)
      setProfile(generateDemoProfile(address))
    } finally {
      setLoading(false)
    }
  }

  const generateDemoProfile = (addr: string): WhaleProfile => {
    const movements: WhaleMovement[] = Array.from({ length: 20 }, (_, i) => ({
      from_address: i % 2 === 0 ? addr : `0x${Math.random().toString(16).slice(2, 42)}`,
      to_address: i % 2 === 1 ? addr : `0x${Math.random().toString(16).slice(2, 42)}`,
      symbol: ['ETH', 'BTC', 'USDT', 'USDC'][Math.floor(Math.random() * 4)],
      usd_value: Math.random() * 5000000 + 100000,
      timestamp: new Date(Date.now() - i * 3600000 * Math.random() * 24).toISOString()
    }))

    const counterparties = Array.from({ length: 15 }, () => 
      `0x${Math.random().toString(16).slice(2, 42)}`
    )

    return {
      whale: {
        address: addr,
        first_seen: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        last_seen: new Date().toISOString(),
        total_volume_usd: Math.random() * 500000000 + 10000000,
        num_movements: Math.floor(Math.random() * 1000) + 50,
        tags: ['whale', 'defi'],
        risk_score: Math.random() * 60 + 10,
        influence_score: Math.random() * 40 + 50
      },
      recent_movements: movements,
      counterparties,
      behavior_summary: `This whale is highly influential with large-scale transaction patterns. Total volume: $${(Math.random() * 500000000 + 10000000).toLocaleString()} across ${Math.floor(Math.random() * 1000) + 50} movements. Risk score: ${(Math.random() * 60 + 10).toFixed(1)}/100.`
    }
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) return
    
    try {
      setAddingTag(true)
      const response = await fetch(`${API_BASE}/whales/tag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, tag: newTag.trim() })
      })
      
      if (response.ok) {
        // Refresh profile
        await fetchWhaleProfile()
        setNewTag('')
      } else {
        // Add tag locally for demo
        if (profile) {
          setProfile({
            ...profile,
            whale: {
              ...profile.whale,
              tags: [...profile.whale.tags, newTag.trim()]
            }
          })
          setNewTag('')
        }
      }
    } catch (err) {
      console.error('Error adding tag:', err)
      // Add tag locally for demo
      if (profile) {
        setProfile({
          ...profile,
          whale: {
            ...profile.whale,
            tags: [...profile.whale.tags, newTag.trim()]
          }
        })
        setNewTag('')
      }
    } finally {
      setAddingTag(false)
    }
  }

  const formatUSD = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
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

  if (loading) {
    return (
      <div style={{ padding: '24px', color: '#e0e0e0', minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🐋</div>
          <div>Loading whale profile...</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ padding: '24px', color: '#e0e0e0', minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <div>Whale not found</div>
          <Link href="/terminal/whales">
            <button style={{ marginTop: '16px', padding: '12px 24px', background: '#00ccff', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const { whale, recent_movements, counterparties, behavior_summary } = profile

  return (
    <div style={{ padding: '24px', color: '#e0e0e0', minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/terminal/whales">
          <button style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '8px', color: '#888', cursor: 'pointer' }}>
            ← Back
          </button>
        </Link>
        <TerminalBackButton className="mb-4" />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ccff', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🐋</span>
          Whale Profile
        </h1>
      </div>

      {/* Address Card */}
      <div style={{ background: 'rgba(0, 204, 255, 0.1)', border: '1px solid rgba(0, 204, 255, 0.3)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '18px', color: '#00ccff', marginBottom: '16px', wordBreak: 'break-all' }}>
          {whale.address}
        </div>
        
        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {whale.tags.map((tag, i) => (
            <span 
              key={i}
              style={{
                padding: '4px 12px',
                background: 'rgba(0, 204, 255, 0.2)',
                borderRadius: '16px',
                fontSize: '12px'
              }}
            >
              {tag}
            </span>
          ))}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Add tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              style={{
                padding: '4px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                color: '#e0e0e0',
                fontSize: '12px',
                width: '120px'
              }}
            />
            <button
              onClick={handleAddTag}
              disabled={addingTag}
              style={{
                padding: '4px 12px',
                background: '#00ccff',
                border: 'none',
                borderRadius: '16px',
                color: '#000',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Total Volume</div>
            <div style={{ color: '#00ff88', fontSize: '20px', fontWeight: 'bold' }}>{formatUSD(whale.total_volume_usd)}</div>
          </div>
          <div>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Movements</div>
            <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>{whale.num_movements}</div>
          </div>
          <div>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Influence Score</div>
            <div style={{ color: getInfluenceColor(whale.influence_score), fontSize: '20px', fontWeight: 'bold' }}>{whale.influence_score.toFixed(1)}</div>
          </div>
          <div>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Risk Score</div>
            <div style={{ color: getRiskColor(whale.risk_score), fontSize: '20px', fontWeight: 'bold' }}>{whale.risk_score.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {/* Behavior Analysis */}
      <div style={{ background: 'rgba(255, 204, 0, 0.1)', border: '1px solid rgba(255, 204, 0, 0.3)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffcc00', marginBottom: '12px' }}>
          Behavior Analysis
        </h2>
        <p style={{ color: '#e0e0e0', lineHeight: '1.6' }}>{behavior_summary}</p>
        <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '12px', color: '#888' }}>
          <span>First seen: {formatDate(whale.first_seen)}</span>
          <span>Last seen: {formatDate(whale.last_seen)}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Movement Timeline */}
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>
            Recent Movements
          </h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {recent_movements.map((movement, i) => {
              const isOutgoing = movement.from_address.toLowerCase() === whale.address.toLowerCase()
              return (
                <div 
                  key={i}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: isOutgoing ? 'rgba(255, 102, 102, 0.2)' : 'rgba(0, 255, 136, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px'
                  }}>
                    {isOutgoing ? '↑' : '↓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {isOutgoing ? 'Sent to' : 'Received from'}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#00ccff' }}>
                      {isOutgoing ? movement.to_address.slice(0, 20) : movement.from_address.slice(0, 20)}...
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: isOutgoing ? '#ff6666' : '#00ff88', fontWeight: 'bold' }}>
                      {isOutgoing ? '-' : '+'}{formatUSD(movement.usd_value)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888' }}>{movement.symbol}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Counterparties */}
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>
            Counterparties ({counterparties.length})
          </h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {counterparties.map((cp, i) => (
              <Link key={i} href={`/terminal/whales/${cp}`}>
                <div 
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: '#00ccff',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {cp.slice(0, 24)}...
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
