/**
 * ScenarioGenerator.ts
 * 
 * Phase 6: Ultra-Deep Foresight Engine - MODULE 4
 * 
 * Generates 3-5 possible future scenarios with labels:
 * - "Most Probable Scenario"
 * - "Bullish Breakout Scenario"
 * - "Bear Trap Scenario"
 * - "Manipulation Scenario"
 * - "Low Volatility Drift Scenario"
 * 
 * Each scenario includes:
 * - Probability
 * - Risk factors
 * - Narrative explanation
 * - Trigger level thresholds
 * - Watchlist entities
 * 
 * This is a purely additive, 100% isolated module.
 * Logging prefix: [ScenarioGen]
 */

import {
  type PredictiveSignal,
  type ContributingFactor,
} from './PredictiveSignalEngine';

import {
  type FutureLandscape,
  type Direction,
  type RiskState,
} from './TimeHorizonForecaster';

// ============================================================
// Types
// ============================================================

export type ScenarioType = 
  | 'most_probable'
  | 'bullish_breakout'
  | 'bear_trap'
  | 'manipulation'
  | 'low_volatility_drift'
  | 'bearish_breakdown'
  | 'bull_trap'
  | 'high_volatility_chop';

export interface TriggerThreshold {
  metric: string;
  currentValue: number;
  triggerValue: number;
  direction: 'above' | 'below';
  description: string;
  importance: 'critical' | 'important' | 'minor';
}

export interface WatchlistEntity {
  id: string;
  name: string;
  type: 'whale' | 'exchange' | 'protocol' | 'token' | 'cluster';
  reason: string;
  riskLevel: 'low' | 'medium' | 'high';
  monitoringPriority: number; // 1-10
}

export interface Scenario {
  id: string;
  type: ScenarioType;
  label: string;
  
  // Probability and confidence
  probability: number; // 0-100
  confidence: number; // 0-1
  
  // Risk analysis
  riskFactors: string[];
  riskLevel: RiskState;
  
  // Narrative
  narrative: string;
  shortDescription: string;
  keyAssumptions: string[];
  
  // Triggers
  triggerThresholds: TriggerThreshold[];
  invalidationConditions: string[];
  
  // Watchlist
  watchlistEntities: WatchlistEntity[];
  
  // Timeframe
  expectedTimeframe: string;
  validUntil: number;
  
  // Metadata
  generatedAt: number;
  basedOnSignalId: string | null;
}

export interface ScenarioSet {
  id: string;
  generatedAt: number;
  
  // All scenarios
  scenarios: Scenario[];
  
  // Primary scenario
  primaryScenario: Scenario;
  
  // Aggregate analysis
  marketBias: Direction;
  overallUncertainty: number; // 0-1
  scenarioSpread: number; // How different are the scenarios
  
  // Key metrics
  bullishProbability: number;
  bearishProbability: number;
  neutralProbability: number;
  
  // Source
  sourceSignalId: string | null;
  sourceLandscapeId: string | null;
}

export interface ScenarioGeneratorConfig {
  enableLogging: boolean;
  logPrefix: string;
  maxScenarios: number;
  minProbabilityThreshold: number;
  scenarioTTLMs: number;
  enableSpeculativeScenarios: boolean;
}

const DEFAULT_CONFIG: ScenarioGeneratorConfig = {
  enableLogging: true,
  logPrefix: '[ScenarioGen]',
  maxScenarios: 5,
  minProbabilityThreshold: 5,
  scenarioTTLMs: 300000, // 5 minutes
  enableSpeculativeScenarios: true,
};

// ============================================================
// Scenario Templates
// ============================================================

interface ScenarioTemplate {
  type: ScenarioType;
  label: string;
  baseNarrative: string;
  riskLevel: RiskState;
  keyAssumptions: string[];
  typicalTriggers: string[];
}

