/**
 * GhostQuantModuleRegistry - Comprehensive Module Knowledge Base
 * 
 * Auto-derived from existing UI components, routes, and code comments.
 * This registry enables the Copilot to understand ALL major GhostQuant systems.
 * 
 * Categories:
 * - CORE INTELLIGENCE ENGINES (12 modules)
 * - MARKET + BLOCKCHAIN INTELLIGENCE (11 modules)
 * - UI-DRIVEN SYSTEMS (8 modules)
 * - SYSTEM INTELLIGENCE + DIAGNOSTICS (8 modules)
 */

// ============================================
// MODULE INTERFACE DEFINITIONS
// ============================================

export type ModuleCategory = 
  | 'core_intelligence'
  | 'market_blockchain'
  | 'ui_systems'
  | 'system_diagnostics';

export interface ModuleEntry {
  id: string;
  name: string;
  category: ModuleCategory;
  route?: string;
  summary: string;
  sampleQuestions: [string, string, string];
  keywords: string[];
  relatedModules: string[];
}

// ============================================
// CATEGORY: CORE INTELLIGENCE ENGINES (12 modules)
// ============================================

const CORE_INTELLIGENCE_MODULES: ModuleEntry[] = [
  {
    id: 'hydra',
    name: 'Hydra Console',
    category: 'core_intelligence',
    route: '/terminal/hydra',
    summary: 'Multi-head threat detection engine that identifies wash trading, spoofing, layering, and coordinated manipulation across multiple blockchains in real-time.',
    sampleQuestions: [
      'What threats is Hydra detecting right now?',
      'How many manipulation heads are active?',
      'Explain the Hydra confidence scores'
    ],
    keywords: ['hydra', 'threat', 'detection', 'manipulation', 'wash trading', 'spoofing', 'layering', 'heads', 'multi-head'],
    relatedModules: ['constellation', 'sentinel', 'rings']
  },
  {
    id: 'constellation',
    name: 'Constellation Map',
    category: 'core_intelligence',
    route: '/terminal/constellation',
    summary: 'Entity fusion engine that maps wallet relationships, cluster analysis, and risk propagation across connected entities using graph-based intelligence.',
    sampleQuestions: [
      'How are these wallets connected?',
      'What clusters has Constellation found?',
      'Explain risk propagation in Constellation'
    ],
    keywords: ['constellation', 'entity', 'fusion', 'cluster', 'relationship', 'graph', 'connection', 'wallet', 'propagation'],
    relatedModules: ['hydra', 'graph', 'ecoscan']
  },
  {
    id: 'ecoscan',
    name: 'EcoScan',
    category: 'core_intelligence',
    route: '/ecoscan',
    summary: 'Entity scanning tool that performs deep risk assessment on wallet addresses, analyzing behavioral patterns and threat indicators.',
    sampleQuestions: [
      'Is this wallet address safe?',
      'What are the risk factors for this entity?',
      'Scan this address for threats'
    ],
    keywords: ['ecoscan', 'scan', 'entity', 'wallet', 'address', 'risk', 'assessment', 'behavioral', 'threat'],
    relatedModules: ['constellation', 'entity', 'whale_intel']
  },
  {
    id: 'whale_intel',
    name: 'Whale Intelligence',
    category: 'core_intelligence',
    route: '/terminal/whales',
    summary: 'Large holder tracking system that monitors whale movements, accumulation patterns, and market impact predictions in real-time.',
    sampleQuestions: [
      'What are the whales doing?',
      'Any significant whale movements?',
      'Who are the biggest holders?'
    ],
    keywords: ['whale', 'whales', 'large holder', 'movement', 'accumulation', 'impact', 'tracking', 'big money'],
    relatedModules: ['whale_intel_db', 'analytics', 'map']
  },
  {
    id: 'whale_intel_db',
    name: 'Whale Intelligence Database',
    category: 'core_intelligence',
    route: '/terminal/whale-intel',
    summary: 'Comprehensive database of whale entities with risk profiles, transaction history, and watchlist status for institutional-grade monitoring.',
    sampleQuestions: [
      'Show me the whale database',
      'What whales are on the watchlist?',
      'Get whale profile for this address'
    ],
    keywords: ['whale database', 'whale intel', 'widb', 'watchlist', 'profile', 'institutional'],
    relatedModules: ['whale_intel', 'entity', 'constellation']
  },
  {
    id: 'sentinel',
    name: 'Sentinel Command Console',
    category: 'core_intelligence',
    route: '/terminal/sentinel',
    summary: 'Real-time command console showing global threat level, active engines, fusion scores, and live alerts from all intelligence systems.',
    sampleQuestions: [
      'What is the current threat level?',
      'Show me the Sentinel dashboard',
      'What engines are active right now?'
    ],
    keywords: ['sentinel', 'command', 'console', 'threat level', 'global', 'dashboard', 'engines', 'alerts'],
    relatedModules: ['hydra', 'constellation', 'analytics']
  },
  {
    id: 'predict',
    name: 'Prediction Console',
    category: 'core_intelligence',
    route: '/terminal/predict',
    summary: 'AI-powered risk prediction engine for events, entities, tokens, and chains using champion ML models with confidence scoring.',
    sampleQuestions: [
      'Predict the risk for this event',
      'What is the token price direction?',
      'Run entity manipulation prediction'
    ],
    keywords: ['predict', 'prediction', 'forecast', 'ai', 'ml', 'model', 'confidence', 'risk', 'direction'],
    relatedModules: ['analytics', 'radar', 'timeline']
  },
  {
    id: 'radar',
    name: 'Global Manipulation Radar',
    category: 'core_intelligence',
    route: '/terminal/radar',
    summary: 'Real-time manipulation risk visualization showing heatmaps across chains, entities, tokens, and networks with spike detection.',
    sampleQuestions: [
      'Show me the manipulation radar',
      'What chains have high risk?',
      'Any manipulation spikes detected?'
    ],
    keywords: ['radar', 'manipulation', 'heatmap', 'spike', 'visualization', 'risk', 'chains', 'global'],
    relatedModules: ['hydra', 'sentinel', 'map']
  },
  {
    id: 'rings',
    name: 'Ring Detector',
    category: 'core_intelligence',
    route: '/terminal/rings',
    summary: 'Manipulation ring and coordinated wallet cluster detection system that visualizes connected entities engaged in coordinated activity.',
    sampleQuestions: [
      'Any manipulation rings detected?',
      'Show me coordinated wallet clusters',
      'What entities are in Ring A?'
    ],
    keywords: ['ring', 'rings', 'coordination', 'coordinated', 'cluster', 'manipulation', 'connected'],
    relatedModules: ['hydra', 'constellation', 'graph']
  },
  {
    id: 'ultrafusion',
    name: 'UltraFusion',
    category: 'core_intelligence',
    route: '/terminal/ultrafusion',
    summary: 'Advanced multi-source intelligence fusion engine that combines signals from all detection systems into unified threat assessments.',
    sampleQuestions: [
      'What is UltraFusion showing?',
      'Run a fusion analysis',
      'Combine all intelligence sources'
    ],
    keywords: ['ultrafusion', 'fusion', 'combine', 'multi-source', 'unified', 'assessment', 'signals'],
    relatedModules: ['hydra', 'constellation', 'sentinel']
  },
  {
    id: 'valkyrie',
    name: 'Valkyrie',
    category: 'core_intelligence',
    route: '/terminal/valkyrie',
    summary: 'Advanced threat response and mitigation system for high-priority alerts requiring immediate action.',
    sampleQuestions: [
      'What is Valkyrie status?',
      'Any Valkyrie alerts?',
      'Show me threat response options'
    ],
    keywords: ['valkyrie', 'response', 'mitigation', 'action', 'priority', 'alert'],
    relatedModules: ['sentinel', 'hydra', 'phantom']
  },
  {
    id: 'phantom',
    name: 'Phantom',
    category: 'core_intelligence',
    route: '/terminal/phantom',
    summary: 'Stealth monitoring system for tracking hidden or obfuscated transactions and dark pool activity.',
    sampleQuestions: [
      'What is Phantom tracking?',
      'Any dark pool activity?',
      'Show hidden transactions'
    ],
    keywords: ['phantom', 'stealth', 'hidden', 'obfuscated', 'dark pool', 'tracking'],
    relatedModules: ['map', 'whale_intel', 'rings']
  }
];

