/**
 * InterruptibleTTSPipeline - Interruptible Audio Playback Controller
 * 
 * Phase 2 Conversational Engine
 * 
 * Features:
 * - Wrap ElevenLabs play() inside a controller allowing stop()
 * - On interruption:
 *   → stop audio
 *   → flush buffer
 *   → return control to DialogueManager
 * 
 * This is an ADDITIVE module - does NOT modify existing TTS modules.
 */

import { getInterruptionEngine } from '../dialogue/CopilotInterruptionEngine';

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error';

export interface PlaybackEvent {
  type: 'start' | 'end' | 'pause' | 'resume' | 'stop' | 'error';
  timestamp: number;
  duration?: number;
  error?: string;
}

export interface TTSPipelineConfig {
  enableInterruption: boolean;
  fadeOutDurationMs: number;
  bufferFlushDelayMs: number;
  enableLogging: boolean;
}

const DEFAULT_CONFIG: TTSPipelineConfig = {
  enableInterruption: true,
  fadeOutDurationMs: 50,
  bufferFlushDelayMs: 10,
  enableLogging: true,
};

type PlaybackCallback = (event: PlaybackEvent) => void;

class InterruptibleTTSPipelineImpl {
  private config: TTSPipelineConfig;
  private state: PlaybackState = 'idle';
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private playbackCallbacks: Set<PlaybackCallback> = new Set();
  private playbackStartTime: number | null = null;
  private pendingAudioQueue: Blob[] = [];
  private isProcessingQueue: boolean = false;

  constructor(config: Partial<TTSPipelineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupInterruptionHandling();
    this.log('InterruptibleTTSPipeline initialized');
  }

  /**
   * Log message with [TTS] prefix
   */
  private log(message: string, data?: unknown): void {
    if (this.config.enableLogging) {
      if (data) {
        console.log(`[CopilotPhase2][TTS] ${message}`, data);
      } else {
        console.log(`[CopilotPhase2][TTS] ${message}`);
      }
    }
  }

  /**
   * Setup interruption handling
   */
  private setupInterruptionHandling(): void {
    if (!this.config.enableInterruption) return;

    const interruptionEngine = getInterruptionEngine();
    
    // Register stop callback
    interruptionEngine.registerStopTTSCallback(() => {
      this.stop();
    });

    // Register queue cancel callback
    interruptionEngine.registerCancelQueueCallback(() => {
      this.clearQueue();
    });

    this.log('Interruption handling configured');
  }

