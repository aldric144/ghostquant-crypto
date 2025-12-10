/**
 * HydraSubmitHandler - Phase 10 Isolated Fix
 * 
 * New submit handler that wraps the existing Hydra Console submission.
 * Provides proper input parsing and request handling.
 * 
 * This is a NEW isolated module - does NOT modify any existing code.
 */

import { parseHydraInput, validateHeadsCount, formatHeadsForDisplay, ParsedHydraInput } from './HydraInputParser';
import { executeHydraDetection, HydraAdapterResponse } from '../../services/hydra/HydraRequestAdapter';

export interface HydraSubmitResult {
  success: boolean;
  parsedInput: ParsedHydraInput;
  adapterResponse?: HydraAdapterResponse;
  error?: string;
  logs: string[];
}

export interface HydraSubmitCallbacks {
  onStart?: () => void;
  onParsed?: (parsed: ParsedHydraInput) => void;
  onProgress?: (message: string) => void;
  onSuccess?: (result: HydraSubmitResult) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

/**
 * Main submit handler for Hydra Console
 * 
 * This function:
 * 1. Reads and parses user input using HydraInputParser
 * 2. Validates the parsed heads
 * 3. Calls HydraRequestAdapter to execute detection
 * 4. Returns the complete result
 * 
 * @param rawInput - Raw input string from the console text field
 * @param callbacks - Optional callbacks for progress updates
 * @returns HydraSubmitResult with full results and logs
 */
export async function handleHydraSubmit(
  rawInput: string,
  callbacks?: HydraSubmitCallbacks
): Promise<HydraSubmitResult> {
  const logs: string[] = [];
  
  try {
    // Notify start
    callbacks?.onStart?.();
    logs.push(`[HydraSubmit] Starting submission with input: "${rawInput.slice(0, 50)}${rawInput.length > 50 ? '...' : ''}"`);

    // Step 1: Parse input
    callbacks?.onProgress?.('Parsing input...');
    const parsedInput = parseHydraInput(rawInput);
    logs.push(`[HydraSubmit] Parsed input: valid=${parsedInput.isValid}, heads=${parsedInput.heads.length}, source=${parsedInput.source}`);
    
    callbacks?.onParsed?.(parsedInput);

    // Check if parsing was successful
    if (!parsedInput.isValid) {
      const error = parsedInput.error || 'Failed to parse input';
      logs.push(`[HydraSubmit] Parse error: ${error}`);
      callbacks?.onError?.(error);
      callbacks?.onComplete?.();
      
      return {
        success: false,
        parsedInput,
        error,
        logs,
      };
    }

    // Step 2: Validate heads count
    callbacks?.onProgress?.('Validating heads...');
    const validation = validateHeadsCount(parsedInput.heads);
    logs.push(`[HydraSubmit] Validation: valid=${validation.valid}`);

    if (!validation.valid) {
      const error = validation.error || 'Validation failed';
      logs.push(`[HydraSubmit] Validation error: ${error}`);
      callbacks?.onError?.(error);
      callbacks?.onComplete?.();
      
      return {
        success: false,
        parsedInput,
        error,
        logs,
      };
    }

    // Step 3: Execute detection via adapter
    callbacks?.onProgress?.(`Executing detection with ${parsedInput.heads.length} heads...`);
    logs.push(`[HydraSubmit] Executing detection with heads: ${formatHeadsForDisplay(parsedInput.heads)}`);
    
    const adapterResponse = await executeHydraDetection(parsedInput.heads);
    logs.push(...adapterResponse.logs);

    // Step 4: Handle result
    if (adapterResponse.success) {
      logs.push(`[HydraSubmit] Detection successful!`);
      
      const result: HydraSubmitResult = {
        success: true,
        parsedInput,
        adapterResponse,
        logs,
      };
      
      callbacks?.onSuccess?.(result);
      callbacks?.onComplete?.();
      
      return result;
    } else {
      const error = adapterResponse.error || 'Detection failed';
      logs.push(`[HydraSubmit] Detection failed: ${error}`);
      
      callbacks?.onError?.(error);
      callbacks?.onComplete?.();
      
      return {
        success: false,
        parsedInput,
        adapterResponse,
        error,
        logs,
      };
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logs.push(`[HydraSubmit] Exception: ${errorMessage}`);
    
    callbacks?.onError?.(errorMessage);
    callbacks?.onComplete?.();
    
    return {
      success: false,
      parsedInput: {
        heads: [],
        isValid: false,
        error: errorMessage,
        source: 'manual',
      },
      error: errorMessage,
      logs,
    };
  }
}

/**
 * Quick detection using demo addresses
 */
export async function handleDemoDetection(callbacks?: HydraSubmitCallbacks): Promise<HydraSubmitResult> {
  return handleHydraSubmit('hydra://demo', callbacks);
}

/**
 * Quick detection using bootstrap addresses
 */
export async function handleBootstrapDetection(callbacks?: HydraSubmitCallbacks): Promise<HydraSubmitResult> {
  return handleHydraSubmit('hydra://bootstrap', callbacks);
}

/**
 * Validates input without executing detection
 */
export function validateHydraInput(rawInput: string): {
  valid: boolean;
  heads: string[];
  error?: string;
  suggestion?: string;
} {
  const parsed = parseHydraInput(rawInput);
  
  if (!parsed.isValid) {
    return {
      valid: false,
      heads: [],
      error: parsed.error,
      suggestion: 'Try "hydra://demo" for a quick test, or enter comma-separated addresses',
    };
  }

  const validation = validateHeadsCount(parsed.heads);
  
  if (!validation.valid) {
    return {
      valid: false,
      heads: parsed.heads,
      error: validation.error,
      suggestion: 'Enter at least 2 addresses, or use "hydra://demo"',
    };
  }

  return {
    valid: true,
    heads: parsed.heads,
  };
}

export default {
  handleHydraSubmit,
  handleDemoDetection,
  handleBootstrapDetection,
  validateHydraInput,
};
