/**
 * SpeechInputBridge.ts
 * 
 * STT Restoration Patch - Bridge between Web Speech API and GhostQuant voice pipeline
 * 
 * Responsibilities:
 * - Subscribe to Web Speech API (or existing STT engine)
 * - Provide partial and final transcript callbacks
 * - Dispatch transcripts to:
 *   - WakeLoopEngine
 *   - WakeWordNormalizationPipeline
 *   - CopilotOrchestrator.processTranscript()
 * 
 * Logging prefix: [SpeechInputBridge]
 * 
 * This is an ADDITIVE module - does NOT modify existing logic.
 */

import { handlePartial, handleFinal } from './TranscriptRouter';

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
   * Check if Web Speech API is supported
   */
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    
    const SpeechRecognition = (window as any).SpeechRecognition || 
                              (window as any).webkitSpeechRecognition;
    return !!SpeechRecognition;
  }

  /**
   * Start listening for speech
   * @returns true if started successfully, false otherwise
   */
  start(): boolean {
    console.log('[STT Debug A] SpeechInputBridge.start() called');
    
    if (this.isListening) {
      console.log('[SpeechInputBridge] Already listening');
      return true; // Already running is considered success
    }

    const supported = this.isSupported();
    console.log('[STT Debug B] isSupported =', supported);
    
    if (!supported) {
      console.error('[SpeechInputBridge] Web Speech API not supported');
      this.callbacks.onError?.(new Error('Web Speech API not supported'));
      return false;
    }

    console.log('[SpeechInputBridge] Starting speech recognition');

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || 
                                (window as any).webkitSpeechRecognition;
      
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = this.config.continuous;
      this.recognition.interimResults = this.config.interimResults;
      this.recognition.lang = this.config.lang;
      this.recognition.maxAlternatives = this.config.maxAlternatives;

      // Set up event handlers
      this.recognition.onstart = () => {
        console.log('[STT Debug C] recognition.onstart fired');
        console.log('[SpeechInputBridge] Recognition started');
        this.isListening = true;
        this.callbacks.onStart?.();
      };

      this.recognition.onend = () => {
        console.log('[STT Debug D] recognition.onend fired');
        console.log('[SpeechInputBridge] Recognition ended');
        this.isListening = false;
        this.callbacks.onEnd?.();

        // Auto-restart if continuous mode and should restart
        if (this.shouldRestart && this.config.continuous) {
          console.log('[SpeechInputBridge] Auto-restarting...');
          setTimeout(() => {
            if (this.shouldRestart) {
              console.log('[STT Debug E] Auto-restart triggered');
              this.recognition?.start();
            }
          }, 100);
        }
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        console.log('[STT Debug F] recognition.onresult fired, resultIndex:', event.resultIndex);
        this.handleResult(event);
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('[STT Debug G] recognition.onerror fired:', event.error);
        console.error('[SpeechInputBridge] Error:', event.error);
        
        // Don't treat 'no-speech' or 'aborted' as fatal errors
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          this.callbacks.onError?.(new Error(event.error));
        }
      };

      this.shouldRestart = true;
      this.recognition.start();
      console.log('[STT Debug H] recognition.start() called successfully');
      return true;

    } catch (error) {
      console.error('[STT Debug I] Failed to start:', error);
      console.error('[SpeechInputBridge] Failed to start:', error);
      this.callbacks.onError?.(error as Error);
      return false;
    }
  }

  /**
   * Stop listening for speech
   */
  stop(): void {
    if (!this.isListening && !this.recognition) {
      console.log('[SpeechInputBridge] Not listening');
      return;
    }

    console.log('[SpeechInputBridge] Stopping speech recognition');
    this.shouldRestart = false;

    try {
      if (this.recognition) {
        this.recognition.stop();
        this.recognition = null;
      }
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
