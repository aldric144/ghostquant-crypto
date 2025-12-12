/**
 * TranscriptRouter.ts
 * 
 * STT Restoration Patch - Routes transcripts to appropriate handlers
 * 
 * Responsibilities:
 * - Route partial transcripts to WakeLoopEngine.onTranscript()
 * - Route final transcripts to CopilotOrchestrator.handleSTTFinal()
 * 
 * This is an ADDITIVE module - does NOT modify existing logic.
 */

import { getWakeLoopEngine } from '../../voice_copilot/audio/WakeLoopEngine';
import { getCopilotOrchestrator } from '../../voice_copilot/dialogue/CopilotOrchestrator';
import { normalizeTranscript, shouldActivateWakeWord } from '../../voice_copilot/WakeWordNormalizationPipeline';

/**
 * Handle partial transcripts
 * Routes to WakeLoopEngine.onTranscript() for wake-word detection
 * 
 * @param text - Partial transcript from STT
 */
export function handlePartial(text: string): void {
  if (!text || !text.trim()) return;

  console.log('[TranscriptRouter] partial:', text);

  try {
    // Normalize the transcript through the wake-word pipeline
    const normalized = normalizeTranscript(text);
    
    // Route to WakeLoopEngine for wake-word detection
    const wakeLoop = getWakeLoopEngine();
    wakeLoop.onTranscript(normalized.normalized);
  } catch (error) {
    console.error('[TranscriptRouter] Error handling partial:', error);
  }
}

/**
 * Handle final transcripts
 * Routes to CopilotOrchestrator.handleSTTFinal() for processing
 * 
 * @param text - Final transcript from STT
 */
export async function handleFinal(text: string): Promise<void> {
  if (!text || !text.trim()) return;

  console.log('[TranscriptRouter] final:', text);

  try {
    // Normalize the transcript through the wake-word pipeline
    const normalized = normalizeTranscript(text);
    
    // Route to WakeLoopEngine for wake-word detection (final transcripts also trigger wake)
    const wakeLoop = getWakeLoopEngine();
    wakeLoop.onTranscript(normalized.normalized);
    
    // Route to CopilotOrchestrator for processing
    const orchestrator = getCopilotOrchestrator();
    await orchestrator.handleSTTFinal(normalized.normalized);
  } catch (error) {
    console.error('[TranscriptRouter] Error handling final:', error);
  }
}

export default {
  handlePartial,
  handleFinal,
};
