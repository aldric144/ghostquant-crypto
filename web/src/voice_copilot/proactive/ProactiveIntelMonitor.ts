/**
 * ProactiveIntelMonitor.ts
 * 
 * Phase 5: Proactive Intelligence & Autonomous Alerting Engine
 * 
 * Responsibilities:
 * - Continuously monitor key GhostQuant intelligence endpoints
 * - Poll every 20-30 seconds
 * - Use lightweight snapshots to compare current state vs previous state
 * - Detect significant changes in whale activity, manipulation, risk, etc.
 * 
 * Logging prefix: [ProactiveIntel]
 */

// ============================================================
// Types
// ============================================================

export interface IntelSnapshot {
  timestamp: number;
  constellation: ConstellationMetrics | null;
  whaleIntel: WhaleIntelSummary | null;
  ecoscan: EcoscanEnvironmental | null;
  globalRisk: GlobalRiskData | null;
  alerts: AlertData[] | null;
  marketIntel: MarketIntelData | null;
  manipulation: ManipulationData | null;
  hydraActivity: HydraActivityData | null;
}

export interface ConstellationMetrics {
  totalClusters: number;
  activeClusters: number;
  clusterExpansionRate: number;
  anomalyScore: number;
  graphDensity: number;
}

export interface WhaleIntelSummary {
  totalWhales: number;
  activeWhales: number;
  movementVolume: number;
  movementChange24h: number;
  topMovers: string[];
  alertLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface EcoscanEnvironmental {
  overallScore: number;
  chainHealth: Record<string, number>;
  congestionLevel: number;
  degradationWarnings: string[];
  performanceIndex: number;
}

export interface GlobalRiskData {
  globalRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskChange24h: number;
  topRiskFactors: string[];
  marketSentiment: number;
}

export interface AlertData {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

export interface MarketIntelData {
  volatilityIndex: number;
  volatilityChange: number;
  trendDirection: 'bullish' | 'bearish' | 'neutral';
  marketCap: number;
  volume24h: number;
  dominance: Record<string, number>;
}

export interface ManipulationData {
  activeRings: number;
  newRingsDetected: number;
  spoofingActivity: number;
  washTradingVolume: number;
  oracleEyeAlerts: number;
  suspiciousEntities: string[];
}

export interface HydraActivityData {
  activeHeads: number;
  headDivergence: number;
  botClusters: number;
  coordinatedActivity: number;
  dexActivity: Record<string, number>;
  activitySurge: boolean;
}

export interface IntelChange {
  type: IntelChangeType;
  field: string;
  previousValue: unknown;
  currentValue: unknown;
  changePercent: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
}

export type IntelChangeType =
  | 'WHALE_SPIKE'
  | 'MANIPULATION_RING'
  | 'MARKET_VOLATILITY'
  | 'HIGH_RISK_ENTITY'
  | 'CONSTELLATION_ANOMALY'
  | 'BOT_CLUSTER_EXPANSION'
  | 'STABLECOIN_DEPEG_WARNING'
  | 'ECOSCORE_WARNING'
  | 'GLOBAL_RISK_LEVEL_CHANGE'
  | 'HYDRA_ACTIVITY_SURGE'
  | 'ORACLE_EYE_SPOOFING_DETECTED'
  | 'NEW_HIGH_SEVERITY_ALERT'
  | 'CHAIN_CONGESTION_ANOMALY';

export interface MonitorConfig {
  pollIntervalMs: number;
  enableLogging: boolean;
  retryAttempts: number;
  retryDelayMs: number;
  endpoints: {
    constellation: string;
    whaleIntel: string;
    ecoscan: string;
    globalRisk: string;
    alerts: string;
    marketIntel: string;
    manipulation: string;
    hydraActivity: string;
  };
  thresholds: {
    whaleMovementChangePercent: number;
    riskScoreChangePercent: number;
    volatilityChangePercent: number;
    ecoscanDegradationThreshold: number;
    hydraHeadDivergenceThreshold: number;
    manipulationRingThreshold: number;
  };
}

type IntelEventCallback = (changes: IntelChange[]) => void;

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: MonitorConfig = {
  pollIntervalMs: 25000, // 25 seconds
  enableLogging: true,
  retryAttempts: 2,
  retryDelayMs: 2000,
  endpoints: {
    constellation: '/api/gde/constellation/metrics',
    whaleIntel: '/api/whale/intel/summary',
    ecoscan: '/api/ecoscan/environmental',
    globalRisk: '/api/risk/global',
    alerts: '/api/alerts',
    marketIntel: '/api/market/intel',
    manipulation: '/api/manipulation',
    hydraActivity: '/api/hydra/activity',
  },
  thresholds: {
    whaleMovementChangePercent: 20,
    riskScoreChangePercent: 15,
    volatilityChangePercent: 25,
    ecoscanDegradationThreshold: 70,
    hydraHeadDivergenceThreshold: 0.3,
    manipulationRingThreshold: 1,
  },
};

// ============================================================
// ProactiveIntelMonitor Implementation
// ============================================================

class ProactiveIntelMonitorImpl {
  private config: MonitorConfig;
  private isRunning: boolean = false;
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private previousSnapshot: IntelSnapshot | null = null;
  private currentSnapshot: IntelSnapshot | null = null;
  private eventCallbacks: Set<IntelEventCallback> = new Set();
  private failedEndpoints: Set<string> = new Set();
  private stats = {
    totalPolls: 0,
    successfulPolls: 0,
    failedPolls: 0,
    eventsDetected: 0,
    lastPollTime: null as number | null,
    uptime: 0,
  };
  private startTime: number = 0;

