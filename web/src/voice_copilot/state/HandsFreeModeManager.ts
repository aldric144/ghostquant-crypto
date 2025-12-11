/**
 * HandsFreeModeManager.ts
 * 
 * Phase 4: Continuous Listening + Wake-Word Loop Engine
 * 
 * Features:
 * - Toggle continuous listening on/off
 * - Persist user preference to localStorage
 * - Provide API to UI button (future)
 * - Supports "Hey G3" wake word and all aliases
 * 
 * Logging prefix: [HandsFreeMode]
 */

// ============================================================
// Types
// ============================================================

export interface HandsFreeModeConfig {
  enabled: boolean;
  autoStartOnLoad: boolean;
  persistPreference: boolean;
  storageKey: string;
  showIndicator: boolean;
  playActivationSound: boolean;
  playDeactivationSound: boolean;
}

export interface HandsFreeModeState {
  isEnabled: boolean;
  isActive: boolean;
  lastToggleTime: number | null;
  totalActiveTime: number;
  sessionCount: number;
}

export interface HandsFreeModeCallbacks {
  onEnabled?: () => void;
  onDisabled?: () => void;
  onToggle?: (enabled: boolean) => void;
  onError?: (error: Error) => void;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: HandsFreeModeConfig = {
  enabled: false,
  autoStartOnLoad: false,
  persistPreference: true,
  storageKey: 'ghostquant_hands_free_mode',
  showIndicator: true,
  playActivationSound: true,
  playDeactivationSound: true,
};

const STORAGE_KEYS = {
  enabled: 'ghostquant_hands_free_enabled',
  autoStart: 'ghostquant_hands_free_auto_start',
  totalActiveTime: 'ghostquant_hands_free_total_time',
  sessionCount: 'ghostquant_hands_free_session_count',
};

// ============================================================
// HandsFreeModeManager Implementation
// ============================================================

class HandsFreeModeManagerImpl {
  private config: HandsFreeModeConfig;
  private callbacks: HandsFreeModeCallbacks = {};
  private state: HandsFreeModeState;
  private activeStartTime: number | null = null;

  constructor(config: Partial<HandsFreeModeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize state from storage or defaults
    this.state = this.loadState();
    
    console.log('[HandsFreeMode] Initialized, enabled:', this.state.isEnabled);
  }

  // ============================================================
  // State Persistence
  // ============================================================

  /**
   * Load state from localStorage
   */
  private loadState(): HandsFreeModeState {
    if (!this.config.persistPreference || typeof localStorage === 'undefined') {
      return {
        isEnabled: this.config.enabled,
        isActive: false,
        lastToggleTime: null,
        totalActiveTime: 0,
        sessionCount: 0,
      };
    }

    try {
      const enabled = localStorage.getItem(STORAGE_KEYS.enabled);
      const totalActiveTime = localStorage.getItem(STORAGE_KEYS.totalActiveTime);
      const sessionCount = localStorage.getItem(STORAGE_KEYS.sessionCount);

      return {
        isEnabled: enabled === 'true',
        isActive: false,
        lastToggleTime: null,
        totalActiveTime: totalActiveTime ? parseInt(totalActiveTime, 10) : 0,
        sessionCount: sessionCount ? parseInt(sessionCount, 10) : 0,
      };
    } catch (error) {
      console.warn('[HandsFreeMode] Failed to load state from storage:', error);
      return {
        isEnabled: this.config.enabled,
        isActive: false,
        lastToggleTime: null,
        totalActiveTime: 0,
        sessionCount: 0,
      };
    }
  }

  /**
   * Save state to localStorage
   */
  private saveState(): void {
    if (!this.config.persistPreference || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.enabled, String(this.state.isEnabled));
      localStorage.setItem(STORAGE_KEYS.totalActiveTime, String(this.state.totalActiveTime));
      localStorage.setItem(STORAGE_KEYS.sessionCount, String(this.state.sessionCount));
      console.log('[HandsFreeMode] State saved to storage');
    } catch (error) {
      console.warn('[HandsFreeMode] Failed to save state to storage:', error);
    }
  }

  // ============================================================
  // Enable / Disable
  // ============================================================

  /**
   * Enable hands-free mode
   */
  enable(): void {
    if (this.state.isEnabled) {
      console.log('[HandsFreeMode] Already enabled');
      return;
    }

    console.log('[HandsFreeMode] Enabling hands-free mode');
    this.state.isEnabled = true;
    this.state.lastToggleTime = Date.now();
    this.state.sessionCount++;
    
    this.saveState();
    
    // Play activation sound if configured
    if (this.config.playActivationSound) {
      this.playActivationSound();
    }
    
    this.callbacks.onEnabled?.();
    this.callbacks.onToggle?.(true);
  }

  /**
   * Disable hands-free mode
   */
  disable(): void {
    if (!this.state.isEnabled) {
      console.log('[HandsFreeMode] Already disabled');
      return;
    }

    console.log('[HandsFreeMode] Disabling hands-free mode');
    
    // Update active time if was active
    if (this.state.isActive && this.activeStartTime) {
      this.state.totalActiveTime += Date.now() - this.activeStartTime;
      this.activeStartTime = null;
    }
    
    this.state.isEnabled = false;
    this.state.isActive = false;
    this.state.lastToggleTime = Date.now();
    
    this.saveState();
    
    // Play deactivation sound if configured
    if (this.config.playDeactivationSound) {
      this.playDeactivationSound();
    }
    
    this.callbacks.onDisabled?.();
    this.callbacks.onToggle?.(false);
  }

