/**
 * CausalChainModel.ts
 * 
 * Phase 6: Ultra-Deep Foresight Engine - MODULE 3
 * 
 * A reasoning engine that generates causal explanations from raw model outputs.
 * Converts predictive signals into natural causal reasoning.
 * 
 * Example output:
 * "Whale accumulation increased by 18%, and the Constellation cluster 
 * tightened by 3.1%, suggesting pressure toward an upward short-term move."
 * 
 * Returns structured JSON for Copilot consumption.
 * 
 * This is a purely additive, 100% isolated module.
 * Logging prefix: [CausalChain]
 */

import {
  type PredictiveSignal,
  type ContributingFactor,
  type ManipulationType,
} from './PredictiveSignalEngine';

import {
  type HorizonForecast,
  type FutureLandscape,
  type Direction,
  type RiskState,
} from './TimeHorizonForecaster';

// ============================================================
// Types
// ============================================================

export type CausalRelation = 'causes' | 'suggests' | 'indicates' | 'correlates_with' | 'leads_to' | 'precedes';

export type CausalStrength = 'strong' | 'moderate' | 'weak' | 'speculative';

export interface CausalLink {
  id: string;
  cause: string;
  effect: string;
  relation: CausalRelation;
  strength: CausalStrength;
  confidence: number;
  evidence: string[];
  timeframe: string;
}

export interface CausalChain {
  id: string;
  links: CausalLink[];
  rootCause: string;
  finalEffect: string;
  overallConfidence: number;
  narrative: string;
  shortNarrative: string;
}

export interface CausalExplanation {
  id: string;
  generatedAt: number;
  
  // Primary causal chains
  primaryChains: CausalChain[];
  
  // Supporting evidence
  supportingFactors: string[];
  contradictingFactors: string[];
  
  // Natural language outputs
  fullExplanation: string;
  summaryExplanation: string;
  bulletPoints: string[];
  
  // Reasoning metadata
  reasoningDepth: number;
  factorsConsidered: number;
  confidenceLevel: number;
  
  // Source references
  sourceSignalId: string | null;
  sourceLandscapeId: string | null;
}

export interface CausalModelConfig {
  enableLogging: boolean;
  logPrefix: string;
  maxChainLength: number;
  minConfidenceThreshold: number;
  maxChainsPerExplanation: number;
  enableSpeculativeReasoning: boolean;
}

const DEFAULT_CONFIG: CausalModelConfig = {
  enableLogging: true,
  logPrefix: '[CausalChain]',
  maxChainLength: 5,
  minConfidenceThreshold: 0.4,
  maxChainsPerExplanation: 4,
  enableSpeculativeReasoning: true,
};

// ============================================================
// Causal Templates
// ============================================================

interface CausalTemplate {
  pattern: string;
  causes: string[];
  effects: string[];
  relation: CausalRelation;
  strengthMapping: Record<string, CausalStrength>;
}

