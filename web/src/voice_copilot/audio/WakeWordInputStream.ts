/**
 * WakeWordInputStream.ts - Phase 8 STT Restoration
 * 
 * Streams transcripts from SpeechRecognizer and detects wake words.
 * Emits events for wake word detection and query extraction.
 * 
 * Features:
 * - Consumes partial/final transcripts from SpeechRecognizer
 * - Detects wake words using existing WakeAliasMap and normalization
 * - Extracts clean query after wake word
 * - Emits silence start/end events
 * 
 * Events:
 * - onPartialTranscript(text)
 * - onFinalTranscript(text)
 * - onWakeWordDetected(text)
 * - onSilenceStart()
 * - onSilenceEnd()
 * 
 * Logging prefix: [WakeWord]
 * 
 * This is an ADDITIVE module - does NOT modify existing logic.
 */

import { getSpeechRecognizer, type SpeechRecognizerCallbacks } from './SpeechRecognizer';
import { parse as parseQuery } from '../dialogue/CopilotQueryParser';

// ============================================================
// Types
// ============================================================

export interface WakeWordInputStreamConfig {
  enablePartialWakeDetection: boolean;
  silenceTimeoutMs: number;
}

export interface WakeWordInputStreamCallbacks {
  onPartialTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onWakeWordDetected?: (text: string) => void;
  onQueryExtracted?: (query: string) => void;
  onSilenceStart?: () => void;
  onSilenceEnd?: () => void;
  onError?: (error: Error) => void;
}

export type WakeWordInputStreamState = 'idle' | 'listening' | 'wake_detected' | 'error';

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: WakeWordInputStreamConfig = {
  enablePartialWakeDetection: true,
  silenceTimeoutMs: 2000,
};

// ============================================================
// WakeWordInputStream Implementation
// ============================================================

class WakeWordInputStreamImpl {
  private config: WakeWordInputStreamConfig;
  private callbacks: WakeWordInputStreamCallbacks = {};
  private state: WakeWordInputStreamState = 'idle';
  private lastWakeDetectionTime: number = 0;
  private wakeDetectionCooldownMs: number = 1000; // Prevent duplicate detections
  private isConnected: boolean = false;

  constructor(config: Partial<WakeWordInputStreamConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('[WakeWord] WakeWordInputStream initialized');
  }

  // ============================================================
  // Configuration
  // ============================================================

  configure(config: Partial<WakeWordInputStreamConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[WakeWord] Configuration updated');
  }

  setCallbacks(callbacks: WakeWordInputStreamCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
    console.log('[WakeWord] Callbacks configured');
  }

  // ============================================================
  // Connection to SpeechRecognizer
  // ============================================================

  /**
   * Connect to SpeechRecognizer and start receiving transcripts
   */
  connect(): void {
    if (this.isConnected) {
      console.log('[WakeWord] Already connected to SpeechRecognizer');
      return;
    }

    const recognizer = getSpeechRecognizer();
    
    const recognizerCallbacks: SpeechRecognizerCallbacks = {
      onPartialTranscript: (text: string) => {
        this.handlePartialTranscript(text);
      },
      onFinalTranscript: (text: string) => {
        this.handleFinalTranscript(text);
      },
      onSilenceStart: () => {
        this.handleSilenceStart();
      },
      onSilenceEnd: () => {
        this.handleSilenceEnd();
      },
      onError: (error: Error) => {
        this.handleError(error);
      },
      onStart: () => {
        this.state = 'listening';
        console.log('[WakeWord] Stream started');
      },
      onEnd: () => {
        this.state = 'idle';
        console.log('[WakeWord] Stream ended');
      },
    };

    recognizer.setCallbacks(recognizerCallbacks);
    this.isConnected = true;
    console.log('[WakeWord] Connected to SpeechRecognizer');
  }

  /**
   * Disconnect from SpeechRecognizer
   */
  disconnect(): void {
    this.isConnected = false;
    this.state = 'idle';
    console.log('[WakeWord] Disconnected from SpeechRecognizer');
  }

  // ============================================================
  // Transcript Handling
  // ============================================================

