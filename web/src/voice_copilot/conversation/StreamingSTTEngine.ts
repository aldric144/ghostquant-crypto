/**
 * StreamingSTTEngine.ts - Streaming Speech-to-Text Engine
 * 
 * Replaces single-shot STT with streaming transcription:
 * - 100-200ms audio frames
 * - Emit partial transcripts in real time
 * - Detect intent early (before user finishes speaking)
 * - Trigger interrupt logic if user begins speaking mid-response
 */

import { getTurnTakingManager } from './TurnTakingManager';

// Web Speech API type declarations (browser API)
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
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

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export interface StreamingSTTConfig {
  frameSize: number; // Audio frame size in ms (100-200ms recommended)
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  silenceThreshold: number; // Audio level below which is considered silence
  silenceTimeout: number; // ms of silence before ending recognition
}

export interface PartialTranscript {
  text: string;
  isFinal: boolean;
  confidence: number;
  timestamp: number;
}

export interface StreamingSTTEvents {
  onPartialTranscript?: (transcript: PartialTranscript) => void;
  onFinalTranscript?: (transcript: PartialTranscript) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onError?: (error: Error) => void;
  onAudioLevel?: (level: number) => void;
}

const DEFAULT_CONFIG: StreamingSTTConfig = {
  frameSize: 150, // 150ms frames
  language: 'en-US',
  continuous: true,
  interimResults: true,
  maxAlternatives: 3,
  silenceThreshold: 0.01,
  silenceTimeout: 1500,
};

class StreamingSTTEngineImpl {
  private config: StreamingSTTConfig;
  private events: StreamingSTTEvents = {};
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private silenceTimer: NodeJS.Timeout | null = null;
  private lastAudioLevel: number = 0;
  private partialTranscripts: PartialTranscript[] = [];

  constructor(config: Partial<StreamingSTTConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('[StreamingSTT] Engine initialized with config:', this.config);
  }

  /**
   * Configure the streaming STT engine
   */
  configure(config: Partial<StreamingSTTConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[StreamingSTT] Configuration updated:', this.config);
  }

  /**
   * Set event handlers
   */
  setEvents(events: StreamingSTTEvents): void {
    this.events = { ...this.events, ...events };
  }

  /**
   * Check if browser supports Web Speech API
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  /**
   * Initialize the speech recognition engine
   */
  private initRecognition(): SpeechRecognition | null {
    if (typeof window === 'undefined') return null;

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || 
                                  (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      console.error('[StreamingSTT] Speech Recognition API not supported');
      return null;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = this.config.continuous;
    recognition.interimResults = this.config.interimResults;
    recognition.maxAlternatives = this.config.maxAlternatives;
    recognition.lang = this.config.language;

    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.handleRecognitionResult(event);
    };

    // Handle speech start
    recognition.onspeechstart = () => {
      console.log('[StreamingSTT] Speech detected');
      this.events.onSpeechStart?.();
      
      // Check if we should interrupt TTS
      const turnManager = getTurnTakingManager();
      if (turnManager.isSpeaking()) {
        console.log('[Conversation] Interrupt detected - stopping TTS');
        turnManager.interruptTTS();
      }
    };

    // Handle speech end
    recognition.onspeechend = () => {
      console.log('[StreamingSTT] Speech ended');
      this.events.onSpeechEnd?.();
    };

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[StreamingSTT] Recognition error:', event.error);
      this.events.onError?.(new Error(event.error));
      
      // Auto-restart on certain errors
      if (event.error === 'no-speech' || event.error === 'aborted') {
        if (this.isListening) {
          this.restartRecognition();
        }
      }
    };

    // Handle end
    recognition.onend = () => {
      console.log('[StreamingSTT] Recognition ended');
      
      // Auto-restart if still listening
      if (this.isListening) {
        this.restartRecognition();
      }
    };

