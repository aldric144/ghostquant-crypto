/**
 * CopilotToneEngine - Dynamic Tone Selection and Transformation
 * 
 * Adjusts response tone based on:
 * - Intent Model results
 * - User message complexity
 * - User mood (frustration cues)
 * - Page context
 * 
 * TONE STATES:
 * - BeginnerMode
 * - ExpertMode
 * - ConversationalMode
 * - InvestorMode
 * - EncouragementMode
 * - ClarificationMode
 */

import { IntentCategory, RecognizedIntent } from './CopilotIntentModel';

export type ToneState = 
  | 'beginner'
  | 'expert'
  | 'conversational'
  | 'investor'
  | 'encouragement'
  | 'clarification'
  | 'supportive'
  | 'professional';

export interface ToneConfig {
  state: ToneState;
  formality: 'casual' | 'neutral' | 'formal';
  vocabularyLevel: 'simple' | 'standard' | 'technical';
  humorAllowance: number; // 0-1, where 0.02 = 2%
  sentenceComplexity: 'short' | 'medium' | 'complex';
  encouragementLevel: 'low' | 'medium' | 'high';
  useAnalogies: boolean;
  useAcknowledgments: boolean;
}

export interface ToneContext {
  intent: RecognizedIntent;
  pageContext?: string;
  userMood?: 'neutral' | 'frustrated' | 'confused' | 'curious' | 'expert';
  previousTone?: ToneState;
  messageComplexity?: 'simple' | 'moderate' | 'complex';
}

// ============================================
// TONE CONFIGURATIONS
// ============================================

const TONE_CONFIGS: Record<ToneState, ToneConfig> = {
  beginner: {
    state: 'beginner',
    formality: 'casual',
    vocabularyLevel: 'simple',
    humorAllowance: 0.03,
    sentenceComplexity: 'short',
    encouragementLevel: 'high',
    useAnalogies: true,
    useAcknowledgments: true,
  },
  expert: {
    state: 'expert',
    formality: 'neutral',
    vocabularyLevel: 'technical',
    humorAllowance: 0.01,
    sentenceComplexity: 'complex',
    encouragementLevel: 'low',
    useAnalogies: false,
    useAcknowledgments: false,
  },
  conversational: {
    state: 'conversational',
    formality: 'casual',
    vocabularyLevel: 'standard',
    humorAllowance: 0.02,
    sentenceComplexity: 'medium',
    encouragementLevel: 'medium',
    useAnalogies: true,
    useAcknowledgments: true,
  },
  investor: {
    state: 'investor',
    formality: 'formal',
    vocabularyLevel: 'standard',
    humorAllowance: 0.01,
    sentenceComplexity: 'medium',
    encouragementLevel: 'low',
    useAnalogies: true,
    useAcknowledgments: true,
  },
  encouragement: {
    state: 'encouragement',
    formality: 'casual',
    vocabularyLevel: 'simple',
    humorAllowance: 0.02,
    sentenceComplexity: 'short',
    encouragementLevel: 'high',
    useAnalogies: true,
    useAcknowledgments: true,
  },
  clarification: {
    state: 'clarification',
    formality: 'neutral',
    vocabularyLevel: 'simple',
    humorAllowance: 0.01,
    sentenceComplexity: 'short',
    encouragementLevel: 'medium',
    useAnalogies: false,
    useAcknowledgments: true,
  },
  supportive: {
    state: 'supportive',
    formality: 'casual',
    vocabularyLevel: 'simple',
    humorAllowance: 0.02,
    sentenceComplexity: 'short',
    encouragementLevel: 'high',
    useAnalogies: true,
    useAcknowledgments: true,
  },
  professional: {
    state: 'professional',
    formality: 'formal',
    vocabularyLevel: 'standard',
    humorAllowance: 0,
    sentenceComplexity: 'medium',
    encouragementLevel: 'low',
    useAnalogies: false,
    useAcknowledgments: true,
  },
};

// ============================================
// FRUSTRATION DETECTION
// ============================================

