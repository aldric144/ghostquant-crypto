/**
 * CopilotIntentModel - Natural Language Intent Recognition
 * 
 * Maps vague or unclear questions to correct internal intents using
 * pattern matching and contextual inference.
 * 
 * INTENT GROUPS:
 * 1. Hydra Questions
 * 2. Constellation Map Questions
 * 3. EcoScan Questions
 * 4. Risk Score Questions
 * 5. Whale Intelligence Questions
 * 6. Dashboard Explanation Questions
 * 7. Beginner Mode Requests
 * 8. Advanced Mode Requests
 * 9. Summary/Recap Requests
 * 10. Navigation Intents
 * 11. Vagueness Recovery Intents
 * 12. Contextual Inference Intents
 */

export type IntentCategory = 
  | 'hydra'
  | 'constellation'
  | 'ecoscan'
  | 'risk_score'
  | 'whale_intel'
  | 'dashboard'
  | 'beginner_mode'
  | 'advanced_mode'
  | 'summary'
  | 'navigation'
  | 'vague_recovery'
  | 'contextual'
  | 'greeting'
  | 'help'
  | 'unknown';

export interface IntentPattern {
  pattern: RegExp;
  intent: IntentCategory;
  subIntent?: string;
  confidence: number;
  requiresContext?: boolean;
}

export interface RecognizedIntent {
  category: IntentCategory;
  subIntent?: string;
  confidence: number;
  originalQuery: string;
  extractedEntities: ExtractedEntity[];
  requiresContext: boolean;
  suggestedDepth: 'simple' | 'standard' | 'technical';
}

export interface ExtractedEntity {
  type: 'address' | 'asset' | 'number' | 'timeframe' | 'action' | 'page';
  value: string;
  position: number;
}

// ============================================
// INTENT PATTERNS
// ============================================

const HYDRA_PATTERNS: IntentPattern[] = [
  { pattern: /hydra/i, intent: 'hydra', confidence: 0.9 },
  { pattern: /threat\s*detection/i, intent: 'hydra', confidence: 0.85 },
  { pattern: /manipulation\s*detect/i, intent: 'hydra', confidence: 0.85 },
  { pattern: /multi.?head/i, intent: 'hydra', confidence: 0.8 },
  { pattern: /wash\s*trad/i, intent: 'hydra', subIntent: 'wash_trading', confidence: 0.9 },
  { pattern: /spoof/i, intent: 'hydra', subIntent: 'spoofing', confidence: 0.9 },
  { pattern: /pump.?and.?dump|pump.?dump/i, intent: 'hydra', subIntent: 'pump_dump', confidence: 0.9 },
  { pattern: /detection\s*head/i, intent: 'hydra', subIntent: 'heads', confidence: 0.85 },
  { pattern: /confidence\s*score/i, intent: 'hydra', subIntent: 'confidence', confidence: 0.8 },
  { pattern: /alert|warning|flag/i, intent: 'hydra', subIntent: 'alerts', confidence: 0.6, requiresContext: true },
];

const CONSTELLATION_PATTERNS: IntentPattern[] = [
  { pattern: /constellation/i, intent: 'constellation', confidence: 0.9 },
  { pattern: /entity\s*(map|graph|network|fusion)/i, intent: 'constellation', confidence: 0.85 },
  { pattern: /cluster/i, intent: 'constellation', subIntent: 'clustering', confidence: 0.8 },
  { pattern: /connection|connected|relationship/i, intent: 'constellation', subIntent: 'connections', confidence: 0.7, requiresContext: true },
  { pattern: /graph\s*(view|visual|map)/i, intent: 'constellation', confidence: 0.8 },
  { pattern: /risk\s*propagat/i, intent: 'constellation', subIntent: 'risk_propagation', confidence: 0.85 },
  { pattern: /entity\s*link/i, intent: 'constellation', confidence: 0.8 },
  { pattern: /wallet\s*(network|graph|map)/i, intent: 'constellation', confidence: 0.8 },
];

