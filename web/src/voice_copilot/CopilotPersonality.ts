/**
 * CopilotPersonality - The personality engine for GhostQuant Voice Copilot
 * 
 * Implements the GhostQuant Hybrid Personality:
 * - Conversational + approachable
 * - Professional + authoritative when needed
 * - Light, controlled humor only when helpful
 * - Warm, human-like tone (non-robotic)
 * - Capable of handling vague or misphrased questions
 * - Always helpful, never dismissive
 * - Context-aware
 * - Beginner-friendly + Expert-capable
 * - Adaptive to user style (formal vs casual)
 */

import { CopilotContextState } from './CopilotContext';

// User tone detection
export type UserTone = 'casual' | 'formal' | 'frustrated' | 'confused' | 'expert' | 'neutral';

// Response depth level
export type ResponseDepth = 'beginner' | 'standard' | 'advanced' | 'expert';

// Personality configuration
export interface PersonalityConfig {
  tone: UserTone;
  depth: ResponseDepth;
  useHumor: boolean;
  encourageExploration: boolean;
  showConfidence: boolean;
}

// Response shaping result
export interface ShapedResponse {
  text: string;
  prefix?: string;
  suffix?: string;
  followUp?: string;
}

// Vague question interpretation result
export interface InterpretedQuestion {
  originalQuestion: string;
  interpretedIntent: string;
  confidence: 'high' | 'medium' | 'low';
  possibleIntents?: string[];
  contextClues: string[];
}

// Beginner mode templates
const BEGINNER_TEMPLATES = {
  intro: [
    "Let's keep this simple.",
    "Here's the basic version.",
    "Think of it like this...",
    "In simple terms,",
    "The easy way to understand this:",
    "Breaking it down simply:",
  ],
  analogies: [
    "Think of it like a security camera system - ",
    "Imagine a social network, but for wallets - ",
    "It's similar to a credit score, but for crypto - ",
    "Picture a detective connecting clues - ",
    "Like a weather radar, but for market activity - ",
  ],
  encouragement: [
    "Don't worry, this is easier than it looks.",
    "You're asking the right questions.",
    "This makes more sense once you see it in action.",
    "Let's walk through it together.",
  ],
};

// Advanced mode templates
const ADVANCED_TEMPLATES = {
  intro: [
    "Technically speaking,",
    "In deeper terms, what's happening is",
    "From an institutional analysis perspective,",
    "At a technical level,",
    "The underlying mechanism involves",
    "From a quantitative standpoint,",
  ],
  detail: [
    "The algorithm specifically",
    "Under the hood,",
    "The data pipeline processes",
    "Cross-referencing multiple signals,",
  ],
};

// Clarification request templates
const CLARIFICATION_TEMPLATES = {
  friendly: [
    "Are you asking about the chart, the cluster, or the risk score?",
    "Say the word and I'll zoom in on the part you want.",
    "I can explain any of these - which one interests you most?",
    "Want me to focus on a specific part?",
    "Here are a few things you might be referring to - which one should we explore?",
  ],
  contextual: [
    "I see you're on {page}. Are you asking about {element1} or {element2}?",
    "Looking at this page, you might mean {option1} or {option2}. Which one?",
    "There's a lot here! Want me to explain {specific} or give you the overview?",
  ],
};

// Humor templates (used sparingly - 1-2% of responses)
const HUMOR_TEMPLATES = [
  "This chart looks dramatic, but it's easier than it appears.",
  "Let's tame this data together.",
  "Don't let the numbers intimidate you - they're friendlier than they look.",
  "Looks scarier than it is - let's break this down.",
  "The good news? This is actually pretty straightforward once you see it.",
  "I promise this makes sense - give me 30 seconds.",
];

// Positive acknowledgment templates
const ACKNOWLEDGMENT_TEMPLATES = {
  great: [
    "Great question.",
    "Good question.",
    "That's a smart thing to ask.",
    "Excellent observation.",
  ],
  encouraging: [
    "Let's walk through it.",
    "Happy to explain.",
    "I've got you covered.",
    "Let me break that down for you.",
  ],
  supportive: [
    "No worries, this is a common question.",
    "Totally understandable - let me clarify.",
    "That's actually something a lot of people ask about.",
  ],
};

