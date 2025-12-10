/**
 * WakeWordNormalizationPipeline - Integration layer for STT normalization
 * Combines STTNormalizer, WakeAliasMap, and PhoneticReranker into a single pipeline
 * 
 * This module provides a unified interface for processing STT output
 * without modifying any existing Copilot logic.
 * 
 * Pipeline order:
 * 1. PhoneticReranker - Replace "google" with "GhostQuant" if phonetics match
 * 2. STTNormalizer - Apply bias dictionary corrections
 * 3. WakeAliasMap - Normalize wake phrase aliases
 */

import { normalizeSTTOutput, containsGhostQuantTerm, getGhostQuantConfidenceBoost } from './STTNormalizer';
import { matchesWakeAlias, normalizeWakePhrase, extractQueryAfterWakeAlias, getWakeAliasConfidence, isGoogleMisrecognition, CANONICAL_WAKE_PHRASE } from './WakeAliasMap';
import { rerankSTTOutput, fullRerankPipeline, getPhoneticAnalysis } from './PhoneticReranker';

export interface NormalizationResult {
  original: string;
  normalized: string;
  wasModified: boolean;
  containsWakeWord: boolean;
  wakeWordConfidence: number;
  queryAfterWake: string;
  stages: {
    afterPhoneticRerank: string;
    afterSTTNormalize: string;
    afterWakeAliasNormalize: string;
  };
}

/**
 * Full normalization pipeline for STT output
 * Processes text through all three normalization stages
 * @param text - Raw STT transcript
 * @returns Fully normalized result with metadata
 */
export function normalizeTranscript(text: string): NormalizationResult {
  if (!text) {
    return {
      original: text,
      normalized: text,
      wasModified: false,
      containsWakeWord: false,
      wakeWordConfidence: 0,
      queryAfterWake: '',
      stages: {
        afterPhoneticRerank: text,
        afterSTTNormalize: text,
        afterWakeAliasNormalize: text,
      },
    };
  }

  // Stage 1: Phonetic reranking (google → GhostQuant)
  const rerankResult = rerankSTTOutput(text);
  const afterPhoneticRerank = rerankResult.text;

  // Stage 2: STT normalization (bias dictionary)
  const afterSTTNormalize = normalizeSTTOutput(afterPhoneticRerank);

  // Stage 3: Wake alias normalization
  const afterWakeAliasNormalize = normalizeWakePhrase(afterSTTNormalize);

  // Calculate final confidence
  const wakeAliasConfidence = getWakeAliasConfidence(afterWakeAliasNormalize);
  const ghostQuantConfidence = getGhostQuantConfidenceBoost(afterWakeAliasNormalize);
  const wakeWordConfidence = Math.max(wakeAliasConfidence, ghostQuantConfidence, rerankResult.confidence);

  // Check if wake word is present
  const containsWakeWord = matchesWakeAlias(afterWakeAliasNormalize) || 
                           containsGhostQuantTerm(afterWakeAliasNormalize);

  // Extract query after wake word
  const queryAfterWake = extractQueryAfterWakeAlias(afterWakeAliasNormalize);

  return {
    original: text,
    normalized: afterWakeAliasNormalize,
    wasModified: afterWakeAliasNormalize !== text,
    containsWakeWord,
    wakeWordConfidence,
    queryAfterWake,
    stages: {
      afterPhoneticRerank,
      afterSTTNormalize,
      afterWakeAliasNormalize,
    },
  };
}

/**
 * Quick check if text should trigger wake word activation
 * Uses all normalization layers to detect wake words
 * @param text - Raw STT transcript
 * @returns True if wake word detected (including aliases and misrecognitions)
 */
export function shouldActivateWakeWord(text: string): boolean {
  if (!text) return false;

  // Quick check for obvious matches first
  const lowerText = text.toLowerCase();
  if (lowerText.includes('ghostquant') || lowerText.includes('ghost quant')) {
    return true;
  }

  // Check for Google misrecognition (very common)
  if (isGoogleMisrecognition(text)) {
    return true;
  }

  // Check wake aliases
  if (matchesWakeAlias(text)) {
    return true;
  }

  // Full normalization check
  const result = normalizeTranscript(text);
  return result.containsWakeWord;
}

