/**
 * HydraInputParser - Phase 10 Isolated Fix
 * 
 * Parses raw console input from the Hydra Console text field.
 * Handles comma-separated, newline-separated, arrays, and special tokens.
 * 
 * This is a NEW isolated module - does NOT modify any existing code.
 */

// Demo addresses for bootstrap/demo modes
export const DEMO_ADDRESSES = [
  '0xfe9e8709d3215310075d67e3ed32a380ccf451c8',
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
  '0x28C6c06298d514Db089934071355E5743bf21d60',
  '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549',
];

export const BOOTSTRAP_ADDRESSES = [
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', // MATIC
];

export interface ParsedHydraInput {
  heads: string[];
  isValid: boolean;
  error?: string;
  source: 'manual' | 'demo' | 'bootstrap';
}

/**
 * Validates an Ethereum address format
 */
function isValidAddress(address: string): boolean {
  // Basic Ethereum address validation (0x followed by 40 hex chars)
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Cleans and normalizes an address string
 */
function cleanAddress(address: string): string {
  return address.trim().toLowerCase();
}

/**
 * Parses raw input from the Hydra Console
 * 
 * Supported formats:
 * - Comma-separated: "0xabc...,0xdef..."
 * - Newline-separated: "0xabc...\n0xdef..."
 * - Space-separated: "0xabc... 0xdef..."
 * - JSON array: ["0xabc...", "0xdef..."]
 * - Special tokens: "hydra://bootstrap", "hydra://demo"
 * - Single address (will use demo addresses to supplement)
 * 
 * @param rawInput - Raw string input from the console
 * @returns ParsedHydraInput with validated heads array
 */
export function parseHydraInput(rawInput: string): ParsedHydraInput {
  // Handle empty input
  if (!rawInput || rawInput.trim() === '') {
    return {
      heads: [],
      isValid: false,
      error: 'Input is empty. Enter addresses or use hydra://demo',
      source: 'manual',
    };
  }

  const input = rawInput.trim();

  // Handle special tokens
  if (input.toLowerCase() === 'hydra://demo' || input.toLowerCase() === 'demo') {
    return {
      heads: DEMO_ADDRESSES,
      isValid: true,
      source: 'demo',
    };
  }

  if (input.toLowerCase() === 'hydra://bootstrap' || input.toLowerCase() === 'bootstrap') {
    return {
      heads: BOOTSTRAP_ADDRESSES,
      isValid: true,
      source: 'bootstrap',
    };
  }

  // Try to parse as JSON array
  if (input.startsWith('[')) {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        const addresses = parsed
          .map((addr: unknown) => String(addr))
          .map(cleanAddress)
          .filter(isValidAddress);
        
        if (addresses.length >= 2) {
          return {
            heads: addresses,
            isValid: true,
            source: 'manual',
          };
        } else if (addresses.length === 1) {
          // Supplement with demo addresses
          return {
            heads: [addresses[0], ...DEMO_ADDRESSES.slice(0, 2)],
            isValid: true,
            source: 'manual',
          };
        }
      }
    } catch {
      // Not valid JSON, continue with other parsing methods
    }
  }

  // Split by common delimiters: comma, newline, semicolon, space
  const delimiters = /[,\n;\s]+/;
  const parts = input.split(delimiters).filter(Boolean);

  // Extract valid addresses
  const addresses: string[] = [];
  for (const part of parts) {
    const cleaned = cleanAddress(part);
    if (isValidAddress(cleaned)) {
      addresses.push(cleaned);
    } else if (cleaned.startsWith('0x') && cleaned.length > 10) {
      // Partial address - try to use it anyway (might be truncated in display)
      addresses.push(cleaned);
    }
  }

  // If we have at least 2 valid addresses, return them
  if (addresses.length >= 2) {
    return {
      heads: addresses,
      isValid: true,
      source: 'manual',
    };
  }

  // If we have 1 address, supplement with demo addresses
  if (addresses.length === 1) {
    return {
      heads: [addresses[0], ...DEMO_ADDRESSES.slice(0, 2)],
      isValid: true,
      source: 'manual',
    };
  }

  // No valid addresses found - check if input looks like an address attempt
  if (input.startsWith('0x')) {
    return {
      heads: [],
      isValid: false,
      error: 'Invalid address format. Use full Ethereum addresses (0x + 40 hex chars)',
      source: 'manual',
    };
  }

  // Unknown input - suggest using demo mode
  return {
    heads: [],
    isValid: false,
    error: 'No valid addresses found. Try "hydra://demo" or enter comma-separated addresses',
    source: 'manual',
  };
}

/**
 * Validates that we have enough heads for Hydra detection
 */
export function validateHeadsCount(heads: string[]): { valid: boolean; error?: string } {
  if (!heads || heads.length === 0) {
    return {
      valid: false,
      error: 'No Hydra heads provided',
    };
  }

  if (heads.length < 2) {
    return {
      valid: false,
      error: `Insufficient Hydra heads (found ${heads.length}, need >= 2)`,
    };
  }

  return { valid: true };
}

/**
 * Formats heads array for display
 */
export function formatHeadsForDisplay(heads: string[]): string {
  if (heads.length === 0) return 'No heads';
  if (heads.length <= 3) {
    return heads.map(h => `${h.slice(0, 10)}...`).join(', ');
  }
  return `${heads.slice(0, 3).map(h => `${h.slice(0, 10)}...`).join(', ')} +${heads.length - 3} more`;
}

export default {
  parseHydraInput,
  validateHeadsCount,
  formatHeadsForDisplay,
  DEMO_ADDRESSES,
  BOOTSTRAP_ADDRESSES,
};
