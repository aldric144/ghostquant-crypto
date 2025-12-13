/**
 * STTEngine - Unified Speech-to-Text Engine for GhostQuant Voice Copilot
 * 
 * Supports multiple STT providers with automatic fallback:
 * 1. ElevenLabs (Primary) - Scribe v2 Realtime with WebSocket streaming
 * 2. Browser Web Speech API (Fallback) - Built-in speech recognition
 * 
 * Provider selection via STT_PROVIDER environment variable.
 * Mirrors the TTSEngine pattern for consistency.
 * 
 * Logging prefix: [STTEngine]
 */

import { isElevenLabsSTTAvailable, createElevenLabsSTT } from './ElevenLabsSTT';

// ============================================================
// Types
// ============================================================

export type STTProvider = 'elevenlabs' | 'webspeech' | 'auto';

export interface STTCallbacks {
  onStart?: () => void;
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (error: Error) => void;
  onEnd?: () => void;
}

export interface STTEngineConfig {
  provider?: STTProvider;
  fallbackEnabled?: boolean;
  language?: string;
  continuous?: boolean;
}

export interface STTResult {
  success: boolean;
  provider: STTProvider;
  error?: string;
}

// ============================================================
// Web Speech API Types (for fallback)
// ============================================================

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

// ============================================================
// State
// ============================================================

let currentProvider: STTProvider = 'auto';
let activeProvider: STTProvider | null = null;
let callbacks: STTCallbacks = {};
let isListening: boolean = false;

// ElevenLabs STT instance
let elevenLabsSTT: ReturnType<typeof createElevenLabsSTT> = null;

// Web Speech API instance
let webSpeechRecognition: any = null;

// ============================================================
// Configuration
// ============================================================

/**
 * Get configured provider from environment
 */
function getConfiguredProvider(): STTProvider {
  if (typeof process === 'undefined') return 'auto';
  
  const envProvider = process.env.NEXT_PUBLIC_STT_PROVIDER || process.env.STT_PROVIDER;
  if (envProvider) {
    return envProvider as STTProvider;
  }
  
  // Auto-select elevenlabs if API key is available
  if (process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) {
    return 'elevenlabs';
  }
  
  return 'auto';
}

/**
 * Initialize STT Engine with configuration
 */
export function initializeSTTEngine(config?: STTEngineConfig): void {
  currentProvider = config?.provider || getConfiguredProvider();
  console.log(`[STTEngine] Initialized with provider: ${currentProvider}`);
  console.log(`[STTEngine] isElevenLabsSTTAvailable =`, isElevenLabsSTTAvailable());
  console.log(`[STTEngine] isWebSpeechAvailable =`, isWebSpeechAvailable());
}

// ============================================================
// Provider Availability
// ============================================================

/**
 * Check if Web Speech API is available
 */
export function isWebSpeechAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  const SpeechRecognition = (window as any).SpeechRecognition || 
                            (window as any).webkitSpeechRecognition;
  return !!SpeechRecognition;
}

/**
 * Get the best available provider
 */
function getBestProvider(): STTProvider {
  if (currentProvider !== 'auto') {
    return currentProvider;
  }

  // Auto-select based on availability (ElevenLabs first, then Web Speech)
  if (isElevenLabsSTTAvailable()) {
    return 'elevenlabs';
  }
  if (isWebSpeechAvailable()) {
    return 'webspeech';
  }
  
  return 'webspeech'; // Default fallback
}

// ============================================================
// Callbacks
// ============================================================

/**
 * Set STT callbacks
 */
export function setCallbacks(newCallbacks: STTCallbacks): void {
  callbacks = { ...callbacks, ...newCallbacks };
  console.log('[STTEngine] Callbacks configured');
}

// ============================================================
// ElevenLabs STT Provider
// ============================================================