  constructor(config: Partial<MonitorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.log('ProactiveIntelMonitor initialized');
  }

  // ============================================================
  // Logging
  // ============================================================

  private log(message: string, data?: unknown): void {
    if (this.config.enableLogging) {
      if (data) {
        console.log(`[ProactiveIntel] ${message}`, data);
      } else {
        console.log(`[ProactiveIntel] ${message}`);
      }
    }
  }

  private logError(message: string, error?: unknown): void {
    console.error(`[ProactiveIntel] ${message}`, error);
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  /**
   * Start the proactive intelligence monitor
   */
  start(): void {
    if (this.isRunning) {
      this.log('Monitor already running');
      return;
    }

    this.log('Starting proactive intelligence monitor');
    this.isRunning = true;
    this.startTime = Date.now();
    this.failedEndpoints.clear();

    // Initial poll
    this.poll();

    // Start polling interval
    this.pollInterval = setInterval(() => {
      this.poll();
    }, this.config.pollIntervalMs);
  }

  /**
   * Stop the proactive intelligence monitor
   */
  stop(): void {
    if (!this.isRunning) {
      this.log('Monitor not running');
      return;
    }

    this.log('Stopping proactive intelligence monitor');
    this.isRunning = false;

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    this.stats.uptime += Date.now() - this.startTime;
  }

  /**
   * Check if monitor is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  // ============================================================
  // Polling
  // ============================================================

  /**
   * Perform a single poll cycle
   */
  private async poll(): Promise<void> {
    this.stats.totalPolls++;
    this.stats.lastPollTime = Date.now();
    this.log('Polling intelligence endpoints...');

    try {
      // Fetch all intelligence data
      const snapshot = await this.fetchSnapshot();
      
      // Store previous snapshot for comparison
      this.previousSnapshot = this.currentSnapshot;
      this.currentSnapshot = snapshot;

      // Detect changes if we have a previous snapshot
      if (this.previousSnapshot) {
        const changes = this.detectChanges(this.previousSnapshot, this.currentSnapshot);
        
        if (changes.length > 0) {
          this.log(`Detected ${changes.length} intelligence changes`);
          this.stats.eventsDetected += changes.length;
          this.notifyEventCallbacks(changes);
        }
      }

      this.stats.successfulPolls++;
    } catch (error) {
      this.stats.failedPolls++;
      this.logError('Poll cycle failed', error);
    }
  }

  /**
   * Fetch a complete intelligence snapshot
   */
  private async fetchSnapshot(): Promise<IntelSnapshot> {
    const snapshot: IntelSnapshot = {
      timestamp: Date.now(),
      constellation: null,
      whaleIntel: null,
      ecoscan: null,
      globalRisk: null,
      alerts: null,
      marketIntel: null,
      manipulation: null,
      hydraActivity: null,
    };

    // Fetch all endpoints in parallel
    const results = await Promise.allSettled([
      this.fetchEndpoint<ConstellationMetrics>('constellation'),
      this.fetchEndpoint<WhaleIntelSummary>('whaleIntel'),
      this.fetchEndpoint<EcoscanEnvironmental>('ecoscan'),
      this.fetchEndpoint<GlobalRiskData>('globalRisk'),
      this.fetchEndpoint<AlertData[]>('alerts'),
      this.fetchEndpoint<MarketIntelData>('marketIntel'),
      this.fetchEndpoint<ManipulationData>('manipulation'),
      this.fetchEndpoint<HydraActivityData>('hydraActivity'),
    ]);

    // Process results
    if (results[0].status === 'fulfilled') snapshot.constellation = results[0].value;
    if (results[1].status === 'fulfilled') snapshot.whaleIntel = results[1].value;
    if (results[2].status === 'fulfilled') snapshot.ecoscan = results[2].value;
    if (results[3].status === 'fulfilled') snapshot.globalRisk = results[3].value;
    if (results[4].status === 'fulfilled') snapshot.alerts = results[4].value;
    if (results[5].status === 'fulfilled') snapshot.marketIntel = results[5].value;
    if (results[6].status === 'fulfilled') snapshot.manipulation = results[6].value;
    if (results[7].status === 'fulfilled') snapshot.hydraActivity = results[7].value;

    return snapshot;
  }

  /**
   * Fetch a single endpoint with retry logic
   */
  private async fetchEndpoint<T>(
    endpointKey: keyof MonitorConfig['endpoints']
  ): Promise<T | null> {
    const endpoint = this.config.endpoints[endpointKey];
    
    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        this.failedEndpoints.delete(endpointKey);
        return data as T;
      } catch (error) {
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelayMs);
        } else {
          this.failedEndpoints.add(endpointKey);
          this.log(`[Phase5] Endpoint unavailable, skipping cycle: ${endpointKey}`);
          return null;
        }
      }
    }

