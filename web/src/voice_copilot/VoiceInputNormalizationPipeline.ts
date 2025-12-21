/**
 * VoiceInputNormalizationPipeline - Orchestration layer for STT normalization
 * 
 * Pipeline order:
 * 1. Raw STT text
 * 2. STTNormalizer.normalize(text)
 * 3. WakeAliasMap.apply(text)
 * 4. PhoneticReranker.rerank(text)
 * 5. Pass normalized output to WakeWordDetector and IntentModel
 * 
 * Additional features:
 * - Conversational fallback responses
 * - Page-awareness via getActivePage()
 * - Natural-language intent expansion
 */

import { normalizeSTTOutput } from './STTNormalizer';
import { normalizeWakePhrase, matchesWakeAlias, extractQueryAfterWakeAlias } from './WakeAliasMap';
import { rerankSTTOutput } from './PhoneticReranker';

// ============================================================================
// Types
// ============================================================================

export interface NormalizedVoiceInput {
  original: string;
  normalized: string;
  wasModified: boolean;
  hasWakeWord: boolean;
  query: string;
  detectedIntent: DetectedIntent | null;
  pageContext: PageContext | null;
}

export interface DetectedIntent {
  type: IntentType;
  confidence: number;
  parameters: Record<string, string>;
}

export type IntentType = 
  | 'page_inquiry'      // "What is this?", "Where am I?"
  | 'explain_screen'    // "Explain this screen"
  | 'functionality'     // "What does this do?"
  | 'navigation'        // "Go to...", "Show me..."
  | 'data_query'        // "What's the price of...", "Show whale activity"
  | 'help'              // "Help", "What can you do?"
  | 'unknown';

export interface PageContext {
  path: string;
  title: string;
  description: string;
  features: string[];
}

// ============================================================================
// Page Awareness - getActivePage()
// ============================================================================

// Page metadata for context-aware responses
const PAGE_METADATA: Record<string, PageContext> = {
  '/': {
    path: '/',
    title: 'GhostQuant Dashboard',
    description: 'The main dashboard showing market intelligence overview, threat monitors, and entity observations.',
    features: ['Active Threat Monitors', 'Entities Observed', 'Global Risk Level', 'Quick Navigation'],
  },
  '/terminal': {
    path: '/terminal',
    title: 'GhostQuant Terminal',
    description: 'The main intelligence terminal for accessing all GhostQuant analysis tools and features.',
    features: ['Market Analysis', 'Entity Tracking', 'Threat Detection', 'Intelligence Reports'],
  },
  '/terminal/home': {
    path: '/terminal/home',
    title: 'Terminal Home',
    description: 'The terminal home page with quick access to all intelligence modules.',
    features: ['Module Navigation', 'Recent Activity', 'Quick Actions'],
  },
  '/terminal/hydra': {
    path: '/terminal/hydra',
    title: 'Hydra Coordinated Actor Detection',
    description: 'Cross-chain entity tracking with behavioral DNA fingerprinting that follows actors across Bitcoin, Ethereum, Solana, and L2s.',
    features: ['Multi-Head Detection', 'Behavioral DNA', 'Cross-Chain Tracking', 'Actor Profiling'],
  },
  '/terminal/constellation': {
    path: '/terminal/constellation',
    title: 'Global Constellation 3D Map',
    description: 'Network topology visualization revealing entity relationships, money flows, and coordinated behavior patterns.',
    features: ['3D Network Graph', 'Entity Relationships', 'Money Flow Visualization', 'Pattern Detection'],
  },
  '/terminal/ultrafusion': {
    path: '/terminal/ultrafusion',
    title: 'UltraFusion Meta-AI',
    description: 'Multi-domain intelligence synthesis combining blockchain, exchange, mempool, and social data into unified understanding.',
    features: ['Multi-Domain Analysis', 'Data Fusion', 'Predictive Intelligence', 'Cross-Source Correlation'],
  },
  '/terminal/whale-intel': {
    path: '/terminal/whale-intel',
    title: 'Whale Intelligence Database',
    description: 'Track and analyze large cryptocurrency holders and their market-moving activities.',
    features: ['Whale Tracking', 'Movement Alerts', 'Historical Analysis', 'Impact Assessment'],
  },
  '/terminal/whales': {
    path: '/terminal/whales',
    title: 'Whale Movements',
    description: 'Real-time tracking of significant cryptocurrency movements by large holders.',
    features: ['Live Movement Feed', 'Whale Profiles', 'Transaction Analysis', 'Alert System'],
  },
  '/whale-intelligence': {
    path: '/whale-intelligence',
    title: 'Whale Intelligence V2',
    description: 'Advanced whale tracking with metrics panel, top 50 whales table, influence heatmap, and live movements feed.',
    features: ['Whale Metrics', 'Top 50 Whales', 'Influence Heatmap', 'Live Movements', 'Whale Search', 'Detail Modal'],
  },
  '/influence-graph': {
    path: '/influence-graph',
    title: 'Influence Graph',
    description: 'Visualize relationships and influence patterns between entities in the crypto ecosystem.',
    features: ['Influence Mapping', 'Relationship Analysis', 'Network Visualization', 'Centrality Metrics'],
  },
  '/terminal/predict': {
    path: '/terminal/predict',
    title: 'Prediction Engine',
    description: 'AI-powered forecasting for entity behavior and market movements.',
    features: ['Behavioral Forecasting', 'Market Predictions', 'Risk Assessment', 'Confidence Scoring'],
  },
  '/terminal/sentinel': {
    path: '/terminal/sentinel',
    title: 'Sentinel Command Console',
    description: 'Advanced threat detection and alert management system with complex multi-condition logic.',
    features: ['Alert Management', 'Threat Detection', 'Automated Responses', 'Custom Rules'],
  },
  '/terminal/radar': {
    path: '/terminal/radar',
    title: 'Global Radar Heatmap',
    description: 'Real-time visualization of market-wide risk and anomaly detection across all monitored chains.',
    features: ['Risk Heatmap', 'Anomaly Detection', 'Multi-Chain Monitoring', 'Real-Time Updates'],
  },
};

