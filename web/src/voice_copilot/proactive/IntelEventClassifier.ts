/**
 * IntelEventClassifier.ts
 * 
 * Phase 5: Proactive Intelligence & Autonomous Alerting Engine
 * 
 * Purpose:
 * Classify detected intelligence events into categories with:
 * - Confidence scoring (0-1)
 * - Severity level (low, medium, high, critical)
 * - Human-readable reason field
 * 
 * Logging prefix: [IntelClassifier]
 */

import type { IntelChange, IntelChangeType } from './ProactiveIntelMonitor';

// ============================================================
// Types
// ============================================================

export type EventCategory =
  | 'WHALE_SPIKE'
  | 'MANIPULATION_RING'
  | 'MARKET_VOLATILITY'
  | 'HIGH_RISK_ENTITY'
  | 'CONSTELLATION_ANOMALY'
  | 'BOT_CLUSTER_EXPANSION'
  | 'STABLECOIN_DEPEG_WARNING'
  | 'ECOSCORE_WARNING'
  | 'GLOBAL_RISK_LEVEL_CHANGE'
  | 'HYDRA_ACTIVITY_SURGE'
  | 'ORACLE_EYE_SPOOFING_DETECTED';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ClassifiedEvent {
  id: string;
  category: EventCategory;
  originalChange: IntelChange;
  confidence: number;
  severity: SeverityLevel;
  reason: string;
  shortDescription: string;
  detailedDescription: string;
  actionable: boolean;
  suggestedAction: string | null;
  relatedEntities: string[];
  timestamp: number;
  expiresAt: number;
  priority: number;
}

export interface ClassificationRule {
  category: EventCategory;
  changeTypes: IntelChangeType[];
  minConfidence: number;
  severityMapping: Record<string, SeverityLevel>;
  reasonTemplate: string;
  shortTemplate: string;
  detailedTemplate: string;
  actionTemplate: string | null;
  priorityBase: number;
  ttlMs: number;
}

