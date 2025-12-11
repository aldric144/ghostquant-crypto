/**
 * Phase 7: Autonomous Market Watchdog
 * MODULE 6 - AutonomousAlertRouter.ts
 * 
 * Routes alerts into 3 priority types:
 * - High Priority (RED) - immediate threats
 * - Medium Priority (YELLOW) - emerging patterns
 * - Low Priority (BLUE) - informational
 * 
 * Manages throttling:
 * - Max 1 alert every 10 seconds
 * - Max 10 alerts per hour
 * - Ensures no repeated alerts for same danger
 * 
 * This module is 100% isolated and additive - no modifications to existing code.
 */

// ============================================================
// Types and Interfaces
// ============================================================

export type AlertPriority = 'high' | 'medium' | 'low';

export type AlertColor = 'red' | 'yellow' | 'blue';

export type AlertSource = 
  | 'pressure_scanner'
  | 'anomaly_detection'
  | 'liquidity_fragility'
  | 'manipulation_detector'
  | 'entity_escalation'
  | 'watchdog_orchestrator';

export type AlertCategory = 
  | 'immediate_threat'
  | 'emerging_pattern'
  | 'informational'
  | 'warning'
  | 'danger'
  | 'critical';

export interface WatchdogAlert {
  id: string;
  source: AlertSource;
  priority: AlertPriority;
  color: AlertColor;
  category: AlertCategory;
  title: string;
  message: string;
  narrative: string;
  suggestedAction: string;
  confidence: number;
  severity: number;  // 0-100
  metadata: Record<string, unknown>;
  timestamp: number;
  expiresAt: number;
  acknowledged: boolean;
  spoken: boolean;
  displayed: boolean;
}

export interface IncomingAlert {
  source: AlertSource;
  title: string;
  message: string;
  narrative?: string;
  suggestedAction?: string;
  confidence: number;
  severity: number;
  metadata?: Record<string, unknown>;
}

export interface ThrottleState {
  lastAlertTime: number;
  alertsThisHour: number;
  hourStartTime: number;
  recentAlertHashes: Set<string>;
}

export interface AlertRouterConfig {
  minAlertIntervalMs: number;      // Minimum time between alerts
  maxAlertsPerHour: number;        // Maximum alerts per hour
  alertTTLMs: number;              // How long alerts stay active
  duplicateWindowMs: number;       // Window for duplicate detection
  severityThresholds: {
    high: number;    // Severity >= this is high priority
    medium: number;  // Severity >= this is medium priority
  };
  enableLogging: boolean;
  logPrefix: string;
  maxActiveAlerts: number;
  maxHistorySize: number;
}

export interface AlertDelivery {
  alert: WatchdogAlert;
  shouldSpeak: boolean;
  shouldDisplay: boolean;
  shouldNotify: boolean;
  deliveryDelay: number;
}

export interface AlertStats {
  totalAlertsReceived: number;
  totalAlertsRouted: number;
  alertsThrottled: number;
  alertsDeduplicated: number;
  alertsByPriority: Record<AlertPriority, number>;
  alertsBySource: Record<AlertSource, number>;
  lastAlertTime: number;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: AlertRouterConfig = {
  minAlertIntervalMs: 10000,       // 10 seconds
  maxAlertsPerHour: 10,            // 10 alerts per hour
  alertTTLMs: 300000,              // 5 minutes
  duplicateWindowMs: 60000,        // 1 minute
  severityThresholds: {
    high: 75,
    medium: 50,
  },
  enableLogging: true,
  logPrefix: '[AutonomousAlertRouter]',
  maxActiveAlerts: 50,
  maxHistorySize: 200,
};

// ============================================================
// AutonomousAlertRouter Implementation
// ============================================================

class AutonomousAlertRouterImpl {
  private config: AlertRouterConfig;
  private activeAlerts: Map<string, WatchdogAlert> = new Map();
  private alertHistory: WatchdogAlert[] = [];
  private alertQueue: WatchdogAlert[] = [];
  private throttleState: ThrottleState;
  private alertCounter = 0;
  private listeners: Array<(delivery: AlertDelivery) => void> = [];
  private processingInterval: NodeJS.Timeout | null = null;
  
