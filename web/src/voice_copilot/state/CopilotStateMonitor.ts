/**
 * CopilotStateMonitor - Phase 3: Real-Time Intelligence Awareness
 * 
 * Tracks the current state of the GhostQuant application including:
 * - Active dashboard/page
 * - Active module being viewed
 * - Selected entities
 * - Live risk levels
 * - Alert counts and categories
 * - Heatmap intensity regions
 * - Backend intelligence signals
 */

// ============================================================
// Types and Interfaces
// ============================================================

export type GhostQuantModule = 
  | 'dashboard'
  | 'whale_intel'
  | 'ecoscan'
  | 'hydra'
  | 'constellation'
  | 'entity_explorer'
  | 'oracle_eye'
  | 'momentum_scanner'
  | 'alphabrain'
  | 'market_grid'
  | 'risk_heatmap'
  | 'alerts'
  | 'terminal'
  | 'ultrafusion'
  | 'graph'
  | 'unknown';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical' | 'unknown';

export interface EntitySelection {
  id: string;
  type: 'wallet' | 'token' | 'cluster' | 'transaction' | 'alert' | 'unknown';
  name?: string;
  metadata?: Record<string, unknown>;
}

export interface AlertSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  categories: string[];
  recentAlerts: AlertData[];
}

export interface AlertData {
  id: string;
  severity: RiskLevel;
  category: string;
  message: string;
  timestamp: number;
  entityId?: string;
}

export interface HeatmapRegion {
  region: string;
  intensity: number; // 0-100
  label?: string;
}

export interface IntelligenceSignal {
  source: string;
  type: string;
  value: unknown;
  timestamp: number;
  confidence?: number;
}

export interface LiveDataSnapshot {
  globalRiskLevel: RiskLevel;
  globalRiskScore: number; // 0-100
  marketCondition: 'bullish' | 'bearish' | 'neutral' | 'volatile' | 'unknown';
  alerts: AlertSummary;
  heatmapRegions: HeatmapRegion[];
  intelligenceSignals: IntelligenceSignal[];
  fusionEngineStatus: 'active' | 'idle' | 'processing' | 'unknown';
  whaleActivity: 'high' | 'moderate' | 'low' | 'unknown';
  lastUpdated: number;
}

export interface CopilotState {
  activePage: string;
  activeModule: GhostQuantModule;
  selectedEntity: EntitySelection | null;
  liveData: LiveDataSnapshot;
  pageHistory: string[];
  moduleHistory: GhostQuantModule[];
}

export interface ContextSummary {
  location: string;
  module: string;
  entity: string | null;
  riskStatus: string;
  marketStatus: string;
  alertStatus: string;
  intelligenceStatus: string;
  summary: string;
}

// ============================================================
// Route to Module Mapping
// ============================================================

const ROUTE_TO_MODULE: Record<string, GhostQuantModule> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/terminal': 'terminal',
  '/terminal/home': 'terminal',
  '/terminal/whales': 'whale_intel',
  '/terminal/whale-intel': 'whale_intel',
  '/whale-intelligence': 'whale_intel',
  '/terminal/ecoscan': 'ecoscan',
  '/terminal/hydra': 'hydra',
  '/terminal/constellation': 'constellation',
  '/terminal/entity': 'entity_explorer',
  '/terminal/oracle': 'oracle_eye',
  '/terminal/momentum': 'momentum_scanner',
  '/terminal/alphabrain': 'alphabrain',
  '/terminal/market': 'market_grid',
  '/terminal/risk': 'risk_heatmap',
  '/terminal/alerts': 'alerts',
  '/terminal/ultrafusion': 'ultrafusion',
  '/influence-graph': 'graph',
};

const MODULE_DESCRIPTIONS: Record<GhostQuantModule, string> = {
  dashboard: 'the main GhostQuant dashboard with overview metrics',
  whale_intel: 'the Whale Intelligence Database tracking large wallet movements',
  ecoscan: 'the EcoScan environmental analysis module',
  hydra: 'the Hydra multi-head pattern detection console',
  constellation: 'the Constellation Fusion Engine showing entity relationships',
  entity_explorer: 'the Entity Explorer for detailed wallet analysis',
  oracle_eye: 'the Oracle Eye spoofing and manipulation detector',
  momentum_scanner: 'the Momentum Scanner tracking market velocity',
  alphabrain: 'the AlphaBrain predictive intelligence module',
  market_grid: 'the Market Intelligence Grid with real-time signals',
  risk_heatmap: 'the Risk Heatmap showing threat intensity regions',
  alerts: 'the Alerts dashboard with active warnings',
  terminal: 'the GhostQuant terminal interface',
  ultrafusion: 'the UltraFusion advanced analysis module',
  graph: 'the Graph visualization module',
  unknown: 'an unknown module',
};