    return null;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================
  // Change Detection
  // ============================================================

  /**
   * Detect significant changes between snapshots
   */
  detectChanges(prev: IntelSnapshot, current: IntelSnapshot): IntelChange[] {
    const changes: IntelChange[] = [];

    // Whale spike detection
    if (prev.whaleIntel && current.whaleIntel) {
      const whaleChanges = this.detectWhaleChanges(prev.whaleIntel, current.whaleIntel);
      changes.push(...whaleChanges);
    }

    // Manipulation ring detection
    if (prev.manipulation && current.manipulation) {
      const manipulationChanges = this.detectManipulationChanges(prev.manipulation, current.manipulation);
      changes.push(...manipulationChanges);
    }

    // Market volatility detection
    if (prev.marketIntel && current.marketIntel) {
      const marketChanges = this.detectMarketChanges(prev.marketIntel, current.marketIntel);
      changes.push(...marketChanges);
    }

    // Global risk level changes
    if (prev.globalRisk && current.globalRisk) {
      const riskChanges = this.detectRiskChanges(prev.globalRisk, current.globalRisk);
      changes.push(...riskChanges);
    }

    // Constellation anomaly detection
    if (prev.constellation && current.constellation) {
      const constellationChanges = this.detectConstellationChanges(prev.constellation, current.constellation);
      changes.push(...constellationChanges);
    }

    // Ecoscan warning detection
    if (prev.ecoscan && current.ecoscan) {
      const ecoscanChanges = this.detectEcoscanChanges(prev.ecoscan, current.ecoscan);
      changes.push(...ecoscanChanges);
    }

    // Hydra activity surge detection
    if (prev.hydraActivity && current.hydraActivity) {
      const hydraChanges = this.detectHydraChanges(prev.hydraActivity, current.hydraActivity);
      changes.push(...hydraChanges);
    }

    // New high-severity alerts
    if (prev.alerts && current.alerts) {
      const alertChanges = this.detectNewAlerts(prev.alerts, current.alerts);
      changes.push(...alertChanges);
    }

    return changes;
  }

