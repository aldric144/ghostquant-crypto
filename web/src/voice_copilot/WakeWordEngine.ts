/**
 * WakeWordEngine - Detects wake words in speech transcripts
 * Uses transcript-based detection (not raw audio) for browser compatibility
 * Wake words: "GhostQuant", "Hey GhostQuant", "Ghost Quant"
 * 
 * Multilingual wake words supported when ENABLE_MULTILINGUAL_WAKEWORDS is true:
 * - Spanish: "Hola GhostQuant"
 * - French: "Bonjour GhostQuant"
 * - Japanese: "こんにちはゴーストクアント"
 * - Arabic: "مرحبا جوست كوانت"
 * - German: "Hallo GhostQuant"
 * - Portuguese: "Ola GhostQuant"
 * - Italian: "Ciao GhostQuant"
 * - Mandarin: "你好GhostQuant"
 * - Korean: "안녕 고스트퀀트"
 * - Hindi: "नमस्ते GhostQuant"
 */

import { createSpeechToTextEngine, SpeechToTextEngine } from './SpeechToTextEngine';
import { type LanguageCode } from './language/LanguageDetector';

export interface WakeWordCallbacks {
  onWake: (detectedLanguage?: LanguageCode) => void;
  onStatusChange: (status: WakeWordStatus) => void;
}

export type WakeWordStatus = 'disabled' | 'listening' | 'triggered' | 'unsupported';

export interface WakeWordEngine {
  supported: boolean;
  status: WakeWordStatus;
  enable: () => void;
  disable: () => void;
  setCallbacks: (callbacks: Partial<WakeWordCallbacks>) => void;
  setMultilingualEnabled: (enabled: boolean) => void;
  isMultilingualEnabled: () => boolean;
}

// English wake word patterns (always active)
const ENGLISH_WAKE_PATTERNS = [
  'ghostquant',
  'ghost quant',
  'hey ghostquant',
  'hey ghost quant',
  'heyghost quant',
  'hey ghost',
  'ok ghostquant',
  'ok ghost quant',
];

// International wake word patterns with associated language
interface MultilingualWakePattern {
  pattern: string;
  language: LanguageCode;
}

const MULTILINGUAL_WAKE_PATTERNS: MultilingualWakePattern[] = [
  // Spanish
  { pattern: 'hola ghostquant', language: 'es' },
  { pattern: 'hola ghost quant', language: 'es' },
  { pattern: 'oye ghostquant', language: 'es' },
  // French
  { pattern: 'bonjour ghostquant', language: 'fr' },
  { pattern: 'bonjour ghost quant', language: 'fr' },
  { pattern: 'salut ghostquant', language: 'fr' },
  // German
  { pattern: 'hallo ghostquant', language: 'de' },
  { pattern: 'hallo ghost quant', language: 'de' },
  // Portuguese
  { pattern: 'ola ghostquant', language: 'pt' },
  { pattern: 'ola ghost quant', language: 'pt' },
  { pattern: 'oi ghostquant', language: 'pt' },
  // Italian
  { pattern: 'ciao ghostquant', language: 'it' },
  { pattern: 'ciao ghost quant', language: 'it' },
  // Japanese (romanized and native)
  { pattern: 'konnichiwa ghostquant', language: 'ja' },
  { pattern: 'こんにちはゴーストクアント', language: 'ja' },
  { pattern: 'ゴーストクアント', language: 'ja' },
  // Korean (romanized and native)
  { pattern: 'annyeong ghostquant', language: 'ko' },
  { pattern: '안녕 고스트퀀트', language: 'ko' },
  { pattern: '고스트퀀트', language: 'ko' },
  // Mandarin (romanized and native)
  { pattern: 'nihao ghostquant', language: 'zh' },
  { pattern: '你好ghostquant', language: 'zh' },
  { pattern: '你好 ghostquant', language: 'zh' },
  // Arabic
  { pattern: 'مرحبا جوست كوانت', language: 'ar' },
  { pattern: 'مرحبا ghostquant', language: 'ar' },
  { pattern: 'marhaba ghostquant', language: 'ar' },
  // Hindi (romanized and native)
  { pattern: 'namaste ghostquant', language: 'hi' },
  { pattern: 'नमस्ते ghostquant', language: 'hi' },
  { pattern: 'नमस्ते घोस्टक्वांट', language: 'hi' },
];

// Check if multilingual wake words are enabled via environment variable
const isMultilingualEnabledByDefault = (): boolean => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NEXT_PUBLIC_ENABLE_MULTILINGUAL_WAKEWORDS === 'true' ||
           process.env.ENABLE_MULTILINGUAL_WAKEWORDS === 'true';
  }
  return true; // Default to enabled
};

// Combined wake patterns for backward compatibility
const WAKE_PATTERNS = ENGLISH_WAKE_PATTERNS;

// Normalize text for wake word matching (preserves non-Latin characters)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

// Normalize text for Latin-only matching (removes non-Latin characters)
function normalizeLatinText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

// Check if text contains an English wake word
function containsEnglishWakeWord(text: string): boolean {
  const normalized = normalizeLatinText(text);
  return ENGLISH_WAKE_PATTERNS.some(pattern => normalized.includes(pattern));
}

