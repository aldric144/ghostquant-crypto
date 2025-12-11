/**
 * ProactiveResponseEngine.ts
 * 
 * Phase 5: Proactive Intelligence & Autonomous Alerting Engine
 * 
 * Purpose:
 * Generate the Copilot's autonomous spoken responses for intelligence events.
 * 
 * Features:
 * - Map classified events into natural conversational responses
 * - Use ToneEngine for voice personality
 * - Use NaturalExpansionEngine for variation
 * - Generate short, medium, and detailed responses based on severity
 * 
 * Logging prefix: [ProactiveResponse]
 */

import type { ClassifiedEvent, EventCategory, SeverityLevel } from './IntelEventClassifier';

// ============================================================
// Types
// ============================================================

export type ResponseLength = 'short' | 'medium' | 'detailed';

export interface ProactiveResponse {
  eventId: string;
  category: EventCategory;
  severity: SeverityLevel;
  shortResponse: string;
  mediumResponse: string;
  detailedResponse: string;
  selectedResponse: string;
  selectedLength: ResponseLength;
  followUpQuestion: string | null;
  timestamp: number;
}

export interface ResponseTemplate {
  category: EventCategory;
  shortTemplates: string[];
  mediumTemplates: string[];
  detailedTemplates: string[];
  followUpTemplates: string[];
  alertPrefix: string;
  urgencyPhrases: Record<SeverityLevel, string[]>;
}

