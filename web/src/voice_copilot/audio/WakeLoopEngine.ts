/**
 * WakeLoopEngine.ts
 * 
 * Phase 4: Continuous Listening + Wake-Word Loop Engine
 * 
 * Implements a continuous loop that:
 * 1. Listens for wake-word ("Hey G3" and all fuzzy alias variants including GhostQuant)
 * 2. On detection -> activates MicEngine for full STT capture
 * 3. Hands text to CopilotOrchestrator
 * 4. Waits for TTS to finish (InterruptibleTTSPipeline)
 * 5. Automatically resets into wake-word listening state
 * 
 * Supported wake words:
 * - "Hey G3", "G3", "OK G3", "Hi G3", "Yo G3"
 * - "Hey gee three", "Hey g-3"
 * - "Ghost Quant" -> normalizes to G3
 * - "Go Quant" -> normalizes to G3
 * - "Ghost Quench" -> normalizes to G3
 * 
 * Features:
 * - Wake-word detection every ~150ms
 * - Non-blocking loop using requestAnimationFrame or WebAudio timers
 * - Power-saving mode (reduce polling when inactive)
 * - Dropout recovery if audio context crashes
 * 
 * Logging prefix: [WakeLoop]
 */

// ============================================================
// Types
// ============================================================

export type WakeLoopState = 
  | 'idle'
  | 'listening'
  | 'wake_detected'
  | 'capturing'
  | 'processing'
  | 'speaking'
  | 'resetting'
  | 'error';

export type PowerMode = 'active' | 'power_saving' | 'suspended';

export interface WakeLoopConfig {
  pollIntervalMs: number;
  powerSavingIntervalMs: number;
  suspendedIntervalMs: number;
  inactivityThresholdMs: number;
  maxRetries: number;
  retryDelayMs: number;
  enablePowerSaving: boolean;
  enableDropoutRecovery: boolean;
}

export interface WakeLoopCallbacks {
  onWakeDetected?: () => void;
  onCaptureStart?: () => void;
  onCaptureEnd?: (transcript: string) => void;
  onProcessingStart?: () => void;
  onProcessingEnd?: () => void;
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  onReset?: () => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: WakeLoopState) => void;
  onPowerModeChange?: (mode: PowerMode) => void;
}

export interface WakeLoopStats {
  totalWakeDetections: number;
  totalCaptureAttempts: number;
  totalProcessingCycles: number;
  totalErrors: number;
  totalRecoveries: number;
  lastWakeTime: number | null;
  lastActivityTime: number;
  uptime: number;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: WakeLoopConfig = {
  pollIntervalMs: 150,
  powerSavingIntervalMs: 500,
  suspendedIntervalMs: 2000,
  inactivityThresholdMs: 60000, // 1 minute
  maxRetries: 3,
  retryDelayMs: 1000,
  enablePowerSaving: true,
  enableDropoutRecovery: true,
};

// ============================================================
// WakeLoopEngine Implementation
// ============================================================

class WakeLoopEngineImpl {
  private config: WakeLoopConfig;
  private callbacks: WakeLoopCallbacks;
  private state: WakeLoopState = 'idle';
  private powerMode: PowerMode = 'active';
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private lastPollTime: number = 0;
  private startTime: number = 0;
  private retryCount: number = 0;
  
  private stats: WakeLoopStats = {
    totalWakeDetections: 0,
    totalCaptureAttempts: 0,
    totalProcessingCycles: 0,
    totalErrors: 0,
    totalRecoveries: 0,
    lastWakeTime: null,
    lastActivityTime: Date.now(),
    uptime: 0,
  };

  // External dependencies (injected)
  private wakeWordDetector: (() => Promise<boolean>) | null = null;
  private micCaptureHandler: (() => Promise<string>) | null = null;
  private orchestratorHandler: ((text: string) => Promise<void>) | null = null;
  private ttsCompletionChecker: (() => boolean) | null = null;
  private audioContextGetter: (() => AudioContext | null) | null = null;

  constructor(config: Partial<WakeLoopConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.callbacks = {};
    console.log('[WakeLoop] Initialized with config:', this.config);
  }

  // ============================================================
  // Configuration
  // ============================================================

  setCallbacks(callbacks: WakeLoopCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
    console.log('[WakeLoop] Callbacks configured');
  }