  private stats: AlertStats = {
    totalAlertsReceived: 0,
    totalAlertsRouted: 0,
    alertsThrottled: 0,
    alertsDeduplicated: 0,
    alertsByPriority: { high: 0, medium: 0, low: 0 },
    alertsBySource: {} as Record<AlertSource, number>,
    lastAlertTime: 0,
  };

  constructor(config?: Partial<AlertRouterConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.throttleState = {
      lastAlertTime: 0,
      alertsThisHour: 0,
      hourStartTime: Date.now(),
      recentAlertHashes: new Set(),
    };
    this.initializeStats();
    this.log('AutonomousAlertRouter initialized');
  }

  private initializeStats(): void {
    const sources: AlertSource[] = [
      'pressure_scanner', 'anomaly_detection', 'liquidity_fragility',
      'manipulation_detector', 'entity_escalation', 'watchdog_orchestrator'
    ];
    for (const source of sources) {
      this.stats.alertsBySource[source] = 0;
    }
  }

  private log(message: string, data?: unknown): void {
    if (this.config.enableLogging) {
      if (data !== undefined) {
        console.log(`${this.config.logPrefix} ${message}`, data);
      } else {
        console.log(`${this.config.logPrefix} ${message}`);
      }
    }
  }

  // ============================================================
  // Alert Routing
  // ============================================================

  /**
   * Route an incoming alert
   */
  route(incoming: IncomingAlert): AlertDelivery | null {
    this.stats.totalAlertsReceived++;
    
    // Clean up expired alerts and reset hourly counter if needed
    this.cleanup();
    
    // Check for duplicate
    if (this.isDuplicate(incoming)) {
      this.stats.alertsDeduplicated++;
      this.log('Alert deduplicated', { title: incoming.title });
      return null;
    }
    
    // Check throttle
    if (this.isThrottled()) {
      this.stats.alertsThrottled++;
      this.log('Alert throttled', { title: incoming.title });
      
      // Queue high-severity alerts even when throttled
      if (incoming.severity >= this.config.severityThresholds.high) {
        const alert = this.createAlert(incoming);
        this.alertQueue.push(alert);
        this.log('High-severity alert queued');
      }
      
      return null;
    }
    
    // Create and route alert
    const alert = this.createAlert(incoming);
    const delivery = this.processAlert(alert);
    
    return delivery;
  }

  /**
   * Route multiple alerts at once
   */
  routeMultiple(alerts: IncomingAlert[]): AlertDelivery[] {
    const deliveries: AlertDelivery[] = [];
    
    // Sort by severity (highest first)
    const sorted = [...alerts].sort((a, b) => b.severity - a.severity);
    
    for (const alert of sorted) {
      const delivery = this.route(alert);
      if (delivery) {
        deliveries.push(delivery);
      }
    }
    
    return deliveries;
  }

  /**
   * Process a single alert
   */
  private processAlert(alert: WatchdogAlert): AlertDelivery {
    // Add to active alerts
    this.activeAlerts.set(alert.id, alert);
    
    // Add to history
    this.alertHistory.push(alert);
    if (this.alertHistory.length > this.config.maxHistorySize) {
      this.alertHistory.shift();
    }
    
    // Update throttle state
    this.throttleState.lastAlertTime = Date.now();
    this.throttleState.alertsThisHour++;
    this.throttleState.recentAlertHashes.add(this.getAlertHash(alert));
    
    // Update stats
    this.stats.totalAlertsRouted++;
    this.stats.alertsByPriority[alert.priority]++;
    this.stats.alertsBySource[alert.source]++;
    this.stats.lastAlertTime = alert.timestamp;
    
    // Create delivery
    const delivery = this.createDelivery(alert);
    
    // Notify listeners
    this.notifyListeners(delivery);
    
    this.log(`Alert routed: ${alert.priority.toUpperCase()} - ${alert.title}`);
    
    return delivery;
  }

