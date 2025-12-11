/**
 * CopilotFallback - Fallback clarification layer for empty or unclear queries
 * 
 * Instead of repeating the intro paragraph, fallback should provide
 * helpful clarification prompts to guide the user.
 * 
 * This is an ADDITIVE module - does NOT modify existing Copilot logic.
 */

export interface FallbackResponse {
  text: string;
  type: 'clarification' | 'suggestion' | 'greeting';
  suggestions?: string[];
}

// Clarification prompts for empty queries
const CLARIFICATION_PROMPTS: readonly string[] = [
  "Sure — what would you like to know about GhostQuant?",
  "I'm listening. What can I help you with?",
  "Go ahead — what would you like to know?",
  "I'm here to help. What's your question?",
  "What would you like to explore?",
] as const;

// Suggestion prompts with specific options
const SUGGESTION_PROMPTS: readonly string[] = [
  "Are you asking about the dashboard, the real-time threat map, or something else?",
  "Would you like to know about Hydra threat detection, whale intelligence, or the constellation map?",
  "I can help with market analysis, risk scores, or entity scanning. What interests you?",
  "Are you looking for threat alerts, whale movements, or market intelligence?",
  "Would you like a market briefing, or do you have a specific question?",
] as const;

// Greeting responses when user just says the wake word
const GREETING_RESPONSES: readonly string[] = [
  "Hey! What can I help you with?",
  "I'm here. What would you like to know?",
  "Ready to help. What's on your mind?",
  "Yes? What would you like to explore?",
  "Listening. Go ahead with your question.",
] as const;

// Track last used index to avoid repetition
let lastClarificationIndex = -1;
let lastSuggestionIndex = -1;
let lastGreetingIndex = -1;

/**
 * Get a random item from an array, avoiding the last used index
 */
function getRandomItem<T>(items: readonly T[], lastIndex: number): { item: T; index: number } {
  let index = Math.floor(Math.random() * items.length);
  
  // Avoid repeating the same response
  if (items.length > 1 && index === lastIndex) {
    index = (index + 1) % items.length;
  }
  
  return { item: items[index], index };
}

/**
 * Ask for clarification when the query is empty
 * Returns a friendly prompt asking what the user wants to know
 */
export function askForClarification(): FallbackResponse {
  const { item, index } = getRandomItem(CLARIFICATION_PROMPTS, lastClarificationIndex);
  lastClarificationIndex = index;
  
  console.log('[CopilotFallback] Returning clarification prompt');
  
  return {
    text: item,
    type: 'clarification',
  };
}

/**
 * Provide suggestions when the query is vague or unclear
 * Returns a prompt with specific options for the user
 */
export function provideSuggestions(): FallbackResponse {
  const { item, index } = getRandomItem(SUGGESTION_PROMPTS, lastSuggestionIndex);
  lastSuggestionIndex = index;
  
  console.log('[CopilotFallback] Returning suggestion prompt');
  
  return {
    text: item,
    type: 'suggestion',
    suggestions: [
      'Market briefing',
      'Threat detection',
      'Whale intelligence',
      'Risk analysis',
    ],
  };
}

/**
 * Respond to a greeting (just the wake word with no query)
 * Returns a friendly acknowledgment asking for the question
 */
export function respondToGreeting(): FallbackResponse {
  const { item, index } = getRandomItem(GREETING_RESPONSES, lastGreetingIndex);
  lastGreetingIndex = index;
  
  console.log('[CopilotFallback] Returning greeting response');
  
  return {
    text: item,
    type: 'greeting',
  };
}

/**
 * Get an appropriate fallback response based on context
 * 
 * @param hasWakeWord - Whether a wake word was detected
 * @param isEmpty - Whether the query is empty after stripping wake word
 * @param isVague - Whether the query is too vague to understand
 */
export function getFallbackResponse(
  hasWakeWord: boolean,
  isEmpty: boolean,
  isVague: boolean = false
): FallbackResponse {
  // User said just the wake word with nothing else
  if (hasWakeWord && isEmpty) {
    return respondToGreeting();
  }
  
  // Query is empty (no wake word, no content)
  if (isEmpty) {
    return askForClarification();
  }
  
  // Query is vague or unclear
  if (isVague) {
    return provideSuggestions();
  }
  
  // Default to clarification
  return askForClarification();
}

/**
 * Check if a response is a fallback response
 */
export function isFallbackResponse(response: FallbackResponse): boolean {
  return response.type === 'clarification' || 
         response.type === 'suggestion' || 
         response.type === 'greeting';
}

// Default export for convenience
export default {
  askForClarification,
  provideSuggestions,
  respondToGreeting,
  getFallbackResponse,
  isFallbackResponse,
};