export interface ClassifierConfig {
  enableLogging: boolean;
  minConfidenceThreshold: number;
  enableActionSuggestions: boolean;
  eventTTLMs: number;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: ClassifierConfig = {
  enableLogging: true,
  minConfidenceThreshold: 0.55,
  enableActionSuggestions: true,
  eventTTLMs: 300000, // 5 minutes
};

// ============================================================
// Classification Rules
// ============================================================

const CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    category: 'WHALE_SPIKE',
    changeTypes: ['WHALE_SPIKE'],
    minConfidence: 0.6,
    severityMapping: {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical',
    },
    reasonTemplate: 'Significant whale activity detected in the market',
    shortTemplate: 'Whale movement spike detected',
    detailedTemplate: 'A large whale cluster has shown significant movement activity. {description}',
    actionTemplate: 'Monitor whale wallet addresses for follow-up transactions',
    priorityBase: 70,
    ttlMs: 300000,
  },
  {
    category: 'MANIPULATION_RING',
    changeTypes: ['MANIPULATION_RING'],
    minConfidence: 0.7,
    severityMapping: {
      low: 'medium',
      medium: 'high',
      high: 'critical',
      critical: 'critical',
    },
    reasonTemplate: 'Coordinated manipulation pattern identified',
    shortTemplate: 'New manipulation ring detected',
    detailedTemplate: 'GhostQuant has identified a new manipulation ring forming. {description}',
    actionTemplate: 'Review affected trading pairs and consider risk mitigation',
    priorityBase: 90,
    ttlMs: 600000,
  },
  {
    category: 'MARKET_VOLATILITY',
    changeTypes: ['MARKET_VOLATILITY'],
    minConfidence: 0.65,
    severityMapping: {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical',
    },
    reasonTemplate: 'Market volatility has changed significantly',
    shortTemplate: 'Market volatility shift',
    detailedTemplate: 'Market conditions have shifted with notable volatility changes. {description}',
    actionTemplate: 'Review open positions and adjust risk parameters',
    priorityBase: 60,
    ttlMs: 180000,
  },
  {
    category: 'HIGH_RISK_ENTITY',
    changeTypes: ['NEW_HIGH_SEVERITY_ALERT'],
    minConfidence: 0.75,
    severityMapping: {
      low: 'medium',
      medium: 'high',
      high: 'critical',
      critical: 'critical',
    },
    reasonTemplate: 'High-risk entity activity flagged',
    shortTemplate: 'High-risk entity alert',
    detailedTemplate: 'A high-risk entity has been flagged by the intelligence system. {description}',
    actionTemplate: 'Investigate entity connections and transaction history',
    priorityBase: 85,
    ttlMs: 600000,
  },
  {
    category: 'CONSTELLATION_ANOMALY',
    changeTypes: ['CONSTELLATION_ANOMALY'],
    minConfidence: 0.6,
    severityMapping: {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical',
    },
    reasonTemplate: 'Constellation pattern anomaly detected',
    shortTemplate: 'Constellation anomaly',
    detailedTemplate: 'The Constellation engine has detected an unusual pattern. {description}',
    actionTemplate: 'Explore the constellation graph for emerging clusters',
    priorityBase: 65,
    ttlMs: 300000,
  },
  {
    category: 'BOT_CLUSTER_EXPANSION',
    changeTypes: ['BOT_CLUSTER_EXPANSION'],
    minConfidence: 0.65,
    severityMapping: {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical',
    },
    reasonTemplate: 'Bot cluster activity expanding',
    shortTemplate: 'Bot cluster expansion',
    detailedTemplate: 'Automated trading bot clusters are expanding their activity. {description}',
    actionTemplate: 'Monitor affected DEXs for unusual order flow',
    priorityBase: 55,
    ttlMs: 240000,
  },
  {
    category: 'STABLECOIN_DEPEG_WARNING',
    changeTypes: ['ECOSCORE_WARNING'],
    minConfidence: 0.8,
    severityMapping: {
      low: 'medium',
      medium: 'high',
      high: 'critical',
      critical: 'critical',
    },
    reasonTemplate: 'Stablecoin depeg risk detected',
    shortTemplate: 'Stablecoin depeg warning',
    detailedTemplate: 'A stablecoin may be at risk of depegging from its target value. {description}',
    actionTemplate: 'Review stablecoin exposure and consider hedging',
    priorityBase: 95,
    ttlMs: 600000,
  },
  {
    category: 'ECOSCORE_WARNING',
    changeTypes: ['ECOSCORE_WARNING', 'CHAIN_CONGESTION_ANOMALY'],
    minConfidence: 0.6,
    severityMapping: {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical',
    },
    reasonTemplate: 'Environmental health degradation detected',
    shortTemplate: 'Ecosystem health warning',
    detailedTemplate: 'The ecosystem health score has degraded. {description}',
    actionTemplate: 'Monitor chain performance and consider transaction timing',
    priorityBase: 50,
    ttlMs: 300000,
  },
  {
    category: 'GLOBAL_RISK_LEVEL_CHANGE',
    changeTypes: ['GLOBAL_RISK_LEVEL_CHANGE'],
    minConfidence: 0.7,
    severityMapping: {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical',
    },
    reasonTemplate: 'Global risk level has shifted',
    shortTemplate: 'Risk level change',
    detailedTemplate: 'The global market risk level has changed significantly. {description}',
    actionTemplate: 'Review portfolio risk exposure and rebalance if needed',
    priorityBase: 75,
    ttlMs: 300000,
  },
  {
    category: 'HYDRA_ACTIVITY_SURGE',
    changeTypes: ['HYDRA_ACTIVITY_SURGE'],
    minConfidence: 0.65,
    severityMapping: {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical',
    },
    reasonTemplate: 'Hydra multi-head analysis detected coordinated activity',
    shortTemplate: 'Hydra activity surge',
    detailedTemplate: 'The Hydra engine has detected coordinated activity across multiple DEXs. {description}',
    actionTemplate: 'Investigate cross-DEX arbitrage and MEV activity',
    priorityBase: 70,
    ttlMs: 240000,
  },
  {
    category: 'ORACLE_EYE_SPOOFING_DETECTED',
    changeTypes: ['ORACLE_EYE_SPOOFING_DETECTED'],
    minConfidence: 0.75,
    severityMapping: {
      low: 'medium',
      medium: 'high',
      high: 'critical',
      critical: 'critical',
    },
    reasonTemplate: 'Oracle price manipulation attempt detected',
    shortTemplate: 'Oracle spoofing detected',
    detailedTemplate: 'The Oracle Eye has detected potential price oracle manipulation. {description}',
    actionTemplate: 'Verify oracle prices and consider pausing oracle-dependent operations',
    priorityBase: 88,
    ttlMs: 600000,
  },
];

// ============================================================
// IntelEventClassifier Implementation
// ============================================================

class IntelEventClassifierImpl {
  private config: ClassifierConfig;
  private classificationHistory: ClassifiedEvent[] = [];
  private stats = {
    totalClassified: 0,
    byCategory: {} as Record<EventCategory, number>,
    bySeverity: {} as Record<SeverityLevel, number>,
    filteredLowConfidence: 0,
  };

  constructor(config: Partial<ClassifierConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeStats();
    this.log('IntelEventClassifier initialized');
  }

