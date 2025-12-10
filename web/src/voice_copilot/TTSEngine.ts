/**
 * TTSEngine - Unified Text-to-Speech Engine for GhostQuant Voice Copilot
 * 
 * Supports multiple TTS providers with automatic fallback:
 * 1. ElevenLabs (Primary) - Ultra-natural male voice (Adam)
 * 2. OpenAI (Secondary) - Natural expressive voice (Alloy)
 * 3. Browser TTS (Fallback) - Built-in speech synthesis
 * 
 * Provider selection via TTS_PROVIDER environment variable.
 */

import { speakWithElevenLabs, isElevenLabsAvailable, stopCurrentAudio as stopElevenLabs } from './ElevenLabsTTS';
import { speakWithOpenAIVoice, isOpenAITTSAvailable, stopCurrentAudio as stopOpenAI } from './OpenAITTS';
import { copilotEvents } from './CopilotEvents';

// TTS Provider types
export type TTSProvider = 'elevenlabs' | 'openai' | 'browser' | 'auto';

// Get configured provider from environment
const getConfiguredProvider = (): TTSProvider => {
  const provider = process.env.NEXT_PUBLIC_TTS_PROVIDER || process.env.TTS_PROVIDER || 'auto';
  return provider as TTSProvider;
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
}

// Current active provider
let currentProvider: TTSProvider = 'auto';

/**
 * Initialize TTS Engine with configuration
 */
export function initializeTTSEngine(config?: TTSEngineConfig): void {
  currentProvider = config?.provider || getConfiguredProvider();
  console.log(`[TTSEngine] Initialized with provider: ${currentProvider}`);
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
 * Speak text using browser's built-in TTS (fallback)
 */
async function speakWithBrowser(text: string): Promise<boolean> {
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

      // Try to use a good male voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes('Google UK English Male') ||
        v.name.includes('Daniel') ||
        v.name.includes('Alex') ||
        v.name.includes('Male')
      ) || voices.find(v => v.lang.startsWith('en'));
      
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
 * 
 * @param text - Text to convert to speech
 * @param options - Optional configuration overrides
 * @returns Promise resolving to TTS result
 */
export async function speak(text: string, options?: TTSEngineConfig): Promise<TTSResult> {
  const requestedProvider = options?.provider || getBestProvider();
  const fallbackEnabled = options?.fallbackEnabled ?? true;

  console.log(`[TTSEngine] Speaking with provider: ${requestedProvider}`);

  // Track which providers have been tried
  const triedProviders = new Set<TTSProvider>();

  // Try primary provider
  let result: TTSResult;

  switch (requestedProvider) {
    case 'elevenlabs': {
      triedProviders.add('elevenlabs');
      const elevenResult = await speakWithElevenLabs(text);
      if (elevenResult.success) {
        return { success: true, provider: 'elevenlabs' };
      }
      result = { success: false, provider: 'elevenlabs', error: elevenResult.error };
      break;
    }

    case 'openai': {
      triedProviders.add('openai');
      const openaiResult = await speakWithOpenAIVoice(text);
      if (openaiResult.success) {
        return { success: true, provider: 'openai' };
      }
      result = { success: false, provider: 'openai', error: openaiResult.error };
      break;
    }

    case 'browser': {
      triedProviders.add('browser');
      const browserSuccess = await speakWithBrowser(text);
      return { success: browserSuccess, provider: 'browser' };
    }

    default:
      result = { success: false, provider: 'auto', error: 'Unknown provider' };
  }

  // Fallback chain if primary failed
  if (!result.success && fallbackEnabled) {
    console.log(`[TTSEngine] Primary provider failed, attempting fallback...`);

    // Try ElevenLabs if not already tried
    if (!triedProviders.has('elevenlabs') && isElevenLabsAvailable()) {
      const elevenResult = await speakWithElevenLabs(text);
      if (elevenResult.success) {
        return { success: true, provider: 'elevenlabs' };
      }
    }

    // Try OpenAI if not already tried
    if (!triedProviders.has('openai') && isOpenAITTSAvailable()) {
      const openaiResult = await speakWithOpenAIVoice(text);
      if (openaiResult.success) {
        return { success: true, provider: 'openai' };
      }
    }

    // Final fallback to browser TTS
    if (!triedProviders.has('browser')) {
      const browserSuccess = await speakWithBrowser(text);
      if (browserSuccess) {
        return { success: true, provider: 'browser' };
      }
    }
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
