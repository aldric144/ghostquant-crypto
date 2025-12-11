/**
 * SpeechPipelineController.ts - Phase 8 STT Restoration
 * 
 * Master controller that binds STT to WakeLoopEngine and CopilotOrchestrator.
 * This is the missing link that connects:
 * - SpeechRecognizer (STT)
 * - WakeWordInputStream (wake word detection)
 * - WakeLoopEngine (continuous listening loop)
 * - CopilotOrchestrator (query processing)
 * 
 * Features:
 * - Initializes and manages SpeechRecognizer
 * - Connects WakeWordInputStream to transcript stream
 * - Provides handlers for WakeLoopEngine
 * - Routes transcripts to CopilotOrchestrator
 * 
 * Bindings:
 * - SpeechPipelineController.onFinalTranscript -> WakeLoopEngine.handleTranscript
 * - SpeechPipelineController.onFinalTranscript -> CopilotOrchestrator.handleUserSpeech
 * 
 * Logging prefix: [SpeechPipeline]
 * 
 * This is an ADDITIVE module - does NOT modify existing logic.
 */

import { getSpeechRecognizer } from './SpeechRecognizer';
import { getWakeWordInputStream } from './WakeWordInputStream';
import { getWakeLoopEngine } from './WakeLoopEngine';
import { getCopilotOrchestrator } from '../dialogue/CopilotOrchestrator';
import { parse as parseQuery } from '../dialogue/CopilotQueryParser';
import { getFallbackResponse } from '../dialogue/CopilotFallback';

// ============================================================
// Types
// ============================================================

export interface SpeechPipelineConfig {
  autoStart: boolean;
  enableWakeWordDetection: boolean;
  enableOrchestratorBinding: boolean;
  enableWakeLoopBinding: boolean;
  language: string;
}

export type TranscriptListener = (text: string) => void;
export type VoidListener = () => void;

export interface SpeechPipelineCallbacks {
  onPartialTranscript?: TranscriptListener;
  onFinalTranscript?: TranscriptListener;
  onWakeWordDetected?: TranscriptListener;
  onQueryExtracted?: TranscriptListener;
  onSilenceStart?: VoidListener;
  onSilenceEnd?: VoidListener;
  onError?: (error: Error) => void;
  onStateChange?: (state: SpeechPipelineState) => void;
}

export type SpeechPipelineState = 
  | 'idle'
  | 'initializing'
  | 'listening'
  | 'wake_detected'
  | 'capturing'
  | 'processing'
  | 'error';

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: SpeechPipelineConfig = {
  autoStart: false,
  enableWakeWordDetection: true,
  enableOrchestratorBinding: true,
  enableWakeLoopBinding: true,
  language: 'en-US',
};

// ============================================================
// SpeechPipelineController Implementation
// ============================================================

class SpeechPipelineControllerImpl {
  private config: SpeechPipelineConfig;
  private callbacks: SpeechPipelineCallbacks = {};
  private state: SpeechPipelineState = 'idle';
  private isInitialized: boolean = false;
  
  // Listener arrays for external subscribers
  private partialTranscriptListeners: TranscriptListener[] = [];
  private finalTranscriptListeners: TranscriptListener[] = [];
  private wakeWordListeners: TranscriptListener[] = [];
  private silenceStartListeners: VoidListener[] = [];
  private silenceEndListeners: VoidListener[] = [];

  // Wake word pending flag for WakeLoopEngine polling
  private wakePending: boolean = false;
  private lastTranscript: string = '';

  constructor(config: Partial<SpeechPipelineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('[SpeechPipeline] Controller initialized');
  }

  // ============================================================
  // Configuration
  // ============================================================

  configure(config: Partial<SpeechPipelineConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[SpeechPipeline] Configuration updated');
  }

  setCallbacks(callbacks: SpeechPipelineCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
    console.log('[SpeechPipeline] Callbacks configured');
  }

  // ============================================================
  // Listener Registration
  // ============================================================

  /**
   * Register a listener for partial transcripts
   */
  onPartialTranscript(listener: TranscriptListener): () => void {
    this.partialTranscriptListeners.push(listener);
    return () => {
      const index = this.partialTranscriptListeners.indexOf(listener);
      if (index > -1) {
        this.partialTranscriptListeners.splice(index, 1);
      }
    };
  }

  /**
   * Register a listener for final transcripts
   */
  onFinalTranscript(listener: TranscriptListener): () => void {
    this.finalTranscriptListeners.push(listener);
    return () => {
      const index = this.finalTranscriptListeners.indexOf(listener);
      if (index > -1) {
        this.finalTranscriptListeners.splice(index, 1);
      }
    };
  }

  /**
   * Register a listener for wake word detection
   */
  onWakeWordDetected(listener: TranscriptListener): () => void {
    this.wakeWordListeners.push(listener);
    return () => {
      const index = this.wakeWordListeners.indexOf(listener);
      if (index > -1) {
        this.wakeWordListeners.splice(index, 1);
      }
    };
  }

