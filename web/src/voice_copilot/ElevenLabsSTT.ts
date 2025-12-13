/**
 * ElevenLabsSTT - Realtime Speech-to-Text for GhostQuant Voice Copilot
 * 
 * Integrates with ElevenLabs Scribe v2 Realtime API for streaming transcription.
 * Uses WebSocket connection for low-latency, real-time speech recognition.
 * 
 * API: wss://api.elevenlabs.io/v1/speech-to-text/realtime
 * Audio Format: PCM 16kHz mono
 * 
 * Logging prefix: [ElevenLabsSTT]
 */

// ============================================================
// Types
// ============================================================

export interface ElevenLabsSTTConfig {
  apiKey: string;
  modelId?: string;
  languageCode?: string;
  sampleRate?: number;
  commitStrategy?: 'manual' | 'vad';
  vadSilenceThresholdSecs?: number;
}

export interface ElevenLabsSTTCallbacks {
  onStart?: () => void;
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (error: Error) => void;
  onEnd?: () => void;
}

// WebSocket message types from ElevenLabs
interface SessionStartedMessage {
  message_type: 'session_started';
  session_id: string;
  config: Record<string, unknown>;
}

interface PartialTranscriptMessage {
  message_type: 'partial_transcript';
  text: string;
}

interface CommittedTranscriptMessage {
  message_type: 'committed_transcript';
  text: string;
}

interface CommittedTranscriptWithTimestampsMessage {
  message_type: 'committed_transcript_with_timestamps';
  text: string;
  language_code?: string;
  words?: Array<{
    text: string;
    start: number;
    end: number;
    type: string;
  }>;
}

interface ScribeErrorMessage {
  message_type: string;
  error?: string;
  message?: string;
}

type ElevenLabsMessage = 
  | SessionStartedMessage 
  | PartialTranscriptMessage 
  | CommittedTranscriptMessage 
  | CommittedTranscriptWithTimestampsMessage
  | ScribeErrorMessage;

// ============================================================
// Constants
// ============================================================

const ELEVENLABS_STT_WS_URL = 'wss://api.elevenlabs.io/v1/speech-to-text/realtime';
const DEFAULT_MODEL_ID = 'scribe_v2_realtime';
const DEFAULT_SAMPLE_RATE = 16000;
const DEFAULT_LANGUAGE_CODE = 'en';

// ============================================================
// ElevenLabsSTT Implementation
// ============================================================

class ElevenLabsSTTImpl {
  private config: ElevenLabsSTTConfig;
  private callbacks: ElevenLabsSTTCallbacks = {};
  private ws: WebSocket | null = null;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private audioWorklet: AudioWorkletNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private isActive: boolean = false;
  private sessionId: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;

  constructor(config: ElevenLabsSTTConfig) {
    this.config = {
      modelId: DEFAULT_MODEL_ID,
      sampleRate: DEFAULT_SAMPLE_RATE,
      languageCode: DEFAULT_LANGUAGE_CODE,
      commitStrategy: 'vad',
      vadSilenceThresholdSecs: 1.5,
      ...config,
    };
    console.log('[ElevenLabsSTT] Initialized');
  }

  // ============================================================
  // Configuration
  // ============================================================

