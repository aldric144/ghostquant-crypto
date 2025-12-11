/**
 * MicEngineHooks.ts
 * 
 * Phase 4: Continuous Listening + Wake-Word Loop Engine
 * 
 * Optional hooks for MicEngine:
 * - onWakeTriggered()
 * - onSpeechStart()
 * - onSpeechEnd()
 * - onAutoReset()
 * 
 * MicEngine itself is NOT modified - this provides a hook layer
 * that wraps MicEngine functionality for continuous listening.
 * 
 * Logging prefix: [MicHooks]
 */

// ============================================================
// Types
// ============================================================

export interface MicEngineHookCallbacks {
  onWakeTriggered?: () => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: (transcript: string) => void;
  onAutoReset?: () => void;
  onError?: (error: Error) => void;
  onAudioLevelChange?: (level: number) => void;
  onSilenceDetected?: () => void;
  onVoiceDetected?: () => void;
}

export interface MicEngineHookConfig {
  silenceThresholdMs: number;
  minSpeechDurationMs: number;
  maxSpeechDurationMs: number;
  audioLevelThreshold: number;
  autoResetDelayMs: number;
  enableAutoReset: boolean;
}

export interface MicEngineHookState {
  isListening: boolean;
  isSpeaking: boolean;
  currentAudioLevel: number;
  speechStartTime: number | null;
  lastSpeechTime: number | null;
  silenceStartTime: number | null;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: MicEngineHookConfig = {
  silenceThresholdMs: 1500,
  minSpeechDurationMs: 500,
  maxSpeechDurationMs: 30000,
  audioLevelThreshold: 0.02,
  autoResetDelayMs: 500,
  enableAutoReset: true,
};

// ============================================================
// MicEngineHooks Implementation
// ============================================================

class MicEngineHooksImpl {
  private config: MicEngineHookConfig;
  private callbacks: MicEngineHookCallbacks = {};
  private state: MicEngineHookState = {
    isListening: false,
    isSpeaking: false,
    currentAudioLevel: 0,
    speechStartTime: null,
    lastSpeechTime: null,
    silenceStartTime: null,
  };

  // Audio analysis
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private monitoringInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<MicEngineHookConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('[MicHooks] Initialized');
  }

  // ============================================================
  // Configuration
  // ============================================================

