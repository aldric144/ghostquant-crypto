/**
 * Phase 7: Autonomous Market Watchdog
 * MODULE 7 - WatchdogNarrator.ts
 * 
 * A specialized narrator for danger/warning/fear-based alerts:
 * - Clear
 * - Urgent
 * - Human
 * - Calm tone
 * - Concise
 * - Actionable
 * 
 * Examples:
 * "Warning: A whale cluster increased coordinated sell pressure by 34% in the last 90 seconds. Risk of downward volatility."
 * "Attention: Liquidity fragility detected at 2,850–2,910. Volatility could spike if broken."
 * 
 * This module is 100% isolated and additive - no modifications to existing code.
 */

// ============================================================
// Types and Interfaces
// ============================================================

export type NarrativeTone = 'calm' | 'urgent' | 'warning' | 'critical';

export type NarrativeLength = 'brief' | 'standard' | 'detailed';

export interface NarrativeOptions {
  tone: NarrativeTone;
  length: NarrativeLength;
  includeAction: boolean;
  includeMetrics: boolean;
  speakable: boolean;  // Optimize for TTS
}

export interface WatchdogNarrative {
  id: string;
  alertId: string;
  headline: string;
  body: string;
  action: string;
  fullNarrative: string;
  speakableNarrative: string;
  tone: NarrativeTone;
  urgencyLevel: number;  // 0-100
  timestamp: number;
}

export interface AlertContext {
  type: string;
  source: string;
  severity: number;
  confidence: number;
  title: string;
  message: string;
  metrics?: {
    value?: number;
    change?: number;
    changePercent?: number;
    threshold?: number;
  };
  entities?: string[];
  priceRange?: { low: number; high: number };
  suggestedAction?: string;
}

export interface NarratorConfig {
  defaultTone: NarrativeTone;
  defaultLength: NarrativeLength;
  includeTimestamps: boolean;
  maxNarrativeLength: number;
  enableLogging: boolean;
  logPrefix: string;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: NarratorConfig = {
  defaultTone: 'calm',
  defaultLength: 'standard',
  includeTimestamps: false,
  maxNarrativeLength: 500,
  enableLogging: true,
  logPrefix: '[WatchdogNarrator]',
};

// ============================================================
// Narrative Templates
// ============================================================

const HEADLINE_PREFIXES: Record<NarrativeTone, string[]> = {
  calm: ['Notice:', 'Update:', 'Information:'],
  urgent: ['Attention:', 'Alert:', 'Important:'],
  warning: ['Warning:', 'Caution:', 'Watch out:'],
  critical: ['CRITICAL:', 'DANGER:', 'IMMEDIATE:'],
};

const PRESSURE_NARRATIVES = {
  high_buy: [
    'Strong buying pressure detected',
    'Significant buy-side activity observed',
    'Accumulation pressure building',
  ],
  high_sell: [
    'Heavy selling pressure detected',
    'Significant sell-side activity observed',
    'Distribution pressure building',
  ],
  whale_activity: [
    'Whale activity has intensified',
    'Large holders are making moves',
    'Significant whale transactions detected',
  ],
  neutral: [
    'Market pressure is balanced',
    'No significant directional pressure',
    'Pressure levels within normal range',
  ],
};

const ANOMALY_NARRATIVES = {
  whale_surge: [
    'A whale surge has been detected',
    'Large inflows from whale wallets observed',
    'Whale accumulation spike identified',
  ],
  whale_exodus: [
    'Whale exodus detected',
    'Large outflows from whale wallets observed',
    'Whale distribution spike identified',
  ],
  volatility_explosion: [
    'Volatility has spiked significantly',
    'Market volatility is elevated',
    'Unusual volatility detected',
  ],
  liquidity_vacuum: [
    'Liquidity has dropped sharply',
    'A liquidity vacuum has formed',
    'Order book depth has thinned',
  ],
  manipulation: [
    'Potential manipulation detected',
    'Suspicious trading patterns observed',
    'Market manipulation signals identified',
  ],
};

const FRAGILITY_NARRATIVES = {
  thin_pocket: [
    'Thin liquidity pocket detected',
    'Low depth zone identified',
    'Liquidity gap found',
  ],
  imbalance: [
    'Order book imbalance detected',
    'Bid-ask ratio is skewed',
    'One-sided order book observed',
  ],
  stop_cluster: [
    'Stop-loss cluster identified',
    'Concentrated stop orders detected',
    'Potential stop-hunt zone found',
  ],
};

const ENTITY_NARRATIVES = {
  accumulation: [
    'Entity is rapidly accumulating',
    'Large buyer activity detected',
    'Significant position building observed',
  ],
  distribution: [
    'Entity is rapidly distributing',
    'Large seller activity detected',
    'Significant position unwinding observed',
  ],
  mood_shift: [
    'Entity behavior has changed',
    'Trading pattern shift detected',
    'Entity mood has shifted',
  ],
  escalation: [
    'Entity risk has escalated',
    'Dangerous entity activity detected',
    'Entity threat level increased',
  ],
};

const ACTION_TEMPLATES = {
  reduce_exposure: [
    'Consider reducing exposure',
    'Review your position size',
    'Risk reduction may be prudent',
  ],
  monitor_closely: [
    'Monitor the situation closely',
    'Keep a close watch',
    'Stay alert for developments',
  ],
  use_limits: [
    'Use limit orders to avoid slippage',
    'Avoid market orders',
    'Be careful with order execution',
  ],
  wait_confirmation: [
    'Wait for confirmation before acting',
    'Do not rush into positions',
    'Let the situation develop',
  ],
  immediate_review: [
    'Review positions immediately',
    'Take immediate action if exposed',
    'Assess your risk now',
  ],
};

// ============================================================
// WatchdogNarrator Implementation
// ============================================================

class WatchdogNarratorImpl {
  private config: NarratorConfig;
  private narrativeCounter = 0;
  
