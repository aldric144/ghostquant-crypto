/**
 * GhostQuant Voice Copilot - Barrel exports
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

// Brain
export { processQuestion, generateGreeting } from './CopilotBrain';
export type { CopilotAnswer } from './CopilotBrain';

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
