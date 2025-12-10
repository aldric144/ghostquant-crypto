/**
 * VoicePipeline - Full Voice Copilot Pipeline Orchestrator
 * 
 * Connects all voice engines in the flow:
 * WakeWordEngine -> MicEngine -> STT -> CopilotBrain -> TTS -> Orb Animations
 * 
 * This is the main integration point for the GhostQuant Voice Copilot.
 */

import { createWakeWordEngine, WakeWordEngine, extractQueryAfterWakeWord } from './WakeWordEngine';
import { createMicEngine, MicEngine } from './MicEngine';
import { createSpeechToTextEngine, SpeechToTextEngine } from './SpeechToTextEngine';
import { createTextToSpeechEngine, TextToSpeechEngine } from './TextToSpeechEngine';
import { processWithCognitiveEngine, CopilotAnswer } from './CopilotBrain';
import { CopilotContextState } from './CopilotContext';
import {
  showListeningAnimation,
  hideListeningAnimation,
  showActivationGlow,
  showThinkingAnimation,
  showSpeakingAnimation,
  showInsightBurst,
  playWakeSound,
  updateVolumeLevel,
  resetAnimations,
  AnimationState,
} from './WakeWordUIHooks';

export type PipelineState = 
  | 'idle'
  | 'wake_listening'
  | 'activated'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error';

export interface PipelineCallbacks {
  onStateChange: (state: PipelineState) => void;
  onTranscript: (text: string, isFinal: boolean) => void;
  onResponse: (answer: CopilotAnswer) => void;
  onError: (error: string) => void;
  onVolumeChange: (volume: number) => void;
  onOrbStateChange: (state: AnimationState) => void;
}

export interface VoicePipelineConfig {
  enableWakeWord: boolean;
  enableTTS: boolean;
  userId: string;
}

export interface VoicePipeline {
  state: PipelineState;
  wakeWordEnabled: boolean;
  ttsEnabled: boolean;
  
  // Control methods
  start: () => void;
  stop: () => void;
  toggleWakeWord: (enabled: boolean) => void;
  toggleTTS: (enabled: boolean) => void;
  
  // Manual activation (fallback when wake word disabled)
  activateManually: () => void;
  
  // Direct question processing (for text input)
  processTextQuestion: (question: string, context: CopilotContextState) => CopilotAnswer;
  
  // Callbacks
  setCallbacks: (callbacks: Partial<PipelineCallbacks>) => void;
  
  // Cleanup
  destroy: () => void;
}

const DEFAULT_CONFIG: VoicePipelineConfig = {
  enableWakeWord: true,
  enableTTS: true,
  userId: 'default',
};

