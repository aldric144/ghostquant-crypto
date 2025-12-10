/**
 * Conversation Module - ChatGPT-Style Voice Mode for GhostQuant
 * 
 * This module provides TRUE bidirectional conversation with natural flow:
 * - Interruptible turn-taking
 * - Streaming speech-to-text
 * - Short-term conversational memory
 * - Dynamic tone selection
 * - Continuous conversation loop
 * - Silence detection
 * 
 * All modules are isolated and do not modify existing Copilot logic.
 */

// Import all modules for re-export and default export
import {
  getTurnTakingManager,
  createTurnTakingManager,
  interruptTTS,
  cancelPlayback,
  midSentenceStop,
  resumeListening,
} from './TurnTakingManager';

import {
  getStreamingSTTEngine,
  createStreamingSTTEngine,
} from './StreamingSTTEngine';

import {
  getConversationMemory,
  createConversationMemory,
} from './ConversationMemory';

import {
  getToneEnginePro,
  createToneEnginePro,
  selectTone,
  getCurrentTone,
  setTone,
} from './ToneEnginePro';

import {
  getConversationLoopController,
  createConversationLoopController,
} from './ConversationLoopController';

import {
  getSilenceDetector,
  createSilenceDetector,
} from './SilenceDetector';

// Re-export everything with types
export {
  getTurnTakingManager,
  createTurnTakingManager,
  interruptTTS,
  cancelPlayback,
  midSentenceStop,
  resumeListening,
} from './TurnTakingManager';

export type {
  TurnState,
  TurnTakingConfig,
  TurnTakingEvents,
} from './TurnTakingManager';

export {
  getStreamingSTTEngine,
  createStreamingSTTEngine,
} from './StreamingSTTEngine';

export type {
  StreamingSTTConfig,
  StreamingSTTEvents,
  PartialTranscript,
} from './StreamingSTTEngine';

export {
  getConversationMemory,
  createConversationMemory,
} from './ConversationMemory';

export type {
  ConversationMessage,
  ConversationContext,
  ConversationMemoryConfig,
} from './ConversationMemory';

export {
  getToneEnginePro,
  createToneEnginePro,
  selectTone,
  getCurrentTone,
  setTone,
} from './ToneEnginePro';

export type {
  ToneType,
  ToneProfile,
  ToneSelectionResult,
  SentimentAnalysis,
} from './ToneEnginePro';

export {
  getConversationLoopController,
  createConversationLoopController,
} from './ConversationLoopController';

export type {
  ConversationMode,
  ConversationLoopConfig,
  ConversationLoopEvents,
} from './ConversationLoopController';

export {
  getSilenceDetector,
  createSilenceDetector,
} from './SilenceDetector';

export type {
  SilenceDetectorConfig,
  SilenceDetectorEvents,
} from './SilenceDetector';

// Default export with all managers
export default {
  // Managers
  getTurnTakingManager,
  getStreamingSTTEngine,
  getConversationMemory,
  getToneEnginePro,
  getConversationLoopController,
  getSilenceDetector,
  
  // Factory functions
  createTurnTakingManager,
  createStreamingSTTEngine,
  createConversationMemory,
  createToneEnginePro,
  createConversationLoopController,
  createSilenceDetector,
  
  // Convenience functions
  interruptTTS,
  cancelPlayback,
  midSentenceStop,
  resumeListening,
  selectTone,
  getCurrentTone,
  setTone,
};
