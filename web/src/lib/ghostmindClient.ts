
interface Alert {
  type?: string
  score: number
  intelligence?: any
}

interface Entity {
  id: string
  type: string
  severity: string
  score: number
  activityCount: number
  chains: Set<string>
  tokens: Set<string>
}

interface Ring {
  name: string
  severity: string
  nodes: any[]
  activityCount: number
}

export class GhostMindClient {
  
  summarizeAlerts(alerts: Alert[], timeWindow: string = '10 minutes'): string {
    if (!alerts || alerts.length === 0) {
      return `No significant intelligence activity detected in the last ${timeWindow}.`
    }

    const highRisk = alerts.filter(a => a.score >= 0.7).length
    const mediumRisk = alerts.filter(a => a.score >= 0.4 && a.score < 0.7).length
    const lowRisk = alerts.filter(a => a.score < 0.4).length

    const types = alerts.map(a => (a.type || '').toLowerCase())
    const manipulationCount = types.filter(t => t.includes('manipulation')).length
    const whaleCount = types.filter(t => t.includes('whale')).length
    const darkpoolCount = types.filter(t => t.includes('darkpool')).length

    let summary = `**Intelligence Summary (Last ${timeWindow})**\n\n`
    summary += `📊 **Total Events:** ${alerts.length}\n`
    summary += `🔴 **High Risk:** ${highRisk} events\n`
    summary += `🟡 **Medium Risk:** ${mediumRisk} events\n`
    summary += `⚪ **Low Risk:** ${lowRisk} events\n\n`

    if (manipulationCount > 0) {
      summary += `⚠️ **Manipulation Activity:** ${manipulationCount} events detected - heightened coordination risk\n`
    }
    if (whaleCount > 0) {
      summary += `🐋 **Whale Activity:** ${whaleCount} large movements observed\n`
    }
    if (darkpoolCount > 0) {
      summary += `🕶️ **Darkpool Activity:** ${darkpoolCount} off-exchange flows detected\n`
    }

    if (highRisk > 5) {
      summary += `\n⚡ **Alert:** Elevated threat level - multiple high-risk events in short timeframe`
    }

    return summary
  }

  analyzeEntity(entity: Entity): string {
    if (!entity) {
      return 'No entity data available for analysis.'
    }

    let analysis = `**Entity Analysis: ${entity.id.substring(0, 12)}...**\n\n`
    
    if (entity.severity === 'high') {
      analysis += `🔴 **Risk Level:** HIGH (${(entity.score * 100).toFixed(0)}%)\n`
      analysis += `This entity exhibits suspicious behavior patterns consistent with manipulation or coordinated activity.\n\n`
    } else if (entity.severity === 'medium') {
      analysis += `🟡 **Risk Level:** MEDIUM (${(entity.score * 100).toFixed(0)}%)\n`
      analysis += `This entity shows some concerning behaviors but not conclusive manipulation indicators.\n\n`
    } else {
      analysis += `⚪ **Risk Level:** LOW (${(entity.score * 100).toFixed(0)}%)\n`
      analysis += `This entity appears to operate within normal parameters.\n\n`
    }

    analysis += `📈 **Activity Profile:**\n`
    analysis += `- Total Events: ${entity.activityCount}\n`
    analysis += `- Active Chains: ${entity.chains.size}\n`
    analysis += `- Tokens Traded: ${entity.tokens.size}\n\n`

    if (entity.chains.size > 3) {
      analysis += `🌐 **Cross-Chain Presence:** Significant multi-chain activity detected across ${entity.chains.size} networks. This suggests sophisticated operations or potential arbitrage strategies.\n\n`
    }

    if (entity.type === 'manipulation') {
      analysis += `⚠️ **Behavioral Flag:** Entity classified as potential manipulation actor. Monitor for coordinated behavior with other entities.\n`
    } else if (entity.type === 'whale') {
      analysis += `🐋 **Whale Classification:** Large holder with significant market influence. Movements may impact price action.\n`
    } else if (entity.type === 'darkpool') {
      analysis += `🕶️ **Darkpool Activity:** Off-exchange trading patterns detected. May indicate institutional positioning.\n`
    }

    return analysis
  }

