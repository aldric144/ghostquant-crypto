/**
 * ConversationLoopController.ts - Continuous conversational loop
 * 
 * Creates a TRUE hands-free flow:
 * LISTEN -> INTENT -> THINK -> SPEAK -> LISTEN -> SPEAK -> ...
 * 
 * Requirements:
 * - No mic button required after initial permission grant
 * - Auto-detect when user begins talking
 * - Auto-stop TTS on interrupt
 * - Auto-resume listening after responses
 * - Maintain session context throughout
 */

import { getTurnTakingManager, TurnState } from './TurnTakingManager';
import { getStreamingSTTEngine } from './StreamingSTTEngine';
import { getConversationMemory } from './ConversationMemory';
import { getToneEnginePro } from './ToneEnginePro';

export type ConversationMode = 'inactive' | 'wake_word_listening' | 'active_conversation';

export interface ConversationLoopConfig {
  autoStartListening: boolean;
  wakeWordRequired: boolean;
  continuousMode: boolean;
  maxIdleTime: number; // ms before returning to wake-word mode
  responseDelay: number; // ms delay before responding
  enableInterrupts: boolean;
}

export interface ConversationLoopEvents {
  onModeChange?: (mode: ConversationMode) => void;
  onUserSpeechStart?: () => void;
  onUserSpeechEnd?: (transcript: string) => void;
  onIntentDetected?: (intent: string, confidence: number) => void;
  onResponseStart?: (response: string) => void;
  onResponseEnd?: () => void;
  onWakeWordDetected?: (phrase: string) => void;
  onError?: (error: Error) => void;
  onIdleTimeout?: () => void;
}

const DEFAULT_CONFIG: ConversationLoopConfig = {
  autoStartListening: true,
  wakeWordRequired: true,
  continuousMode: true,
  maxIdleTime: 30000, // 30 seconds
  responseDelay: 200, // 200ms
  enableInterrupts: true,
};

class ConversationLoopControllerImpl {
  private config: ConversationLoopConfig;
  private events: ConversationLoopEvents = {};
  private mode: ConversationMode = 'inactive';
  private isRunning: boolean = false;
  private idleTimer: NodeJS.Timeout | null = null;
  private currentTranscript: string = '';
  private processingIntent: boolean = false;

  // External handlers that can be set by the Copilot
  private intentHandler: ((text: string) => Promise<string>) | null = null;
  private ttsHandler: ((text: string) => Promise<void>) | null = null;
  private wakeWordHandler: ((text: string) => boolean) | null = null;

  constructor(config: Partial<ConversationLoopConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupEventListeners();
    console.log('[Conversation] ConversationLoopController initialized');
  }

  /**
   * Configure the conversation loop
   */
  configure(config: Partial<ConversationLoopConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[Conversation] Configuration updated:', this.config);
  }

  /**
   * Set event handlers
   */
  setEvents(events: ConversationLoopEvents): void {
    this.events = { ...this.events, ...events };
  }

  /**
   * Set the intent handler (processes user speech and returns response)
   */
  setIntentHandler(handler: (text: string) => Promise<string>): void {
    this.intentHandler = handler;
  }

  /**
   * Set the TTS handler (speaks the response)
   */
  setTTSHandler(handler: (text: string) => Promise<void>): void {
    this.ttsHandler = handler;
  }

  /**
   * Set the wake word handler (checks if text contains wake word)
   */
  setWakeWordHandler(handler: (text: string) => boolean): void {
    this.wakeWordHandler = handler;
  }

  /**
   * Setup internal event listeners
   */
  private setupEventListeners(): void {
    // Listen for TTS cancel events
    if (typeof window !== 'undefined') {
      window.addEventListener('ghostquant:tts:cancel', () => {
        console.log('[Conversation] TTS cancelled, resuming listening');
        this.resumeListening();
      });

      window.addEventListener('ghostquant:stt:resume', () => {
        console.log('[Conversation] STT resume requested');
        if (this.isRunning && this.mode === 'active_conversation') {
          this.startListening();
        }
      });
    }

    // Setup turn-taking events
    const turnManager = getTurnTakingManager();
    turnManager.setEvents({
      onStateChange: (state: TurnState) => {
        console.log(`[TurnTaking] State changed to: ${state}`);
      },
      onInterrupt: () => {
        console.log('[Conversation] Interrupt detected - stopping TTS');
        this.handleInterrupt();
      },
    });

    // Setup streaming STT events
    const sttEngine = getStreamingSTTEngine();
    sttEngine.setEvents({
      onPartialTranscript: (transcript) => {
        this.currentTranscript = transcript.text;
        
        // Check for wake word in partial transcript
        if (this.mode === 'wake_word_listening' && this.checkWakeWord(transcript.text)) {
          this.activateConversation(transcript.text);
        }
      },
      onFinalTranscript: (transcript) => {
        this.handleFinalTranscript(transcript.text);
      },
      onSpeechStart: () => {
        this.events.onUserSpeechStart?.();
        this.resetIdleTimer();
        
        // Interrupt TTS if user starts speaking
        const turnManager = getTurnTakingManager();
        if (turnManager.isSpeaking()) {
          turnManager.interruptTTS();
        }
      },
      onSpeechEnd: () => {
        this.events.onUserSpeechEnd?.(this.currentTranscript);
      },
      onError: (error) => {
        console.error('[Conversation] STT error:', error);
        this.events.onError?.(error);
      },
    });
  }

