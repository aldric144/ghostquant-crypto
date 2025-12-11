/**
 * ContinuousListeningController.ts
 * 
 * Phase 4: Continuous Listening + Wake-Word Loop Engine
 * 
 * Master controller orchestrating:
 * - WakeLoopEngine
 * - WakeWordSensitivityController
 * - NoiseSuppressionEngine
 * - MicEngine
 * - STT pipeline
 * - Interruption Engine
 * 
 * Maintains a state machine:
 * IDLE -> LISTENING -> THINKING -> SPEAKING -> RESET -> IDLE
 * 
 * API:
 * - start()
 * - stop()
 * - reset()
 * - isActive()
 * 
 * Logging prefix: [ContinuousListening]
 */

import { getWakeLoopEngine, type WakeLoopState, type PowerMode, type WakeLoopStats } from './WakeLoopEngine';
import { getWakeWordSensitivityController, type SensitivityLevel, type SensitivityStats } from './WakeWordSensitivityController';
import { getNoiseSuppressionEngine, type NoiseSuppressionStats } from './NoiseSuppressionEngine';
import { getInterruptibleTTSPipeline } from './InterruptibleTTSPipeline';

// ============================================================
// Types
// ============================================================

export type ContinuousListeningState = 
  | 'idle'
  | 'initializing'
  | 'listening'
  | 'wake_detected'
  | 'capturing'
  | 'thinking'
  | 'speaking'
  | 'interrupted'
  | 'resetting'
  | 'error';

export interface ContinuousListeningConfig {
  autoStart: boolean;
  enableNoiseSuppression: boolean;
  enableSensitivityControl: boolean;
  enableInterruption: boolean;
  defaultSensitivity: SensitivityLevel;
  wakeWords: string[];
  maxCaptureTimeMs: number;
  silenceTimeoutMs: number;
  interruptionThreshold: number;
}

export interface ContinuousListeningCallbacks {
  onStateChange?: (state: ContinuousListeningState) => void;
  onWakeDetected?: () => void;
  onCaptureStart?: () => void;
  onCaptureEnd?: (transcript: string) => void;
  onThinkingStart?: () => void;
  onThinkingEnd?: () => void;
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  onInterrupted?: () => void;
  onError?: (error: Error) => void;
  onReset?: () => void;
}

export interface ContinuousListeningStats {
  state: ContinuousListeningState;
  isActive: boolean;
  totalSessions: number;
  totalWakeDetections: number;
  totalInterruptions: number;
  totalErrors: number;
  uptime: number;
  lastWakeTime: number | null;
  lastInterruptionTime: number | null;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: ContinuousListeningConfig = {
  autoStart: false,
  enableNoiseSuppression: true,
  enableSensitivityControl: true,
  enableInterruption: true,
  defaultSensitivity: 'medium',
  wakeWords: [
    'hey ghostquant',
    'hey ghost quant',
    'hey ghost',
    'ok ghostquant',
    'ok ghost quant',
    'ghostquant',
    'ghost quant',
  ],
  maxCaptureTimeMs: 30000,
  silenceTimeoutMs: 2000,
  interruptionThreshold: 0.3,
};

// ============================================================
// ContinuousListeningController Implementation
// ============================================================

class ContinuousListeningControllerImpl {
  private config: ContinuousListeningConfig;
  private callbacks: ContinuousListeningCallbacks = {};
  private state: ContinuousListeningState = 'idle';
  private isInitialized: boolean = false;
  private startTime: number = 0;
  
  // Component references
  private wakeLoopEngine = getWakeLoopEngine();
  private sensitivityController = getWakeWordSensitivityController();
  private noiseSuppressionEngine = getNoiseSuppressionEngine();
  private ttsPipeline = getInterruptibleTTSPipeline();
  
  // Audio context
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  
  // External handlers (injected)
  private wakeWordDetector: (() => Promise<boolean>) | null = null;
  private micCaptureHandler: (() => Promise<string>) | null = null;
  private orchestratorHandler: ((text: string) => Promise<void>) | null = null;
  
  // Stats
  private stats: ContinuousListeningStats = {
    state: 'idle',
    isActive: false,
    totalSessions: 0,
    totalWakeDetections: 0,
    totalInterruptions: 0,
    totalErrors: 0,
    uptime: 0,
    lastWakeTime: null,
    lastInterruptionTime: null,
  };

  constructor(config: Partial<ContinuousListeningConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('[ContinuousListening] Controller initialized');
  }

  // ============================================================
  // Initialization
  // ============================================================