/**
 * Get the current active page context
 * @returns PageContext for the current page, or null if unknown
 */
export function getActivePage(): PageContext | null {
  if (typeof window === 'undefined') return null;
  
  const path = window.location.pathname;
  
  // Try exact match first
  if (PAGE_METADATA[path]) {
    return PAGE_METADATA[path];
  }
  
  // Try prefix match for dynamic routes
  for (const [pagePath, context] of Object.entries(PAGE_METADATA)) {
    if (path.startsWith(pagePath) && pagePath !== '/') {
      return context;
    }
  }
  
  // Default fallback
  return {
    path,
    title: 'GhostQuant',
    description: 'GhostQuant Intelligence Platform - Advanced crypto market intelligence and threat detection.',
    features: ['Market Intelligence', 'Threat Detection', 'Entity Tracking'],
  };
}

// ============================================================================
// Natural Language Intent Expansion
// ============================================================================

// Intent patterns for natural language understanding
const INTENT_PATTERNS: Array<{
  patterns: RegExp[];
  type: IntentType;
  confidence: number;
}> = [
  // Page inquiry intents
  {
    patterns: [
      /what\s+(is\s+)?this(\s+page)?/i,
      /where\s+am\s+i/i,
      /what\s+page\s+(is\s+this|am\s+i\s+on)/i,
      /which\s+page/i,
      /current\s+page/i,
    ],
    type: 'page_inquiry',
    confidence: 0.95,
  },
  // Explain screen intents
  {
    patterns: [
      /explain\s+(this\s+)?(screen|page|view)/i,
      /tell\s+me\s+about\s+this\s+(screen|page)/i,
      /what('s|s)?\s+on\s+(this\s+)?(screen|page)/i,
      /describe\s+(this\s+)?(screen|page)/i,
      /walk\s+me\s+through/i,
    ],
    type: 'explain_screen',
    confidence: 0.9,
  },
  // Functionality intents
  {
    patterns: [
      /what\s+(does|can)\s+(this|it)\s+do/i,
      /how\s+does\s+(this|it)\s+work/i,
      /what\s+can\s+i\s+do\s+here/i,
      /what('s|s)?\s+this\s+for/i,
      /purpose\s+of\s+this/i,
      /features?\s+(of\s+this|here)/i,
    ],
    type: 'functionality',
    confidence: 0.9,
  },
  // Help intents
  {
    patterns: [
      /^help$/i,
      /help\s+me/i,
      /what\s+can\s+you\s+do/i,
      /how\s+can\s+you\s+help/i,
      /what\s+are\s+your\s+(capabilities|features)/i,
    ],
    type: 'help',
    confidence: 0.95,
  },
  // Navigation intents
  {
    patterns: [
      /go\s+to/i,
      /show\s+me/i,
      /take\s+me\s+to/i,
      /navigate\s+to/i,
      /open\s+(the\s+)?/i,
    ],
    type: 'navigation',
    confidence: 0.85,
  },
  // Data query intents
  {
    patterns: [
      /what('s|s)?\s+the\s+price/i,
      /show\s+(me\s+)?(whale|market|trading)/i,
      /analyze/i,
      /track/i,
      /find/i,
      /search/i,
    ],
    type: 'data_query',
    confidence: 0.8,
  },
];

/**
 * Detect intent from normalized text
 * @param text - Normalized query text
 * @returns DetectedIntent or null if no intent detected
 */
export function detectIntent(text: string): DetectedIntent | null {
  if (!text || text.trim().length === 0) return null;
  
  const lowerText = text.toLowerCase().trim();
  
  for (const { patterns, type, confidence } of INTENT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(lowerText)) {
        return {
          type,
          confidence,
          parameters: extractIntentParameters(lowerText, type),
        };
      }
    }
  }
  
  return {
    type: 'unknown',
    confidence: 0.5,
    parameters: {},
  };
}

/**
 * Extract parameters from intent text
 */
function extractIntentParameters(text: string, type: IntentType): Record<string, string> {
  const params: Record<string, string> = {};
  
  switch (type) {
    case 'navigation':
      // Extract destination
      const navMatch = text.match(/(?:go\s+to|show\s+me|take\s+me\s+to|navigate\s+to|open)\s+(.+)/i);
      if (navMatch) {
        params.destination = navMatch[1].trim();
      }
      break;
      
    case 'data_query':
      // Extract query subject
      const queryMatch = text.match(/(?:price\s+of|show\s+me|analyze|track|find|search)\s+(.+)/i);
      if (queryMatch) {
        params.subject = queryMatch[1].trim();
      }
      break;
  }
  
  return params;
}

// ============================================================================
// Conversational Fallback
// ============================================================================

// Conversational fallback response instead of platform description
export const CONVERSATIONAL_FALLBACK = "Sure — what specifically would you like to know about this page or tool?";

// Alternative fallback responses for variety
const FALLBACK_RESPONSES = [
  "Sure — what specifically would you like to know about this page or tool?",
  "I'm here to help. What would you like to know about this feature?",
  "Of course! What aspect of this page can I explain for you?",
  "Happy to help. What would you like me to clarify?",
  "I'm listening. What would you like to explore on this page?",
];

/**
 * Get a conversational fallback response
 * @param useVariety - If true, randomly select from fallback responses
 * @returns Fallback response string
 */
export function getConversationalFallback(useVariety: boolean = false): string {
  if (!useVariety) {
    return CONVERSATIONAL_FALLBACK;
  }
  
  const index = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
  return FALLBACK_RESPONSES[index];
}

/**
 * Check if we should use conversational fallback instead of platform description
 * @param intent - Detected intent
 * @param pageContext - Current page context
 * @returns True if conversational fallback should be used
 */
export function shouldUseConversationalFallback(
  intent: DetectedIntent | null,
  pageContext: PageContext | null
): boolean {
  // Use fallback if:
  // 1. Intent is unknown AND
  // 2. We have page context (so we can answer follow-up questions)
  
  if (!intent || intent.type === 'unknown') {
    return pageContext !== null;
  }
  
  return false;
}

// ============================================================================
// Main Pipeline
// ============================================================================

/**
 * Process raw STT input through the full normalization pipeline
 * 
 * Pipeline order:
 * 1. Raw STT text
 * 2. STTNormalizer.normalize(text)
 * 3. WakeAliasMap.apply(text)
 * 4. PhoneticReranker.rerank(text)
 * 5. Detect intent and page context
 * 
 * @param rawText - Raw STT transcript
 * @returns Fully processed voice input with normalization and intent detection
 */
export function processVoiceInput(rawText: string): NormalizedVoiceInput {
  if (!rawText) {
    return {
      original: rawText,
      normalized: rawText,
      wasModified: false,
      hasWakeWord: false,
      query: '',
      detectedIntent: null,
      pageContext: null,
    };
  }

  // Step 1: Raw STT text (input)
  const original = rawText;

  // Step 2: STTNormalizer.normalize(text)
  const afterSTTNormalize = normalizeSTTOutput(rawText);

  // Step 3: WakeAliasMap.apply(text)
  const afterWakeAlias = normalizeWakePhrase(afterSTTNormalize);

  // Step 4: PhoneticReranker.rerank(text)
  const rerankResult = rerankSTTOutput(afterWakeAlias);
  const normalized = rerankResult.text;

  // Check for wake word
  const hasWakeWord = matchesWakeAlias(normalized);

  // Extract query after wake word
  const query = extractQueryAfterWakeAlias(normalized);

  // Get page context
  const pageContext = getActivePage();

  // Detect intent from query
  const detectedIntent = detectIntent(query || normalized);

  // Log normalization if text was modified
  const wasModified = normalized !== original;
  if (typeof console !== 'undefined') {
    // Always log the before/after for debugging
    console.log('[VoiceNormalize] Before →', original);
    console.log('[VoiceNormalize] After →', normalized);
    
    if (wasModified) {
      console.log('[WakeFix] Applied normalization:', {
        original,
        normalized,
        hasWakeWord,
        query,
        intent: detectedIntent?.type,
      });
    }
  }

  return {
    original,
    normalized,
    wasModified,
    hasWakeWord,
    query,
    detectedIntent,
    pageContext,
  };
}

/**
 * Generate a response based on detected intent and page context
 * @param input - Processed voice input
 * @returns Response string
 */
export function generateIntentResponse(input: NormalizedVoiceInput): string {
  const { detectedIntent, pageContext, query } = input;

  // If no intent detected and we have page context, use conversational fallback
  if (shouldUseConversationalFallback(detectedIntent, pageContext)) {
    console.log('[VoiceInputPipeline] Using conversational fallback');
    return getConversationalFallback();
  }

  // Handle specific intents
  if (detectedIntent) {
    switch (detectedIntent.type) {
      case 'page_inquiry':
        if (pageContext) {
          return `You're currently on the ${pageContext.title}. ${pageContext.description}`;
        }
        return "You're on the GhostQuant Intelligence Platform.";

      case 'explain_screen':
        if (pageContext) {
          const features = pageContext.features.join(', ');
          return `This is the ${pageContext.title}. ${pageContext.description} Key features include: ${features}.`;
        }
        return "This screen is part of the GhostQuant Intelligence Platform.";

      case 'functionality':
        if (pageContext) {
          const features = pageContext.features.join(', ');
          return `On this page, you can access: ${features}. ${pageContext.description}`;
        }
        return "GhostQuant provides market intelligence, threat detection, and entity tracking capabilities.";

      case 'help':
        return "I can help you navigate GhostQuant, explain features, analyze market data, track whales, and answer questions about what you're seeing. Just ask!";

      case 'navigation':
        const dest = detectedIntent.parameters.destination;
        return dest 
          ? `I'll help you navigate to ${dest}.`
          : "Where would you like to go?";

      case 'data_query':
        const subject = detectedIntent.parameters.subject;
        return subject
          ? `Let me look up information about ${subject}.`
          : "What would you like me to analyze?";

      case 'unknown':
      default:
        // Use conversational fallback for unknown intents
        if (pageContext) {
          return getConversationalFallback();
        }
        return "I'm here to help. What would you like to know?";
    }
  }

  return getConversationalFallback();
}

// ============================================================================
// Exports
// ============================================================================

export default {
  processVoiceInput,
  generateIntentResponse,
  getActivePage,
  detectIntent,
  getConversationalFallback,
  shouldUseConversationalFallback,
  CONVERSATIONAL_FALLBACK,
  PAGE_METADATA,
};
