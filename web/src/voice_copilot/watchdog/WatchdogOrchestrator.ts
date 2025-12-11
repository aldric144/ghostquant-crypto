/**
 * Phase 7: Autonomous Market Watchdog
 * MODULE 8 - WatchdogOrchestrator.ts
 * 
 * Glue module that:
 * - Pulls from all Phase 7 engines
 * - Synthesizes warnings
 * - Determines user relevance
 * - Activates the Copilot speech pipeline if needed
 * 
 * This module is 100% isolated and additive - no modifications to existing code.
 */

import {
  getMarketPressureScanner,
  type PressureReading,
  type MarketPressureInputs,
} from './MarketPressureScanner';

import {
  getAnomalyDetectionEngine,
  type Anomaly,
  type AnomalyDetectionInputs,
} from './AnomalyDetectionEngine';

import {
  getLiquidityFragilityDetector,
  type FragilityAlert,
  type LiquidityFragilityInputs,
} from './LiquidityFragilityDetector';

import {
  getManipulationDetector,
  type ManipulationSignal,
  type ManipulationDetectorInputs,
} from './ManipulationDetector';

import {
  getEntityEscalationTracker,
  type EscalationAlert,
  type EntityEscalationInputs,
} from './EntityEscalationTracker';

import {
  getAutonomousAlertRouter,
  type WatchdogAlert,
  type AlertDelivery,
  type IncomingAlert,
} from './AutonomousAlertRouter';

import {
  getWatchdogNarrator,
  type WatchdogNarrative,
} from './WatchdogNarrator';

// ============================================================
// Types and Interfaces
// ============================================================

export type WatchdogState = 'idle' | 'scanning' | 'alert' | 'critical';

export interface WatchdogInputs {
  pressure?: MarketPressureInputs;
  anomaly?: AnomalyDetectionInputs;
  liquidity?: LiquidityFragilityInputs;
  manipulation?: ManipulationDetectorInputs;
  entity?: EntityEscalationInputs;
}

export interface WatchdogSynthesis {
  timestamp: number;
  state: WatchdogState;
  overallThreatLevel: number;  // 0-100
  activeThreats: number;
  criticalThreats: number;
  pressureReading: PressureReading | null;
  anomalies: Anomaly[];
  fragilityAlert: FragilityAlert | null;
  manipulationSignals: ManipulationSignal[];
  entityAlerts: EscalationAlert[];
  routedAlerts: WatchdogAlert[];
  narratives: WatchdogNarrative[];
  summary: string;
  shouldSpeak: boolean;
  speechText: string;
}

export interface UserRelevanceFactors {
  hasOpenPositions: boolean;
  watchedAssets: string[];
  watchedEntities: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  alertPreferences: {
    pressureAlerts: boolean;
    anomalyAlerts: boolean;
    liquidityAlerts: boolean;
    manipulationAlerts: boolean;
    entityAlerts: boolean;
  };
}

export interface SpeechActivation {
  shouldSpeak: boolean;
  text: string;
  priority: 'high' | 'medium' | 'low';
  narrative: WatchdogNarrative | null;
}

export interface WatchdogOrchestratorConfig {
  scanIntervalMs: number;
  threatLevelThresholds: {
    elevated: number;
    high: number;
    critical: number;
  };
  autoSpeakThreshold: number;
  maxConcurrentAlerts: number;
  synthesisHistorySize: number;
  enableLogging: boolean;
  logPrefix: string;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: WatchdogOrchestratorConfig = {
  scanIntervalMs: 10000,  // 10 seconds
  threatLevelThresholds: {
    elevated: 40,
    high: 60,
    critical: 80,
  },
  autoSpeakThreshold: 70,
  maxConcurrentAlerts: 10,
  synthesisHistorySize: 50,
  enableLogging: true,
  logPrefix: '[WatchdogOrchestrator]',
};

const DEFAULT_USER_RELEVANCE: UserRelevanceFactors = {
  hasOpenPositions: true,
  watchedAssets: [],
  watchedEntities: [],
  riskTolerance: 'medium',
  alertPreferences: {
    pressureAlerts: true,
    anomalyAlerts: true,
    liquidityAlerts: true,
    manipulationAlerts: true,
    entityAlerts: true,
  },
};

// ============================================================
// WatchdogOrchestrator Implementation
// ============================================================

class WatchdogOrchestratorImpl {
  private config: WatchdogOrchestratorConfig;
  private userRelevance: UserRelevanceFactors;
  private synthesisHistory: WatchdogSynthesis[] = [];
  private currentState: WatchdogState = 'idle';
  private scanInterval: NodeJS.Timeout | null = null;
  private isScanning = false;
  private speechCallbacks: Array<(activation: SpeechActivation) => void> = [];
  private alertCallbacks: Array<(alerts: WatchdogAlert[]) => void> = [];
  
