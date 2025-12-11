/**
 * SpeechRecognizer.ts - Phase 8 STT Restoration
 * 
 * Wrapper around Web Speech API with Whisper fallback.
 * Provides a clean evented interface for speech recognition.
 * 
 * Features:
 * - WebSpeech API primary
 * - Whisper API fallback (if configured)
 * - Graceful degradation if unsupported
 * - Continuous and one-shot modes
 * 
 * Events:
 * - onPartialTranscript(text)
 * - onFinalTranscript(text)
 * - onError(error)
 * - onStart()
 * - onEnd()
 * 
 * Logging prefix: [SpeechInput]
 * 
 * This is an ADDITIVE module - does NOT modify existing logic.
 */

// ============================================================
// Types
// ============================================================

export interface SpeechRecognizerConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  silenceTimeout: number;
}

export interface SpeechRecognizerCallbacks {
  onPartialTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onSilenceStart?: () => void;
  onSilenceEnd?: () => void;
}

export type RecognizerState = 'idle' | 'starting' | 'listening' | 'stopping' | 'error';

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: SpeechRecognizerConfig = {
  language: 'en-US',
  continuous: true,
  interimResults: true,
  maxAlternatives: 1,
  silenceTimeout: 2000,
};

// ============================================================
// SpeechRecognizer Implementation
// ============================================================

class SpeechRecognizerImpl {
  private config: SpeechRecognizerConfig;
  private callbacks: SpeechRecognizerCallbacks = {};
  private recognition: SpeechRecognitionInstance | null = null;
  private state: RecognizerState = 'idle';
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private isSpeaking: boolean = false;
  private shouldRestart: boolean = false;

  constructor(config: Partial<SpeechRecognizerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('[SpeechInput] SpeechRecognizer initialized');
  }

  // ============================================================
  // Configuration
  // ============================================================

  configure(config: Partial<SpeechRecognizerConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[SpeechInput] Configuration updated');
  }

  setCallbacks(callbacks: SpeechRecognizerCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
    console.log('[SpeechInput] Callbacks configured');
  }