// ============================================
// CATEGORY: MARKET + BLOCKCHAIN INTELLIGENCE (11 modules)
// ============================================

const MARKET_BLOCKCHAIN_MODULES: ModuleEntry[] = [
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    category: 'market_blockchain',
    route: '/terminal/analytics',
    summary: 'Real-time market intelligence dashboard with risk indices, whale activity metrics, market trends, and anomaly feeds.',
    sampleQuestions: [
      'Give me a market briefing',
      'What is the current risk level?',
      'Any anomalies to watch?'
    ],
    keywords: ['analytics', 'dashboard', 'market', 'risk', 'index', 'trends', 'anomaly', 'metrics'],
    relatedModules: ['sentinel', 'whale_intel', 'timeline']
  },
  {
    id: 'map',
    name: 'Global Threat Map',
    category: 'market_blockchain',
    route: '/threat-map',
    summary: 'Geographic 3D globe visualization of real-time threat distribution with whale activity, manipulation rings, and darkpool flows.',
    sampleQuestions: [
      'Show me the threat map',
      'Where are threats concentrated?',
      'Any regional hotspots?'
    ],
    keywords: ['map', 'globe', 'geographic', 'visualization', 'threat', 'regional', 'hotspot'],
    relatedModules: ['radar', 'analytics', 'sentinel']
  },
  {
    id: 'timeline',
    name: 'AI Timeline',
    category: 'market_blockchain',
    route: '/terminal/timeline',
    summary: 'Chronological intelligence event stream showing all alerts grouped by time with search and filtering capabilities.',
    sampleQuestions: [
      'Show me recent events',
      'What happened in the last hour?',
      'Search timeline for whale activity'
    ],
    keywords: ['timeline', 'events', 'chronological', 'history', 'stream', 'alerts', 'search'],
    relatedModules: ['analytics', 'sentinel', 'radar']
  },
  {
    id: 'graph',
    name: 'Influence Graph',
    category: 'market_blockchain',
    route: '/influence-graph',
    summary: 'Visual network graph of entity connections and relationships with interactive node exploration and cluster highlighting.',
    sampleQuestions: [
      'Show me the influence graph',
      'How are these entities connected?',
      'Explore this node connections'
    ],
    keywords: ['graph', 'influence', 'network', 'connections', 'nodes', 'edges', 'visual'],
    relatedModules: ['constellation', 'rings', 'entity']
  },
  {
    id: 'entity',
    name: 'Entity Scanner',
    category: 'market_blockchain',
    route: '/terminal/entity',
    summary: 'Detailed entity analysis tool showing risk breakdown, connection maps, and activity logs for individual wallets or clusters.',
    sampleQuestions: [
      'Analyze this entity',
      'What is the risk breakdown?',
      'Show entity activity log'
    ],
    keywords: ['entity', 'scanner', 'analysis', 'breakdown', 'activity', 'log', 'wallet'],
    relatedModules: ['ecoscan', 'constellation', 'whale_intel']
  },
  {
    id: 'token',
    name: 'Token Intelligence',
    category: 'market_blockchain',
    route: '/terminal/token',
    summary: 'Token-specific intelligence including price analysis, volume metrics, and manipulation risk indicators.',
    sampleQuestions: [
      'Analyze this token',
      'What is the token risk?',
      'Show token metrics'
    ],
    keywords: ['token', 'price', 'volume', 'metrics', 'analysis', 'coin', 'asset'],
    relatedModules: ['predict', 'analytics', 'radar']
  },
  {
    id: 'contracts',
    name: 'Smart Contracts',
    category: 'market_blockchain',
    route: '/terminal/contracts',
    summary: 'Smart contract analysis and monitoring for detecting malicious code patterns and vulnerability indicators.',
    sampleQuestions: [
      'Analyze this contract',
      'Is this contract safe?',
      'Check for vulnerabilities'
    ],
    keywords: ['contract', 'smart contract', 'code', 'vulnerability', 'malicious', 'analysis'],
    relatedModules: ['ecoscan', 'entity', 'predict']
  },
  {
    id: 'binder',
    name: 'Data Binder',
    category: 'market_blockchain',
    route: '/terminal/binder',
    summary: 'Data binding and aggregation tool for combining multiple intelligence sources into unified reports.',
    sampleQuestions: [
      'Bind these data sources',
      'Create aggregated report',
      'Combine intelligence feeds'
    ],
    keywords: ['binder', 'bind', 'aggregate', 'combine', 'report', 'data', 'sources'],
    relatedModules: ['ultrafusion', 'exporter', 'dataroom']
  },
  {
    id: 'exporter',
    name: 'Data Exporter',
    category: 'market_blockchain',
    route: '/terminal/exporter',
    summary: 'Export intelligence data and reports in multiple formats for external analysis and compliance reporting.',
    sampleQuestions: [
      'Export this data',
      'Download report as CSV',
      'Generate compliance export'
    ],
    keywords: ['export', 'download', 'csv', 'report', 'compliance', 'format', 'data'],
    relatedModules: ['binder', 'dataroom', 'compliance']
  },
  {
    id: 'dataroom',
    name: 'Data Room',
    category: 'market_blockchain',
    route: '/terminal/dataroom',
    summary: 'Secure data room for storing and sharing intelligence reports with stakeholders and compliance teams.',
    sampleQuestions: [
      'Open the data room',
      'Share this report',
      'Access stored intelligence'
    ],
    keywords: ['dataroom', 'data room', 'storage', 'share', 'secure', 'reports', 'stakeholders'],
    relatedModules: ['exporter', 'compliance', 'binder']
  },
  {
    id: 'compliance',
    name: 'Compliance Report',
    category: 'market_blockchain',
    route: '/terminal/compliance-report',
    summary: 'Automated compliance reporting system generating regulatory-ready documentation and audit trails.',
    sampleQuestions: [
      'Generate compliance report',
      'Show audit trail',
      'Create regulatory documentation'
    ],
    keywords: ['compliance', 'report', 'regulatory', 'audit', 'documentation', 'legal'],
    relatedModules: ['exporter', 'dataroom', 'entity']
  }
];

