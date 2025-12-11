/**
 * CopilotUIInterpreter - Phase 3: Real-Time Intelligence Awareness
 * 
 * Translates UI components into human-readable explanations.
 * Detects and describes:
 * - Graphs and charts
 * - Risk gauges
 * - Timelines
 * - Heatmaps
 * - Whale flows
 * - Entity fingerprint panels
 * - Intelligence statistics
 * - Hydra multi-head patterns
 * - Constellation clusters
 * - Alerts and severity
 */

import {
  getCopilotStateMonitor,
  type CopilotState,
  type RiskLevel,
  type AlertData,
  type HeatmapRegion,
  type GhostQuantModule,
} from '../state/CopilotStateMonitor';

import {
  getCopilotDataAggregator,
  type ConstellationData,
  type WhaleIntelData,
  type HydraData,
  type EntityProfile,
  type AggregatedIntelligence,
} from '../state/CopilotDataAggregator';

// ============================================================
// Types and Interfaces
// ============================================================

export type ChartType = 
  | 'line'
  | 'bar'
  | 'candlestick'
  | 'pie'
  | 'scatter'
  | 'area'
  | 'heatmap'
  | 'network'
  | 'gauge'
  | 'timeline'
  | 'flow'
  | 'unknown';

export interface ChartData {
  type: ChartType;
  title?: string;
  values?: number[];
  labels?: string[];
  trend?: 'up' | 'down' | 'stable';
  change?: number;
  metadata?: Record<string, unknown>;
}

export interface ViewDescription {
  summary: string;
  details: string[];
  highlights: string[];
  warnings: string[];
  suggestions: string[];
}

export interface EntityDescription {
  summary: string;
  riskAssessment: string;
  activitySummary: string;
  connections: string;
  tags: string[];
}

export interface AlertDescription {
  summary: string;
  severity: string;
  impact: string;
  recommendation: string;
}

// ============================================================
// Module Descriptions
// ============================================================

