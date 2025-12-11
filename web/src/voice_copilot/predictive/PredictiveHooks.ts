/**
 * PredictiveHooks.ts
 * 
 * Phase 6: Ultra-Deep Foresight Engine - MODULE 9
 * 
 * Lightweight React hooks for predictive intelligence (additive only):
 * - usePredictiveSignals()
 * - usePredictiveRiskLevels()
 * - usePredictiveScenarios()
 * 
 * These hooks do NOT modify any existing UI components.
 * Future UI phases will make use of these hooks.
 * 
 * This is a purely additive, 100% isolated module.
 * Logging prefix: [PredictiveHooks]
 */

import { useState, useEffect, useCallback, useRef } from 'react';

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
} from './TimeHorizonForecaster';

import {
  getScenarioGenerator,
  type ScenarioSet,
  type Scenario,
  type ScenarioType,
} from './ScenarioGenerator';

import {
  getPredictiveRiskEngine,
  type PredictiveRiskGrade,
  type RiskComponent,
  type WhalePressureAnalysis,
  type LiquidityFragilityAnalysis,
  type ManipulationRiskAnalysis,
} from './PredictiveRiskEngine';

import {
  getAutonomousSignalSynthesizer,
  type UnifiedForecast,
} from './AutonomousSignalSynthesizer';

import {
  getFutureStateNarrator,
  type ForecastNarrative,
} from './FutureStateNarrator';

// ============================================================
// Types
// ============================================================

export interface UsePredictiveSignalsResult {
  signal: PredictiveSignal | null;
  landscape: FutureLandscape | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  
  // Actions
  refresh: (inputs?: PredictiveInputs) => void;
  getHorizonForecast: (horizon: TimeHorizon) => HorizonForecast | null;
  
  // Derived values
  marketTemperature: number;
  temperatureTrend: 'heating' | 'cooling' | 'stable';
  dominantDirection: string;
  signalStrength: number;
  confidence: number;
}

export interface UsePredictiveRiskLevelsResult {
  riskGrade: PredictiveRiskGrade | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  
  // Actions
  refresh: () => void;
  
  // Derived values
  overallRisk: number;
  riskLabel: string;
  grade: string;
  whalePressure: WhalePressureAnalysis | null;
  liquidityFragility: LiquidityFragilityAnalysis | null;
  manipulationRisk: ManipulationRiskAnalysis | null;
  riskTrend: 'increasing' | 'decreasing' | 'stable';
  topRiskFactors: string[];
}

export interface UsePredictiveScenariosResult {
  scenarioSet: ScenarioSet | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  
  // Actions
  refresh: () => void;
  getScenario: (type: ScenarioType) => Scenario | null;
  
  // Derived values
  primaryScenario: Scenario | null;
  alternativeScenarios: Scenario[];
  bullishProbability: number;
  bearishProbability: number;
  neutralProbability: number;
  scenarioCount: number;
}

export interface UseUnifiedForecastResult {
  forecast: UnifiedForecast | null;
  narrative: ForecastNarrative | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  
  // Actions
  refresh: (inputs?: PredictiveInputs) => void;
  generateNarrative: (style?: 'analytical' | 'conversational' | 'brief') => void;
  
  // Derived values
  executiveSummary: string;
  consensusDirection: string;
  overallConfidence: number;
  currentRiskLevel: number;
  speakableText: string;
}

export interface PredictiveHooksConfig {
  autoRefresh: boolean;
  refreshIntervalMs: number;
  enableLogging: boolean;
}

const DEFAULT_CONFIG: PredictiveHooksConfig = {
  autoRefresh: false,
  refreshIntervalMs: 30000, // 30 seconds
  enableLogging: true,
};

// ============================================================
// Logging Helper
// ============================================================

const log = (message: string, data?: unknown): void => {
  if (DEFAULT_CONFIG.enableLogging) {
    if (data !== undefined) {
      console.log(`[PredictiveHooks] ${message}`, data);
    } else {
      console.log(`[PredictiveHooks] ${message}`);
    }
  }
};

