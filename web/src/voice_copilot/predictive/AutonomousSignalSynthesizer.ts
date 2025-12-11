/**
 * AutonomousSignalSynthesizer.ts
 * 
 * Phase 6: Ultra-Deep Foresight Engine - MODULE 6
 * 
 * Combines outputs from all predictive modules to create a single unified foresight model.
 * 
 * Required Functions:
 * - synthesizeShortTerm()
 * - synthesizeMidTerm()
 * - synthesizeLongTerm()
 * - synthesizeScenarios()
 * - synthesizeCausalChain()
 * - synthesizeUnifiedForecast()
 * 
 * This becomes the final intelligence layer available to the Copilot.
 * 
 * This is a purely additive, 100% isolated module.
 * Logging prefix: [SignalSynth]
 */

import {
  getPredictiveSignalEngine,
  type PredictiveSignal,
  type PredictiveInputs,
} from './PredictiveSignalEngine';

import {
  getTimeHorizonForecaster,
  type FutureLandscape,
  type HorizonForecast,
  type TimeHorizon,
  type Direction,
} from './TimeHorizonForecaster';

import {
  getCausalChainModel,
  type CausalExplanation,
  type CausalChain,
} from './CausalChainModel';

import {
  getScenarioGenerator,
  type ScenarioSet,
  type Scenario,
  type ScenarioType,
} from './ScenarioGenerator';

import {
  getPredictiveRiskEngine,
  type PredictiveRiskGrade,
  type RiskCurvePoint,
} from './PredictiveRiskEngine';

// ============================================================
// Types
// ============================================================

export interface SynthesizedShortTerm {
  horizon: 'short_term';
  timeframe: string;
  
  // Direction
  direction: Direction;
  directionConfidence: number;
  directionStrength: number;
  
  // Risk
  riskLevel: number;
  riskGrade: string;
  
  // Key signals
  primarySignal: string;
  supportingSignals: string[];
  contradictingSignals: string[];
  
  // Actionable insights
  recommendation: string;
  watchPoints: string[];
  
  // Confidence
  overallConfidence: number;
  dataQuality: number;
  
  generatedAt: number;
}

export interface SynthesizedMidTerm {
  horizon: 'mid_term';
  timeframe: string;
  
  // Direction
  direction: Direction;
  directionConfidence: number;
  trendStrength: number;
  
  // Risk projection
  currentRisk: number;
  projectedRisk: number;
  riskTrend: 'increasing' | 'decreasing' | 'stable';
  
  // Scenario outlook
  primaryScenario: string;
  alternativeScenarios: string[];
  
  // Key factors
  drivingFactors: string[];
  potentialCatalysts: string[];
  
  // Confidence
  overallConfidence: number;
  
  generatedAt: number;
}

export interface SynthesizedLongTerm {
  horizon: 'long_term';
  timeframe: string;
  
  // Direction
  direction: Direction;
  directionConfidence: number;
  trendPersistence: number;
  
  // Risk landscape
  riskRange: { min: number; max: number };
  peakRiskTime: string;
  
  // Structural analysis
  marketStructure: string;
  structuralRisks: string[];
  
  // Long-term factors
  macroFactors: string[];
  sustainabilityScore: number;
  
  // Confidence
  overallConfidence: number;
  uncertaintyLevel: number;
  
  generatedAt: number;
}

export interface SynthesizedScenarios {
  // Primary scenario
  mostLikely: {
    type: ScenarioType;
    label: string;
    probability: number;
    narrative: string;
  };
  
  // Alternative scenarios
  alternatives: Array<{
    type: ScenarioType;
    label: string;
    probability: number;
    shortDescription: string;
  }>;
  
  // Scenario distribution
  bullishProbability: number;
  bearishProbability: number;
  neutralProbability: number;
  
  // Key differentiators
  scenarioTriggers: string[];
  invalidationPoints: string[];
  
  // Confidence
  scenarioConfidence: number;
  scenarioSpread: number;
  
  generatedAt: number;
}

export interface SynthesizedCausalChain {
  // Primary causal narrative
  primaryNarrative: string;
  
  // Causal chains
  chains: Array<{
    rootCause: string;
    effect: string;
    confidence: number;
  }>;
  
  // Supporting/contradicting
  supportingEvidence: string[];
  contradictingEvidence: string[];
  
  // Reasoning quality
  reasoningDepth: number;
  causalConfidence: number;
  
  // Summary
  bulletPoints: string[];
  
  generatedAt: number;
}

