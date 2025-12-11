/**
 * Phase 7: Autonomous Market Watchdog
 * MODULE 2 - AnomalyDetectionEngine.ts
 * 
 * Detects anomalies across all intelligence engines:
 * - Whale Intel
 * - Hydra signals
 * - EcoScan volatility spikes
 * - Liquidity displacement
 * - Constellation cluster movements
 * - Entity Explorer risk jumps
 * - Risk Engine sharp changes
 * 
 * Each anomaly returns severity, confidence, type, explanation,
 * suggested action, trigger metric, and impact radius.
 * 
 * This module is 100% isolated and additive - no modifications to existing code.
 */

// ============================================================
// Types and Interfaces
// ============================================================

export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

export type AnomalyType = 
  | 'whale_surge'
  | 'whale_exodus'
  | 'hydra_spike'
  | 'hydra_divergence'
  | 'volatility_explosion'
  | 'volatility_collapse'
  | 'liquidity_vacuum'
  | 'liquidity_flood'
  | 'cluster_convergence'
  | 'cluster_breakout'
  | 'entity_risk_spike'
  | 'entity_behavior_shift'
  | 'risk_acceleration'
  | 'correlation_breakdown'
  | 'market_structure_shift'
  | 'unknown';

export type AnomalySource = 
  | 'whale_intel'
  | 'hydra'
  | 'ecoscan'
  | 'liquidity'
  | 'constellation'
  | 'entity_explorer'
  | 'risk_engine';

export interface Anomaly {
  id: string;
  type: AnomalyType;
  source: AnomalySource;
  severity: AnomalySeverity;
  confidence: number;  // 0-1
  explanation: string;
  suggestedAction: string;
  triggerMetric: string;
  triggerValue: number;
  baselineValue: number;
  deviationPercent: number;
  impactRadius: 'local' | 'sector' | 'market-wide';
  affectedEntities: string[];
  timestamp: number;
  expiresAt: number;
}

export interface WhaleIntelSnapshot {
  netFlow: number;
  largeTransactionCount: number;
  accumulationScore: number;
  distributionScore: number;
  activeWhaleCount: number;
  topWhales: string[];
}

export interface HydraSnapshot {
  headCount: number;
  signalStrength: number;
  divergenceScore: number;
  convergenceScore: number;
  activeHeads: string[];
}

export interface EcoScanSnapshot {
  volatilityIndex: number;
  volatilityTrend: 'increasing' | 'decreasing' | 'stable';
  sectorVolatility: Record<string, number>;
  extremeMovers: string[];
}

export interface LiquiditySnapshot {
  totalDepth: number;
  bidAskRatio: number;
  spreadPercent: number;
  thinZoneCount: number;
  displacementScore: number;
}

export interface ConstellationSnapshot {
  clusterCount: number;
  tightnessScore: number;
  movementVelocity: number;
  breakoutSignals: number;
  activeClusterIds: string[];
}

export interface EntityExplorerSnapshot {
  averageRiskScore: number;
  highRiskEntityCount: number;
  riskAcceleration: number;
  behaviorShiftCount: number;
  flaggedEntities: string[];
}

export interface RiskEngineSnapshot {
  overallRisk: number;
  riskDelta: number;
  componentRisks: Record<string, number>;
  correlationScore: number;
}

export interface AnomalyDetectionInputs {
  whaleIntel?: WhaleIntelSnapshot;
  hydra?: HydraSnapshot;
  ecoscan?: EcoScanSnapshot;
  liquidity?: LiquiditySnapshot;
  constellation?: ConstellationSnapshot;
  entityExplorer?: EntityExplorerSnapshot;
  riskEngine?: RiskEngineSnapshot;
}

export interface AnomalyThresholds {
  whaleNetFlowDeviation: number;
  hydraSignalSpike: number;
  volatilitySpike: number;
  liquidityDropPercent: number;
  clusterMovementVelocity: number;
  entityRiskJump: number;
  riskAcceleration: number;
}