  setWakeWordDetector(detector: () => Promise<boolean>): void {
    this.wakeWordDetector = detector;
    console.log('[WakeLoop] Wake word detector configured');
  }

  setMicCaptureHandler(handler: () => Promise<string>): void {
    this.micCaptureHandler = handler;
    console.log('[WakeLoop] Mic capture handler configured');
  }

  setOrchestratorHandler(handler: (text: string) => Promise<void>): void {
    this.orchestratorHandler = handler;
    console.log('[WakeLoop] Orchestrator handler configured');
  }

  setTTSCompletionChecker(checker: () => boolean): void {
    this.ttsCompletionChecker = checker;
    console.log('[WakeLoop] TTS completion checker configured');
  }

  setAudioContextGetter(getter: () => AudioContext | null): void {
    this.audioContextGetter = getter;
    console.log('[WakeLoop] Audio context getter configured');
  }

  updateConfig(config: Partial<WakeLoopConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[WakeLoop] Config updated:', this.config);
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[WakeLoop] Already running');
      return;
    }

    console.log('[WakeLoop] Starting continuous listening loop');
    this.isRunning = true;
    this.startTime = Date.now();
    this.stats.lastActivityTime = Date.now();
    this.setState('listening');
    this.setPowerMode('active');

    // Start the loop
    this.scheduleNextPoll();
  }

  stop(): void {
    if (!this.isRunning) {
      console.log('[WakeLoop] Already stopped');
      return;
    }

    console.log('[WakeLoop] Stopping continuous listening loop');
    this.isRunning = false;
    this.cancelScheduledPoll();
    this.setState('idle');
    this.setPowerMode('suspended');
  }

  async reset(): Promise<void> {
    console.log('[WakeLoop] Resetting to listening state');
    this.setState('resetting');
    this.retryCount = 0;
    
    // Small delay before reset
    await this.delay(100);
    
    this.setState('listening');
    this.callbacks.onReset?.();
    
    if (this.isRunning) {
      this.scheduleNextPoll();
    }
  }

  // ============================================================
  // State Management
  // ============================================================

  private setState(newState: WakeLoopState): void {
    if (this.state !== newState) {
      console.log(`[WakeLoop] State: ${this.state} -> ${newState}`);
      this.state = newState;
      this.callbacks.onStateChange?.(newState);
    }
  }

  private setPowerMode(mode: PowerMode): void {
    if (this.powerMode !== mode) {
      console.log(`[WakeLoop] Power mode: ${this.powerMode} -> ${mode}`);
      this.powerMode = mode;
      this.callbacks.onPowerModeChange?.(mode);
    }
  }

  getState(): WakeLoopState {
    return this.state;
  }

  getPowerMode(): PowerMode {
    return this.powerMode;
  }

  isActive(): boolean {
    return this.isRunning && this.state !== 'idle' && this.state !== 'error';
  }

  getStats(): WakeLoopStats {
    return {
      ...this.stats,
      uptime: this.isRunning ? Date.now() - this.startTime : this.stats.uptime,
    };
  }

  // ============================================================
  // Main Loop
  // ============================================================

  private scheduleNextPoll(): void {
    if (!this.isRunning) return;

    const interval = this.getCurrentPollInterval();
    
    // Use requestAnimationFrame for active mode, setTimeout for power saving
    if (this.powerMode === 'active' && typeof requestAnimationFrame !== 'undefined') {
      this.animationFrameId = requestAnimationFrame(() => {
        const now = Date.now();
        if (now - this.lastPollTime >= interval) {
          this.lastPollTime = now;
          this.pollLoop();
        } else {
          this.scheduleNextPoll();
        }
      });
    } else {
      this.timeoutId = setTimeout(() => {
        this.lastPollTime = Date.now();
        this.pollLoop();
      }, interval);
    }
  }

