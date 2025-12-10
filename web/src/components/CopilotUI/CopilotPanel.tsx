'use client';

/**
 * CopilotPanel - Sliding drawer for transcript history and debug mode
 * 
 * Features:
 * - Transcript history with user/assistant messages
 * - Debug mode toggle
 * - Accessible by clicking the Orb
 */

import React, { useState, useEffect, useRef } from 'react';
import { copilotEvents, CopilotEvent } from '../../voice_copilot/CopilotEvents';

export interface TranscriptMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface CopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  debugMode?: boolean;
  onToggleDebug?: (enabled: boolean) => void;
  className?: string;
}

export function CopilotPanel({
  isOpen,
  onClose,
  debugMode = false,
  onToggleDebug,
  className = '',
}: CopilotPanelProps): React.ReactElement {
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [events, setEvents] = useState<CopilotEvent[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Subscribe to transcript and response events
  useEffect(() => {
    const unsubscribeTranscript = copilotEvents.on('transcript', (event) => {
      const payload = event.payload as { text: string; isFinal: boolean };
      if (payload.isFinal && payload.text.trim()) {
        setMessages(prev => [...prev, {
          id: `user-${Date.now()}`,
          role: 'user',
          text: payload.text,
          timestamp: event.timestamp,
        }]);
      }
    });

    const unsubscribeResponse = copilotEvents.on('response', (event) => {
      const payload = event.payload as { text: string; category: string };
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: payload.text,
        timestamp: event.timestamp,
      }]);
    });

    // Debug mode: capture all events
    const unsubscribeAll = copilotEvents.onAll((event) => {
      if (debugMode) {
        setEvents(prev => [...prev.slice(-50), event]);
      }
    });

    return () => {
      unsubscribeTranscript();
      unsubscribeResponse();
      unsubscribeAll();
    };
  }, [debugMode]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (contentRef.current && isOpen) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [messages, events, isOpen]);

  const clearHistory = () => {
    setMessages([]);
    setEvents([]);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className={`copilot-panel ${isOpen ? 'open' : ''} ${className}`}>
      {/* Header */}
      <div className="copilot-panel-header">
        <div className="copilot-panel-title">
          GhostQuant Copilot
        </div>
        <div className="copilot-panel-actions">
          {onToggleDebug && (
            <button 
              className={`copilot-panel-debug ${debugMode ? 'active' : ''}`}
              onClick={() => onToggleDebug(!debugMode)}
              title={debugMode ? 'Disable debug mode' : 'Enable debug mode'}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z" fill="currentColor"/>
              </svg>
            </button>
          )}
          <button 
            className="copilot-panel-clear"
            onClick={clearHistory}
            title="Clear history"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
            </svg>
          </button>
          <button 
            className="copilot-panel-close"
            onClick={onClose}
            aria-label="Close panel"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="copilot-panel-content" ref={contentRef}>
        {debugMode ? (
          // Debug view
          <div className="copilot-debug-view">
            {events.length === 0 ? (
              <div className="copilot-empty">
                <p>Debug mode active</p>
                <p className="copilot-empty-hint">Events will appear here</p>
              </div>
            ) : (
              events.map((event, index) => (
                <div key={index} className="copilot-debug-event">
                  <div className="copilot-debug-time">{formatTime(event.timestamp)}</div>
                  <div className="copilot-debug-type">{event.type}</div>
                  {event.payload !== undefined && event.payload !== null && (
                    <pre className="copilot-debug-payload">
                      {JSON.stringify(event.payload as Record<string, unknown>, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          // Transcript view
          <div className="copilot-transcript-view">
            {messages.length === 0 ? (
              <div className="copilot-empty">
                <div className="copilot-empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="currentColor" opacity="0.5"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="currentColor" opacity="0.5"/>
                  </svg>
                </div>
                <p>No conversation yet</p>
                <p className="copilot-empty-hint">Say "Hey GhostQuant" or tap the mic</p>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`copilot-message copilot-message-${message.role}`}
                >
                  <div className="copilot-message-label">
                    {message.role === 'user' ? 'You' : 'GhostQuant'}
                  </div>
                  <div className="copilot-message-text">{message.text}</div>
                  <div className="copilot-message-time">{formatTime(message.timestamp)}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .copilot-panel {
          position: fixed;
          bottom: 120px;
          right: 24px;
          width: 360px;
          max-height: 500px;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          transform: translateY(20px);
          opacity: 0;
          visibility: hidden;
          transition: all 300ms ease;
          z-index: 9999;
        }

        .copilot-panel.open {
          transform: translateY(0);
          opacity: 1;
          visibility: visible;
        }

        .copilot-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .copilot-panel-title {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .copilot-panel-title::before {
          content: '';
          width: 8px;
          height: 8px;
          background: #10B981;
          border-radius: 50%;
          box-shadow: 0 0 8px #10B981;
        }

        .copilot-panel-actions {
          display: flex;
          gap: 8px;
        }

        .copilot-panel-debug,
        .copilot-panel-clear,
        .copilot-panel-close {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 150ms ease;
        }

        .copilot-panel-debug:hover,
        .copilot-panel-clear:hover,
        .copilot-panel-close:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .copilot-panel-debug.active {
          background: rgba(139, 92, 246, 0.3);
          color: #A78BFA;
        }

        .copilot-panel-debug svg,
        .copilot-panel-clear svg,
        .copilot-panel-close svg {
          width: 16px;
          height: 16px;
        }

        .copilot-panel-content {
          padding: 16px;
          max-height: 400px;
          overflow-y: auto;
        }

        .copilot-panel-content::-webkit-scrollbar {
          width: 6px;
        }

        .copilot-panel-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .copilot-panel-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .copilot-empty {
          text-align: center;
          padding: 40px 20px;
          color: rgba(255, 255, 255, 0.5);
        }

        .copilot-empty-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 16px;
          color: rgba(255, 255, 255, 0.3);
        }

        .copilot-empty-icon svg {
          width: 100%;
          height: 100%;
        }

        .copilot-empty p {
          margin: 0;
          font-size: 14px;
        }

        .copilot-empty-hint {
          font-size: 12px !important;
          margin-top: 8px !important;
          color: rgba(255, 255, 255, 0.4);
        }

        .copilot-message {
          margin-bottom: 12px;
          padding: 12px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.5;
        }

        .copilot-message-user {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: rgba(255, 255, 255, 0.95);
          margin-left: 24px;
        }

        .copilot-message-assistant {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: rgba(255, 255, 255, 0.95);
          margin-right: 24px;
        }

        .copilot-message-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 4px;
        }

        .copilot-message-text {
          word-wrap: break-word;
        }

        .copilot-message-time {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 6px;
          text-align: right;
        }

        .copilot-debug-event {
          margin-bottom: 12px;
          padding: 10px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          font-family: monospace;
          font-size: 11px;
        }

        .copilot-debug-time {
          color: rgba(255, 255, 255, 0.5);
          font-size: 10px;
        }

        .copilot-debug-type {
          color: #A78BFA;
          font-weight: 600;
          margin: 4px 0;
        }

        .copilot-debug-payload {
          margin: 8px 0 0;
          padding: 8px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          color: rgba(255, 255, 255, 0.7);
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }

        @media (max-width: 768px) {
          .copilot-panel {
            right: 16px;
            left: 16px;
            width: auto;
            bottom: 100px;
          }
        }
      `}</style>
    </div>
  );
}

export default CopilotPanel;
