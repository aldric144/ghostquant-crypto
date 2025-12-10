/**
 * TurnTakingManager.ts - Interruptible turn-taking engine
 * 
 * Provides ChatGPT-style voice mode with:
 * - interruptTTS() - Stop TTS when user starts speaking
 * - cancelPlayback() - Cancel current audio playback
 * - midSentenceStop() - Stop mid-sentence on interrupt
 * - resumeListening() - Resume listening after interrupt
 * 
 * Behavior:
 * - If user begins speaking while GhostQuant is talking,
 *   immediately stop TTS playback and switch to LISTENING mode
 * - If silence is detected, resume normal turn-taking
 */

export type TurnState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

export interface TurnTakingConfig {
  interruptEnabled: boolean;
  interruptThreshold: number; // Audio level threshold to trigger interrupt
  silenceTimeout: number; // ms to wait before considering silence
  autoResumeListening: boolean;
}

export interface TurnTakingEvents {
  onStateChange?: (state: TurnState, previousState: TurnState) => void;
  onInterrupt?: () => void;
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  onListeningStart?: () => void;
  onListeningEnd?: () => void;
}

const DEFAULT_CONFIG: TurnTakingConfig = {
  interruptEnabled: true,
  interruptThreshold: 0.1,
  silenceTimeout: 1500,
  autoResumeListening: true,
};

class TurnTakingManagerImpl {
  private state: TurnState = 'IDLE';
  private config: TurnTakingConfig;
  private events: TurnTakingEvents = {};
  private currentAudioContext: AudioContext | null = null;
  private currentAudioSource: AudioBufferSourceNode | null = null;
  private isInterrupted: boolean = false;
  private interruptCallbacks: Array<() => void> = [];

  constructor(config: Partial<TurnTakingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('[TurnTaking] Manager initialized with config:', this.config);
  }

  /**
   * Configure the turn-taking manager
   */
  configure(config: Partial<TurnTakingConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[TurnTaking] Configuration updated:', this.config);
  }

  /**
   * Set event handlers
   */
  setEvents(events: TurnTakingEvents): void {
    this.events = { ...this.events, ...events };
  }

  /**
   * Get current turn state
   */
  getState(): TurnState {
    return this.state;
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.state === 'SPEAKING';
  }

  /**
   * Check if currently listening
   */
  isListening(): boolean {
    return this.state === 'LISTENING';
  }

  /**
   * Check if interrupted
   */
  wasInterrupted(): boolean {
    return this.isInterrupted;
  }

  /**
   * Transition to a new state
   */
  private setState(newState: TurnState): void {
    const previousState = this.state;
    if (previousState === newState) return;

    this.state = newState;
    console.log(`[TurnTaking] Switching to ${newState} mode (was: ${previousState})`);

    // Fire state change event
    this.events.onStateChange?.(newState, previousState);

    // Fire specific events
    switch (newState) {
      case 'SPEAKING':
        this.events.onSpeakingStart?.();
        break;
      case 'LISTENING':
        this.events.onListeningStart?.();
        break;
    }

    // Fire end events for previous state
    switch (previousState) {
      case 'SPEAKING':
        this.events.onSpeakingEnd?.();
        break;
      case 'LISTENING':
        this.events.onListeningEnd?.();
        break;
    }
  }

  /**
   * Start speaking mode
   */
  startSpeaking(): void {
    this.isInterrupted = false;
    this.setState('SPEAKING');
  }

  /**
   * End speaking mode
   */
  endSpeaking(): void {
    if (this.state === 'SPEAKING') {
      if (this.config.autoResumeListening) {
        this.setState('LISTENING');
      } else {
        this.setState('IDLE');
      }
    }
  }

  /**
   * Start listening mode
   */
  startListening(): void {
    this.isInterrupted = false;
    this.setState('LISTENING');
  }

  /**
   * End listening mode
   */
  endListening(): void {
    if (this.state === 'LISTENING') {
      this.setState('PROCESSING');
    }
  }

  /**
   * Start processing mode
   */
  startProcessing(): void {
    this.setState('PROCESSING');
  }

  /**
   * Go to idle state
   */
  goIdle(): void {
    this.setState('IDLE');
  }

