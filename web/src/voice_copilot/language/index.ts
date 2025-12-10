/**
 * GhostQuant Voice Copilot - Multilingual Language Support
 * 
 * Barrel exports for language detection, routing, and translation modules.
 */

// Language Detector
export {
  detectLanguageFromText,
  detectLanguageFromAudioMetadata,
  mapLanguageToISO,
  getLanguageDisplayName,
  getLanguageNativeName,
  isRTLLanguage,
  getSupportedLanguages,
  detectLanguageSwitchCommand,
  SUPPORTED_LANGUAGES,
} from './LanguageDetector';
export type {
  LanguageCode,
  LanguageDetectionResult,
  AudioLanguageMetadata,
} from './LanguageDetector';

// Language Router
export {
  initializeLanguageRouter,
  getActiveLanguage,
  setActiveLanguage,
  getUserPreference,
  setUserPreference,
  routeLanguage,
  getLanguageRoutingDecision,
  updateDetectedLanguage,
  getLastDetectionResult,
  getSessionHistory,
  getMostUsedLanguage,
  resetLanguageRouter,
  getRouterState,
  hasLanguageSwitchRequest,
  getLocalizedGreeting,
} from './LanguageRouter';
export type {
  LanguageRouterState,
  LanguageRouterConfig,
} from './LanguageRouter';

// Multilingual Translator
export {
  translateText,
  translateResponse,
  getLocalizedPhrase,
  needsTranslation,
  getTranslationLanguages,
  PRESERVE_TERMS,
  LOCALIZED_PHRASES,
} from './MultilingualTranslator';
export type {
  TranslationResult,
  TranslationConfig,
} from './MultilingualTranslator';
