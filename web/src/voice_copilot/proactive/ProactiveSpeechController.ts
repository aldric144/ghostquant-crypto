/**
 * ProactiveSpeechController.ts
 * 
 * Phase 5: Proactive Intelligence & Autonomous Alerting Engine
 * 
 * Responsibilities:
 * - Speak alerts using the InterruptibleTTSPipeline
 * - Queue events to avoid overlapping speech
 * - Rate-limit alerts to prevent spam
 * - Ensure alert speech does NOT interfere with wake-loop engine
 * - Wait if user is speaking
 * 
 * Logging prefix: [ProactiveSpeech]
 */

import type { ProactiveResponse } from './ProactiveResponseEngine';
import type { SeverityLevel } from './IntelEventClassifier';

// ============================================================
// Types
// ============================================================

export interface SpeechQueueItem {
  id: string;
  response: ProactiveResponse;
  text: string;
  priority: number;
  addedAt: number;
  expiresAt: number;
  attempts: number;
}

export interface SpeechControllerConfig {
  enableLogging: boolean;
  minAlertIntervalMs: number;
  maxAlertsPerHour: number;
  criticalBypassRateLimit: boolean;
  queueMaxSize: number;
  itemTTLMs: number;
  maxRetries: number;
  userSpeakingCheckIntervalMs: number;
  priorityBySeverity: Record<SeverityLevel, number>;
}

export type SpeechControllerState = 
  | 'idle'
  | 'speaking'
  | 'waiting_for_user'
  | 'rate_limited'
  | 'paused';

export interface SpeechStats {
  totalSpoken: number;
  totalQueued: number;
  totalDropped: number;
  rateLimitedCount: number;
  bySeverity: Record<SeverityLevel, number>;
  lastSpokenAt: number | null;
  alertsThisHour: number;
  hourStartTime: number;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: SpeechControllerConfig = {
  enableLogging: true,
  minAlertIntervalMs: 15000, // 15 seconds between alerts
  maxAlertsPerHour: 5,
  criticalBypassRateLimit: true,
  queueMaxSize: 10,
  itemTTLMs: 120000, // 2 minutes
  maxRetries: 2,
  userSpeakingCheckIntervalMs: 500,
  priorityBySeverity: {
    low: 10,
    medium: 30,
    high: 60,
    critical: 100,
  },
};

// ============================================================
// ProactiveSpeechController Implementation
// ============================================================

class ProactiveSpeechControllerImpl {
  private config: SpeechControllerConfig;
  private state: SpeechControllerState = 'idle';
  private queue: SpeechQueueItem[] = [];
  private isUserSpeaking: boolean = false;
  private isTTSSpeaking: boolean = false;
  private processQueueInterval: ReturnType<typeof setInterval> | null = null;
  private stats: SpeechStats = {
    totalSpoken: 0,
    totalQueued: 0,
    totalDropped: 0,
    rateLimitedCount: 0,
    bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
    lastSpokenAt: null,
    alertsThisHour: 0,
    hourStartTime: Date.now(),
  };

  // External callbacks
  private speakCallback: ((text: string) => Promise<void>) | null = null;
  private isUserSpeakingCallback: (() => boolean) | null = null;
  private isTTSSpeakingCallback: (() => boolean) | null = null;
  private stopTTSCallback: (() => void) | null = null;

  constructor(config: Partial<SpeechControllerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.log('ProactiveSpeechController initialized');
  }

  // ============================================================
  // Logging
  // ============================================================