  /**
   * Register a listener for silence start
   */
  onSilenceStart(listener: VoidListener): () => void {
    this.silenceStartListeners.push(listener);
    return () => {
      const index = this.silenceStartListeners.indexOf(listener);
      if (index > -1) {
        this.silenceStartListeners.splice(index, 1);
      }
    };
  }

  /**
   * Register a listener for silence end
   */
  onSilenceEnd(listener: VoidListener): () => void {
    this.silenceEndListeners.push(listener);
    return () => {
      const index = this.silenceEndListeners.indexOf(listener);
      if (index > -1) {
        this.silenceEndListeners.splice(index, 1);
      }
    };
  }

  // ============================================================
  // Initialization
  // ============================================================

  /**
   * Initialize the speech pipeline
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[SpeechPipeline] Already initialized');
      return;
    }

    this.setState('initializing');
    console.log('[SpeechPipeline] Initializing...');

    try {
      // Check browser support
      const recognizer = getSpeechRecognizer();
      if (!recognizer.isSupported()) {
        console.warn('[SpeechPipeline] Speech recognition not supported in this browser');
        this.callbacks.onError?.(new Error('Speech recognition not supported in this browser'));
        // Continue anyway - graceful degradation
      }

      // Set up WakeWordInputStream
      const wakeWordStream = getWakeWordInputStream();
      wakeWordStream.setCallbacks({
        onPartialTranscript: (text) => this.handlePartialTranscript(text),
        onFinalTranscript: (text) => this.handleFinalTranscript(text),
        onWakeWordDetected: (text) => this.handleWakeWordDetected(text),
        onQueryExtracted: (query) => this.handleQueryExtracted(query),
        onSilenceStart: () => this.handleSilenceStart(),
        onSilenceEnd: () => this.handleSilenceEnd(),
        onError: (error) => this.handleError(error),
      });

      // Connect WakeWordInputStream to SpeechRecognizer
      wakeWordStream.connect();

      // Set up WakeLoopEngine bindings if enabled
      if (this.config.enableWakeLoopBinding) {
        this.setupWakeLoopBindings();
      }

      this.isInitialized = true;
      this.setState('idle');
      console.log('[SpeechPipeline] Initialization complete');

      // Auto-start if configured
      if (this.config.autoStart) {
        await this.start();
      }
    } catch (error) {
      console.error('[SpeechPipeline] Initialization failed:', error);
      this.setState('error');
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Set up bindings to WakeLoopEngine
   */
  private setupWakeLoopBindings(): void {
    const wakeLoopEngine = getWakeLoopEngine();

    // Set wake word detector that checks our pending flag
    wakeLoopEngine.setWakeWordDetector(async (): Promise<boolean> => {
      const pending = this.wakePending;
      if (pending) {
        this.wakePending = false;
        console.log('[SpeechPipeline] Wake word pending flag consumed');
      }
      return pending;
    });

    // Set mic capture handler that uses one-shot recognition
    wakeLoopEngine.setMicCaptureHandler(async (): Promise<string> => {
      console.log('[SpeechPipeline] Mic capture requested');
      this.setState('capturing');
      
      const recognizer = getSpeechRecognizer();
      
      // If already listening continuously, use the last transcript
      if (recognizer.isListening()) {
        // Wait a bit for the user to finish speaking
        await this.waitForSilence(3000);
        return this.lastTranscript;
      }
      
      // Otherwise, do one-shot recognition
      try {
        const transcript = await recognizer.startOnce();
        return transcript;
      } catch (error) {
        console.error('[SpeechPipeline] Mic capture error:', error);
        return '';
      }
    });

    // Set orchestrator handler
    wakeLoopEngine.setOrchestratorHandler(async (text: string): Promise<void> => {
      console.log('[SpeechPipeline] Orchestrator handler called with:', text);
      this.setState('processing');
      
      if (this.config.enableOrchestratorBinding) {
        await this.routeToOrchestrator(text);
      }
      
      this.setState('listening');
    });

    console.log('[SpeechPipeline] WakeLoopEngine bindings configured');
  }

  /**
   * Wait for silence (user stopped speaking)
   */
  private waitForSilence(timeoutMs: number): Promise<void> {
    return new Promise((resolve) => {
      const recognizer = getSpeechRecognizer();
      
      // If not speaking, resolve immediately
      if (!recognizer.isSpeechActive()) {
        resolve();
        return;
      }

      // Wait for silence or timeout
      const timeout = setTimeout(() => {
        resolve();
      }, timeoutMs);

      const unsubscribe = this.onSilenceStart(() => {
        clearTimeout(timeout);
        unsubscribe();
        // Small delay after silence starts
        setTimeout(resolve, 500);
      });
    });
  }

