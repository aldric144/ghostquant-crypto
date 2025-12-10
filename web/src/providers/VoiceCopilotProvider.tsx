'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  createSpeechToTextEngine,
  createWakeWordEngine,
  createMicEngine,
  createTextToSpeechEngine,
  processQuestion,
  generateGreeting,
  createInitialContext,
  updateContextFromPath,
  getContextSummary,
  CopilotPanel,
  CopilotUI,
} from '@/voice_copilot';
import type {
  SpeechToTextEngine,
  WakeWordEngine,
  MicEngine,
  TextToSpeechEngine,
  WakeWordStatus,
  CopilotContextState,
} from '@/voice_copilot';

interface VoiceCopilotState {
  isOpen: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  wakeWordEnabled: boolean;
  wakeWordStatus: WakeWordStatus;
  transcript: string;
  lastAnswer: string;
  sttSupported: boolean;
  ttsSupported: boolean;
  contextSummary: string;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  toggleWakeWord: () => void;
  startListening: () => void;
  stopListening: () => void;
  stopSpeaking: () => void;
  ask: (question: string) => void;
}

const VoiceCopilotContext = createContext<VoiceCopilotState | undefined>(undefined);

export function useVoiceCopilot() {
  const ctx = useContext(VoiceCopilotContext);
  if (!ctx) {
    throw new Error('useVoiceCopilot must be used within VoiceCopilotProvider');
  }
  return ctx;
}

interface VoiceCopilotProviderProps {
  children: React.ReactNode;
}

