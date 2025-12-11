/**
 * FutureStateNarrator.ts
 * 
 * Phase 6: Ultra-Deep Foresight Engine - MODULE 7
 * 
 * Natural-language narrative generator for predictive intelligence.
 * 
 * Guidelines:
 * - Sound analytical
 * - Sound predictive
 * - Sound human
 * - Avoid robotic repetition
 * - Use causality and reasoning
 * - Use uncertainty language when appropriate
 * - Provide structured, clean spoken forecasts
 * 
 * Example style:
 * "Given the tightening cluster in Constellation and increased whale accumulation,
 * the next 15-30 minutes show upward bias unless liquidity pressure breaks below threshold X."
 * 
 * This is a purely additive, 100% isolated module.
 * Logging prefix: [FutureNarrator]
 */

import {
  getAutonomousSignalSynthesizer,
  type UnifiedForecast,
  type SynthesizedShortTerm,
  type SynthesizedMidTerm,
  type SynthesizedLongTerm,
  type SynthesizedScenarios,
  type SynthesizedCausalChain,
} from './AutonomousSignalSynthesizer';

import { type Direction } from './TimeHorizonForecaster';
import { type ScenarioType } from './ScenarioGenerator';

// ============================================================
// Types
// ============================================================

export type NarrativeStyle = 'analytical' | 'conversational' | 'brief' | 'detailed';

export type NarrativeLength = 'short' | 'medium' | 'long';

export interface NarrativeOptions {
  style: NarrativeStyle;
  length: NarrativeLength;
  includeUncertainty: boolean;
  includeCausality: boolean;
  includeRecommendations: boolean;
  speakableFormat: boolean;
}

export interface GeneratedNarrative {
  id: string;
  generatedAt: number;
  
  // Main narrative
  narrative: string;
  
  // Structured components
  opening: string;
  body: string[];
  conclusion: string;
  
  // Metadata
  style: NarrativeStyle;
  length: NarrativeLength;
  wordCount: number;
  estimatedSpeakTime: number; // seconds
  
  // Source
  sourceForecastId: string | null;
}

export interface ForecastNarrative extends GeneratedNarrative {
  type: 'forecast';
  horizon: 'short' | 'mid' | 'long' | 'unified';
}

export interface ScenarioNarrative extends GeneratedNarrative {
  type: 'scenario';
  scenarioType: ScenarioType;
}

export interface RiskNarrative extends GeneratedNarrative {
  type: 'risk';
  riskLevel: number;
}

export interface NarratorConfig {
  enableLogging: boolean;
  logPrefix: string;
  defaultStyle: NarrativeStyle;
  defaultLength: NarrativeLength;
  wordsPerMinute: number; // For speak time estimation
  maxNarrativeLength: number; // characters
}

const DEFAULT_CONFIG: NarratorConfig = {
  enableLogging: true,
  logPrefix: '[FutureNarrator]',
  defaultStyle: 'analytical',
  defaultLength: 'medium',
  wordsPerMinute: 150,
  maxNarrativeLength: 2000,
};

const DEFAULT_OPTIONS: NarrativeOptions = {
  style: 'analytical',
  length: 'medium',
  includeUncertainty: true,
  includeCausality: true,
  includeRecommendations: true,
  speakableFormat: true,
};

// ============================================================
// Narrative Templates and Phrases
// ============================================================

const DIRECTION_PHRASES: Record<Direction, string[]> = {
  bullish: [
    'showing bullish momentum',
    'leaning toward upward movement',
    'displaying positive bias',
    'indicating buying pressure',
    'suggesting upward trajectory',
  ],
  bearish: [
    'showing bearish momentum',
    'leaning toward downward movement',
    'displaying negative bias',
    'indicating selling pressure',
    'suggesting downward trajectory',
  ],
  neutral: [
    'showing sideways consolidation',
    'displaying range-bound behavior',
    'indicating indecision',
    'suggesting consolidation phase',
    'showing balanced forces',
  ],
  uncertain: [
    'showing mixed signals',
    'displaying uncertainty',
    'indicating conflicting pressures',
    'suggesting unclear direction',
    'showing ambiguous patterns',
  ],
};

const CONFIDENCE_PHRASES: Record<string, string[]> = {
  high: [
    'with high confidence',
    'with strong conviction',
    'supported by multiple indicators',
    'backed by consistent signals',
  ],
  medium: [
    'with moderate confidence',
    'with reasonable certainty',
    'supported by several factors',
    'with some conviction',
  ],
  low: [
    'with limited confidence',
    'with significant uncertainty',
    'requiring caution',
    'pending confirmation',
  ],
};

