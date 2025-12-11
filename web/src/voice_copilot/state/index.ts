/**
 * State Module Exports - Phase 3 & Phase 4 Modules
 */

export {
  getCopilotStateMonitor,
  createCopilotStateMonitor,
  type GhostQuantModule,
  type RiskLevel,
  type EntitySelection,
  type AlertSummary,
  type AlertData,
  type HeatmapRegion,
  type IntelligenceSignal,
  type LiveDataSnapshot,
  type CopilotState,
  type ContextSummary,
} from './CopilotStateMonitor';

export {
  getCopilotDataAggregator,
  createCopilotDataAggregator,
  type ConstellationData,
  type ConstellationNode,
  type ConstellationEdge,
  type ClusterSummary,
  type ConstellationMetrics,
  type WhaleIntelData,
  type WhaleTransaction,
  type WhaleWallet,
  type EcoscanData,
  type EcoscanTrend,
  type HydraData,
  type HydraPattern,
  type OracleEyeData,
  type SpoofingIndicator,
  type MomentumData,
  type MomentumMover,
  type AlphaBrainData,
  type AlphaPrediction,
  type MarketGridData,
  type MarketSignal,
  type EntityProfile,
  type AggregatedIntelligence,
} from './CopilotDataAggregator';

// ============================================================
// Phase 4: Continuous Listening + Wake-Word Loop Engine
// ============================================================

// HandsFreeModeManager - Toggle and persist hands-free mode
export {
  getHandsFreeModeManager,
  createHandsFreeModeManager,
  type HandsFreeModeConfig,
  type HandsFreeModeState,
  type HandsFreeModeCallbacks,
} from './HandsFreeModeManager';

// ============================================================
// Phase 5: Proactive Intelligence & Autonomous Alerting Engine
// ============================================================

// ProactivePreferences - User preferences for proactive mode
export {
  getProactivePreferences,
  createProactivePreferences,
  type AlertCategoryPreference,
  type BriefingPreference,
  type ProactivePreferencesData,
  type PreferencesConfig,
} from './ProactivePreferences';