const CAUSAL_TEMPLATES: CausalTemplate[] = [
  {
    pattern: 'whale_accumulation_bullish',
    causes: ['whale accumulation', 'large wallet inflows', 'whale buying pressure'],
    effects: ['upward price pressure', 'bullish momentum', 'short-term price increase'],
    relation: 'suggests',
    strengthMapping: { high: 'strong', medium: 'moderate', low: 'weak' },
  },
  {
    pattern: 'whale_distribution_bearish',
    causes: ['whale distribution', 'large wallet outflows', 'whale selling pressure'],
    effects: ['downward price pressure', 'bearish momentum', 'short-term price decrease'],
    relation: 'suggests',
    strengthMapping: { high: 'strong', medium: 'moderate', low: 'weak' },
  },
  {
    pattern: 'liquidity_fragility',
    causes: ['liquidity fragility', 'thin order books', 'liquidity displacement'],
    effects: ['increased volatility', 'slippage risk', 'price instability'],
    relation: 'leads_to',
    strengthMapping: { high: 'strong', medium: 'moderate', low: 'weak' },
  },
  {
    pattern: 'cluster_tightening',
    causes: ['constellation cluster tightening', 'entity consolidation', 'network compression'],
    effects: ['imminent breakout', 'directional move', 'volatility expansion'],
    relation: 'indicates',
    strengthMapping: { high: 'strong', medium: 'moderate', low: 'weak' },
  },
  {
    pattern: 'hydra_divergence',
    causes: ['Hydra pattern divergence', 'multi-head activity', 'coordinated movements'],
    effects: ['market manipulation risk', 'artificial price action', 'unreliable signals'],
    relation: 'suggests',
    strengthMapping: { high: 'strong', medium: 'moderate', low: 'weak' },
  },
  {
    pattern: 'momentum_shift',
    causes: ['momentum shift', 'trend reversal signals', 'velocity change'],
    effects: ['direction change', 'trend continuation', 'consolidation phase'],
    relation: 'precedes',
    strengthMapping: { high: 'strong', medium: 'moderate', low: 'weak' },
  },
  {
    pattern: 'risk_escalation',
    causes: ['risk score increase', 'high-risk entity activity', 'risk concentration'],
    effects: ['elevated caution', 'potential losses', 'defensive positioning'],
    relation: 'causes',
    strengthMapping: { high: 'strong', medium: 'moderate', low: 'weak' },
  },
  {
    pattern: 'manipulation_detected',
    causes: ['manipulation patterns', 'wash trading', 'spoofing activity'],
    effects: ['unreliable price discovery', 'artificial movements', 'increased risk'],
    relation: 'causes',
    strengthMapping: { high: 'strong', medium: 'moderate', low: 'weak' },
  },
];

// ============================================================
// Causal Chain Model Implementation
// ============================================================

class CausalChainModelImpl {
  private config: CausalModelConfig;
  private explanationHistory: CausalExplanation[] = [];
  private explanationCounter: number = 0;
  private linkCounter: number = 0;
  private chainCounter: number = 0;
  
  private stats = {
    totalExplanationsGenerated: 0,
    totalChainsGenerated: 0,
    averageChainLength: 0,
    averageConfidence: 0,
  };

