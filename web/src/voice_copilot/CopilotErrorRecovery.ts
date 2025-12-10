/**
 * CopilotErrorRecovery - Intelligent Error Recovery System
 * 
 * Provides ghostquant-safe fallback phrases that are:
 * - Never robotic
 * - Always helpful
 * - Context-aware
 * - Encouraging exploration
 * 
 * NO ROBOTIC RESPONSES ALLOWED:
 * - "I didn't understand."
 * - "Invalid question."
 * - "Unknown input."
 */

import { ContextState, extractContextClues, inferQuerySubject } from './CopilotContextEngine';
import { RecognizedIntent } from './CopilotIntentModel';

export type RecoveryType = 
  | 'vague_question'
  | 'unclear_intent'
  | 'missing_context'
  | 'technical_error'
  | 'no_data'
  | 'permission_denied'
  | 'timeout'
  | 'general';

export interface RecoveryResponse {
  type: RecoveryType;
  message: string;
  suggestions?: string[];
  offerSimplification?: boolean;
  offerAlternatives?: boolean;
}

// ============================================
// APPROVED FALLBACK RESPONSES
// ============================================

const VAGUE_QUESTION_RESPONSES = [
  "Let's try this another way — I think you're pointing at {subject}. Want me to explain that?",
  "Here's the part I believe you're referring to: {subject}. Should I break it down?",
  "I think you're asking about {subject}. Here's what I can tell you about it.",
  "Looks like you're looking at {subject}. Let me explain what that means.",
  "Based on where you are, I think you're curious about {subject}. Am I on the right track?",
];

const UNCLEAR_INTENT_RESPONSES = [
  "I want to make sure I help you with the right thing. Are you asking about {options}?",
  "Let me make sure I understand — are you interested in {options}?",
  "I can help with a few things here. Would you like to know about {options}?",
  "Say the word and I'll explain the part you want. Are you curious about {options}?",
  "I'm here to help! Are you looking for information about {options}?",
];

const MISSING_CONTEXT_RESPONSES = [
  "I'd love to help! Could you tell me a bit more about what you're looking at?",
  "To give you the best answer, could you point me to what you're curious about?",
  "I want to be helpful here. What specific part would you like me to explain?",
  "Let's narrow this down together. What aspect are you most interested in?",
  "I can explain several things on this page. What catches your attention?",
];

const SIMPLIFICATION_OFFERS = [
  "We can simplify this — want the easy version?",
  "This might look complex, but I can break it down simply. Want me to?",
  "Let me make this easier to understand. Ready for the simple explanation?",
  "I can explain this in plain terms. Would that help?",
  "Don't worry about the technical stuff — want me to keep it simple?",
];

const TECHNICAL_ERROR_RESPONSES = [
  "Hmm, something's not quite right on my end. Let me try a different approach.",
  "I hit a small snag, but I can still help. What would you like to know?",
  "Let me work around that and get you an answer another way.",
  "That didn't work as expected, but I've got other ways to help you.",
  "Small hiccup on my end — but I can still answer your question differently.",
];

const NO_DATA_RESPONSES = [
  "I don't have data on that specific item right now, but I can explain how it works in general.",
  "That particular data isn't available at the moment. Want me to explain the concept instead?",
  "I can't pull that specific information right now, but I can tell you what to look for.",
  "The data for that isn't loading, but I can still help you understand what it means.",
  "That information isn't available, but I can explain the system that generates it.",
];

const ENCOURAGEMENT_ADDITIONS = [
  "Feel free to ask me anything else!",
  "I'm here whenever you need help.",
  "Don't hesitate to ask more questions!",
  "Let me know if you want to explore further.",
  "I'm happy to dive deeper into any of this.",
];

const EXPLORATION_PROMPTS = [
  "Want to explore this further?",
  "Should we dig into the details?",
  "Curious to learn more?",
  "Want me to show you related features?",
  "Ready to see what else we can discover?",
];

// ============================================
// CONTEXT-AWARE OPTION GENERATORS
// ============================================

function getPageOptions(context: ContextState): string[] {
  if (!context.currentPage) return ['the platform features', 'getting started'];
  
  switch (context.currentPage.category) {
    case 'hydra':
      return ['the threat detection', 'the confidence scores', 'what the alerts mean'];
    case 'constellation':
      return ['the entity connections', 'the cluster analysis', 'how risk spreads'];
    case 'ecoscan':
      return ['the risk assessment', 'the entity profile', 'the threat indicators'];
    case 'whale_intel':
      return ['whale movements', 'the impact predictions', 'who the big players are'];
    case 'analytics':
      return ['the market overview', 'the risk index', 'the anomaly feed'];
    default:
      return ['the current view', 'how to navigate', 'what you can do here'];
  }
}