// ============================================================
// usePredictiveSignals Hook
// ============================================================

/**
 * Hook for accessing predictive signals and future landscape
 */
export function usePredictiveSignals(
  config: Partial<PredictiveHooksConfig> = {}
): UsePredictiveSignalsResult {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [signal, setSignal] = useState<PredictiveSignal | null>(null);
  const [landscape, setLandscape] = useState<FutureLandscape | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback((inputs?: PredictiveInputs) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const signalEngine = getPredictiveSignalEngine();
      const forecaster = getTimeHorizonForecaster();
      
      // Generate new signal if inputs provided
      if (inputs) {
        const newSignal = signalEngine.generateSignal(inputs);
        if (newSignal) {
          setSignal(newSignal);
          
          // Generate landscape from signal
          const newLandscape = forecaster.generateLandscape(newSignal);
          setLandscape(newLandscape);
        }
      } else {
        // Get latest signal
        const latestSignal = signalEngine.getLatestSignal();
        setSignal(latestSignal);
        
        // Get latest landscape
        const latestLandscape = forecaster.getLatestLandscape();
        setLandscape(latestLandscape);
      }
      
      setLastUpdated(Date.now());
      log('Signals refreshed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh signals';
      setError(errorMessage);
      log('Error refreshing signals:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getHorizonForecast = useCallback((horizon: TimeHorizon): HorizonForecast | null => {
    if (!landscape) return null;
    
    switch (horizon) {
      case 'short_term':
        return landscape.shortTerm;
      case 'mid_term':
        return landscape.midTerm;
      case 'long_term':
        return landscape.longTerm;
      case 'extended':
        return landscape.extended;
      default:
        return null;
    }
  }, [landscape]);

  // Auto-refresh effect
  useEffect(() => {
    if (mergedConfig.autoRefresh) {
      intervalRef.current = setInterval(() => {
        refresh();
      }, mergedConfig.refreshIntervalMs);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [mergedConfig.autoRefresh, mergedConfig.refreshIntervalMs, refresh]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    signal,
    landscape,
    isLoading,
    error,
    lastUpdated,
    
    refresh,
    getHorizonForecast,
    
    // Derived values
    marketTemperature: signal?.marketTemperature ?? 50,
    temperatureTrend: signal?.temperatureTrend ?? 'stable',
    dominantDirection: landscape?.dominantDirection ?? 'uncertain',
    signalStrength: signal?.signalStrength ?? 0,
    confidence: signal?.predictiveConfidence ?? 0,
  };
}

// ============================================================
// usePredictiveRiskLevels Hook
// ============================================================

/**
 * Hook for accessing predictive risk levels and analysis
 */
export function usePredictiveRiskLevels(
  config: Partial<PredictiveHooksConfig> = {}
): UsePredictiveRiskLevelsResult {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [riskGrade, setRiskGrade] = useState<PredictiveRiskGrade | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      const riskEngine = getPredictiveRiskEngine();
      const signalEngine = getPredictiveSignalEngine();
      
      // Get latest signal
      const signal = signalEngine.getLatestSignal();
      
      if (signal) {
        // Generate new risk grade
        const newRiskGrade = riskEngine.generateRiskGrade(signal);
        setRiskGrade(newRiskGrade);
      } else {
        // Get latest risk grade
        const latestGrade = riskEngine.getLatestGrade();
        setRiskGrade(latestGrade);
      }
      
      setLastUpdated(Date.now());
      log('Risk levels refreshed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh risk levels';
      setError(errorMessage);
      log('Error refreshing risk levels:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate risk trend from history
  const getRiskTrend = useCallback((): 'increasing' | 'decreasing' | 'stable' => {
    const riskEngine = getPredictiveRiskEngine();
    return riskEngine.getRiskTrend();
  }, []);

  // Extract top risk factors
  const getTopRiskFactors = useCallback((): string[] => {
    if (!riskGrade) return [];
    
    return riskGrade.components
      .filter(c => c.score > 50)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(c => `${c.category.replace(/_/g, ' ')}: ${c.score}`);
  }, [riskGrade]);

  // Auto-refresh effect
  useEffect(() => {
    if (mergedConfig.autoRefresh) {
      intervalRef.current = setInterval(() => {
        refresh();
      }, mergedConfig.refreshIntervalMs);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [mergedConfig.autoRefresh, mergedConfig.refreshIntervalMs, refresh]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    riskGrade,
    isLoading,
    error,
    lastUpdated,
    
    refresh,
    
    // Derived values
    overallRisk: riskGrade?.overallRiskLevel ?? 50,
    riskLabel: riskGrade?.riskLabel ?? 'Unknown',
    grade: riskGrade?.riskGrade ?? 'C',
    whalePressure: riskGrade?.whalePressure ?? null,
    liquidityFragility: riskGrade?.liquidityFragility ?? null,
    manipulationRisk: riskGrade?.manipulationRisk ?? null,
    riskTrend: getRiskTrend(),
    topRiskFactors: getTopRiskFactors(),
  };
}

// ============================================================
// usePredictiveScenarios Hook
// ============================================================

/**
 * Hook for accessing predictive scenarios
 */
export function usePredictiveScenarios(
  config: Partial<PredictiveHooksConfig> = {}
): UsePredictiveScenariosResult {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [scenarioSet, setScenarioSet] = useState<ScenarioSet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      const scenarioGenerator = getScenarioGenerator();
      const signalEngine = getPredictiveSignalEngine();
      
      // Get latest signal
      const signal = signalEngine.getLatestSignal();
      
      if (signal) {
        // Generate new scenarios
        const newScenarios = scenarioGenerator.generateFromSignal(signal);
        setScenarioSet(newScenarios);
      } else {
        // Get latest scenarios
        const latestScenarios = scenarioGenerator.getLatestScenarioSet();
        setScenarioSet(latestScenarios);
      }
      
      setLastUpdated(Date.now());
      log('Scenarios refreshed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh scenarios';
      setError(errorMessage);
      log('Error refreshing scenarios:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getScenario = useCallback((type: ScenarioType): Scenario | null => {
    if (!scenarioSet) return null;
    return scenarioSet.scenarios.find(s => s.type === type) || null;
  }, [scenarioSet]);

  // Auto-refresh effect
  useEffect(() => {
    if (mergedConfig.autoRefresh) {
      intervalRef.current = setInterval(() => {
        refresh();
      }, mergedConfig.refreshIntervalMs);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [mergedConfig.autoRefresh, mergedConfig.refreshIntervalMs, refresh]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    scenarioSet,
    isLoading,
    error,
    lastUpdated,
    
    refresh,
    getScenario,
    
    // Derived values
    primaryScenario: scenarioSet?.primaryScenario ?? null,
    alternativeScenarios: scenarioSet?.scenarios.filter(s => s.id !== scenarioSet.primaryScenario.id) ?? [],
    bullishProbability: scenarioSet?.bullishProbability ?? 33,
    bearishProbability: scenarioSet?.bearishProbability ?? 33,
    neutralProbability: scenarioSet?.neutralProbability ?? 34,
    scenarioCount: scenarioSet?.scenarios.length ?? 0,
  };
}

// ============================================================
// useUnifiedForecast Hook
// ============================================================

/**
 * Hook for accessing unified forecast with narrative generation
 */
export function useUnifiedForecast(
  config: Partial<PredictiveHooksConfig> = {}
): UseUnifiedForecastResult {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [forecast, setForecast] = useState<UnifiedForecast | null>(null);
  const [narrative, setNarrative] = useState<ForecastNarrative | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback((inputs?: PredictiveInputs) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const synthesizer = getAutonomousSignalSynthesizer();
      
      // Generate or refresh forecast
      const newForecast = inputs 
        ? synthesizer.refreshAndSynthesize(inputs)
        : synthesizer.synthesizeUnifiedForecast();
      
      setForecast(newForecast);
      setLastUpdated(Date.now());
      log('Unified forecast refreshed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh forecast';
      setError(errorMessage);
      log('Error refreshing forecast:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateNarrative = useCallback((style: 'analytical' | 'conversational' | 'brief' = 'analytical') => {
    if (!forecast) {
      log('No forecast available for narrative generation');
      return;
    }
    
    try {
      const narrator = getFutureStateNarrator();
      const newNarrative = narrator.narrateUnifiedForecast(forecast, {
        style,
        length: style === 'brief' ? 'short' : 'medium',
      });
      setNarrative(newNarrative);
      log('Narrative generated');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate narrative';
      log('Error generating narrative:', errorMessage);
    }
  }, [forecast]);

  // Auto-refresh effect
  useEffect(() => {
    if (mergedConfig.autoRefresh) {
      intervalRef.current = setInterval(() => {
        refresh();
      }, mergedConfig.refreshIntervalMs);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [mergedConfig.autoRefresh, mergedConfig.refreshIntervalMs, refresh]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-generate narrative when forecast changes
  useEffect(() => {
    if (forecast && !narrative) {
      generateNarrative();
    }
  }, [forecast, narrative, generateNarrative]);

  return {
    forecast,
    narrative,
    isLoading,
    error,
    lastUpdated,
    
    refresh,
    generateNarrative,
    
    // Derived values
    executiveSummary: forecast?.executiveSummary ?? 'No forecast available',
    consensusDirection: forecast?.consensusDirection ?? 'uncertain',
    overallConfidence: forecast?.overallConfidence ?? 0,
    currentRiskLevel: forecast?.currentRiskLevel ?? 50,
    speakableText: narrative?.narrative ?? forecast?.executiveSummary ?? '',
  };
}

// ============================================================
// Utility Hooks
// ============================================================

/**
 * Hook for quick access to market temperature
 */
export function useMarketTemperature(): {
  temperature: number;
  trend: 'heating' | 'cooling' | 'stable';
  isLoading: boolean;
} {
  const { signal, isLoading } = usePredictiveSignals({ autoRefresh: false });
  
  return {
    temperature: signal?.marketTemperature ?? 50,
    trend: signal?.temperatureTrend ?? 'stable',
    isLoading,
  };
}

/**
 * Hook for quick access to risk level
 */
export function useRiskLevel(): {
  level: number;
  grade: string;
  label: string;
  isLoading: boolean;
} {
  const { riskGrade, isLoading } = usePredictiveRiskLevels({ autoRefresh: false });
  
  return {
    level: riskGrade?.overallRiskLevel ?? 50,
    grade: riskGrade?.riskGrade ?? 'C',
    label: riskGrade?.riskLabel ?? 'Unknown',
    isLoading,
  };
}

/**
 * Hook for quick access to primary scenario
 */
export function usePrimaryScenario(): {
  scenario: Scenario | null;
  probability: number;
  isLoading: boolean;
} {
  const { primaryScenario, isLoading } = usePredictiveScenarios({ autoRefresh: false });
  
  return {
    scenario: primaryScenario,
    probability: primaryScenario?.probability ?? 0,
    isLoading,
  };
}

/**
 * Hook for quick access to direction consensus
 */
export function useDirectionConsensus(): {
  direction: string;
  confidence: number;
  agreement: number;
  isLoading: boolean;
} {
  const { forecast, isLoading } = useUnifiedForecast({ autoRefresh: false });
  
  return {
    direction: forecast?.consensusDirection ?? 'uncertain',
    confidence: forecast?.directionConfidence ?? 0,
    agreement: forecast?.directionAgreement ?? 0,
    isLoading,
  };
}

// ============================================================
// Export Configuration Helper
// ============================================================

/**
 * Configure default settings for all predictive hooks
 */
export function configurePredictiveHooks(config: Partial<PredictiveHooksConfig>): void {
  Object.assign(DEFAULT_CONFIG, config);
  log('Predictive hooks configured:', DEFAULT_CONFIG);
}
