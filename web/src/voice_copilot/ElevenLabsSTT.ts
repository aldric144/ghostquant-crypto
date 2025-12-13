/**
 * ElevenLabsSTT - Realtime Speech-to-Text for GhostQuant Voice Copilot
 * 
 * Uses server-side proxy to ElevenLabs Scribe v2 Realtime API.
 * This eliminates domain restrictions and secures the API key server-side.
 * 
 * Architecture:
 * Browser (PCM audio) -> Backend Proxy (/stt/stream) -> ElevenLabs API
 * Browser <- Backend Proxy <- ElevenLabs API (transcripts)
 * 
 * Audio Format: PCM 16kHz mono (raw bytes sent to backend)
 * 
 * Logging prefix: [ElevenLabsSTT]
 */

// ============================================================
// Types
// ============================================================

export interface ElevenLabsSTTConfig {
  modelId?: string;
  languageCode?: string;
  sampleRate?: number;
  backendUrl?: string;
}

export interface ElevenLabsSTTCallbacks {
  onStart?: () => void;
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (error: Error) => void;
  onEnd?: () => void;
}

// WebSocket message types from backend proxy (forwarded from ElevenLabs)
interface ProxyReadyMessage {
  message_type: 'proxy_ready';
  config: Record<string, unknown>;
}

