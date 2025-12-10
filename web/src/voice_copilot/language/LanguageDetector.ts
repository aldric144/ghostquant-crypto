/**
 * LanguageDetector - Multilingual Language Detection for GhostQuant Voice Copilot
 * 
 * Detects language from text input using pattern matching and character analysis.
 * Provides confidence scoring and ISO language code mapping.
 */

// Supported languages with ISO 639-1 codes
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', direction: 'ltr' },
  es: { name: 'Spanish', nativeName: 'Espanol', direction: 'ltr' },
  fr: { name: 'French', nativeName: 'Francais', direction: 'ltr' },
  zh: { name: 'Mandarin', nativeName: '中文', direction: 'ltr' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr' },
  ja: { name: 'Japanese', nativeName: '日本語', direction: 'ltr' },
  ko: { name: 'Korean', nativeName: '한국어', direction: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
  pt: { name: 'Portuguese', nativeName: 'Portugues', direction: 'ltr' },
  de: { name: 'German', nativeName: 'Deutsch', direction: 'ltr' },
  it: { name: 'Italian', nativeName: 'Italiano', direction: 'ltr' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export interface LanguageDetectionResult {
  language: LanguageCode;
  confidence: number; // 0-1
  alternativeLanguages: { language: LanguageCode; confidence: number }[];
  detectionMethod: 'pattern' | 'character' | 'whisper' | 'fallback';
}

export interface AudioLanguageMetadata {
  whisperLanguage?: string;
  sampleRate?: number;
  duration?: number;
}

// Language-specific character ranges
const LANGUAGE_CHAR_PATTERNS: Record<string, RegExp> = {
  zh: /[\u4e00-\u9fff\u3400-\u4dbf]/g, // Chinese characters
  ja: /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/g, // Hiragana, Katakana, Kanji
  ko: /[\uac00-\ud7af\u1100-\u11ff]/g, // Korean Hangul
  ar: /[\u0600-\u06ff\u0750-\u077f]/g, // Arabic
  hi: /[\u0900-\u097f]/g, // Devanagari (Hindi)
  th: /[\u0e00-\u0e7f]/g, // Thai
  he: /[\u0590-\u05ff]/g, // Hebrew
};

// Common words/phrases for pattern-based detection
const LANGUAGE_PATTERNS: Record<LanguageCode, RegExp[]> = {
  en: [
    /\b(the|is|are|was|were|have|has|been|will|would|could|should)\b/i,
    /\b(what|where|when|why|how|who)\b/i,
    /\b(bitcoin|crypto|market|price|trading)\b/i,
  ],
  es: [
    /\b(el|la|los|las|un|una|es|son|esta|estan)\b/i,
    /\b(que|como|donde|cuando|por que|quien)\b/i,
    /\b(hola|gracias|buenos|buenas|adios)\b/i,
  ],
  fr: [
    /\b(le|la|les|un|une|est|sont|cette|ces)\b/i,
    /\b(que|comment|ou|quand|pourquoi|qui)\b/i,
    /\b(bonjour|merci|bonsoir|salut|au revoir)\b/i,
  ],
  zh: [
    /[\u4e00-\u9fff]{2,}/g, // Chinese character sequences
  ],
  hi: [
    /[\u0900-\u097f]{2,}/g, // Hindi character sequences
  ],
  ja: [
    /[\u3040-\u309f\u30a0-\u30ff]{2,}/g, // Japanese kana sequences
  ],
  ko: [
    /[\uac00-\ud7af]{2,}/g, // Korean character sequences
  ],
  ar: [
    /[\u0600-\u06ff]{2,}/g, // Arabic character sequences
    /\b(مرحبا|شكرا|كيف|ماذا|اين)\b/,
  ],
  pt: [
    /\b(o|a|os|as|um|uma|e|esta|estao)\b/i,
    /\b(que|como|onde|quando|por que|quem)\b/i,
    /\b(ola|obrigado|bom dia|boa noite)\b/i,
  ],
  de: [
    /\b(der|die|das|ein|eine|ist|sind|war|waren)\b/i,
    /\b(was|wie|wo|wann|warum|wer)\b/i,
    /\b(hallo|danke|guten tag|auf wiedersehen)\b/i,
  ],
  it: [
    /\b(il|la|lo|gli|le|un|una|e|sono|stata)\b/i,
    /\b(che|come|dove|quando|perche|chi)\b/i,
    /\b(ciao|grazie|buongiorno|arrivederci)\b/i,
  ],
};

/**
 * Detect language from text using pattern matching and character analysis
 */
export function detectLanguageFromText(text: string): LanguageDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      language: 'en',
      confidence: 0,
      alternativeLanguages: [],
      detectionMethod: 'fallback',
    };
  }

  const normalizedText = text.trim();
  const scores: Record<LanguageCode, number> = {} as Record<LanguageCode, number>;

  // Initialize scores
  for (const lang of Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[]) {
    scores[lang] = 0;
  }

  // Character-based detection (highest priority for non-Latin scripts)
  for (const [lang, pattern] of Object.entries(LANGUAGE_CHAR_PATTERNS)) {
    const matches = normalizedText.match(pattern);
    if (matches) {
      const charRatio = matches.join('').length / normalizedText.length;
      if (lang in scores) {
        scores[lang as LanguageCode] += charRatio * 100;
      }
    }
  }

  // Pattern-based detection for Latin-script languages
  for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    for (const pattern of patterns) {
      const matches = normalizedText.match(pattern);
      if (matches) {
        scores[lang as LanguageCode] += matches.length * 10;
      }
    }
  }

  // Sort languages by score
  const sortedLanguages = (Object.entries(scores) as [LanguageCode, number][])
    .sort((a, b) => b[1] - a[1])
    .filter(([, score]) => score > 0);

  // Calculate confidence
  const topScore = sortedLanguages[0]?.[1] || 0;
  const totalScore = sortedLanguages.reduce((sum, [, score]) => sum + score, 0);
  const confidence = totalScore > 0 ? Math.min(topScore / totalScore, 1) : 0;

  // Determine detection method
  const hasNonLatinChars = Object.values(LANGUAGE_CHAR_PATTERNS).some(
    (pattern) => pattern.test(normalizedText)
  );
  const detectionMethod = hasNonLatinChars ? 'character' : 'pattern';

  // If no clear winner, default to English
  if (sortedLanguages.length === 0 || confidence < 0.3) {
    return {
      language: 'en',
      confidence: 0.5,
      alternativeLanguages: [],
      detectionMethod: 'fallback',
    };
  }

  return {
    language: sortedLanguages[0][0],
    confidence,
    alternativeLanguages: sortedLanguages.slice(1, 4).map(([language, score]) => ({
      language,
      confidence: totalScore > 0 ? score / totalScore : 0,
    })),
    detectionMethod,
  };
}