const MODULE_VIEW_TEMPLATES: Record<GhostQuantModule, (state: CopilotState, intel?: AggregatedIntelligence) => ViewDescription> = {
  dashboard: (state, intel) => ({
    summary: 'You are viewing the main GhostQuant dashboard, which provides an overview of all intelligence systems.',
    details: [
      intel?.globalRisk ? `Global risk level is ${intel.globalRisk.level} at ${intel.globalRisk.score}/100.` : 'Risk data is loading.',
      intel?.alerts ? `There are ${intel.alerts.total} active alerts.` : 'Alert data is loading.',
      intel?.whaleIntel ? `Whale activity is ${intel.whaleIntel.activityLevel}.` : 'Whale data is loading.',
    ],
    highlights: getHighlights(intel),
    warnings: getWarnings(intel),
    suggestions: ['Check the alerts panel for critical issues.', 'Review whale activity for large movements.'],
  }),

  whale_intel: (state, intel) => ({
    summary: 'You are viewing the Whale Intelligence Database, which tracks large wallet movements and significant transactions.',
    details: intel?.whaleIntel ? [
      `Activity level: ${intel.whaleIntel.activityLevel}.`,
      `24-hour volume: ${formatNumber(intel.whaleIntel.totalVolume24h)}.`,
      `Significant moves: ${intel.whaleIntel.significantMoves}.`,
      `Top wallets tracked: ${intel.whaleIntel.topWallets.length}.`,
    ] : ['Whale intelligence data is loading.'],
    highlights: intel?.whaleIntel?.activityLevel === 'high' ? ['High whale activity detected - large movements in progress.'] : [],
    warnings: intel?.whaleIntel?.significantMoves && intel.whaleIntel.significantMoves > 5 ? ['Multiple significant whale moves detected.'] : [],
    suggestions: ['Monitor large transactions for market impact.', 'Check wallet clusters for coordinated activity.'],
  }),

  ecoscan: (state, intel) => ({
    summary: 'You are viewing EcoScan, which analyzes environmental and sustainability metrics for blockchain networks.',
    details: intel?.ecoscan ? [
      `Environmental score: ${intel.ecoscan.environmentalScore}/100.`,
      `Sustainability rating: ${intel.ecoscan.sustainabilityRating}.`,
      `Energy efficiency: ${intel.ecoscan.energyEfficiency}%.`,
    ] : ['EcoScan data is loading.'],
    highlights: intel?.ecoscan?.environmentalScore && intel.ecoscan.environmentalScore > 70 ? ['Good environmental performance.'] : [],
    warnings: intel?.ecoscan?.environmentalScore && intel.ecoscan.environmentalScore < 30 ? ['Low environmental score detected.'] : [],
    suggestions: ['Review sustainability trends over time.'],
  }),

  hydra: (state, intel) => ({
    summary: 'You are viewing the Hydra Console, which detects multi-head patterns and coordinated behavior across entities.',
    details: intel?.hydra ? [
      `Active detection heads: ${intel.hydra.activeHeads}.`,
      `Patterns detected: ${intel.hydra.patterns.length}.`,
      `Detection rate: ${(intel.hydra.detectionRate * 100).toFixed(1)}%.`,
    ] : ['Hydra data is loading.'],
    highlights: intel?.hydra?.patterns.length ? [`${intel.hydra.patterns.length} patterns currently being tracked.`] : [],
    warnings: intel?.hydra?.activeHeads && intel.hydra.activeHeads > 3 ? ['Multiple Hydra heads active - complex pattern detected.'] : [],
    suggestions: ['Review detected patterns for suspicious activity.', 'Check entity connections in the pattern graph.'],
  }),

  constellation: (state, intel) => ({
    summary: 'You are viewing the Constellation Fusion Engine, which visualizes entity relationships and cluster formations.',
    details: intel?.constellation ? [
      `Total nodes: ${intel.constellation.metrics.totalNodes}.`,
      `Total connections: ${intel.constellation.metrics.totalEdges}.`,
      `Clusters identified: ${intel.constellation.metrics.clusterCount}.`,
      `High-risk nodes: ${intel.constellation.metrics.highRiskNodes}.`,
    ] : ['Constellation data is loading.'],
    highlights: intel?.constellation?.metrics.highRiskNodes ? [`${intel.constellation.metrics.highRiskNodes} high-risk nodes in the network.`] : [],
    warnings: intel?.constellation?.metrics.averageRisk && intel.constellation.metrics.averageRisk > 60 ? ['Elevated average risk across the network.'] : [],
    suggestions: ['Explore cluster connections.', 'Focus on high-risk nodes for investigation.'],
  }),

  entity_explorer: (state, intel) => ({
    summary: 'You are viewing the Entity Explorer, which provides detailed analysis of individual wallets and addresses.',
    details: state.selectedEntity ? [
      `Selected entity: ${state.selectedEntity.type} ${state.selectedEntity.name || state.selectedEntity.id}.`,
    ] : ['No entity currently selected.'],
    highlights: [],
    warnings: [],
    suggestions: ['Select an entity to view detailed analysis.', 'Check transaction history and connections.'],
  }),

  oracle_eye: (state, intel) => ({
    summary: 'You are viewing Oracle Eye, which detects spoofing and market manipulation indicators.',
    details: intel?.oracleEye ? [
      `Manipulation score: ${intel.oracleEye.manipulationScore}/100.`,
      `Suspicious activities: ${intel.oracleEye.suspiciousActivity}.`,
      `Spoofing indicators: ${intel.oracleEye.spoofingIndicators.length}.`,
    ] : ['Oracle Eye data is loading.'],
    highlights: [],
    warnings: intel?.oracleEye?.manipulationScore && intel.oracleEye.manipulationScore > 50 ? ['Elevated manipulation risk detected.'] : [],
    suggestions: ['Review spoofing indicators.', 'Check for wash trading patterns.'],
  }),

  momentum_scanner: (state, intel) => ({
    summary: 'You are viewing the Momentum Scanner, which tracks market velocity and price movements.',
    details: intel?.momentum ? [
      `Overall momentum: ${intel.momentum.overallMomentum > 0 ? '+' : ''}${intel.momentum.overallMomentum}.`,
      `Direction: ${intel.momentum.direction}.`,
      `Velocity: ${intel.momentum.velocity.toFixed(2)}.`,
      `Top movers: ${intel.momentum.topMovers.length}.`,
    ] : ['Momentum data is loading.'],
    highlights: intel?.momentum?.direction === 'bullish' ? ['Bullish momentum detected.'] : intel?.momentum?.direction === 'bearish' ? ['Bearish momentum detected.'] : [],
    warnings: Math.abs(intel?.momentum?.overallMomentum || 0) > 70 ? ['Extreme momentum - potential volatility ahead.'] : [],
    suggestions: ['Monitor top movers for trading opportunities.'],
  }),

  alphabrain: (state, intel) => ({
    summary: 'You are viewing AlphaBrain, the predictive intelligence module that generates market forecasts.',
    details: intel?.alphaBrain ? [
      `Active predictions: ${intel.alphaBrain.predictions.length}.`,
      `Model confidence: ${(intel.alphaBrain.confidence * 100).toFixed(1)}%.`,
      `Model version: ${intel.alphaBrain.modelVersion}.`,
    ] : ['AlphaBrain data is loading.'],
    highlights: intel?.alphaBrain?.predictions.filter(p => p.confidence > 0.8).length ? ['High-confidence predictions available.'] : [],
    warnings: intel?.alphaBrain?.confidence && intel.alphaBrain.confidence < 0.5 ? ['Low model confidence - predictions may be unreliable.'] : [],
    suggestions: ['Review predictions with high confidence scores.', 'Consider multiple timeframes.'],
  }),

  market_grid: (state, intel) => ({
    summary: 'You are viewing the Market Intelligence Grid, which aggregates signals from multiple sources.',
    details: intel?.marketGrid ? [
      `Active signals: ${intel.marketGrid.signals.length}.`,
      `Overall sentiment: ${intel.marketGrid.overallSentiment}.`,
      `Volatility index: ${intel.marketGrid.volatilityIndex.toFixed(2)}.`,
      `Liquidity score: ${intel.marketGrid.liquidityScore.toFixed(2)}.`,
    ] : ['Market Grid data is loading.'],
    highlights: intel?.marketGrid?.overallSentiment === 'bullish' ? ['Bullish market sentiment.'] : [],
    warnings: intel?.marketGrid?.volatilityIndex && intel.marketGrid.volatilityIndex > 70 ? ['High volatility detected.'] : [],
    suggestions: ['Review signal sources for consensus.', 'Monitor liquidity for large trades.'],
  }),

  risk_heatmap: (state, intel) => ({
    summary: 'You are viewing the Risk Heatmap, which shows threat intensity across different regions and categories.',
    details: [
      `Global risk: ${intel?.globalRisk?.level || 'unknown'} (${intel?.globalRisk?.score || 0}/100).`,
      `High-intensity regions: ${state.liveData.heatmapRegions.filter(r => r.intensity > 70).length}.`,
    ],
    highlights: [],
    warnings: state.liveData.heatmapRegions.filter(r => r.intensity > 80).map(r => `Critical intensity in ${r.region || r.label}.`),
    suggestions: ['Focus on high-intensity regions.', 'Review underlying risk factors.'],
  }),

  alerts: (state, intel) => ({
    summary: 'You are viewing the Alerts Dashboard, which shows all active warnings and notifications.',
    details: intel?.alerts ? [
      `Total alerts: ${intel.alerts.total}.`,
      `Critical: ${intel.alerts.critical}.`,
      `High: ${intel.alerts.high}.`,
      `Medium: ${intel.alerts.medium}.`,
      `Low: ${intel.alerts.low}.`,
    ] : ['Alert data is loading.'],
    highlights: intel?.alerts?.critical ? [`${intel.alerts.critical} critical alerts require immediate attention.`] : [],
    warnings: intel?.alerts?.critical && intel.alerts.critical > 0 ? ['Critical alerts present - review immediately.'] : [],
    suggestions: ['Address critical alerts first.', 'Review alert categories for patterns.'],
  }),

  terminal: (state, intel) => ({
    summary: 'You are viewing the GhostQuant Terminal, the main interface for accessing all intelligence modules.',
    details: ['All modules are accessible from here.'],
    highlights: [],
    warnings: [],
    suggestions: ['Navigate to specific modules for detailed analysis.'],
  }),

  ultrafusion: (state, intel) => ({
    summary: 'You are viewing UltraFusion, the advanced multi-source intelligence fusion module.',
    details: intel?.constellation ? [
      `Fusion nodes: ${intel.constellation.metrics.totalNodes}.`,
      `Fusion connections: ${intel.constellation.metrics.totalEdges}.`,
    ] : ['UltraFusion data is loading.'],
    highlights: [],
    warnings: [],
    suggestions: ['Explore fused intelligence patterns.', 'Review cross-source correlations.'],
  }),

  graph: (state, intel) => ({
    summary: 'You are viewing the Graph Visualization module, which displays entity relationships.',
    details: ['Interactive graph visualization of entity connections.'],
    highlights: [],
    warnings: [],
    suggestions: ['Click on nodes to explore connections.', 'Use filters to focus on specific entity types.'],
  }),

  unknown: (state, intel) => ({
    summary: 'You are viewing an unrecognized module.',
    details: ['I don\'t have specific information about this view.'],
    highlights: [],
    warnings: [],
    suggestions: ['Try navigating to a known module.'],
  }),
};