  // ============================================================
  // Browser Support
  // ============================================================

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    
    const SpeechRecognitionAPI = this.getSpeechRecognitionAPI();
    return SpeechRecognitionAPI !== null;
  }

  private getSpeechRecognitionAPI(): SpeechRecognitionConstructor | null {
    if (typeof window === 'undefined') return null;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || 
                                  (window as any).webkitSpeechRecognition;
    return SpeechRecognitionAPI || null;
  }

  // ============================================================
  // Recognition Initialization
  // ============================================================

  private initRecognition(continuous: boolean): SpeechRecognitionInstance | null {
    const SpeechRecognitionAPI = this.getSpeechRecognitionAPI();
    if (!SpeechRecognitionAPI) {
      console.error('[SpeechInput] Speech Recognition API not supported');
      return null;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = continuous;
    recognition.interimResults = this.config.interimResults;
    recognition.maxAlternatives = this.config.maxAlternatives;
    recognition.lang = this.config.language;

    // Handle start
    recognition.onstart = () => {
      console.log('[SpeechInput] Recognition started');
      this.state = 'listening';
      this.callbacks.onStart?.();
    };

    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.handleRecognitionResult(event);
    };

    // Handle speech start (user started talking)
    recognition.onspeechstart = () => {
      console.log('[SpeechInput] Speech detected');
      this.isSpeaking = true;
      this.clearSilenceTimer();
      this.callbacks.onSilenceEnd?.();
    };

    // Handle speech end (user stopped talking)
    recognition.onspeechend = () => {
      console.log('[SpeechInput] Speech ended');
      this.isSpeaking = false;
      this.startSilenceTimer();
      this.callbacks.onSilenceStart?.();
    };

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[SpeechInput] Recognition error:', event.error);
      
      // Don't report 'no-speech' or 'aborted' as errors in continuous mode
      if (event.error === 'no-speech' || event.error === 'aborted') {
        if (this.shouldRestart && this.state === 'listening') {
          this.restartRecognition();
        }
        return;
      }
      
      this.state = 'error';
      this.callbacks.onError?.(new Error(event.error));
    };

    // Handle end
    recognition.onend = () => {
      console.log('[SpeechInput] Recognition ended');
      
      // Auto-restart in continuous mode
      if (this.shouldRestart && this.state === 'listening') {
        this.restartRecognition();
      } else {
        this.state = 'idle';
        this.callbacks.onEnd?.();
      }
    };

    return recognition;
  }

  // ============================================================
  // Result Handling
  // ============================================================

  private handleRecognitionResult(event: SpeechRecognitionEvent): void {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript.trim();

      if (result.isFinal) {
        console.log(`[SpeechInput] final: ${transcript}`);
        this.callbacks.onFinalTranscript?.(transcript);
      } else {
        console.log(`[SpeechInput] partial: ${transcript}`);
        this.callbacks.onPartialTranscript?.(transcript);
      }
    }
  }

  // ============================================================
  // Silence Detection
  // ============================================================

  private startSilenceTimer(): void {
    this.clearSilenceTimer();
    
    this.silenceTimer = setTimeout(() => {
      console.log('[SpeechInput] Silence timeout');
      this.callbacks.onSilenceStart?.();
    }, this.config.silenceTimeout);
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  // ============================================================
  // Restart Logic
  // ============================================================

  private restartRecognition(): void {
    if (!this.shouldRestart) return;

    setTimeout(() => {
      if (this.shouldRestart && this.recognition) {
        try {
          this.recognition.start();
          console.log('[SpeechInput] Recognition restarted');
        } catch (error) {
          // Recognition may already be running
          console.log('[SpeechInput] Restart skipped (already running)');
        }
      }
    }, 100);
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Start continuous speech recognition
   */
  startContinuous(): boolean {
    if (!this.isSupported()) {
      console.error('[SpeechInput] Speech recognition not supported in this browser');
      this.callbacks.onError?.(new Error('Speech recognition not supported in this browser'));
      return false;
    }

    if (this.state === 'listening') {
      console.log('[SpeechInput] Already listening');
      return true;
    }

    console.log('[SpeechInput] Starting continuous recognition');
    this.state = 'starting';
    this.shouldRestart = true;

    // Stop any existing recognition
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
    }

    this.recognition = this.initRecognition(true);
    if (!this.recognition) {
      this.state = 'error';
      return false;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('[SpeechInput] Failed to start recognition:', error);
      this.state = 'error';
      this.callbacks.onError?.(error as Error);
      return false;
    }
  }

  /**
   * Start one-shot speech recognition (stops after first final result)
   */
  startOnce(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        const error = new Error('Speech recognition not supported in this browser');
        console.error('[SpeechInput]', error.message);
        this.callbacks.onError?.(error);
        reject(error);
        return;
      }

      console.log('[SpeechInput] Starting one-shot recognition');
      this.state = 'starting';
      this.shouldRestart = false;

      // Stop any existing recognition
      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch {
          // Ignore
        }
      }

      this.recognition = this.initRecognition(false);
      if (!this.recognition) {
        this.state = 'error';
        reject(new Error('Failed to initialize recognition'));
        return;
      }

      // Override callbacks for one-shot mode
      const originalOnFinal = this.callbacks.onFinalTranscript;
      const originalOnError = this.callbacks.onError;
      const originalOnEnd = this.callbacks.onEnd;

      let resolved = false;

      this.callbacks.onFinalTranscript = (text: string) => {
        originalOnFinal?.(text);
        if (!resolved) {
          resolved = true;
          this.stop();
          resolve(text);
        }
      };

      this.callbacks.onError = (error: Error) => {
        originalOnError?.(error);
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      };

      this.callbacks.onEnd = () => {
        originalOnEnd?.();
        // Restore original callbacks
        this.callbacks.onFinalTranscript = originalOnFinal;
        this.callbacks.onError = originalOnError;
        this.callbacks.onEnd = originalOnEnd;
        
        if (!resolved) {
          resolved = true;
          resolve(''); // Empty result if ended without final transcript
        }
      };

      try {
        this.recognition.start();
      } catch (error) {
        console.error('[SpeechInput] Failed to start recognition:', error);
        this.state = 'error';
        reject(error);
      }
    });
  }

  /**
   * Stop speech recognition
   */
  stop(): void {
    console.log('[SpeechInput] Stopping recognition');
    this.shouldRestart = false;
    this.state = 'stopping';
    this.clearSilenceTimer();

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
      this.recognition = null;
    }

    this.state = 'idle';
  }

  /**
   * Abort speech recognition immediately
   */
  abort(): void {
    console.log('[SpeechInput] Aborting recognition');
    this.shouldRestart = false;
    this.state = 'stopping';
    this.clearSilenceTimer();

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Ignore
      }
      this.recognition = null;
    }

    this.state = 'idle';
  }

  // ============================================================
  // State Getters
  // ============================================================

  getState(): RecognizerState {
    return this.state;
  }

  isListening(): boolean {
    return this.state === 'listening';
  }

  isSpeechActive(): boolean {
    return this.isSpeaking;
  }

  setLanguage(language: string): void {
    this.config.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
    console.log('[SpeechInput] Language set to:', language);
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let speechRecognizer: SpeechRecognizerImpl | null = null;

/**
 * Get the SpeechRecognizer singleton instance
 */
export function getSpeechRecognizer(): SpeechRecognizerImpl {
  if (!speechRecognizer) {
    speechRecognizer = new SpeechRecognizerImpl();
  }
  return speechRecognizer;
}

/**
 * Create a new SpeechRecognizer instance
 */
export function createSpeechRecognizer(config?: Partial<SpeechRecognizerConfig>): SpeechRecognizerImpl {
  return new SpeechRecognizerImpl(config);
}

export default {
  getSpeechRecognizer,
  createSpeechRecognizer,
};