/**
 * Detect language from audio metadata (Whisper hints)
 */
export function detectLanguageFromAudioMetadata(
  metadata: AudioLanguageMetadata
): LanguageDetectionResult | null {
  if (!metadata.whisperLanguage) {
    return null;
  }

  const isoCode = mapLanguageToISO(metadata.whisperLanguage);
  if (!isoCode) {
    return null;
  }

  return {
    language: isoCode,
    confidence: 0.9, // Whisper detection is generally reliable
    alternativeLanguages: [],
    detectionMethod: 'whisper',
  };
}

/**
 * Map various language identifiers to ISO 639-1 codes
 */
export function mapLanguageToISO(languageInput: string): LanguageCode | null {
  const normalized = languageInput.toLowerCase().trim();

  // Direct ISO code match
  if (normalized in SUPPORTED_LANGUAGES) {
    return normalized as LanguageCode;
  }

  // Common name mappings
  const nameToCode: Record<string, LanguageCode> = {
    english: 'en',
    spanish: 'es',
    espanol: 'es',
    french: 'fr',
    francais: 'fr',
    mandarin: 'zh',
    chinese: 'zh',
    hindi: 'hi',
    japanese: 'ja',
    korean: 'ko',
    arabic: 'ar',
    portuguese: 'pt',
    german: 'de',
    deutsch: 'de',
    italian: 'it',
    italiano: 'it',
  };

  return nameToCode[normalized] || null;
}

