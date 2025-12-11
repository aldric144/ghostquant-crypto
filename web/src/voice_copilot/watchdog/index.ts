/**
 * Phase 7: Autonomous Market Watchdog + High-Sensitivity Threat Detection Layer
 * 
 * This module provides a self-sufficient watchdog that continuously scans the market
 * for emergent dangers, detects anomalies, issues high-priority alerts, monitors
 * entities for escalation patterns, detects coordinated manipulation, tracks
 * liquidity fragility, understands market pressure shifts, and speaks automatic
 * warnings in real time.
 * 
 * All modules are 100% isolated and additive - no modifications to existing code.
 */

// MODULE 1: Market Pressure Scanner
export {
  getMarketPressureScanner,
  createMarketPressureScanner,
  type PressureReading,
  type PressureComponent,
  type PressureDirection,
  type MarketPressureInputs,
  type PressureScannerConfig,
} from './MarketPressureScanner';

// MODULE 2: Anomaly Detection Engine
export {
  getAnomalyDetectionEngine,
  createAnomalyDetectionEngine,
  type Anomaly,
  type AnomalyType,
  type AnomalySeverity,
  type AnomalySource,
  type AnomalyDetectionInputs,
  type AnomalyDetectionConfig,
} from './AnomalyDetectionEngine';

// MODULE 3: Liquidity Fragility Detector
export {
  getLiquidityFragilityDetector,
  createLiquidityFragilityDetector,
  type FragilityZone,
  type FragilityAlert,
  type FragilityType,
  type FragilitySeverity,
  type OrderBookSnapshot,
  type OrderBookLevel,
  type WhalePositionData,
  type StopLossCluster,
  type LiquidityFragilityInputs,
  type FragilityDetectorConfig,
} from './LiquidityFragilityDetector';

// MODULE 4: Manipulation Detector
export {
  getManipulationDetector,
  createManipulationDetector,
  type ManipulationSignal,
  type ManipulationType,
  type ManipulationSeverity,
  type ManipulatorEntity,
  type OrderFlowData,
  type TradeData,
  type OrderBookChange,
  type EntityActivity,
  type ManipulationDetectorInputs,
  type ManipulationDetectorConfig,
} from './ManipulationDetector';

// MODULE 5: Entity Escalation Tracker
export {
  getEntityEscalationTracker,
  createEntityEscalationTracker,
  type EscalationAlert,
  type EscalationType,
  type EscalationSeverity,
  type EntityType,
  type EntityMood,
  type EntityProfile,
  type EntityPosition,
  type EntityTransaction,
  type EntitySnapshot,
  type EntityEscalationInputs,
  type EscalationTrackerConfig,
} from './EntityEscalationTracker';

// MODULE 6: Autonomous Alert Router
export {
  getAutonomousAlertRouter,
  createAutonomousAlertRouter,
  type WatchdogAlert,
  type AlertDelivery,
  type AlertPriority,
  type AlertColor,
  type AlertSource,
  type AlertCategory,
  type IncomingAlert,
  type AlertRouterConfig,
  type AlertStats,
} from './AutonomousAlertRouter';

// MODULE 7: Watchdog Narrator
export {
  getWatchdogNarrator,
  createWatchdogNarrator,
  type WatchdogNarrative,
  type NarrativeTone,
  type NarrativeLength,
  type NarrativeOptions,
  type AlertContext,
  type NarratorConfig,
} from './WatchdogNarrator';

// MODULE 8: Watchdog Orchestrator
export {
  getWatchdogOrchestrator,
  createWatchdogOrchestrator,
  type WatchdogSynthesis,
  type WatchdogState,
  type WatchdogInputs,
  type UserRelevanceFactors,
  type SpeechActivation,
  type WatchdogOrchestratorConfig,
} from './WatchdogOrchestrator';

// MODULE 9: Copilot Integration
export {
  getWatchdogIntegration,
  createWatchdogIntegration,
  type WatchdogIntent,
  type WatchdogIntentMatch,
  type WatchdogResponse,
  type WatchdogTrigger,
  type WatchdogIntegrationConfig,
} from './WatchdogIntegration';
