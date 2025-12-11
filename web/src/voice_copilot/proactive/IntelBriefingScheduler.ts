/**
 * IntelBriefingScheduler.ts
 * 
 * Phase 5: Proactive Intelligence & Autonomous Alerting Engine
 * 
 * Purpose:
 * Provide scheduled voice briefings automatically.
 * 
 * Briefing types:
 * - Hourly intelligence summary
 * - Market open / close summary
 * - Whale activity overview
 * - Risk level shift report
 * - Constellation pattern update
 * 
 * User triggers not needed - fully autonomous.
 * 
 * Logging prefix: [IntelBriefing]
 */

import type { IntelSnapshot } from './ProactiveIntelMonitor';

// ============================================================
// Types
// ============================================================

export type BriefingType =
  | 'hourly_summary'
  | 'market_open'
  | 'market_close'
  | 'whale_overview'
  | 'risk_report'
  | 'constellation_update'
  | 'custom';

export interface ScheduledBriefing {
  id: string;
  type: BriefingType;
  name: string;
  enabled: boolean;
  intervalMs: number | null;
  scheduledTimes: string[]; // HH:MM format in UTC
  lastRunAt: number | null;
  nextRunAt: number | null;
  priority: number;
}

export interface BriefingContent {
  id: string;
  type: BriefingType;
  title: string;
  summary: string;
  details: string[];
  timestamp: number;
  duration: 'short' | 'medium' | 'long';
}

export interface BriefingSchedulerConfig {
  enableLogging: boolean;
  defaultIntervalMs: number;
  enableMarketTimeBriefings: boolean;
  marketOpenTimeUTC: string;
  marketCloseTimeUTC: string;
  timezone: string;
  maxBriefingsPerDay: number;
}

type BriefingCallback = (content: BriefingContent) => void;
type SnapshotProvider = () => IntelSnapshot | null;

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: BriefingSchedulerConfig = {
  enableLogging: true,
  defaultIntervalMs: 60 * 60 * 1000, // 1 hour
  enableMarketTimeBriefings: true,
  marketOpenTimeUTC: '14:30', // 9:30 AM EST
  marketCloseTimeUTC: '21:00', // 4:00 PM EST
  timezone: 'UTC',
  maxBriefingsPerDay: 24,
};

// ============================================================
// Default Briefings
// ============================================================

const DEFAULT_BRIEFINGS: Omit<ScheduledBriefing, 'id'>[] = [
  {
    type: 'hourly_summary',
    name: 'Hourly Intelligence Summary',
    enabled: true,
    intervalMs: 60 * 60 * 1000, // 1 hour
    scheduledTimes: [],
    lastRunAt: null,
    nextRunAt: null,
    priority: 50,
  },
  {
    type: 'market_open',
    name: 'Market Open Summary',
    enabled: true,
    intervalMs: null,
    scheduledTimes: ['14:30'], // 9:30 AM EST
    lastRunAt: null,
    nextRunAt: null,
    priority: 80,
  },
  {
    type: 'market_close',
    name: 'Market Close Summary',
    enabled: true,
    intervalMs: null,
    scheduledTimes: ['21:00'], // 4:00 PM EST
    lastRunAt: null,
    nextRunAt: null,
    priority: 80,
  },
  {
    type: 'whale_overview',
    name: 'Whale Activity Overview',
    enabled: true,
    intervalMs: 4 * 60 * 60 * 1000, // 4 hours
    scheduledTimes: [],
    lastRunAt: null,
    nextRunAt: null,
    priority: 60,
  },
  {
    type: 'risk_report',
    name: 'Risk Level Report',
    enabled: true,
    intervalMs: 2 * 60 * 60 * 1000, // 2 hours
    scheduledTimes: [],
    lastRunAt: null,
    nextRunAt: null,
    priority: 70,
  },
  {
    type: 'constellation_update',
    name: 'Constellation Pattern Update',
    enabled: false, // Disabled by default
    intervalMs: 6 * 60 * 60 * 1000, // 6 hours
    scheduledTimes: [],
    lastRunAt: null,
    nextRunAt: null,
    priority: 40,
  },
];

// ============================================================
// IntelBriefingScheduler Implementation
// ============================================================

class IntelBriefingSchedulerImpl {
  private config: BriefingSchedulerConfig;
  private briefings: Map<string, ScheduledBriefing> = new Map();
  private isRunning: boolean = false;
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private briefingCallbacks: Set<BriefingCallback> = new Set();
  private snapshotProvider: SnapshotProvider | null = null;
  private briefingsToday: number = 0;
  private dayStartTime: number = 0;
  private stats = {
    totalBriefings: 0,
    byType: {} as Record<BriefingType, number>,
    lastBriefingAt: null as number | null,
  };