  /**
   * Create a WatchdogAlert from incoming data
   */
  private createAlert(incoming: IncomingAlert): WatchdogAlert {
    this.alertCounter++;
    const now = Date.now();
    
    const priority = this.determinePriority(incoming.severity);
    const color = this.getColorForPriority(priority);
    const category = this.determineCategory(incoming.severity, priority);
    
    return {
      id: `alert_${now}_${this.alertCounter}`,
      source: incoming.source,
      priority,
      color,
      category,
      title: incoming.title,
      message: incoming.message,
      narrative: incoming.narrative || this.generateNarrative(incoming),
      suggestedAction: incoming.suggestedAction || this.generateSuggestedAction(priority),
      confidence: incoming.confidence,
      severity: incoming.severity,
      metadata: incoming.metadata || {},
      timestamp: now,
      expiresAt: now + this.config.alertTTLMs,
      acknowledged: false,
      spoken: false,
      displayed: false,
    };
  }

  /**
   * Create delivery instructions for an alert
   */
  private createDelivery(alert: WatchdogAlert): AlertDelivery {
    // High priority: speak immediately, display prominently
    // Medium priority: display, speak if recent
    // Low priority: display only
    
    const shouldSpeak = alert.priority === 'high' || 
      (alert.priority === 'medium' && alert.severity >= 60);
    
    const shouldDisplay = true;  // Always display
    
    const shouldNotify = alert.priority === 'high' || alert.priority === 'medium';
    
    // Delay based on priority (high = immediate, others = slight delay)
    const deliveryDelay = alert.priority === 'high' ? 0 : 
      alert.priority === 'medium' ? 500 : 1000;
    
    return {
      alert,
      shouldSpeak,
      shouldDisplay,
      shouldNotify,
      deliveryDelay,
    };
  }

  /**
   * Determine priority based on severity
   */
  private determinePriority(severity: number): AlertPriority {
    if (severity >= this.config.severityThresholds.high) return 'high';
    if (severity >= this.config.severityThresholds.medium) return 'medium';
    return 'low';
  }

  /**
   * Get color for priority
   */
  private getColorForPriority(priority: AlertPriority): AlertColor {
    const colors: Record<AlertPriority, AlertColor> = {
      high: 'red',
      medium: 'yellow',
      low: 'blue',
    };
    return colors[priority];
  }

  /**
   * Determine category based on severity and priority
   */
  private determineCategory(severity: number, priority: AlertPriority): AlertCategory {
    if (severity >= 90) return 'critical';
    if (severity >= 75) return 'danger';
    if (priority === 'high') return 'immediate_threat';
    if (priority === 'medium') return 'emerging_pattern';
    if (severity >= 40) return 'warning';
    return 'informational';
  }

  /**
   * Generate narrative if not provided
   */
  private generateNarrative(incoming: IncomingAlert): string {
    const sourceNarratives: Record<AlertSource, string> = {
      'pressure_scanner': 'Market pressure conditions have changed significantly.',
      'anomaly_detection': 'An unusual pattern has been detected in market data.',
      'liquidity_fragility': 'Liquidity conditions may be unstable.',
      'manipulation_detector': 'Potential market manipulation activity detected.',
      'entity_escalation': 'Entity behavior has escalated to concerning levels.',
      'watchdog_orchestrator': 'Multiple watchdog systems have flagged this condition.',
    };
    
    return sourceNarratives[incoming.source] || incoming.message;
  }

  /**
   * Generate suggested action if not provided
   */
  private generateSuggestedAction(priority: AlertPriority): string {
    const actions: Record<AlertPriority, string> = {
      high: 'Review positions immediately. Consider risk reduction.',
      medium: 'Monitor closely. Be prepared to act.',
      low: 'Stay informed. No immediate action required.',
    };
    return actions[priority];
  }

  // ============================================================
  // Throttling and Deduplication
  // ============================================================

