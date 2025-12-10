/**
 * WakeAliasMap - Wake-word aliases for misheard variants
 * Maps common misrecognitions to the canonical "Hey GhostQuant" wake phrase
 * 
 * This module provides alias mapping without modifying the WakeWordEngine directly.
 * It can be used as a pre-processing layer for wake word detection.
 */

// Canonical wake phrase
export const CANONICAL_WAKE_PHRASE = 'Hey GhostQuant';

// Wake word aliases - misheard variants that should activate GhostQuant
// All of these should be normalized to "Hey GhostQuant"
export const WAKE_ALIASES: readonly string[] = [
  // Google misrecognitions (very common)
  'hey google',
  'ok google',
  'okay google',
  
  // GhostQuant phonetic variants
  'hey gusquant',
  'hey gus quant',
  'hey ghost quan',
  'hey ghostquan',
  'hey ghost kwant',
  'hey ghostkwant',
  'hey gose quant',
  'hey gosequant',
  'hey goostquant',
  'hey goost quant',
  'hey ghost count',
  'hey ghostcount',
  'hey ghost quont',
  'hey ghostquont',
  'hey ghost kwont',
  'hey ghostkwont',
  'hey goose quant',
  'hey goosequant',
  'hey ghost want',
  'hey ghostwant',
  'hey ghost cant',
  'hey ghostcant',
  'hey ghost point',
  'hey ghostpoint',
  'hey ghost client',
  'hey ghostclient',
  
  // OK prefix variants
  'ok gusquant',
  'ok ghost quan',
  'ok ghost kwant',
  'ok gose quant',
  'ok goostquant',
  'ok ghost count',
  'ok ghost quont',
  'ok goose quant',
  
  // Hi/Hello prefix variants
  'hi ghostquant',
  'hi ghost quant',
  'hello ghostquant',
  'hello ghost quant',
  
  // Without prefix (just the name)
  'ghostquant',
  'ghost quant',
  'gusquant',
  'gus quant',
  'ghost kwant',
  'ghostkwant',
  'gose quant',
  'gosequant',
  'goostquant',
  'goost quant',
  'ghost count',
  'ghostcount',
  'ghost quont',
  'ghostquont',
  'goose quant',
  'goosequant',
] as const;

// Map of aliases to canonical form (lowercase for matching)
const ALIAS_MAP: Map<string, string> = new Map(
  WAKE_ALIASES.map(alias => [alias.toLowerCase(), CANONICAL_WAKE_PHRASE])
);

/**
 * Check if text matches any wake alias
 * @param text - Text to check
 * @returns True if text contains a wake alias
 */
export function matchesWakeAlias(text: string): boolean {
  if (!text) return false;
  
  const lowerText = text.toLowerCase().trim();
  
  // Check for exact match first
  if (ALIAS_MAP.has(lowerText)) {
    return true;
  }
  
  // Check if text contains any alias
  for (const alias of WAKE_ALIASES) {
    if (lowerText.includes(alias.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

/**
 * Normalize wake phrase to canonical form
 * @param text - Text containing wake phrase
 * @returns Text with wake phrase normalized to "Hey GhostQuant"
 */
export function normalizeWakePhrase(text: string): string {
  if (!text) return text;
  
  let normalized = text;
  const lowerText = text.toLowerCase();
  
  // Replace each alias with canonical form
  for (const alias of WAKE_ALIASES) {
    const aliasLower = alias.toLowerCase();
    const index = lowerText.indexOf(aliasLower);
    
    if (index !== -1) {
      // Preserve case-sensitivity by replacing at the found position
      const before = normalized.substring(0, index);
      const after = normalized.substring(index + alias.length);
      normalized = before + CANONICAL_WAKE_PHRASE + after;
      break; // Only replace first occurrence
    }
  }
  
  return normalized;
}

/**
 * Extract the query after the wake phrase (including aliases)
 * @param text - Full transcript
 * @returns Query portion after the wake phrase, or empty string if no wake phrase found
 */
export function extractQueryAfterWakeAlias(text: string): string {
  if (!text) return '';
  
  const lowerText = text.toLowerCase();
  
  // Find the longest matching alias
  let longestMatch = '';
  let matchIndex = -1;
  
  for (const alias of WAKE_ALIASES) {
    const aliasLower = alias.toLowerCase();
    const index = lowerText.indexOf(aliasLower);
    
    if (index !== -1 && alias.length > longestMatch.length) {
      longestMatch = alias;
      matchIndex = index;
    }
  }
  
  if (matchIndex !== -1 && longestMatch) {
    const afterWake = text.substring(matchIndex + longestMatch.length).trim();
    return afterWake;
  }
  
  return '';
}

/**
 * Get confidence score for wake alias match
 * @param text - Text to evaluate
 * @returns Confidence score (0-1)
 */
export function getWakeAliasConfidence(text: string): number {
  if (!text) return 0;
  
  const lowerText = text.toLowerCase().trim();
  
  // Exact canonical match
  if (lowerText === 'hey ghostquant' || lowerText === 'hey ghost quant') {
    return 1.0;
  }
  
  // Google misrecognitions (very high confidence these are meant for GhostQuant)
  if (lowerText.includes('hey google') || lowerText.includes('ok google')) {
    return 0.95;
  }
  
  // Close phonetic matches
  const highConfidenceAliases = [
    'hey ghost kwant', 'hey ghostkwant',
    'hey ghost quont', 'hey ghostquont',
    'hey gusquant', 'hey gus quant',
    'hey ghost quan', 'hey ghostquan',
  ];
  
  for (const alias of highConfidenceAliases) {
    if (lowerText.includes(alias)) {
      return 0.9;
    }
  }
  
  // Other aliases
  for (const alias of WAKE_ALIASES) {
    if (lowerText.includes(alias.toLowerCase())) {
      return 0.8;
    }
  }
  
  return 0;
}

/**
 * Check if text is likely a Google misrecognition of GhostQuant
 * @param text - Text to check
 * @returns True if text contains "google" in a wake phrase context
 */
export function isGoogleMisrecognition(text: string): boolean {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  return (
    lowerText.includes('hey google') ||
    lowerText.includes('ok google') ||
    lowerText.includes('okay google')
  );
}

export default {
  CANONICAL_WAKE_PHRASE,
  WAKE_ALIASES,
  matchesWakeAlias,
  normalizeWakePhrase,
  extractQueryAfterWakeAlias,
  getWakeAliasConfidence,
  isGoogleMisrecognition,
};
