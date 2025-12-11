/**
 * CopilotInterruptionEngine - Mid-Sentence Interruption Handling
 * 
 * Phase 2 Conversational Engine
 * 
 * Purpose:
 * Enable mid-sentence interruption. If the user talks while TTS is speaking,
 * stop playback and immediately respond to the new query.
 * 
 * Requirements:
 * - Monitor MicEngine and TTS playback state
 * - If speech is detected while TTS is active:
 *   → stop current TTS
 *   → cancel queued responses
 *   → hand control to IntentModel for new prompt
 * - Provide console logs: [INTERRUPT] Detected user interruption → switching to new query.
 * 
 * This is an ADDITIVE module - does NOT modify existing Copilot logic.
 */

export type InterruptionState = 'idle' | 'speaking' | 'listening' | 'interrupted';

export interface InterruptionEvent {
  type: 'speech_start' | 'speech_end' | 'user_speech_detected' | 'interruption_triggered';
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface InterruptionConfig {
  enabled: boolean;
  minSpeechDurationMs: number;
  interruptionDelayMs: number;
  enableLogging: boolean;
}

const DEFAULT_CONFIG: InterruptionConfig = {
  enabled: true,
  minSpeechDurationMs: 200, // Minimum speech duration to trigger interruption
  interruptionDelayMs: 100, // Delay before triggering interruption
  enableLogging: true,
};

type InterruptionCallback = (event: InterruptionEvent) => void;
type StopTTSCallback = () => void;
type CancelQueueCallback = () => void;

class CopilotInterruptionEngineImpl {
  private config: InterruptionConfig;
  private state: InterruptionState = 'idle';
  private isTTSActive: boolean = false;
  private isMicActive: boolean = false;
  private speechStartTime: number | null = null;
  private interruptionCallbacks: Set<InterruptionCallback> = new Set();
  private stopTTSCallback: StopTTSCallback | null = null;
  private cancelQueueCallback: CancelQueueCallback | null = null;
  private pendingInterruption: NodeJS.Timeout | null = null;

  constructor(config: Partial<InterruptionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.log('InterruptionEngine initialized');
  }

  /**
   * Log message with [INTERRUPT] prefix
   */
  private log(message: string, data?: unknown): void {
    if (this.config.enableLogging) {
      if (data) {
        console.log(`[CopilotPhase2][INTERRUPT] ${message}`, data);
      } else {
        console.log(`[CopilotPhase2][INTERRUPT] ${message}`);
      }
    }
  }

  /**
   * Register callback for TTS stop
   */
  registerStopTTSCallback(callback: StopTTSCallback): void {
    this.stopTTSCallback = callback;
    this.log('Registered TTS stop callback');
  }

  /**
   * Register callback for queue cancellation
   */
  registerCancelQueueCallback(callback: CancelQueueCallback): void {
    this.cancelQueueCallback = callback;
    this.log('Registered queue cancel callback');
  }

  /**
   * Register callback for interruption events
   */
  onInterruption(callback: InterruptionCallback): () => void {
    this.interruptionCallbacks.add(callback);
    return () => {
      this.interruptionCallbacks.delete(callback);
    };
  }

  /**
   * Notify that TTS has started speaking
   */
  notifyTTSStart(): void {
    this.isTTSActive = true;
    this.state = 'speaking';
    this.emitEvent({
      type: 'speech_start',
      timestamp: Date.now(),
    });
    this.log('TTS started speaking');
  }

  /**
   * Notify that TTS has stopped speaking
   */
  notifyTTSEnd(): void {
    this.isTTSActive = false;
    if (this.state === 'speaking') {
      this.state = 'idle';
    }
    this.emitEvent({
      type: 'speech_end',
      timestamp: Date.now(),
    });
    this.log('TTS stopped speaking');
  }

  /**
   * Notify that user speech has been detected
   */
  notifyUserSpeechDetected(): void {
    this.isMicActive = true;
    this.speechStartTime = Date.now();

    this.emitEvent({
      type: 'user_speech_detected',
      timestamp: Date.now(),
    });

    // Check if we should trigger interruption
    if (this.config.enabled && this.isTTSActive) {
      this.scheduleInterruption();
    }
  }

