/**
 * Phase 7: Autonomous Market Watchdog
 * MODULE 4 - ManipulationDetector.ts
 * 
 * Looks for early signs of market manipulation:
 * - Spoofing
 * - Wash trading
 * - Coordinated manipulation
 * - Pump groups
 * - Layered selling
 * - Fake liquidity walls
 * 
 * Returns probability, manipulator entities, manipulation cluster ID,
 * and warning narrative.
 * 
 * This module is 100% isolated and additive - no modifications to existing code.
 */

// ============================================================
// Types and Interfaces
// ============================================================

export type ManipulationType = 
  | 'spoofing'
  | 'wash_trading'
  | 'coordinated_manipulation'
  | 'pump_group'
  | 'layered_selling'
  | 'fake_liquidity_wall'
  | 'front_running'
  | 'painting_the_tape'
  | 'bear_raid'
  | 'bull_trap';

export type ManipulationSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ManipulatorEntity {
  id: string;
  address?: string;
  type: 'whale' | 'bot' | 'exchange' | 'unknown';
  confidence: number;
  activityScore: number;
  recentActions: string[];
}

export interface ManipulationSignal {
  id: string;
  type: ManipulationType;
  severity: ManipulationSeverity;
  probability: number;  // 0-1
  confidence: number;   // 0-1
  manipulatorEntities: ManipulatorEntity[];
  clusterId: string;
  warningNarrative: string;
  technicalDetails: string;
  suggestedAction: string;
  affectedPriceRange: { low: number; high: number };
  estimatedImpact: 'minimal' | 'moderate' | 'significant' | 'severe';
  timestamp: number;
  expiresAt: number;
}

export interface OrderFlowData {
  buyVolume: number;
  sellVolume: number;
  largeOrderCount: number;
  smallOrderCount: number;
  cancelRate: number;
  orderToTradeRatio: number;
  averageOrderLifeMs: number;
}

export interface TradeData {
  price: number;
  volume: number;
  side: 'buy' | 'sell';
  timestamp: number;
  maker?: string;
  taker?: string;
}

export interface OrderBookChange {
  price: number;
  sizeDelta: number;
  side: 'bid' | 'ask';
  timestamp: number;
}

export interface EntityActivity {
  entityId: string;
  recentTrades: TradeData[];
  orderPatterns: string[];
  volumeShare: number;
  suspicionScore: number;
}

export interface ManipulationDetectorInputs {
  orderFlow?: OrderFlowData;
  recentTrades?: TradeData[];
  orderBookChanges?: OrderBookChange[];
  entityActivities?: EntityActivity[];
  currentPrice: number;
  priceChange24h?: number;
  volumeChange24h?: number;
}

export interface ManipulationDetectorConfig {
  spoofingCancelRateThreshold: number;
  washTradingVolumeThreshold: number;
  coordinatedActivityThreshold: number;
  pumpGroupVolumeSpike: number;
  layeredSellingDepthThreshold: number;
  fakeWallSizeThreshold: number;
  signalTTLMs: number;
  maxSignalsStored: number;
  minProbability: number;
  enableLogging: boolean;
  logPrefix: string;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: ManipulationDetectorConfig = {
  spoofingCancelRateThreshold: 0.7,    // 70% cancel rate
  washTradingVolumeThreshold: 0.3,     // 30% of volume from same entities
  coordinatedActivityThreshold: 0.5,   // 50% correlation
  pumpGroupVolumeSpike: 3,             // 3x normal volume
  layeredSellingDepthThreshold: 5,     // 5 layers
  fakeWallSizeThreshold: 0.2,          // 20% of total depth
  signalTTLMs: 300000,                 // 5 minutes
  maxSignalsStored: 100,
  minProbability: 0.5,
  enableLogging: true,
  logPrefix: '[ManipulationDetector]',
};

// ============================================================
// ManipulationDetector Implementation
// ============================================================

class ManipulationDetectorImpl {
  private config: ManipulationDetectorConfig;
  private activeSignals: Map<string, ManipulationSignal> = new Map();
  private signalHistory: ManipulationSignal[] = [];
  private signalCounter = 0;
  private clusterCounter = 0;
  