  setCallbacks(callbacks: ElevenLabsSTTCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
    console.log('[ElevenLabsSTT] Callbacks configured');
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  async start(): Promise<boolean> {
    console.log('[ElevenLabsSTT] Starting stream...');

    if (this.isActive) {
      console.log('[ElevenLabsSTT] Already active');
      return true;
    }

    try {
      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      console.log('[ElevenLabsSTT] Microphone access granted');

      // Connect to ElevenLabs WebSocket
      const connected = await this.connectWebSocket();
      if (!connected) {
        this.cleanup();
        return false;
      }

      // Start audio capture and streaming
      await this.startAudioCapture();

      this.isActive = true;
      this.callbacks.onStart?.();
      console.log('[ElevenLabsSTT] Stream started successfully');
      return true;

    } catch (error) {
      console.error('[ElevenLabsSTT] Failed to start:', error);
      this.callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
      this.cleanup();
      return false;
    }
  }

  async stop(): Promise<void> {
    console.log('[ElevenLabsSTT] Stopping stream...');

    this.isActive = false;
    this.cleanup();
    this.callbacks.onEnd?.();

    console.log('[ElevenLabsSTT] Stream stopped');
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  // ============================================================
  // WebSocket Connection
  // ============================================================

  private async connectWebSocket(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // Build WebSocket URL with query parameters
        const params = new URLSearchParams({
          model_id: this.config.modelId || DEFAULT_MODEL_ID,
          language_code: this.config.languageCode || DEFAULT_LANGUAGE_CODE,
          audio_format: `pcm_${this.config.sampleRate || DEFAULT_SAMPLE_RATE}`,
          commit_strategy: this.config.commitStrategy || 'vad',
          vad_silence_threshold_secs: String(this.config.vadSilenceThresholdSecs || 1.5),
        });

        const wsUrl = `${ELEVENLABS_STT_WS_URL}?${params.toString()}`;
        console.log('[ElevenLabsSTT] Connecting to WebSocket...');

        // Create WebSocket with API key in subprotocol (for browser compatibility)
        // Note: xi-api-key header not supported in browser WebSocket, use token param instead
        const tokenUrl = `${wsUrl}&xi-api-key=${this.config.apiKey}`;
        this.ws = new WebSocket(tokenUrl);

        this.ws.onopen = () => {
          console.log('[ElevenLabsSTT] WebSocket connected');
          this.reconnectAttempts = 0;
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('[ElevenLabsSTT] WebSocket error:', error);
          this.callbacks.onError?.(new Error('WebSocket connection error'));
          resolve(false);
        };

        this.ws.onclose = (event) => {
          console.log('[ElevenLabsSTT] WebSocket closed:', event.code, event.reason);
          
          // Attempt reconnect if still active
          if (this.isActive && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[ElevenLabsSTT] Attempting reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => this.connectWebSocket(), 1000 * this.reconnectAttempts);
          } else if (this.isActive) {
            this.callbacks.onError?.(new Error('WebSocket connection lost'));
            this.stop();
          }
        };

        // Timeout for connection
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            console.error('[ElevenLabsSTT] WebSocket connection timeout');
            this.ws?.close();
            resolve(false);
          }
        }, 10000);

      } catch (error) {
        console.error('[ElevenLabsSTT] Failed to create WebSocket:', error);
        resolve(false);
      }
    });
  }

  private handleMessage(data: string): void {
    try {
      const message: ElevenLabsMessage = JSON.parse(data);
      
      switch (message.message_type) {
        case 'session_started':
          this.sessionId = (message as SessionStartedMessage).session_id;
          console.log('[ElevenLabsSTT] Session started:', this.sessionId);
          break;

        case 'partial_transcript':
          const partialText = (message as PartialTranscriptMessage).text;
          if (partialText) {
            console.log('[ElevenLabsSTT] Partial:', partialText);
            this.callbacks.onPartial?.(partialText);
          }
          break;

        case 'committed_transcript':
        case 'committed_transcript_with_timestamps':
          const finalText = (message as CommittedTranscriptMessage).text;
          if (finalText) {
            console.log('[ElevenLabsSTT] Final:', finalText);
            this.callbacks.onFinal?.(finalText);
          }
          break;

        default:
          // Check for error messages
          if (message.message_type?.includes('error')) {
            const errorMsg = (message as ScribeErrorMessage);
            console.error('[ElevenLabsSTT] Error message:', errorMsg);
            this.callbacks.onError?.(new Error(errorMsg.error || errorMsg.message || 'Unknown error'));
          }
          break;
      }
    } catch (error) {
      console.error('[ElevenLabsSTT] Failed to parse message:', error);
    }
  }

  // ============================================================
  // Audio Capture
  // ============================================================

  private async startAudioCapture(): Promise<void> {
    if (!this.mediaStream) {
      throw new Error('No media stream available');
    }

    // Create audio context
    this.audioContext = new AudioContext({
      sampleRate: this.config.sampleRate || DEFAULT_SAMPLE_RATE,
    });

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);

    // Use ScriptProcessorNode for broader browser compatibility
    // (AudioWorklet is better but requires more setup)
    const bufferSize = 4096;
    this.scriptProcessor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

    this.scriptProcessor.onaudioprocess = (event) => {
      if (!this.isActive || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return;
      }

      const inputData = event.inputBuffer.getChannelData(0);
      
      // Convert Float32 to Int16 PCM
      const pcmData = this.float32ToInt16(inputData);
      
      // Convert to base64 (create new ArrayBuffer from Int16Array)
      const arrayBuffer = new ArrayBuffer(pcmData.byteLength);
      new Int16Array(arrayBuffer).set(pcmData);
      const base64Audio = this.arrayBufferToBase64(arrayBuffer);

      // Send to ElevenLabs
      const message = {
        message_type: 'input_audio_chunk',
        audio_base_64: base64Audio,
        commit: false, // Let VAD handle commits
        sample_rate: this.config.sampleRate || DEFAULT_SAMPLE_RATE,
      };

      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('[ElevenLabsSTT] Failed to send audio chunk:', error);
      }
    };

    source.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);

    console.log('[ElevenLabsSTT] Audio capture started');
  }

  private float32ToInt16(float32Array: Float32Array): Int16Array {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      // Clamp and convert
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // ============================================================
  // Cleanup
  // ============================================================

  private cleanup(): void {
    // Close WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Stop script processor
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close().catch(console.error);
      this.audioContext = null;
    }

    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.sessionId = null;
  }

  dispose(): void {
    this.stop();
    this.callbacks = {};
    console.log('[ElevenLabsSTT] Disposed');
  }
}