  private handlePartialTranscript(text: string): void {
    console.log(`[WakeWord] partial transcript: ${text}`);
    
    // Re-emit partial transcript
    this.callbacks.onPartialTranscript?.(text);

    // Check for wake word in partial transcript (early detection)
    if (this.config.enablePartialWakeDetection) {
      this.checkForWakeWord(text, false);
    }
  }

  private handleFinalTranscript(text: string): void {
    console.log(`[WakeWord] transcript: ${text}`);
    
    // Parse the transcript using CopilotQueryParser
    const parsed = parseQuery(text);
    
    // Check for wake word
    if (parsed.hasWakeWord) {
      this.handleWakeWordDetected(text, parsed.cleaned);
    }
    
    // Re-emit final transcript (with cleaned text if wake word was present)
    const transcriptToEmit = parsed.hasWakeWord ? parsed.cleaned : text;
    this.callbacks.onFinalTranscript?.(transcriptToEmit);
  }

  private handleSilenceStart(): void {
    console.log('[WakeWord] Silence started');
    this.callbacks.onSilenceStart?.();
  }

  private handleSilenceEnd(): void {
    console.log('[WakeWord] Silence ended');
    this.callbacks.onSilenceEnd?.();
  }

  private handleError(error: Error): void {
    console.error('[WakeWord] Error:', error);
    this.state = 'error';
    this.callbacks.onError?.(error);
  }

  // ============================================================
  // Wake Word Detection
  // ============================================================

  private checkForWakeWord(text: string, isFinal: boolean): void {
    // Use CopilotQueryParser to check for wake word
    const parsed = parseQuery(text);
    
    if (parsed.hasWakeWord) {
      // Check cooldown to prevent duplicate detections
      const now = Date.now();
      if (now - this.lastWakeDetectionTime < this.wakeDetectionCooldownMs) {
        console.log('[WakeWord] Wake word detected but in cooldown period');
        return;
      }
      
      this.lastWakeDetectionTime = now;
      
      if (isFinal) {
        this.handleWakeWordDetected(text, parsed.cleaned);
      } else {
        // For partial transcripts, just log but don't trigger full flow
        console.log('[WakeWord] Wake word detected in partial transcript');
      }
    }
  }

  private handleWakeWordDetected(fullText: string, cleanedQuery: string): void {
    console.log(`[WakeWord] Wake word detected! Full: "${fullText}", Query: "${cleanedQuery}"`);
    
    this.state = 'wake_detected';
    
    // Emit wake word detected event
    this.callbacks.onWakeWordDetected?.(fullText);
    
    // Emit extracted query if not empty
    if (cleanedQuery && cleanedQuery.trim().length > 0) {
      console.log(`[WakeWord] Query extracted: "${cleanedQuery}"`);
      this.callbacks.onQueryExtracted?.(cleanedQuery);
    }
    
    // Reset state after a short delay
    setTimeout(() => {
      if (this.state === 'wake_detected') {
        this.state = 'listening';
      }
    }, 500);
  }

  // ============================================================
  // Manual Transcript Injection
  // ============================================================

  /**
   * Manually inject a transcript (for testing or external STT sources)
   */
  injectTranscript(text: string, isFinal: boolean = true): void {
    console.log(`[WakeWord] Injected transcript: "${text}" (final: ${isFinal})`);
    
    if (isFinal) {
      this.handleFinalTranscript(text);
    } else {
      this.handlePartialTranscript(text);
    }
  }

  // ============================================================
  // State Getters
  // ============================================================

  getState(): WakeWordInputStreamState {
    return this.state;
  }

  isListening(): boolean {
    return this.state === 'listening' || this.state === 'wake_detected';
  }

  isConnectedToRecognizer(): boolean {
    return this.isConnected;
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let wakeWordInputStream: WakeWordInputStreamImpl | null = null;

/**
 * Get the WakeWordInputStream singleton instance
 */
export function getWakeWordInputStream(): WakeWordInputStreamImpl {
  if (!wakeWordInputStream) {
    wakeWordInputStream = new WakeWordInputStreamImpl();
  }
  return wakeWordInputStream;
}

/**
 * Create a new WakeWordInputStream instance
 */
export function createWakeWordInputStream(config?: Partial<WakeWordInputStreamConfig>): WakeWordInputStreamImpl {
  return new WakeWordInputStreamImpl(config);
}

export default {
  getWakeWordInputStream,
  createWakeWordInputStream,
};
