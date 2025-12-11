/**
 * Proactive Intelligence Module Index
 * 
 * Phase 5: Proactive Intelligence & Autonomous Alerting Engine
 * 
 * Exports all proactive intelligence components for the GhostQuant Copilot.
 */

// ProactiveIntelMonitor - Continuous intelligence monitoring
export {
  getProactiveIntelMonitor,
  createProactiveIntelMonitor,
  type IntelSnapshot,
  type ConstellationMetrics,
  type WhaleIntelSummary,
  type EcoscanEnvironmental,
  type GlobalRiskData,
  type AlertData,
  type MarketIntelData,
  type ManipulationData,
  type HydraActivityData,
  type IntelChange,
  type IntelChangeType,
  type MonitorConfig,
} from './ProactiveIntelMonitor';

// IntelEventClassifier - Event classification
export {
  getIntelEventClassifier,
  createIntelEventClassifier,
  type EventCategory,
  type SeverityLevel,
  type ClassifiedEvent,
  type ClassificationRule,
  type ClassifierConfig,
} from './IntelEventClassifier';

// ProactiveResponseEngine - Autonomous response generation
export {
  getProactiveResponseEngine,
  createProactiveResponseEngine,
  type ResponseLength,
  type ProactiveResponse,
  type ResponseTemplate,
  type ResponseEngineConfig,
} from './ProactiveResponseEngine';

// ProactiveSpeechController - Alert speech control
export {
  getProactiveSpeechController,
  createProactiveSpeechController,
  type SpeechQueueItem,
  type SpeechControllerConfig,
  type SpeechControllerState,
  type SpeechStats,
} from './ProactiveSpeechController';

// IntelBriefingScheduler - Scheduled briefings
export {
  getIntelBriefingScheduler,
  createIntelBriefingScheduler,
  type BriefingType,
  type ScheduledBriefing,
  type BriefingContent,
  type BriefingSchedulerConfig,
} from './IntelBriefingScheduler';