  constructor(config: Partial<BriefingSchedulerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeBriefings();
    this.initializeStats();
    this.log('IntelBriefingScheduler initialized');
  }

  // ============================================================
  // Logging
  // ============================================================

  private log(message: string, data?: unknown): void {
    if (this.config.enableLogging) {
      if (data) {
        console.log(`[IntelBriefing] ${message}`, data);
      } else {
        console.log(`[IntelBriefing] ${message}`);
      }
    }
  }

  // ============================================================
  // Initialization
  // ============================================================

  private initializeBriefings(): void {
    DEFAULT_BRIEFINGS.forEach((briefing, index) => {
      const id = `briefing_${briefing.type}_${index}`;
      this.briefings.set(id, {
        ...briefing,
        id,
        nextRunAt: this.calculateNextRunTime(briefing),
      });
    });
  }

  private initializeStats(): void {
    const types: BriefingType[] = [
      'hourly_summary', 'market_open', 'market_close',
      'whale_overview', 'risk_report', 'constellation_update', 'custom',
    ];
    types.forEach(type => {
      this.stats.byType[type] = 0;
    });
    this.dayStartTime = this.getStartOfDay();
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  /**
   * Start the briefing scheduler
   */
  start(): void {
    if (this.isRunning) {
      this.log('Scheduler already running');
      return;
    }

    this.log('Starting briefing scheduler');
    this.isRunning = true;

    // Check every minute for scheduled briefings
    this.checkInterval = setInterval(() => {
      this.checkScheduledBriefings();
    }, 60000);

    // Initial check
    this.checkScheduledBriefings();
  }

  /**
   * Stop the briefing scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      this.log('Scheduler not running');
      return;
    }

    this.log('Stopping briefing scheduler');
    this.isRunning = false;

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check if scheduler is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  // ============================================================
  // Callback Registration
  // ============================================================

  /**
   * Register a briefing callback
   */
  onBriefing(callback: BriefingCallback): () => void {
    this.briefingCallbacks.add(callback);
    return () => this.briefingCallbacks.delete(callback);
  }

  /**
   * Set the snapshot provider
   */
  setSnapshotProvider(provider: SnapshotProvider): void {
    this.snapshotProvider = provider;
    this.log('Snapshot provider registered');
  }

  // ============================================================
  // Scheduling
  // ============================================================

  /**
   * Check for scheduled briefings
   */
  private checkScheduledBriefings(): void {
    const now = Date.now();
    this.updateDailyStats();

    // Check daily limit
    if (this.briefingsToday >= this.config.maxBriefingsPerDay) {
      this.log('Daily briefing limit reached');
      return;
    }

    // Check each briefing
    this.briefings.forEach((briefing, id) => {
      if (!briefing.enabled) return;
      if (!briefing.nextRunAt) return;

      if (now >= briefing.nextRunAt) {
        this.executeBriefing(briefing);
        
        // Update next run time
        briefing.lastRunAt = now;
        briefing.nextRunAt = this.calculateNextRunTime(briefing);
        this.briefings.set(id, briefing);
      }
    });
  }

  /**
   * Calculate next run time for a briefing
   */
  private calculateNextRunTime(briefing: Omit<ScheduledBriefing, 'id'> | ScheduledBriefing): number | null {
    const now = Date.now();

    // Interval-based scheduling
    if (briefing.intervalMs) {
      const lastRun = briefing.lastRunAt || now;
      return lastRun + briefing.intervalMs;
    }

    // Time-based scheduling
    if (briefing.scheduledTimes.length > 0) {
      return this.getNextScheduledTime(briefing.scheduledTimes);
    }

    return null;
  }

  /**
   * Get next scheduled time from list of times
   */
  private getNextScheduledTime(times: string[]): number {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let nextTime: number | null = null;

    for (const timeStr of times) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const scheduledTime = new Date(today);
      scheduledTime.setUTCHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (scheduledTime.getTime() <= now.getTime()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      if (!nextTime || scheduledTime.getTime() < nextTime) {
        nextTime = scheduledTime.getTime();
      }
    }

    return nextTime || Date.now() + 24 * 60 * 60 * 1000;
  }

  /**
   * Update daily statistics
   */
  private updateDailyStats(): void {
    const startOfDay = this.getStartOfDay();
    if (startOfDay > this.dayStartTime) {
      this.briefingsToday = 0;
      this.dayStartTime = startOfDay;
      this.log('Daily stats reset');
    }
  }

  /**
   * Get start of current day
   */
  private getStartOfDay(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }

  // ============================================================
  // Briefing Execution
  // ============================================================

  /**
   * Execute a briefing
   */
  private executeBriefing(briefing: ScheduledBriefing): void {
    this.log('Executing briefing:', briefing.name);

    const content = this.generateBriefingContent(briefing);
    
    if (content) {
      this.notifyCallbacks(content);
      this.stats.totalBriefings++;
      this.stats.byType[briefing.type]++;
      this.stats.lastBriefingAt = Date.now();
      this.briefingsToday++;
    }
  }

  /**
   * Generate briefing content
   */
  private generateBriefingContent(briefing: ScheduledBriefing): BriefingContent | null {
    const snapshot = this.snapshotProvider ? this.snapshotProvider() : null;

    switch (briefing.type) {
      case 'hourly_summary':
        return this.generateHourlySummary(snapshot);
      case 'market_open':
        return this.generateMarketOpenSummary(snapshot);
      case 'market_close':
        return this.generateMarketCloseSummary(snapshot);
      case 'whale_overview':
        return this.generateWhaleOverview(snapshot);
      case 'risk_report':
        return this.generateRiskReport(snapshot);
      case 'constellation_update':
        return this.generateConstellationUpdate(snapshot);
      default:
        return null;
    }
  }

  /**
   * Generate hourly intelligence summary
   */
  private generateHourlySummary(snapshot: IntelSnapshot | null): BriefingContent {
    const details: string[] = [];
    let summary = 'Here is your hourly intelligence summary.';

    if (snapshot) {
      if (snapshot.globalRisk) {
        details.push(`Global risk level is ${snapshot.globalRisk.riskLevel} with a score of ${snapshot.globalRisk.globalRiskScore}.`);
      }
      if (snapshot.whaleIntel) {
        details.push(`Whale activity is at ${snapshot.whaleIntel.alertLevel} alert level with ${snapshot.whaleIntel.activeWhales} active whales.`);
      }
      if (snapshot.marketIntel) {
        details.push(`Market trend is ${snapshot.marketIntel.trendDirection} with volatility index at ${snapshot.marketIntel.volatilityIndex.toFixed(1)}.`);
      }
      if (snapshot.manipulation) {
        details.push(`${snapshot.manipulation.activeRings} active manipulation rings detected.`);
      }

      summary = `Hourly update: Risk is ${snapshot.globalRisk?.riskLevel || 'unknown'}, market is ${snapshot.marketIntel?.trendDirection || 'neutral'}.`;
    } else {
      summary = 'Hourly intelligence summary. No current data available.';
      details.push('Intelligence data is currently unavailable.');
    }

    return {
      id: `briefing_${Date.now()}`,
      type: 'hourly_summary',
      title: 'Hourly Intelligence Summary',
      summary,
      details,
      timestamp: Date.now(),
      duration: 'medium',
    };
  }

  /**
   * Generate market open summary
   */
  private generateMarketOpenSummary(snapshot: IntelSnapshot | null): BriefingContent {
    const details: string[] = [];
    let summary = 'Good morning. Here is your market open briefing.';

    if (snapshot) {
      if (snapshot.globalRisk) {
        details.push(`Starting the day with ${snapshot.globalRisk.riskLevel} risk conditions.`);
        if (snapshot.globalRisk.topRiskFactors.length > 0) {
          details.push(`Key risk factors: ${snapshot.globalRisk.topRiskFactors.slice(0, 3).join(', ')}.`);
        }
      }
      if (snapshot.marketIntel) {
        details.push(`Market sentiment is ${snapshot.marketIntel.trendDirection}.`);
      }
      if (snapshot.whaleIntel) {
        details.push(`Overnight whale activity: ${snapshot.whaleIntel.movementChange24h > 0 ? 'increased' : 'decreased'} by ${Math.abs(snapshot.whaleIntel.movementChange24h).toFixed(1)}%.`);
      }

      summary = `Market open briefing: ${snapshot.globalRisk?.riskLevel || 'moderate'} risk, ${snapshot.marketIntel?.trendDirection || 'neutral'} sentiment.`;
    }

    return {
      id: `briefing_${Date.now()}`,
      type: 'market_open',
      title: 'Market Open Briefing',
      summary,
      details,
      timestamp: Date.now(),
      duration: 'medium',
    };
  }

  /**
   * Generate market close summary
   */
  private generateMarketCloseSummary(snapshot: IntelSnapshot | null): BriefingContent {
    const details: string[] = [];
    let summary = 'Market close briefing. Here is your end of day summary.';

    if (snapshot) {
      if (snapshot.marketIntel) {
        details.push(`Today's market trend was ${snapshot.marketIntel.trendDirection}.`);
        details.push(`24-hour volume: ${this.formatNumber(snapshot.marketIntel.volume24h)}.`);
      }
      if (snapshot.whaleIntel) {
        details.push(`Whale activity today: ${snapshot.whaleIntel.alertLevel} level.`);
      }
      if (snapshot.manipulation) {
        details.push(`${snapshot.manipulation.newRingsDetected} new manipulation patterns detected today.`);
      }
      if (snapshot.globalRisk) {
        details.push(`Closing risk level: ${snapshot.globalRisk.riskLevel}.`);
      }

      summary = `End of day: Market was ${snapshot.marketIntel?.trendDirection || 'mixed'}, closing at ${snapshot.globalRisk?.riskLevel || 'moderate'} risk.`;
    }

    return {
      id: `briefing_${Date.now()}`,
      type: 'market_close',
      title: 'Market Close Briefing',
      summary,
      details,
      timestamp: Date.now(),
      duration: 'medium',
    };
  }

  /**
   * Generate whale activity overview
   */
  private generateWhaleOverview(snapshot: IntelSnapshot | null): BriefingContent {
    const details: string[] = [];
    let summary = 'Whale activity overview.';

    if (snapshot?.whaleIntel) {
      const whale = snapshot.whaleIntel;
      summary = `Whale alert level is ${whale.alertLevel}. ${whale.activeWhales} whales are currently active.`;
      
      details.push(`Total tracked whales: ${whale.totalWhales}.`);
      details.push(`Active whales: ${whale.activeWhales}.`);
      details.push(`Movement volume: ${this.formatNumber(whale.movementVolume)}.`);
      details.push(`24-hour change: ${whale.movementChange24h > 0 ? '+' : ''}${whale.movementChange24h.toFixed(1)}%.`);
      
      if (whale.topMovers.length > 0) {
        details.push(`Top movers: ${whale.topMovers.slice(0, 3).join(', ')}.`);
      }
    } else {
      summary = 'Whale activity data is currently unavailable.';
    }

    return {
      id: `briefing_${Date.now()}`,
      type: 'whale_overview',
      title: 'Whale Activity Overview',
      summary,
      details,
      timestamp: Date.now(),
      duration: 'short',
    };
  }

  /**
   * Generate risk level report
   */
  private generateRiskReport(snapshot: IntelSnapshot | null): BriefingContent {
    const details: string[] = [];
    let summary = 'Risk level report.';

    if (snapshot?.globalRisk) {
      const risk = snapshot.globalRisk;
      summary = `Current global risk level is ${risk.riskLevel} with a score of ${risk.globalRiskScore}.`;
      
      details.push(`Risk score: ${risk.globalRiskScore}/100.`);
      details.push(`24-hour change: ${risk.riskChange24h > 0 ? '+' : ''}${risk.riskChange24h.toFixed(1)}%.`);
      details.push(`Market sentiment: ${risk.marketSentiment > 0 ? 'positive' : risk.marketSentiment < 0 ? 'negative' : 'neutral'}.`);
      
      if (risk.topRiskFactors.length > 0) {
        details.push(`Top risk factors: ${risk.topRiskFactors.join(', ')}.`);
      }
    } else {
      summary = 'Risk data is currently unavailable.';
    }

    return {
      id: `briefing_${Date.now()}`,
      type: 'risk_report',
      title: 'Risk Level Report',
      summary,
      details,
      timestamp: Date.now(),
      duration: 'short',
    };
  }

  /**
   * Generate constellation pattern update
   */
  private generateConstellationUpdate(snapshot: IntelSnapshot | null): BriefingContent {
    const details: string[] = [];
    let summary = 'Constellation pattern update.';

    if (snapshot?.constellation) {
      const constellation = snapshot.constellation;
      summary = `Constellation shows ${constellation.activeClusters} active clusters with ${(constellation.anomalyScore * 100).toFixed(0)}% anomaly score.`;
      
      details.push(`Total clusters: ${constellation.totalClusters}.`);
      details.push(`Active clusters: ${constellation.activeClusters}.`);
      details.push(`Cluster expansion rate: ${constellation.clusterExpansionRate.toFixed(2)}.`);
      details.push(`Graph density: ${(constellation.graphDensity * 100).toFixed(1)}%.`);
      details.push(`Anomaly score: ${(constellation.anomalyScore * 100).toFixed(0)}%.`);
    } else {
      summary = 'Constellation data is currently unavailable.';
    }

    return {
      id: `briefing_${Date.now()}`,
      type: 'constellation_update',
      title: 'Constellation Pattern Update',
      summary,
      details,
      timestamp: Date.now(),
      duration: 'short',
    };
  }

  // ============================================================
  // Utility Methods
  // ============================================================

  /**
   * Format large numbers
   */
  private formatNumber(num: number): string {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  }

  /**
   * Notify all callbacks
   */
  private notifyCallbacks(content: BriefingContent): void {
    this.briefingCallbacks.forEach(callback => {
      try {
        callback(content);
      } catch (error) {
        this.log('Callback error:', error);
      }
    });
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get all briefings
   */
  getBriefings(): ScheduledBriefing[] {
    return Array.from(this.briefings.values());
  }

  /**
   * Get a specific briefing
   */
  getBriefing(id: string): ScheduledBriefing | undefined {
    return this.briefings.get(id);
  }

  /**
   * Enable a briefing
   */
  enableBriefing(id: string): boolean {
    const briefing = this.briefings.get(id);
    if (briefing) {
      briefing.enabled = true;
      briefing.nextRunAt = this.calculateNextRunTime(briefing);
      this.briefings.set(id, briefing);
      this.log('Briefing enabled:', id);
      return true;
    }
    return false;
  }

  /**
   * Disable a briefing
   */
  disableBriefing(id: string): boolean {
    const briefing = this.briefings.get(id);
    if (briefing) {
      briefing.enabled = false;
      this.briefings.set(id, briefing);
      this.log('Briefing disabled:', id);
      return true;
    }
    return false;
  }

  /**
   * Update briefing interval
   */
  updateBriefingInterval(id: string, intervalMs: number): boolean {
    const briefing = this.briefings.get(id);
    if (briefing) {
      briefing.intervalMs = intervalMs;
      briefing.nextRunAt = this.calculateNextRunTime(briefing);
      this.briefings.set(id, briefing);
      this.log('Briefing interval updated:', { id, intervalMs });
      return true;
    }
    return false;
  }

  /**
   * Trigger a briefing manually
   */
  triggerBriefing(type: BriefingType): BriefingContent | null {
    const briefing = Array.from(this.briefings.values()).find(b => b.type === type);
    if (briefing) {
      const content = this.generateBriefingContent(briefing);
      if (content) {
        this.notifyCallbacks(content);
        this.stats.totalBriefings++;
        this.stats.byType[type]++;
        this.stats.lastBriefingAt = Date.now();
        return content;
      }
    }
    return null;
  }

  /**
   * Get statistics
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<BriefingSchedulerConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.initializeStats();
    this.stats.totalBriefings = 0;
    this.stats.lastBriefingAt = null;
    this.log('Statistics reset');
  }

  /**
   * Add custom briefing
   */
  addCustomBriefing(
    name: string,
    intervalMs: number,
    generator: () => BriefingContent
  ): string {
    const id = `briefing_custom_${Date.now()}`;
    const briefing: ScheduledBriefing = {
      id,
      type: 'custom',
      name,
      enabled: true,
      intervalMs,
      scheduledTimes: [],
      lastRunAt: null,
      nextRunAt: Date.now() + intervalMs,
      priority: 30,
    };
    
    this.briefings.set(id, briefing);
    this.log('Custom briefing added:', id);
    return id;
  }

  /**
   * Remove a briefing
   */
  removeBriefing(id: string): boolean {
    if (this.briefings.has(id)) {
      this.briefings.delete(id);
      this.log('Briefing removed:', id);
      return true;
    }
    return false;
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let intelBriefingScheduler: IntelBriefingSchedulerImpl | null = null;

/**
 * Get the IntelBriefingScheduler singleton instance
 */
export function getIntelBriefingScheduler(): IntelBriefingSchedulerImpl {
  if (!intelBriefingScheduler) {
    intelBriefingScheduler = new IntelBriefingSchedulerImpl();
  }
  return intelBriefingScheduler;
}

/**
 * Create a new IntelBriefingScheduler instance
 */
export function createIntelBriefingScheduler(
  config?: Partial<BriefingSchedulerConfig>
): IntelBriefingSchedulerImpl {
  return new IntelBriefingSchedulerImpl(config);
}

export default {
  getIntelBriefingScheduler,
  createIntelBriefingScheduler,
};