  /**
   * Get or create AudioContext
   */
  private getAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
    return this.audioContext;
  }

  /**
   * Play audio blob with interruption support
   */
  async play(audioBlob: Blob): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        this.state = 'loading';
        this.log('Loading audio blob', { size: audioBlob.size });

        // Get audio context
        const ctx = this.getAudioContext();

        // Resume if suspended (browser autoplay policy)
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        // Stop any currently playing audio
        this.stopCurrentSource();

        // Convert blob to array buffer
        const arrayBuffer = await audioBlob.arrayBuffer();

        // Decode audio data
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        // Create source node
        this.currentSource = ctx.createBufferSource();
        this.currentSource.buffer = audioBuffer;

        // Connect through gain node for fade out support
        if (this.gainNode) {
          this.gainNode.gain.value = 1.0;
          this.currentSource.connect(this.gainNode);
        } else {
          this.currentSource.connect(ctx.destination);
        }

        // Track playback start
        this.playbackStartTime = Date.now();
        this.state = 'playing';

        // Notify interruption engine
        const interruptionEngine = getInterruptionEngine();
        interruptionEngine.notifyTTSStart();

        // Emit start event
        this.emitEvent({
          type: 'start',
          timestamp: Date.now(),
        });

        this.log('Starting audio playback');

        // Handle playback end
        this.currentSource.onended = () => {
          const duration = this.playbackStartTime 
            ? Date.now() - this.playbackStartTime 
            : 0;

          this.state = 'idle';
          this.currentSource = null;
          this.playbackStartTime = null;

          // Notify interruption engine
          interruptionEngine.notifyTTSEnd();

          // Emit end event
          this.emitEvent({
            type: 'end',
            timestamp: Date.now(),
            duration,
          });

          this.log('Audio playback ended', { duration });
          resolve();

          // Process next in queue
          this.processQueue();
        };

        // Start playback
        this.currentSource.start(0);

      } catch (error) {
        this.state = 'error';
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        this.emitEvent({
          type: 'error',
          timestamp: Date.now(),
          error: errorMessage,
        });

        this.log('Playback error', error);
        reject(error);
      }
    });
  }

  /**
   * Queue audio for playback
   */
  queueAudio(audioBlob: Blob): void {
    this.pendingAudioQueue.push(audioBlob);
    this.log('Audio queued', { queueLength: this.pendingAudioQueue.length });

    // Start processing if not already
    if (!this.isProcessingQueue && this.state === 'idle') {
      this.processQueue();
    }
  }

  /**
   * Process audio queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.pendingAudioQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.pendingAudioQueue.length > 0 && this.state !== 'stopped') {
      const audioBlob = this.pendingAudioQueue.shift();
      if (audioBlob) {
        try {
          await this.play(audioBlob);
        } catch (error) {
          this.log('Queue playback error', error);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Stop current audio playback
   */
  stop(): void {
    if (this.state !== 'playing' && this.state !== 'loading') {
      return;
    }

    this.log('Stopping audio playback');
    this.state = 'stopped';

    // Apply fade out if gain node exists
    if (this.gainNode && this.audioContext) {
      const currentTime = this.audioContext.currentTime;
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);
      this.gainNode.gain.linearRampToValueAtTime(0, currentTime + this.config.fadeOutDurationMs / 1000);

      // Stop after fade out
      setTimeout(() => {
        this.stopCurrentSource();
      }, this.config.fadeOutDurationMs);
    } else {
      this.stopCurrentSource();
    }

    // Emit stop event
    this.emitEvent({
      type: 'stop',
      timestamp: Date.now(),
      duration: this.playbackStartTime ? Date.now() - this.playbackStartTime : 0,
    });

    // Notify interruption engine
    const interruptionEngine = getInterruptionEngine();
    interruptionEngine.notifyTTSEnd();
  }

  /**
   * Stop current audio source
   */
  private stopCurrentSource(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (e) {
        // Ignore if already stopped
      }
      this.currentSource = null;
    }
    this.playbackStartTime = null;
  }

  /**
   * Pause audio playback
   */
  pause(): void {
    if (this.state !== 'playing') return;

    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
      this.state = 'paused';
      
      this.emitEvent({
        type: 'pause',
        timestamp: Date.now(),
      });

      this.log('Audio paused');
    }
  }

  /**
   * Resume audio playback
   */
  resume(): void {
    if (this.state !== 'paused') return;

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
      this.state = 'playing';

      this.emitEvent({
        type: 'resume',
        timestamp: Date.now(),
      });

      this.log('Audio resumed');
    }
  }

  /**
   * Clear audio queue
   */
  clearQueue(): void {
    const queueLength = this.pendingAudioQueue.length;
    this.pendingAudioQueue = [];
    this.log('Audio queue cleared', { previousLength: queueLength });
  }

  /**
   * Register callback for playback events
   */
  onPlayback(callback: PlaybackCallback): () => void {
    this.playbackCallbacks.add(callback);
    return () => {
      this.playbackCallbacks.delete(callback);
    };
  }

  /**
   * Emit event to all registered callbacks
   */
  private emitEvent(event: PlaybackEvent): void {
    this.playbackCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('[CopilotPhase2][TTS] Callback error:', error);
      }
    });
  }

  /**
   * Get current playback state
   */
  getState(): PlaybackState {
    return this.state;
  }

  /**
   * Check if currently playing
   */
  isPlaying(): boolean {
    return this.state === 'playing';
  }

  /**
   * Check if audio is queued
   */
  hasQueuedAudio(): boolean {
    return this.pendingAudioQueue.length > 0;
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.pendingAudioQueue.length;
  }

  /**
   * Update configuration
   */
  configure(config: Partial<TTSPipelineConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated', this.config);
  }

  /**
   * Preload audio context (call on user interaction)
   */
  preload(): void {
    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(console.error);
    }
    this.log('Audio context preloaded');
  }

  /**
   * Reset pipeline
   */
  reset(): void {
    this.stop();
    this.clearQueue();
    this.playbackCallbacks.clear();
    this.state = 'idle';
    this.log('Pipeline reset');
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.reset();
    if (this.audioContext) {
      this.audioContext.close().catch(console.error);
      this.audioContext = null;
    }
    this.gainNode = null;
    this.log('Pipeline cleaned up');
  }
}

// Singleton instance
let ttsPipeline: InterruptibleTTSPipelineImpl | null = null;

/**
 * Get the InterruptibleTTSPipeline singleton instance
 */
export function getInterruptibleTTSPipeline(): InterruptibleTTSPipelineImpl {
  if (!ttsPipeline) {
    ttsPipeline = new InterruptibleTTSPipelineImpl();
  }
  return ttsPipeline;
}

/**
 * Create a new InterruptibleTTSPipeline with custom config
 */
export function createInterruptibleTTSPipeline(
  config?: Partial<TTSPipelineConfig>
): InterruptibleTTSPipelineImpl {
  return new InterruptibleTTSPipelineImpl(config);
}

export default {
  getInterruptibleTTSPipeline,
  createInterruptibleTTSPipeline,
};