  private stats = {
    totalNarrativesGenerated: 0,
    narrativesByTone: { calm: 0, urgent: 0, warning: 0, critical: 0 },
    averageLength: 0,
    lastGenerationTime: 0,
  };

  constructor(config?: Partial<NarratorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.log('WatchdogNarrator initialized');
  }

  private log(message: string, data?: unknown): void {
    if (this.config.enableLogging) {
      if (data !== undefined) {
        console.log(`${this.config.logPrefix} ${message}`, data);
      } else {
        console.log(`${this.config.logPrefix} ${message}`);
      }
    }
  }

  // ============================================================
  // Main Narrative Generation
  // ============================================================

  /**
   * Generate a narrative for an alert
   */
  generate(context: AlertContext, options?: Partial<NarrativeOptions>): WatchdogNarrative {
    const opts: NarrativeOptions = {
      tone: this.determineTone(context),
      length: this.config.defaultLength,
      includeAction: true,
      includeMetrics: true,
      speakable: true,
      ...options,
    };
    
    this.narrativeCounter++;
    const now = Date.now();
    
    // Generate components
    const headline = this.generateHeadline(context, opts);
    const body = this.generateBody(context, opts);
    const action = this.generateAction(context, opts);
    
    // Combine into full narrative
    const fullNarrative = this.combineNarrative(headline, body, action, opts);
    
    // Create speakable version
    const speakableNarrative = this.makeSpeakable(fullNarrative, opts);
    
    const narrative: WatchdogNarrative = {
      id: `narrative_${now}_${this.narrativeCounter}`,
      alertId: context.title,
      headline,
      body,
      action,
      fullNarrative,
      speakableNarrative,
      tone: opts.tone,
      urgencyLevel: this.calculateUrgency(context),
      timestamp: now,
    };
    
    // Update stats
    this.updateStats(narrative);
    
    this.log(`Generated narrative: ${headline}`);
    
    return narrative;
  }

  /**
   * Generate a quick warning narrative
   */
  generateQuickWarning(message: string, severity: number): string {
    const tone = this.getToneForSeverity(severity);
    const prefix = this.randomChoice(HEADLINE_PREFIXES[tone]);
    return `${prefix} ${message}`;
  }

  /**
   * Generate a danger narrative
   */
  generateDangerNarrative(
    dangerType: string,
    details: string,
    severity: number
  ): WatchdogNarrative {
    const context: AlertContext = {
      type: dangerType,
      source: 'watchdog',
      severity,
      confidence: 0.8,
      title: dangerType,
      message: details,
    };
    
    return this.generate(context, { tone: severity >= 80 ? 'critical' : 'warning' });
  }

  // ============================================================
  // Component Generation
  // ============================================================

  /**
   * Generate headline
   */
  private generateHeadline(context: AlertContext, options: NarrativeOptions): string {
    const prefix = this.randomChoice(HEADLINE_PREFIXES[options.tone]);
    const core = this.getHeadlineCore(context);
    return `${prefix} ${core}`;
  }

