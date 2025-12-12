/**
 * STT Services - Speech-to-Text restoration patch
 * 
 * Exports:
 * - SpeechInputBridge: Bridge between Web Speech API and GhostQuant voice pipeline
 * - TranscriptRouter: Routes transcripts to WakeLoopEngine and CopilotOrchestrator
 */

export {
  getSpeechInputBridge,
  createSpeechInputBridge,
  type SpeechInputBridgeConfig,
  type SpeechInputBridgeCallbacks,
} from './SpeechInputBridge';

export {
  handlePartial,
  handleFinal,
} from './TranscriptRouter';
