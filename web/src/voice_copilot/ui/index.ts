/**
 * UI Module Exports - Phase 3: Real-Time Intelligence Awareness
 */

export {
  getCopilotUIInterpreter,
  createCopilotUIInterpreter,
  type ChartType,
  type ChartData,
  type ViewDescription,
  type EntityDescription,
  type AlertDescription,
} from './CopilotUIInterpreter';

// CopilotVoiceAdapter - Bridge between CopilotUIRoot and Phase 8 voice pipeline
export {
  getCopilotVoiceAdapter,
  createCopilotVoiceAdapter,
  type VoiceAdapterState,
  type VoiceAdapterCallbacks,
} from './CopilotVoiceAdapter';