// ============================================
// CATEGORY: UI-DRIVEN SYSTEMS (8 modules)
// ============================================

const UI_SYSTEMS_MODULES: ModuleEntry[] = [
  {
    id: 'home',
    name: 'Terminal Home',
    category: 'ui_systems',
    route: '/terminal/home',
    summary: 'GhostQuant terminal dashboard and navigation hub with quick actions, recent activity, and system status overview.',
    sampleQuestions: [
      'Take me to the home page',
      'What can I do from here?',
      'Show me recent activity'
    ],
    keywords: ['home', 'dashboard', 'navigation', 'hub', 'quick actions', 'recent', 'status'],
    relatedModules: ['analytics', 'sentinel', 'settings']
  },
  {
    id: 'ghostmind',
    name: 'GhostMind AI',
    category: 'ui_systems',
    route: '/terminal/ghostmind',
    summary: 'AI-powered conversational intelligence interface for natural language queries and contextual assistance.',
    sampleQuestions: [
      'Open GhostMind',
      'Ask GhostMind a question',
      'Get AI assistance'
    ],
    keywords: ['ghostmind', 'ai', 'chat', 'conversation', 'assistant', 'query', 'help'],
    relatedModules: ['copilot', 'home', 'settings']
  },
  {
    id: 'copilot',
    name: 'Voice Copilot',
    category: 'ui_systems',
    route: undefined,
    summary: 'Voice-activated AI assistant with wake-word detection, multilingual support, and context-aware responses.',
    sampleQuestions: [
      'How do I use the Copilot?',
      'What can I ask the Copilot?',
      'Enable voice commands'
    ],
    keywords: ['copilot', 'voice', 'assistant', 'wake word', 'hey ghostquant', 'speak', 'talk'],
    relatedModules: ['ghostmind', 'settings', 'home']
  },
  {
    id: 'settings',
    name: 'Settings',
    category: 'ui_systems',
    route: '/terminal/settings',
    summary: 'User preferences and configuration panel for customizing the GhostQuant experience.',
    sampleQuestions: [
      'Open settings',
      'Change my preferences',
      'Configure notifications'
    ],
    keywords: ['settings', 'preferences', 'config', 'configuration', 'customize', 'options'],
    relatedModules: ['home', 'copilot', 'billing']
  },
  {
    id: 'billing',
    name: 'Billing',
    category: 'ui_systems',
    route: '/terminal/billing',
    summary: 'Subscription management and billing portal for GhostQuant services.',
    sampleQuestions: [
      'Show my billing',
      'Upgrade my plan',
      'View subscription status'
    ],
    keywords: ['billing', 'subscription', 'payment', 'plan', 'upgrade', 'account'],
    relatedModules: ['settings', 'pricing', 'licenses']
  },
  {
    id: 'pricing',
    name: 'Pricing',
    category: 'ui_systems',
    route: '/terminal/pricing',
    summary: 'GhostQuant pricing tiers and feature comparison for different subscription levels.',
    sampleQuestions: [
      'Show me pricing',
      'What plans are available?',
      'Compare features'
    ],
    keywords: ['pricing', 'price', 'cost', 'plans', 'tiers', 'features', 'compare'],
    relatedModules: ['billing', 'licenses', 'settings']
  },
  {
    id: 'licenses',
    name: 'Licenses',
    category: 'ui_systems',
    route: '/terminal/licenses',
    summary: 'License management for API access and enterprise deployments.',
    sampleQuestions: [
      'Show my licenses',
      'Generate API key',
      'Manage access tokens'
    ],
    keywords: ['license', 'licenses', 'api', 'key', 'token', 'access', 'enterprise'],
    relatedModules: ['billing', 'settings', 'config']
  },
  {
    id: 'config',
    name: 'Configuration',
    category: 'ui_systems',
    route: '/terminal/config',
    summary: 'Advanced system configuration for power users and administrators.',
    sampleQuestions: [
      'Open configuration',
      'Change system settings',
      'Configure advanced options'
    ],
    keywords: ['config', 'configuration', 'advanced', 'system', 'admin', 'power user'],
    relatedModules: ['settings', 'licenses', 'secrets']
  }
];

