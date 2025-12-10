/**
 * STTNormalizer - Speech Recognition Bias Dictionary
 * Forces preferred matches for GhostQuant-related terms over common misrecognitions
 * 
 * This module normalizes STT output to correct common misrecognitions
 * without modifying the underlying speech recognition engine.
 */

// Speech Recognition Bias Dictionary
// These terms should be forced as preferred matches over "Google" and other misrecognitions
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
] as const;

// Normalized form for all bias terms
export const NORMALIZED_GHOSTQUANT = 'GhostQuant';

// Common misrecognitions that should be normalized to GhostQuant
const MISRECOGNITION_MAP: Record<string, string> = {
  // Direct misrecognitions
  'ghostkwont': 'GhostQuant',
  'ghost kwont': 'GhostQuant',
  'gos quant': 'GhostQuant',
  'gosquant': 'GhostQuant',
  'gusquant': 'GhostQuant',
  'gus quant': 'GhostQuant',
  'ghost kwant': 'GhostQuant',
  'ghostkwant': 'GhostQuant',
  'ghost quont': 'GhostQuant',
  'ghostquont': 'GhostQuant',
  'ghost count': 'GhostQuant',
  'ghostcount': 'GhostQuant',
  'ghost cant': 'GhostQuant',
  'ghostcant': 'GhostQuant',
  'ghost want': 'GhostQuant',
  'ghostwant': 'GhostQuant',
  'goose quant': 'GhostQuant',
  'goosequant': 'GhostQuant',
  'goost quant': 'GhostQuant',
  'goostquant': 'GhostQuant',
  'gose quant': 'GhostQuant',
  'gosequant': 'GhostQuant',
  'ghost quan': 'GhostQuant',
  'ghostquan': 'GhostQuant',
  'ghost quand': 'GhostQuant',
  'ghostquand': 'GhostQuant',
  'ghost client': 'GhostQuant',
  'ghostclient': 'GhostQuant',
  'ghost point': 'GhostQuant',
  'ghostpoint': 'GhostQuant',
  
  // Additional phonetic variants
  'goast quant': 'GhostQuant',
  'goastquant': 'GhostQuant',
  'ghost quench': 'GhostQuant',
  'ghostquench': 'GhostQuant',
  'ghost quint': 'GhostQuant',
  'ghostquint': 'GhostQuant',
  'ghost quinch': 'GhostQuant',
  'ghostquinch': 'GhostQuant',
  
  // Spacing variations
  'ghost quant': 'GhostQuant',
  'ghostquant': 'GhostQuant',
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
 * @returns Normalized transcript with GhostQuant corrections
 */
export function normalizeSTTOutput(text: string): string {
  if (!text) return text;
  
  let normalized = text;
  const lowerText = text.toLowerCase();
  
  // Check for direct misrecognitions and replace
  for (const [misrecognition, correction] of Object.entries(MISRECOGNITION_MAP)) {
    const regex = new RegExp(misrecognition, 'gi');
    if (regex.test(normalized)) {
      normalized = normalized.replace(regex, correction);
    }
  }
  
  // Normalize prefix + GhostQuant patterns
  for (const [prefix, normalizedPrefix] of Object.entries(PREFIX_NORMALIZATIONS)) {
    const pattern = new RegExp(`\\b${prefix}\\s+(ghost\\s*quant|ghostquant)\\b`, 'gi');
    if (pattern.test(normalized)) {
      normalized = normalized.replace(pattern, `${normalizedPrefix} GhostQuant`);
    }
  }
  
  // Final pass: ensure consistent casing for GhostQuant
  normalized = normalized.replace(/ghost\s*quant/gi, 'GhostQuant');
  
  return normalized;
}

/**
 * Check if text contains any GhostQuant-related terms (including misrecognitions)
 * @param text - Text to check
 * @returns True if text contains GhostQuant or a known misrecognition
 */
export function containsGhostQuantTerm(text: string): boolean {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  // Check for direct GhostQuant
  if (lowerText.includes('ghostquant') || lowerText.includes('ghost quant')) {
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
 * Get the confidence boost for GhostQuant-related terms
 * Higher values indicate stronger bias toward GhostQuant interpretation
 * @param text - Text to evaluate
 * @returns Confidence boost value (0-1)
 */
export function getGhostQuantConfidenceBoost(text: string): number {
  if (!text) return 0;
  
  const lowerText = text.toLowerCase();
  
  // Exact match gets highest boost
  if (lowerText.includes('ghostquant') || lowerText.includes('ghost quant')) {
    return 1.0;
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
  NORMALIZED_GHOSTQUANT,
};
