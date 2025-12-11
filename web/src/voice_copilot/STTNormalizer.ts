/**
 * STTNormalizer - Speech Recognition Bias Dictionary
 * Forces preferred matches for G3-related terms over common misrecognitions
 * 
 * This module normalizes STT output to correct common misrecognitions
 * without modifying the underlying speech recognition engine.
 * 
 * All GhostQuant variants now normalize to G3.
 */

// G3 Speech Recognition Bias Dictionary
// These terms should be forced as preferred matches
export const G3_BIAS_TERMS = [
  'G3',
  'g3',
  'gee three',
  'gee 3',
  'g-3',
  'g 3',
] as const;

// GhostQuant terms that normalize to G3
export const GHOSTQUANT_BIAS_TERMS = [
  'GhostQuant',
  'Ghost Quant',
  'GhostKwont',
  'Gos Quant',
  'GusQuant',
  'Ghost Kwant',
  'Ghost Quont',
  'Goast Quant',
  'Ghost Quench',
  'Ghost Quint',
  'Go Quant',
] as const;

// Normalized form for all bias terms - now G3
export const NORMALIZED_GHOSTQUANT = 'G3';
export const NORMALIZED_G3 = 'G3';

// Common misrecognitions that should be normalized to G3
const MISRECOGNITION_MAP: Record<string, string> = {
  // G3 variants
  'gee three': 'G3',
  'gee 3': 'G3',
  'g-3': 'G3',
  'g 3': 'G3',
  
  // GhostQuant -> G3 normalization
  'ghostquant': 'G3',
  'ghost quant': 'G3',
  'go quant': 'G3',
  'goquant': 'G3',
  'ghost quench': 'G3',
  'ghostquench': 'G3',
  
  // Direct misrecognitions -> G3
  'ghostkwont': 'G3',
  'ghost kwont': 'G3',
  'gos quant': 'G3',
  'gosquant': 'G3',
  'gusquant': 'G3',
  'gus quant': 'G3',
  'ghost kwant': 'G3',
  'ghostkwant': 'G3',
  'ghost quont': 'G3',
  'ghostquont': 'G3',
  'ghost count': 'G3',
  'ghostcount': 'G3',
  'ghost cant': 'G3',
  'ghostcant': 'G3',
  'ghost want': 'G3',
  'ghostwant': 'G3',
  'goose quant': 'G3',
  'goosequant': 'G3',
  'goost quant': 'G3',
  'goostquant': 'G3',
  'gose quant': 'G3',
  'gosequant': 'G3',
  'ghost quan': 'G3',
  'ghostquan': 'G3',
  'ghost quand': 'G3',
  'ghostquand': 'G3',
  'ghost client': 'G3',
  'ghostclient': 'G3',
  'ghost point': 'G3',
  'ghostpoint': 'G3',
  
  // Additional phonetic variants -> G3
  'goast quant': 'G3',
  'goastquant': 'G3',
  'ghost quint': 'G3',
  'ghostquint': 'G3',
  'ghost quinch': 'G3',
  'ghostquinch': 'G3',
};

// Prefix patterns that should be normalized
const PREFIX_NORMALIZATIONS: Record<string, string> = {
  'hey': 'Hey',
  'ok': 'OK',
  'okay': 'OK',
  'hi': 'Hey',
  'hello': 'Hey',
};

/**
 * Normalize STT output to correct common misrecognitions
 * @param text - Raw STT transcript
 * @returns Normalized transcript with G3 corrections
 */
