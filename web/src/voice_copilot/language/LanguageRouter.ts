/**
 * LanguageRouter - Multilingual Response Routing for GhostQuant Voice Copilot
 * 
 * Decides which language GhostQuant should respond in based on:
 * 1. User preference (explicit setting)
 * 2. Detected language (from input)
 * 3. English fallback (default)
 * 
 * Handles language switch commands and maintains session language state.
 */

import {
  detectLanguageFromText,
  detectLanguageSwitchCommand,
  mapLanguageToISO,
  SUPPORTED_LANGUAGES,
  type LanguageCode,
  type LanguageDetectionResult,
} from './LanguageDetector';

export interface LanguageRouterState {
  userPreference: LanguageCode | 'auto';
  detectedLanguage: LanguageCode | null;
  activeLanguage: LanguageCode;
  lastDetectionResult: LanguageDetectionResult | null;
  sessionHistory: { language: LanguageCode; timestamp: number }[];
}

export interface LanguageRouterConfig {
  defaultLanguage?: LanguageCode;
  autoDetectEnabled?: boolean;
  persistPreference?: boolean;
}

// Global router state
let routerState: LanguageRouterState = {
  userPreference: 'auto',
  detectedLanguage: null,
  activeLanguage: 'en',
  lastDetectionResult: null,
  sessionHistory: [],
};

// Storage key for persisting preference
const STORAGE_KEY = 'ghostquant_language_preference';

/**
 * Initialize the language router
 */
export function initializeLanguageRouter(config?: LanguageRouterConfig): void {
  const defaultLang = config?.defaultLanguage || 'en';
  
  // Try to load persisted preference
  if (config?.persistPreference !== false && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.userPreference) {
          routerState.userPreference = parsed.userPreference;
        }
      }
    } catch (e) {
      console.warn('[LanguageRouter] Failed to load persisted preference:', e);
    }
  }

  // Set active language based on preference
  if (routerState.userPreference !== 'auto') {
    routerState.activeLanguage = routerState.userPreference;
  } else {
    routerState.activeLanguage = defaultLang;
  }

  console.log(`[LanguageRouter] Initialized with active language: ${routerState.activeLanguage}`);
}

/**
 * Get the current active language for responses
 */
export function getActiveLanguage(): LanguageCode {
  return routerState.activeLanguage;
}

/**
 * Set the active language explicitly
 */
export function setActiveLanguage(language: LanguageCode | 'auto'): void {
  if (language === 'auto') {
    routerState.userPreference = 'auto';
    // Use detected language or fallback to English
    routerState.activeLanguage = routerState.detectedLanguage || 'en';
  } else if (language in SUPPORTED_LANGUAGES) {
    routerState.userPreference = language;
    routerState.activeLanguage = language;
  } else {
    console.warn(`[LanguageRouter] Unsupported language: ${language}`);
    return;
  }

  // Record in session history
  routerState.sessionHistory.push({
    language: routerState.activeLanguage,
    timestamp: Date.now(),
  });

  // Persist preference
  persistPreference();

  console.log(`[LanguageRouter] Active language set to: ${routerState.activeLanguage}`);
}

/**
 * Get the user's language preference
 */
export function getUserPreference(): LanguageCode | 'auto' {
  return routerState.userPreference;
}

/**
 * Set user language preference
 */
export function setUserPreference(preference: LanguageCode | 'auto'): void {
  routerState.userPreference = preference;
  
  if (preference !== 'auto') {
    routerState.activeLanguage = preference;
  }
  
  persistPreference();
}

/**
 * Process input text and determine response language
 * Returns the language that should be used for the response
 */
export function routeLanguage(inputText: string): LanguageCode {
  // Check for explicit language switch command
  const switchCommand = detectLanguageSwitchCommand(inputText);
  if (switchCommand) {
    setActiveLanguage(switchCommand);
    return switchCommand;
  }

  // If user has explicit preference (not auto), use it
  if (routerState.userPreference !== 'auto') {
    return routerState.userPreference;
  }

  // Auto-detect language from input
  const detection = detectLanguageFromText(inputText);
  routerState.lastDetectionResult = detection;

  // Only use detected language if confidence is high enough
  if (detection.confidence >= 0.6) {
    routerState.detectedLanguage = detection.language;
    routerState.activeLanguage = detection.language;
    
    // Record in session history
    routerState.sessionHistory.push({
      language: detection.language,
      timestamp: Date.now(),
    });

    return detection.language;
  }

  // Fallback to current active language or English
  return routerState.activeLanguage || 'en';
}

/**
 * Get the language routing decision with full context
 */