  /**
   * Set hook callbacks
   */
  setCallbacks(callbacks: MicEngineHookCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
    console.log('[MicHooks] Callbacks configured');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MicEngineHookConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[MicHooks] Config updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): MicEngineHookConfig {
    return { ...this.config };
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  /**
   * Start monitoring audio stream
   */
  async startMonitoring(mediaStream: MediaStream): Promise<void> {
    if (this.state.isListening) {
      console.log('[MicHooks] Already monitoring');
      return;
    }

    try {
      // Create audio context and analyser
      this.audioContext = new AudioContext();
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Connect media stream
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(mediaStream);
      this.mediaStreamSource.connect(this.analyserNode);

      // Start monitoring loop
      this.state.isListening = true;
      this.startMonitoringLoop();

      console.log('[MicHooks] Monitoring started');
    } catch (error) {
      console.error('[MicHooks] Failed to start monitoring:', error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (!this.state.isListening) return;

    this.stopMonitoringLoop();

    // Disconnect nodes
    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
      this.mediaStreamSource = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyserNode = null;
    this.state.isListening = false;

    console.log('[MicHooks] Monitoring stopped');
  }

  // ============================================================
  // Monitoring Loop
  // ============================================================

  private startMonitoringLoop(): void {
    if (this.monitoringInterval) return;

    this.monitoringInterval = setInterval(() => {
      this.processAudioFrame();
    }, 50); // 50ms = 20 FPS
  }

  private stopMonitoringLoop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private processAudioFrame(): void {
    if (!this.analyserNode) return;

    // Get audio level
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);

    // Calculate RMS level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = dataArray[i] / 255;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / dataArray.length);
    this.state.currentAudioLevel = rms;

    // Notify audio level change
    this.callbacks.onAudioLevelChange?.(rms);

    // Detect voice activity
    const isVoice = rms > this.config.audioLevelThreshold;
    const now = Date.now();

    if (isVoice) {
      // Voice detected
      if (!this.state.isSpeaking) {
        // Speech started
        this.state.isSpeaking = true;
        this.state.speechStartTime = now;
        this.state.silenceStartTime = null;
        this.callbacks.onSpeechStart?.();
        this.callbacks.onVoiceDetected?.();
        console.log('[MicHooks] Speech started');
      }
      this.state.lastSpeechTime = now;
    } else {
      // Silence detected
      if (this.state.isSpeaking) {
        // Check if silence threshold reached
        if (!this.state.silenceStartTime) {
          this.state.silenceStartTime = now;
        }

        const silenceDuration = now - this.state.silenceStartTime;
        
        if (silenceDuration >= this.config.silenceThresholdMs) {
          // Speech ended
          this.handleSpeechEnd();
        }
      }
    }

    // Check max speech duration
    if (this.state.isSpeaking && this.state.speechStartTime) {
      const speechDuration = now - this.state.speechStartTime;
      if (speechDuration >= this.config.maxSpeechDurationMs) {
        console.log('[MicHooks] Max speech duration reached');
        this.handleSpeechEnd();
      }
    }
  }

  private handleSpeechEnd(): void {
    if (!this.state.isSpeaking) return;

    const speechDuration = this.state.speechStartTime 
      ? Date.now() - this.state.speechStartTime 
      : 0;

    // Only trigger if minimum duration met
    if (speechDuration >= this.config.minSpeechDurationMs) {
      console.log('[MicHooks] Speech ended, duration:', speechDuration, 'ms');
      this.callbacks.onSpeechEnd?.(''); // Transcript will be filled by STT
      this.callbacks.onSilenceDetected?.();
    } else {
      console.log('[MicHooks] Speech too short, ignoring');
    }

    this.state.isSpeaking = false;
    this.state.speechStartTime = null;
    this.state.silenceStartTime = null;

    // Auto-reset if enabled
    if (this.config.enableAutoReset) {
      setTimeout(() => {
        this.callbacks.onAutoReset?.();
      }, this.config.autoResetDelayMs);
    }
  }

  // ============================================================
  // Hook Triggers
  // ============================================================

  /**
   * Trigger wake word detected hook
   */
  triggerWakeDetected(): void {
    console.log('[MicHooks] Wake triggered');
    this.callbacks.onWakeTriggered?.();
  }

  /**
   * Trigger speech start hook
   */
  triggerSpeechStart(): void {
    if (!this.state.isSpeaking) {
      this.state.isSpeaking = true;
      this.state.speechStartTime = Date.now();
      console.log('[MicHooks] Speech start triggered');
      this.callbacks.onSpeechStart?.();
    }
  }

  /**
   * Trigger speech end hook with transcript
   */
  triggerSpeechEnd(transcript: string): void {
    if (this.state.isSpeaking) {
      this.state.isSpeaking = false;
      this.state.speechStartTime = null;
      console.log('[MicHooks] Speech end triggered');
      this.callbacks.onSpeechEnd?.(transcript);
    }
  }

  /**
   * Trigger auto-reset hook
   */
  triggerAutoReset(): void {
    console.log('[MicHooks] Auto-reset triggered');
    this.callbacks.onAutoReset?.();
  }

  // ============================================================
  // State Access
  // ============================================================

  /**
   * Get current state
   */
  getState(): MicEngineHookState {
    return { ...this.state };
  }

  /**
   * Check if currently listening
   */
  isListening(): boolean {
    return this.state.isListening;
  }

  /**
   * Check if speech is in progress
   */
  isSpeaking(): boolean {
    return this.state.isSpeaking;
  }

  /**
   * Get current audio level
   */
  getAudioLevel(): number {
    return this.state.currentAudioLevel;
  }

  // ============================================================
  // Cleanup
  // ============================================================

  /**
   * Dispose and cleanup
   */
  dispose(): void {
    this.stopMonitoring();
    this.callbacks = {};
    console.log('[MicHooks] Disposed');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let micEngineHooks: MicEngineHooksImpl | null = null;

/**
 * Get the MicEngineHooks singleton instance
 */
export function getMicEngineHooks(): MicEngineHooksImpl {
  if (!micEngineHooks) {
    micEngineHooks = new MicEngineHooksImpl();
  }
  return micEngineHooks;
}

/**
 * Create a new MicEngineHooks instance
 */
export function createMicEngineHooks(
  config?: Partial<MicEngineHookConfig>
): MicEngineHooksImpl {
  return new MicEngineHooksImpl(config);
}

export default {
  getMicEngineHooks,
  createMicEngineHooks,
};