interface SessionStartedMessage {
  message_type: 'session_started';
  session_id: string;
  config?: Record<string, unknown>;
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

interface ErrorMessage {
  message_type: 'error' | string;
  error?: string;
  message?: string;
}

type ProxyMessage = 
  | ProxyReadyMessage
  | SessionStartedMessage 
  | PartialTranscriptMessage 
  | CommittedTranscriptMessage 
  | CommittedTranscriptWithTimestampsMessage
  | ErrorMessage;

// ============================================================
// Constants
// ============================================================

const DEFAULT_MODEL_ID = 'scribe_v2_realtime';
const DEFAULT_SAMPLE_RATE = 16000;
const DEFAULT_LANGUAGE_CODE = 'en';

/**
 * Get the backend WebSocket URL for STT proxy
 */
function getBackendWsUrl(): string {
  // Check for explicit backend URL
  const backendUrl = typeof process !== 'undefined' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : null;
  
  if (backendUrl) {
    // Convert HTTP(S) to WS(S)
    const wsUrl = backendUrl.replace(/^http/, 'ws');
    return `${wsUrl}/stt/stream`;
  }
  
  // Fallback: use current host with WebSocket protocol
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/api/stt/stream`;
  }
  
  // Default for SSR
  return 'wss://localhost:8000/stt/stream';
}

// ============================================================
// ElevenLabsSTT Implementation (Server-Proxied)
// ============================================================

class ElevenLabsSTTImpl {
  private config: ElevenLabsSTTConfig;
  private callbacks: ElevenLabsSTTCallbacks = {};
  private ws: WebSocket | null = null;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private isActive: boolean = false;
  private sessionId: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private proxyReady: boolean = false;

  constructor(config?: ElevenLabsSTTConfig) {
    this.config = {
      modelId: DEFAULT_MODEL_ID,
      sampleRate: DEFAULT_SAMPLE_RATE,
      languageCode: DEFAULT_LANGUAGE_CODE,
      ...config,
    };
    console.log('[ElevenLabsSTT] Initialized (server-proxied mode)');
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
    console.log('[ElevenLabsSTT] Starting stream via server proxy...');

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

      // Connect to backend proxy WebSocket
      const connected = await this.connectWebSocket();
      if (!connected) {
        this.cleanup();
        return false;
      }

      // Start audio capture and streaming
      await this.startAudioCapture();

      this.isActive = true;
      this.callbacks.onStart?.();
      console.log('[ElevenLabsSTT] Stream started successfully via proxy');
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

    // Send stop signal to backend
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'stop' }));
      } catch (e) {
        // Ignore send errors during shutdown
      }
    }

    this.isActive = false;
    this.cleanup();
    this.callbacks.onEnd?.();

    console.log('[ElevenLabsSTT] Stream stopped');
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  // ============================================================
  // WebSocket Connection (to Backend Proxy)
  // ============================================================

  private async connectWebSocket(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const wsUrl = this.config.backendUrl || getBackendWsUrl();
        console.log('[ElevenLabsSTT] Connecting to backend proxy:', wsUrl);

        this.ws = new WebSocket(wsUrl);
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          console.log('[ElevenLabsSTT] Connected to backend proxy');
          this.reconnectAttempts = 0;
          
          // Send config message to backend
          const configMessage = {
            type: 'config',
            language: this.config.languageCode || DEFAULT_LANGUAGE_CODE,
            model: this.config.modelId || DEFAULT_MODEL_ID,
            sample_rate: this.config.sampleRate || DEFAULT_SAMPLE_RATE,
          };
          this.ws?.send(JSON.stringify(configMessage));
          console.log('[ElevenLabsSTT] Config sent to proxy:', configMessage);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
          
          // Resolve on proxy_ready or session_started
          if (!this.proxyReady) {
            try {
              const data = JSON.parse(event.data);
              if (data.message_type === 'proxy_ready' || data.message_type === 'session_started') {
                this.proxyReady = true;
                resolve(true);
              }
            } catch (e) {
              // Not JSON, ignore
            }
          }
        };

        this.ws.onerror = (error) => {
          console.error('[ElevenLabsSTT] WebSocket error:', error);
          this.callbacks.onError?.(new Error('WebSocket connection error to backend proxy'));
          resolve(false);
        };

        this.ws.onclose = (event) => {
          console.log('[ElevenLabsSTT] WebSocket closed:', event.code, event.reason);
          this.proxyReady = false;
          
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

        // Timeout for connection + proxy ready
        setTimeout(() => {
          if (!this.proxyReady) {
            console.error('[ElevenLabsSTT] Backend proxy connection timeout');
            this.ws?.close();
            resolve(false);
          }
        }, 15000);

      } catch (error) {
        console.error('[ElevenLabsSTT] Failed to create WebSocket:', error);
        resolve(false);
      }
    });
  }

  private handleMessage(data: string | ArrayBuffer): void {
    // Only handle text messages (JSON)
    if (typeof data !== 'string') {
      return;
    }

    try {
      const message: ProxyMessage = JSON.parse(data);
      
      switch (message.message_type) {
        case 'proxy_ready':
          console.log('[ElevenLabsSTT] Proxy ready:', (message as ProxyReadyMessage).config);
          break;

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

        case 'error':
          const errorMsg = message as ErrorMessage;
          console.error('[ElevenLabsSTT] Error from proxy:', errorMsg);
          this.callbacks.onError?.(new Error(errorMsg.error || errorMsg.message || 'Unknown error'));
          break;

        default:
          // Check for error messages with different type patterns
          if ((message as ErrorMessage).message_type?.includes('error')) {
            const errorMsg = message as ErrorMessage;
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
      if (!this.isActive || !this.ws || this.ws.readyState !== WebSocket.OPEN || !this.proxyReady) {
        return;
      }

      const inputData = event.inputBuffer.getChannelData(0);
      
      // Convert Float32 to Int16 PCM
      const pcmData = this.float32ToInt16(inputData);
      
      // Send raw PCM bytes to backend proxy (not base64 encoded)
      try {
        this.ws.send(pcmData.buffer);
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
    this.proxyReady = false;
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
 * Check if ElevenLabs STT is available (via server proxy)
 * 
 * Since the API key is now server-side only, we check if the backend URL is configured
 * or if we're in a browser environment where we can connect to the proxy.
 */
export function isElevenLabsSTTAvailable(): boolean {
  // In browser, always available (backend handles API key)
  if (typeof window !== 'undefined') {
    console.log('[ElevenLabsSTT] isElevenLabsSTTAvailable = true (browser, server-proxied)');
    return true;
  }
  
  // In SSR, check if backend URL is configured
  const backendUrl = typeof process !== 'undefined' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : null;
  
  const available = !!backendUrl;
  console.log('[ElevenLabsSTT] isElevenLabsSTTAvailable =', available, '(SSR)');
  return available;
}

/**
 * Create a new ElevenLabsSTT instance (server-proxied)
 */
export function createElevenLabsSTT(config?: Partial<ElevenLabsSTTConfig>): ElevenLabsSTTImpl | null {
  return new ElevenLabsSTTImpl(config);
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
