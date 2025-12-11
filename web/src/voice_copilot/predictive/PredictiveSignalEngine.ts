/**
 * PredictiveSignalEngine.ts
 * 
 * Phase 6: Ultra-Deep Foresight Engine - MODULE 1
 * 
 * Generates predictive signals from multiple intelligence feeds:
 * - Whale Intel feed
 * - Liquidity displacement metrics
 * - Hydra event spikes
 * - EcoScan volatility
 * - Entity Explorer risk shifts
 * - Fusion Engine cluster movements (Constellation)
 * 
 * Outputs:
 * - Probability scores
 * - Upward/downward shift likelihood
 * - Manipulation likelihood
 * - Predictive confidence
 * - Market temperature metric (0-100)
 * 
 * This is a purely additive, 100% isolated module.
 * Logging prefix: [PredictiveSignal]
 */

// ============================================================
// Types
// ============================================================

export interface WhaleIntelInput {
  totalVolume: number;
  netFlow: number;
  accumulationRate: number;
  distributionRate: number;
  largeTransactionCount: number;
  averageTransactionSize: number;
  topWalletActivity: number;
  velocityChange: number;
}

export interface LiquidityInput {
  totalLiquidity: number;
  liquidityChange: number;
  displacementRate: number;
  fragility: number;
  depthImbalance: number;
  bidAskSpread: number;
  slippageRisk: number;
}

export interface HydraInput {
  eventCount: number;
  spikeIntensity: number;
  patternCount: number;
  divergenceScore: number;
  headCount: number;
  activityLevel: number;
}

export interface EcoScanInput {
  volatilityIndex: number;
  trendStrength: number;
  momentumScore: number;
  environmentalRisk: number;
  chainCongestion: number;
  gasVolatility: number;
}

export interface EntityRiskInput {
  averageRiskScore: number;
  highRiskEntityCount: number;
  riskShiftRate: number;
  newHighRiskEntities: number;
  riskConcentration: number;
}

export interface ConstellationInput {
  clusterCount: number;
  clusterTightness: number;
  expansionRate: number;
  centralityScore: number;
  connectionDensity: number;
  anomalyScore: number;
  movementVelocity: number;
}

export interface PredictiveInputs {
  whaleIntel: WhaleIntelInput | null;
  liquidity: LiquidityInput | null;
  hydra: HydraInput | null;
  ecoscan: EcoScanInput | null;
  entityRisk: EntityRiskInput | null;
  constellation: ConstellationInput | null;
  timestamp: number;
}

export interface PredictiveSignal {
  id: string;
  timestamp: number;
  
  // Probability scores
  upwardProbability: number;      // 0-1
  downwardProbability: number;    // 0-1
  sidewaysProbability: number;    // 0-1
  
  // Shift likelihood
  upwardShiftLikelihood: number;  // 0-100
  downwardShiftLikelihood: number; // 0-100
  
  // Manipulation analysis
  manipulationLikelihood: number; // 0-100
  manipulationConfidence: number; // 0-1
  manipulationType: ManipulationType | null;
  
  // Overall confidence
  predictiveConfidence: number;   // 0-1
  signalStrength: number;         // 0-100
  
  // Market temperature
  marketTemperature: number;      // 0-100
  temperatureTrend: 'heating' | 'cooling' | 'stable';
  
  // Contributing factors
  contributingFactors: ContributingFactor[];
  
  // Signal metadata
  dataQuality: number;            // 0-1
  inputsAvailable: number;        // count of non-null inputs
  expiresAt: number;
}

export type ManipulationType = 
  | 'pump_and_dump'
  | 'wash_trading'
  | 'spoofing'
  | 'layering'
  | 'front_running'
  | 'whale_manipulation'
  | 'coordinated_trading'
  | 'unknown';

export interface ContributingFactor {
  source: 'whale' | 'liquidity' | 'hydra' | 'ecoscan' | 'entity' | 'constellation';
  factor: string;
  impact: number;       // -100 to 100
  confidence: number;   // 0-1
  description: string;
}

export interface SignalEngineConfig {
  enableLogging: boolean;
  logPrefix: string;
  signalTTLMs: number;
  minDataQuality: number;
  minInputsRequired: number;
  