export interface ResponseEngineConfig {
  enableLogging: boolean;
  enableVariation: boolean;
  enableFollowUp: boolean;
  defaultLength: ResponseLength;
  severityLengthMapping: Record<SeverityLevel, ResponseLength>;
  alertPrefix: string;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: ResponseEngineConfig = {
  enableLogging: true,
  enableVariation: true,
  enableFollowUp: true,
  defaultLength: 'medium',
  severityLengthMapping: {
    low: 'short',
    medium: 'medium',
    high: 'medium',
    critical: 'detailed',
  },
  alertPrefix: 'GhostQuant Alert:',
};

// ============================================================
// Response Templates
// ============================================================

const RESPONSE_TEMPLATES: ResponseTemplate[] = [
  {
    category: 'WHALE_SPIKE',
    shortTemplates: [
      'Large whale movement detected.',
      'Whale activity spike observed.',
      'Significant whale cluster movement.',
    ],
    mediumTemplates: [
      'A large whale cluster has just moved significant funds. {description}',
      'Whale activity has spiked. {description}',
      'Notable whale movement detected in the market. {description}',
    ],
    detailedTemplates: [
      'GhostQuant has detected significant whale activity. {description} This could indicate institutional positioning or large-scale market moves. Would you like me to investigate further?',
      'A major whale movement has been identified. {description} Historical patterns suggest this may precede market volatility. Should I provide more details?',
    ],
    followUpTemplates: [
      'Would you like me to track this whale cluster?',
      'Should I investigate the whale wallet addresses?',
      'Do you want a breakdown of the whale movement?',
    ],
    alertPrefix: 'Whale Alert:',
    urgencyPhrases: {
      low: ['Minor', 'Small'],
      medium: ['Notable', 'Significant'],
      high: ['Major', 'Large'],
      critical: ['Massive', 'Critical'],
    },
  },
  {
    category: 'MANIPULATION_RING',
    shortTemplates: [
      'New manipulation ring detected.',
      'Coordinated manipulation identified.',
      'Market manipulation pattern found.',
    ],
    mediumTemplates: [
      'Heads up — a new manipulation ring has been detected. {description}',
      'GhostQuant has identified coordinated manipulation activity. {description}',
      'A manipulation pattern is forming. {description}',
    ],
    detailedTemplates: [
      'New manipulation ring forming: {description} This involves coordinated trading patterns across multiple addresses. Would you like an investigation breakdown?',
      'GhostQuant has detected a sophisticated manipulation scheme. {description} The pattern suggests wash trading or spoofing activity. Should I provide entity details?',
    ],
    followUpTemplates: [
      'Would you like an investigation breakdown?',
      'Should I identify the involved entities?',
      'Do you want me to flag affected trading pairs?',
    ],
    alertPrefix: 'Manipulation Alert:',
    urgencyPhrases: {
      low: ['Potential', 'Possible'],
      medium: ['Confirmed', 'Active'],
      high: ['Significant', 'Major'],
      critical: ['Critical', 'Severe'],
    },
  },
  {
    category: 'MARKET_VOLATILITY',
    shortTemplates: [
      'Market volatility shift detected.',
      'Volatility levels changing.',
      'Market conditions shifting.',
    ],
    mediumTemplates: [
      'Market volatility has changed significantly. {description}',
      'Volatility levels are shifting. {description}',
      'Market conditions are becoming more volatile. {description}',
    ],
    detailedTemplates: [
      'Market volatility has shifted significantly. {description} This may affect your open positions. Would you like me to analyze the impact?',
      'GhostQuant has detected notable market volatility changes. {description} Consider reviewing your risk parameters.',
    ],
    followUpTemplates: [
      'Should I analyze the impact on your positions?',
      'Would you like volatility trend analysis?',
      'Do you want me to suggest risk adjustments?',
    ],
    alertPrefix: 'Market Alert:',
    urgencyPhrases: {
      low: ['Slight', 'Minor'],
      medium: ['Moderate', 'Notable'],
      high: ['Significant', 'Major'],
      critical: ['Extreme', 'Severe'],
    },
  },
  {
    category: 'HIGH_RISK_ENTITY',
    shortTemplates: [
      'High-risk entity flagged.',
      'Risk entity alert triggered.',
      'Suspicious entity detected.',
    ],
    mediumTemplates: [
      'A high-risk entity has been flagged. {description}',
      'GhostQuant has identified a suspicious entity. {description}',
      'Risk alert: Entity flagged for suspicious activity. {description}',
    ],
    detailedTemplates: [
      'A high-risk entity has been flagged by the intelligence system. {description} This entity has connections to known bad actors. Would you like a full investigation?',
      'GhostQuant has identified a potentially dangerous entity. {description} Historical analysis shows concerning patterns.',
    ],
    followUpTemplates: [
      'Would you like a full entity investigation?',
      'Should I trace the entity connections?',
      'Do you want me to flag related addresses?',
    ],
    alertPrefix: 'Risk Alert:',
    urgencyPhrases: {
      low: ['Potential', 'Possible'],
      medium: ['Confirmed', 'Known'],
      high: ['High-risk', 'Dangerous'],
      critical: ['Critical', 'Immediate threat'],
    },
  },
  {
    category: 'CONSTELLATION_ANOMALY',
    shortTemplates: [
      'Constellation anomaly detected.',
      'Cluster pattern anomaly found.',
      'Unusual constellation activity.',
    ],
    mediumTemplates: [
      'The Constellation engine has detected an unusual pattern. {description}',
      'Constellation anomaly identified. {description}',
      'Unusual cluster activity in the constellation graph. {description}',
    ],
    detailedTemplates: [
      'GhostQuant Constellation has detected an anomalous pattern. {description} This could indicate emerging market structures or coordinated activity. Would you like to explore the graph?',
      'A significant constellation anomaly has been identified. {description} The pattern suggests new cluster formation.',
    ],
    followUpTemplates: [
      'Would you like to explore the constellation graph?',
      'Should I analyze the cluster connections?',
      'Do you want details on the anomaly?',
    ],
    alertPrefix: 'Constellation Alert:',
    urgencyPhrases: {
      low: ['Minor', 'Small'],
      medium: ['Notable', 'Significant'],
      high: ['Major', 'Large'],
      critical: ['Critical', 'Massive'],
    },
  },
  {
    category: 'BOT_CLUSTER_EXPANSION',
    shortTemplates: [
      'Bot cluster expansion detected.',
      'Automated trading activity increasing.',
      'New bot clusters identified.',
    ],
    mediumTemplates: [
      'Bot cluster activity is expanding. {description}',
      'Automated trading clusters are growing. {description}',
      'New bot activity detected across DEXs. {description}',
    ],
    detailedTemplates: [
      'Automated trading bot clusters are expanding their activity. {description} This may affect order flow and slippage on affected pairs. Would you like me to identify the affected DEXs?',
      'GhostQuant has detected significant bot cluster expansion. {description} Consider adjusting your trading parameters.',
    ],
    followUpTemplates: [
      'Would you like to see affected DEXs?',
      'Should I analyze the bot patterns?',
      'Do you want MEV protection recommendations?',
    ],
    alertPrefix: 'Bot Alert:',
    urgencyPhrases: {
      low: ['Minor', 'Small'],
      medium: ['Moderate', 'Growing'],
      high: ['Significant', 'Large'],
      critical: ['Massive', 'Critical'],
    },
  },
  {
    category: 'STABLECOIN_DEPEG_WARNING',
    shortTemplates: [
      'Stablecoin depeg warning.',
      'Stablecoin stability concern.',
      'Depeg risk detected.',
    ],
    mediumTemplates: [
      'Warning: A stablecoin may be at risk of depegging. {description}',
      'Stablecoin stability concern detected. {description}',
      'Depeg risk identified for a stablecoin. {description}',
    ],
    detailedTemplates: [
      'Critical warning: A stablecoin may be at risk of depegging from its target value. {description} This could have significant market implications. Review your stablecoin exposure immediately.',
      'GhostQuant has detected stablecoin instability. {description} Historical patterns suggest potential depeg risk. Consider hedging your exposure.',
    ],
    followUpTemplates: [
      'Would you like to review your stablecoin exposure?',
      'Should I suggest hedging strategies?',
      'Do you want real-time depeg monitoring?',
    ],
    alertPrefix: 'Stablecoin Alert:',
    urgencyPhrases: {
      low: ['Potential', 'Minor'],
      medium: ['Moderate', 'Growing'],
      high: ['Significant', 'Serious'],
      critical: ['Critical', 'Imminent'],
    },
  },
  {
    category: 'ECOSCORE_WARNING',
    shortTemplates: [
      'Ecosystem health warning.',
      'Environmental degradation detected.',
      'Chain performance concern.',
    ],
    mediumTemplates: [
      'Environmental stress detected. {description}',
      'Ecosystem health has degraded. {description}',
      'Chain performance issues identified. {description}',
    ],
    detailedTemplates: [
      'Environmental stress detected on the network. {description} Performance degradation is likely. Consider timing your transactions carefully.',
      'GhostQuant has detected ecosystem health degradation. {description} This may affect transaction reliability and gas costs.',
    ],
    followUpTemplates: [
      'Would you like chain health details?',
      'Should I monitor for recovery?',
      'Do you want transaction timing recommendations?',
    ],
    alertPrefix: 'Ecosystem Alert:',
    urgencyPhrases: {
      low: ['Minor', 'Slight'],
      medium: ['Moderate', 'Notable'],
      high: ['Significant', 'Serious'],
      critical: ['Severe', 'Critical'],
    },
  },
  {
    category: 'GLOBAL_RISK_LEVEL_CHANGE',
    shortTemplates: [
      'Global risk level changed.',
      'Market risk shift detected.',
      'Risk level update.',
    ],
    mediumTemplates: [
      'Global market risk level has shifted. {description}',
      'Risk conditions have changed. {description}',
      'Market risk assessment updated. {description}',
    ],
    detailedTemplates: [
      'The global market risk level has changed significantly. {description} This affects overall market conditions. Consider reviewing your portfolio risk exposure.',
      'GhostQuant risk assessment has been updated. {description} Market conditions warrant attention to your risk parameters.',
    ],
    followUpTemplates: [
      'Would you like a risk breakdown?',
      'Should I analyze your portfolio exposure?',
      'Do you want risk mitigation suggestions?',
    ],
    alertPrefix: 'Risk Alert:',
    urgencyPhrases: {
      low: ['Slight', 'Minor'],
      medium: ['Moderate', 'Notable'],
      high: ['Significant', 'Major'],
      critical: ['Critical', 'Severe'],
    },
  },
  {
    category: 'HYDRA_ACTIVITY_SURGE',
    shortTemplates: [
      'Hydra activity surge detected.',
      'Coordinated DEX activity found.',
      'Multi-head divergence alert.',
    ],
    mediumTemplates: [
      'Hydra detected coordinated bot activity across DEXs. {description}',
      'Multi-DEX coordination detected. {description}',
      'Hydra heads showing divergent signals. {description}',
    ],
    detailedTemplates: [
      'The Hydra engine has detected coordinated activity across multiple DEXs. {description} This suggests sophisticated arbitrage or MEV activity. Would you like a cross-DEX analysis?',
      'Hydra multi-head analysis shows significant divergence. {description} Coordinated trading patterns detected across exchanges.',
    ],
    followUpTemplates: [
      'Would you like a cross-DEX analysis?',
      'Should I identify the coordination patterns?',
      'Do you want MEV activity details?',
    ],
    alertPrefix: 'Hydra Alert:',
    urgencyPhrases: {
      low: ['Minor', 'Small'],
      medium: ['Moderate', 'Notable'],
      high: ['Significant', 'Major'],
      critical: ['Critical', 'Massive'],
    },
  },
  {
    category: 'ORACLE_EYE_SPOOFING_DETECTED',
    shortTemplates: [
      'Oracle spoofing detected.',
      'Price oracle manipulation alert.',
      'Oracle Eye warning.',
    ],
    mediumTemplates: [
      'Oracle Eye has detected potential price manipulation. {description}',
      'Price oracle spoofing activity identified. {description}',
      'Oracle manipulation attempt detected. {description}',
    ],
    detailedTemplates: [
      'The Oracle Eye has detected potential price oracle manipulation. {description} This could affect DeFi protocols relying on these oracles. Consider pausing oracle-dependent operations.',
      'Critical: Oracle spoofing activity detected. {description} Price feeds may be compromised. Verify oracle prices before executing trades.',
    ],
    followUpTemplates: [
      'Would you like affected oracle details?',
      'Should I identify vulnerable protocols?',
      'Do you want alternative price sources?',
    ],
    alertPrefix: 'Oracle Alert:',
    urgencyPhrases: {
      low: ['Potential', 'Possible'],
      medium: ['Confirmed', 'Active'],
      high: ['Significant', 'Serious'],
      critical: ['Critical', 'Immediate'],
    },
  },
];

// ============================================================
// ProactiveResponseEngine Implementation
// ============================================================

class ProactiveResponseEngineImpl {
  private config: ResponseEngineConfig;
  private responseHistory: ProactiveResponse[] = [];
  private templateVariationIndex: Map<EventCategory, number> = new Map();
  private stats = {
    totalResponses: 0,
    byCategory: {} as Record<EventCategory, number>,
    bySeverity: {} as Record<SeverityLevel, number>,
    byLength: {} as Record<ResponseLength, number>,
  };