  /**
   * Check if alerts are currently throttled
   */
  private isThrottled(): boolean {
    const now = Date.now();
    
    // Check minimum interval
    if (now - this.throttleState.lastAlertTime < this.config.minAlertIntervalMs) {
      return true;
    }
    
    // Check hourly limit
    if (this.throttleState.alertsThisHour >= this.config.maxAlertsPerHour) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if alert is a duplicate
   */
  private isDuplicate(incoming: IncomingAlert): boolean {
    const hash = this.getIncomingAlertHash(incoming);
    return this.throttleState.recentAlertHashes.has(hash);
  }

  /**
   * Get hash for incoming alert
   */
  private getIncomingAlertHash(incoming: IncomingAlert): string {
    return `${incoming.source}_${incoming.title}_${Math.floor(incoming.severity / 10)}`;
  }

  /**
   * Get hash for watchdog alert
   */
  private getAlertHash(alert: WatchdogAlert): string {
    return `${alert.source}_${alert.title}_${Math.floor(alert.severity / 10)}`;
  }

  /**
   * Clean up expired alerts and reset counters
   */
  private cleanup(): void {
    const now = Date.now();
    
    // Reset hourly counter if hour has passed
    if (now - this.throttleState.hourStartTime >= 3600000) {
      this.throttleState.alertsThisHour = 0;
      this.throttleState.hourStartTime = now;
      this.log('Hourly alert counter reset');
    }
    
    // Clean up recent hashes (older than duplicate window)
    // Note: We can't easily clean Set by time, so we clear periodically
    if (this.throttleState.recentAlertHashes.size > 100) {
      this.throttleState.recentAlertHashes.clear();
    }
    
    // Remove expired active alerts
    const entries = Array.from(this.activeAlerts.entries());
    for (const [id, alert] of entries) {
      if (alert.expiresAt < now) {
        this.activeAlerts.delete(id);
      }
    }
    
    // Trim active alerts if too many
    if (this.activeAlerts.size > this.config.maxActiveAlerts) {
      const sorted = Array.from(this.activeAlerts.values())
        .sort((a, b) => a.timestamp - b.timestamp);
      
      const toRemove = sorted.slice(0, this.activeAlerts.size - this.config.maxActiveAlerts);
      for (const alert of toRemove) {
        this.activeAlerts.delete(alert.id);
      }
    }
  }

  // ============================================================
  // Queue Processing
  // ============================================================

  /**
   * Start processing queued alerts
   */
  startQueueProcessing(): void {
    if (this.processingInterval) {
      return;
    }
    
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, this.config.minAlertIntervalMs);
    
    this.log('Queue processing started');
  }

  /**
   * Stop processing queued alerts
   */
  stopQueueProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.log('Queue processing stopped');
  }

  /**
   * Process one alert from the queue
   */
  private processQueue(): void {
    if (this.alertQueue.length === 0) {
      return;
    }
    
    if (this.isThrottled()) {
      return;
    }
    
    const alert = this.alertQueue.shift();
    if (alert) {
      this.processAlert(alert);
    }
  }

  // ============================================================
  // Listeners
  // ============================================================

  /**
   * Add a listener for alert deliveries
   */
  addListener(callback: (delivery: AlertDelivery) => void): void {
    this.listeners.push(callback);
  }

  /**
   * Remove a listener
   */
  removeListener(callback: (delivery: AlertDelivery) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(delivery: AlertDelivery): void {
    for (const listener of this.listeners) {
      try {
        listener(delivery);
      } catch (error) {
        this.log('Error notifying listener', error);
      }
    }
  }

  // ============================================================
  // Alert Management
  // ============================================================

  /**
   * Acknowledge an alert
   */
  acknowledge(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Mark alert as spoken
   */
  markSpoken(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.spoken = true;
      return true;
    }
    return false;
  }

  /**
   * Mark alert as displayed
   */
  markDisplayed(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.displayed = true;
      return true;
    }
    return false;
  }

  /**
   * Dismiss an alert
   */
  dismiss(alertId: string): boolean {
    return this.activeAlerts.delete(alertId);
  }