  /**
   * Interrupt TTS playback when user starts speaking
   * This is the core interrupt function for ChatGPT-style voice mode
   */
  interruptTTS(): boolean {
    if (!this.config.interruptEnabled) {
      console.log('[TurnTaking] Interrupt disabled in config');
      return false;
    }

    if (this.state !== 'SPEAKING') {
      console.log('[TurnTaking] Cannot interrupt - not currently speaking');
      return false;
    }

    console.log('[Conversation] Interrupt detected - stopping TTS');
    this.isInterrupted = true;

    // Cancel any current playback
    this.cancelPlayback();

    // Fire interrupt event
    this.events.onInterrupt?.();

    // Execute registered interrupt callbacks
    this.interruptCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[TurnTaking] Error in interrupt callback:', error);
      }
    });

    // Switch to listening mode
    this.setState('LISTENING');

    return true;
  }

  /**
   * Cancel current audio playback
   */
  cancelPlayback(): void {
    console.log('[TurnTaking] Canceling playback');

    // Stop Web Audio API source if active
    if (this.currentAudioSource) {
      try {
        this.currentAudioSource.stop();
        this.currentAudioSource.disconnect();
      } catch (error) {
        // Source may already be stopped
      }
      this.currentAudioSource = null;
    }

    // Stop all audio elements on the page
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });

    // Dispatch custom event for TTS engines to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ghostquant:tts:cancel'));
    }
  }

  /**
   * Stop TTS mid-sentence
   */
  midSentenceStop(): void {
    console.log('[TurnTaking] Mid-sentence stop triggered');
    this.cancelPlayback();
    this.isInterrupted = true;
  }

  /**
   * Resume listening after interrupt or TTS completion
   */
  resumeListening(): void {
    console.log('[TurnTaking] Resuming listening');
    this.isInterrupted = false;
    this.setState('LISTENING');

    // Dispatch custom event for STT engines to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ghostquant:stt:resume'));
    }
  }

  /**
   * Register an audio context for interrupt management
   */
  registerAudioContext(context: AudioContext): void {
    this.currentAudioContext = context;
  }

  /**
   * Register an audio source for interrupt management
   */
  registerAudioSource(source: AudioBufferSourceNode): void {
    this.currentAudioSource = source;
  }

  /**
   * Register a callback to be called on interrupt
   */
  onInterrupt(callback: () => void): () => void {
    this.interruptCallbacks.push(callback);
    // Return unsubscribe function
    return () => {
      const index = this.interruptCallbacks.indexOf(callback);
      if (index > -1) {
        this.interruptCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Check if audio level exceeds interrupt threshold
   */
  checkInterruptThreshold(audioLevel: number): boolean {
    if (!this.config.interruptEnabled) return false;
    if (this.state !== 'SPEAKING') return false;

    if (audioLevel > this.config.interruptThreshold) {
      console.log(`[TurnTaking] Audio level ${audioLevel} exceeds threshold ${this.config.interruptThreshold}`);
      return this.interruptTTS();
    }

    return false;
  }

  /**
   * Reset the manager state
   */
  reset(): void {
    console.log('[TurnTaking] Resetting manager');
    this.cancelPlayback();
    this.isInterrupted = false;
    this.setState('IDLE');
  }
}

// Singleton instance
let turnTakingManager: TurnTakingManagerImpl | null = null;

/**
 * Get the TurnTakingManager singleton instance
 */
export function getTurnTakingManager(): TurnTakingManagerImpl {
  if (!turnTakingManager) {
    turnTakingManager = new TurnTakingManagerImpl();
  }
  return turnTakingManager;
}

/**
 * Create a new TurnTakingManager with custom config
 */
export function createTurnTakingManager(config?: Partial<TurnTakingConfig>): TurnTakingManagerImpl {
  return new TurnTakingManagerImpl(config);
}

// Export convenience functions
export const interruptTTS = () => getTurnTakingManager().interruptTTS();
export const cancelPlayback = () => getTurnTakingManager().cancelPlayback();
export const midSentenceStop = () => getTurnTakingManager().midSentenceStop();
export const resumeListening = () => getTurnTakingManager().resumeListening();

export default {
  getTurnTakingManager,
  createTurnTakingManager,
  interruptTTS,
  cancelPlayback,
  midSentenceStop,
  resumeListening,
};