const RISK_PHRASES: Record<string, string[]> = {
  low: [
    'Risk levels remain contained',
    'The risk environment is favorable',
    'Current conditions suggest manageable risk',
  ],
  moderate: [
    'Risk levels are moderate',
    'Some caution is warranted',
    'Risk factors are present but manageable',
  ],
  elevated: [
    'Risk levels are elevated',
    'Increased caution is advised',
    'Several risk factors are active',
  ],
  high: [
    'Risk levels are high',
    'Significant caution is required',
    'Multiple risk factors are elevated',
  ],
  critical: [
    'Risk levels are critical',
    'Extreme caution is necessary',
    'Severe risk conditions detected',
  ],
};

const UNCERTAINTY_PHRASES = [
  'however, this remains subject to change',
  'though uncertainty persists',
  'pending further confirmation',
  'with the caveat that conditions may shift',
  'while acknowledging potential volatility',
];

const CAUSALITY_CONNECTORS = [
  'Given that',
  'Because',
  'As a result of',
  'Due to',
  'Considering',
  'In light of',
  'Based on',
];

const TRANSITION_PHRASES = [
  'Additionally,',
  'Furthermore,',
  'Moreover,',
  'Looking ahead,',
  'In terms of risk,',
  'Regarding scenarios,',
  'On the other hand,',
];

// ============================================================
// Future State Narrator Implementation
// ============================================================

class FutureStateNarratorImpl {
  private config: NarratorConfig;
  private narrativeHistory: GeneratedNarrative[] = [];
  private narrativeCounter: number = 0;
  private phraseRotation: Record<string, number> = {};
  
  private stats = {
    totalNarrativesGenerated: 0,
    averageWordCount: 0,
    averageSpeakTime: 0,
  };