  constructor(config: Partial<ResponseEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeStats();
    this.log('ProactiveResponseEngine initialized');
  }

  // ============================================================
  // Logging
  // ============================================================

  private log(message: string, data?: unknown): void {
    if (this.config.enableLogging) {
      if (data) {
        console.log(`[ProactiveResponse] ${message}`, data);
      } else {
        console.log(`[ProactiveResponse] ${message}`);
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
      this.templateVariationIndex.set(cat, 0);
    });

    const severities: SeverityLevel[] = ['low', 'medium', 'high', 'critical'];
    severities.forEach(sev => {
      this.stats.bySeverity[sev] = 0;
    });

    const lengths: ResponseLength[] = ['short', 'medium', 'detailed'];
    lengths.forEach(len => {
      this.stats.byLength[len] = 0;
    });
  }

  // ============================================================
  // Response Generation
  // ============================================================

  /**
   * Generate a proactive response for a classified event
   */
  generateResponse(event: ClassifiedEvent): ProactiveResponse {
    const template = this.findTemplate(event.category);
    
    if (!template) {
      this.log('No template found for category:', event.category);
      return this.generateFallbackResponse(event);
    }

    // Determine response length based on severity
    const selectedLength = this.config.severityLengthMapping[event.severity] || this.config.defaultLength;

    // Generate all response lengths
    const shortResponse = this.generateShortResponse(event, template);
    const mediumResponse = this.generateMediumResponse(event, template);
    const detailedResponse = this.generateDetailedResponse(event, template);

    // Select the appropriate response
    let selectedResponse: string;
    switch (selectedLength) {
      case 'short':
        selectedResponse = shortResponse;
        break;
      case 'detailed':
        selectedResponse = detailedResponse;
        break;
      default:
        selectedResponse = mediumResponse;
    }

    // Generate follow-up question if enabled
    const followUpQuestion = this.config.enableFollowUp
      ? this.generateFollowUp(event, template)
      : null;

    const response: ProactiveResponse = {
      eventId: event.id,
      category: event.category,
      severity: event.severity,
      shortResponse,
      mediumResponse,
      detailedResponse,
      selectedResponse,
      selectedLength,
      followUpQuestion,
      timestamp: Date.now(),
    };

    // Update stats
    this.stats.totalResponses++;
    this.stats.byCategory[event.category]++;
    this.stats.bySeverity[event.severity]++;
    this.stats.byLength[selectedLength]++;

    // Add to history
    this.responseHistory.push(response);
    this.pruneHistory();

    this.log('Generated response:', {
      category: event.category,
      severity: event.severity,
      length: selectedLength,
    });

    return response;
  }

