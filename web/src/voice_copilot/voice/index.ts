/**
 * GhostQuant Voice Copilot - Voice Mode System
 * 
 * Barrel exports for voice mode management.
 */

export {
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
} from './VoiceModeManager';
export type { VoiceModeChangeCallback } from './VoiceModeManager';

// Voice Mode Commands
export {
  detectVoiceModeCommand,
  processVoiceModeCommand,
  hasVoiceModeCommand,
  getVoiceModeSwitchConfirmation,
  getSupportedVoiceModeCommands,
} from './VoiceModeCommands';

// Voice Mode Personality
export {
  getPersonalityTraits,
  getCurrentPersonalityTraits,
  generateModeContext,
  getCurrentTone,
  getCurrentStyle,
  shouldBeConcise,
  getResponseLengthGuidance,
  transformResponseForMode,
  getModeGreeting,
  getAllPersonalityConfigs,
} from './VoiceModePersonality';
export type { VoiceModePersonalityTraits } from './VoiceModePersonality';