  /**
   * Check if text contains wake word
   */
  private checkWakeWord(text: string): boolean {
    if (this.wakeWordHandler) {
      return this.wakeWordHandler(text);
    }

    // Default wake word patterns
    const wakePatterns = [
      /hey\s+ghost\s*quant/i,
      /okay\s+ghost\s*quant/i,
      /ghost\s*quant/i,
      /hey\s+google/i, // Will be normalized to GhostQuant
    ];

    return wakePatterns.some(pattern => pattern.test(text));
  }

  /**
   * Activate conversation mode after wake word
   */
  private activateConversation(wakePhrase: string): void {
    console.log(`[WakeWord] Wake word detected: "${wakePhrase}"`);
    console.log('[Conversation] Continuous mode activated');
    
    this.setMode('active_conversation');
    this.events.onWakeWordDetected?.(wakePhrase);
    this.resetIdleTimer();
  }

  /**
   * Handle final transcript
   */
  private async handleFinalTranscript(text: string): Promise<void> {
    if (!text || text.trim().length === 0) return;
    if (this.processingIntent) return;

    console.log('[Conversation] Final transcript:', text);

    // In wake word mode, check for wake word
    if (this.mode === 'wake_word_listening') {
      if (this.checkWakeWord(text)) {
        this.activateConversation(text);
        // Extract query after wake word
        const query = this.extractQueryAfterWakeWord(text);
        if (query) {
          await this.processUserInput(query);
        }
      }
      return;
    }

    // In active conversation mode, process the input
    if (this.mode === 'active_conversation') {
      await this.processUserInput(text);
    }
  }

  /**
   * Extract query after wake word
   */
  private extractQueryAfterWakeWord(text: string): string {
    const wakePatterns = [
      /(?:hey|okay)\s+ghost\s*quant\s*/i,
      /ghost\s*quant\s*/i,
      /(?:hey|okay)\s+google\s*/i,
    ];

    let query = text;
    for (const pattern of wakePatterns) {
      query = query.replace(pattern, '').trim();
    }

    return query;
  }

  /**
   * Process user input through the conversation loop
   */
  private async processUserInput(text: string): Promise<void> {
    if (this.processingIntent) return;
    this.processingIntent = true;

    try {
      const turnManager = getTurnTakingManager();
      const memory = getConversationMemory();
      const toneEngine = getToneEnginePro();

      // Stop listening while processing
      turnManager.startProcessing();

      // Add to conversation memory
      memory.addUserMessage(text);

      // Select appropriate tone
      const toneResult = toneEngine.selectTone(text);

      // Get response from intent handler
      let response = "I'm here to help. What would you like to know?";
      
      if (this.intentHandler) {
        try {
          response = await this.intentHandler(text);
        } catch (error) {
          console.error('[Conversation] Intent handler error:', error);
          response = "I encountered an issue processing that. Could you try again?";
        }
      }

      // Fire intent detected event
      this.events.onIntentDetected?.('processed', 1.0);

      // Add response to memory
      memory.addAssistantMessage(response, toneResult.tone);

      // Speak the response
      await this.speakResponse(response);

    } catch (error) {
      console.error('[Conversation] Error processing input:', error);
      this.events.onError?.(error as Error);
    } finally {
      this.processingIntent = false;
      
      // Resume listening after response
      if (this.isRunning && this.mode === 'active_conversation') {
        this.resumeListening();
      }
    }
  }

  /**
   * Speak a response using TTS
   */
  private async speakResponse(text: string): Promise<void> {
    const turnManager = getTurnTakingManager();
    
    // Start speaking mode
    turnManager.startSpeaking();
    this.events.onResponseStart?.(text);

    console.log(`[TurnTaking] Switching to SPEAKING mode`);

    try {
      if (this.ttsHandler) {
        await this.ttsHandler(text);
      } else {
        // Fallback to browser TTS
        await this.browserTTS(text);
      }
    } catch (error) {
      console.error('[Conversation] TTS error:', error);
    } finally {
      turnManager.endSpeaking();
      this.events.onResponseEnd?.();
      console.log(`[TurnTaking] Switching to LISTENING mode`);
    }
  }