  analyzeRing(ring: Ring): string {
    if (!ring) {
      return 'No ring data available for analysis.'
    }

    let analysis = `**Ring Analysis: ${ring.name}**\n\n`

    if (ring.severity === 'high') {
      analysis += `🔴 **Threat Level:** HIGH\n`
      analysis += `This ring exhibits strong coordination patterns consistent with market manipulation.\n\n`
    } else if (ring.severity === 'medium') {
      analysis += `🟡 **Threat Level:** MEDIUM\n`
      analysis += `This ring shows moderate coordination but requires further monitoring.\n\n`
    } else {
      analysis += `⚪ **Threat Level:** LOW\n`
      analysis += `This ring shows weak coordination patterns.\n\n`
    }

    analysis += `👥 **Ring Composition:**\n`
    analysis += `- Member Entities: ${ring.nodes.length}\n`
    analysis += `- Coordinated Events: ${ring.activityCount}\n\n`

    if (ring.nodes.length > 10) {
      analysis += `⚠️ **Large Network:** This ring contains ${ring.nodes.length} entities, suggesting a sophisticated coordination network.\n\n`
    }

    analysis += `🎯 **Recommendation:** `
    if (ring.severity === 'high') {
      analysis += `Immediate monitoring required. Flag all member entities for enhanced surveillance. Consider alerting compliance teams.`
    } else if (ring.severity === 'medium') {
      analysis += `Continue monitoring. Watch for escalation in coordination patterns or new member additions.`
    } else {
      analysis += `Routine monitoring sufficient. Re-evaluate if activity patterns change.`
    }

    return analysis
  }

  explainChain(chain: string, alerts: Alert[]): string {
    const chainAlerts = alerts.filter(a => 
      a.intelligence?.event?.chain?.toLowerCase() === chain.toLowerCase()
    )

    if (chainAlerts.length === 0) {
      return `No recent activity detected on ${chain.toUpperCase()}.`
    }

    let explanation = `**Chain Analysis: ${chain.toUpperCase()}**\n\n`
    explanation += `📊 **Activity Summary:**\n`
    explanation += `- Total Events: ${chainAlerts.length}\n`

    const highRisk = chainAlerts.filter(a => a.score >= 0.7).length
    const mediumRisk = chainAlerts.filter(a => a.score >= 0.4 && a.score < 0.7).length

    explanation += `- High Risk Events: ${highRisk}\n`
    explanation += `- Medium Risk Events: ${mediumRisk}\n\n`

    if (highRisk > 3) {
      explanation += `🔴 **Alert:** ${chain.toUpperCase()} showing elevated risk activity. Multiple high-severity events detected.\n\n`
    }

    const types = chainAlerts.map(a => (a.type || '').toLowerCase())
    const manipulationCount = types.filter(t => t.includes('manipulation')).length
    const whaleCount = types.filter(t => t.includes('whale')).length

    if (manipulationCount > 0) {
      explanation += `⚠️ **Manipulation Risk:** ${manipulationCount} manipulation-related events on ${chain.toUpperCase()}\n`
    }
    if (whaleCount > 0) {
      explanation += `🐋 **Whale Activity:** ${whaleCount} large holder movements on ${chain.toUpperCase()}\n`
    }

    return explanation
  }

  predictRisk(alerts: Alert[]): string {
    if (!alerts || alerts.length < 5) {
      return 'Insufficient data for risk prediction. Need more historical events.'
    }

    const recentAlerts = alerts.slice(0, 10)
    const olderAlerts = alerts.slice(10, 20)

    const recentAvgScore = recentAlerts.reduce((sum, a) => sum + a.score, 0) / recentAlerts.length
    const olderAvgScore = olderAlerts.length > 0 
      ? olderAlerts.reduce((sum, a) => sum + a.score, 0) / olderAlerts.length 
      : recentAvgScore

    const trend = recentAvgScore - olderAvgScore

    let prediction = `**Risk Trend Analysis**\n\n`
    prediction += `📈 **Current Risk Score:** ${(recentAvgScore * 100).toFixed(0)}%\n`
    prediction += `📊 **Previous Period:** ${(olderAvgScore * 100).toFixed(0)}%\n`
    prediction += `📉 **Trend:** ${trend > 0 ? '⬆️ INCREASING' : trend < 0 ? '⬇️ DECREASING' : '➡️ STABLE'}\n\n`

    if (trend > 0.1) {
      prediction += `🔴 **Warning:** Risk levels are rising. Recent events show ${((trend * 100).toFixed(0))}% increase in average severity.\n\n`
      prediction += `**Recommendation:** Heightened monitoring advised. Consider reducing exposure or implementing additional safeguards.`
    } else if (trend < -0.1) {
      prediction += `🟢 **Positive:** Risk levels are declining. Recent events show ${((Math.abs(trend) * 100).toFixed(0))}% decrease in average severity.\n\n`
      prediction += `**Recommendation:** Continue routine monitoring. Market conditions appear to be stabilizing.`
    } else {
      prediction += `🟡 **Stable:** Risk levels remain relatively constant.\n\n`
      prediction += `**Recommendation:** Maintain current monitoring protocols. Watch for any sudden changes in pattern.`
    }

    return prediction
  }

