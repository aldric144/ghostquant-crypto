/**
 * CopilotDataAggregator - Phase 3: Real-Time Intelligence Awareness
 * 
 * Fetches and unifies intelligence from multiple GhostQuant endpoints:
 * - Fusion Constellation Engine
 * - Hydra / EcoScan / Whale Intel events
 * - Whale Intelligence DB cluster summaries
 * - Entity Explorer profiles
 * - Ecoscore environmental data
 * - Oracle Eye spoofing/manipulation indicators
 * - Risk heatmap levels
 * - Alert severity breakdowns
 * - Momentum Scanner data
 * - AlphaBrain predictions
 * - Market Intelligence Grid signals
 */

import {
  getCopilotStateMonitor,
  type LiveDataSnapshot,
  type AlertSummary,
  type AlertData,
  type HeatmapRegion,
  type IntelligenceSignal,
  type RiskLevel,
} from './CopilotStateMonitor';

// ============================================================
// Types and Interfaces
// ============================================================

export interface ConstellationData {
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
  clusters: ClusterSummary[];
  metrics: ConstellationMetrics;
}

export interface ConstellationNode {
  id: string;
  type: string;
  label: string;
  riskScore: number;
  metadata?: Record<string, unknown>;
}

export interface ConstellationEdge {
  source: string;
  target: string;
  weight: number;
  type: string;
}

export interface ClusterSummary {
  id: string;
  name: string;
  nodeCount: number;
  totalValue: number;
  riskLevel: RiskLevel;
  dominantType: string;
}

export interface ConstellationMetrics {
  totalNodes: number;
  totalEdges: number;
  clusterCount: number;
  averageRisk: number;
  highRiskNodes: number;
}

export interface WhaleIntelData {
  recentTransactions: WhaleTransaction[];
  topWallets: WhaleWallet[];
  activityLevel: 'high' | 'moderate' | 'low';
  totalVolume24h: number;
  significantMoves: number;
}

export interface WhaleTransaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  token: string;
  timestamp: number;
  significance: 'high' | 'medium' | 'low';
}

export interface WhaleWallet {
  address: string;
  balance: number;
  recentActivity: number;
  riskScore: number;
  label?: string;
}

export interface EcoscanData {
  environmentalScore: number;
  sustainabilityRating: string;
  carbonFootprint: number;
  energyEfficiency: number;
  trends: EcoscanTrend[];
}

export interface EcoscanTrend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  change: number;
  period: string;
}

export interface HydraData {
  activeHeads: number;
  patterns: HydraPattern[];
  detectionRate: number;
  lastScan: number;
}

export interface HydraPattern {
  id: string;
  type: string;
  confidence: number;
  entities: string[];
  description: string;
}

export interface OracleEyeData {
  spoofingIndicators: SpoofingIndicator[];
  manipulationScore: number;
  suspiciousActivity: number;
  lastCheck: number;
}

export interface SpoofingIndicator {
  type: string;
  severity: RiskLevel;
  confidence: number;
  description: string;
  timestamp: number;
}

export interface MomentumData {
  overallMomentum: number; // -100 to 100
  direction: 'bullish' | 'bearish' | 'neutral';
  velocity: number;
  topMovers: MomentumMover[];
}

export interface MomentumMover {
  symbol: string;
  change: number;
  volume: number;
  momentum: number;
}

export interface AlphaBrainData {
  predictions: AlphaPrediction[];
  confidence: number;
  lastUpdate: number;
  modelVersion: string;
}

export interface AlphaPrediction {
  target: string;
  prediction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  timeframe: string;
  reasoning?: string;
}

export interface MarketGridData {
  signals: MarketSignal[];
  overallSentiment: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  volatilityIndex: number;
  liquidityScore: number;
}

export interface MarketSignal {
  source: string;
  type: string;
  strength: number;
  direction: 'buy' | 'sell' | 'hold';
  timestamp: number;
}