export function normalizeSTTOutput(text: string): string {
  if (!text) return text;
  
  let normalized = text;
  
  // Check for direct misrecognitions and replace with G3
  for (const [misrecognition, correction] of Object.entries(MISRECOGNITION_MAP)) {
    const regex = new RegExp(misrecognition, 'gi');
    if (regex.test(normalized)) {
      normalized = normalized.replace(regex, correction);
    }
  }
  
  // Normalize prefix + GhostQuant/G3 patterns to Hey G3
  for (const [prefix, normalizedPrefix] of Object.entries(PREFIX_NORMALIZATIONS)) {
    // GhostQuant variants -> G3
    const ghostQuantPattern = new RegExp(`\\b${prefix}\\s+(ghost\\s*quant|ghostquant|go\\s*quant|goquant|ghost\\s*quench|ghostquench)\\b`, 'gi');
    if (ghostQuantPattern.test(normalized)) {
      normalized = normalized.replace(ghostQuantPattern, `${normalizedPrefix} G3`);
    }
    
    // G3 variants normalization
    const g3Pattern = new RegExp(`\\b${prefix}\\s+(g3|gee\\s*three|gee\\s*3|g-3)\\b`, 'gi');
    if (g3Pattern.test(normalized)) {
      normalized = normalized.replace(g3Pattern, `${normalizedPrefix} G3`);
    }
  }
  
  // Final pass: ensure consistent G3 for any remaining GhostQuant variants
  normalized = normalized.replace(/ghost\s*quant/gi, 'G3');
  normalized = normalized.replace(/go\s*quant/gi, 'G3');
  normalized = normalized.replace(/ghost\s*quench/gi, 'G3');
  
  return normalized;
}

/**
 * Check if text contains any G3 or GhostQuant-related terms (including misrecognitions)
 * @param text - Text to check
 * @returns True if text contains G3, GhostQuant, or a known misrecognition
 */
export function containsGhostQuantTerm(text: string): boolean {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  // Check for direct G3
  if (lowerText.includes('g3') || lowerText.includes('gee three') || lowerText.includes('gee 3')) {
    return true;
  }
  
  // Check for direct GhostQuant (legacy, normalizes to G3)
  if (lowerText.includes('ghostquant') || lowerText.includes('ghost quant')) {
    return true;
  }
  
  // Check for go quant / ghost quench (normalize to G3)
  if (lowerText.includes('go quant') || lowerText.includes('ghost quench')) {
    return true;
  }
  
  // Check for known misrecognitions
  for (const misrecognition of Object.keys(MISRECOGNITION_MAP)) {
    if (lowerText.includes(misrecognition)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get the confidence boost for G3/GhostQuant-related terms
 * Higher values indicate stronger bias toward G3 interpretation
 * @param text - Text to evaluate
 * @returns Confidence boost value (0-1)
 */
export function getGhostQuantConfidenceBoost(text: string): number {
  if (!text) return 0;
  
  const lowerText = text.toLowerCase();
  
  // G3 exact match gets highest boost
  if (lowerText.includes('g3') || lowerText.includes('hey g3')) {
    return 1.0;
  }
  
  // G3 variants get very high boost
  if (lowerText.includes('gee three') || lowerText.includes('gee 3') || lowerText.includes('g-3')) {
    return 0.98;
  }
  
  // GhostQuant -> G3 normalization gets high boost
  if (lowerText.includes('ghostquant') || lowerText.includes('ghost quant')) {
    return 0.95;
  }
  
  // Go quant / ghost quench -> G3 normalization
  if (lowerText.includes('go quant') || lowerText.includes('ghost quench')) {
    return 0.95;
  }
  
  // Close phonetic matches get high boost
  const highConfidencePatterns = [
    'ghost kwant', 'ghostkwant',
    'ghost quont', 'ghostquont',
    'gos quant', 'gosquant',
  ];
  
  for (const pattern of highConfidencePatterns) {
    if (lowerText.includes(pattern)) {
      return 0.9;
    }
  }
  
  // Other misrecognitions get moderate boost
  for (const misrecognition of Object.keys(MISRECOGNITION_MAP)) {
    if (lowerText.includes(misrecognition)) {
      return 0.7;
    }
  }
  
  return 0;
}

export default {
  normalizeSTTOutput,
  containsGhostQuantTerm,
  getGhostQuantConfidenceBoost,
  GHOSTQUANT_BIAS_TERMS,
  G3_BIAS_TERMS,
  NORMALIZED_GHOSTQUANT,
  NORMALIZED_G3,
};
