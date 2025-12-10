'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Send, Settings, Copy, Check } from 'lucide-react';

export interface CopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  wakeWordEnabled: boolean;
  wakeWordStatus: 'disabled' | 'listening' | 'triggered' | 'unsupported';
  transcript: string;
  lastAnswer: string;
  sttSupported: boolean;
  ttsSupported: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onToggleWakeWord: () => void;
  onStopSpeaking: () => void;
  onAskQuestion: (question: string) => void;
  contextSummary: string;
}

export default function CopilotPanel({
  isOpen,
  onClose,
  isListening,
  isSpeaking,
  wakeWordEnabled,
  wakeWordStatus,
  transcript,
  lastAnswer,
  sttSupported,
  ttsSupported,
  onStartListening,
  onStopListening,
  onToggleWakeWord,
  onStopSpeaking,
  onAskQuestion,
  contextSummary,
}: CopilotPanelProps) {
  const [textInput, setTextInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest answer
  useEffect(() => {
    if (lastAnswer && answerRef.current) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [lastAnswer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      onAskQuestion(textInput.trim());
      setTextInput('');
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  const handleCopyAnswer = () => {
    if (lastAnswer) {
      navigator.clipboard.writeText(lastAnswer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 w-96 max-w-[calc(100vw-2rem)] bg-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/10 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-900/20 to-slate-900">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            {wakeWordStatus === 'listening' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-cyan-400">GhostQuant Copilot</h3>
            <p className="text-xs text-gray-400">Voice-activated assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-cyan-500/20 bg-slate-800/50">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Settings</h4>
          
          {/* Wake Word Toggle */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-300">Wake Word Detection</p>
              <p className="text-xs text-gray-500">Say "Hey GhostQuant" to activate</p>
            </div>
            <button
              onClick={onToggleWakeWord}
              disabled={wakeWordStatus === 'unsupported'}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                wakeWordEnabled ? 'bg-cyan-500' : 'bg-slate-600'
              } ${wakeWordStatus === 'unsupported' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  wakeWordEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {wakeWordStatus === 'unsupported' && (
            <p className="text-xs text-yellow-400 mb-2">
              Wake word not supported in this browser. Use the mic button instead.
            </p>
          )}

          {/* Context Info */}
          <div className="mt-3 p-2 bg-slate-900/50 rounded-lg">
            <p className="text-xs text-gray-400">Current Context:</p>
            <p className="text-xs text-cyan-400 mt-1">{contextSummary || 'No context'}</p>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="px-4 py-2 bg-slate-800/30 border-b border-cyan-500/10">
        <div className="flex items-center gap-2">
          {isListening && (
            <>
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span className="text-xs text-red-400">Listening...</span>
            </>
          )}
          {isSpeaking && (
            <>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-xs text-cyan-400">Speaking...</span>
            </>
          )}
          {!isListening && !isSpeaking && wakeWordStatus === 'listening' && (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Wake word active</span>
            </>
          )}
          {!isListening && !isSpeaking && wakeWordStatus !== 'listening' && (
            <>
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span className="text-xs text-gray-400">Ready</span>
            </>
          )}
        </div>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="px-4 py-3 bg-slate-800/20 border-b border-cyan-500/10">
          <p className="text-xs text-gray-400 mb-1">You said:</p>
          <p className="text-sm text-gray-200">{transcript}</p>
        </div>
      )}

      {/* Answer Display */}
      <div
        ref={answerRef}
        className="p-4 max-h-64 overflow-y-auto"
      >
        {lastAnswer ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-lg flex-shrink-0">🤖</span>
              <div className="flex-1">
                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {lastAnswer}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCopyAnswer}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-cyan-400 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">
              {sttSupported 
                ? 'Click the mic or say "Hey GhostQuant" to ask a question'
                : 'Type your question below to get started'}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['What is Hydra?', 'Explain this screen', 'Give me a briefing'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onAskQuestion(suggestion)}
                  className="px-3 py-1.5 bg-slate-800/50 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/50 rounded-lg text-xs text-gray-300 hover:text-cyan-400 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-cyan-500/20 bg-slate-800/30">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Mic Button */}
          {sttSupported && (
            <button
              type="button"
              onClick={handleMicClick}
              className={`p-3 rounded-full transition-all ${
                isListening
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50'
              }`}
              title={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          {/* Text Input */}
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Ask GhostQuant..."
            className="flex-1 px-4 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!textInput.trim()}
            className="p-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full hover:border-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send"
          >
            <Send className="w-5 h-5" />
          </button>

          {/* Stop Speaking Button */}
          {ttsSupported && isSpeaking && (
            <button
              type="button"
              onClick={onStopSpeaking}
              className="p-3 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full hover:border-orange-500/50 transition-all"
              title="Stop speaking"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
