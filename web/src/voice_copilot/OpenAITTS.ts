/**
 * OpenAITTS - Natural + Expressive Voice for GhostQuant
 * 
 * Integrates with OpenAI Realtime Voice TTS API for dynamic,
 * emotionally aware tone similar to GPT-4o voice mode.
 */

import { copilotEvents } from './CopilotEvents';

// OpenAI TTS API configuration
const OPENAI_TTS_API_URL = 'https://api.openai.com/v1/audio/speech';

// Available OpenAI voices
export const OPENAI_VOICES = {
  alloy: 'alloy',     // Neutral, balanced
  echo: 'echo',       // Warm, conversational
  fable: 'fable',     // Expressive, storytelling
  onyx: 'onyx',       // Deep, authoritative
  nova: 'nova',       // Friendly, upbeat
  shimmer: 'shimmer', // Clear, professional
} as const;

export type OpenAIVoice = keyof typeof OPENAI_VOICES;

// Available models
export const OPENAI_TTS_MODELS = {
  standard: 'tts-1',
  hd: 'tts-1-hd',
  mini: 'gpt-4o-mini-tts',
} as const;

export type OpenAITTSModel = keyof typeof OPENAI_TTS_MODELS;

export interface OpenAITTSConfig {
  apiKey: string;
  voice?: OpenAIVoice;
  model?: string;
  speed?: number;
  format?: 'mp3' | 'opus' | 'aac' | 'flac';
}

export interface OpenAITTSResult {
  success: boolean;
  audioBlob?: Blob;
  error?: string;
}

// Audio context for playback
let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

/**
 * Get or create AudioContext
 */
function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/**
 * Stop any currently playing audio
 */
export function stopCurrentAudio(): void {
  if (currentSource) {
    try {
      currentSource.stop();
      currentSource.disconnect();
    } catch (e) {
      // Ignore if already stopped
    }
    currentSource = null;
  }
}

/**
 * Get OpenAI configuration from environment
 */
function getConfig(): OpenAITTSConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('[OpenAITTS] No API key configured');
    return null;
  }

  return {
    apiKey,
    voice: (process.env.NEXT_PUBLIC_OPENAI_VOICE as OpenAIVoice) || 'alloy',
    model: process.env.NEXT_PUBLIC_OPENAI_TTS_MODEL || OPENAI_TTS_MODELS.standard,
    speed: 1.0,
    format: 'mp3',
  };
}

/**
 * Speak text using OpenAI TTS API
 * 
 * @param text - Text to convert to speech
 * @param options - Optional configuration overrides
 * @returns Promise resolving to success/failure result
 */
export async function speakWithOpenAIVoice(
  text: string,
  options?: Partial<OpenAITTSConfig>
): Promise<OpenAITTSResult> {
  const config = getConfig();
  
  if (!config) {
    return {
      success: false,
      error: 'OpenAI API key not configured',
    };
  }

  // Merge options with config
  const finalConfig = { ...config, ...options };

  try {
    // Emit speaking start event
    copilotEvents.emitSpeakingStart();

    // Make API request
    const response = await fetch(OPENAI_TTS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${finalConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: finalConfig.model,
        voice: finalConfig.voice,
        input: text,
        response_format: finalConfig.format,
        speed: finalConfig.speed,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI TTS API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    // Get audio blob
    const audioBlob = await response.blob();

    // Play the audio
    await playAudioBlob(audioBlob);

    return {
      success: true,
      audioBlob,
    };

  } catch (error) {
    console.error('[OpenAITTS] Error:', error);
    copilotEvents.emitSpeakingEnd();
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Play audio blob through Web Audio API
 */
async function playAudioBlob(blob: Blob): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      // Stop any currently playing audio
      stopCurrentAudio();

      // Get audio context
      const ctx = getAudioContext();
      
      // Resume if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Convert blob to array buffer
      const arrayBuffer = await blob.arrayBuffer();

      // Decode audio data
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      // Create source node
      currentSource = ctx.createBufferSource();
      currentSource.buffer = audioBuffer;
      currentSource.connect(ctx.destination);

      // Handle playback end
      currentSource.onended = () => {
        copilotEvents.emitSpeakingEnd();
        currentSource = null;
        resolve();
      };

      // Start playback
      currentSource.start(0);

    } catch (error) {
      console.error('[OpenAITTS] Playback error:', error);
      copilotEvents.emitSpeakingEnd();
      reject(error);
    }
  });
}

/**
 * Check if OpenAI TTS is configured and available
 */
export function isOpenAITTSAvailable(): boolean {
  return getConfig() !== null;
}

/**
 * Get available voice options
 */
export function getAvailableVoices(): { id: string; name: string; description: string }[] {
  return [
    { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced' },
    { id: 'echo', name: 'Echo', description: 'Warm, conversational' },
    { id: 'fable', name: 'Fable', description: 'Expressive, storytelling' },
    { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative' },
    { id: 'nova', name: 'Nova', description: 'Friendly, upbeat' },
    { id: 'shimmer', name: 'Shimmer', description: 'Clear, professional' },
  ];
}

/**
 * Preload audio context (call on user interaction to avoid autoplay issues)
 */
export function preloadAudioContext(): void {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume().catch(console.error);
  }
}

export default {
  speakWithOpenAIVoice,
  stopCurrentAudio,
  isOpenAITTSAvailable,
  getAvailableVoices,
  preloadAudioContext,
  OPENAI_VOICES,
  OPENAI_TTS_MODELS,
};