// ============================================================
// Helper Functions
// ============================================================

function formatNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
}

function getHighlights(intel?: AggregatedIntelligence): string[] {
  const highlights: string[] = [];
  
  if (intel?.whaleIntel?.activityLevel === 'high') {
    highlights.push('High whale activity detected.');
  }
  
  if (intel?.hydra?.patterns.length && intel.hydra.patterns.length > 0) {
    highlights.push(`${intel.hydra.patterns.length} Hydra patterns detected.`);
  }
  
  if (intel?.momentum?.direction === 'bullish' && intel.momentum.overallMomentum > 50) {
    highlights.push('Strong bullish momentum.');
  }
  
  return highlights;
}

function getWarnings(intel?: AggregatedIntelligence): string[] {
  const warnings: string[] = [];
  
  if (intel?.globalRisk?.level === 'critical' || intel?.globalRisk?.level === 'high') {
    warnings.push(`Global risk is ${intel.globalRisk.level}.`);
  }
  
  if (intel?.alerts?.critical && intel.alerts.critical > 0) {
    warnings.push(`${intel.alerts.critical} critical alerts.`);
  }
  
  if (intel?.oracleEye?.manipulationScore && intel.oracleEye.manipulationScore > 60) {
    warnings.push('Elevated manipulation risk.');
  }
  
  return warnings;
}