export interface AnomalyDetectionConfig {
  thresholds: AnomalyThresholds;
  anomalyTTLMs: number;
  maxAnomaliesStored: number;
  minConfidence: number;
  enableLogging: boolean;
  logPrefix: string;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: AnomalyDetectionConfig = {
  thresholds: {
    whaleNetFlowDeviation: 50,  // % deviation from baseline
    hydraSignalSpike: 30,       // % increase in signal strength
    volatilitySpike: 40,        // % increase in volatility
    liquidityDropPercent: 25,   // % drop in liquidity
    clusterMovementVelocity: 2, // Standard deviations
    entityRiskJump: 20,         // Points increase
    riskAcceleration: 15,       // Points per minute
  },
  anomalyTTLMs: 300000,  // 5 minutes
  maxAnomaliesStored: 100,
  minConfidence: 0.6,
  enableLogging: true,
  logPrefix: '[AnomalyDetectionEngine]',
};

// ============================================================
// Baseline Tracking
// ============================================================

interface BaselineData {
  whaleNetFlow: number[];
  hydraSignalStrength: number[];
  volatilityIndex: number[];
  liquidityDepth: number[];
  clusterVelocity: number[];
  entityRiskScore: number[];
  overallRisk: number[];
}

// ============================================================
// AnomalyDetectionEngine Implementation
// ============================================================

class AnomalyDetectionEngineImpl {
  private config: AnomalyDetectionConfig;
  private activeAnomalies: Map<string, Anomaly> = new Map();
  private anomalyHistory: Anomaly[] = [];
  private baselines: BaselineData = {
    whaleNetFlow: [],
    hydraSignalStrength: [],
    volatilityIndex: [],
    liquidityDepth: [],
    clusterVelocity: [],
    entityRiskScore: [],
    overallRisk: [],
  };
  private anomalyCounter = 0;
  
  private stats = {
    totalAnomaliesDetected: 0,
    anomaliesBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
    anomaliesBySource: {} as Record<AnomalySource, number>,
    lastDetectionTime: 0,
  };

  constructor(config?: Partial<AnomalyDetectionConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeStats();
    this.log('AnomalyDetectionEngine initialized');
  }