  constructor(config?: Partial<NarratorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.log('FutureStateNarrator initialized');
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
  // Main Narrative Generation Methods
  // ============================================================

  /**
   * Generate a complete forecast narrative from unified forecast
   */
  narrateUnifiedForecast(
    forecast: UnifiedForecast,
    options: Partial<NarrativeOptions> = {}
  ): ForecastNarrative {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const narrativeId = `narrative_unified_${Date.now()}_${++this.narrativeCounter}`;

    // Generate opening
    const opening = this.generateForecastOpening(forecast, opts);

    // Generate body sections
    const body = this.generateForecastBody(forecast, opts);

    // Generate conclusion
    const conclusion = this.generateForecastConclusion(forecast, opts);

    // Combine into full narrative
    const narrative = this.combineNarrative(opening, body, conclusion, opts);

    // Calculate metrics
    const wordCount = this.countWords(narrative);
    const estimatedSpeakTime = this.estimateSpeakTime(wordCount);

    const result: ForecastNarrative = {
      id: narrativeId,
      generatedAt: Date.now(),
      type: 'forecast',
      horizon: 'unified',
      
      narrative,
      opening,
      body,
      conclusion,
      
      style: opts.style,
      length: opts.length,
      wordCount,
      estimatedSpeakTime,
      
      sourceForecastId: forecast.id,
    };

    this.addToHistory(result);
    this.updateStats(result);

    this.log(`Unified narrative generated: ${narrativeId}`, { wordCount, speakTime: estimatedSpeakTime });

    return result;
  }

  /**
   * Generate a short-term forecast narrative
   */
  narrateShortTerm(
    shortTerm: SynthesizedShortTerm,
    options: Partial<NarrativeOptions> = {}
  ): ForecastNarrative {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const narrativeId = `narrative_short_${Date.now()}_${++this.narrativeCounter}`;

    const opening = this.generateShortTermOpening(shortTerm, opts);
    const body = this.generateShortTermBody(shortTerm, opts);
    const conclusion = this.generateShortTermConclusion(shortTerm, opts);

    const narrative = this.combineNarrative(opening, body, conclusion, opts);
    const wordCount = this.countWords(narrative);
    const estimatedSpeakTime = this.estimateSpeakTime(wordCount);

    const result: ForecastNarrative = {
      id: narrativeId,
      generatedAt: Date.now(),
      type: 'forecast',
      horizon: 'short',
      
      narrative,
      opening,
      body,
      conclusion,
      
      style: opts.style,
      length: opts.length,
      wordCount,
      estimatedSpeakTime,
      
      sourceForecastId: null,
    };

    this.addToHistory(result);
    this.updateStats(result);

    return result;
  }

  /**
   * Generate a mid-term forecast narrative
   */
  narrateMidTerm(
    midTerm: SynthesizedMidTerm,
    options: Partial<NarrativeOptions> = {}
  ): ForecastNarrative {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const narrativeId = `narrative_mid_${Date.now()}_${++this.narrativeCounter}`;

    const opening = this.generateMidTermOpening(midTerm, opts);
    const body = this.generateMidTermBody(midTerm, opts);
    const conclusion = this.generateMidTermConclusion(midTerm, opts);

    const narrative = this.combineNarrative(opening, body, conclusion, opts);
    const wordCount = this.countWords(narrative);
    const estimatedSpeakTime = this.estimateSpeakTime(wordCount);

    const result: ForecastNarrative = {
      id: narrativeId,
      generatedAt: Date.now(),
      type: 'forecast',
      horizon: 'mid',
      
      narrative,
      opening,
      body,
      conclusion,
      
      style: opts.style,
      length: opts.length,
      wordCount,
      estimatedSpeakTime,
      
      sourceForecastId: null,
    };

    this.addToHistory(result);
    this.updateStats(result);

    return result;
  }

  /**
   * Generate a long-term forecast narrative
   */
  narrateLongTerm(
    longTerm: SynthesizedLongTerm,
    options: Partial<NarrativeOptions> = {}
  ): ForecastNarrative {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const narrativeId = `narrative_long_${Date.now()}_${++this.narrativeCounter}`;

    const opening = this.generateLongTermOpening(longTerm, opts);
    const body = this.generateLongTermBody(longTerm, opts);
    const conclusion = this.generateLongTermConclusion(longTerm, opts);

    const narrative = this.combineNarrative(opening, body, conclusion, opts);
    const wordCount = this.countWords(narrative);
    const estimatedSpeakTime = this.estimateSpeakTime(wordCount);

    const result: ForecastNarrative = {
      id: narrativeId,
      generatedAt: Date.now(),
      type: 'forecast',
      horizon: 'long',
      
      narrative,
      opening,
      body,
      conclusion,
      
      style: opts.style,
      length: opts.length,
      wordCount,
      estimatedSpeakTime,
      
      sourceForecastId: null,
    };

    this.addToHistory(result);
    this.updateStats(result);

    return result;
  }

  /**
   * Generate a scenario narrative
   */
  narrateScenarios(
    scenarios: SynthesizedScenarios,
    options: Partial<NarrativeOptions> = {}
  ): ScenarioNarrative {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const narrativeId = `narrative_scenario_${Date.now()}_${++this.narrativeCounter}`;

    const opening = this.generateScenarioOpening(scenarios, opts);
    const body = this.generateScenarioBody(scenarios, opts);
    const conclusion = this.generateScenarioConclusion(scenarios, opts);

    const narrative = this.combineNarrative(opening, body, conclusion, opts);
    const wordCount = this.countWords(narrative);
    const estimatedSpeakTime = this.estimateSpeakTime(wordCount);

    const result: ScenarioNarrative = {
      id: narrativeId,
      generatedAt: Date.now(),
      type: 'scenario',
      scenarioType: scenarios.mostLikely.type,
      
      narrative,
      opening,
      body,
      conclusion,
      
      style: opts.style,
      length: opts.length,
      wordCount,
      estimatedSpeakTime,
      
      sourceForecastId: null,
    };

    this.addToHistory(result);
    this.updateStats(result);

    return result;
  }

  /**
   * Generate a causal chain narrative
   */
  narrateCausalChain(
    causal: SynthesizedCausalChain,
    options: Partial<NarrativeOptions> = {}
  ): GeneratedNarrative {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const narrativeId = `narrative_causal_${Date.now()}_${++this.narrativeCounter}`;

    const opening = this.generateCausalOpening(causal, opts);
    const body = this.generateCausalBody(causal, opts);
    const conclusion = this.generateCausalConclusion(causal, opts);

    const narrative = this.combineNarrative(opening, body, conclusion, opts);
    const wordCount = this.countWords(narrative);
    const estimatedSpeakTime = this.estimateSpeakTime(wordCount);

    const result: GeneratedNarrative = {
      id: narrativeId,
      generatedAt: Date.now(),
      
      narrative,
      opening,
      body,
      conclusion,
      
      style: opts.style,
      length: opts.length,
      wordCount,
      estimatedSpeakTime,
      
      sourceForecastId: null,
    };

    this.addToHistory(result);
    this.updateStats(result);

    return result;
  }

  // ============================================================
  // Unified Forecast Narrative Generation
  // ============================================================

  private generateForecastOpening(forecast: UnifiedForecast, opts: NarrativeOptions): string {
    const directionPhrase = this.getRotatingPhrase(DIRECTION_PHRASES[forecast.consensusDirection]);
    const confidenceLevel = this.getConfidenceLevel(forecast.directionConfidence);
    const confidencePhrase = this.getRotatingPhrase(CONFIDENCE_PHRASES[confidenceLevel]);

    if (opts.style === 'brief') {
      return `Market is ${directionPhrase} ${confidencePhrase}.`;
    }

    if (opts.style === 'conversational') {
      return `Looking at the current market conditions, we're seeing the market ${directionPhrase} ${confidencePhrase}.`;
    }

    // Analytical style
    return `Current analysis indicates the market is ${directionPhrase} ${confidencePhrase}.`;
  }

  private generateForecastBody(forecast: UnifiedForecast, opts: NarrativeOptions): string[] {
    const body: string[] = [];

    // Risk assessment
    const riskLevel = this.getRiskLevel(forecast.currentRiskLevel);
    body.push(this.getRotatingPhrase(RISK_PHRASES[riskLevel]));

    // Causality section
    if (opts.includeCausality && forecast.primaryDriver !== 'Multiple factors') {
      const connector = this.getRotatingPhrase(CAUSALITY_CONNECTORS);
      body.push(`${connector} ${forecast.primaryDriver.toLowerCase()}, ${forecast.causalNarrative.toLowerCase()}`);
    }

    // Scenario section (for medium and long narratives)
    if (opts.length !== 'short') {
      body.push(`The primary scenario is ${forecast.primaryScenario} with ${forecast.scenarioProbability.toFixed(0)}% probability.`);
    }

    // Key metrics (for detailed narratives)
    if (opts.length === 'long' || opts.style === 'detailed') {
      body.push(`Market temperature is at ${forecast.marketTemperature}, with manipulation risk at ${forecast.manipulationRisk.toFixed(0)}%.`);
    }

    // Uncertainty caveat
    if (opts.includeUncertainty && forecast.overallConfidence < 0.7) {
      body.push(this.getRotatingPhrase(UNCERTAINTY_PHRASES));
    }

    return body;
  }

  private generateForecastConclusion(forecast: UnifiedForecast, opts: NarrativeOptions): string {
    if (opts.includeRecommendations && forecast.topRecommendations.length > 0) {
      const recommendation = forecast.topRecommendations[0];
      
      if (opts.style === 'brief') {
        return recommendation;
      }
      
      return `In summary, ${recommendation.toLowerCase()}.`;
    }

    // Default conclusion based on direction
    const outlook = forecast.riskOutlook === 'improving' ? 'improving' :
                   forecast.riskOutlook === 'deteriorating' ? 'deteriorating' : 'stable';
    
    return `Overall outlook is ${forecast.consensusDirection} with ${outlook} risk conditions.`;
  }

  // ============================================================
  // Short-Term Narrative Generation
  // ============================================================

  private generateShortTermOpening(shortTerm: SynthesizedShortTerm, opts: NarrativeOptions): string {
    const directionPhrase = this.getRotatingPhrase(DIRECTION_PHRASES[shortTerm.direction]);
    
    if (opts.style === 'brief') {
      return `Short-term: ${directionPhrase}.`;
    }

    return `In the next ${shortTerm.timeframe}, the market is ${directionPhrase}.`;
  }

  private generateShortTermBody(shortTerm: SynthesizedShortTerm, opts: NarrativeOptions): string[] {
    const body: string[] = [];

    // Primary signal
    if (shortTerm.primarySignal !== 'No primary signal detected') {
      body.push(`Primary driver: ${shortTerm.primarySignal}.`);
    }

    // Supporting signals
    if (opts.length !== 'short' && shortTerm.supportingSignals.length > 0) {
      body.push(`Supporting factors include ${shortTerm.supportingSignals.slice(0, 2).join(' and ')}.`);
    }

    // Contradicting signals
    if (opts.length === 'long' && shortTerm.contradictingSignals.length > 0) {
      body.push(`However, ${shortTerm.contradictingSignals[0]} presents a counterargument.`);
    }

    return body;
  }

  private generateShortTermConclusion(shortTerm: SynthesizedShortTerm, opts: NarrativeOptions): string {
    return shortTerm.recommendation;
  }

  // ============================================================
  // Mid-Term Narrative Generation
  // ============================================================

  private generateMidTermOpening(midTerm: SynthesizedMidTerm, opts: NarrativeOptions): string {
    const directionPhrase = this.getRotatingPhrase(DIRECTION_PHRASES[midTerm.direction]);
    
    return `Looking at the ${midTerm.timeframe} timeframe, the market is ${directionPhrase}.`;
  }

  private generateMidTermBody(midTerm: SynthesizedMidTerm, opts: NarrativeOptions): string[] {
    const body: string[] = [];

    // Risk projection
    body.push(`Risk is currently at ${midTerm.currentRisk} and projected to be ${midTerm.projectedRisk} (${midTerm.riskTrend}).`);

    // Primary scenario
    body.push(`The primary scenario is ${midTerm.primaryScenario}.`);

    // Driving factors
    if (opts.length !== 'short' && midTerm.drivingFactors.length > 0) {
      body.push(`Key drivers: ${midTerm.drivingFactors.slice(0, 2).join(', ')}.`);
    }

    return body;
  }

  private generateMidTermConclusion(midTerm: SynthesizedMidTerm, opts: NarrativeOptions): string {
    if (midTerm.potentialCatalysts.length > 0) {
      return `Watch for ${midTerm.potentialCatalysts[0]} as a potential catalyst.`;
    }
    return `Monitor for changes in the ${midTerm.primaryScenario} scenario.`;
  }

  // ============================================================
  // Long-Term Narrative Generation
  // ============================================================

  private generateLongTermOpening(longTerm: SynthesizedLongTerm, opts: NarrativeOptions): string {
    const directionPhrase = this.getRotatingPhrase(DIRECTION_PHRASES[longTerm.direction]);
    
    return `Over the ${longTerm.timeframe} horizon, the market is ${directionPhrase}.`;
  }

  private generateLongTermBody(longTerm: SynthesizedLongTerm, opts: NarrativeOptions): string[] {
    const body: string[] = [];

    // Market structure
    body.push(`Market structure: ${longTerm.marketStructure}.`);

    // Risk range
    body.push(`Risk is expected to range from ${longTerm.riskRange.min} to ${longTerm.riskRange.max}, with peak risk at ${longTerm.peakRiskTime}.`);

    // Structural risks
    if (opts.length !== 'short' && longTerm.structuralRisks.length > 0) {
      body.push(`Structural risks include ${longTerm.structuralRisks.slice(0, 2).join(' and ')}.`);
    }

    // Sustainability
    if (opts.length === 'long') {
      body.push(`Trend sustainability score: ${longTerm.sustainabilityScore}%.`);
    }

    return body;
  }

  private generateLongTermConclusion(longTerm: SynthesizedLongTerm, opts: NarrativeOptions): string {
    if (longTerm.uncertaintyLevel > 0.5) {
      return `Long-term outlook carries significant uncertainty. Monitor macro factors closely.`;
    }
    return `Long-term trend appears ${longTerm.trendPersistence > 0.7 ? 'sustainable' : 'uncertain'}.`;
  }

  // ============================================================
  // Scenario Narrative Generation
  // ============================================================

  private generateScenarioOpening(scenarios: SynthesizedScenarios, opts: NarrativeOptions): string {
    return `The most likely scenario is ${scenarios.mostLikely.label} with ${scenarios.mostLikely.probability.toFixed(0)}% probability.`;
  }

  private generateScenarioBody(scenarios: SynthesizedScenarios, opts: NarrativeOptions): string[] {
    const body: string[] = [];

    // Main scenario narrative
    if (opts.length !== 'short') {
      body.push(scenarios.mostLikely.narrative);
    }

    // Alternative scenarios
    if (scenarios.alternatives.length > 0 && opts.length !== 'short') {
      const altScenarios = scenarios.alternatives.slice(0, 2)
        .map(s => `${s.label} (${s.probability.toFixed(0)}%)`)
        .join(' and ');
      body.push(`Alternative scenarios include ${altScenarios}.`);
    }

    // Probability distribution
    if (opts.length === 'long') {
      body.push(`Overall bias: ${scenarios.bullishProbability.toFixed(0)}% bullish, ${scenarios.bearishProbability.toFixed(0)}% bearish, ${scenarios.neutralProbability.toFixed(0)}% neutral.`);
    }

    return body;
  }

  private generateScenarioConclusion(scenarios: SynthesizedScenarios, opts: NarrativeOptions): string {
    if (scenarios.scenarioTriggers.length > 0) {
      return `Key trigger to watch: ${scenarios.scenarioTriggers[0]}.`;
    }
    return `Monitor for scenario invalidation signals.`;
  }

  // ============================================================
  // Causal Chain Narrative Generation
  // ============================================================

  private generateCausalOpening(causal: SynthesizedCausalChain, opts: NarrativeOptions): string {
    return causal.primaryNarrative || 'Analyzing the causal factors behind current market conditions.';
  }

  private generateCausalBody(causal: SynthesizedCausalChain, opts: NarrativeOptions): string[] {
    const body: string[] = [];

    // Causal chains
    for (const chain of causal.chains.slice(0, 2)) {
      const connector = this.getRotatingPhrase(CAUSALITY_CONNECTORS);
      body.push(`${connector} ${chain.rootCause}, we see ${chain.effect}.`);
    }

    // Supporting evidence
    if (opts.length !== 'short' && causal.supportingEvidence.length > 0) {
      body.push(`Supporting evidence: ${causal.supportingEvidence.slice(0, 2).join(', ')}.`);
    }

    // Contradicting evidence
    if (opts.length === 'long' && causal.contradictingEvidence.length > 0) {
      body.push(`Contradicting factors: ${causal.contradictingEvidence[0]}.`);
    }

    return body;
  }

  private generateCausalConclusion(causal: SynthesizedCausalChain, opts: NarrativeOptions): string {
    const confidence = causal.causalConfidence > 0.7 ? 'high' : 
                      causal.causalConfidence > 0.4 ? 'moderate' : 'limited';
    return `Causal analysis confidence: ${confidence}.`;
  }

  // ============================================================
  // Utility Methods
  // ============================================================

  private combineNarrative(
    opening: string,
    body: string[],
    conclusion: string,
    opts: NarrativeOptions
  ): string {
    let parts: string[] = [opening];

    // Add body with transitions
    for (let i = 0; i < body.length; i++) {
      if (i > 0 && opts.length !== 'short') {
        // Add transition for longer narratives
        parts.push(body[i]);
      } else {
        parts.push(body[i]);
      }
    }

    parts.push(conclusion);

    let narrative = parts.join(' ');

    // Apply speakable format adjustments
    if (opts.speakableFormat) {
      narrative = this.makeSpeakable(narrative);
    }

    // Truncate if too long
    if (narrative.length > this.config.maxNarrativeLength) {
      narrative = narrative.substring(0, this.config.maxNarrativeLength - 3) + '...';
    }

    return narrative;
  }

  private makeSpeakable(text: string): string {
    // Replace abbreviations
    let speakable = text
      .replace(/%/g, ' percent')
      .replace(/\$/g, ' dollars ')
      .replace(/&/g, ' and ')
      .replace(/\//g, ' or ')
      .replace(/\+/g, ' plus ')
      .replace(/-(\d)/g, ' minus $1');

    // Clean up multiple spaces
    speakable = speakable.replace(/\s+/g, ' ').trim();

    return speakable;
  }

  private getRotatingPhrase(phrases: string[]): string {
    const key = phrases.join('|');
    if (!this.phraseRotation[key]) {
      this.phraseRotation[key] = 0;
    }
    
    const index = this.phraseRotation[key] % phrases.length;
    this.phraseRotation[key]++;
    
    return phrases[index];
  }

  private getConfidenceLevel(confidence: number): string {
    if (confidence > 0.7) return 'high';
    if (confidence > 0.4) return 'medium';
    return 'low';
  }

  private getRiskLevel(risk: number): string {
    if (risk < 30) return 'low';
    if (risk < 50) return 'moderate';
    if (risk < 70) return 'elevated';
    if (risk < 85) return 'high';
    return 'critical';
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(w => w.length > 0).length;
  }

  private estimateSpeakTime(wordCount: number): number {
    return Math.ceil((wordCount / this.config.wordsPerMinute) * 60);
  }

  // ============================================================
  // Quick Narrative Methods
  // ============================================================

  /**
   * Generate a quick one-liner forecast
   */
  generateQuickForecast(): string {
    const synthesizer = getAutonomousSignalSynthesizer();
    const forecast = synthesizer.getLatestForecast();
    
    if (!forecast) {
      return 'No forecast data available.';
    }

    const direction = this.getRotatingPhrase(DIRECTION_PHRASES[forecast.consensusDirection]);
    return `Market is ${direction} with ${forecast.currentRiskLevel} risk.`;
  }

  /**
   * Generate a quick risk summary
   */
  generateQuickRiskSummary(): string {
    const synthesizer = getAutonomousSignalSynthesizer();
    const forecast = synthesizer.getLatestForecast();
    
    if (!forecast) {
      return 'No risk data available.';
    }

    const riskLevel = this.getRiskLevel(forecast.currentRiskLevel);
    return this.getRotatingPhrase(RISK_PHRASES[riskLevel]);
  }

  /**
   * Generate a quick scenario summary
   */
  generateQuickScenarioSummary(): string {
    const synthesizer = getAutonomousSignalSynthesizer();
    const forecast = synthesizer.getLatestForecast();
    
    if (!forecast) {
      return 'No scenario data available.';
    }

    return `Primary scenario: ${forecast.primaryScenario} (${forecast.scenarioProbability.toFixed(0)}% probability).`;
  }

  // ============================================================
  // History Management
  // ============================================================

  private addToHistory(narrative: GeneratedNarrative): void {
    this.narrativeHistory.push(narrative);
    
    if (this.narrativeHistory.length > 50) {
      this.narrativeHistory = this.narrativeHistory.slice(-50);
    }
  }

  private updateStats(narrative: GeneratedNarrative): void {
    this.stats.totalNarrativesGenerated++;
    
    const n = this.stats.totalNarrativesGenerated;
    this.stats.averageWordCount = 
      (this.stats.averageWordCount * (n - 1) + narrative.wordCount) / n;
    this.stats.averageSpeakTime = 
      (this.stats.averageSpeakTime * (n - 1) + narrative.estimatedSpeakTime) / n;
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get the latest narrative
   */
  getLatestNarrative(): GeneratedNarrative | null {
    if (this.narrativeHistory.length === 0) return null;
    return this.narrativeHistory[this.narrativeHistory.length - 1];
  }

  /**
   * Get narrative history
   */
  getHistory(limit?: number): GeneratedNarrative[] {
    if (limit) {
      return this.narrativeHistory.slice(-limit);
    }
    return [...this.narrativeHistory];
  }

  /**
   * Generate a complete narrative from current data
   */
  generateCurrentNarrative(options: Partial<NarrativeOptions> = {}): ForecastNarrative | null {
    const synthesizer = getAutonomousSignalSynthesizer();
    const forecast = synthesizer.getLatestForecast() || synthesizer.synthesizeUnifiedForecast();
    
    if (!forecast) {
      this.log('No forecast available for narrative generation');
      return null;
    }

    return this.narrateUnifiedForecast(forecast, options);
  }

  /**
   * Get narrator statistics
   */
  getStats(): typeof this.stats & { historySize: number } {
    return {
      ...this.stats,
      historySize: this.narrativeHistory.length,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): NarratorConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<NarratorConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.narrativeHistory = [];
    this.phraseRotation = {};
    this.log('Narrative history cleared');
  }

  /**
   * Reset narrator state
   */
  reset(): void {
    this.narrativeHistory = [];
    this.narrativeCounter = 0;
    this.phraseRotation = {};
    this.stats = {
      totalNarrativesGenerated: 0,
      averageWordCount: 0,
      averageSpeakTime: 0,
    };
    this.log('Narrator reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let instance: FutureStateNarratorImpl | null = null;

/**
 * Get the FutureStateNarrator singleton instance
 */
export function getFutureStateNarrator(): FutureStateNarratorImpl {
  if (!instance) {
    instance = new FutureStateNarratorImpl();
  }
  return instance;
}

/**
 * Create a new FutureStateNarrator with custom config
 */
export function createFutureStateNarrator(
  config?: Partial<NarratorConfig>
): FutureStateNarratorImpl {
  return new FutureStateNarratorImpl(config);
}
