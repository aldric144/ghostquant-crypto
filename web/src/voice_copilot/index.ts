/**
 * GhostQuant Voice Copilot - Barrel exports
 * 
 * Full Cognitive Engine with 10+ modules:
 * - CopilotBrain (Orchestrator)
 * - CopilotKnowledgeBase (Knowledge Repository)
 * - CopilotIntentModel (Intent Recognition)
 * - CopilotPersonality (Hybrid Personality)
 * - CopilotToneEngine (Dynamic Tone Selection)
 * - CopilotContextEngine (Context Awareness)
 * - CopilotErrorRecovery (Friendly Fallbacks)
 * - CopilotTrainingDataset (100+ Q&A Examples)
 * - CopilotSelfUpdate (Auto-Updates)
 * - CopilotUIResponses (UI Dialogue Pack)
 */

// Engines
export { createSpeechToTextEngine } from './SpeechToTextEngine';
export type { SpeechToTextEngine, SpeechToTextCallbacks } from './SpeechToTextEngine';

export { createWakeWordEngine, extractQueryAfterWakeWord } from './WakeWordEngine';
export type { WakeWordEngine, WakeWordCallbacks, WakeWordStatus } from './WakeWordEngine';

export { createMicEngine } from './MicEngine';
export type { MicEngine, MicEngineCallbacks, MicPermissionStatus, MicState } from './MicEngine';

export { createTextToSpeechEngine } from './TextToSpeechEngine';
export type { TextToSpeechEngine, TTSCallbacks, VoiceOption } from './TextToSpeechEngine';

// Brain (Orchestrator)
export {
  processQuestion,
  processWithCognitiveEngine,
  generateGreeting,
  getWelcomeMessage,
  getUIHoverHint,
  getUIGuidancePrompt,
  getUIEncouragingPrompt,
  recordResponseFeedback,
  getInvestorDemoScript,
} from './CopilotBrain';
export type { CopilotAnswer } from './CopilotBrain';

// Knowledge Base
export {
  queryKnowledge,
  getKnowledgeByCategory,
  getKnowledgeByPageContext,
  getKnowledgeById,
  getKnowledgeResponse,
  searchKnowledge,
  getRelatedKnowledge,
  ALL_KNOWLEDGE,
} from './CopilotKnowledgeBase';
export type { KnowledgeEntry, KnowledgeCategory, KnowledgeDepth, KnowledgeQuery } from './CopilotKnowledgeBase';

// Intent Model
export {
  recognizeIntent,
  isModeSwitch,
  isNavigationRequest,
  isVagueQuery,
  getIntentDisplayName,
  suggestFollowUpIntents,
} from './CopilotIntentModel';
export type { IntentCategory, IntentPattern, RecognizedIntent, ExtractedEntity } from './CopilotIntentModel';

// Tone Engine
export {
  selectTone,
  transformResponse,
  createToneContext,
  detectUserMood,
  assessMessageComplexity,
  getToneTransition,
  getToneDisplayName,
  TONE_CONFIGS,
} from './CopilotToneEngine';
export type { ToneState, ToneConfig, ToneContext } from './CopilotToneEngine';

// Context Engine
export {
  createInitialContextState,
  updatePageContext,
  updateSelectedEntity,
  updateHoveredElement,
  addRecentQuestion,
  markQuestionHelpfulness,
  updateUserPreferences,
  extractContextClues,
  getContextDescription,
  getRelevantPageElements,
  inferQuerySubject,
  getSuggestedQuestions,
  hasContextChanged,
  getContextSummary as getCognitiveContextSummary,
  PAGE_CONTEXTS,
} from './CopilotContextEngine';
export type {
  PageContext,
  SelectedEntity,
  HoveredElement,
  RecentQuestion,
  UserInteraction,
  ContextState,
  UserPreferences as CognitiveUserPreferences,
  ContextClues,
} from './CopilotContextEngine';

