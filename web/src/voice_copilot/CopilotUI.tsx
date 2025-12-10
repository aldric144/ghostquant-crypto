'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';

export interface CopilotUIProps {
  isOpen: boolean;
  onToggle: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  wakeWordStatus: 'disabled' | 'listening' | 'triggered' | 'unsupported';
}

export default function CopilotUI({
  isOpen,
  onToggle,
  isListening,
  isSpeaking,
  wakeWordStatus,
}: CopilotUIProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine the status indicator color
  const getStatusColor = () => {
    if (isListening) return 'bg-red-400';
    if (isSpeaking) return 'bg-cyan-400';
    if (wakeWordStatus === 'listening') return 'bg-green-400';
    return 'bg-gray-400';
  };

  // Determine if we should show the pulse animation
  const shouldPulse = isListening || isSpeaking || wakeWordStatus === 'listening';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating Action Button */}
      <button
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative w-14 h-14 rounded-full shadow-lg transition-all duration-300
          ${isOpen 
            ? 'bg-cyan-500 text-white scale-90' 
            : 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white hover:scale-110'
          }
          ${shouldPulse && !isOpen ? 'animate-pulse' : ''}
        `}
        title="GhostQuant Voice Copilot"
        aria-label="Toggle Voice Copilot"
      >
        {/* Main Icon */}
        <div className="flex items-center justify-center w-full h-full">
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="relative">
              <span className="text-2xl">🤖</span>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        {!isOpen && (
          <div
            className={`
              absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900
              ${getStatusColor()}
              ${shouldPulse ? 'animate-pulse' : ''}
            `}
          />
        )}

        {/* Ripple Effect on Listening */}
        {isListening && !isOpen && (
          <>
            <div className="absolute inset-0 rounded-full bg-red-400/30 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-red-400/20 animate-pulse" />
          </>
        )}

        {/* Wake Word Triggered Effect */}
        {wakeWordStatus === 'triggered' && !isOpen && (
          <div className="absolute inset-0 rounded-full bg-cyan-400/50 animate-ping" />
        )}
      </button>

      {/* Tooltip */}
      {isHovered && !isOpen && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg shadow-lg whitespace-nowrap">
          <p className="text-sm text-cyan-400 font-medium">GhostQuant Copilot</p>
          <p className="text-xs text-gray-400">
            {wakeWordStatus === 'listening' 
              ? 'Say "Hey GhostQuant"' 
              : 'Click to open'}
          </p>
          <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800 border-r border-b border-cyan-500/30" />
        </div>
      )}
    </div>
  );
}