  /**
   * Detect whale activity changes
   */
  private detectWhaleChanges(prev: WhaleIntelSummary, current: WhaleIntelSummary): IntelChange[] {
    const changes: IntelChange[] = [];
    const threshold = this.config.thresholds.whaleMovementChangePercent;

    // Check movement volume change
    if (prev.movementVolume > 0) {
      const changePercent = ((current.movementVolume - prev.movementVolume) / prev.movementVolume) * 100;
      
      if (Math.abs(changePercent) >= threshold) {
        changes.push({
          type: 'WHALE_SPIKE',
          field: 'movementVolume',
          previousValue: prev.movementVolume,
          currentValue: current.movementVolume,
          changePercent,
          severity: this.getSeverityFromChange(changePercent, threshold),
          description: `Whale movement ${changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePercent).toFixed(1)}%`,
          timestamp: Date.now(),
        });
      }
    }

    // Check alert level escalation
    const alertLevelOrder = ['low', 'medium', 'high', 'critical'];
    const prevLevel = alertLevelOrder.indexOf(prev.alertLevel);
    const currentLevel = alertLevelOrder.indexOf(current.alertLevel);
    
    if (currentLevel > prevLevel) {
      changes.push({
        type: 'WHALE_SPIKE',
        field: 'alertLevel',
        previousValue: prev.alertLevel,
        currentValue: current.alertLevel,
        changePercent: ((currentLevel - prevLevel) / alertLevelOrder.length) * 100,
        severity: current.alertLevel as 'low' | 'medium' | 'high' | 'critical',
        description: `Whale alert level escalated from ${prev.alertLevel} to ${current.alertLevel}`,
        timestamp: Date.now(),
      });
    }

    return changes;
  }

  /**
   * Detect manipulation activity changes
   */
  private detectManipulationChanges(prev: ManipulationData, current: ManipulationData): IntelChange[] {
    const changes: IntelChange[] = [];

    // New manipulation rings detected
    if (current.newRingsDetected > 0 && current.newRingsDetected > prev.newRingsDetected) {
      changes.push({
        type: 'MANIPULATION_RING',
        field: 'newRingsDetected',
        previousValue: prev.newRingsDetected,
        currentValue: current.newRingsDetected,
        changePercent: 100,
        severity: current.newRingsDetected >= 3 ? 'critical' : current.newRingsDetected >= 2 ? 'high' : 'medium',
        description: `${current.newRingsDetected - prev.newRingsDetected} new manipulation ring(s) detected`,
        timestamp: Date.now(),
      });
    }

    // Oracle Eye spoofing surge
    if (prev.oracleEyeAlerts > 0) {
      const changePercent = ((current.oracleEyeAlerts - prev.oracleEyeAlerts) / prev.oracleEyeAlerts) * 100;
      
      if (changePercent >= 50) {
        changes.push({
          type: 'ORACLE_EYE_SPOOFING_DETECTED',
          field: 'oracleEyeAlerts',
          previousValue: prev.oracleEyeAlerts,
          currentValue: current.oracleEyeAlerts,
          changePercent,
          severity: changePercent >= 100 ? 'critical' : 'high',
          description: `Oracle Eye spoofing activity surged by ${changePercent.toFixed(1)}%`,
          timestamp: Date.now(),
        });
      }
    }

    return changes;
  }