  /**
   * Route transcript to CopilotOrchestrator
   */
  private async routeToOrchestrator(text: string): Promise<void> {
    const orchestrator = getCopilotOrchestrator();
    
    // Parse the query
    const parsed = parseQuery(text);
    
    // Check if empty after wake word stripping
    if (parsed.isEmpty) {
      console.log('[SpeechPipeline] Empty query after parsing, using fallback');
      const fallback = getFallbackResponse(parsed.hasWakeWord, parsed.isEmpty);
      // The orchestrator should handle speaking the fallback
      orchestrator.speakResponseText(fallback.text);
      return;
    }
    
    // Process the cleaned query
    const result = orchestrator.processVoiceInput(text);
    
    // Check if it's a fallback response
    if (orchestrator.isFallbackResponse(result)) {
      orchestrator.speakResponseText(result.text);
    } else {
      // It's a ProcessedQuery - generate and speak response
      const response = orchestrator.processResponse(
        'I understand your question. Let me help you with that.',
        result
      );
      orchestrator.speakResponseText(response.finalResponse);
    }
  }

  // ============================================================
  // Event Handlers
  // ============================================================

  private handlePartialTranscript(text: string): void {
    console.log(`[SpeechPipeline] partial: ${text}`);
    
    // Notify all listeners
    this.partialTranscriptListeners.forEach(listener => listener(text));
    this.callbacks.onPartialTranscript?.(text);
  }

  private handleFinalTranscript(text: string): void {
    console.log(`[SpeechPipeline] final: ${text}`);
    
    this.lastTranscript = text;
    
    // Notify all listeners
    this.finalTranscriptListeners.forEach(listener => listener(text));
    this.callbacks.onFinalTranscript?.(text);
  }

  private handleWakeWordDetected(text: string): void {
    console.log(`[SpeechPipeline] wake word detected: ${text}`);
    
    this.setState('wake_detected');
    this.wakePending = true;
    
    // Notify all listeners
    this.wakeWordListeners.forEach(listener => listener(text));
    this.callbacks.onWakeWordDetected?.(text);
  }

  private handleQueryExtracted(query: string): void {
    console.log(`[SpeechPipeline] query extracted: ${query}`);
    this.callbacks.onQueryExtracted?.(query);
  }

  private handleSilenceStart(): void {
    console.log('[SpeechPipeline] silence start');
    
    this.silenceStartListeners.forEach(listener => listener());
    this.callbacks.onSilenceStart?.();
  }

  private handleSilenceEnd(): void {
    console.log('[SpeechPipeline] silence end');
    
    this.silenceEndListeners.forEach(listener => listener());
    this.callbacks.onSilenceEnd?.();
  }

  private handleError(error: Error): void {
    console.error('[SpeechPipeline] Error:', error);
    this.setState('error');
    this.callbacks.onError?.(error);
  }

  // ============================================================
  // State Management
  // ============================================================

  private setState(newState: SpeechPipelineState): void {
    if (this.state !== newState) {
      console.log(`[SpeechPipeline] State: ${this.state} -> ${newState}`);
      this.state = newState;
      this.callbacks.onStateChange?.(newState);
    }
  }

  getState(): SpeechPipelineState {
    return this.state;
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  /**
   * Start the speech pipeline (continuous listening)
   */
  async start(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log('[SpeechPipeline] Starting continuous listening');
    
    const recognizer = getSpeechRecognizer();
    recognizer.setLanguage(this.config.language);
    
    const success = recognizer.startContinuous();
    
    if (success) {
      this.setState('listening');
      console.log('[SpeechPipeline] Continuous listening started');
    } else {
      console.error('[SpeechPipeline] Failed to start continuous listening');
    }
    
    return success;
  }

  /**
   * Stop the speech pipeline
   */
  stop(): void {
    console.log('[SpeechPipeline] Stopping');
    
    const recognizer = getSpeechRecognizer();
    recognizer.stop();
    
    this.setState('idle');
    this.wakePending = false;
    this.lastTranscript = '';
  }

  /**
   * Check if the pipeline is active
   */
  isActive(): boolean {
    return this.state === 'listening' || 
           this.state === 'wake_detected' || 
           this.state === 'capturing' ||
           this.state === 'processing';
  }

  /**
   * Check if speech recognition is supported
   */
  isSupported(): boolean {
    const recognizer = getSpeechRecognizer();
    return recognizer.isSupported();
  }

  /**
   * Manually inject a transcript (for testing)
   */
  injectTranscript(text: string): void {
    console.log(`[SpeechPipeline] Injecting transcript: ${text}`);
    const wakeWordStream = getWakeWordInputStream();
    wakeWordStream.injectTranscript(text, true);
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let speechPipelineController: SpeechPipelineControllerImpl | null = null;

/**
 * Get the SpeechPipelineController singleton instance
 */
export function getSpeechPipelineController(): SpeechPipelineControllerImpl {
  if (!speechPipelineController) {
    speechPipelineController = new SpeechPipelineControllerImpl();
  }
  return speechPipelineController;
}

/**
 * Create a new SpeechPipelineController instance
 */
export function createSpeechPipelineController(config?: Partial<SpeechPipelineConfig>): SpeechPipelineControllerImpl {
  return new SpeechPipelineControllerImpl(config);
}

export default {
  getSpeechPipelineController,
  createSpeechPipelineController,
};
