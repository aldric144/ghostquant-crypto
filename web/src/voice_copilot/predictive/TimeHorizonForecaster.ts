/**
 * TimeHorizonForecaster.ts
 * 
 * Phase 6: Ultra-Deep Foresight Engine - MODULE 2
 * 
 * Produces multi-horizon forecasts:
 * - Short-term (1-5 min)
 * - Mid-term (15-45 min)
 * - Long-term (1-3 hours)
 * - Extended (12-24 hours)
 * 
 * For each horizon, computes:
 * - Expected direction
 * - Risk state
 * - Signal strength
 * - Volatility band
 * - Top contributing entities
 * - Confidence score
 * 
 * Creates a full "future landscape" for the Copilot.
 * 
 * This is a purely additive, 100% isolated module.
 * Logging prefix: [TimeHorizon]
 */

import {
  getPredictiveSignalEngine,
  type PredictiveSignal,
  type PredictiveInputs,
  type ContributingFactor,
} from './PredictiveSignalEngine';

// ============================================================
// Types
// ============================================================

export type TimeHorizon = 'short_term' | 'mid_term' | 'long_term' | 'extended';

export type Direction = 'bullish' | 'bearish' | 'neutral' | 'uncertain';

export type RiskState = 'low' | 'moderate' | 'elevated' | 'high' | 'critical';

export interface VolatilityBand {
  lower: number;
  upper: number;
  expected: number;
  width: number;
  confidence: number;
}

export interface ContributingEntity {
  id: string;
  name: string;
  type: 'whale' | 'exchange' | 'protocol' | 'token' | 'cluster' | 'unknown';
  impact: number;
  direction: Direction;
  confidence: number;
}

export interface HorizonForecast {
  horizon: TimeHorizon;
  horizonLabel: string;
  timeRangeMinutes: { min: number; max: number };
  
  // Direction analysis
  expectedDirection: Direction;
  directionConfidence: number;
  directionStrength: number; // 0-100
  
  // Risk analysis
  riskState: RiskState;
  riskScore: number; // 0-100
  riskFactors: string[];
  
  // Signal analysis
  signalStrength: number; // 0-100
  signalQuality: number; // 0-1
  
  // Volatility analysis
  volatilityBand: VolatilityBand;
  volatilityTrend: 'increasing' | 'decreasing' | 'stable';
  
  // Contributing entities
  topContributingEntities: ContributingEntity[];
  
  // Confidence
  overallConfidence: number; // 0-1
  dataCompleteness: number; // 0-1
  
  // Metadata
  generatedAt: number;
  expiresAt: number;
  basedOnSignalId: string | null;
}

export interface FutureLandscape {
  id: string;
  generatedAt: number;
  
  // All horizon forecasts
  shortTerm: HorizonForecast;
  midTerm: HorizonForecast;
  longTerm: HorizonForecast;
  extended: HorizonForecast;
  
  // Aggregate analysis
  dominantDirection: Direction;
  overallRiskState: RiskState;
  trendConsistency: number; // 0-1, how consistent are forecasts across horizons
  
  // Key insights
  keyInsights: string[];
  warnings: string[];
  opportunities: string[];
  
  // Confidence
  landscapeConfidence: number;
  
  // Source data
  sourceSignal: PredictiveSignal | null;
}

export interface ForecasterConfig {
  enableLogging: boolean;
  logPrefix: string;
  
  // Horizon definitions (in minutes)
  horizons: {
    short_term: { min: number; max: number; label: string };
    mid_term: { min: number; max: number; label: string };
    long_term: { min: number; max: number; label: string };
    extended: { min: number; max: number; label: string };
  };
  
  // Decay factors for confidence over time
  confidenceDecay: {
    short_term: number;
    mid_term: number;
    long_term: number;
    extended: number;
  };
  
  // TTL for forecasts (in ms)
  forecastTTL: {
    short_term: number;
    mid_term: number;
    long_term: number;
    extended: number;
  };
  