  /**
   * Detect market volatility changes
   */
  private detectMarketChanges(prev: MarketIntelData, current: MarketIntelData): IntelChange[] {
    const changes: IntelChange[] = [];
    const threshold = this.config.thresholds.volatilityChangePercent;

    if (prev.volatilityIndex > 0) {
      const changePercent = ((current.volatilityIndex - prev.volatilityIndex) / prev.volatilityIndex) * 100;
      
      if (Math.abs(changePercent) >= threshold) {
        changes.push({
          type: 'MARKET_VOLATILITY',
          field: 'volatilityIndex',
          previousValue: prev.volatilityIndex,
          currentValue: current.volatilityIndex,
          changePercent,
          severity: this.getSeverityFromChange(changePercent, threshold),
          description: `Market volatility ${changePercent > 0 ? 'spiked' : 'dropped'} by ${Math.abs(changePercent).toFixed(1)}%`,
          timestamp: Date.now(),
        });
      }
    }

    return changes;
  }

  /**
   * Detect global risk changes
   */
  private detectRiskChanges(prev: GlobalRiskData, current: GlobalRiskData): IntelChange[] {
    const changes: IntelChange[] = [];
    const threshold = this.config.thresholds.riskScoreChangePercent;

    // Risk score change
    if (prev.globalRiskScore > 0) {
      const changePercent = ((current.globalRiskScore - prev.globalRiskScore) / prev.globalRiskScore) * 100;
      
      if (Math.abs(changePercent) >= threshold) {
        changes.push({
          type: 'GLOBAL_RISK_LEVEL_CHANGE',
          field: 'globalRiskScore',
          previousValue: prev.globalRiskScore,
          currentValue: current.globalRiskScore,
          changePercent,
          severity: this.getSeverityFromChange(changePercent, threshold),
          description: `Global risk score ${changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePercent).toFixed(1)}%`,
          timestamp: Date.now(),
        });
      }
    }

    // Risk level escalation
    if (prev.riskLevel !== current.riskLevel) {
      const levelOrder = ['low', 'medium', 'high', 'critical'];
      const prevIdx = levelOrder.indexOf(prev.riskLevel);
      const currIdx = levelOrder.indexOf(current.riskLevel);
      
      if (currIdx > prevIdx) {
        changes.push({
          type: 'GLOBAL_RISK_LEVEL_CHANGE',
          field: 'riskLevel',
          previousValue: prev.riskLevel,
          currentValue: current.riskLevel,
          changePercent: ((currIdx - prevIdx) / levelOrder.length) * 100,
          severity: current.riskLevel,
          description: `Global risk level escalated from ${prev.riskLevel} to ${current.riskLevel}`,
          timestamp: Date.now(),
        });
      }
    }

    return changes;
  }

  /**
   * Detect constellation anomalies
   */
  private detectConstellationChanges(prev: ConstellationMetrics, current: ConstellationMetrics): IntelChange[] {
    const changes: IntelChange[] = [];

    // Cluster expansion
    if (current.activeClusters > prev.activeClusters + 2) {
      changes.push({
        type: 'CONSTELLATION_ANOMALY',
        field: 'activeClusters',
        previousValue: prev.activeClusters,
        currentValue: current.activeClusters,
        changePercent: ((current.activeClusters - prev.activeClusters) / prev.activeClusters) * 100,
        severity: current.activeClusters - prev.activeClusters >= 5 ? 'high' : 'medium',
        description: `Constellation cluster expansion: ${current.activeClusters - prev.activeClusters} new active clusters`,
        timestamp: Date.now(),
      });
    }

    // Anomaly score spike
    if (current.anomalyScore > prev.anomalyScore + 0.2) {
      changes.push({
        type: 'CONSTELLATION_ANOMALY',
        field: 'anomalyScore',
        previousValue: prev.anomalyScore,
        currentValue: current.anomalyScore,
        changePercent: ((current.anomalyScore - prev.anomalyScore) / Math.max(prev.anomalyScore, 0.1)) * 100,
        severity: current.anomalyScore >= 0.8 ? 'critical' : current.anomalyScore >= 0.6 ? 'high' : 'medium',
        description: `Constellation anomaly score spiked to ${(current.anomalyScore * 100).toFixed(0)}%`,
        timestamp: Date.now(),
      });
    }

    return changes;
  }