// ============================================================
// Factory Functions
// ============================================================

/**
 * Get ElevenLabs STT configuration from environment
 */
function getConfig(): ElevenLabsSTTConfig | null {
  const apiKey = typeof process !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY)
    : null;

  console.log('[ElevenLabsSTT] getConfig: NEXT_PUBLIC_ELEVENLABS_API_KEY present =', 
    !!(typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY));

  if (!apiKey) {
    console.warn('[ElevenLabsSTT] No API key configured - ElevenLabs STT will NOT be available');
    return null;
  }

  return { apiKey };
}

/**
 * Check if ElevenLabs STT is configured and available
 */
export function isElevenLabsSTTAvailable(): boolean {
  const available = getConfig() !== null;
  console.log('[ElevenLabsSTT] isElevenLabsSTTAvailable =', available);
  return available;
}

/**
 * Create a new ElevenLabsSTT instance
 */
export function createElevenLabsSTT(config?: Partial<ElevenLabsSTTConfig>): ElevenLabsSTTImpl | null {
  const envConfig = getConfig();
  if (!envConfig) {
    return null;
  }

  return new ElevenLabsSTTImpl({
    ...envConfig,
    ...config,
  });
}

// ============================================================
// Singleton Instance
// ============================================================

let elevenLabsSTT: ElevenLabsSTTImpl | null = null;

/**
 * Get the ElevenLabsSTT singleton instance
 */
export function getElevenLabsSTT(): ElevenLabsSTTImpl | null {
  if (!elevenLabsSTT) {
    elevenLabsSTT = createElevenLabsSTT();
  }
  return elevenLabsSTT;
}

export default {
  isElevenLabsSTTAvailable,
  createElevenLabsSTT,
  getElevenLabsSTT,
};
