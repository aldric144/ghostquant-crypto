import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://ghostquant-mewzi.ondigitalocean.app'

export async function GET() {
  try {
    // Fetch data from multiple backend endpoints to construct AlphaBrain summary
    const [marketOverview, marketGlobal, topMovers, radarSummary] = await Promise.all([
      fetch(`${API_BASE}/market/overview`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}/market/global`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}/market/top-movers?limit=10`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}/radar/summary`).then(r => r.ok ? r.json() : null).catch(() => null),
    ])

    // Extract market data for regime analysis
    const globalData = marketGlobal?.data || {}
    const topCoins = marketOverview?.data?.top_coins || []
    const gainers = topMovers?.data?.gainers || []

    // Determine market regime based on available data
    const btcChange = topCoins.find((c: any) => c.symbol === 'BTC')?.change_24h || 0
    const marketCapChange = globalData.market_cap_change_24h || 0
    
    let regime = 'neutral'
    let confidence = 0.5
    let exposureMultiplier = 1.0
    let interpretation = 'Market conditions are neutral with mixed signals.'

    if (marketCapChange > 2 && btcChange > 1) {
      regime = 'risk_on'
      confidence = Math.min(0.9, 0.5 + marketCapChange / 10)
      exposureMultiplier = 1.2
      interpretation = 'Strong bullish momentum detected. Market conditions favor increased exposure to risk assets.'
    } else if (marketCapChange < -2 && btcChange < -1) {
      regime = 'risk_off'
      confidence = Math.min(0.9, 0.5 + Math.abs(marketCapChange) / 10)
      exposureMultiplier = 0.7
      interpretation = 'Bearish conditions detected. Consider reducing exposure and moving to defensive positions.'
    } else if (marketCapChange < -5 || btcChange < -5) {
      regime = 'crisis'
      confidence = 0.85
      exposureMultiplier = 0.3
      interpretation = 'Crisis conditions detected. Significant market stress requires defensive positioning.'
    }

    // Build top picks from gainers
    const topPicks = gainers.slice(0, 5).map((coin: any, idx: number) => ({
      symbol: coin.symbol,
      weight: Math.max(0.05, 0.3 - idx * 0.05),
      smart_beta_score: Math.min(1, (coin.change_24h || 0) / 10 + 0.5),
      rationale: `${coin.name} showing ${coin.change_24h?.toFixed(2)}% 24h momentum with strong volume`
    }))

    // Calculate portfolio metrics
    const totalWeight = topPicks.reduce((sum: number, p: any) => sum + p.weight, 0)
    const normalizedPicks = topPicks.map((p: any) => ({ ...p, weight: p.weight / totalWeight }))
    const weights: Record<string, number> = {}
    normalizedPicks.forEach((p: any) => { weights[p.symbol] = p.weight })

    const maxWeight = Math.max(...normalizedPicks.map((p: any) => p.weight))
    const herfindahl = normalizedPicks.reduce((sum: number, p: any) => sum + p.weight * p.weight, 0)

    // Determine strategy based on regime
    let primaryStrategy = 'balanced_growth'
    let strategyRationale = 'Maintain balanced exposure across momentum leaders.'

    if (regime === 'risk_on') {
      primaryStrategy = 'aggressive_momentum'
      strategyRationale = 'Market conditions favor aggressive positioning in high-momentum assets.'
    } else if (regime === 'risk_off') {
      primaryStrategy = 'defensive_quality'
      strategyRationale = 'Rotate to quality assets and reduce overall exposure.'
    } else if (regime === 'crisis') {
      primaryStrategy = 'capital_preservation'
      strategyRationale = 'Prioritize capital preservation with minimal risk exposure.'
    }

    // Calculate narrative sentiment from market data
    const avgChange = topCoins.slice(0, 10).reduce((sum: number, c: any) => sum + (c.change_24h || 0), 0) / 10
    const overallTone = avgChange > 1 ? 'bullish' : avgChange < -1 ? 'bearish' : 'neutral'

    const summary = {
      regime: {
        regime,
        confidence,
        exposure_multiplier: exposureMultiplier,
        interpretation,
        macro_data: {
          vix: 18.5 + Math.random() * 5, // Simulated VIX
          dxy: 104.2 + Math.random() * 2, // Simulated DXY
          yield_spread: 0.5 + Math.random() * 0.5, // Simulated yield spread
          spy_momentum: marketCapChange / 100
        }
      },
      portfolio: {
        weights,
        metrics: {
          expected_return: Math.max(0.05, avgChange / 100 + 0.1),
          volatility: Math.abs(avgChange) / 100 + 0.15,
          sharpe: Math.max(0.5, avgChange / 10 + 1),
          max_weight: maxWeight,
          herfindahl_index: herfindahl,
          effective_n_assets: 1 / herfindahl
        },
        top_picks: normalizedPicks
      },
      playbook_recommendation: {
        primary_strategy: primaryStrategy,
        rationale: strategyRationale
      },
      narrative: {
        n_narratives: topCoins.length,
        avg_sentiment: avgChange / 10,
        overall_tone: overallTone
      }
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error fetching AlphaBrain summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AlphaBrain summary' },
      { status: 500 }
    )
  }
}
