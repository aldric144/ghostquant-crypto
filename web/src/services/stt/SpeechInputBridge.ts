/**
 * SpeechInputBridge.ts
 * 
 * STT Restoration Patch - Bridge between STT Engine and GhostQuant voice pipeline
 * 
 * Responsibilities:
 * - Subscribe to STTEngine (ElevenLabs primary, Web Speech fallback)
 * - Provide partial and final transcript callbacks
 * - Dispatch transcripts to:
 *   - WakeLoopEngine
 *   - WakeWordNormalizationPipeline
 *   - CopilotOrchestrator.processTranscript()
 * 
 * Logging prefix: [SpeechInputBridge]
 * 
 * This module now delegates to STTEngine for provider selection and fallback.
 */

import { handlePartial, handleFinal } from './TranscriptRouter';
import * as STTEngine from '../../voice_copilot/STTEngine';

// ============================================================
// Types
// ============================================================

export interface SpeechInputBridgeConfig {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
}

export interface SpeechInputBridgeCallbacks {
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: SpeechInputBridgeConfig = {
  continuous: true,
  interimResults: true,
  lang: 'en-US',
  maxAlternatives: 1,
};

// ============================================================
// Web Speech API Types
// ============================================================

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

// ============================================================
// SpeechInputBridge Implementation
// ============================================================

class SpeechInputBridgeImpl {
  private config: SpeechInputBridgeConfig;
  private callbacks: SpeechInputBridgeCallbacks = {};
  private recognition: any = null;
  private isListening: boolean = false;
  private shouldRestart: boolean = false;

  constructor(config: Partial<SpeechInputBridgeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('[SpeechInputBridge] Initialized');
  }

  // ============================================================
  // Configuration
  // ============================================================

  setCallbacks(callbacks: SpeechInputBridgeCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
    console.log('[SpeechInputBridge] Callbacks configured');
  }

  updateConfig(config: Partial<SpeechInputBridgeConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[SpeechInputBridge] Config updated');
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  /**
   * Check if any STT provider is supported (ElevenLabs or Web Speech)
   */
  isSupported(): boolean {
    return STTEngine.isSTTAvailable();
  }

  /**
   * Start listening for speech via STTEngine
   * Uses ElevenLabs as primary, Web Speech as fallback
   * @returns true if started successfully, false otherwise
   */
  start(): boolean {
    console.log('[SpeechInputBridge] start() called - delegating to STTEngine');
    
    if (this.isListening) {
      console.log('[SpeechInputBridge] Already listening');
      return true;
    }

    if (!this.isSupported()) {
      console.error('[SpeechInputBridge] No STT provider available');
      this.callbacks.onError?.(new Error('No STT provider available'));
      return false;
    }

    console.log('[SpeechInputBridge] Starting STTEngine...');

    // Configure STTEngine callbacks to route through this bridge
    STTEngine.setCallbacks({
      onStart: () => {
        console.log('[SpeechInputBridge] STTEngine started');
        this.isListening = true;
        this.callbacks.onStart?.();
      },
      onPartial: (text: string) => {
        console.log('[SpeechInputBridge] partial:', text);
        this.callbacks.onPartial?.(text);
        handlePartial(text);
      },
      onFinal: (text: string) => {
        console.log('[SpeechInputBridge] final:', text);
        this.callbacks.onFinal?.(text);
        handleFinal(text);
      },
      onError: (error: Error) => {
        console.error('[SpeechInputBridge] STTEngine error:', error.message);
        this.callbacks.onError?.(error);
      },
      onEnd: () => {
        console.log('[SpeechInputBridge] STTEngine ended');
        this.isListening = false;
        this.callbacks.onEnd?.();
      },
    });

    // Start STTEngine asynchronously
    this.shouldRestart = true;
    STTEngine.startListening({
      language: this.config.lang,
      continuous: this.config.continuous,
      fallbackEnabled: true,
    }).then((result) => {
      if (result.success) {
        console.log(`[SpeechInputBridge] STTEngine started with provider: ${result.provider}`);
      } else {
        console.error('[SpeechInputBridge] STTEngine failed to start:', result.error);
        this.callbacks.onError?.(new Error(result.error || 'Failed to start STT'));
      }
    }).catch((error) => {
      console.error('[SpeechInputBridge] STTEngine exception:', error);
      this.callbacks.onError?.(error);
    });

    return true; // Return true optimistically, actual status comes via callbacks
  }

  /**
   * Stop listening for speech via STTEngine
   */
  stop(): void {
    if (!this.isListening) {
      console.log('[SpeechInputBridge] Not listening');
      return;
    }

    console.log('[SpeechInputBridge] Stopping STTEngine...');
    this.shouldRestart = false;

    try {
      STTEngine.stopListening();
      this.isListening = false;
    } catch (error) {
      console.error('[SpeechInputBridge] Failed to stop:', error);
    }
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  // ============================================================
  // Result Handling
  // ============================================================

  /**
   * Handle speech recognition results
   */
  private handleResult(event: SpeechRecognitionEvent): void {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;

      if (result.isFinal) {
        // Final transcript
        console.log('[SpeechInputBridge] final:', transcript);
        this.callbacks.onFinal?.(transcript);
        
        // Route to TranscriptRouter
        handleFinal(transcript);
      } else {
        // Partial transcript
        console.log('[SpeechInputBridge] partial:', transcript);
        this.callbacks.onPartial?.(transcript);
        
        // Route to TranscriptRouter
        handlePartial(transcript);
      }
    }
  }

  // ============================================================
  // Cleanup
  // ============================================================

  dispose(): void {
    this.stop();
    this.callbacks = {};
    console.log('[SpeechInputBridge] Disposed');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let speechInputBridge: SpeechInputBridgeImpl | null = null;

/**
 * Get the SpeechInputBridge singleton instance
 */
export function getSpeechInputBridge(): SpeechInputBridgeImpl {
  if (!speechInputBridge) {
    speechInputBridge = new SpeechInputBridgeImpl();
  }
  return speechInputBridge;
}

/**
 * Create a new SpeechInputBridge instance
 */
export function createSpeechInputBridge(
  config?: Partial<SpeechInputBridgeConfig>
): SpeechInputBridgeImpl {
  return new SpeechInputBridgeImpl(config);
}

export default {
  getSpeechInputBridge,
  createSpeechInputBridge,
};