// ============================================================
// Default State
// ============================================================

const DEFAULT_LIVE_DATA: LiveDataSnapshot = {
  globalRiskLevel: 'unknown',
  globalRiskScore: 0,
  marketCondition: 'unknown',
  alerts: {
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    categories: [],
    recentAlerts: [],
  },
  heatmapRegions: [],
  intelligenceSignals: [],
  fusionEngineStatus: 'unknown',
  whaleActivity: 'unknown',
  lastUpdated: 0,
};

const DEFAULT_STATE: CopilotState = {
  activePage: '/',
  activeModule: 'dashboard',
  selectedEntity: null,
  liveData: { ...DEFAULT_LIVE_DATA },
  pageHistory: [],
  moduleHistory: [],
};

// ============================================================
// CopilotStateMonitor Implementation
// ============================================================

class CopilotStateMonitorImpl {
  private state: CopilotState;
  private listeners: Set<(state: CopilotState) => void>;
  private maxHistoryLength: number = 10;

  constructor() {
    this.state = { ...DEFAULT_STATE };
    this.listeners = new Set();
    console.log('[CopilotPhase3] CopilotStateMonitor initialized');
  }

  // ============================================================
  // State Update Methods
  // ============================================================

  /**
   * Update the active page/route
   */
  updateActivePage(route: string): void {
    const previousPage = this.state.activePage;
    this.state.activePage = route;
    
    // Update page history
    if (previousPage !== route) {
      this.state.pageHistory = [
        previousPage,
        ...this.state.pageHistory.slice(0, this.maxHistoryLength - 1),
      ];
    }

    // Auto-detect module from route
    const module = this.detectModuleFromRoute(route);
    if (module !== this.state.activeModule) {
      this.updateActiveModule(module);
    }

    console.log(`[CopilotPhase3] Active page updated: ${route} (module: ${module})`);
    this.notifyListeners();
  }

  /**
   * Update the active module
   */
  updateActiveModule(name: GhostQuantModule): void {
    const previousModule = this.state.activeModule;
    this.state.activeModule = name;

    // Update module history
    if (previousModule !== name) {
      this.state.moduleHistory = [
        previousModule,
        ...this.state.moduleHistory.slice(0, this.maxHistoryLength - 1),
      ];
    }

    console.log(`[CopilotPhase3] Active module updated: ${name}`);
    this.notifyListeners();
  }

  /**
   * Update the selected entity
   */
  updateSelectedEntity(entity: EntitySelection | null): void {
    this.state.selectedEntity = entity;
    
    if (entity) {
      console.log(`[CopilotPhase3] Entity selected: ${entity.type} - ${entity.id}`);
    } else {
      console.log('[CopilotPhase3] Entity selection cleared');
    }
    
    this.notifyListeners();
  }

  /**
   * Update live data snapshot
   */
  updateLiveData(snapshot: Partial<LiveDataSnapshot>): void {
    this.state.liveData = {
      ...this.state.liveData,
      ...snapshot,
      lastUpdated: Date.now(),
    };

    console.log('[CopilotPhase3] Live data updated');
    this.notifyListeners();
  }

  /**
   * Update global risk level
   */
  updateGlobalRisk(level: RiskLevel, score: number): void {
    this.state.liveData.globalRiskLevel = level;
    this.state.liveData.globalRiskScore = score;
    this.state.liveData.lastUpdated = Date.now();

    console.log(`[CopilotPhase3] Global risk updated: ${level} (${score})`);
    this.notifyListeners();
  }

  /**
   * Update alert summary
   */
  updateAlerts(alerts: AlertSummary): void {
    this.state.liveData.alerts = alerts;
    this.state.liveData.lastUpdated = Date.now();

    console.log(`[CopilotPhase3] Alerts updated: ${alerts.total} total`);
    this.notifyListeners();
  }

