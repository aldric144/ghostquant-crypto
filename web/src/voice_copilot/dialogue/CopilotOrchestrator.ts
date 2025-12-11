/**
 * CopilotOrchestrator - Phase 2, 3 & 4 Conversational Engine Integration
 * 
 * Integrates all Phase 2, Phase 3, and Phase 4 modules into a unified response pipeline:
 * 
 * Flow:
 * 1. STT → IntentModel
 * 2. IntentModel → DialogueManager (context + follow-up)
 * 3. CopilotStateMonitor → fetch real-time state (Phase 3)
 * 4. CopilotDataAggregator → fetch live intelligence (Phase 3)
 * 5. CopilotUIInterpreter → generate explanation (Phase 3)
 * 6. DialogueManager → KnowledgeBase (topic resolution)
 * 7. KnowledgeBase → NaturalExpansionEngine
 * 8. ToneEngine → apply conversational tone
 * 9. InterruptibleTTSPipeline → speak the final output
 * 
 * Phase 4 adds:
 * - ContinuousListeningController for hands-free operation
 * - HandsFreeModeManager for toggle and persistence
 * - WakeLoopEngine for continuous wake-word detection
 * 
 * This is an ADDITIVE module - does NOT modify existing Copilot logic.
 * It wraps and extends the existing system.
 */

import { getDialogueManager, type DialogueTurn } from './CopilotDialogueManager';
import { getInterruptionEngine } from './CopilotInterruptionEngine';
import { getNaturalExpansionEngine, type ExpansionMode } from './NaturalExpansionEngine';
import { getInterruptibleTTSPipeline } from '../audio/InterruptibleTTSPipeline';
import {
  selectConversationalProfile,
  applyConversationalProfile,
  selectTone,
  transformResponse,
  createToneContext,
  type ToneState,
} from '../CopilotToneEngine';
import { recognizeIntent, type RecognizedIntent } from '../CopilotIntentModel';

// Phase 3 imports
import { getCopilotStateMonitor, type CopilotState, type GhostQuantModule } from '../state/CopilotStateMonitor';
import { getCopilotDataAggregator, type AggregatedIntelligence } from '../state/CopilotDataAggregator';
import { getCopilotUIInterpreter, type ViewDescription } from '../ui/CopilotUIInterpreter';

// Phase 4 imports
import { getContinuousListeningController, type ContinuousListeningState } from '../audio/ContinuousListeningController';
import { getHandsFreeModeManager } from '../state/HandsFreeModeManager';

export interface OrchestratorConfig {
  enableDialogueTracking: boolean;
  enableInterruption: boolean;
  enableNaturalExpansion: boolean;
  enableToneAdaptation: boolean;
  enableInterruptibleTTS: boolean;
  defaultExpansionMode: ExpansionMode;
  enableLogging: boolean;
  // Phase 3 options
  enableRealTimeAwareness: boolean;
  enableLiveIntelligence: boolean;
  enableUIInterpretation: boolean;
  // Phase 4 options
  enableContinuousListening: boolean;
  enableHandsFreeMode: boolean;
  autoStartHandsFree: boolean;
}

const DEFAULT_CONFIG: OrchestratorConfig = {
  enableDialogueTracking: true,
  enableInterruption: true,
  enableNaturalExpansion: true,
  enableToneAdaptation: true,
  enableInterruptibleTTS: true,
  defaultExpansionMode: 'standard',
  enableLogging: true,
  // Phase 3 defaults
  enableRealTimeAwareness: true,
  enableLiveIntelligence: true,
  enableUIInterpretation: true,
  // Phase 4 defaults
  enableContinuousListening: true,
  enableHandsFreeMode: true,
  autoStartHandsFree: false,
};

export interface ProcessedQuery {
  originalQuery: string;
  normalizedQuery: string;
  intent: RecognizedIntent;
  isFollowUp: boolean;
  followUpType: string | null;
  resolvedReferences: Array<{ original: string; resolved: string }>;
  needsClarification: boolean;
  clarifyingQuestion: string | null;
  contextSummary: string | null;
}

export interface ProcessedResponse {
  originalResponse: string;
  expandedResponse: string;
  finalResponse: string;
  toneApplied: ToneState;
  profileApplied: string;
  transitionPhrase: string | null;
}