  // Engine instances
  private pressureScanner = getMarketPressureScanner();
  private anomalyEngine = getAnomalyDetectionEngine();
  private fragilityDetector = getLiquidityFragilityDetector();
  private manipulationDetector = getManipulationDetector();
  private entityTracker = getEntityEscalationTracker();
  private alertRouter = getAutonomousAlertRouter();
  private narrator = getWatchdogNarrator();
  
  private stats = {
    totalScans: 0,
    totalSyntheses: 0,
    totalSpeechActivations: 0,
    averageThreatLevel: 0,
    criticalEvents: 0,
    lastScanTime: 0,
  };

  constructor(config?: Partial<WatchdogOrchestratorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.userRelevance = { ...DEFAULT_USER_RELEVANCE };
    this.log('WatchdogOrchestrator initialized');
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
  // Main Orchestration
  // ============================================================

  /**
   * Perform a full watchdog scan and synthesis
   */
  scan(inputs: WatchdogInputs): WatchdogSynthesis {
    const now = Date.now();
    this.stats.totalScans++;
    this.stats.lastScanTime = now;
    
    this.log('Starting watchdog scan');
    
    // Collect results from all engines
    const pressureReading = inputs.pressure 
      ? this.pressureScanner.scan(inputs.pressure)
      : this.pressureScanner.getLatestReading();
    
    const anomalies = inputs.anomaly
      ? this.anomalyEngine.detect(inputs.anomaly)
      : this.anomalyEngine.getActiveAnomalies();
    
    const fragilityAlert = inputs.liquidity
      ? this.fragilityDetector.scan(inputs.liquidity)
      : this.fragilityDetector.getLatestAlert();
    
    const manipulationSignals = inputs.manipulation
      ? this.manipulationDetector.detect(inputs.manipulation)
      : this.manipulationDetector.getActiveSignals();
    
    const entityAlerts = inputs.entity
      ? this.entityTracker.track(inputs.entity)
      : this.entityTracker.getActiveAlerts();
    
    // Synthesize all results
    const synthesis = this.synthesize(
      pressureReading,
      anomalies,
      fragilityAlert,
      manipulationSignals,
      entityAlerts
    );
    
    // Store in history
    this.synthesisHistory.push(synthesis);
    if (this.synthesisHistory.length > this.config.synthesisHistorySize) {
      this.synthesisHistory.shift();
    }
    
    // Update state
    this.currentState = synthesis.state;
    
    // Update stats
    this.stats.totalSyntheses++;
    this.stats.averageThreatLevel = 
      (this.stats.averageThreatLevel * (this.stats.totalSyntheses - 1) + synthesis.overallThreatLevel) /
      this.stats.totalSyntheses;
    
    if (synthesis.state === 'critical') {
      this.stats.criticalEvents++;
    }
    
    // Trigger speech if needed
    if (synthesis.shouldSpeak) {
      this.activateSpeech(synthesis);
    }
    
    // Notify alert callbacks
    if (synthesis.routedAlerts.length > 0) {
      this.notifyAlertCallbacks(synthesis.routedAlerts);
    }
    
    this.log(`Scan complete: state=${synthesis.state}, threatLevel=${synthesis.overallThreatLevel.toFixed(0)}`);
    
    return synthesis;
  }

  /**
   * Synthesize all engine outputs into a unified view
   */
  private synthesize(
    pressureReading: PressureReading | null,
    anomalies: Anomaly[],
    fragilityAlert: FragilityAlert | null,
    manipulationSignals: ManipulationSignal[],
    entityAlerts: EscalationAlert[]
  ): WatchdogSynthesis {
    const now = Date.now();
    
    // Calculate overall threat level
    const threatLevel = this.calculateThreatLevel(
      pressureReading,
      anomalies,
      fragilityAlert,
      manipulationSignals,
      entityAlerts
    );
    
    // Determine state
    const state = this.determineState(threatLevel);
    
    // Count threats
    const activeThreats = this.countActiveThreats(
      anomalies,
      fragilityAlert,
      manipulationSignals,
      entityAlerts
    );
    
    const criticalThreats = this.countCriticalThreats(
      anomalies,
      fragilityAlert,
      manipulationSignals,
      entityAlerts
    );
    
    // Route alerts
    const incomingAlerts = this.createIncomingAlerts(
      pressureReading,
      anomalies,
      fragilityAlert,
      manipulationSignals,
      entityAlerts
    );
    
    const routedAlerts: WatchdogAlert[] = [];
    for (const incoming of incomingAlerts) {
      const delivery = this.alertRouter.route(incoming);
      if (delivery) {
        routedAlerts.push(delivery.alert);
      }
    }
    
    // Generate narratives
    const narratives = this.generateNarratives(
      pressureReading,
      anomalies,
      fragilityAlert,
      manipulationSignals,
      entityAlerts
    );
    
    // Generate summary
    const summary = this.generateSummary(
      state,
      threatLevel,
      activeThreats,
      criticalThreats
    );
    
    // Determine if should speak
    const shouldSpeak = this.shouldActivateSpeech(threatLevel, criticalThreats, routedAlerts);
    
    // Generate speech text
    const speechText = shouldSpeak
      ? this.generateSpeechText(narratives, routedAlerts)
      : '';
    
    return {
      timestamp: now,
      state,
      overallThreatLevel: threatLevel,
      activeThreats,
      criticalThreats,
      pressureReading,
      anomalies,
      fragilityAlert,
      manipulationSignals,
      entityAlerts,
      routedAlerts,
      narratives,
      summary,
      shouldSpeak,
      speechText,
    };
  }

  /**
   * Calculate overall threat level
   */
  private calculateThreatLevel(
    pressure: PressureReading | null,
    anomalies: Anomaly[],
    fragility: FragilityAlert | null,
    manipulation: ManipulationSignal[],
    entities: EscalationAlert[]
  ): number {
    let threatLevel = 0;
    let weights = 0;
    
    // Pressure contribution (weight: 0.2)
    if (pressure) {
      threatLevel += pressure.pressureScore * 0.2;
      weights += 0.2;
    }
    
    // Anomaly contribution (weight: 0.25)
    if (anomalies.length > 0) {
      const maxAnomalySeverity = Math.max(
        ...anomalies.map(a => this.severityToNumber(a.severity))
      );
      threatLevel += maxAnomalySeverity * 0.25;
      weights += 0.25;
    }
    
    // Fragility contribution (weight: 0.2)
    if (fragility) {
      threatLevel += fragility.overallFragility * 0.2;
      weights += 0.2;
    }
    
    // Manipulation contribution (weight: 0.2)
    if (manipulation.length > 0) {
      const maxManipulationSeverity = Math.max(
        ...manipulation.map(m => m.probability * 100)
      );
      threatLevel += maxManipulationSeverity * 0.2;
      weights += 0.2;
    }
    
    // Entity contribution (weight: 0.15)
    if (entities.length > 0) {
      const maxEntitySeverity = Math.max(
        ...entities.map(e => this.severityToNumber(e.severity))
      );
      threatLevel += maxEntitySeverity * 0.15;
      weights += 0.15;
    }
    
    // Normalize
    if (weights > 0) {
      threatLevel = threatLevel / weights;
    }
    
    // Boost for multiple concurrent threats
    const totalThreats = anomalies.length + manipulation.length + entities.length;
    if (totalThreats > 3) {
      threatLevel = Math.min(100, threatLevel * 1.2);
    }
    
    return Math.min(100, threatLevel);
  }

  /**
   * Determine watchdog state from threat level
   */
  private determineState(threatLevel: number): WatchdogState {
    if (threatLevel >= this.config.threatLevelThresholds.critical) return 'critical';
    if (threatLevel >= this.config.threatLevelThresholds.high) return 'alert';
    if (threatLevel >= this.config.threatLevelThresholds.elevated) return 'scanning';
    return 'idle';
  }

  /**
   * Count active threats
   */
  private countActiveThreats(
    anomalies: Anomaly[],
    fragility: FragilityAlert | null,
    manipulation: ManipulationSignal[],
    entities: EscalationAlert[]
  ): number {
    let count = anomalies.length + manipulation.length + entities.length;
    if (fragility && fragility.zones.length > 0) {
      count += fragility.zones.length;
    }
    return count;
  }

  /**
   * Count critical threats
   */
  private countCriticalThreats(
    anomalies: Anomaly[],
    fragility: FragilityAlert | null,
    manipulation: ManipulationSignal[],
    entities: EscalationAlert[]
  ): number {
    let count = 0;
    
    count += anomalies.filter(a => a.severity === 'critical').length;
    count += manipulation.filter(m => m.severity === 'critical').length;
    count += entities.filter(e => e.severity === 'critical').length;
    
    if (fragility && fragility.marketVulnerability === 'critical') {
      count++;
    }
    
    return count;
  }

  /**
   * Create incoming alerts for the router
   */
  private createIncomingAlerts(
    pressure: PressureReading | null,
    anomalies: Anomaly[],
    fragility: FragilityAlert | null,
    manipulation: ManipulationSignal[],
    entities: EscalationAlert[]
  ): IncomingAlert[] {
    const alerts: IncomingAlert[] = [];
    
    // Pressure alerts
    if (pressure && pressure.pressureScore >= 70) {
      alerts.push({
        source: 'pressure_scanner',
        title: `Market Pressure ${pressure.pressureDirection.toUpperCase()}`,
        message: `Pressure score: ${pressure.pressureScore.toFixed(0)}. ${pressure.pressureDrivers[0] || ''}`,
        confidence: 0.8,
        severity: pressure.pressureScore,
      });
    }
    
    // Anomaly alerts
    for (const anomaly of anomalies) {
      if (this.isRelevantToUser(anomaly)) {
        alerts.push({
          source: 'anomaly_detection',
          title: `Anomaly: ${anomaly.type.replace(/_/g, ' ')}`,
          message: anomaly.explanation,
          narrative: anomaly.explanation,
          suggestedAction: anomaly.suggestedAction,
          confidence: anomaly.confidence,
          severity: this.severityToNumber(anomaly.severity),
        });
      }
    }
    
    // Fragility alerts
    if (fragility && fragility.marketVulnerability !== 'stable') {
      alerts.push({
        source: 'liquidity_fragility',
        title: 'Liquidity Fragility',
        message: fragility.summary,
        confidence: 0.85,
        severity: fragility.overallFragility,
      });
    }
    
    // Manipulation alerts
    for (const signal of manipulation) {
      alerts.push({
        source: 'manipulation_detector',
        title: `Manipulation: ${signal.type.replace(/_/g, ' ')}`,
        message: signal.warningNarrative,
        narrative: signal.warningNarrative,
        suggestedAction: signal.suggestedAction,
        confidence: signal.confidence,
        severity: signal.probability * 100,
      });
    }
    
    // Entity alerts
    for (const entity of entities) {
      if (this.isEntityRelevant(entity.entityId)) {
        alerts.push({
          source: 'entity_escalation',
          title: `Entity: ${entity.escalationType.replace(/_/g, ' ')}`,
          message: entity.description,
          narrative: entity.riskNarrative,
          suggestedAction: entity.suggestedAction,
          confidence: entity.confidence,
          severity: this.severityToNumber(entity.severity),
        });
      }
    }
    
    return alerts;
  }

  /**
   * Generate narratives for significant events
   */
  private generateNarratives(
    pressure: PressureReading | null,
    anomalies: Anomaly[],
    fragility: FragilityAlert | null,
    manipulation: ManipulationSignal[],
    entities: EscalationAlert[]
  ): WatchdogNarrative[] {
    const narratives: WatchdogNarrative[] = [];
    
    // Pressure narrative
    if (pressure && pressure.pressureScore >= 60) {
      narratives.push(
        this.narrator.generatePressureWarning(
          pressure.pressureScore,
          pressure.pressureDirection,
          pressure.pressureDrivers
        )
      );
    }
    
    // Anomaly narratives (top 3 by severity)
    const topAnomalies = [...anomalies]
      .sort((a, b) => this.severityToNumber(b.severity) - this.severityToNumber(a.severity))
      .slice(0, 3);
    
    for (const anomaly of topAnomalies) {
      narratives.push(
        this.narrator.generateAnomalyWarning(
          anomaly.type,
          this.severityToNumber(anomaly.severity),
          anomaly.explanation
        )
      );
    }
    
    // Fragility narrative
    if (fragility && fragility.overallFragility >= 50) {
      narratives.push(
        this.narrator.generateLiquidityWarning(
          fragility.overallFragility,
          fragility.zones.length,
          fragility.nearestCriticalZone?.priceRange
        )
      );
    }
    
    // Manipulation narratives
    for (const signal of manipulation.slice(0, 2)) {
      narratives.push(
        this.narrator.generateManipulationWarning(
          signal.type,
          signal.probability,
          signal.manipulatorEntities.map(e => e.id)
        )
      );
    }
    
    // Entity narratives (top 2)
    const topEntities = [...entities]
      .sort((a, b) => this.severityToNumber(b.severity) - this.severityToNumber(a.severity))
      .slice(0, 2);
    
    for (const entity of topEntities) {
      narratives.push(
        this.narrator.generateEntityWarning(
          entity.entityId,
          entity.escalationType,
          entity.metrics.changePercent
        )
      );
    }
    
    return narratives;
  }

  /**
   * Generate summary text
   */
  private generateSummary(
    state: WatchdogState,
    threatLevel: number,
    activeThreats: number,
    criticalThreats: number
  ): string {
    if (state === 'idle') {
      return 'Market conditions are stable. No significant threats detected.';
    }
    
    if (state === 'critical') {
      return `CRITICAL: ${criticalThreats} critical threat${criticalThreats > 1 ? 's' : ''} detected. Threat level: ${threatLevel.toFixed(0)}. Immediate attention required.`;
    }
    
    if (state === 'alert') {
      return `ALERT: ${activeThreats} active threat${activeThreats > 1 ? 's' : ''} detected. Threat level: ${threatLevel.toFixed(0)}. Monitor closely.`;
    }
    
    return `Scanning: ${activeThreats} potential concern${activeThreats > 1 ? 's' : ''} detected. Threat level: ${threatLevel.toFixed(0)}.`;
  }

  /**
   * Determine if speech should be activated
   */
  private shouldActivateSpeech(
    threatLevel: number,
    criticalThreats: number,
    alerts: WatchdogAlert[]
  ): boolean {
    // Always speak for critical threats
    if (criticalThreats > 0) {
      return true;
    }
    
    // Speak if threat level exceeds threshold
    if (threatLevel >= this.config.autoSpeakThreshold) {
      return true;
    }
    
    // Speak if there are high-priority alerts
    const highPriorityAlerts = alerts.filter(a => a.priority === 'high');
    if (highPriorityAlerts.length > 0) {
      return true;
    }
    
    return false;
  }

  /**
   * Generate speech text from narratives
   */
  private generateSpeechText(
    narratives: WatchdogNarrative[],
    alerts: WatchdogAlert[]
  ): string {
    // Prioritize by urgency
    const sortedNarratives = [...narratives]
      .sort((a, b) => b.urgencyLevel - a.urgencyLevel);
    
    if (sortedNarratives.length === 0) {
      // Fall back to alert narratives
      const highAlerts = alerts.filter(a => a.priority === 'high');
      if (highAlerts.length > 0) {
        return highAlerts[0].narrative;
      }
      return '';
    }
    
    // Use the most urgent narrative
    const topNarrative = sortedNarratives[0];
    
    // If multiple critical narratives, combine them
    const criticalNarratives = sortedNarratives.filter(n => n.urgencyLevel >= 80);
    if (criticalNarratives.length > 1) {
      return criticalNarratives
        .slice(0, 2)
        .map(n => n.speakableNarrative)
        .join(' Also, ');
    }
    
    return topNarrative.speakableNarrative;
  }

  /**
   * Activate speech pipeline
   */
  private activateSpeech(synthesis: WatchdogSynthesis): void {
    const activation: SpeechActivation = {
      shouldSpeak: true,
      text: synthesis.speechText,
      priority: synthesis.state === 'critical' ? 'high' : 
                synthesis.state === 'alert' ? 'medium' : 'low',
      narrative: synthesis.narratives[0] || null,
    };
    
    this.stats.totalSpeechActivations++;
    
    // Notify speech callbacks
    for (const callback of this.speechCallbacks) {
      try {
        callback(activation);
      } catch (error) {
        this.log('Error in speech callback', error);
      }
    }
    
    this.log(`Speech activated: ${activation.priority} priority`);
  }

  // ============================================================
  // User Relevance
  // ============================================================

  /**
   * Check if an anomaly is relevant to the user
   */
  private isRelevantToUser(anomaly: Anomaly): boolean {
    // Check alert preferences
    if (!this.userRelevance.alertPreferences.anomalyAlerts) {
      return false;
    }
    
    // Check if affects watched assets
    if (this.userRelevance.watchedAssets.length > 0) {
      // For now, assume all anomalies are relevant
      // In production, would check anomaly.affectedEntities against watchedAssets
    }
    
    // Check risk tolerance
    const severityNum = this.severityToNumber(anomaly.severity);
    if (this.userRelevance.riskTolerance === 'high' && severityNum < 60) {
      return false;
    }
    
    return true;
  }

  /**
   * Check if an entity is relevant to the user
   */
  private isEntityRelevant(entityId: string): boolean {
    if (!this.userRelevance.alertPreferences.entityAlerts) {
      return false;
    }
    
    // If user has watched entities, only show those
    if (this.userRelevance.watchedEntities.length > 0) {
      return this.userRelevance.watchedEntities.includes(entityId);
    }
    
    return true;
  }

  /**
   * Update user relevance factors
   */
  setUserRelevance(factors: Partial<UserRelevanceFactors>): void {
    this.userRelevance = { ...this.userRelevance, ...factors };
    this.log('User relevance updated');
  }

  // ============================================================
  // Continuous Scanning
  // ============================================================

  /**
   * Start continuous scanning
   */
  startContinuousScanning(getInputs: () => WatchdogInputs): void {
    if (this.isScanning) {
      this.log('Already scanning');
      return;
    }
    
    this.isScanning = true;
    this.log(`Starting continuous scanning every ${this.config.scanIntervalMs}ms`);
    
    this.scanInterval = setInterval(() => {
      try {
        const inputs = getInputs();
        this.scan(inputs);
      } catch (error) {
        this.log('Error during scan', error);
      }
    }, this.config.scanIntervalMs);
  }

  /**
   * Stop continuous scanning
   */
  stopContinuousScanning(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    this.isScanning = false;
    this.log('Stopped continuous scanning');
  }

  // ============================================================
  // Callbacks
  // ============================================================

  /**
   * Add speech activation callback
   */
  onSpeechActivation(callback: (activation: SpeechActivation) => void): void {
    this.speechCallbacks.push(callback);
  }

  /**
   * Remove speech activation callback
   */
  offSpeechActivation(callback: (activation: SpeechActivation) => void): void {
    const index = this.speechCallbacks.indexOf(callback);
    if (index > -1) {
      this.speechCallbacks.splice(index, 1);
    }
  }

  /**
   * Add alert callback
   */
  onAlerts(callback: (alerts: WatchdogAlert[]) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Remove alert callback
   */
  offAlerts(callback: (alerts: WatchdogAlert[]) => void): void {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }

  /**
   * Notify alert callbacks
   */
  private notifyAlertCallbacks(alerts: WatchdogAlert[]): void {
    for (const callback of this.alertCallbacks) {
      try {
        callback(alerts);
      } catch (error) {
        this.log('Error in alert callback', error);
      }
    }
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  private severityToNumber(severity: string): number {
    const values: Record<string, number> = {
      'low': 25,
      'medium': 50,
      'high': 75,
      'critical': 100,
    };
    return values[severity] || 50;
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get current state
   */
  getState(): WatchdogState {
    return this.currentState;
  }

  /**
   * Get latest synthesis
   */
  getLatestSynthesis(): WatchdogSynthesis | null {
    return this.synthesisHistory.length > 0
      ? this.synthesisHistory[this.synthesisHistory.length - 1]
      : null;
  }

  /**
   * Get synthesis history
   */
  getSynthesisHistory(limit?: number): WatchdogSynthesis[] {
    if (limit) {
      return this.synthesisHistory.slice(-limit);
    }
    return [...this.synthesisHistory];
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): WatchdogAlert[] {
    return this.alertRouter.getActiveAlerts();
  }

  /**
   * Get high priority alerts
   */
  getHighPriorityAlerts(): WatchdogAlert[] {
    return this.alertRouter.getHighPriorityAlerts();
  }

  /**
   * Check if scanning
   */
  isScanningActive(): boolean {
    return this.isScanning;
  }

  /**
   * Check if in critical state
   */
  isCritical(): boolean {
    return this.currentState === 'critical';
  }

  /**
   * Get user relevance factors
   */
  getUserRelevance(): UserRelevanceFactors {
    return { ...this.userRelevance };
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
  getConfig(): WatchdogOrchestratorConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<WatchdogOrchestratorConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Reset orchestrator
   */
  reset(): void {
    this.stopContinuousScanning();
    this.synthesisHistory = [];
    this.currentState = 'idle';
    this.stats = {
      totalScans: 0,
      totalSyntheses: 0,
      totalSpeechActivations: 0,
      averageThreatLevel: 0,
      criticalEvents: 0,
      lastScanTime: 0,
    };
    
    // Reset all engines
    this.pressureScanner.reset();
    this.anomalyEngine.reset();
    this.fragilityDetector.reset();
    this.manipulationDetector.reset();
    this.entityTracker.reset();
    this.alertRouter.reset();
    this.narrator.reset();
    
    this.log('Orchestrator reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let orchestratorInstance: WatchdogOrchestratorImpl | null = null;

/**
 * Get the singleton WatchdogOrchestrator instance
 */
export function getWatchdogOrchestrator(config?: Partial<WatchdogOrchestratorConfig>): WatchdogOrchestratorImpl {
  if (!orchestratorInstance) {
    orchestratorInstance = new WatchdogOrchestratorImpl(config);
  }
  return orchestratorInstance;
}

/**
 * Create a new WatchdogOrchestrator with custom config
 */
export function createWatchdogOrchestrator(config?: Partial<WatchdogOrchestratorConfig>): WatchdogOrchestratorImpl {
  return new WatchdogOrchestratorImpl(config);
}