  /**
   * Add an intelligence signal
   */
  addIntelligenceSignal(signal: IntelligenceSignal): void {
    this.state.liveData.intelligenceSignals = [
      signal,
      ...this.state.liveData.intelligenceSignals.slice(0, 49), // Keep last 50
    ];
    this.state.liveData.lastUpdated = Date.now();

    console.log(`[CopilotPhase3] Intelligence signal added: ${signal.source} - ${signal.type}`);
    this.notifyListeners();
  }

  /**
   * Update heatmap regions
   */
  updateHeatmapRegions(regions: HeatmapRegion[]): void {
    this.state.liveData.heatmapRegions = regions;
    this.state.liveData.lastUpdated = Date.now();

    console.log(`[CopilotPhase3] Heatmap regions updated: ${regions.length} regions`);
    this.notifyListeners();
  }

  /**
   * Update Fusion Engine status
   */
  updateFusionEngineStatus(status: LiveDataSnapshot['fusionEngineStatus']): void {
    this.state.liveData.fusionEngineStatus = status;
    this.state.liveData.lastUpdated = Date.now();

    console.log(`[CopilotPhase3] Fusion Engine status: ${status}`);
    this.notifyListeners();
  }

  /**
   * Update whale activity level
   */
  updateWhaleActivity(activity: LiveDataSnapshot['whaleActivity']): void {
    this.state.liveData.whaleActivity = activity;
    this.state.liveData.lastUpdated = Date.now();

    console.log(`[CopilotPhase3] Whale activity: ${activity}`);
    this.notifyListeners();
  }

  /**
   * Update market condition
   */
  updateMarketCondition(condition: LiveDataSnapshot['marketCondition']): void {
    this.state.liveData.marketCondition = condition;
    this.state.liveData.lastUpdated = Date.now();

    console.log(`[CopilotPhase3] Market condition: ${condition}`);
    this.notifyListeners();
  }

  // ============================================================
  // State Query Methods
  // ============================================================

  /**
   * Get the current state
   */
  getCurrentState(): CopilotState {
    return { ...this.state };
  }

  /**
   * Get a human-readable context summary
   */
  getContextSummary(): ContextSummary {
    const { activePage, activeModule, selectedEntity, liveData } = this.state;

    // Location description
    const location = `You are viewing ${activePage}`;
    
    // Module description
    const module = MODULE_DESCRIPTIONS[activeModule] || 'an unknown module';

    // Entity description
    let entity: string | null = null;
    if (selectedEntity) {
      entity = `${selectedEntity.type} ${selectedEntity.name || selectedEntity.id}`;
    }

    // Risk status
    let riskStatus = 'Risk level is unknown';
    if (liveData.globalRiskLevel !== 'unknown') {
      riskStatus = `Global risk is ${liveData.globalRiskLevel} (${liveData.globalRiskScore}/100)`;
    }

    // Market status
    let marketStatus = 'Market condition is unknown';
    if (liveData.marketCondition !== 'unknown') {
      marketStatus = `Market is ${liveData.marketCondition}`;
    }

    // Alert status
    let alertStatus = 'No alerts';
    if (liveData.alerts.total > 0) {
      const parts: string[] = [];
      if (liveData.alerts.critical > 0) parts.push(`${liveData.alerts.critical} critical`);
      if (liveData.alerts.high > 0) parts.push(`${liveData.alerts.high} high`);
      if (liveData.alerts.medium > 0) parts.push(`${liveData.alerts.medium} medium`);
      if (liveData.alerts.low > 0) parts.push(`${liveData.alerts.low} low`);
      alertStatus = `${liveData.alerts.total} alerts: ${parts.join(', ')}`;
    }

    // Intelligence status
    let intelligenceStatus = 'No active intelligence signals';
    if (liveData.intelligenceSignals.length > 0) {
      const recentSignals = liveData.intelligenceSignals.slice(0, 3);
      const sources = Array.from(new Set(recentSignals.map(s => s.source)));
      intelligenceStatus = `${liveData.intelligenceSignals.length} signals from ${sources.join(', ')}`;
    }

    // Build summary
    const summaryParts: string[] = [
      `Currently on ${module}.`,
    ];

    if (entity) {
      summaryParts.push(`Selected: ${entity}.`);
    }

    if (liveData.globalRiskLevel !== 'unknown') {
      summaryParts.push(riskStatus + '.');
    }

    if (liveData.alerts.total > 0) {
      summaryParts.push(alertStatus + '.');
    }

    if (liveData.fusionEngineStatus === 'active' || liveData.fusionEngineStatus === 'processing') {
      summaryParts.push(`Fusion Engine is ${liveData.fusionEngineStatus}.`);
    }

    if (liveData.whaleActivity === 'high') {
      summaryParts.push('High whale activity detected.');
    }

    return {
      location,
      module,
      entity,
      riskStatus,
      marketStatus,
      alertStatus,
      intelligenceStatus,
      summary: summaryParts.join(' '),
    };
  }

