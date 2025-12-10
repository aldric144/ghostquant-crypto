/**
 * VoiceModePersonality - Personality Context for Voice Modes
 * 
 * Provides personality and tone adjustments based on the active voice mode.
 * Integrates with CopilotBrain to inject mode-specific context into responses.
 * 
 * Default Mode (Adam): Conversational, warm, helpful
 * Mission Mode (Eric): Concise, analytical, authoritative
 */

import { type VoiceMode } from '../ElevenLabsTTS';
import { getVoiceMode, isMissionMode } from './VoiceModeManager';

// Personality traits for each voice mode
export interface VoiceModePersonalityTraits {
  tone: string;
  style: string;
  characteristics: string[];
  responseGuidelines: string[];
}

// Default (conversational) mode personality
const DEFAULT_PERSONALITY: VoiceModePersonalityTraits = {
  tone: 'conversational, warm, helpful',
  style: 'friendly and approachable',
  characteristics: [
    'Uses natural, flowing language',
    'Explains concepts in accessible terms',
    'Engages with follow-up questions',
    'Shows enthusiasm and interest',
    'Provides context and background',
  ],
  responseGuidelines: [
    'Be warm and welcoming in responses',
    'Use conversational language',
    'Offer to explain further if needed',
    'Show genuine interest in helping',
    'Keep responses informative but friendly',
  ],
};

// Mission (briefing) mode personality
const MISSION_PERSONALITY: VoiceModePersonalityTraits = {
  tone: 'concise, analytical, authoritative',
  style: 'professional and direct',
  characteristics: [
    'Uses precise, technical language',
    'Delivers information efficiently',
    'Focuses on key data points',
    'Maintains professional demeanor',
    'Prioritizes actionable insights',
  ],
  responseGuidelines: [
    'Be direct and to the point',
    'Lead with the most important information',
    'Use bullet points for clarity when appropriate',
    'Avoid unnecessary pleasantries',
    'Focus on data and analysis',
  ],
};

/**
 * Get personality traits for a specific voice mode
 */
export function getPersonalityTraits(mode?: VoiceMode): VoiceModePersonalityTraits {
  const activeMode = mode || getVoiceMode();
  return activeMode === 'mission' ? MISSION_PERSONALITY : DEFAULT_PERSONALITY;
}

/**
 * Get the current personality traits based on active voice mode
 */
export function getCurrentPersonalityTraits(): VoiceModePersonalityTraits {
  return getPersonalityTraits(getVoiceMode());
}

/**
 * Generate BEGIN_MODE_CONTEXT injection for CopilotBrain
 * This context is prepended to the system prompt to adjust response style
 */
export function generateModeContext(): string {
  const mode = getVoiceMode();
  const traits = getPersonalityTraits(mode);
  
  if (mode === 'mission') {
    return `[MISSION BRIEFING MODE ACTIVE]
You are now in mission briefing mode. Adjust your communication style:
- Tone: ${traits.tone}
- Style: ${traits.style}
- Be direct and analytical
- Lead with key insights
- Minimize conversational elements
- Focus on actionable intelligence`;
  }
  
  return `[CONVERSATIONAL MODE ACTIVE]
You are in conversational mode. Maintain your communication style:
- Tone: ${traits.tone}
- Style: ${traits.style}
- Be warm and helpful
- Engage naturally with the user
- Provide context and explanations
- Show genuine interest in assisting`;
}

/**
 * Get tone descriptor for the current mode
 */
export function getCurrentTone(): string {
  return getCurrentPersonalityTraits().tone;
}

/**
 * Get style descriptor for the current mode
 */
export function getCurrentStyle(): string {
  return getCurrentPersonalityTraits().style;
}

/**
 * Check if response should be concise (mission mode)
 */
export function shouldBeConcise(): boolean {
  return isMissionMode();
}

/**
 * Get response length guidance based on mode
 */
export function getResponseLengthGuidance(): 'brief' | 'standard' | 'detailed' {
  return isMissionMode() ? 'brief' : 'standard';
}

/**
 * Transform response based on voice mode
 * Can be used to post-process responses for mode-appropriate delivery
 */
export function transformResponseForMode(response: string, mode?: VoiceMode): string {
  const activeMode = mode || getVoiceMode();
  
  // In mission mode, we might want to trim unnecessary pleasantries
  if (activeMode === 'mission') {
    // Remove common conversational starters
    let transformed = response
      .replace(/^(Sure!|Of course!|Absolutely!|Great question!|I'd be happy to help!)\s*/i, '')
      .replace(/^(Let me help you with that\.)\s*/i, '');
    
    return transformed.trim();
  }
  
  return response;
}

/**
 * Get greeting based on voice mode
 */
export function getModeGreeting(): string {
  if (isMissionMode()) {
    return "GhostQuant ready. What intelligence do you need?";
  }
  return "Hey there! I'm GhostQuant, your AI trading assistant. How can I help you today?";
}

/**
 * Get all personality configurations
 */
export function getAllPersonalityConfigs(): Record<VoiceMode, VoiceModePersonalityTraits> {
  return {
    default: DEFAULT_PERSONALITY,
    mission: MISSION_PERSONALITY,
  };
}

export default {
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
};
