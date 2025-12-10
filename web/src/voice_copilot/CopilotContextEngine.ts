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
  '/terminal/graph': {
    path: '/terminal/graph',
    name: 'Influence Graph',
    category: 'constellation',
    description: 'Visual network graph of entity connections and relationships',
    keyElements: ['connection nodes', 'relationship edges', 'cluster highlights', 'risk indicators'],
  },
  '/terminal/analytics': {
    path: '/terminal/analytics',
    name: 'Analytics Dashboard',
    category: 'analytics',
    description: 'Real-time market intelligence with risk indices and anomaly feeds',
    keyElements: ['risk index', 'whale activity', 'market trends', 'anomaly feed', 'narrative summary'],
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
  '/terminal/entity': {
    path: '/terminal/entity',
    name: 'Entity Scanner',
    category: 'ecoscan',
    description: 'Detailed entity analysis and risk assessment',
    keyElements: ['entity profile', 'risk breakdown', 'connection map', 'activity log'],
  },
  '/ecoscan': {
    path: '/ecoscan',
    name: 'EcoScan',
    category: 'ecoscan',
    description: 'Entity scanning tool for wallet risk assessment',
    keyElements: ['address input', 'risk assessment', 'behavioral analysis', 'threat indicators'],
  },
  '/terminal/map': {
    path: '/terminal/map',
    name: 'Global Threat Map',
    category: 'analytics',
    description: 'Geographic visualization of threat distribution',
    keyElements: ['regional risk levels', 'threat hotspots', 'activity density', 'trend indicators'],
  },
  '/terminal/ghostmind': {
    path: '/terminal/ghostmind',
    name: 'GhostMind AI',
    category: 'general',
    description: 'AI-powered conversational intelligence interface',
    keyElements: ['chat interface', 'query history', 'suggested questions', 'context panel'],
  },
  '/terminal/predict': {
    path: '/terminal/predict',
    name: 'Prediction Engine',
    category: 'analytics',
    description: 'Market forecasting and trend prediction',
    keyElements: ['prediction models', 'confidence intervals', 'historical accuracy', 'trend projections'],
  },
  '/terminal/home': {
    path: '/terminal/home',
    name: 'Terminal Home',
    category: 'general',
    description: 'GhostQuant terminal dashboard and navigation hub',
    keyElements: ['quick actions', 'recent activity', 'system status', 'navigation menu'],
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
      case 'analytics':
        suggestions.push('Give me a market briefing');
        suggestions.push('What\'s the current risk level?');
        suggestions.push('Any anomalies to watch?');
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