function formatOptions(options: string[]): string {
  if (options.length === 0) return 'this feature';
  if (options.length === 1) return options[0];
  if (options.length === 2) return `${options[0]} or ${options[1]}`;
  return `${options.slice(0, -1).join(', ')}, or ${options[options.length - 1]}`;
}

// ============================================
// RECOVERY FUNCTIONS
// ============================================

/**
 * Get recovery response for vague questions
 */
export function recoverFromVagueQuestion(
  context: ContextState,
  intent?: RecognizedIntent
): RecoveryResponse {
  const subject = inferQuerySubject(context) || 'what you\'re looking at';
  const template = VAGUE_QUESTION_RESPONSES[Math.floor(Math.random() * VAGUE_QUESTION_RESPONSES.length)];
  const message = template.replace('{subject}', subject);
  
  return {
    type: 'vague_question',
    message,
    suggestions: getPageOptions(context),
    offerSimplification: true,
    offerAlternatives: true,
  };
}

/**
 * Get recovery response for unclear intent
 */
export function recoverFromUnclearIntent(
  context: ContextState,
  possibleIntents?: string[]
): RecoveryResponse {
  const options = possibleIntents || getPageOptions(context);
  const template = UNCLEAR_INTENT_RESPONSES[Math.floor(Math.random() * UNCLEAR_INTENT_RESPONSES.length)];
  const message = template.replace('{options}', formatOptions(options));
  
  return {
    type: 'unclear_intent',
    message,
    suggestions: options,
    offerAlternatives: true,
  };
}

/**
 * Get recovery response for missing context
 */
export function recoverFromMissingContext(context: ContextState): RecoveryResponse {
  const message = MISSING_CONTEXT_RESPONSES[Math.floor(Math.random() * MISSING_CONTEXT_RESPONSES.length)];
  
  return {
    type: 'missing_context',
    message,
    suggestions: getPageOptions(context),
    offerAlternatives: true,
  };
}

/**
 * Get recovery response for technical errors
 */
export function recoverFromTechnicalError(
  errorType?: string,
  context?: ContextState
): RecoveryResponse {
  const message = TECHNICAL_ERROR_RESPONSES[Math.floor(Math.random() * TECHNICAL_ERROR_RESPONSES.length)];
  
  return {
    type: 'technical_error',
    message,
    suggestions: context ? getPageOptions(context) : undefined,
    offerAlternatives: true,
  };
}

/**
 * Get recovery response for no data available
 */
export function recoverFromNoData(
  dataType?: string,
  context?: ContextState
): RecoveryResponse {
  const message = NO_DATA_RESPONSES[Math.floor(Math.random() * NO_DATA_RESPONSES.length)];
  
  return {
    type: 'no_data',
    message,
    suggestions: context ? getPageOptions(context) : undefined,
    offerSimplification: true,
  };
}

/**
 * Offer simplification of complex topic
 */
export function offerSimplification(): string {
  return SIMPLIFICATION_OFFERS[Math.floor(Math.random() * SIMPLIFICATION_OFFERS.length)];
}

/**
 * Add encouragement to response
 */
export function addEncouragement(response: string): string {
  const encouragement = ENCOURAGEMENT_ADDITIONS[Math.floor(Math.random() * ENCOURAGEMENT_ADDITIONS.length)];
  return `${response} ${encouragement}`;
}

/**
 * Add exploration prompt to response
 */
export function addExplorationPrompt(response: string): string {
  const prompt = EXPLORATION_PROMPTS[Math.floor(Math.random() * EXPLORATION_PROMPTS.length)];
  return `${response} ${prompt}`;
}

// ============================================
// MAIN RECOVERY FUNCTION
// ============================================

/**
 * Get appropriate recovery response based on situation
 */