  /**
   * Get core headline text based on context
   */
  private getHeadlineCore(context: AlertContext): string {
    const type = context.type.toLowerCase();
    
    // Pressure-related
    if (type.includes('pressure') || type.includes('buy') || type.includes('sell')) {
      if (type.includes('buy') || type.includes('accumul')) {
        return this.randomChoice(PRESSURE_NARRATIVES.high_buy);
      }
      if (type.includes('sell') || type.includes('distribut')) {
        return this.randomChoice(PRESSURE_NARRATIVES.high_sell);
      }
      if (type.includes('whale')) {
        return this.randomChoice(PRESSURE_NARRATIVES.whale_activity);
      }
      return this.randomChoice(PRESSURE_NARRATIVES.neutral);
    }
    
    // Anomaly-related
    if (type.includes('anomaly') || type.includes('spike') || type.includes('surge')) {
      if (type.includes('whale') && type.includes('surge')) {
        return this.randomChoice(ANOMALY_NARRATIVES.whale_surge);
      }
      if (type.includes('whale') && (type.includes('exodus') || type.includes('outflow'))) {
        return this.randomChoice(ANOMALY_NARRATIVES.whale_exodus);
      }
      if (type.includes('volatility')) {
        return this.randomChoice(ANOMALY_NARRATIVES.volatility_explosion);
      }
      if (type.includes('liquidity')) {
        return this.randomChoice(ANOMALY_NARRATIVES.liquidity_vacuum);
      }
      if (type.includes('manipul')) {
        return this.randomChoice(ANOMALY_NARRATIVES.manipulation);
      }
    }
    
    // Fragility-related
    if (type.includes('fragility') || type.includes('thin') || type.includes('gap')) {
      if (type.includes('thin') || type.includes('pocket')) {
        return this.randomChoice(FRAGILITY_NARRATIVES.thin_pocket);
      }
      if (type.includes('imbalance')) {
        return this.randomChoice(FRAGILITY_NARRATIVES.imbalance);
      }
      if (type.includes('stop')) {
        return this.randomChoice(FRAGILITY_NARRATIVES.stop_cluster);
      }
    }
    
    // Entity-related
    if (type.includes('entity') || type.includes('escalat')) {
      if (type.includes('accumul')) {
        return this.randomChoice(ENTITY_NARRATIVES.accumulation);
      }
      if (type.includes('distribut')) {
        return this.randomChoice(ENTITY_NARRATIVES.distribution);
      }
      if (type.includes('mood') || type.includes('shift')) {
        return this.randomChoice(ENTITY_NARRATIVES.mood_shift);
      }
      if (type.includes('escalat') || type.includes('risk')) {
        return this.randomChoice(ENTITY_NARRATIVES.escalation);
      }
    }
    
    // Default
    return context.title || 'Market condition change detected';
  }

  /**
   * Generate body text
   */
  private generateBody(context: AlertContext, options: NarrativeOptions): string {
    const parts: string[] = [];
    
    // Add main message
    parts.push(context.message);
    
    // Add metrics if requested
    if (options.includeMetrics && context.metrics) {
      const metricsText = this.formatMetrics(context.metrics);
      if (metricsText) {
        parts.push(metricsText);
      }
    }
    
    // Add entity info if available
    if (context.entities && context.entities.length > 0) {
      const entityCount = context.entities.length;
      if (entityCount === 1) {
        parts.push(`Involving entity: ${context.entities[0]}`);
      } else {
        parts.push(`Involving ${entityCount} entities`);
      }
    }
    
    // Add price range if available
    if (context.priceRange) {
      parts.push(`Price range: ${context.priceRange.low.toFixed(2)} to ${context.priceRange.high.toFixed(2)}`);
    }
    
    // Adjust length
    let body = parts.join('. ');
    
    if (options.length === 'brief') {
      body = parts[0];  // Just the main message
    } else if (options.length === 'detailed') {
      // Keep all parts
    } else {
      // Standard: first two parts
      body = parts.slice(0, 2).join('. ');
    }
    
    return body;
  }

  /**
   * Generate action recommendation
   */
  private generateAction(context: AlertContext, options: NarrativeOptions): string {
    if (!options.includeAction) {
      return '';
    }
    
    // Use provided action if available
    if (context.suggestedAction) {
      return context.suggestedAction;
    }
    
    // Generate based on severity and type
    const severity = context.severity;
    const type = context.type.toLowerCase();
    
    if (severity >= 80) {
      return this.randomChoice(ACTION_TEMPLATES.immediate_review);
    }
    
    if (type.includes('manipul') || type.includes('danger')) {
      return this.randomChoice(ACTION_TEMPLATES.reduce_exposure);
    }
    
    if (type.includes('liquidity') || type.includes('fragility')) {
      return this.randomChoice(ACTION_TEMPLATES.use_limits);
    }
    
    if (type.includes('volatility') || type.includes('spike')) {
      return this.randomChoice(ACTION_TEMPLATES.wait_confirmation);
    }
    
    return this.randomChoice(ACTION_TEMPLATES.monitor_closely);
  }