async function startElevenLabsSTT(): Promise<boolean> {
  console.log('[STTEngine] Starting ElevenLabs STT...');

  try {
    elevenLabsSTT = createElevenLabsSTT();
    
    if (!elevenLabsSTT) {
      console.error('[STTEngine] Failed to create ElevenLabs STT instance');
      return false;
    }

    elevenLabsSTT.setCallbacks({
      onStart: () => {
        console.log('[STTEngine] ElevenLabs STT started');
        callbacks.onStart?.();
      },
      onPartial: (text: string) => {
        console.log('[STTEngine] ElevenLabs partial:', text);
        callbacks.onPartial?.(text);
      },
      onFinal: (text: string) => {
        console.log('[STTEngine] ElevenLabs final:', text);
        callbacks.onFinal?.(text);
      },
      onError: (error: Error) => {
        console.error('[STTEngine] ElevenLabs error:', error.message);
        callbacks.onError?.(error);
      },
      onEnd: () => {
        console.log('[STTEngine] ElevenLabs STT ended');
        callbacks.onEnd?.();
      },
    });

    const success = await elevenLabsSTT.start();
    return success;

  } catch (error) {
    console.error('[STTEngine] ElevenLabs STT failed:', error);
    return false;
  }
}

function stopElevenLabsSTT(): void {
  if (elevenLabsSTT) {
    elevenLabsSTT.stop();
    elevenLabsSTT = null;
  }
}

// ============================================================
// Web Speech API Provider (Fallback)
// ============================================================

function startWebSpeechSTT(config?: STTEngineConfig): boolean {
  console.log('[STTEngine] Starting Web Speech STT...');

  if (!isWebSpeechAvailable()) {
    console.error('[STTEngine] Web Speech API not available');
    return false;
  }

  try {
    const SpeechRecognition = (window as any).SpeechRecognition || 
                              (window as any).webkitSpeechRecognition;
    
    webSpeechRecognition = new SpeechRecognition();
    webSpeechRecognition.continuous = config?.continuous ?? true;
    webSpeechRecognition.interimResults = true;
    webSpeechRecognition.lang = config?.language || 'en-US';
    webSpeechRecognition.maxAlternatives = 1;

    webSpeechRecognition.onstart = () => {
      console.log('[STTEngine] Web Speech started');
      callbacks.onStart?.();
    };

    webSpeechRecognition.onend = () => {
      console.log('[STTEngine] Web Speech ended');
      
      // Auto-restart if still listening
      if (isListening && webSpeechRecognition) {
        console.log('[STTEngine] Auto-restarting Web Speech...');
        setTimeout(() => {
          if (isListening && webSpeechRecognition) {
            try {
              webSpeechRecognition.start();
            } catch (e) {
              console.error('[STTEngine] Failed to restart Web Speech:', e);
            }
          }
        }, 100);
      } else {
        callbacks.onEnd?.();
      }
    };

    webSpeechRecognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          console.log('[STTEngine] Web Speech final:', transcript);
          callbacks.onFinal?.(transcript);
        } else {
          console.log('[STTEngine] Web Speech partial:', transcript);
          callbacks.onPartial?.(transcript);
        }
      }
    };

    webSpeechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[STTEngine] Web Speech error:', event.error);
      
      // Don't treat 'no-speech' or 'aborted' as fatal errors
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        callbacks.onError?.(new Error(event.error));
      }
    };

    webSpeechRecognition.start();
    return true;

  } catch (error) {
    console.error('[STTEngine] Web Speech failed to start:', error);
    return false;
  }
}

function stopWebSpeechSTT(): void {
  if (webSpeechRecognition) {
    try {
      webSpeechRecognition.stop();
    } catch (e) {
      // Ignore if already stopped
    }
    webSpeechRecognition = null;
  }
}

// ============================================================
// Main API
// ============================================================

/**
 * Start listening for speech
 * Routes to appropriate provider with fallback
 */
