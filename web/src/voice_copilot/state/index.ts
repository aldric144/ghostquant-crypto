/**
 * State Module Exports - Phase 3: Real-Time Intelligence Awareness
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
