/**
 * Hydra Components - Phase 10 Isolated Fix
 * 
 * Export all Hydra input handling components.
 * These are NEW isolated modules - do NOT modify any existing code.
 */

export {
  parseHydraInput,
  validateHeadsCount,
  formatHeadsForDisplay,
  DEMO_ADDRESSES,
  BOOTSTRAP_ADDRESSES,
  type ParsedHydraInput,
} from './HydraInputParser';

export {
  handleHydraSubmit,
  handleDemoDetection,
  handleBootstrapDetection,
  validateHydraInput,
  type HydraSubmitResult,
  type HydraSubmitCallbacks,
} from './HydraSubmitHandler';