  /**
   * Combine narrative components
   */
  private combineNarrative(
    headline: string,
    body: string,
    action: string,
    options: NarrativeOptions
  ): string {
    const parts = [headline];
    
    if (body) {
      parts.push(body);
    }
    
    if (action && options.includeAction) {
      parts.push(action);
    }
    
    let narrative = parts.join(' ');
    
    // Truncate if too long
    if (narrative.length > this.config.maxNarrativeLength) {
      narrative = narrative.substring(0, this.config.maxNarrativeLength - 3) + '...';
    }
    
    return narrative;
  }

  /**
   * Make narrative speakable (optimize for TTS)
   */
  private makeSpeakable(narrative: string, options: NarrativeOptions): string {
    if (!options.speakable) {
      return narrative;
    }
    
    let speakable = narrative;
    
    // Replace abbreviations
    speakable = speakable.replace(/\bUSD\b/g, 'dollars');
    speakable = speakable.replace(/\bBTC\b/g, 'Bitcoin');
    speakable = speakable.replace(/\bETH\b/g, 'Ethereum');
    speakable = speakable.replace(/\%/g, ' percent');
    
    // Replace symbols
    speakable = speakable.replace(/\$/g, '');
    speakable = speakable.replace(/\+/g, 'plus ');
    speakable = speakable.replace(/\-/g, 'minus ');
    speakable = speakable.replace(/>/g, 'greater than ');
    speakable = speakable.replace(/</g, 'less than ');
    
    // Format numbers for speech
    speakable = speakable.replace(/(\d+),(\d+)/g, '$1$2');  // Remove commas in numbers
    
    // Replace technical terms
    speakable = speakable.replace(/\bvolatility\b/gi, 'price movement');
    speakable = speakable.replace(/\bliquidity\b/gi, 'market depth');
    speakable = speakable.replace(/\bslippage\b/gi, 'price impact');
    
    // Add pauses (commas) for better speech flow
    speakable = speakable.replace(/\. /g, '. , ');
    
    // Clean up extra spaces
    speakable = speakable.replace(/\s+/g, ' ').trim();
    
    return speakable;
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  /**
   * Determine tone based on context
   */
  private determineTone(context: AlertContext): NarrativeTone {
    return this.getToneForSeverity(context.severity);
  }

  /**
   * Get tone for severity level
   */
  private getToneForSeverity(severity: number): NarrativeTone {
    if (severity >= 85) return 'critical';
    if (severity >= 70) return 'warning';
    if (severity >= 50) return 'urgent';
    return 'calm';
  }

  /**
   * Calculate urgency level
   */
  private calculateUrgency(context: AlertContext): number {
    let urgency = context.severity;
    
    // Boost for high confidence
    if (context.confidence > 0.8) {
      urgency += 10;
    }
    
    // Boost for certain types
    const type = context.type.toLowerCase();
    if (type.includes('critical') || type.includes('danger')) {
      urgency += 15;
    }
    if (type.includes('manipul')) {
      urgency += 10;
    }
    
    return Math.min(100, urgency);
  }

  /**
   * Format metrics for narrative
   */
  private formatMetrics(metrics: AlertContext['metrics']): string {
    if (!metrics) return '';
    
    const parts: string[] = [];
    
    if (metrics.changePercent !== undefined) {
      const direction = metrics.changePercent >= 0 ? 'up' : 'down';
      parts.push(`${direction} ${Math.abs(metrics.changePercent).toFixed(1)}%`);
    }
    
    if (metrics.value !== undefined && metrics.threshold !== undefined) {
      const relation = metrics.value >= metrics.threshold ? 'above' : 'below';
      parts.push(`${relation} threshold`);
    }
    
    return parts.join(', ');
  }

  /**
   * Random choice from array
   */
  private randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Update statistics
   */
  private updateStats(narrative: WatchdogNarrative): void {
    this.stats.totalNarrativesGenerated++;
    this.stats.narrativesByTone[narrative.tone]++;
    this.stats.averageLength = 
      (this.stats.averageLength * (this.stats.totalNarrativesGenerated - 1) + 
       narrative.fullNarrative.length) / this.stats.totalNarrativesGenerated;
    this.stats.lastGenerationTime = narrative.timestamp;
  }

  // ============================================================
  // Specialized Narratives
  // ============================================================

  /**
   * Generate pressure warning narrative
   */
  generatePressureWarning(
    pressureScore: number,
    direction: 'up' | 'down' | 'neutral',
    drivers: string[]
  ): WatchdogNarrative {
    const severity = pressureScore;
    const directionText = direction === 'up' ? 'upward' : direction === 'down' ? 'downward' : 'neutral';
    
    const context: AlertContext = {
      type: `pressure_${direction}`,
      source: 'pressure_scanner',
      severity,
      confidence: 0.8,
      title: `Market Pressure ${directionText.charAt(0).toUpperCase() + directionText.slice(1)}`,
      message: `Market pressure is ${directionText} at ${pressureScore.toFixed(0)}. ${drivers.slice(0, 2).join('. ')}.`,
      metrics: { value: pressureScore, threshold: 70 },
    };
    
    return this.generate(context);
  }

  /**
   * Generate anomaly warning narrative
   */
  generateAnomalyWarning(
    anomalyType: string,
    severity: number,
    explanation: string
  ): WatchdogNarrative {
    const context: AlertContext = {
      type: `anomaly_${anomalyType}`,
      source: 'anomaly_detection',
      severity,
      confidence: 0.75,
      title: `Anomaly: ${anomalyType.replace(/_/g, ' ')}`,
      message: explanation,
    };
    
    return this.generate(context);
  }

  /**
   * Generate liquidity warning narrative
   */
  generateLiquidityWarning(
    fragilityScore: number,
    zoneCount: number,
    nearestZone?: { low: number; high: number }
  ): WatchdogNarrative {
    const context: AlertContext = {
      type: 'liquidity_fragility',
      source: 'liquidity_fragility',
      severity: fragilityScore,
      confidence: 0.85,
      title: 'Liquidity Fragility Detected',
      message: `${zoneCount} fragility zone${zoneCount > 1 ? 's' : ''} detected. Volatility could spike if these levels are broken.`,
      priceRange: nearestZone,
    };
    
    return this.generate(context);
  }

  /**
   * Generate manipulation warning narrative
   */
  generateManipulationWarning(
    manipulationType: string,
    probability: number,
    entities: string[]
  ): WatchdogNarrative {
    const severity = probability * 100;
    
    const context: AlertContext = {
      type: `manipulation_${manipulationType}`,
      source: 'manipulation_detector',
      severity,
      confidence: probability,
      title: `Potential ${manipulationType.replace(/_/g, ' ')}`,
      message: `${manipulationType.replace(/_/g, ' ')} detected with ${(probability * 100).toFixed(0)}% probability.`,
      entities,
    };
    
    return this.generate(context, { tone: 'warning' });
  }

  /**
   * Generate entity escalation narrative
   */
  generateEntityWarning(
    entityId: string,
    escalationType: string,
    changePercent: number
  ): WatchdogNarrative {
    const severity = Math.min(Math.abs(changePercent) * 2, 100);
    
    const context: AlertContext = {
      type: `entity_${escalationType}`,
      source: 'entity_escalation',
      severity,
      confidence: 0.8,
      title: `Entity ${escalationType.replace(/_/g, ' ')}`,
      message: `Entity ${entityId} showing ${escalationType.replace(/_/g, ' ')}: ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}% change.`,
      entities: [entityId],
      metrics: { changePercent },
    };
    
    return this.generate(context);
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get statistics
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Get configuration
   */
  getConfig(): NarratorConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<NarratorConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Reset narrator
   */
  reset(): void {
    this.narrativeCounter = 0;
    this.stats = {
      totalNarrativesGenerated: 0,
      narrativesByTone: { calm: 0, urgent: 0, warning: 0, critical: 0 },
      averageLength: 0,
      lastGenerationTime: 0,
    };
    this.log('Narrator reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let narratorInstance: WatchdogNarratorImpl | null = null;

/**
 * Get the singleton WatchdogNarrator instance
 */
export function getWatchdogNarrator(config?: Partial<NarratorConfig>): WatchdogNarratorImpl {
  if (!narratorInstance) {
    narratorInstance = new WatchdogNarratorImpl(config);
  }
  return narratorInstance;
}

/**
 * Create a new WatchdogNarrator with custom config
 */
export function createWatchdogNarrator(config?: Partial<NarratorConfig>): WatchdogNarratorImpl {
  return new WatchdogNarratorImpl(config);
}
