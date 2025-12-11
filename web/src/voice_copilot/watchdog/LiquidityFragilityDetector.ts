/**
 * Phase 7: Autonomous Market Watchdog
 * MODULE 3 - LiquidityFragilityDetector.ts
 * 
 * Identifies fragile zones where liquidity collapses:
 * - Thin pockets
 * - Imbalanced order books
 * - Whale "vacuum zones"
 * - Manipulation zones
 * - Stop-loss clusters
 * 
 * Returns actionable fragility alerts.
 * 
 * This module is 100% isolated and additive - no modifications to existing code.
 */

// ============================================================
// Types and Interfaces
// ============================================================

export type FragilityType = 
  | 'thin_pocket'
  | 'order_book_imbalance'
  | 'whale_vacuum'
  | 'manipulation_zone'
  | 'stop_loss_cluster'
  | 'liquidity_gap'
  | 'depth_collapse';

export type FragilitySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface PriceRange {
  low: number;
  high: number;
}

export interface FragilityZone {
  id: string;
  type: FragilityType;
  severity: FragilitySeverity;
  priceRange: PriceRange;
  currentPrice: number;
  distancePercent: number;  // Distance from current price
  liquidityDepth: number;   // How thin the liquidity is
  vulnerabilityScore: number;  // 0-100
  description: string;
  riskNarrative: string;
  suggestedAction: string;
  affectedVolume: number;
  estimatedSlippage: number;  // Estimated slippage if zone is hit
  timestamp: number;
  expiresAt: number;
}

export interface FragilityAlert {
  id: string;
  zones: FragilityZone[];
  overallFragility: number;  // 0-100
  criticalZoneCount: number;
  nearestCriticalZone: FragilityZone | null;
  marketVulnerability: 'stable' | 'fragile' | 'critical';
  summary: string;
  timestamp: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  side: 'bid' | 'ask';
}

export interface OrderBookSnapshot {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  midPrice: number;
  spread: number;
  spreadPercent: number;
  totalBidDepth: number;
  totalAskDepth: number;
  imbalanceRatio: number;
}

export interface WhalePositionData {
  address: string;
  position: number;
  entryPrice: number;
  liquidationPrice?: number;
  stopLossPrice?: number;
}

export interface StopLossCluster {
  priceLevel: number;
  estimatedVolume: number;
  clusterStrength: number;
}

export interface LiquidityFragilityInputs {
  orderBook?: OrderBookSnapshot;
  whalePositions?: WhalePositionData[];
  stopLossClusters?: StopLossCluster[];
  recentVolume?: number;
  volatility?: number;
  currentPrice: number;
}

export interface FragilityDetectorConfig {
  thinPocketThreshold: number;  // Minimum depth to not be considered thin
  imbalanceThreshold: number;   // Ratio threshold for imbalance
  vacuumZoneThreshold: number;  // Gap size to be considered vacuum
  stopLossClusterThreshold: number;  // Minimum cluster strength
  scanRangePercent: number;     // How far from current price to scan
  zoneTTLMs: number;
  maxZonesTracked: number;
  enableLogging: boolean;
  logPrefix: string;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: FragilityDetectorConfig = {
  thinPocketThreshold: 100,     // Units of liquidity
  imbalanceThreshold: 2.0,      // 2:1 ratio
  vacuumZoneThreshold: 0.5,     // 0.5% gap
  stopLossClusterThreshold: 50, // Cluster strength
  scanRangePercent: 5,          // 5% above and below current price
  zoneTTLMs: 180000,            // 3 minutes
  maxZonesTracked: 50,
  enableLogging: true,
  logPrefix: '[LiquidityFragilityDetector]',
};

// ============================================================
// LiquidityFragilityDetector Implementation
// ============================================================

class LiquidityFragilityDetectorImpl {
  private config: FragilityDetectorConfig;
  private activeZones: Map<string, FragilityZone> = new Map();
  private alertHistory: FragilityAlert[] = [];
  private zoneCounter = 0;
  private alertCounter = 0;
  
  private stats = {
    totalZonesDetected: 0,
    totalAlertsGenerated: 0,
    zonesBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
    zonesByType: {} as Record<FragilityType, number>,
    lastScanTime: 0,
  };

  constructor(config?: Partial<FragilityDetectorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeStats();
    this.log('LiquidityFragilityDetector initialized');
  }