  /**
   * Dismiss all alerts
   */
  dismissAll(): void {
    this.activeAlerts.clear();
    this.log('All alerts dismissed');
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get all active alerts
   */
  getActiveAlerts(): WatchdogAlert[] {
    this.cleanup();
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get alerts by priority
   */
  getAlertsByPriority(priority: AlertPriority): WatchdogAlert[] {
    return this.getActiveAlerts().filter(a => a.priority === priority);
  }

  /**
   * Get alerts by source
   */
  getAlertsBySource(source: AlertSource): WatchdogAlert[] {
    return this.getActiveAlerts().filter(a => a.source === source);
  }

  /**
   * Get high priority alerts (RED)
   */
  getHighPriorityAlerts(): WatchdogAlert[] {
    return this.getAlertsByPriority('high');
  }

  /**
   * Get medium priority alerts (YELLOW)
   */
  getMediumPriorityAlerts(): WatchdogAlert[] {
    return this.getAlertsByPriority('medium');
  }

  /**
   * Get low priority alerts (BLUE)
   */
  getLowPriorityAlerts(): WatchdogAlert[] {
    return this.getAlertsByPriority('low');
  }

  /**
   * Get unacknowledged alerts
   */
  getUnacknowledgedAlerts(): WatchdogAlert[] {
    return this.getActiveAlerts().filter(a => !a.acknowledged);
  }

  /**
   * Get unspoken alerts
   */
  getUnspokenAlerts(): WatchdogAlert[] {
    return this.getActiveAlerts().filter(a => !a.spoken);
  }

  /**
   * Get queued alerts
   */
  getQueuedAlerts(): WatchdogAlert[] {
    return [...this.alertQueue];
  }

  /**
   * Get alert history
   */
  getHistory(limit?: number): WatchdogAlert[] {
    if (limit) {
      return this.alertHistory.slice(-limit);
    }
    return [...this.alertHistory];
  }

  /**
   * Check if there are high priority alerts
   */
  hasHighPriorityAlerts(): boolean {
    return this.getHighPriorityAlerts().length > 0;
  }

  /**
   * Check if throttled
   */
  isCurrentlyThrottled(): boolean {
    return this.isThrottled();
  }

  /**
   * Get throttle state
   */
  getThrottleState(): {
    isThrottled: boolean;
    alertsThisHour: number;
    maxAlertsPerHour: number;
    secondsUntilNextAlert: number;
  } {
    const now = Date.now();
    const timeSinceLastAlert = now - this.throttleState.lastAlertTime;
    const secondsUntilNextAlert = Math.max(
      0,
      Math.ceil((this.config.minAlertIntervalMs - timeSinceLastAlert) / 1000)
    );
    
    return {
      isThrottled: this.isThrottled(),
      alertsThisHour: this.throttleState.alertsThisHour,
      maxAlertsPerHour: this.config.maxAlertsPerHour,
      secondsUntilNextAlert,
    };
  }

  /**
   * Get statistics
   */
  getStats(): AlertStats {
    return { ...this.stats };
  }

  /**
   * Get configuration
   */
  getConfig(): AlertRouterConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AlertRouterConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Clear queue
   */
  clearQueue(): void {
    this.alertQueue = [];
    this.log('Alert queue cleared');
  }

  /**
   * Reset router
   */
  reset(): void {
    this.stopQueueProcessing();
    this.activeAlerts.clear();
    this.alertHistory = [];
    this.alertQueue = [];
    this.alertCounter = 0;
    this.throttleState = {
      lastAlertTime: 0,
      alertsThisHour: 0,
      hourStartTime: Date.now(),
      recentAlertHashes: new Set(),
    };
    this.stats = {
      totalAlertsReceived: 0,
      totalAlertsRouted: 0,
      alertsThrottled: 0,
      alertsDeduplicated: 0,
      alertsByPriority: { high: 0, medium: 0, low: 0 },
      alertsBySource: {} as Record<AlertSource, number>,
      lastAlertTime: 0,
    };
    this.initializeStats();
    this.log('Router reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let routerInstance: AutonomousAlertRouterImpl | null = null;

/**
 * Get the singleton AutonomousAlertRouter instance
 */
export function getAutonomousAlertRouter(config?: Partial<AlertRouterConfig>): AutonomousAlertRouterImpl {
  if (!routerInstance) {
    routerInstance = new AutonomousAlertRouterImpl(config);
  }
  return routerInstance;
}

/**
 * Create a new AutonomousAlertRouter with custom config
 */
export function createAutonomousAlertRouter(config?: Partial<AlertRouterConfig>): AutonomousAlertRouterImpl {
  return new AutonomousAlertRouterImpl(config);
}