  private cancelScheduledPoll(): void {
    if (this.animationFrameId !== null) {
      if (typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(this.animationFrameId);
      }
      this.animationFrameId = null;
    }
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private getCurrentPollInterval(): number {
    switch (this.powerMode) {
      case 'active':
        return this.config.pollIntervalMs;
      case 'power_saving':
        return this.config.powerSavingIntervalMs;
      case 'suspended':
        return this.config.suspendedIntervalMs;
      default:
        return this.config.pollIntervalMs;
    }
  }

  private async pollLoop(): Promise<void> {
    if (!this.isRunning) return;

    try {
      // Check for audio context dropout
      if (this.config.enableDropoutRecovery) {
        await this.checkAndRecoverAudioContext();
      }

      // Update power mode based on activity
      if (this.config.enablePowerSaving) {
        this.updatePowerMode();
      }

      // Only poll for wake word when in listening state
      if (this.state === 'listening') {
        await this.checkWakeWord();
      }

      // Schedule next poll
      this.scheduleNextPoll();
    } catch (error) {
      console.error('[WakeLoop] Error in poll loop:', error);
      this.handleError(error as Error);
    }
  }

  // ============================================================
  // Wake Word Detection
  // ============================================================

  private async checkWakeWord(): Promise<void> {
    if (!this.wakeWordDetector) {
      console.warn('[WakeLoop] No wake word detector configured');
      return;
    }

    try {
      const detected = await this.wakeWordDetector();
      
      if (detected) {
        console.log('[WakeLoop] Wake word detected!');
        this.stats.totalWakeDetections++;
        this.stats.lastWakeTime = Date.now();
        this.stats.lastActivityTime = Date.now();
        
        // Switch to active power mode
        this.setPowerMode('active');
        
        // Trigger wake detection callback
        this.callbacks.onWakeDetected?.();
        
        // Start capture flow
        await this.startCaptureFlow();
      }
    } catch (error) {
      console.error('[WakeLoop] Wake word detection error:', error);
      // Don't throw - continue polling
    }
  }

  // ============================================================
  // Capture Flow
  // ============================================================

  private async startCaptureFlow(): Promise<void> {
    this.setState('wake_detected');
    
    try {
      // Start capture
      this.setState('capturing');
      this.callbacks.onCaptureStart?.();
      this.stats.totalCaptureAttempts++;

      if (!this.micCaptureHandler) {
        throw new Error('No mic capture handler configured');
      }

      const transcript = await this.micCaptureHandler();
      this.callbacks.onCaptureEnd?.(transcript);

      if (!transcript || transcript.trim().length === 0) {
        console.log('[WakeLoop] Empty transcript, resetting');
        await this.reset();
        return;
      }

      // Process with orchestrator
      this.setState('processing');
      this.callbacks.onProcessingStart?.();
      this.stats.totalProcessingCycles++;

      if (!this.orchestratorHandler) {
        throw new Error('No orchestrator handler configured');
      }

      await this.orchestratorHandler(transcript);
      this.callbacks.onProcessingEnd?.();

      // Wait for TTS to complete
      this.setState('speaking');
      this.callbacks.onSpeakingStart?.();
      await this.waitForTTSCompletion();
      this.callbacks.onSpeakingEnd?.();

      // Reset to listening state
      await this.reset();

    } catch (error) {
      console.error('[WakeLoop] Capture flow error:', error);
      this.handleError(error as Error);
    }
  }

  // ============================================================
  // TTS Completion
  // ============================================================

  private async waitForTTSCompletion(): Promise<void> {
    if (!this.ttsCompletionChecker) {
      console.warn('[WakeLoop] No TTS completion checker, using timeout');
      await this.delay(2000);
      return;
    }

    const maxWaitTime = 30000; // 30 seconds max
    const checkInterval = 100;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      if (this.ttsCompletionChecker()) {
        console.log('[WakeLoop] TTS completed');
        return;
      }
      await this.delay(checkInterval);
    }

    console.warn('[WakeLoop] TTS completion timeout');
  }

  // ============================================================
  // Power Management
  // ============================================================

  private updatePowerMode(): void {
    const timeSinceActivity = Date.now() - this.stats.lastActivityTime;

    if (timeSinceActivity > this.config.inactivityThresholdMs * 2) {
      this.setPowerMode('suspended');
    } else if (timeSinceActivity > this.config.inactivityThresholdMs) {
      this.setPowerMode('power_saving');
    } else {
      this.setPowerMode('active');
    }
  }

  // ============================================================
  // Audio Context Recovery
  // ============================================================

  private async checkAndRecoverAudioContext(): Promise<void> {
    if (!this.audioContextGetter) return;

    const audioContext = this.audioContextGetter();
    
    if (!audioContext) {
      console.warn('[WakeLoop] No audio context available');
      return;
    }

    if (audioContext.state === 'suspended') {
      console.log('[WakeLoop] Audio context suspended, attempting resume');
      try {
        await audioContext.resume();
        console.log('[WakeLoop] Audio context resumed');
        this.stats.totalRecoveries++;
      } catch (error) {
        console.error('[WakeLoop] Failed to resume audio context:', error);
      }
    } else if (audioContext.state === 'closed') {
      console.error('[WakeLoop] Audio context closed, recovery needed');
      this.callbacks.onError?.(new Error('Audio context closed'));
    }
  }

