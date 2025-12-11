/**
 * Phase 7: Autonomous Market Watchdog
 * MODULE 1 - MarketPressureScanner.ts
 * 
 * Computes real-time pressure readings across multiple dimensions:
 * - Buy pressure
 * - Sell pressure
 * - Whale pressure
 * - Cluster tightening
 * - Liquidity fragility
 * - Entity risk acceleration
 * 
 * Runs every 5-10 seconds to provide continuous market pressure monitoring.
 * 
 * This module is 100% isolated and additive - no modifications to existing code.
 */

// ============================================================
// Types and Interfaces
// ============================================================

export type EntityId = string;

export type PressureDirection = 'up' | 'down' | 'neutral';

export interface PressureReading {
  pressureScore: number;  // 0-100
  pressureDirection: PressureDirection;
  contributingEntities: EntityId[];
  pressureDrivers: string[];
  riskAcceleration: number;  // Rate of change in risk
  timestamp: number;
}

export interface PressureComponent {
  name: string;
  value: number;  // 0-100
  weight: number;
  direction: PressureDirection;
  description: string;
}

export interface WhaleIntelData {
  netFlow: number;
  largeTransactions: number;
  accumulationScore: number;
  distributionScore: number;
  activeWhales: EntityId[];
}

export interface LiquidityData {
  bidDepth: number;
  askDepth: number;
  spreadPercentage: number;
  imbalanceRatio: number;
  thinZones: number[];
}

export interface ClusterData {
  clusterTightness: number;
  convergenceScore: number;
  divergenceScore: number;
  activeClusterIds: string[];
}

export interface EntityRiskData {
  riskScore: number;
  riskDelta: number;
  highRiskEntities: EntityId[];
  acceleratingEntities: EntityId[];
}

export interface MarketPressureInputs {
  whaleIntel?: WhaleIntelData;
  liquidity?: LiquidityData;
  cluster?: ClusterData;
  entityRisk?: EntityRiskData;
  priceChange?: number;
  volumeChange?: number;
}

export interface PressureScannerConfig {
  scanIntervalMs: number;
  pressureThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  componentWeights: {
    buyPressure: number;
    sellPressure: number;
    whalePressure: number;
    clusterTightening: number;
    liquidityFragility: number;
    entityRiskAcceleration: number;
  };
  enableLogging: boolean;
  logPrefix: string;
  historySize: number;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: PressureScannerConfig = {
  scanIntervalMs: 5000,  // 5 seconds
  pressureThresholds: {
    low: 25,
    medium: 50,
    high: 75,
    critical: 90,
  },
  componentWeights: {
    buyPressure: 0.15,
    sellPressure: 0.15,
    whalePressure: 0.25,
    clusterTightening: 0.15,
    liquidityFragility: 0.15,
    entityRiskAcceleration: 0.15,
  },
  enableLogging: true,
  logPrefix: '[MarketPressureScanner]',
  historySize: 100,
};

// ============================================================
// MarketPressureScanner Implementation
// ============================================================

class MarketPressureScannerImpl {
  private config: PressureScannerConfig;
  private pressureHistory: PressureReading[] = [];
  private lastInputs: MarketPressureInputs | null = null;
  private scanCounter = 0;
  private scanInterval: NodeJS.Timeout | null = null;
  private isScanning = false;
  
  private stats = {
    totalScans: 0,
    averagePressure: 50,
    highPressureEvents: 0,
    criticalPressureEvents: 0,
    lastScanTime: 0,
  };