  /**
   * Toggle hands-free mode
   */
  toggle(): boolean {
    if (this.state.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.state.isEnabled;
  }

  /**
   * Check if hands-free mode is enabled
   */
  isEnabled(): boolean {
    return this.state.isEnabled;
  }

  // ============================================================
  // Active State Management
  // ============================================================

  /**
   * Mark hands-free mode as active (listening started)
   */
  setActive(active: boolean): void {
    if (active === this.state.isActive) return;

    this.state.isActive = active;
    
    if (active) {
      this.activeStartTime = Date.now();
      console.log('[HandsFreeMode] Now active');
    } else {
      if (this.activeStartTime) {
        this.state.totalActiveTime += Date.now() - this.activeStartTime;
        this.activeStartTime = null;
      }
      console.log('[HandsFreeMode] Now inactive');
      this.saveState();
    }
  }

  /**
   * Check if hands-free mode is currently active
   */
  isActive(): boolean {
    return this.state.isActive;
  }

  // ============================================================
  // Configuration
  // ============================================================

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HandsFreeModeConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[HandsFreeMode] Config updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): HandsFreeModeConfig {
    return { ...this.config };
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks: HandsFreeModeCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
    console.log('[HandsFreeMode] Callbacks configured');
  }

  /**
   * Set auto-start on load preference
   */
  setAutoStartOnLoad(autoStart: boolean): void {
    this.config.autoStartOnLoad = autoStart;
    
    if (this.config.persistPreference && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.autoStart, String(autoStart));
      } catch (error) {
        console.warn('[HandsFreeMode] Failed to save auto-start preference:', error);
      }
    }
    
    console.log('[HandsFreeMode] Auto-start on load:', autoStart);
  }

  /**
   * Check if auto-start on load is enabled
   */
  shouldAutoStartOnLoad(): boolean {
    if (typeof localStorage === 'undefined') {
      return this.config.autoStartOnLoad;
    }

    try {
      const autoStart = localStorage.getItem(STORAGE_KEYS.autoStart);
      return autoStart === 'true';
    } catch {
      return this.config.autoStartOnLoad;
    }
  }

  // ============================================================
  // Sound Effects
  // ============================================================

  /**
   * Play activation sound
   */
  private playActivationSound(): void {
    try {
      // Create a simple beep sound using Web Audio API
      if (typeof AudioContext === 'undefined') return;
      
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 880; // A5 note
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
      // Cleanup
      setTimeout(() => {
        audioContext.close();
      }, 500);
      
      console.log('[HandsFreeMode] Activation sound played');
    } catch (error) {
      console.warn('[HandsFreeMode] Failed to play activation sound:', error);
    }
  }

  /**
   * Play deactivation sound
   */
  private playDeactivationSound(): void {
    try {
      // Create a simple descending beep sound
      if (typeof AudioContext === 'undefined') return;
      
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime); // E5 note
      oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.15); // A4 note
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
      // Cleanup
      setTimeout(() => {
        audioContext.close();
      }, 500);
      
      console.log('[HandsFreeMode] Deactivation sound played');
    } catch (error) {
      console.warn('[HandsFreeMode] Failed to play deactivation sound:', error);
    }
  }

  // ============================================================
  // Stats
  // ============================================================

  /**
   * Get current state
   */
  getState(): HandsFreeModeState {
    // Calculate current active time if active
    let totalActiveTime = this.state.totalActiveTime;
    if (this.state.isActive && this.activeStartTime) {
      totalActiveTime += Date.now() - this.activeStartTime;
    }

    return {
      ...this.state,
      totalActiveTime,
    };
  }

  /**
   * Get total active time in milliseconds
   */
  getTotalActiveTime(): number {
    let total = this.state.totalActiveTime;
    if (this.state.isActive && this.activeStartTime) {
      total += Date.now() - this.activeStartTime;
    }
    return total;
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.state.sessionCount;
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.state.totalActiveTime = 0;
    this.state.sessionCount = 0;
    this.saveState();
    console.log('[HandsFreeMode] Stats reset');
  }

  // ============================================================
  // Cleanup
  // ============================================================

  /**
   * Clear all stored preferences
   */
  clearStoredPreferences(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEYS.enabled);
      localStorage.removeItem(STORAGE_KEYS.autoStart);
      localStorage.removeItem(STORAGE_KEYS.totalActiveTime);
      localStorage.removeItem(STORAGE_KEYS.sessionCount);
      console.log('[HandsFreeMode] Stored preferences cleared');
    } catch (error) {
      console.warn('[HandsFreeMode] Failed to clear stored preferences:', error);
    }
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let handsFreeModeManager: HandsFreeModeManagerImpl | null = null;

/**
 * Get the HandsFreeModeManager singleton instance
 */
export function getHandsFreeModeManager(): HandsFreeModeManagerImpl {
  if (!handsFreeModeManager) {
    handsFreeModeManager = new HandsFreeModeManagerImpl();
  }
  return handsFreeModeManager;
}

/**
 * Create a new HandsFreeModeManager instance
 */
export function createHandsFreeModeManager(
  config?: Partial<HandsFreeModeConfig>
): HandsFreeModeManagerImpl {
  return new HandsFreeModeManagerImpl(config);
}

export default {
  getHandsFreeModeManager,
  createHandsFreeModeManager,
};
