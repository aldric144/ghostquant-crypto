/**
 * CopilotVoiceAdapter.ts
 * 
 * Bridge between CopilotUIRoot and the Phase 8 voice pipeline.
 * 
 * This adapter provides a clean interface for the UI to interact with:
 * - SpeechInputBridge (Web Speech API)
 * - ContinuousListeningController (wake-word + continuous listening)
 * - CopilotOrchestrator (intent routing)
 * - TranscriptRouter (transcript handling)
 * 
 * The UI should NOT directly instantiate SpeechRecognition or call processQuestion().
 * Instead, it should use this adapter to:
 * - Start/stop wake-word mode
 * - Start/stop manual mic sessions
 * - Receive transcript and response events via copilotEvents
 * 
 * Logging prefix: [VoiceAdapter]
 */

import { getSpeechInputBridge } from '../../services/stt/SpeechInputBridge';
import { getContinuousListeningController } from '../audio/ContinuousListeningController';
import { getCopilotOrchestrator } from '../dialogue/CopilotOrchestrator';
import { copilotEvents } from '../CopilotEvents';
import { handleFinal } from '../../services/stt/TranscriptRouter';

// ============================================================
// Types
// ============================================================

export interface VoiceAdapterState {
  isWakeWordMode: boolean;
  isManualMicMode: boolean;
  isListening: boolean;
  lastError: string | null;
}

export interface VoiceAdapterCallbacks {
  onStateChange?: (state: VoiceAdapterState) => void;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onResponse?: (text: string) => void;
  onError?: (error: string) => void;
}

// ============================================================
// CopilotVoiceAdapter Implementation
// ============================================================

class CopilotVoiceAdapterImpl {
  private state: VoiceAdapterState = {
    isWakeWordMode: false,
    isManualMicMode: false,
    isListening: false,
    lastError: null,
  };

  private callbacks: VoiceAdapterCallbacks = {};
  private isInitialized: boolean = false;

  constructor() {
    console.log('[VoiceAdapter] Initialized');
  }

  // ============================================================
  // Configuration
  // ============================================================

  setCallbacks(callbacks: VoiceAdapterCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
    console.log('[VoiceAdapter] Callbacks configured');
  }

  // ============================================================
  // Wake-Word Mode
  // ============================================================

  /**
   * Start wake-word mode
   * This starts continuous listening with wake-word detection
   */
  async startWakeWordMode(): Promise<boolean> {
    console.log('[VoiceAdapter] Starting wake-word mode');

    try {
      // Initialize if needed
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Start the continuous listening controller (which starts SpeechInputBridge)
      const controller = getContinuousListeningController();
      await controller.start();

      this.state.isWakeWordMode = true;
      this.state.isListening = true;
      this.state.lastError = null;
      this.notifyStateChange();

      // Emit state change via copilotEvents
      copilotEvents.setState('wake_listening');

      console.log('[VoiceAdapter] Wake-word mode started successfully');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[VoiceAdapter] Failed to start wake-word mode:', errorMessage);
      
      this.state.lastError = errorMessage;
      this.notifyStateChange();
      this.callbacks.onError?.(errorMessage);
      copilotEvents.emitError(errorMessage);

      return false;
    }
  }

  /**
   * Stop wake-word mode
   */
  stopWakeWordMode(): void {
    console.log('[VoiceAdapter] Stopping wake-word mode');

    try {
      const controller = getContinuousListeningController();
      controller.stop();

      this.state.isWakeWordMode = false;
      this.state.isListening = false;
      this.notifyStateChange();

      copilotEvents.setState('idle');

      console.log('[VoiceAdapter] Wake-word mode stopped');

    } catch (error) {
      console.error('[VoiceAdapter] Error stopping wake-word mode:', error);
    }
  }

  // ============================================================
  // Manual Mic Mode
  // ============================================================