// Follow-up suggestion templates
const FOLLOWUP_TEMPLATES = {
  exploration: [
    "Want to dive deeper?",
    "Want the simple version or the technical version?",
    "Should I elaborate on any part?",
    "Anything else you'd like to know about this?",
  ],
  navigation: [
    "Want me to show you where to find this?",
    "I can walk you through the interface if you'd like.",
    "Should I point out the key areas to watch?",
  ],
  action: [
    "Ready to try it out?",
    "Want to see this in action?",
    "Should we look at a live example?",
  ],
};

// Vague question patterns and their likely intents
const VAGUE_QUESTION_PATTERNS: Array<{
  patterns: RegExp[];
  likelyIntent: string;
  contextDependent: boolean;
}> = [
  {
    patterns: [/^what('s| is) this\??$/i, /^what am i looking at\??$/i, /^explain this\??$/i],
    likelyIntent: 'explain_current_page',
    contextDependent: true,
  },
  {
    patterns: [/^is this (good|bad|okay|ok)\??$/i, /^should i (worry|be concerned)\??$/i],
    likelyIntent: 'assess_risk',
    contextDependent: true,
  },
  {
    patterns: [/^why is (this|it|that) (high|low|red|green)\??$/i],
    likelyIntent: 'explain_metric',
    contextDependent: true,
  },
  {
    patterns: [/^make it simple\??$/i, /^simplify\??$/i, /^eli5\??$/i, /^explain like.*(beginner|5|child)/i],
    likelyIntent: 'simplify_explanation',
    contextDependent: false,
  },
  {
    patterns: [/^what does (this|that) (mean|do)\??$/i],
    likelyIntent: 'explain_element',
    contextDependent: true,
  },
  {
    patterns: [/^help\??$/i, /^i('m| am) (lost|confused)\??$/i],
    likelyIntent: 'provide_guidance',
    contextDependent: true,
  },
  {
    patterns: [/^(go|more) (technical|advanced|deeper)\??$/i, /^expert mode\??$/i],
    likelyIntent: 'increase_depth',
    contextDependent: false,
  },
];

// Frustrated user indicators
const FRUSTRATION_INDICATORS = [
  /i don('t| do not) (understand|get it)/i,
  /this (doesn't|does not) make sense/i,
  /what(\?!)+$/,
  /confused/i,
  /frustrated/i,
  /help me/i,
  /i('m| am) lost/i,
  /too (complicated|complex|hard)/i,
];

// Expert user indicators
const EXPERT_INDICATORS = [
  /technical(ly)?/i,
  /algorithm/i,
  /quantitative/i,
  /institutional/i,
  /api/i,
  /pipeline/i,
  /correlation/i,
  /regression/i,
  /statistical/i,
];

// Casual user indicators
const CASUAL_INDICATORS = [
  /hey/i,
  /yo/i,
  /sup/i,
  /cool/i,
  /awesome/i,
  /thanks/i,
  /thx/i,
  /lol/i,
  /haha/i,
];

/**
 * Detect the user's tone from their question
 */
export function detectUserTone(question: string): UserTone {
  const lowerQuestion = question.toLowerCase();
  
  // Check for frustration first (highest priority)
  if (FRUSTRATION_INDICATORS.some(pattern => pattern.test(question))) {
    return 'frustrated';
  }
  
  // Check for confusion
  if (/confused|don't understand|what\?|huh\?/i.test(question)) {
    return 'confused';
  }
  
  // Check for expert language
  if (EXPERT_INDICATORS.some(pattern => pattern.test(question))) {
    return 'expert';
  }
  
  // Check for casual language
  if (CASUAL_INDICATORS.some(pattern => pattern.test(question))) {
    return 'casual';
  }
  
  // Check for formal language
  if (/please|could you|would you|kindly|appreciate/i.test(question)) {
    return 'formal';
  }
  
  return 'neutral';
}

/**
 * Determine appropriate response depth based on user signals
 */
export function determineResponseDepth(question: string, userTone: UserTone): ResponseDepth {
  const lowerQuestion = question.toLowerCase();
  
  // Explicit depth requests
  if (/simple|basic|beginner|eli5|easy/i.test(lowerQuestion)) {
    return 'beginner';
  }
  
  if (/technical|advanced|deep|expert|detailed/i.test(lowerQuestion)) {
    return 'expert';
  }
  
  if (/more detail|elaborate|explain further/i.test(lowerQuestion)) {
    return 'advanced';
  }
  
  // Tone-based inference
  if (userTone === 'confused' || userTone === 'frustrated') {
    return 'beginner';
  }
  
  if (userTone === 'expert') {
    return 'advanced';
  }
  
  return 'standard';
}

/**
 * Decide whether to include humor in the response
 */
export function shouldUseHumor(userTone: UserTone, context: CopilotContextState): boolean {
  // Never use humor with frustrated users
  if (userTone === 'frustrated') {
    return false;
  }
  
  // Higher chance with casual users
  if (userTone === 'casual') {
    return Math.random() < 0.05; // 5% chance
  }
  
  // Very low chance otherwise (1-2%)
  return Math.random() < 0.02;
}

/**
 * Get a random item from an array
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate personality configuration based on user input and context
 */
export function generatePersonalityConfig(
  question: string,
  context: CopilotContextState
): PersonalityConfig {
  const tone = detectUserTone(question);
  const depth = determineResponseDepth(question, tone);
  const useHumor = shouldUseHumor(tone, context);
  
  return {
    tone,
    depth,
    useHumor,
    encourageExploration: tone !== 'frustrated',
    showConfidence: true,
  };
}

/**
 * Interpret vague or ambiguous questions using context
 */
export function interpretVagueQuestion(
  question: string,
  context: CopilotContextState
): InterpretedQuestion {
  const contextClues: string[] = [];
  let interpretedIntent = '';
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  const possibleIntents: string[] = [];
  
  // Add context clues
  if (context.currentPage) {
    contextClues.push(`Currently on: ${context.currentPage}`);
  }
  if (context.selectedAddress) {
    contextClues.push(`Selected address: ${context.selectedAddress.slice(0, 10)}...`);
  }
  if (context.lastRiskScore !== null) {
    contextClues.push(`Last risk score: ${context.lastRiskScore}`);
  }
  
  // Try to match vague patterns
  for (const { patterns, likelyIntent, contextDependent } of VAGUE_QUESTION_PATTERNS) {
    if (patterns.some(pattern => pattern.test(question))) {
      if (contextDependent && context.currentPath) {
        interpretedIntent = `${likelyIntent}_${context.currentPath.replace(/\//g, '_')}`;
        confidence = 'high';
      } else {
        interpretedIntent = likelyIntent;
        confidence = contextDependent ? 'medium' : 'high';
      }
      break;
    }
  }
  
  // If no pattern matched, try to infer from context
  if (!interpretedIntent) {
    if (context.currentPath.includes('hydra')) {
      interpretedIntent = 'explain_hydra';
      possibleIntents.push('explain_threat_detection', 'explain_heads', 'explain_risk_score');
    } else if (context.currentPath.includes('constellation')) {
      interpretedIntent = 'explain_constellation';
      possibleIntents.push('explain_clusters', 'explain_connections', 'explain_entities');
    } else if (context.currentPath.includes('analytics')) {
      interpretedIntent = 'explain_analytics';
      possibleIntents.push('explain_metrics', 'explain_trends', 'explain_risk_index');
    } else if (context.currentPath.includes('whale')) {
      interpretedIntent = 'explain_whales';
      possibleIntents.push('explain_whale_activity', 'explain_movements', 'explain_impact');
    } else {
      interpretedIntent = 'general_help';
      confidence = 'low';
    }
  }
  
  return {
    originalQuestion: question,
    interpretedIntent,
    confidence,
    possibleIntents: possibleIntents.length > 0 ? possibleIntents : undefined,
    contextClues,
  };
}

/**
 * Generate a friendly fallback response instead of "I didn't catch that"
 */
export function generateFriendlyFallback(
  question: string,
  context: CopilotContextState,
  interpretation: InterpretedQuestion
): string {
  const { confidence, possibleIntents, contextClues } = interpretation;
  
  // High confidence - provide direct answer
  if (confidence === 'high') {
    return `I think you're asking about ${getIntentDescription(interpretation.interpretedIntent, context)}. Here's the breakdown:`;
  }
  
  // Medium confidence - provide answer with context
  if (confidence === 'medium') {
    if (context.currentPage) {
      return `Looks like you're referring to something on the ${context.currentPage}. Let me explain what you're seeing:`;
    }
    return `I think you're asking about ${getIntentDescription(interpretation.interpretedIntent, context)}. Let me clarify:`;
  }
  
  // Low confidence - offer options
  if (possibleIntents && possibleIntents.length > 0) {
    const options = possibleIntents.slice(0, 3).map(intent => getIntentDescription(intent, context));
    return `Here are a few things you might be referring to - ${options.join(', ')}. Which one should we explore?`;
  }
  
  // Ultimate fallback - still friendly
  return `Let's simplify this. You're on the ${context.currentPage || 'GhostQuant platform'}. What would you like to know more about?`;
}

/**
 * Convert intent ID to human-readable description
 */
function getIntentDescription(intent: string, context: CopilotContextState): string {
  const descriptions: Record<string, string> = {
    explain_current_page: `the ${context.currentPage || 'current page'}`,
    assess_risk: 'the risk assessment',
    explain_metric: 'this metric',
    simplify_explanation: 'a simpler explanation',
    explain_element: 'this element',
    provide_guidance: 'how to use this',
    increase_depth: 'more technical details',
    explain_hydra: 'the Hydra threat detection system',
    explain_constellation: 'the Constellation entity mapping',
    explain_analytics: 'the Analytics Dashboard',
    explain_whales: 'whale activity tracking',
    explain_threat_detection: 'threat detection',
    explain_heads: 'the detection heads',
    explain_risk_score: 'the risk score',
    explain_clusters: 'entity clusters',
    explain_connections: 'wallet connections',
    explain_entities: 'tracked entities',
    explain_metrics: 'the metrics',
    explain_trends: 'market trends',
    explain_risk_index: 'the risk index',
    explain_whale_activity: 'whale activity',
    explain_movements: 'whale movements',
    explain_impact: 'market impact',
    general_help: 'GhostQuant features',
  };
  
  return descriptions[intent] || 'this feature';
}

/**
 * Get an appropriate acknowledgment based on user tone
 */
export function getAcknowledgment(userTone: UserTone): string {
  if (userTone === 'frustrated' || userTone === 'confused') {
    return randomChoice(ACKNOWLEDGMENT_TEMPLATES.supportive);
  }
  
  if (userTone === 'casual') {
    return randomChoice(ACKNOWLEDGMENT_TEMPLATES.encouraging);
  }
  
  return randomChoice(ACKNOWLEDGMENT_TEMPLATES.great);
}

/**
 * Get a beginner-friendly intro phrase
 */
export function getBeginnerIntro(): string {
  return randomChoice(BEGINNER_TEMPLATES.intro);
}

/**
 * Get an analogy for explanation
 */
export function getAnalogy(): string {
  return randomChoice(BEGINNER_TEMPLATES.analogies);
}

/**
 * Get an advanced intro phrase
 */
export function getAdvancedIntro(): string {
  return randomChoice(ADVANCED_TEMPLATES.intro);
}

/**
 * Get a humor line (use sparingly)
 */
export function getHumorLine(): string {
  return randomChoice(HUMOR_TEMPLATES);
}

/**
 * Get a follow-up suggestion
 */
export function getFollowUp(type: 'exploration' | 'navigation' | 'action' = 'exploration'): string {
  return randomChoice(FOLLOWUP_TEMPLATES[type]);
}

/**
 * Get a clarification request
 */
export function getClarificationRequest(context: CopilotContextState): string {
  if (context.currentPage) {
    // Use contextual clarification
    const template = randomChoice(CLARIFICATION_TEMPLATES.contextual);
    return template
      .replace('{page}', context.currentPage)
      .replace('{element1}', 'the main chart')
      .replace('{element2}', 'the risk indicators')
      .replace('{option1}', 'the overview')
      .replace('{option2}', 'a specific metric')
      .replace('{specific}', 'one part');
  }
  
  return randomChoice(CLARIFICATION_TEMPLATES.friendly);
}

/**
 * Shape a response based on personality configuration
 */
export function shapeResponse(
  baseResponse: string,
  config: PersonalityConfig,
  context: CopilotContextState
): ShapedResponse {
  let prefix = '';
  let suffix = '';
  let followUp = '';
  let text = baseResponse;
  
  // Add acknowledgment for non-expert tones
  if (config.tone !== 'expert' && config.tone !== 'formal') {
    prefix = getAcknowledgment(config.tone) + ' ';
  }
  
  // Adjust based on depth
  if (config.depth === 'beginner') {
    // Simplify language and add encouraging tone
    prefix = getBeginnerIntro() + ' ' + prefix;
    text = simplifyLanguage(text);
  } else if (config.depth === 'expert' || config.depth === 'advanced') {
    prefix = getAdvancedIntro() + ' ' + prefix;
  }
  
  // Add humor if appropriate
  if (config.useHumor) {
    suffix = ' ' + getHumorLine();
  }
  
  // Add follow-up if encouraging exploration
  if (config.encourageExploration) {
    followUp = getFollowUp('exploration');
  }
  
  return {
    text: prefix + text + suffix,
    followUp,
  };
}

/**
 * Simplify technical language for beginners
 */
function simplifyLanguage(text: string): string {
  const simplifications: Record<string, string> = {
    'multi-head threat detection': 'multiple security checks running at once',
    'entity fusion': 'connecting related wallets together',
    'cluster analysis': 'grouping similar wallets',
    'behavioral pattern recognition': 'spotting unusual activity',
    'risk propagation': 'how risk spreads between connected wallets',
    'cross-chain': 'across different blockchains',
    'manipulation detection': 'catching market cheaters',
    'wash trading': 'fake trading to inflate volume',
    'spoofing': 'fake orders to trick other traders',
    'pump-and-dump': 'artificially inflating then selling',
    'institutional': 'professional/large-scale',
    'quantitative': 'number-based',
    'algorithmic': 'automated',
  };
  
  let simplified = text;
  for (const [technical, simple] of Object.entries(simplifications)) {
    simplified = simplified.replace(new RegExp(technical, 'gi'), simple);
  }
  
  return simplified;
}

/**
 * Generate a context-aware greeting
 */
export function generatePersonalizedGreeting(context: CopilotContextState): string {
  const greetings = [
    `Hey there! You're on the ${context.currentPage}. What would you like to know?`,
    `Welcome to ${context.currentPage}. I'm here to help - ask me anything!`,
    `I see you're exploring ${context.currentPage}. How can I assist?`,
  ];
  
  if (context.userMode === 'demo') {
    return `Welcome to GhostQuant Demo Mode! You're viewing ${context.currentPage}. Feel free to explore - I'll explain anything you're curious about.`;
  }
  
  if (context.userMode === 'investor') {
    return `Welcome! I'm ready to walk you through ${context.currentPage}. Would you like a quick overview or should we dive into specifics?`;
  }
  
  return randomChoice(greetings);
}

/**
 * Check if a question is vague and needs interpretation
 */
export function isVagueQuestion(question: string): boolean {
  const vaguePatterns = [
    /^what('s| is) this\??$/i,
    /^what am i looking at\??$/i,
    /^explain this\??$/i,
    /^is this (good|bad)\??$/i,
    /^why\??$/i,
    /^help\??$/i,
    /^huh\??$/i,
    /^\?+$/,
  ];
  
  return vaguePatterns.some(pattern => pattern.test(question.trim()));
}

// Export all personality functions
export default {
  detectUserTone,
  determineResponseDepth,
  shouldUseHumor,
  generatePersonalityConfig,
  interpretVagueQuestion,
  generateFriendlyFallback,
  getAcknowledgment,
  getBeginnerIntro,
  getAnalogy,
  getAdvancedIntro,
  getHumorLine,
  getFollowUp,
  getClarificationRequest,
  shapeResponse,
  generatePersonalizedGreeting,
  isVagueQuestion,
};
