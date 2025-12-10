'use client';

/**
 * VoiceModeSwitcher - UI Component for GhostQuant Voice Mode Selection
 * 
 * Allows users to switch between conversational (Adam) and mission briefing (Eric) voice modes.
 * Provides visual feedback and tooltips explaining mode differences.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  getVoiceMode,
  setVoiceMode,
  toggleVoiceMode,
  onModeChange,
  getAvailableVoiceModes,
} from '../../voice_copilot/voice/VoiceModeManager';
import { type VoiceMode } from '../../voice_copilot/ElevenLabsTTS';

export interface VoiceModeSwitcherProps {
  className?: string;
  compact?: boolean;
  showTooltips?: boolean;
  onModeChanged?: (mode: VoiceMode) => void;
}

export function VoiceModeSwitcher({
  className = '',
  compact = false,
  showTooltips = true,
  onModeChanged,
}: VoiceModeSwitcherProps) {
  const [currentMode, setCurrentMode] = useState<VoiceMode>('default');
  const [showTooltip, setShowTooltip] = useState<VoiceMode | null>(null);

  // Initialize from VoiceModeManager
  useEffect(() => {
    setCurrentMode(getVoiceMode());
    
    // Subscribe to mode changes
    const unsubscribe = onModeChange((mode) => {
      setCurrentMode(mode);
      onModeChanged?.(mode);
    });
    
    return unsubscribe;
  }, [onModeChanged]);

  // Handle mode selection
  const handleModeSelect = useCallback((mode: VoiceMode) => {
    setVoiceMode(mode);
  }, []);

  // Handle toggle
  const handleToggle = useCallback(() => {
    toggleVoiceMode();
  }, []);

  const modes = getAvailableVoiceModes();

  // Compact toggle style
  if (compact) {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <button
          onClick={handleToggle}
          className={`
            relative flex items-center justify-center w-12 h-6 rounded-full transition-all duration-300
            ${currentMode === 'mission' 
              ? 'bg-amber-500/30 border-amber-500/50' 
              : 'bg-cyan-500/30 border-cyan-500/50'
            }
            border hover:opacity-80
          `}
          title={currentMode === 'mission' ? 'Mission Briefing Mode (Eric)' : 'Conversational Mode (Adam)'}
        >
          <span 
            className={`
              absolute w-5 h-5 rounded-full transition-all duration-300 transform
              ${currentMode === 'mission' 
                ? 'translate-x-3 bg-amber-400' 
                : '-translate-x-3 bg-cyan-400'
              }
            `}
          />
        </button>
        <span className="ml-2 text-xs text-gray-400">
          {currentMode === 'mission' ? 'Mission' : 'Chat'}
        </span>
      </div>
    );
  }

  // Full button group style
  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        Voice Mode
      </label>
      <div className="flex gap-2">
        {modes.map(({ mode, name, description }) => (
          <div key={mode} className="relative">
            <button
              onClick={() => handleModeSelect(mode)}
              onMouseEnter={() => showTooltips && setShowTooltip(mode)}
              onMouseLeave={() => setShowTooltip(null)}
              className={`
                px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2
                ${currentMode === mode
                  ? mode === 'mission'
                    ? 'bg-amber-500/30 border-amber-500 text-amber-300 border'
                    : 'bg-cyan-500/30 border-cyan-500 text-cyan-300 border'
                  : 'bg-gray-800/50 border-gray-600/30 text-gray-400 border hover:bg-gray-700/50'
                }
              `}
            >
              {mode === 'mission' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )}
              <span>{mode === 'mission' ? 'Mission Briefing' : 'Conversational'}</span>
            </button>
            
            {/* Tooltip */}
            {showTooltips && showTooltip === mode && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 w-48 text-center">
                <p className="text-xs text-gray-300">{description}</p>
                <p className="text-xs text-gray-500 mt-1">Voice: {name}</p>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 border-r border-b border-gray-700" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Singularity Orb glow color based on voice mode
 * Use this to adjust the orb's appearance when in mission mode
 */
export function getOrbGlowColor(mode: VoiceMode): string {
  return mode === 'mission' ? 'rgba(251, 191, 36, 0.6)' : 'rgba(34, 211, 238, 0.6)';
}

/**
 * Get CSS class for orb glow based on voice mode
 */
export function getOrbGlowClass(mode: VoiceMode): string {
  return mode === 'mission' ? 'shadow-amber-500/50' : 'shadow-cyan-500/50';
}

export default VoiceModeSwitcher;
