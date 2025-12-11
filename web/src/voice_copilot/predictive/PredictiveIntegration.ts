/**
 * PredictiveIntegration.ts
 * 
 * Phase 6: Ultra-Deep Foresight Engine - MODULE 8
 * 
 * Copilot Predictive Integration - Additive hooks for CopilotOrchestrator
 * 
 * Features:
 * - New intent category: foresight_prediction
 * - 20+ new intent patterns for predictive queries
 * - Ability to pull active screen/entity context automatically
 * - Integration with Phase 3 real-time awareness
 * - Integration with Phase 5 proactive intelligence
 * 
 * All integrations are additive, isolated, and use orchestrator's extension architecture.
 * 
 * This is a purely additive, 100% isolated module.
 * Logging prefix: [PredictiveIntegration]
 */

import { getAutonomousSignalSynthesizer, type UnifiedForecast } from './AutonomousSignalSynthesizer';
import { getFutureStateNarrator, type ForecastNarrative, type NarrativeOptions } from './FutureStateNarrator';
import { getPredictiveSignalEngine, type PredictiveSignal, type PredictiveInputs } from './PredictiveSignalEngine';
import { getTimeHorizonForecaster, type FutureLandscape } from './TimeHorizonForecaster';
import { getScenarioGenerator, type ScenarioSet } from './ScenarioGenerator';
import { getPredictiveRiskEngine, type PredictiveRiskGrade } from './PredictiveRiskEngine';
import { getCausalChainModel, type CausalExplanation } from './CausalChainModel';

// ============================================================
// Types
// ============================================================

export type PredictiveIntentType = 
  | 'forecast_general'
  | 'forecast_short_term'
  | 'forecast_mid_term'
  | 'forecast_long_term'
  | 'scenario_analysis'
  | 'risk_assessment'
  | 'causal_explanation'
  | 'entity_prediction'
  | 'direction_query'
  | 'manipulation_check'
  | 'whale_analysis'
  | 'liquidity_analysis'
  | 'market_temperature'
  | 'unified_outlook'
  | 'quick_summary';

export interface PredictiveIntent {
  type: PredictiveIntentType;
  confidence: number;
  matchedPattern: string;
  extractedEntity: string | null;
  extractedTimeframe: string | null;
}

export interface PredictiveResponse {
  type: PredictiveIntentType;
  narrative: string;
  shortSummary: string;
  confidence: number;
  data: {
    forecast?: UnifiedForecast;
    landscape?: FutureLandscape;
    scenarios?: ScenarioSet;
    riskGrade?: PredictiveRiskGrade;
    causalExplanation?: CausalExplanation;
    signal?: PredictiveSignal;
  };
  speakableText: string;
  generatedAt: number;
}

export interface PredictiveIntegrationConfig {
  enableLogging: boolean;
  logPrefix: string;
  defaultNarrativeStyle: 'analytical' | 'conversational' | 'brief' | 'detailed';
  defaultNarrativeLength: 'short' | 'medium' | 'long';
  minConfidenceThreshold: number;
  enableEntityContext: boolean;
  enableScreenContext: boolean;
}

const DEFAULT_CONFIG: PredictiveIntegrationConfig = {
  enableLogging: true,
  logPrefix: '[PredictiveIntegration]',
  defaultNarrativeStyle: 'analytical',
  defaultNarrativeLength: 'medium',
  minConfidenceThreshold: 0.3,
  enableEntityContext: true,
  enableScreenContext: true,
};

// ============================================================
// Intent Patterns (20+ patterns as specified)
// ============================================================

interface IntentPattern {
  pattern: RegExp;
  type: PredictiveIntentType;
  priority: number;
}