// ============================================
// CATEGORY: SYSTEM INTELLIGENCE + DIAGNOSTICS (8 modules)
// ============================================

const SYSTEM_DIAGNOSTICS_MODULES: ModuleEntry[] = [
  {
    id: 'secrets',
    name: 'Secrets Manager',
    category: 'system_diagnostics',
    route: '/terminal/secrets',
    summary: 'Secure secrets and credentials management for API keys and sensitive configuration.',
    sampleQuestions: [
      'Manage my secrets',
      'Add API key',
      'View stored credentials'
    ],
    keywords: ['secrets', 'credentials', 'api key', 'secure', 'sensitive', 'vault'],
    relatedModules: ['config', 'licenses', 'settings']
  },
  {
    id: 'partners',
    name: 'Partners',
    category: 'system_diagnostics',
    route: '/terminal/partners',
    summary: 'Partner integration management and channel partner portal.',
    sampleQuestions: [
      'Show partner integrations',
      'Add new partner',
      'View partner status'
    ],
    keywords: ['partners', 'partner', 'integration', 'channel', 'reseller', 'affiliate'],
    relatedModules: ['licenses', 'billing', 'config']
  },
  {
    id: 'deck',
    name: 'Pitch Deck',
    category: 'system_diagnostics',
    route: '/terminal/deck',
    summary: 'GhostQuant pitch deck and presentation materials for investors and stakeholders.',
    sampleQuestions: [
      'Show the pitch deck',
      'View presentation',
      'Get investor materials'
    ],
    keywords: ['deck', 'pitch', 'presentation', 'investor', 'slides', 'materials'],
    relatedModules: ['pitchdeck', 'proposals', 'rfp']
  },
  {
    id: 'pitchdeck',
    name: 'Pitch Deck Builder',
    category: 'system_diagnostics',
    route: '/terminal/pitchdeck',
    summary: 'Interactive pitch deck builder for creating custom presentations.',
    sampleQuestions: [
      'Build a pitch deck',
      'Create presentation',
      'Customize slides'
    ],
    keywords: ['pitchdeck', 'builder', 'create', 'custom', 'presentation', 'slides'],
    relatedModules: ['deck', 'proposals', 'dataroom']
  },
  {
    id: 'proposals',
    name: 'Proposals',
    category: 'system_diagnostics',
    route: '/terminal/proposals',
    summary: 'Proposal generation and management for enterprise sales and partnerships.',
    sampleQuestions: [
      'Create a proposal',
      'View proposals',
      'Generate quote'
    ],
    keywords: ['proposal', 'proposals', 'quote', 'enterprise', 'sales', 'deal'],
    relatedModules: ['rfp', 'deck', 'partners']
  },
  {
    id: 'rfp',
    name: 'RFP Manager',
    category: 'system_diagnostics',
    route: '/terminal/rfp',
    summary: 'Request for Proposal management and response automation.',
    sampleQuestions: [
      'Manage RFPs',
      'Respond to RFP',
      'View pending requests'
    ],
    keywords: ['rfp', 'request', 'proposal', 'response', 'bid', 'tender'],
    relatedModules: ['proposals', 'partners', 'compliance']
  },
  {
    id: 'demo_mode',
    name: 'Demo Mode',
    category: 'system_diagnostics',
    route: undefined,
    summary: 'Interactive demonstration mode showcasing GhostQuant capabilities with simulated data.',
    sampleQuestions: [
      'Enable demo mode',
      'Show me a demo',
      'Run demonstration'
    ],
    keywords: ['demo', 'demonstration', 'showcase', 'sample', 'simulated', 'trial'],
    relatedModules: ['home', 'analytics', 'hydra']
  },
  {
    id: 'health',
    name: 'System Health',
    category: 'system_diagnostics',
    route: undefined,
    summary: 'System health monitoring and diagnostics for all GhostQuant services.',
    sampleQuestions: [
      'Check system health',
      'Is everything working?',
      'Show service status'
    ],
    keywords: ['health', 'status', 'diagnostics', 'monitoring', 'services', 'uptime'],
    relatedModules: ['sentinel', 'config', 'settings']
  }
];

