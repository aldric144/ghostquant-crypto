/**
 * Phase 7: Autonomous Market Watchdog
 * MODULE 5 - EntityEscalationTracker.ts
 * 
 * Tracks entity behavior changes:
 * - Escalation speed
 * - Sudden accumulation
 * - Sudden distribution
 * - Cross-chain activity
 * - Whale shadow movements
 * - Entity "mood" changes
 * 
 * Triggers alerts when an entity becomes dangerous.
 * 
 * This module is 100% isolated and additive - no modifications to existing code.
 */

// ============================================================
// Types and Interfaces
// ============================================================

export type EntityType = 'whale' | 'institution' | 'exchange' | 'smart_money' | 'bot' | 'unknown';

export type EntityMood = 'accumulating' | 'distributing' | 'neutral' | 'aggressive' | 'defensive' | 'dormant';

export type EscalationType = 
  | 'rapid_accumulation'
  | 'rapid_distribution'
  | 'cross_chain_movement'
  | 'shadow_movement'
  | 'mood_shift'
  | 'risk_escalation'
  | 'activity_spike'
  | 'position_concentration';

export type EscalationSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface EntityPosition {
  asset: string;
  amount: number;
  valueUSD: number;
  entryPrice?: number;
  unrealizedPnL?: number;
}

export interface EntityTransaction {
  id: string;
  type: 'buy' | 'sell' | 'transfer_in' | 'transfer_out';
  asset: string;
  amount: number;
  valueUSD: number;
  timestamp: number;
  chain?: string;
  counterparty?: string;
}

export interface EntityProfile {
  id: string;
  address?: string;
  type: EntityType;
  label?: string;
  riskScore: number;
  mood: EntityMood;
  positions: EntityPosition[];
  recentTransactions: EntityTransaction[];
  totalValueUSD: number;
  activityLevel: number;  // 0-100
  lastActiveTimestamp: number;
}

export interface EntitySnapshot {
  entityId: string;
  timestamp: number;
  riskScore: number;
  mood: EntityMood;
  totalValueUSD: number;
  activityLevel: number;
  positionCount: number;
  netFlow24h: number;
}

export interface EscalationAlert {
  id: string;
  entityId: string;
  entityType: EntityType;
  entityLabel?: string;
  escalationType: EscalationType;
  severity: EscalationSeverity;
  confidence: number;
  description: string;
  riskNarrative: string;
  suggestedAction: string;
  metrics: {
    previousValue: number;
    currentValue: number;
    changePercent: number;
    changeRate: number;  // Per hour
  };
  relatedEntities: string[];
  timestamp: number;
  expiresAt: number;
}

export interface EntityEscalationInputs {
  entities: EntityProfile[];
  previousSnapshots?: Map<string, EntitySnapshot>;
}

export interface EscalationTrackerConfig {
  accumulationThreshold: number;     // % change to trigger
  distributionThreshold: number;     // % change to trigger
  activitySpikeThreshold: number;    // Multiplier
  riskEscalationThreshold: number;   // Points
  moodShiftCooldownMs: number;       // Cooldown between mood alerts
  crossChainThreshold: number;       // Number of chains
  alertTTLMs: number;
  maxAlertsStored: number;
  snapshotIntervalMs: number;
  enableLogging: boolean;
  logPrefix: string;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: EscalationTrackerConfig = {
  accumulationThreshold: 20,      // 20% increase
  distributionThreshold: 20,      // 20% decrease
  activitySpikeThreshold: 3,      // 3x normal activity
  riskEscalationThreshold: 15,    // 15 point increase
  moodShiftCooldownMs: 300000,    // 5 minutes
  crossChainThreshold: 3,         // 3+ chains
  alertTTLMs: 600000,             // 10 minutes
  maxAlertsStored: 200,
  snapshotIntervalMs: 60000,      // 1 minute
  enableLogging: true,
  logPrefix: '[EntityEscalationTracker]',
};

// ============================================================
// EntityEscalationTracker Implementation
// ============================================================

class EntityEscalationTrackerImpl {
  private config: EscalationTrackerConfig;
  private entitySnapshots: Map<string, EntitySnapshot[]> = new Map();
  private activeAlerts: Map<string, EscalationAlert> = new Map();
  private alertHistory: EscalationAlert[] = [];
  private lastMoodAlerts: Map<string, number> = new Map();
  private alertCounter = 0;
  