  // Thresholds
  thresholds: {
    highRisk: number;
    strongSignal: number;
    highVolatility: number;
  };
}

const DEFAULT_CONFIG: ForecasterConfig = {
  enableLogging: true,
  logPrefix: '[TimeHorizon]',
  
  horizons: {
    short_term: { min: 1, max: 5, label: '1-5 minutes' },
    mid_term: { min: 15, max: 45, label: '15-45 minutes' },
    long_term: { min: 60, max: 180, label: '1-3 hours' },
    extended: { min: 720, max: 1440, label: '12-24 hours' },
  },
  
  confidenceDecay: {
    short_term: 0.95,
    mid_term: 0.85,
    long_term: 0.70,
    extended: 0.50,
  },
  
  forecastTTL: {
    short_term: 60000,      // 1 minute
    mid_term: 300000,       // 5 minutes
    long_term: 900000,      // 15 minutes
    extended: 3600000,      // 1 hour
  },
  
  thresholds: {
    highRisk: 70,
    strongSignal: 60,
    highVolatility: 0.3,
  },
};

// ============================================================
// Time Horizon Forecaster Implementation
// ============================================================

class TimeHorizonForecasterImpl {
  private config: ForecasterConfig;
  private landscapeHistory: FutureLandscape[] = [];
  private landscapeCounter: number = 0;
  
  private stats = {
    totalLandscapesGenerated: 0,
    averageConfidence: 0,
    bullishForecasts: 0,
    bearishForecasts: 0,
    neutralForecasts: 0,
  };