  /**
   * Initialize the continuous listening system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[ContinuousListening] Already initialized');
      return;
    }

    this.setState('initializing');
    console.log('[ContinuousListening] Initializing...');

    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create audio context
      this.audioContext = new AudioContext();

      // Initialize noise suppression
      if (this.config.enableNoiseSuppression) {
        await this.noiseSuppressionEngine.initialize(this.audioContext);
      }

      // Set up sensitivity controller
      if (this.config.enableSensitivityControl) {
        this.sensitivityController.setSensitivityLevel(this.config.defaultSensitivity);
      }

      // Configure wake loop engine
      this.configureWakeLoopEngine();

      this.isInitialized = true;
      this.setState('idle');
      console.log('[ContinuousListening] Initialization complete');

      // Auto-start if configured
      if (this.config.autoStart) {
        await this.start();
      }
    } catch (error) {
      console.error('[ContinuousListening] Initialization failed:', error);
      this.setState('error');
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Configure the wake loop engine with callbacks
   */
  private configureWakeLoopEngine(): void {
    this.wakeLoopEngine.setCallbacks({
      onWakeDetected: () => {
        this.stats.totalWakeDetections++;
        this.stats.lastWakeTime = Date.now();
        this.setState('wake_detected');
        this.callbacks.onWakeDetected?.();
      },
      onCaptureStart: () => {
        this.setState('capturing');
        this.callbacks.onCaptureStart?.();
      },
      onCaptureEnd: (transcript: string) => {
        this.callbacks.onCaptureEnd?.(transcript);
      },
      onProcessingStart: () => {
        this.setState('thinking');
        this.callbacks.onThinkingStart?.();
      },
      onProcessingEnd: () => {
        this.callbacks.onThinkingEnd?.();
      },
      onSpeakingStart: () => {
        this.setState('speaking');
        this.callbacks.onSpeakingStart?.();
      },
      onSpeakingEnd: () => {
        this.callbacks.onSpeakingEnd?.();
      },
      onReset: () => {
        this.setState('listening');
        this.callbacks.onReset?.();
      },
      onError: (error: Error) => {
        this.stats.totalErrors++;
        this.setState('error');
        this.callbacks.onError?.(error);
      },
      onStateChange: (wakeState: WakeLoopState) => {
        console.log('[ContinuousListening] WakeLoop state:', wakeState);
      },
      onPowerModeChange: (mode: PowerMode) => {
        console.log('[ContinuousListening] Power mode:', mode);
      },
    });

    // Set handlers
    if (this.wakeWordDetector) {
      this.wakeLoopEngine.setWakeWordDetector(this.wakeWordDetector);
    }
    if (this.micCaptureHandler) {
      this.wakeLoopEngine.setMicCaptureHandler(this.micCaptureHandler);
    }
    if (this.orchestratorHandler) {
      this.wakeLoopEngine.setOrchestratorHandler(this.orchestratorHandler);
    }

    // Set TTS completion checker
    this.wakeLoopEngine.setTTSCompletionChecker(() => {
      return !this.ttsPipeline.isPlaying();
    });

    // Set audio context getter
    this.wakeLoopEngine.setAudioContextGetter(() => this.audioContext);
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  /**
   * Start continuous listening
   */
  async start(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.state !== 'idle' && this.state !== 'error') {
      console.log('[ContinuousListening] Already running');
      return;
    }

    console.log('[ContinuousListening] Starting continuous listening');
    this.startTime = Date.now();
    this.stats.totalSessions++;
    this.stats.isActive = true;

    // Start wake loop
    await this.wakeLoopEngine.start();
    this.setState('listening');

    // Start interruption monitoring if enabled
    if (this.config.enableInterruption) {
      this.startInterruptionMonitoring();
    }
  }

  /**
   * Stop continuous listening
   */
  stop(): void {
    console.log('[ContinuousListening] Stopping continuous listening');
    
    this.wakeLoopEngine.stop();
    this.stopInterruptionMonitoring();
    
    this.stats.isActive = false;
    this.stats.uptime += Date.now() - this.startTime;
    this.setState('idle');
  }

  /**
   * Reset to listening state
   */
  async reset(): Promise<void> {
    console.log('[ContinuousListening] Resetting');
    this.setState('resetting');
    
    await this.wakeLoopEngine.reset();
    this.setState('listening');
    this.callbacks.onReset?.();
  }

  /**
   * Check if continuous listening is active
   */
  isActive(): boolean {
    return this.stats.isActive && this.state !== 'idle' && this.state !== 'error';
  }

  // ============================================================
  // State Management
  // ============================================================

  private setState(newState: ContinuousListeningState): void {
    if (this.state !== newState) {
      console.log(`[ContinuousListening] State: ${this.state} -> ${newState}`);
      this.state = newState;
      this.stats.state = newState;
      this.callbacks.onStateChange?.(newState);
    }
  }

  getState(): ContinuousListeningState {
    return this.state;
  }

  // ============================================================
  // Interruption Handling
  // ============================================================

  private interruptionInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Start monitoring for user interruption during TTS
   */
  private startInterruptionMonitoring(): void {
    if (this.interruptionInterval) return;

    this.interruptionInterval = setInterval(() => {
      this.checkForInterruption();
    }, 100);
  }

