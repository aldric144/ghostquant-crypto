/**
 * Audio Module Index - Phase 2 Conversational Engine
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
