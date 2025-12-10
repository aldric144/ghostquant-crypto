'use client';

/**
 * MicButton - Floating microphone button for GhostQuant Voice Copilot
 * 
 * States:
 * - IDLE: Ready to listen
 * - LISTENING: Actively recording
 * - PROCESSING: Sending to CopilotBrain
 * - SPEAKING: TTS playing response
 */

import React, { useState, useEffect, useCallback } from 'react';
import { copilotEvents, CopilotUIState } from '../../voice_copilot/CopilotEvents';

export type MicButtonState = 'idle' | 'listening' | 'processing' | 'speaking';

export interface MicButtonProps {
  onActivate?: () => void;
  onDeactivate?: () => void;
  hideWhenWakeWordActive?: boolean;
  wakeWordActive?: boolean;
  disabled?: boolean;
  className?: string;
}

const STATE_COLORS: Record<MicButtonState, string> = {
  idle: '#10B981',      // Emerald
  listening: '#3B82F6', // Blue
  processing: '#8B5CF6', // Purple
  speaking: '#10B981',  // Emerald
};

const STATE_LABELS: Record<MicButtonState, string> = {
  idle: 'Tap to speak',
  listening: 'Listening...',
  processing: 'Processing...',
  speaking: 'Speaking...',
};

export function MicButton({
  onActivate,
  onDeactivate,
  hideWhenWakeWordActive = true,
  wakeWordActive = false,
  disabled = false,
  className = '',
}: MicButtonProps): React.ReactElement | null {
  const [state, setState] = useState<MicButtonState>('idle');
  const [isHovered, setIsHovered] = useState(false);

  // Subscribe to copilot events
  useEffect(() => {
    const unsubscribe = copilotEvents.on('state_change', (event) => {
      const payload = event.payload as { state: CopilotUIState };
      
      switch (payload.state) {
        case 'idle':
        case 'wake_listening':
          setState('idle');
          break;
        case 'activated':
        case 'listening':
          setState('listening');
          break;
        case 'processing':
          setState('processing');
          break;
        case 'speaking':
          setState('speaking');
          break;
        case 'error':
          setState('idle');
          break;
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle click
  const handleClick = useCallback(() => {
    if (disabled) return;

    if (state === 'idle') {
      copilotEvents.emitMicStart();
      onActivate?.();
    } else if (state === 'listening') {
      copilotEvents.emitMicStop();
      onDeactivate?.();
    }
  }, [state, disabled, onActivate, onDeactivate]);

  // Hide when wake word is active
  if (hideWhenWakeWordActive && wakeWordActive) {
    return null;
  }

  const currentColor = STATE_COLORS[state];
  const isActive = state === 'listening' || state === 'processing' || state === 'speaking';

  return (
    <div className={`mic-button-container ${className}`}>
      <button
        className={`mic-button mic-button-${state} ${isActive ? 'mic-button-active' : ''}`}
        onClick={handleClick}
        disabled={disabled || state === 'processing' || state === 'speaking'}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={STATE_LABELS[state]}
        title={STATE_LABELS[state]}
        style={{
          '--mic-color': currentColor,
          '--mic-glow': `${currentColor}66`,
        } as React.CSSProperties}
      >
        {/* Mic Icon */}
        <svg
          className="mic-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {state === 'listening' ? (
            // Animated waves when listening
            <>
              <path
                d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                fill="currentColor"
              />
              <path
                d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                fill="currentColor"
              />
              <circle className="mic-wave mic-wave-1" cx="12" cy="11" r="8" />
              <circle className="mic-wave mic-wave-2" cx="12" cy="11" r="12" />
            </>
          ) : (
            // Static mic icon
            <>
              <path
                d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                fill="currentColor"
              />
              <path
                d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                fill="currentColor"
              />
            </>
          )}
        </svg>

        {/* Processing spinner */}
        {state === 'processing' && (
          <div className="mic-spinner" />
        )}
      </button>

      {/* Tooltip */}
      {isHovered && state === 'idle' && (
        <div className="mic-tooltip">
          Tap to speak to GhostQuant
        </div>
      )}

      <style jsx>{`
        .mic-button-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .mic-button {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 2px solid var(--mic-color, #10B981);
          background: rgba(0, 0, 0, 0.8);
          color: var(--mic-color, #10B981);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 
            0 0 20px var(--mic-glow, rgba(16, 185, 129, 0.4)),
            inset 0 0 10px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
        }

        .mic-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 
            0 0 30px var(--mic-glow, rgba(16, 185, 129, 0.6)),
            inset 0 0 10px rgba(0, 0, 0, 0.5);
        }

        .mic-button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .mic-button-active {
          animation: micPulse 1.5s ease-in-out infinite;
        }

        .mic-button-listening {
          border-color: #3B82F6;
          color: #3B82F6;
        }

        .mic-button-processing {
          border-color: #8B5CF6;
          color: #8B5CF6;
        }

        .mic-button-speaking {
          border-color: #10B981;
          color: #10B981;
        }

        @keyframes micPulse {
          0%, 100% {
            box-shadow: 
              0 0 20px var(--mic-glow),
              inset 0 0 10px rgba(0, 0, 0, 0.5);
          }
          50% {
            box-shadow: 
              0 0 40px var(--mic-glow),
              inset 0 0 10px rgba(0, 0, 0, 0.5);
          }
        }

        .mic-icon {
          width: 24px;
          height: 24px;
        }

        .mic-wave {
          fill: none;
          stroke: currentColor;
          stroke-width: 1;
          opacity: 0;
          animation: micWave 1.5s ease-out infinite;
        }

        .mic-wave-1 {
          animation-delay: 0s;
        }

        .mic-wave-2 {
          animation-delay: 0.5s;
        }

        @keyframes micWave {
          0% {
            opacity: 0.6;
            r: 8;
          }
          100% {
            opacity: 0;
            r: 20;
          }
        }

        .mic-spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 40px;
          height: 40px;
          margin: -20px 0 0 -20px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .mic-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          font-size: 12px;
          border-radius: 6px;
          white-space: nowrap;
          pointer-events: none;
          animation: fadeIn 0.2s ease;
        }

        .mic-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: rgba(0, 0, 0, 0.9);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default MicButton;
