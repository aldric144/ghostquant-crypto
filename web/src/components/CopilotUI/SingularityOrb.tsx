'use client';

/**
 * SingularityOrb - Premium animated orb for GhostQuant Voice Copilot
 * 
 * States:
 * - IDLE: Soft breathing glow
 * - WAKE_WORD_DETECTED: Ring ripple + gold flash
 * - LISTENING: Audio-reactive pulse using mic volume
 * - THINKING: Neural spark shader animation
 * - SPEAKING: Rhythmic glow matching TTS output
 * - INSIGHT: Domain color pulse (whale/eco/hydra/cluster)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { copilotEvents, CopilotUIState, InsightEventType } from '../../voice_copilot/CopilotEvents';

export type OrbState = 'idle' | 'wake' | 'listening' | 'thinking' | 'speaking' | 'insight';

export interface SingularityOrbProps {
  onClick?: () => void;
  onStateChange?: (state: OrbState) => void;
  showStatus?: boolean;
  className?: string;
}

const STATE_LABELS: Record<OrbState, string> = {
  idle: 'Ready',
  wake: 'Activated!',
  listening: 'Listening...',
  thinking: 'Processing...',
  speaking: 'Speaking...',
  insight: 'Alert!',
};

interface NeuralSpark {
  id: number;
  x: number;
  y: number;
  angle: number;
}

export function SingularityOrb({
  onClick,
  onStateChange,
  showStatus = true,
  className = '',
}: SingularityOrbProps): React.ReactElement {
  const [state, setState] = useState<OrbState>('idle');
  const [volume, setVolume] = useState(0);
  const [insightType, setInsightType] = useState<InsightEventType | null>(null);
  const [ripples, setRipples] = useState<number[]>([]);
  const [sparks, setSparks] = useState<NeuralSpark[]>([]);
  const sparkIdRef = useRef(0);
  const orbRef = useRef<HTMLDivElement>(null);

  // Subscribe to copilot events
  useEffect(() => {
    const unsubscribeState = copilotEvents.on('state_change', (event) => {
      const payload = event.payload as { state: CopilotUIState };
      
      let newState: OrbState = 'idle';
      switch (payload.state) {
        case 'idle':
        case 'wake_listening':
          newState = 'idle';
          break;
        case 'activated':
          newState = 'wake';
          // Add ripple effect
          setRipples(prev => [...prev, Date.now()]);
          setTimeout(() => {
            setRipples(prev => prev.slice(1));
          }, 1000);
          break;
        case 'listening':
          newState = 'listening';
          break;
        case 'processing':
          newState = 'thinking';
          break;
        case 'speaking':
          newState = 'speaking';
          break;
        case 'error':
          newState = 'idle';
          break;
      }
      
      setState(newState);
      onStateChange?.(newState);
    });

    const unsubscribeVolume = copilotEvents.on('volume_change', (event) => {
      const payload = event.payload as { volume: number };
      setVolume(payload.volume);
    });

    const unsubscribeInsight = copilotEvents.on('insight_event', (event) => {
      const payload = event.payload as { insightType: InsightEventType };
      setInsightType(payload.insightType);
      setState('insight');
      onStateChange?.('insight');
      
      // Reset after animation
      setTimeout(() => {
        setInsightType(null);
        setState('idle');
        onStateChange?.('idle');
      }, 2000);
    });

    return () => {
      unsubscribeState();
      unsubscribeVolume();
      unsubscribeInsight();
    };
  }, [onStateChange]);

  // Generate neural sparks when thinking
  useEffect(() => {
    if (state !== 'thinking') {
      setSparks([]);
      return;
    }

    const interval = setInterval(() => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 20;
      
      const newSpark: NeuralSpark = {
        id: sparkIdRef.current++,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        angle: angle * (180 / Math.PI),
      };

      setSparks(prev => [...prev.slice(-8), newSpark]);
    }, 150);

    return () => clearInterval(interval);
  }, [state]);

  // Calculate volume-based scale
  const volumeScale = state === 'listening' ? 1 + volume * 0.15 : 1;

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const getOrbClass = () => {
    let classes = `copilot-orb orb-${state}`;
    if (insightType) {
      classes += ` orb-insight-${insightType}`;
    }
    return classes;
  };

  return (
    <div className={`copilot-orb-wrapper ${className}`}>
      {/* Spotlight overlay */}
      <div className={`copilot-spotlight ${state !== 'idle' ? 'active' : ''}`} />

      {/* Main orb */}
      <div
        ref={orbRef}
        className={getOrbClass()}
        onClick={handleClick}
        style={{
          '--volume-scale': volumeScale,
        } as React.CSSProperties}
        role="button"
        tabIndex={0}
        aria-label={`GhostQuant Copilot - ${STATE_LABELS[state]}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
      >
        {/* Inner glow */}
        <div className="orb-inner-glow" />
        
        {/* Neural sparks (thinking state) */}
        {sparks.map((spark) => (
          <div
            key={spark.id}
            className="copilot-neural-spark"
            style={{
              '--spark-x': `${spark.x}px`,
              '--spark-y': `${spark.y}px`,
              left: '50%',
              top: '50%',
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Ripple effects (wake word) */}
      {ripples.map((id) => (
        <div key={id} className="copilot-orb-ripple" />
      ))}

      {/* Status label */}
      {showStatus && (
        <div className="copilot-orb-status">
          {STATE_LABELS[state]}
        </div>
      )}

      <style jsx>{`
        .copilot-orb-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .copilot-spotlight {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle at bottom right,
            rgba(16, 185, 129, 0.08) 0%,
            transparent 50%
          );
          pointer-events: none;
          opacity: 0;
          transition: opacity 500ms ease;
          z-index: -1;
        }

        .copilot-spotlight.active {
          opacity: 1;
        }

        .copilot-orb {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          cursor: pointer;
          position: relative;
          transition: transform 300ms ease;
          background: radial-gradient(
            circle at 30% 30%,
            #34D399 0%,
            #10B981 40%,
            #059669 100%
          );
          box-shadow: 
            0 0 30px rgba(16, 185, 129, 0.5),
            0 0 60px rgba(16, 185, 129, 0.3),
            0 0 90px rgba(16, 185, 129, 0.1),
            inset 0 0 20px rgba(255, 255, 255, 0.15);
        }

        .copilot-orb::before {
          content: '';
          position: absolute;
          top: 8%;
          left: 12%;
          width: 35%;
          height: 25%;
          background: radial-gradient(
            ellipse,
            rgba(255, 255, 255, 0.7) 0%,
            transparent 70%
          );
          border-radius: 50%;
          filter: blur(2px);
        }

        .copilot-orb::after {
          content: '';
          position: absolute;
          top: -6px;
          left: -6px;
          right: -6px;
          bottom: -6px;
          border-radius: 50%;
          border: 1px solid rgba(16, 185, 129, 0.3);
          opacity: 0;
          transition: opacity 300ms ease;
        }

        .copilot-orb:hover::after {
          opacity: 1;
        }

        .copilot-orb:focus {
          outline: none;
        }

        .copilot-orb:focus-visible::after {
          opacity: 1;
          border-color: rgba(16, 185, 129, 0.6);
        }

        .orb-inner-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 40%;
          height: 40%;
          transform: translate(-50%, -50%);
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.4) 0%,
            transparent 70%
          );
          border-radius: 50%;
        }

        /* IDLE - Breathing */
        .orb-idle {
          animation: orbBreathing 4s ease-in-out infinite;
        }

        @keyframes orbBreathing {
          0%, 100% {
            transform: scale(1);
            box-shadow: 
              0 0 30px rgba(16, 185, 129, 0.4),
              0 0 60px rgba(16, 185, 129, 0.2);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 
              0 0 40px rgba(16, 185, 129, 0.5),
              0 0 80px rgba(16, 185, 129, 0.3);
          }
        }

        /* WAKE - Gold flash */
        .orb-wake {
          animation: orbWake 800ms ease-out forwards;
          background: radial-gradient(
            circle at 30% 30%,
            #FFE066 0%,
            #FFD860 40%,
            #F59E0B 100%
          );
        }

        @keyframes orbWake {
          0% { transform: scale(1); }
          40% {
            transform: scale(1.15);
            box-shadow: 
              0 0 60px rgba(255, 216, 96, 0.7),
              0 0 100px rgba(255, 216, 96, 0.5);
          }
          100% {
            transform: scale(1.05);
            box-shadow: 
              0 0 50px rgba(255, 216, 96, 0.5),
              0 0 80px rgba(255, 216, 96, 0.3);
          }
        }

        /* LISTENING - Audio reactive */
        .orb-listening {
          background: radial-gradient(
            circle at 30% 30%,
            #60A5FA 0%,
            #3B82F6 40%,
            #2563EB 100%
          );
          transform: scale(var(--volume-scale, 1));
          transition: transform 50ms ease-out;
        }

        .orb-listening::after {
          opacity: 1;
          border-color: rgba(59, 130, 246, 0.5);
          animation: listeningHalo 1.5s ease-in-out infinite;
        }

        @keyframes listeningHalo {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        /* THINKING - Neural sparks */
        .orb-thinking {
          background: radial-gradient(
            circle at 30% 30%,
            #A78BFA 0%,
            #8B5CF6 40%,
            #7C3AED 100%
          );
          animation: orbThinking 2s ease-in-out infinite;
        }

        @keyframes orbThinking {
          0%, 100% { transform: scale(0.96); }
          50% { transform: scale(1.04); }
        }

        .copilot-neural-spark {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #E879F9;
          border-radius: 50%;
          box-shadow: 0 0 6px #E879F9;
          animation: neuralSpark 600ms ease-out forwards;
          pointer-events: none;
        }

        @keyframes neuralSpark {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1);
          }
          20% { opacity: 1; }
          100% {
            opacity: 0;
            transform: translate(
              calc(-50% + var(--spark-x, 20px)),
              calc(-50% + var(--spark-y, -20px))
            ) scale(0.5);
          }
        }

        /* SPEAKING - Rhythmic glow */
        .orb-speaking {
          background: radial-gradient(
            circle at 30% 30%,
            #6EE7B7 0%,
            #34D399 40%,
            #10B981 100%
          );
          animation: orbSpeakingGlow 600ms ease-in-out infinite;
        }

        @keyframes orbSpeakingGlow {
          0%, 100% {
            box-shadow: 
              0 0 30px rgba(16, 185, 129, 0.5),
              0 0 60px rgba(16, 185, 129, 0.3);
          }
          50% {
            box-shadow: 
              0 0 50px rgba(16, 185, 129, 0.7),
              0 0 90px rgba(16, 185, 129, 0.5);
          }
        }

        /* INSIGHT - Domain colors */
        .orb-insight {
          animation: orbInsight 1.2s ease-out forwards;
        }

        @keyframes orbInsight {
          0% { transform: scale(1); }
          30% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }

        .orb-insight-whale {
          background: radial-gradient(circle at 30% 30%, #38BDF8, #0EA5E9, #0284C7);
          box-shadow: 0 0 60px rgba(14, 165, 233, 0.7);
        }

        .orb-insight-hydra {
          background: radial-gradient(circle at 30% 30%, #F87171, #EF4444, #DC2626);
          box-shadow: 0 0 60px rgba(239, 68, 68, 0.7);
        }

        .orb-insight-ecoscan {
          background: radial-gradient(circle at 30% 30%, #FBBF24, #F59E0B, #D97706);
          box-shadow: 0 0 60px rgba(245, 158, 11, 0.7);
        }

        .orb-insight-cluster {
          background: radial-gradient(circle at 30% 30%, #C084FC, #A855F7, #9333EA);
          box-shadow: 0 0 60px rgba(168, 85, 247, 0.7);
        }

        /* Ripple effect */
        .copilot-orb-ripple {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 2px solid #FFD860;
          transform: translate(-50%, -50%);
          animation: rippleExpand 1s ease-out forwards;
          pointer-events: none;
        }

        @keyframes rippleExpand {
          0% {
            width: 72px;
            height: 72px;
            opacity: 0.8;
          }
          100% {
            width: 144px;
            height: 144px;
            opacity: 0;
          }
        }

        /* Status label */
        .copilot-orb-status {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 500;
          opacity: 0;
          transition: opacity 300ms ease;
        }

        .copilot-orb-wrapper:hover .copilot-orb-status,
        .orb-wake ~ .copilot-orb-status,
        .orb-listening ~ .copilot-orb-status,
        .orb-thinking ~ .copilot-orb-status,
        .orb-speaking ~ .copilot-orb-status,
        .orb-insight ~ .copilot-orb-status {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .copilot-orb {
            width: 60px;
            height: 60px;
          }

          .copilot-orb-ripple {
            width: 60px;
            height: 60px;
          }

          @keyframes rippleExpand {
            0% {
              width: 60px;
              height: 60px;
              opacity: 0.8;
            }
            100% {
              width: 120px;
              height: 120px;
              opacity: 0;
            }
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .copilot-orb,
          .orb-idle,
          .orb-wake,
          .orb-listening,
          .orb-thinking,
          .orb-speaking,
          .orb-insight {
            animation: none;
          }

          .copilot-orb-ripple,
          .copilot-neural-spark {
            animation: none;
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default SingularityOrb;
