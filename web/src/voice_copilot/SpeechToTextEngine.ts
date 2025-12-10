/**
 * SpeechToTextEngine - Handles speech recognition using Web Speech API
 * Provides both one-shot and continuous listening modes
 */

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export interface SpeechToTextCallbacks {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
  onStart: () => void;
}

export interface SpeechToTextEngine {
  supported: boolean;
  isListening: boolean;
  startOnce: () => void;
  startContinuous: () => void;
  stop: () => void;
  setCallbacks: (callbacks: Partial<SpeechToTextCallbacks>) => void;
}

// Check for browser support
const getSpeechRecognition = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') return null;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionAPI = (window as any).SpeechRecognition || 
                               (window as any).webkitSpeechRecognition;
  return SpeechRecognitionAPI || null;
};

export function createSpeechToTextEngine(): SpeechToTextEngine {
  const SpeechRecognitionAPI = getSpeechRecognition();
  const supported = SpeechRecognitionAPI !== null;
  
  let recognition: SpeechRecognitionInstance | null = null;
  let isListening = false;
  let isContinuousMode = false;
  
  let callbacks: SpeechToTextCallbacks = {
    onTranscript: () => {},
    onError: () => {},
    onEnd: () => {},
    onStart: () => {},
  };

  const initRecognition = (continuous: boolean) => {
    if (!SpeechRecognitionAPI) return null;
    
    const rec = new SpeechRecognitionAPI();
    rec.continuous = continuous;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      isListening = true;
      callbacks.onStart();
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        callbacks.onTranscript(finalTranscript.trim(), true);
      } else if (interimTranscript) {
        callbacks.onTranscript(interimTranscript.trim(), false);
      }
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Don't report 'no-speech' as an error in continuous mode
      if (event.error === 'no-speech' && isContinuousMode) {
        return;
      }
      callbacks.onError(event.error);
    };

    rec.onend = () => {
      isListening = false;
      callbacks.onEnd();
      
      // Auto-restart in continuous mode
      if (isContinuousMode && recognition) {
        try {
          recognition.start();
        } catch {
          // Ignore errors on restart
        }
      }
    };

    return rec;
  };

  return {
    get supported() {
      return supported;
    },
    
    get isListening() {
      return isListening;
    },

    setCallbacks(newCallbacks: Partial<SpeechToTextCallbacks>) {
      callbacks = { ...callbacks, ...newCallbacks };
    },

    startOnce() {
      if (!supported) {
        callbacks.onError('Speech recognition not supported in this browser');
        return;
      }

      // Stop any existing recognition
      if (recognition) {
        try {
          recognition.stop();
        } catch {
          // Ignore
        }
      }

      isContinuousMode = false;
      recognition = initRecognition(false);
      
      if (recognition) {
        try {
          recognition.start();
        } catch (e) {
          callbacks.onError('Failed to start speech recognition');
        }
      }
    },

    startContinuous() {
      if (!supported) {
        callbacks.onError('Speech recognition not supported in this browser');
        return;
      }

      // Stop any existing recognition
      if (recognition) {
        try {
          recognition.stop();
        } catch {
          // Ignore
        }
      }

      isContinuousMode = true;
      recognition = initRecognition(true);
      
      if (recognition) {
        try {
          recognition.start();
        } catch (e) {
          callbacks.onError('Failed to start continuous speech recognition');
        }
      }
    },

    stop() {
      isContinuousMode = false;
      if (recognition) {
        try {
          recognition.stop();
        } catch {
          // Ignore
        }
        recognition = null;
      }
      isListening = false;
    },
  };
}

export default createSpeechToTextEngine;
