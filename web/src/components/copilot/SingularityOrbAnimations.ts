/**
 * SingularityOrbAnimations - Animation configurations and utilities for the Singularity Orb
 * Premium, cinematic animations for the GhostQuant Voice Copilot
 */

export type OrbState = 'IDLE' | 'WAKE_WORD_DETECTED' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'INSIGHT';

export type InsightType = 'whale' | 'hydra' | 'ecoscan' | 'cluster' | 'default';

// Animation timing configurations
export const ANIMATION_CONFIG = {
  // Idle state - soft pulsing
  idle: {
    duration: 3000,
    scale: { min: 1.0, max: 1.02 },
    opacity: { min: 0.7, max: 0.9 },
    glowIntensity: 0.3,
  },
  
  // Wake word detected - ripple expansion
  wakeWord: {
    duration: 800,
    rippleCount: 3,
    rippleDelay: 150,
    scaleExpand: 1.15,
    colorShift: '#FFD700', // Gold
  },
  
  // Listening - audio-reactive pulse
  listening: {
    duration: 100, // Fast response to audio
    baseScale: 1.0,
    maxScale: 1.2,
    pulseSpeed: 50,
  },
  
  // Thinking - neural spark effect
  thinking: {
    duration: 2000,
    sparkCount: 12,
    sparkSpeed: 800,
    collapseScale: 0.95,
    expandScale: 1.05,
  },
  
  // Speaking - rhythm glow
  speaking: {
    duration: 500,
    rotationSpeed: 0.5, // degrees per frame
    glowPulse: 300,
    rhythmSync: true,
  },
  
  // Insight burst - color pulse
  insight: {
    duration: 1200,
    burstScale: 1.3,
    fadeTime: 400,
  },
};

// Color configurations for different states and insight types
export const ORB_COLORS = {
  // Base colors
  idle: {
    primary: '#10B981', // Emerald (GhostQuant brand)
    glow: 'rgba(16, 185, 129, 0.4)',
    gradient: ['#10B981', '#059669', '#047857'],
  },
  
  wakeWord: {
    primary: '#FFD700', // Gold
    glow: 'rgba(255, 215, 0, 0.6)',
    gradient: ['#FFD700', '#FFA500', '#FF8C00'],
  },
  
  listening: {
    primary: '#3B82F6', // Blue
    glow: 'rgba(59, 130, 246, 0.5)',
    gradient: ['#3B82F6', '#2563EB', '#1D4ED8'],
  },
  
  thinking: {
    primary: '#8B5CF6', // Purple
    glow: 'rgba(139, 92, 246, 0.5)',
    gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'],
    sparkColor: '#E879F9',
  },
  
  speaking: {
    primary: '#10B981', // Emerald
    glow: 'rgba(16, 185, 129, 0.6)',
    gradient: ['#10B981', '#34D399', '#6EE7B7'],
  },
  
  // Insight type colors
  insight: {
    whale: {
      primary: '#0EA5E9', // Deep blue
      glow: 'rgba(14, 165, 233, 0.7)',
    },
    hydra: {
      primary: '#EF4444', // Red plasma
      glow: 'rgba(239, 68, 68, 0.7)',
    },
    ecoscan: {
      primary: '#F59E0B', // Yellow alert
      glow: 'rgba(245, 158, 11, 0.7)',
    },
    cluster: {
      primary: '#A855F7', // Purple convergence
      glow: 'rgba(168, 85, 247, 0.7)',
    },
    default: {
      primary: '#10B981',
      glow: 'rgba(16, 185, 129, 0.7)',
    },
  },
};

// Keyframe animation generators
export function generateIdleKeyframes(): string {
  return `
    @keyframes orbIdle {
      0%, 100% {
        transform: scale(${ANIMATION_CONFIG.idle.scale.min});
        opacity: ${ANIMATION_CONFIG.idle.opacity.min};
        box-shadow: 0 0 30px ${ORB_COLORS.idle.glow};
      }
      50% {
        transform: scale(${ANIMATION_CONFIG.idle.scale.max});
        opacity: ${ANIMATION_CONFIG.idle.opacity.max};
        box-shadow: 0 0 50px ${ORB_COLORS.idle.glow};
      }
    }
  `;
}

export function generateWakeWordKeyframes(): string {
  return `
    @keyframes orbWakeWord {
      0% {
        transform: scale(1);
        box-shadow: 0 0 30px ${ORB_COLORS.idle.glow};
      }
      50% {
        transform: scale(${ANIMATION_CONFIG.wakeWord.scaleExpand});
        box-shadow: 0 0 80px ${ORB_COLORS.wakeWord.glow};
      }
      100% {
        transform: scale(1.05);
        box-shadow: 0 0 50px ${ORB_COLORS.wakeWord.glow};
      }
    }
    
    @keyframes orbRipple {
      0% {
        transform: scale(1);
        opacity: 0.8;
      }
      100% {
        transform: scale(2.5);
        opacity: 0;
      }
    }
  `;
}

