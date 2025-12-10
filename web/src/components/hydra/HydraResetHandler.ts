/**
 * HydraResetHandler - Isolated Reset Utility
 * 
 * Provides safe wrapper functions to reset Hydra Console state.
 * This is a NEW isolated module - does NOT modify any existing code.
 * 
 * Methods:
 * - clearInput(): Clears the input text field
 * - clearOutput(): Clears all output displays (result, cluster, indicators, error)
 * - resetConsoleState(): Full reset of all console state
 */

import type { Dispatch, SetStateAction } from 'react';

/**
 * Type definitions for Hydra Console state setters
 * Using generic types to avoid importing from page.tsx
 * eslint-disable-next-line @typescript-eslint/no-explicit-any - Required for flexibility with various state types
 */
export interface HydraResetHandlers {
  setOriginAddress: Dispatch<SetStateAction<string>>;
  // Using generic function types to accept any state setter
  setResult: (value: null) => void;
  setCluster: (value: null) => void;
  setIndicators: (value: null) => void;
  setError: Dispatch<SetStateAction<string | null>>;
  setLoading?: Dispatch<SetStateAction<boolean>>;
}

/**
 * Clears the input text field only.
 * 
 * @param handlers - Object containing setOriginAddress setter
 */
export function clearInput(
  handlers: Pick<HydraResetHandlers, 'setOriginAddress'>
): void {
  handlers.setOriginAddress('');
}

/**
 * Clears all output displays without affecting input.
 * Clears: result, cluster, indicators, error
 * 
 * @param handlers - Object containing output state setters
 */
export function clearOutput(
  handlers: Pick<HydraResetHandlers, 'setResult' | 'setCluster' | 'setIndicators' | 'setError'>
): void {
  handlers.setResult(null);
  handlers.setCluster(null);
  handlers.setIndicators(null);
  handlers.setError(null);
}

/**
 * Full reset of all console state.
 * Clears input, all outputs, and resets loading state.
 * 
 * @param handlers - Object containing all state setters
 */
export function resetConsoleState(handlers: HydraResetHandlers): void {
  // Clear input
  clearInput(handlers);
  
  // Clear all outputs
  clearOutput(handlers);
  
  // Reset loading state if provided
  if (handlers.setLoading) {
    handlers.setLoading(false);
  }
}

/**
 * Creates a bound reset handler object for use in components.
 * This allows passing a single object instead of individual setters.
 * 
 * @param handlers - All state setters from the console component
 * @returns Object with bound reset methods
 */
export function createResetHandlers(handlers: HydraResetHandlers) {
  return {
    clearInput: () => clearInput(handlers),
    clearOutput: () => clearOutput(handlers),
    resetConsoleState: () => resetConsoleState(handlers),
  };
}

export default {
  clearInput,
  clearOutput,
  resetConsoleState,
  createResetHandlers,
};