  /**
   * Detect ecoscan warnings
   */
  private detectEcoscanChanges(prev: EcoscanEnvironmental, current: EcoscanEnvironmental): IntelChange[] {
    const changes: IntelChange[] = [];
    const threshold = this.config.thresholds.ecoscanDegradationThreshold;

    // Overall score degradation
    if (current.overallScore < threshold && prev.overallScore >= threshold) {
      changes.push({
        type: 'ECOSCORE_WARNING',
        field: 'overallScore',
        previousValue: prev.overallScore,
        currentValue: current.overallScore,
        changePercent: ((current.overallScore - prev.overallScore) / prev.overallScore) * 100,
        severity: current.overallScore < 50 ? 'critical' : current.overallScore < 60 ? 'high' : 'medium',
        description: `Environmental score degraded to ${current.overallScore}%`,
        timestamp: Date.now(),
      });
    }

    // Chain congestion anomaly
    if (current.congestionLevel > prev.congestionLevel + 30) {
      changes.push({
        type: 'CHAIN_CONGESTION_ANOMALY',
        field: 'congestionLevel',
        previousValue: prev.congestionLevel,
        currentValue: current.congestionLevel,
        changePercent: ((current.congestionLevel - prev.congestionLevel) / Math.max(prev.congestionLevel, 1)) * 100,
        severity: current.congestionLevel >= 90 ? 'critical' : current.congestionLevel >= 70 ? 'high' : 'medium',
        description: `Chain congestion spiked to ${current.congestionLevel}%`,
        timestamp: Date.now(),
      });
    }

    // New degradation warnings
    const newWarnings = current.degradationWarnings.filter(w => !prev.degradationWarnings.includes(w));
    if (newWarnings.length > 0) {
      changes.push({
        type: 'ECOSCORE_WARNING',
        field: 'degradationWarnings',
        previousValue: prev.degradationWarnings.length,
        currentValue: current.degradationWarnings.length,
        changePercent: 100,
        severity: newWarnings.length >= 3 ? 'high' : 'medium',
        description: `New environmental warnings: ${newWarnings.join(', ')}`,
        timestamp: Date.now(),
      });
    }

    return changes;
  }

  /**
   * Detect Hydra activity changes
   */
  private detectHydraChanges(prev: HydraActivityData, current: HydraActivityData): IntelChange[] {
    const changes: IntelChange[] = [];
    const divergenceThreshold = this.config.thresholds.hydraHeadDivergenceThreshold;

    // Head divergence
    if (current.headDivergence > divergenceThreshold && prev.headDivergence <= divergenceThreshold) {
      changes.push({
        type: 'HYDRA_ACTIVITY_SURGE',
        field: 'headDivergence',
        previousValue: prev.headDivergence,
        currentValue: current.headDivergence,
        changePercent: ((current.headDivergence - prev.headDivergence) / Math.max(prev.headDivergence, 0.01)) * 100,
        severity: current.headDivergence >= 0.6 ? 'critical' : current.headDivergence >= 0.4 ? 'high' : 'medium',
        description: `Hydra head divergence detected: ${(current.headDivergence * 100).toFixed(0)}% disagreement`,
        timestamp: Date.now(),
      });
    }

    // Activity surge flag
    if (current.activitySurge && !prev.activitySurge) {
      changes.push({
        type: 'HYDRA_ACTIVITY_SURGE',
        field: 'activitySurge',
        previousValue: false,
        currentValue: true,
        changePercent: 100,
        severity: 'high',
        description: 'Hydra detected coordinated bot activity surge',
        timestamp: Date.now(),
      });
    }

    // Bot cluster expansion
    if (current.botClusters > prev.botClusters + 2) {
      changes.push({
        type: 'BOT_CLUSTER_EXPANSION',
        field: 'botClusters',
        previousValue: prev.botClusters,
        currentValue: current.botClusters,
        changePercent: ((current.botClusters - prev.botClusters) / Math.max(prev.botClusters, 1)) * 100,
        severity: current.botClusters - prev.botClusters >= 5 ? 'high' : 'medium',
        description: `${current.botClusters - prev.botClusters} new bot clusters detected`,
        timestamp: Date.now(),
      });
    }

    return changes;
  }

