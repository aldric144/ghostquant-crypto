/**
 * Dialogue Module Index - Phase 2 Conversational Engine
 * 
 * Exports all dialogue-related modules for the GhostQuant Voice Copilot.
 */

// CopilotDialogueManager - Conversation state tracking
export {
  getDialogueManager,
  createDialogueManager,
  type DialogueTurn,
  type DialogueState,
  type FollowUpContext,
  type DialogueManagerConfig,
} from './CopilotDialogueManager';

// CopilotInterruptionEngine - Mid-sentence interruption handling
export {
  getInterruptionEngine,
  createInterruptionEngine,
  type InterruptionState,
  type InterruptionEvent,
  type InterruptionConfig,
} from './CopilotInterruptionEngine';

// NaturalExpansionEngine - Conversational variation
export {
  getNaturalExpansionEngine,
  createNaturalExpansionEngine,
  type ExpansionMode,
  type OpeningStyle,
  type ExpansionConfig,
} from './NaturalExpansionEngine';

// CopilotOrchestrator - Phase 2 pipeline integration
export {
  getCopilotOrchestrator,
  createCopilotOrchestrator,
  type OrchestratorConfig,
  type ProcessedQuery,
  type ProcessedResponse,
} from './CopilotOrchestrator';