export default function VoiceCopilotProvider({ children }: VoiceCopilotProviderProps) {
  const pathname = usePathname();
  
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);
  const [wakeWordStatus, setWakeWordStatus] = useState<WakeWordStatus>('disabled');
  const [transcript, setTranscript] = useState('');
  const [lastAnswer, setLastAnswer] = useState('');
  const [sttSupported, setSttSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [context, setContext] = useState<CopilotContextState>(createInitialContext());

  // Engine refs
  const sttEngineRef = useRef<SpeechToTextEngine | null>(null);
  const wakeWordEngineRef = useRef<WakeWordEngine | null>(null);
  const micEngineRef = useRef<MicEngine | null>(null);
  const ttsEngineRef = useRef<TextToSpeechEngine | null>(null);

  // Initialize engines on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize STT Engine
    const sttEngine = createSpeechToTextEngine();
    sttEngineRef.current = sttEngine;
    setSttSupported(sttEngine.supported);

    // Initialize Wake Word Engine
    const wakeWordEngine = createWakeWordEngine();
    wakeWordEngineRef.current = wakeWordEngine;

    // Initialize Mic Engine
    const micEngine = createMicEngine();
    micEngineRef.current = micEngine;

    // Initialize TTS Engine
    const ttsEngine = createTextToSpeechEngine();
    ttsEngineRef.current = ttsEngine;
    setTtsSupported(ttsEngine.supported);
    ttsEngine.loadVoices();

    // Set up TTS callbacks
    ttsEngine.setCallbacks({
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: (error) => console.warn('[TTS Error]', error),
    });

    // Cleanup
    return () => {
      if (sttEngineRef.current) {
        sttEngineRef.current.stop();
      }
      if (wakeWordEngineRef.current) {
        wakeWordEngineRef.current.disable();
      }
      if (ttsEngineRef.current) {
        ttsEngineRef.current.stop();
      }
    };
  }, []);

  // Update context when pathname changes
  useEffect(() => {
    setContext(prev => updateContextFromPath(prev, pathname));
  }, [pathname]);

  // Process a question and generate response
  const processAndRespond = useCallback((question: string) => {
    setTranscript(question);
    
    // Process with CopilotBrain
    const answer = processQuestion(question, context);
    setLastAnswer(answer.text);

    // Speak the response if TTS is available
    if (ttsEngineRef.current?.supported) {
      ttsEngineRef.current.speak(answer.text);
    }
  }, [context]);

  // Start listening for voice input
  const startListening = useCallback(async () => {
    if (!sttEngineRef.current?.supported) return;

    // Request mic permission first
    if (micEngineRef.current) {
      const granted = await micEngineRef.current.requestPermission();
      if (!granted) return;
    }

    // Set up STT callbacks
    sttEngineRef.current.setCallbacks({
      onTranscript: (text, isFinal) => {
        setTranscript(text);
        if (isFinal && text.trim()) {
          processAndRespond(text);
          setIsListening(false);
        }
      },
      onError: (error) => {
        console.warn('[STT Error]', error);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
      onStart: () => {
        setIsListening(true);
      },
    });

    sttEngineRef.current.startOnce();
  }, [processAndRespond]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (sttEngineRef.current) {
      sttEngineRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (ttsEngineRef.current) {
      ttsEngineRef.current.stop();
    }
    setIsSpeaking(false);
  }, []);

  // Toggle wake word detection
  const toggleWakeWord = useCallback(async () => {
    if (!wakeWordEngineRef.current?.supported) return;

    if (wakeWordEnabled) {
      wakeWordEngineRef.current.disable();
      setWakeWordEnabled(false);
      setWakeWordStatus('disabled');
    } else {
      // Request mic permission first
      if (micEngineRef.current) {
        const granted = await micEngineRef.current.requestPermission();
        if (!granted) return;
      }

      // Set up wake word callbacks
      wakeWordEngineRef.current.setCallbacks({
        onWake: () => {
          // Open panel and start listening when wake word detected
          setIsOpen(true);
          startListening();
        },
        onStatusChange: (status) => {
          setWakeWordStatus(status);
        },
      });

      wakeWordEngineRef.current.enable();
      setWakeWordEnabled(true);
    }
  }, [wakeWordEnabled, startListening]);

  // Ask a question (text input)
  const ask = useCallback((question: string) => {
    processAndRespond(question);
  }, [processAndRespond]);

  // Panel controls
  const openPanel = useCallback(() => {
    setIsOpen(true);
    // Generate greeting if no previous answer
    if (!lastAnswer) {
      const greeting = generateGreeting(context);
      setLastAnswer(greeting);
      if (ttsEngineRef.current?.supported) {
        ttsEngineRef.current.speak(greeting);
      }
    }
  }, [context, lastAnswer]);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    stopListening();
    stopSpeaking();
  }, [stopListening, stopSpeaking]);

  const togglePanel = useCallback(() => {
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }, [isOpen, openPanel, closePanel]);

  const contextSummary = getContextSummary(context);

  const value: VoiceCopilotState = {
    isOpen,
    isListening,
    isSpeaking,
    wakeWordEnabled,
    wakeWordStatus,
    transcript,
    lastAnswer,
    sttSupported,
    ttsSupported,
    contextSummary,
    openPanel,
    closePanel,
    togglePanel,
    toggleWakeWord,
    startListening,
    stopListening,
    stopSpeaking,
    ask,
  };

  return (
    <VoiceCopilotContext.Provider value={value}>
      {children}
      
      {/* Floating UI Button */}
      <CopilotUI
        isOpen={isOpen}
        onToggle={togglePanel}
        isListening={isListening}
        isSpeaking={isSpeaking}
        wakeWordStatus={wakeWordStatus}
      />

      {/* Copilot Panel */}
      <CopilotPanel
        isOpen={isOpen}
        onClose={closePanel}
        isListening={isListening}
        isSpeaking={isSpeaking}
        wakeWordEnabled={wakeWordEnabled}
        wakeWordStatus={wakeWordStatus}
        transcript={transcript}
        lastAnswer={lastAnswer}
        sttSupported={sttSupported}
        ttsSupported={ttsSupported}
        onStartListening={startListening}
        onStopListening={stopListening}
        onToggleWakeWord={toggleWakeWord}
        onStopSpeaking={stopSpeaking}
        onAskQuestion={ask}
        contextSummary={contextSummary}
      />
    </VoiceCopilotContext.Provider>
  );
}