export interface UnifiedForecast {
  id: string;
  generatedAt: number;
  
  // Executive summary
  executiveSummary: string;
  
  // Direction consensus
  consensusDirection: Direction;
  directionConfidence: number;
  directionAgreement: number; // How much do different horizons agree
  
  // Risk summary
  currentRiskLevel: number;
  riskGrade: string;
  riskOutlook: 'improving' | 'deteriorating' | 'stable';
  
  // Time horizon summaries
  shortTermOutlook: string;
  midTermOutlook: string;
  longTermOutlook: string;
  
  // Scenario summary
  primaryScenario: string;
  scenarioProbability: number;
  
  // Causal summary
  primaryDriver: string;
  causalNarrative: string;
  
  // Key metrics
  marketTemperature: number;
  manipulationRisk: number;
  liquidityHealth: number;
  whalePressure: number;
  
  // Actionable intelligence
  topRecommendations: string[];
  watchList: string[];
  riskMitigations: string[];
  
  // Confidence metrics
  overallConfidence: number;
  dataCompleteness: number;
  signalQuality: number;
  
  // Component references
  sourceSignalId: string | null;
  sourceLandscapeId: string | null;
  sourceScenarioSetId: string | null;
  sourceRiskGradeId: string | null;
  sourceCausalExplanationId: string | null;
  
  // Expiration
  validUntil: number;
}

export interface SynthesizerConfig {
  enableLogging: boolean;
  logPrefix: string;
  forecastTTLMs: number;
  autoRefreshMs: number;
  minConfidenceThreshold: number;
}

const DEFAULT_CONFIG: SynthesizerConfig = {
  enableLogging: true,
  logPrefix: '[SignalSynth]',
  forecastTTLMs: 120000, // 2 minutes
  autoRefreshMs: 30000, // 30 seconds
  minConfidenceThreshold: 0.3,
};

// ============================================================
// Autonomous Signal Synthesizer Implementation
// ============================================================

class AutonomousSignalSynthesizerImpl {
  private config: SynthesizerConfig;
  private forecastHistory: UnifiedForecast[] = [];
  private forecastCounter: number = 0;
  private lastSynthesis: {
    signal: PredictiveSignal | null;
    landscape: FutureLandscape | null;
    scenarios: ScenarioSet | null;
    riskGrade: PredictiveRiskGrade | null;
    causalExplanation: CausalExplanation | null;
  } = {
    signal: null,
    landscape: null,
    scenarios: null,
    riskGrade: null,
    causalExplanation: null,
  };
  
  private stats = {
    totalSynthesesGenerated: 0,
    averageConfidence: 0,
    consensusAgreement: 0,
  };