  /**
   * Start manual mic session (user clicked mic button)
   * This starts STT and routes transcripts to CopilotOrchestrator
   */
  async startManualMicSession(): Promise<boolean> {
    console.log('[VoiceAdapter] Starting manual mic session');

    try {
      // Initialize if needed
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Start SpeechInputBridge directly for manual mode
      const bridge = getSpeechInputBridge();
      
      // Set up callbacks to emit events
      bridge.setCallbacks({
        onPartial: (text: string) => {
          console.log('[VoiceAdapter] Partial transcript:', text);
          this.callbacks.onTranscript?.(text, false);
          copilotEvents.emitTranscript(text, false);
        },
        onFinal: (text: string) => {
          console.log('[VoiceAdapter] Final transcript:', text);
          this.callbacks.onTranscript?.(text, true);
          copilotEvents.emitTranscript(text, true);
          // Note: handleFinal is already called by SpeechInputBridge
          // which routes to CopilotOrchestrator.handleSTTFinal()
        },
        onStart: () => {
          console.log('[VoiceAdapter] STT started');
          this.state.isListening = true;
          this.notifyStateChange();
        },
        onEnd: () => {
          console.log('[VoiceAdapter] STT ended');
          // Don't set isListening to false here - let stopManualMicSession handle it
        },
        onError: (error: Error) => {
          console.error('[VoiceAdapter] STT error:', error.message);
          this.state.lastError = error.message;
          this.notifyStateChange();
          this.callbacks.onError?.(error.message);
        },
      });

      bridge.start();

      this.state.isManualMicMode = true;
      this.state.isListening = true;
      this.state.lastError = null;
      this.notifyStateChange();

      copilotEvents.setState('listening');
      copilotEvents.emitMicStart();

      console.log('[VoiceAdapter] Manual mic session started successfully');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[VoiceAdapter] Failed to start manual mic session:', errorMessage);
      
      this.state.lastError = errorMessage;
      this.notifyStateChange();
      this.callbacks.onError?.(errorMessage);
      copilotEvents.emitError(errorMessage);

      return false;
    }
  }

  /**
   * Stop manual mic session
   */
  stopManualMicSession(): void {
    console.log('[VoiceAdapter] Stopping manual mic session');

    try {
      const bridge = getSpeechInputBridge();
      bridge.stop();

      this.state.isManualMicMode = false;
      this.state.isListening = false;
      this.notifyStateChange();

      copilotEvents.setState('idle');
      copilotEvents.emitMicStop();

      console.log('[VoiceAdapter] Manual mic session stopped');

    } catch (error) {
      console.error('[VoiceAdapter] Error stopping manual mic session:', error);
    }
  }

  // ============================================================
  // Direct Transcript Processing
  // ============================================================

  /**
   * Process a transcript directly through the Phase 8 pipeline
   * Use this when you have a transcript from an external source
   */
  async processTranscript(text: string): Promise<void> {
    console.log('[VoiceAdapter] Processing transcript:', text);

    try {
      copilotEvents.emitThinking();

      // Route through TranscriptRouter which handles:
      // - WakeLoopEngine.onTranscript() for wake-word detection
      // - CopilotOrchestrator.handleSTTFinal() for intent processing
      await handleFinal(text);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[VoiceAdapter] Error processing transcript:', errorMessage);
      this.callbacks.onError?.(errorMessage);
      copilotEvents.emitError(errorMessage);
    }
  }

  // ============================================================
  // Initialization
  // ============================================================

  /**
   * Initialize the voice adapter and its dependencies
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('[VoiceAdapter] Initializing...');

    try {
      // Get singleton instances to ensure they're created
      getSpeechInputBridge();
      getContinuousListeningController();
      getCopilotOrchestrator();

      this.isInitialized = true;
      console.log('[VoiceAdapter] Initialization complete');

    } catch (error) {
      console.error('[VoiceAdapter] Initialization failed:', error);
      throw error;
    }
  }

  // ============================================================
  // State Management
  // ============================================================

  private notifyStateChange(): void {
    this.callbacks.onStateChange?.({ ...this.state });
  }

  getState(): VoiceAdapterState {
    return { ...this.state };
  }

  isListening(): boolean {
    return this.state.isListening;
  }

  isWakeWordModeActive(): boolean {
    return this.state.isWakeWordMode;
  }

  isManualMicModeActive(): boolean {
    return this.state.isManualMicMode;
  }

  // ============================================================
  // Cleanup
  // ============================================================

  dispose(): void {
    console.log('[VoiceAdapter] Disposing...');

    this.stopWakeWordMode();
    this.stopManualMicSession();

    this.callbacks = {};
    this.isInitialized = false;

    console.log('[VoiceAdapter] Disposed');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let voiceAdapter: CopilotVoiceAdapterImpl | null = null;

/**
 * Get the CopilotVoiceAdapter singleton instance
 */
export function getCopilotVoiceAdapter(): CopilotVoiceAdapterImpl {
  if (!voiceAdapter) {
    voiceAdapter = new CopilotVoiceAdapterImpl();
  }
  return voiceAdapter;
}

/**
 * Create a new CopilotVoiceAdapter instance
 */
export function createCopilotVoiceAdapter(): CopilotVoiceAdapterImpl {
  return new CopilotVoiceAdapterImpl();
}

export default {
  getCopilotVoiceAdapter,
  createCopilotVoiceAdapter,
};