const ECOSCAN_PATTERNS: IntentPattern[] = [
  { pattern: /ecoscan/i, intent: 'ecoscan', confidence: 0.9 },
  { pattern: /scan\s*(this|an?)?\s*(address|wallet|entity)/i, intent: 'ecoscan', confidence: 0.85 },
  { pattern: /check\s*(this|an?)?\s*(address|wallet)/i, intent: 'ecoscan', confidence: 0.8 },
  { pattern: /background\s*check/i, intent: 'ecoscan', confidence: 0.8 },
  { pattern: /due\s*diligence/i, intent: 'ecoscan', confidence: 0.8 },
  { pattern: /anomal/i, intent: 'ecoscan', subIntent: 'anomaly', confidence: 0.75, requiresContext: true },
  { pattern: /suspicious\s*activit/i, intent: 'ecoscan', subIntent: 'suspicious', confidence: 0.8 },
  { pattern: /entity\s*(scan|check|analys)/i, intent: 'ecoscan', confidence: 0.85 },
];

const RISK_SCORE_PATTERNS: IntentPattern[] = [
  { pattern: /risk\s*score/i, intent: 'risk_score', confidence: 0.9 },
  { pattern: /risk\s*(level|rating|assessment)/i, intent: 'risk_score', confidence: 0.85 },
  { pattern: /how\s*risky/i, intent: 'risk_score', confidence: 0.85 },
  { pattern: /is\s*(this|it)\s*(safe|risky|dangerous)/i, intent: 'risk_score', confidence: 0.8 },
  { pattern: /risk\s*factor/i, intent: 'risk_score', subIntent: 'factors', confidence: 0.85 },
  { pattern: /why\s*(is|was)\s*(the|this)?\s*risk/i, intent: 'risk_score', subIntent: 'explanation', confidence: 0.85 },
  { pattern: /score\s*(mean|indicate|show)/i, intent: 'risk_score', subIntent: 'explanation', confidence: 0.8 },
];

const WHALE_INTEL_PATTERNS: IntentPattern[] = [
  { pattern: /whale/i, intent: 'whale_intel', confidence: 0.9 },
  { pattern: /large\s*holder/i, intent: 'whale_intel', confidence: 0.85 },
  { pattern: /big\s*(wallet|player|holder)/i, intent: 'whale_intel', confidence: 0.85 },
  { pattern: /widb/i, intent: 'whale_intel', subIntent: 'database', confidence: 0.9 },
  { pattern: /whale\s*(movement|activit|track)/i, intent: 'whale_intel', subIntent: 'movements', confidence: 0.9 },
  { pattern: /accumulation|distribution/i, intent: 'whale_intel', subIntent: 'flow', confidence: 0.8 },
  { pattern: /market\s*impact/i, intent: 'whale_intel', subIntent: 'impact', confidence: 0.75 },
];

const DASHBOARD_PATTERNS: IntentPattern[] = [
  { pattern: /dashboard/i, intent: 'dashboard', confidence: 0.9 },
  { pattern: /analytics/i, intent: 'dashboard', confidence: 0.85 },
  { pattern: /market\s*(overview|summary|health)/i, intent: 'dashboard', confidence: 0.85 },
  { pattern: /risk\s*index/i, intent: 'dashboard', subIntent: 'risk_index', confidence: 0.85 },
  { pattern: /global\s*risk/i, intent: 'dashboard', subIntent: 'risk_index', confidence: 0.85 },
  { pattern: /anomaly\s*feed/i, intent: 'dashboard', subIntent: 'anomaly_feed', confidence: 0.9 },
  { pattern: /alert\s*feed/i, intent: 'dashboard', subIntent: 'anomaly_feed', confidence: 0.85 },
];