function getRiskDescription(level: RiskLevel): string {
  switch (level) {
    case 'critical': return 'extremely high and requires immediate attention';
    case 'high': return 'elevated and should be monitored closely';
    case 'medium': return 'moderate and within acceptable parameters';
    case 'low': return 'minimal and indicates stable conditions';
    default: return 'currently unknown';
  }
}

function getIntensityDescription(intensity: number): string {
  if (intensity >= 90) return 'critical';
  if (intensity >= 70) return 'high';
  if (intensity >= 50) return 'moderate';
  if (intensity >= 30) return 'low';
  return 'minimal';
}

// ============================================================
// CopilotUIInterpreter Implementation
// ============================================================

class CopilotUIInterpreterImpl {
  constructor() {
    console.log('[CopilotPhase3] CopilotUIInterpreter initialized');
  }

  // ============================================================
  // Main Interpretation Methods
  // ============================================================

  /**
   * Describe the active view based on current state
   */
  async describeActiveView(state?: CopilotState): Promise<ViewDescription> {
    const currentState = state || getCopilotStateMonitor().getCurrentState();
    const aggregator = getCopilotDataAggregator();
    
    let intel: AggregatedIntelligence | undefined;
    try {
      intel = await aggregator.aggregateAll();
    } catch (error) {
      console.warn('[CopilotPhase3] Failed to fetch intelligence for view description:', error);
    }

    const template = MODULE_VIEW_TEMPLATES[currentState.activeModule];
    if (template) {
      return template(currentState, intel);
    }

    return MODULE_VIEW_TEMPLATES.unknown(currentState, intel);
  }