const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    type: 'most_probable',
    label: 'Most Probable Scenario',
    baseNarrative: 'Based on current signals, the most likely outcome is',
    riskLevel: 'moderate',
    keyAssumptions: ['Current trends continue', 'No major external shocks', 'Liquidity remains stable'],
    typicalTriggers: ['Price breaks key level', 'Volume confirms direction', 'Whale activity aligns'],
  },
  {
    type: 'bullish_breakout',
    label: 'Bullish Breakout Scenario',
    baseNarrative: 'A bullish breakout could occur if',
    riskLevel: 'elevated',
    keyAssumptions: ['Buying pressure increases', 'Resistance levels break', 'Positive sentiment builds'],
    typicalTriggers: ['Price above resistance', 'Volume spike', 'Whale accumulation surge'],
  },
  {
    type: 'bearish_breakdown',
    label: 'Bearish Breakdown Scenario',
    baseNarrative: 'A bearish breakdown could occur if',
    riskLevel: 'elevated',
    keyAssumptions: ['Selling pressure increases', 'Support levels break', 'Negative sentiment builds'],
    typicalTriggers: ['Price below support', 'Volume spike on selling', 'Whale distribution surge'],
  },
  {
    type: 'bear_trap',
    label: 'Bear Trap Scenario',
    baseNarrative: 'A bear trap could form where',
    riskLevel: 'high',
    keyAssumptions: ['Initial breakdown is false', 'Smart money accumulates on dip', 'Reversal follows quickly'],
    typicalTriggers: ['Quick recovery after breakdown', 'Divergence in indicators', 'Whale buying on dip'],
  },
  {
    type: 'bull_trap',
    label: 'Bull Trap Scenario',
    baseNarrative: 'A bull trap could form where',
    riskLevel: 'high',
    keyAssumptions: ['Initial breakout is false', 'Smart money distributes on rally', 'Reversal follows quickly'],
    typicalTriggers: ['Quick reversal after breakout', 'Divergence in indicators', 'Whale selling on rally'],
  },
  {
    type: 'manipulation',
    label: 'Manipulation Scenario',
    baseNarrative: 'Market manipulation could cause',
    riskLevel: 'critical',
    keyAssumptions: ['Coordinated activity detected', 'Artificial price movements', 'Unreliable signals'],
    typicalTriggers: ['Unusual volume patterns', 'Hydra divergence spike', 'Wash trading detected'],
  },
  {
    type: 'low_volatility_drift',
    label: 'Low Volatility Drift Scenario',
    baseNarrative: 'A period of low volatility consolidation could see',
    riskLevel: 'low',
    keyAssumptions: ['No major catalysts', 'Range-bound trading', 'Decreasing volume'],
    typicalTriggers: ['Volatility compression', 'Decreasing volume', 'Tight price range'],
  },
  {
    type: 'high_volatility_chop',
    label: 'High Volatility Chop Scenario',
    baseNarrative: 'High volatility without clear direction could result in',
    riskLevel: 'high',
    keyAssumptions: ['Conflicting signals', 'Uncertain market conditions', 'Rapid reversals'],
    typicalTriggers: ['Volatility expansion', 'Mixed signals', 'Rapid price swings'],
  },
];

// ============================================================
// Scenario Generator Implementation
// ============================================================

class ScenarioGeneratorImpl {
  private config: ScenarioGeneratorConfig;
  private scenarioSetHistory: ScenarioSet[] = [];
  private setCounter: number = 0;
  private scenarioCounter: number = 0;
  
  private stats = {
    totalSetsGenerated: 0,
    totalScenariosGenerated: 0,
    mostCommonPrimary: 'most_probable' as ScenarioType,
    scenarioTypeCounts: {} as Record<ScenarioType, number>,
  };

  constructor(config?: Partial<ScenarioGeneratorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeStats();
    this.log('ScenarioGenerator initialized');
  }