export function createVoicePipeline(
  initialContext: CopilotContextState,
  config: Partial<VoicePipelineConfig> = {}
): VoicePipeline {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Pipeline state
  let state: PipelineState = 'idle';
  let context: CopilotContextState = initialContext;
  let wakeWordEnabled = mergedConfig.enableWakeWord;
  let ttsEnabled = mergedConfig.enableTTS;
  
  // Engine instances
  let wakeWordEngine: WakeWordEngine | null = null;
  let micEngine: MicEngine | null = null;
  let sttEngine: SpeechToTextEngine | null = null;
  let ttsEngine: TextToSpeechEngine | null = null;
  
  // Transcript buffer for combining partial results
  let transcriptBuffer = '';
  
  // Callbacks
  let callbacks: PipelineCallbacks = {
    onStateChange: () => {},
    onTranscript: () => {},
    onResponse: () => {},
    onError: () => {},
    onVolumeChange: () => {},
    onOrbStateChange: () => {},
  };

  // State management
  const setState = (newState: PipelineState) => {
    state = newState;
    callbacks.onStateChange(state);
    
    // Update orb animation based on state
    switch (newState) {
      case 'idle':
        resetAnimations();
        callbacks.onOrbStateChange('idle');
        break;
      case 'wake_listening':
        // Subtle idle animation while listening for wake word
        callbacks.onOrbStateChange('idle');
        break;
      case 'activated':
        showActivationGlow();
        playWakeSound();
        callbacks.onOrbStateChange('activated');
        break;
      case 'listening':
        showListeningAnimation();
        callbacks.onOrbStateChange('listening');
        break;
      case 'processing':
        showThinkingAnimation();
        callbacks.onOrbStateChange('thinking');
        break;
      case 'speaking':
        showSpeakingAnimation();
        callbacks.onOrbStateChange('speaking');
        break;
      case 'error':
        hideListeningAnimation();
        callbacks.onOrbStateChange('idle');
        break;
    }
  };

  // Initialize engines
  const initializeEngines = () => {
    // Create MicEngine
    micEngine = createMicEngine();
    micEngine.setCallbacks({
      onVolumeChange: (volume) => {
        callbacks.onVolumeChange(volume);
        updateVolumeLevel(volume);
      },
      onSilenceDetected: () => {
        // Auto-stop listening after silence
        if (state === 'listening') {
          stopListening();
        }
      },
      onError: (error) => {
        callbacks.onError(error);
        setState('error');
      },
    });

    // Create STT Engine
    sttEngine = createSpeechToTextEngine();
    sttEngine.setCallbacks({
      onTranscript: (text, isFinal) => {
        callbacks.onTranscript(text, isFinal);
        
        if (isFinal) {
          transcriptBuffer = text;
          processTranscript(text);
        }
      },
      onError: (error) => {
        // Handle common STT errors gracefully
        if (error !== 'no-speech' && error !== 'aborted') {
          callbacks.onError(`Speech recognition error: ${error}`);
        }
      },
      onEnd: () => {
        // STT ended - process if we have a transcript
        if (state === 'listening' && transcriptBuffer) {
          processTranscript(transcriptBuffer);
        }
      },
    });

    // Create TTS Engine
    ttsEngine = createTextToSpeechEngine();
    ttsEngine.loadVoices();
    ttsEngine.setCallbacks({
      onStart: () => {
        setState('speaking');
      },
      onEnd: () => {
        // Return to idle or wake listening
        if (wakeWordEnabled) {
          setState('wake_listening');
          startWakeWordListening();
        } else {
          setState('idle');
        }
      },
      onError: (error) => {
        callbacks.onError(`TTS error: ${error}`);
        setState('idle');
      },
    });

    // Create WakeWord Engine if enabled
    if (wakeWordEnabled) {
      initializeWakeWordEngine();
    }
  };

  // Initialize wake word engine
  const initializeWakeWordEngine = () => {
    wakeWordEngine = createWakeWordEngine();
    
    if (!wakeWordEngine.supported) {
      wakeWordEnabled = false;
      callbacks.onError('Wake word detection not supported in this browser');
      return;
    }
    
    wakeWordEngine.setCallbacks({
      onWake: () => {
        // Wake word detected!
        setState('activated');
        
        // Short delay then start listening
        setTimeout(() => {
          startActiveListening();
        }, 500);
      },
      onStatusChange: (status) => {
        if (status === 'unsupported') {
          wakeWordEnabled = false;
          callbacks.onError('Wake word detection not supported');
        }
      },
    });
  };

  // Start wake word listening
  const startWakeWordListening = () => {
    if (wakeWordEngine && wakeWordEnabled) {
      wakeWordEngine.enable();
      setState('wake_listening');
    }
  };

  // Stop wake word listening
  const stopWakeWordListening = () => {
    if (wakeWordEngine) {
      wakeWordEngine.disable();
    }
  };

  // Start active listening (after wake word or manual activation)
  const startActiveListening = async () => {
    if (!micEngine || !sttEngine) return;
    
    // Stop wake word listening while actively listening
    stopWakeWordListening();
    
    // Start microphone
    const stream = await micEngine.startListening();
    if (!stream) {
      callbacks.onError('Failed to start microphone');
      setState('error');
      return;
    }
    
    // Start STT (one-shot mode for user query)
    sttEngine.startOnce();
    
    transcriptBuffer = '';
    setState('listening');
  };

  // Stop listening
  const stopListening = () => {
    if (micEngine) {
      micEngine.stopListening();
    }
    if (sttEngine) {
      sttEngine.stop();
    }
  };

  // Process transcript through CopilotBrain
  const processTranscript = (transcript: string) => {
    if (!transcript.trim()) {
      // Empty transcript - return to listening or idle
      if (wakeWordEnabled) {
        setState('wake_listening');
        startWakeWordListening();
      } else {
        setState('idle');
      }
      return;
    }
    
    setState('processing');
    
    // Extract query after wake word if present
    const query = extractQueryAfterWakeWord(transcript) || transcript;
    
    // Process through cognitive engine
    const answer = processWithCognitiveEngine(query, context, mergedConfig.userId);
    
    callbacks.onResponse(answer);
    
    // Speak response if TTS enabled
    if (ttsEnabled && ttsEngine) {
      ttsEngine.speak(answer.text);
    } else {
      // No TTS - return to listening or idle
      if (wakeWordEnabled) {
        setState('wake_listening');
        startWakeWordListening();
      } else {
        setState('idle');
      }
    }
  };

  // Update context
  const updateContext = (newContext: CopilotContextState) => {
    context = newContext;
  };

  // Cleanup
  const cleanup = () => {
    stopWakeWordListening();
    stopListening();
    
    if (ttsEngine) {
      ttsEngine.stop();
    }
    
    resetAnimations();
    setState('idle');
  };

  // Initialize on creation
  initializeEngines();

  return {
    get state() {
      return state;
    },

    get wakeWordEnabled() {
      return wakeWordEnabled;
    },

    get ttsEnabled() {
      return ttsEnabled;
    },

    setCallbacks(newCallbacks: Partial<PipelineCallbacks>) {
      callbacks = { ...callbacks, ...newCallbacks };
    },

    start() {
      if (wakeWordEnabled) {
        startWakeWordListening();
      } else {
        setState('idle');
      }
    },

    stop() {
      cleanup();
    },

    toggleWakeWord(enabled: boolean) {
      wakeWordEnabled = enabled;
      
      if (enabled) {
        if (!wakeWordEngine) {
          initializeWakeWordEngine();
        }
        if (state === 'idle') {
          startWakeWordListening();
        }
      } else {
        stopWakeWordListening();
        if (state === 'wake_listening') {
          setState('idle');
        }
      }
    },

    toggleTTS(enabled: boolean) {
      ttsEnabled = enabled;
      
      if (!enabled && ttsEngine && ttsEngine.isSpeaking) {
        ttsEngine.stop();
      }
    },

    activateManually() {
      if (state === 'idle' || state === 'wake_listening') {
        setState('activated');
        setTimeout(() => {
          startActiveListening();
        }, 300);
      }
    },

    processTextQuestion(question: string, questionContext: CopilotContextState): CopilotAnswer {
      updateContext(questionContext);
      
      setState('processing');
      
      const answer = processWithCognitiveEngine(question, questionContext, mergedConfig.userId);
      
      callbacks.onResponse(answer);
      
      // Speak response if TTS enabled
      if (ttsEnabled && ttsEngine) {
        ttsEngine.speak(answer.text);
      } else {
        setState('idle');
      }
      
      return answer;
    },

    destroy() {
      cleanup();
      wakeWordEngine = null;
      micEngine = null;
      sttEngine = null;
      ttsEngine = null;
    },
  };
}

// Singleton instance for global access
let globalPipeline: VoicePipeline | null = null;

export function getGlobalVoicePipeline(): VoicePipeline | null {
  return globalPipeline;
}

export function initializeGlobalVoicePipeline(
  context: CopilotContextState,
  config?: Partial<VoicePipelineConfig>
): VoicePipeline {
  if (globalPipeline) {
    globalPipeline.destroy();
  }
  globalPipeline = createVoicePipeline(context, config);
  return globalPipeline;
}

export function destroyGlobalVoicePipeline(): void {
  if (globalPipeline) {
    globalPipeline.destroy();
    globalPipeline = null;
  }
}

export default createVoicePipeline;