  /**
   * Stop interruption monitoring
   */
  private stopInterruptionMonitoring(): void {
    if (this.interruptionInterval) {
      clearInterval(this.interruptionInterval);
      this.interruptionInterval = null;
    }
  }

  /**
   * Check if user is trying to interrupt
   */
  private checkForInterruption(): void {
    if (this.state !== 'speaking') return;

    // Check VAD from noise suppression engine
    const vadResult = this.noiseSuppressionEngine.detectVoiceActivity();
    
    if (vadResult.isVoice && vadResult.confidence > this.config.interruptionThreshold) {
      console.log('[ContinuousListening] User interruption detected');
      this.handleInterruption();
    }
  }

  /**
   * Handle user interruption
   */
  private async handleInterruption(): Promise<void> {
    this.stats.totalInterruptions++;
    this.stats.lastInterruptionTime = Date.now();
    this.setState('interrupted');
    this.callbacks.onInterrupted?.();

    // Stop TTS immediately
    this.ttsPipeline.stop();
    this.ttsPipeline.clearQueue();

    // Reset to listening state
    await this.reset();
  }

  // ============================================================
  // Handler Configuration
  // ============================================================

  /**
   * Set the wake word detector function
   */
  setWakeWordDetector(detector: () => Promise<boolean>): void {
    this.wakeWordDetector = detector;
    this.wakeLoopEngine.setWakeWordDetector(detector);
    console.log('[ContinuousListening] Wake word detector configured');
  }

  /**
   * Set the microphone capture handler
   */
  setMicCaptureHandler(handler: () => Promise<string>): void {
    this.micCaptureHandler = handler;
    this.wakeLoopEngine.setMicCaptureHandler(handler);
    console.log('[ContinuousListening] Mic capture handler configured');
  }

  /**
   * Set the orchestrator handler
   */
  setOrchestratorHandler(handler: (text: string) => Promise<void>): void {
    this.orchestratorHandler = handler;
    this.wakeLoopEngine.setOrchestratorHandler(handler);
    console.log('[ContinuousListening] Orchestrator handler configured');
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks: ContinuousListeningCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
    console.log('[ContinuousListening] Callbacks configured');
  }

  // ============================================================
  // Configuration
  // ============================================================

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ContinuousListeningConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Update sensitivity if changed
    if (config.defaultSensitivity) {
      this.sensitivityController.setSensitivityLevel(config.defaultSensitivity);
    }
    
    console.log('[ContinuousListening] Config updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): ContinuousListeningConfig {
    return { ...this.config };
  }

  /**
   * Set sensitivity level
   */
  setSensitivityLevel(level: SensitivityLevel): void {
    this.sensitivityController.setSensitivityLevel(level);
    console.log('[ContinuousListening] Sensitivity set to:', level);
  }

  /**
   * Get current sensitivity level
   */
  getSensitivityLevel(): SensitivityLevel {
    return this.sensitivityController.getSensitivityLevel();
  }

  // ============================================================
  // Stats & Cleanup
  // ============================================================

  /**
   * Get current statistics
   */
  getStats(): ContinuousListeningStats {
    return {
      ...this.stats,
      uptime: this.stats.isActive 
        ? this.stats.uptime + (Date.now() - this.startTime)
        : this.stats.uptime,
    };
  }

  /**
   * Get component stats
   */
  getComponentStats(): {
    wakeLoop: WakeLoopStats;
    sensitivity: SensitivityStats;
    noiseSuppression: NoiseSuppressionStats;
  } {
    return {
      wakeLoop: this.wakeLoopEngine.getStats(),
      sensitivity: this.sensitivityController.getStats(),
      noiseSuppression: this.noiseSuppressionEngine.getStats(),
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      state: this.state,
      isActive: this.stats.isActive,
      totalSessions: 0,
      totalWakeDetections: 0,
      totalInterruptions: 0,
      totalErrors: 0,
      uptime: 0,
      lastWakeTime: null,
      lastInterruptionTime: null,
    };
    console.log('[ContinuousListening] Stats reset');
  }

  /**
   * Cleanup and release resources
   */
  dispose(): void {
    this.stop();
    this.stopInterruptionMonitoring();
    
    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    // Dispose noise suppression
    this.noiseSuppressionEngine.dispose();
    
    this.isInitialized = false;
    console.log('[ContinuousListening] Disposed');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let continuousListeningController: ContinuousListeningControllerImpl | null = null;

/**
 * Get the ContinuousListeningController singleton instance
 */
export function getContinuousListeningController(): ContinuousListeningControllerImpl {
  if (!continuousListeningController) {
    continuousListeningController = new ContinuousListeningControllerImpl();
  }
  return continuousListeningController;
}

/**
 * Create a new ContinuousListeningController instance
 */
export function createContinuousListeningController(
  config?: Partial<ContinuousListeningConfig>
): ContinuousListeningControllerImpl {
  return new ContinuousListeningControllerImpl(config);
}

export default {
  getContinuousListeningController,
  createContinuousListeningController,
};