  private initializeStats(): void {
    for (const template of SCENARIO_TEMPLATES) {
      this.stats.scenarioTypeCounts[template.type] = 0;
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
  // Main Scenario Generation
  // ============================================================

  /**
   * Generate a complete scenario set from a predictive signal
   */
  generateFromSignal(signal: PredictiveSignal): ScenarioSet {
    const setId = `scenarioset_${Date.now()}_${++this.setCounter}`;
    const now = Date.now();

    // Generate all relevant scenarios
    const scenarios = this.generateScenarios(signal);

    // Determine primary scenario
    const primaryScenario = this.determinePrimaryScenario(scenarios);

    // Calculate aggregate metrics
    const marketBias = this.calculateMarketBias(scenarios);
    const overallUncertainty = this.calculateUncertainty(scenarios);
    const scenarioSpread = this.calculateScenarioSpread(scenarios);

    // Calculate probability distribution
    const { bullish, bearish, neutral } = this.calculateProbabilityDistribution(scenarios);

    const scenarioSet: ScenarioSet = {
      id: setId,
      generatedAt: now,
      
      scenarios,
      primaryScenario,
      
      marketBias,
      overallUncertainty,
      scenarioSpread,
      
      bullishProbability: bullish,
      bearishProbability: bearish,
      neutralProbability: neutral,
      
      sourceSignalId: signal.id,
      sourceLandscapeId: null,
    };

    // Store in history
    this.addToHistory(scenarioSet);
    
    // Update stats
    this.updateStats(scenarioSet);

    this.log(`Scenario set generated: ${setId}`, {
      scenarios: scenarios.length,
      primary: primaryScenario.type,
      marketBias,
    });

    return scenarioSet;
  }

  /**
   * Generate a scenario set from a future landscape
   */
  generateFromLandscape(landscape: FutureLandscape): ScenarioSet {
    if (!landscape.sourceSignal) {
      return this.generateBasicScenarioSet(landscape);
    }

    const scenarioSet = this.generateFromSignal(landscape.sourceSignal);
    
    // Enhance with landscape data
    return {
      ...scenarioSet,
      sourceLandscapeId: landscape.id,
    };
  }

  // ============================================================
  // Individual Scenario Generation
  // ============================================================

  private generateScenarios(signal: PredictiveSignal): Scenario[] {
    const scenarios: Scenario[] = [];

    // Always generate the most probable scenario
    const mostProbable = this.generateMostProbableScenario(signal);
    scenarios.push(mostProbable);

    // Generate bullish scenario if conditions warrant
    if (signal.upwardProbability > 0.2 || signal.upwardShiftLikelihood > 40) {
      const bullish = this.generateBullishScenario(signal);
      scenarios.push(bullish);
    }

    // Generate bearish scenario if conditions warrant
    if (signal.downwardProbability > 0.2 || signal.downwardShiftLikelihood > 40) {
      const bearish = this.generateBearishScenario(signal);
      scenarios.push(bearish);
    }

    // Generate trap scenarios if volatility is elevated
    if (signal.marketTemperature > 50) {
      if (signal.upwardProbability > signal.downwardProbability) {
        const bullTrap = this.generateBullTrapScenario(signal);
        scenarios.push(bullTrap);
      } else {
        const bearTrap = this.generateBearTrapScenario(signal);
        scenarios.push(bearTrap);
      }
    }

    // Generate manipulation scenario if detected
    if (signal.manipulationLikelihood > 30) {
      const manipulation = this.generateManipulationScenario(signal);
      scenarios.push(manipulation);
    }

    // Generate low volatility scenario if temperature is low
    if (signal.marketTemperature < 40) {
      const lowVol = this.generateLowVolatilityScenario(signal);
      scenarios.push(lowVol);
    }

    // Generate high volatility chop if temperature is very high
    if (signal.marketTemperature > 70 && signal.sidewaysProbability > 0.2) {
      const highVol = this.generateHighVolatilityScenario(signal);
      scenarios.push(highVol);
    }

    // Filter by minimum probability and limit
    return scenarios
      .filter(s => s.probability >= this.config.minProbabilityThreshold)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, this.config.maxScenarios);
  }

  private generateMostProbableScenario(signal: PredictiveSignal): Scenario {
    const template = SCENARIO_TEMPLATES.find(t => t.type === 'most_probable')!;
    const scenarioId = `scenario_${Date.now()}_${++this.scenarioCounter}`;

    // Determine direction based on probabilities
    let direction: string;
    let probability: number;
    
    if (signal.upwardProbability > signal.downwardProbability && 
        signal.upwardProbability > signal.sidewaysProbability) {
      direction = 'gradual upward movement';
      probability = signal.upwardProbability * 100;
    } else if (signal.downwardProbability > signal.upwardProbability && 
               signal.downwardProbability > signal.sidewaysProbability) {
      direction = 'gradual downward movement';
      probability = signal.downwardProbability * 100;
    } else {
      direction = 'sideways consolidation';
      probability = signal.sidewaysProbability * 100;
    }

    const narrative = `${template.baseNarrative} ${direction} over the short term. ` +
      `Market temperature at ${signal.marketTemperature} suggests ${signal.temperatureTrend} activity levels. ` +
      this.generateFactorNarrative(signal.contributingFactors.slice(0, 3));

    return {
      id: scenarioId,
      type: 'most_probable',
      label: template.label,
      
      probability: Math.min(95, Math.max(20, probability)),
      confidence: signal.predictiveConfidence,
      
      riskFactors: this.extractRiskFactors(signal, 'most_probable'),
      riskLevel: this.determineRiskLevel(signal, 'most_probable'),
      
      narrative,
      shortDescription: `Most likely: ${direction}`,
      keyAssumptions: template.keyAssumptions,
      
      triggerThresholds: this.generateTriggers(signal, 'most_probable'),
      invalidationConditions: this.generateInvalidationConditions(signal, 'most_probable'),
      
      watchlistEntities: this.generateWatchlist(signal, 'most_probable'),
      
      expectedTimeframe: '1-4 hours',
      validUntil: Date.now() + this.config.scenarioTTLMs,
      
      generatedAt: Date.now(),
      basedOnSignalId: signal.id,
    };
  }

  private generateBullishScenario(signal: PredictiveSignal): Scenario {
    const template = SCENARIO_TEMPLATES.find(t => t.type === 'bullish_breakout')!;
    const scenarioId = `scenario_${Date.now()}_${++this.scenarioCounter}`;

    // Calculate probability based on upward signals
    const baseProbability = signal.upwardProbability * 100;
    const shiftBoost = signal.upwardShiftLikelihood > 60 ? 10 : 0;
    const probability = Math.min(80, baseProbability + shiftBoost);

    const bullishFactors = signal.contributingFactors.filter(f => f.impact > 0);
    const narrative = `${template.baseNarrative} buying pressure intensifies. ` +
      this.generateFactorNarrative(bullishFactors.slice(0, 3)) +
      ` A breakout above resistance could trigger accelerated upside.`;

    return {
      id: scenarioId,
      type: 'bullish_breakout',
      label: template.label,
      
      probability,
      confidence: signal.predictiveConfidence * 0.9,
      
      riskFactors: this.extractRiskFactors(signal, 'bullish_breakout'),
      riskLevel: template.riskLevel,
      
      narrative,
      shortDescription: 'Bullish breakout with accelerated upside',
      keyAssumptions: template.keyAssumptions,
      
      triggerThresholds: this.generateTriggers(signal, 'bullish_breakout'),
      invalidationConditions: this.generateInvalidationConditions(signal, 'bullish_breakout'),
      
      watchlistEntities: this.generateWatchlist(signal, 'bullish_breakout'),
      
      expectedTimeframe: '30 min - 2 hours',
      validUntil: Date.now() + this.config.scenarioTTLMs,
      
      generatedAt: Date.now(),
      basedOnSignalId: signal.id,
    };
  }

  private generateBearishScenario(signal: PredictiveSignal): Scenario {
    const template = SCENARIO_TEMPLATES.find(t => t.type === 'bearish_breakdown')!;
    const scenarioId = `scenario_${Date.now()}_${++this.scenarioCounter}`;

    const baseProbability = signal.downwardProbability * 100;
    const shiftBoost = signal.downwardShiftLikelihood > 60 ? 10 : 0;
    const probability = Math.min(80, baseProbability + shiftBoost);

    const bearishFactors = signal.contributingFactors.filter(f => f.impact < 0);
    const narrative = `${template.baseNarrative} selling pressure intensifies. ` +
      this.generateFactorNarrative(bearishFactors.slice(0, 3)) +
      ` A breakdown below support could trigger accelerated downside.`;

    return {
      id: scenarioId,
      type: 'bearish_breakdown',
      label: template.label,
      
      probability,
      confidence: signal.predictiveConfidence * 0.9,
      
      riskFactors: this.extractRiskFactors(signal, 'bearish_breakdown'),
      riskLevel: template.riskLevel,
      
      narrative,
      shortDescription: 'Bearish breakdown with accelerated downside',
      keyAssumptions: template.keyAssumptions,
      
      triggerThresholds: this.generateTriggers(signal, 'bearish_breakdown'),
      invalidationConditions: this.generateInvalidationConditions(signal, 'bearish_breakdown'),
      
      watchlistEntities: this.generateWatchlist(signal, 'bearish_breakdown'),
      
      expectedTimeframe: '30 min - 2 hours',
      validUntil: Date.now() + this.config.scenarioTTLMs,
      
      generatedAt: Date.now(),
      basedOnSignalId: signal.id,
    };
  }

  private generateBearTrapScenario(signal: PredictiveSignal): Scenario {
    const template = SCENARIO_TEMPLATES.find(t => t.type === 'bear_trap')!;
    const scenarioId = `scenario_${Date.now()}_${++this.scenarioCounter}`;

    // Bear trap more likely when downward probability is moderate but whale accumulation detected
    const whaleAccumulation = signal.contributingFactors.some(
      f => f.source === 'whale' && f.factor === 'high_accumulation'
    );
    const baseProbability = signal.downwardProbability * 50;
    const probability = Math.min(40, baseProbability + (whaleAccumulation ? 15 : 0));

    const narrative = `${template.baseNarrative} an initial breakdown below support triggers panic selling, ` +
      `but smart money accumulates on the dip. A quick reversal follows as weak hands are shaken out. ` +
      `Watch for divergence between price action and whale activity.`;

    return {
      id: scenarioId,
      type: 'bear_trap',
      label: template.label,
      
      probability,
      confidence: signal.predictiveConfidence * 0.7,
      
      riskFactors: this.extractRiskFactors(signal, 'bear_trap'),
      riskLevel: template.riskLevel,
      
      narrative,
      shortDescription: 'False breakdown followed by sharp reversal',
      keyAssumptions: template.keyAssumptions,
      
      triggerThresholds: this.generateTriggers(signal, 'bear_trap'),
      invalidationConditions: this.generateInvalidationConditions(signal, 'bear_trap'),
      
      watchlistEntities: this.generateWatchlist(signal, 'bear_trap'),
      
      expectedTimeframe: '15 min - 1 hour',
      validUntil: Date.now() + this.config.scenarioTTLMs,
      
      generatedAt: Date.now(),
      basedOnSignalId: signal.id,
    };
  }

  private generateBullTrapScenario(signal: PredictiveSignal): Scenario {
    const template = SCENARIO_TEMPLATES.find(t => t.type === 'bull_trap')!;
    const scenarioId = `scenario_${Date.now()}_${++this.scenarioCounter}`;

    const whaleDistribution = signal.contributingFactors.some(
      f => f.source === 'whale' && f.factor === 'high_distribution'
    );
    const baseProbability = signal.upwardProbability * 50;
    const probability = Math.min(40, baseProbability + (whaleDistribution ? 15 : 0));

    const narrative = `${template.baseNarrative} an initial breakout above resistance triggers FOMO buying, ` +
      `but smart money distributes into strength. A quick reversal follows as late buyers are trapped. ` +
      `Watch for divergence between price action and whale activity.`;

    return {
      id: scenarioId,
      type: 'bull_trap',
      label: template.label,
      
      probability,
      confidence: signal.predictiveConfidence * 0.7,
      
      riskFactors: this.extractRiskFactors(signal, 'bull_trap'),
      riskLevel: template.riskLevel,
      
      narrative,
      shortDescription: 'False breakout followed by sharp reversal',
      keyAssumptions: template.keyAssumptions,
      
      triggerThresholds: this.generateTriggers(signal, 'bull_trap'),
      invalidationConditions: this.generateInvalidationConditions(signal, 'bull_trap'),
      
      watchlistEntities: this.generateWatchlist(signal, 'bull_trap'),
      
      expectedTimeframe: '15 min - 1 hour',
      validUntil: Date.now() + this.config.scenarioTTLMs,
      
      generatedAt: Date.now(),
      basedOnSignalId: signal.id,
    };
  }

  private generateManipulationScenario(signal: PredictiveSignal): Scenario {
    const template = SCENARIO_TEMPLATES.find(t => t.type === 'manipulation')!;
    const scenarioId = `scenario_${Date.now()}_${++this.scenarioCounter}`;

    const probability = Math.min(60, signal.manipulationLikelihood);
    const manipType = signal.manipulationType?.replace(/_/g, ' ') || 'market manipulation';

    const narrative = `${template.baseNarrative} artificial price movements due to ${manipType}. ` +
      `Detected manipulation likelihood at ${signal.manipulationLikelihood.toFixed(0)}%. ` +
      `Price signals may be unreliable and sudden reversals are possible. ` +
      `Exercise extreme caution and consider reducing exposure.`;

    return {
      id: scenarioId,
      type: 'manipulation',
      label: template.label,
      
      probability,
      confidence: signal.manipulationConfidence,
      
      riskFactors: [
        `${manipType} detected`,
        'Unreliable price signals',
        'Potential for sudden reversals',
        'Artificial volume patterns',
      ],
      riskLevel: 'critical',
      
      narrative,
      shortDescription: `${manipType} causing unreliable signals`,
      keyAssumptions: template.keyAssumptions,
      
      triggerThresholds: this.generateTriggers(signal, 'manipulation'),
      invalidationConditions: ['Manipulation patterns subside', 'Normal trading resumes'],
      
      watchlistEntities: this.generateWatchlist(signal, 'manipulation'),
      
      expectedTimeframe: 'Immediate - ongoing',
      validUntil: Date.now() + this.config.scenarioTTLMs / 2,
      
      generatedAt: Date.now(),
      basedOnSignalId: signal.id,
    };
  }

  private generateLowVolatilityScenario(signal: PredictiveSignal): Scenario {
    const template = SCENARIO_TEMPLATES.find(t => t.type === 'low_volatility_drift')!;
    const scenarioId = `scenario_${Date.now()}_${++this.scenarioCounter}`;

    const probability = Math.min(50, (100 - signal.marketTemperature) * 0.6);

    const narrative = `${template.baseNarrative} gradual price drift within a narrow range. ` +
      `Market temperature at ${signal.marketTemperature} indicates reduced activity. ` +
      `Expect tight consolidation with potential for eventual breakout. ` +
      `Low risk environment but limited opportunities.`;

    return {
      id: scenarioId,
      type: 'low_volatility_drift',
      label: template.label,
      
      probability,
      confidence: signal.predictiveConfidence * 0.8,
      
      riskFactors: this.extractRiskFactors(signal, 'low_volatility_drift'),
      riskLevel: 'low',
      
      narrative,
      shortDescription: 'Tight consolidation with low activity',
      keyAssumptions: template.keyAssumptions,
      
      triggerThresholds: this.generateTriggers(signal, 'low_volatility_drift'),
      invalidationConditions: ['Volatility expansion', 'Volume spike', 'Major catalyst'],
      
      watchlistEntities: this.generateWatchlist(signal, 'low_volatility_drift'),
      
      expectedTimeframe: '2-8 hours',
      validUntil: Date.now() + this.config.scenarioTTLMs * 2,
      
      generatedAt: Date.now(),
      basedOnSignalId: signal.id,
    };
  }

  private generateHighVolatilityScenario(signal: PredictiveSignal): Scenario {
    const template = SCENARIO_TEMPLATES.find(t => t.type === 'high_volatility_chop')!;
    const scenarioId = `scenario_${Date.now()}_${++this.scenarioCounter}`;

    const probability = Math.min(40, (signal.marketTemperature - 50) * 0.8);

    const narrative = `${template.baseNarrative} rapid price swings without clear direction. ` +
      `Market temperature at ${signal.marketTemperature} indicates heightened activity. ` +
      `Expect whipsaws and false signals. High risk environment requiring caution.`;

    return {
      id: scenarioId,
      type: 'high_volatility_chop',
      label: template.label,
      
      probability,
      confidence: signal.predictiveConfidence * 0.6,
      
      riskFactors: [
        'Rapid price swings',
        'False breakouts likely',
        'Whipsaw risk elevated',
        'Stop-loss hunting probable',
      ],
      riskLevel: 'high',
      
      narrative,
      shortDescription: 'Choppy price action with rapid reversals',
      keyAssumptions: template.keyAssumptions,
      
      triggerThresholds: this.generateTriggers(signal, 'high_volatility_chop'),
      invalidationConditions: ['Clear trend emerges', 'Volatility subsides'],
      
      watchlistEntities: this.generateWatchlist(signal, 'high_volatility_chop'),
      
      expectedTimeframe: '30 min - 4 hours',
      validUntil: Date.now() + this.config.scenarioTTLMs,
      
      generatedAt: Date.now(),
      basedOnSignalId: signal.id,
    };
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  private generateFactorNarrative(factors: ContributingFactor[]): string {
    if (factors.length === 0) return '';

    const descriptions = factors.map(f => f.description);
    if (descriptions.length === 1) {
      return descriptions[0] + '.';
    } else if (descriptions.length === 2) {
      return `${descriptions[0]} and ${descriptions[1]}.`;
    } else {
      return `${descriptions.slice(0, -1).join(', ')}, and ${descriptions[descriptions.length - 1]}.`;
    }
  }

  private extractRiskFactors(signal: PredictiveSignal, scenarioType: ScenarioType): string[] {
    const factors: string[] = [];

    // Common risk factors
    if (signal.manipulationLikelihood > 30) {
      factors.push(`Manipulation risk: ${signal.manipulationLikelihood.toFixed(0)}%`);
    }

    if (signal.marketTemperature > 70) {
      factors.push('Elevated market temperature');
    }

    // Scenario-specific factors
    const negativeFactors = signal.contributingFactors
      .filter(f => f.impact < -20)
      .map(f => f.description);

    factors.push(...negativeFactors.slice(0, 3));

    return factors.slice(0, 5);
  }

  private determineRiskLevel(signal: PredictiveSignal, scenarioType: ScenarioType): RiskState {
    if (signal.manipulationLikelihood > 70) return 'critical';
    if (signal.manipulationLikelihood > 50) return 'high';
    if (signal.marketTemperature > 80) return 'high';
    if (signal.marketTemperature > 60) return 'elevated';
    if (signal.marketTemperature < 30) return 'low';
    return 'moderate';
  }

  private generateTriggers(signal: PredictiveSignal, scenarioType: ScenarioType): TriggerThreshold[] {
    const triggers: TriggerThreshold[] = [];

    // Market temperature trigger
    triggers.push({
      metric: 'Market Temperature',
      currentValue: signal.marketTemperature,
      triggerValue: scenarioType.includes('bullish') ? 75 : scenarioType.includes('bearish') ? 25 : 50,
      direction: scenarioType.includes('bullish') ? 'above' : 'below',
      description: `Temperature ${scenarioType.includes('bullish') ? 'rises above' : 'falls below'} threshold`,
      importance: 'important',
    });

    // Manipulation trigger
    if (signal.manipulationLikelihood > 20) {
      triggers.push({
        metric: 'Manipulation Likelihood',
        currentValue: signal.manipulationLikelihood,
        triggerValue: 60,
        direction: 'above',
        description: 'Manipulation risk exceeds threshold',
        importance: 'critical',
      });
    }

    // Direction probability trigger
    const relevantProb = scenarioType.includes('bullish') ? 
      signal.upwardProbability : signal.downwardProbability;
    triggers.push({
      metric: 'Direction Probability',
      currentValue: relevantProb * 100,
      triggerValue: 60,
      direction: 'above',
      description: 'Directional probability confirms scenario',
      importance: 'important',
    });

    return triggers;
  }

  private generateInvalidationConditions(signal: PredictiveSignal, scenarioType: ScenarioType): string[] {
    const conditions: string[] = [];

    switch (scenarioType) {
      case 'bullish_breakout':
        conditions.push('Price falls below key support');
        conditions.push('Whale distribution increases');
        conditions.push('Volume fails to confirm');
        break;
      case 'bearish_breakdown':
        conditions.push('Price rises above key resistance');
        conditions.push('Whale accumulation increases');
        conditions.push('Volume fails to confirm');
        break;
      case 'bear_trap':
      case 'bull_trap':
        conditions.push('Trend continues without reversal');
        conditions.push('No divergence detected');
        break;
      case 'manipulation':
        conditions.push('Manipulation patterns subside');
        conditions.push('Normal trading volume resumes');
        break;
      default:
        conditions.push('Major catalyst changes outlook');
        conditions.push('Key levels are breached');
    }

    return conditions;
  }

  private generateWatchlist(signal: PredictiveSignal, scenarioType: ScenarioType): WatchlistEntity[] {
    const watchlist: WatchlistEntity[] = [];

    // Add entities based on contributing factors
    for (const factor of signal.contributingFactors.slice(0, 3)) {
      watchlist.push({
        id: `watch_${factor.source}_${factor.factor}`,
        name: `${factor.source.charAt(0).toUpperCase() + factor.source.slice(1)} Activity`,
        type: factor.source === 'whale' ? 'whale' : 
              factor.source === 'constellation' ? 'cluster' : 'protocol',
        reason: factor.description,
        riskLevel: Math.abs(factor.impact) > 30 ? 'high' : 
                   Math.abs(factor.impact) > 15 ? 'medium' : 'low',
        monitoringPriority: Math.min(10, Math.ceil(Math.abs(factor.impact) / 10)),
      });
    }

    return watchlist;
  }

  // ============================================================
  // Aggregate Calculations
  // ============================================================

  private determinePrimaryScenario(scenarios: Scenario[]): Scenario {
    // Return the scenario with highest probability
    return scenarios.reduce((max, s) => s.probability > max.probability ? s : max);
  }

  private calculateMarketBias(scenarios: Scenario[]): Direction {
    let bullishWeight = 0;
    let bearishWeight = 0;

    for (const scenario of scenarios) {
      if (scenario.type.includes('bullish') || scenario.type === 'bear_trap') {
        bullishWeight += scenario.probability;
      } else if (scenario.type.includes('bearish') || scenario.type === 'bull_trap') {
        bearishWeight += scenario.probability;
      }
    }

    if (bullishWeight > bearishWeight + 20) return 'bullish';
    if (bearishWeight > bullishWeight + 20) return 'bearish';
    return 'neutral';
  }

  private calculateUncertainty(scenarios: Scenario[]): number {
    if (scenarios.length <= 1) return 0;

    // Higher uncertainty when probabilities are more evenly distributed
    const probs = scenarios.map(s => s.probability);
    const maxProb = Math.max(...probs);
    const avgProb = probs.reduce((a, b) => a + b, 0) / probs.length;

    // Uncertainty is higher when max is closer to average
    return 1 - (maxProb - avgProb) / 100;
  }

  private calculateScenarioSpread(scenarios: Scenario[]): number {
    if (scenarios.length <= 1) return 0;

    const probs = scenarios.map(s => s.probability);
    const max = Math.max(...probs);
    const min = Math.min(...probs);

    return (max - min) / 100;
  }

  private calculateProbabilityDistribution(scenarios: Scenario[]): {
    bullish: number;
    bearish: number;
    neutral: number;
  } {
    let bullish = 0;
    let bearish = 0;
    let neutral = 0;

    for (const scenario of scenarios) {
      if (scenario.type.includes('bullish') || scenario.type === 'bear_trap') {
        bullish += scenario.probability;
      } else if (scenario.type.includes('bearish') || scenario.type === 'bull_trap') {
        bearish += scenario.probability;
      } else {
        neutral += scenario.probability;
      }
    }

    // Normalize
    const total = bullish + bearish + neutral;
    if (total > 0) {
      bullish = (bullish / total) * 100;
      bearish = (bearish / total) * 100;
      neutral = (neutral / total) * 100;
    }

    return { bullish, bearish, neutral };
  }

  // ============================================================
  // Basic Scenario Set (without signal)
  // ============================================================

  private generateBasicScenarioSet(landscape: FutureLandscape): ScenarioSet {
    const setId = `scenarioset_basic_${Date.now()}_${++this.setCounter}`;

    // Create a basic most probable scenario
    const basicScenario: Scenario = {
      id: `scenario_basic_${++this.scenarioCounter}`,
      type: 'most_probable',
      label: 'Most Probable Scenario',
      probability: 50,
      confidence: landscape.landscapeConfidence,
      riskFactors: landscape.warnings,
      riskLevel: landscape.overallRiskState,
      narrative: `Based on landscape analysis, ${landscape.dominantDirection} bias detected with ${landscape.overallRiskState} risk.`,
      shortDescription: `${landscape.dominantDirection} outlook`,
      keyAssumptions: ['Current conditions persist'],
      triggerThresholds: [],
      invalidationConditions: ['Major market shift'],
      watchlistEntities: [],
      expectedTimeframe: '1-4 hours',
      validUntil: Date.now() + this.config.scenarioTTLMs,
      generatedAt: Date.now(),
      basedOnSignalId: null,
    };

    return {
      id: setId,
      generatedAt: Date.now(),
      scenarios: [basicScenario],
      primaryScenario: basicScenario,
      marketBias: landscape.dominantDirection,
      overallUncertainty: 1 - landscape.landscapeConfidence,
      scenarioSpread: 0,
      bullishProbability: landscape.dominantDirection === 'bullish' ? 60 : 20,
      bearishProbability: landscape.dominantDirection === 'bearish' ? 60 : 20,
      neutralProbability: landscape.dominantDirection === 'neutral' ? 60 : 20,
      sourceSignalId: null,
      sourceLandscapeId: landscape.id,
    };
  }

  // ============================================================
  // History Management
  // ============================================================

  private addToHistory(scenarioSet: ScenarioSet): void {
    this.scenarioSetHistory.push(scenarioSet);
    
    if (this.scenarioSetHistory.length > 30) {
      this.scenarioSetHistory = this.scenarioSetHistory.slice(-30);
    }
  }

  private updateStats(scenarioSet: ScenarioSet): void {
    this.stats.totalSetsGenerated++;
    this.stats.totalScenariosGenerated += scenarioSet.scenarios.length;

    // Update scenario type counts
    for (const scenario of scenarioSet.scenarios) {
      this.stats.scenarioTypeCounts[scenario.type] = 
        (this.stats.scenarioTypeCounts[scenario.type] || 0) + 1;
    }

    // Update most common primary
    const primaryCounts: Record<ScenarioType, number> = {} as Record<ScenarioType, number>;
    for (const set of this.scenarioSetHistory) {
      primaryCounts[set.primaryScenario.type] = 
        (primaryCounts[set.primaryScenario.type] || 0) + 1;
    }
    
    let maxCount = 0;
    for (const [type, count] of Object.entries(primaryCounts)) {
      if (count > maxCount) {
        maxCount = count;
        this.stats.mostCommonPrimary = type as ScenarioType;
      }
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get the latest scenario set
   */
  getLatestScenarioSet(): ScenarioSet | null {
    if (this.scenarioSetHistory.length === 0) return null;
    return this.scenarioSetHistory[this.scenarioSetHistory.length - 1];
  }

  /**
   * Get scenario set history
   */
  getHistory(limit?: number): ScenarioSet[] {
    if (limit) {
      return this.scenarioSetHistory.slice(-limit);
    }
    return [...this.scenarioSetHistory];
  }

  /**
   * Get a specific scenario type from latest set
   */
  getScenario(type: ScenarioType): Scenario | null {
    const latestSet = this.getLatestScenarioSet();
    if (!latestSet) return null;
    return latestSet.scenarios.find(s => s.type === type) || null;
  }

  /**
   * Get generator statistics
   */
  getStats(): typeof this.stats & { historySize: number } {
    return {
      ...this.stats,
      historySize: this.scenarioSetHistory.length,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): ScenarioGeneratorConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ScenarioGeneratorConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.scenarioSetHistory = [];
    this.log('Scenario history cleared');
  }

  /**
   * Reset generator state
   */
  reset(): void {
    this.scenarioSetHistory = [];
    this.setCounter = 0;
    this.scenarioCounter = 0;
    this.initializeStats();
    this.log('Generator reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let instance: ScenarioGeneratorImpl | null = null;

/**
 * Get the ScenarioGenerator singleton instance
 */
export function getScenarioGenerator(): ScenarioGeneratorImpl {
  if (!instance) {
    instance = new ScenarioGeneratorImpl();
  }
  return instance;
}

/**
 * Create a new ScenarioGenerator with custom config
 */
export function createScenarioGenerator(
  config?: Partial<ScenarioGeneratorConfig>
): ScenarioGeneratorImpl {
  return new ScenarioGeneratorImpl(config);
}
