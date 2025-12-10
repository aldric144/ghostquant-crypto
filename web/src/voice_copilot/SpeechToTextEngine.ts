/**
 * SpeechToTextEngine - Handles speech recognition using Web Speech API
 * Provides both one-shot and continuous listening modes
 * 
 * Multilingual Support:
 * - Accepts language codes (ISO 639-1) or 'auto' for auto-detection
 * - Stores detected language in session context
 * - Integrates with LanguageDetector for post-processing
 */

import { detectLanguageFromText, type LanguageCode } from './language/LanguageDetector';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export interface SpeechToTextCallbacks {
  onTranscript: (text: string, isFinal: boolean, detectedLanguage?: LanguageCode) => void;
  onError: (error: string) => void;
  onEnd: () => void;
  onStart: () => void;
  onLanguageDetected?: (language: LanguageCode, confidence: number) => void;
}

// Language code to BCP 47 mapping for Web Speech API
const LANGUAGE_TO_BCP47: Record<LanguageCode | 'auto', string> = {
  auto: '', // Empty string for auto-detection
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  zh: 'zh-CN',
  hi: 'hi-IN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  ar: 'ar-SA',
  pt: 'pt-BR',
  de: 'de-DE',
  it: 'it-IT',
};

export interface SpeechToTextEngine {
  supported: boolean;
  isListening: boolean;
  currentLanguage: LanguageCode | 'auto';
  detectedLanguage: LanguageCode | null;
  startOnce: (language?: LanguageCode | 'auto') => void;
  startContinuous: (language?: LanguageCode | 'auto') => void;
  stop: () => void;
  setCallbacks: (callbacks: Partial<SpeechToTextCallbacks>) => void;
  setLanguage: (language: LanguageCode | 'auto') => void;
}

// Check for browser support
const getSpeechRecognition = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') return null;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionAPI = (window as any).SpeechRecognition || 
                               (window as any).webkitSpeechRecognition;
  return SpeechRecognitionAPI || null;
};

export function createSpeechToTextEngine(): SpeechToTextEngine {
  const SpeechRecognitionAPI = getSpeechRecognition();
  const supported = SpeechRecognitionAPI !== null;
  
  let recognition: SpeechRecognitionInstance | null = null;
  let isListening = false;
  let isContinuousMode = false;
  let currentLanguage: LanguageCode | 'auto' = 'auto';
  let detectedLanguage: LanguageCode | null = null;
  
  let callbacks: SpeechToTextCallbacks = {
    onTranscript: () => {},
    onError: () => {},
    onEnd: () => {},
    onStart: () => {},
  };

  // Get BCP 47 language code for Web Speech API
  const getBCP47Language = (lang: LanguageCode | 'auto'): string => {
    if (lang === 'auto') {
      // Default to English for auto-detection, will detect from transcript
      return 'en-US';
    }
    return LANGUAGE_TO_BCP47[lang] || 'en-US';
  };

  const initRecognition = (continuous: boolean, language: LanguageCode | 'auto') => {
    if (!SpeechRecognitionAPI) return null;
    
    const rec = new SpeechRecognitionAPI();
    rec.continuous = continuous;
    rec.interimResults = true;
    rec.lang = getBCP47Language(language);
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      isListening = true;
      callbacks.onStart();
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Detect language from transcript if in auto mode
      let transcriptLanguage: LanguageCode | undefined;
      if (currentLanguage === 'auto' && finalTranscript) {
        const detection = detectLanguageFromText(finalTranscript);
        if (detection.confidence >= 0.5) {
          transcriptLanguage = detection.language;
          detectedLanguage = detection.language;
          callbacks.onLanguageDetected?.(detection.language, detection.confidence);
        }
      } else if (currentLanguage !== 'auto') {
        transcriptLanguage = currentLanguage;
      }

      if (finalTranscript) {
        callbacks.onTranscript(finalTranscript.trim(), true, transcriptLanguage);
      } else if (interimTranscript) {
        callbacks.onTranscript(interimTranscript.trim(), false, transcriptLanguage);
      }
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Don't report 'no-speech' as an error in continuous mode
      if (event.error === 'no-speech' && isContinuousMode) {
        return;
      }
      callbacks.onError(event.error);
    };

    rec.onend = () => {
      isListening = false;
      callbacks.onEnd();
      
      // Auto-restart in continuous mode
      if (isContinuousMode && recognition) {
        try {
          recognition.start();
        } catch {
          // Ignore errors on restart
        }
      }
    };

    return rec;
  };

  return {
    get supported() {
      return supported;
    },
    
    get isListening() {
      return isListening;
    },

    get currentLanguage() {
      return currentLanguage;
    },

    get detectedLanguage() {
      return detectedLanguage;
    },

    setCallbacks(newCallbacks: Partial<SpeechToTextCallbacks>) {
      callbacks = { ...callbacks, ...newCallbacks };
    },

    setLanguage(language: LanguageCode | 'auto') {
      currentLanguage = language;
      // If currently listening, restart with new language
      if (isListening && recognition) {
        const wasContinuous = isContinuousMode;
        try {
          recognition.stop();
        } catch {
          // Ignore
        }
        recognition = initRecognition(wasContinuous, language);
        if (recognition) {
          try {
            recognition.start();
          } catch {
            // Ignore
          }
        }
      }
    },

    startOnce(language?: LanguageCode | 'auto') {
      if (!supported) {
        callbacks.onError('Speech recognition not supported in this browser');
        return;
      }

      // Update language if provided
      if (language !== undefined) {
        currentLanguage = language;
      }

      // Stop any existing recognition
      if (recognition) {
        try {
          recognition.stop();
        } catch {
          // Ignore
        }
      }

      isContinuousMode = false;
      recognition = initRecognition(false, currentLanguage);
      
      if (recognition) {
        try {
          recognition.start();
        } catch (e) {
          callbacks.onError('Failed to start speech recognition');
        }
      }
    },

    startContinuous(language?: LanguageCode | 'auto') {
      if (!supported) {
        callbacks.onError('Speech recognition not supported in this browser');
        return;
      }

      // Update language if provided
      if (language !== undefined) {
        currentLanguage = language;
      }

      // Stop any existing recognition
      if (recognition) {
        try {
          recognition.stop();
        } catch {
          // Ignore
        }
      }

      isContinuousMode = true;
      recognition = initRecognition(true, currentLanguage);
      
      if (recognition) {
        try {
          recognition.start();
        } catch (e) {
          callbacks.onError('Failed to start continuous speech recognition');
        }
      }
    },

    stop() {
      isContinuousMode = false;
      if (recognition) {
        try {
          recognition.stop();
        } catch {
          // Ignore
        }
        recognition = null;
      }
      isListening = false;
    },
  };
}

export default createSpeechToTextEngine;