  // ============================================================
  // Error Handling
  // ============================================================

  private handleError(error: Error): void {
    this.stats.totalErrors++;
    this.setState('error');
    this.callbacks.onError?.(error);

    console.error('[CopilotPhase4] Recovering audio context');

    // Attempt recovery
    if (this.retryCount < this.config.maxRetries) {
      this.retryCount++;
      console.log(`[WakeLoop] Retry attempt ${this.retryCount}/${this.config.maxRetries}`);
      
      setTimeout(async () => {
        await this.reset();
      }, this.config.retryDelayMs);
    } else {
      console.error('[WakeLoop] Max retries exceeded, stopping');
      this.stop();
    }
  }

  // ============================================================
  // Utilities
  // ============================================================

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================
  // External Triggers
  // ============================================================

  /**
   * Manually trigger wake detection (for testing or UI button)
   */
  async triggerWake(): Promise<void> {
    if (!this.isRunning) {
      console.warn('[WakeLoop] Not running, cannot trigger wake');
      return;
    }

    if (this.state !== 'listening') {
      console.warn('[WakeLoop] Not in listening state, cannot trigger wake');
      return;
    }

    console.log('[WakeLoop] Manual wake trigger');
    this.stats.totalWakeDetections++;
    this.stats.lastWakeTime = Date.now();
    this.stats.lastActivityTime = Date.now();
    this.callbacks.onWakeDetected?.();
    await this.startCaptureFlow();
  }

  /**
   * Interrupt current flow and reset
   */
  async interrupt(): Promise<void> {
    console.log('[WakeLoop] Interrupt requested');
    this.cancelScheduledPoll();
    await this.reset();
  }

  /**
   * Record activity to prevent power saving
   */
  recordActivity(): void {
    this.stats.lastActivityTime = Date.now();
    if (this.powerMode !== 'active') {
      this.setPowerMode('active');
    }
  }

  // ============================================================
  // STT Restoration Patch - Transcript Input
  // ============================================================

  /**
   * Handle incoming transcript from SpeechInputBridge
   * Normalizes text, checks for wake-word match, and triggers listening state
   * 
   * This is an ADDITIVE method - does NOT modify existing logic.
   * 
   * @param text - Normalized transcript from STT
   */
  onTranscript(text: string): void {
    if (!text || !text.trim()) return;

    console.log('[WakeLoop] onTranscript:', text);

    // Record activity to prevent power saving
    this.recordActivity();

    // Check if we're in a state where we can detect wake words
    if (this.state !== 'listening') {
      console.log('[WakeLoop] Not in listening state, ignoring transcript');
      return;
    }

    // Check for wake-word match (text should already be normalized by WakeWordNormalizationPipeline)
    const lowerText = text.toLowerCase();
    
    // Check for G3 wake words
    const wakeWordPatterns = [
      'hey g3',
      'g3',
      'ok g3',
      'hi g3',
      'yo g3',
      'gee three',
      'hey gee three',
    ];

    let wakeWordDetected = false;
    for (const pattern of wakeWordPatterns) {
      if (lowerText.includes(pattern)) {
        wakeWordDetected = true;
        console.log('[WakeLoop] Wake word detected:', pattern);
        break;
      }
    }

    if (wakeWordDetected) {
      console.log('[WakeLoop] Wake word detected');
      
      // Trigger wake detection (enters listening/capture state)
      this.triggerWake();
    }
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let wakeLoopEngine: WakeLoopEngineImpl | null = null;

/**
 * Get the WakeLoopEngine singleton instance
 */
export function getWakeLoopEngine(): WakeLoopEngineImpl {
  if (!wakeLoopEngine) {
    wakeLoopEngine = new WakeLoopEngineImpl();
  }
  return wakeLoopEngine;
}

/**
 * Create a new WakeLoopEngine instance
 */
export function createWakeLoopEngine(config?: Partial<WakeLoopConfig>): WakeLoopEngineImpl {
  return new WakeLoopEngineImpl(config);
}

export default {
  getWakeLoopEngine,
  createWakeLoopEngine,
};
