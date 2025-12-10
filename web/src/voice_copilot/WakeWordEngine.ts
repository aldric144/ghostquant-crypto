/**
 * WakeWordEngine - Detects wake words in speech transcripts
 * Uses transcript-based detection (not raw audio) for browser compatibility
 * Wake words: "GhostQuant", "Hey GhostQuant", "Ghost Quant"
 */

import { createSpeechToTextEngine, SpeechToTextEngine } from './SpeechToTextEngine';

export interface WakeWordCallbacks {
  onWake: () => void;
  onStatusChange: (status: WakeWordStatus) => void;
}

export type WakeWordStatus = 'disabled' | 'listening' | 'triggered' | 'unsupported';

export interface WakeWordEngine {
  supported: boolean;
  status: WakeWordStatus;
  enable: () => void;
  disable: () => void;
  setCallbacks: (callbacks: Partial<WakeWordCallbacks>) => void;
}

// Wake word patterns to detect (normalized)
const WAKE_PATTERNS = [
  'ghostquant',
  'ghost quant',
  'hey ghostquant',
  'hey ghost quant',
  'heyghost quant',
  'hey ghost',
  'ok ghostquant',
  'ok ghost quant',
];

// Normalize text for wake word matching
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

// Check if text contains a wake word
function containsWakeWord(text: string): boolean {
  const normalized = normalizeText(text);
  return WAKE_PATTERNS.some(pattern => normalized.includes(pattern));
}

// Extract the query after the wake word
export function extractQueryAfterWakeWord(text: string): string {
  const normalized = normalizeText(text);
  
  for (const pattern of WAKE_PATTERNS) {
    const index = normalized.indexOf(pattern);
    if (index !== -1) {
      // Get everything after the wake word
      const afterWake = normalized.substring(index + pattern.length).trim();
      if (afterWake.length > 0) {
        return afterWake;
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
    
    if (containsWakeWord(combinedText)) {
      const now = Date.now();
      if (now - lastWakeTime > WAKE_COOLDOWN) {
        lastWakeTime = now;
        setStatus('triggered');
        callbacks.onWake();
        
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