  // ============================================================
  // Logging
  // ============================================================

  private log(message: string, data?: unknown): void {
    if (this.config.enableLogging) {
      if (data) {
        console.log(`[IntelClassifier] ${message}`, data);
      } else {
        console.log(`[IntelClassifier] ${message}`);
      }
    }
  }

  // ============================================================
  // Initialization
  // ============================================================

  private initializeStats(): void {
    const categories: EventCategory[] = [
      'WHALE_SPIKE', 'MANIPULATION_RING', 'MARKET_VOLATILITY', 'HIGH_RISK_ENTITY',
      'CONSTELLATION_ANOMALY', 'BOT_CLUSTER_EXPANSION', 'STABLECOIN_DEPEG_WARNING',
      'ECOSCORE_WARNING', 'GLOBAL_RISK_LEVEL_CHANGE', 'HYDRA_ACTIVITY_SURGE',
      'ORACLE_EYE_SPOOFING_DETECTED',
    ];
    
    categories.forEach(cat => {
      this.stats.byCategory[cat] = 0;
    });

    const severities: SeverityLevel[] = ['low', 'medium', 'high', 'critical'];
    severities.forEach(sev => {
      this.stats.bySeverity[sev] = 0;
    });
  }

  // ============================================================
  // Classification
  // ============================================================

  /**
   * Classify a single intelligence change
   */
  classifyChange(change: IntelChange): ClassifiedEvent | null {
    // Find matching rule
    const rule = this.findMatchingRule(change);
    
    if (!rule) {
      this.log('No matching rule for change type:', change.type);
      return null;
    }

    // Calculate confidence
    const confidence = this.calculateConfidence(change, rule);

    // Filter low confidence events
    if (confidence < this.config.minConfidenceThreshold) {
      this.stats.filteredLowConfidence++;
      this.log(`Filtered low confidence event: ${confidence.toFixed(2)} < ${this.config.minConfidenceThreshold}`);
      return null;
    }

    // Determine severity
    const severity = this.determineSeverity(change, rule);

    // Generate descriptions
    const shortDescription = this.generateShortDescription(change, rule);
    const detailedDescription = this.generateDetailedDescription(change, rule);
    const reason = this.generateReason(change, rule);

    // Generate suggested action
    const suggestedAction = this.config.enableActionSuggestions 
      ? this.generateSuggestedAction(change, rule)
      : null;

    // Calculate priority
    const priority = this.calculatePriority(rule, severity, confidence);

    // Create classified event
    const classifiedEvent: ClassifiedEvent = {
      id: this.generateEventId(),
      category: rule.category,
      originalChange: change,
      confidence,
      severity,
      reason,
      shortDescription,
      detailedDescription,
      actionable: suggestedAction !== null,
      suggestedAction,
      relatedEntities: this.extractRelatedEntities(change),
      timestamp: Date.now(),
      expiresAt: Date.now() + rule.ttlMs,
      priority,
    };

    // Update stats
    this.stats.totalClassified++;
    this.stats.byCategory[rule.category]++;
    this.stats.bySeverity[severity]++;

    // Add to history
    this.classificationHistory.push(classifiedEvent);
    this.pruneExpiredEvents();

    this.log('Classified event:', {
      category: classifiedEvent.category,
      severity: classifiedEvent.severity,
      confidence: classifiedEvent.confidence.toFixed(2),
    });

    return classifiedEvent;
  }

  /**
   * Classify multiple intelligence changes
   */
  classifyChanges(changes: IntelChange[]): ClassifiedEvent[] {
    const classifiedEvents: ClassifiedEvent[] = [];

    for (const change of changes) {
      const classified = this.classifyChange(change);
      if (classified) {
        classifiedEvents.push(classified);
      }
    }

    // Sort by priority (highest first)
    classifiedEvents.sort((a, b) => b.priority - a.priority);

    return classifiedEvents;
  }

  // ============================================================
  // Rule Matching
  // ============================================================

  /**
   * Find the matching classification rule for a change
   */
  private findMatchingRule(change: IntelChange): ClassificationRule | null {
    for (const rule of CLASSIFICATION_RULES) {
      if (rule.changeTypes.includes(change.type)) {
        return rule;
      }
    }
    return null;
  }

  // ============================================================
  // Confidence Calculation
  // ============================================================

  /**
   * Calculate confidence score for a change
   */
  private calculateConfidence(change: IntelChange, rule: ClassificationRule): number {
    let confidence = rule.minConfidence;

    // Boost confidence based on severity
    const severityBoost: Record<SeverityLevel, number> = {
      low: 0,
      medium: 0.05,
      high: 0.1,
      critical: 0.15,
    };
    confidence += severityBoost[change.severity];

    // Boost confidence based on change magnitude
    const changeBoost = Math.min(Math.abs(change.changePercent) / 100, 0.2);
    confidence += changeBoost;

    // Cap at 1.0
    return Math.min(confidence, 1.0);
  }

