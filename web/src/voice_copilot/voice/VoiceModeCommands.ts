/**
 * VoiceModeCommands - Voice Command Detection for Voice Mode Switching
 * 
 * Detects voice commands that trigger voice mode changes.
 * Integrates with VoiceModeManager to switch between conversational and mission modes.
 */

import { type VoiceMode } from '../ElevenLabsTTS';
import { setVoiceMode, getVoiceMode } from './VoiceModeManager';

// Voice command patterns for switching to mission mode
const MISSION_MODE_PATTERNS = [
  'switch to mission mode',
  'activate mission mode',
  'activate briefing mode',
  'mission briefing mode',
  'use your executive voice',
  'talk like an analyst',
  'use analyst voice',
  'executive mode',
  'briefing mode',
  'professional mode',
  'formal mode',
  'serious mode',
];

// Voice command patterns for switching to default (conversational) mode
const DEFAULT_MODE_PATTERNS = [
  'switch to conversational voice',
  'switch to conversational mode',
  'use your normal voice',
  'use normal voice',
  'conversational mode',
  'casual mode',
  'friendly mode',
  'chat mode',
  'regular voice',
  'default voice',
  'default mode',
];

// Normalize text for pattern matching
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

/**
 * Detect if text contains a voice mode switch command
 * @param text - The text to analyze
 * @returns The detected mode or null if no command found
 */
export function detectVoiceModeCommand(text: string): VoiceMode | null {
  const normalized = normalizeText(text);
  
  // Check for mission mode commands
  for (const pattern of MISSION_MODE_PATTERNS) {
    if (normalized.includes(pattern)) {
      return 'mission';
    }
  }
  
  // Check for default mode commands
  for (const pattern of DEFAULT_MODE_PATTERNS) {
    if (normalized.includes(pattern)) {
      return 'default';
    }
  }
  
  return null;
}

/**
 * Process text for voice mode commands and execute if found
 * @param text - The text to analyze
 * @returns Object with detected mode and whether a switch occurred
 */
export function processVoiceModeCommand(text: string): { 
  detected: boolean; 
  mode: VoiceMode | null; 
  switched: boolean;
  previousMode: VoiceMode;
} {
  const previousMode = getVoiceMode();
  const detectedMode = detectVoiceModeCommand(text);
  
  if (detectedMode && detectedMode !== previousMode) {
    setVoiceMode(detectedMode);
    return {
      detected: true,
      mode: detectedMode,
      switched: true,
      previousMode,
    };
  }
  
  return {
    detected: detectedMode !== null,
    mode: detectedMode,
    switched: false,
    previousMode,
  };
}

/**
 * Check if text contains any voice mode command
 */
export function hasVoiceModeCommand(text: string): boolean {
  return detectVoiceModeCommand(text) !== null;
}

/**
 * Get confirmation message for voice mode switch
 */
export function getVoiceModeSwitchConfirmation(mode: VoiceMode): string {
  if (mode === 'mission') {
    return "Switching to mission briefing mode. I'll provide concise, analytical responses.";
  }
  return "Switching to conversational mode. I'll be more warm and helpful in my responses.";
}

/**
 * Get all supported voice mode command patterns
 */
export function getSupportedVoiceModeCommands(): { mission: string[]; default: string[] } {
  return {
    mission: [...MISSION_MODE_PATTERNS],
    default: [...DEFAULT_MODE_PATTERNS],
  };
}

export default {
  detectVoiceModeCommand,
  processVoiceModeCommand,
  hasVoiceModeCommand,
  getVoiceModeSwitchConfirmation,
  getSupportedVoiceModeCommands,
};