  private log(message: string, data?: unknown): void {
    if (this.config.enableLogging) {
      if (data) {
        console.log(`[ProactiveSpeech] ${message}`, data);
      } else {
        console.log(`[ProactiveSpeech] ${message}`);
      }
    }
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  /**
   * Start the speech controller
   */
  start(): void {
    if (this.processQueueInterval) {
      this.log('Controller already running');
      return;
    }

    this.log('Starting speech controller');
    this.state = 'idle';

    // Start queue processing
    this.processQueueInterval = setInterval(() => {
      this.processQueue();
    }, 1000);
  }

  /**
   * Stop the speech controller
   */
  stop(): void {
    this.log('Stopping speech controller');
    
    if (this.processQueueInterval) {
      clearInterval(this.processQueueInterval);
      this.processQueueInterval = null;
    }

    this.state = 'paused';
  }

  /**
   * Pause the speech controller
   */
  pause(): void {
    this.log('Pausing speech controller');
    this.state = 'paused';
  }

  /**
   * Resume the speech controller
   */
  resume(): void {
    this.log('Resuming speech controller');
    if (this.state === 'paused') {
      this.state = 'idle';
    }
  }

  // ============================================================
  // Callback Registration
  // ============================================================

  /**
   * Set the speak callback (uses TTS pipeline)
   */
  setSpeakCallback(callback: (text: string) => Promise<void>): void {
    this.speakCallback = callback;
    this.log('Speak callback registered');
  }

  /**
   * Set the user speaking check callback
   */
  setUserSpeakingCallback(callback: () => boolean): void {
    this.isUserSpeakingCallback = callback;
    this.log('User speaking callback registered');
  }

  /**
   * Set the TTS speaking check callback
   */
  setTTSSpeakingCallback(callback: () => boolean): void {
    this.isTTSSpeakingCallback = callback;
    this.log('TTS speaking callback registered');
  }

  /**
   * Set the stop TTS callback
   */
  setStopTTSCallback(callback: () => void): void {
    this.stopTTSCallback = callback;
    this.log('Stop TTS callback registered');
  }

  // ============================================================
  // Queue Management
  // ============================================================

  /**
   * Queue a proactive response for speaking
   */
  queueResponse(response: ProactiveResponse): boolean {
    // Check if paused
    if (this.state === 'paused') {
      this.log('Controller paused, dropping response');
      this.stats.totalDropped++;
      return false;
    }

    // Check queue size
    if (this.queue.length >= this.config.queueMaxSize) {
      this.log('Queue full, dropping lowest priority item');
      this.dropLowestPriority();
    }

    // Check rate limiting
    if (!this.canSpeak(response.severity)) {
      this.log('Rate limited, dropping response');
      this.stats.rateLimitedCount++;
      this.stats.totalDropped++;
      return false;
    }

    // Create queue item
    const item: SpeechQueueItem = {
      id: `speech_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      response,
      text: response.selectedResponse,
      priority: this.config.priorityBySeverity[response.severity],
      addedAt: Date.now(),
      expiresAt: Date.now() + this.config.itemTTLMs,
      attempts: 0,
    };

    // Add to queue
    this.queue.push(item);
    this.queue.sort((a, b) => b.priority - a.priority);
    
    this.stats.totalQueued++;
    this.log('Response queued:', { id: item.id, priority: item.priority });

    return true;
  }

  /**
   * Queue text directly for speaking
   */
  queueText(text: string, severity: SeverityLevel = 'medium'): boolean {
    const mockResponse: ProactiveResponse = {
      eventId: `direct_${Date.now()}`,
      category: 'GLOBAL_RISK_LEVEL_CHANGE',
      severity,
      shortResponse: text,
      mediumResponse: text,
      detailedResponse: text,
      selectedResponse: text,
      selectedLength: 'medium',
      followUpQuestion: null,
      timestamp: Date.now(),
    };

    return this.queueResponse(mockResponse);
  }

  /**
   * Drop the lowest priority item from queue
   */
  private dropLowestPriority(): void {
    if (this.queue.length === 0) return;

    // Find lowest priority item
    let lowestIndex = 0;
    let lowestPriority = this.queue[0].priority;

    for (let i = 1; i < this.queue.length; i++) {
      if (this.queue[i].priority < lowestPriority) {
        lowestPriority = this.queue[i].priority;
        lowestIndex = i;
      }
    }

    this.queue.splice(lowestIndex, 1);
    this.stats.totalDropped++;
    this.log('Dropped lowest priority item');
  }

  /**
   * Clear the queue
   */
  clearQueue(): void {
    const count = this.queue.length;
    this.queue = [];
    this.log(`Cleared ${count} items from queue`);
  }

  // ============================================================
  // Rate Limiting
  // ============================================================

  /**
   * Check if we can speak based on rate limits
   */
  private canSpeak(severity: SeverityLevel): boolean {
    // Critical alerts can bypass rate limiting if configured
    if (severity === 'critical' && this.config.criticalBypassRateLimit) {
      return true;
    }

    // Check hourly limit
    this.updateHourlyStats();
    if (this.stats.alertsThisHour >= this.config.maxAlertsPerHour) {
      this.log('Hourly alert limit reached');
      return false;
    }

    // Check minimum interval
    if (this.stats.lastSpokenAt) {
      const timeSinceLastSpeak = Date.now() - this.stats.lastSpokenAt;
      if (timeSinceLastSpeak < this.config.minAlertIntervalMs) {
        this.log('Minimum interval not met');
        return false;
      }
    }

    return true;
  }

  /**
   * Update hourly statistics
   */
  private updateHourlyStats(): void {
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;

    if (now - this.stats.hourStartTime >= hourMs) {
      this.stats.alertsThisHour = 0;
      this.stats.hourStartTime = now;
      this.log('Hourly stats reset');
    }
  }

  // ============================================================
  // Queue Processing
  // ============================================================

  /**
   * Process the speech queue
   */
  private async processQueue(): Promise<void> {
    // Skip if paused
    if (this.state === 'paused') return;

    // Skip if already speaking
    if (this.state === 'speaking') return;

    // Skip if TTS is currently speaking
    if (this.isTTSSpeakingCallback && this.isTTSSpeakingCallback()) {
      this.state = 'waiting_for_user';
      return;
    }

    // Skip if user is speaking
    if (this.isUserSpeakingCallback && this.isUserSpeakingCallback()) {
      this.state = 'waiting_for_user';
      return;
    }

    // Remove expired items
    this.pruneExpiredItems();

    // Get next item
    const item = this.queue.shift();
    if (!item) {
      this.state = 'idle';
      return;
    }

    // Speak the item
    await this.speakItem(item);
  }

  /**
   * Speak a queue item
   */
  private async speakItem(item: SpeechQueueItem): Promise<void> {
    if (!this.speakCallback) {
      this.log('No speak callback registered, dropping item');
      this.stats.totalDropped++;
      return;
    }

    this.state = 'speaking';
    item.attempts++;

    try {
      this.log('Speaking:', item.text.substring(0, 50) + '...');
      await this.speakCallback(item.text);

      // Update stats
      this.stats.totalSpoken++;
      this.stats.bySeverity[item.response.severity]++;
      this.stats.lastSpokenAt = Date.now();
      this.stats.alertsThisHour++;

      this.log('Speech completed');
    } catch (error) {
      this.log('Speech failed:', error);

      // Retry if attempts remaining
      if (item.attempts < this.config.maxRetries) {
        this.log('Requeueing for retry');
        this.queue.unshift(item);
      } else {
        this.log('Max retries reached, dropping item');
        this.stats.totalDropped++;
      }
    } finally {
      this.state = 'idle';
    }
  }

  /**
   * Remove expired items from queue
   */
  private pruneExpiredItems(): void {
    const now = Date.now();
    const before = this.queue.length;
    
    this.queue = this.queue.filter(item => item.expiresAt > now);
    
    const removed = before - this.queue.length;
    if (removed > 0) {
      this.stats.totalDropped += removed;
      this.log(`Pruned ${removed} expired items`);
    }
  }

  // ============================================================
  // External State Updates
  // ============================================================

  /**
   * Notify that user started speaking
   */
  notifyUserSpeakingStart(): void {
    this.isUserSpeaking = true;
    this.log('User started speaking');

    // Stop TTS if speaking
    if (this.state === 'speaking' && this.stopTTSCallback) {
      this.log('Stopping TTS due to user speech');
      this.stopTTSCallback();
    }
  }

  /**
   * Notify that user stopped speaking
   */
  notifyUserSpeakingEnd(): void {
    this.isUserSpeaking = false;
    this.log('User stopped speaking');
  }

  /**
   * Notify that TTS started speaking
   */
  notifyTTSSpeakingStart(): void {
    this.isTTSSpeaking = true;
  }

  /**
   * Notify that TTS stopped speaking
   */
  notifyTTSSpeakingEnd(): void {
    this.isTTSSpeaking = false;
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get current state
   */
  getState(): SpeechControllerState {
    return this.state;
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Get queue items
   */
  getQueue(): SpeechQueueItem[] {
    return [...this.queue];
  }

  /**
   * Get statistics
   */
  getStats(): SpeechStats {
    this.updateHourlyStats();
    return { ...this.stats };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SpeechControllerConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalSpoken: 0,
      totalQueued: 0,
      totalDropped: 0,
      rateLimitedCount: 0,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      lastSpokenAt: null,
      alertsThisHour: 0,
      hourStartTime: Date.now(),
    };
    this.log('Statistics reset');
  }

  /**
   * Check if controller is active
   */
  isActive(): boolean {
    return this.processQueueInterval !== null && this.state !== 'paused';
  }

  /**
   * Speak immediately (bypasses queue)
   */
  async speakImmediate(text: string): Promise<boolean> {
    if (!this.speakCallback) {
      this.log('No speak callback registered');
      return false;
    }

    // Wait for user to stop speaking
    if (this.isUserSpeakingCallback && this.isUserSpeakingCallback()) {
      this.log('User is speaking, waiting...');
      await this.waitForUserToStopSpeaking();
    }

    try {
      this.state = 'speaking';
      await this.speakCallback(text);
      this.stats.totalSpoken++;
      this.stats.lastSpokenAt = Date.now();
      return true;
    } catch (error) {
      this.log('Immediate speech failed:', error);
      return false;
    } finally {
      this.state = 'idle';
    }
  }

  /**
   * Wait for user to stop speaking
   */
  private async waitForUserToStopSpeaking(): Promise<void> {
    const maxWaitMs = 10000; // 10 seconds max
    const startTime = Date.now();

    while (this.isUserSpeakingCallback && this.isUserSpeakingCallback()) {
      if (Date.now() - startTime > maxWaitMs) {
        this.log('Timeout waiting for user to stop speaking');
        break;
      }
      await this.delay(this.config.userSpeakingCheckIntervalMs);
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let proactiveSpeechController: ProactiveSpeechControllerImpl | null = null;

/**
 * Get the ProactiveSpeechController singleton instance
 */
export function getProactiveSpeechController(): ProactiveSpeechControllerImpl {
  if (!proactiveSpeechController) {
    proactiveSpeechController = new ProactiveSpeechControllerImpl();
  }
  return proactiveSpeechController;
}

/**
 * Create a new ProactiveSpeechController instance
 */
export function createProactiveSpeechController(
  config?: Partial<SpeechControllerConfig>
): ProactiveSpeechControllerImpl {
  return new ProactiveSpeechControllerImpl(config);
}

export default {
  getProactiveSpeechController,
  createProactiveSpeechController,
};