// Error Recovery
export {
  getRecoveryResponse,
  formatRecoveryResponse,
  recoverFromVagueQuestion,
  recoverFromUnclearIntent,
  recoverFromMissingContext,
  recoverFromTechnicalError,
  recoverFromNoData,
  offerSimplification,
  addEncouragement,
  addExplorationPrompt,
  isRoboticResponse,
  humanizeResponse,
  detectUserConfusion,
  getProactiveHelp,
} from './CopilotErrorRecovery';
export type { RecoveryType, RecoveryResponse } from './CopilotErrorRecovery';

// Training Dataset
export {
  TRAINING_DATASET,
  getExamplesByCategory,
  getExamplesByIntent,
  getExamplesByDepth,
  getExamplesByTag,
  searchExamples,
  getRandomExample,
  getDatasetStats,
} from './CopilotTrainingDataset';
export type { TrainingExample } from './CopilotTrainingDataset';

// Self Update
export {
  getPlatformMetadata,
  updatePlatformMetadata,
  registerNewPage,
  registerNewFeature,
  registerNewComponent,
  getNewPages,
  getNewFeatures,
  acknowledgeNewPages,
  acknowledgeNewFeatures,
  getUserPreferences as getCopilotUserPreferences,
  updateUserPreferences as updateCopilotUserPreferences,
  recordQuestion,
  recordFeedback,
  addFavoriteTopic,
  getUserSatisfactionRate,
  getLastSyncTime,
  updateLastSyncTime,
  isSyncNeeded,
  getPendingKnowledgeUpdates,
  getPendingIntentUpdates,
  clearPendingUpdates,
  getUsageStats,
  exportAllData,
  importData,
  generateComponentExplanation,
} from './CopilotSelfUpdate';
export type {
  PlatformMetadata,
  PageMetadata,
  FeatureMetadata,
  ComponentMetadata,
  UserPreferences as SelfUpdateUserPreferences,
  KnowledgeUpdate,
  IntentUpdate,
} from './CopilotSelfUpdate';

// UI Responses
export {
  HOVER_HINTS,
  ENCOURAGING_PROMPTS,
  CLARIFYING_PROMPTS,
  ERROR_RECOVERY_PROMPTS,
  GUIDANCE_PROMPTS,
  MICRO_INTERACTIONS,
  MODAL_INTERACTIONS,
  WELCOME_SCRIPTS,
  INVESTOR_DEMO_FULL,
  HYDRA_DEMO,
  CONSTELLATION_DEMO,
  getRandomResponse,
  getHoverHint,
  getEncouragingPrompt,
  getClarifyingPrompt,
  getErrorRecoveryPrompt,
  getGuidancePrompt,
  getMicroInteraction,
  getModalInteraction,
  getWelcomeScript,
  getDemoScript,
  getDemoSectionScript,
  getFullDemoScript,
  getAvailableDemos,
  ALL_UI_RESPONSES,
  ALL_DEMO_SCRIPTS,
} from './CopilotUIResponses';
export type { UIResponse, DemoScript, DemoSection, UserType, InteractionContext } from './CopilotUIResponses';

// Personality Engine
export {
  detectUserTone,
  determineResponseDepth,
  interpretVagueQuestion,
  generateFriendlyFallback,
  generatePersonalityConfig,
  shapeResponse,
  generatePersonalizedGreeting,
  isVagueQuestion,
  getAcknowledgment,
  getBeginnerIntro,
  getAdvancedIntro,
  getFollowUp,
  getClarificationRequest,
  getHumorLine,
} from './CopilotPersonality';
export type {
  UserTone,
  ResponseDepth,
  PersonalityConfig,
  InterpretedQuestion,
  ShapedResponse,
} from './CopilotPersonality';

// Context
export {
  createInitialContext,
  updateContextFromPath,
  updateContextWithAddress,
  updateContextWithCluster,
  updateContextWithRiskScore,
  updateUserMode,
  getContextSummary,
} from './CopilotContext';
export type { CopilotContextState, UserMode } from './CopilotContext';

// UI Components
export { default as CopilotPanel } from './CopilotPanel';
export type { CopilotPanelProps } from './CopilotPanel';

export { default as CopilotUI } from './CopilotUI';
export type { CopilotUIProps } from './CopilotUI';