  /**
   * Generate responses for multiple events
   */
  generateResponses(events: ClassifiedEvent[]): ProactiveResponse[] {
    return events.map(event => this.generateResponse(event));
  }

  // ============================================================
  // Template Selection
  // ============================================================

  /**
   * Find the template for a category
   */
  private findTemplate(category: EventCategory): ResponseTemplate | null {
    return RESPONSE_TEMPLATES.find(t => t.category === category) || null;
  }

  /**
   * Get next template variation index
   */
  private getNextVariationIndex(category: EventCategory, maxIndex: number): number {
    if (!this.config.enableVariation) return 0;

    const currentIndex = this.templateVariationIndex.get(category) || 0;
    const nextIndex = (currentIndex + 1) % maxIndex;
    this.templateVariationIndex.set(category, nextIndex);
    return currentIndex;
  }

  // ============================================================
  // Response Generation Helpers
  // ============================================================

  /**
   * Generate short response
   */
  private generateShortResponse(event: ClassifiedEvent, template: ResponseTemplate): string {
    const index = this.getNextVariationIndex(event.category, template.shortTemplates.length);
    const baseTemplate = template.shortTemplates[index];
    
    const urgencyPhrase = this.getUrgencyPhrase(event.severity, template);
    const prefix = `${this.config.alertPrefix} ${urgencyPhrase}`;
    
    return `${prefix} ${baseTemplate}`;
  }

