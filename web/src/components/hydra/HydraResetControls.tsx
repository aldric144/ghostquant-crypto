/**
 * HydraResetControls - Isolated UI Component
 * 
 * Provides reset buttons for the Hydra Console.
 * This is a NEW isolated module - does NOT modify any existing code.
 * 
 * Buttons:
 * - Clear Input: Empties the Hydra Console text field
 * - Reset Console: Clears input + clears any displayed output messages
 * - Reset Graph (optional): Resets the Constellation Graph if endpoint exists
 */

'use client';

export interface HydraResetControlsProps {
  /** Callback to clear the input field only */
  onClearInput: () => void;
  /** Callback to reset the entire console state */
  onResetConsole: () => void;
  /** Optional callback to reset the Constellation Graph */
  onResetGraph?: () => void;
  /** Whether reset operations are in progress */
  isLoading?: boolean;
  /** Custom className for the container */
  className?: string;
}

/**
 * HydraResetControls Component
 * 
 * Renders reset buttons for the Hydra Console.
 * Purely presentational - all logic is handled via callbacks.
 */
export default function HydraResetControls({
  onClearInput,
  onResetConsole,
  onResetGraph,
  isLoading = false,
  className = '',
}: HydraResetControlsProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Clear Input Button */}
      <button
        type="button"
        onClick={onClearInput}
        disabled={isLoading}
        className="px-4 py-2 rounded-lg border border-gray-500/30 text-sm text-gray-300 bg-slate-900/50 hover:bg-slate-800/70 hover:border-gray-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        title="Clear the input field"
      >
        Clear Input
      </button>

      {/* Reset Console Button */}
      <button
        type="button"
        onClick={onResetConsole}
        disabled={isLoading}
        className="px-4 py-2 rounded-lg border border-orange-500/40 text-sm text-orange-200 bg-orange-500/10 hover:bg-orange-500/20 hover:border-orange-500/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        title="Clear input and all output displays"
      >
        Reset Console
      </button>

      {/* Reset Graph Button (optional) */}
      {onResetGraph && (
        <button
          type="button"
          onClick={onResetGraph}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg border border-blue-500/40 text-sm text-blue-200 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          title="Reset the Constellation Graph"
        >
          Reset Graph
        </button>
      )}
    </div>
  );
}

/**
 * Compact version of reset controls for smaller spaces
 */
export function HydraResetControlsCompact({
  onClearInput,
  onResetConsole,
  onResetGraph,
  isLoading = false,
  className = '',
}: HydraResetControlsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={onClearInput}
        disabled={isLoading}
        className="px-3 py-1.5 rounded border border-gray-500/30 text-xs text-gray-400 bg-slate-900/50 hover:bg-slate-800/70 disabled:opacity-50 transition-colors"
        title="Clear Input"
      >
        Clear
      </button>
      <button
        type="button"
        onClick={onResetConsole}
        disabled={isLoading}
        className="px-3 py-1.5 rounded border border-orange-500/30 text-xs text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 disabled:opacity-50 transition-colors"
        title="Reset Console"
      >
        Reset
      </button>
      {onResetGraph && (
        <button
          type="button"
          onClick={onResetGraph}
          disabled={isLoading}
          className="px-3 py-1.5 rounded border border-blue-500/30 text-xs text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 disabled:opacity-50 transition-colors"
          title="Reset Graph"
        >
          Graph
        </button>
      )}
    </div>
  );
}
