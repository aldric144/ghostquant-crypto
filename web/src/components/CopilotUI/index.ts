/**
 * CopilotUI - GhostQuant Voice Copilot UI Components
 * 
 * Exports all UI components for the Voice Copilot system:
 * - CopilotUIRoot: Global wrapper component
 * - SingularityOrb: Animated orb avatar
 * - MicButton: Microphone activation button
 * - WakeWordIndicator: Wake word status indicator
 * - CopilotPanel: Transcript history panel
 */

// Main root component
export { CopilotUIRoot } from './CopilotUIRoot';
export type { CopilotUIRootProps } from './CopilotUIRoot';

// Singularity Orb
export { SingularityOrb } from './SingularityOrb';
export type { SingularityOrbProps, OrbState } from './SingularityOrb';

// Mic Button
export { MicButton } from './MicButton';
export type { MicButtonProps, MicButtonState } from './MicButton';

// Wake Word Indicator
export { WakeWordIndicator } from './WakeWordIndicator';
export type { WakeWordIndicatorProps } from './WakeWordIndicator';

// Copilot Panel
export { CopilotPanel } from './CopilotPanel';
export type { CopilotPanelProps, TranscriptMessage } from './CopilotPanel';

// Re-export event bus for convenience
export { copilotEvents } from '../../voice_copilot/CopilotEvents';
export type {
  CopilotEventType,
  CopilotUIState,
  InsightEventType,
  CopilotEvent,
} from '../../voice_copilot/CopilotEvents';
