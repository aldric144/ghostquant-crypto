'use client';

/**
 * WakeWordIndicator - Subtle banner showing wake word status
 * 
 * Shows "Say 'Hey GhostQuant' to begin" when wake word is active
 * Pulses softly when listening for wake word
 * Grays out when wake word is disabled
 */

import React, { useState, useEffect } from 'react';
import { copilotEvents, CopilotUIState } from '../../voice_copilot/CopilotEvents';

export interface WakeWordIndicatorProps {
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  className?: string;
}

export function WakeWordIndicator({
  enabled = true,
  onToggle,
  className = '',
}: WakeWordIndicatorProps): React.ReactElement {
  const [isListening, setIsListening] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  // Subscribe to copilot events
  useEffect(() => {
    const unsubscribe = copilotEvents.on('state_change', (event) => {
      const payload = event.payload as { state: CopilotUIState };
      
      switch (payload.state) {
        case 'wake_listening':
          setIsListening(true);
          setIsActivated(false);
          break;
        case 'activated':
          setIsActivated(true);
          setIsListening(false);
          break;
        case 'idle':
        case 'listening':
        case 'processing':
        case 'speaking':
        case 'error':
          setIsListening(false);
          setIsActivated(false);
          break;
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div 
      className={`wake-word-indicator ${className} ${enabled ? 'enabled' : 'disabled'} ${isListening ? 'listening' : ''} ${isActivated ? 'activated' : ''}`}
    >
      <div className="wake-word-content">
        <div className="wake-word-icon">
          {isActivated ? (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="currentColor" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="currentColor" />
            </svg>
          )}
        </div>
        <span className="wake-word-text">
          {isActivated 
            ? "GhostQuant activated!" 
            : enabled 
              ? "Say 'Hey GhostQuant' to begin" 
              : "Wake word disabled"}
        </span>
        {onToggle && (
          <button 
            className="wake-word-toggle"
            onClick={() => onToggle(!enabled)}
            aria-label={enabled ? 'Disable wake word' : 'Enable wake word'}
          >
            {enabled ? 'Disable' : 'Enable'}
          </button>
        )}
      </div>

      <style jsx>{`
        .wake-word-indicator {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          border-radius: 24px;
          border-left: 3px solid #FFD860;
          transition: all 0.3s ease;
        }

        .wake-word-indicator.disabled {
          border-left-color: #6B7280;
          opacity: 0.6;
        }

        .wake-word-indicator.listening {
          animation: wakeWordPulse 2s ease-in-out infinite;
        }

        .wake-word-indicator.activated {
          border-left-color: #10B981;
          background: rgba(16, 185, 129, 0.2);
        }

        @keyframes wakeWordPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 216, 96, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(255, 216, 96, 0);
          }
        }

        .wake-word-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .wake-word-icon {
          width: 18px;
          height: 18px;
          color: #FFD860;
          flex-shrink: 0;
        }

        .wake-word-indicator.disabled .wake-word-icon {
          color: #6B7280;
        }

        .wake-word-indicator.activated .wake-word-icon {
          color: #10B981;
        }

        .wake-word-icon svg {
          width: 100%;
          height: 100%;
        }

        .wake-word-text {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
          white-space: nowrap;
          font-weight: 500;
        }

        .wake-word-indicator.disabled .wake-word-text {
          color: rgba(255, 255, 255, 0.5);
        }

        .wake-word-toggle {
          margin-left: 8px;
          padding: 4px 10px;
          font-size: 11px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wake-word-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        @media (max-width: 480px) {
          .wake-word-indicator {
            padding: 6px 12px;
          }

          .wake-word-text {
            font-size: 12px;
          }

          .wake-word-toggle {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default WakeWordIndicator;