/**
 * Get the normalized wake phrase and query
 * @param text - Raw STT transcript
 * @returns Object with normalized wake phrase and query
 */
export function getWakeWordAndQuery(text: string): {
  hasWakeWord: boolean;
  wakePhrase: string;
  query: string;
  confidence: number;
} {
  const result = normalizeTranscript(text);

  return {
    hasWakeWord: result.containsWakeWord,
    wakePhrase: result.containsWakeWord ? CANONICAL_WAKE_PHRASE : '',
    query: result.queryAfterWake,
    confidence: result.wakeWordConfidence,
  };
}

/**
 * Check if intent can be detected from the query
 * Returns true if there's meaningful content after the wake word
 * @param text - Raw STT transcript
 * @returns True if intent is detectable
 */
export function hasDetectableIntent(text: string): boolean {
  const result = normalizeTranscript(text);
  
  // If there's a query after the wake word, intent is detectable
  if (result.queryAfterWake && result.queryAfterWake.trim().length > 0) {
    return true;
  }

  // If wake word was detected but no query, check if the full text has content
  if (result.containsWakeWord) {
    // Remove wake word patterns and check for remaining content
    const withoutWake = result.normalized
      .replace(/hey ghostquant/gi, '')
      .replace(/ok ghostquant/gi, '')
      .replace(/ghostquant/gi, '')
      .trim();
    
    return withoutWake.length > 0;
  }

  return false;
}

/**
 * Debug function to trace normalization pipeline
 * @param text - Raw STT transcript
 * @returns Detailed trace of all normalization stages
 */
export function traceNormalization(text: string): {
  input: string;
  stages: Array<{
    name: string;
    input: string;
    output: string;
    changed: boolean;
  }>;
  finalOutput: string;
  phoneticAnalysis: ReturnType<typeof getPhoneticAnalysis> | null;
} {
  const stages: Array<{
    name: string;
    input: string;
    output: string;
    changed: boolean;
  }> = [];

  // Stage 1: Phonetic reranking
  const rerankResult = rerankSTTOutput(text);
  stages.push({
    name: 'PhoneticReranker',
    input: text,
    output: rerankResult.text,
    changed: rerankResult.wasReranked,
  });

  // Stage 2: STT normalization
  const afterSTT = normalizeSTTOutput(rerankResult.text);
  stages.push({
    name: 'STTNormalizer',
    input: rerankResult.text,
    output: afterSTT,
    changed: afterSTT !== rerankResult.text,
  });

  // Stage 3: Wake alias normalization
  const afterWake = normalizeWakePhrase(afterSTT);
  stages.push({
    name: 'WakeAliasMap',
    input: afterSTT,
    output: afterWake,
    changed: afterWake !== afterSTT,
  });

  // Get phonetic analysis if text contains potential misrecognitions
  const phoneticAnalysis = text.toLowerCase().includes('google') 
    ? getPhoneticAnalysis(text) 
    : null;

  return {
    input: text,
    stages,
    finalOutput: afterWake,
    phoneticAnalysis,
  };
}

// Re-export individual module functions for direct access
export { 
  normalizeSTTOutput, 
  containsGhostQuantTerm, 
  getGhostQuantConfidenceBoost 
} from './STTNormalizer';

export { 
  matchesWakeAlias, 
  normalizeWakePhrase, 
  extractQueryAfterWakeAlias, 
  getWakeAliasConfidence, 
  isGoogleMisrecognition,
  CANONICAL_WAKE_PHRASE,
  WAKE_ALIASES,
} from './WakeAliasMap';

export { 
  rerankSTTOutput, 
  fullRerankPipeline, 
  getPhoneticAnalysis 
} from './PhoneticReranker';

export default {
  normalizeTranscript,
  shouldActivateWakeWord,
  getWakeWordAndQuery,
  hasDetectableIntent,
  traceNormalization,
};