  /**
   * Generate medium response
   */
  private generateMediumResponse(event: ClassifiedEvent, template: ResponseTemplate): string {
    const index = this.getNextVariationIndex(event.category, template.mediumTemplates.length);
    const baseTemplate = template.mediumTemplates[index];
    
    const urgencyPhrase = this.getUrgencyPhrase(event.severity, template);
    const prefix = `${this.config.alertPrefix}`;
    
    const filledTemplate = baseTemplate.replace('{description}', event.originalChange.description);
    
    return `${prefix} ${urgencyPhrase} alert. ${filledTemplate}`;
  }

  /**
   * Generate detailed response
   */
  private generateDetailedResponse(event: ClassifiedEvent, template: ResponseTemplate): string {
    const index = this.getNextVariationIndex(event.category, template.detailedTemplates.length);
    const baseTemplate = template.detailedTemplates[index];
    
    const urgencyPhrase = this.getUrgencyPhrase(event.severity, template);
    const prefix = `${this.config.alertPrefix}`;
    
    const filledTemplate = baseTemplate.replace('{description}', event.originalChange.description);
    
    return `${prefix} ${urgencyPhrase} intelligence update. ${filledTemplate}`;
  }

  /**
   * Generate follow-up question
   */
  private generateFollowUp(event: ClassifiedEvent, template: ResponseTemplate): string {
    const index = this.getNextVariationIndex(event.category, template.followUpTemplates.length);
    return template.followUpTemplates[index];
  }