  private initializeStats(): void {
    const types: FragilityType[] = [
      'thin_pocket', 'order_book_imbalance', 'whale_vacuum',
      'manipulation_zone', 'stop_loss_cluster', 'liquidity_gap', 'depth_collapse'
    ];
    for (const type of types) {
      this.stats.zonesByType[type] = 0;
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
   * Scan for liquidity fragility zones
   */
  scan(inputs: LiquidityFragilityInputs): FragilityAlert {
    const now = Date.now();
    this.cleanupExpiredZones();
    
    const detectedZones: FragilityZone[] = [];
    
    // Detect thin pockets
    if (inputs.orderBook) {
      detectedZones.push(...this.detectThinPockets(inputs.orderBook, inputs.currentPrice));
      detectedZones.push(...this.detectOrderBookImbalance(inputs.orderBook, inputs.currentPrice));
      detectedZones.push(...this.detectLiquidityGaps(inputs.orderBook, inputs.currentPrice));
    }
    
    // Detect whale vacuum zones
    if (inputs.whalePositions) {
      detectedZones.push(...this.detectWhaleVacuumZones(inputs.whalePositions, inputs.currentPrice));
    }
    
    // Detect stop-loss clusters
    if (inputs.stopLossClusters) {
      detectedZones.push(...this.detectStopLossClusters(inputs.stopLossClusters, inputs.currentPrice));
    }
    
    // Detect manipulation zones
    if (inputs.orderBook && inputs.recentVolume) {
      detectedZones.push(...this.detectManipulationZones(inputs.orderBook, inputs.recentVolume, inputs.currentPrice));
    }
    
    // Add zones to active tracking
    for (const zone of detectedZones) {
      this.addZone(zone);
    }
    
    // Generate alert
    const alert = this.generateAlert(detectedZones, inputs.currentPrice);
    this.alertHistory.push(alert);
    
    // Trim history
    if (this.alertHistory.length > 100) {
      this.alertHistory.shift();
    }
    
    this.stats.lastScanTime = now;
    this.stats.totalAlertsGenerated++;
    
    if (detectedZones.length > 0) {
      this.log(`Detected ${detectedZones.length} fragility zones`);
    }
    
    return alert;
  }

  // ============================================================
  // Zone Detection Methods
  // ============================================================

  /**
   * Detect thin liquidity pockets
   */
  private detectThinPockets(orderBook: OrderBookSnapshot, currentPrice: number): FragilityZone[] {
    const zones: FragilityZone[] = [];
    const scanRange = currentPrice * (this.config.scanRangePercent / 100);
    
    // Analyze bid side for thin pockets
    let cumulativeBidDepth = 0;
    for (let i = 0; i < orderBook.bids.length; i++) {
      const level = orderBook.bids[i];
      if (level.price < currentPrice - scanRange) break;
      
      cumulativeBidDepth += level.size;
      
      // Check for thin pocket
      if (level.size < this.config.thinPocketThreshold) {
        const nextLevel = orderBook.bids[i + 1];
        const gapSize = nextLevel ? (level.price - nextLevel.price) / level.price * 100 : 0;
        
        if (gapSize > 0.1 || level.size < this.config.thinPocketThreshold * 0.5) {
          zones.push(this.createZone({
            type: 'thin_pocket',
            priceRange: { low: nextLevel?.price || level.price * 0.99, high: level.price },
            currentPrice,
            liquidityDepth: level.size,
            description: `Thin bid liquidity at ${level.price.toFixed(2)}`,
            riskNarrative: `Limited buy support could lead to rapid price drops if selling pressure increases`,
            suggestedAction: 'Consider setting stop-losses above this zone',
            affectedVolume: cumulativeBidDepth,
            estimatedSlippage: this.estimateSlippage(level.size, orderBook.totalBidDepth),
          }));
        }
      }
    }
    
    // Analyze ask side for thin pockets
    let cumulativeAskDepth = 0;
    for (let i = 0; i < orderBook.asks.length; i++) {
      const level = orderBook.asks[i];
      if (level.price > currentPrice + scanRange) break;
      
      cumulativeAskDepth += level.size;
      
      if (level.size < this.config.thinPocketThreshold) {
        const nextLevel = orderBook.asks[i + 1];
        const gapSize = nextLevel ? (nextLevel.price - level.price) / level.price * 100 : 0;
        
        if (gapSize > 0.1 || level.size < this.config.thinPocketThreshold * 0.5) {
          zones.push(this.createZone({
            type: 'thin_pocket',
            priceRange: { low: level.price, high: nextLevel?.price || level.price * 1.01 },
            currentPrice,
            liquidityDepth: level.size,
            description: `Thin ask liquidity at ${level.price.toFixed(2)}`,
            riskNarrative: `Limited sell resistance could lead to rapid price spikes if buying pressure increases`,
            suggestedAction: 'Consider taking profits before this zone',
            affectedVolume: cumulativeAskDepth,
            estimatedSlippage: this.estimateSlippage(level.size, orderBook.totalAskDepth),
          }));
        }
      }
    }
    
    return zones;
  }

  /**
   * Detect order book imbalances
   */
  private detectOrderBookImbalance(orderBook: OrderBookSnapshot, currentPrice: number): FragilityZone[] {
    const zones: FragilityZone[] = [];
    
    // Overall imbalance
    if (Math.abs(orderBook.imbalanceRatio) > this.config.imbalanceThreshold) {
      const isBidHeavy = orderBook.imbalanceRatio > 0;
      const ratio = Math.abs(orderBook.imbalanceRatio);
      
      zones.push(this.createZone({
        type: 'order_book_imbalance',
        priceRange: {
          low: currentPrice * 0.98,
          high: currentPrice * 1.02,
        },
        currentPrice,
        liquidityDepth: isBidHeavy ? orderBook.totalAskDepth : orderBook.totalBidDepth,
        description: `Order book ${isBidHeavy ? 'bid' : 'ask'}-heavy (${ratio.toFixed(1)}:1 ratio)`,
        riskNarrative: isBidHeavy 
          ? 'Heavy bid side may indicate accumulation or potential support'
          : 'Heavy ask side may indicate distribution or potential resistance',
        suggestedAction: isBidHeavy
          ? 'Watch for breakout to upside'
          : 'Watch for breakdown to downside',
        affectedVolume: orderBook.totalBidDepth + orderBook.totalAskDepth,
        estimatedSlippage: orderBook.spreadPercent * ratio,
      }));
    }
    
    // Check for localized imbalances
    const bidDepthNear = orderBook.bids.slice(0, 5).reduce((sum, l) => sum + l.size, 0);
    const askDepthNear = orderBook.asks.slice(0, 5).reduce((sum, l) => sum + l.size, 0);
    const nearRatio = bidDepthNear / Math.max(askDepthNear, 1);
    
    if (nearRatio > 3 || nearRatio < 0.33) {
      zones.push(this.createZone({
        type: 'order_book_imbalance',
        priceRange: {
          low: orderBook.bids[4]?.price || currentPrice * 0.99,
          high: orderBook.asks[4]?.price || currentPrice * 1.01,
        },
        currentPrice,
        liquidityDepth: Math.min(bidDepthNear, askDepthNear),
        description: `Near-price imbalance: ${nearRatio > 1 ? 'bid' : 'ask'}-heavy (${nearRatio.toFixed(1)}:1)`,
        riskNarrative: 'Localized imbalance may cause rapid price movement',
        suggestedAction: 'Use limit orders to avoid slippage',
        affectedVolume: bidDepthNear + askDepthNear,
        estimatedSlippage: orderBook.spreadPercent * 2,
      }));
    }
    
    return zones;
  }

  /**
   * Detect liquidity gaps
   */
  private detectLiquidityGaps(orderBook: OrderBookSnapshot, currentPrice: number): FragilityZone[] {
    const zones: FragilityZone[] = [];
    const gapThreshold = currentPrice * (this.config.vacuumZoneThreshold / 100);
    
    // Check bid side gaps
    for (let i = 0; i < orderBook.bids.length - 1; i++) {
      const current = orderBook.bids[i];
      const next = orderBook.bids[i + 1];
      const gap = current.price - next.price;
      
      if (gap > gapThreshold) {
        zones.push(this.createZone({
          type: 'liquidity_gap',
          priceRange: { low: next.price, high: current.price },
          currentPrice,
          liquidityDepth: 0,
          description: `Liquidity gap on bid side: ${next.price.toFixed(2)} to ${current.price.toFixed(2)}`,
          riskNarrative: 'Price could fall rapidly through this gap if support breaks',
          suggestedAction: 'Set stop-losses above the gap',
          affectedVolume: 0,
          estimatedSlippage: (gap / currentPrice) * 100,
        }));
      }
    }
    
    // Check ask side gaps
    for (let i = 0; i < orderBook.asks.length - 1; i++) {
      const current = orderBook.asks[i];
      const next = orderBook.asks[i + 1];
      const gap = next.price - current.price;
      
      if (gap > gapThreshold) {
        zones.push(this.createZone({
          type: 'liquidity_gap',
          priceRange: { low: current.price, high: next.price },
          currentPrice,
          liquidityDepth: 0,
          description: `Liquidity gap on ask side: ${current.price.toFixed(2)} to ${next.price.toFixed(2)}`,
          riskNarrative: 'Price could spike rapidly through this gap if resistance breaks',
          suggestedAction: 'Consider taking profits before the gap',
          affectedVolume: 0,
          estimatedSlippage: (gap / currentPrice) * 100,
        }));
      }
    }
    
    return zones;
  }

  /**
   * Detect whale vacuum zones (areas where whale liquidations could cascade)
   */
  private detectWhaleVacuumZones(whalePositions: WhalePositionData[], currentPrice: number): FragilityZone[] {
    const zones: FragilityZone[] = [];
    
    // Group liquidation prices
    const liquidationLevels: Map<number, number> = new Map();
    
    for (const whale of whalePositions) {
      if (whale.liquidationPrice) {
        const roundedPrice = Math.round(whale.liquidationPrice / 10) * 10;
        const existing = liquidationLevels.get(roundedPrice) || 0;
        liquidationLevels.set(roundedPrice, existing + Math.abs(whale.position));
      }
    }
    
    // Find significant liquidation clusters
    const liquidationEntries = Array.from(liquidationLevels.entries());
    for (const [price, volume] of liquidationEntries) {
      const distancePercent = Math.abs((price - currentPrice) / currentPrice) * 100;
      
      if (distancePercent < this.config.scanRangePercent && volume > 1000) {
        zones.push(this.createZone({
          type: 'whale_vacuum',
          priceRange: { low: price * 0.99, high: price * 1.01 },
          currentPrice,
          liquidityDepth: volume,
          description: `Whale liquidation cluster at ${price.toFixed(2)}`,
          riskNarrative: 'Cascading liquidations could create a liquidity vacuum',
          suggestedAction: price < currentPrice 
            ? 'Avoid long positions with stops near this level'
            : 'Avoid short positions with stops near this level',
          affectedVolume: volume,
          estimatedSlippage: Math.min(volume / 10000, 5),
        }));
      }
    }
    
    return zones;
  }

  /**
   * Detect stop-loss clusters
   */
  private detectStopLossClusters(clusters: StopLossCluster[], currentPrice: number): FragilityZone[] {
    const zones: FragilityZone[] = [];
    
    for (const cluster of clusters) {
      if (cluster.clusterStrength < this.config.stopLossClusterThreshold) continue;
      
      const distancePercent = Math.abs((cluster.priceLevel - currentPrice) / currentPrice) * 100;
      
      if (distancePercent < this.config.scanRangePercent) {
        const isBelow = cluster.priceLevel < currentPrice;
        
        zones.push(this.createZone({
          type: 'stop_loss_cluster',
          priceRange: { 
            low: cluster.priceLevel * 0.995, 
            high: cluster.priceLevel * 1.005 
          },
          currentPrice,
          liquidityDepth: cluster.estimatedVolume,
          description: `Stop-loss cluster at ${cluster.priceLevel.toFixed(2)} (strength: ${cluster.clusterStrength.toFixed(0)})`,
          riskNarrative: isBelow
            ? 'Breaking this level could trigger cascading sell orders'
            : 'Breaking this level could trigger cascading buy orders',
          suggestedAction: 'Be aware of potential volatility spike if this level is breached',
          affectedVolume: cluster.estimatedVolume,
          estimatedSlippage: cluster.clusterStrength / 20,
        }));
      }
    }
    
    return zones;
  }

  /**
   * Detect potential manipulation zones
   */
  private detectManipulationZones(
    orderBook: OrderBookSnapshot, 
    recentVolume: number, 
    currentPrice: number
  ): FragilityZone[] {
    const zones: FragilityZone[] = [];
    
    // Look for suspicious order patterns
    // Large orders far from mid price (potential spoofing)
    const suspiciousBids = orderBook.bids.filter(l => 
      l.size > orderBook.totalBidDepth * 0.2 && 
      (currentPrice - l.price) / currentPrice > 0.02
    );
    
    const suspiciousAsks = orderBook.asks.filter(l =>
      l.size > orderBook.totalAskDepth * 0.2 &&
      (l.price - currentPrice) / currentPrice > 0.02
    );
    
    for (const bid of suspiciousBids) {
      zones.push(this.createZone({
        type: 'manipulation_zone',
        priceRange: { low: bid.price * 0.99, high: bid.price * 1.01 },
        currentPrice,
        liquidityDepth: bid.size,
        description: `Suspicious large bid at ${bid.price.toFixed(2)} (${((bid.size / orderBook.totalBidDepth) * 100).toFixed(0)}% of total bids)`,
        riskNarrative: 'Large order far from price may be spoofing - could be pulled',
        suggestedAction: 'Do not rely on this support level',
        affectedVolume: bid.size,
        estimatedSlippage: 0,
      }));
    }
    
    for (const ask of suspiciousAsks) {
      zones.push(this.createZone({
        type: 'manipulation_zone',
        priceRange: { low: ask.price * 0.99, high: ask.price * 1.01 },
        currentPrice,
        liquidityDepth: ask.size,
        description: `Suspicious large ask at ${ask.price.toFixed(2)} (${((ask.size / orderBook.totalAskDepth) * 100).toFixed(0)}% of total asks)`,
        riskNarrative: 'Large order far from price may be spoofing - could be pulled',
        suggestedAction: 'Do not rely on this resistance level',
        affectedVolume: ask.size,
        estimatedSlippage: 0,
      }));
    }
    
    // Check for wash trading indicators (high volume with tight spread)
    if (recentVolume > 0 && orderBook.spreadPercent < 0.05) {
      const volumeToDepthRatio = recentVolume / (orderBook.totalBidDepth + orderBook.totalAskDepth);
      
      if (volumeToDepthRatio > 10) {
        zones.push(this.createZone({
          type: 'manipulation_zone',
          priceRange: { low: currentPrice * 0.99, high: currentPrice * 1.01 },
          currentPrice,
          liquidityDepth: orderBook.totalBidDepth + orderBook.totalAskDepth,
          description: 'Potential wash trading detected (high volume, tight spread)',
          riskNarrative: 'Volume may be artificially inflated - true liquidity may be lower',
          suggestedAction: 'Use smaller position sizes and limit orders',
          affectedVolume: recentVolume,
          estimatedSlippage: orderBook.spreadPercent * 3,
        }));
      }
    }
    
    return zones;
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  private createZone(params: {
    type: FragilityType;
    priceRange: PriceRange;
    currentPrice: number;
    liquidityDepth: number;
    description: string;
    riskNarrative: string;
    suggestedAction: string;
    affectedVolume: number;
    estimatedSlippage: number;
  }): FragilityZone {
    this.zoneCounter++;
    const now = Date.now();
    
    const distancePercent = Math.abs(
      ((params.priceRange.low + params.priceRange.high) / 2 - params.currentPrice) / params.currentPrice
    ) * 100;
    
    const vulnerabilityScore = this.calculateVulnerabilityScore(
      params.type,
      params.liquidityDepth,
      distancePercent,
      params.estimatedSlippage
    );
    
    const severity = this.determineSeverity(vulnerabilityScore, distancePercent);
    
    return {
      id: `zone_${now}_${this.zoneCounter}`,
      type: params.type,
      severity,
      priceRange: params.priceRange,
      currentPrice: params.currentPrice,
      distancePercent,
      liquidityDepth: params.liquidityDepth,
      vulnerabilityScore,
      description: params.description,
      riskNarrative: params.riskNarrative,
      suggestedAction: params.suggestedAction,
      affectedVolume: params.affectedVolume,
      estimatedSlippage: params.estimatedSlippage,
      timestamp: now,
      expiresAt: now + this.config.zoneTTLMs,
    };
  }

  private calculateVulnerabilityScore(
    type: FragilityType,
    liquidityDepth: number,
    distancePercent: number,
    estimatedSlippage: number
  ): number {
    let score = 50;  // Base score
    
    // Type-based adjustments
    const typeWeights: Record<FragilityType, number> = {
      'thin_pocket': 15,
      'order_book_imbalance': 10,
      'whale_vacuum': 25,
      'manipulation_zone': 20,
      'stop_loss_cluster': 20,
      'liquidity_gap': 15,
      'depth_collapse': 25,
    };
    score += typeWeights[type] || 10;
    
    // Distance adjustment (closer = more dangerous)
    if (distancePercent < 1) score += 20;
    else if (distancePercent < 2) score += 10;
    else if (distancePercent > 4) score -= 10;
    
    // Liquidity depth adjustment
    if (liquidityDepth < this.config.thinPocketThreshold * 0.5) score += 15;
    else if (liquidityDepth < this.config.thinPocketThreshold) score += 5;
    
    // Slippage adjustment
    score += Math.min(estimatedSlippage * 5, 20);
    
    return Math.max(0, Math.min(100, score));
  }

  private determineSeverity(vulnerabilityScore: number, distancePercent: number): FragilitySeverity {
    // Closer zones are more severe
    const distanceMultiplier = distancePercent < 1 ? 1.3 : distancePercent < 2 ? 1.1 : 1;
    const adjustedScore = vulnerabilityScore * distanceMultiplier;
    
    if (adjustedScore >= 80) return 'critical';
    if (adjustedScore >= 60) return 'high';
    if (adjustedScore >= 40) return 'medium';
    return 'low';
  }

  private estimateSlippage(levelSize: number, totalDepth: number): number {
    if (totalDepth === 0) return 5;
    const ratio = levelSize / totalDepth;
    return Math.max(0.1, (1 - ratio) * 2);
  }

  private generateAlert(zones: FragilityZone[], currentPrice: number): FragilityAlert {
    this.alertCounter++;
    const now = Date.now();
    
    // Calculate overall fragility
    const overallFragility = zones.length > 0
      ? zones.reduce((sum, z) => sum + z.vulnerabilityScore, 0) / zones.length
      : 0;
    
    // Count critical zones
    const criticalZones = zones.filter(z => z.severity === 'critical');
    
    // Find nearest critical zone
    const nearestCritical = criticalZones.length > 0
      ? criticalZones.reduce((nearest, z) => 
          z.distancePercent < nearest.distancePercent ? z : nearest
        )
      : null;
    
    // Determine market vulnerability
    let marketVulnerability: 'stable' | 'fragile' | 'critical' = 'stable';
    if (criticalZones.length > 0 || overallFragility > 70) {
      marketVulnerability = 'critical';
    } else if (zones.filter(z => z.severity === 'high').length > 2 || overallFragility > 50) {
      marketVulnerability = 'fragile';
    }
    
    // Generate summary
    const summary = this.generateAlertSummary(zones, overallFragility, marketVulnerability);
    
    return {
      id: `alert_${now}_${this.alertCounter}`,
      zones,
      overallFragility,
      criticalZoneCount: criticalZones.length,
      nearestCriticalZone: nearestCritical,
      marketVulnerability,
      summary,
      timestamp: now,
    };
  }

  private generateAlertSummary(
    zones: FragilityZone[],
    overallFragility: number,
    vulnerability: 'stable' | 'fragile' | 'critical'
  ): string {
    if (zones.length === 0) {
      return 'No significant liquidity fragility detected. Market structure appears stable.';
    }
    
    const criticalCount = zones.filter(z => z.severity === 'critical').length;
    const highCount = zones.filter(z => z.severity === 'high').length;
    
    let summary = '';
    
    if (vulnerability === 'critical') {
      summary = `CRITICAL: ${criticalCount} critical fragility zone${criticalCount > 1 ? 's' : ''} detected. `;
    } else if (vulnerability === 'fragile') {
      summary = `WARNING: Market liquidity is fragile with ${highCount} high-severity zone${highCount > 1 ? 's' : ''}. `;
    } else {
      summary = `${zones.length} minor fragility zone${zones.length > 1 ? 's' : ''} detected. `;
    }
    
    // Add type breakdown
    const typeBreakdown = new Map<FragilityType, number>();
    for (const zone of zones) {
      typeBreakdown.set(zone.type, (typeBreakdown.get(zone.type) || 0) + 1);
    }
    
    const typeDescriptions: string[] = [];
    const typeEntries = Array.from(typeBreakdown.entries());
    for (const [type, count] of typeEntries) {
      typeDescriptions.push(`${count} ${type.replace(/_/g, ' ')}`);
    }
    
    summary += `Types: ${typeDescriptions.join(', ')}.`;
    
    return summary;
  }

  private addZone(zone: FragilityZone): void {
    this.activeZones.set(zone.id, zone);
    
    // Trim if needed
    if (this.activeZones.size > this.config.maxZonesTracked) {
      const oldest = Array.from(this.activeZones.values())
        .sort((a, b) => a.timestamp - b.timestamp)[0];
      if (oldest) {
        this.activeZones.delete(oldest.id);
      }
    }
    
    // Update stats
    this.stats.totalZonesDetected++;
    this.stats.zonesBySeverity[zone.severity]++;
    this.stats.zonesByType[zone.type]++;
  }

  private cleanupExpiredZones(): void {
    const now = Date.now();
    const entries = Array.from(this.activeZones.entries());
    for (const [id, zone] of entries) {
      if (zone.expiresAt < now) {
        this.activeZones.delete(id);
      }
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get all active fragility zones
   */
  getActiveZones(): FragilityZone[] {
    this.cleanupExpiredZones();
    return Array.from(this.activeZones.values());
  }

  /**
   * Get zones by severity
   */
  getZonesBySeverity(severity: FragilitySeverity): FragilityZone[] {
    return this.getActiveZones().filter(z => z.severity === severity);
  }

  /**
   * Get zones by type
   */
  getZonesByType(type: FragilityType): FragilityZone[] {
    return this.getActiveZones().filter(z => z.type === type);
  }

  /**
   * Get critical zones
   */
  getCriticalZones(): FragilityZone[] {
    return this.getZonesBySeverity('critical');
  }

  /**
   * Get zones near current price
   */
  getNearbyZones(currentPrice: number, maxDistancePercent: number = 2): FragilityZone[] {
    return this.getActiveZones().filter(z => {
      const midPrice = (z.priceRange.low + z.priceRange.high) / 2;
      const distance = Math.abs((midPrice - currentPrice) / currentPrice) * 100;
      return distance <= maxDistancePercent;
    });
  }

  /**
   * Get latest alert
   */
  getLatestAlert(): FragilityAlert | null {
    return this.alertHistory.length > 0 
      ? this.alertHistory[this.alertHistory.length - 1]
      : null;
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit?: number): FragilityAlert[] {
    if (limit) {
      return this.alertHistory.slice(-limit);
    }
    return [...this.alertHistory];
  }

  /**
   * Check if market is fragile
   */
  isMarketFragile(): boolean {
    const latest = this.getLatestAlert();
    return latest?.marketVulnerability !== 'stable';
  }

  /**
   * Check if there are critical zones
   */
  hasCriticalZones(): boolean {
    return this.getCriticalZones().length > 0;
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
  getConfig(): FragilityDetectorConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<FragilityDetectorConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated');
  }

  /**
   * Clear all zones
   */
  clearZones(): void {
    this.activeZones.clear();
    this.log('Active zones cleared');
  }

  /**
   * Reset detector
   */
  reset(): void {
    this.activeZones.clear();
    this.alertHistory = [];
    this.zoneCounter = 0;
    this.alertCounter = 0;
    this.stats = {
      totalZonesDetected: 0,
      totalAlertsGenerated: 0,
      zonesBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      zonesByType: {} as Record<FragilityType, number>,
      lastScanTime: 0,
    };
    this.initializeStats();
    this.log('Detector reset');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let detectorInstance: LiquidityFragilityDetectorImpl | null = null;

/**
 * Get the singleton LiquidityFragilityDetector instance
 */
export function getLiquidityFragilityDetector(config?: Partial<FragilityDetectorConfig>): LiquidityFragilityDetectorImpl {
  if (!detectorInstance) {
    detectorInstance = new LiquidityFragilityDetectorImpl(config);
  }
  return detectorInstance;
}

/**
 * Create a new LiquidityFragilityDetector with custom config
 */
export function createLiquidityFragilityDetector(config?: Partial<FragilityDetectorConfig>): LiquidityFragilityDetectorImpl {
  return new LiquidityFragilityDetectorImpl(config);
}