  // Weights for different inputs
  weights: {
    whale: number;
    liquidity: number;
    hydra: number;
    ecoscan: number;
    entity: number;
    constellation: number;
  };
  
  // Thresholds
  thresholds: {
    highManipulationRisk: number;
    significantShift: number;
    highTemperature: number;
    lowTemperature: number;
  };
}

const DEFAULT_CONFIG: SignalEngineConfig = {
  enableLogging: true,
  logPrefix: '[PredictiveSignal]',
  signalTTLMs: 60000, // 1 minute
  minDataQuality: 0.3,
  minInputsRequired: 2,
  
  weights: {
    whale: 0.25,
    liquidity: 0.20,
    hydra: 0.15,
    ecoscan: 0.15,
    entity: 0.10,
    constellation: 0.15,
  },
  
  thresholds: {
    highManipulationRisk: 70,
    significantShift: 60,
    highTemperature: 70,
    lowTemperature: 30,
  },
};

// ============================================================
// Signal Engine Implementation
// ============================================================

class PredictiveSignalEngineImpl {
  private config: SignalEngineConfig;
  private signalHistory: PredictiveSignal[] = [];
  private lastInputs: PredictiveInputs | null = null;
  private signalCounter: number = 0;
  
  private stats = {
    totalSignalsGenerated: 0,
    averageConfidence: 0,
    averageTemperature: 50,
    highManipulationAlerts: 0,
    significantShiftAlerts: 0,
  };

