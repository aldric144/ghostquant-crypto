/**
 * VoiceModeManager - Dual Voice Mode System for GhostQuant Voice Copilot
 * 
 * Manages switching between conversational (Adam) and mission briefing (Eric) voice modes.
 * Provides session persistence and callback system for mode changes.
 */

import { type VoiceMode, VOICE_MODES } from '../ElevenLabsTTS';

// Storage key for session persistence
const VOICE_MODE_STORAGE_KEY = 'ghostquant_voice_mode';

// Mode change callback type
export type VoiceModeChangeCallback = (mode: VoiceMode, previousMode: VoiceMode) => void;

// Voice mode state
let currentMode: VoiceMode = 'default';
let modeChangeCallbacks: VoiceModeChangeCallback[] = [];
let isInitialized = false;

/**
 * Initialize the VoiceModeManager
 * Loads persisted mode from session storage
 */
export function initializeVoiceModeManager(): void {
  if (isInitialized) return;
  
  if (typeof window !== 'undefined') {
    try {
      const storedMode = sessionStorage.getItem(VOICE_MODE_STORAGE_KEY);
      if (storedMode === 'default' || storedMode === 'mission') {
        currentMode = storedMode;
      }
    } catch (e) {
      console.warn('[VoiceModeManager] Could not load persisted mode:', e);
    }
  }
  
  isInitialized = true;
  console.log(`[VoiceModeManager] Initialized with mode: ${currentMode}`);
}

/**
 * Get the current voice mode
 */
export function getVoiceMode(): VoiceMode {
  if (!isInitialized) {
    initializeVoiceModeManager();
  }
  return currentMode;
}

/**
 * Set the voice mode
 * @param mode - The voice mode to set ('default' or 'mission')
 */
export function setVoiceMode(mode: VoiceMode): void {
  if (!isInitialized) {
    initializeVoiceModeManager();
  }
  
  if (mode !== 'default' && mode !== 'mission') {
    console.warn(`[VoiceModeManager] Invalid mode: ${mode}`);
    return;
  }
  
  const previousMode = currentMode;
  if (previousMode === mode) {
    return; // No change needed
  }
  
  currentMode = mode;
  
  // Persist to session storage
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(VOICE_MODE_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('[VoiceModeManager] Could not persist mode:', e);
    }
  }
  
  // Notify all callbacks
  modeChangeCallbacks.forEach(callback => {
    try {
      callback(mode, previousMode);
    } catch (e) {
      console.error('[VoiceModeManager] Callback error:', e);
    }
  });
  
  console.log(`[VoiceModeManager] Mode changed: ${previousMode} -> ${mode}`);
}

/**
 * Toggle between voice modes
 * @returns The new voice mode after toggling
 */
export function toggleVoiceMode(): VoiceMode {
  const newMode = currentMode === 'default' ? 'mission' : 'default';
  setVoiceMode(newMode);
  return newMode;
}

/**
 * Register a callback for mode changes
 * @param callback - Function to call when mode changes
 * @returns Unsubscribe function
 */
export function onModeChange(callback: VoiceModeChangeCallback): () => void {
  modeChangeCallbacks.push(callback);
  
  // Return unsubscribe function
  return () => {
    modeChangeCallbacks = modeChangeCallbacks.filter(cb => cb !== callback);
  };
}

/**
 * Get the voice ID for the current mode
 */
export function getCurrentVoiceId(): string {
  return VOICE_MODES[currentMode].id;
}

/**
 * Get the voice name for the current mode
 */
export function getCurrentVoiceName(): string {
  return VOICE_MODES[currentMode].name;
}

/**
 * Get the voice description for the current mode
 */
export function getCurrentVoiceDescription(): string {
  return VOICE_MODES[currentMode].description;
}

/**
 * Get voice info for a specific mode
 */
export function getVoiceModeInfo(mode: VoiceMode): { id: string; name: string; description: string } {
  return VOICE_MODES[mode];
}

/**
 * Check if currently in mission mode
 */
export function isMissionMode(): boolean {
  return currentMode === 'mission';
}

/**
 * Check if currently in default (conversational) mode
 */
export function isDefaultMode(): boolean {
  return currentMode === 'default';
}

/**
 * Reset to default mode
 */
export function resetToDefaultMode(): void {
  setVoiceMode('default');
}

/**
 * Get all available voice modes
 */
export function getAvailableVoiceModes(): { mode: VoiceMode; name: string; description: string }[] {
  return [
    { mode: 'default', name: VOICE_MODES.default.name, description: VOICE_MODES.default.description },
    { mode: 'mission', name: VOICE_MODES.mission.name, description: VOICE_MODES.mission.description },
  ];
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  initializeVoiceModeManager();
}

export default {
  initializeVoiceModeManager,
  getVoiceMode,
  setVoiceMode,
  toggleVoiceMode,
  onModeChange,
  getCurrentVoiceId,
  getCurrentVoiceName,
  getCurrentVoiceDescription,
  getVoiceModeInfo,
  isMissionMode,
  isDefaultMode,
  resetToDefaultMode,
  getAvailableVoiceModes,
};
