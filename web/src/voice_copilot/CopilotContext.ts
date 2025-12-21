/**
 * CopilotContext - Tracks current page and user context for contextual responses
 * Provides awareness of what the user is viewing and interacting with
 */

export type UserMode = 'subscriber' | 'demo' | 'investor' | 'guest';

export interface CopilotContextState {
  currentPath: string;
  currentPage: string;
  selectedAddress: string | null;
  selectedClusterId: string | null;
  selectedEntityId: string | null;
  lastRiskScore: number | null;
  userMode: UserMode;
  isTerminal: boolean;
}

// Map paths to human-readable page names
const PAGE_NAMES: Record<string, string> = {
  '/': 'Home',
  '/terminal': 'Intelligence Terminal',
  '/terminal/home': 'Terminal Home',
  '/terminal/hydra': 'Hydra Console',
  '/terminal/constellation': 'Constellation Fusion',
  '/terminal/analytics': 'Analytics Dashboard',
  '/terminal/whales': 'Whale Intelligence',
  '/terminal/whale-intel': 'Whale Intelligence Database',
  '/influence-graph': 'Influence Graph',
  '/threat-map': 'Global Threat Map',
  '/terminal/ghostmind': 'GhostMind AI Console',
  '/terminal/predict': 'Prediction Engine',
  '/terminal/entity': 'Entity Scanner',
  '/terminal/ultrafusion': 'UltraFusion',
  '/ai-timeline': 'AI Timeline',
  '/terminal/rings': 'Ring Detection',
  '/terminal/token': 'Token Analysis',
  '/terminal/settings': 'Settings',
  '/terminal/billing': 'Billing',
  '/demo': 'Demo Mode',
  '/pricing': 'Pricing',
  '/platform': 'Platform Overview',
  '/modules': 'Modules',
};

// Create initial context state
export function createInitialContext(): CopilotContextState {
  return {
    currentPath: '/',
    currentPage: 'Home',
    selectedAddress: null,
    selectedClusterId: null,
    selectedEntityId: null,
    lastRiskScore: null,
    userMode: 'guest',
    isTerminal: false,
  };
}

// Update context from pathname
export function updateContextFromPath(
  currentContext: CopilotContextState,
  pathname: string
): CopilotContextState {
  const pageName = PAGE_NAMES[pathname] || 
                   (pathname.startsWith('/terminal/') ? 'Terminal Page' : 'Page');
  
  return {
    ...currentContext,
    currentPath: pathname,
    currentPage: pageName,
    isTerminal: pathname.startsWith('/terminal'),
  };
}

// Update context with selected address
export function updateContextWithAddress(
  currentContext: CopilotContextState,
  address: string | null
): CopilotContextState {
  return {
    ...currentContext,
    selectedAddress: address,
  };
}

// Update context with selected cluster
export function updateContextWithCluster(
  currentContext: CopilotContextState,
  clusterId: string | null
): CopilotContextState {
  return {
    ...currentContext,
    selectedClusterId: clusterId,
  };
}

// Update context with risk score
export function updateContextWithRiskScore(
  currentContext: CopilotContextState,
  riskScore: number | null
): CopilotContextState {
  return {
    ...currentContext,
    lastRiskScore: riskScore,
  };
}

// Update user mode
export function updateUserMode(
  currentContext: CopilotContextState,
  mode: UserMode
): CopilotContextState {
  return {
    ...currentContext,
    userMode: mode,
  };
}

// Get context summary for display
export function getContextSummary(context: CopilotContextState): string {
  const parts: string[] = [];
  
  parts.push(`Page: ${context.currentPage}`);
  
  if (context.selectedAddress) {
    parts.push(`Address: ${context.selectedAddress.slice(0, 10)}...`);
  }
  
  if (context.selectedClusterId) {
    parts.push(`Cluster: ${context.selectedClusterId}`);
  }
  
  if (context.lastRiskScore !== null) {
    parts.push(`Risk: ${context.lastRiskScore}`);
  }
  
  return parts.join(' | ');
}

// Export context utilities
export default {
  createInitialContext,
  updateContextFromPath,
  updateContextWithAddress,
  updateContextWithCluster,
  updateContextWithRiskScore,
  updateUserMode,
  getContextSummary,
};
