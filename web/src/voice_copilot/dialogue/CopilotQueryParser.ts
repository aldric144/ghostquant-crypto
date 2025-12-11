/**
 * CopilotQueryParser - Wake-word stripping and query extraction
 * 
 * Responsibilities:
 * - Extract question text after wake-word
 * - Normalize grammar
 * - Return parsed query with metadata
 * 
 * This is an ADDITIVE module - does NOT modify existing Copilot logic.
 * 
 * Example:
 * Input: "hey g3 what is real time threat mapping"
 * Output: { raw: "hey g3 what is real time threat mapping", cleaned: "what is real time threat mapping", hasWakeWord: true, isEmpty: false }
 */

import { 
  matchesWakeAlias, 
  extractQueryAfterWakeAlias,
  CANONICAL_WAKE_PHRASE,
  WAKE_ALIASES,
} from '../WakeAliasMap';

export interface ParsedQuery {
  raw: string;
  cleaned: string;
  hasWakeWord: boolean;
  isEmpty: boolean;
}

// G3 wake-word aliases (primary)
const G3_WAKE_ALIASES: readonly string[] = [
  'hey g3',
  'g3',
  'ok g3',
  'hi g3',
  'yo g3',
  'hey gee three',
  'hey g-3',
  'hey gee 3',
  'hey g 3',
  'ok gee three',
  'hi gee three',
  'yo gee three',
  'gee three',
  'gee 3',
  'g-3',
  'g 3',
] as const;

// GhostQuant -> G3 normalization aliases
const GHOSTQUANT_ALIASES: readonly string[] = [
  'ghost quant',
  'ghostquant',
  'go quant',
  'goquant',
  'ghost quench',
  'ghostquench',
  'hey ghost quant',
  'hey ghostquant',
  'ok ghost quant',
  'ok ghostquant',
  'hi ghost quant',
  'hi ghostquant',
  'hey go quant',
  'hey goquant',
  'hey ghost quench',
  'hey ghostquench',
] as const;

// Combined all wake aliases for detection
const ALL_WAKE_ALIASES: string[] = [
  ...G3_WAKE_ALIASES,
  ...GHOSTQUANT_ALIASES,
  ...WAKE_ALIASES,
];

/**
 * Find the longest matching wake-word alias in the text
 * @param text - Text to search
 * @returns The matched alias and its position, or null if no match
 */
function findWakeWordMatch(text: string): { alias: string; index: number } | null {
  if (!text) return null;
  
  const lowerText = text.toLowerCase().trim();
  
  // Sort aliases by length (longest first) to match the most specific alias
  const sortedAliases = [...ALL_WAKE_ALIASES].sort((a, b) => b.length - a.length);
  
  for (const alias of sortedAliases) {
    const aliasLower = alias.toLowerCase();
    const index = lowerText.indexOf(aliasLower);
    
    if (index !== -1) {
      return { alias, index };
    }
  }
  
  return null;
}

/**
 * Extract the query portion after the wake-word
 * @param text - Full transcript
 * @param match - The wake-word match result
 * @returns The cleaned query after the wake-word
 */
function extractQueryAfterWakeWord(text: string, match: { alias: string; index: number }): string {
  const afterWake = text.substring(match.index + match.alias.length).trim();
  return afterWake;
}

/**
 * Normalize grammar in the query
 * - Capitalize first letter
 * - Add question mark if it looks like a question
 * @param query - The raw query
 * @returns Normalized query
 */
function normalizeGrammar(query: string): string {
  if (!query) return query;
  
  let normalized = query.trim();
  
  // Capitalize first letter
  if (normalized.length > 0) {
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  
  // Add question mark if it looks like a question and doesn't have punctuation
  const questionStarters = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'is', 'are', 'can', 'could', 'would', 'should', 'do', 'does', 'did'];
  const lowerQuery = normalized.toLowerCase();
  const startsWithQuestion = questionStarters.some(starter => lowerQuery.startsWith(starter + ' '));
  
  if (startsWithQuestion && !normalized.endsWith('?') && !normalized.endsWith('.') && !normalized.endsWith('!')) {
    normalized = normalized + '?';
  }
  
  return normalized;
}

/**
 * Parse a user query, extracting the question after any wake-word
 * 
 * @param text - Raw user input (from STT or text input)
 * @returns ParsedQuery with raw, cleaned, hasWakeWord, and isEmpty fields
 */
export function parse(text: string): ParsedQuery {
  console.log(`[QueryParser] raw: ${text}`);
  
  if (!text || !text.trim()) {
    console.log('[QueryParser] cleaned: (empty)');
    console.log('[QueryParser] wake-detected: false');
    return {
      raw: text || '',
      cleaned: '',
      hasWakeWord: false,
      isEmpty: true,
    };
  }
  
  const trimmedText = text.trim();
  
  // Check for wake-word match
  const match = findWakeWordMatch(trimmedText);
  
  if (match) {
    // Wake-word detected - extract the query after it
    const query = extractQueryAfterWakeWord(trimmedText, match);
    const cleaned = normalizeGrammar(query);
    
    console.log(`[QueryParser] cleaned: ${cleaned}`);
    console.log(`[QueryParser] wake-detected: true (alias: "${match.alias}")`);
    
    return {
      raw: trimmedText,
      cleaned,
      hasWakeWord: true,
      isEmpty: !cleaned || cleaned.length === 0,
    };
  }
  
  // No wake-word detected - use the full text as the query
  const cleaned = normalizeGrammar(trimmedText);
  
  console.log(`[QueryParser] cleaned: ${cleaned}`);
  console.log('[QueryParser] wake-detected: false');
  
  return {
    raw: trimmedText,
    cleaned,
    hasWakeWord: false,
    isEmpty: !cleaned || cleaned.length === 0,
  };
}

/**
 * Check if text contains any wake-word alias
 * @param text - Text to check
 * @returns True if wake-word detected
 */
export function hasWakeWord(text: string): boolean {
  if (!text) return false;
  return findWakeWordMatch(text) !== null;
}

/**
 * Get the detected wake-word alias from text
 * @param text - Text to check
 * @returns The detected alias or null
 */
export function getDetectedWakeWord(text: string): string | null {
  if (!text) return null;
  const match = findWakeWordMatch(text);
  return match ? match.alias : null;
}

// Default export for convenience
export default {
  parse,
  hasWakeWord,
  getDetectedWakeWord,
};