  /**
   * Notify that user speech has ended
   */
  notifyUserSpeechEnded(): void {
    this.isMicActive = false;
    this.speechStartTime = null;
    this.cancelPendingInterruption();
  }

  /**
   * Schedule an interruption with delay
   */
  private scheduleInterruption(): void {
    // Cancel any pending interruption
    this.cancelPendingInterruption();

    this.pendingInterruption = setTimeout(() => {
      // Verify conditions are still met
      if (this.isTTSActive && this.isMicActive && this.speechStartTime) {
        const speechDuration = Date.now() - this.speechStartTime;
        
        if (speechDuration >= this.config.minSpeechDurationMs) {
          this.triggerInterruption();
        }
      }
    }, this.config.interruptionDelayMs);
  }

  /**
   * Cancel pending interruption
   */
  private cancelPendingInterruption(): void {
    if (this.pendingInterruption) {
      clearTimeout(this.pendingInterruption);
      this.pendingInterruption = null;
    }
  }

  /**
   * Trigger the interruption
   */
  private triggerInterruption(): void {
    this.log('Detected user interruption → switching to new query');
    
    this.state = 'interrupted';

    // Stop TTS playback
    if (this.stopTTSCallback) {
      this.stopTTSCallback();
      this.log('Stopped TTS playback');
    }

    // Cancel queued responses
    if (this.cancelQueueCallback) {
      this.cancelQueueCallback();
      this.log('Cancelled queued responses');
    }

    // Reset TTS state
    this.isTTSActive = false;

    // Emit interruption event
    this.emitEvent({
      type: 'interruption_triggered',
      timestamp: Date.now(),
      metadata: {
        speechDuration: this.speechStartTime ? Date.now() - this.speechStartTime : 0,
      },
    });

    // Transition to listening state
    this.state = 'listening';
  }

  /**
   * Emit event to all registered callbacks
   */
  private emitEvent(event: InterruptionEvent): void {
    this.interruptionCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('[CopilotPhase2][INTERRUPT] Callback error:', error);
      }
    });
  }

  /**
   * Check if TTS is currently active
   */
  isSpeaking(): boolean {
    return this.isTTSActive;
  }

  /**
   * Check if user is currently speaking
   */
  isUserSpeaking(): boolean {
    return this.isMicActive;
  }

  /**
   * Get current state
   */
  getState(): InterruptionState {
    return this.state;
  }

  /**
   * Force stop all audio and reset state
   */
  forceStop(): void {
    this.log('Force stopping all audio');
    
    if (this.stopTTSCallback) {
      this.stopTTSCallback();
    }
    
    if (this.cancelQueueCallback) {
      this.cancelQueueCallback();
    }

    this.cancelPendingInterruption();
    this.isTTSActive = false;
    this.isMicActive = false;
    this.speechStartTime = null;
    this.state = 'idle';
  }

  /**
   * Enable or disable interruption handling
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.log(`Interruption handling ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if interruption handling is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Update configuration
   */
  configure(config: Partial<InterruptionConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated', this.config);
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.forceStop();
    this.interruptionCallbacks.clear();
    this.stopTTSCallback = null;
    this.cancelQueueCallback = null;
    this.log('InterruptionEngine reset');
  }
}

// Singleton instance
let interruptionEngine: CopilotInterruptionEngineImpl | null = null;

/**
 * Get the InterruptionEngine singleton instance
 */
export function getInterruptionEngine(): CopilotInterruptionEngineImpl {
  if (!interruptionEngine) {
    interruptionEngine = new CopilotInterruptionEngineImpl();
  }
  return interruptionEngine;
}

/**
 * Create a new InterruptionEngine with custom config
 */
export function createInterruptionEngine(
  config?: Partial<InterruptionConfig>
): CopilotInterruptionEngineImpl {
  return new CopilotInterruptionEngineImpl(config);
}

export default {
  getInterruptionEngine,
  createInterruptionEngine,
};
