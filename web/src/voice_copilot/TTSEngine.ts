/**
 * TTSEngine - Unified Text-to-Speech Engine for GhostQuant Voice Copilot
 * 
 * Supports multiple TTS providers with automatic fallback:
 * 1. ElevenLabs (Primary) - Ultra-natural male voice (Adam) with multilingual support
 * 2. OpenAI (Secondary) - Natural expressive voice (Alloy) with multilingual support
 * 3. Browser TTS (Fallback) - Built-in speech synthesis with language selection
 * 
 * Provider selection via TTS_PROVIDER environment variable.
 * Language selection via active language from LanguageRouter.
 */

import { speakWithElevenLabs, isElevenLabsAvailable, stopCurrentAudio as stopElevenLabs, type VoiceMode, VOICE_MODES } from './ElevenLabsTTS';
import { speakWithOpenAIVoice, isOpenAITTSAvailable, stopCurrentAudio as stopOpenAI } from './OpenAITTS';
import { copilotEvents } from './CopilotEvents';
import { type LanguageCode, SUPPORTED_LANGUAGES } from './language/LanguageDetector';
import { getActiveLanguage } from './language/LanguageRouter';
import { getVoiceMode, getCurrentVoiceId } from './voice/VoiceModeManager';

// TTS Provider types
export type TTSProvider = 'elevenlabs' | 'openai' | 'browser' | 'auto';

// Get configured provider from environment
// Default to 'elevenlabs' when ElevenLabs API key is available
const getConfiguredProvider = (): TTSProvider => {
  const envProvider = process.env.NEXT_PUBLIC_TTS_PROVIDER || process.env.TTS_PROVIDER;
  if (envProvider) {
    return envProvider as TTSProvider;
  }
  // Auto-select elevenlabs if API key is available, otherwise auto
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) {
    return 'elevenlabs';
  }
  return 'auto';
};

// TTS Result interface
export interface TTSResult {
  success: boolean;
  provider: TTSProvider;
  error?: string;
}

// TTS Engine configuration
export interface TTSEngineConfig {
  provider?: TTSProvider;
  fallbackEnabled?: boolean;
  language?: LanguageCode;
  voiceMode?: VoiceMode;
}

// Language to BCP 47 mapping for browser TTS
const LANGUAGE_TO_BCP47: Record<LanguageCode, string> = {
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

// Current active language for TTS
let currentLanguage: LanguageCode = 'en';

// Current active provider
let currentProvider: TTSProvider = 'auto';

/**
 * Initialize TTS Engine with configuration
 */
export function initializeTTSEngine(config?: TTSEngineConfig): void {
  currentProvider = config?.provider || getConfiguredProvider();
  console.log(`[TTSEngine] Initialized with provider: ${currentProvider}`);
  console.log(`[TTSEngine] env NEXT_PUBLIC_TTS_PROVIDER =`, process.env.NEXT_PUBLIC_TTS_PROVIDER);
  console.log(`[TTSEngine] isElevenLabsAvailable =`, isElevenLabsAvailable());
  console.log(`[TTSEngine] isOpenAITTSAvailable =`, isOpenAITTSAvailable());
}

/**
 * Get the best available provider
 */
function getBestProvider(): TTSProvider {
  if (currentProvider !== 'auto') {
    return currentProvider;
  }

  // Auto-select based on availability (ElevenLabs first, then OpenAI, then browser)
  if (isElevenLabsAvailable()) {
    return 'elevenlabs';
  }
  if (isOpenAITTSAvailable()) {
    return 'openai';
  }
  return 'browser';
}

/**
 * Speak text using browser's built-in TTS (fallback) with multilingual support
 */
async function speakWithBrowser(text: string, language?: LanguageCode): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('[TTSEngine] Browser speech synthesis not available');
      resolve(false);
      return;
    }

    try {
      copilotEvents.emitSpeakingStart();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Set language for the utterance
      const targetLang = language || currentLanguage;
      const bcp47Lang = LANGUAGE_TO_BCP47[targetLang] || 'en-US';
      utterance.lang = bcp47Lang;

      // Try to find a voice for the target language
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = bcp47Lang.split('-')[0];
      
      // Find voice matching the language, prefer male voices
      const preferredVoice = voices.find(v => 
        v.lang.startsWith(langPrefix) && (
          v.name.includes('Male') ||
          v.name.includes('Daniel') ||
          v.name.includes('Alex')
        )
      ) || voices.find(v => v.lang.startsWith(langPrefix)) 
        || voices.find(v => v.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        copilotEvents.emitSpeakingEnd();
        resolve(true);
      };

      utterance.onerror = (event) => {
        console.error('[TTSEngine] Browser TTS error:', event.error);
        copilotEvents.emitSpeakingEnd();
        resolve(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('[TTSEngine] Browser TTS exception:', error);
      copilotEvents.emitSpeakingEnd();
      resolve(false);
    }
  });
}

/**
 * Main speak function - routes to appropriate provider with fallback
 * Supports multilingual output via language parameter or LanguageRouter
 * 
 * @param text - Text to convert to speech
 * @param options - Optional configuration overrides including language
 * @returns Promise resolving to TTS result
 */