  /**
   * Detect new high-severity alerts
   */
  private detectNewAlerts(prev: AlertData[], current: AlertData[]): IntelChange[] {
    const changes: IntelChange[] = [];
    const prevIds = new Set(prev.map(a => a.id));

    // Find new alerts
    const newAlerts = current.filter(a => !prevIds.has(a.id));
    
    // Only report high and critical severity alerts
    const significantAlerts = newAlerts.filter(a => a.severity === 'high' || a.severity === 'critical');

    for (const alert of significantAlerts) {
      changes.push({
        type: 'NEW_HIGH_SEVERITY_ALERT',
        field: 'alerts',
        previousValue: null,
        currentValue: alert,
        changePercent: 100,
        severity: alert.severity,
        description: alert.message,
        timestamp: alert.timestamp,
      });
    }

    return changes;
  }

  /**
   * Get severity level from change percentage
   */
  private getSeverityFromChange(changePercent: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const absChange = Math.abs(changePercent);
    if (absChange >= threshold * 3) return 'critical';
    if (absChange >= threshold * 2) return 'high';
    if (absChange >= threshold) return 'medium';
    return 'low';
  }

  // ============================================================
  // Event Callbacks
  // ============================================================

  /**
   * Register an event callback
   */
  onIntelEvent(callback: IntelEventCallback): () => void {
    this.eventCallbacks.add(callback);
    return () => this.eventCallbacks.delete(callback);
  }

  /**
   * Notify all event callbacks
   */
  private notifyEventCallbacks(changes: IntelChange[]): void {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(changes);
      } catch (error) {
        this.logError('Event callback error', error);
      }
    });
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get the latest snapshot
   */
  getLatestSnapshot(): IntelSnapshot | null {
    return this.currentSnapshot;
  }

  /**
   * Get the previous snapshot
   */
  getPreviousSnapshot(): IntelSnapshot | null {
    return this.previousSnapshot;
  }

  /**
   * Get monitor statistics
   */
  getStats(): typeof this.stats & { uptime: number } {
    return {
      ...this.stats,
      uptime: this.isRunning 
        ? this.stats.uptime + (Date.now() - this.startTime)
        : this.stats.uptime,
    };
  }

  /**
   * Get failed endpoints
   */
  getFailedEndpoints(): string[] {
    return Array.from(this.failedEndpoints);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MonitorConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Force a poll cycle
   */
  async forcePoll(): Promise<void> {
    await this.poll();
  }

  /**
   * Reset the monitor
   */
  reset(): void {
    this.previousSnapshot = null;
    this.currentSnapshot = null;
    this.failedEndpoints.clear();
    this.stats = {
      totalPolls: 0,
      successfulPolls: 0,
      failedPolls: 0,
      eventsDetected: 0,
      lastPollTime: null,
      uptime: 0,
    };
    this.log('Monitor reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let proactiveIntelMonitor: ProactiveIntelMonitorImpl | null = null;

/**
 * Get the ProactiveIntelMonitor singleton instance
 */
export function getProactiveIntelMonitor(): ProactiveIntelMonitorImpl {
  if (!proactiveIntelMonitor) {
    proactiveIntelMonitor = new ProactiveIntelMonitorImpl();
  }
  return proactiveIntelMonitor;
}

/**
 * Create a new ProactiveIntelMonitor instance
 */
export function createProactiveIntelMonitor(
  config?: Partial<MonitorConfig>
): ProactiveIntelMonitorImpl {
  return new ProactiveIntelMonitorImpl(config);
}

export default {
  getProactiveIntelMonitor,
  createProactiveIntelMonitor,
};