  private stats = {
    totalSignalsDetected: 0,
    signalsByType: {} as Record<ManipulationType, number>,
    signalsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
    averageProbability: 0,
    lastDetectionTime: 0,
  };

  constructor(config?: Partial<ManipulationDetectorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeStats();
    this.log('ManipulationDetector initialized');
  }

  private initializeStats(): void {
    const types: ManipulationType[] = [
      'spoofing', 'wash_trading', 'coordinated_manipulation', 'pump_group',
      'layered_selling', 'fake_liquidity_wall', 'front_running',
      'painting_the_tape', 'bear_raid', 'bull_trap'
    ];
    for (const type of types) {
      this.stats.signalsByType[type] = 0;
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
  // Main Detection
  // ============================================================

  /**
   * Detect manipulation signals from inputs
   */
  detect(inputs: ManipulationDetectorInputs): ManipulationSignal[] {
    const now = Date.now();
    this.cleanupExpiredSignals();
    
    const detectedSignals: ManipulationSignal[] = [];
    
    // Detect spoofing
    if (inputs.orderFlow) {
      const spoofingSignal = this.detectSpoofing(inputs.orderFlow, inputs.currentPrice);
      if (spoofingSignal) detectedSignals.push(spoofingSignal);
    }
    
    // Detect wash trading
    if (inputs.recentTrades && inputs.entityActivities) {
      const washTradingSignal = this.detectWashTrading(
        inputs.recentTrades, 
        inputs.entityActivities,
        inputs.currentPrice
      );
      if (washTradingSignal) detectedSignals.push(washTradingSignal);
    }
    
    // Detect coordinated manipulation
    if (inputs.entityActivities) {
      const coordinatedSignal = this.detectCoordinatedManipulation(
        inputs.entityActivities,
        inputs.currentPrice
      );
      if (coordinatedSignal) detectedSignals.push(coordinatedSignal);
    }
    
    // Detect pump groups
    if (inputs.volumeChange24h !== undefined && inputs.priceChange24h !== undefined) {
      const pumpSignal = this.detectPumpGroup(
        inputs.volumeChange24h,
        inputs.priceChange24h,
        inputs.currentPrice,
        inputs.entityActivities
      );
      if (pumpSignal) detectedSignals.push(pumpSignal);
    }
    
    // Detect layered selling
    if (inputs.orderBookChanges) {
      const layeredSignal = this.detectLayeredSelling(
        inputs.orderBookChanges,
        inputs.currentPrice
      );
      if (layeredSignal) detectedSignals.push(layeredSignal);
    }
    
    // Detect fake liquidity walls
    if (inputs.orderBookChanges && inputs.orderFlow) {
      const fakeWallSignal = this.detectFakeLiquidityWall(
        inputs.orderBookChanges,
        inputs.orderFlow,
        inputs.currentPrice
      );
      if (fakeWallSignal) detectedSignals.push(fakeWallSignal);
    }
    
    // Detect painting the tape
    if (inputs.recentTrades) {
      const paintingSignal = this.detectPaintingTheTape(
        inputs.recentTrades,
        inputs.currentPrice
      );
      if (paintingSignal) detectedSignals.push(paintingSignal);
    }
    
    // Detect bear raid / bull trap
    if (inputs.recentTrades && inputs.orderBookChanges) {
      const raidSignal = this.detectBearRaidOrBullTrap(
        inputs.recentTrades,
        inputs.orderBookChanges,
        inputs.currentPrice,
        inputs.priceChange24h
      );
      if (raidSignal) detectedSignals.push(raidSignal);
    }
    
    // Filter by probability and add to active signals
    const validSignals = detectedSignals.filter(s => s.probability >= this.config.minProbability);
    
    for (const signal of validSignals) {
      this.addSignal(signal);
    }
    
    this.stats.lastDetectionTime = now;
    
    if (validSignals.length > 0) {
      this.log(`Detected ${validSignals.length} manipulation signals`);
    }
    
    return validSignals;
  }

  // ============================================================
  // Manipulation Type Detection
  // ============================================================

  /**
   * Detect spoofing (placing and canceling large orders)
   */
  private detectSpoofing(orderFlow: OrderFlowData, currentPrice: number): ManipulationSignal | null {
    if (orderFlow.cancelRate < this.config.spoofingCancelRateThreshold) {
      return null;
    }
    
    // High cancel rate with short order life indicates spoofing
    const isShortLived = orderFlow.averageOrderLifeMs < 5000;  // Less than 5 seconds
    const highOrderToTrade = orderFlow.orderToTradeRatio > 10;
    
    if (!isShortLived && !highOrderToTrade) {
      return null;
    }
    
    const probability = this.calculateSpoofingProbability(orderFlow);
    
    if (probability < this.config.minProbability) {
      return null;
    }
    
    return this.createSignal({
      type: 'spoofing',
      probability,
      confidence: 0.75,
      manipulatorEntities: [],
      warningNarrative: `Spoofing detected: ${(orderFlow.cancelRate * 100).toFixed(0)}% order cancel rate with ${orderFlow.averageOrderLifeMs}ms average order life`,
      technicalDetails: `Order-to-trade ratio: ${orderFlow.orderToTradeRatio.toFixed(1)}, Large orders: ${orderFlow.largeOrderCount}`,
      suggestedAction: 'Do not rely on visible order book depth. Use limit orders with caution.',
      currentPrice,
      estimatedImpact: probability > 0.8 ? 'significant' : 'moderate',
    });
  }

  /**
   * Detect wash trading (self-trading to inflate volume)
   */
  private detectWashTrading(
    trades: TradeData[],
    entities: EntityActivity[],
    currentPrice: number
  ): ManipulationSignal | null {
    // Look for trades where maker and taker are related
    const suspiciousTrades = trades.filter(t => 
      t.maker && t.taker && this.areEntitiesRelated(t.maker, t.taker, entities)
    );
    
    const washTradingRatio = suspiciousTrades.length / Math.max(trades.length, 1);
    
    if (washTradingRatio < this.config.washTradingVolumeThreshold) {
      return null;
    }
    
    const washVolume = suspiciousTrades.reduce((sum, t) => sum + t.volume, 0);
    const totalVolume = trades.reduce((sum, t) => sum + t.volume, 0);
    const volumeRatio = washVolume / Math.max(totalVolume, 1);
    
    const probability = Math.min(volumeRatio * 1.5, 0.95);
    
    if (probability < this.config.minProbability) {
      return null;
    }
    
    // Identify manipulators
    const manipulators = this.identifyWashTraders(suspiciousTrades, entities);
    
    return this.createSignal({
      type: 'wash_trading',
      probability,
      confidence: 0.7,
      manipulatorEntities: manipulators,
      warningNarrative: `Wash trading detected: ${(volumeRatio * 100).toFixed(0)}% of volume appears to be self-trading`,
      technicalDetails: `${suspiciousTrades.length} suspicious trades, ${washVolume.toFixed(0)} volume affected`,
      suggestedAction: 'Volume may be artificially inflated. Do not use volume as a signal.',
      currentPrice,
      estimatedImpact: volumeRatio > 0.5 ? 'significant' : 'moderate',
    });
  }

  /**
   * Detect coordinated manipulation
   */
  private detectCoordinatedManipulation(
    entities: EntityActivity[],
    currentPrice: number
  ): ManipulationSignal | null {
    // Look for entities acting in coordination
    const highSuspicionEntities = entities.filter(e => e.suspicionScore > 70);
    
    if (highSuspicionEntities.length < 2) {
      return null;
    }
    
    // Check for pattern correlation
    const correlationScore = this.calculatePatternCorrelation(highSuspicionEntities);
    
    if (correlationScore < this.config.coordinatedActivityThreshold) {
      return null;
    }
    
    const probability = Math.min(correlationScore * 1.2, 0.95);
    
    const manipulators = highSuspicionEntities.map(e => ({
      id: e.entityId,
      type: 'unknown' as const,
      confidence: e.suspicionScore / 100,
      activityScore: e.volumeShare * 100,
      recentActions: e.orderPatterns,
    }));
    
    return this.createSignal({
      type: 'coordinated_manipulation',
      probability,
      confidence: 0.65,
      manipulatorEntities: manipulators,
      warningNarrative: `Coordinated manipulation detected: ${highSuspicionEntities.length} entities showing ${(correlationScore * 100).toFixed(0)}% pattern correlation`,
      technicalDetails: `Combined volume share: ${(highSuspicionEntities.reduce((sum, e) => sum + e.volumeShare, 0) * 100).toFixed(0)}%`,
      suggestedAction: 'Multiple entities acting together. Exercise extreme caution.',
      currentPrice,
      estimatedImpact: manipulators.length > 3 ? 'severe' : 'significant',
    });
  }

  /**
   * Detect pump group activity
   */
  private detectPumpGroup(
    volumeChange: number,
    priceChange: number,
    currentPrice: number,
    entities?: EntityActivity[]
  ): ManipulationSignal | null {
    // Pump groups cause sudden volume and price spikes
    const isVolumeSpike = volumeChange > this.config.pumpGroupVolumeSpike;
    const isPriceSpike = priceChange > 10;  // More than 10% price increase
    
    if (!isVolumeSpike || !isPriceSpike) {
      return null;
    }
    
    // Calculate probability based on spike magnitude
    const volumeFactor = Math.min(volumeChange / this.config.pumpGroupVolumeSpike, 3);
    const priceFactor = Math.min(priceChange / 10, 3);
    const probability = Math.min((volumeFactor * priceFactor) / 9 * 0.9, 0.95);
    
    if (probability < this.config.minProbability) {
      return null;
    }
    
    // Identify potential pump participants
    const manipulators: ManipulatorEntity[] = [];
    if (entities) {
      const topVolume = entities
        .filter(e => e.volumeShare > 0.1)
        .slice(0, 5);
      
      for (const e of topVolume) {
        manipulators.push({
          id: e.entityId,
          type: 'unknown',
          confidence: e.suspicionScore / 100,
          activityScore: e.volumeShare * 100,
          recentActions: e.orderPatterns,
        });
      }
    }
    
    return this.createSignal({
      type: 'pump_group',
      probability,
      confidence: 0.7,
      manipulatorEntities: manipulators,
      warningNarrative: `Pump group activity detected: ${volumeChange.toFixed(0)}x volume spike with ${priceChange.toFixed(1)}% price increase`,
      technicalDetails: `Volume multiplier: ${volumeChange.toFixed(1)}x, Price change: +${priceChange.toFixed(1)}%`,
      suggestedAction: 'DANGER: Likely pump and dump. Do not FOMO buy. Expect sharp reversal.',
      currentPrice,
      estimatedImpact: 'severe',
    });
  }

  /**
   * Detect layered selling
   */
  private detectLayeredSelling(
    orderBookChanges: OrderBookChange[],
    currentPrice: number
  ): ManipulationSignal | null {
    // Look for multiple sell orders placed at incrementing prices
    const askChanges = orderBookChanges
      .filter(c => c.side === 'ask' && c.sizeDelta > 0)
      .sort((a, b) => a.price - b.price);
    
    if (askChanges.length < this.config.layeredSellingDepthThreshold) {
      return null;
    }
    
    // Check for layered pattern (orders at regular intervals)
    const layers = this.detectLayeredPattern(askChanges);
    
    if (layers.length < this.config.layeredSellingDepthThreshold) {
      return null;
    }
    
    const totalLayeredVolume = layers.reduce((sum, l) => sum + l.sizeDelta, 0);
    const probability = Math.min(layers.length / 10, 0.9);
    
    return this.createSignal({
      type: 'layered_selling',
      probability,
      confidence: 0.75,
      manipulatorEntities: [],
      warningNarrative: `Layered selling detected: ${layers.length} sell layers above current price`,
      technicalDetails: `Total layered volume: ${totalLayeredVolume.toFixed(0)}, Price range: ${layers[0].price.toFixed(2)} to ${layers[layers.length - 1].price.toFixed(2)}`,
      suggestedAction: 'Heavy sell pressure above. Upside may be limited.',
      currentPrice,
      estimatedImpact: layers.length > 7 ? 'significant' : 'moderate',
    });
  }

  /**
   * Detect fake liquidity walls
   */
  private detectFakeLiquidityWall(
    orderBookChanges: OrderBookChange[],
    orderFlow: OrderFlowData,
    currentPrice: number
  ): ManipulationSignal | null {
    // Look for large orders that get canceled frequently
    const largeOrders = orderBookChanges.filter(c => 
      Math.abs(c.sizeDelta) > 1000  // Large size
    );
    
    if (largeOrders.length === 0) {
      return null;
    }
    
    // Check if these large orders are being canceled (high cancel rate)
    if (orderFlow.cancelRate < 0.5) {
      return null;
    }
    
    // Find the largest wall
    const largestWall = largeOrders.reduce((max, o) => 
      Math.abs(o.sizeDelta) > Math.abs(max.sizeDelta) ? o : max
    );
    
    const probability = Math.min(orderFlow.cancelRate * 1.2, 0.9);
    
    if (probability < this.config.minProbability) {
      return null;
    }
    
    const wallSide = largestWall.side === 'bid' ? 'buy' : 'sell';
    
    return this.createSignal({
      type: 'fake_liquidity_wall',
      probability,
      confidence: 0.7,
      manipulatorEntities: [],
      warningNarrative: `Fake ${wallSide} wall detected at ${largestWall.price.toFixed(2)} (${Math.abs(largestWall.sizeDelta).toFixed(0)} units)`,
      technicalDetails: `Cancel rate: ${(orderFlow.cancelRate * 100).toFixed(0)}%, Wall size: ${Math.abs(largestWall.sizeDelta).toFixed(0)}`,
      suggestedAction: `Do not rely on this ${wallSide} wall for support/resistance. It may be pulled.`,
      currentPrice,
      estimatedImpact: 'moderate',
    });
  }

  /**
   * Detect painting the tape (small trades to move price)
   */
  private detectPaintingTheTape(
    trades: TradeData[],
    currentPrice: number
  ): ManipulationSignal | null {
    // Look for many small trades in one direction
    const recentTrades = trades.slice(-50);
    
    if (recentTrades.length < 20) {
      return null;
    }
    
    const buyTrades = recentTrades.filter(t => t.side === 'buy');
    const sellTrades = recentTrades.filter(t => t.side === 'sell');
    
    const buyRatio = buyTrades.length / recentTrades.length;
    const sellRatio = sellTrades.length / recentTrades.length;
    
    // Check for one-sided small trades
    const avgVolume = recentTrades.reduce((sum, t) => sum + t.volume, 0) / recentTrades.length;
    const smallTrades = recentTrades.filter(t => t.volume < avgVolume * 0.3);
    const smallTradeRatio = smallTrades.length / recentTrades.length;
    
    if (smallTradeRatio < 0.6) {
      return null;
    }
    
    const isOneSided = buyRatio > 0.75 || sellRatio > 0.75;
    
    if (!isOneSided) {
      return null;
    }
    
    const direction = buyRatio > sellRatio ? 'buy' : 'sell';
    const probability = Math.min(smallTradeRatio * (Math.max(buyRatio, sellRatio)), 0.85);
    
    if (probability < this.config.minProbability) {
      return null;
    }
    
    return this.createSignal({
      type: 'painting_the_tape',
      probability,
      confidence: 0.65,
      manipulatorEntities: [],
      warningNarrative: `Painting the tape detected: ${(smallTradeRatio * 100).toFixed(0)}% small ${direction} trades`,
      technicalDetails: `${direction === 'buy' ? buyRatio : sellRatio * 100}% ${direction} trades, avg volume: ${avgVolume.toFixed(0)}`,
      suggestedAction: 'Price movement may be artificial. Wait for confirmation with real volume.',
      currentPrice,
      estimatedImpact: 'moderate',
    });
  }

  /**
   * Detect bear raid or bull trap
   */
  private detectBearRaidOrBullTrap(
    trades: TradeData[],
    orderBookChanges: OrderBookChange[],
    currentPrice: number,
    priceChange24h?: number
  ): ManipulationSignal | null {
    if (priceChange24h === undefined) {
      return null;
    }
    
    // Bear raid: coordinated selling to trigger stops
    // Bull trap: fake breakout followed by reversal
    
    const recentTrades = trades.slice(-100);
    const sellPressure = recentTrades.filter(t => t.side === 'sell').length / recentTrades.length;
    const buyPressure = 1 - sellPressure;
    
    // Check for bear raid (high sell pressure with price drop)
    if (sellPressure > 0.7 && priceChange24h < -5) {
      const probability = Math.min(sellPressure * Math.abs(priceChange24h) / 10, 0.85);
      
      if (probability >= this.config.minProbability) {
        return this.createSignal({
          type: 'bear_raid',
          probability,
          confidence: 0.6,
          manipulatorEntities: [],
          warningNarrative: `Bear raid detected: ${(sellPressure * 100).toFixed(0)}% sell pressure with ${priceChange24h.toFixed(1)}% price drop`,
          technicalDetails: `Sell pressure: ${(sellPressure * 100).toFixed(0)}%, 24h change: ${priceChange24h.toFixed(1)}%`,
          suggestedAction: 'Coordinated selling may be triggering stops. Avoid panic selling.',
          currentPrice,
          estimatedImpact: 'significant',
        });
      }
    }
    
    // Check for bull trap (high buy pressure with recent price spike)
    if (buyPressure > 0.7 && priceChange24h > 5) {
      // Look for reversal signs in order book
      const recentAskIncreases = orderBookChanges.filter(c => 
        c.side === 'ask' && c.sizeDelta > 0
      ).length;
      
      if (recentAskIncreases > 5) {
        const probability = Math.min(buyPressure * priceChange24h / 15, 0.8);
        
        if (probability >= this.config.minProbability) {
          return this.createSignal({
            type: 'bull_trap',
            probability,
            confidence: 0.55,
            manipulatorEntities: [],
            warningNarrative: `Bull trap warning: ${priceChange24h.toFixed(1)}% spike with increasing sell orders`,
            technicalDetails: `Buy pressure: ${(buyPressure * 100).toFixed(0)}%, New sell orders: ${recentAskIncreases}`,
            suggestedAction: 'Breakout may be fake. Wait for confirmation before buying.',
            currentPrice,
            estimatedImpact: 'moderate',
          });
        }
      }
    }
    
    return null;
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  private createSignal(params: {
    type: ManipulationType;
    probability: number;
    confidence: number;
    manipulatorEntities: ManipulatorEntity[];
    warningNarrative: string;
    technicalDetails: string;
    suggestedAction: string;
    currentPrice: number;
    estimatedImpact: 'minimal' | 'moderate' | 'significant' | 'severe';
  }): ManipulationSignal {
    this.signalCounter++;
    this.clusterCounter++;
    const now = Date.now();
    
    const severity = this.determineSeverity(params.probability, params.estimatedImpact);
    
    return {
      id: `manip_${now}_${this.signalCounter}`,
      type: params.type,
      severity,
      probability: params.probability,
      confidence: params.confidence,
      manipulatorEntities: params.manipulatorEntities,
      clusterId: `cluster_${this.clusterCounter}`,
      warningNarrative: params.warningNarrative,
      technicalDetails: params.technicalDetails,
      suggestedAction: params.suggestedAction,
      affectedPriceRange: {
        low: params.currentPrice * 0.95,
        high: params.currentPrice * 1.05,
      },
      estimatedImpact: params.estimatedImpact,
      timestamp: now,
      expiresAt: now + this.config.signalTTLMs,
    };
  }

  private determineSeverity(probability: number, impact: string): ManipulationSeverity {
    const impactScore = { minimal: 1, moderate: 2, significant: 3, severe: 4 }[impact] || 2;
    const combinedScore = probability * impactScore;
    
    if (combinedScore >= 3) return 'critical';
    if (combinedScore >= 2) return 'high';
    if (combinedScore >= 1) return 'medium';
    return 'low';
  }

  private calculateSpoofingProbability(orderFlow: OrderFlowData): number {
    let probability = 0;
    
    // Cancel rate contribution
    probability += (orderFlow.cancelRate - 0.5) * 0.5;
    
    // Order-to-trade ratio contribution
    if (orderFlow.orderToTradeRatio > 5) {
      probability += Math.min((orderFlow.orderToTradeRatio - 5) / 20, 0.3);
    }
    
    // Short order life contribution
    if (orderFlow.averageOrderLifeMs < 5000) {
      probability += (5000 - orderFlow.averageOrderLifeMs) / 10000;
    }
    
    return Math.min(Math.max(probability, 0), 0.95);
  }

  private areEntitiesRelated(maker: string, taker: string, entities: EntityActivity[]): boolean {
    // Simple check - same entity or similar patterns
    if (maker === taker) return true;
    
    const makerEntity = entities.find(e => e.entityId === maker);
    const takerEntity = entities.find(e => e.entityId === taker);
    
    if (!makerEntity || !takerEntity) return false;
    
    // Check for pattern similarity
    const commonPatterns = makerEntity.orderPatterns.filter(p => 
      takerEntity.orderPatterns.includes(p)
    );
    
    return commonPatterns.length > 2;
  }

  private identifyWashTraders(trades: TradeData[], entities: EntityActivity[]): ManipulatorEntity[] {
    const entityCounts = new Map<string, number>();
    
    for (const trade of trades) {
      if (trade.maker) {
        entityCounts.set(trade.maker, (entityCounts.get(trade.maker) || 0) + 1);
      }
      if (trade.taker) {
        entityCounts.set(trade.taker, (entityCounts.get(trade.taker) || 0) + 1);
      }
    }
    
    const manipulators: ManipulatorEntity[] = [];
    
    const entityEntries = Array.from(entityCounts.entries());
    for (const [entityId, count] of entityEntries) {
      if (count > trades.length * 0.2) {
        const entity = entities.find(e => e.entityId === entityId);
        manipulators.push({
          id: entityId,
          type: 'unknown',
          confidence: Math.min(count / trades.length, 0.9),
          activityScore: entity?.volumeShare ? entity.volumeShare * 100 : count,
          recentActions: entity?.orderPatterns || [],
        });
      }
    }
    
    return manipulators.slice(0, 5);
  }

  private calculatePatternCorrelation(entities: EntityActivity[]): number {
    if (entities.length < 2) return 0;
    
    let totalCorrelation = 0;
    let comparisons = 0;
    
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const commonPatterns = entities[i].orderPatterns.filter(p =>
          entities[j].orderPatterns.includes(p)
        );
        const maxPatterns = Math.max(
          entities[i].orderPatterns.length,
          entities[j].orderPatterns.length
        );
        
        if (maxPatterns > 0) {
          totalCorrelation += commonPatterns.length / maxPatterns;
          comparisons++;
        }
      }
    }
    
    return comparisons > 0 ? totalCorrelation / comparisons : 0;
  }

  private detectLayeredPattern(orders: OrderBookChange[]): OrderBookChange[] {
    const layers: OrderBookChange[] = [];
    
    for (let i = 0; i < orders.length - 1; i++) {
      const current = orders[i];
      const next = orders[i + 1];
      
      // Check for regular price intervals
      const priceDiff = next.price - current.price;
      const avgPrice = (current.price + next.price) / 2;
      const percentDiff = (priceDiff / avgPrice) * 100;
      
      // Layers typically have 0.1-0.5% spacing
      if (percentDiff > 0.05 && percentDiff < 1) {
        layers.push(current);
      }
    }
    
    if (orders.length > 0) {
      layers.push(orders[orders.length - 1]);
    }
    
    return layers;
  }

  private addSignal(signal: ManipulationSignal): void {
    // Check for duplicate
    const existingKey = `${signal.type}_${Math.floor(signal.timestamp / 60000)}`;
    
    if (!this.activeSignals.has(existingKey)) {
      this.activeSignals.set(signal.id, signal);
      this.signalHistory.push(signal);
      
      // Trim history
      if (this.signalHistory.length > this.config.maxSignalsStored) {
        this.signalHistory.shift();
      }
      
      // Update stats
      this.stats.totalSignalsDetected++;
      this.stats.signalsByType[signal.type]++;
      this.stats.signalsBySeverity[signal.severity]++;
      this.stats.averageProbability = 
        (this.stats.averageProbability * (this.stats.totalSignalsDetected - 1) + signal.probability) /
        this.stats.totalSignalsDetected;
    }
  }

  private cleanupExpiredSignals(): void {
    const now = Date.now();
    const entries = Array.from(this.activeSignals.entries());
    for (const [id, signal] of entries) {
      if (signal.expiresAt < now) {
        this.activeSignals.delete(id);
      }
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get all active manipulation signals
   */
  getActiveSignals(): ManipulationSignal[] {
    this.cleanupExpiredSignals();
    return Array.from(this.activeSignals.values());
  }

  /**
   * Get signals by type
   */
  getSignalsByType(type: ManipulationType): ManipulationSignal[] {
    return this.getActiveSignals().filter(s => s.type === type);
  }

  /**
   * Get signals by severity
   */
  getSignalsBySeverity(severity: ManipulationSeverity): ManipulationSignal[] {
    return this.getActiveSignals().filter(s => s.severity === severity);
  }

  /**
   * Get critical signals
   */
  getCriticalSignals(): ManipulationSignal[] {
    return this.getSignalsBySeverity('critical');
  }

  /**
   * Get high priority signals (high + critical)
   */
  getHighPrioritySignals(): ManipulationSignal[] {
    return this.getActiveSignals().filter(s =>
      s.severity === 'high' || s.severity === 'critical'
    );
  }

  /**
   * Get signal history
   */
  getHistory(limit?: number): ManipulationSignal[] {
    if (limit) {
      return this.signalHistory.slice(-limit);
    }
    return [...this.signalHistory];
  }

  /**
   * Check if manipulation is detected
   */
  isManipulationDetected(): boolean {
    return this.getActiveSignals().length > 0;
  }

  /**
   * Check if critical manipulation is detected
   */
  hasCriticalManipulation(): boolean {
    return this.getCriticalSignals().length > 0;
  }

  /**
   * Get manipulation risk level
   */
  getManipulationRiskLevel(): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    const signals = this.getActiveSignals();
    
    if (signals.length === 0) return 'none';
    
    const maxSeverity = signals.reduce((max, s) => {
      const severityRank = { low: 1, medium: 2, high: 3, critical: 4 };
      return severityRank[s.severity] > severityRank[max] ? s.severity : max;
    }, 'low' as ManipulationSeverity);
    
    return maxSeverity;
  }

  /**
   * Get statistics
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Get configuration
   */
  getConfig(): ManipulationDetectorConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ManipulationDetectorConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Clear all signals
   */
  clearSignals(): void {
    this.activeSignals.clear();
    this.log('Active signals cleared');
  }

  /**
   * Reset detector
   */
  reset(): void {
    this.activeSignals.clear();
    this.signalHistory = [];
    this.signalCounter = 0;
    this.clusterCounter = 0;
    this.stats = {
      totalSignalsDetected: 0,
      signalsByType: {} as Record<ManipulationType, number>,
      signalsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      averageProbability: 0,
      lastDetectionTime: 0,
    };
    this.initializeStats();
    this.log('Detector reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let detectorInstance: ManipulationDetectorImpl | null = null;

/**
 * Get the singleton ManipulationDetector instance
 */
export function getManipulationDetector(config?: Partial<ManipulationDetectorConfig>): ManipulationDetectorImpl {
  if (!detectorInstance) {
    detectorInstance = new ManipulationDetectorImpl(config);
  }
  return detectorInstance;
}

/**
 * Create a new ManipulationDetector with custom config
 */
export function createManipulationDetector(config?: Partial<ManipulationDetectorConfig>): ManipulationDetectorImpl {
  return new ManipulationDetectorImpl(config);
}