export function generateListeningKeyframes(): string {
  return `
    @keyframes orbListening {
      0%, 100% {
        transform: scale(var(--volume-scale, 1));
        box-shadow: 0 0 40px ${ORB_COLORS.listening.glow};
      }
      50% {
        box-shadow: 0 0 60px ${ORB_COLORS.listening.glow};
      }
    }
  `;
}

export function generateThinkingKeyframes(): string {
  return `
    @keyframes orbThinking {
      0% {
        transform: scale(${ANIMATION_CONFIG.thinking.collapseScale});
      }
      50% {
        transform: scale(${ANIMATION_CONFIG.thinking.expandScale});
      }
      100% {
        transform: scale(${ANIMATION_CONFIG.thinking.collapseScale});
      }
    }
    
    @keyframes neuralSpark {
      0% {
        opacity: 0;
        transform: translateX(0) translateY(0);
      }
      20% {
        opacity: 1;
      }
      100% {
        opacity: 0;
        transform: translateX(var(--spark-x, 20px)) translateY(var(--spark-y, -20px));
      }
    }
  `;
}

export function generateSpeakingKeyframes(): string {
  return `
    @keyframes orbSpeaking {
      0% {
        transform: rotate(0deg) scale(1);
        box-shadow: 0 0 40px ${ORB_COLORS.speaking.glow};
      }
      50% {
        box-shadow: 0 0 60px ${ORB_COLORS.speaking.glow};
      }
      100% {
        transform: rotate(360deg) scale(1);
        box-shadow: 0 0 40px ${ORB_COLORS.speaking.glow};
      }
    }
  `;
}

export function generateInsightKeyframes(type: InsightType = 'default'): string {
  const colors = ORB_COLORS.insight[type];
  return `
    @keyframes orbInsight {
      0% {
        transform: scale(1);
        box-shadow: 0 0 40px ${colors.glow};
      }
      30% {
        transform: scale(${ANIMATION_CONFIG.insight.burstScale});
        box-shadow: 0 0 100px ${colors.glow};
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 40px ${colors.glow};
      }
    }
  `;
}

// Helper to get animation CSS for a state
export function getAnimationCSS(state: OrbState, insightType?: InsightType): { animation: string; background: string } {
  switch (state) {
    case 'IDLE':
      return {
        animation: `orbIdle ${ANIMATION_CONFIG.idle.duration}ms ease-in-out infinite`,
        background: `radial-gradient(circle, ${ORB_COLORS.idle.gradient.join(', ')})`,
      };
    case 'WAKE_WORD_DETECTED':
      return {
        animation: `orbWakeWord ${ANIMATION_CONFIG.wakeWord.duration}ms ease-out forwards`,
        background: `radial-gradient(circle, ${ORB_COLORS.wakeWord.gradient.join(', ')})`,
      };
    case 'LISTENING':
      return {
        animation: `orbListening ${ANIMATION_CONFIG.listening.duration}ms ease-out infinite`,
        background: `radial-gradient(circle, ${ORB_COLORS.listening.gradient.join(', ')})`,
      };
    case 'THINKING':
      return {
        animation: `orbThinking ${ANIMATION_CONFIG.thinking.duration}ms ease-in-out infinite`,
        background: `radial-gradient(circle, ${ORB_COLORS.thinking.gradient.join(', ')})`,
      };
    case 'SPEAKING':
      return {
        animation: `orbSpeaking 10s linear infinite`,
        background: `radial-gradient(circle, ${ORB_COLORS.speaking.gradient.join(', ')})`,
      };
    case 'INSIGHT':
      const type = insightType || 'default';
      return {
        animation: `orbInsight ${ANIMATION_CONFIG.insight.duration}ms ease-out forwards`,
        background: `radial-gradient(circle, ${ORB_COLORS.insight[type].primary}, ${ORB_COLORS.insight[type].glow})`,
      };
    default:
      return {
        animation: `orbIdle ${ANIMATION_CONFIG.idle.duration}ms ease-in-out infinite`,
        background: `radial-gradient(circle, ${ORB_COLORS.idle.gradient.join(', ')})`,
      };
  }
}

// Generate neural spark positions for thinking animation
export function generateSparkPositions(count: number = 12): Array<{ x: number; y: number; delay: number }> {
  const sparks = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const distance = 30 + Math.random() * 20;
    sparks.push({
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      delay: i * (ANIMATION_CONFIG.thinking.sparkSpeed / count),
    });
  }
  return sparks;
}

// Calculate volume-based scale for listening animation
export function calculateVolumeScale(volume: number): number {
  // volume is 0-1, scale is 1.0-1.2
  const { baseScale, maxScale } = ANIMATION_CONFIG.listening;
  return baseScale + (volume * (maxScale - baseScale));
}

export default {
  ANIMATION_CONFIG,
  ORB_COLORS,
  generateIdleKeyframes,
  generateWakeWordKeyframes,
  generateListeningKeyframes,
  generateThinkingKeyframes,
  generateSpeakingKeyframes,
  generateInsightKeyframes,
  getAnimationCSS,
  generateSparkPositions,
  calculateVolumeScale,
};
