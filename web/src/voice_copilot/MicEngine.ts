/**
 * MicEngine - Handles microphone permissions and audio input
 * Provides visual feedback state, permission management, and real-time volume levels
 * Enhanced for audio-reactive Singularity Orb animations
 */

export type MicPermissionStatus = 'unknown' | 'granted' | 'denied' | 'prompt';
export type MicState = 'idle' | 'requesting' | 'active' | 'error';

export interface MicEngineCallbacks {
  onStateChange: (state: MicState) => void;
  onPermissionChange: (permission: MicPermissionStatus) => void;
  onError: (error: string) => void;
  onVolumeChange: (volume: number) => void;
  onSilenceDetected: () => void;
}

export interface MicEngine {
  state: MicState;
  permission: MicPermissionStatus;
  volume: number;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<MicPermissionStatus>;
  setCallbacks: (callbacks: Partial<MicEngineCallbacks>) => void;
  startListening: () => Promise<MediaStream | null>;
  stopListening: () => void;
}

// Silence detection configuration
const SILENCE_THRESHOLD = 0.01;
const SILENCE_DURATION_MS = 2000;

export function createMicEngine(): MicEngine {
  let state: MicState = 'idle';
  let permission: MicPermissionStatus = 'unknown';
  let volume: number = 0;
  
  // Audio analysis state
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let mediaStream: MediaStream | null = null;
  let volumeAnimationFrame: number | null = null;
  let silenceTimer: ReturnType<typeof setTimeout> | null = null;
  
  let callbacks: MicEngineCallbacks = {
    onStateChange: () => {},
    onPermissionChange: () => {},
    onError: () => {},
    onVolumeChange: () => {},
    onSilenceDetected: () => {},
  };

  const setState = (newState: MicState) => {
    state = newState;
    callbacks.onStateChange(state);
  };

  const setPermission = (newPermission: MicPermissionStatus) => {
    permission = newPermission;
    callbacks.onPermissionChange(permission);
  };

  const setVolume = (newVolume: number) => {
    volume = newVolume;
    callbacks.onVolumeChange(volume);
  };

  // Analyze audio volume in real-time
  const analyzeVolume = () => {
    if (!analyser) return;
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate RMS (root mean square) for volume level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    
    // Normalize to 0-1 range
    const normalizedVolume = Math.min(1, rms / 128);
    setVolume(normalizedVolume);
    
    // Check for silence
    if (normalizedVolume < SILENCE_THRESHOLD) {
      if (!silenceTimer) {
        silenceTimer = setTimeout(() => {
          callbacks.onSilenceDetected();
          silenceTimer = null;
        }, SILENCE_DURATION_MS);
      }
    } else {
      // Reset silence timer if sound detected
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }
    }
    
    // Continue analyzing
    if (state === 'active') {
      volumeAnimationFrame = requestAnimationFrame(analyzeVolume);
    }
  };

  // Clean up audio resources
  const cleanupAudio = () => {
    if (volumeAnimationFrame) {
      cancelAnimationFrame(volumeAnimationFrame);
      volumeAnimationFrame = null;
    }
    
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }
    
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
      audioContext = null;
    }
    
    analyser = null;
    setVolume(0);
  };

  return {
    get state() {
      return state;
    },

    get permission() {
      return permission;
    },

    get volume() {
      return volume;
    },

    setCallbacks(newCallbacks: Partial<MicEngineCallbacks>) {
      callbacks = { ...callbacks, ...newCallbacks };
    },

    async checkPermission(): Promise<MicPermissionStatus> {
      if (typeof window === 'undefined' || !navigator.permissions) {
        return 'unknown';
      }

      try {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        const status = result.state as MicPermissionStatus;
        setPermission(status);
        return status;
      } catch {
        // Some browsers don't support querying microphone permission
        return 'unknown';
      }
    },

    async requestPermission(): Promise<boolean> {
      if (typeof window === 'undefined' || !navigator.mediaDevices) {
        callbacks.onError('Microphone not available in this environment');
        return false;
      }

      setState('requesting');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach(track => track.stop());
        
        setPermission('granted');
        setState('idle');
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
          setPermission('denied');
          callbacks.onError('Microphone permission denied. Please enable it in your browser settings.');
        } else {
          callbacks.onError(`Microphone error: ${errorMessage}`);
        }
        
        setState('error');
        return false;
      }
    },

    async startListening(): Promise<MediaStream | null> {
      if (typeof window === 'undefined' || !navigator.mediaDevices) {
        callbacks.onError('Microphone not available in this environment');
        return null;
      }

      // Clean up any existing audio resources
      cleanupAudio();

      setState('requesting');

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        });
        
        setPermission('granted');
        setState('active');
        
        // Set up audio analysis for volume levels
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        
        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(analyser);
        
        // Start volume analysis loop
        analyzeVolume();
        
        return mediaStream;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
          setPermission('denied');
          callbacks.onError('Microphone permission denied. Please enable it in your browser settings.');
        } else {
          callbacks.onError(`Microphone error: ${errorMessage}`);
        }
        
        setState('error');
        return null;
      }
    },

    stopListening() {
      cleanupAudio();
      setState('idle');
    },
  };
}

export default createMicEngine;