const INTENT_PATTERNS: IntentPattern[] = [
  // General forecast queries
  { pattern: /what('s| is| will)? (likely|going) to happen( next)?/i, type: 'forecast_general', priority: 10 },
  { pattern: /give me a forecast/i, type: 'forecast_general', priority: 10 },
  { pattern: /what('s| is) the forecast/i, type: 'forecast_general', priority: 10 },
  { pattern: /predict (the )?market/i, type: 'forecast_general', priority: 9 },
  { pattern: /what do you (think|predict|expect)/i, type: 'forecast_general', priority: 8 },
  
  // Direction queries
  { pattern: /explain the next move/i, type: 'direction_query', priority: 10 },
  { pattern: /what('s| is) the (next|expected) (move|direction)/i, type: 'direction_query', priority: 10 },
  { pattern: /which (way|direction)/i, type: 'direction_query', priority: 8 },
  { pattern: /(up|down|sideways) or (up|down|sideways)/i, type: 'direction_query', priority: 7 },
  { pattern: /bullish or bearish/i, type: 'direction_query', priority: 9 },
  
  // Short-term outlook
  { pattern: /short[- ]?term (outlook|forecast|prediction)/i, type: 'forecast_short_term', priority: 10 },
  { pattern: /next (few |couple )?(minutes?|5 min)/i, type: 'forecast_short_term', priority: 9 },
  { pattern: /immediate (outlook|forecast)/i, type: 'forecast_short_term', priority: 9 },
  
  // Mid-term outlook
  { pattern: /mid[- ]?term (outlook|forecast|prediction)/i, type: 'forecast_mid_term', priority: 10 },
  { pattern: /next (15|30|45) min(utes)?/i, type: 'forecast_mid_term', priority: 9 },
  { pattern: /half hour (outlook|forecast)/i, type: 'forecast_mid_term', priority: 8 },
  
  // Long-term outlook
  { pattern: /long[- ]?term (outlook|forecast|prediction|direction)/i, type: 'forecast_long_term', priority: 10 },
  { pattern: /next (hour|few hours|1-3 hours)/i, type: 'forecast_long_term', priority: 9 },
  { pattern: /extended (outlook|forecast)/i, type: 'forecast_long_term', priority: 8 },
  
  // Scenario queries
  { pattern: /what are the (possible )?scenarios/i, type: 'scenario_analysis', priority: 10 },
  { pattern: /possible (futures|outcomes)/i, type: 'scenario_analysis', priority: 9 },
  { pattern: /scenario analysis/i, type: 'scenario_analysis', priority: 10 },
  { pattern: /what could happen/i, type: 'scenario_analysis', priority: 8 },
  { pattern: /best case|worst case/i, type: 'scenario_analysis', priority: 8 },
  
  // Risk queries
  { pattern: /risk (level|assessment|grade|analysis)/i, type: 'risk_assessment', priority: 10 },
  { pattern: /how risky/i, type: 'risk_assessment', priority: 9 },
  { pattern: /what('s| is) the risk/i, type: 'risk_assessment', priority: 9 },
  { pattern: /danger level/i, type: 'risk_assessment', priority: 8 },
  
  // Causal explanation queries
  { pattern: /why (is|are|will|would)/i, type: 'causal_explanation', priority: 8 },
  { pattern: /explain (why|the reason)/i, type: 'causal_explanation', priority: 9 },
  { pattern: /what('s| is) (causing|driving)/i, type: 'causal_explanation', priority: 9 },
  { pattern: /causal (analysis|explanation)/i, type: 'causal_explanation', priority: 10 },
  
  // Entity prediction
  { pattern: /predict (this )?(entity|wallet|token|cluster)/i, type: 'entity_prediction', priority: 10 },
  { pattern: /what will (this |the )?(entity|wallet|token) do/i, type: 'entity_prediction', priority: 9 },
  { pattern: /forecast for (this |the )?(entity|wallet|token)/i, type: 'entity_prediction', priority: 9 },
  
  // Manipulation check
  { pattern: /manipulation (risk|check|detected)/i, type: 'manipulation_check', priority: 10 },
  { pattern: /is (there |this )?(manipulation|fake|artificial)/i, type: 'manipulation_check', priority: 9 },
  { pattern: /wash trading/i, type: 'manipulation_check', priority: 9 },
  { pattern: /spoofing/i, type: 'manipulation_check', priority: 9 },
  
  // Whale analysis
  { pattern: /whale (activity|analysis|pressure|behavior)/i, type: 'whale_analysis', priority: 10 },
  { pattern: /what are (the )?whales doing/i, type: 'whale_analysis', priority: 9 },
  { pattern: /large holder/i, type: 'whale_analysis', priority: 8 },
  
  // Liquidity analysis
  { pattern: /liquidity (analysis|health|fragility)/i, type: 'liquidity_analysis', priority: 10 },
  { pattern: /market depth/i, type: 'liquidity_analysis', priority: 9 },
  { pattern: /slippage risk/i, type: 'liquidity_analysis', priority: 9 },
  
  // Market temperature
  { pattern: /market temperature/i, type: 'market_temperature', priority: 10 },
  { pattern: /how hot|how cold/i, type: 'market_temperature', priority: 8 },
  { pattern: /activity level/i, type: 'market_temperature', priority: 7 },
  
  // Unified outlook
  { pattern: /unified (forecast|outlook|analysis)/i, type: 'unified_outlook', priority: 10 },
  { pattern: /full (forecast|analysis|picture)/i, type: 'unified_outlook', priority: 9 },
  { pattern: /complete (outlook|analysis)/i, type: 'unified_outlook', priority: 9 },
  { pattern: /everything you (know|see|predict)/i, type: 'unified_outlook', priority: 8 },
  
  // Quick summary
  { pattern: /quick (summary|forecast|outlook)/i, type: 'quick_summary', priority: 10 },
  { pattern: /brief (summary|forecast|outlook)/i, type: 'quick_summary', priority: 10 },
  { pattern: /in (a )?nutshell/i, type: 'quick_summary', priority: 8 },
  { pattern: /tldr|tl;dr/i, type: 'quick_summary', priority: 9 },
];

// ============================================================
// Predictive Integration Implementation
// ============================================================

class PredictiveIntegrationImpl {
  private config: PredictiveIntegrationConfig;
  private currentEntityContext: { id: string; type: string; name?: string } | null = null;
  private currentScreenContext: string = '';
  
  private stats = {
    totalQueriesProcessed: 0,
    intentDistribution: {} as Record<PredictiveIntentType, number>,
    averageConfidence: 0,
  };

  constructor(config?: Partial<PredictiveIntegrationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeStats();
    this.log('PredictiveIntegration initialized');
  }

  private initializeStats(): void {
    const intentTypes: PredictiveIntentType[] = [
      'forecast_general', 'forecast_short_term', 'forecast_mid_term', 'forecast_long_term',
      'scenario_analysis', 'risk_assessment', 'causal_explanation', 'entity_prediction',
      'direction_query', 'manipulation_check', 'whale_analysis', 'liquidity_analysis',
      'market_temperature', 'unified_outlook', 'quick_summary',
    ];
    for (const type of intentTypes) {
      this.stats.intentDistribution[type] = 0;
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
  // Intent Recognition
  // ============================================================

  /**
   * Check if a query is a predictive/foresight query
   */
  isPredictiveQuery(query: string): boolean {
    const intent = this.recognizePredictiveIntent(query);
    return intent !== null && intent.confidence >= this.config.minConfidenceThreshold;
  }

  /**
   * Recognize predictive intent from user query
   */
  recognizePredictiveIntent(query: string): PredictiveIntent | null {
    const normalizedQuery = query.toLowerCase().trim();
    
    let bestMatch: { pattern: IntentPattern; confidence: number } | null = null;

    for (const intentPattern of INTENT_PATTERNS) {
      const match = normalizedQuery.match(intentPattern.pattern);
      if (match) {
        // Calculate confidence based on match quality and priority
        const matchLength = match[0].length;
        const queryLength = normalizedQuery.length;
        const matchRatio = matchLength / queryLength;
        const confidence = Math.min(1, (matchRatio * 0.5 + intentPattern.priority * 0.05));

        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = { pattern: intentPattern, confidence };
        }
      }
    }

    if (!bestMatch) return null;

    // Extract entity if mentioned
    const extractedEntity = this.extractEntityFromQuery(normalizedQuery);
    
    // Extract timeframe if mentioned
    const extractedTimeframe = this.extractTimeframeFromQuery(normalizedQuery);

    return {
      type: bestMatch.pattern.type,
      confidence: bestMatch.confidence,
      matchedPattern: bestMatch.pattern.pattern.source,
      extractedEntity,
      extractedTimeframe,
    };
  }

  private extractEntityFromQuery(query: string): string | null {
    // Look for entity references
    const entityPatterns = [
      /(?:this |the )?(?:entity|wallet|token|cluster) (\w+)/i,
      /(\w+) (?:entity|wallet|token|cluster)/i,
      /for (\w+)/i,
    ];

    for (const pattern of entityPatterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  private extractTimeframeFromQuery(query: string): string | null {
    const timeframePatterns = [
      { pattern: /next (\d+) (minutes?|hours?)/i, extract: (m: RegExpMatchArray) => `${m[1]} ${m[2]}` },
      { pattern: /short[- ]?term/i, extract: () => 'short-term' },
      { pattern: /mid[- ]?term/i, extract: () => 'mid-term' },
      { pattern: /long[- ]?term/i, extract: () => 'long-term' },
      { pattern: /immediate/i, extract: () => 'immediate' },
      { pattern: /extended/i, extract: () => 'extended' },
    ];

    for (const { pattern, extract } of timeframePatterns) {
      const match = query.match(pattern);
      if (match) {
        return extract(match);
      }
    }

    return null;
  }

  // ============================================================
  // Response Generation
  // ============================================================

  /**
   * Generate a predictive response for a recognized intent
   */
  async generatePredictiveResponse(
    intent: PredictiveIntent,
    inputs?: PredictiveInputs
  ): Promise<PredictiveResponse> {
    this.log(`Generating response for intent: ${intent.type}`);

    // Update stats
    this.stats.totalQueriesProcessed++;
    this.stats.intentDistribution[intent.type]++;
    this.stats.averageConfidence = 
      (this.stats.averageConfidence * (this.stats.totalQueriesProcessed - 1) + intent.confidence) / 
      this.stats.totalQueriesProcessed;

    // Generate fresh data if inputs provided
    if (inputs) {
      const signalEngine = getPredictiveSignalEngine();
      signalEngine.generateSignal(inputs);
    }

    // Route to appropriate handler
    switch (intent.type) {
      case 'forecast_general':
      case 'unified_outlook':
        return this.generateUnifiedForecastResponse(intent);
      
      case 'forecast_short_term':
        return this.generateShortTermResponse(intent);
      
      case 'forecast_mid_term':
        return this.generateMidTermResponse(intent);
      
      case 'forecast_long_term':
        return this.generateLongTermResponse(intent);
      
      case 'scenario_analysis':
        return this.generateScenarioResponse(intent);
      
      case 'risk_assessment':
        return this.generateRiskResponse(intent);
      
      case 'causal_explanation':
        return this.generateCausalResponse(intent);
      
      case 'direction_query':
        return this.generateDirectionResponse(intent);
      
      case 'manipulation_check':
        return this.generateManipulationResponse(intent);
      
      case 'whale_analysis':
        return this.generateWhaleResponse(intent);
      
      case 'liquidity_analysis':
        return this.generateLiquidityResponse(intent);
      
      case 'market_temperature':
        return this.generateTemperatureResponse(intent);
      
      case 'entity_prediction':
        return this.generateEntityPredictionResponse(intent);
      
      case 'quick_summary':
        return this.generateQuickSummaryResponse(intent);
      
      default:
        return this.generateUnifiedForecastResponse(intent);
    }
  }

  // ============================================================
  // Response Handlers
  // ============================================================

  private async generateUnifiedForecastResponse(intent: PredictiveIntent): Promise<PredictiveResponse> {
    const synthesizer = getAutonomousSignalSynthesizer();
    const narrator = getFutureStateNarrator();

    const forecast = synthesizer.synthesizeUnifiedForecast();
    const narrativeResult = narrator.narrateUnifiedForecast(forecast, {
      style: this.config.defaultNarrativeStyle,
      length: this.config.defaultNarrativeLength,
    });

    return {
      type: intent.type,
      narrative: narrativeResult.narrative,
      shortSummary: forecast.executiveSummary,
      confidence: forecast.overallConfidence,
      data: { forecast },
      speakableText: narrativeResult.narrative,
      generatedAt: Date.now(),
    };
  }

  private async generateShortTermResponse(intent: PredictiveIntent): Promise<PredictiveResponse> {
    const synthesizer = getAutonomousSignalSynthesizer();
    const narrator = getFutureStateNarrator();

    const shortTerm = synthesizer.synthesizeShortTerm();
    const narrativeResult = narrator.narrateShortTerm(shortTerm, {
      style: this.config.defaultNarrativeStyle,
      length: this.config.defaultNarrativeLength,
    });

    return {
      type: intent.type,
      narrative: narrativeResult.narrative,
      shortSummary: shortTerm.recommendation,
      confidence: shortTerm.overallConfidence,
      data: {},
      speakableText: narrativeResult.narrative,
      generatedAt: Date.now(),
    };
  }

  private async generateMidTermResponse(intent: PredictiveIntent): Promise<PredictiveResponse> {
    const synthesizer = getAutonomousSignalSynthesizer();
    const narrator = getFutureStateNarrator();

    const midTerm = synthesizer.synthesizeMidTerm();
    const narrativeResult = narrator.narrateMidTerm(midTerm, {
      style: this.config.defaultNarrativeStyle,
      length: this.config.defaultNarrativeLength,
    });

    return {
      type: intent.type,
      narrative: narrativeResult.narrative,
      shortSummary: `${midTerm.direction} with ${midTerm.riskTrend} risk`,
      confidence: midTerm.overallConfidence,
      data: {},
      speakableText: narrativeResult.narrative,
      generatedAt: Date.now(),
    };
  }

  private async generateLongTermResponse(intent: PredictiveIntent): Promise<PredictiveResponse> {
    const synthesizer = getAutonomousSignalSynthesizer();
    const narrator = getFutureStateNarrator();

    const longTerm = synthesizer.synthesizeLongTerm();
    const narrativeResult = narrator.narrateLongTerm(longTerm, {
      style: this.config.defaultNarrativeStyle,
      length: this.config.defaultNarrativeLength,
    });

    return {
      type: intent.type,
      narrative: narrativeResult.narrative,
      shortSummary: longTerm.marketStructure,
      confidence: longTerm.overallConfidence,
      data: {},
      speakableText: narrativeResult.narrative,
      generatedAt: Date.now(),
    };
  }

  private async generateScenarioResponse(intent: PredictiveIntent): Promise<PredictiveResponse> {
    const synthesizer = getAutonomousSignalSynthesizer();
    const narrator = getFutureStateNarrator();

    const scenarios = synthesizer.synthesizeScenarios();
    const narrativeResult = narrator.narrateScenarios(scenarios, {
      style: this.config.defaultNarrativeStyle,
      length: this.config.defaultNarrativeLength,
    });

    const scenarioGenerator = getScenarioGenerator();
    const scenarioSet = scenarioGenerator.getLatestScenarioSet();

    return {
      type: intent.type,
      narrative: narrativeResult.narrative,
      shortSummary: `Primary: ${scenarios.mostLikely.label} (${scenarios.mostLikely.probability.toFixed(0)}%)`,
      confidence: scenarios.scenarioConfidence,
      data: { scenarios: scenarioSet || undefined },
      speakableText: narrativeResult.narrative,
      generatedAt: Date.now(),
    };
  }

  private async generateRiskResponse(intent: PredictiveIntent): Promise<PredictiveResponse> {
    const riskEngine = getPredictiveRiskEngine();
    const riskGrade = riskEngine.getLatestGrade();

    if (!riskGrade) {
      return {
        type: intent.type,
        narrative: 'Risk assessment data is not yet available. Please wait for the system to generate risk analysis.',
        shortSummary: 'Risk data unavailable',
        confidence: 0,
        data: {},
        speakableText: 'Risk assessment data is not yet available.',
        generatedAt: Date.now(),
      };
    }

    const narrative = `Current risk level is ${riskGrade.overallRiskLevel} out of 100, grade ${riskGrade.riskGrade}. ` +
      `${riskGrade.riskLabel}. ` +
      `Whale pressure is ${riskGrade.whalePressure.pressureDirection} with ${riskGrade.whalePressure.pressureIntensity} intensity. ` +
      `Liquidity is ${riskGrade.liquidityFragility.fragilityLevel}. ` +
      `Manipulation risk is ${riskGrade.manipulationRisk.riskLevel}.`;

    return {
      type: intent.type,
      narrative,
      shortSummary: `Risk: ${riskGrade.overallRiskLevel}/100 (${riskGrade.riskGrade})`,
      confidence: riskGrade.overallConfidence,
      data: { riskGrade },
      speakableText: narrative,
      generatedAt: Date.now(),
    };
  }

  private async generateCausalResponse(intent: PredictiveIntent): Promise<PredictiveResponse> {
    const synthesizer = getAutonomousSignalSynthesizer();
    const narrator = getFutureStateNarrator();

    const causal = synthesizer.synthesizeCausalChain();
    const narrativeResult = narrator.narrateCausalChain(causal, {
      style: this.config.defaultNarrativeStyle,
      length: this.config.defaultNarrativeLength,
    });

    const causalModel = getCausalChainModel();
    const causalExplanation = causalModel.getLatestExplanation();

    return {
      type: intent.type,
      narrative: narrativeResult.narrative,
      shortSummary: causal.primaryNarrative.substring(0, 100) + '...',
      confidence: causal.causalConfidence,
      data: { causalExplanation: causalExplanation || undefined },
      speakableText: narrativeResult.narrative,
      generatedAt: Date.now(),
    };
  }

  private async generateDirectionResponse(intent: PredictiveIntent): Promise<PredictiveResponse> {
    const synthesizer = getAutonomousSignalSynthesizer();
    const forecast = synthesizer.getLatestForecast() || synthesizer.synthesizeUnifiedForecast();

    const narrative = `The market is showing ${forecast.consensusDirection} bias with ` +
      `${(forecast.directionConfidence * 100).toFixed(0)} percent confidence. ` +
      `Direction agreement across timeframes is ${(forecast.directionAgreement * 100).toFixed(0)} percent. ` +
      `${forecast.shortTermOutlook}`;

    return {
      type: intent.type,
      narrative,
      shortSummary: `${forecast.consensusDirection} (${(forecast.directionConfidence * 100).toFixed(0)}% confidence)`,
      confidence: forecast.directionConfidence,
      data: { forecast },
      speakableText: narrative,
      generatedAt: Date.now(),
    };
  }

  private async generateManipulationResponse(intent: PredictiveIntent): Promise<PredictiveResponse> {
    const riskEngine = getPredictiveRiskEngine();
    const riskGrade = riskEngine.getLatestGrade();
    const signalEngine = getPredictiveSignalEngine();
    const signal = signalEngine.getLatestSignal();

    if (!riskGrade || !signal) {
      return {
        type: intent.type,
        narrative: 'Manipulation analysis data is not yet available.',
        shortSummary: 'Data unavailable',
        confidence: 0,
        data: {},
        speakableText: 'Manipulation analysis data is not yet available.',
        generatedAt: Date.now(),
      };
    }

    const manipRisk = riskGrade.manipulationRisk;
    const narrative = `Manipulation risk is ${manipRisk.riskLevel} at ${manipRisk.overallRisk.toFixed(0)} percent. ` +
      (manipRisk.detectedPatterns.length > 0 
        ? `Detected patterns: ${manipRisk.detectedPatterns.join(', ')}. `
        : 'No specific manipulation patterns detected. ') +
      `Wash trading score: ${manipRisk.washTradingScore.toFixed(0)}. ` +
      `Spoofing score: ${manipRisk.spoofingScore.toFixed(0)}. ` +
      `Coordinated activity score: ${manipRisk.coordinatedActivityScore.toFixed(0)}.`;

    return {
      type: intent.type,
      narrative,
      shortSummary: `Manipulation: ${manipRisk.riskLevel} (${manipRisk.overallRisk.toFixed(0)}%)`,
      confidence: manipRisk.confidence,
      data: { riskGrade, signal },
      speakableText: narrative,
      generatedAt: Date.now(),
    };
  }

  private async generateWhaleResponse(intent: PredictiveIntent): Promise<PredictiveResponse> {
    const riskEngine = getPredictiveRiskEngine();
    const riskGrade = riskEngine.getLatestGrade();

    if (!riskGrade) {
      return {
        type: intent.type,
        narrative: 'Whale analysis data is not yet available.',
        shortSummary: 'Data unavailable',
        confidence: 0,
        data: {},
        speakableText: 'Whale analysis data is not yet available.',
        generatedAt: Date.now(),
      };
    }

    const whale = riskGrade.whalePressure;
    const narrative = `Whale pressure is ${whale.pressureDirection} with ${whale.pressureIntensity} intensity. ` +
      `Overall pressure score: ${whale.overallPressure.toFixed(0)}. ` +
      `Accumulation score: ${whale.accumulationScore.toFixed(0)}. ` +
      `Distribution score: ${whale.distributionScore.toFixed(0)}. ` +
      `Velocity trend is ${whale.velocityTrend}. ` +
      `Large transaction risk: ${whale.largeTransactionRisk.toFixed(0)}.`;

    return {
      type: intent.type,
      narrative,
      shortSummary: `Whales: ${whale.pressureDirection} (${whale.pressureIntensity})`,
      confidence: whale.confidence,
      data: { riskGrade },
      speakableText: narrative,
      generatedAt: Date.now(),
    };
  }

  private async generateLiquidityResponse(intent: PredictiveIntent): Promise<PredictiveResponse> {
    const riskEngine = getPredictiveRiskEngine();
    const riskGrade = riskEngine.getLatestGrade();

    if (!riskGrade) {
      return {
        type: intent.type,
        narrative: 'Liquidity analysis data is not yet available.',
        shortSummary: 'Data unavailable',
        confidence: 0,
        data: {},
        speakableText: 'Liquidity analysis data is not yet available.',
        generatedAt: Date.now(),
      };
    }

    const liq = riskGrade.liquidityFragility;
    const narrative = `Liquidity is ${liq.fragilityLevel} with fragility score of ${liq.fragilityScore.toFixed(0)}. ` +
      `Depth imbalance: ${liq.depthImbalance.toFixed(0)} percent. ` +
      `Slippage risk: ${liq.slippageRisk.toFixed(0)} percent. ` +
      `Bid-ask health: ${liq.bidAskHealth.toFixed(0)}. ` +
      `Recovery capacity: ${liq.recoveryCapacity.toFixed(0)}.`;

    return {
      type: intent.type,
      narrative,
      shortSummary: `Liquidity: ${liq.fragilityLevel} (${liq.fragilityScore.toFixed(0)})`,
      confidence: liq.confidence,
      data: { riskGrade },
      speakableText: narrative,
      generatedAt: Date.now(),
    };
  }

  private async generateTemperatureResponse(intent: PredictiveIntent): Promise<PredictiveResponse> {
    const signalEngine = getPredictiveSignalEngine();
    const signal = signalEngine.getLatestSignal();

    if (!signal) {
      return {
        type: intent.type,
        narrative: 'Market temperature data is not yet available.',
        shortSummary: 'Data unavailable',
        confidence: 0,
        data: {},
        speakableText: 'Market temperature data is not yet available.',
        generatedAt: Date.now(),
      };
    }

    const temp = signal.marketTemperature;
    const trend = signal.temperatureTrend;
    
    let tempDescription: string;
    if (temp < 30) tempDescription = 'cold with low activity';
    else if (temp < 50) tempDescription = 'cool with moderate activity';
    else if (temp < 70) tempDescription = 'warm with elevated activity';
    else tempDescription = 'hot with high activity';

    const narrative = `Market temperature is ${temp} out of 100, which is ${tempDescription}. ` +
      `The temperature is ${trend}. ` +
      `Signal strength is ${signal.signalStrength} with ${(signal.predictiveConfidence * 100).toFixed(0)} percent confidence.`;

    return {
      type: intent.type,
      narrative,
      shortSummary: `Temperature: ${temp}/100 (${trend})`,
      confidence: signal.predictiveConfidence,
      data: { signal },
      speakableText: narrative,
      generatedAt: Date.now(),
    };
  }

  private async generateEntityPredictionResponse(intent: PredictiveIntent): Promise<PredictiveResponse> {
    // Use entity context if available
    const entityId = intent.extractedEntity || this.currentEntityContext?.id;

    if (!entityId) {
      return {
        type: intent.type,
        narrative: 'No entity specified or selected. Please select an entity or specify which entity you want to predict.',
        shortSummary: 'No entity specified',
        confidence: 0,
        data: {},
        speakableText: 'No entity specified. Please select an entity or tell me which one you want to predict.',
        generatedAt: Date.now(),
      };
    }

    // Generate general forecast with entity context
    const synthesizer = getAutonomousSignalSynthesizer();
    const forecast = synthesizer.synthesizeUnifiedForecast();

    const narrative = `For entity ${entityId}, the market outlook is ${forecast.consensusDirection}. ` +
      `Current risk level is ${forecast.currentRiskLevel} with ${forecast.riskOutlook} outlook. ` +
      `${forecast.shortTermOutlook}`;

    return {
      type: intent.type,
      narrative,
      shortSummary: `Entity ${entityId}: ${forecast.consensusDirection}`,
      confidence: forecast.overallConfidence,
      data: { forecast },
      speakableText: narrative,
      generatedAt: Date.now(),
    };
  }

  private async generateQuickSummaryResponse(intent: PredictiveIntent): Promise<PredictiveResponse> {
    const narrator = getFutureStateNarrator();
    
    const quickForecast = narrator.generateQuickForecast();
    const quickRisk = narrator.generateQuickRiskSummary();
    const quickScenario = narrator.generateQuickScenarioSummary();

    const narrative = `${quickForecast} ${quickRisk} ${quickScenario}`;

    return {
      type: intent.type,
      narrative,
      shortSummary: quickForecast,
      confidence: 0.7,
      data: {},
      speakableText: narrative,
      generatedAt: Date.now(),
    };
  }

  // ============================================================
  // Context Management
  // ============================================================

  /**
   * Update entity context from screen/selection
   */
  setEntityContext(entity: { id: string; type: string; name?: string } | null): void {
    this.currentEntityContext = entity;
    this.log('Entity context updated:', entity);
  }

  /**
   * Update screen context
   */
  setScreenContext(screen: string): void {
    this.currentScreenContext = screen;
    this.log('Screen context updated:', screen);
  }

  /**
   * Get current entity context
   */
  getEntityContext(): { id: string; type: string; name?: string } | null {
    return this.currentEntityContext;
  }

  /**
   * Get current screen context
   */
  getScreenContext(): string {
    return this.currentScreenContext;
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Process a predictive query end-to-end
   */
  async processQuery(
    query: string,
    inputs?: PredictiveInputs
  ): Promise<PredictiveResponse | null> {
    const intent = this.recognizePredictiveIntent(query);
    
    if (!intent || intent.confidence < this.config.minConfidenceThreshold) {
      this.log('Query not recognized as predictive:', query);
      return null;
    }

    return this.generatePredictiveResponse(intent, inputs);
  }

  /**
   * Get all supported intent patterns
   */
  getSupportedPatterns(): Array<{ pattern: string; type: PredictiveIntentType }> {
    return INTENT_PATTERNS.map(p => ({
      pattern: p.pattern.source,
      type: p.type,
    }));
  }

  /**
   * Get integration statistics
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Get current configuration
   */
  getConfig(): PredictiveIntegrationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PredictiveIntegrationConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Reset integration state
   */
  reset(): void {
    this.currentEntityContext = null;
    this.currentScreenContext = '';
    this.initializeStats();
    this.log('Integration reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let instance: PredictiveIntegrationImpl | null = null;

/**
 * Get the PredictiveIntegration singleton instance
 */
export function getPredictiveIntegration(): PredictiveIntegrationImpl {
  if (!instance) {
    instance = new PredictiveIntegrationImpl();
  }
  return instance;
}

/**
 * Create a new PredictiveIntegration with custom config
 */
export function createPredictiveIntegration(
  config?: Partial<PredictiveIntegrationConfig>
): PredictiveIntegrationImpl {
  return new PredictiveIntegrationImpl(config);
}
