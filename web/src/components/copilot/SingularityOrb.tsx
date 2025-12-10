'use client';

/**
 * SingularityOrb - Premium GhostQuant Voice Copilot UI
 * A futuristic, cinematic orb that represents the AI consciousness
 * 
 * States:
 * - IDLE: Soft pulsing emerald glow (dormant awareness)
 * - WAKE_WORD_DETECTED: Gold ripple expansion ("Hey GhostQuant")
 * - LISTENING: Audio-reactive blue pulse (mic active)
 * - THINKING: Neural spark purple effect (processing)
 * - SPEAKING: Rhythm glow with rotation (TTS active)
 * - INSIGHT: Color burst based on detection type
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './SingularityOrbStyles.css';
import { 
  OrbState, 
  InsightType, 
  generateSparkPositions, 
  calculateVolumeScale,
  ORB_COLORS,
} from './SingularityOrbAnimations';

export interface SingularityOrbProps {
  initialState?: OrbState;
  onOrbClick?: () => void;
  onMicClick?: () => void;
  showMicButton?: boolean;
  showFallbackBanner?: boolean;
  fallbackMessage?: string;
  insightType?: InsightType;
  volumeLevel?: number;
  disabled?: boolean;
}

export interface SingularityOrbRef {
  setState: (state: OrbState) => void;
  getState: () => OrbState;
  triggerInsight: (type: InsightType) => void;
  setVolumeLevel: (level: number) => void;
}

const STATE_LABELS: Record<OrbState, string> = {
  IDLE: 'Ready',
  WAKE_WORD_DETECTED: 'Activated',
  LISTENING: 'Listening...',
  THINKING: 'Thinking...',
  SPEAKING: 'Speaking',
  INSIGHT: 'Alert',
};

const STATE_CLASSES: Record<OrbState, string> = {
  IDLE: 'orb-idle',
  WAKE_WORD_DETECTED: 'orb-activated',
  LISTENING: 'orb-listening',
  THINKING: 'orb-thinking',
  SPEAKING: 'orb-speaking',
  INSIGHT: 'orb-insight',
};

export function SingularityOrb({
  initialState = 'IDLE',
  onOrbClick,
  onMicClick,
  showMicButton = false,
  showFallbackBanner = false,
  fallbackMessage = 'Wake-word unavailable — tap mic to activate',
  insightType = 'default',
  volumeLevel = 0,
  disabled = false,
}: SingularityOrbProps): React.ReactElement {
  const [state, setState] = useState<OrbState>(initialState);
  const [currentInsightType, setCurrentInsightType] = useState<InsightType>(insightType);
  const [volume, setVolume] = useState<number>(volumeLevel);
  const [showSpotlight, setShowSpotlight] = useState<boolean>(false);

  // Generate neural spark positions for thinking state
  const sparkPositions = useMemo(() => generateSparkPositions(12), []);

  // Update volume level
  useEffect(() => {
    setVolume(volumeLevel);
  }, [volumeLevel]);

  // Handle state changes
  useEffect(() => {
    // Show spotlight on activation
    if (state === 'WAKE_WORD_DETECTED' || state === 'LISTENING') {
      setShowSpotlight(true);
    } else if (state === 'IDLE') {
      setShowSpotlight(false);
    }
  }, [state]);

  // Handle orb click
  const handleOrbClick = useCallback(() => {
    if (disabled) return;
    
    if (onOrbClick) {
      onOrbClick();
    } else {
      // Default behavior: toggle between idle and listening
      if (state === 'IDLE') {
        setState('LISTENING');
      } else if (state === 'LISTENING') {
        setState('IDLE');
      }
    }
  }, [disabled, onOrbClick, state]);

  // Handle mic button click
  const handleMicClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    
    if (onMicClick) {
      onMicClick();
    } else {
      setState('LISTENING');
    }
  }, [disabled, onMicClick]);

  // Trigger insight animation
  const triggerInsight = useCallback((type: InsightType) => {
    setCurrentInsightType(type);
    setState('INSIGHT');
    
    // Return to idle after animation
    setTimeout(() => {
      setState('IDLE');
    }, 1200);
  }, []);

  // Calculate volume-based scale for listening state
  const volumeScale = useMemo(() => {
    if (state === 'LISTENING') {
      return calculateVolumeScale(volume);
    }
    return 1;
  }, [state, volume]);

  // Build class names
  const orbClassName = useMemo(() => {
    const classes = ['singularity-orb', STATE_CLASSES[state]];
    
    if (state === 'INSIGHT') {
      classes.push(`orb-insight-${currentInsightType}`);
    }
    
    if (disabled) {
      classes.push('orb-disabled');
    }
    
    return classes.join(' ');
  }, [state, currentInsightType, disabled]);

  // Inline style for volume-based scaling
  const orbStyle: React.CSSProperties = useMemo(() => ({
    '--volume-scale': volumeScale,
  } as React.CSSProperties), [volumeScale]);

  return (
    <>
      {/* Spotlight overlay */}
      <div className={`orb-spotlight ${showSpotlight ? 'active' : ''}`} />
      
      {/* Fallback banner */}
      {showFallbackBanner && (
        <div className="wake-word-fallback-banner">
          {fallbackMessage}
        </div>
      )}
      
      {/* Main orb container */}
      <div className={`singularity-orb-container ${state !== 'IDLE' ? 'expanded' : ''}`}>
        {/* The Orb */}
        <div
          className={orbClassName}
          style={orbStyle}
          onClick={handleOrbClick}
          role="button"
          tabIndex={0}
          aria-label={`GhostQuant Copilot - ${STATE_LABELS[state]}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleOrbClick();
            }
          }}
        >
          {/* Neural sparks for thinking state */}
          {state === 'THINKING' && (
            <div className="neural-sparks">
              {sparkPositions.map((spark, index) => (
                <div
                  key={index}
                  className="neural-spark"
                  style={{
                    '--spark-x': `${spark.x}px`,
                    '--spark-y': `${spark.y}px`,
                    animationDelay: `${spark.delay}ms`,
                    top: '50%',
                    left: '50%',
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}
          
          {/* Ripple effect for wake word */}
          {state === 'WAKE_WORD_DETECTED' && (
            <>
              <div className="orb-ripple" style={{ animationDelay: '0ms' }} />
              <div className="orb-ripple" style={{ animationDelay: '150ms' }} />
              <div className="orb-ripple" style={{ animationDelay: '300ms' }} />
            </>
          )}
        </div>
        
        {/* Status label */}
        <span className="orb-status">{STATE_LABELS[state]}</span>
        
        {/* Mic button fallback */}
        {showMicButton && (
          <button
            className="orb-mic-button"
            onClick={handleMicClick}
            aria-label="Tap to speak"
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}

// Export state setter functions for external control
export function createOrbController() {
  let currentState: OrbState = 'IDLE';
  let stateChangeCallback: ((state: OrbState) => void) | null = null;
  let insightCallback: ((type: InsightType) => void) | null = null;
  let volumeCallback: ((level: number) => void) | null = null;

  return {
    // Set the state change callback
    onStateChange(callback: (state: OrbState) => void) {
      stateChangeCallback = callback;
    },

    // Set the insight callback
    onInsight(callback: (type: InsightType) => void) {
      insightCallback = callback;
    },

    // Set the volume callback
    onVolumeChange(callback: (level: number) => void) {
      volumeCallback = callback;
    },

    // Change the orb state
    setState(state: OrbState) {
      currentState = state;
      if (stateChangeCallback) {
        stateChangeCallback(state);
      }
    },

    // Get current state
    getState(): OrbState {
      return currentState;
    },

    // Trigger insight animation
    triggerInsight(type: InsightType) {
      if (insightCallback) {
        insightCallback(type);
      }
    },

    // Update volume level
    setVolumeLevel(level: number) {
      if (volumeCallback) {
        volumeCallback(level);
      }
    },

    // Convenience methods for common state transitions
    activate() {
      this.setState('WAKE_WORD_DETECTED');
    },

    startListening() {
      this.setState('LISTENING');
    },

    startThinking() {
      this.setState('THINKING');
    },

    startSpeaking() {
      this.setState('SPEAKING');
    },

    reset() {
      this.setState('IDLE');
    },

    // Insight shortcuts
    whaleDetected() {
      this.triggerInsight('whale');
    },

    hydraDetected() {
      this.triggerInsight('hydra');
    },

    ecoscanAlert() {
      this.triggerInsight('ecoscan');
    },

    clusterFormed() {
      this.triggerInsight('cluster');
    },
  };
}

// Export types
export type { OrbState, InsightType };

export default SingularityOrb;
