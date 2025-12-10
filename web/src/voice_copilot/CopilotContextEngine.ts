/**
 * CopilotContextEngine - Contextual Awareness System
 * 
 * Autopopulates contextual clues such as:
 * - Current page (Hydra, Constellation, EcoScan, Dashboard, Entity Scan)
 * - Current selected wallet/entity
 * - Hovered chart item
 * - Recently asked questions
 * - User interaction sequence
 * 
 * Response Pipeline:
 * User Input → Intent Model → Context Engine → Knowledge Base → Personality → Tone → Final Answer
 */

import { KnowledgeCategory } from './CopilotKnowledgeBase';

export interface PageContext {
  path: string;
  name: string;
  category: KnowledgeCategory;
  description: string;
  keyElements: string[];
}

export interface SelectedEntity {
  type: 'wallet' | 'cluster' | 'asset' | 'entity' | 'transaction';
  id: string;
  label?: string;
  riskScore?: number;
  metadata?: Record<string, unknown>;
}

export interface HoveredElement {
  type: 'chart' | 'metric' | 'alert' | 'node' | 'row' | 'button';
  id: string;
  label?: string;
  value?: string | number;
  timestamp?: number;
}

export interface RecentQuestion {
  query: string;
  intent: string;
  timestamp: number;
  wasHelpful?: boolean;
}

