/**
 * PredictiveRiskEngine.ts
 * 
 * Phase 6: Ultra-Deep Foresight Engine - MODULE 5
 * 
 * Produces predictive risk grading:
 * - Risk Level (0-100)
 * - Confidence
 * - Contributing entities
 * - Risk curve over next 1-3 hours
 * - Whale-based pressure analysis
 * - Liquidity fragility
 * - Manipulation risk
 * 
 * This is a purely additive, 100% isolated module.
 * Logging prefix: [PredictiveRisk]
 */

import {
  type PredictiveSignal,
  type PredictiveInputs,
  type ContributingFactor,
  type WhaleIntelInput,
  type LiquidityInput,
} from './PredictiveSignalEngine';

// ============================================================
// Types
// ============================================================

export type RiskCategory = 
  | 'whale_pressure'
  | 'liquidity_fragility'
  | 'manipulation'
  | 'volatility'
  | 'entity_concentration'
  | 'market_structure'
  | 'correlation_breakdown';

export interface RiskComponent {
  category: RiskCategory;
  score: number; // 0-100
  weight: number; // 0-1
  confidence: number; // 0-1
  description: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  contributingFactors: string[];
}

export interface RiskCurvePoint {
  timeOffsetMinutes: number;
  projectedRisk: number;
  confidence: number;
  keyDrivers: string[];
}

export interface WhalePressureAnalysis {
  overallPressure: number; // -100 to 100 (negative = selling, positive = buying)
  pressureDirection: 'buying' | 'selling' | 'neutral';
  pressureIntensity: 'low' | 'moderate' | 'high' | 'extreme';
  velocityTrend: 'accelerating' | 'decelerating' | 'stable';
  accumulationScore: number;
  distributionScore: number;
  netFlowImpact: number;
  largeTransactionRisk: number;
  confidence: number;
}

export interface LiquidityFragilityAnalysis {
  fragilityScore: number; // 0-100
  fragilityLevel: 'stable' | 'moderate' | 'fragile' | 'critical';
  depthImbalance: number;
  slippageRisk: number;
  displacementRate: number;
  bidAskHealth: number;
  recoveryCapacity: number;
  confidence: number;
}

export interface ManipulationRiskAnalysis {
  overallRisk: number; // 0-100
  riskLevel: 'low' | 'moderate' | 'elevated' | 'high' | 'critical';
  detectedPatterns: string[];
  suspiciousEntities: string[];
  washTradingScore: number;
  spoofingScore: number;
  coordinatedActivityScore: number;
  confidence: number;
}

export interface PredictiveRiskGrade {
  id: string;
  generatedAt: number;
  
  // Overall risk
  overallRiskLevel: number; // 0-100
  riskGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  riskLabel: string;
  overallConfidence: number;
  
  // Component breakdown
  components: RiskComponent[];
  
  // Risk curve projection
  riskCurve: RiskCurvePoint[];
  projectedPeakRisk: number;
  projectedPeakTime: number; // minutes from now
  
  // Specialized analyses
  whalePressure: WhalePressureAnalysis;
  liquidityFragility: LiquidityFragilityAnalysis;
  manipulationRisk: ManipulationRiskAnalysis;
  
  // Contributing entities
  topRiskEntities: RiskEntity[];
  
  // Recommendations
  riskMitigationSuggestions: string[];
  
  // Source
  sourceSignalId: string | null;
  expiresAt: number;
}

export interface RiskEntity {
  id: string;
  name: string;
  type: 'whale' | 'exchange' | 'protocol' | 'cluster' | 'unknown';
  riskContribution: number; // 0-100
  riskType: RiskCategory;
  description: string;
}

export interface RiskEngineConfig {
  enableLogging: boolean;
  logPrefix: string;
  riskTTLMs: number;
  curveProjectionHours: number;
  curveResolutionMinutes: number;
  
  // Component weights
  weights: {
    whale_pressure: number;
    liquidity_fragility: number;
    manipulation: number;
    volatility: number;
    entity_concentration: number;
    market_structure: number;
    correlation_breakdown: number;
  };
  
  // Thresholds
  thresholds: {
    criticalRisk: number;
    highRisk: number;
    elevatedRisk: number;
    moderateRisk: number;
  };
}

