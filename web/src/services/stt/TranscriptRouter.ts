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
  console.log('[STT Debug T] handlePartial called with:', text);

  try {
    // Normalize the transcript through the wake-word pipeline
    const normalized = normalizeTranscript(text);
    console.log('[STT Debug U] Normalized partial:', normalized.normalized);
    
    // Route to WakeLoopEngine for wake-word detection
    const wakeLoop = getWakeLoopEngine();
    console.log('[STT Debug V] Routing partial to WakeLoopEngine');
    wakeLoop.onTranscript(normalized.normalized);
  } catch (error) {
    console.error('[TranscriptRouter] Error handling partial:', error);
    console.error('[STT Debug W] Error in handlePartial:', error);
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
  console.log('[STT Debug X] handleFinal called with:', text);

  try {
    // Normalize the transcript through the wake-word pipeline
    const normalized = normalizeTranscript(text);
    console.log('[STT Debug Y] Normalized final:', normalized.normalized);
    
    // Route to WakeLoopEngine for wake-word detection (final transcripts also trigger wake)
    const wakeLoop = getWakeLoopEngine();
    console.log('[STT Debug Z] Routing final to WakeLoopEngine');
    wakeLoop.onTranscript(normalized.normalized);
    
    // Route to CopilotOrchestrator for processing
    const orchestrator = getCopilotOrchestrator();
    console.log('[STT Debug AA] Routing final to CopilotOrchestrator.handleSTTFinal()');
    await orchestrator.handleSTTFinal(normalized.normalized);
    console.log('[STT Debug AB] CopilotOrchestrator.handleSTTFinal() completed');
  } catch (error) {
    console.error('[TranscriptRouter] Error handling final:', error);
    console.error('[STT Debug AC] Error in handleFinal:', error);
  }
}

export default {
  handlePartial,
  handleFinal,
};
