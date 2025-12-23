
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

type ConfidenceTier = 'early_signal' | 'emerging_pattern' | 'confirmed_structure' | 'synthesized_risk'

interface ConfidenceContext {
  tier: ConfidenceTier
  provenance: string
  caveats?: string[]
}

export class GhostMindClient {

  private getConfidencePrefix(context: ConfidenceContext): string {
    const tierLabels: Record<ConfidenceTier, string> = {
      'early_signal': 'Early Signal',
      'emerging_pattern': 'Emerging Pattern',
      'confirmed_structure': 'Confirmed Structure',
      'synthesized_risk': 'Synthesized Risk'
    }
    
    return `**[${tierLabels[context.tier]}]** ${context.provenance}\n\n`
  }

  private getConfidenceSuffix(context: ConfidenceContext): string {
    let suffix = '\n\n---\n'
    
    if (context.caveats && context.caveats.length > 0) {
      suffix += `*Note: ${context.caveats.join(' ')}*\n`
    }
    
    if (context.tier === 'synthesized_risk') {
      suffix += '*This assessment aggregates signals across multiple engines. For confirmed counts, refer to specialized modules (Ring Detector, Manipulation Detector).*'
    } else if (context.tier === 'early_signal') {
      suffix += '*This represents an initial indicator. Additional confirmation may be required.*'
    } else if (context.tier === 'emerging_pattern') {
      suffix += '*Multiple signals are aligning. Pattern is forming but not yet confirmed by strict thresholds.*'
    }
    
    return suffix
  }

  private determineConfidenceTier(alerts: Alert[]): ConfidenceTier {
    if (!alerts || alerts.length === 0) return 'early_signal'
    
    const highRiskCount = alerts.filter(a => a.score >= 0.7).length
    const mediumRiskCount = alerts.filter(a => a.score >= 0.4 && a.score < 0.7).length
    const hasMultipleTypes = new Set(alerts.map(a => a.type)).size > 2
    
    if (highRiskCount >= 3 && hasMultipleTypes) {
      return 'synthesized_risk'
    } else if (highRiskCount >= 1 || mediumRiskCount >= 3) {
      return 'confirmed_structure'
    } else if (mediumRiskCount >= 1 || alerts.length >= 3) {
      return 'emerging_pattern'
    }
    return 'early_signal'
  }
  
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
    const tier = this.determineConfidenceTier(alerts)

    if (q.includes('summarize') || q.includes('summary')) {
      const context: ConfidenceContext = {
        tier: 'synthesized_risk',
        provenance: 'Based on aggregated signals across multiple intelligence engines.',
        caveats: ['Some activity may be emerging and not yet confirmed.']
      }
      return this.getConfidencePrefix(context) + this.summarizeAlerts(alerts, '10 minutes') + this.getConfidenceSuffix(context)
    }

    if (q.includes('risk') && (q.includes('current') || q.includes('now'))) {
      const context: ConfidenceContext = {
        tier: tier,
        provenance: 'Risk assessment derived from recent event patterns.',
        caveats: ['Predictions are probability-based and update as new data arrives.']
      }
      return this.getConfidencePrefix(context) + this.predictRisk(alerts) + this.getConfidenceSuffix(context)
    }

    if (q.includes('manipulation')) {
      const manipAlerts = alerts.filter(a => (a.type || '').toLowerCase().includes('manipulation'))
      if (manipAlerts.length === 0) {
        return 'Based on current intelligence, no manipulation indicators have been detected. This assessment may change as new data becomes available.'
      }
      const highSeverity = manipAlerts.filter(a => a.score >= 0.7).length
      const manipTier: ConfidenceTier = highSeverity >= 2 ? 'confirmed_structure' : manipAlerts.length >= 3 ? 'emerging_pattern' : 'early_signal'
      const context: ConfidenceContext = {
        tier: manipTier,
        provenance: 'Manipulation assessment based on coordination pattern detection.',
        caveats: ['For confirmed ring structures, refer to the Ring Detector module.']
      }
      const body = `**Manipulation Indicators:**\n\n${manipAlerts.length} manipulation-related signals detected. ${highSeverity} appear to be high severity based on current thresholds.\n\n**Recommendation:** Monitor for coordinated behavior patterns. Confirmed structures will appear in the Ring Detector.`
      return this.getConfidencePrefix(context) + body + this.getConfidenceSuffix(context)
    }

