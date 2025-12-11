/**
 * Phase 7: Autonomous Market Watchdog
 * MODULE 9 - WatchdogIntegration.ts
 * 
 * Copilot Integration module that:
 * - Adds new intent patterns for watchdog queries
 * - Provides real-time triggers for the Copilot
 * - Connects watchdog alerts to the speech pipeline
 * - Enables voice commands for watchdog control
 * 
 * This module is 100% isolated and additive - no modifications to existing code.
 */

import {
  getWatchdogOrchestrator,
  type WatchdogSynthesis,
  type SpeechActivation,
  type WatchdogInputs,
} from './WatchdogOrchestrator';

import {
  type WatchdogAlert,
} from './AutonomousAlertRouter';

// ============================================================
// Types and Interfaces
// ============================================================

export type WatchdogIntent = 
  | 'watchdog_status'
  | 'watchdog_threats'
  | 'watchdog_alerts'
  | 'watchdog_pressure'
  | 'watchdog_anomalies'
  | 'watchdog_liquidity'
  | 'watchdog_manipulation'
  | 'watchdog_entities'
  | 'watchdog_start'
  | 'watchdog_stop'
  | 'watchdog_settings'
  | 'watchdog_history'
  | 'watchdog_summary';

export interface WatchdogIntentMatch {
  intent: WatchdogIntent;
  confidence: number;
  parameters: Record<string, string>;
  originalText: string;
}

