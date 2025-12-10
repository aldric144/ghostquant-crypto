/**
 * SilenceDetector.ts - Silence detection for mic management
 * 
 * Prevents stuck-open microphone:
 * - Close stream after configurable silence timeout
 * - Restart listening loop automatically
 */

export interface SilenceDetectorConfig {
  silenceThreshold: number; // Audio level below which is considered silence (0-1)
  silenceTimeout: number; // ms of silence before triggering callback
  checkInterval: number; // ms between audio level checks
  autoRestart: boolean; // Automatically restart listening after silence
  restartDelay: number; // ms delay before restarting
}

export interface SilenceDetectorEvents {
  onSilenceStart?: () => void;
  onSilenceEnd?: () => void;
  onSilenceTimeout?: () => void;
  onAudioLevel?: (level: number) => void;
  onRestart?: () => void;
}

const DEFAULT_CONFIG: SilenceDetectorConfig = {
  silenceThreshold: 0.02,
  silenceTimeout: 2000, // 2 seconds
  checkInterval: 100, // 100ms
  autoRestart: true,
  restartDelay: 500, // 500ms
};

class SilenceDetectorImpl {
  private config: SilenceDetectorConfig;
  private events: SilenceDetectorEvents = {};
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private checkIntervalId: NodeJS.Timeout | null = null;
  private silenceTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private isSilent: boolean = false;
  private lastAudioLevel: number = 0;
  private silenceStartTime: number | null = null;

  constructor(config: Partial<SilenceDetectorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('[SilenceDetector] Initialized with config:', this.config);
  }

  /**
   * Configure the silence detector
   */
  configure(config: Partial<SilenceDetectorConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[SilenceDetector] Configuration updated:', this.config);
  }

  /**
   * Set event handlers
   */
  setEvents(events: SilenceDetectorEvents): void {
    this.events = { ...this.events, ...events };
  }

  /**
   * Start silence detection
   */
  async start(): Promise<boolean> {
    if (this.isRunning) {
      console.log('[SilenceDetector] Already running');
      return true;
    }

    try {
      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context and analyser
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      // Connect microphone to analyser
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);
      
      // Start checking audio levels
      this.isRunning = true;
      this.startChecking();
      
      console.log('[SilenceDetector] Started');
      return true;
    } catch (error) {
      console.error('[SilenceDetector] Error starting:', error);
      return false;
    }
  }

  /**
   * Stop silence detection
   */
  stop(): void {
    this.isRunning = false;
    
    // Stop checking interval
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
    
    // Clear silence timer
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    
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
    
    this.analyser = null;
    this.isSilent = false;
    this.silenceStartTime = null;
    
    console.log('[SilenceDetector] Stopped');
  }

  /**
   * Start checking audio levels
   */
  private startChecking(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
    }

    this.checkIntervalId = setInterval(() => {
      this.checkAudioLevel();
    }, this.config.checkInterval);
  }

  /**
   * Check current audio level
   */
  private checkAudioLevel(): void {
    if (!this.analyser || !this.isRunning) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate average audio level (normalized to 0-1)
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength / 255;
    
    this.lastAudioLevel = average;
    this.events.onAudioLevel?.(average);

    // Check if silent
    if (average < this.config.silenceThreshold) {
      this.handleSilence();
    } else {
      this.handleSound();
    }
  }

  /**
   * Handle silence detection
   */
  private handleSilence(): void {
    if (!this.isSilent) {
      // Silence just started
      this.isSilent = true;
      this.silenceStartTime = Date.now();
      this.events.onSilenceStart?.();
      console.log('[SilenceDetector] Silence started');
      
      // Start silence timeout timer
      this.startSilenceTimer();
    }
  }

  /**
   * Handle sound detection
   */
  private handleSound(): void {
    if (this.isSilent) {
      // Sound detected after silence
      this.isSilent = false;
      this.silenceStartTime = null;
      this.events.onSilenceEnd?.();
      console.log('[SilenceDetector] Silence ended');
      
      // Cancel silence timeout timer
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
    }
  }

  /**
   * Start silence timeout timer
   */
  private startSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }

    this.silenceTimer = setTimeout(() => {
      if (this.isSilent && this.isRunning) {
        console.log('[SilenceDetector] Silence timeout reached');
        this.events.onSilenceTimeout?.();
        
        // Auto-restart if configured
        if (this.config.autoRestart) {
          this.scheduleRestart();
        }
      }
    }, this.config.silenceTimeout);
  }

  /**
   * Schedule a restart after silence timeout
   */
  private scheduleRestart(): void {
    setTimeout(() => {
      if (this.isRunning) {
        console.log('[SilenceDetector] Auto-restarting listening');
        this.events.onRestart?.();
        
        // Dispatch event for conversation loop to handle
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ghostquant:silence:restart'));
        }
      }
    }, this.config.restartDelay);
  }

  /**
   * Get current audio level
   */
  getAudioLevel(): number {
    return this.lastAudioLevel;
  }

  /**
   * Check if currently silent
   */
  isSilentNow(): boolean {
    return this.isSilent;
  }

  /**
   * Get silence duration in ms
   */
  getSilenceDuration(): number {
    if (!this.isSilent || !this.silenceStartTime) return 0;
    return Date.now() - this.silenceStartTime;
  }

  /**
   * Check if running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Reset silence detection
   */
  reset(): void {
    this.isSilent = false;
    this.silenceStartTime = null;
    
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    
    console.log('[SilenceDetector] Reset');
  }

  /**
   * Update silence threshold dynamically
   */
  setSilenceThreshold(threshold: number): void {
    this.config.silenceThreshold = Math.max(0, Math.min(1, threshold));
    console.log('[SilenceDetector] Threshold updated to:', this.config.silenceThreshold);
  }

  /**
   * Update silence timeout dynamically
   */
  setSilenceTimeout(timeout: number): void {
    this.config.silenceTimeout = Math.max(500, timeout);
    console.log('[SilenceDetector] Timeout updated to:', this.config.silenceTimeout);
  }
}

// Singleton instance
let silenceDetector: SilenceDetectorImpl | null = null;

/**
 * Get the SilenceDetector singleton instance
 */
export function getSilenceDetector(): SilenceDetectorImpl {
  if (!silenceDetector) {
    silenceDetector = new SilenceDetectorImpl();
  }
  return silenceDetector;
}

/**
 * Create a new SilenceDetector with custom config
 */
export function createSilenceDetector(config?: Partial<SilenceDetectorConfig>): SilenceDetectorImpl {
  return new SilenceDetectorImpl(config);
}

export default {
  getSilenceDetector,
  createSilenceDetector,
};