export interface UserInteraction {
  type: 'click' | 'hover' | 'scroll' | 'navigate' | 'search' | 'filter';
  target: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface ContextState {
  currentPage: PageContext | null;
  selectedEntity: SelectedEntity | null;
  hoveredElement: HoveredElement | null;
  recentQuestions: RecentQuestion[];
  interactionHistory: UserInteraction[];
  sessionStartTime: number;
  lastActivityTime: number;
  userPreferences: UserPreferences;
}

export interface UserPreferences {
  preferredDepth: 'simple' | 'standard' | 'technical';
  preferredTone: 'casual' | 'professional';
  showFollowUps: boolean;
  autoPlayVoice: boolean;
}

export interface ContextClues {
  pageCategory: KnowledgeCategory;
  pageName: string;
  hasSelectedEntity: boolean;
  selectedEntityType?: string;
  selectedEntityId?: string;
  hasHoveredElement: boolean;
  hoveredElementType?: string;
  recentTopics: string[];
  interactionPattern: 'exploring' | 'focused' | 'searching' | 'idle';
  sessionDuration: number;
  questionsAsked: number;
}

// ============================================
// PAGE CONTEXT DEFINITIONS
// ============================================

const PAGE_CONTEXTS: Record<string, PageContext> = {
  // ============================================
  // CORE INTELLIGENCE ENGINES
  // ============================================
  '/terminal/hydra': {
    path: '/terminal/hydra',
    name: 'Hydra Console',
    category: 'hydra',
    description: 'Multi-head threat detection engine showing real-time manipulation alerts',
    keyElements: ['detection heads', 'confidence scores', 'active alerts', 'threat timeline'],
  },
  '/terminal/constellation': {
    path: '/terminal/constellation',
    name: 'Constellation Map',
    category: 'constellation',
    description: 'Entity fusion engine showing wallet relationships and cluster analysis',
    keyElements: ['entity clusters', 'connection graph', 'risk propagation', 'entity details'],
  },
  '/ecoscan': {
    path: '/ecoscan',
    name: 'EcoScan',
    category: 'ecoscan',
    description: 'Entity scanning tool for wallet risk assessment',
    keyElements: ['address input', 'risk assessment', 'behavioral analysis', 'threat indicators'],
  },
  '/terminal/whales': {
    path: '/terminal/whales',
    name: 'Whale Intelligence',
    category: 'whale_intel',
    description: 'Large holder tracking and movement analysis',
    keyElements: ['whale list', 'movement alerts', 'impact predictions', 'activity timeline'],
  },
  '/terminal/whale-intel': {
    path: '/terminal/whale-intel',
    name: 'Whale Intelligence Database',
    category: 'whale_intel',
    description: 'Comprehensive database of whale entities and risk profiles',
    keyElements: ['entity profiles', 'risk scores', 'transaction history', 'watchlist status'],
  },
  '/terminal/sentinel': {
    path: '/terminal/sentinel',
    name: 'Sentinel Command Console',
    category: 'sentinel',
    description: 'Real-time system health monitoring with global threat assessment and active engine status',
    keyElements: ['global threat level', 'active engines', 'fusion score', 'live alerts'],
  },
  '/terminal/predict': {
    path: '/terminal/predict',
    name: 'Prediction Console',
    category: 'predict',
    description: 'AI-powered risk predictions for events, entities, tokens, and chains with champion model tracking',
    keyElements: ['prediction models', 'confidence intervals', 'champion model', 'prediction history'],
  },
  '/terminal/radar': {
    path: '/terminal/radar',
    name: 'Global Manipulation Radar',
    category: 'radar',
    description: 'Real-time manipulation risk heatmap with spike detection across chains, entities, tokens, and networks',
    keyElements: ['heatmap', 'manipulation spikes', 'volatility spikes', 'risk levels'],
  },
  '/terminal/rings': {
    path: '/terminal/rings',
    name: 'Ring Detector',
    category: 'rings',
    description: 'Detects manipulation rings and coordinated wallet clusters with real-time severity scoring',
    keyElements: ['ring nodes', 'severity levels', 'activity tracking', 'cluster visualization'],
  },
  '/terminal/ultrafusion': {
    path: '/terminal/ultrafusion',
    name: 'UltraFusion',
    category: 'ultrafusion',
    description: 'Advanced multi-source intelligence fusion engine combining signals from all detection systems',
    keyElements: ['fusion signals', 'unified assessment', 'multi-source analysis', 'threat synthesis'],
  },
  '/terminal/valkyrie': {
    path: '/terminal/valkyrie',
    name: 'Valkyrie',
    category: 'valkyrie',
    description: 'Advanced threat response and mitigation system for high-priority alerts',
    keyElements: ['threat response', 'mitigation options', 'priority alerts', 'action queue'],
  },
  '/terminal/phantom': {
    path: '/terminal/phantom',
    name: 'Phantom',
    category: 'phantom',
    description: 'Stealth monitoring system for tracking hidden or obfuscated transactions and dark pool activity',
    keyElements: ['dark pool activity', 'hidden transactions', 'obfuscation detection', 'stealth tracking'],
  },
  // ============================================
  // MARKET + BLOCKCHAIN INTELLIGENCE
  // ============================================
  '/terminal/analytics': {
    path: '/terminal/analytics',
    name: 'Analytics Dashboard',
    category: 'analytics',
    description: 'Real-time market intelligence with risk indices and anomaly feeds',
    keyElements: ['risk index', 'whale activity', 'market trends', 'anomaly feed', 'narrative summary'],
  },
  '/terminal/map': {
    path: '/terminal/map',
    name: 'Global Threat Map',
    category: 'map',
    description: 'Geographic 3D globe visualization of real-time threat distribution with whale activity and manipulation rings',
    keyElements: ['threat points', 'flow arcs', 'regional hotspots', 'threat filters'],
  },
  '/terminal/timeline': {
    path: '/terminal/timeline',
    name: 'AI Timeline',
    category: 'timeline',
    description: 'Chronological intelligence event stream showing all alerts grouped by time with search and filtering',
    keyElements: ['event stream', 'severity classification', 'time grouping', 'search filters'],
  },
  '/terminal/graph': {
    path: '/terminal/graph',
    name: 'Influence Graph',
    category: 'graph',
    description: 'Visual network graph of entity connections and relationships with interactive node exploration',
    keyElements: ['connection nodes', 'relationship edges', 'cluster highlights', 'risk indicators'],
  },
  '/terminal/entity': {
    path: '/terminal/entity',
    name: 'Entity Scanner',
    category: 'entity',
    description: 'Detailed entity analysis tool showing risk breakdown, connection maps, and activity logs',
    keyElements: ['entity profile', 'risk breakdown', 'connection map', 'activity log'],
  },
  '/terminal/token': {
    path: '/terminal/token',
    name: 'Token Intelligence',
    category: 'token',
    description: 'Token-specific intelligence including price analysis, volume metrics, and manipulation risk indicators',
    keyElements: ['price analysis', 'volume metrics', 'manipulation risk', 'token profile'],
  },
  '/terminal/contracts': {
    path: '/terminal/contracts',
    name: 'Smart Contracts',
    category: 'contracts',
    description: 'Smart contract analysis and monitoring for detecting malicious code patterns and vulnerabilities',
    keyElements: ['contract analysis', 'vulnerability scan', 'code patterns', 'risk indicators'],
  },
  '/terminal/binder': {
    path: '/terminal/binder',
    name: 'Data Binder',
    category: 'binder',
    description: 'Data binding and aggregation tool for combining multiple intelligence sources into unified reports',
    keyElements: ['data sources', 'aggregation', 'report builder', 'intelligence feeds'],
  },
  '/terminal/exporter': {
    path: '/terminal/exporter',
    name: 'Data Exporter',
    category: 'exporter',
    description: 'Export intelligence data and reports in multiple formats for external analysis and compliance',
    keyElements: ['export formats', 'report download', 'compliance export', 'data extraction'],
  },
  '/terminal/dataroom': {
    path: '/terminal/dataroom',
    name: 'Data Room',
    category: 'dataroom',
    description: 'Secure data room for storing and sharing intelligence reports with stakeholders',
    keyElements: ['stored reports', 'sharing controls', 'stakeholder access', 'document management'],
  },
  '/terminal/compliance-report': {
    path: '/terminal/compliance-report',
    name: 'Compliance Report',
    category: 'compliance',
    description: 'Automated compliance reporting system generating regulatory-ready documentation and audit trails',
    keyElements: ['regulatory reports', 'audit trails', 'compliance documentation', 'export options'],
  },
  // ============================================
  // UI-DRIVEN SYSTEMS
  // ============================================
  '/terminal/home': {
    path: '/terminal/home',
    name: 'Terminal Home',
    category: 'home',
    description: 'GhostQuant terminal dashboard and navigation hub with quick actions and system status',
    keyElements: ['quick actions', 'recent activity', 'system status', 'navigation menu'],
  },
  '/terminal/ghostmind': {
    path: '/terminal/ghostmind',
    name: 'GhostMind AI',
    category: 'ghostmind',
    description: 'AI-powered conversational intelligence interface for natural language queries',
    keyElements: ['chat interface', 'query history', 'suggested questions', 'context panel'],
  },
  '/terminal/settings': {
    path: '/terminal/settings',
    name: 'Settings',
    category: 'settings',
    description: 'User preferences and configuration panel for customizing the GhostQuant experience',
    keyElements: ['preferences', 'notifications', 'display options', 'account settings'],
  },
  '/terminal/billing': {
    path: '/terminal/billing',
    name: 'Billing',
    category: 'billing',
    description: 'Subscription management and billing portal for GhostQuant services',
    keyElements: ['subscription status', 'payment methods', 'invoices', 'plan details'],
  },
  '/terminal/pricing': {
    path: '/terminal/pricing',
    name: 'Pricing',
    category: 'pricing',
    description: 'GhostQuant pricing tiers and feature comparison for different subscription levels',
    keyElements: ['pricing tiers', 'feature comparison', 'plan selection', 'upgrade options'],
  },
  '/terminal/licenses': {
    path: '/terminal/licenses',
    name: 'Licenses',
    category: 'licenses',
    description: 'License management for API access and enterprise deployments',
    keyElements: ['API keys', 'access tokens', 'license status', 'usage limits'],
  },
  '/terminal/config': {
    path: '/terminal/config',
    name: 'Configuration',
    category: 'config',
    description: 'Advanced system configuration for power users and administrators',
    keyElements: ['system settings', 'advanced options', 'admin controls', 'integration config'],
  },
  // ============================================
  // SYSTEM INTELLIGENCE + DIAGNOSTICS
  // ============================================
  '/terminal/secrets': {
    path: '/terminal/secrets',
    name: 'Secrets Manager',
    category: 'secrets',
    description: 'Secure secrets and credentials management for API keys and sensitive configuration',
    keyElements: ['API keys', 'credentials', 'secure storage', 'access management'],
  },
  '/terminal/partners': {
    path: '/terminal/partners',
    name: 'Partners',
    category: 'partners',
    description: 'Partner integration management and channel partner portal',
    keyElements: ['partner list', 'integration status', 'channel management', 'partner portal'],
  },
  '/terminal/deck': {
    path: '/terminal/deck',
    name: 'Pitch Deck',
    category: 'deck',
    description: 'GhostQuant pitch deck and presentation materials for investors and stakeholders',
    keyElements: ['presentation slides', 'investor materials', 'company overview', 'product highlights'],
  },
  '/terminal/pitchdeck': {
    path: '/terminal/pitchdeck',
    name: 'Pitch Deck Builder',
    category: 'pitchdeck',
    description: 'Interactive pitch deck builder for creating custom presentations',
    keyElements: ['slide builder', 'template selection', 'customization', 'export options'],
  },
  '/terminal/proposals': {
    path: '/terminal/proposals',
    name: 'Proposals',
    category: 'proposals',
    description: 'Proposal generation and management for enterprise sales and partnerships',
    keyElements: ['proposal templates', 'quote builder', 'deal tracking', 'approval workflow'],
  },
  '/terminal/rfp': {
    path: '/terminal/rfp',
    name: 'RFP Manager',
    category: 'rfp',
    description: 'Request for Proposal management and response automation',
    keyElements: ['RFP list', 'response builder', 'deadline tracking', 'submission status'],
  },
  '/': {
    path: '/',
    name: 'GhostQuant Home',
    category: 'general',
    description: 'GhostQuant platform landing page',
    keyElements: ['platform overview', 'feature highlights', 'getting started'],
  },
};

// ============================================
// CONTEXT STATE MANAGEMENT
// ============================================

/**
 * Create initial context state
 */
export function createInitialContextState(): ContextState {
  return {
    currentPage: null,
    selectedEntity: null,
    hoveredElement: null,
    recentQuestions: [],
    interactionHistory: [],
    sessionStartTime: Date.now(),
    lastActivityTime: Date.now(),
    userPreferences: {
      preferredDepth: 'standard',
      preferredTone: 'casual',
      showFollowUps: true,
      autoPlayVoice: true,
    },
  };
}

/**
 * Update context with current page
 */
export function updatePageContext(state: ContextState, path: string): ContextState {
  // Find matching page context
  let pageContext = PAGE_CONTEXTS[path];
  
  // Try partial matching if exact match not found
  if (!pageContext) {
    for (const [contextPath, context] of Object.entries(PAGE_CONTEXTS)) {
      if (path.startsWith(contextPath) || contextPath.startsWith(path)) {
        pageContext = context;
        break;
      }
    }
  }
  
  // Default to general if no match
  if (!pageContext) {
    pageContext = {
      path,
      name: 'GhostQuant',
      category: 'general',
      description: 'GhostQuant Intelligence Platform',
      keyElements: [],
    };
  }
  
  return {
    ...state,
    currentPage: pageContext,
    lastActivityTime: Date.now(),
    interactionHistory: [
      ...state.interactionHistory.slice(-49),
      {
        type: 'navigate',
        target: path,
        timestamp: Date.now(),
      },
    ],
  };
}

/**
 * Update context with selected entity
 */
export function updateSelectedEntity(
  state: ContextState,
  entity: SelectedEntity | null
): ContextState {
  return {
    ...state,
    selectedEntity: entity,
    lastActivityTime: Date.now(),
    interactionHistory: entity ? [
      ...state.interactionHistory.slice(-49),
      {
        type: 'click',
        target: `${entity.type}:${entity.id}`,
        timestamp: Date.now(),
        metadata: { entityType: entity.type },
      },
    ] : state.interactionHistory,
  };
}

/**
 * Update context with hovered element
 */
export function updateHoveredElement(
  state: ContextState,
  element: HoveredElement | null
): ContextState {
  return {
    ...state,
    hoveredElement: element,
    lastActivityTime: Date.now(),
  };
}

/**
 * Add question to recent questions
 */
export function addRecentQuestion(
  state: ContextState,
  query: string,
  intent: string
): ContextState {
  const question: RecentQuestion = {
    query,
    intent,
    timestamp: Date.now(),
  };
  
  return {
    ...state,
    recentQuestions: [...state.recentQuestions.slice(-9), question],
    lastActivityTime: Date.now(),
  };
}

/**
 * Mark last question as helpful or not
 */
export function markQuestionHelpfulness(
  state: ContextState,
  wasHelpful: boolean
): ContextState {
  if (state.recentQuestions.length === 0) return state;
  
  const questions = [...state.recentQuestions];
  questions[questions.length - 1] = {
    ...questions[questions.length - 1],
    wasHelpful,
  };
  
  return {
    ...state,
    recentQuestions: questions,
  };
}

/**
 * Update user preferences
 */
export function updateUserPreferences(
  state: ContextState,
  preferences: Partial<UserPreferences>
): ContextState {
  return {
    ...state,
    userPreferences: {
      ...state.userPreferences,
      ...preferences,
    },
  };
}

// ============================================
// CONTEXT EXTRACTION
// ============================================

/**
 * Extract context clues from current state
 */
export function extractContextClues(state: ContextState): ContextClues {
  const now = Date.now();
  const sessionDuration = Math.floor((now - state.sessionStartTime) / 1000);
  
  // Determine interaction pattern
  const recentInteractions = state.interactionHistory.filter(
    i => now - i.timestamp < 60000 // Last minute
  );
  
  let interactionPattern: ContextClues['interactionPattern'] = 'idle';
  if (recentInteractions.length > 10) {
    interactionPattern = 'exploring';
  } else if (recentInteractions.length > 3) {
    const types = new Set(recentInteractions.map(i => i.type));
    if (types.has('search') || types.has('filter')) {
      interactionPattern = 'searching';
    } else {
      interactionPattern = 'focused';
    }
  }
  
  // Extract recent topics from questions
  const recentTopics = state.recentQuestions
    .slice(-5)
    .map(q => q.intent)
    .filter((v, i, a) => a.indexOf(v) === i); // Unique
  
  return {
    pageCategory: state.currentPage?.category || 'general',
    pageName: state.currentPage?.name || 'GhostQuant',
    hasSelectedEntity: state.selectedEntity !== null,
    selectedEntityType: state.selectedEntity?.type,
    selectedEntityId: state.selectedEntity?.id,
    hasHoveredElement: state.hoveredElement !== null,
    hoveredElementType: state.hoveredElement?.type,
    recentTopics,
    interactionPattern,
    sessionDuration,
    questionsAsked: state.recentQuestions.length,
  };
}

/**
 * Get contextual description for current state
 */
export function getContextDescription(state: ContextState): string {
  const parts: string[] = [];
  
  if (state.currentPage) {
    parts.push(`You're on the ${state.currentPage.name}.`);
    parts.push(state.currentPage.description);
  }
  
  if (state.selectedEntity) {
    const entityLabel = state.selectedEntity.label || state.selectedEntity.id;
    parts.push(`You have ${state.selectedEntity.type} "${entityLabel}" selected.`);
    
    if (state.selectedEntity.riskScore !== undefined) {
      parts.push(`Its risk score is ${state.selectedEntity.riskScore}.`);
    }
  }
  
  if (state.hoveredElement) {
    const elementLabel = state.hoveredElement.label || state.hoveredElement.id;
    parts.push(`You're looking at the ${state.hoveredElement.type} "${elementLabel}".`);
    
    if (state.hoveredElement.value !== undefined) {
      parts.push(`It shows ${state.hoveredElement.value}.`);
    }
  }
  
  return parts.join(' ');
}

/**
 * Get relevant page elements for context
 */
export function getRelevantPageElements(state: ContextState): string[] {
  if (!state.currentPage) return [];
  return state.currentPage.keyElements;
}

/**
 * Infer what user might be asking about based on context
 */
export function inferQuerySubject(state: ContextState): string | null {
  // Priority 1: Hovered element
  if (state.hoveredElement) {
    return `the ${state.hoveredElement.type} ${state.hoveredElement.label || state.hoveredElement.id}`;
  }
  
  // Priority 2: Selected entity
  if (state.selectedEntity) {
    return `${state.selectedEntity.type} ${state.selectedEntity.label || state.selectedEntity.id}`;
  }
  
  // Priority 3: Current page
  if (state.currentPage) {
    return `the ${state.currentPage.name}`;
  }
  
  return null;
}

/**
 * Get suggested questions based on context
 */
export function getSuggestedQuestions(state: ContextState): string[] {
  const suggestions: string[] = [];
  
  if (state.currentPage) {
    switch (state.currentPage.category) {
      // Core Intelligence Engines
      case 'hydra':
        suggestions.push('What threats are being detected?');
        suggestions.push('Explain the confidence scores');
        suggestions.push('What is wash trading?');
        break;
      case 'constellation':
        suggestions.push('How are these entities connected?');
        suggestions.push('What does this cluster mean?');
        suggestions.push('Explain risk propagation');
        break;
      case 'ecoscan':
        suggestions.push('Is this address safe?');
        suggestions.push('What are the risk factors?');
        suggestions.push('Show me the connections');
        break;
      case 'whale_intel':
        suggestions.push('What are whales doing?');
        suggestions.push('Any significant movements?');
        suggestions.push('Who are the biggest holders?');
        break;
      case 'sentinel':
        suggestions.push('What is the current threat level?');
        suggestions.push('Which engines are active?');
        suggestions.push('Show me the fusion score');
        break;
      case 'predict':
        suggestions.push('Predict the risk for this event');
        suggestions.push('What is the token price direction?');
        suggestions.push('Run entity manipulation prediction');
        break;
      case 'radar':
        suggestions.push('Show me the manipulation radar');
        suggestions.push('What chains have high risk?');
        suggestions.push('Any manipulation spikes detected?');
        break;
      case 'rings':
        suggestions.push('Any manipulation rings detected?');
        suggestions.push('Show me coordinated wallet clusters');
        suggestions.push('What entities are in this ring?');
        break;
      case 'ultrafusion':
        suggestions.push('What is UltraFusion showing?');
        suggestions.push('Run a fusion analysis');
        suggestions.push('Combine all intelligence sources');
        break;
      case 'valkyrie':
        suggestions.push('What is Valkyrie status?');
        suggestions.push('Any Valkyrie alerts?');
        suggestions.push('Show me threat response options');
        break;
      case 'phantom':
        suggestions.push('What is Phantom tracking?');
        suggestions.push('Any dark pool activity?');
        suggestions.push('Show hidden transactions');
        break;
      // Market + Blockchain Intelligence
      case 'analytics':
        suggestions.push('Give me a market briefing');
        suggestions.push('What\'s the current risk level?');
        suggestions.push('Any anomalies to watch?');
        break;
      case 'map':
        suggestions.push('Show me the threat map');
        suggestions.push('Where are threats concentrated?');
        suggestions.push('Any regional hotspots?');
        break;
      case 'timeline':
        suggestions.push('Show me recent events');
        suggestions.push('What happened in the last hour?');
        suggestions.push('Search timeline for whale activity');
        break;
      case 'graph':
        suggestions.push('Show me the influence graph');
        suggestions.push('How are these entities connected?');
        suggestions.push('Explore this node connections');
        break;
      case 'entity':
        suggestions.push('Analyze this entity');
        suggestions.push('What is the risk breakdown?');
        suggestions.push('Show entity activity log');
        break;
      case 'token':
        suggestions.push('Analyze this token');
        suggestions.push('What is the token risk?');
        suggestions.push('Show token metrics');
        break;
      case 'contracts':
        suggestions.push('Analyze this contract');
        suggestions.push('Is this contract safe?');
        suggestions.push('Check for vulnerabilities');
        break;
      case 'binder':
        suggestions.push('Bind these data sources');
        suggestions.push('Create aggregated report');
        suggestions.push('Combine intelligence feeds');
        break;
      case 'exporter':
        suggestions.push('Export this data');
        suggestions.push('Download report as CSV');
        suggestions.push('Generate compliance export');
        break;
      case 'dataroom':
        suggestions.push('Open the data room');
        suggestions.push('Share this report');
        suggestions.push('Access stored intelligence');
        break;
      case 'compliance':
        suggestions.push('Generate compliance report');
        suggestions.push('Show audit trail');
        suggestions.push('Create regulatory documentation');
        break;
      // UI-Driven Systems
      case 'home':
        suggestions.push('What can I do from here?');
        suggestions.push('Show me recent activity');
        suggestions.push('Where should I start?');
        break;
      case 'ghostmind':
        suggestions.push('Ask GhostMind a question');
        suggestions.push('Get AI assistance');
        suggestions.push('What can GhostMind help with?');
        break;
      case 'settings':
        suggestions.push('Change my preferences');
        suggestions.push('Configure notifications');
        suggestions.push('Update display options');
        break;
      case 'billing':
        suggestions.push('Show my billing');
        suggestions.push('Upgrade my plan');
        suggestions.push('View subscription status');
        break;
      case 'pricing':
        suggestions.push('Show me pricing');
        suggestions.push('What plans are available?');
        suggestions.push('Compare features');
        break;
      case 'licenses':
        suggestions.push('Show my licenses');
        suggestions.push('Generate API key');
        suggestions.push('Manage access tokens');
        break;
      case 'config':
        suggestions.push('Open configuration');
        suggestions.push('Change system settings');
        suggestions.push('Configure advanced options');
        break;
      // System Intelligence + Diagnostics
      case 'secrets':
        suggestions.push('Manage my secrets');
        suggestions.push('Add API key');
        suggestions.push('View stored credentials');
        break;
      case 'partners':
        suggestions.push('Show partner integrations');
        suggestions.push('Add new partner');
        suggestions.push('View partner status');
        break;
      case 'deck':
        suggestions.push('Show the pitch deck');
        suggestions.push('View presentation');
        suggestions.push('Get investor materials');
        break;
      case 'pitchdeck':
        suggestions.push('Build a pitch deck');
        suggestions.push('Create presentation');
        suggestions.push('Customize slides');
        break;
      case 'proposals':
        suggestions.push('Create a proposal');
        suggestions.push('View proposals');
        suggestions.push('Generate quote');
        break;
      case 'rfp':
        suggestions.push('Manage RFPs');
        suggestions.push('Respond to RFP');
        suggestions.push('View pending requests');
        break;
      default:
        suggestions.push('What can you help me with?');
        suggestions.push('Give me an overview');
        suggestions.push('Where should I start?');
    }
  }
  
  // Add entity-specific suggestions
  if (state.selectedEntity) {
    suggestions.unshift(`Tell me about this ${state.selectedEntity.type}`);
    if (state.selectedEntity.riskScore !== undefined) {
      suggestions.unshift('Why is the risk score this level?');
    }
  }
  
  return suggestions.slice(0, 5);
}

/**
 * Check if context has changed significantly
 */
export function hasContextChanged(
  oldState: ContextState,
  newState: ContextState
): boolean {
  // Page changed
  if (oldState.currentPage?.path !== newState.currentPage?.path) {
    return true;
  }
  
  // Entity selection changed
  if (oldState.selectedEntity?.id !== newState.selectedEntity?.id) {
    return true;
  }
  
  return false;
}

/**
 * Get context summary for logging/debugging
 */
export function getContextSummary(state: ContextState): string {
  const clues = extractContextClues(state);
  return `Page: ${clues.pageName} | Entity: ${clues.selectedEntityId || 'none'} | Pattern: ${clues.interactionPattern} | Questions: ${clues.questionsAsked}`;
}

// Export page contexts for direct access
export { PAGE_CONTEXTS };