const DEFAULT_CONFIG: RiskEngineConfig = {
  enableLogging: true,
  logPrefix: '[PredictiveRisk]',
  riskTTLMs: 180000, // 3 minutes
  curveProjectionHours: 3,
  curveResolutionMinutes: 15,
  
  weights: {
    whale_pressure: 0.20,
    liquidity_fragility: 0.18,
    manipulation: 0.20,
    volatility: 0.15,
    entity_concentration: 0.10,
    market_structure: 0.10,
    correlation_breakdown: 0.07,
  },
  
  thresholds: {
    criticalRisk: 85,
    highRisk: 70,
    elevatedRisk: 50,
    moderateRisk: 30,
  },
};

// ============================================================
// Predictive Risk Engine Implementation
// ============================================================

class PredictiveRiskEngineImpl {
  private config: RiskEngineConfig;
  private gradeHistory: PredictiveRiskGrade[] = [];
  private gradeCounter: number = 0;
  
  private stats = {
    totalGradesGenerated: 0,
    averageRiskLevel: 50,
    criticalAlerts: 0,
    highRiskAlerts: 0,
    riskDistribution: {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0,
    },
  };

  constructor(config?: Partial<RiskEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.log('PredictiveRiskEngine initialized');
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
  // Main Risk Grading
  // ============================================================

  /**
   * Generate a predictive risk grade from a signal
   */
  generateRiskGrade(signal: PredictiveSignal, inputs?: PredictiveInputs): PredictiveRiskGrade {
    const gradeId = `riskgrade_${Date.now()}_${++this.gradeCounter}`;
    const now = Date.now();

    // Calculate all risk components
    const components = this.calculateRiskComponents(signal, inputs);

    // Calculate overall risk
    const { overallRiskLevel, overallConfidence } = this.calculateOverallRisk(components);

    // Determine grade
    const riskGrade = this.determineGrade(overallRiskLevel);
    const riskLabel = this.getRiskLabel(overallRiskLevel);

    // Generate risk curve
    const riskCurve = this.generateRiskCurve(signal, components);
    const { projectedPeakRisk, projectedPeakTime } = this.findPeakRisk(riskCurve);

    // Specialized analyses
    const whalePressure = this.analyzeWhalePressure(signal, inputs?.whaleIntel || null);
    const liquidityFragility = this.analyzeLiquidityFragility(signal, inputs?.liquidity || null);
    const manipulationRisk = this.analyzeManipulationRisk(signal);

    // Get top risk entities
    const topRiskEntities = this.extractTopRiskEntities(signal, components);

    // Generate recommendations
    const riskMitigationSuggestions = this.generateMitigationSuggestions(
      overallRiskLevel,
      components,
      whalePressure,
      liquidityFragility,
      manipulationRisk
    );

    const grade: PredictiveRiskGrade = {
      id: gradeId,
      generatedAt: now,
      
      overallRiskLevel,
      riskGrade,
      riskLabel,
      overallConfidence,
      
      components,
      
      riskCurve,
      projectedPeakRisk,
      projectedPeakTime,
      
      whalePressure,
      liquidityFragility,
      manipulationRisk,
      
      topRiskEntities,
      
      riskMitigationSuggestions,
      
      sourceSignalId: signal.id,
      expiresAt: now + this.config.riskTTLMs,
    };

    // Store in history
    this.addToHistory(grade);
    
    // Update stats
    this.updateStats(grade);

    this.log(`Risk grade generated: ${gradeId}`, {
      level: overallRiskLevel,
      grade: riskGrade,
      confidence: overallConfidence.toFixed(2),
    });

    return grade;
  }

  // ============================================================
  // Risk Component Calculation
  // ============================================================

  private calculateRiskComponents(
    signal: PredictiveSignal,
    inputs?: PredictiveInputs
  ): RiskComponent[] {
    const components: RiskComponent[] = [];

    // Whale pressure component
    components.push(this.calculateWhalePressureComponent(signal, inputs?.whaleIntel || null));

    // Liquidity fragility component
    components.push(this.calculateLiquidityComponent(signal, inputs?.liquidity || null));

    // Manipulation component
    components.push(this.calculateManipulationComponent(signal));

    // Volatility component
    components.push(this.calculateVolatilityComponent(signal));

    // Entity concentration component
    components.push(this.calculateEntityConcentrationComponent(signal, inputs?.entityRisk || null));

    // Market structure component
    components.push(this.calculateMarketStructureComponent(signal, inputs?.constellation || null));

    // Correlation breakdown component
    components.push(this.calculateCorrelationComponent(signal));

    return components;
  }

  private calculateWhalePressureComponent(
    signal: PredictiveSignal,
    whaleInput: WhaleIntelInput | null
  ): RiskComponent {
    let score = 30; // Base score
    const contributingFactors: string[] = [];

    // From signal factors
    const whaleFactors = signal.contributingFactors.filter(f => f.source === 'whale');
    for (const factor of whaleFactors) {
      if (factor.impact < -20) {
        score += Math.abs(factor.impact) * 0.5;
        contributingFactors.push(factor.description);
      }
    }

    // From whale input
    if (whaleInput) {
      // High velocity change is risky
      if (Math.abs(whaleInput.velocityChange) > 30) {
        score += 15;
        contributingFactors.push(`Velocity change: ${whaleInput.velocityChange.toFixed(1)}%`);
      }

      // Large distribution is risky
      if (whaleInput.distributionRate > 40) {
        score += 20;
        contributingFactors.push(`High distribution: ${whaleInput.distributionRate.toFixed(1)}%`);
      }

      // Large transactions
      if (whaleInput.largeTransactionCount > 20) {
        score += 10;
        contributingFactors.push(`${whaleInput.largeTransactionCount} large transactions`);
      }
    }

    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (whaleInput && whaleInput.velocityChange > 10) {
      trend = 'increasing';
    } else if (whaleInput && whaleInput.velocityChange < -10) {
      trend = 'decreasing';
    }

    return {
      category: 'whale_pressure',
      score: Math.min(100, Math.max(0, score)),
      weight: this.config.weights.whale_pressure,
      confidence: whaleInput ? 0.8 : 0.5,
      description: 'Risk from whale activity and large holder movements',
      trend,
      contributingFactors: contributingFactors.slice(0, 5),
    };
  }

  private calculateLiquidityComponent(
    signal: PredictiveSignal,
    liquidityInput: LiquidityInput | null
  ): RiskComponent {
    let score = 25;
    const contributingFactors: string[] = [];

    // From signal factors
    const liqFactors = signal.contributingFactors.filter(f => f.source === 'liquidity');
    for (const factor of liqFactors) {
      if (factor.impact < -15) {
        score += Math.abs(factor.impact) * 0.6;
        contributingFactors.push(factor.description);
      }
    }

    // From liquidity input
    if (liquidityInput) {
      // High fragility
      if (liquidityInput.fragility > 0.5) {
        score += liquidityInput.fragility * 40;
        contributingFactors.push(`Fragility: ${(liquidityInput.fragility * 100).toFixed(0)}%`);
      }

      // High slippage risk
      if (liquidityInput.slippageRisk > 0.4) {
        score += liquidityInput.slippageRisk * 30;
        contributingFactors.push(`Slippage risk: ${(liquidityInput.slippageRisk * 100).toFixed(0)}%`);
      }

      // Depth imbalance
      if (liquidityInput.depthImbalance > 0.3) {
        score += liquidityInput.depthImbalance * 25;
        contributingFactors.push(`Depth imbalance: ${(liquidityInput.depthImbalance * 100).toFixed(0)}%`);
      }
    }

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (liquidityInput && liquidityInput.displacementRate > 0.05) {
      trend = 'increasing';
    }

    return {
      category: 'liquidity_fragility',
      score: Math.min(100, Math.max(0, score)),
      weight: this.config.weights.liquidity_fragility,
      confidence: liquidityInput ? 0.75 : 0.4,
      description: 'Risk from thin liquidity and market depth issues',
      trend,
      contributingFactors: contributingFactors.slice(0, 5),
    };
  }

  private calculateManipulationComponent(signal: PredictiveSignal): RiskComponent {
    const score = signal.manipulationLikelihood;
    const contributingFactors: string[] = [];

    if (signal.manipulationType) {
      contributingFactors.push(`Pattern: ${signal.manipulationType.replace(/_/g, ' ')}`);
    }

    if (signal.manipulationLikelihood > 50) {
      contributingFactors.push(`Likelihood: ${signal.manipulationLikelihood.toFixed(0)}%`);
    }

    // Check hydra factors
    const hydraFactors = signal.contributingFactors.filter(f => f.source === 'hydra');
    for (const factor of hydraFactors) {
      contributingFactors.push(factor.description);
    }

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (signal.manipulationLikelihood > 60) {
      trend = 'increasing';
    }

    return {
      category: 'manipulation',
      score: Math.min(100, Math.max(0, score)),
      weight: this.config.weights.manipulation,
      confidence: signal.manipulationConfidence,
      description: 'Risk from market manipulation and artificial price action',
      trend,
      contributingFactors: contributingFactors.slice(0, 5),
    };
  }

  private calculateVolatilityComponent(signal: PredictiveSignal): RiskComponent {
    // Map market temperature to volatility risk
    let score = signal.marketTemperature;
    const contributingFactors: string[] = [];

    contributingFactors.push(`Market temperature: ${signal.marketTemperature}`);

    if (signal.temperatureTrend === 'heating') {
      score += 10;
      contributingFactors.push('Temperature rising');
    }

    // High signal strength with high temperature = more volatility risk
    if (signal.signalStrength > 70 && signal.marketTemperature > 60) {
      score += 15;
      contributingFactors.push('High signal strength in volatile conditions');
    }

    return {
      category: 'volatility',
      score: Math.min(100, Math.max(0, score)),
      weight: this.config.weights.volatility,
      confidence: signal.dataQuality,
      description: 'Risk from market volatility and rapid price movements',
      trend: signal.temperatureTrend === 'heating' ? 'increasing' : 
             signal.temperatureTrend === 'cooling' ? 'decreasing' : 'stable',
      contributingFactors: contributingFactors.slice(0, 5),
    };
  }

  private calculateEntityConcentrationComponent(
    signal: PredictiveSignal,
    entityInput: { riskConcentration?: number; highRiskEntityCount?: number } | null
  ): RiskComponent {
    let score = 20;
    const contributingFactors: string[] = [];

    // From entity factors
    const entityFactors = signal.contributingFactors.filter(f => f.source === 'entity');
    for (const factor of entityFactors) {
      if (factor.impact < -10) {
        score += Math.abs(factor.impact) * 0.5;
        contributingFactors.push(factor.description);
      }
    }

    if (entityInput) {
      if (entityInput.riskConcentration && entityInput.riskConcentration > 0.4) {
        score += entityInput.riskConcentration * 40;
        contributingFactors.push(`Risk concentration: ${(entityInput.riskConcentration * 100).toFixed(0)}%`);
      }

      if (entityInput.highRiskEntityCount && entityInput.highRiskEntityCount > 10) {
        score += Math.min(30, entityInput.highRiskEntityCount * 2);
        contributingFactors.push(`${entityInput.highRiskEntityCount} high-risk entities`);
      }
    }

    return {
      category: 'entity_concentration',
      score: Math.min(100, Math.max(0, score)),
      weight: this.config.weights.entity_concentration,
      confidence: entityInput ? 0.7 : 0.4,
      description: 'Risk from concentrated holdings and high-risk entities',
      trend: 'stable',
      contributingFactors: contributingFactors.slice(0, 5),
    };
  }

  private calculateMarketStructureComponent(
    signal: PredictiveSignal,
    constellationInput: { anomalyScore?: number; clusterTightness?: number } | null
  ): RiskComponent {
    let score = 25;
    const contributingFactors: string[] = [];

    // From constellation factors
    const constFactors = signal.contributingFactors.filter(f => f.source === 'constellation');
    for (const factor of constFactors) {
      if (factor.impact < -10) {
        score += Math.abs(factor.impact) * 0.4;
        contributingFactors.push(factor.description);
      }
    }

    if (constellationInput) {
      if (constellationInput.anomalyScore && constellationInput.anomalyScore > 0.5) {
        score += constellationInput.anomalyScore * 30;
        contributingFactors.push(`Anomaly score: ${(constellationInput.anomalyScore * 100).toFixed(0)}%`);
      }
    }

    return {
      category: 'market_structure',
      score: Math.min(100, Math.max(0, score)),
      weight: this.config.weights.market_structure,
      confidence: constellationInput ? 0.65 : 0.4,
      description: 'Risk from market structure anomalies and cluster patterns',
      trend: 'stable',
      contributingFactors: contributingFactors.slice(0, 5),
    };
  }

  private calculateCorrelationComponent(signal: PredictiveSignal): RiskComponent {
    // Estimate correlation breakdown risk from signal characteristics
    let score = 20;
    const contributingFactors: string[] = [];

    // High manipulation + high volatility suggests correlation breakdown
    if (signal.manipulationLikelihood > 50 && signal.marketTemperature > 60) {
      score += 25;
      contributingFactors.push('High manipulation in volatile conditions');
    }

    // Mixed signals suggest correlation issues
    const positiveFactors = signal.contributingFactors.filter(f => f.impact > 0).length;
    const negativeFactors = signal.contributingFactors.filter(f => f.impact < 0).length;
    if (positiveFactors > 0 && negativeFactors > 0) {
      const mixRatio = Math.min(positiveFactors, negativeFactors) / 
                       Math.max(positiveFactors, negativeFactors);
      if (mixRatio > 0.5) {
        score += 20;
        contributingFactors.push('Mixed signal directions');
      }
    }

    return {
      category: 'correlation_breakdown',
      score: Math.min(100, Math.max(0, score)),
      weight: this.config.weights.correlation_breakdown,
      confidence: 0.5,
      description: 'Risk from breakdown in normal market correlations',
      trend: 'stable',
      contributingFactors: contributingFactors.slice(0, 5),
    };
  }

  // ============================================================
  // Overall Risk Calculation
  // ============================================================

  private calculateOverallRisk(components: RiskComponent[]): {
    overallRiskLevel: number;
    overallConfidence: number;
  } {
    let weightedSum = 0;
    let totalWeight = 0;
    let confidenceSum = 0;

    for (const component of components) {
      weightedSum += component.score * component.weight;
      totalWeight += component.weight;
      confidenceSum += component.confidence * component.weight;
    }

    const overallRiskLevel = totalWeight > 0 ? weightedSum / totalWeight : 50;
    const overallConfidence = totalWeight > 0 ? confidenceSum / totalWeight : 0.5;

    return {
      overallRiskLevel: Math.round(overallRiskLevel),
      overallConfidence,
    };
  }

  private determineGrade(riskLevel: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (riskLevel < this.config.thresholds.moderateRisk) return 'A';
    if (riskLevel < this.config.thresholds.elevatedRisk) return 'B';
    if (riskLevel < this.config.thresholds.highRisk) return 'C';
    if (riskLevel < this.config.thresholds.criticalRisk) return 'D';
    return 'F';
  }

  private getRiskLabel(riskLevel: number): string {
    if (riskLevel < this.config.thresholds.moderateRisk) return 'Low Risk';
    if (riskLevel < this.config.thresholds.elevatedRisk) return 'Moderate Risk';
    if (riskLevel < this.config.thresholds.highRisk) return 'Elevated Risk';
    if (riskLevel < this.config.thresholds.criticalRisk) return 'High Risk';
    return 'Critical Risk';
  }

  // ============================================================
  // Risk Curve Generation
  // ============================================================

  private generateRiskCurve(signal: PredictiveSignal, components: RiskComponent[]): RiskCurvePoint[] {
    const curve: RiskCurvePoint[] = [];
    const totalMinutes = this.config.curveProjectionHours * 60;
    const resolution = this.config.curveResolutionMinutes;

    // Calculate base risk
    const { overallRiskLevel } = this.calculateOverallRisk(components);

    // Generate curve points
    for (let minutes = 0; minutes <= totalMinutes; minutes += resolution) {
      const point = this.projectRiskAtTime(minutes, overallRiskLevel, signal, components);
      curve.push(point);
    }

    return curve;
  }

  private projectRiskAtTime(
    minutes: number,
    baseRisk: number,
    signal: PredictiveSignal,
    components: RiskComponent[]
  ): RiskCurvePoint {
    let projectedRisk = baseRisk;
    const keyDrivers: string[] = [];

    // Apply time decay/growth based on trends
    for (const component of components) {
      if (component.trend === 'increasing') {
        // Risk grows over time
        const growth = component.score * 0.1 * (minutes / 60);
        projectedRisk += growth * component.weight;
        if (growth > 5) {
          keyDrivers.push(`${component.category} increasing`);
        }
      } else if (component.trend === 'decreasing') {
        // Risk decreases over time
        const decay = component.score * 0.08 * (minutes / 60);
        projectedRisk -= decay * component.weight;
        if (decay > 5) {
          keyDrivers.push(`${component.category} decreasing`);
        }
      }
    }

    // Apply temperature trend
    if (signal.temperatureTrend === 'heating') {
      projectedRisk += minutes * 0.05;
    } else if (signal.temperatureTrend === 'cooling') {
      projectedRisk -= minutes * 0.03;
    }

    // Confidence decreases over time
    const confidenceDecay = Math.pow(0.98, minutes / 15);

    return {
      timeOffsetMinutes: minutes,
      projectedRisk: Math.min(100, Math.max(0, Math.round(projectedRisk))),
      confidence: signal.predictiveConfidence * confidenceDecay,
      keyDrivers: keyDrivers.slice(0, 3),
    };
  }

  private findPeakRisk(curve: RiskCurvePoint[]): {
    projectedPeakRisk: number;
    projectedPeakTime: number;
  } {
    let peakRisk = 0;
    let peakTime = 0;

    for (const point of curve) {
      if (point.projectedRisk > peakRisk) {
        peakRisk = point.projectedRisk;
        peakTime = point.timeOffsetMinutes;
      }
    }

    return { projectedPeakRisk: peakRisk, projectedPeakTime: peakTime };
  }

  // ============================================================
  // Specialized Analyses
  // ============================================================

  private analyzeWhalePressure(
    signal: PredictiveSignal,
    whaleInput: WhaleIntelInput | null
  ): WhalePressureAnalysis {
    let overallPressure = 0;
    let accumulationScore = 0;
    let distributionScore = 0;
    let netFlowImpact = 0;
    let largeTransactionRisk = 0;

    if (whaleInput) {
      accumulationScore = whaleInput.accumulationRate;
      distributionScore = whaleInput.distributionRate;
      overallPressure = accumulationScore - distributionScore;
      netFlowImpact = whaleInput.netFlow > 0 ? 
        Math.min(100, whaleInput.netFlow / 100000) : 
        Math.max(-100, whaleInput.netFlow / 100000);
      largeTransactionRisk = Math.min(100, whaleInput.largeTransactionCount * 3);
    }

    // Determine direction
    let pressureDirection: 'buying' | 'selling' | 'neutral';
    if (overallPressure > 10) {
      pressureDirection = 'buying';
    } else if (overallPressure < -10) {
      pressureDirection = 'selling';
    } else {
      pressureDirection = 'neutral';
    }

    // Determine intensity
    let pressureIntensity: 'low' | 'moderate' | 'high' | 'extreme';
    const absPresure = Math.abs(overallPressure);
    if (absPresure < 20) {
      pressureIntensity = 'low';
    } else if (absPresure < 40) {
      pressureIntensity = 'moderate';
    } else if (absPresure < 70) {
      pressureIntensity = 'high';
    } else {
      pressureIntensity = 'extreme';
    }

    // Determine velocity trend
    let velocityTrend: 'accelerating' | 'decelerating' | 'stable' = 'stable';
    if (whaleInput && whaleInput.velocityChange > 15) {
      velocityTrend = 'accelerating';
    } else if (whaleInput && whaleInput.velocityChange < -15) {
      velocityTrend = 'decelerating';
    }

    return {
      overallPressure,
      pressureDirection,
      pressureIntensity,
      velocityTrend,
      accumulationScore,
      distributionScore,
      netFlowImpact,
      largeTransactionRisk,
      confidence: whaleInput ? 0.8 : 0.4,
    };
  }

  private analyzeLiquidityFragility(
    signal: PredictiveSignal,
    liquidityInput: LiquidityInput | null
  ): LiquidityFragilityAnalysis {
    let fragilityScore = 30;
    let depthImbalance = 0;
    let slippageRisk = 0;
    let displacementRate = 0;
    let bidAskHealth = 70;
    let recoveryCapacity = 70;

    if (liquidityInput) {
      fragilityScore = liquidityInput.fragility * 100;
      depthImbalance = liquidityInput.depthImbalance * 100;
      slippageRisk = liquidityInput.slippageRisk * 100;
      displacementRate = liquidityInput.displacementRate * 100;
      bidAskHealth = Math.max(0, 100 - liquidityInput.bidAskSpread * 1000);
      recoveryCapacity = Math.max(0, 100 - fragilityScore * 0.8);
    }

    // Determine fragility level
    let fragilityLevel: 'stable' | 'moderate' | 'fragile' | 'critical';
    if (fragilityScore < 25) {
      fragilityLevel = 'stable';
    } else if (fragilityScore < 50) {
      fragilityLevel = 'moderate';
    } else if (fragilityScore < 75) {
      fragilityLevel = 'fragile';
    } else {
      fragilityLevel = 'critical';
    }

    return {
      fragilityScore,
      fragilityLevel,
      depthImbalance,
      slippageRisk,
      displacementRate,
      bidAskHealth,
      recoveryCapacity,
      confidence: liquidityInput ? 0.75 : 0.4,
    };
  }

  private analyzeManipulationRisk(signal: PredictiveSignal): ManipulationRiskAnalysis {
    const overallRisk = signal.manipulationLikelihood;
    const detectedPatterns: string[] = [];
    const suspiciousEntities: string[] = [];

    if (signal.manipulationType) {
      detectedPatterns.push(signal.manipulationType.replace(/_/g, ' '));
    }

    // Extract suspicious entities from factors
    const hydraFactors = signal.contributingFactors.filter(f => f.source === 'hydra');
    for (const factor of hydraFactors) {
      if (factor.confidence > 0.6) {
        suspiciousEntities.push(factor.factor);
      }
    }

    // Estimate sub-scores
    let washTradingScore = 0;
    let spoofingScore = 0;
    let coordinatedActivityScore = 0;

    if (signal.manipulationType === 'wash_trading') {
      washTradingScore = overallRisk;
    } else if (signal.manipulationType === 'spoofing') {
      spoofingScore = overallRisk;
    } else if (signal.manipulationType === 'coordinated_trading') {
      coordinatedActivityScore = overallRisk;
    } else {
      // Distribute evenly
      washTradingScore = overallRisk * 0.3;
      spoofingScore = overallRisk * 0.3;
      coordinatedActivityScore = overallRisk * 0.4;
    }

    // Determine risk level
    let riskLevel: 'low' | 'moderate' | 'elevated' | 'high' | 'critical';
    if (overallRisk < 20) {
      riskLevel = 'low';
    } else if (overallRisk < 40) {
      riskLevel = 'moderate';
    } else if (overallRisk < 60) {
      riskLevel = 'elevated';
    } else if (overallRisk < 80) {
      riskLevel = 'high';
    } else {
      riskLevel = 'critical';
    }

    return {
      overallRisk,
      riskLevel,
      detectedPatterns,
      suspiciousEntities,
      washTradingScore,
      spoofingScore,
      coordinatedActivityScore,
      confidence: signal.manipulationConfidence,
    };
  }

  // ============================================================
  // Risk Entities Extraction
  // ============================================================

  private extractTopRiskEntities(
    signal: PredictiveSignal,
    components: RiskComponent[]
  ): RiskEntity[] {
    const entities: RiskEntity[] = [];

    // Extract from contributing factors
    for (const factor of signal.contributingFactors) {
      if (Math.abs(factor.impact) > 20) {
        entities.push({
          id: `entity_${factor.source}_${factor.factor}`,
          name: `${factor.source.charAt(0).toUpperCase() + factor.source.slice(1)} ${factor.factor}`,
          type: factor.source === 'whale' ? 'whale' : 
                factor.source === 'constellation' ? 'cluster' : 'unknown',
          riskContribution: Math.abs(factor.impact),
          riskType: this.mapSourceToRiskCategory(factor.source),
          description: factor.description,
        });
      }
    }

    // Sort by risk contribution
    return entities
      .sort((a, b) => b.riskContribution - a.riskContribution)
      .slice(0, 5);
  }

  private mapSourceToRiskCategory(source: string): RiskCategory {
    const mapping: Record<string, RiskCategory> = {
      whale: 'whale_pressure',
      liquidity: 'liquidity_fragility',
      hydra: 'manipulation',
      ecoscan: 'volatility',
      entity: 'entity_concentration',
      constellation: 'market_structure',
    };
    return mapping[source] || 'market_structure';
  }

  // ============================================================
  // Mitigation Suggestions
  // ============================================================

  private generateMitigationSuggestions(
    overallRisk: number,
    components: RiskComponent[],
    whalePressure: WhalePressureAnalysis,
    liquidityFragility: LiquidityFragilityAnalysis,
    manipulationRisk: ManipulationRiskAnalysis
  ): string[] {
    const suggestions: string[] = [];

    // Overall risk suggestions
    if (overallRisk > 70) {
      suggestions.push('Consider reducing position size due to elevated risk');
    }

    // Whale pressure suggestions
    if (whalePressure.pressureIntensity === 'extreme') {
      if (whalePressure.pressureDirection === 'selling') {
        suggestions.push('Extreme whale selling pressure detected - consider defensive positioning');
      } else {
        suggestions.push('Extreme whale buying pressure - potential for rapid price movement');
      }
    }

    // Liquidity suggestions
    if (liquidityFragility.fragilityLevel === 'critical' || liquidityFragility.fragilityLevel === 'fragile') {
      suggestions.push('Liquidity is fragile - use limit orders and expect slippage');
    }

    // Manipulation suggestions
    if (manipulationRisk.riskLevel === 'high' || manipulationRisk.riskLevel === 'critical') {
      suggestions.push('High manipulation risk - signals may be unreliable');
      suggestions.push('Consider waiting for clearer market conditions');
    }

    // Component-specific suggestions
    for (const component of components) {
      if (component.score > 70 && component.trend === 'increasing') {
        suggestions.push(`Monitor ${component.category.replace(/_/g, ' ')} - risk is increasing`);
      }
    }

    return suggestions.slice(0, 5);
  }

  // ============================================================
  // History Management
  // ============================================================

  private addToHistory(grade: PredictiveRiskGrade): void {
    this.gradeHistory.push(grade);
    
    if (this.gradeHistory.length > 50) {
      this.gradeHistory = this.gradeHistory.slice(-50);
    }
  }

  private updateStats(grade: PredictiveRiskGrade): void {
    this.stats.totalGradesGenerated++;
    
    // Update running average
    const n = this.stats.totalGradesGenerated;
    this.stats.averageRiskLevel = 
      (this.stats.averageRiskLevel * (n - 1) + grade.overallRiskLevel) / n;
    
    // Count alerts
    if (grade.overallRiskLevel >= this.config.thresholds.criticalRisk) {
      this.stats.criticalAlerts++;
    } else if (grade.overallRiskLevel >= this.config.thresholds.highRisk) {
      this.stats.highRiskAlerts++;
    }
    
    // Update grade distribution
    this.stats.riskDistribution[grade.riskGrade]++;
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get the latest risk grade
   */
  getLatestGrade(): PredictiveRiskGrade | null {
    if (this.gradeHistory.length === 0) return null;
    return this.gradeHistory[this.gradeHistory.length - 1];
  }

  /**
   * Get grade history
   */
  getHistory(limit?: number): PredictiveRiskGrade[] {
    if (limit) {
      return this.gradeHistory.slice(-limit);
    }
    return [...this.gradeHistory];
  }

  /**
   * Get current risk level
   */
  getCurrentRiskLevel(): number {
    const latest = this.getLatestGrade();
    return latest ? latest.overallRiskLevel : 50;
  }

  /**
   * Get risk trend
   */
  getRiskTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.gradeHistory.length < 3) return 'stable';

    const recent = this.gradeHistory.slice(-5);
    const first = recent[0].overallRiskLevel;
    const last = recent[recent.length - 1].overallRiskLevel;
    const diff = last - first;

    if (diff > 10) return 'increasing';
    if (diff < -10) return 'decreasing';
    return 'stable';
  }

  /**
   * Get engine statistics
   */
  getStats(): typeof this.stats & { historySize: number } {
    return {
      ...this.stats,
      historySize: this.gradeHistory.length,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): RiskEngineConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RiskEngineConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.gradeHistory = [];
    this.log('Grade history cleared');
  }

  /**
   * Reset engine state
   */
  reset(): void {
    this.gradeHistory = [];
    this.gradeCounter = 0;
    this.stats = {
      totalGradesGenerated: 0,
      averageRiskLevel: 50,
      criticalAlerts: 0,
      highRiskAlerts: 0,
      riskDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
    };
    this.log('Engine reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let instance: PredictiveRiskEngineImpl | null = null;

/**
 * Get the PredictiveRiskEngine singleton instance
 */
export function getPredictiveRiskEngine(): PredictiveRiskEngineImpl {
  if (!instance) {
    instance = new PredictiveRiskEngineImpl();
  }
  return instance;
}

/**
 * Create a new PredictiveRiskEngine with custom config
 */
export function createPredictiveRiskEngine(
  config?: Partial<RiskEngineConfig>
): PredictiveRiskEngineImpl {
  return new PredictiveRiskEngineImpl(config);
}