  // ============================================================
  // Severity Determination
  // ============================================================

  /**
   * Determine severity level for a change
   */
  private determineSeverity(change: IntelChange, rule: ClassificationRule): SeverityLevel {
    // Use the rule's severity mapping if available
    const mappedSeverity = rule.severityMapping[change.severity];
    if (mappedSeverity) {
      return mappedSeverity;
    }

    // Fallback to change's severity
    return change.severity;
  }

  // ============================================================
  // Description Generation
  // ============================================================

  /**
   * Generate short description
   */
  private generateShortDescription(change: IntelChange, rule: ClassificationRule): string {
    return rule.shortTemplate;
  }

  /**
   * Generate detailed description
   */
  private generateDetailedDescription(change: IntelChange, rule: ClassificationRule): string {
    return rule.detailedTemplate.replace('{description}', change.description);
  }

  /**
   * Generate reason
   */
  private generateReason(change: IntelChange, rule: ClassificationRule): string {
    return rule.reasonTemplate;
  }

  /**
   * Generate suggested action
   */
  private generateSuggestedAction(change: IntelChange, rule: ClassificationRule): string | null {
    return rule.actionTemplate;
  }

  // ============================================================
  // Priority Calculation
  // ============================================================

  /**
   * Calculate event priority
   */
  private calculatePriority(
    rule: ClassificationRule,
    severity: SeverityLevel,
    confidence: number
  ): number {
    const severityMultiplier: Record<SeverityLevel, number> = {
      low: 1,
      medium: 1.5,
      high: 2,
      critical: 3,
    };

    return Math.round(rule.priorityBase * severityMultiplier[severity] * confidence);
  }

  // ============================================================
  // Entity Extraction
  // ============================================================

  /**
   * Extract related entities from a change
   */
  private extractRelatedEntities(change: IntelChange): string[] {
    const entities: string[] = [];

    // Extract from current value if it's an object with entities
    if (change.currentValue && typeof change.currentValue === 'object') {
      const value = change.currentValue as Record<string, unknown>;
      
      if (Array.isArray(value.topMovers)) {
        entities.push(...value.topMovers);
      }
      if (Array.isArray(value.suspiciousEntities)) {
        entities.push(...value.suspiciousEntities);
      }
      if (Array.isArray(value.topRiskFactors)) {
        entities.push(...value.topRiskFactors);
      }
    }

    return entities.slice(0, 5); // Limit to 5 entities
  }

  // ============================================================
  // Utility Methods
  // ============================================================

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Prune expired events from history
   */
  private pruneExpiredEvents(): void {
    const now = Date.now();
    this.classificationHistory = this.classificationHistory.filter(
      event => event.expiresAt > now
    );
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get classification history
   */
  getHistory(): ClassifiedEvent[] {
    this.pruneExpiredEvents();
    return [...this.classificationHistory];
  }

  /**
   * Get recent events by category
   */
  getEventsByCategory(category: EventCategory): ClassifiedEvent[] {
    this.pruneExpiredEvents();
    return this.classificationHistory.filter(e => e.category === category);
  }

  /**
   * Get recent events by severity
   */
  getEventsBySeverity(severity: SeverityLevel): ClassifiedEvent[] {
    this.pruneExpiredEvents();
    return this.classificationHistory.filter(e => e.severity === severity);
  }

  /**
   * Get high priority events
   */
  getHighPriorityEvents(minPriority: number = 100): ClassifiedEvent[] {
    this.pruneExpiredEvents();
    return this.classificationHistory
      .filter(e => e.priority >= minPriority)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get statistics
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ClassifierConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.classificationHistory = [];
    this.log('History cleared');
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.initializeStats();
    this.stats.totalClassified = 0;
    this.stats.filteredLowConfidence = 0;
    this.log('Statistics reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let intelEventClassifier: IntelEventClassifierImpl | null = null;

/**
 * Get the IntelEventClassifier singleton instance
 */
export function getIntelEventClassifier(): IntelEventClassifierImpl {
  if (!intelEventClassifier) {
    intelEventClassifier = new IntelEventClassifierImpl();
  }
  return intelEventClassifier;
}

/**
 * Create a new IntelEventClassifier instance
 */
export function createIntelEventClassifier(
  config?: Partial<ClassifierConfig>
): IntelEventClassifierImpl {
  return new IntelEventClassifierImpl(config);
}

export default {
  getIntelEventClassifier,
  createIntelEventClassifier,
};