export interface EntityProfile {
  id: string;
  type: string;
  name?: string;
  riskScore: number;
  transactionCount: number;
  totalVolume: number;
  firstSeen: number;
  lastActive: number;
  tags: string[];
  connections: number;
}

export interface AggregatedIntelligence {
  constellation: ConstellationData | null;
  whaleIntel: WhaleIntelData | null;
  ecoscan: EcoscanData | null;
  hydra: HydraData | null;
  oracleEye: OracleEyeData | null;
  momentum: MomentumData | null;
  alphaBrain: AlphaBrainData | null;
  marketGrid: MarketGridData | null;
  alerts: AlertSummary;
  globalRisk: { level: RiskLevel; score: number };
  timestamp: number;
}

// ============================================================
// API Endpoints Configuration
// ============================================================

const API_ENDPOINTS = {
  constellation: {
    graph: '/gde/constellation/graph',
    metrics: '/gde/constellation/metrics',
  },
  whaleIntel: {
    transactions: '/whale/intel/transactions',
    wallets: '/whale/intel/wallets',
    activity: '/whale/intel/activity',
  },
  ecoscan: {
    summary: '/api/ecoscan/summary',
    trends: '/api/ecoscan/trends',
  },
  hydra: {
    status: '/hydra-adapter/detect',
    patterns: '/hydra/patterns',
  },
  oracleEye: {
    indicators: '/oracle/indicators',
    manipulation: '/oracle/manipulation',
  },
  momentum: {
    scanner: '/momentum/scanner',
    movers: '/momentum/movers',
  },
  alphaBrain: {
    predictions: '/api/alphabrain/predictions',
    summary: '/api/alphabrain/summary',
  },
  marketGrid: {
    signals: '/market/signals',
    sentiment: '/market/sentiment',
  },
  alerts: {
    summary: '/alerts/summary',
    recent: '/alerts/recent',
  },
  risk: {
    global: '/risk/global',
    heatmap: '/risk/heatmap',
  },
  entity: {
    profile: '/entity/profile',
  },
};

// ============================================================
// CopilotDataAggregator Implementation
// ============================================================