export function getLanguageRoutingDecision(inputText: string): {
  responseLanguage: LanguageCode;
  reason: 'user_preference' | 'switch_command' | 'auto_detected' | 'fallback';
  confidence: number;
  detectionResult: LanguageDetectionResult | null;
} {
  // Check for explicit language switch command
  const switchCommand = detectLanguageSwitchCommand(inputText);
  if (switchCommand) {
    setActiveLanguage(switchCommand);
    return {
      responseLanguage: switchCommand,
      reason: 'switch_command',
      confidence: 1.0,
      detectionResult: null,
    };
  }

  // If user has explicit preference (not auto), use it
  if (routerState.userPreference !== 'auto') {
    return {
      responseLanguage: routerState.userPreference,
      reason: 'user_preference',
      confidence: 1.0,
      detectionResult: null,
    };
  }

  // Auto-detect language from input
  const detection = detectLanguageFromText(inputText);
  routerState.lastDetectionResult = detection;

  // Only use detected language if confidence is high enough
  if (detection.confidence >= 0.6) {
    routerState.detectedLanguage = detection.language;
    routerState.activeLanguage = detection.language;
    
    return {
      responseLanguage: detection.language,
      reason: 'auto_detected',
      confidence: detection.confidence,
      detectionResult: detection,
    };
  }

  // Fallback
  return {
    responseLanguage: routerState.activeLanguage || 'en',
    reason: 'fallback',
    confidence: 0.5,
    detectionResult: detection,
  };
}

/**
 * Update detected language from external source (e.g., Whisper)
 */
export function updateDetectedLanguage(language: LanguageCode, confidence: number): void {
  routerState.detectedLanguage = language;
  routerState.lastDetectionResult = {
    language,
    confidence,
    alternativeLanguages: [],
    detectionMethod: 'whisper',
  };

  // If in auto mode, update active language
  if (routerState.userPreference === 'auto' && confidence >= 0.6) {
    routerState.activeLanguage = language;
  }
}

/**
 * Get the last detection result
 */
export function getLastDetectionResult(): LanguageDetectionResult | null {
  return routerState.lastDetectionResult;
}

/**
 * Get session language history
 */
export function getSessionHistory(): { language: LanguageCode; timestamp: number }[] {
  return [...routerState.sessionHistory];
}

/**
 * Get the most frequently used language in the session
 */
export function getMostUsedLanguage(): LanguageCode {
  const counts: Record<LanguageCode, number> = {} as Record<LanguageCode, number>;
  
  for (const entry of routerState.sessionHistory) {
    counts[entry.language] = (counts[entry.language] || 0) + 1;
  }

  let maxCount = 0;
  let mostUsed: LanguageCode = 'en';
  
  for (const [lang, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      mostUsed = lang as LanguageCode;
    }
  }

  return mostUsed;
}

/**
 * Reset router state
 */
export function resetLanguageRouter(): void {
  routerState = {
    userPreference: 'auto',
    detectedLanguage: null,
    activeLanguage: 'en',
    lastDetectionResult: null,
    sessionHistory: [],
  };
}

/**
 * Get full router state (for debugging)
 */
export function getRouterState(): LanguageRouterState {
  return { ...routerState };
}

/**
 * Persist preference to localStorage
 */
function persistPreference(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      userPreference: routerState.userPreference,
      activeLanguage: routerState.activeLanguage,
    }));
  } catch (e) {
    console.warn('[LanguageRouter] Failed to persist preference:', e);
  }
}

/**
 * Check if a language switch was requested in the text
 */
export function hasLanguageSwitchRequest(text: string): boolean {
  return detectLanguageSwitchCommand(text) !== null;
}

/**
 * Get language-specific greeting
 */
export function getLocalizedGreeting(language?: LanguageCode): string {
  const lang = language || routerState.activeLanguage;
  
  const greetings: Record<LanguageCode, string> = {
    en: "Hello! I'm GhostQuant, your AI trading assistant.",
    es: "Hola! Soy GhostQuant, tu asistente de trading con IA.",
    fr: "Bonjour! Je suis GhostQuant, votre assistant de trading IA.",
    zh: "你好！我是GhostQuant，您的AI交易助手。",
    hi: "नमस्ते! मैं GhostQuant हूं, आपका AI ट्रेडिंग सहायक।",
    ja: "こんにちは！私はGhostQuant、あなたのAIトレーディングアシスタントです。",
    ko: "안녕하세요! 저는 GhostQuant, 당신의 AI 트레이딩 어시스턴트입니다.",
    ar: "مرحبا! أنا GhostQuant، مساعدك للتداول بالذكاء الاصطناعي.",
    pt: "Ola! Sou o GhostQuant, seu assistente de trading com IA.",
    de: "Hallo! Ich bin GhostQuant, Ihr KI-Trading-Assistent.",
    it: "Ciao! Sono GhostQuant, il tuo assistente di trading AI.",
  };

  return greetings[lang] || greetings.en;
}

// Initialize on module load
initializeLanguageRouter();

export default {
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
};