  /**
   * Get urgency phrase based on severity
   */
  private getUrgencyPhrase(severity: SeverityLevel, template: ResponseTemplate): string {
    const phrases = template.urgencyPhrases[severity];
    const index = Math.floor(Math.random() * phrases.length);
    return phrases[index];
  }

  /**
   * Generate fallback response
   */
  private generateFallbackResponse(event: ClassifiedEvent): ProactiveResponse {
    const baseResponse = `${this.config.alertPrefix} Intelligence event detected. ${event.originalChange.description}`;
    
    return {
      eventId: event.id,
      category: event.category,
      severity: event.severity,
      shortResponse: baseResponse,
      mediumResponse: baseResponse,
      detailedResponse: baseResponse,
      selectedResponse: baseResponse,
      selectedLength: 'medium',
      followUpQuestion: 'Would you like more details?',
      timestamp: Date.now(),
    };
  }

  // ============================================================
  // History Management
  // ============================================================

  /**
   * Prune old responses from history
   */
  private pruneHistory(): void {
    const maxHistory = 100;
    if (this.responseHistory.length > maxHistory) {
      this.responseHistory = this.responseHistory.slice(-maxHistory);
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get response history
   */
  getHistory(): ProactiveResponse[] {
    return [...this.responseHistory];
  }

  /**
   * Get recent responses by category
   */
  getResponsesByCategory(category: EventCategory): ProactiveResponse[] {
    return this.responseHistory.filter(r => r.category === category);
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
  updateConfig(config: Partial<ResponseEngineConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.responseHistory = [];
    this.log('History cleared');
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.initializeStats();
    this.stats.totalResponses = 0;
    this.log('Statistics reset');
  }

  /**
   * Get a custom response for a specific scenario
   */
  getCustomResponse(
    category: EventCategory,
    severity: SeverityLevel,
    description: string,
    length: ResponseLength = 'medium'
  ): string {
    const template = this.findTemplate(category);
    if (!template) {
      return `${this.config.alertPrefix} ${description}`;
    }

    const urgencyPhrase = this.getUrgencyPhrase(severity, template);
    
    switch (length) {
      case 'short':
        return `${this.config.alertPrefix} ${urgencyPhrase} ${template.shortTemplates[0]}`;
      case 'detailed':
        return `${this.config.alertPrefix} ${urgencyPhrase} intelligence update. ${template.detailedTemplates[0].replace('{description}', description)}`;
      default:
        return `${this.config.alertPrefix} ${urgencyPhrase} alert. ${template.mediumTemplates[0].replace('{description}', description)}`;
    }
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let proactiveResponseEngine: ProactiveResponseEngineImpl | null = null;

/**
 * Get the ProactiveResponseEngine singleton instance
 */
export function getProactiveResponseEngine(): ProactiveResponseEngineImpl {
  if (!proactiveResponseEngine) {
    proactiveResponseEngine = new ProactiveResponseEngineImpl();
  }
  return proactiveResponseEngine;
}

/**
 * Create a new ProactiveResponseEngine instance
 */
export function createProactiveResponseEngine(
  config?: Partial<ResponseEngineConfig>
): ProactiveResponseEngineImpl {
  return new ProactiveResponseEngineImpl(config);
}

export default {
  getProactiveResponseEngine,
  createProactiveResponseEngine,
};