const BEGINNER_MODE_PATTERNS: IntentPattern[] = [
  { pattern: /simple|simplify|simpler/i, intent: 'beginner_mode', confidence: 0.85 },
  { pattern: /easy|easier/i, intent: 'beginner_mode', confidence: 0.8 },
  { pattern: /beginner|basic/i, intent: 'beginner_mode', confidence: 0.9 },
  { pattern: /explain\s*(like|as\s*if)\s*(i'?m|a)\s*(5|five|new|beginner)/i, intent: 'beginner_mode', confidence: 0.95 },
  { pattern: /dumb\s*(it\s*)?down/i, intent: 'beginner_mode', confidence: 0.9 },
  { pattern: /i'?m\s*(new|confused|lost)/i, intent: 'beginner_mode', confidence: 0.85 },
  { pattern: /don'?t\s*understand/i, intent: 'beginner_mode', confidence: 0.85 },
  { pattern: /what\s*does\s*(this|that)\s*mean/i, intent: 'beginner_mode', confidence: 0.75, requiresContext: true },
  { pattern: /in\s*plain\s*(english|terms)/i, intent: 'beginner_mode', confidence: 0.9 },
];

const ADVANCED_MODE_PATTERNS: IntentPattern[] = [
  { pattern: /technical|technically/i, intent: 'advanced_mode', confidence: 0.85 },
  { pattern: /advanced|expert/i, intent: 'advanced_mode', confidence: 0.9 },
  { pattern: /deep\s*dive|go\s*deeper/i, intent: 'advanced_mode', confidence: 0.9 },
  { pattern: /more\s*detail/i, intent: 'advanced_mode', confidence: 0.85 },
  { pattern: /how\s*does\s*(it|this)\s*(actually|really)\s*work/i, intent: 'advanced_mode', confidence: 0.85 },
  { pattern: /under\s*the\s*hood/i, intent: 'advanced_mode', confidence: 0.9 },
  { pattern: /algorithm|methodology/i, intent: 'advanced_mode', confidence: 0.8 },
  { pattern: /quant|quantitative/i, intent: 'advanced_mode', confidence: 0.85 },
];

const SUMMARY_PATTERNS: IntentPattern[] = [
  { pattern: /summar|recap/i, intent: 'summary', confidence: 0.9 },
  { pattern: /brief(ing)?/i, intent: 'summary', confidence: 0.85 },
  { pattern: /overview/i, intent: 'summary', confidence: 0.8 },
  { pattern: /what'?s\s*(happening|going\s*on)/i, intent: 'summary', confidence: 0.8 },
  { pattern: /catch\s*me\s*up/i, intent: 'summary', confidence: 0.9 },
  { pattern: /quick\s*(update|summary|overview)/i, intent: 'summary', confidence: 0.9 },
  { pattern: /30\s*second/i, intent: 'summary', subIntent: 'briefing', confidence: 0.9 },
  { pattern: /tldr|tl;?dr/i, intent: 'summary', confidence: 0.9 },
];

const NAVIGATION_PATTERNS: IntentPattern[] = [
  { pattern: /go\s*to|take\s*me\s*to|navigate\s*to|open/i, intent: 'navigation', confidence: 0.9 },
  { pattern: /show\s*(me)?\s*(the)?/i, intent: 'navigation', confidence: 0.7, requiresContext: true },
  { pattern: /where\s*(is|can\s*i\s*find)/i, intent: 'navigation', confidence: 0.85 },
  { pattern: /how\s*do\s*i\s*(get\s*to|access|find)/i, intent: 'navigation', confidence: 0.85 },
];

const VAGUE_RECOVERY_PATTERNS: IntentPattern[] = [
  { pattern: /^what'?s?\s*this\??$/i, intent: 'vague_recovery', subIntent: 'this', confidence: 0.9, requiresContext: true },
  { pattern: /^what\s*(is|are)\s*(this|that|these|those)\??$/i, intent: 'vague_recovery', subIntent: 'this', confidence: 0.9, requiresContext: true },
  { pattern: /^explain\s*(this|that)\.?$/i, intent: 'vague_recovery', subIntent: 'explain', confidence: 0.9, requiresContext: true },
  { pattern: /^what\s*am\s*i\s*looking\s*at\??$/i, intent: 'vague_recovery', subIntent: 'looking_at', confidence: 0.95, requiresContext: true },
  { pattern: /^what\s*does\s*(this|that)\s*(do|mean)\??$/i, intent: 'vague_recovery', subIntent: 'meaning', confidence: 0.9, requiresContext: true },
  { pattern: /^why\s*(is|are)\s*(this|that|it)\s*(high|low|red|green|elevated)\??$/i, intent: 'vague_recovery', subIntent: 'why_value', confidence: 0.9, requiresContext: true },
  { pattern: /^is\s*(this|that|it)\s*(good|bad|okay|normal)\??$/i, intent: 'vague_recovery', subIntent: 'assessment', confidence: 0.9, requiresContext: true },
  { pattern: /^should\s*i\s*(worry|be\s*concerned)\??$/i, intent: 'vague_recovery', subIntent: 'concern', confidence: 0.9, requiresContext: true },
  { pattern: /^help\.?$/i, intent: 'vague_recovery', subIntent: 'help', confidence: 0.9 },
  { pattern: /^i'?m\s*(confused|lost)\.?$/i, intent: 'vague_recovery', subIntent: 'confused', confidence: 0.9 },
];

const CONTEXTUAL_PATTERNS: IntentPattern[] = [
  { pattern: /this\s*(page|screen|view)/i, intent: 'contextual', subIntent: 'current_page', confidence: 0.9, requiresContext: true },
  { pattern: /where\s*am\s*i/i, intent: 'contextual', subIntent: 'location', confidence: 0.9 },
  { pattern: /what\s*(page|screen)\s*(is\s*this|am\s*i\s*on)/i, intent: 'contextual', subIntent: 'location', confidence: 0.9 },
  { pattern: /the\s*(chart|graph|number|metric|score)/i, intent: 'contextual', subIntent: 'element', confidence: 0.8, requiresContext: true },
  { pattern: /this\s*(entity|wallet|address|cluster)/i, intent: 'contextual', subIntent: 'selected_entity', confidence: 0.85, requiresContext: true },
];

const GREETING_PATTERNS: IntentPattern[] = [
  { pattern: /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening))\.?$/i, intent: 'greeting', confidence: 0.95 },
  { pattern: /^how\s*are\s*you\??$/i, intent: 'greeting', confidence: 0.9 },
  { pattern: /^what'?s\s*up\??$/i, intent: 'greeting', confidence: 0.85 },
];

const HELP_PATTERNS: IntentPattern[] = [
  { pattern: /^help\s*me\.?$/i, intent: 'help', confidence: 0.9 },
  { pattern: /what\s*can\s*you\s*(do|help\s*with)/i, intent: 'help', confidence: 0.9 },
  { pattern: /how\s*do\s*i\s*use\s*(this|you|ghostquant)/i, intent: 'help', confidence: 0.85 },
  { pattern: /getting\s*started/i, intent: 'help', confidence: 0.85 },
  { pattern: /tutorial/i, intent: 'help', confidence: 0.8 },
];

// Combine all patterns
const ALL_PATTERNS: IntentPattern[] = [
  ...HYDRA_PATTERNS,
  ...CONSTELLATION_PATTERNS,
  ...ECOSCAN_PATTERNS,
  ...RISK_SCORE_PATTERNS,
  ...WHALE_INTEL_PATTERNS,
  ...DASHBOARD_PATTERNS,
  ...BEGINNER_MODE_PATTERNS,
  ...ADVANCED_MODE_PATTERNS,
  ...SUMMARY_PATTERNS,
  ...NAVIGATION_PATTERNS,
  ...VAGUE_RECOVERY_PATTERNS,
  ...CONTEXTUAL_PATTERNS,
  ...GREETING_PATTERNS,
  ...HELP_PATTERNS,
];

// ============================================
// ENTITY EXTRACTION
// ============================================

const ENTITY_PATTERNS = {
  address: /\b(0x[a-fA-F0-9]{40})\b/g,
  asset: /\b(BTC|ETH|SOL|USDT|USDC|BNB|XRP|ADA|DOGE|DOT|MATIC|AVAX|LINK|UNI|AAVE)\b/gi,
  number: /\b(\d+(?:\.\d+)?)\b/g,
  timeframe: /\b(today|yesterday|this\s*week|last\s*week|this\s*month|last\s*month|\d+\s*(hour|day|week|month)s?\s*ago)\b/gi,
  action: /\b(buy|sell|transfer|swap|stake|unstake|deposit|withdraw)\b/gi,
  page: /\b(hydra|constellation|analytics|dashboard|whale|widb|ecoscan|entity|graph|map)\b/gi,
};

function extractEntities(query: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  
  for (const [type, pattern] of Object.entries(ENTITY_PATTERNS)) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(query)) !== null) {
      entities.push({
        type: type as ExtractedEntity['type'],
        value: match[1] || match[0],
        position: match.index,
      });
    }
  }
  
  return entities.sort((a, b) => a.position - b.position);
}

// ============================================
// INTENT RECOGNITION FUNCTIONS
// ============================================

/**
 * Recognize intent from user query
 */
export function recognizeIntent(query: string, pageContext?: string): RecognizedIntent {
  const normalizedQuery = query.trim();
  const extractedEntities = extractEntities(normalizedQuery);
  
  // Find all matching patterns
  const matches: { pattern: IntentPattern; match: RegExpMatchArray }[] = [];
  
  for (const intentPattern of ALL_PATTERNS) {
    const match = normalizedQuery.match(intentPattern.pattern);
    if (match) {
      matches.push({ pattern: intentPattern, match });
    }
  }
  
  // Sort by confidence and select best match
  matches.sort((a, b) => b.pattern.confidence - a.pattern.confidence);
  
  if (matches.length === 0) {
    // No pattern matched - return unknown with context requirement
    return {
      category: 'unknown',
      confidence: 0,
      originalQuery: normalizedQuery,
      extractedEntities,
      requiresContext: true,
      suggestedDepth: 'standard',
    };
  }
  
  const bestMatch = matches[0];
  
  // Determine suggested depth based on intent
  let suggestedDepth: 'simple' | 'standard' | 'technical' = 'standard';
  if (bestMatch.pattern.intent === 'beginner_mode') {
    suggestedDepth = 'simple';
  } else if (bestMatch.pattern.intent === 'advanced_mode') {
    suggestedDepth = 'technical';
  }
  
  // Boost confidence if page context matches intent
  let confidence = bestMatch.pattern.confidence;
  if (pageContext) {
    if (
      (bestMatch.pattern.intent === 'hydra' && pageContext.includes('hydra')) ||
      (bestMatch.pattern.intent === 'constellation' && (pageContext.includes('constellation') || pageContext.includes('graph'))) ||
      (bestMatch.pattern.intent === 'ecoscan' && (pageContext.includes('ecoscan') || pageContext.includes('entity'))) ||
      (bestMatch.pattern.intent === 'whale_intel' && pageContext.includes('whale')) ||
      (bestMatch.pattern.intent === 'dashboard' && pageContext.includes('analytics'))
    ) {
      confidence = Math.min(1, confidence + 0.1);
    }
  }
  
  return {
    category: bestMatch.pattern.intent,
    subIntent: bestMatch.pattern.subIntent,
    confidence,
    originalQuery: normalizedQuery,
    extractedEntities,
    requiresContext: bestMatch.pattern.requiresContext || false,
    suggestedDepth,
  };
}

/**
 * Check if query is a mode switch request
 */
export function isModeSwitch(query: string): { isSwitch: boolean; mode?: 'simple' | 'technical' } {
  const beginnerMatch = BEGINNER_MODE_PATTERNS.some(p => p.pattern.test(query));
  const advancedMatch = ADVANCED_MODE_PATTERNS.some(p => p.pattern.test(query));
  
  if (beginnerMatch) {
    return { isSwitch: true, mode: 'simple' };
  }
  if (advancedMatch) {
    return { isSwitch: true, mode: 'technical' };
  }
  
  return { isSwitch: false };
}

/**
 * Check if query is a navigation request
 */
export function isNavigationRequest(query: string): { isNavigation: boolean; destination?: string } {
  const navMatch = NAVIGATION_PATTERNS.some(p => p.pattern.test(query));
  
  if (!navMatch) {
    return { isNavigation: false };
  }
  
  // Extract destination
  const destinations: Record<string, string> = {
    hydra: '/terminal/hydra',
    constellation: '/terminal/constellation',
    graph: '/terminal/graph',
    analytics: '/terminal/analytics',
    dashboard: '/terminal/analytics',
    whale: '/terminal/whales',
    widb: '/terminal/whale-intel',
    ecoscan: '/ecoscan',
    entity: '/terminal/entity',
    map: '/terminal/map',
    home: '/terminal/home',
  };
  
  for (const [keyword, path] of Object.entries(destinations)) {
    if (query.toLowerCase().includes(keyword)) {
      return { isNavigation: true, destination: path };
    }
  }
  
  return { isNavigation: true };
}

/**
 * Check if query is vague and needs context
 */
export function isVagueQuery(query: string): boolean {
  return VAGUE_RECOVERY_PATTERNS.some(p => p.pattern.test(query));
}

/**
 * Get intent category display name
 */
export function getIntentDisplayName(category: IntentCategory): string {
  const names: Record<IntentCategory, string> = {
    hydra: 'Hydra Threat Detection',
    constellation: 'Constellation Entity Mapping',
    ecoscan: 'EcoScan Analysis',
    risk_score: 'Risk Scoring',
    whale_intel: 'Whale Intelligence',
    dashboard: 'Analytics Dashboard',
    beginner_mode: 'Beginner Mode',
    advanced_mode: 'Advanced Mode',
    summary: 'Summary Request',
    navigation: 'Navigation',
    vague_recovery: 'Clarification Needed',
    contextual: 'Context-Based Query',
    greeting: 'Greeting',
    help: 'Help Request',
    unknown: 'Unknown Intent',
  };
  return names[category];
}

/**
 * Suggest follow-up intents based on current intent
 */
export function suggestFollowUpIntents(currentIntent: IntentCategory): IntentCategory[] {
  const followUps: Record<IntentCategory, IntentCategory[]> = {
    hydra: ['risk_score', 'constellation', 'summary'],
    constellation: ['ecoscan', 'risk_score', 'whale_intel'],
    ecoscan: ['risk_score', 'constellation', 'whale_intel'],
    risk_score: ['ecoscan', 'hydra', 'constellation'],
    whale_intel: ['constellation', 'risk_score', 'dashboard'],
    dashboard: ['hydra', 'whale_intel', 'summary'],
    beginner_mode: ['help', 'summary', 'dashboard'],
    advanced_mode: ['hydra', 'constellation', 'risk_score'],
    summary: ['dashboard', 'hydra', 'whale_intel'],
    navigation: ['help', 'summary'],
    vague_recovery: ['help', 'beginner_mode'],
    contextual: ['summary', 'help'],
    greeting: ['help', 'summary', 'dashboard'],
    help: ['beginner_mode', 'summary', 'navigation'],
    unknown: ['help', 'beginner_mode'],
  };
  
  return followUps[currentIntent] || ['help'];
}

// Export pattern arrays for testing/extension
export {
  HYDRA_PATTERNS,
  CONSTELLATION_PATTERNS,
  ECOSCAN_PATTERNS,
  RISK_SCORE_PATTERNS,
  WHALE_INTEL_PATTERNS,
  DASHBOARD_PATTERNS,
  BEGINNER_MODE_PATTERNS,
  ADVANCED_MODE_PATTERNS,
  SUMMARY_PATTERNS,
  NAVIGATION_PATTERNS,
  VAGUE_RECOVERY_PATTERNS,
  CONTEXTUAL_PATTERNS,
  GREETING_PATTERNS,
  HELP_PATTERNS,
  ALL_PATTERNS,
};