  constructor(config?: Partial<ForecasterConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.log('TimeHorizonForecaster initialized');
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
  // Main Forecast Generation
  // ============================================================

  /**
   * Generate a complete future landscape from a predictive signal
   */
  generateLandscape(signal: PredictiveSignal): FutureLandscape {
    const landscapeId = `landscape_${Date.now()}_${++this.landscapeCounter}`;
    const now = Date.now();

    // Generate forecasts for each horizon
    const shortTerm = this.generateHorizonForecast('short_term', signal);
    const midTerm = this.generateHorizonForecast('mid_term', signal);
    const longTerm = this.generateHorizonForecast('long_term', signal);
    const extended = this.generateHorizonForecast('extended', signal);

    // Calculate aggregate metrics
    const dominantDirection = this.calculateDominantDirection([shortTerm, midTerm, longTerm, extended]);
    const overallRiskState = this.calculateOverallRiskState([shortTerm, midTerm, longTerm, extended]);
    const trendConsistency = this.calculateTrendConsistency([shortTerm, midTerm, longTerm, extended]);

    // Generate insights
    const keyInsights = this.generateKeyInsights(signal, [shortTerm, midTerm, longTerm, extended]);
    const warnings = this.generateWarnings(signal, [shortTerm, midTerm, longTerm, extended]);
    const opportunities = this.generateOpportunities(signal, [shortTerm, midTerm, longTerm, extended]);

    // Calculate landscape confidence
    const landscapeConfidence = this.calculateLandscapeConfidence(
      [shortTerm, midTerm, longTerm, extended],
      trendConsistency
    );

    const landscape: FutureLandscape = {
      id: landscapeId,
      generatedAt: now,
      
      shortTerm,
      midTerm,
      longTerm,
      extended,
      
      dominantDirection,
      overallRiskState,
      trendConsistency,
      
      keyInsights,
      warnings,
      opportunities,
      
      landscapeConfidence,
      sourceSignal: signal,
    };

    // Store in history
    this.addToHistory(landscape);
    
    // Update stats
    this.updateStats(landscape);

    this.log(`Landscape generated: ${landscapeId}`, {
      dominantDirection,
      overallRiskState,
      confidence: landscapeConfidence.toFixed(2),
    });

    return landscape;
  }

  /**
   * Generate a forecast for a specific time horizon
   */
  generateHorizonForecast(horizon: TimeHorizon, signal: PredictiveSignal): HorizonForecast {
    const horizonConfig = this.config.horizons[horizon];
    const confidenceDecay = this.config.confidenceDecay[horizon];
    const ttl = this.config.forecastTTL[horizon];
    const now = Date.now();

    // Calculate direction
    const { direction, directionConfidence, directionStrength } = 
      this.calculateDirection(signal, horizon, confidenceDecay);

    // Calculate risk
    const { riskState, riskScore, riskFactors } = 
      this.calculateRisk(signal, horizon, confidenceDecay);

    // Calculate signal metrics
    const signalStrength = this.calculateSignalStrength(signal, horizon, confidenceDecay);
    const signalQuality = signal.dataQuality * confidenceDecay;

    // Calculate volatility band
    const volatilityBand = this.calculateVolatilityBand(signal, horizon);
    const volatilityTrend = this.determineVolatilityTrend(signal);

    // Get contributing entities
    const topContributingEntities = this.extractContributingEntities(signal, horizon);

    // Calculate overall confidence
    const overallConfidence = this.calculateHorizonConfidence(
      signal,
      directionConfidence,
      signalQuality,
      confidenceDecay
    );

    const forecast: HorizonForecast = {
      horizon,
      horizonLabel: horizonConfig.label,
      timeRangeMinutes: { min: horizonConfig.min, max: horizonConfig.max },
      
      expectedDirection: direction,
      directionConfidence,
      directionStrength,
      
      riskState,
      riskScore,
      riskFactors,
      
      signalStrength,
      signalQuality,
      
      volatilityBand,
      volatilityTrend,
      
      topContributingEntities,
      
      overallConfidence,
      dataCompleteness: signal.inputsAvailable / 6,
      
      generatedAt: now,
      expiresAt: now + ttl,
      basedOnSignalId: signal.id,
    };

    return forecast;
  }

  // ============================================================
  // Direction Calculation
  // ============================================================

  private calculateDirection(
    signal: PredictiveSignal,
    horizon: TimeHorizon,
    decay: number
  ): { direction: Direction; directionConfidence: number; directionStrength: number } {
    // Base direction from signal probabilities
    const upProb = signal.upwardProbability;
    const downProb = signal.downwardProbability;
    const sideProb = signal.sidewaysProbability;

    // Apply horizon-specific adjustments
    let adjustedUp = upProb;
    let adjustedDown = downProb;

    // Longer horizons tend toward mean reversion
    if (horizon === 'long_term' || horizon === 'extended') {
      const meanReversionFactor = horizon === 'extended' ? 0.3 : 0.15;
      adjustedUp = upProb * (1 - meanReversionFactor) + 0.33 * meanReversionFactor;
      adjustedDown = downProb * (1 - meanReversionFactor) + 0.33 * meanReversionFactor;
    }

    // Determine direction
    let direction: Direction;
    let directionStrength: number;

    if (adjustedUp > adjustedDown && adjustedUp > sideProb) {
      direction = 'bullish';
      directionStrength = Math.min(100, adjustedUp * 100 * 1.5);
    } else if (adjustedDown > adjustedUp && adjustedDown > sideProb) {
      direction = 'bearish';
      directionStrength = Math.min(100, adjustedDown * 100 * 1.5);
    } else if (sideProb > 0.4) {
      direction = 'neutral';
      directionStrength = Math.min(100, sideProb * 100);
    } else {
      direction = 'uncertain';
      directionStrength = 30;
    }

    // Calculate confidence with decay
    const baseConfidence = signal.predictiveConfidence;
    const directionConfidence = baseConfidence * decay;

    return { direction, directionConfidence, directionStrength };
  }

  // ============================================================
  // Risk Calculation
  // ============================================================

  private calculateRisk(
    signal: PredictiveSignal,
    horizon: TimeHorizon,
    decay: number
  ): { riskState: RiskState; riskScore: number; riskFactors: string[] } {
    const riskFactors: string[] = [];
    let riskScore = 30; // Base risk

    // Manipulation risk
    if (signal.manipulationLikelihood > 50) {
      riskScore += signal.manipulationLikelihood * 0.3;
      riskFactors.push(`Manipulation risk: ${signal.manipulationLikelihood.toFixed(0)}%`);
    }

    // Market temperature risk
    if (signal.marketTemperature > 70) {
      riskScore += (signal.marketTemperature - 70) * 0.5;
      riskFactors.push(`High market temperature: ${signal.marketTemperature}`);
    }

    // Downward shift risk
    if (signal.downwardShiftLikelihood > 60) {
      riskScore += (signal.downwardShiftLikelihood - 60) * 0.4;
      riskFactors.push(`Downward shift likelihood: ${signal.downwardShiftLikelihood.toFixed(0)}%`);
    }

    // Contributing factor risks
    for (const factor of signal.contributingFactors) {
      if (factor.impact < -30 && factor.confidence > 0.6) {
        riskScore += Math.abs(factor.impact) * 0.2;
        riskFactors.push(factor.description);
      }
    }

    // Adjust for horizon (longer horizons have more uncertainty)
    if (horizon === 'long_term') {
      riskScore *= 1.1;
    } else if (horizon === 'extended') {
      riskScore *= 1.2;
    }

    // Clamp risk score
    riskScore = Math.min(100, Math.max(0, riskScore));

    // Determine risk state
    let riskState: RiskState;
    if (riskScore < 25) {
      riskState = 'low';
    } else if (riskScore < 45) {
      riskState = 'moderate';
    } else if (riskScore < 65) {
      riskState = 'elevated';
    } else if (riskScore < 85) {
      riskState = 'high';
    } else {
      riskState = 'critical';
    }

    return { riskState, riskScore, riskFactors: riskFactors.slice(0, 5) };
  }

  // ============================================================
  // Signal Strength Calculation
  // ============================================================

  private calculateSignalStrength(
    signal: PredictiveSignal,
    horizon: TimeHorizon,
    decay: number
  ): number {
    let strength = signal.signalStrength;

    // Apply decay
    strength *= decay;

    // Boost for high confidence
    if (signal.predictiveConfidence > 0.7) {
      strength *= 1.1;
    }

    // Reduce for high manipulation risk
    if (signal.manipulationLikelihood > 70) {
      strength *= 0.8;
    }

    return Math.min(100, Math.max(0, Math.round(strength)));
  }

  // ============================================================
  // Volatility Band Calculation
  // ============================================================

  private calculateVolatilityBand(signal: PredictiveSignal, horizon: TimeHorizon): VolatilityBand {
    // Base volatility from market temperature
    const baseVolatility = signal.marketTemperature / 100;

    // Adjust for horizon (longer horizons have wider bands)
    let horizonMultiplier = 1;
    switch (horizon) {
      case 'short_term': horizonMultiplier = 1; break;
      case 'mid_term': horizonMultiplier = 1.5; break;
      case 'long_term': horizonMultiplier = 2.5; break;
      case 'extended': horizonMultiplier = 4; break;
    }

    // Calculate band width
    const width = baseVolatility * horizonMultiplier * 0.1;

    // Determine expected value based on direction
    let expected = 0;
    if (signal.upwardProbability > signal.downwardProbability) {
      expected = width * 0.3 * (signal.upwardProbability - 0.5);
    } else {
      expected = -width * 0.3 * (signal.downwardProbability - 0.5);
    }

    // Calculate confidence based on data quality and signal strength
    const confidence = signal.dataQuality * (signal.signalStrength / 100);

    return {
      lower: -width,
      upper: width,
      expected,
      width: width * 2,
      confidence,
    };
  }

  private determineVolatilityTrend(signal: PredictiveSignal): 'increasing' | 'decreasing' | 'stable' {
    if (signal.temperatureTrend === 'heating') {
      return 'increasing';
    } else if (signal.temperatureTrend === 'cooling') {
      return 'decreasing';
    }
    return 'stable';
  }

  // ============================================================
  // Contributing Entities Extraction
  // ============================================================

  private extractContributingEntities(
    signal: PredictiveSignal,
    horizon: TimeHorizon
  ): ContributingEntity[] {
    const entities: ContributingEntity[] = [];

    // Convert contributing factors to entities
    for (const factor of signal.contributingFactors) {
      const entity: ContributingEntity = {
        id: `entity_${factor.source}_${factor.factor}`,
        name: this.formatEntityName(factor),
        type: this.mapSourceToEntityType(factor.source),
        impact: factor.impact,
        direction: factor.impact > 0 ? 'bullish' : factor.impact < 0 ? 'bearish' : 'neutral',
        confidence: factor.confidence,
      };
      entities.push(entity);
    }

    // Sort by absolute impact and return top 5
    return entities
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
      .slice(0, 5);
  }

  private formatEntityName(factor: ContributingFactor): string {
    const sourceNames: Record<string, string> = {
      whale: 'Whale Activity',
      liquidity: 'Liquidity Pool',
      hydra: 'Hydra Pattern',
      ecoscan: 'EcoScan Signal',
      entity: 'Entity Risk',
      constellation: 'Constellation Cluster',
    };
    return `${sourceNames[factor.source] || factor.source}: ${factor.factor}`;
  }

  private mapSourceToEntityType(source: string): ContributingEntity['type'] {
    const mapping: Record<string, ContributingEntity['type']> = {
      whale: 'whale',
      liquidity: 'exchange',
      hydra: 'protocol',
      ecoscan: 'token',
      entity: 'unknown',
      constellation: 'cluster',
    };
    return mapping[source] || 'unknown';
  }

  // ============================================================
  // Confidence Calculations
  // ============================================================

  private calculateHorizonConfidence(
    signal: PredictiveSignal,
    directionConfidence: number,
    signalQuality: number,
    decay: number
  ): number {
    const baseConfidence = signal.predictiveConfidence;
    const weightedConfidence = (
      baseConfidence * 0.4 +
      directionConfidence * 0.3 +
      signalQuality * 0.3
    ) * decay;

    return Math.min(1, Math.max(0, weightedConfidence));
  }

  private calculateLandscapeConfidence(
    forecasts: HorizonForecast[],
    trendConsistency: number
  ): number {
    // Average confidence across horizons (weighted toward shorter terms)
    const weights = [0.35, 0.30, 0.20, 0.15];
    let weightedSum = 0;
    
    for (let i = 0; i < forecasts.length; i++) {
      weightedSum += forecasts[i].overallConfidence * weights[i];
    }

    // Boost for trend consistency
    const consistencyBoost = trendConsistency * 0.1;

    return Math.min(1, weightedSum + consistencyBoost);
  }

  // ============================================================
  // Aggregate Calculations
  // ============================================================

  private calculateDominantDirection(forecasts: HorizonForecast[]): Direction {
    const directionCounts: Record<Direction, number> = {
      bullish: 0,
      bearish: 0,
      neutral: 0,
      uncertain: 0,
    };

    // Weight shorter-term forecasts more heavily
    const weights = [0.4, 0.3, 0.2, 0.1];
    
    for (let i = 0; i < forecasts.length; i++) {
      directionCounts[forecasts[i].expectedDirection] += weights[i];
    }

    // Find dominant direction
    let dominant: Direction = 'uncertain';
    let maxCount = 0;
    
    for (const [dir, count] of Object.entries(directionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominant = dir as Direction;
      }
    }

    return dominant;
  }

  private calculateOverallRiskState(forecasts: HorizonForecast[]): RiskState {
    // Use the highest risk state from short and mid term
    const relevantForecasts = [forecasts[0], forecasts[1]];
    const riskOrder: RiskState[] = ['low', 'moderate', 'elevated', 'high', 'critical'];
    
    let maxRiskIndex = 0;
    for (const forecast of relevantForecasts) {
      const index = riskOrder.indexOf(forecast.riskState);
      if (index > maxRiskIndex) {
        maxRiskIndex = index;
      }
    }

    return riskOrder[maxRiskIndex];
  }

  private calculateTrendConsistency(forecasts: HorizonForecast[]): number {
    // Check how consistent the direction is across horizons
    const directions = forecasts.map(f => f.expectedDirection);
    const uniqueDirections = new Set(directions);
    
    if (uniqueDirections.size === 1) {
      return 1.0; // Perfect consistency
    } else if (uniqueDirections.size === 2) {
      // Check if it's bullish/neutral or bearish/neutral
      if (uniqueDirections.has('uncertain')) {
        return 0.5;
      }
      return 0.7;
    } else if (uniqueDirections.size === 3) {
      return 0.4;
    }
    return 0.2;
  }

  // ============================================================
  // Insight Generation
  // ============================================================

  private generateKeyInsights(
    signal: PredictiveSignal,
    forecasts: HorizonForecast[]
  ): string[] {
    const insights: string[] = [];

    // Direction insight
    const shortTerm = forecasts[0];
    if (shortTerm.directionConfidence > 0.6) {
      insights.push(
        `Short-term outlook is ${shortTerm.expectedDirection} with ${(shortTerm.directionConfidence * 100).toFixed(0)}% confidence`
      );
    }

    // Temperature insight
    if (signal.marketTemperature > 70) {
      insights.push(`Market temperature is elevated at ${signal.marketTemperature}, indicating high activity`);
    } else if (signal.marketTemperature < 30) {
      insights.push(`Market temperature is low at ${signal.marketTemperature}, indicating reduced activity`);
    }

    // Trend consistency insight
    const consistency = this.calculateTrendConsistency(forecasts);
    if (consistency > 0.8) {
      insights.push('All time horizons show consistent directional bias');
    } else if (consistency < 0.4) {
      insights.push('Mixed signals across different time horizons suggest uncertainty');
    }

    // Top factor insight
    if (signal.contributingFactors.length > 0) {
      const topFactor = signal.contributingFactors[0];
      insights.push(`Primary driver: ${topFactor.description}`);
    }

    return insights.slice(0, 4);
  }

  private generateWarnings(
    signal: PredictiveSignal,
    forecasts: HorizonForecast[]
  ): string[] {
    const warnings: string[] = [];

    // Manipulation warning
    if (signal.manipulationLikelihood > 60) {
      warnings.push(
        `Elevated manipulation risk detected: ${signal.manipulationLikelihood.toFixed(0)}%` +
        (signal.manipulationType ? ` (${signal.manipulationType.replace(/_/g, ' ')})` : '')
      );
    }

    // High risk warning
    const highRiskForecasts = forecasts.filter(f => f.riskScore > 70);
    if (highRiskForecasts.length > 0) {
      warnings.push(`High risk detected in ${highRiskForecasts.length} time horizon(s)`);
    }

    // Volatility warning
    if (forecasts[0].volatilityTrend === 'increasing') {
      warnings.push('Volatility is increasing - expect wider price swings');
    }

    // Low confidence warning
    if (signal.predictiveConfidence < 0.4) {
      warnings.push('Low signal confidence - predictions may be unreliable');
    }

    return warnings.slice(0, 3);
  }

  private generateOpportunities(
    signal: PredictiveSignal,
    forecasts: HorizonForecast[]
  ): string[] {
    const opportunities: string[] = [];

    // Strong bullish opportunity
    const shortTerm = forecasts[0];
    if (shortTerm.expectedDirection === 'bullish' && shortTerm.signalStrength > 70) {
      opportunities.push('Strong short-term bullish signal detected');
    }

    // Low risk entry
    if (shortTerm.riskState === 'low' && shortTerm.expectedDirection !== 'uncertain') {
      opportunities.push(`Low-risk ${shortTerm.expectedDirection} entry opportunity`);
    }

    // Trend alignment
    const consistency = this.calculateTrendConsistency(forecasts);
    if (consistency > 0.8 && shortTerm.expectedDirection === 'bullish') {
      opportunities.push('Multi-timeframe bullish alignment suggests strong trend');
    }

    // Accumulation signal
    const whaleFactors = signal.contributingFactors.filter(f => 
      f.source === 'whale' && f.factor === 'high_accumulation'
    );
    if (whaleFactors.length > 0) {
      opportunities.push('Whale accumulation detected - potential upside');
    }

    return opportunities.slice(0, 3);
  }

  // ============================================================
  // History Management
  // ============================================================

  private addToHistory(landscape: FutureLandscape): void {
    this.landscapeHistory.push(landscape);
    
    // Keep only last 50 landscapes
    if (this.landscapeHistory.length > 50) {
      this.landscapeHistory = this.landscapeHistory.slice(-50);
    }
  }

  private updateStats(landscape: FutureLandscape): void {
    this.stats.totalLandscapesGenerated++;
    
    // Update running average
    const n = this.stats.totalLandscapesGenerated;
    this.stats.averageConfidence = 
      (this.stats.averageConfidence * (n - 1) + landscape.landscapeConfidence) / n;
    
    // Count directions
    switch (landscape.dominantDirection) {
      case 'bullish': this.stats.bullishForecasts++; break;
      case 'bearish': this.stats.bearishForecasts++; break;
      case 'neutral': this.stats.neutralForecasts++; break;
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Generate landscape from current signal engine state
   */
  generateFromCurrentSignal(): FutureLandscape | null {
    const signalEngine = getPredictiveSignalEngine();
    const latestSignal = signalEngine.getLatestSignal();
    
    if (!latestSignal) {
      this.log('No signal available for landscape generation');
      return null;
    }

    return this.generateLandscape(latestSignal);
  }

  /**
   * Get the latest landscape
   */
  getLatestLandscape(): FutureLandscape | null {
    if (this.landscapeHistory.length === 0) return null;
    return this.landscapeHistory[this.landscapeHistory.length - 1];
  }

  /**
   * Get landscape history
   */
  getHistory(limit?: number): FutureLandscape[] {
    if (limit) {
      return this.landscapeHistory.slice(-limit);
    }
    return [...this.landscapeHistory];
  }

  /**
   * Get forecast for a specific horizon from latest landscape
   */
  getForecast(horizon: TimeHorizon): HorizonForecast | null {
    const landscape = this.getLatestLandscape();
    if (!landscape) return null;

    switch (horizon) {
      case 'short_term': return landscape.shortTerm;
      case 'mid_term': return landscape.midTerm;
      case 'long_term': return landscape.longTerm;
      case 'extended': return landscape.extended;
    }
  }

  /**
   * Get forecaster statistics
   */
  getStats(): typeof this.stats & { historySize: number } {
    return {
      ...this.stats,
      historySize: this.landscapeHistory.length,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): ForecasterConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ForecasterConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.landscapeHistory = [];
    this.log('Landscape history cleared');
  }

  /**
   * Reset forecaster state
   */
  reset(): void {
    this.landscapeHistory = [];
    this.landscapeCounter = 0;
    this.stats = {
      totalLandscapesGenerated: 0,
      averageConfidence: 0,
      bullishForecasts: 0,
      bearishForecasts: 0,
      neutralForecasts: 0,
    };
    this.log('Forecaster reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let instance: TimeHorizonForecasterImpl | null = null;

/**
 * Get the TimeHorizonForecaster singleton instance
 */
export function getTimeHorizonForecaster(): TimeHorizonForecasterImpl {
  if (!instance) {
    instance = new TimeHorizonForecasterImpl();
  }
  return instance;
}

/**
 * Create a new TimeHorizonForecaster with custom config
 */
export function createTimeHorizonForecaster(
  config?: Partial<ForecasterConfig>
): TimeHorizonForecasterImpl {
  return new TimeHorizonForecasterImpl(config);
}