export async function startListening(config?: STTEngineConfig): Promise<STTResult> {
  const requestedProvider = config?.provider || getBestProvider();
  const fallbackEnabled = config?.fallbackEnabled ?? true;

  console.log(`[STTEngine] Starting with provider: ${requestedProvider}`);

  if (isListening) {
    console.log('[STTEngine] Already listening');
    return { success: true, provider: activeProvider || requestedProvider };
  }

  isListening = true;
  let result: STTResult;

  // Try primary provider
  switch (requestedProvider) {
    case 'elevenlabs': {
      const success = await startElevenLabsSTT();
      if (success) {
        activeProvider = 'elevenlabs';
        return { success: true, provider: 'elevenlabs' };
      }
      result = { success: false, provider: 'elevenlabs', error: 'Failed to start ElevenLabs STT' };
      break;
    }

    case 'webspeech': {
      const success = startWebSpeechSTT(config);
      if (success) {
        activeProvider = 'webspeech';
        return { success: true, provider: 'webspeech' };
      }
      result = { success: false, provider: 'webspeech', error: 'Failed to start Web Speech' };
      break;
    }

    default:
      result = { success: false, provider: 'auto', error: 'Unknown provider' };
  }

  // Fallback chain if primary failed
  if (!result.success && fallbackEnabled) {
    console.log(`[STTEngine] Primary provider failed, attempting fallback...`);
    console.log(`[STTEngine] Primary error was:`, result.error);

    // Try ElevenLabs if not already tried
    if (requestedProvider !== 'elevenlabs' && isElevenLabsSTTAvailable()) {
      console.log(`[STTEngine] Trying ElevenLabs fallback...`);
      const success = await startElevenLabsSTT();
      if (success) {
        activeProvider = 'elevenlabs';
        return { success: true, provider: 'elevenlabs' };
      }
      console.log(`[STTEngine] ElevenLabs fallback failed`);
    }

    // Try Web Speech if not already tried
    if (requestedProvider !== 'webspeech' && isWebSpeechAvailable()) {
      console.log(`[STTEngine] Trying Web Speech fallback...`);
      const success = startWebSpeechSTT(config);
      if (success) {
        activeProvider = 'webspeech';
        return { success: true, provider: 'webspeech' };
      }
      console.log(`[STTEngine] Web Speech fallback failed`);
    }
  }

  // All providers failed
  isListening = false;
  activeProvider = null;
  return result;
}

/**
 * Stop listening for speech
 */
export function stopListening(): void {
  console.log('[STTEngine] Stopping...');

  isListening = false;

  stopElevenLabsSTT();
  stopWebSpeechSTT();

  activeProvider = null;
  console.log('[STTEngine] Stopped');
}

/**
 * Get current STT provider
 */
export function getCurrentProvider(): STTProvider {
  return currentProvider;
}

/**
 * Get active STT provider (the one currently in use)
 */
export function getActiveProvider(): STTProvider | null {
  return activeProvider;
}

/**
 * Set STT provider
 */
export function setProvider(provider: STTProvider): void {
  currentProvider = provider;
  console.log(`[STTEngine] Provider set to: ${provider}`);
}

/**
 * Get available providers
 */
export function getAvailableProviders(): { provider: STTProvider; available: boolean; name: string }[] {
  return [
    { 
      provider: 'elevenlabs', 
      available: isElevenLabsSTTAvailable(), 
      name: 'ElevenLabs Scribe (Realtime)' 
    },
    { 
      provider: 'webspeech', 
      available: isWebSpeechAvailable(), 
      name: 'Browser Web Speech API' 
    },
  ];
}

/**
 * Check if any STT provider is available
 */
export function isSTTAvailable(): boolean {
  return isElevenLabsSTTAvailable() || isWebSpeechAvailable();
}

/**
 * Check if currently listening
 */
export function getIsListening(): boolean {
  return isListening;
}

// Initialize on module load
initializeSTTEngine();

export default {
  startListening,
  stopListening,
  setCallbacks,
  getCurrentProvider,
  getActiveProvider,
  setProvider,
  getAvailableProviders,
  isSTTAvailable,
  getIsListening,
  initializeSTTEngine,
};
