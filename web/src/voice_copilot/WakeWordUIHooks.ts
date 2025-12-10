/**
 * WakeWordUIHooks - UI animation and feedback functions for wake word detection
 * Provides visual and audio feedback for the GhostQuant Voice Copilot
 */

export type AnimationState = 'idle' | 'listening' | 'activated' | 'thinking' | 'speaking' | 'insight';

export interface WakeWordUICallbacks {
  onAnimationStateChange: (state: AnimationState) => void;
}

// Animation timing constants
const ANIMATION_DURATIONS = {
  fadeIn: 200,
  fadeOut: 300,
  glow: 500,
  ripple: 800,
  pulse: 1000,
};

// Audio file paths (optional - gracefully handle missing files)
const AUDIO_FILES = {
  wake: '/sounds/wake-chime.mp3',
  insight: '/sounds/insight-pulse.mp3',
  activate: '/sounds/activate.mp3',
};

let currentAnimationState: AnimationState = 'idle';
let callbacks: WakeWordUICallbacks = {
  onAnimationStateChange: () => {},
};

/**
 * Set callbacks for UI state changes
 */
export function setUICallbacks(newCallbacks: Partial<WakeWordUICallbacks>): void {
  callbacks = { ...callbacks, ...newCallbacks };
}

/**
 * Get current animation state
 */
export function getAnimationState(): AnimationState {
  return currentAnimationState;
}

/**
 * Set animation state and notify listeners
 */
export function setAnimationState(state: AnimationState): void {
  currentAnimationState = state;
  callbacks.onAnimationStateChange(state);
}

/**
 * Show listening animation - orb pulses gently
 */
export function showListeningAnimation(): void {
  setAnimationState('listening');
  
  // Add CSS class to orb element if it exists
  if (typeof document !== 'undefined') {
    const orb = document.querySelector('.singularity-orb');
    if (orb) {
      orb.classList.remove('orb-idle', 'orb-activated', 'orb-thinking', 'orb-speaking');
      orb.classList.add('orb-listening');
    }
  }
}

/**
 * Hide listening animation - return to idle
 */
export function hideListeningAnimation(): void {
  setAnimationState('idle');
  
  if (typeof document !== 'undefined') {
    const orb = document.querySelector('.singularity-orb');
    if (orb) {
      orb.classList.remove('orb-listening', 'orb-activated', 'orb-thinking', 'orb-speaking');
      orb.classList.add('orb-idle');
    }
  }
}

/**
 * Show activation glow - wake word detected
 */
export function showActivationGlow(): void {
  setAnimationState('activated');
  
  if (typeof document !== 'undefined') {
    const orb = document.querySelector('.singularity-orb');
    if (orb) {
      orb.classList.remove('orb-idle', 'orb-listening', 'orb-thinking', 'orb-speaking');
      orb.classList.add('orb-activated');
      
      // Add ripple effect
      const ripple = document.createElement('div');
      ripple.className = 'orb-ripple';
      orb.appendChild(ripple);
      
      // Remove ripple after animation
      setTimeout(() => {
        ripple.remove();
      }, ANIMATION_DURATIONS.ripple);
    }
  }
}

/**
 * Show thinking animation - neural sparks
 */
export function showThinkingAnimation(): void {
  setAnimationState('thinking');
  
  if (typeof document !== 'undefined') {
    const orb = document.querySelector('.singularity-orb');
    if (orb) {
      orb.classList.remove('orb-idle', 'orb-listening', 'orb-activated', 'orb-speaking');
      orb.classList.add('orb-thinking');
    }
  }
}

/**
 * Show speaking animation - rhythm glow
 */
export function showSpeakingAnimation(): void {
  setAnimationState('speaking');
  
  if (typeof document !== 'undefined') {
    const orb = document.querySelector('.singularity-orb');
    if (orb) {
      orb.classList.remove('orb-idle', 'orb-listening', 'orb-activated', 'orb-thinking');
      orb.classList.add('orb-speaking');
    }
  }
}

/**
 * Show insight burst - intelligence detection
 */
export function showInsightBurst(type: 'whale' | 'hydra' | 'ecoscan' | 'cluster' = 'whale'): void {
  setAnimationState('insight');
  
  if (typeof document !== 'undefined') {
    const orb = document.querySelector('.singularity-orb');
    if (orb) {
      // Add type-specific color class
      orb.classList.add('orb-insight', `orb-insight-${type}`);
      
      // Remove after animation
      setTimeout(() => {
        orb.classList.remove('orb-insight', `orb-insight-${type}`);
      }, ANIMATION_DURATIONS.pulse);
    }
  }
  
  // Play insight sound
  playSound('insight');
}

/**
 * Play wake word detection sound
 */
export function playWakeSound(): void {
  playSound('wake');
}

/**
 * Play activation sound
 */
export function playActivateSound(): void {
  playSound('activate');
}

/**
 * Generic sound player with graceful fallback
 */
function playSound(soundType: keyof typeof AUDIO_FILES): void {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') {
    return;
  }
  
  try {
    const audio = new Audio(AUDIO_FILES[soundType]);
    audio.volume = 0.3; // Subtle volume
    audio.play().catch(() => {
      // Silently fail if audio can't play (user hasn't interacted yet, file missing, etc.)
    });
  } catch {
    // Gracefully handle missing audio files
  }
}

/**
 * Smooth fade out animation
 */
export function smoothFadeOut(callback?: () => void): void {
  if (typeof document !== 'undefined') {
    const orb = document.querySelector('.singularity-orb');
    if (orb) {
      orb.classList.add('orb-fade-out');
      
      setTimeout(() => {
        orb.classList.remove('orb-fade-out');
        setAnimationState('idle');
        if (callback) callback();
      }, ANIMATION_DURATIONS.fadeOut);
    }
  }
}

/**
 * Update orb with microphone volume level (0-1)
 */
export function updateVolumeLevel(level: number): void {
  if (typeof document !== 'undefined') {
    const orb = document.querySelector('.singularity-orb') as HTMLElement;
    if (orb) {
      // Scale the orb based on volume
      const scale = 1 + (level * 0.15); // Max 15% scale increase
      orb.style.setProperty('--volume-scale', scale.toString());
    }
  }
}

/**
 * Reset all animations to idle state
 */
export function resetAnimations(): void {
  setAnimationState('idle');
  
  if (typeof document !== 'undefined') {
    const orb = document.querySelector('.singularity-orb');
    if (orb) {
      orb.classList.remove(
        'orb-listening',
        'orb-activated',
        'orb-thinking',
        'orb-speaking',
        'orb-insight',
        'orb-fade-out'
      );
      orb.classList.add('orb-idle');
    }
  }
}

export default {
  setUICallbacks,
  getAnimationState,
  setAnimationState,
  showListeningAnimation,
  hideListeningAnimation,
  showActivationGlow,
  showThinkingAnimation,
  showSpeakingAnimation,
  showInsightBurst,
  playWakeSound,
  playActivateSound,
  smoothFadeOut,
  updateVolumeLevel,
  resetAnimations,
};