/**
 * Get language display name
 */
export function getLanguageDisplayName(code: LanguageCode): string {
  return SUPPORTED_LANGUAGES[code]?.name || code;
}

/**
 * Get language native name
 */
export function getLanguageNativeName(code: LanguageCode): string {
  return SUPPORTED_LANGUAGES[code]?.nativeName || code;
}

/**
 * Check if language uses RTL direction
 */
export function isRTLLanguage(code: LanguageCode): boolean {
  return SUPPORTED_LANGUAGES[code]?.direction === 'rtl';
}

/**
 * Get all supported language codes
 */
export function getSupportedLanguages(): LanguageCode[] {
  return Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[];
}

/**
 * Detect language switch commands in text
 */
export function detectLanguageSwitchCommand(text: string): LanguageCode | null {
  const switchPatterns: { pattern: RegExp; language: LanguageCode }[] = [
    // English commands
    { pattern: /switch to (english|en)\b/i, language: 'en' },
    { pattern: /switch to (spanish|espanol|es)\b/i, language: 'es' },
    { pattern: /switch to (french|francais|fr)\b/i, language: 'fr' },
    { pattern: /switch to (mandarin|chinese|zh)\b/i, language: 'zh' },
    { pattern: /switch to (hindi|hi)\b/i, language: 'hi' },
    { pattern: /switch to (japanese|ja)\b/i, language: 'ja' },
    { pattern: /switch to (korean|ko)\b/i, language: 'ko' },
    { pattern: /switch to (arabic|ar)\b/i, language: 'ar' },
    { pattern: /switch to (portuguese|pt)\b/i, language: 'pt' },
    { pattern: /switch to (german|deutsch|de)\b/i, language: 'de' },
    { pattern: /switch to (italian|italiano|it)\b/i, language: 'it' },
    // Spanish commands
    { pattern: /habla(me)? en (ingles|english)/i, language: 'en' },
    { pattern: /habla(me)? en (espanol|spanish)/i, language: 'es' },
    { pattern: /habla(me)? en (frances|french)/i, language: 'fr' },
    // French commands
    { pattern: /parle(z)?(-moi)? en (anglais|english)/i, language: 'en' },
    { pattern: /parle(z)?(-moi)? en (espagnol|spanish)/i, language: 'es' },
    { pattern: /parle(z)?(-moi)? en (francais|french)/i, language: 'fr' },
    // Generic "explain in X" pattern
    { pattern: /explain in (english|en)\b/i, language: 'en' },
    { pattern: /explain in (spanish|espanol|es)\b/i, language: 'es' },
    { pattern: /explain in (french|francais|fr)\b/i, language: 'fr' },
    { pattern: /explain in (mandarin|chinese|zh)\b/i, language: 'zh' },
    { pattern: /explain in (german|deutsch|de)\b/i, language: 'de' },
    { pattern: /explain in (italian|italiano|it)\b/i, language: 'it' },
  ];

  for (const { pattern, language } of switchPatterns) {
    if (pattern.test(text)) {
      return language;
    }
  }

  return null;
}

export default {
  detectLanguageFromText,
  detectLanguageFromAudioMetadata,
  mapLanguageToISO,
  getLanguageDisplayName,
  getLanguageNativeName,
  isRTLLanguage,
  getSupportedLanguages,
  detectLanguageSwitchCommand,
  SUPPORTED_LANGUAGES,
};