  private initializeStats(): void {
    const sources: AnomalySource[] = [
      'whale_intel', 'hydra', 'ecoscan', 'liquidity',
      'constellation', 'entity_explorer', 'risk_engine'
    ];
    for (const source of sources) {
      this.stats.anomaliesBySource[source] = 0;
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
  // Main Detection
  // ============================================================

  /**
   * Detect anomalies across all inputs
   */
  detect(inputs: AnomalyDetectionInputs): Anomaly[] {
    const detectedAnomalies: Anomaly[] = [];
    const now = Date.now();
    
    // Clean up expired anomalies
    this.cleanupExpiredAnomalies();
    
    // Update baselines
    this.updateBaselines(inputs);
    
    // Detect anomalies from each source
    if (inputs.whaleIntel) {
      detectedAnomalies.push(...this.detectWhaleAnomalies(inputs.whaleIntel));
    }
    
    if (inputs.hydra) {
      detectedAnomalies.push(...this.detectHydraAnomalies(inputs.hydra));
    }
    
    if (inputs.ecoscan) {
      detectedAnomalies.push(...this.detectEcoScanAnomalies(inputs.ecoscan));
    }
    
    if (inputs.liquidity) {
      detectedAnomalies.push(...this.detectLiquidityAnomalies(inputs.liquidity));
    }
    
    if (inputs.constellation) {
      detectedAnomalies.push(...this.detectConstellationAnomalies(inputs.constellation));
    }
    
    if (inputs.entityExplorer) {
      detectedAnomalies.push(...this.detectEntityAnomalies(inputs.entityExplorer));
    }
    
    if (inputs.riskEngine) {
      detectedAnomalies.push(...this.detectRiskAnomalies(inputs.riskEngine));
    }
    
    // Filter by confidence and add to active anomalies
    const validAnomalies = detectedAnomalies.filter(a => a.confidence >= this.config.minConfidence);
    
    for (const anomaly of validAnomalies) {
      this.addAnomaly(anomaly);
    }
    
    this.stats.lastDetectionTime = now;
    
    if (validAnomalies.length > 0) {
      this.log(`Detected ${validAnomalies.length} anomalies`);
    }
    
    return validAnomalies;
  }

  // ============================================================
  // Source-Specific Detection
  // ============================================================

  private detectWhaleAnomalies(whale: WhaleIntelSnapshot): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const baseline = this.getBaseline('whaleNetFlow');
    
    // Whale surge detection
    if (whale.netFlow > 0 && this.isSignificantDeviation(whale.netFlow, baseline, this.config.thresholds.whaleNetFlowDeviation)) {
      anomalies.push(this.createAnomaly({
        type: 'whale_surge',
        source: 'whale_intel',
        severity: this.calculateSeverity(whale.netFlow, baseline, [50, 100, 200]),
        confidence: this.calculateConfidence(whale.netFlow, baseline),
        explanation: `Significant whale inflow detected: ${whale.netFlow.toFixed(0)} units above baseline`,
        suggestedAction: 'Monitor for potential price impact. Consider reducing short exposure.',
        triggerMetric: 'whale_net_flow',
        triggerValue: whale.netFlow,
        baselineValue: baseline,
        impactRadius: whale.netFlow > baseline * 3 ? 'market-wide' : 'sector',
        affectedEntities: whale.topWhales,
      }));
    }
    
    // Whale exodus detection
    if (whale.netFlow < 0 && this.isSignificantDeviation(Math.abs(whale.netFlow), baseline, this.config.thresholds.whaleNetFlowDeviation)) {
      anomalies.push(this.createAnomaly({
        type: 'whale_exodus',
        source: 'whale_intel',
        severity: this.calculateSeverity(Math.abs(whale.netFlow), baseline, [50, 100, 200]),
        confidence: this.calculateConfidence(Math.abs(whale.netFlow), baseline),
        explanation: `Significant whale outflow detected: ${Math.abs(whale.netFlow).toFixed(0)} units below baseline`,
        suggestedAction: 'Potential selling pressure incoming. Consider reducing long exposure.',
        triggerMetric: 'whale_net_flow',
        triggerValue: whale.netFlow,
        baselineValue: baseline,
        impactRadius: Math.abs(whale.netFlow) > baseline * 3 ? 'market-wide' : 'sector',
        affectedEntities: whale.topWhales,
      }));
    }
    
    // Large transaction spike
    if (whale.largeTransactionCount > 10) {
      anomalies.push(this.createAnomaly({
        type: 'whale_surge',
        source: 'whale_intel',
        severity: whale.largeTransactionCount > 20 ? 'high' : 'medium',
        confidence: 0.8,
        explanation: `Unusual large transaction activity: ${whale.largeTransactionCount} large transactions detected`,
        suggestedAction: 'High whale activity may indicate imminent price movement.',
        triggerMetric: 'large_transaction_count',
        triggerValue: whale.largeTransactionCount,
        baselineValue: 5,
        impactRadius: 'sector',
        affectedEntities: whale.topWhales,
      }));
    }
    
    return anomalies;
  }

  private detectHydraAnomalies(hydra: HydraSnapshot): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const baseline = this.getBaseline('hydraSignalStrength');
    
    // Signal spike detection
    if (this.isSignificantDeviation(hydra.signalStrength, baseline, this.config.thresholds.hydraSignalSpike)) {
      anomalies.push(this.createAnomaly({
        type: 'hydra_spike',
        source: 'hydra',
        severity: this.calculateSeverity(hydra.signalStrength, baseline, [30, 50, 80]),
        confidence: this.calculateConfidence(hydra.signalStrength, baseline),
        explanation: `Hydra signal strength spiked to ${hydra.signalStrength.toFixed(1)}, ${((hydra.signalStrength / baseline - 1) * 100).toFixed(0)}% above baseline`,
        suggestedAction: 'Multiple coordinated signals detected. Increased market activity likely.',
        triggerMetric: 'hydra_signal_strength',
        triggerValue: hydra.signalStrength,
        baselineValue: baseline,
        impactRadius: hydra.headCount > 5 ? 'market-wide' : 'sector',
        affectedEntities: hydra.activeHeads,
      }));
    }
    
    // Divergence detection
    if (hydra.divergenceScore > hydra.convergenceScore + 30) {
      anomalies.push(this.createAnomaly({
        type: 'hydra_divergence',
        source: 'hydra',
        severity: hydra.divergenceScore > 70 ? 'high' : 'medium',
        confidence: 0.75,
        explanation: `Hydra heads showing significant divergence (score: ${hydra.divergenceScore.toFixed(0)})`,
        suggestedAction: 'Market signals are conflicting. Exercise caution with directional bets.',
        triggerMetric: 'hydra_divergence_score',
        triggerValue: hydra.divergenceScore,
        baselineValue: 50,
        impactRadius: 'sector',
        affectedEntities: hydra.activeHeads,
      }));
    }
    
    return anomalies;
  }

