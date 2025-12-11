/**
 * WakeAliasMap - Wake-word aliases for misheard variants
 * Maps common misrecognitions to the canonical "Hey G3" wake phrase
 * 
 * This module provides alias mapping without modifying the WakeWordEngine directly.
 * It can be used as a pre-processing layer for wake word detection.
 */

// Canonical wake phrase - Updated to G3
export const CANONICAL_WAKE_PHRASE = 'Hey G3';

// G3 wake word aliases - all variants that should activate G3
// All of these should be normalized to "Hey G3"
export const G3_ALIASES: readonly string[] = [
  // Primary G3 variants
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

// GhostQuant aliases that should normalize to G3
export const GHOSTQUANT_TO_G3_ALIASES: readonly string[] = [
  // Direct GhostQuant -> G3 normalization
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

// Wake word aliases - misheard variants that should activate G3
// All of these should be normalized to "Hey G3"
export const WAKE_ALIASES: readonly string[] = [
  // G3 primary aliases
  ...G3_ALIASES,
  
  // GhostQuant -> G3 aliases
  ...GHOSTQUANT_TO_G3_ALIASES,
  
  // Google misrecognitions (very common)
  'hey google',
  'ok google',
  'okay google',
  
  // GhostQuant phonetic variants (all normalize to G3)
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
  'hey ghost quint',
  'hey ghostquint',
  'hey goast quant',
  'hey goastquant',
  
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
 * Normalize wake phrase to canonical form (Hey G3)
 * @param text - Text containing wake phrase
 * @returns Text with wake phrase normalized to "Hey G3"
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
      
      // Log the normalization
      console.log('[WakeWord] Alias detected -> normalized to "Hey G3"');
      const cleanedQuery = after.trim();
      if (cleanedQuery) {
        console.log(`[WakeWord] Query extracted: "${cleanedQuery}"`);
      }
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
  
  // Exact G3 canonical match (highest confidence)
  if (lowerText === 'hey g3' || lowerText === 'g3' || lowerText.includes('hey g3')) {
    console.log('[WakeWord] Alias detected -> normalized to "Hey G3"');
    return 1.0;
  }
  
  // G3 variants (very high confidence)
  const g3Variants = ['ok g3', 'hi g3', 'yo g3', 'hey gee three', 'hey g-3', 'gee three'];
  for (const variant of g3Variants) {
    if (lowerText.includes(variant)) {
      console.log('[WakeWord] Alias detected -> normalized to "Hey G3"');
      return 0.98;
    }
  }
  
  // GhostQuant -> G3 normalization (high confidence)
  if (lowerText.includes('ghostquant') || lowerText.includes('ghost quant')) {
    console.log('[WakeWord] Alias detected -> normalized to "Hey G3"');
    return 0.95;
  }
  
  // Google misrecognitions (very high confidence these are meant for G3)
  if (lowerText.includes('hey google') || lowerText.includes('ok google')) {
    console.log('[WakeWord] Alias detected -> normalized to "Hey G3"');
    return 0.95;
  }
  
  // GhostQuant phonetic variants -> G3
  const highConfidenceAliases = [
    'ghost quench', 'ghostquench', 'go quant', 'goquant',
    'hey ghost kwant', 'hey ghostkwant',
    'hey ghost quont', 'hey ghostquont',
    'hey gusquant', 'hey gus quant',
    'hey ghost quan', 'hey ghostquan',
  ];
  
  for (const alias of highConfidenceAliases) {
    if (lowerText.includes(alias)) {
      console.log('[WakeWord] Alias detected -> normalized to "Hey G3"');
      return 0.9;
    }
  }
  
  // Other aliases
  for (const alias of WAKE_ALIASES) {
    if (lowerText.includes(alias.toLowerCase())) {
      console.log('[WakeWord] Alias detected -> normalized to "Hey G3"');
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
  G3_ALIASES,
  GHOSTQUANT_TO_G3_ALIASES,
  matchesWakeAlias,
  normalizeWakePhrase,
  extractQueryAfterWakeAlias,
  getWakeAliasConfidence,
  isGoogleMisrecognition,
};