  /**
   * Describe an entity
   */
  async describeEntity(entityId: string): Promise<EntityDescription> {
    const aggregator = getCopilotDataAggregator();
    const profile = await aggregator.fetchEntityProfile(entityId);

    if (!profile) {
      return {
        summary: `I don't have detailed information about entity ${entityId}.`,
        riskAssessment: 'Risk assessment unavailable.',
        activitySummary: 'Activity data unavailable.',
        connections: 'Connection data unavailable.',
        tags: [],
      };
    }

    const riskLevel = profile.riskScore >= 80 ? 'critical' :
                     profile.riskScore >= 60 ? 'high' :
                     profile.riskScore >= 40 ? 'medium' : 'low';

    return {
      summary: `This is a ${profile.type} entity${profile.name ? ` named ${profile.name}` : ''} with ${profile.transactionCount} transactions and ${formatNumber(profile.totalVolume)} total volume.`,
      riskAssessment: `Risk score is ${profile.riskScore}/100, which is ${getRiskDescription(riskLevel as RiskLevel)}.`,
      activitySummary: `First seen ${new Date(profile.firstSeen).toLocaleDateString()}, last active ${new Date(profile.lastActive).toLocaleDateString()}.`,
      connections: `Connected to ${profile.connections} other entities.`,
      tags: profile.tags,
    };
  }

  /**
   * Describe an alert
   */
  describeAlert(alertData: AlertData): AlertDescription {
    const severityDescriptions: Record<RiskLevel, string> = {
      critical: 'This is a critical alert that requires immediate attention.',
      high: 'This is a high-priority alert that should be addressed soon.',
      medium: 'This is a medium-priority alert for your awareness.',
      low: 'This is a low-priority informational alert.',
      unknown: 'The severity of this alert is unknown.',
    };

    const impactDescriptions: Record<string, string> = {
      whale_movement: 'Large wallet movements can significantly impact market prices.',
      manipulation: 'Market manipulation can lead to artificial price changes.',
      security: 'Security alerts may indicate potential threats to assets.',
      pattern: 'Pattern alerts indicate coordinated or suspicious behavior.',
      risk: 'Risk alerts indicate elevated threat levels.',
    };

    const recommendations: Record<RiskLevel, string> = {
      critical: 'Take immediate action to investigate and mitigate.',
      high: 'Review the details and prepare a response plan.',
      medium: 'Monitor the situation and gather more information.',
      low: 'Note for future reference.',
      unknown: 'Investigate to determine appropriate action.',
    };

    const category = alertData.category.toLowerCase();
    let impact = 'This alert may have implications for your analysis.';
    for (const [key, desc] of Object.entries(impactDescriptions)) {
      if (category.includes(key)) {
        impact = desc;
        break;
      }
    }

    return {
      summary: alertData.message,
      severity: severityDescriptions[alertData.severity],
      impact,
      recommendation: recommendations[alertData.severity],
    };
  }

  /**
   * Explain a chart
   */
  explainChart(chartType: ChartType, data?: ChartData): string {
    const chartExplanations: Record<ChartType, (data?: ChartData) => string> = {
      line: (d) => {
        let explanation = 'This line chart shows trends over time.';
        if (d?.trend) {
          explanation += ` The trend is ${d.trend}${d.change ? ` with a ${d.change > 0 ? '+' : ''}${d.change.toFixed(2)}% change` : ''}.`;
        }
        return explanation;
      },
      bar: (d) => {
        let explanation = 'This bar chart compares values across categories.';
        if (d?.labels?.length) {
          explanation += ` It shows ${d.labels.length} categories.`;
        }
        return explanation;
      },
      candlestick: (d) => {
        let explanation = 'This candlestick chart shows price movements with open, high, low, and close values.';
        if (d?.trend) {
          explanation += ` The overall trend appears ${d.trend}.`;
        }
        return explanation;
      },
      pie: (d) => {
        let explanation = 'This pie chart shows the distribution of values as proportions of a whole.';
        if (d?.labels?.length) {
          explanation += ` It displays ${d.labels.length} segments.`;
        }
        return explanation;
      },
      scatter: () => 'This scatter plot shows the relationship between two variables, with each point representing a data point.',
      area: (d) => {
        let explanation = 'This area chart shows cumulative values over time.';
        if (d?.trend) {
          explanation += ` The trend is ${d.trend}.`;
        }
        return explanation;
      },
      heatmap: () => 'This heatmap uses color intensity to show the magnitude of values across a matrix.',
      network: () => 'This network graph shows connections between entities, with nodes representing entities and edges representing relationships.',
      gauge: (d) => {
        let explanation = 'This gauge shows a single value on a scale.';
        if (d?.values?.length) {
          explanation += ` The current value is ${d.values[0]}.`;
        }
        return explanation;
      },
      timeline: () => 'This timeline shows events in chronological order.',
      flow: () => 'This flow diagram shows the movement of values between sources and destinations.',
      unknown: () => 'I\'m not sure what type of chart this is, but it appears to be visualizing data.',
    };

    return chartExplanations[chartType](data);
  }