export async function speak(text: string, options?: TTSEngineConfig): Promise<TTSResult> {
  const requestedProvider = options?.provider || getBestProvider();
  const fallbackEnabled = options?.fallbackEnabled ?? true;
  
  // Get language from options, current setting, or LanguageRouter
  const language = options?.language || currentLanguage || getActiveLanguage();
  
  // Get voice mode from options or VoiceModeManager
  const voiceMode = options?.voiceMode || getVoiceMode();
  const voiceId = getCurrentVoiceId();

  console.log(`[TTSEngine] Speaking with provider: ${requestedProvider}, language: ${language}, voiceMode: ${voiceMode}`);

  // Track which providers have been tried
  const triedProviders = new Set<TTSProvider>();

  // Try primary provider
  let result: TTSResult;

  switch (requestedProvider) {
        case 'elevenlabs': {
          triedProviders.add('elevenlabs');
          // ElevenLabs supports multilingual via model selection
          // Pass voiceId from VoiceModeManager for dual-voice support
          const elevenResult = await speakWithElevenLabs(text, { voiceId });
          if (elevenResult.success) {
            return { success: true, provider: 'elevenlabs' };
          }
          result = { success: false, provider: 'elevenlabs', error: elevenResult.error };
          break;
        }

    case 'openai': {
      triedProviders.add('openai');
      // OpenAI TTS auto-detects language from text
      const openaiResult = await speakWithOpenAIVoice(text);
      if (openaiResult.success) {
        return { success: true, provider: 'openai' };
      }
      result = { success: false, provider: 'openai', error: openaiResult.error };
      break;
    }

    case 'browser': {
      triedProviders.add('browser');
      // Browser TTS uses explicit language setting
      const browserSuccess = await speakWithBrowser(text, language);
      return { success: browserSuccess, provider: 'browser' };
    }

    default:
      result = { success: false, provider: 'auto', error: 'Unknown provider' };
  }

  // Fallback chain if primary failed
  if (!result.success && fallbackEnabled) {
    console.log(`[TTSEngine] Primary provider failed, attempting fallback...`);
    console.log(`[TTSEngine] Primary error was:`, result.error);

        // Try ElevenLabs if not already tried (with voice mode support)
        if (!triedProviders.has('elevenlabs') && isElevenLabsAvailable()) {
          console.log(`[TTSEngine] Trying ElevenLabs fallback...`);
          const elevenResult = await speakWithElevenLabs(text, { voiceId });
          if (elevenResult.success) {
            return { success: true, provider: 'elevenlabs' };
          }
          console.log(`[TTSEngine] ElevenLabs fallback failed:`, elevenResult.error);
        }

    // Try OpenAI if not already tried
    if (!triedProviders.has('openai') && isOpenAITTSAvailable()) {
      console.log(`[TTSEngine] Trying OpenAI fallback...`);
      const openaiResult = await speakWithOpenAIVoice(text);
      if (openaiResult.success) {
        return { success: true, provider: 'openai' };
      }
      console.log(`[TTSEngine] OpenAI fallback failed:`, openaiResult.error);
    }

    // TEMPORARILY DISABLED: Browser TTS fallback
    // This is disabled to make ElevenLabs failures visible instead of silently defaulting to robot voice
    // if (!triedProviders.has('browser')) {
    //   const browserSuccess = await speakWithBrowser(text, language);
    //   if (browserSuccess) {
    //     return { success: true, provider: 'browser' };
    //   }
    // }
    console.warn(`[TTSEngine] All TTS providers failed - browser fallback is DISABLED for debugging`);
  }

  return result;
}

/**
 * Stop any currently playing audio
 */
export function stopSpeaking(): void {
  stopElevenLabs();
  stopOpenAI();
  
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  
  copilotEvents.emitSpeakingEnd();
}

/**
 * Get current TTS provider
 */
export function getCurrentProvider(): TTSProvider {
  return currentProvider;
}

/**
 * Set TTS provider
 */
export function setProvider(provider: TTSProvider): void {
  currentProvider = provider;
  console.log(`[TTSEngine] Provider set to: ${provider}`);
}

/**
 * Get available providers
 */
export function getAvailableProviders(): { provider: TTSProvider; available: boolean; name: string }[] {
  return [
    { 
      provider: 'elevenlabs', 
      available: isElevenLabsAvailable(), 
      name: 'ElevenLabs (Ultra-Natural)' 
    },
    { 
      provider: 'openai', 
      available: isOpenAITTSAvailable(), 
      name: 'OpenAI (Expressive)' 
    },
    { 
      provider: 'browser', 
      available: typeof window !== 'undefined' && 'speechSynthesis' in window, 
      name: 'Browser (Built-in)' 
    },
  ];
}

/**
 * Check if any TTS provider is available
 */
export function isTTSAvailable(): boolean {
  return isElevenLabsAvailable() || 
         isOpenAITTSAvailable() || 
         (typeof window !== 'undefined' && 'speechSynthesis' in window);
}

// Initialize on module load
initializeTTSEngine();

export default {
  speak,
  stopSpeaking,
  getCurrentProvider,
  setProvider,
  getAvailableProviders,
  isTTSAvailable,
  initializeTTSEngine,
};
