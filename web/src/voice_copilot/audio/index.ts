/**
 * Audio Module Index - Phase 2 & Phase 4 Modules
 * 
 * Exports all audio-related modules for the GhostQuant Voice Copilot.
 */

// InterruptibleTTSPipeline - Interruptible audio playback
export {
  getInterruptibleTTSPipeline,
  createInterruptibleTTSPipeline,
  type PlaybackState,
  type PlaybackEvent,
  type TTSPipelineConfig,
} from './InterruptibleTTSPipeline';

// ============================================================
// Phase 4: Continuous Listening + Wake-Word Loop Engine
// ============================================================

// WakeLoopEngine - Continuous wake-word listening loop
export {
  getWakeLoopEngine,
  createWakeLoopEngine,
  type WakeLoopState,
  type PowerMode,
  type WakeLoopConfig,
  type WakeLoopCallbacks,
  type WakeLoopStats,
} from './WakeLoopEngine';

// WakeWordSensitivityController - Dynamic sensitivity tuning
export {
  getWakeWordSensitivityController,
  createWakeWordSensitivityController,
  type SensitivityLevel,
  type SensitivityConfig,
  type SensitivityStats,
  type DetectionResult,
} from './WakeWordSensitivityController';

// NoiseSuppressionEngine - Noise reduction and VAD
export {
  getNoiseSuppressionEngine,
  createNoiseSuppressionEngine,
  type NoiseSuppressionConfig,
  type NoiseSuppressionStats,
  type VADResult,
} from './NoiseSuppressionEngine';

// ContinuousListeningController - Master controller
export {
  getContinuousListeningController,
  createContinuousListeningController,
  type ContinuousListeningState,
  type ContinuousListeningConfig,
  type ContinuousListeningCallbacks,
  type ContinuousListeningStats,
} from './ContinuousListeningController';

// MicEngineHooks - Optional hooks for MicEngine
export {
  getMicEngineHooks,
  createMicEngineHooks,
  type MicEngineHookCallbacks,
  type MicEngineHookConfig,
  type MicEngineHookState,
} from './MicEngineHooks';