    if (q.includes('whale')) {
      const whaleAlerts = alerts.filter(a => (a.type || '').toLowerCase().includes('whale'))
      if (whaleAlerts.length === 0) {
        return 'Based on current intelligence, no significant whale activity has been detected. This assessment may change as new data becomes available.'
      }
      const whaleTier: ConfidenceTier = whaleAlerts.length >= 5 ? 'confirmed_structure' : whaleAlerts.length >= 2 ? 'emerging_pattern' : 'early_signal'
      const context: ConfidenceContext = {
        tier: whaleTier,
        provenance: 'Whale activity assessment based on large holder movement detection.',
        caveats: ['Market impact is probabilistic and depends on execution timing.']
      }
      const body = `**Whale Activity Indicators:**\n\n${whaleAlerts.length} whale movement signals detected. Large holders appear to be repositioning.\n\n**Potential Impact:** Market volatility may increase, though timing and magnitude are uncertain.`
      return this.getConfidencePrefix(context) + body + this.getConfidenceSuffix(context)
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
        return 'Insufficient chain data for risk analysis at this time.'
      }

      const sortedChains = Array.from(chains.entries()).sort((a, b) => b[1] - a[1])
      const topChain = sortedChains[0]
      const context: ConfidenceContext = {
        tier: 'synthesized_risk',
        provenance: 'Chain risk ranking based on cumulative signal scores.',
        caveats: ['Risk scores aggregate multiple signal types and may differ from individual module counts.']
      }
      const body = `**Highest Risk Chain:** ${topChain[0].toUpperCase()}\n\nCumulative risk score: ${topChain[1].toFixed(2)}\n\nThis chain appears to be experiencing elevated threat activity based on aggregated signals.`
      return this.getConfidencePrefix(context) + body + this.getConfidenceSuffix(context)
    }

    if (q.includes('active') && q.includes('entities')) {
      const context: ConfidenceContext = {
        tier: 'emerging_pattern',
        provenance: 'Entity activity assessment based on behavioral clustering.',
        caveats: ['Entity classifications may evolve as behavioral patterns update.']
      }
      const body = `Based on recent intelligence, multiple entities are showing elevated activity. Use the Entity Explorer to view detailed profiles and behavioral analysis.\n\nNote: Entity risk scores are derived from behavioral DNA analysis and may differ from event-based counts.`
      return this.getConfidencePrefix(context) + body + this.getConfidenceSuffix(context)
    }

    if (q.includes('cross-chain') || q.includes('crosschain')) {
      const crossChainAlerts = alerts.filter(a => {
        const chain = a.intelligence?.event?.chain
        return chain && chain !== 'unknown'
      })
      const uniqueChains = new Set(crossChainAlerts.map(a => a.intelligence?.event?.chain))
      const context: ConfidenceContext = {
        tier: crossChainAlerts.length >= 5 ? 'confirmed_structure' : 'emerging_pattern',
        provenance: 'Cross-chain activity assessment based on multi-network signal correlation.',
        caveats: ['Cross-chain patterns may indicate sophisticated operations or arbitrage strategies.']
      }
      const body = `**Cross-Chain Activity:**\n\n${uniqueChains.size} chains showing activity\n${crossChainAlerts.length} cross-chain events detected\n\nMulti-chain operations suggest sophisticated actors. Further analysis may be needed to confirm intent.`
      return this.getConfidencePrefix(context) + body + this.getConfidenceSuffix(context)
    }

    return `I can help analyze:\n\n• Recent intelligence summaries\n• Entity behavior patterns\n• Manipulation ring analysis\n• Chain-specific threats\n• Risk predictions\n\nTry asking: "Summarize the last 10 minutes" or "Show current manipulation risks"\n\n*Note: GhostMind provides synthesized assessments across multiple engines. For confirmed structures, refer to specialized modules.*`
  }
}

export const ghostmind = new GhostMindClient()