    return recognition;
  }

  /**
   * Handle recognition results
   */
  private handleRecognitionResult(event: SpeechRecognitionEvent): void {
    const results = event.results;
    
    for (let i = event.resultIndex; i < results.length; i++) {
      const result = results[i];
      const transcript: PartialTranscript = {
        text: result[0].transcript,
        isFinal: result.isFinal,
        confidence: result[0].confidence || 0,
        timestamp: Date.now(),
      };

      if (result.isFinal) {
        console.log('[Conversation] Streaming STT final:', transcript.text);
        this.partialTranscripts.push(transcript);
        this.events.onFinalTranscript?.(transcript);
        
        // Reset silence timer on final result
        this.resetSilenceTimer();
      } else {
        console.log(`[Conversation] Streaming STT partial: "${transcript.text}"`);
        this.events.onPartialTranscript?.(transcript);
        
        // Check for early intent detection
        this.checkEarlyIntent(transcript.text);
      }
    }
  }

  /**
   * Check for early intent detection before user finishes speaking
   */
  private checkEarlyIntent(partialText: string): void {
    // Early intent patterns that can be detected mid-speech
    const earlyIntentPatterns = [
      { pattern: /^(hey|okay)\s+(ghost\s*quant|google)/i, intent: 'wake_word' },
      { pattern: /^stop/i, intent: 'stop' },
      { pattern: /^cancel/i, intent: 'cancel' },
      { pattern: /^wait/i, intent: 'pause' },
      { pattern: /^go\s+to/i, intent: 'navigation' },
      { pattern: /^show\s+me/i, intent: 'show' },
      { pattern: /^what\s+(is|are)/i, intent: 'question' },
    ];

    for (const { pattern, intent } of earlyIntentPatterns) {
      if (pattern.test(partialText)) {
        console.log(`[StreamingSTT] Early intent detected: ${intent}`);
        // Dispatch early intent event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ghostquant:early-intent', {
            detail: { intent, text: partialText }
          }));
        }
        break;
      }
    }
  }

  /**
   * Start audio level monitoring
   */
  private async startAudioMonitoring(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);
      
      this.analyser.fftSize = 256;
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkAudioLevel = () => {
        if (!this.isListening || !this.analyser) return;

        this.analyser.getByteFrequencyData(dataArray);
        
        // Calculate average audio level
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength / 255; // Normalize to 0-1
        
        this.lastAudioLevel = average;
        this.events.onAudioLevel?.(average);

        // Check for interrupt threshold
        const turnManager = getTurnTakingManager();
        if (turnManager.isSpeaking() && average > this.config.silenceThreshold * 5) {
          turnManager.checkInterruptThreshold(average);
        }

        // Check for silence
        if (average < this.config.silenceThreshold) {
          this.handleSilence();
        } else {
          this.resetSilenceTimer();
        }

        // Continue monitoring
        if (this.isListening) {
          requestAnimationFrame(checkAudioLevel);
        }
      };

      checkAudioLevel();
    } catch (error) {
      console.error('[StreamingSTT] Error starting audio monitoring:', error);
    }
  }

  /**
   * Handle silence detection
   */
  private handleSilence(): void {
    if (this.silenceTimer) return;

    this.silenceTimer = setTimeout(() => {
      console.log('[StreamingSTT] Silence timeout reached');
      this.events.onSpeechEnd?.();
      this.silenceTimer = null;
    }, this.config.silenceTimeout);
  }

  /**
   * Reset silence timer
   */
  private resetSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  /**
   * Stop audio monitoring
   */
  private stopAudioMonitoring(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.resetSilenceTimer();
  }

  /**
   * Restart recognition (for continuous listening)
   */
  private restartRecognition(): void {
    if (!this.isListening) return;

    setTimeout(() => {
      if (this.isListening && this.recognition) {
        try {
          this.recognition.start();
          console.log('[StreamingSTT] Recognition restarted');
        } catch (error) {
          // Recognition may already be running
        }
      }
    }, 100);
  }

  /**
   * Start streaming speech recognition
   */
  async start(): Promise<boolean> {
    if (this.isListening) {
      console.log('[StreamingSTT] Already listening');
      return true;
    }

    if (!this.isSupported()) {
      console.error('[StreamingSTT] Speech Recognition not supported');
      return false;
    }

    this.recognition = this.initRecognition();
    if (!this.recognition) {
      return false;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      this.partialTranscripts = [];
      
      // Start audio level monitoring
      await this.startAudioMonitoring();
      
      console.log('[StreamingSTT] Started streaming recognition');
      return true;
    } catch (error) {
      console.error('[StreamingSTT] Error starting recognition:', error);
      return false;
    }
  }

  /**
   * Stop streaming speech recognition
   */
  stop(): void {
    this.isListening = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        // Recognition may already be stopped
      }
      this.recognition = null;
    }

    this.stopAudioMonitoring();
    console.log('[StreamingSTT] Stopped streaming recognition');
  }

  /**
   * Pause recognition temporarily
   */
  pause(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        // Recognition may already be stopped
      }
    }
    console.log('[StreamingSTT] Recognition paused');
  }

  /**
   * Resume recognition after pause
   */
  resume(): void {
    if (this.isListening && this.recognition) {
      try {
        this.recognition.start();
      } catch (error) {
        // Recognition may already be running
      }
    }
    console.log('[StreamingSTT] Recognition resumed');
  }

  /**
   * Get all partial transcripts from current session
   */
  getPartialTranscripts(): PartialTranscript[] {
    return [...this.partialTranscripts];
  }

  /**
   * Get the combined final transcript
   */
  getFinalTranscript(): string {
    return this.partialTranscripts
      .filter(t => t.isFinal)
      .map(t => t.text)
      .join(' ');
  }

  /**
   * Get current audio level
   */
  getAudioLevel(): number {
    return this.lastAudioLevel;
  }

  /**
   * Check if currently listening
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Set language
   */
  setLanguage(language: string): void {
    this.config.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }
}

// Singleton instance
let streamingSTTEngine: StreamingSTTEngineImpl | null = null;

/**
 * Get the StreamingSTTEngine singleton instance
 */
export function getStreamingSTTEngine(): StreamingSTTEngineImpl {
  if (!streamingSTTEngine) {
    streamingSTTEngine = new StreamingSTTEngineImpl();
  }
  return streamingSTTEngine;
}

/**
 * Create a new StreamingSTTEngine with custom config
 */
export function createStreamingSTTEngine(config?: Partial<StreamingSTTConfig>): StreamingSTTEngineImpl {
  return new StreamingSTTEngineImpl(config);
}

export default {
  getStreamingSTTEngine,
  createStreamingSTTEngine,
};