  /**
   * Explain a heatmap region
   */
  explainHeatmap(regions: HeatmapRegion[]): string {
    if (!regions.length) {
      return 'The heatmap is currently empty or data is loading.';
    }

    const criticalRegions = regions.filter(r => r.intensity >= 80);
    const highRegions = regions.filter(r => r.intensity >= 60 && r.intensity < 80);
    const moderateRegions = regions.filter(r => r.intensity >= 40 && r.intensity < 60);

    const parts: string[] = [];

    if (criticalRegions.length) {
      parts.push(`${criticalRegions.length} region${criticalRegions.length > 1 ? 's' : ''} showing critical intensity (${criticalRegions.map(r => r.region || r.label).join(', ')})`);
    }

    if (highRegions.length) {
      parts.push(`${highRegions.length} region${highRegions.length > 1 ? 's' : ''} showing high intensity`);
    }

    if (moderateRegions.length) {
      parts.push(`${moderateRegions.length} region${moderateRegions.length > 1 ? 's' : ''} showing moderate intensity`);
    }

    if (parts.length === 0) {
      return 'The heatmap shows generally low intensity across all regions, indicating stable conditions.';
    }

    return `The heatmap shows ${parts.join(', ')}. ${criticalRegions.length > 0 ? 'Critical regions require immediate attention.' : ''}`;
  }

  /**
   * Explain a spike in data
   */
  explainSpike(context: {
    metric: string;
    currentValue: number;
    previousValue: number;
    percentChange: number;
    timeframe?: string;
  }): string {
    const { metric, currentValue, previousValue, percentChange, timeframe } = context;
    const direction = percentChange > 0 ? 'increase' : 'decrease';
    const magnitude = Math.abs(percentChange);

    let severity = 'normal';
    if (magnitude > 100) severity = 'extreme';
    else if (magnitude > 50) severity = 'significant';
    else if (magnitude > 20) severity = 'notable';

    let explanation = `The ${metric} shows a ${severity} ${direction} of ${magnitude.toFixed(1)}%`;
    explanation += `, moving from ${formatNumber(previousValue)} to ${formatNumber(currentValue)}`;
    
    if (timeframe) {
      explanation += ` over ${timeframe}`;
    }

    explanation += '.';

    if (severity === 'extreme') {
      explanation += ' This is an unusual movement that warrants investigation.';
    } else if (severity === 'significant') {
      explanation += ' This is a notable change worth monitoring.';
    }

    return explanation;
  }

  /**
   * Generate a high-level summary of current intelligence
   */
  async generateIntelligenceSummary(): Promise<string> {
    const stateMonitor = getCopilotStateMonitor();
    const aggregator = getCopilotDataAggregator();
    
    let intel: AggregatedIntelligence | undefined;
    try {
      intel = await aggregator.aggregateAll();
    } catch (error) {
      console.warn('[CopilotPhase3] Failed to fetch intelligence for summary:', error);
    }

    const contextSummary = stateMonitor.getContextSummary();
    const parts: string[] = [];

    // Location context
    parts.push(contextSummary.summary);

    // Risk status
    if (intel?.globalRisk && intel.globalRisk.level !== 'unknown') {
      parts.push(`Global risk is ${intel.globalRisk.level} at ${intel.globalRisk.score}/100.`);
    }

    // Market condition
    if (intel?.momentum) {
      parts.push(`Market momentum is ${intel.momentum.direction} with velocity ${intel.momentum.velocity.toFixed(2)}.`);
    }

    // Whale activity
    if (intel?.whaleIntel) {
      parts.push(`Whale activity is ${intel.whaleIntel.activityLevel} with ${intel.whaleIntel.significantMoves} significant moves.`);
    }

    // Alerts
    if (intel?.alerts && intel.alerts.total > 0) {
      const alertParts: string[] = [];
      if (intel.alerts.critical > 0) alertParts.push(`${intel.alerts.critical} critical`);
      if (intel.alerts.high > 0) alertParts.push(`${intel.alerts.high} high`);
      parts.push(`Active alerts: ${alertParts.join(', ') || `${intel.alerts.total} total`}.`);
    }

    // Hydra patterns
    if (intel?.hydra && intel.hydra.patterns.length > 0) {
      parts.push(`Hydra has detected ${intel.hydra.patterns.length} patterns with ${intel.hydra.activeHeads} active heads.`);
    }

    return parts.join(' ');
  }