  /**
   * Fallback browser TTS
   */
  private browserTTS(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      
      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Handle interrupt from user
   */
  private handleInterrupt(): void {
    // Cancel any ongoing TTS
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Resume listening
    this.resumeListening();
  }

  /**
   * Start listening for user input
   */
  private async startListening(): Promise<void> {
    const sttEngine = getStreamingSTTEngine();
    const turnManager = getTurnTakingManager();

    turnManager.startListening();
    await sttEngine.start();
    
    console.log(`[TurnTaking] Switching to LISTENING mode`);
  }

  /**
   * Stop listening
   */
  private stopListening(): void {
    const sttEngine = getStreamingSTTEngine();
    const turnManager = getTurnTakingManager();

    sttEngine.stop();
    turnManager.endListening();
  }

  /**
   * Resume listening after TTS or interrupt
   */
  private resumeListening(): void {
    if (!this.isRunning) return;

    const turnManager = getTurnTakingManager();
    turnManager.resumeListening();

    // Restart STT
    const sttEngine = getStreamingSTTEngine();
    if (!sttEngine.isCurrentlyListening()) {
      sttEngine.start();
    }

    this.resetIdleTimer();
  }

  /**
   * Set conversation mode
   */
  private setMode(mode: ConversationMode): void {
    const previousMode = this.mode;
    this.mode = mode;
    
    if (previousMode !== mode) {
      console.log(`[Conversation] Mode changed: ${previousMode} -> ${mode}`);
      this.events.onModeChange?.(mode);
    }
  }

  /**
   * Reset idle timer
   */
  private resetIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }

    if (this.mode === 'active_conversation' && this.config.maxIdleTime > 0) {
      this.idleTimer = setTimeout(() => {
        console.log('[Conversation] Idle timeout - returning to wake word mode');
        this.setMode('wake_word_listening');
        this.events.onIdleTimeout?.();
      }, this.config.maxIdleTime);
    }
  }

  /**
   * Start the conversation loop
   */
  async start(): Promise<boolean> {
    if (this.isRunning) {
      console.log('[Conversation] Already running');
      return true;
    }

    console.log('[Conversation] Starting conversation loop');
    this.isRunning = true;

    // Set initial mode
    if (this.config.wakeWordRequired) {
      this.setMode('wake_word_listening');
    } else {
      this.setMode('active_conversation');
    }

    // Start listening
    if (this.config.autoStartListening) {
      await this.startListening();
    }

    return true;
  }

  /**
   * Stop the conversation loop
   */
  stop(): void {
    console.log('[Conversation] Stopping conversation loop');
    
    this.isRunning = false;
    this.stopListening();
    this.setMode('inactive');

    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }

    // Reset turn-taking manager
    const turnManager = getTurnTakingManager();
    turnManager.reset();
  }

  /**
   * Pause the conversation loop
   */
  pause(): void {
    console.log('[Conversation] Pausing conversation loop');
    this.stopListening();
  }

  /**
   * Resume the conversation loop
   */
  resume(): void {
    console.log('[Conversation] Resuming conversation loop');
    if (this.isRunning) {
      this.startListening();
    }
  }

  /**
   * Get current mode
   */
  getMode(): ConversationMode {
    return this.mode;
  }

  /**
   * Check if running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Force activate conversation mode (skip wake word)
   */
  forceActivate(): void {
    console.log('[Conversation] Force activating conversation mode');
    this.setMode('active_conversation');
    this.resetIdleTimer();
  }

  /**
   * Manually trigger a response
   */
  async triggerResponse(text: string): Promise<void> {
    await this.processUserInput(text);
  }
}

// Singleton instance
let conversationLoopController: ConversationLoopControllerImpl | null = null;

/**
 * Get the ConversationLoopController singleton instance
 */
export function getConversationLoopController(): ConversationLoopControllerImpl {
  if (!conversationLoopController) {
    conversationLoopController = new ConversationLoopControllerImpl();
  }
  return conversationLoopController;
}

/**
 * Create a new ConversationLoopController with custom config
 */
export function createConversationLoopController(
  config?: Partial<ConversationLoopConfig>
): ConversationLoopControllerImpl {
  return new ConversationLoopControllerImpl(config);
}

export default {
  getConversationLoopController,
  createConversationLoopController,
};