  constructor(config?: Partial<SynthesizerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.log('AutonomousSignalSynthesizer initialized');
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
  // Core Synthesis Methods
  // ============================================================

  /**
   * Synthesize short-term forecast from all available data
   */
  synthesizeShortTerm(): SynthesizedShortTerm {
    const landscape = this.getOrGenerateLandscape();
    const riskGrade = this.getOrGenerateRiskGrade();
    const signal = this.getLatestSignal();

    const shortTermForecast = landscape?.shortTerm;

    return {
      horizon: 'short_term',
      timeframe: '1-5 minutes',
      
      direction: shortTermForecast?.expectedDirection || 'uncertain',
      directionConfidence: shortTermForecast?.directionConfidence || 0,
      directionStrength: shortTermForecast?.directionStrength || 0,
      
      riskLevel: riskGrade?.overallRiskLevel || 50,
      riskGrade: riskGrade?.riskGrade || 'C',
      
      primarySignal: this.extractPrimarySignal(signal),
      supportingSignals: this.extractSupportingSignals(signal),
      contradictingSignals: this.extractContradictingSignals(signal),
      
      recommendation: this.generateShortTermRecommendation(shortTermForecast, riskGrade),
      watchPoints: this.generateWatchPoints(signal, 'short_term'),
      
      overallConfidence: shortTermForecast?.overallConfidence || 0,
      dataQuality: signal?.dataQuality || 0,
      
      generatedAt: Date.now(),
    };
  }

  /**
   * Synthesize mid-term forecast from all available data
   */
  synthesizeMidTerm(): SynthesizedMidTerm {
    const landscape = this.getOrGenerateLandscape();
    const riskGrade = this.getOrGenerateRiskGrade();
    const scenarios = this.getOrGenerateScenarios();

    const midTermForecast = landscape?.midTerm;

    // Find projected risk at mid-term
    const midTermRiskPoint = riskGrade?.riskCurve.find(p => p.timeOffsetMinutes === 30);

    return {
      horizon: 'mid_term',
      timeframe: '15-45 minutes',
      
      direction: midTermForecast?.expectedDirection || 'uncertain',
      directionConfidence: midTermForecast?.directionConfidence || 0,
      trendStrength: midTermForecast?.signalStrength || 0,
      
      currentRisk: riskGrade?.overallRiskLevel || 50,
      projectedRisk: midTermRiskPoint?.projectedRisk || riskGrade?.overallRiskLevel || 50,
      riskTrend: this.determineRiskTrend(riskGrade),
      
      primaryScenario: scenarios?.primaryScenario.label || 'Unknown',
      alternativeScenarios: scenarios?.scenarios
        .filter(s => s.id !== scenarios.primaryScenario.id)
        .slice(0, 2)
        .map(s => s.label) || [],
      
      drivingFactors: midTermForecast?.riskFactors.slice(0, 3) || [],
      potentialCatalysts: this.extractPotentialCatalysts(scenarios),
      
      overallConfidence: midTermForecast?.overallConfidence || 0,
      
      generatedAt: Date.now(),
    };
  }

  /**
   * Synthesize long-term forecast from all available data
   */
  synthesizeLongTerm(): SynthesizedLongTerm {
    const landscape = this.getOrGenerateLandscape();
    const riskGrade = this.getOrGenerateRiskGrade();

    const longTermForecast = landscape?.longTerm;
    const extendedForecast = landscape?.extended;

    // Calculate risk range from curve
    const riskRange = this.calculateRiskRange(riskGrade?.riskCurve || []);

    return {
      horizon: 'long_term',
      timeframe: '1-3 hours',
      
      direction: longTermForecast?.expectedDirection || 'uncertain',
      directionConfidence: longTermForecast?.directionConfidence || 0,
      trendPersistence: landscape?.trendConsistency || 0,
      
      riskRange,
      peakRiskTime: this.formatPeakRiskTime(riskGrade?.projectedPeakTime || 0),
      
      marketStructure: this.describeMarketStructure(landscape),
      structuralRisks: this.extractStructuralRisks(riskGrade),
      
      macroFactors: this.extractMacroFactors(longTermForecast, extendedForecast),
      sustainabilityScore: this.calculateSustainabilityScore(landscape),
      
      overallConfidence: longTermForecast?.overallConfidence || 0,
      uncertaintyLevel: 1 - (longTermForecast?.overallConfidence || 0),
      
      generatedAt: Date.now(),
    };
  }

  /**
   * Synthesize scenario analysis from all available data
   */
  synthesizeScenarios(): SynthesizedScenarios {
    const scenarios = this.getOrGenerateScenarios();

    if (!scenarios) {
      return this.getDefaultScenarioSynthesis();
    }

    return {
      mostLikely: {
        type: scenarios.primaryScenario.type,
        label: scenarios.primaryScenario.label,
        probability: scenarios.primaryScenario.probability,
        narrative: scenarios.primaryScenario.narrative,
      },
      
      alternatives: scenarios.scenarios
        .filter(s => s.id !== scenarios.primaryScenario.id)
        .slice(0, 3)
        .map(s => ({
          type: s.type,
          label: s.label,
          probability: s.probability,
          shortDescription: s.shortDescription,
        })),
      
      bullishProbability: scenarios.bullishProbability,
      bearishProbability: scenarios.bearishProbability,
      neutralProbability: scenarios.neutralProbability,
      
      scenarioTriggers: this.extractScenarioTriggers(scenarios),
      invalidationPoints: this.extractInvalidationPoints(scenarios),
      
      scenarioConfidence: scenarios.primaryScenario.confidence,
      scenarioSpread: scenarios.scenarioSpread,
      
      generatedAt: Date.now(),
    };
  }

  /**
   * Synthesize causal chain analysis from all available data
   */
  synthesizeCausalChain(): SynthesizedCausalChain {
    const causalExplanation = this.getOrGenerateCausalExplanation();

    if (!causalExplanation) {
      return this.getDefaultCausalSynthesis();
    }

    return {
      primaryNarrative: causalExplanation.summaryExplanation,
      
      chains: causalExplanation.primaryChains.slice(0, 3).map(chain => ({
        rootCause: chain.rootCause,
        effect: chain.finalEffect,
        confidence: chain.overallConfidence,
      })),
      
      supportingEvidence: causalExplanation.supportingFactors.slice(0, 4),
      contradictingEvidence: causalExplanation.contradictingFactors.slice(0, 3),
      
      reasoningDepth: causalExplanation.reasoningDepth,
      causalConfidence: causalExplanation.confidenceLevel,
      
      bulletPoints: causalExplanation.bulletPoints.slice(0, 5),
      
      generatedAt: Date.now(),
    };
  }

  /**
   * Synthesize a unified forecast combining all modules
   */
  synthesizeUnifiedForecast(): UnifiedForecast {
    const forecastId = `unified_${Date.now()}_${++this.forecastCounter}`;
    const now = Date.now();

    // Get all component data
    const signal = this.getLatestSignal();
    const landscape = this.getOrGenerateLandscape();
    const scenarios = this.getOrGenerateScenarios();
    const riskGrade = this.getOrGenerateRiskGrade();
    const causalExplanation = this.getOrGenerateCausalExplanation();

    // Calculate consensus direction
    const { consensusDirection, directionConfidence, directionAgreement } = 
      this.calculateDirectionConsensus(landscape);

    // Generate executive summary
    const executiveSummary = this.generateExecutiveSummary(
      signal, landscape, scenarios, riskGrade, causalExplanation
    );

    // Generate outlook summaries
    const shortTermOutlook = this.generateHorizonOutlook(landscape?.shortTerm, 'short');
    const midTermOutlook = this.generateHorizonOutlook(landscape?.midTerm, 'mid');
    const longTermOutlook = this.generateHorizonOutlook(landscape?.longTerm, 'long');

    // Extract key metrics
    const marketTemperature = signal?.marketTemperature || 50;
    const manipulationRisk = signal?.manipulationLikelihood || 0;
    const liquidityHealth = riskGrade?.liquidityFragility.bidAskHealth || 70;
    const whalePressure = riskGrade?.whalePressure.overallPressure || 0;

    // Generate actionable intelligence
    const topRecommendations = this.generateTopRecommendations(
      landscape, scenarios, riskGrade
    );
    const watchList = this.generateWatchList(signal, riskGrade);
    const riskMitigations = riskGrade?.riskMitigationSuggestions.slice(0, 3) || [];

    // Calculate confidence metrics
    const overallConfidence = this.calculateOverallConfidence(
      signal, landscape, scenarios, riskGrade, causalExplanation
    );
    const dataCompleteness = this.calculateDataCompleteness(signal);
    const signalQuality = signal?.dataQuality || 0;

    const forecast: UnifiedForecast = {
      id: forecastId,
      generatedAt: now,
      
      executiveSummary,
      
      consensusDirection,
      directionConfidence,
      directionAgreement,
      
      currentRiskLevel: riskGrade?.overallRiskLevel || 50,
      riskGrade: riskGrade?.riskGrade || 'C',
      riskOutlook: this.determineRiskOutlook(riskGrade),
      
      shortTermOutlook,
      midTermOutlook,
      longTermOutlook,
      
      primaryScenario: scenarios?.primaryScenario.label || 'Unknown',
      scenarioProbability: scenarios?.primaryScenario.probability || 50,
      
      primaryDriver: causalExplanation?.primaryChains[0]?.rootCause || 'Multiple factors',
      causalNarrative: causalExplanation?.summaryExplanation || 'Insufficient data for causal analysis',
      
      marketTemperature,
      manipulationRisk,
      liquidityHealth,
      whalePressure,
      
      topRecommendations,
      watchList,
      riskMitigations,
      
      overallConfidence,
      dataCompleteness,
      signalQuality,
      
      sourceSignalId: signal?.id || null,
      sourceLandscapeId: landscape?.id || null,
      sourceScenarioSetId: scenarios?.id || null,
      sourceRiskGradeId: riskGrade?.id || null,
      sourceCausalExplanationId: causalExplanation?.id || null,
      
      validUntil: now + this.config.forecastTTLMs,
    };

    // Store in history
    this.addToHistory(forecast);
    
    // Update stats
    this.updateStats(forecast);

    this.log(`Unified forecast generated: ${forecastId}`, {
      direction: consensusDirection,
      confidence: overallConfidence.toFixed(2),
      risk: riskGrade?.overallRiskLevel,
    });

    return forecast;
  }

  // ============================================================
  // Data Retrieval Methods
  // ============================================================

  private getLatestSignal(): PredictiveSignal | null {
    const engine = getPredictiveSignalEngine();
    const signal = engine.getLatestSignal();
    if (signal) {
      this.lastSynthesis.signal = signal;
    }
    return signal || this.lastSynthesis.signal;
  }

  private getOrGenerateLandscape(): FutureLandscape | null {
    const forecaster = getTimeHorizonForecaster();
    let landscape = forecaster.getLatestLandscape();
    
    if (!landscape) {
      landscape = forecaster.generateFromCurrentSignal();
    }
    
    if (landscape) {
      this.lastSynthesis.landscape = landscape;
    }
    return landscape || this.lastSynthesis.landscape;
  }

  private getOrGenerateScenarios(): ScenarioSet | null {
    const generator = getScenarioGenerator();
    let scenarios = generator.getLatestScenarioSet();
    
    if (!scenarios) {
      const signal = this.getLatestSignal();
      if (signal) {
        scenarios = generator.generateFromSignal(signal);
      }
    }
    
    if (scenarios) {
      this.lastSynthesis.scenarios = scenarios;
    }
    return scenarios || this.lastSynthesis.scenarios;
  }

  private getOrGenerateRiskGrade(): PredictiveRiskGrade | null {
    const engine = getPredictiveRiskEngine();
    let riskGrade = engine.getLatestGrade();
    
    if (!riskGrade) {
      const signal = this.getLatestSignal();
      if (signal) {
        riskGrade = engine.generateRiskGrade(signal);
      }
    }
    
    if (riskGrade) {
      this.lastSynthesis.riskGrade = riskGrade;
    }
    return riskGrade || this.lastSynthesis.riskGrade;
  }

  private getOrGenerateCausalExplanation(): CausalExplanation | null {
    const model = getCausalChainModel();
    let explanation = model.getLatestExplanation();
    
    if (!explanation) {
      const signal = this.getLatestSignal();
      if (signal) {
        explanation = model.generateFromSignal(signal);
      }
    }
    
    if (explanation) {
      this.lastSynthesis.causalExplanation = explanation;
    }
    return explanation || this.lastSynthesis.causalExplanation;
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  private extractPrimarySignal(signal: PredictiveSignal | null): string {
    if (!signal || signal.contributingFactors.length === 0) {
      return 'No primary signal detected';
    }
    
    const topFactor = signal.contributingFactors.reduce((max, f) => 
      Math.abs(f.impact) > Math.abs(max.impact) ? f : max
    );
    
    return topFactor.description;
  }

  private extractSupportingSignals(signal: PredictiveSignal | null): string[] {
    if (!signal) return [];
    
    const dominantDirection = signal.upwardProbability > signal.downwardProbability ? 'up' : 'down';
    
    return signal.contributingFactors
      .filter(f => (dominantDirection === 'up' && f.impact > 0) || 
                   (dominantDirection === 'down' && f.impact < 0))
      .slice(0, 3)
      .map(f => f.description);
  }

  private extractContradictingSignals(signal: PredictiveSignal | null): string[] {
    if (!signal) return [];
    
    const dominantDirection = signal.upwardProbability > signal.downwardProbability ? 'up' : 'down';
    
    return signal.contributingFactors
      .filter(f => (dominantDirection === 'up' && f.impact < 0) || 
                   (dominantDirection === 'down' && f.impact > 0))
      .slice(0, 2)
      .map(f => f.description);
  }

  private generateShortTermRecommendation(
    forecast: HorizonForecast | undefined,
    riskGrade: PredictiveRiskGrade | null
  ): string {
    if (!forecast) return 'Insufficient data for recommendation';
    
    const direction = forecast.expectedDirection;
    const risk = riskGrade?.overallRiskLevel || 50;
    
    if (risk > 70) {
      return 'High risk environment - consider defensive positioning';
    }
    
    if (direction === 'bullish' && forecast.directionConfidence > 0.6) {
      return 'Short-term bullish bias with moderate confidence';
    } else if (direction === 'bearish' && forecast.directionConfidence > 0.6) {
      return 'Short-term bearish bias with moderate confidence';
    }
    
    return 'Mixed signals - wait for clearer direction';
  }

  private generateWatchPoints(signal: PredictiveSignal | null, horizon: string): string[] {
    const watchPoints: string[] = [];
    
    if (signal) {
      if (signal.manipulationLikelihood > 50) {
        watchPoints.push('Manipulation risk elevated');
      }
      if (signal.marketTemperature > 70) {
        watchPoints.push('High market temperature');
      }
      if (signal.marketTemperature < 30) {
        watchPoints.push('Low market activity');
      }
    }
    
    return watchPoints.slice(0, 3);
  }

  private determineRiskTrend(riskGrade: PredictiveRiskGrade | null): 'increasing' | 'decreasing' | 'stable' {
    if (!riskGrade || riskGrade.riskCurve.length < 2) return 'stable';
    
    const first = riskGrade.riskCurve[0].projectedRisk;
    const mid = riskGrade.riskCurve[Math.floor(riskGrade.riskCurve.length / 2)].projectedRisk;
    
    if (mid > first + 10) return 'increasing';
    if (mid < first - 10) return 'decreasing';
    return 'stable';
  }

  private extractPotentialCatalysts(scenarios: ScenarioSet | null): string[] {
    if (!scenarios) return [];
    
    const catalysts: string[] = [];
    for (const scenario of scenarios.scenarios.slice(0, 3)) {
      catalysts.push(...scenario.triggerThresholds.slice(0, 1).map(t => t.description));
    }
    
    return Array.from(new Set(catalysts)).slice(0, 3);
  }

  private calculateRiskRange(curve: RiskCurvePoint[]): { min: number; max: number } {
    if (curve.length === 0) return { min: 30, max: 70 };
    
    const risks = curve.map(p => p.projectedRisk);
    return {
      min: Math.min(...risks),
      max: Math.max(...risks),
    };
  }

  private formatPeakRiskTime(minutes: number): string {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  private describeMarketStructure(landscape: FutureLandscape | null): string {
    if (!landscape) return 'Unknown';
    
    if (landscape.trendConsistency > 0.8) {
      return `Strong ${landscape.dominantDirection} trend structure`;
    } else if (landscape.trendConsistency > 0.5) {
      return `Moderate ${landscape.dominantDirection} bias with some uncertainty`;
    }
    return 'Mixed structure with conflicting signals';
  }

  private extractStructuralRisks(riskGrade: PredictiveRiskGrade | null): string[] {
    if (!riskGrade) return [];
    
    const risks: string[] = [];
    
    for (const component of riskGrade.components) {
      if (component.score > 60) {
        risks.push(`${component.category.replace(/_/g, ' ')}: ${component.score}`);
      }
    }
    
    return risks.slice(0, 3);
  }

  private extractMacroFactors(
    longTerm: HorizonForecast | undefined,
    extended: HorizonForecast | undefined
  ): string[] {
    const factors: string[] = [];
    
    if (longTerm) {
      factors.push(...longTerm.riskFactors.slice(0, 2));
    }
    if (extended) {
      factors.push(...extended.riskFactors.slice(0, 2));
    }
    
    return Array.from(new Set(factors)).slice(0, 4);
  }

  private calculateSustainabilityScore(landscape: FutureLandscape | null): number {
    if (!landscape) return 50;
    
    // Higher consistency = more sustainable trend
    return Math.round(landscape.trendConsistency * 100);
  }

  private getDefaultScenarioSynthesis(): SynthesizedScenarios {
    return {
      mostLikely: {
        type: 'most_probable',
        label: 'Most Probable Scenario',
        probability: 50,
        narrative: 'Insufficient data for scenario analysis',
      },
      alternatives: [],
      bullishProbability: 33,
      bearishProbability: 33,
      neutralProbability: 34,
      scenarioTriggers: [],
      invalidationPoints: [],
      scenarioConfidence: 0,
      scenarioSpread: 0,
      generatedAt: Date.now(),
    };
  }

  private getDefaultCausalSynthesis(): SynthesizedCausalChain {
    return {
      primaryNarrative: 'Insufficient data for causal analysis',
      chains: [],
      supportingEvidence: [],
      contradictingEvidence: [],
      reasoningDepth: 0,
      causalConfidence: 0,
      bulletPoints: ['No causal chains available'],
      generatedAt: Date.now(),
    };
  }

  private extractScenarioTriggers(scenarios: ScenarioSet): string[] {
    const triggers: string[] = [];
    
    for (const scenario of scenarios.scenarios.slice(0, 3)) {
      triggers.push(...scenario.triggerThresholds.slice(0, 1).map(t => t.description));
    }
    
    return Array.from(new Set(triggers)).slice(0, 4);
  }

  private extractInvalidationPoints(scenarios: ScenarioSet): string[] {
    const points: string[] = [];
    
    for (const scenario of scenarios.scenarios.slice(0, 2)) {
      points.push(...scenario.invalidationConditions.slice(0, 2));
    }
    
    return Array.from(new Set(points)).slice(0, 4);
  }

  private calculateDirectionConsensus(landscape: FutureLandscape | null): {
    consensusDirection: Direction;
    directionConfidence: number;
    directionAgreement: number;
  } {
    if (!landscape) {
      return { consensusDirection: 'uncertain', directionConfidence: 0, directionAgreement: 0 };
    }

    const directions = [
      landscape.shortTerm.expectedDirection,
      landscape.midTerm.expectedDirection,
      landscape.longTerm.expectedDirection,
      landscape.extended.expectedDirection,
    ];

    // Count directions
    const counts: Record<Direction, number> = {
      bullish: 0,
      bearish: 0,
      neutral: 0,
      uncertain: 0,
    };

    for (const dir of directions) {
      counts[dir]++;
    }

    // Find consensus
    let consensusDirection: Direction = 'uncertain';
    let maxCount = 0;
    
    for (const [dir, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        consensusDirection = dir as Direction;
      }
    }

    const directionAgreement = maxCount / 4;
    const directionConfidence = landscape.landscapeConfidence * directionAgreement;

    return { consensusDirection, directionConfidence, directionAgreement };
  }

  private generateExecutiveSummary(
    signal: PredictiveSignal | null,
    landscape: FutureLandscape | null,
    scenarios: ScenarioSet | null,
    riskGrade: PredictiveRiskGrade | null,
    causalExplanation: CausalExplanation | null
  ): string {
    const parts: string[] = [];

    // Direction
    if (landscape) {
      parts.push(`Market shows ${landscape.dominantDirection} bias`);
    }

    // Risk
    if (riskGrade) {
      parts.push(`with ${riskGrade.riskLabel.toLowerCase()} (${riskGrade.overallRiskLevel}/100)`);
    }

    // Primary scenario
    if (scenarios) {
      parts.push(`Primary scenario: ${scenarios.primaryScenario.label} (${scenarios.primaryScenario.probability.toFixed(0)}%)`);
    }

    // Causal driver
    if (causalExplanation && causalExplanation.primaryChains.length > 0) {
      parts.push(`Key driver: ${causalExplanation.primaryChains[0].rootCause}`);
    }

    return parts.join('. ') + '.';
  }

  private generateHorizonOutlook(forecast: HorizonForecast | undefined, term: string): string {
    if (!forecast) return `${term}-term outlook unavailable`;
    
    return `${forecast.expectedDirection} with ${(forecast.directionConfidence * 100).toFixed(0)}% confidence, ` +
           `${forecast.riskState} risk`;
  }

  private determineRiskOutlook(riskGrade: PredictiveRiskGrade | null): 'improving' | 'deteriorating' | 'stable' {
    if (!riskGrade || riskGrade.riskCurve.length < 3) return 'stable';
    
    const current = riskGrade.overallRiskLevel;
    const projected = riskGrade.projectedPeakRisk;
    
    if (projected > current + 15) return 'deteriorating';
    if (projected < current - 15) return 'improving';
    return 'stable';
  }

  private generateTopRecommendations(
    landscape: FutureLandscape | null,
    scenarios: ScenarioSet | null,
    riskGrade: PredictiveRiskGrade | null
  ): string[] {
    const recommendations: string[] = [];

    // Risk-based recommendations
    if (riskGrade) {
      if (riskGrade.overallRiskLevel > 70) {
        recommendations.push('Reduce exposure due to elevated risk');
      }
      if (riskGrade.manipulationRisk.overallRisk > 60) {
        recommendations.push('Exercise caution - manipulation detected');
      }
      if (riskGrade.liquidityFragility.fragilityLevel === 'critical') {
        recommendations.push('Use limit orders - liquidity is fragile');
      }
    }

    // Direction-based recommendations
    if (landscape) {
      if (landscape.trendConsistency > 0.8) {
        recommendations.push(`Strong ${landscape.dominantDirection} trend - consider trend-following`);
      } else if (landscape.trendConsistency < 0.4) {
        recommendations.push('Mixed signals - wait for clarity');
      }
    }

    // Scenario-based recommendations
    if (scenarios && scenarios.primaryScenario.probability > 70) {
      recommendations.push(`High probability ${scenarios.primaryScenario.type.replace(/_/g, ' ')} scenario`);
    }

    return recommendations.slice(0, 4);
  }

  private generateWatchList(
    signal: PredictiveSignal | null,
    riskGrade: PredictiveRiskGrade | null
  ): string[] {
    const watchList: string[] = [];

    if (signal) {
      // Top contributing factors
      for (const factor of signal.contributingFactors.slice(0, 2)) {
        watchList.push(factor.description);
      }
    }

    if (riskGrade) {
      // Top risk entities
      for (const entity of riskGrade.topRiskEntities.slice(0, 2)) {
        watchList.push(entity.description);
      }
    }

    return Array.from(new Set(watchList)).slice(0, 5);
  }

  private calculateOverallConfidence(
    signal: PredictiveSignal | null,
    landscape: FutureLandscape | null,
    scenarios: ScenarioSet | null,
    riskGrade: PredictiveRiskGrade | null,
    causalExplanation: CausalExplanation | null
  ): number {
    const confidences: number[] = [];

    if (signal) confidences.push(signal.predictiveConfidence);
    if (landscape) confidences.push(landscape.landscapeConfidence);
    if (scenarios) confidences.push(scenarios.primaryScenario.confidence);
    if (riskGrade) confidences.push(riskGrade.overallConfidence);
    if (causalExplanation) confidences.push(causalExplanation.confidenceLevel);

    if (confidences.length === 0) return 0;

    return confidences.reduce((a, b) => a + b, 0) / confidences.length;
  }

  private calculateDataCompleteness(signal: PredictiveSignal | null): number {
    if (!signal) return 0;
    return signal.inputsAvailable / 6;
  }

  // ============================================================
  // History Management
  // ============================================================

  private addToHistory(forecast: UnifiedForecast): void {
    this.forecastHistory.push(forecast);
    
    if (this.forecastHistory.length > 30) {
      this.forecastHistory = this.forecastHistory.slice(-30);
    }
  }

  private updateStats(forecast: UnifiedForecast): void {
    this.stats.totalSynthesesGenerated++;
    
    const n = this.stats.totalSynthesesGenerated;
    this.stats.averageConfidence = 
      (this.stats.averageConfidence * (n - 1) + forecast.overallConfidence) / n;
    this.stats.consensusAgreement = 
      (this.stats.consensusAgreement * (n - 1) + forecast.directionAgreement) / n;
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get the latest unified forecast
   */
  getLatestForecast(): UnifiedForecast | null {
    if (this.forecastHistory.length === 0) return null;
    return this.forecastHistory[this.forecastHistory.length - 1];
  }

  /**
   * Get forecast history
   */
  getHistory(limit?: number): UnifiedForecast[] {
    if (limit) {
      return this.forecastHistory.slice(-limit);
    }
    return [...this.forecastHistory];
  }

  /**
   * Force refresh all data and generate new forecast
   */
  refreshAndSynthesize(inputs?: PredictiveInputs): UnifiedForecast {
    // Generate fresh signal if inputs provided
    if (inputs) {
      const signalEngine = getPredictiveSignalEngine();
      signalEngine.generateSignal(inputs);
    }

    // Clear cached data to force regeneration
    this.lastSynthesis = {
      signal: null,
      landscape: null,
      scenarios: null,
      riskGrade: null,
      causalExplanation: null,
    };

    return this.synthesizeUnifiedForecast();
  }

  /**
   * Get synthesizer statistics
   */
  getStats(): typeof this.stats & { historySize: number } {
    return {
      ...this.stats,
      historySize: this.forecastHistory.length,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): SynthesizerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SynthesizerConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.forecastHistory = [];
    this.log('Forecast history cleared');
  }

  /**
   * Reset synthesizer state
   */
  reset(): void {
    this.forecastHistory = [];
    this.forecastCounter = 0;
    this.lastSynthesis = {
      signal: null,
      landscape: null,
      scenarios: null,
      riskGrade: null,
      causalExplanation: null,
    };
    this.stats = {
      totalSynthesesGenerated: 0,
      averageConfidence: 0,
      consensusAgreement: 0,
    };
    this.log('Synthesizer reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let instance: AutonomousSignalSynthesizerImpl | null = null;

/**
 * Get the AutonomousSignalSynthesizer singleton instance
 */
export function getAutonomousSignalSynthesizer(): AutonomousSignalSynthesizerImpl {
  if (!instance) {
    instance = new AutonomousSignalSynthesizerImpl();
  }
  return instance;
}

/**
 * Create a new AutonomousSignalSynthesizer with custom config
 */
export function createAutonomousSignalSynthesizer(
  config?: Partial<SynthesizerConfig>
): AutonomousSignalSynthesizerImpl {
  return new AutonomousSignalSynthesizerImpl(config);
}
