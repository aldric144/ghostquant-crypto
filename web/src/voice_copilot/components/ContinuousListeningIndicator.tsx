/**
 * ContinuousListeningIndicator.tsx
 * 
 * Phase 4: Continuous Listening + Wake-Word Loop Engine
 * 
 * UI indicator for continuous listening mode:
 * - "Continuous Listening ON"
 * - Pulsing orb border during listening
 * - Wake-word particle animation on activation
 * 
 * Must NOT interfere with existing UI unless the user enables continuous mode.
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getContinuousListeningController, type ContinuousListeningState } from '../audio/ContinuousListeningController';
import { getHandsFreeModeManager } from '../state/HandsFreeModeManager';

// ============================================================
// Types
// ============================================================

export interface ContinuousListeningIndicatorProps {
  className?: string;
  showLabel?: boolean;
  showParticles?: boolean;
  size?: 'small' | 'medium' | 'large';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'inline';
  onToggle?: (enabled: boolean) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

// ============================================================
// Styles
// ============================================================

const SIZE_MAP = {
  small: { orb: 24, border: 2, fontSize: 10 },
  medium: { orb: 36, border: 3, fontSize: 12 },
  large: { orb: 48, border: 4, fontSize: 14 },
};

const POSITION_MAP = {
  'top-left': { top: 16, left: 16, right: 'auto', bottom: 'auto' },
  'top-right': { top: 16, right: 16, left: 'auto', bottom: 'auto' },
  'bottom-left': { bottom: 16, left: 16, right: 'auto', top: 'auto' },
  'bottom-right': { bottom: 16, right: 16, left: 'auto', top: 'auto' },
  'inline': {},
};

const STATE_COLORS: Record<ContinuousListeningState, string> = {
  idle: '#6b7280',
  initializing: '#f59e0b',
  listening: '#10b981',
  wake_detected: '#3b82f6',
  capturing: '#8b5cf6',
  thinking: '#f59e0b',
  speaking: '#ec4899',
  interrupted: '#ef4444',
  resetting: '#6b7280',
  error: '#ef4444',
};

const STATE_LABELS: Record<ContinuousListeningState, string> = {
  idle: 'Idle',
  initializing: 'Initializing...',
  listening: 'Listening',
  wake_detected: 'Wake Detected',
  capturing: 'Capturing...',
  thinking: 'Thinking...',
  speaking: 'Speaking',
  interrupted: 'Interrupted',
  resetting: 'Resetting...',
  error: 'Error',
};

// ============================================================
// Component
// ============================================================

export const ContinuousListeningIndicator: React.FC<ContinuousListeningIndicatorProps> = ({
  className = '',
  showLabel = true,
  showParticles = true,
  size = 'medium',
  position = 'inline',
  onToggle,
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [state, setState] = useState<ContinuousListeningState>('idle');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  const sizeConfig = SIZE_MAP[size];
  const positionConfig = POSITION_MAP[position];

  // ============================================================
  // Initialize and subscribe to state changes
  // ============================================================

  useEffect(() => {
    const handsFreeModeManager = getHandsFreeModeManager();
    const continuousListeningController = getContinuousListeningController();

    // Set initial state
    setIsEnabled(handsFreeModeManager.isEnabled());
    setState(continuousListeningController.getState());

    // Subscribe to state changes
    handsFreeModeManager.setCallbacks({
      onToggle: (enabled) => {
        setIsEnabled(enabled);
        onToggle?.(enabled);
      },
    });

    continuousListeningController.setCallbacks({
      onStateChange: (newState) => {
        setState(newState);
        
        // Trigger particles on wake detection
        if (newState === 'wake_detected' && showParticles) {
          triggerParticles();
        }
      },
    });

    return () => {
      // Cleanup callbacks
      handsFreeModeManager.setCallbacks({});
      continuousListeningController.setCallbacks({});
    };
  }, [onToggle, showParticles]);

  // ============================================================
  // Particle Animation
  // ============================================================

  const triggerParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 2 + Math.random() * 2;
      
      newParticles.push({
        id: Date.now() + i,
        x: sizeConfig.orb / 2,
        y: sizeConfig.orb / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        size: 3 + Math.random() * 3,
      });
    }

    setParticles(newParticles);
  }, [sizeConfig.orb]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev => {
        const updated = prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.05,
          }))
          .filter(p => p.life > 0);

        return updated;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  // ============================================================
  // Toggle Handler
  // ============================================================

  const handleToggle = useCallback(async () => {
    const handsFreeModeManager = getHandsFreeModeManager();
    const continuousListeningController = getContinuousListeningController();

    if (isEnabled) {
      handsFreeModeManager.disable();
      continuousListeningController.stop();
    } else {
      handsFreeModeManager.enable();
      try {
        await continuousListeningController.start();
      } catch (error) {
        console.error('[ContinuousListeningIndicator] Failed to start:', error);
        handsFreeModeManager.disable();
      }
    }
  }, [isEnabled]);

  // ============================================================
  // Render
  // ============================================================

  const color = STATE_COLORS[state];
  const label = STATE_LABELS[state];
  const isActive = state === 'listening' || state === 'capturing' || state === 'thinking' || state === 'speaking';
  const isPulsing = state === 'listening';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    userSelect: 'none',
    ...(position !== 'inline' ? {
      position: 'fixed',
      zIndex: 9999,
      ...positionConfig,
    } : {}),
  };

  const orbContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: sizeConfig.orb,
    height: sizeConfig.orb,
  };

  const orbStyle: React.CSSProperties = {
    width: sizeConfig.orb,
    height: sizeConfig.orb,
    borderRadius: '50%',
    backgroundColor: isEnabled ? color : '#374151',
    border: `${sizeConfig.border}px solid ${isEnabled ? color : '#4b5563'}`,
    transition: 'all 0.3s ease',
    boxShadow: isActive ? `0 0 ${sizeConfig.orb / 2}px ${color}40` : 'none',
    animation: isPulsing ? 'pulse 2s ease-in-out infinite' : 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: sizeConfig.fontSize,
    fontWeight: 500,
    color: isEnabled ? '#e5e7eb' : '#9ca3af',
    whiteSpace: 'nowrap',
  };

  const statusStyle: React.CSSProperties = {
    fontSize: sizeConfig.fontSize - 2,
    color: isEnabled ? color : '#6b7280',
    marginTop: 2,
  };

  return (
    <div
      className={className}
      style={containerStyle}
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      aria-label={`Continuous listening ${isEnabled ? 'enabled' : 'disabled'}. Click to toggle.`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleToggle();
        }
      }}
    >
      {/* Orb */}
      <div style={orbContainerStyle}>
        <div style={orbStyle} />
        
        {/* Particles */}
        {showParticles && particles.map(particle => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              backgroundColor: color,
              opacity: particle.life,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Pulsing ring */}
        {isPulsing && (
          <div
            style={{
              position: 'absolute',
              top: -sizeConfig.border,
              left: -sizeConfig.border,
              width: sizeConfig.orb + sizeConfig.border * 2,
              height: sizeConfig.orb + sizeConfig.border * 2,
              borderRadius: '50%',
              border: `${sizeConfig.border}px solid ${color}`,
              animation: 'pulseRing 2s ease-out infinite',
              opacity: 0.5,
            }}
          />
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <div>
          <div style={labelStyle}>
            {isEnabled ? 'Continuous Listening ON' : 'Continuous Listening OFF'}
          </div>
          {isEnabled && (
            <div style={statusStyle}>
              {label}
            </div>
          )}
        </div>
      )}

      {/* Tooltip on hover */}
      {isHovered && !showLabel && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: 8,
            padding: '4px 8px',
            backgroundColor: '#1f2937',
            borderRadius: 4,
            fontSize: 12,
            color: '#e5e7eb',
            whiteSpace: 'nowrap',
            zIndex: 10000,
          }}
        >
          {isEnabled ? `Listening: ${label}` : 'Click to enable'}
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }

        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// ============================================================
// Compact Indicator (for toolbar/header)
// ============================================================

export const ContinuousListeningIndicatorCompact: React.FC<{
  className?: string;
  onToggle?: (enabled: boolean) => void;
}> = ({ className, onToggle }) => {
  return (
    <ContinuousListeningIndicator
      className={className}
      showLabel={false}
      showParticles={true}
      size="small"
      position="inline"
      onToggle={onToggle}
    />
  );
};

// ============================================================
// Floating Indicator (for corner placement)
// ============================================================

export const ContinuousListeningIndicatorFloating: React.FC<{
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onToggle?: (enabled: boolean) => void;
}> = ({ position = 'bottom-right', onToggle }) => {
  return (
    <ContinuousListeningIndicator
      showLabel={true}
      showParticles={true}
      size="medium"
      position={position}
      onToggle={onToggle}
    />
  );
};

export default ContinuousListeningIndicator;