class CopilotOrchestratorImpl {
  private config: OrchestratorConfig;
  private currentPageContext: string = '';
  private lastTone: ToneState | undefined;

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.log('CopilotOrchestrator initialized');
  }

  /**
   * Log message with [CopilotPhase2] prefix
   */
  private log(message: string, data?: unknown): void {
    if (this.config.enableLogging) {
      if (data) {
        console.log(`[CopilotPhase2][Orchestrator] ${message}`, data);
      } else {
        console.log(`[CopilotPhase2][Orchestrator] ${message}`);
      }
    }
  }

  /**
   * Set current page context
   */
  setPageContext(pageContext: string): void {
    this.currentPageContext = pageContext;
    this.log('Page context updated:', pageContext);
  }

  /**
   * Process user query through the full pipeline
   * 
   * Steps:
   * 1. Recognize intent
   * 2. Check for follow-up
   * 3. Resolve references
   * 4. Check if clarification needed
   */
  processQuery(userQuery: string): ProcessedQuery {
    this.log('Processing query:', userQuery);

    // Step 1: Recognize intent
    const intent = recognizeIntent(userQuery);
    this.log('Intent recognized:', intent.category);

    // Step 2: Check for follow-up (if dialogue tracking enabled)
    let isFollowUp = false;
    let followUpType: string | null = null;
    
    if (this.config.enableDialogueTracking) {
      const dialogueManager = getDialogueManager();
      const followUpResult = dialogueManager.detectFollowUp(userQuery);
      isFollowUp = followUpResult.isFollowUp;
      followUpType = followUpResult.followUpType;
      this.log('Follow-up detection:', { isFollowUp, followUpType });
    }

    // Step 3: Resolve references
    let resolvedReferences: Array<{ original: string; resolved: string }> = [];
    let needsClarification = false;
    let clarifyingQuestion: string | null = null;

    if (this.config.enableDialogueTracking) {
      const dialogueManager = getDialogueManager();
      const resolution = dialogueManager.resolveReference(
        userQuery,
        this.currentPageContext,
        undefined
      );
      resolvedReferences = resolution.resolvedReferences;
      needsClarification = resolution.needsClarification;

      // Get clarifying question if needed
      if (needsClarification) {
        clarifyingQuestion = dialogueManager.getClarifyingQuestion(userQuery);
      }
    }

    // Step 4: Get context summary for long conversations
    let contextSummary: string | null = null;
    if (this.config.enableDialogueTracking) {
      const dialogueManager = getDialogueManager();
      contextSummary = dialogueManager.getContextSummary();
    }

    const processed: ProcessedQuery = {
      originalQuery: userQuery,
      normalizedQuery: userQuery, // Could be enhanced with normalization
      intent,
      isFollowUp,
      followUpType,
      resolvedReferences,
      needsClarification,
      clarifyingQuestion,
      contextSummary,
    };

    this.log('Query processed:', processed);
    return processed;
  }

  /**
   * Process response through the full pipeline
   * 
   * Steps:
   * 1. Apply natural expansion
   * 2. Select and apply tone
   * 3. Add transition phrase if follow-up
   */
  processResponse(
    response: string,
    processedQuery: ProcessedQuery
  ): ProcessedResponse {
    this.log('Processing response');

    let expandedResponse = response;
    let finalResponse = response;
    let toneApplied: ToneState = 'conversational';
    let profileApplied = 'friendly';
    let transitionPhrase: string | null = null;

    // Step 1: Apply natural expansion
    if (this.config.enableNaturalExpansion) {
      const expansionEngine = getNaturalExpansionEngine();
      expandedResponse = expansionEngine.expand(response, {
        isFollowUp: processedQuery.isFollowUp,
        questionType: processedQuery.intent.category,
      });
      this.log('Natural expansion applied');
    }

    // Step 2: Select and apply tone
    if (this.config.enableToneAdaptation) {
      // Create tone context
      const toneContext = createToneContext(
        processedQuery.originalQuery,
        processedQuery.intent,
        this.currentPageContext,
        this.lastTone
      );

      // Select tone
      const toneConfig = selectTone(toneContext);
      toneApplied = toneConfig.state;

      // Transform response with tone
      finalResponse = transformResponse(expandedResponse, toneConfig);

      // Also apply conversational profile
      const profile = selectConversationalProfile(
        processedQuery.originalQuery,
        this.currentPageContext
      );
      profileApplied = profile.profile;
      finalResponse = applyConversationalProfile(finalResponse, profile);

      // Update last tone
      this.lastTone = toneApplied;
      this.log('Tone applied:', toneApplied);
    } else {
      finalResponse = expandedResponse;
    }

    // Step 3: Add transition phrase if follow-up
    if (processedQuery.isFollowUp && this.config.enableDialogueTracking) {
      const dialogueManager = getDialogueManager();
      transitionPhrase = dialogueManager.getTransitionPhrase();
      if (transitionPhrase) {
        finalResponse = `${transitionPhrase} ${finalResponse}`;
        this.log('Transition phrase added:', transitionPhrase);
      }
    }

    const processed: ProcessedResponse = {
      originalResponse: response,
      expandedResponse,
      finalResponse,
      toneApplied,
      profileApplied,
      transitionPhrase,
    };

    this.log('Response processed');
    return processed;
  }

  /**
   * Update dialogue state after a complete turn
   */
  updateDialogueState(
    userQuery: string,
    copilotResponse: string,
    intent?: string,
    pageContext?: string
  ): void {
    if (!this.config.enableDialogueTracking) return;

    const dialogueManager = getDialogueManager();
    dialogueManager.updateState(
      userQuery,
      copilotResponse,
      intent,
      pageContext || this.currentPageContext
    );
    this.log('Dialogue state updated');
  }

  /**
   * Speak response using interruptible TTS
   */
  async speakResponse(audioBlob: Blob): Promise<void> {
    if (!this.config.enableInterruptibleTTS) {
      this.log('Interruptible TTS disabled, skipping');
      return;
    }

    const ttsPipeline = getInterruptibleTTSPipeline();
    await ttsPipeline.play(audioBlob);
    this.log('Response spoken via interruptible TTS');
  }

  /**
   * Speak response text using browser TTS (Phase 4)
   * This is a simplified version that uses the browser's built-in TTS
   * for continuous listening mode when audio blobs are not available
   */
  async speakResponseText(text: string): Promise<void> {
    this.log('Speaking response text:', text.substring(0, 50) + '...');
    
    // Use browser's built-in speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.onend = () => {
          this.log('Speech completed');
          resolve();
        };
        utterance.onerror = () => {
          this.log('Speech error, resolving anyway');
          resolve();
        };
        window.speechSynthesis.speak(utterance);
      });
    } else {
      this.log('Speech synthesis not available');
    }
  }

  /**
   * Stop current speech (for interruption)
   */
  stopSpeech(): void {
    if (!this.config.enableInterruptibleTTS) return;

    const ttsPipeline = getInterruptibleTTSPipeline();
    ttsPipeline.stop();
    this.log('Speech stopped');
  }

  /**
   * Notify that user started speaking (for interruption detection)
   */
  notifyUserSpeechStart(): void {
    if (!this.config.enableInterruption) return;

    const interruptionEngine = getInterruptionEngine();
    interruptionEngine.notifyUserSpeechDetected();
    this.log('User speech detected');
  }

  /**
   * Notify that user stopped speaking
   */
  notifyUserSpeechEnd(): void {
    if (!this.config.enableInterruption) return;

    const interruptionEngine = getInterruptionEngine();
    interruptionEngine.notifyUserSpeechEnded();
    this.log('User speech ended');
  }

  /**
   * Clear dialogue context
   */
  clearContext(): void {
    if (!this.config.enableDialogueTracking) return;

    const dialogueManager = getDialogueManager();
    dialogueManager.clearContext();
    this.lastTone = undefined;
    this.log('Context cleared');
  }

  /**
   * Get current dialogue context
   */
  getDialogueContext(): {
    recentTurns: DialogueTurn[];
    currentTopic: string | null;
    lastModuleMentioned: string | null;
    mentionedEntities: string[];
  } | null {
    if (!this.config.enableDialogueTracking) return null;

    const dialogueManager = getDialogueManager();
    return dialogueManager.getContext();
  }

  /**
   * Set expansion mode
   */
  setExpansionMode(mode: ExpansionMode): void {
    if (!this.config.enableNaturalExpansion) return;

    const expansionEngine = getNaturalExpansionEngine();
    expansionEngine.setMode(mode);
    this.log('Expansion mode set:', mode);
  }

  /**
   * Check if TTS is currently speaking
   */
  isSpeaking(): boolean {
    if (!this.config.enableInterruptibleTTS) return false;

    const ttsPipeline = getInterruptibleTTSPipeline();
    return ttsPipeline.isPlaying();
  }

  // ============================================================
  // Phase 3: Real-Time Intelligence Awareness Methods
  // ============================================================

  /**
   * Update the active page in the state monitor
   */
  updateActivePage(route: string): void {
    if (!this.config.enableRealTimeAwareness) return;

    const stateMonitor = getCopilotStateMonitor();
    stateMonitor.updateActivePage(route);
    this.setPageContext(route);
    this.log('Active page updated:', route);
  }

  /**
   * Update the active module in the state monitor
   */
  updateActiveModule(module: GhostQuantModule): void {
    if (!this.config.enableRealTimeAwareness) return;

    const stateMonitor = getCopilotStateMonitor();
    stateMonitor.updateActiveModule(module);
    this.log('Active module updated:', module);
  }

  /**
   * Update selected entity in the state monitor
   */
  updateSelectedEntity(entity: { id: string; type: string; name?: string } | null): void {
    if (!this.config.enableRealTimeAwareness) return;

    const stateMonitor = getCopilotStateMonitor();
    stateMonitor.updateSelectedEntity(entity ? {
      id: entity.id,
      type: entity.type as 'wallet' | 'token' | 'cluster' | 'transaction' | 'alert' | 'unknown',
      name: entity.name,
    } : null);
    this.log('Selected entity updated:', entity);
  }

  /**
   * Get the current application state
   */
  getCurrentState(): CopilotState | null {
    if (!this.config.enableRealTimeAwareness) return null;

    const stateMonitor = getCopilotStateMonitor();
    return stateMonitor.getCurrentState();
  }

  /**
   * Get a human-readable context summary
   */
  getStateSummary(): string {
    if (!this.config.enableRealTimeAwareness) return '';

    const stateMonitor = getCopilotStateMonitor();
    return stateMonitor.getContextSummary().summary;
  }

  /**
   * Fetch aggregated intelligence from all sources
   */
  async fetchLiveIntelligence(): Promise<AggregatedIntelligence | null> {
    if (!this.config.enableLiveIntelligence) return null;

    try {
      const aggregator = getCopilotDataAggregator();
      const intel = await aggregator.aggregateAll();
      this.log('Live intelligence fetched');
      return intel;
    } catch (error) {
      this.log('Failed to fetch live intelligence:', error);
      return null;
    }
  }

  /**
   * Fetch intelligence for a specific module
   */
  async fetchModuleIntelligence(module: string): Promise<unknown> {
    if (!this.config.enableLiveIntelligence) return null;

    try {
      const aggregator = getCopilotDataAggregator();
      return await aggregator.fetchModuleIntelligence(module);
    } catch (error) {
      this.log('Failed to fetch module intelligence:', error);
      return null;
    }
  }

  /**
   * Describe the current view to the user
   */
  async describeActiveView(): Promise<ViewDescription | null> {
    if (!this.config.enableUIInterpretation) return null;

    try {
      const interpreter = getCopilotUIInterpreter();
      const description = await interpreter.describeActiveView();
      this.log('Active view described');
      return description;
    } catch (error) {
      this.log('Failed to describe active view:', error);
      return null;
    }
  }

  /**
   * Describe an entity
   */
  async describeEntity(entityId: string): Promise<string> {
    if (!this.config.enableUIInterpretation) {
      return 'Entity description is not available.';
    }

    try {
      const interpreter = getCopilotUIInterpreter();
      const description = await interpreter.describeEntity(entityId);
      return description.summary;
    } catch (error) {
      this.log('Failed to describe entity:', error);
      return 'I was unable to fetch information about this entity.';
    }
  }

  /**
   * Generate a high-level intelligence summary
   */
  async generateIntelligenceSummary(): Promise<string> {
    if (!this.config.enableUIInterpretation) {
      return 'Intelligence summary is not available.';
    }

    try {
      const interpreter = getCopilotUIInterpreter();
      return await interpreter.generateIntelligenceSummary();
    } catch (error) {
      this.log('Failed to generate intelligence summary:', error);
      return 'I was unable to generate an intelligence summary at this time.';
    }
  }

  /**
   * Describe what the Fusion Engine is detecting
   */
  async describeFusionEngineActivity(): Promise<string> {
    if (!this.config.enableUIInterpretation) {
      return 'Fusion Engine description is not available.';
    }

    try {
      const interpreter = getCopilotUIInterpreter();
      return await interpreter.describeFusionEngineActivity();
    } catch (error) {
      this.log('Failed to describe Fusion Engine activity:', error);
      return 'I was unable to fetch Fusion Engine data at this time.';
    }
  }

  /**
   * Get a graceful fallback response when data is unavailable
   */
  getUnavailableDataResponse(module: string): string {
    if (!this.config.enableUIInterpretation) {
      return 'Data is not available for this module.';
    }

    const interpreter = getCopilotUIInterpreter();
    return interpreter.getUnavailableDataResponse(module);
  }

  /**
   * Process a real-time awareness query (Phase 3 specific)
   * Handles queries like "What am I looking at?", "Explain this chart", etc.
   */
  async processRealTimeQuery(query: string): Promise<string> {
    if (!this.config.enableRealTimeAwareness) {
      return 'Real-time awareness is not enabled.';
    }

    const intent = recognizeIntent(query);
    this.log('Processing real-time query with intent:', intent.category);

    // Handle different real-time query types
    if (intent.category === 'ui_explanation' || intent.subIntent === 'explain_view') {
      const description = await this.describeActiveView();
      if (description) {
        return description.summary + ' ' + description.details.join(' ');
      }
      return this.getUnavailableDataResponse('unknown');
    }

    if (intent.category === 'intelligence_summary' || intent.subIntent === 'summarize') {
      return await this.generateIntelligenceSummary();
    }

    if (intent.category === 'fusion_engine' || intent.subIntent === 'fusion') {
      return await this.describeFusionEngineActivity();
    }

    if (intent.category === 'entity_query' && this.getCurrentState()?.selectedEntity) {
      const entity = this.getCurrentState()?.selectedEntity;
      if (entity) {
        return await this.describeEntity(entity.id);
      }
    }

    // Default to view description
    const description = await this.describeActiveView();
    if (description) {
      return description.summary;
    }

    return 'I\'m not sure what you\'re asking about. Could you be more specific?';
  }

  // ============================================================
  // Phase 4: Continuous Listening + Wake-Word Loop Engine
  // ============================================================

  /**
   * Initialize continuous listening mode
   * Called on Copilot load if hands-free mode is enabled
   */
  async initializeContinuousListening(): Promise<void> {
    if (!this.config.enableContinuousListening) {
      this.log('Continuous listening disabled in config');
      return;
    }

    const handsFreeModeManager = getHandsFreeModeManager();
    const continuousListeningController = getContinuousListeningController();

    // Configure the controller with orchestrator handler
    continuousListeningController.setOrchestratorHandler(async (text: string) => {
      await this.handleContinuousListeningInput(text);
    });

    // Auto-start if configured and user preference is enabled
    if (this.config.autoStartHandsFree && handsFreeModeManager.shouldAutoStartOnLoad()) {
      this.log('Auto-starting hands-free mode');
      await this.startContinuousListening();
    }

    this.log('Continuous listening initialized');
  }

  /**
   * Start continuous listening mode
   */
  async startContinuousListening(): Promise<void> {
    if (!this.config.enableContinuousListening) {
      this.log('Continuous listening disabled');
      return;
    }

    const handsFreeModeManager = getHandsFreeModeManager();
    const continuousListeningController = getContinuousListeningController();

    try {
      handsFreeModeManager.enable();
      await continuousListeningController.start();
      handsFreeModeManager.setActive(true);
      this.log('Continuous listening started');
    } catch (error) {
      this.log('Failed to start continuous listening:', error);
      handsFreeModeManager.disable();
      throw error;
    }
  }

  /**
   * Stop continuous listening mode
   */
  stopContinuousListening(): void {
    const handsFreeModeManager = getHandsFreeModeManager();
    const continuousListeningController = getContinuousListeningController();

    continuousListeningController.stop();
    handsFreeModeManager.setActive(false);
    handsFreeModeManager.disable();
    this.log('Continuous listening stopped');
  }

  /**
   * Toggle continuous listening mode
   */
  async toggleContinuousListening(): Promise<boolean> {
    const handsFreeModeManager = getHandsFreeModeManager();

    if (handsFreeModeManager.isEnabled()) {
      this.stopContinuousListening();
      return false;
    } else {
      await this.startContinuousListening();
      return true;
    }
  }

  /**
   * Check if continuous listening is active
   */
  isContinuousListeningActive(): boolean {
    const handsFreeModeManager = getHandsFreeModeManager();
    return handsFreeModeManager.isEnabled() && handsFreeModeManager.isActive();
  }

  /**
   * Get continuous listening state
   */
  getContinuousListeningState(): ContinuousListeningState {
    const continuousListeningController = getContinuousListeningController();
    return continuousListeningController.getState();
  }

  /**
   * Handle input from continuous listening
   */
  private async handleContinuousListeningInput(text: string): Promise<void> {
    this.log('Continuous listening input:', text);

    try {
      // Process the query through the standard pipeline
      const processedQuery = await this.processQuery(text);

      // Check if it's a real-time query (Phase 3)
      if (this.isRealTimeQuery(processedQuery.intent.category)) {
        const response = await this.processRealTimeQuery(text);
        const processedResponse = this.processResponse(response, processedQuery);
        await this.speakResponseText(processedResponse.finalResponse);
      } else {
        // Generate response based on intent
        const response = this.generateResponseForIntent(processedQuery);
        const processedResponse = this.processResponse(response, processedQuery);
        await this.speakResponseText(processedResponse.finalResponse);
      }

      // Update dialogue state
      this.updateDialogueState(text, processedQuery.intent.category);
    } catch (error) {
      this.log('Error handling continuous listening input:', error);
      await this.speakResponseText('I encountered an error processing your request. Please try again.');
    }
  }

  /**
   * Check if intent category is a real-time query
   */
  private isRealTimeQuery(category: string): boolean {
    const realTimeCategories = [
      'ui_explanation',
      'intelligence_summary',
      'alert_explanation',
      'fusion_engine',
      'entity_query',
    ];
    return realTimeCategories.includes(category);
  }

  /**
   * Generate response for a processed query
   */
  private generateResponseForIntent(query: ProcessedQuery): string {
    // If clarification needed, return the clarifying question
    if (query.needsClarification && query.clarifyingQuestion) {
      return query.clarifyingQuestion;
    }

    // Default response based on intent category
    const category = query.intent.category;
    
    switch (category) {
      case 'greeting':
        return 'Hello! How can I help you with GhostQuant today?';
      case 'help':
        return 'I can help you understand the GhostQuant platform. Ask me about any module, dashboard, or feature.';
      case 'unknown':
        return 'I\'m not sure what you\'re asking about. Could you be more specific?';
      default:
        return 'I understand you\'re asking about ' + category + '. Let me help you with that.';
    }
  }

  /**
   * Update configuration
   */
  configure(config: Partial<OrchestratorConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated', this.config);
  }

  /**
   * Reset orchestrator state
   */
  reset(): void {
    this.clearContext();
    this.currentPageContext = '';
    this.lastTone = undefined;

    if (this.config.enableInterruptibleTTS) {
      const ttsPipeline = getInterruptibleTTSPipeline();
      ttsPipeline.reset();
    }

    if (this.config.enableNaturalExpansion) {
      const expansionEngine = getNaturalExpansionEngine();
      expansionEngine.clearCache();
    }

    this.log('Orchestrator reset');
  }
}

// Singleton instance
let orchestrator: CopilotOrchestratorImpl | null = null;

/**
 * Get the CopilotOrchestrator singleton instance
 */
export function getCopilotOrchestrator(): CopilotOrchestratorImpl {
  if (!orchestrator) {
    orchestrator = new CopilotOrchestratorImpl();
  }
  return orchestrator;
}

/**
 * Create a new CopilotOrchestrator with custom config
 */
export function createCopilotOrchestrator(
  config?: Partial<OrchestratorConfig>
): CopilotOrchestratorImpl {
  return new CopilotOrchestratorImpl(config);
}

export default {
  getCopilotOrchestrator,
  createCopilotOrchestrator,
};