  constructor(config?: Partial<SignalEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.log('PredictiveSignalEngine initialized');
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
  // Main Signal Generation
  // ============================================================

  /**
   * Generate a predictive signal from all available inputs
   */
  generateSignal(inputs: PredictiveInputs): PredictiveSignal | null {
    this.lastInputs = inputs;
    
    // Count available inputs
    const inputsAvailable = this.countAvailableInputs(inputs);
    if (inputsAvailable < this.config.minInputsRequired) {
      this.log(`Insufficient inputs: ${inputsAvailable}/${this.config.minInputsRequired}`);
      return null;
    }

    // Calculate data quality
    const dataQuality = this.calculateDataQuality(inputs);
    if (dataQuality < this.config.minDataQuality) {
      this.log(`Data quality too low: ${dataQuality.toFixed(2)}`);
      return null;
    }

    // Generate signal ID
    const signalId = `sig_${Date.now()}_${++this.signalCounter}`;

    // Calculate all signal components
    const contributingFactors = this.analyzeContributingFactors(inputs);
    const directionProbabilities = this.calculateDirectionProbabilities(inputs, contributingFactors);
    const shiftLikelihoods = this.calculateShiftLikelihoods(inputs, contributingFactors);
    const manipulationAnalysis = this.analyzeManipulation(inputs, contributingFactors);
    const marketTemperature = this.calculateMarketTemperature(inputs, contributingFactors);
    const predictiveConfidence = this.calculatePredictiveConfidence(inputs, contributingFactors, dataQuality);
    const signalStrength = this.calculateSignalStrength(contributingFactors, predictiveConfidence);

    const signal: PredictiveSignal = {
      id: signalId,
      timestamp: inputs.timestamp,
      
      upwardProbability: directionProbabilities.upward,
      downwardProbability: directionProbabilities.downward,
      sidewaysProbability: directionProbabilities.sideways,
      
      upwardShiftLikelihood: shiftLikelihoods.upward,
      downwardShiftLikelihood: shiftLikelihoods.downward,
      
      manipulationLikelihood: manipulationAnalysis.likelihood,
      manipulationConfidence: manipulationAnalysis.confidence,
      manipulationType: manipulationAnalysis.type,
      
      predictiveConfidence,
      signalStrength,
      
      marketTemperature: marketTemperature.value,
      temperatureTrend: marketTemperature.trend,
      
      contributingFactors,
      
      dataQuality,
      inputsAvailable,
      expiresAt: inputs.timestamp + this.config.signalTTLMs,
    };

    // Store in history
    this.addToHistory(signal);
    
    // Update stats
    this.updateStats(signal);

    this.log(`Signal generated: ${signalId}`, {
      confidence: predictiveConfidence.toFixed(2),
      temperature: marketTemperature.value,
      upwardProb: directionProbabilities.upward.toFixed(2),
      downwardProb: directionProbabilities.downward.toFixed(2),
    });

    return signal;
  }

  // ============================================================
  // Direction Probability Calculation
  // ============================================================

  private calculateDirectionProbabilities(
    inputs: PredictiveInputs,
    factors: ContributingFactor[]
  ): { upward: number; downward: number; sideways: number } {
    let upwardScore = 0;
    let downwardScore = 0;
    let totalWeight = 0;

    // Whale Intel contribution
    if (inputs.whaleIntel) {
      const whale = inputs.whaleIntel;
      const weight = this.config.weights.whale;
      
      // Accumulation suggests upward, distribution suggests downward
      if (whale.accumulationRate > whale.distributionRate) {
        upwardScore += weight * Math.min(1, (whale.accumulationRate - whale.distributionRate) / 100);
      } else {
        downwardScore += weight * Math.min(1, (whale.distributionRate - whale.accumulationRate) / 100);
      }
      
      // Net flow direction
      if (whale.netFlow > 0) {
        upwardScore += weight * 0.5 * Math.min(1, whale.netFlow / 1000000);
      } else {
        downwardScore += weight * 0.5 * Math.min(1, Math.abs(whale.netFlow) / 1000000);
      }
      
      totalWeight += weight;
    }

    // Liquidity contribution
    if (inputs.liquidity) {
      const liq = inputs.liquidity;
      const weight = this.config.weights.liquidity;
      
      // Positive liquidity change suggests stability/upward
      if (liq.liquidityChange > 0) {
        upwardScore += weight * 0.3 * Math.min(1, liq.liquidityChange / 10);
      } else {
        downwardScore += weight * 0.3 * Math.min(1, Math.abs(liq.liquidityChange) / 10);
      }
      
      // High fragility suggests downward risk
      if (liq.fragility > 0.5) {
        downwardScore += weight * 0.4 * liq.fragility;
      }
      
      totalWeight += weight;
    }

    // Hydra contribution
    if (inputs.hydra) {
      const hydra = inputs.hydra;
      const weight = this.config.weights.hydra;
      
      // High divergence can indicate either direction
      if (hydra.divergenceScore > 0.5) {
        // Use spike intensity to determine direction
        if (hydra.spikeIntensity > 50) {
          upwardScore += weight * 0.5;
        } else {
          downwardScore += weight * 0.5;
        }
      }
      
      totalWeight += weight;
    }

    // EcoScan contribution
    if (inputs.ecoscan) {
      const eco = inputs.ecoscan;
      const weight = this.config.weights.ecoscan;
      
      // Momentum direction
      if (eco.momentumScore > 50) {
        upwardScore += weight * (eco.momentumScore - 50) / 50;
      } else {
        downwardScore += weight * (50 - eco.momentumScore) / 50;
      }
      
      // High volatility increases uncertainty
      if (eco.volatilityIndex > 70) {
        // Reduce both scores slightly
        upwardScore *= 0.9;
        downwardScore *= 0.9;
      }
      
      totalWeight += weight;
    }

    // Constellation contribution
    if (inputs.constellation) {
      const const_ = inputs.constellation;
      const weight = this.config.weights.constellation;
      
      // Cluster tightening suggests consolidation before move
      if (const_.clusterTightness > 0.7) {
        // Direction depends on movement velocity
        if (const_.movementVelocity > 0) {
          upwardScore += weight * 0.6;
        } else {
          downwardScore += weight * 0.6;
        }
      }
      
      // Expansion suggests breakout
      if (const_.expansionRate > 0.1) {
        upwardScore += weight * 0.3;
      }
      
      totalWeight += weight;
    }

    // Entity risk contribution
    if (inputs.entityRisk) {
      const entity = inputs.entityRisk;
      const weight = this.config.weights.entity;
      
      // High risk concentration suggests downward pressure
      if (entity.riskConcentration > 0.5) {
        downwardScore += weight * entity.riskConcentration;
      }
      
      // New high risk entities suggest caution
      if (entity.newHighRiskEntities > 5) {
        downwardScore += weight * 0.3;
      }
      
      totalWeight += weight;
    }

    // Normalize scores
    if (totalWeight > 0) {
      upwardScore /= totalWeight;
      downwardScore /= totalWeight;
    }

    // Calculate probabilities (must sum to 1)
    const total = upwardScore + downwardScore + 0.2; // 0.2 base for sideways
    const upward = Math.min(0.9, Math.max(0.05, upwardScore / total));
    const downward = Math.min(0.9, Math.max(0.05, downwardScore / total));
    const sideways = Math.max(0.05, 1 - upward - downward);

    return { upward, downward, sideways };
  }

  // ============================================================
  // Shift Likelihood Calculation
  // ============================================================

  private calculateShiftLikelihoods(
    inputs: PredictiveInputs,
    factors: ContributingFactor[]
  ): { upward: number; downward: number } {
    let upwardLikelihood = 50; // Start neutral
    let downwardLikelihood = 50;

    // Aggregate factor impacts
    for (const factor of factors) {
      if (factor.impact > 0) {
        upwardLikelihood += factor.impact * factor.confidence * 0.5;
      } else {
        downwardLikelihood += Math.abs(factor.impact) * factor.confidence * 0.5;
      }
    }

    // Apply whale velocity boost
    if (inputs.whaleIntel && inputs.whaleIntel.velocityChange > 20) {
      upwardLikelihood += 10;
    } else if (inputs.whaleIntel && inputs.whaleIntel.velocityChange < -20) {
      downwardLikelihood += 10;
    }

    // Apply liquidity pressure
    if (inputs.liquidity && inputs.liquidity.displacementRate > 0.1) {
      downwardLikelihood += 15;
    }

    // Clamp values
    upwardLikelihood = Math.min(100, Math.max(0, upwardLikelihood));
    downwardLikelihood = Math.min(100, Math.max(0, downwardLikelihood));

    return { upward: upwardLikelihood, downward: downwardLikelihood };
  }

  // ============================================================
  // Manipulation Analysis
  // ============================================================

  private analyzeManipulation(
    inputs: PredictiveInputs,
    factors: ContributingFactor[]
  ): { likelihood: number; confidence: number; type: ManipulationType | null } {
    let likelihood = 0;
    let confidence = 0;
    let type: ManipulationType | null = null;
    let indicators = 0;

    // Check whale manipulation indicators
    if (inputs.whaleIntel) {
      const whale = inputs.whaleIntel;
      
      // Large transactions with high velocity change
      if (whale.largeTransactionCount > 10 && Math.abs(whale.velocityChange) > 30) {
        likelihood += 20;
        indicators++;
        if (!type) type = 'whale_manipulation';
      }
      
      // Accumulation/distribution imbalance
      const imbalance = Math.abs(whale.accumulationRate - whale.distributionRate);
      if (imbalance > 50) {
        likelihood += 15;
        indicators++;
        if (!type) type = 'pump_and_dump';
      }
    }

    // Check hydra patterns
    if (inputs.hydra) {
      const hydra = inputs.hydra;
      
      // High pattern count with spikes
      if (hydra.patternCount > 5 && hydra.spikeIntensity > 70) {
        likelihood += 25;
        indicators++;
        if (!type) type = 'coordinated_trading';
      }
      
      // Multiple heads with high divergence
      if (hydra.headCount > 3 && hydra.divergenceScore > 0.7) {
        likelihood += 20;
        indicators++;
        if (!type) type = 'wash_trading';
      }
    }

    // Check liquidity manipulation
    if (inputs.liquidity) {
      const liq = inputs.liquidity;
      
      // High depth imbalance suggests spoofing
      if (liq.depthImbalance > 0.6) {
        likelihood += 20;
        indicators++;
        if (!type) type = 'spoofing';
      }
      
      // High slippage risk with low fragility is suspicious
      if (liq.slippageRisk > 0.7 && liq.fragility < 0.3) {
        likelihood += 15;
        indicators++;
        if (!type) type = 'layering';
      }
    }

    // Check constellation anomalies
    if (inputs.constellation) {
      const const_ = inputs.constellation;
      
      // High anomaly score
      if (const_.anomalyScore > 0.7) {
        likelihood += 15;
        indicators++;
      }
    }

    // Calculate confidence based on number of indicators
    if (indicators > 0) {
      confidence = Math.min(1, indicators * 0.2 + 0.3);
    }

    // Clamp likelihood
    likelihood = Math.min(100, Math.max(0, likelihood));

    return { likelihood, confidence, type };
  }

  // ============================================================
  // Market Temperature Calculation
  // ============================================================

  private calculateMarketTemperature(
    inputs: PredictiveInputs,
    factors: ContributingFactor[]
  ): { value: number; trend: 'heating' | 'cooling' | 'stable' } {
    let temperature = 50; // Start neutral

    // Whale activity heats up the market
    if (inputs.whaleIntel) {
      const whale = inputs.whaleIntel;
      temperature += (whale.totalVolume / 10000000) * 10; // Scale by volume
      temperature += whale.largeTransactionCount * 0.5;
      temperature += Math.abs(whale.velocityChange) * 0.2;
    }

    // Hydra events heat up the market
    if (inputs.hydra) {
      const hydra = inputs.hydra;
      temperature += hydra.eventCount * 0.5;
      temperature += hydra.spikeIntensity * 0.3;
    }

    // EcoScan volatility affects temperature
    if (inputs.ecoscan) {
      const eco = inputs.ecoscan;
      temperature += (eco.volatilityIndex - 50) * 0.4;
      temperature += eco.chainCongestion * 0.2;
    }

    // Constellation movement affects temperature
    if (inputs.constellation) {
      const const_ = inputs.constellation;
      temperature += Math.abs(const_.movementVelocity) * 10;
      temperature += const_.expansionRate * 20;
    }

    // Clamp temperature
    temperature = Math.min(100, Math.max(0, temperature));

    // Determine trend based on history
    let trend: 'heating' | 'cooling' | 'stable' = 'stable';
    if (this.signalHistory.length > 0) {
      const lastTemp = this.signalHistory[this.signalHistory.length - 1].marketTemperature;
      const diff = temperature - lastTemp;
      if (diff > 5) {
        trend = 'heating';
      } else if (diff < -5) {
        trend = 'cooling';
      }
    }

    return { value: Math.round(temperature), trend };
  }

  // ============================================================
  // Confidence Calculation
  // ============================================================

  private calculatePredictiveConfidence(
    inputs: PredictiveInputs,
    factors: ContributingFactor[],
    dataQuality: number
  ): number {
    // Base confidence from data quality
    let confidence = dataQuality * 0.4;

    // Add confidence from factor agreement
    const positiveFactors = factors.filter(f => f.impact > 0).length;
    const negativeFactors = factors.filter(f => f.impact < 0).length;
    const totalFactors = factors.length;

    if (totalFactors > 0) {
      // Higher confidence when factors agree
      const agreement = Math.abs(positiveFactors - negativeFactors) / totalFactors;
      confidence += agreement * 0.3;
    }

    // Add confidence from factor confidence scores
    if (factors.length > 0) {
      const avgFactorConfidence = factors.reduce((sum, f) => sum + f.confidence, 0) / factors.length;
      confidence += avgFactorConfidence * 0.3;
    }

    return Math.min(1, Math.max(0, confidence));
  }

  private calculateSignalStrength(factors: ContributingFactor[], confidence: number): number {
    if (factors.length === 0) return 0;

    // Calculate average absolute impact
    const avgImpact = factors.reduce((sum, f) => sum + Math.abs(f.impact), 0) / factors.length;
    
    // Combine with confidence
    const strength = (avgImpact * 0.6 + confidence * 100 * 0.4);

    return Math.min(100, Math.max(0, Math.round(strength)));
  }

  // ============================================================
  // Contributing Factors Analysis
  // ============================================================

  private analyzeContributingFactors(inputs: PredictiveInputs): ContributingFactor[] {
    const factors: ContributingFactor[] = [];

    // Whale factors
    if (inputs.whaleIntel) {
      const whale = inputs.whaleIntel;
      
      if (whale.accumulationRate > 30) {
        factors.push({
          source: 'whale',
          factor: 'high_accumulation',
          impact: Math.min(50, whale.accumulationRate),
          confidence: 0.8,
          description: `Whale accumulation at ${whale.accumulationRate.toFixed(1)}%`,
        });
      }
      
      if (whale.distributionRate > 30) {
        factors.push({
          source: 'whale',
          factor: 'high_distribution',
          impact: -Math.min(50, whale.distributionRate),
          confidence: 0.8,
          description: `Whale distribution at ${whale.distributionRate.toFixed(1)}%`,
        });
      }
      
      if (Math.abs(whale.velocityChange) > 20) {
        factors.push({
          source: 'whale',
          factor: 'velocity_change',
          impact: whale.velocityChange > 0 ? 30 : -30,
          confidence: 0.7,
          description: `Whale velocity ${whale.velocityChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(whale.velocityChange).toFixed(1)}%`,
        });
      }
    }

    // Liquidity factors
    if (inputs.liquidity) {
      const liq = inputs.liquidity;
      
      if (liq.fragility > 0.6) {
        factors.push({
          source: 'liquidity',
          factor: 'high_fragility',
          impact: -40,
          confidence: 0.75,
          description: `Liquidity fragility at ${(liq.fragility * 100).toFixed(0)}%`,
        });
      }
      
      if (liq.displacementRate > 0.1) {
        factors.push({
          source: 'liquidity',
          factor: 'displacement',
          impact: -30,
          confidence: 0.7,
          description: `Liquidity displacement rate at ${(liq.displacementRate * 100).toFixed(1)}%`,
        });
      }
    }

    // Hydra factors
    if (inputs.hydra) {
      const hydra = inputs.hydra;
      
      if (hydra.spikeIntensity > 60) {
        factors.push({
          source: 'hydra',
          factor: 'spike_intensity',
          impact: hydra.spikeIntensity > 80 ? 40 : 25,
          confidence: 0.65,
          description: `Hydra spike intensity at ${hydra.spikeIntensity}`,
        });
      }
      
      if (hydra.divergenceScore > 0.5) {
        factors.push({
          source: 'hydra',
          factor: 'divergence',
          impact: 20,
          confidence: 0.6,
          description: `Hydra divergence score at ${(hydra.divergenceScore * 100).toFixed(0)}%`,
        });
      }
    }

    // EcoScan factors
    if (inputs.ecoscan) {
      const eco = inputs.ecoscan;
      
      if (eco.volatilityIndex > 70) {
        factors.push({
          source: 'ecoscan',
          factor: 'high_volatility',
          impact: -20,
          confidence: 0.7,
          description: `High volatility index at ${eco.volatilityIndex}`,
        });
      }
      
      if (eco.momentumScore > 70) {
        factors.push({
          source: 'ecoscan',
          factor: 'strong_momentum',
          impact: 35,
          confidence: 0.75,
          description: `Strong positive momentum at ${eco.momentumScore}`,
        });
      } else if (eco.momentumScore < 30) {
        factors.push({
          source: 'ecoscan',
          factor: 'weak_momentum',
          impact: -35,
          confidence: 0.75,
          description: `Weak momentum at ${eco.momentumScore}`,
        });
      }
    }

    // Constellation factors
    if (inputs.constellation) {
      const const_ = inputs.constellation;
      
      if (const_.clusterTightness > 0.7) {
        factors.push({
          source: 'constellation',
          factor: 'cluster_tightening',
          impact: 25,
          confidence: 0.7,
          description: `Constellation cluster tightening at ${(const_.clusterTightness * 100).toFixed(0)}%`,
        });
      }
      
      if (const_.anomalyScore > 0.5) {
        factors.push({
          source: 'constellation',
          factor: 'anomaly_detected',
          impact: -15,
          confidence: 0.6,
          description: `Constellation anomaly score at ${(const_.anomalyScore * 100).toFixed(0)}%`,
        });
      }
    }

    // Entity risk factors
    if (inputs.entityRisk) {
      const entity = inputs.entityRisk;
      
      if (entity.highRiskEntityCount > 10) {
        factors.push({
          source: 'entity',
          factor: 'high_risk_entities',
          impact: -25,
          confidence: 0.7,
          description: `${entity.highRiskEntityCount} high-risk entities detected`,
        });
      }
      
      if (entity.riskShiftRate > 0.2) {
        factors.push({
          source: 'entity',
          factor: 'risk_shift',
          impact: -20,
          confidence: 0.65,
          description: `Risk shift rate at ${(entity.riskShiftRate * 100).toFixed(1)}%`,
        });
      }
    }

    return factors;
  }

  // ============================================================
  // Utility Methods
  // ============================================================

  private countAvailableInputs(inputs: PredictiveInputs): number {
    let count = 0;
    if (inputs.whaleIntel) count++;
    if (inputs.liquidity) count++;
    if (inputs.hydra) count++;
    if (inputs.ecoscan) count++;
    if (inputs.entityRisk) count++;
    if (inputs.constellation) count++;
    return count;
  }

  private calculateDataQuality(inputs: PredictiveInputs): number {
    const available = this.countAvailableInputs(inputs);
    const maxInputs = 6;
    
    // Base quality from input availability
    let quality = available / maxInputs;
    
    // Boost quality if key inputs are present
    if (inputs.whaleIntel) quality += 0.1;
    if (inputs.constellation) quality += 0.1;
    
    return Math.min(1, quality);
  }

  private addToHistory(signal: PredictiveSignal): void {
    this.signalHistory.push(signal);
    
    // Keep only last 100 signals
    if (this.signalHistory.length > 100) {
      this.signalHistory = this.signalHistory.slice(-100);
    }
  }

  private updateStats(signal: PredictiveSignal): void {
    this.stats.totalSignalsGenerated++;
    
    // Update running averages
    const n = this.stats.totalSignalsGenerated;
    this.stats.averageConfidence = 
      (this.stats.averageConfidence * (n - 1) + signal.predictiveConfidence) / n;
    this.stats.averageTemperature = 
      (this.stats.averageTemperature * (n - 1) + signal.marketTemperature) / n;
    
    // Count alerts
    if (signal.manipulationLikelihood > this.config.thresholds.highManipulationRisk) {
      this.stats.highManipulationAlerts++;
    }
    if (signal.upwardShiftLikelihood > this.config.thresholds.significantShift ||
        signal.downwardShiftLikelihood > this.config.thresholds.significantShift) {
      this.stats.significantShiftAlerts++;
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get the latest signal from history
   */
  getLatestSignal(): PredictiveSignal | null {
    if (this.signalHistory.length === 0) return null;
    return this.signalHistory[this.signalHistory.length - 1];
  }

  /**
   * Get signal history
   */
  getHistory(limit?: number): PredictiveSignal[] {
    if (limit) {
      return this.signalHistory.slice(-limit);
    }
    return [...this.signalHistory];
  }

  /**
   * Get signals above a confidence threshold
   */
  getHighConfidenceSignals(minConfidence: number = 0.7): PredictiveSignal[] {
    return this.signalHistory.filter(s => s.predictiveConfidence >= minConfidence);
  }

  /**
   * Get signals with high manipulation likelihood
   */
  getManipulationAlerts(): PredictiveSignal[] {
    return this.signalHistory.filter(
      s => s.manipulationLikelihood >= this.config.thresholds.highManipulationRisk
    );
  }

  /**
   * Get the last inputs used
   */
  getLastInputs(): PredictiveInputs | null {
    return this.lastInputs;
  }

  /**
   * Get engine statistics
   */
  getStats(): typeof this.stats & { historySize: number } {
    return {
      ...this.stats,
      historySize: this.signalHistory.length,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): SignalEngineConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SignalEngineConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Clear signal history
   */
  clearHistory(): void {
    this.signalHistory = [];
    this.log('Signal history cleared');
  }

  /**
   * Reset engine state
   */
  reset(): void {
    this.signalHistory = [];
    this.lastInputs = null;
    this.signalCounter = 0;
    this.stats = {
      totalSignalsGenerated: 0,
      averageConfidence: 0,
      averageTemperature: 50,
      highManipulationAlerts: 0,
      significantShiftAlerts: 0,
    };
    this.log('Engine reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let instance: PredictiveSignalEngineImpl | null = null;

/**
 * Get the PredictiveSignalEngine singleton instance
 */
export function getPredictiveSignalEngine(): PredictiveSignalEngineImpl {
  if (!instance) {
    instance = new PredictiveSignalEngineImpl();
  }
  return instance;
}

/**
 * Create a new PredictiveSignalEngine with custom config
 */
export function createPredictiveSignalEngine(
  config?: Partial<SignalEngineConfig>
): PredictiveSignalEngineImpl {
  return new PredictiveSignalEngineImpl(config);
}