  generateInsight(alert: Alert): string {
    const score = alert.score
    const type = (alert.type || '').toLowerCase()

    let insight = ''

    if (score >= 0.8) {
      insight = `🔴 CRITICAL: `
    } else if (score >= 0.6) {
      insight = `🟠 HIGH: `
    } else if (score >= 0.4) {
      insight = `🟡 MEDIUM: `
    } else {
      insight = `⚪ LOW: `
    }

    if (type.includes('manipulation')) {
      insight += `Manipulation activity detected - coordinated behavior patterns identified`
    } else if (type.includes('whale')) {
      insight += `Whale movement detected - large holder activity may impact markets`
    } else if (type.includes('darkpool')) {
      insight += `Darkpool flow detected - off-exchange institutional activity`
    } else if (type.includes('stablecoin')) {
      insight += `Stablecoin movement detected - potential liquidity shift`
    } else if (type.includes('derivative')) {
      insight += `Derivatives activity detected - leverage positioning observed`
    } else {
      insight += `Intelligence event detected - ${type}`
    }

    return insight
  }

  answerQuestion(question: string, alerts: Alert[]): string {
    const q = question.toLowerCase()

    if (q.includes('summarize') || q.includes('summary')) {
      return this.summarizeAlerts(alerts, '10 minutes')
    }

    if (q.includes('risk') && (q.includes('current') || q.includes('now'))) {
      return this.predictRisk(alerts)
    }

    if (q.includes('manipulation')) {
      const manipAlerts = alerts.filter(a => (a.type || '').toLowerCase().includes('manipulation'))
      if (manipAlerts.length === 0) {
        return 'No active manipulation threats detected at this time.'
      }
      return `⚠️ **Manipulation Status:**\n\n${manipAlerts.length} manipulation-related events detected. ${manipAlerts.filter(a => a.score >= 0.7).length} are high severity.\n\nRecommendation: Monitor closely for coordinated behavior patterns.`
    }

    if (q.includes('whale')) {
      const whaleAlerts = alerts.filter(a => (a.type || '').toLowerCase().includes('whale'))
      if (whaleAlerts.length === 0) {
        return 'No significant whale activity detected at this time.'
      }
      return `🐋 **Whale Activity:**\n\n${whaleAlerts.length} whale movements detected. Large holders are actively repositioning.\n\nImpact: Potential market volatility expected.`
    }

    if (q.includes('chain') && q.includes('highest risk')) {
      const chains = new Map<string, number>()
      alerts.forEach(a => {
        const chain = a.intelligence?.event?.chain
        if (chain) {
          chains.set(chain, (chains.get(chain) || 0) + a.score)
        }
      })

      if (chains.size === 0) {
        return 'Insufficient chain data for risk analysis.'
      }

      const sortedChains = Array.from(chains.entries()).sort((a, b) => b[1] - a[1])
      const topChain = sortedChains[0]

      return `🌐 **Highest Risk Chain:** ${topChain[0].toUpperCase()}\n\nCumulative risk score: ${topChain[1].toFixed(2)}\n\nThis chain is experiencing the most significant threat activity currently.`
    }

    if (q.includes('active') && q.includes('entities')) {
      return `Based on recent intelligence, multiple entities are showing elevated activity. Use the Entity Explorer to view detailed profiles and behavioral analysis.`
    }

    if (q.includes('cross-chain') || q.includes('crosschain')) {
      const crossChainAlerts = alerts.filter(a => {
        const chain = a.intelligence?.event?.chain
        return chain && chain !== 'unknown'
      })
      const uniqueChains = new Set(crossChainAlerts.map(a => a.intelligence?.event?.chain))
      
      return `🌐 **Cross-Chain Activity:**\n\n${uniqueChains.size} chains showing activity\n${crossChainAlerts.length} cross-chain events detected\n\nMulti-chain operations suggest sophisticated actors or arbitrage strategies.`
    }

    return `I can help analyze:\n\n• Recent intelligence summaries\n• Entity behavior patterns\n• Manipulation ring analysis\n• Chain-specific threats\n• Risk predictions\n\nTry asking: "Summarize the last 10 minutes" or "Show current manipulation risks"`
  }
}

export const ghostmind = new GhostMindClient()