export function getRecoveryResponse(
  type: RecoveryType,
  context: ContextState,
  additionalInfo?: {
    intent?: RecognizedIntent;
    possibleIntents?: string[];
    errorType?: string;
    dataType?: string;
  }
): RecoveryResponse {
  switch (type) {
    case 'vague_question':
      return recoverFromVagueQuestion(context, additionalInfo?.intent);
    
    case 'unclear_intent':
      return recoverFromUnclearIntent(context, additionalInfo?.possibleIntents);
    
    case 'missing_context':
      return recoverFromMissingContext(context);
    
    case 'technical_error':
      return recoverFromTechnicalError(additionalInfo?.errorType, context);
    
    case 'no_data':
      return recoverFromNoData(additionalInfo?.dataType, context);
    
    case 'permission_denied':
      return {
        type: 'permission_denied',
        message: "I don't have access to that information right now, but I can help you with other things on this page.",
        suggestions: getPageOptions(context),
        offerAlternatives: true,
      };
    
    case 'timeout':
      return {
        type: 'timeout',
        message: "That's taking longer than expected. Let me try a different approach to help you.",
        suggestions: getPageOptions(context),
        offerAlternatives: true,
      };
    
    default:
      return {
        type: 'general',
        message: "I want to help you with that. Could you tell me a bit more about what you're looking for?",
        suggestions: getPageOptions(context),
        offerSimplification: true,
        offerAlternatives: true,
      };
  }
}

/**
 * Format recovery response with optional additions
 */
export function formatRecoveryResponse(
  recovery: RecoveryResponse,
  options?: {
    addEncouragement?: boolean;
    addExploration?: boolean;
    includeSimplificationOffer?: boolean;
  }
): string {
  let response = recovery.message;
  
  if (options?.includeSimplificationOffer && recovery.offerSimplification) {
    response += ' ' + offerSimplification();
  }
  
  if (options?.addEncouragement) {
    response = addEncouragement(response);
  }
  
  if (options?.addExploration) {
    response = addExplorationPrompt(response);
  }
  
  return response;
}

/**
 * Check if a response sounds robotic (for validation)
 */
export function isRoboticResponse(response: string): boolean {
  const roboticPatterns = [
    /i (didn't|did not|don't|do not) understand/i,
    /invalid (question|input|request)/i,
    /unknown (input|command|request)/i,
    /error:/i,
    /please try again/i,
    /cannot process/i,
    /unable to (understand|process|help)/i,
    /not recognized/i,
    /syntax error/i,
    /malformed/i,
  ];
  
  return roboticPatterns.some(pattern => pattern.test(response));
}

/**
 * Humanize a potentially robotic response
 */
export function humanizeResponse(response: string, context: ContextState): string {
  if (!isRoboticResponse(response)) {
    return response;
  }
  
  // Replace with a friendly alternative
  const recovery = getRecoveryResponse('general', context);
  return recovery.message;
}

// ============================================
// CONFUSION DETECTION
// ============================================

/**
 * Detect if user seems confused based on interaction history
 */
export function detectUserConfusion(context: ContextState): boolean {
  const recentQuestions = context.recentQuestions.slice(-3);
  
  // Check for repeated similar questions
  if (recentQuestions.length >= 2) {
    const intents = recentQuestions.map(q => q.intent);
    const uniqueIntents = new Set(intents);
    if (uniqueIntents.size === 1 && intents[0] === 'vague_recovery') {
      return true;
    }
  }
  
  // Check for rapid questioning
  if (recentQuestions.length >= 3) {
    const timeSpan = recentQuestions[recentQuestions.length - 1].timestamp - recentQuestions[0].timestamp;
    if (timeSpan < 30000) { // 3+ questions in 30 seconds
      return true;
    }
  }
  
  return false;
}

/**
 * Get proactive help message for confused user
 */
export function getProactiveHelp(context: ContextState): string {
  const clues = extractContextClues(context);
  
  const helpMessages = [
    `I notice you might be exploring. Let me give you a quick overview of the ${clues.pageName}.`,
    "It looks like you're trying to find something. Can I point you in the right direction?",
    "Let me help you get oriented. What would be most useful to know right now?",
    "I'm here to help! Would you like a quick tour of what you can do here?",
  ];
  
  return helpMessages[Math.floor(Math.random() * helpMessages.length)];
}

// Export response arrays for testing/extension
export {
  VAGUE_QUESTION_RESPONSES,
  UNCLEAR_INTENT_RESPONSES,
  MISSING_CONTEXT_RESPONSES,
  SIMPLIFICATION_OFFERS,
  TECHNICAL_ERROR_RESPONSES,
  NO_DATA_RESPONSES,
  ENCOURAGEMENT_ADDITIONS,
  EXPLORATION_PROMPTS,
};