class CopilotDataAggregatorImpl {
  private baseUrl: string;
  private cache: Map<string, { data: unknown; timestamp: number }>;
  private cacheTTL: number = 30000; // 30 seconds
  private fetchTimeout: number = 5000; // 5 seconds

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app';
    this.cache = new Map();
    console.log('[CopilotPhase3] CopilotDataAggregator initialized with base URL:', this.baseUrl);
  }

  // ============================================================
  // Main Aggregation Methods
  // ============================================================

  /**
   * Fetch and aggregate all intelligence data
   */
  async aggregateAll(): Promise<AggregatedIntelligence> {
    console.log('[CopilotPhase3] Aggregating all intelligence data...');

    const [
      constellation,
      whaleIntel,
      ecoscan,
      hydra,
      oracleEye,
      momentum,
      alphaBrain,
      marketGrid,
      alerts,
      globalRisk,
    ] = await Promise.all([
      this.fetchConstellationData().catch(() => null),
      this.fetchWhaleIntelData().catch(() => null),
      this.fetchEcoscanData().catch(() => null),
      this.fetchHydraData().catch(() => null),
      this.fetchOracleEyeData().catch(() => null),
      this.fetchMomentumData().catch(() => null),
      this.fetchAlphaBrainData().catch(() => null),
      this.fetchMarketGridData().catch(() => null),
      this.fetchAlertSummary().catch(() => this.getDefaultAlertSummary()),
      this.fetchGlobalRisk().catch(() => ({ level: 'unknown' as RiskLevel, score: 0 })),
    ]);

    const aggregated: AggregatedIntelligence = {
      constellation,
      whaleIntel,
      ecoscan,
      hydra,
      oracleEye,
      momentum,
      alphaBrain,
      marketGrid,
      alerts,
      globalRisk,
      timestamp: Date.now(),
    };

    // Update state monitor with aggregated data
    this.updateStateMonitor(aggregated);

    console.log('[CopilotPhase3] Intelligence aggregation complete');
    return aggregated;
  }

  /**
   * Fetch intelligence for a specific module
   */
  async fetchModuleIntelligence(module: string): Promise<unknown> {
    console.log(`[CopilotPhase3] Fetching intelligence for module: ${module}`);

    switch (module) {
      case 'constellation':
      case 'ultrafusion':
        return this.fetchConstellationData();
      case 'whale_intel':
        return this.fetchWhaleIntelData();
      case 'ecoscan':
        return this.fetchEcoscanData();
      case 'hydra':
        return this.fetchHydraData();
      case 'oracle_eye':
        return this.fetchOracleEyeData();
      case 'momentum_scanner':
        return this.fetchMomentumData();
      case 'alphabrain':
        return this.fetchAlphaBrainData();
      case 'market_grid':
        return this.fetchMarketGridData();
      case 'alerts':
        return this.fetchAlertSummary();
      case 'risk_heatmap':
        return this.fetchRiskHeatmap();
      default:
        return this.aggregateAll();
    }
  }

  // ============================================================
  // Individual Data Fetchers
  // ============================================================

  /**
   * Fetch Constellation Fusion Engine data
   */
  async fetchConstellationData(): Promise<ConstellationData> {
    const cacheKey = 'constellation';
    const cached = this.getFromCache<ConstellationData>(cacheKey);
    if (cached) return cached;

    try {
      const [graphResponse, metricsResponse] = await Promise.all([
        this.fetchWithTimeout(API_ENDPOINTS.constellation.graph),
        this.fetchWithTimeout(API_ENDPOINTS.constellation.metrics),
      ]);

      const graph = graphResponse as Record<string, unknown> | null;
      const metricsObj = metricsResponse as Record<string, unknown> | null;

      const data: ConstellationData = {
        nodes: (graph?.nodes as ConstellationNode[]) || [],
        edges: (graph?.edges as ConstellationEdge[]) || [],
        clusters: (graph?.clusters as ClusterSummary[]) || [],
        metrics: metricsObj ? {
          totalNodes: (metricsObj.totalNodes as number) || 0,
          totalEdges: (metricsObj.totalEdges as number) || 0,
          clusterCount: (metricsObj.clusterCount as number) || 0,
          averageRisk: (metricsObj.averageRisk as number) || 0,
          highRiskNodes: (metricsObj.highRiskNodes as number) || 0,
        } : {
          totalNodes: 0,
          totalEdges: 0,
          clusterCount: 0,
          averageRisk: 0,
          highRiskNodes: 0,
        },
      };

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('[CopilotPhase3] Failed to fetch constellation data:', error);
      return this.getDefaultConstellationData();
    }
  }

  /**
   * Fetch Whale Intelligence data
   */
  async fetchWhaleIntelData(): Promise<WhaleIntelData> {
    const cacheKey = 'whaleIntel';
    const cached = this.getFromCache<WhaleIntelData>(cacheKey);
    if (cached) return cached;

    try {
      const [transactionsRes, walletsRes, activityRes] = await Promise.all([
        this.fetchWithTimeout(API_ENDPOINTS.whaleIntel.transactions),
        this.fetchWithTimeout(API_ENDPOINTS.whaleIntel.wallets),
        this.fetchWithTimeout(API_ENDPOINTS.whaleIntel.activity),
      ]);

      const transactions = transactionsRes as Record<string, unknown> | null;
      const wallets = walletsRes as Record<string, unknown> | null;
      const activity = activityRes as Record<string, unknown> | null;

      const data: WhaleIntelData = {
        recentTransactions: (transactions?.transactions as WhaleTransaction[]) || [],
        topWallets: (wallets?.wallets as WhaleWallet[]) || [],
        activityLevel: (activity?.level as 'low' | 'moderate' | 'high') || 'low',
        totalVolume24h: (activity?.volume24h as number) || 0,
        significantMoves: (activity?.significantMoves as number) || 0,
      };

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('[CopilotPhase3] Failed to fetch whale intel data:', error);
      return this.getDefaultWhaleIntelData();
    }
  }

  /**
   * Fetch EcoScan data
   */
  async fetchEcoscanData(): Promise<EcoscanData> {
    const cacheKey = 'ecoscan';
    const cached = this.getFromCache<EcoscanData>(cacheKey);
    if (cached) return cached;

    try {
      const [summaryRes, trendsRes] = await Promise.all([
        this.fetchWithTimeout(API_ENDPOINTS.ecoscan.summary),
        this.fetchWithTimeout(API_ENDPOINTS.ecoscan.trends),
      ]);

      const summary = summaryRes as Record<string, unknown> | null;
      const trends = trendsRes as Record<string, unknown> | null;

      const data: EcoscanData = {
        environmentalScore: (summary?.score as number) || 0,
        sustainabilityRating: (summary?.rating as string) || 'unknown',
        carbonFootprint: (summary?.carbonFootprint as number) || 0,
        energyEfficiency: (summary?.energyEfficiency as number) || 0,
        trends: (trends?.trends as EcoscanTrend[]) || [],
      };

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('[CopilotPhase3] Failed to fetch ecoscan data:', error);
      return this.getDefaultEcoscanData();
    }
  }

  /**
   * Fetch Hydra data
   */
  async fetchHydraData(): Promise<HydraData> {
    const cacheKey = 'hydra';
    const cached = this.getFromCache<HydraData>(cacheKey);
    if (cached) return cached;

    try {
      const [statusRes, patternsRes] = await Promise.all([
        this.fetchWithTimeout(API_ENDPOINTS.hydra.status),
        this.fetchWithTimeout(API_ENDPOINTS.hydra.patterns),
      ]);

      const status = statusRes as Record<string, unknown> | null;
      const patterns = patternsRes as Record<string, unknown> | null;

      const data: HydraData = {
        activeHeads: (status?.heads_detected as number) || (status?.activeHeads as number) || 0,
        patterns: (patterns?.patterns as HydraPattern[]) || [],
        detectionRate: (status?.detection_rate as number) || (status?.detectionRate as number) || 0,
        lastScan: Date.now(),
      };

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('[CopilotPhase3] Failed to fetch hydra data:', error);
      return this.getDefaultHydraData();
    }
  }

  /**
   * Fetch Oracle Eye data
   */
  async fetchOracleEyeData(): Promise<OracleEyeData> {
    const cacheKey = 'oracleEye';
    const cached = this.getFromCache<OracleEyeData>(cacheKey);
    if (cached) return cached;

    try {
      const [indicatorsRes, manipulationRes] = await Promise.all([
        this.fetchWithTimeout(API_ENDPOINTS.oracleEye.indicators),
        this.fetchWithTimeout(API_ENDPOINTS.oracleEye.manipulation),
      ]);

      const indicators = indicatorsRes as Record<string, unknown> | null;
      const manipulation = manipulationRes as Record<string, unknown> | null;

      const data: OracleEyeData = {
        spoofingIndicators: (indicators?.indicators as SpoofingIndicator[]) || [],
        manipulationScore: (manipulation?.score as number) || 0,
        suspiciousActivity: (manipulation?.suspiciousCount as number) || 0,
        lastCheck: Date.now(),
      };

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('[CopilotPhase3] Failed to fetch oracle eye data:', error);
      return this.getDefaultOracleEyeData();
    }
  }

  /**
   * Fetch Momentum Scanner data
   */
  async fetchMomentumData(): Promise<MomentumData> {
    const cacheKey = 'momentum';
    const cached = this.getFromCache<MomentumData>(cacheKey);
    if (cached) return cached;

    try {
      const [scannerRes, moversRes] = await Promise.all([
        this.fetchWithTimeout(API_ENDPOINTS.momentum.scanner),
        this.fetchWithTimeout(API_ENDPOINTS.momentum.movers),
      ]);

      const scanner = scannerRes as Record<string, unknown> | null;
      const movers = moversRes as Record<string, unknown> | null;

      const data: MomentumData = {
        overallMomentum: (scanner?.momentum as number) || 0,
        direction: (scanner?.direction as 'bullish' | 'bearish' | 'neutral') || 'neutral',
        velocity: (scanner?.velocity as number) || 0,
        topMovers: (movers?.movers as MomentumMover[]) || [],
      };

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('[CopilotPhase3] Failed to fetch momentum data:', error);
      return this.getDefaultMomentumData();
    }
  }

  /**
   * Fetch AlphaBrain data
   */
  async fetchAlphaBrainData(): Promise<AlphaBrainData> {
    const cacheKey = 'alphaBrain';
    const cached = this.getFromCache<AlphaBrainData>(cacheKey);
    if (cached) return cached;

    try {
      const [predictionsRes, summaryRes] = await Promise.all([
        this.fetchWithTimeout(API_ENDPOINTS.alphaBrain.predictions),
        this.fetchWithTimeout(API_ENDPOINTS.alphaBrain.summary),
      ]);

      const predictions = predictionsRes as Record<string, unknown> | null;
      const summary = summaryRes as Record<string, unknown> | null;

      const data: AlphaBrainData = {
        predictions: (predictions?.predictions as AlphaPrediction[]) || [],
        confidence: (summary?.confidence as number) || 0,
        lastUpdate: Date.now(),
        modelVersion: (summary?.version as string) || 'unknown',
      };

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('[CopilotPhase3] Failed to fetch alphabrain data:', error);
      return this.getDefaultAlphaBrainData();
    }
  }

  /**
   * Fetch Market Grid data
   */
  async fetchMarketGridData(): Promise<MarketGridData> {
    const cacheKey = 'marketGrid';
    const cached = this.getFromCache<MarketGridData>(cacheKey);
    if (cached) return cached;

    try {
      const [signalsRes, sentimentRes] = await Promise.all([
        this.fetchWithTimeout(API_ENDPOINTS.marketGrid.signals),
        this.fetchWithTimeout(API_ENDPOINTS.marketGrid.sentiment),
      ]);

      const signals = signalsRes as Record<string, unknown> | null;
      const sentiment = sentimentRes as Record<string, unknown> | null;

      const data: MarketGridData = {
        signals: (signals?.signals as MarketSignal[]) || [],
        overallSentiment: (sentiment?.sentiment as 'bullish' | 'bearish' | 'neutral') || 'neutral',
        volatilityIndex: (sentiment?.volatility as number) || 0,
        liquidityScore: (sentiment?.liquidity as number) || 0,
      };

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('[CopilotPhase3] Failed to fetch market grid data:', error);
      return this.getDefaultMarketGridData();
    }
  }

  /**
   * Fetch Alert Summary
   */
  async fetchAlertSummary(): Promise<AlertSummary> {
    const cacheKey = 'alerts';
    const cached = this.getFromCache<AlertSummary>(cacheKey);
    if (cached) return cached;

    try {
      const [summaryRes, recentRes] = await Promise.all([
        this.fetchWithTimeout(API_ENDPOINTS.alerts.summary),
        this.fetchWithTimeout(API_ENDPOINTS.alerts.recent),
      ]);

      const summary = summaryRes as Record<string, unknown> | null;
      const recent = recentRes as Record<string, unknown> | null;

      const data: AlertSummary = {
        total: (summary?.total as number) || 0,
        critical: (summary?.critical as number) || 0,
        high: (summary?.high as number) || 0,
        medium: (summary?.medium as number) || 0,
        low: (summary?.low as number) || 0,
        categories: (summary?.categories as string[]) || [],
        recentAlerts: (recent?.alerts as AlertData[]) || [],
      };

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('[CopilotPhase3] Failed to fetch alert summary:', error);
      return this.getDefaultAlertSummary();
    }
  }

  /**
   * Fetch Global Risk
   */
  async fetchGlobalRisk(): Promise<{ level: RiskLevel; score: number }> {
    const cacheKey = 'globalRisk';
    const cached = this.getFromCache<{ level: RiskLevel; score: number }>(cacheKey);
    if (cached) return cached;

    try {
      const responseData = await this.fetchWithTimeout(API_ENDPOINTS.risk.global);
      const response = responseData as Record<string, unknown> | null;
      
      const data = {
        level: ((response?.level as string) || 'unknown') as RiskLevel,
        score: (response?.score as number) || 0,
      };

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('[CopilotPhase3] Failed to fetch global risk:', error);
      return { level: 'unknown', score: 0 };
    }
  }

  /**
   * Fetch Risk Heatmap
   */
  async fetchRiskHeatmap(): Promise<HeatmapRegion[]> {
    const cacheKey = 'heatmap';
    const cached = this.getFromCache<HeatmapRegion[]>(cacheKey);
    if (cached) return cached;

    try {
      const responseData = await this.fetchWithTimeout(API_ENDPOINTS.risk.heatmap);
      const response = responseData as Record<string, unknown> | null;
      const data = (response?.regions as HeatmapRegion[]) || [];
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('[CopilotPhase3] Failed to fetch risk heatmap:', error);
      return [];
    }
  }

  /**
   * Fetch Entity Profile
   */
  async fetchEntityProfile(entityId: string): Promise<EntityProfile | null> {
    const cacheKey = `entity_${entityId}`;
    const cached = this.getFromCache<EntityProfile>(cacheKey);
    if (cached) return cached;

    try {
      const responseData = await this.fetchWithTimeout(`${API_ENDPOINTS.entity.profile}/${entityId}`);
      const response = responseData as Record<string, unknown> | null;
      
      if (!response) return null;

      const data: EntityProfile = {
        id: (response.id as string) || entityId,
        type: (response.type as 'wallet' | 'contract' | 'exchange' | 'unknown') || 'unknown',
        name: response.name as string | undefined,
        riskScore: (response.riskScore as number) || 0,
        transactionCount: (response.transactionCount as number) || 0,
        totalVolume: (response.totalVolume as number) || 0,
        firstSeen: (response.firstSeen as number) || 0,
        lastActive: (response.lastActive as number) || 0,
        tags: (response.tags as string[]) || [],
        connections: (response.connections as number) || 0,
      };

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('[CopilotPhase3] Failed to fetch entity profile:', error);
      return null;
    }
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(endpoint: string): Promise<unknown> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.fetchTimeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Get from cache
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T;
    }
    return null;
  }

  /**
   * Set cache
   */
  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Update state monitor with aggregated data
   */
  private updateStateMonitor(data: AggregatedIntelligence): void {
    const stateMonitor = getCopilotStateMonitor();

    // Update global risk
    stateMonitor.updateGlobalRisk(data.globalRisk.level, data.globalRisk.score);

    // Update alerts
    stateMonitor.updateAlerts(data.alerts);

    // Update whale activity
    if (data.whaleIntel) {
      stateMonitor.updateWhaleActivity(data.whaleIntel.activityLevel);
    }

    // Update Fusion Engine status
    if (data.constellation) {
      stateMonitor.updateFusionEngineStatus(
        data.constellation.nodes.length > 0 ? 'active' : 'idle'
      );
    }

    // Update market condition
    if (data.momentum) {
      const condition = data.momentum.direction === 'bullish' ? 'bullish' :
                       data.momentum.direction === 'bearish' ? 'bearish' : 'neutral';
      stateMonitor.updateMarketCondition(condition);
    }

    // Add intelligence signals
    if (data.hydra && data.hydra.patterns.length > 0) {
      stateMonitor.addIntelligenceSignal({
        source: 'hydra',
        type: 'pattern_detection',
        value: data.hydra.patterns.length,
        timestamp: Date.now(),
        confidence: data.hydra.detectionRate,
      });
    }

    if (data.oracleEye && data.oracleEye.manipulationScore > 50) {
      stateMonitor.addIntelligenceSignal({
        source: 'oracle_eye',
        type: 'manipulation_warning',
        value: data.oracleEye.manipulationScore,
        timestamp: Date.now(),
        confidence: 0.8,
      });
    }
  }

  // ============================================================
  // Default Data Generators
  // ============================================================

  private getDefaultConstellationData(): ConstellationData {
    return {
      nodes: [],
      edges: [],
      clusters: [],
      metrics: {
        totalNodes: 0,
        totalEdges: 0,
        clusterCount: 0,
        averageRisk: 0,
        highRiskNodes: 0,
      },
    };
  }

  private getDefaultWhaleIntelData(): WhaleIntelData {
    return {
      recentTransactions: [],
      topWallets: [],
      activityLevel: 'low',
      totalVolume24h: 0,
      significantMoves: 0,
    };
  }

  private getDefaultEcoscanData(): EcoscanData {
    return {
      environmentalScore: 0,
      sustainabilityRating: 'unknown',
      carbonFootprint: 0,
      energyEfficiency: 0,
      trends: [],
    };
  }

  private getDefaultHydraData(): HydraData {
    return {
      activeHeads: 0,
      patterns: [],
      detectionRate: 0,
      lastScan: 0,
    };
  }

  private getDefaultOracleEyeData(): OracleEyeData {
    return {
      spoofingIndicators: [],
      manipulationScore: 0,
      suspiciousActivity: 0,
      lastCheck: 0,
    };
  }

  private getDefaultMomentumData(): MomentumData {
    return {
      overallMomentum: 0,
      direction: 'neutral',
      velocity: 0,
      topMovers: [],
    };
  }

  private getDefaultAlphaBrainData(): AlphaBrainData {
    return {
      predictions: [],
      confidence: 0,
      lastUpdate: 0,
      modelVersion: 'unknown',
    };
  }

  private getDefaultMarketGridData(): MarketGridData {
    return {
      signals: [],
      overallSentiment: 'neutral',
      volatilityIndex: 0,
      liquidityScore: 0,
    };
  }

  private getDefaultAlertSummary(): AlertSummary {
    return {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      categories: [],
      recentAlerts: [],
    };
  }

  // ============================================================
  // Cache Management
  // ============================================================

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[CopilotPhase3] CopilotDataAggregator cache cleared');
  }

  /**
   * Set cache TTL
   */
  setCacheTTL(ttl: number): void {
    this.cacheTTL = ttl;
  }

  /**
   * Set fetch timeout
   */
  setFetchTimeout(timeout: number): void {
    this.fetchTimeout = timeout;
  }

  /**
   * Set base URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
    console.log('[CopilotPhase3] CopilotDataAggregator base URL updated:', url);
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let dataAggregator: CopilotDataAggregatorImpl | null = null;

/**
 * Get the CopilotDataAggregator singleton instance
 */
export function getCopilotDataAggregator(): CopilotDataAggregatorImpl {
  if (!dataAggregator) {
    dataAggregator = new CopilotDataAggregatorImpl();
  }
  return dataAggregator;
}

/**
 * Create a new CopilotDataAggregator instance
 */
export function createCopilotDataAggregator(baseUrl?: string): CopilotDataAggregatorImpl {
  return new CopilotDataAggregatorImpl(baseUrl);
}

export default {
  getCopilotDataAggregator,
  createCopilotDataAggregator,
};