  private detectEcoScanAnomalies(ecoscan: EcoScanSnapshot): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const baseline = this.getBaseline('volatilityIndex');
    
    // Volatility explosion
    if (this.isSignificantDeviation(ecoscan.volatilityIndex, baseline, this.config.thresholds.volatilitySpike)) {
      anomalies.push(this.createAnomaly({
        type: 'volatility_explosion',
        source: 'ecoscan',
        severity: this.calculateSeverity(ecoscan.volatilityIndex, baseline, [40, 70, 100]),
        confidence: this.calculateConfidence(ecoscan.volatilityIndex, baseline),
        explanation: `Volatility index spiked to ${ecoscan.volatilityIndex.toFixed(1)}, trend: ${ecoscan.volatilityTrend}`,
        suggestedAction: 'High volatility environment. Consider reducing position sizes or hedging.',
        triggerMetric: 'volatility_index',
        triggerValue: ecoscan.volatilityIndex,
        baselineValue: baseline,
        impactRadius: ecoscan.volatilityIndex > 80 ? 'market-wide' : 'sector',
        affectedEntities: ecoscan.extremeMovers,
      }));
    }
    
    // Volatility collapse (can also be anomalous)
    if (ecoscan.volatilityIndex < baseline * 0.5 && baseline > 30) {
      anomalies.push(this.createAnomaly({
        type: 'volatility_collapse',
        source: 'ecoscan',
        severity: 'medium',
        confidence: 0.7,
        explanation: `Unusual volatility compression: ${ecoscan.volatilityIndex.toFixed(1)} (${((1 - ecoscan.volatilityIndex / baseline) * 100).toFixed(0)}% below baseline)`,
        suggestedAction: 'Low volatility often precedes significant moves. Stay alert.',
        triggerMetric: 'volatility_index',
        triggerValue: ecoscan.volatilityIndex,
        baselineValue: baseline,
        impactRadius: 'sector',
        affectedEntities: [],
      }));
    }
    
    return anomalies;
  }

  private detectLiquidityAnomalies(liquidity: LiquiditySnapshot): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const baseline = this.getBaseline('liquidityDepth');
    
    // Liquidity vacuum
    if (liquidity.totalDepth < baseline * (1 - this.config.thresholds.liquidityDropPercent / 100)) {
      anomalies.push(this.createAnomaly({
        type: 'liquidity_vacuum',
        source: 'liquidity',
        severity: this.calculateSeverity(baseline - liquidity.totalDepth, baseline * 0.25, [25, 50, 75]),
        confidence: 0.85,
        explanation: `Liquidity dropped ${((1 - liquidity.totalDepth / baseline) * 100).toFixed(0)}% below baseline. ${liquidity.thinZoneCount} thin zones detected.`,
        suggestedAction: 'Reduced liquidity increases slippage risk. Use limit orders.',
        triggerMetric: 'liquidity_depth',
        triggerValue: liquidity.totalDepth,
        baselineValue: baseline,
        impactRadius: liquidity.thinZoneCount > 5 ? 'market-wide' : 'local',
        affectedEntities: [],
      }));
    }
    
    // Liquidity flood (unusual increase)
    if (liquidity.totalDepth > baseline * 2) {
      anomalies.push(this.createAnomaly({
        type: 'liquidity_flood',
        source: 'liquidity',
        severity: 'medium',
        confidence: 0.7,
        explanation: `Unusual liquidity surge: ${((liquidity.totalDepth / baseline - 1) * 100).toFixed(0)}% above baseline`,
        suggestedAction: 'Large liquidity injection may indicate institutional activity.',
        triggerMetric: 'liquidity_depth',
        triggerValue: liquidity.totalDepth,
        baselineValue: baseline,
        impactRadius: 'sector',
        affectedEntities: [],
      }));
    }
    