// Check if text contains a multilingual wake word and return the detected language
function containsMultilingualWakeWord(text: string): LanguageCode | null {
  const normalized = normalizeText(text);
  const normalizedLatin = normalizeLatinText(text);
  
  for (const { pattern, language } of MULTILINGUAL_WAKE_PATTERNS) {
    // Check both normalized versions for better matching
    if (normalized.includes(pattern) || normalizedLatin.includes(pattern)) {
      return language;
    }
  }
  return null;
}

// Check if text contains any wake word (English or multilingual)
function containsWakeWord(text: string, multilingualEnabled: boolean): { detected: boolean; language?: LanguageCode } {
  // Always check English patterns first
  if (containsEnglishWakeWord(text)) {
    return { detected: true, language: 'en' };
  }
  
  // Check multilingual patterns if enabled
  if (multilingualEnabled) {
    const detectedLang = containsMultilingualWakeWord(text);
    if (detectedLang) {
      return { detected: true, language: detectedLang };
    }
  }
  
  return { detected: false };
}

// Extract the query after the wake word
export function extractQueryAfterWakeWord(text: string, multilingualEnabled: boolean = true): string {
  const normalized = normalizeText(text);
  const normalizedLatin = normalizeLatinText(text);
  
  // Check English patterns first
  for (const pattern of ENGLISH_WAKE_PATTERNS) {
    const index = normalizedLatin.indexOf(pattern);
    if (index !== -1) {
      const afterWake = normalizedLatin.substring(index + pattern.length).trim();
      if (afterWake.length > 0) {
        return afterWake;
      }
    }
  }
  
  // Check multilingual patterns if enabled
  if (multilingualEnabled) {
    for (const { pattern } of MULTILINGUAL_WAKE_PATTERNS) {
      const index = normalized.indexOf(pattern);
      if (index !== -1) {
        const afterWake = normalized.substring(index + pattern.length).trim();
        if (afterWake.length > 0) {
          return afterWake;
        }
      }
    }
  }
  
  return '';
}

export function createWakeWordEngine(): WakeWordEngine {
  let sttEngine: SpeechToTextEngine | null = null;
  let status: WakeWordStatus = 'disabled';
  let recentTranscripts: string[] = [];
  let lastWakeTime = 0;
  let multilingualEnabled = isMultilingualEnabledByDefault();
  const WAKE_COOLDOWN = 3000; // 3 seconds cooldown between wake detections
  
  let callbacks: WakeWordCallbacks = {
    onWake: () => {},
    onStatusChange: () => {},
  };

  const setStatus = (newStatus: WakeWordStatus) => {
    status = newStatus;
    callbacks.onStatusChange(status);
  };

  const checkForWakeWord = (transcript: string) => {
    // Add to recent transcripts buffer
    recentTranscripts.push(transcript);
    if (recentTranscripts.length > 5) {
      recentTranscripts.shift();
    }

    // Check combined recent transcripts for wake word
    const combinedText = recentTranscripts.join(' ');
    
    const wakeResult = containsWakeWord(combinedText, multilingualEnabled);
    if (wakeResult.detected) {
      const now = Date.now();
      if (now - lastWakeTime > WAKE_COOLDOWN) {
        lastWakeTime = now;
        setStatus('triggered');
        callbacks.onWake(wakeResult.language);
        
        // Clear buffer after wake detection
        recentTranscripts = [];
        
        // Reset to listening after a short delay
        setTimeout(() => {
          if (status === 'triggered') {
            setStatus('listening');
          }
        }, 500);
      }
    }
  };

  return {
    get supported() {
      if (typeof window === 'undefined') return false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
    },

    get status() {
      return status;
    },

    setCallbacks(newCallbacks: Partial<WakeWordCallbacks>) {
      callbacks = { ...callbacks, ...newCallbacks };
    },

    setMultilingualEnabled(enabled: boolean) {
      multilingualEnabled = enabled;
    },

    isMultilingualEnabled() {
      return multilingualEnabled;
    },

    enable() {
      if (!this.supported) {
        setStatus('unsupported');
        return;
      }

      // Create STT engine for wake word detection
      sttEngine = createSpeechToTextEngine();
      
      if (!sttEngine.supported) {
        setStatus('unsupported');
        return;
      }

      sttEngine.setCallbacks({
        onTranscript: (text, isFinal) => {
          if (isFinal) {
            checkForWakeWord(text);
          }
        },
        onError: (error) => {
          // Silently handle errors in wake word mode
          // 'no-speech' and 'aborted' are common and expected
          if (error !== 'no-speech' && error !== 'aborted') {
            console.warn('[WakeWordEngine] Error:', error);
          }
        },
        onEnd: () => {
          // Will auto-restart in continuous mode
        },
        onStart: () => {
          setStatus('listening');
        },
      });

      sttEngine.startContinuous();
    },

    disable() {
      if (sttEngine) {
        sttEngine.stop();
        sttEngine = null;
      }
      recentTranscripts = [];
      setStatus('disabled');
    },
  };
}

export default createWakeWordEngine;