const FRUSTRATION_INDICATORS = [
  /what the (hell|heck|fuck)/i,
  /this (doesn't|does not|won't|will not) work/i,
  /i (don't|do not) (get|understand) (this|it)/i,
  /confused/i,
  /frustrated/i,
  /annoying|annoyed/i,
  /stupid|dumb/i,
  /ugh|argh|grr/i,
  /!{2,}/,
  /\?{2,}/,
  /why (won't|doesn't|can't)/i,
  /nothing (works|is working)/i,
  /still (don't|doesn't)/i,
];

const EXPERT_INDICATORS = [
  /technically/i,
  /algorithm/i,
  /methodology/i,
  /quantitative/i,
  /statistical/i,
  /correlation/i,
  /regression/i,
  /heuristic/i,
  /ensemble/i,
  /classifier/i,
  /neural network/i,
  /machine learning/i,
  /api|sdk/i,
  /implementation/i,
];

const CONFUSION_INDICATORS = [
  /i (don't|do not) understand/i,
  /what (does|do) (this|that|these) mean/i,
  /confused/i,
  /lost/i,
  /huh\??/i,
  /what\?+$/i,
  /i'm new/i,
  /explain (like|as if)/i,
  /simple/i,
  /basic/i,
];

const CURIOSITY_INDICATORS = [
  /how does/i,
  /why does/i,
  /what happens (if|when)/i,
  /can (you|it)/i,
  /tell me (more|about)/i,
  /interesting/i,
  /curious/i,
  /want to (know|learn|understand)/i,
];

// ============================================
// MOOD DETECTION
// ============================================

/**
 * Detect user mood from message
 */
export function detectUserMood(message: string): ToneContext['userMood'] {
  const lowerMessage = message.toLowerCase();
  
  // Check for frustration first (highest priority)
  if (FRUSTRATION_INDICATORS.some(pattern => pattern.test(message))) {
    return 'frustrated';
  }
  
  // Check for confusion
  if (CONFUSION_INDICATORS.some(pattern => pattern.test(message))) {
    return 'confused';
  }
  
  // Check for expert indicators
  if (EXPERT_INDICATORS.some(pattern => pattern.test(message))) {
    return 'expert';
  }
  
  // Check for curiosity
  if (CURIOSITY_INDICATORS.some(pattern => pattern.test(message))) {
    return 'curious';
  }
  
  return 'neutral';
}

/**
 * Assess message complexity
 */
export function assessMessageComplexity(message: string): ToneContext['messageComplexity'] {
  const words = message.split(/\s+/).length;
  const hasComplexTerms = EXPERT_INDICATORS.some(pattern => pattern.test(message));
  
  if (words > 20 || hasComplexTerms) {
    return 'complex';
  }
  
  if (words > 8) {
    return 'moderate';
  }
  
  return 'simple';
}

// ============================================
// TONE SELECTION
// ============================================

/**
 * Select appropriate tone based on context
 */
export function selectTone(context: ToneContext): ToneConfig {
  const { intent, userMood, pageContext, previousTone, messageComplexity } = context;
  
  // Priority 1: User mood overrides
  if (userMood === 'frustrated') {
    return TONE_CONFIGS.supportive;
  }
  
  if (userMood === 'confused') {
    return TONE_CONFIGS.beginner;
  }
  
  if (userMood === 'expert') {
    return TONE_CONFIGS.expert;
  }
  
  // Priority 2: Intent-based selection
  if (intent.category === 'beginner_mode') {
    return TONE_CONFIGS.beginner;
  }
  
  if (intent.category === 'advanced_mode') {
    return TONE_CONFIGS.expert;
  }
  
  if (intent.category === 'vague_recovery') {
    return TONE_CONFIGS.clarification;
  }
  
  if (intent.category === 'help') {
    return TONE_CONFIGS.encouragement;
  }
  
  if (intent.category === 'greeting') {
    return TONE_CONFIGS.conversational;
  }
  
  // Priority 3: Suggested depth from intent
  if (intent.suggestedDepth === 'simple') {
    return TONE_CONFIGS.beginner;
  }
  
  if (intent.suggestedDepth === 'technical') {
    return TONE_CONFIGS.expert;
  }
  
  // Priority 4: Page context hints
  if (pageContext?.includes('investor') || pageContext?.includes('pitch')) {
    return TONE_CONFIGS.investor;
  }
  
  // Priority 5: Message complexity
  if (messageComplexity === 'complex') {
    return TONE_CONFIGS.professional;
  }
  
  // Default: conversational
  return TONE_CONFIGS.conversational;
}

// ============================================
// TONE TRANSFORMATION
// ============================================

/**
 * Transform response text based on tone config
 */
export function transformResponse(text: string, config: ToneConfig): string {
  let transformed = text;
  
  // Apply vocabulary simplification for beginner mode
  if (config.vocabularyLevel === 'simple') {
    transformed = simplifyVocabulary(transformed);
  }
  
  // Apply sentence shortening for short complexity
  if (config.sentenceComplexity === 'short') {
    transformed = shortenSentences(transformed);
  }
  
  // Add acknowledgment prefix if enabled
  if (config.useAcknowledgments && Math.random() < 0.3) {
    transformed = addAcknowledgment(transformed, config.formality);
  }
  
  // Add encouragement suffix if high encouragement
  if (config.encouragementLevel === 'high' && Math.random() < 0.4) {
    transformed = addEncouragement(transformed);
  }
  
  // Potentially add humor if allowed
  if (config.humorAllowance > 0 && Math.random() < config.humorAllowance) {
    transformed = addLightHumor(transformed);
  }
  
  return transformed;
}

/**
 * Simplify vocabulary for beginner mode
 */
function simplifyVocabulary(text: string): string {
  const replacements: Record<string, string> = {
    'utilize': 'use',
    'implement': 'set up',
    'aggregate': 'combine',
    'propagate': 'spread',
    'anomaly': 'unusual pattern',
    'heuristic': 'rule-based approach',
    'ensemble': 'combination',
    'classifier': 'sorting system',
    'correlation': 'connection',
    'threshold': 'limit',
    'entity': 'wallet or account',
    'cluster': 'group',
    'manipulation': 'market tricks',
    'liquidity': 'available money',
    'volatility': 'price swings',
    'sentiment': 'market mood',
  };
  
  let result = text;
  for (const [complex, simple] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${complex}\\b`, 'gi');
    result = result.replace(regex, simple);
  }
  
  return result;
}

/**
 * Shorten sentences for simpler reading
 */
function shortenSentences(text: string): string {
  // Split long sentences at conjunctions
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  return sentences.map(sentence => {
    if (sentence.length > 100) {
      // Try to split at conjunctions
      return sentence
        .replace(/,\s*(and|but|or|so|because|which|that)\s+/gi, '. ')
        .replace(/;\s*/g, '. ');
    }
    return sentence;
  }).join(' ');
}

/**
 * Add acknowledgment prefix
 */
function addAcknowledgment(text: string, formality: ToneConfig['formality']): string {
  const casualAcks = [
    'Great question! ',
    'Good thinking! ',
    'I see what you mean. ',
    'Absolutely! ',
    'Sure thing! ',
  ];
  
  const neutralAcks = [
    'Good question. ',
    'That\'s a fair point. ',
    'I understand. ',
    'Of course. ',
  ];
  
  const formalAcks = [
    'Excellent question. ',
    'That\'s an important consideration. ',
    'Certainly. ',
  ];
  
  const acks = formality === 'casual' ? casualAcks : 
               formality === 'formal' ? formalAcks : neutralAcks;
  
  const ack = acks[Math.floor(Math.random() * acks.length)];
  return ack + text;
}

/**
 * Add encouragement suffix
 */
function addEncouragement(text: string): string {
  const encouragements = [
    ' Want me to explain any part in more detail?',
    ' Feel free to ask if anything\'s unclear!',
    ' Let me know if you\'d like to explore this further.',
    ' I\'m here if you have more questions!',
    ' Want to dive deeper into any of this?',
  ];
  
  const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
  return text + encouragement;
}

/**
 * Add light humor (used sparingly)
 */
function addLightHumor(text: string): string {
  const humorLines = [
    ' (Don\'t worry, it\'s easier than it sounds!)',
    ' (I promise it\'s not as scary as it looks.)',
    ' (Let\'s tame this data together.)',
  ];
  
  // Only add humor to certain types of responses
  if (text.length > 50 && !text.includes('error') && !text.includes('warning')) {
    const humor = humorLines[Math.floor(Math.random() * humorLines.length)];
    return text + humor;
  }
  
  return text;
}

// ============================================
// TONE TRANSITION
// ============================================

/**
 * Get transition phrase when changing tones
 */
export function getToneTransition(fromTone: ToneState, toTone: ToneState): string | null {
  if (fromTone === toTone) return null;
  
  const transitions: Record<string, string> = {
    'beginner_expert': 'Alright, let\'s get into the technical details.',
    'expert_beginner': 'Let me break this down in simpler terms.',
    'conversational_investor': 'From an investment perspective,',
    'investor_conversational': 'In everyday terms,',
    'clarification_beginner': 'Let me explain this more clearly.',
    'clarification_expert': 'To be more precise,',
    'supportive_beginner': 'No worries, let\'s take this step by step.',
    'supportive_expert': 'I understand. Here\'s the detailed breakdown.',
  };
  
  const key = `${fromTone}_${toTone}`;
  return transitions[key] || null;
}

/**
 * Get tone state display name
 */
export function getToneDisplayName(state: ToneState): string {
  const names: Record<ToneState, string> = {
    beginner: 'Beginner-Friendly',
    expert: 'Expert/Technical',
    conversational: 'Conversational',
    investor: 'Investor Presentation',
    encouragement: 'Encouraging',
    clarification: 'Clarifying',
    supportive: 'Supportive',
    professional: 'Professional',
  };
  return names[state];
}

/**
 * Create full tone context from user message
 */
export function createToneContext(
  message: string,
  intent: RecognizedIntent,
  pageContext?: string,
  previousTone?: ToneState
): ToneContext {
  return {
    intent,
    pageContext,
    userMood: detectUserMood(message),
    previousTone,
    messageComplexity: assessMessageComplexity(message),
  };
}

// Export tone configs for direct access
export { TONE_CONFIGS };

// ============================================
// PHASE 2 CONVERSATIONAL PROFILES
// ============================================

/**
 * Phase 2 Conversational Profile Types
 * 
 * Profiles:
 * - friendly: Warm, approachable, uses casual language
 * - conversational: Natural dialogue flow
 * - professional: Business-appropriate, clear
 * - technical: Data-focused, precise terminology
 * - investor_pitch: ROI-focused, value proposition language
 * - beginner_explainer: ELI5 style, analogies, step-by-step
 */
export type ConversationalProfile = 
  | 'friendly'
  | 'conversational'
  | 'professional'
  | 'technical'
  | 'investor_pitch'
  | 'beginner_explainer';

export interface ConversationalProfileConfig {
  profile: ConversationalProfile;
  openingStyle: 'warm' | 'direct' | 'formal' | 'educational';
  responseLength: 'brief' | 'standard' | 'detailed';
  useQuestions: boolean;
  useExamples: boolean;
  technicalDepth: 'low' | 'medium' | 'high';
}

const CONVERSATIONAL_PROFILES: Record<ConversationalProfile, ConversationalProfileConfig> = {
  friendly: {
    profile: 'friendly',
    openingStyle: 'warm',
    responseLength: 'standard',
    useQuestions: true,
    useExamples: true,
    technicalDepth: 'low',
  },
  conversational: {
    profile: 'conversational',
    openingStyle: 'warm',
    responseLength: 'standard',
    useQuestions: true,
    useExamples: true,
    technicalDepth: 'medium',
  },
  professional: {
    profile: 'professional',
    openingStyle: 'direct',
    responseLength: 'standard',
    useQuestions: false,
    useExamples: false,
    technicalDepth: 'medium',
  },
  technical: {
    profile: 'technical',
    openingStyle: 'direct',
    responseLength: 'detailed',
    useQuestions: false,
    useExamples: true,
    technicalDepth: 'high',
  },
  investor_pitch: {
    profile: 'investor_pitch',
    openingStyle: 'formal',
    responseLength: 'standard',
    useQuestions: false,
    useExamples: true,
    technicalDepth: 'medium',
  },
  beginner_explainer: {
    profile: 'beginner_explainer',
    openingStyle: 'educational',
    responseLength: 'detailed',
    useQuestions: true,
    useExamples: true,
    technicalDepth: 'low',
  },
};

// Investor-related terms for detection
const INVESTOR_INDICATORS = [
  /\b(roi|return on investment)\b/i,
  /\b(investor|investment|portfolio)\b/i,
  /\b(valuation|market cap)\b/i,
  /\b(revenue|profit|earnings)\b/i,
  /\b(funding|series [a-z])\b/i,
  /\b(pitch|deck|presentation)\b/i,
  /\b(stakeholder|shareholder)\b/i,
];

// Data-related terms for technical profile
const DATA_INDICATORS = [
  /\b(data|dataset|metrics)\b/i,
  /\b(chart|graph|visualization)\b/i,
  /\b(percentage|ratio|rate)\b/i,
  /\b(trend|pattern|correlation)\b/i,
  /\b(analysis|analytics)\b/i,
  /\b(score|index|indicator)\b/i,
];

// Uncertainty indicators for beginner mode
const UNCERTAINTY_INDICATORS = [
  /\b(not sure|unsure|uncertain)\b/i,
  /\b(maybe|perhaps|possibly)\b/i,
  /\b(i think|i guess)\b/i,
  /\b(what is|what's|what are)\b/i,
  /\b(how do|how does|how can)\b/i,
  /\b(new to|just started|beginner)\b/i,
  /\?{1,}$/,
];

/**
 * Phase 2: Select conversational profile based on message analysis
 * 
 * Rules:
 * - If user sounds unsure → beginner_explainer
 * - If question is simple → conversational
 * - If question mentions investor terms → investor_pitch
 * - If question references data → technical
 */
export function selectConversationalProfile(
  message: string,
  pageContext?: string
): ConversationalProfileConfig {
  const lowerMessage = message.toLowerCase();

  // Rule 1: User sounds unsure → beginner_explainer
  if (UNCERTAINTY_INDICATORS.some(pattern => pattern.test(message))) {
    console.log('[CopilotPhase2] Selected profile: beginner_explainer (uncertainty detected)');
    return CONVERSATIONAL_PROFILES.beginner_explainer;
  }

  // Rule 2: Investor terms → investor_pitch
  if (INVESTOR_INDICATORS.some(pattern => pattern.test(message))) {
    console.log('[CopilotPhase2] Selected profile: investor_pitch (investor terms detected)');
    return CONVERSATIONAL_PROFILES.investor_pitch;
  }

  // Rule 3: Data references → technical
  if (DATA_INDICATORS.some(pattern => pattern.test(message))) {
    console.log('[CopilotPhase2] Selected profile: technical (data terms detected)');
    return CONVERSATIONAL_PROFILES.technical;
  }

  // Rule 4: Page context hints
  if (pageContext?.includes('pitch') || pageContext?.includes('investor')) {
    console.log('[CopilotPhase2] Selected profile: investor_pitch (page context)');
    return CONVERSATIONAL_PROFILES.investor_pitch;
  }

  // Rule 5: Simple question → conversational
  const wordCount = message.split(/\s+/).length;
  if (wordCount <= 5) {
    console.log('[CopilotPhase2] Selected profile: conversational (simple question)');
    return CONVERSATIONAL_PROFILES.conversational;
  }

  // Default: friendly
  console.log('[CopilotPhase2] Selected profile: friendly (default)');
  return CONVERSATIONAL_PROFILES.friendly;
}

/**
 * Get conversational profile by name
 */
export function getConversationalProfile(
  profile: ConversationalProfile
): ConversationalProfileConfig {
  return CONVERSATIONAL_PROFILES[profile];
}

/**
 * Apply conversational profile to response
 */
export function applyConversationalProfile(
  response: string,
  profile: ConversationalProfileConfig
): string {
  let result = response;

  // Apply opening style
  if (profile.openingStyle === 'warm' && Math.random() < 0.4) {
    const warmOpenings = [
      'Great question! ',
      'I\'d be happy to help with that. ',
      'Good thinking! ',
    ];
    result = warmOpenings[Math.floor(Math.random() * warmOpenings.length)] + result;
  } else if (profile.openingStyle === 'educational' && Math.random() < 0.5) {
    const eduOpenings = [
      'Let me break this down for you. ',
      'Here\'s how this works: ',
      'Think of it this way: ',
    ];
    result = eduOpenings[Math.floor(Math.random() * eduOpenings.length)] + result;
  }

  // Add follow-up question for profiles that use questions
  if (profile.useQuestions && Math.random() < 0.3) {
    const followUps = [
      ' Would you like me to explain any part in more detail?',
      ' Does that make sense?',
      ' Want me to elaborate on anything?',
    ];
    result = result + followUps[Math.floor(Math.random() * followUps.length)];
  }

  console.log('[CopilotPhase2] Applied conversational profile:', profile.profile);
  return result;
}

// Export conversational profiles
export { CONVERSATIONAL_PROFILES };
