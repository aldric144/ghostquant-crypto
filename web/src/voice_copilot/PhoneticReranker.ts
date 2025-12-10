/**
 * PhoneticReranker - Reranking step for STT output
 * If STT output contains "google" but phonetics match "ghostquant", replace with "GhostQuant"
 * 
 * This module uses phonetic similarity algorithms to detect when "google" 
 * is likely a misrecognition of "ghostquant" and performs the replacement.
 */

// Phonetic representations of GhostQuant
// These are the phonetic patterns that could be misheard as "google"
const GHOSTQUANT_PHONETICS = [
  'gostkvant',
  'gostkvont',
  'gostkwant',
  'gostkwont',
  'goskwant',
  'goskwont',
  'gouskwant',
  'guskwant',
  'guskwont',
  'ghostkwant',
  'ghostkwont',
] as const;

// Google phonetic pattern
const GOOGLE_PHONETIC = 'gugl';

// Phonetic similarity threshold (0-1)
const PHONETIC_SIMILARITY_THRESHOLD = 0.6;

/**
 * Simple phonetic encoding (Soundex-like)
 * Converts text to a phonetic representation for comparison
 */
function toPhonetic(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/[aeiou]/g, '') // Remove vowels
    .replace(/ph/g, 'f')
    .replace(/gh/g, 'g')
    .replace(/ck/g, 'k')
    .replace(/qu/g, 'kw')
    .replace(/x/g, 'ks')
    .replace(/c/g, 'k')
    .replace(/[^a-z]/g, '') // Remove non-letters
    .replace(/(.)\1+/g, '$1'); // Remove consecutive duplicates
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate phonetic similarity between two strings (0-1)
 */
function phoneticSimilarity(a: string, b: string): number {
  const phoneticA = toPhonetic(a);
  const phoneticB = toPhonetic(b);
  
  if (phoneticA === phoneticB) return 1;
  if (phoneticA.length === 0 || phoneticB.length === 0) return 0;
  
  const distance = levenshteinDistance(phoneticA, phoneticB);
  const maxLength = Math.max(phoneticA.length, phoneticB.length);
  
  return 1 - (distance / maxLength);
}

/**
 * Check if a word phonetically matches GhostQuant
 */
function phoneticallyMatchesGhostQuant(word: string): boolean {
  const wordPhonetic = toPhonetic(word);
  
  // Check against known GhostQuant phonetic patterns
  for (const pattern of GHOSTQUANT_PHONETICS) {
    if (phoneticSimilarity(wordPhonetic, pattern) >= PHONETIC_SIMILARITY_THRESHOLD) {
      return true;
    }
  }
  
  // Direct phonetic comparison with "ghostquant"
  const ghostquantPhonetic = toPhonetic('ghostquant');
  if (phoneticSimilarity(wordPhonetic, ghostquantPhonetic) >= PHONETIC_SIMILARITY_THRESHOLD) {
    return true;
  }
  
  return false;
}

/**
 * Check if "google" in context is likely a GhostQuant misrecognition
 * Context clues: presence of wake words, crypto terms, etc.
 */
function isGoogleInGhostQuantContext(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Wake word context
  if (lowerText.includes('hey google') || lowerText.includes('ok google')) {
    return true;
  }
  
  // Crypto/trading context clues
  const cryptoTerms = [
    'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'trading',
    'whale', 'market', 'price', 'analysis', 'portfolio',
    'blockchain', 'token', 'coin', 'defi', 'nft',
    'manipulation', 'detection', 'intelligence', 'threat',
  ];
  
  for (const term of cryptoTerms) {
    if (lowerText.includes(term)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Rerank STT output: replace "google" with "GhostQuant" if phonetics match
 * @param text - STT transcript
 * @returns Reranked transcript with google→GhostQuant replacement if applicable
 */
export function rerankSTTOutput(text: string): { 
  text: string; 
  wasReranked: boolean; 
  confidence: number;
} {
  if (!text) {
    return { text, wasReranked: false, confidence: 0 };
  }
  
  const lowerText = text.toLowerCase();
  
  // Check if text contains "google"
  if (!lowerText.includes('google')) {
    return { text, wasReranked: false, confidence: 0 };
  }
  
  // Check if this is likely a GhostQuant context
  const isGhostQuantContext = isGoogleInGhostQuantContext(text);
  
  // Check phonetic similarity
  const googlePhonetic = toPhonetic('google');
  const ghostquantPhonetic = toPhonetic('ghostquant');
  const similarity = phoneticSimilarity(googlePhonetic, ghostquantPhonetic);
  
  // Calculate confidence based on context and phonetics
  let confidence = similarity;
  if (isGhostQuantContext) {
    confidence = Math.min(1, confidence + 0.3);
  }
  
  // If confidence is high enough, perform replacement
  if (confidence >= PHONETIC_SIMILARITY_THRESHOLD || isGhostQuantContext) {
    // Replace "google" with "GhostQuant" preserving case patterns
    let rerankedText = text;
    
    // Handle "hey google" → "Hey GhostQuant"
    rerankedText = rerankedText.replace(/hey google/gi, 'Hey GhostQuant');
    
    // Handle "ok google" → "OK GhostQuant"
    rerankedText = rerankedText.replace(/ok google/gi, 'OK GhostQuant');
    rerankedText = rerankedText.replace(/okay google/gi, 'OK GhostQuant');
    
    // Handle standalone "google" → "GhostQuant"
    rerankedText = rerankedText.replace(/\bgoogle\b/gi, 'GhostQuant');
    
    return {
      text: rerankedText,
      wasReranked: rerankedText !== text,
      confidence,
    };
  }
  
  return { text, wasReranked: false, confidence };
}

/**
 * Get phonetic analysis for debugging/logging
 */
export function getPhoneticAnalysis(text: string): {
  original: string;
  phonetic: string;
  ghostquantSimilarity: number;
  googleSimilarity: number;
  likelyGhostQuant: boolean;
} {
  const phonetic = toPhonetic(text);
  const ghostquantPhonetic = toPhonetic('ghostquant');
  const googlePhonetic = toPhonetic('google');
  
  const ghostquantSimilarity = phoneticSimilarity(phonetic, ghostquantPhonetic);
  const googleSimilarity = phoneticSimilarity(phonetic, googlePhonetic);
  
  return {
    original: text,
    phonetic,
    ghostquantSimilarity,
    googleSimilarity,
    likelyGhostQuant: ghostquantSimilarity > googleSimilarity,
  };
}

/**
 * Full reranking pipeline: normalize, check phonetics, and rerank
 * @param text - Raw STT transcript
 * @returns Fully processed transcript
 */
export function fullRerankPipeline(text: string): {
  original: string;
  reranked: string;
  wasModified: boolean;
  confidence: number;
  analysis: ReturnType<typeof getPhoneticAnalysis> | null;
} {
  if (!text) {
    return {
      original: text,
      reranked: text,
      wasModified: false,
      confidence: 0,
      analysis: null,
    };
  }
  
  const result = rerankSTTOutput(text);
  
  // Get analysis if text was modified
  const analysis = result.wasReranked ? getPhoneticAnalysis(text) : null;
  
  return {
    original: text,
    reranked: result.text,
    wasModified: result.wasReranked,
    confidence: result.confidence,
    analysis,
  };
}

export default {
  rerankSTTOutput,
  getPhoneticAnalysis,
  fullRerankPipeline,
  PHONETIC_SIMILARITY_THRESHOLD,
};
