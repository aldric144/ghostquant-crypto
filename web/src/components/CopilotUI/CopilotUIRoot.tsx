'use client';

/**
 * CopilotUIRoot - Global wrapper for GhostQuant Voice Copilot UI
 * 
 * Renders all copilot UI elements globally across all pages:
 * - SingularityOrb (animated avatar)
 * - MicButton (click to speak)
 * - WakeWordIndicator (wake word status)
 * - CopilotPanel (transcript history)
 * 
 * This component should be rendered in the root layout to float above all content.
 */

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SingularityOrb, OrbState } from './SingularityOrb';
import { MicButton } from './MicButton';
import { WakeWordIndicator } from './WakeWordIndicator';
import { CopilotPanel } from './CopilotPanel';
import { copilotEvents, CopilotUIState } from '../../voice_copilot/CopilotEvents';
import { speak } from '../../voice_copilot/TTSEngine';
import './CopilotUIStyles.css';

export interface CopilotUIRootProps {
  enableWakeWord?: boolean;
  enableMicButton?: boolean;
  enablePanel?: boolean;
  showWakeWordIndicator?: boolean;
  onError?: (error: string) => void;
  className?: string;
}

// Voice pipeline integration types
interface VoicePipelineCallbacks {
  onMicStart?: () => void;
  onMicStop?: () => void;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onResponse?: (text: string) => void;
  onError?: (error: string) => void;
}

export function CopilotUIRoot({
  enableWakeWord = true,
  enableMicButton = true,
  enablePanel = true,
  showWakeWordIndicator = true,
  onError,
  className = '',
}: CopilotUIRootProps): React.ReactElement {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(enableWakeWord);
  const [isWakeWordActive, setIsWakeWordActive] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [currentState, setCurrentState] = useState<CopilotUIState>('idle');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Refs for voice pipeline integration
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize voice pipeline connection
  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = copilotEvents.on('state_change', (event) => {
      const payload = event.payload as { state: CopilotUIState };
      setCurrentState(payload.state);
      
      if (payload.state === 'wake_listening') {
        setIsWakeWordActive(true);
      } else if (payload.state === 'activated' || payload.state === 'listening') {
        setIsWakeWordActive(false);
      }
    });

    // Subscribe to errors
    const unsubscribeError = copilotEvents.on('error', (event) => {
      const payload = event.payload as { message: string };
      onError?.(payload.message);
      console.error('[CopilotUI] Error:', payload.message);
    });

    setIsInitialized(true);

    return () => {
      unsubscribe();
      unsubscribeError();
      cleanup();
    };
  }, [onError]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  // Handle mic activation
  const handleMicActivate = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // Set up audio analysis for volume levels
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Start volume monitoring
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      volumeIntervalRef.current = setInterval(() => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((a, b) => a + b, 0);
          const average = sum / dataArray.length;
          const normalizedVolume = Math.min(average / 128, 1);
          copilotEvents.emitVolumeChange(normalizedVolume);
        }
      }, 50);

      // Emit mic start event
      copilotEvents.emitMicStart();

      // Start speech recognition if available
      startSpeechRecognition();

    } catch (error) {
      console.error('[CopilotUI] Mic activation failed:', error);
      copilotEvents.emitError('Microphone access denied');
    }
  }, []);

  // Handle mic deactivation
  const handleMicDeactivate = useCallback(() => {
    cleanup();
    copilotEvents.emitMicStop();
    stopSpeechRecognition();
  }, [cleanup]);

  // Speech recognition
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const startSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[CopilotUI] Speech recognition not supported');
      return;
    }

    try {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const isFinal = result.isFinal;

        copilotEvents.emitTranscript(transcript, isFinal);

        if (isFinal) {
          // Process through CopilotBrain
          processThroughCopilotBrain(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('[CopilotUI] Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          copilotEvents.emitError(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        // Auto-restart if still in listening state
        if (currentState === 'listening' && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Ignore if already started
          }
        }
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error('[CopilotUI] Failed to start speech recognition:', error);
    }
  }, [currentState]);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      recognitionRef.current = null;
    }
  }, []);

  // Process transcript through CopilotBrain
  const processThroughCopilotBrain = useCallback(async (text: string) => {
    copilotEvents.emitThinking();

    try {
      // Import CopilotBrain and CopilotContext dynamically to avoid circular dependencies
      const { processQuestion } = await import('../../voice_copilot/CopilotBrain');
      const { createInitialContext } = await import('../../voice_copilot/CopilotContext');
      
      // Create a basic context for processing
      const context = createInitialContext();
      const response = processQuestion(text, context);
      
      copilotEvents.emitResponse(response.text, response.category);
      
      // Speak the response using TTS
      speakResponse(response.text);
    } catch (error) {
      console.error('[CopilotUI] CopilotBrain processing failed:', error);
      copilotEvents.emitError('Failed to process question');
      copilotEvents.setState('idle');
    }
  }, []);

  // Text-to-speech using TTSEngine (ElevenLabs/OpenAI with fallback)
  const speakResponse = useCallback(async (text: string) => {
    console.log('[CopilotUI] Speaking response via TTSEngine:', text.substring(0, 50) + '...');
    
    try {
      const result = await speak(text);
      console.log('[CopilotUI] TTSEngine result:', result);
      
      if (!result.success) {
        console.error('[CopilotUI] TTS failed:', result.error);
      }
    } catch (error) {
      console.error('[CopilotUI] TTS exception:', error);
      copilotEvents.emitSpeakingEnd();
    }
  }, []);

  // Handle orb click - toggle panel
  const handleOrbClick = useCallback(() => {
    if (enablePanel) {
      setIsPanelOpen(prev => !prev);
    }
  }, [enablePanel]);

  // Handle orb state change
  const handleOrbStateChange = useCallback((state: OrbState) => {
    // Additional state handling if needed
  }, []);

  // Toggle wake word
  const handleToggleWakeWord = useCallback((enabled: boolean) => {
    setWakeWordEnabled(enabled);
    if (enabled) {
      copilotEvents.setState('wake_listening');
    } else {
      copilotEvents.setState('idle');
    }
  }, []);

  if (!isInitialized) {
    return <div className="copilot-ui-loading" />;
  }

  return (
    <div className={`copilot-ui-root ${className}`}>
      {/* Wake Word Indicator */}
      {showWakeWordIndicator && (
        <WakeWordIndicator
          enabled={wakeWordEnabled}
          onToggle={handleToggleWakeWord}
        />
      )}

      {/* Singularity Orb */}
      <SingularityOrb
        onClick={handleOrbClick}
        onStateChange={handleOrbStateChange}
        showStatus={true}
      />

      {/* Mic Button */}
      {enableMicButton && (
        <MicButton
          onActivate={handleMicActivate}
          onDeactivate={handleMicDeactivate}
          wakeWordActive={isWakeWordActive}
          hideWhenWakeWordActive={false}
        />
      )}

      {/* Copilot Panel */}
      {enablePanel && (
        <CopilotPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          debugMode={debugMode}
          onToggleDebug={setDebugMode}
        />
      )}

      <style jsx>{`
        .copilot-ui-root {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 16px;
          pointer-events: none;
        }

        .copilot-ui-root > :global(*) {
          pointer-events: auto;
        }

        .copilot-ui-loading {
          display: none;
        }

        @media (max-width: 768px) {
          .copilot-ui-root {
            bottom: 16px;
            right: 16px;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export default CopilotUIRoot;