export interface WatchdogResponse {
  text: string;
  speakableText: string;
  data?: unknown;
  shouldSpeak: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface WatchdogTrigger {
  id: string;
  type: 'alert' | 'threshold' | 'schedule';
  condition: string;
  action: 'speak' | 'notify' | 'both';
  enabled: boolean;
}

export interface WatchdogIntegrationConfig {
  enableVoiceCommands: boolean;
  enableAutoAlerts: boolean;
  alertSpeechEnabled: boolean;
  minAlertPriority: 'high' | 'medium' | 'low';
  enableLogging: boolean;
  logPrefix: string;
}

// ============================================================
// Intent Patterns
// ============================================================

const INTENT_PATTERNS: Record<WatchdogIntent, RegExp[]> = {
  watchdog_status: [
    /watchdog\s*status/i,
    /market\s*watchdog/i,
    /threat\s*level/i,
    /danger\s*level/i,
    /how\s*(is|are)\s*(the\s*)?market\s*conditions?/i,
    /what('?s|\s*is)\s*(the\s*)?current\s*threat/i,
    /is\s*(the\s*)?market\s*safe/i,
    /any\s*dangers?/i,
  ],
  watchdog_threats: [
    /what\s*(are\s*)?(the\s*)?threats?/i,
    /show\s*(me\s*)?(the\s*)?threats?/i,
    /active\s*threats?/i,
    /current\s*threats?/i,
    /list\s*threats?/i,
    /what\s*should\s*i\s*(be\s*)?worried\s*about/i,
  ],
  watchdog_alerts: [
    /watchdog\s*alerts?/i,
    /show\s*(me\s*)?(the\s*)?alerts?/i,
    /active\s*alerts?/i,
    /current\s*alerts?/i,
    /any\s*alerts?/i,
    /what\s*alerts?\s*(are\s*)?there/i,
  ],
  watchdog_pressure: [
    /market\s*pressure/i,
    /pressure\s*(reading|level|score)/i,
    /buy(ing)?\s*pressure/i,
    /sell(ing)?\s*pressure/i,
    /whale\s*pressure/i,
    /what('?s|\s*is)\s*(the\s*)?pressure/i,
  ],
  watchdog_anomalies: [
    /anomal(y|ies)/i,
    /unusual\s*(activity|patterns?)/i,
    /strange\s*(activity|patterns?)/i,
    /abnormal/i,
    /any\s*anomal(y|ies)/i,
    /detect(ed)?\s*anomal(y|ies)/i,
  ],
  watchdog_liquidity: [
    /liquidity\s*(fragility|status|health)/i,
    /fragility\s*(zones?|levels?)/i,
    /thin\s*liquidity/i,
    /liquidity\s*gaps?/i,
    /order\s*book\s*(health|status)/i,
    /is\s*liquidity\s*(ok|good|bad|thin)/i,
  ],
  watchdog_manipulation: [
    /manipulation/i,
    /spoofing/i,
    /wash\s*trading/i,
    /pump\s*(and\s*)?dump/i,
    /market\s*manipulation/i,
    /any\s*manipulation/i,
    /is\s*(anyone|someone)\s*manipulating/i,
  ],
  watchdog_entities: [
    /entity\s*(alerts?|escalation|status)/i,
    /dangerous\s*entities/i,
    /whale\s*(activity|alerts?|movements?)/i,
    /who('?s|\s*is)\s*moving/i,
    /entity\s*behavior/i,
    /tracked\s*entities/i,
  ],
  watchdog_start: [
    /start\s*(the\s*)?watchdog/i,
    /enable\s*(the\s*)?watchdog/i,
    /turn\s*on\s*(the\s*)?watchdog/i,
    /activate\s*(the\s*)?watchdog/i,
    /begin\s*monitoring/i,
    /start\s*scanning/i,
  ],
  watchdog_stop: [
    /stop\s*(the\s*)?watchdog/i,
    /disable\s*(the\s*)?watchdog/i,
    /turn\s*off\s*(the\s*)?watchdog/i,
    /deactivate\s*(the\s*)?watchdog/i,
    /stop\s*monitoring/i,
    /stop\s*scanning/i,
  ],
  watchdog_settings: [
    /watchdog\s*settings/i,
    /watchdog\s*config(uration)?/i,
    /alert\s*settings/i,
    /change\s*watchdog/i,
    /configure\s*watchdog/i,
  ],
  watchdog_history: [
    /watchdog\s*history/i,
    /alert\s*history/i,
    /past\s*alerts?/i,
    /previous\s*alerts?/i,
    /threat\s*history/i,
    /what\s*happened\s*(earlier|before)/i,
  ],
  watchdog_summary: [
    /watchdog\s*summary/i,
    /market\s*summary/i,
    /threat\s*summary/i,
    /summarize\s*(the\s*)?(market|threats?|watchdog)/i,
    /give\s*(me\s*)?(a\s*)?summary/i,
    /brief(ing)?\s*on\s*(the\s*)?market/i,
  ],
};

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: WatchdogIntegrationConfig = {
  enableVoiceCommands: true,
  enableAutoAlerts: true,
  alertSpeechEnabled: true,
  minAlertPriority: 'medium',
  enableLogging: true,
  logPrefix: '[WatchdogIntegration]',
};

// ============================================================
// WatchdogIntegration Implementation
// ============================================================

class WatchdogIntegrationImpl {
  private config: WatchdogIntegrationConfig;
  private orchestrator = getWatchdogOrchestrator();
  private triggers: Map<string, WatchdogTrigger> = new Map();
  private speechCallback: ((text: string, priority: string) => void) | null = null;
  private triggerCounter = 0;
  
  private stats = {
    totalIntentsMatched: 0,
    intentsByType: {} as Record<WatchdogIntent, number>,
    totalResponsesGenerated: 0,
    totalSpeechActivations: 0,
    lastActivityTime: 0,
  };

  constructor(config?: Partial<WatchdogIntegrationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeStats();
    this.setupOrchestratorCallbacks();
    this.log('WatchdogIntegration initialized');
  }

  private initializeStats(): void {
    const intents: WatchdogIntent[] = [
      'watchdog_status', 'watchdog_threats', 'watchdog_alerts',
      'watchdog_pressure', 'watchdog_anomalies', 'watchdog_liquidity',
      'watchdog_manipulation', 'watchdog_entities', 'watchdog_start',
      'watchdog_stop', 'watchdog_settings', 'watchdog_history',
      'watchdog_summary'
    ];
    for (const intent of intents) {
      this.stats.intentsByType[intent] = 0;
    }
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

  /**
   * Setup callbacks from the orchestrator
   */
  private setupOrchestratorCallbacks(): void {
    // Listen for speech activations
    this.orchestrator.onSpeechActivation((activation: SpeechActivation) => {
      if (this.config.alertSpeechEnabled && activation.shouldSpeak) {
        this.handleSpeechActivation(activation);
      }
    });
    
    // Listen for alerts
    this.orchestrator.onAlerts((alerts: WatchdogAlert[]) => {
      if (this.config.enableAutoAlerts) {
        this.handleAlerts(alerts);
      }
    });
  }

  // ============================================================
  // Intent Matching
  // ============================================================

  /**
   * Match user input to a watchdog intent
   */
  matchIntent(input: string): WatchdogIntentMatch | null {
    if (!this.config.enableVoiceCommands) {
      return null;
    }
    
    const normalizedInput = input.toLowerCase().trim();
    
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        const match = normalizedInput.match(pattern);
        if (match) {
          const intentMatch: WatchdogIntentMatch = {
            intent: intent as WatchdogIntent,
            confidence: this.calculateConfidence(match, normalizedInput),
            parameters: this.extractParameters(intent as WatchdogIntent, normalizedInput),
            originalText: input,
          };
          
          this.stats.totalIntentsMatched++;
          this.stats.intentsByType[intent as WatchdogIntent]++;
          this.stats.lastActivityTime = Date.now();
          
          this.log(`Matched intent: ${intent}`, { confidence: intentMatch.confidence });
          
          return intentMatch;
        }
      }
    }
    
    return null;
  }

  /**
   * Calculate confidence score for a match
   */
  private calculateConfidence(match: RegExpMatchArray, input: string): number {
    // Base confidence
    let confidence = 0.7;
    
    // Boost for exact matches
    if (match[0].length === input.length) {
      confidence += 0.2;
    }
    
    // Boost for longer matches
    const matchRatio = match[0].length / input.length;
    confidence += matchRatio * 0.1;
    
    return Math.min(confidence, 1);
  }

  /**
   * Extract parameters from input
   */
  private extractParameters(intent: WatchdogIntent, input: string): Record<string, string> {
    const params: Record<string, string> = {};
    
    // Extract time references
    const timeMatch = input.match(/last\s*(\d+)\s*(hour|minute|second)s?/i);
    if (timeMatch) {
      params.timeValue = timeMatch[1];
      params.timeUnit = timeMatch[2].toLowerCase();
    }
    
    // Extract entity references
    const entityMatch = input.match(/entity\s+(\w+)/i);
    if (entityMatch) {
      params.entityId = entityMatch[1];
    }
    
    // Extract asset references
    const assetMatch = input.match(/(btc|eth|bitcoin|ethereum)/i);
    if (assetMatch) {
      params.asset = assetMatch[1].toUpperCase();
    }
    
    return params;
  }

  // ============================================================
  // Response Generation
  // ============================================================

  /**
   * Handle a matched intent and generate response
   */
  handleIntent(match: WatchdogIntentMatch): WatchdogResponse {
    this.stats.totalResponsesGenerated++;
    
    switch (match.intent) {
      case 'watchdog_status':
        return this.generateStatusResponse();
      case 'watchdog_threats':
        return this.generateThreatsResponse();
      case 'watchdog_alerts':
        return this.generateAlertsResponse();
      case 'watchdog_pressure':
        return this.generatePressureResponse();
      case 'watchdog_anomalies':
        return this.generateAnomaliesResponse();
      case 'watchdog_liquidity':
        return this.generateLiquidityResponse();
      case 'watchdog_manipulation':
        return this.generateManipulationResponse();
      case 'watchdog_entities':
        return this.generateEntitiesResponse();
      case 'watchdog_start':
        return this.generateStartResponse();
      case 'watchdog_stop':
        return this.generateStopResponse();
      case 'watchdog_settings':
        return this.generateSettingsResponse();
      case 'watchdog_history':
        return this.generateHistoryResponse();
      case 'watchdog_summary':
        return this.generateSummaryResponse();
      default:
        return this.generateDefaultResponse();
    }
  }

  /**
   * Generate status response
   */
  private generateStatusResponse(): WatchdogResponse {
    const synthesis = this.orchestrator.getLatestSynthesis();
    const state = this.orchestrator.getState();
    const isScanning = this.orchestrator.isScanningActive();
    
    if (!synthesis) {
      return {
        text: 'The watchdog has not performed any scans yet. Would you like me to start monitoring?',
        speakableText: 'The watchdog has not performed any scans yet. Would you like me to start monitoring?',
        shouldSpeak: true,
        priority: 'low',
      };
    }
    
    const stateDescriptions: Record<string, string> = {
      idle: 'stable with no significant threats',
      scanning: 'showing some activity worth monitoring',
      alert: 'elevated with active threats detected',
      critical: 'critical with immediate attention required',
    };
    
    const text = `Watchdog Status: ${state.toUpperCase()}. Market conditions are ${stateDescriptions[state]}. ` +
      `Threat level: ${synthesis.overallThreatLevel.toFixed(0)} out of 100. ` +
      `${synthesis.activeThreats} active threat${synthesis.activeThreats !== 1 ? 's' : ''}, ` +
      `${synthesis.criticalThreats} critical. ` +
      `Scanning is ${isScanning ? 'active' : 'paused'}.`;
    
    return {
      text,
      speakableText: text.replace(/\d+/g, (n) => n),  // Keep numbers as-is for TTS
      data: { state, synthesis },
      shouldSpeak: true,
      priority: state === 'critical' ? 'high' : state === 'alert' ? 'medium' : 'low',
    };
  }

  /**
   * Generate threats response
   */
  private generateThreatsResponse(): WatchdogResponse {
    const synthesis = this.orchestrator.getLatestSynthesis();
    
    if (!synthesis || synthesis.activeThreats === 0) {
      return {
        text: 'No active threats detected. Market conditions appear stable.',
        speakableText: 'No active threats detected. Market conditions appear stable.',
        shouldSpeak: true,
        priority: 'low',
      };
    }
    
    const threats: string[] = [];
    
    // Add anomalies
    for (const anomaly of synthesis.anomalies.slice(0, 3)) {
      threats.push(`${anomaly.type.replace(/_/g, ' ')}: ${anomaly.explanation}`);
    }
    
    // Add manipulation signals
    for (const signal of synthesis.manipulationSignals.slice(0, 2)) {
      threats.push(`${signal.type.replace(/_/g, ' ')}: ${signal.warningNarrative}`);
    }
    
    // Add entity alerts
    for (const alert of synthesis.entityAlerts.slice(0, 2)) {
      threats.push(`Entity ${alert.entityId}: ${alert.description}`);
    }
    
    const text = `${synthesis.activeThreats} active threat${synthesis.activeThreats !== 1 ? 's' : ''} detected:\n` +
      threats.map((t, i) => `${i + 1}. ${t}`).join('\n');
    
    const speakableText = `${synthesis.activeThreats} active threats detected. ` +
      threats.slice(0, 2).join('. ');
    
    return {
      text,
      speakableText,
      data: { threats: synthesis },
      shouldSpeak: true,
      priority: synthesis.criticalThreats > 0 ? 'high' : 'medium',
    };
  }

  /**
   * Generate alerts response
   */
  private generateAlertsResponse(): WatchdogResponse {
    const alerts = this.orchestrator.getActiveAlerts();
    
    if (alerts.length === 0) {
      return {
        text: 'No active alerts at this time.',
        speakableText: 'No active alerts at this time.',
        shouldSpeak: true,
        priority: 'low',
      };
    }
    
    const highAlerts = alerts.filter(a => a.priority === 'high');
    const mediumAlerts = alerts.filter(a => a.priority === 'medium');
    
    const text = `${alerts.length} active alert${alerts.length !== 1 ? 's' : ''}: ` +
      `${highAlerts.length} high priority, ${mediumAlerts.length} medium priority.\n` +
      alerts.slice(0, 5).map(a => `[${a.priority.toUpperCase()}] ${a.title}: ${a.message}`).join('\n');
    
    const speakableText = `${alerts.length} active alerts. ` +
      (highAlerts.length > 0 ? `${highAlerts.length} high priority. ` : '') +
      (highAlerts[0] ? highAlerts[0].narrative : alerts[0].narrative);
    
    return {
      text,
      speakableText,
      data: { alerts },
      shouldSpeak: true,
      priority: highAlerts.length > 0 ? 'high' : 'medium',
    };
  }

  /**
   * Generate pressure response
   */
  private generatePressureResponse(): WatchdogResponse {
    const synthesis = this.orchestrator.getLatestSynthesis();
    const pressure = synthesis?.pressureReading;
    
    if (!pressure) {
      return {
        text: 'No pressure reading available. The watchdog may need to perform a scan first.',
        speakableText: 'No pressure reading available.',
        shouldSpeak: true,
        priority: 'low',
      };
    }
    
    const directionText = pressure.pressureDirection === 'up' ? 'upward' :
      pressure.pressureDirection === 'down' ? 'downward' : 'neutral';
    
    const text = `Market Pressure: ${pressure.pressureScore.toFixed(0)} (${directionText})\n` +
      `Drivers: ${pressure.pressureDrivers.slice(0, 3).join(', ')}\n` +
      `Contributing entities: ${pressure.contributingEntities.length}`;
    
    const speakableText = `Market pressure is at ${pressure.pressureScore.toFixed(0)} and trending ${directionText}. ` +
      `Main driver: ${pressure.pressureDrivers[0] || 'mixed factors'}.`;
    
    return {
      text,
      speakableText,
      data: { pressure },
      shouldSpeak: true,
      priority: pressure.pressureScore >= 70 ? 'high' : 'medium',
    };
  }

  /**
   * Generate anomalies response
   */
  private generateAnomaliesResponse(): WatchdogResponse {
    const synthesis = this.orchestrator.getLatestSynthesis();
    const anomalies = synthesis?.anomalies || [];
    
    if (anomalies.length === 0) {
      return {
        text: 'No anomalies detected. Market behavior appears normal.',
        speakableText: 'No anomalies detected. Market behavior appears normal.',
        shouldSpeak: true,
        priority: 'low',
      };
    }
    
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
    
    const text = `${anomalies.length} anomal${anomalies.length !== 1 ? 'ies' : 'y'} detected:\n` +
      anomalies.slice(0, 5).map(a => 
        `[${a.severity.toUpperCase()}] ${a.type.replace(/_/g, ' ')}: ${a.explanation}`
      ).join('\n');
    
    const speakableText = `${anomalies.length} anomalies detected. ` +
      (criticalAnomalies.length > 0 ? `${criticalAnomalies.length} are critical. ` : '') +
      anomalies[0].explanation;
    
    return {
      text,
      speakableText,
      data: { anomalies },
      shouldSpeak: true,
      priority: criticalAnomalies.length > 0 ? 'high' : 'medium',
    };
  }

  /**
   * Generate liquidity response
   */
  private generateLiquidityResponse(): WatchdogResponse {
    const synthesis = this.orchestrator.getLatestSynthesis();
    const fragility = synthesis?.fragilityAlert;
    
    if (!fragility) {
      return {
        text: 'No liquidity fragility data available.',
        speakableText: 'No liquidity fragility data available.',
        shouldSpeak: true,
        priority: 'low',
      };
    }
    
    const vulnerabilityText = fragility.marketVulnerability === 'stable' ? 'stable' :
      fragility.marketVulnerability === 'fragile' ? 'fragile' : 'critical';
    
    const text = `Liquidity Status: ${vulnerabilityText.toUpperCase()}\n` +
      `Overall fragility: ${fragility.overallFragility.toFixed(0)}\n` +
      `Fragility zones: ${fragility.zones.length}\n` +
      `Critical zones: ${fragility.criticalZoneCount}\n` +
      fragility.summary;
    
    const speakableText = `Liquidity is ${vulnerabilityText}. ` +
      `${fragility.zones.length} fragility zones detected. ` +
      fragility.summary;
    
    return {
      text,
      speakableText,
      data: { fragility },
      shouldSpeak: true,
      priority: fragility.marketVulnerability === 'critical' ? 'high' : 
                fragility.marketVulnerability === 'fragile' ? 'medium' : 'low',
    };
  }

  /**
   * Generate manipulation response
   */
  private generateManipulationResponse(): WatchdogResponse {
    const synthesis = this.orchestrator.getLatestSynthesis();
    const signals = synthesis?.manipulationSignals || [];
    
    if (signals.length === 0) {
      return {
        text: 'No manipulation signals detected. Market appears to be trading normally.',
        speakableText: 'No manipulation signals detected. Market appears to be trading normally.',
        shouldSpeak: true,
        priority: 'low',
      };
    }
    
    const text = `${signals.length} manipulation signal${signals.length !== 1 ? 's' : ''} detected:\n` +
      signals.map(s => 
        `[${(s.probability * 100).toFixed(0)}% probability] ${s.type.replace(/_/g, ' ')}: ${s.warningNarrative}`
      ).join('\n');
    
    const speakableText = `Warning: ${signals.length} manipulation signals detected. ` +
      signals[0].warningNarrative;
    
    return {
      text,
      speakableText,
      data: { signals },
      shouldSpeak: true,
      priority: 'high',
    };
  }

  /**
   * Generate entities response
   */
  private generateEntitiesResponse(): WatchdogResponse {
    const synthesis = this.orchestrator.getLatestSynthesis();
    const alerts = synthesis?.entityAlerts || [];
    
    if (alerts.length === 0) {
      return {
        text: 'No entity escalations detected. Tracked entities are behaving normally.',
        speakableText: 'No entity escalations detected. Tracked entities are behaving normally.',
        shouldSpeak: true,
        priority: 'low',
      };
    }
    
    const text = `${alerts.length} entity alert${alerts.length !== 1 ? 's' : ''}:\n` +
      alerts.map(a => 
        `[${a.severity.toUpperCase()}] ${a.entityLabel || a.entityId}: ${a.description}`
      ).join('\n');
    
    const speakableText = `${alerts.length} entity alerts. ` +
      alerts[0].riskNarrative;
    
    return {
      text,
      speakableText,
      data: { alerts },
      shouldSpeak: true,
      priority: alerts.some(a => a.severity === 'critical') ? 'high' : 'medium',
    };
  }

  /**
   * Generate start response
   */
  private generateStartResponse(): WatchdogResponse {
    if (this.orchestrator.isScanningActive()) {
      return {
        text: 'The watchdog is already running.',
        speakableText: 'The watchdog is already running.',
        shouldSpeak: true,
        priority: 'low',
      };
    }
    
    // Start scanning with empty inputs (will use cached data)
    this.orchestrator.startContinuousScanning(() => ({}));
    
    return {
      text: 'Watchdog activated. I will now continuously monitor the market for threats and alert you to any dangers.',
      speakableText: 'Watchdog activated. I will now continuously monitor the market for threats and alert you to any dangers.',
      shouldSpeak: true,
      priority: 'medium',
    };
  }

  /**
   * Generate stop response
   */
  private generateStopResponse(): WatchdogResponse {
    if (!this.orchestrator.isScanningActive()) {
      return {
        text: 'The watchdog is not currently running.',
        speakableText: 'The watchdog is not currently running.',
        shouldSpeak: true,
        priority: 'low',
      };
    }
    
    this.orchestrator.stopContinuousScanning();
    
    return {
      text: 'Watchdog deactivated. I will no longer monitor the market automatically. You can still ask me about market conditions at any time.',
      speakableText: 'Watchdog deactivated. I will no longer monitor the market automatically.',
      shouldSpeak: true,
      priority: 'medium',
    };
  }

  /**
   * Generate settings response
   */
  private generateSettingsResponse(): WatchdogResponse {
    const config = this.orchestrator.getConfig();
    
    const text = `Watchdog Settings:\n` +
      `- Scan interval: ${config.scanIntervalMs / 1000} seconds\n` +
      `- Auto-speak threshold: ${config.autoSpeakThreshold}\n` +
      `- Voice commands: ${this.config.enableVoiceCommands ? 'enabled' : 'disabled'}\n` +
      `- Auto alerts: ${this.config.enableAutoAlerts ? 'enabled' : 'disabled'}\n` +
      `- Alert speech: ${this.config.alertSpeechEnabled ? 'enabled' : 'disabled'}`;
    
    return {
      text,
      speakableText: 'Watchdog settings are configured for standard monitoring with voice alerts enabled.',
      data: { config, integrationConfig: this.config },
      shouldSpeak: false,
      priority: 'low',
    };
  }

  /**
   * Generate history response
   */
  private generateHistoryResponse(): WatchdogResponse {
    const history = this.orchestrator.getSynthesisHistory(10);
    
    if (history.length === 0) {
      return {
        text: 'No watchdog history available yet.',
        speakableText: 'No watchdog history available yet.',
        shouldSpeak: true,
        priority: 'low',
      };
    }
    
    const criticalEvents = history.filter(s => s.state === 'critical').length;
    const alertEvents = history.filter(s => s.state === 'alert').length;
    const avgThreat = history.reduce((sum, s) => sum + s.overallThreatLevel, 0) / history.length;
    
    const text = `Watchdog History (last ${history.length} scans):\n` +
      `- Critical events: ${criticalEvents}\n` +
      `- Alert events: ${alertEvents}\n` +
      `- Average threat level: ${avgThreat.toFixed(0)}\n` +
      `- Total alerts generated: ${history.reduce((sum, s) => sum + s.routedAlerts.length, 0)}`;
    
    const speakableText = `In the last ${history.length} scans, there were ${criticalEvents} critical events ` +
      `and ${alertEvents} alert events. Average threat level was ${avgThreat.toFixed(0)}.`;
    
    return {
      text,
      speakableText,
      data: { history },
      shouldSpeak: true,
      priority: 'low',
    };
  }

  /**
   * Generate summary response
   */
  private generateSummaryResponse(): WatchdogResponse {
    const synthesis = this.orchestrator.getLatestSynthesis();
    
    if (!synthesis) {
      return {
        text: 'No market data available for summary. Would you like me to start the watchdog?',
        speakableText: 'No market data available for summary. Would you like me to start the watchdog?',
        shouldSpeak: true,
        priority: 'low',
      };
    }
    
    const text = synthesis.summary + '\n\n' +
      `Threat Level: ${synthesis.overallThreatLevel.toFixed(0)}/100\n` +
      `Active Threats: ${synthesis.activeThreats}\n` +
      `Critical Threats: ${synthesis.criticalThreats}\n` +
      (synthesis.speechText ? `\nKey Alert: ${synthesis.speechText}` : '');
    
    const speakableText = synthesis.summary + 
      (synthesis.speechText ? ` ${synthesis.speechText}` : '');
    
    return {
      text,
      speakableText,
      data: { synthesis },
      shouldSpeak: true,
      priority: synthesis.state === 'critical' ? 'high' : 
                synthesis.state === 'alert' ? 'medium' : 'low',
    };
  }

  /**
   * Generate default response
   */
  private generateDefaultResponse(): WatchdogResponse {
    return {
      text: 'I can help you with market watchdog queries. Try asking about threats, alerts, pressure, anomalies, liquidity, manipulation, or entity activity.',
      speakableText: 'I can help you with market watchdog queries. Try asking about threats, alerts, or market conditions.',
      shouldSpeak: true,
      priority: 'low',
    };
  }

  // ============================================================
  // Speech and Alert Handling
  // ============================================================

  /**
   * Handle speech activation from orchestrator
   */
  private handleSpeechActivation(activation: SpeechActivation): void {
    if (!this.config.alertSpeechEnabled) {
      return;
    }
    
    // Check priority threshold
    const priorityRank = { low: 1, medium: 2, high: 3 };
    if (priorityRank[activation.priority] < priorityRank[this.config.minAlertPriority]) {
      return;
    }
    
    this.stats.totalSpeechActivations++;
    
    // Notify speech callback if registered
    if (this.speechCallback) {
      this.speechCallback(activation.text, activation.priority);
    }
    
    this.log(`Speech activation: ${activation.priority} - ${activation.text.substring(0, 50)}...`);
  }

  /**
   * Handle alerts from orchestrator
   */
  private handleAlerts(alerts: WatchdogAlert[]): void {
    // Process triggers
    const triggerValues = Array.from(this.triggers.values());
    for (const trigger of triggerValues) {
      if (!trigger.enabled) continue;
      
      for (const alert of alerts) {
        if (this.triggerMatches(trigger, alert)) {
          this.executeTrigger(trigger, alert);
        }
      }
    }
  }

  /**
   * Check if a trigger matches an alert
   */
  private triggerMatches(trigger: WatchdogTrigger, alert: WatchdogAlert): boolean {
    // Simple condition matching
    const condition = trigger.condition.toLowerCase();
    
    if (condition.includes('critical') && alert.priority !== 'high') {
      return false;
    }
    
    if (condition.includes('manipulation') && !alert.source.includes('manipulation')) {
      return false;
    }
    
    if (condition.includes('entity') && !alert.source.includes('entity')) {
      return false;
    }
    
    return true;
  }

  /**
   * Execute a trigger action
   */
  private executeTrigger(trigger: WatchdogTrigger, alert: WatchdogAlert): void {
    this.log(`Executing trigger: ${trigger.id} for alert: ${alert.id}`);
    
    if (trigger.action === 'speak' || trigger.action === 'both') {
      if (this.speechCallback) {
        this.speechCallback(alert.narrative, alert.priority);
      }
    }
    
    // 'notify' action would integrate with notification system
  }

  // ============================================================
  // Trigger Management
  // ============================================================

  /**
   * Add a trigger
   */
  addTrigger(trigger: Omit<WatchdogTrigger, 'id'>): string {
    this.triggerCounter++;
    const id = `trigger_${Date.now()}_${this.triggerCounter}`;
    
    this.triggers.set(id, { ...trigger, id });
    this.log(`Added trigger: ${id}`);
    
    return id;
  }

  /**
   * Remove a trigger
   */
  removeTrigger(id: string): boolean {
    return this.triggers.delete(id);
  }

  /**
   * Enable/disable a trigger
   */
  setTriggerEnabled(id: string, enabled: boolean): boolean {
    const trigger = this.triggers.get(id);
    if (trigger) {
      trigger.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Get all triggers
   */
  getTriggers(): WatchdogTrigger[] {
    return Array.from(this.triggers.values());
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Process user input and return response if watchdog-related
   */
  processInput(input: string): WatchdogResponse | null {
    const match = this.matchIntent(input);
    if (!match) {
      return null;
    }
    return this.handleIntent(match);
  }

  /**
   * Set speech callback
   */
  setSpeechCallback(callback: (text: string, priority: string) => void): void {
    this.speechCallback = callback;
  }

  /**
   * Perform a manual scan
   */
  performScan(inputs?: WatchdogInputs): WatchdogSynthesis {
    return this.orchestrator.scan(inputs || {});
  }

  /**
   * Get orchestrator instance
   */
  getOrchestrator() {
    return this.orchestrator;
  }

  /**
   * Check if watchdog is active
   */
  isActive(): boolean {
    return this.orchestrator.isScanningActive();
  }

  /**
   * Get current threat level
   */
  getThreatLevel(): number {
    const synthesis = this.orchestrator.getLatestSynthesis();
    return synthesis?.overallThreatLevel || 0;
  }

  /**
   * Get statistics
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Get configuration
   */
  getConfig(): WatchdogIntegrationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<WatchdogIntegrationConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Reset integration
   */
  reset(): void {
    this.triggers.clear();
    this.triggerCounter = 0;
    this.stats = {
      totalIntentsMatched: 0,
      intentsByType: {} as Record<WatchdogIntent, number>,
      totalResponsesGenerated: 0,
      totalSpeechActivations: 0,
      lastActivityTime: 0,
    };
    this.initializeStats();
    this.orchestrator.reset();
    this.log('Integration reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let integrationInstance: WatchdogIntegrationImpl | null = null;

/**
 * Get the singleton WatchdogIntegration instance
 */
export function getWatchdogIntegration(config?: Partial<WatchdogIntegrationConfig>): WatchdogIntegrationImpl {
  if (!integrationInstance) {
    integrationInstance = new WatchdogIntegrationImpl(config);
  }
  return integrationInstance;
}

/**
 * Create a new WatchdogIntegration with custom config
 */
export function createWatchdogIntegration(config?: Partial<WatchdogIntegrationConfig>): WatchdogIntegrationImpl {
  return new WatchdogIntegrationImpl(config);
}