    // High displacement
    if (liquidity.displacementScore > 70) {
      anomalies.push(this.createAnomaly({
        type: 'liquidity_vacuum',
        source: 'liquidity',
        severity: liquidity.displacementScore > 85 ? 'high' : 'medium',
        confidence: 0.8,
        explanation: `High liquidity displacement detected (score: ${liquidity.displacementScore.toFixed(0)})`,
        suggestedAction: 'Order book structure is unstable. Expect increased volatility.',
        triggerMetric: 'displacement_score',
        triggerValue: liquidity.displacementScore,
        baselineValue: 50,
        impactRadius: 'sector',
        affectedEntities: [],
      }));
    }
    
    return anomalies;
  }

  private detectConstellationAnomalies(constellation: ConstellationSnapshot): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const baseline = this.getBaseline('clusterVelocity');
    
    // Cluster convergence
    if (constellation.tightnessScore > 80) {
      anomalies.push(this.createAnomaly({
        type: 'cluster_convergence',
        source: 'constellation',
        severity: constellation.tightnessScore > 90 ? 'high' : 'medium',
        confidence: 0.75,
        explanation: `Cluster convergence detected: tightness score ${constellation.tightnessScore.toFixed(0)}`,
        suggestedAction: 'Multiple entities converging may indicate coordinated action.',
        triggerMetric: 'cluster_tightness',
        triggerValue: constellation.tightnessScore,
        baselineValue: 50,
        impactRadius: 'sector',
        affectedEntities: constellation.activeClusterIds,
      }));
    }
    
    // Cluster breakout
    if (constellation.breakoutSignals > 3) {
      anomalies.push(this.createAnomaly({
        type: 'cluster_breakout',
        source: 'constellation',
        severity: constellation.breakoutSignals > 5 ? 'high' : 'medium',
        confidence: 0.8,
        explanation: `${constellation.breakoutSignals} cluster breakout signals detected`,
        suggestedAction: 'Cluster breakouts often precede significant price movements.',
        triggerMetric: 'breakout_signals',
        triggerValue: constellation.breakoutSignals,
        baselineValue: 1,
        impactRadius: constellation.breakoutSignals > 5 ? 'market-wide' : 'sector',
        affectedEntities: constellation.activeClusterIds,
      }));
    }
    
    // High velocity movement
    if (this.isSignificantDeviation(constellation.movementVelocity, baseline, this.config.thresholds.clusterMovementVelocity * 100)) {
      anomalies.push(this.createAnomaly({
        type: 'cluster_breakout',
        source: 'constellation',
        severity: 'medium',
        confidence: 0.7,
        explanation: `Unusual cluster movement velocity: ${constellation.movementVelocity.toFixed(2)}`,
        suggestedAction: 'Rapid cluster movements suggest market structure changes.',
        triggerMetric: 'movement_velocity',
        triggerValue: constellation.movementVelocity,
        baselineValue: baseline,
        impactRadius: 'sector',
        affectedEntities: constellation.activeClusterIds,
      }));
    }
    
    return anomalies;
  }

  private detectEntityAnomalies(entity: EntityExplorerSnapshot): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const baseline = this.getBaseline('entityRiskScore');
    
    // Risk spike
    if (entity.averageRiskScore > baseline + this.config.thresholds.entityRiskJump) {
      anomalies.push(this.createAnomaly({
        type: 'entity_risk_spike',
        source: 'entity_explorer',
        severity: this.calculateSeverity(entity.averageRiskScore - baseline, this.config.thresholds.entityRiskJump, [20, 35, 50]),
        confidence: 0.8,
        explanation: `Entity risk spiked ${(entity.averageRiskScore - baseline).toFixed(0)} points above baseline`,
        suggestedAction: 'Elevated entity risk. Review flagged entities for exposure.',
        triggerMetric: 'average_risk_score',
        triggerValue: entity.averageRiskScore,
        baselineValue: baseline,
        impactRadius: entity.highRiskEntityCount > 10 ? 'market-wide' : 'sector',
        affectedEntities: entity.flaggedEntities,
      }));
    }
    
    // Behavior shift
    if (entity.behaviorShiftCount > 5) {
      anomalies.push(this.createAnomaly({
        type: 'entity_behavior_shift',
        source: 'entity_explorer',
        severity: entity.behaviorShiftCount > 10 ? 'high' : 'medium',
        confidence: 0.75,
        explanation: `${entity.behaviorShiftCount} entities showing behavior shifts`,
        suggestedAction: 'Multiple behavior changes may indicate market regime shift.',
        triggerMetric: 'behavior_shift_count',
        triggerValue: entity.behaviorShiftCount,
        baselineValue: 2,
        impactRadius: 'sector',
        affectedEntities: entity.flaggedEntities,
      }));
    }
    
    // Risk acceleration
    if (entity.riskAcceleration > this.config.thresholds.riskAcceleration) {
      anomalies.push(this.createAnomaly({
        type: 'risk_acceleration',
        source: 'entity_explorer',
        severity: entity.riskAcceleration > 25 ? 'critical' : 'high',
        confidence: 0.85,
        explanation: `Entity risk accelerating at ${entity.riskAcceleration.toFixed(1)} points/min`,
        suggestedAction: 'Rapidly increasing risk. Consider immediate risk reduction.',
        triggerMetric: 'risk_acceleration',
        triggerValue: entity.riskAcceleration,
        baselineValue: 5,
        impactRadius: 'market-wide',
        affectedEntities: entity.flaggedEntities,
      }));
    }
    
    return anomalies;
  }

  private detectRiskAnomalies(risk: RiskEngineSnapshot): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const baseline = this.getBaseline('overallRisk');
    
    // Risk acceleration
    if (risk.riskDelta > this.config.thresholds.riskAcceleration) {
      anomalies.push(this.createAnomaly({
        type: 'risk_acceleration',
        source: 'risk_engine',
        severity: risk.riskDelta > 25 ? 'critical' : 'high',
        confidence: 0.9,
        explanation: `Overall risk accelerating: +${risk.riskDelta.toFixed(1)} points`,
        suggestedAction: 'Risk is increasing rapidly. Review all positions.',
        triggerMetric: 'risk_delta',
        triggerValue: risk.riskDelta,
        baselineValue: 5,
        impactRadius: 'market-wide',
        affectedEntities: [],
      }));
    }
    
    // Correlation breakdown
    if (risk.correlationScore < 30) {
      anomalies.push(this.createAnomaly({
        type: 'correlation_breakdown',
        source: 'risk_engine',
        severity: risk.correlationScore < 15 ? 'high' : 'medium',
        confidence: 0.8,
        explanation: `Correlation breakdown detected (score: ${risk.correlationScore.toFixed(0)})`,
        suggestedAction: 'Normal correlations are breaking down. Diversification may not protect.',
        triggerMetric: 'correlation_score',
        triggerValue: risk.correlationScore,
        baselineValue: 60,
        impactRadius: 'market-wide',
        affectedEntities: [],
      }));
    }
    
    // Market structure shift
    const componentValues = Object.values(risk.componentRisks);
    const maxComponent = Math.max(...componentValues);
    const minComponent = Math.min(...componentValues);
    if (maxComponent - minComponent > 50) {
      anomalies.push(this.createAnomaly({
        type: 'market_structure_shift',
        source: 'risk_engine',
        severity: 'medium',
        confidence: 0.7,
        explanation: `Risk components highly divergent (spread: ${(maxComponent - minComponent).toFixed(0)})`,
        suggestedAction: 'Market structure is unbalanced. Monitor for regime change.',
        triggerMetric: 'component_spread',
        triggerValue: maxComponent - minComponent,
        baselineValue: 30,
        impactRadius: 'sector',
        affectedEntities: [],
      }));
    }
    
    return anomalies;
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  private createAnomaly(params: {
    type: AnomalyType;
    source: AnomalySource;
    severity: AnomalySeverity;
    confidence: number;
    explanation: string;
    suggestedAction: string;
    triggerMetric: string;
    triggerValue: number;
    baselineValue: number;
    impactRadius: 'local' | 'sector' | 'market-wide';
    affectedEntities: string[];
  }): Anomaly {
    this.anomalyCounter++;
    const now = Date.now();
    
    return {
      id: `anomaly_${now}_${this.anomalyCounter}`,
      type: params.type,
      source: params.source,
      severity: params.severity,
      confidence: params.confidence,
      explanation: params.explanation,
      suggestedAction: params.suggestedAction,
      triggerMetric: params.triggerMetric,
      triggerValue: params.triggerValue,
      baselineValue: params.baselineValue,
      deviationPercent: params.baselineValue > 0 
        ? ((params.triggerValue - params.baselineValue) / params.baselineValue) * 100 
        : 0,
      impactRadius: params.impactRadius,
      affectedEntities: params.affectedEntities,
      timestamp: now,
      expiresAt: now + this.config.anomalyTTLMs,
    };
  }

  private isSignificantDeviation(value: number, baseline: number, thresholdPercent: number): boolean {
    if (baseline === 0) return value > 0;
    const deviation = Math.abs((value - baseline) / baseline) * 100;
    return deviation > thresholdPercent;
  }

  private calculateSeverity(value: number, baseline: number, thresholds: [number, number, number]): AnomalySeverity {
    const deviation = baseline > 0 ? Math.abs((value - baseline) / baseline) * 100 : value;
    
    if (deviation >= thresholds[2]) return 'critical';
    if (deviation >= thresholds[1]) return 'high';
    if (deviation >= thresholds[0]) return 'medium';
    return 'low';
  }

  private calculateConfidence(value: number, baseline: number): number {
    if (baseline === 0) return 0.7;
    const deviation = Math.abs((value - baseline) / baseline);
    // Higher deviation = higher confidence (up to a point)
    return Math.min(0.5 + deviation * 0.3, 0.95);
  }

  private getBaseline(metric: keyof BaselineData): number {
    const data = this.baselines[metric];
    if (data.length === 0) return 50;  // Default baseline
    return data.reduce((sum, v) => sum + v, 0) / data.length;
  }

  private updateBaselines(inputs: AnomalyDetectionInputs): void {
    const maxBaselineSize = 50;
    
    if (inputs.whaleIntel) {
      this.baselines.whaleNetFlow.push(Math.abs(inputs.whaleIntel.netFlow));
      if (this.baselines.whaleNetFlow.length > maxBaselineSize) {
        this.baselines.whaleNetFlow.shift();
      }
    }
    
    if (inputs.hydra) {
      this.baselines.hydraSignalStrength.push(inputs.hydra.signalStrength);
      if (this.baselines.hydraSignalStrength.length > maxBaselineSize) {
        this.baselines.hydraSignalStrength.shift();
      }
    }
    
    if (inputs.ecoscan) {
      this.baselines.volatilityIndex.push(inputs.ecoscan.volatilityIndex);
      if (this.baselines.volatilityIndex.length > maxBaselineSize) {
        this.baselines.volatilityIndex.shift();
      }
    }
    
    if (inputs.liquidity) {
      this.baselines.liquidityDepth.push(inputs.liquidity.totalDepth);
      if (this.baselines.liquidityDepth.length > maxBaselineSize) {
        this.baselines.liquidityDepth.shift();
      }
    }
    
    if (inputs.constellation) {
      this.baselines.clusterVelocity.push(inputs.constellation.movementVelocity);
      if (this.baselines.clusterVelocity.length > maxBaselineSize) {
        this.baselines.clusterVelocity.shift();
      }
    }
    
    if (inputs.entityExplorer) {
      this.baselines.entityRiskScore.push(inputs.entityExplorer.averageRiskScore);
      if (this.baselines.entityRiskScore.length > maxBaselineSize) {
        this.baselines.entityRiskScore.shift();
      }
    }
    
    if (inputs.riskEngine) {
      this.baselines.overallRisk.push(inputs.riskEngine.overallRisk);
      if (this.baselines.overallRisk.length > maxBaselineSize) {
        this.baselines.overallRisk.shift();
      }
    }
  }

  private addAnomaly(anomaly: Anomaly): void {
    // Check for duplicate (same type and source within short time)
    const existingKey = `${anomaly.type}_${anomaly.source}`;
    const existing = this.activeAnomalies.get(existingKey);
    
    if (existing && Date.now() - existing.timestamp < 60000) {
      // Update existing anomaly if new one is more severe
      if (this.severityRank(anomaly.severity) > this.severityRank(existing.severity)) {
        this.activeAnomalies.set(existingKey, anomaly);
      }
      return;
    }
    
    this.activeAnomalies.set(existingKey, anomaly);
    this.anomalyHistory.push(anomaly);
    
    // Trim history
    if (this.anomalyHistory.length > this.config.maxAnomaliesStored) {
      this.anomalyHistory.shift();
    }
    
    // Update stats
    this.stats.totalAnomaliesDetected++;
    this.stats.anomaliesBySeverity[anomaly.severity]++;
    this.stats.anomaliesBySource[anomaly.source]++;
  }

  private severityRank(severity: AnomalySeverity): number {
    const ranks = { low: 1, medium: 2, high: 3, critical: 4 };
    return ranks[severity];
  }

  private cleanupExpiredAnomalies(): void {
    const now = Date.now();
    const entries = Array.from(this.activeAnomalies.entries());
    for (const [key, anomaly] of entries) {
      if (anomaly.expiresAt < now) {
        this.activeAnomalies.delete(key);
      }
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get all active anomalies
   */
  getActiveAnomalies(): Anomaly[] {
    this.cleanupExpiredAnomalies();
    return Array.from(this.activeAnomalies.values());
  }

  /**
   * Get anomalies by severity
   */
  getAnomaliesBySeverity(severity: AnomalySeverity): Anomaly[] {
    return this.getActiveAnomalies().filter(a => a.severity === severity);
  }

  /**
   * Get anomalies by source
   */
  getAnomaliesBySource(source: AnomalySource): Anomaly[] {
    return this.getActiveAnomalies().filter(a => a.source === source);
  }

  /**
   * Get critical anomalies
   */
  getCriticalAnomalies(): Anomaly[] {
    return this.getAnomaliesBySeverity('critical');
  }

  /**
   * Get high priority anomalies (high + critical)
   */
  getHighPriorityAnomalies(): Anomaly[] {
    return this.getActiveAnomalies().filter(a => 
      a.severity === 'high' || a.severity === 'critical'
    );
  }

  /**
   * Get anomaly history
   */
  getHistory(limit?: number): Anomaly[] {
    if (limit) {
      return this.anomalyHistory.slice(-limit);
    }
    return [...this.anomalyHistory];
  }

  /**
   * Check if any critical anomalies are active
   */
  hasCriticalAnomalies(): boolean {
    return this.getCriticalAnomalies().length > 0;
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
  getConfig(): AnomalyDetectionConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AnomalyDetectionConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Clear all anomalies
   */
  clearAnomalies(): void {
    this.activeAnomalies.clear();
    this.log('Active anomalies cleared');
  }

  /**
   * Reset engine
   */
  reset(): void {
    this.activeAnomalies.clear();
    this.anomalyHistory = [];
    this.baselines = {
      whaleNetFlow: [],
      hydraSignalStrength: [],
      volatilityIndex: [],
      liquidityDepth: [],
      clusterVelocity: [],
      entityRiskScore: [],
      overallRisk: [],
    };
    this.anomalyCounter = 0;
    this.stats = {
      totalAnomaliesDetected: 0,
      anomaliesBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      anomaliesBySource: {} as Record<AnomalySource, number>,
      lastDetectionTime: 0,
    };
    this.initializeStats();
    this.log('Engine reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let engineInstance: AnomalyDetectionEngineImpl | null = null;

/**
 * Get the singleton AnomalyDetectionEngine instance
 */
export function getAnomalyDetectionEngine(config?: Partial<AnomalyDetectionConfig>): AnomalyDetectionEngineImpl {
  if (!engineInstance) {
    engineInstance = new AnomalyDetectionEngineImpl(config);
  }
  return engineInstance;
}

/**
 * Create a new AnomalyDetectionEngine with custom config
 */
export function createAnomalyDetectionEngine(config?: Partial<AnomalyDetectionConfig>): AnomalyDetectionEngineImpl {
  return new AnomalyDetectionEngineImpl(config);
}