  constructor(config?: Partial<CausalModelConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.log('CausalChainModel initialized');
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
  // Main Explanation Generation
  // ============================================================

  /**
   * Generate a causal explanation from a predictive signal
   */
  generateFromSignal(signal: PredictiveSignal): CausalExplanation {
    const explanationId = `explanation_${Date.now()}_${++this.explanationCounter}`;
    const now = Date.now();

    // Extract causal chains from contributing factors
    const primaryChains = this.extractCausalChains(signal);

    // Categorize factors
    const { supporting, contradicting } = this.categorizeFactors(signal);

    // Generate natural language explanations
    const fullExplanation = this.generateFullExplanation(signal, primaryChains);
    const summaryExplanation = this.generateSummaryExplanation(signal, primaryChains);
    const bulletPoints = this.generateBulletPoints(signal, primaryChains);

    // Calculate metadata
    const reasoningDepth = this.calculateReasoningDepth(primaryChains);
    const confidenceLevel = this.calculateOverallConfidence(primaryChains, signal);

    const explanation: CausalExplanation = {
      id: explanationId,
      generatedAt: now,
      
      primaryChains,
      
      supportingFactors: supporting,
      contradictingFactors: contradicting,
      
      fullExplanation,
      summaryExplanation,
      bulletPoints,
      
      reasoningDepth,
      factorsConsidered: signal.contributingFactors.length,
      confidenceLevel,
      
      sourceSignalId: signal.id,
      sourceLandscapeId: null,
    };

    // Store in history
    this.addToHistory(explanation);
    
    // Update stats
    this.updateStats(explanation);

    this.log(`Explanation generated: ${explanationId}`, {
      chains: primaryChains.length,
      confidence: confidenceLevel.toFixed(2),
    });

    return explanation;
  }

  /**
   * Generate a causal explanation from a future landscape
   */
  generateFromLandscape(landscape: FutureLandscape): CausalExplanation {
    if (!landscape.sourceSignal) {
      // Generate a basic explanation without signal
      return this.generateBasicExplanation(landscape);
    }

    const explanation = this.generateFromSignal(landscape.sourceSignal);
    
    // Enhance with landscape insights
    const enhancedExplanation: CausalExplanation = {
      ...explanation,
      sourceLandscapeId: landscape.id,
      bulletPoints: [
        ...explanation.bulletPoints,
        ...landscape.keyInsights.map(i => `Insight: ${i}`),
      ].slice(0, 8),
    };

    return enhancedExplanation;
  }

  // ============================================================
  // Causal Chain Extraction
  // ============================================================

  private extractCausalChains(signal: PredictiveSignal): CausalChain[] {
    const chains: CausalChain[] = [];

    // Group factors by source
    const factorsBySource = this.groupFactorsBySource(signal.contributingFactors);

    // Generate chains for each significant factor group
    for (const [source, factors] of Object.entries(factorsBySource)) {
      if (factors.length === 0) continue;

      const chain = this.buildCausalChain(source, factors, signal);
      if (chain && chain.overallConfidence >= this.config.minConfidenceThreshold) {
        chains.push(chain);
      }
    }

    // Add manipulation chain if detected
    if (signal.manipulationLikelihood > 50) {
      const manipChain = this.buildManipulationChain(signal);
      if (manipChain) {
        chains.push(manipChain);
      }
    }

    // Sort by confidence and limit
    return chains
      .sort((a, b) => b.overallConfidence - a.overallConfidence)
      .slice(0, this.config.maxChainsPerExplanation);
  }

  private groupFactorsBySource(factors: ContributingFactor[]): Record<string, ContributingFactor[]> {
    const grouped: Record<string, ContributingFactor[]> = {};
    
    for (const factor of factors) {
      if (!grouped[factor.source]) {
        grouped[factor.source] = [];
      }
      grouped[factor.source].push(factor);
    }

    return grouped;
  }

  private buildCausalChain(
    source: string,
    factors: ContributingFactor[],
    signal: PredictiveSignal
  ): CausalChain | null {
    const chainId = `chain_${Date.now()}_${++this.chainCounter}`;
    const links: CausalLink[] = [];

    // Find matching template
    const template = this.findMatchingTemplate(source, factors);
    if (!template) return null;

    // Build links from factors
    for (const factor of factors) {
      const link = this.buildCausalLink(factor, template, signal);
      if (link) {
        links.push(link);
      }
    }

    if (links.length === 0) return null;

    // Determine root cause and final effect
    const rootCause = this.determineRootCause(factors, template);
    const finalEffect = this.determineFinalEffect(factors, signal, template);

    // Generate narratives
    const narrative = this.generateChainNarrative(links, rootCause, finalEffect);
    const shortNarrative = this.generateShortNarrative(rootCause, finalEffect, links[0]?.relation || 'suggests');

    // Calculate overall confidence
    const overallConfidence = this.calculateChainConfidence(links, factors);

    return {
      id: chainId,
      links,
      rootCause,
      finalEffect,
      overallConfidence,
      narrative,
      shortNarrative,
    };
  }

  private buildCausalLink(
    factor: ContributingFactor,
    template: CausalTemplate,
    signal: PredictiveSignal
  ): CausalLink | null {
    const linkId = `link_${Date.now()}_${++this.linkCounter}`;

    // Determine cause and effect from factor
    const cause = factor.description;
    const effect = this.inferEffect(factor, template, signal);

    // Determine strength based on impact
    let strength: CausalStrength;
    const absImpact = Math.abs(factor.impact);
    if (absImpact > 40) {
      strength = 'strong';
    } else if (absImpact > 25) {
      strength = 'moderate';
    } else if (absImpact > 10) {
      strength = 'weak';
    } else {
      strength = 'speculative';
    }

    // Determine timeframe
    const timeframe = this.inferTimeframe(factor, signal);

    return {
      id: linkId,
      cause,
      effect,
      relation: template.relation,
      strength,
      confidence: factor.confidence,
      evidence: [factor.description],
      timeframe,
    };
  }

  private buildManipulationChain(signal: PredictiveSignal): CausalChain | null {
    const chainId = `chain_manip_${Date.now()}_${++this.chainCounter}`;

    const manipType = signal.manipulationType || 'unknown';
    const likelihood = signal.manipulationLikelihood;

    const link: CausalLink = {
      id: `link_manip_${++this.linkCounter}`,
      cause: `${manipType.replace(/_/g, ' ')} patterns detected`,
      effect: 'unreliable price signals and elevated risk',
      relation: 'causes',
      strength: likelihood > 70 ? 'strong' : likelihood > 50 ? 'moderate' : 'weak',
      confidence: signal.manipulationConfidence,
      evidence: [`Manipulation likelihood: ${likelihood.toFixed(0)}%`],
      timeframe: 'immediate',
    };

    const narrative = `Detected ${manipType.replace(/_/g, ' ')} patterns with ${likelihood.toFixed(0)}% likelihood, ` +
      `which causes unreliable price signals and elevated risk in the short term.`;

    return {
      id: chainId,
      links: [link],
      rootCause: `${manipType.replace(/_/g, ' ')} activity`,
      finalEffect: 'market signal distortion',
      overallConfidence: signal.manipulationConfidence,
      narrative,
      shortNarrative: `${manipType.replace(/_/g, ' ')} detected, causing signal distortion`,
    };
  }

  // ============================================================
  // Template Matching
  // ============================================================

  private findMatchingTemplate(source: string, factors: ContributingFactor[]): CausalTemplate | null {
    // Map source to template patterns
    const sourcePatterns: Record<string, string[]> = {
      whale: ['whale_accumulation_bullish', 'whale_distribution_bearish'],
      liquidity: ['liquidity_fragility'],
      constellation: ['cluster_tightening'],
      hydra: ['hydra_divergence'],
      ecoscan: ['momentum_shift'],
      entity: ['risk_escalation'],
    };

    const patterns = sourcePatterns[source] || [];
    
    // Find best matching template based on factor characteristics
    for (const patternName of patterns) {
      const template = CAUSAL_TEMPLATES.find(t => t.pattern === patternName);
      if (template) {
        // Check if factors match the template direction
        const avgImpact = factors.reduce((sum, f) => sum + f.impact, 0) / factors.length;
        
        if (patternName.includes('bullish') && avgImpact > 0) return template;
        if (patternName.includes('bearish') && avgImpact < 0) return template;
        if (!patternName.includes('bullish') && !patternName.includes('bearish')) return template;
      }
    }

    // Return first matching template as fallback
    return CAUSAL_TEMPLATES.find(t => patterns.includes(t.pattern)) || null;
  }

  // ============================================================
  // Inference Methods
  // ============================================================

  private inferEffect(
    factor: ContributingFactor,
    template: CausalTemplate,
    signal: PredictiveSignal
  ): string {
    // Use template effects as base
    const baseEffect = template.effects[0];

    // Customize based on signal direction
    if (signal.upwardProbability > signal.downwardProbability) {
      if (factor.impact > 0) {
        return `supporting ${baseEffect} with bullish bias`;
      } else {
        return `counteracting bullish momentum`;
      }
    } else if (signal.downwardProbability > signal.upwardProbability) {
      if (factor.impact < 0) {
        return `supporting ${baseEffect} with bearish bias`;
      } else {
        return `counteracting bearish momentum`;
      }
    }

    return baseEffect;
  }

  private inferTimeframe(factor: ContributingFactor, signal: PredictiveSignal): string {
    // Infer timeframe based on factor source and signal temperature
    const sourceTimeframes: Record<string, string> = {
      whale: 'short to medium term',
      liquidity: 'immediate',
      hydra: 'short term',
      ecoscan: 'medium term',
      entity: 'medium to long term',
      constellation: 'short to medium term',
    };

    const baseTimeframe = sourceTimeframes[factor.source] || 'short term';

    // Adjust based on market temperature
    if (signal.marketTemperature > 70) {
      return 'immediate to ' + baseTimeframe;
    }

    return baseTimeframe;
  }

  private determineRootCause(factors: ContributingFactor[], template: CausalTemplate): string {
    // Find the factor with highest absolute impact
    const topFactor = factors.reduce((max, f) => 
      Math.abs(f.impact) > Math.abs(max.impact) ? f : max
    );

    return topFactor.description;
  }

  private determineFinalEffect(
    factors: ContributingFactor[],
    signal: PredictiveSignal,
    template: CausalTemplate
  ): string {
    // Determine final effect based on aggregate impact and signal direction
    const totalImpact = factors.reduce((sum, f) => sum + f.impact, 0);

    if (totalImpact > 30) {
      return 'upward price pressure in the short term';
    } else if (totalImpact < -30) {
      return 'downward price pressure in the short term';
    } else if (signal.marketTemperature > 70) {
      return 'increased volatility and uncertain direction';
    } else {
      return 'consolidation with neutral bias';
    }
  }

  // ============================================================
  // Narrative Generation
  // ============================================================

  private generateChainNarrative(links: CausalLink[], rootCause: string, finalEffect: string): string {
    if (links.length === 0) {
      return `Analysis suggests ${finalEffect}.`;
    }

    const parts: string[] = [];

    // Start with root cause
    parts.push(rootCause);

    // Add intermediate links
    for (let i = 0; i < Math.min(links.length, 3); i++) {
      const link = links[i];
      const relationWord = this.getRelationWord(link.relation);
      parts.push(`${relationWord} ${link.effect}`);
    }

    // Combine into narrative
    let narrative = parts[0];
    for (let i = 1; i < parts.length; i++) {
      if (i === parts.length - 1) {
        narrative += `, ultimately ${parts[i]}`;
      } else {
        narrative += `, which ${parts[i]}`;
      }
    }

    return narrative + '.';
  }

  private generateShortNarrative(rootCause: string, finalEffect: string, relation: CausalRelation): string {
    const relationWord = this.getRelationWord(relation);
    return `${rootCause} ${relationWord} ${finalEffect}`;
  }

  private getRelationWord(relation: CausalRelation): string {
    const words: Record<CausalRelation, string> = {
      causes: 'causes',
      suggests: 'suggests',
      indicates: 'indicates',
      correlates_with: 'correlates with',
      leads_to: 'leads to',
      precedes: 'precedes',
    };
    return words[relation];
  }

  // ============================================================
  // Factor Categorization
  // ============================================================

  private categorizeFactors(signal: PredictiveSignal): { supporting: string[]; contradicting: string[] } {
    const supporting: string[] = [];
    const contradicting: string[] = [];

    // Determine dominant direction
    const dominantDirection = signal.upwardProbability > signal.downwardProbability ? 'up' : 'down';

    for (const factor of signal.contributingFactors) {
      if (dominantDirection === 'up') {
        if (factor.impact > 0) {
          supporting.push(factor.description);
        } else {
          contradicting.push(factor.description);
        }
      } else {
        if (factor.impact < 0) {
          supporting.push(factor.description);
        } else {
          contradicting.push(factor.description);
        }
      }
    }

    return { supporting, contradicting };
  }

  // ============================================================
  // Full Explanation Generation
  // ============================================================

  private generateFullExplanation(signal: PredictiveSignal, chains: CausalChain[]): string {
    const parts: string[] = [];

    // Opening statement
    const direction = signal.upwardProbability > signal.downwardProbability ? 'bullish' : 
                     signal.downwardProbability > signal.upwardProbability ? 'bearish' : 'neutral';
    parts.push(`Current analysis indicates a ${direction} bias with ${(signal.predictiveConfidence * 100).toFixed(0)}% confidence.`);

    // Add chain narratives
    for (const chain of chains) {
      parts.push(chain.narrative);
    }

    // Add market temperature context
    if (signal.marketTemperature > 70) {
      parts.push(`Market temperature is elevated at ${signal.marketTemperature}, suggesting heightened activity and potential volatility.`);
    } else if (signal.marketTemperature < 30) {
      parts.push(`Market temperature is low at ${signal.marketTemperature}, indicating reduced activity and potential consolidation.`);
    }

    // Add manipulation warning if relevant
    if (signal.manipulationLikelihood > 50) {
      parts.push(`Caution: ${signal.manipulationType?.replace(/_/g, ' ') || 'manipulation'} patterns detected with ${signal.manipulationLikelihood.toFixed(0)}% likelihood.`);
    }

    return parts.join(' ');
  }

  private generateSummaryExplanation(signal: PredictiveSignal, chains: CausalChain[]): string {
    if (chains.length === 0) {
      return 'Insufficient data for causal analysis.';
    }

    // Use the top chain's short narrative
    const topChain = chains[0];
    const direction = signal.upwardProbability > signal.downwardProbability ? 'upward' : 
                     signal.downwardProbability > signal.upwardProbability ? 'downward' : 'sideways';

    return `${topChain.shortNarrative}, suggesting ${direction} pressure in the short term.`;
  }

  private generateBulletPoints(signal: PredictiveSignal, chains: CausalChain[]): string[] {
    const bullets: string[] = [];

    // Direction bullet
    const direction = signal.upwardProbability > signal.downwardProbability ? 'Bullish' : 
                     signal.downwardProbability > signal.upwardProbability ? 'Bearish' : 'Neutral';
    bullets.push(`${direction} bias with ${(signal.predictiveConfidence * 100).toFixed(0)}% confidence`);

    // Chain bullets
    for (const chain of chains.slice(0, 3)) {
      bullets.push(chain.shortNarrative);
    }

    // Temperature bullet
    bullets.push(`Market temperature: ${signal.marketTemperature}/100`);

    // Risk bullet if elevated
    if (signal.manipulationLikelihood > 50) {
      bullets.push(`Manipulation risk: ${signal.manipulationLikelihood.toFixed(0)}%`);
    }

    return bullets;
  }

  // ============================================================
  // Confidence Calculations
  // ============================================================

  private calculateChainConfidence(links: CausalLink[], factors: ContributingFactor[]): number {
    if (links.length === 0) return 0;

    // Average link confidence
    const avgLinkConfidence = links.reduce((sum, l) => sum + l.confidence, 0) / links.length;

    // Factor confidence
    const avgFactorConfidence = factors.reduce((sum, f) => sum + f.confidence, 0) / factors.length;

    // Combine with decay for chain length
    const lengthDecay = Math.pow(0.95, links.length - 1);

    return avgLinkConfidence * 0.5 + avgFactorConfidence * 0.5 * lengthDecay;
  }

  private calculateOverallConfidence(chains: CausalChain[], signal: PredictiveSignal): number {
    if (chains.length === 0) return signal.predictiveConfidence * 0.5;

    // Average chain confidence
    const avgChainConfidence = chains.reduce((sum, c) => sum + c.overallConfidence, 0) / chains.length;

    // Combine with signal confidence
    return avgChainConfidence * 0.6 + signal.predictiveConfidence * 0.4;
  }

  private calculateReasoningDepth(chains: CausalChain[]): number {
    if (chains.length === 0) return 0;

    // Sum of all link counts
    const totalLinks = chains.reduce((sum, c) => sum + c.links.length, 0);

    return Math.min(10, totalLinks);
  }

  // ============================================================
  // Basic Explanation (without signal)
  // ============================================================

  private generateBasicExplanation(landscape: FutureLandscape): CausalExplanation {
    const explanationId = `explanation_basic_${Date.now()}_${++this.explanationCounter}`;

    const fullExplanation = `Analysis shows ${landscape.dominantDirection} direction with ${landscape.overallRiskState} risk. ` +
      landscape.keyInsights.join(' ');

    return {
      id: explanationId,
      generatedAt: Date.now(),
      
      primaryChains: [],
      
      supportingFactors: landscape.keyInsights,
      contradictingFactors: landscape.warnings,
      
      fullExplanation,
      summaryExplanation: `${landscape.dominantDirection} outlook with ${landscape.overallRiskState} risk`,
      bulletPoints: [
        `Direction: ${landscape.dominantDirection}`,
        `Risk: ${landscape.overallRiskState}`,
        ...landscape.keyInsights.slice(0, 3),
      ],
      
      reasoningDepth: 1,
      factorsConsidered: landscape.keyInsights.length,
      confidenceLevel: landscape.landscapeConfidence,
      
      sourceSignalId: null,
      sourceLandscapeId: landscape.id,
    };
  }

  // ============================================================
  // History Management
  // ============================================================

  private addToHistory(explanation: CausalExplanation): void {
    this.explanationHistory.push(explanation);
    
    // Keep only last 50 explanations
    if (this.explanationHistory.length > 50) {
      this.explanationHistory = this.explanationHistory.slice(-50);
    }
  }

  private updateStats(explanation: CausalExplanation): void {
    this.stats.totalExplanationsGenerated++;
    this.stats.totalChainsGenerated += explanation.primaryChains.length;
    
    // Update running averages
    const n = this.stats.totalExplanationsGenerated;
    
    if (explanation.primaryChains.length > 0) {
      const avgLength = explanation.primaryChains.reduce((sum, c) => sum + c.links.length, 0) / 
                       explanation.primaryChains.length;
      this.stats.averageChainLength = 
        (this.stats.averageChainLength * (n - 1) + avgLength) / n;
    }
    
    this.stats.averageConfidence = 
      (this.stats.averageConfidence * (n - 1) + explanation.confidenceLevel) / n;
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get the latest explanation
   */
  getLatestExplanation(): CausalExplanation | null {
    if (this.explanationHistory.length === 0) return null;
    return this.explanationHistory[this.explanationHistory.length - 1];
  }

  /**
   * Get explanation history
   */
  getHistory(limit?: number): CausalExplanation[] {
    if (limit) {
      return this.explanationHistory.slice(-limit);
    }
    return [...this.explanationHistory];
  }

  /**
   * Generate a quick causal statement from factors
   */
  generateQuickStatement(factors: ContributingFactor[]): string {
    if (factors.length === 0) {
      return 'No significant factors detected.';
    }

    const topFactor = factors.reduce((max, f) => 
      Math.abs(f.impact) > Math.abs(max.impact) ? f : max
    );

    const direction = topFactor.impact > 0 ? 'upward' : 'downward';
    return `${topFactor.description}, suggesting ${direction} pressure.`;
  }

  /**
   * Get model statistics
   */
  getStats(): typeof this.stats & { historySize: number } {
    return {
      ...this.stats,
      historySize: this.explanationHistory.length,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): CausalModelConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CausalModelConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.explanationHistory = [];
    this.log('Explanation history cleared');
  }

  /**
   * Reset model state
   */
  reset(): void {
    this.explanationHistory = [];
    this.explanationCounter = 0;
    this.linkCounter = 0;
    this.chainCounter = 0;
    this.stats = {
      totalExplanationsGenerated: 0,
      totalChainsGenerated: 0,
      averageChainLength: 0,
      averageConfidence: 0,
    };
    this.log('Model reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let instance: CausalChainModelImpl | null = null;

/**
 * Get the CausalChainModel singleton instance
 */
export function getCausalChainModel(): CausalChainModelImpl {
  if (!instance) {
    instance = new CausalChainModelImpl();
  }
  return instance;
}

/**
 * Create a new CausalChainModel with custom config
 */
export function createCausalChainModel(
  config?: Partial<CausalModelConfig>
): CausalChainModelImpl {
  return new CausalChainModelImpl(config);
}