  constructor(config?: Partial<PressureScannerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.log('MarketPressureScanner initialized');
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
  // Main Pressure Scanning
  // ============================================================

  /**
   * Perform a single pressure scan with the given inputs
   */
  scan(inputs: MarketPressureInputs): PressureReading {
    this.lastInputs = inputs;
    this.scanCounter++;
    
    // Calculate individual pressure components
    const components = this.calculatePressureComponents(inputs);
    
    // Calculate weighted pressure score
    const pressureScore = this.calculateWeightedPressure(components);
    
    // Determine pressure direction
    const pressureDirection = this.determinePressureDirection(components, inputs);
    
    // Extract contributing entities
    const contributingEntities = this.extractContributingEntities(inputs);
    
    // Generate pressure drivers
    const pressureDrivers = this.generatePressureDrivers(components);
    
    // Calculate risk acceleration
    const riskAcceleration = this.calculateRiskAcceleration(inputs);
    
    const reading: PressureReading = {
      pressureScore,
      pressureDirection,
      contributingEntities,
      pressureDrivers,
      riskAcceleration,
      timestamp: Date.now(),
    };
    
    // Add to history
    this.addToHistory(reading);
    
    // Update stats
    this.updateStats(reading);
    
    this.log(`Scan #${this.scanCounter}: pressure=${pressureScore.toFixed(1)}, direction=${pressureDirection}`);
    
    return reading;
  }

  /**
   * Calculate individual pressure components
   */
  private calculatePressureComponents(inputs: MarketPressureInputs): PressureComponent[] {
    const components: PressureComponent[] = [];
    
    // Buy Pressure
    const buyPressure = this.calculateBuyPressure(inputs);
    components.push({
      name: 'buyPressure',
      value: buyPressure.value,
      weight: this.config.componentWeights.buyPressure,
      direction: buyPressure.direction,
      description: buyPressure.description,
    });
    
    // Sell Pressure
    const sellPressure = this.calculateSellPressure(inputs);
    components.push({
      name: 'sellPressure',
      value: sellPressure.value,
      weight: this.config.componentWeights.sellPressure,
      direction: sellPressure.direction,
      description: sellPressure.description,
    });
    
    // Whale Pressure
    const whalePressure = this.calculateWhalePressure(inputs);
    components.push({
      name: 'whalePressure',
      value: whalePressure.value,
      weight: this.config.componentWeights.whalePressure,
      direction: whalePressure.direction,
      description: whalePressure.description,
    });
    
    // Cluster Tightening
    const clusterTightening = this.calculateClusterTightening(inputs);
    components.push({
      name: 'clusterTightening',
      value: clusterTightening.value,
      weight: this.config.componentWeights.clusterTightening,
      direction: clusterTightening.direction,
      description: clusterTightening.description,
    });
    
    // Liquidity Fragility
    const liquidityFragility = this.calculateLiquidityFragility(inputs);
    components.push({
      name: 'liquidityFragility',
      value: liquidityFragility.value,
      weight: this.config.componentWeights.liquidityFragility,
      direction: liquidityFragility.direction,
      description: liquidityFragility.description,
    });
    
    // Entity Risk Acceleration
    const entityRiskAcceleration = this.calculateEntityRiskAcceleration(inputs);
    components.push({
      name: 'entityRiskAcceleration',
      value: entityRiskAcceleration.value,
      weight: this.config.componentWeights.entityRiskAcceleration,
      direction: entityRiskAcceleration.direction,
      description: entityRiskAcceleration.description,
    });
    
    return components;
  }

  /**
   * Calculate buy pressure from market data
   */
  private calculateBuyPressure(inputs: MarketPressureInputs): { value: number; direction: PressureDirection; description: string } {
    let value = 50;  // Neutral baseline
    let direction: PressureDirection = 'neutral';
    const factors: string[] = [];
    
    // Whale accumulation increases buy pressure
    if (inputs.whaleIntel) {
      if (inputs.whaleIntel.accumulationScore > 60) {
        value += (inputs.whaleIntel.accumulationScore - 60) * 0.5;
        factors.push('whale accumulation');
      }
      if (inputs.whaleIntel.netFlow > 0) {
        value += Math.min(inputs.whaleIntel.netFlow * 0.1, 20);
        factors.push('positive net flow');
      }
    }
    
    // Liquidity bid depth
    if (inputs.liquidity) {
      if (inputs.liquidity.bidDepth > inputs.liquidity.askDepth) {
        const ratio = inputs.liquidity.bidDepth / Math.max(inputs.liquidity.askDepth, 1);
        value += Math.min((ratio - 1) * 10, 15);
        factors.push('strong bid depth');
      }
    }
    
    // Price momentum
    if (inputs.priceChange !== undefined && inputs.priceChange > 0) {
      value += Math.min(inputs.priceChange * 2, 15);
      factors.push('positive price momentum');
    }
    
    value = Math.max(0, Math.min(100, value));
    
    if (value > 60) direction = 'up';
    else if (value < 40) direction = 'down';
    
    return {
      value,
      direction,
      description: factors.length > 0 ? `Buy pressure from ${factors.join(', ')}` : 'Neutral buy pressure',
    };
  }

  /**
   * Calculate sell pressure from market data
   */
  private calculateSellPressure(inputs: MarketPressureInputs): { value: number; direction: PressureDirection; description: string } {
    let value = 50;
    let direction: PressureDirection = 'neutral';
    const factors: string[] = [];
    
    // Whale distribution increases sell pressure
    if (inputs.whaleIntel) {
      if (inputs.whaleIntel.distributionScore > 60) {
        value += (inputs.whaleIntel.distributionScore - 60) * 0.5;
        factors.push('whale distribution');
      }
      if (inputs.whaleIntel.netFlow < 0) {
        value += Math.min(Math.abs(inputs.whaleIntel.netFlow) * 0.1, 20);
        factors.push('negative net flow');
      }
    }
    
    // Liquidity ask depth
    if (inputs.liquidity) {
      if (inputs.liquidity.askDepth > inputs.liquidity.bidDepth) {
        const ratio = inputs.liquidity.askDepth / Math.max(inputs.liquidity.bidDepth, 1);
        value += Math.min((ratio - 1) * 10, 15);
        factors.push('heavy ask depth');
      }
    }
    
    // Price momentum
    if (inputs.priceChange !== undefined && inputs.priceChange < 0) {
      value += Math.min(Math.abs(inputs.priceChange) * 2, 15);
      factors.push('negative price momentum');
    }
    
    value = Math.max(0, Math.min(100, value));
    
    if (value > 60) direction = 'down';
    else if (value < 40) direction = 'up';
    
    return {
      value,
      direction,
      description: factors.length > 0 ? `Sell pressure from ${factors.join(', ')}` : 'Neutral sell pressure',
    };
  }

  /**
   * Calculate whale pressure from whale intel data
   */
  private calculateWhalePressure(inputs: MarketPressureInputs): { value: number; direction: PressureDirection; description: string } {
    let value = 50;
    let direction: PressureDirection = 'neutral';
    const factors: string[] = [];
    
    if (!inputs.whaleIntel) {
      return { value: 50, direction: 'neutral', description: 'No whale data available' };
    }
    
    const whale = inputs.whaleIntel;
    
    // Large transaction activity
    if (whale.largeTransactions > 5) {
      value += Math.min(whale.largeTransactions * 3, 25);
      factors.push(`${whale.largeTransactions} large transactions`);
    }
    
    // Active whale count
    if (whale.activeWhales.length > 3) {
      value += Math.min(whale.activeWhales.length * 2, 15);
      factors.push(`${whale.activeWhales.length} active whales`);
    }
    
    // Net flow direction
    if (Math.abs(whale.netFlow) > 100) {
      value += Math.min(Math.abs(whale.netFlow) * 0.05, 20);
      if (whale.netFlow > 0) {
        direction = 'up';
        factors.push('net inflow');
      } else {
        direction = 'down';
        factors.push('net outflow');
      }
    }
    
    // Accumulation vs distribution
    const accDistDiff = whale.accumulationScore - whale.distributionScore;
    if (Math.abs(accDistDiff) > 20) {
      if (accDistDiff > 0) {
        direction = 'up';
        factors.push('accumulation dominant');
      } else {
        direction = 'down';
        factors.push('distribution dominant');
      }
    }
    
    value = Math.max(0, Math.min(100, value));
    
    return {
      value,
      direction,
      description: factors.length > 0 ? `Whale pressure: ${factors.join(', ')}` : 'Neutral whale activity',
    };
  }

  /**
   * Calculate cluster tightening from constellation data
   */
  private calculateClusterTightening(inputs: MarketPressureInputs): { value: number; direction: PressureDirection; description: string } {
    let value = 50;
    let direction: PressureDirection = 'neutral';
    const factors: string[] = [];
    
    if (!inputs.cluster) {
      return { value: 50, direction: 'neutral', description: 'No cluster data available' };
    }
    
    const cluster = inputs.cluster;
    
    // Cluster tightness indicates convergence
    if (cluster.clusterTightness > 70) {
      value += (cluster.clusterTightness - 70) * 1.5;
      factors.push('tight clustering');
    }
    
    // Convergence vs divergence
    if (cluster.convergenceScore > cluster.divergenceScore + 20) {
      value += 15;
      direction = 'up';
      factors.push('convergence pattern');
    } else if (cluster.divergenceScore > cluster.convergenceScore + 20) {
      value += 15;
      direction = 'down';
      factors.push('divergence pattern');
    }
    
    // Active cluster count
    if (cluster.activeClusterIds.length > 5) {
      value += Math.min(cluster.activeClusterIds.length * 2, 15);
      factors.push(`${cluster.activeClusterIds.length} active clusters`);
    }
    
    value = Math.max(0, Math.min(100, value));
    
    return {
      value,
      direction,
      description: factors.length > 0 ? `Cluster activity: ${factors.join(', ')}` : 'Normal cluster behavior',
    };
  }

  /**
   * Calculate liquidity fragility from liquidity data
   */
  private calculateLiquidityFragility(inputs: MarketPressureInputs): { value: number; direction: PressureDirection; description: string } {
    let value = 50;
    let direction: PressureDirection = 'neutral';
    const factors: string[] = [];
    
    if (!inputs.liquidity) {
      return { value: 50, direction: 'neutral', description: 'No liquidity data available' };
    }
    
    const liq = inputs.liquidity;
    
    // Wide spread indicates fragility
    if (liq.spreadPercentage > 0.5) {
      value += Math.min(liq.spreadPercentage * 20, 25);
      factors.push('wide spread');
    }
    
    // Imbalance ratio
    if (Math.abs(liq.imbalanceRatio) > 0.3) {
      value += Math.min(Math.abs(liq.imbalanceRatio) * 30, 20);
      direction = liq.imbalanceRatio > 0 ? 'up' : 'down';
      factors.push('order book imbalance');
    }
    
    // Thin zones
    if (liq.thinZones.length > 2) {
      value += Math.min(liq.thinZones.length * 5, 20);
      factors.push(`${liq.thinZones.length} thin liquidity zones`);
    }
    
    // Low overall depth
    const totalDepth = liq.bidDepth + liq.askDepth;
    if (totalDepth < 1000) {
      value += Math.min((1000 - totalDepth) * 0.02, 15);
      factors.push('low overall depth');
    }
    
    value = Math.max(0, Math.min(100, value));
    
    return {
      value,
      direction,
      description: factors.length > 0 ? `Liquidity fragility: ${factors.join(', ')}` : 'Stable liquidity',
    };
  }

  /**
   * Calculate entity risk acceleration
   */
  private calculateEntityRiskAcceleration(inputs: MarketPressureInputs): { value: number; direction: PressureDirection; description: string } {
    let value = 50;
    let direction: PressureDirection = 'neutral';
    const factors: string[] = [];
    
    if (!inputs.entityRisk) {
      return { value: 50, direction: 'neutral', description: 'No entity risk data available' };
    }
    
    const entity = inputs.entityRisk;
    
    // Overall risk score
    if (entity.riskScore > 60) {
      value += (entity.riskScore - 60) * 0.5;
      factors.push('elevated entity risk');
    }
    
    // Risk delta (acceleration)
    if (entity.riskDelta > 5) {
      value += Math.min(entity.riskDelta * 2, 25);
      direction = 'down';
      factors.push('risk accelerating');
    } else if (entity.riskDelta < -5) {
      value -= Math.min(Math.abs(entity.riskDelta) * 2, 15);
      direction = 'up';
      factors.push('risk decelerating');
    }
    
    // High risk entities
    if (entity.highRiskEntities.length > 3) {
      value += Math.min(entity.highRiskEntities.length * 3, 20);
      factors.push(`${entity.highRiskEntities.length} high-risk entities`);
    }
    
    // Accelerating entities
    if (entity.acceleratingEntities.length > 2) {
      value += Math.min(entity.acceleratingEntities.length * 4, 20);
      factors.push(`${entity.acceleratingEntities.length} accelerating entities`);
    }
    
    value = Math.max(0, Math.min(100, value));
    
    return {
      value,
      direction,
      description: factors.length > 0 ? `Entity risk: ${factors.join(', ')}` : 'Stable entity risk',
    };
  }

  /**
   * Calculate weighted pressure score from components
   */
  private calculateWeightedPressure(components: PressureComponent[]): number {
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const component of components) {
      weightedSum += component.value * component.weight;
      totalWeight += component.weight;
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 50;
  }

  /**
   * Determine overall pressure direction
   */
  private determinePressureDirection(components: PressureComponent[], inputs: MarketPressureInputs): PressureDirection {
    let upVotes = 0;
    let downVotes = 0;
    
    for (const component of components) {
      if (component.direction === 'up') upVotes += component.weight;
      else if (component.direction === 'down') downVotes += component.weight;
    }
    
    // Price change as tiebreaker
    if (inputs.priceChange !== undefined) {
      if (inputs.priceChange > 1) upVotes += 0.1;
      else if (inputs.priceChange < -1) downVotes += 0.1;
    }
    
    if (upVotes > downVotes + 0.1) return 'up';
    if (downVotes > upVotes + 0.1) return 'down';
    return 'neutral';
  }

  /**
   * Extract contributing entities from inputs
   */
  private extractContributingEntities(inputs: MarketPressureInputs): EntityId[] {
    const entities: EntityId[] = [];
    
    if (inputs.whaleIntel?.activeWhales) {
      entities.push(...inputs.whaleIntel.activeWhales.slice(0, 5));
    }
    
    if (inputs.entityRisk?.highRiskEntities) {
      for (const entity of inputs.entityRisk.highRiskEntities) {
        if (!entities.includes(entity)) {
          entities.push(entity);
        }
      }
    }
    
    if (inputs.entityRisk?.acceleratingEntities) {
      for (const entity of inputs.entityRisk.acceleratingEntities) {
        if (!entities.includes(entity)) {
          entities.push(entity);
        }
      }
    }
    
    return entities.slice(0, 10);
  }

  /**
   * Generate human-readable pressure drivers
   */
  private generatePressureDrivers(components: PressureComponent[]): string[] {
    const drivers: string[] = [];
    
    // Sort by value (highest pressure first)
    const sorted = [...components].sort((a, b) => b.value - a.value);
    
    for (const component of sorted.slice(0, 3)) {
      if (component.value > 60) {
        drivers.push(component.description);
      }
    }
    
    if (drivers.length === 0) {
      drivers.push('Market pressure within normal range');
    }
    
    return drivers;
  }

  /**
   * Calculate risk acceleration from historical data
   */
  private calculateRiskAcceleration(inputs: MarketPressureInputs): number {
    // Use entity risk delta if available
    if (inputs.entityRisk?.riskDelta !== undefined) {
      return inputs.entityRisk.riskDelta;
    }
    
    // Calculate from history
    if (this.pressureHistory.length < 2) return 0;
    
    const recent = this.pressureHistory.slice(-5);
    if (recent.length < 2) return 0;
    
    const first = recent[0].pressureScore;
    const last = recent[recent.length - 1].pressureScore;
    const timeDiff = (recent[recent.length - 1].timestamp - recent[0].timestamp) / 1000;  // seconds
    
    if (timeDiff === 0) return 0;
    
    return (last - first) / timeDiff * 10;  // Normalized acceleration
  }

  // ============================================================
  // Continuous Scanning
  // ============================================================

  /**
   * Start continuous scanning with a callback
   */
  startContinuousScanning(
    getInputs: () => MarketPressureInputs,
    onReading: (reading: PressureReading) => void
  ): void {
    if (this.isScanning) {
      this.log('Already scanning, stopping previous scan');
      this.stopContinuousScanning();
    }
    
    this.isScanning = true;
    this.log(`Starting continuous scanning every ${this.config.scanIntervalMs}ms`);
    
    this.scanInterval = setInterval(() => {
      try {
        const inputs = getInputs();
        const reading = this.scan(inputs);
        onReading(reading);
      } catch (error) {
        this.log('Error during scan', error);
      }
    }, this.config.scanIntervalMs);
  }

  /**
   * Stop continuous scanning
   */
  stopContinuousScanning(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    this.isScanning = false;
    this.log('Stopped continuous scanning');
  }

  /**
   * Check if currently scanning
   */
  isScanningActive(): boolean {
    return this.isScanning;
  }

  // ============================================================
  // History and Stats
  // ============================================================

  private addToHistory(reading: PressureReading): void {
    this.pressureHistory.push(reading);
    if (this.pressureHistory.length > this.config.historySize) {
      this.pressureHistory.shift();
    }
  }

  private updateStats(reading: PressureReading): void {
    this.stats.totalScans++;
    this.stats.lastScanTime = reading.timestamp;
    
    // Update average
    this.stats.averagePressure = 
      (this.stats.averagePressure * (this.stats.totalScans - 1) + reading.pressureScore) / 
      this.stats.totalScans;
    
    // Track high pressure events
    if (reading.pressureScore >= this.config.pressureThresholds.high) {
      this.stats.highPressureEvents++;
    }
    if (reading.pressureScore >= this.config.pressureThresholds.critical) {
      this.stats.criticalPressureEvents++;
    }
  }

  /**
   * Get the latest pressure reading
   */
  getLatestReading(): PressureReading | null {
    return this.pressureHistory.length > 0 
      ? this.pressureHistory[this.pressureHistory.length - 1] 
      : null;
  }

  /**
   * Get pressure history
   */
  getHistory(limit?: number): PressureReading[] {
    if (limit) {
      return this.pressureHistory.slice(-limit);
    }
    return [...this.pressureHistory];
  }

  /**
   * Get pressure trend over time
   */
  getPressureTrend(windowSize: number = 10): 'increasing' | 'decreasing' | 'stable' {
    if (this.pressureHistory.length < windowSize) return 'stable';
    
    const recent = this.pressureHistory.slice(-windowSize);
    const first = recent.slice(0, Math.floor(windowSize / 2));
    const second = recent.slice(Math.floor(windowSize / 2));
    
    const firstAvg = first.reduce((sum, r) => sum + r.pressureScore, 0) / first.length;
    const secondAvg = second.reduce((sum, r) => sum + r.pressureScore, 0) / second.length;
    
    if (secondAvg > firstAvg + 5) return 'increasing';
    if (secondAvg < firstAvg - 5) return 'decreasing';
    return 'stable';
  }

  /**
   * Get current pressure level classification
   */
  getPressureLevel(): 'low' | 'medium' | 'high' | 'critical' {
    const latest = this.getLatestReading();
    if (!latest) return 'low';
    
    const score = latest.pressureScore;
    if (score >= this.config.pressureThresholds.critical) return 'critical';
    if (score >= this.config.pressureThresholds.high) return 'high';
    if (score >= this.config.pressureThresholds.medium) return 'medium';
    return 'low';
  }

  /**
   * Check if pressure is above threshold
   */
  isPressureElevated(): boolean {
    const level = this.getPressureLevel();
    return level === 'high' || level === 'critical';
  }

  /**
   * Get scanner statistics
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Get current configuration
   */
  getConfig(): PressureScannerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PressureScannerConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.pressureHistory = [];
    this.log('History cleared');
  }

  /**
   * Reset scanner
   */
  reset(): void {
    this.stopContinuousScanning();
    this.pressureHistory = [];
    this.lastInputs = null;
    this.scanCounter = 0;
    this.stats = {
      totalScans: 0,
      averagePressure: 50,
      highPressureEvents: 0,
      criticalPressureEvents: 0,
      lastScanTime: 0,
    };
    this.log('Scanner reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let scannerInstance: MarketPressureScannerImpl | null = null;

/**
 * Get the singleton MarketPressureScanner instance
 */
export function getMarketPressureScanner(config?: Partial<PressureScannerConfig>): MarketPressureScannerImpl {
  if (!scannerInstance) {
    scannerInstance = new MarketPressureScannerImpl(config);
  }
  return scannerInstance;
}

/**
 * Create a new MarketPressureScanner with custom config
 */
export function createMarketPressureScanner(config?: Partial<PressureScannerConfig>): MarketPressureScannerImpl {
  return new MarketPressureScannerImpl(config);
}