  private stats = {
    totalAlertsGenerated: 0,
    alertsByType: {} as Record<EscalationType, number>,
    alertsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
    entitiesTracked: 0,
    dangerousEntities: 0,
    lastTrackingTime: 0,
  };

  constructor(config?: Partial<EscalationTrackerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeStats();
    this.log('EntityEscalationTracker initialized');
  }

  private initializeStats(): void {
    const types: EscalationType[] = [
      'rapid_accumulation', 'rapid_distribution', 'cross_chain_movement',
      'shadow_movement', 'mood_shift', 'risk_escalation', 'activity_spike',
      'position_concentration'
    ];
    for (const type of types) {
      this.stats.alertsByType[type] = 0;
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

  // ============================================================
  // Main Tracking
  // ============================================================

  /**
   * Track entities and detect escalations
   */
  track(inputs: EntityEscalationInputs): EscalationAlert[] {
    const now = Date.now();
    this.cleanupExpiredAlerts();
    
    const detectedAlerts: EscalationAlert[] = [];
    
    for (const entity of inputs.entities) {
      // Get previous snapshot
      const previousSnapshot = this.getLatestSnapshot(entity.id);
      
      // Create current snapshot
      const currentSnapshot = this.createSnapshot(entity);
      
      // Store snapshot
      this.addSnapshot(entity.id, currentSnapshot);
      
      // Detect escalations
      if (previousSnapshot) {
        const alerts = this.detectEscalations(entity, previousSnapshot, currentSnapshot);
        detectedAlerts.push(...alerts);
      }
      
      // Check for dangerous patterns regardless of previous snapshot
      const dangerAlerts = this.detectDangerousPatterns(entity);
      detectedAlerts.push(...dangerAlerts);
    }
    
    // Add alerts to active tracking
    for (const alert of detectedAlerts) {
      this.addAlert(alert);
    }
    
    // Update stats
    this.stats.entitiesTracked = inputs.entities.length;
    this.stats.dangerousEntities = inputs.entities.filter(e => e.riskScore > 70).length;
    this.stats.lastTrackingTime = now;
    
    if (detectedAlerts.length > 0) {
      this.log(`Detected ${detectedAlerts.length} escalation alerts`);
    }
    
    return detectedAlerts;
  }

  // ============================================================
  // Escalation Detection
  // ============================================================

  /**
   * Detect escalations by comparing snapshots
   */
  private detectEscalations(
    entity: EntityProfile,
    previous: EntitySnapshot,
    current: EntitySnapshot
  ): EscalationAlert[] {
    const alerts: EscalationAlert[] = [];
    
    // Rapid accumulation
    const accumulationAlert = this.detectRapidAccumulation(entity, previous, current);
    if (accumulationAlert) alerts.push(accumulationAlert);
    
    // Rapid distribution
    const distributionAlert = this.detectRapidDistribution(entity, previous, current);
    if (distributionAlert) alerts.push(distributionAlert);
    
    // Activity spike
    const activityAlert = this.detectActivitySpike(entity, previous, current);
    if (activityAlert) alerts.push(activityAlert);
    
    // Risk escalation
    const riskAlert = this.detectRiskEscalation(entity, previous, current);
    if (riskAlert) alerts.push(riskAlert);
    
    // Mood shift
    const moodAlert = this.detectMoodShift(entity, previous, current);
    if (moodAlert) alerts.push(moodAlert);
    
    return alerts;
  }

  /**
   * Detect rapid accumulation
   */
  private detectRapidAccumulation(
    entity: EntityProfile,
    previous: EntitySnapshot,
    current: EntitySnapshot
  ): EscalationAlert | null {
    if (previous.totalValueUSD === 0) return null;
    
    const changePercent = ((current.totalValueUSD - previous.totalValueUSD) / previous.totalValueUSD) * 100;
    
    if (changePercent < this.config.accumulationThreshold) {
      return null;
    }
    
    const timeDiffHours = (current.timestamp - previous.timestamp) / 3600000;
    const changeRate = changePercent / Math.max(timeDiffHours, 0.1);
    
    const severity = this.calculateSeverity(changePercent, [20, 40, 70]);
    
    return this.createAlert({
      entityId: entity.id,
      entityType: entity.type,
      entityLabel: entity.label,
      escalationType: 'rapid_accumulation',
      severity,
      confidence: 0.8,
      description: `${entity.label || entity.id} rapidly accumulating: +${changePercent.toFixed(1)}%`,
      riskNarrative: 'Large accumulation may indicate insider knowledge or coordinated buying',
      suggestedAction: 'Monitor for potential price impact. Consider following if fundamentals support.',
      metrics: {
        previousValue: previous.totalValueUSD,
        currentValue: current.totalValueUSD,
        changePercent,
        changeRate,
      },
      relatedEntities: [],
    });
  }

  /**
   * Detect rapid distribution
   */
  private detectRapidDistribution(
    entity: EntityProfile,
    previous: EntitySnapshot,
    current: EntitySnapshot
  ): EscalationAlert | null {
    if (previous.totalValueUSD === 0) return null;
    
    const changePercent = ((previous.totalValueUSD - current.totalValueUSD) / previous.totalValueUSD) * 100;
    
    if (changePercent < this.config.distributionThreshold) {
      return null;
    }
    
    const timeDiffHours = (current.timestamp - previous.timestamp) / 3600000;
    const changeRate = changePercent / Math.max(timeDiffHours, 0.1);
    
    const severity = this.calculateSeverity(changePercent, [20, 40, 70]);
    
    return this.createAlert({
      entityId: entity.id,
      entityType: entity.type,
      entityLabel: entity.label,
      escalationType: 'rapid_distribution',
      severity,
      confidence: 0.8,
      description: `${entity.label || entity.id} rapidly distributing: -${changePercent.toFixed(1)}%`,
      riskNarrative: 'Large distribution may indicate profit-taking or loss of confidence',
      suggestedAction: 'Potential selling pressure incoming. Consider reducing exposure.',
      metrics: {
        previousValue: previous.totalValueUSD,
        currentValue: current.totalValueUSD,
        changePercent: -changePercent,
        changeRate: -changeRate,
      },
      relatedEntities: [],
    });
  }

  /**
   * Detect activity spike
   */
  private detectActivitySpike(
    entity: EntityProfile,
    previous: EntitySnapshot,
    current: EntitySnapshot
  ): EscalationAlert | null {
    if (previous.activityLevel === 0) return null;
    
    const activityMultiplier = current.activityLevel / previous.activityLevel;
    
    if (activityMultiplier < this.config.activitySpikeThreshold) {
      return null;
    }
    
    const severity = this.calculateSeverity(activityMultiplier, [3, 5, 10]);
    
    return this.createAlert({
      entityId: entity.id,
      entityType: entity.type,
      entityLabel: entity.label,
      escalationType: 'activity_spike',
      severity,
      confidence: 0.75,
      description: `${entity.label || entity.id} activity spiked ${activityMultiplier.toFixed(1)}x`,
      riskNarrative: 'Sudden activity increase may precede significant market moves',
      suggestedAction: 'Watch for directional bias in their transactions.',
      metrics: {
        previousValue: previous.activityLevel,
        currentValue: current.activityLevel,
        changePercent: (activityMultiplier - 1) * 100,
        changeRate: activityMultiplier,
      },
      relatedEntities: [],
    });
  }

  /**
   * Detect risk escalation
   */
  private detectRiskEscalation(
    entity: EntityProfile,
    previous: EntitySnapshot,
    current: EntitySnapshot
  ): EscalationAlert | null {
    const riskIncrease = current.riskScore - previous.riskScore;
    
    if (riskIncrease < this.config.riskEscalationThreshold) {
      return null;
    }
    
    const severity = this.calculateSeverity(riskIncrease, [15, 30, 50]);
    
    return this.createAlert({
      entityId: entity.id,
      entityType: entity.type,
      entityLabel: entity.label,
      escalationType: 'risk_escalation',
      severity,
      confidence: 0.85,
      description: `${entity.label || entity.id} risk score increased by ${riskIncrease.toFixed(0)} points`,
      riskNarrative: 'Entity becoming more dangerous. Their actions may have larger market impact.',
      suggestedAction: 'Increase monitoring. Consider reducing exposure to correlated positions.',
      metrics: {
        previousValue: previous.riskScore,
        currentValue: current.riskScore,
        changePercent: (riskIncrease / Math.max(previous.riskScore, 1)) * 100,
        changeRate: riskIncrease,
      },
      relatedEntities: [],
    });
  }

  /**
   * Detect mood shift
   */
  private detectMoodShift(
    entity: EntityProfile,
    previous: EntitySnapshot,
    current: EntitySnapshot
  ): EscalationAlert | null {
    if (previous.mood === current.mood) {
      return null;
    }
    
    // Check cooldown
    const lastMoodAlert = this.lastMoodAlerts.get(entity.id);
    if (lastMoodAlert && Date.now() - lastMoodAlert < this.config.moodShiftCooldownMs) {
      return null;
    }
    
    // Determine severity based on mood transition
    const severity = this.getMoodShiftSeverity(previous.mood, current.mood);
    
    if (severity === 'low') {
      return null;  // Skip minor mood shifts
    }
    
    this.lastMoodAlerts.set(entity.id, Date.now());
    
    return this.createAlert({
      entityId: entity.id,
      entityType: entity.type,
      entityLabel: entity.label,
      escalationType: 'mood_shift',
      severity,
      confidence: 0.7,
      description: `${entity.label || entity.id} mood shifted: ${previous.mood} -> ${current.mood}`,
      riskNarrative: this.getMoodShiftNarrative(previous.mood, current.mood),
      suggestedAction: this.getMoodShiftAction(current.mood),
      metrics: {
        previousValue: this.moodToNumber(previous.mood),
        currentValue: this.moodToNumber(current.mood),
        changePercent: 0,
        changeRate: 0,
      },
      relatedEntities: [],
    });
  }

  /**
   * Detect dangerous patterns in entity behavior
   */
  private detectDangerousPatterns(entity: EntityProfile): EscalationAlert[] {
    const alerts: EscalationAlert[] = [];
    
    // Cross-chain activity
    const crossChainAlert = this.detectCrossChainActivity(entity);
    if (crossChainAlert) alerts.push(crossChainAlert);
    
    // Shadow movements
    const shadowAlert = this.detectShadowMovements(entity);
    if (shadowAlert) alerts.push(shadowAlert);
    
    // Position concentration
    const concentrationAlert = this.detectPositionConcentration(entity);
    if (concentrationAlert) alerts.push(concentrationAlert);
    
    return alerts;
  }

  /**
   * Detect cross-chain activity
   */
  private detectCrossChainActivity(entity: EntityProfile): EscalationAlert | null {
    const chains = new Set<string>();
    
    for (const tx of entity.recentTransactions) {
      if (tx.chain) {
        chains.add(tx.chain);
      }
    }
    
    if (chains.size < this.config.crossChainThreshold) {
      return null;
    }
    
    // Check if already alerted recently
    const alertKey = `cross_chain_${entity.id}`;
    if (this.activeAlerts.has(alertKey)) {
      return null;
    }
    
    const severity = chains.size >= 5 ? 'high' : 'medium';
    
    return this.createAlert({
      entityId: entity.id,
      entityType: entity.type,
      entityLabel: entity.label,
      escalationType: 'cross_chain_movement',
      severity,
      confidence: 0.8,
      description: `${entity.label || entity.id} active across ${chains.size} chains`,
      riskNarrative: 'Cross-chain activity may indicate complex arbitrage or fund movement',
      suggestedAction: 'Track movements across chains. May be preparing for large action.',
      metrics: {
        previousValue: 0,
        currentValue: chains.size,
        changePercent: 0,
        changeRate: 0,
      },
      relatedEntities: [],
    });
  }

  /**
   * Detect shadow movements (transfers to unknown addresses)
   */
  private detectShadowMovements(entity: EntityProfile): EscalationAlert | null {
    const shadowTransfers = entity.recentTransactions.filter(tx =>
      (tx.type === 'transfer_out') && !tx.counterparty
    );
    
    if (shadowTransfers.length < 3) {
      return null;
    }
    
    const shadowVolume = shadowTransfers.reduce((sum, tx) => sum + tx.valueUSD, 0);
    const totalVolume = entity.recentTransactions.reduce((sum, tx) => sum + tx.valueUSD, 0);
    const shadowRatio = shadowVolume / Math.max(totalVolume, 1);
    
    if (shadowRatio < 0.3) {
      return null;
    }
    
    // Check if already alerted recently
    const alertKey = `shadow_${entity.id}`;
    if (this.activeAlerts.has(alertKey)) {
      return null;
    }
    
    const severity = shadowRatio > 0.6 ? 'high' : 'medium';
    
    return this.createAlert({
      entityId: entity.id,
      entityType: entity.type,
      entityLabel: entity.label,
      escalationType: 'shadow_movement',
      severity,
      confidence: 0.65,
      description: `${entity.label || entity.id} moving ${(shadowRatio * 100).toFixed(0)}% of funds to unknown addresses`,
      riskNarrative: 'Shadow movements may indicate preparation for large market action or exit',
      suggestedAction: 'Entity may be obscuring their intentions. Exercise caution.',
      metrics: {
        previousValue: 0,
        currentValue: shadowVolume,
        changePercent: shadowRatio * 100,
        changeRate: 0,
      },
      relatedEntities: [],
    });
  }

  /**
   * Detect position concentration
   */
  private detectPositionConcentration(entity: EntityProfile): EscalationAlert | null {
    if (entity.positions.length === 0) {
      return null;
    }
    
    // Find largest position
    const largestPosition = entity.positions.reduce((max, p) =>
      p.valueUSD > max.valueUSD ? p : max
    );
    
    const concentrationRatio = largestPosition.valueUSD / entity.totalValueUSD;
    
    if (concentrationRatio < 0.7) {
      return null;
    }
    
    // Check if already alerted recently
    const alertKey = `concentration_${entity.id}`;
    if (this.activeAlerts.has(alertKey)) {
      return null;
    }
    
    const severity = concentrationRatio > 0.9 ? 'high' : 'medium';
    
    return this.createAlert({
      entityId: entity.id,
      entityType: entity.type,
      entityLabel: entity.label,
      escalationType: 'position_concentration',
      severity,
      confidence: 0.75,
      description: `${entity.label || entity.id} has ${(concentrationRatio * 100).toFixed(0)}% concentrated in ${largestPosition.asset}`,
      riskNarrative: 'High concentration means their actions will heavily impact this asset',
      suggestedAction: `Monitor ${largestPosition.asset} for potential large moves.`,
      metrics: {
        previousValue: 0,
        currentValue: concentrationRatio * 100,
        changePercent: 0,
        changeRate: 0,
      },
      relatedEntities: [],
    });
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  private createSnapshot(entity: EntityProfile): EntitySnapshot {
    return {
      entityId: entity.id,
      timestamp: Date.now(),
      riskScore: entity.riskScore,
      mood: entity.mood,
      totalValueUSD: entity.totalValueUSD,
      activityLevel: entity.activityLevel,
      positionCount: entity.positions.length,
      netFlow24h: this.calculateNetFlow24h(entity),
    };
  }

  private calculateNetFlow24h(entity: EntityProfile): number {
    const oneDayAgo = Date.now() - 86400000;
    
    return entity.recentTransactions
      .filter(tx => tx.timestamp > oneDayAgo)
      .reduce((sum, tx) => {
        if (tx.type === 'buy' || tx.type === 'transfer_in') {
          return sum + tx.valueUSD;
        } else {
          return sum - tx.valueUSD;
        }
      }, 0);
  }

  private createAlert(params: {
    entityId: string;
    entityType: EntityType;
    entityLabel?: string;
    escalationType: EscalationType;
    severity: EscalationSeverity;
    confidence: number;
    description: string;
    riskNarrative: string;
    suggestedAction: string;
    metrics: {
      previousValue: number;
      currentValue: number;
      changePercent: number;
      changeRate: number;
    };
    relatedEntities: string[];
  }): EscalationAlert {
    this.alertCounter++;
    const now = Date.now();
    
    return {
      id: `escalation_${now}_${this.alertCounter}`,
      entityId: params.entityId,
      entityType: params.entityType,
      entityLabel: params.entityLabel,
      escalationType: params.escalationType,
      severity: params.severity,
      confidence: params.confidence,
      description: params.description,
      riskNarrative: params.riskNarrative,
      suggestedAction: params.suggestedAction,
      metrics: params.metrics,
      relatedEntities: params.relatedEntities,
      timestamp: now,
      expiresAt: now + this.config.alertTTLMs,
    };
  }

  private calculateSeverity(value: number, thresholds: [number, number, number]): EscalationSeverity {
    if (value >= thresholds[2]) return 'critical';
    if (value >= thresholds[1]) return 'high';
    if (value >= thresholds[0]) return 'medium';
    return 'low';
  }

  private getMoodShiftSeverity(from: EntityMood, to: EntityMood): EscalationSeverity {
    const dangerousShifts: Array<[EntityMood, EntityMood]> = [
      ['accumulating', 'distributing'],
      ['neutral', 'aggressive'],
      ['dormant', 'aggressive'],
      ['defensive', 'aggressive'],
    ];
    
    const highShifts: Array<[EntityMood, EntityMood]> = [
      ['accumulating', 'aggressive'],
      ['neutral', 'distributing'],
      ['dormant', 'distributing'],
    ];
    
    for (const shift of dangerousShifts) {
      if (from === shift[0] && to === shift[1]) return 'critical';
    }
    
    for (const shift of highShifts) {
      if (from === shift[0] && to === shift[1]) return 'high';
    }
    
    return 'medium';
  }

  private getMoodShiftNarrative(from: EntityMood, to: EntityMood): string {
    const narratives: Record<string, string> = {
      'accumulating_distributing': 'Entity reversed from buying to selling. May indicate profit-taking or loss of conviction.',
      'neutral_aggressive': 'Entity became aggressive. Expect larger, more impactful trades.',
      'dormant_aggressive': 'Previously inactive entity now aggressive. May have new information.',
      'accumulating_aggressive': 'Accumulator turned aggressive. May be preparing for major move.',
      'neutral_distributing': 'Entity started distributing. Potential selling pressure ahead.',
      'dormant_distributing': 'Dormant entity woke up to sell. May indicate concern.',
    };
    
    const key = `${from}_${to}`;
    return narratives[key] || `Entity behavior changed from ${from} to ${to}`;
  }

  private getMoodShiftAction(mood: EntityMood): string {
    const actions: Record<EntityMood, string> = {
      'accumulating': 'Monitor for potential price support.',
      'distributing': 'Watch for selling pressure. Consider reducing exposure.',
      'neutral': 'Entity is waiting. Monitor for directional bias.',
      'aggressive': 'Expect volatility. Use tighter stops.',
      'defensive': 'Entity is protecting positions. May indicate uncertainty.',
      'dormant': 'Entity inactive. No immediate action needed.',
    };
    
    return actions[mood];
  }

  private moodToNumber(mood: EntityMood): number {
    const values: Record<EntityMood, number> = {
      'distributing': -2,
      'defensive': -1,
      'dormant': 0,
      'neutral': 0,
      'accumulating': 1,
      'aggressive': 2,
    };
    return values[mood];
  }

  private getLatestSnapshot(entityId: string): EntitySnapshot | null {
    const snapshots = this.entitySnapshots.get(entityId);
    if (!snapshots || snapshots.length === 0) {
      return null;
    }
    return snapshots[snapshots.length - 1];
  }

  private addSnapshot(entityId: string, snapshot: EntitySnapshot): void {
    let snapshots = this.entitySnapshots.get(entityId);
    if (!snapshots) {
      snapshots = [];
      this.entitySnapshots.set(entityId, snapshots);
    }
    
    snapshots.push(snapshot);
    
    // Keep only recent snapshots (last hour)
    const oneHourAgo = Date.now() - 3600000;
    while (snapshots.length > 0 && snapshots[0].timestamp < oneHourAgo) {
      snapshots.shift();
    }
  }

  private addAlert(alert: EscalationAlert): void {
    // Use type + entity as key to prevent duplicates
    const key = `${alert.escalationType}_${alert.entityId}`;
    
    // Check if similar alert exists
    const existing = this.activeAlerts.get(key);
    if (existing && Date.now() - existing.timestamp < 60000) {
      // Update if new alert is more severe
      if (this.severityRank(alert.severity) > this.severityRank(existing.severity)) {
        this.activeAlerts.set(key, alert);
      }
      return;
    }
    
    this.activeAlerts.set(key, alert);
    this.alertHistory.push(alert);
    
    // Trim history
    if (this.alertHistory.length > this.config.maxAlertsStored) {
      this.alertHistory.shift();
    }
    
    // Update stats
    this.stats.totalAlertsGenerated++;
    this.stats.alertsByType[alert.escalationType]++;
    this.stats.alertsBySeverity[alert.severity]++;
  }

  private severityRank(severity: EscalationSeverity): number {
    const ranks = { low: 1, medium: 2, high: 3, critical: 4 };
    return ranks[severity];
  }

  private cleanupExpiredAlerts(): void {
    const now = Date.now();
    const entries = Array.from(this.activeAlerts.entries());
    for (const [key, alert] of entries) {
      if (alert.expiresAt < now) {
        this.activeAlerts.delete(key);
      }
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get all active escalation alerts
   */
  getActiveAlerts(): EscalationAlert[] {
    this.cleanupExpiredAlerts();
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get alerts by entity
   */
  getAlertsByEntity(entityId: string): EscalationAlert[] {
    return this.getActiveAlerts().filter(a => a.entityId === entityId);
  }

  /**
   * Get alerts by type
   */
  getAlertsByType(type: EscalationType): EscalationAlert[] {
    return this.getActiveAlerts().filter(a => a.escalationType === type);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: EscalationSeverity): EscalationAlert[] {
    return this.getActiveAlerts().filter(a => a.severity === severity);
  }

  /**
   * Get critical alerts
   */
  getCriticalAlerts(): EscalationAlert[] {
    return this.getAlertsBySeverity('critical');
  }

  /**
   * Get high priority alerts (high + critical)
   */
  getHighPriorityAlerts(): EscalationAlert[] {
    return this.getActiveAlerts().filter(a =>
      a.severity === 'high' || a.severity === 'critical'
    );
  }

  /**
   * Get dangerous entities
   */
  getDangerousEntities(): string[] {
    const alerts = this.getHighPriorityAlerts();
    const entities = new Set<string>();
    for (const alert of alerts) {
      entities.add(alert.entityId);
    }
    return Array.from(entities);
  }

  /**
   * Get entity snapshots
   */
  getEntitySnapshots(entityId: string): EntitySnapshot[] {
    return this.entitySnapshots.get(entityId) || [];
  }

  /**
   * Get alert history
   */
  getHistory(limit?: number): EscalationAlert[] {
    if (limit) {
      return this.alertHistory.slice(-limit);
    }
    return [...this.alertHistory];
  }

  /**
   * Check if entity is escalating
   */
  isEntityEscalating(entityId: string): boolean {
    return this.getAlertsByEntity(entityId).length > 0;
  }

  /**
   * Check if any critical escalations
   */
  hasCriticalEscalations(): boolean {
    return this.getCriticalAlerts().length > 0;
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
  getConfig(): EscalationTrackerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<EscalationTrackerConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.activeAlerts.clear();
    this.log('Active alerts cleared');
  }

  /**
   * Reset tracker
   */
  reset(): void {
    this.entitySnapshots.clear();
    this.activeAlerts.clear();
    this.alertHistory = [];
    this.lastMoodAlerts.clear();
    this.alertCounter = 0;
    this.stats = {
      totalAlertsGenerated: 0,
      alertsByType: {} as Record<EscalationType, number>,
      alertsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      entitiesTracked: 0,
      dangerousEntities: 0,
      lastTrackingTime: 0,
    };
    this.initializeStats();
    this.log('Tracker reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let trackerInstance: EntityEscalationTrackerImpl | null = null;

/**
 * Get the singleton EntityEscalationTracker instance
 */
export function getEntityEscalationTracker(config?: Partial<EscalationTrackerConfig>): EntityEscalationTrackerImpl {
  if (!trackerInstance) {
    trackerInstance = new EntityEscalationTrackerImpl(config);
  }
  return trackerInstance;
}

/**
 * Create a new EntityEscalationTracker with custom config
 */
export function createEntityEscalationTracker(config?: Partial<EscalationTrackerConfig>): EntityEscalationTrackerImpl {
  return new EntityEscalationTrackerImpl(config);
}
