/**
 * ElevenLabsTTS - Ultra-Natural Conversational AI Voice for GhostQuant
 * 
 * Integrates with ElevenLabs TTS API for human-like voice synthesis.
 * Provides natural analyst tone with conversational delivery.
 */

import { copilotEvents } from './CopilotEvents';

// ElevenLabs API configuration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Default voice settings for natural narration tone (male voice optimized)
const DEFAULT_VOICE_SETTINGS = {
  stability: 0.35,
  similarity_boost: 0.9,
  style: 0.6, // Narration style
  use_speaker_boost: true,
};

// Recommended voices for analyst tone
export const ELEVENLABS_VOICES = {
  adam: 'pNInz6obpgDQGcFmaJgB',   // Natural male voice (DEFAULT)
  eric: 'cjVigY5qzO86Huf0OWal',   // Professional male voice
  josh: 'TxGEqnHWrfWFTfGW9XjX',   // Deep male voice
  rachel: '21m00Tcm4TlvDq8ikWAM', // Natural female voice
  bella: 'EXAVITQu4vr4xnSDxMaL',  // Soft female voice
} as const;

// Default voice ID (Adam - natural male voice)
const DEFAULT_VOICE_ID = ELEVENLABS_VOICES.adam;

export type ElevenLabsVoice = keyof typeof ELEVENLABS_VOICES;

export interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface ElevenLabsResult {
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
 * Get ElevenLabs configuration from environment
 */
function getConfig(): ElevenLabsConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || process.env.ELEVENLABS_VOICE_ID || process.env.GHOSTQUANT_CUSTOM_VOICE_ID || DEFAULT_VOICE_ID;

  if (!apiKey) {
    console.warn('[ElevenLabsTTS] No API key configured');
    return null;
  }

  return {
    apiKey,
    voiceId,
    ...DEFAULT_VOICE_SETTINGS,
  };
}

/**
 * Speak text using ElevenLabs TTS API
 * 
 * @param text - Text to convert to speech
 * @param options - Optional configuration overrides
 * @returns Promise resolving to success/failure result
 */
export async function speakWithElevenLabs(
  text: string,
  options?: Partial<ElevenLabsConfig>
): Promise<ElevenLabsResult> {
  const config = getConfig();
  
  if (!config) {
    return {
      success: false,
      error: 'ElevenLabs API key not configured',
    };
  }

  // Merge options with config
  const finalConfig = { ...config, ...options };

  try {
    // Emit speaking start event
    copilotEvents.emitSpeakingStart();

    // Make API request
    const response = await fetch(`${ELEVENLABS_API_URL}/${finalConfig.voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': finalConfig.apiKey,
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: finalConfig.stability ?? DEFAULT_VOICE_SETTINGS.stability,
          similarity_boost: finalConfig.similarityBoost ?? DEFAULT_VOICE_SETTINGS.similarity_boost,
          style: finalConfig.style ?? DEFAULT_VOICE_SETTINGS.style,
          use_speaker_boost: finalConfig.useSpeakerBoost ?? DEFAULT_VOICE_SETTINGS.use_speaker_boost,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
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
    console.error('[ElevenLabsTTS] Error:', error);
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
      console.error('[ElevenLabsTTS] Playback error:', error);
      copilotEvents.emitSpeakingEnd();
      reject(error);
    }
  });
}

/**
 * Check if ElevenLabs is configured and available
 */
export function isElevenLabsAvailable(): boolean {
  return getConfig() !== null;
}

/**
 * Get available voice options
 */
export function getAvailableVoices(): { id: string; name: string }[] {
  return Object.entries(ELEVENLABS_VOICES).map(([name, id]) => ({
    id,
    name: name.charAt(0).toUpperCase() + name.slice(1),
  }));
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
  speakWithElevenLabs,
  stopCurrentAudio,
  isElevenLabsAvailable,
  getAvailableVoices,
  preloadAudioContext,
  ELEVENLABS_VOICES,
};
