/**
 * HydraConsoleConnector - Phase 10 Isolated Fix
 * 
 * Connector that intercepts Hydra Console submissions and routes them
 * through the new HydraInputParser and HydraRequestAdapter.
 * 
 * This is a NEW isolated module - does NOT modify any existing code.
 */

import { parseHydraInput, validateHeadsCount, formatHeadsForDisplay } from './HydraInputParser';
import { executeHydraDetection, HydraAdapterResponse } from '../../services/hydra/HydraRequestAdapter';

export interface HydraConnectorResult {
  success: boolean;
  headsCount: number;
  cluster?: {
    cluster_id: string;
    heads: string[];
    relays: string[];
    proxies: string[];
    risk_level: string;
    risk_score: number;
    indicators: Record<string, number>;
    narrative: string;
    timestamp: string;
  };
  report?: {
    cluster: {
      cluster_id: string;
      heads: string[];
      relays: string[];
      proxies: string[];
      risk_level: string;
      risk_score: number;
      indicators: Record<string, number>;
      narrative: string;
      timestamp: string;
    };
    summary: string;
    recommendations: string[];
  };
  error?: string;
  timestamp: string;
  logs: string[];
}

export interface HydraConnectorCallbacks {
  onStart?: () => void;
  onProgress?: (message: string) => void;
  onSuccess?: (result: HydraConnectorResult) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

/**
 * Main connector function - intercepts Hydra Console submission
 * 
 * This function:
 * 1. Extracts and parses the input using HydraInputParser
 * 2. Validates the heads count (>= 2 required)
 * 3. Executes detection via HydraRequestAdapter
 * 4. Returns results in the format expected by the Hydra Console
 * 
 * @param input - Raw input string from the Hydra Console input box
 * @param callbacks - Optional callbacks for progress updates
 * @returns HydraConnectorResult compatible with existing console display
 */
export async function runHydraDetection(
  input: string,
  callbacks?: HydraConnectorCallbacks
): Promise<HydraConnectorResult> {
  const logs: string[] = [];
  const timestamp = new Date().toISOString();

  try {
    // Notify start
    callbacks?.onStart?.();
    logs.push(`[Connector] Starting Hydra detection with input: "${input.slice(0, 50)}${input.length > 50 ? '...' : ''}"`);

    // Step 1: Parse input
    callbacks?.onProgress?.('Parsing input...');
    const parsed = parseHydraInput(input);
    logs.push(`[Connector] Parsed: valid=${parsed.isValid}, heads=${parsed.heads.length}, source=${parsed.source}`);

    if (!parsed.isValid) {
      const error = parsed.error || 'Failed to parse input';
      logs.push(`[Connector] Parse error: ${error}`);
      callbacks?.onError?.(error);
      callbacks?.onComplete?.();
      
      return {
        success: false,
        headsCount: 0,
        error,
        timestamp,
        logs,
      };
    }

    // Step 2: Validate heads count
    callbacks?.onProgress?.('Validating heads...');
    const validation = validateHeadsCount(parsed.heads);
    logs.push(`[Connector] Validation: valid=${validation.valid}`);

    if (!validation.valid) {
      const error = validation.error || 'Validation failed';
      logs.push(`[Connector] Validation error: ${error}`);
      callbacks?.onError?.(error);
      callbacks?.onComplete?.();
      
      return {
        success: false,
        headsCount: parsed.heads.length,
        error,
        timestamp,
        logs,
      };
    }

    // Step 3: Execute detection
    // Pass mode to the adapter for demo/bootstrap handling
    const mode = parsed.source === 'demo' ? 'demo' : parsed.source === 'bootstrap' ? 'bootstrap' : undefined;
    callbacks?.onProgress?.(`Executing detection with ${parsed.heads.length} heads${mode ? ` (${mode} mode)` : ''}...`);
    logs.push(`[Connector] Executing detection with heads: ${formatHeadsForDisplay(parsed.heads)}${mode ? ` (mode: ${mode})` : ''}`);
    
    const adapterResponse: HydraAdapterResponse = await executeHydraDetection(parsed.heads, mode);
    logs.push(...adapterResponse.logs);

    // Step 4: Transform response to console format
    if (adapterResponse.success && adapterResponse.detectResult?.success) {
      const detectResult = adapterResponse.detectResult;
      
      logs.push(`[Connector] Detection successful!`);
      
      const result: HydraConnectorResult = {
        success: true,
        headsCount: parsed.heads.length,
        cluster: detectResult.report?.cluster,
        report: detectResult.report,
        timestamp,
        logs,
      };
      
      callbacks?.onSuccess?.(result);
      callbacks?.onComplete?.();
      
      return result;
    } else {
      const error = adapterResponse.error || adapterResponse.detectResult?.error || 'Detection failed';
      logs.push(`[Connector] Detection failed: ${error}`);
      
      callbacks?.onError?.(error);
      callbacks?.onComplete?.();
      
      return {
        success: false,
        headsCount: parsed.heads.length,
        error,
        timestamp,
        logs,
      };
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logs.push(`[Connector] Exception: ${errorMessage}`);
    
    callbacks?.onError?.(errorMessage);
    callbacks?.onComplete?.();
    
    return {
      success: false,
      headsCount: 0,
      error: errorMessage,
      timestamp,
      logs,
    };
  }
}

/**
 * Quick demo detection
 */
export async function runDemoDetection(callbacks?: HydraConnectorCallbacks): Promise<HydraConnectorResult> {
  return runHydraDetection('hydra://demo', callbacks);
}

/**
 * Quick bootstrap detection
 */
export async function runBootstrapDetection(callbacks?: HydraConnectorCallbacks): Promise<HydraConnectorResult> {
  return runHydraDetection('hydra://bootstrap', callbacks);
}

/**
 * Validates input without executing detection
 */
export function validateInput(input: string): {
  valid: boolean;
  headsCount: number;
  error?: string;
  suggestion?: string;
} {
  const parsed = parseHydraInput(input);
  
  if (!parsed.isValid) {
    return {
      valid: false,
      headsCount: 0,
      error: parsed.error,
      suggestion: 'Try "hydra://demo" for a quick test, or enter comma-separated addresses',
    };
  }

  const validation = validateHeadsCount(parsed.heads);
  
  if (!validation.valid) {
    return {
      valid: false,
      headsCount: parsed.heads.length,
      error: validation.error,
      suggestion: 'Enter at least 2 addresses, or use "hydra://demo"',
    };
  }

  return {
    valid: true,
    headsCount: parsed.heads.length,
  };
}

export default {
  runHydraDetection,
  runDemoDetection,
  runBootstrapDetection,
  validateInput,
};