// ============================================
// COMBINED REGISTRY
// ============================================

export const MODULE_REGISTRY: ModuleEntry[] = [
  ...CORE_INTELLIGENCE_MODULES,
  ...MARKET_BLOCKCHAIN_MODULES,
  ...UI_SYSTEMS_MODULES,
  ...SYSTEM_DIAGNOSTICS_MODULES
];

// ============================================
// LOOKUP FUNCTIONS
// ============================================

/**
 * Get module by ID
 */
export function getModuleById(id: string): ModuleEntry | undefined {
  return MODULE_REGISTRY.find(m => m.id === id);
}

/**
 * Get modules by category
 */
export function getModulesByCategory(category: ModuleCategory): ModuleEntry[] {
  return MODULE_REGISTRY.filter(m => m.category === category);
}

/**
 * Get module by route
 */
export function getModuleByRoute(route: string): ModuleEntry | undefined {
  return MODULE_REGISTRY.find(m => m.route === route);
}

/**
 * Search modules by keyword (partial match, case-insensitive)
 */
export function searchModules(query: string): ModuleEntry[] {
  const lowerQuery = query.toLowerCase();
  return MODULE_REGISTRY.filter(m => 
    m.name.toLowerCase().includes(lowerQuery) ||
    m.summary.toLowerCase().includes(lowerQuery) ||
    m.keywords.some(k => k.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get related modules for a given module ID
 */
export function getRelatedModules(moduleId: string): ModuleEntry[] {
  const module = getModuleById(moduleId);
  if (!module) return [];
  return module.relatedModules
    .map(id => getModuleById(id))
    .filter((m): m is ModuleEntry => m !== undefined);
}

/**
 * Find best matching module for a user query
 */
export function findBestMatch(query: string): ModuleEntry | null {
  const lowerQuery = query.toLowerCase();
  
  // Priority 1: Exact keyword match
  for (const module of MODULE_REGISTRY) {
    if (module.keywords.some(k => lowerQuery.includes(k))) {
      return module;
    }
  }
  
  // Priority 2: Name match
  for (const module of MODULE_REGISTRY) {
    if (lowerQuery.includes(module.name.toLowerCase())) {
      return module;
    }
  }
  
  // Priority 3: Partial keyword match
  const matches = searchModules(query);
  return matches.length > 0 ? matches[0] : null;
}

/**
 * Get all module IDs
 */
export function getAllModuleIds(): string[] {
  return MODULE_REGISTRY.map(m => m.id);
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: ModuleCategory): string {
  const names: Record<ModuleCategory, string> = {
    core_intelligence: 'Core Intelligence Engines',
    market_blockchain: 'Market & Blockchain Intelligence',
    ui_systems: 'UI-Driven Systems',
    system_diagnostics: 'System Intelligence & Diagnostics'
  };
  return names[category];
}

/**
 * Get module count by category
 */
export function getModuleCountByCategory(): Record<ModuleCategory, number> {
  return {
    core_intelligence: CORE_INTELLIGENCE_MODULES.length,
    market_blockchain: MARKET_BLOCKCHAIN_MODULES.length,
    ui_systems: UI_SYSTEMS_MODULES.length,
    system_diagnostics: SYSTEM_DIAGNOSTICS_MODULES.length
  };
}

// ============================================
// EXPORTS
// ============================================

export {
  CORE_INTELLIGENCE_MODULES,
  MARKET_BLOCKCHAIN_MODULES,
  UI_SYSTEMS_MODULES,
  SYSTEM_DIAGNOSTICS_MODULES
};

// Default export for convenience
export default {
  registry: MODULE_REGISTRY,
  getModuleById,
  getModulesByCategory,
  getModuleByRoute,
  searchModules,
  getRelatedModules,
  findBestMatch,
  getAllModuleIds,
  getCategoryDisplayName,
  getModuleCountByCategory
};