  /**
   * Get module description
   */
  getModuleDescription(module?: GhostQuantModule): string {
    const targetModule = module || this.state.activeModule;
    return MODULE_DESCRIPTIONS[targetModule] || 'an unknown module';
  }

  /**
   * Check if live data is stale (older than 5 minutes)
   */
  isDataStale(): boolean {
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - this.state.liveData.lastUpdated > fiveMinutes;
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(count: number = 5): AlertData[] {
    return this.state.liveData.alerts.recentAlerts.slice(0, count);
  }

  /**
   * Get high-intensity heatmap regions
   */
  getHighIntensityRegions(threshold: number = 70): HeatmapRegion[] {
    return this.state.liveData.heatmapRegions.filter(r => r.intensity >= threshold);
  }

  /**
   * Get recent intelligence signals by source
   */
  getSignalsBySource(source: string): IntelligenceSignal[] {
    return this.state.liveData.intelligenceSignals.filter(s => s.source === source);
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  /**
   * Detect module from route
   */
  private detectModuleFromRoute(route: string): GhostQuantModule {
    // Exact match
    if (ROUTE_TO_MODULE[route]) {
      return ROUTE_TO_MODULE[route];
    }

    // Partial match
    for (const [pattern, module] of Object.entries(ROUTE_TO_MODULE)) {
      if (route.startsWith(pattern) && pattern !== '/') {
        return module;
      }
    }

    // Check for module keywords in route
    const routeLower = route.toLowerCase();
    if (routeLower.includes('whale')) return 'whale_intel';
    if (routeLower.includes('ecoscan')) return 'ecoscan';
    if (routeLower.includes('hydra')) return 'hydra';
    if (routeLower.includes('constellation')) return 'constellation';
    if (routeLower.includes('entity')) return 'entity_explorer';
    if (routeLower.includes('oracle')) return 'oracle_eye';
    if (routeLower.includes('momentum')) return 'momentum_scanner';
    if (routeLower.includes('alpha')) return 'alphabrain';
    if (routeLower.includes('market')) return 'market_grid';
    if (routeLower.includes('risk')) return 'risk_heatmap';
    if (routeLower.includes('alert')) return 'alerts';
    if (routeLower.includes('fusion') || routeLower.includes('ultra')) return 'ultrafusion';
    if (routeLower.includes('graph')) return 'graph';

    return 'unknown';
  }

  // ============================================================
  // Listener Management
  // ============================================================

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: CopilotState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const stateCopy = this.getCurrentState();
    this.listeners.forEach(listener => {
      try {
        listener(stateCopy);
      } catch (error) {
        console.error('[CopilotPhase3] Listener error:', error);
      }
    });
  }

  // ============================================================
  // Reset Methods
  // ============================================================

  /**
   * Reset state to defaults
   */
  reset(): void {
    this.state = { ...DEFAULT_STATE };
    console.log('[CopilotPhase3] CopilotStateMonitor reset');
    this.notifyListeners();
  }

  /**
   * Clear live data only
   */
  clearLiveData(): void {
    this.state.liveData = { ...DEFAULT_LIVE_DATA };
    console.log('[CopilotPhase3] Live data cleared');
    this.notifyListeners();
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let stateMonitor: CopilotStateMonitorImpl | null = null;

/**
 * Get the CopilotStateMonitor singleton instance
 */
export function getCopilotStateMonitor(): CopilotStateMonitorImpl {
  if (!stateMonitor) {
    stateMonitor = new CopilotStateMonitorImpl();
  }
  return stateMonitor;
}

/**
 * Create a new CopilotStateMonitor instance (for testing)
 */
export function createCopilotStateMonitor(): CopilotStateMonitorImpl {
  return new CopilotStateMonitorImpl();
}

export default {
  getCopilotStateMonitor,
  createCopilotStateMonitor,
};