  /**
   * Describe what the Fusion Engine is detecting
   */
  async describeFusionEngineActivity(): Promise<string> {
    const aggregator = getCopilotDataAggregator();
    
    try {
      const constellation = await aggregator.fetchConstellationData();
      
      if (!constellation || constellation.nodes.length === 0) {
        return 'The Fusion Engine is currently idle or has no active data to display.';
      }

      const parts: string[] = [];
      parts.push(`The Fusion Engine is tracking ${constellation.metrics.totalNodes} entities with ${constellation.metrics.totalEdges} connections.`);
      
      if (constellation.metrics.clusterCount > 0) {
        parts.push(`It has identified ${constellation.metrics.clusterCount} distinct clusters.`);
      }

      if (constellation.metrics.highRiskNodes > 0) {
        parts.push(`There are ${constellation.metrics.highRiskNodes} high-risk nodes that warrant attention.`);
      }

      if (constellation.metrics.averageRisk > 50) {
        parts.push(`The average risk across the network is elevated at ${constellation.metrics.averageRisk.toFixed(1)}/100.`);
      }

      return parts.join(' ');
    } catch (error) {
      return 'I\'m unable to fetch Fusion Engine data at the moment. The engine may be processing or temporarily unavailable.';
    }
  }

  /**
   * Provide graceful fallback when data is unavailable
   */
  getUnavailableDataResponse(module: string): string {
    const fallbacks: Record<string, string> = {
      whale_intel: 'I don\'t have live whale data right now, but the Whale Intelligence Database typically shows large wallet movements, transaction volumes, and significant transfers that could impact market prices.',
      constellation: 'I don\'t have live Fusion Engine data right now, but it normally displays entity relationships, cluster formations, and network connections between wallets and transactions.',
      hydra: 'I don\'t have live Hydra data right now, but it typically detects multi-head patterns indicating coordinated behavior across multiple entities.',
      ecoscan: 'I don\'t have live EcoScan data right now, but it normally shows environmental metrics, sustainability ratings, and energy efficiency scores for blockchain networks.',
      oracle_eye: 'I don\'t have live Oracle Eye data right now, but it typically monitors for spoofing indicators, wash trading, and other market manipulation patterns.',
      momentum: 'I don\'t have live momentum data right now, but the scanner normally tracks market velocity, price movements, and identifies top movers.',
      alphabrain: 'I don\'t have live AlphaBrain predictions right now, but it typically generates market forecasts based on machine learning models.',
      market_grid: 'I don\'t have live Market Grid data right now, but it normally aggregates signals from multiple sources to provide overall market sentiment.',
      default: 'I don\'t have live data for this module yet, but I can explain what it normally shows if you\'d like.',
    };

    return fallbacks[module] || fallbacks.default;
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let uiInterpreter: CopilotUIInterpreterImpl | null = null;

/**
 * Get the CopilotUIInterpreter singleton instance
 */
export function getCopilotUIInterpreter(): CopilotUIInterpreterImpl {
  if (!uiInterpreter) {
    uiInterpreter = new CopilotUIInterpreterImpl();
  }
  return uiInterpreter;
}

/**
 * Create a new CopilotUIInterpreter instance
 */
export function createCopilotUIInterpreter(): CopilotUIInterpreterImpl {
  return new CopilotUIInterpreterImpl();
}

export default {
  getCopilotUIInterpreter,
  createCopilotUIInterpreter,
};
