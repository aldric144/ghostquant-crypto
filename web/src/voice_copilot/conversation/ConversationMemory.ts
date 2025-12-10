/**
 * ConversationMemory.ts - Short-term conversational memory
 * 
 * Stores conversation history for context-aware responses:
 * - Store last 5-10 user messages
 * - Store last 5-10 GhostQuant responses
 * - Provide context to IntentModel for references like:
 *   "As I mentioned earlier..."
 *   "We were just discussing..."
 *   "Following up on your last question..."
 * 
 * Memory resets on page refresh unless extended later.
 */

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  intent?: string;
  pageContext?: string;
  tone?: string;
}

export interface ConversationContext {
  recentMessages: ConversationMessage[];
  currentTopic?: string;
  mentionedEntities: string[];
  lastUserIntent?: string;
  sessionStartTime: number;
}

export interface ConversationMemoryConfig {
  maxUserMessages: number;
  maxAssistantMessages: number;
  maxTotalMessages: number;
  contextWindowSize: number;
  persistToStorage: boolean;
  storageKey: string;
}

const DEFAULT_CONFIG: ConversationMemoryConfig = {
  maxUserMessages: 10,
  maxAssistantMessages: 10,
  maxTotalMessages: 20,
  contextWindowSize: 5,
  persistToStorage: false, // Memory resets on page refresh by default
  storageKey: 'ghostquant_conversation_memory',
};

class ConversationMemoryImpl {
  private config: ConversationMemoryConfig;
  private messages: ConversationMessage[] = [];
  private mentionedEntities: Set<string> = new Set();
  private currentTopic: string | undefined;
  private sessionStartTime: number;

  constructor(config: Partial<ConversationMemoryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionStartTime = Date.now();
    
    // Load from storage if persistence is enabled
    if (this.config.persistToStorage) {
      this.loadFromStorage();
    }
    
    console.log('[Memory] ConversationMemory initialized');
  }

  /**
   * Configure the conversation memory
   */
  configure(config: Partial<ConversationMemoryConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[Memory] Configuration updated:', this.config);
  }

  /**
   * Generate a unique message ID
   */
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add a user message to memory
   */
  addUserMessage(content: string, intent?: string, pageContext?: string): ConversationMessage {
    const message: ConversationMessage = {
      id: this.generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
      intent,
      pageContext,
    };

    this.messages.push(message);
    this.extractEntities(content);
    this.updateTopic(content, intent);
    this.pruneMessages();
    this.saveToStorage();

    console.log('[Memory] Added user message:', content.substring(0, 50) + '...');
    return message;
  }

  /**
   * Add an assistant (GhostQuant) message to memory
   */
  addAssistantMessage(content: string, tone?: string): ConversationMessage {
    const message: ConversationMessage = {
      id: this.generateId(),
      role: 'assistant',
      content,
      timestamp: Date.now(),
      tone,
    };

    this.messages.push(message);
    this.pruneMessages();
    this.saveToStorage();

    console.log('[Memory] Added assistant message:', content.substring(0, 50) + '...');
    return message;
  }

  /**
   * Extract entities from text for context tracking
   */
  private extractEntities(text: string): void {
    // Extract cryptocurrency mentions
    const cryptoPatterns = [
      /\b(bitcoin|btc)\b/gi,
      /\b(ethereum|eth)\b/gi,
      /\b(solana|sol)\b/gi,
      /\b(cardano|ada)\b/gi,
      /\b(polygon|matic)\b/gi,
      /\b(avalanche|avax)\b/gi,
    ];

    // Extract whale/entity mentions
    const entityPatterns = [
      /\bwhale\s*\d*\b/gi,
      /\b0x[a-fA-F0-9]{6,}\b/g, // Ethereum addresses
      /\bentity\s*\d*\b/gi,
    ];

    // Extract feature mentions
    const featurePatterns = [
      /\b(hydra|constellation|ultrafusion|sentinel|radar)\b/gi,
    ];

    const allPatterns = [...cryptoPatterns, ...entityPatterns, ...featurePatterns];

    for (const pattern of allPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => this.mentionedEntities.add(match.toLowerCase()));
      }
    }
  }

  /**
   * Update current topic based on message content
   */
  private updateTopic(content: string, intent?: string): void {
    // Topic detection patterns
    const topicPatterns: Array<{ pattern: RegExp; topic: string }> = [
      { pattern: /whale|large\s+holder/i, topic: 'whale_tracking' },
      { pattern: /price|market|trading/i, topic: 'market_analysis' },
      { pattern: /threat|risk|alert/i, topic: 'threat_detection' },
      { pattern: /hydra|coordinated/i, topic: 'hydra_analysis' },
      { pattern: /constellation|network/i, topic: 'network_visualization' },
      { pattern: /predict|forecast/i, topic: 'prediction' },
      { pattern: /help|how\s+to/i, topic: 'help' },
    ];

    for (const { pattern, topic } of topicPatterns) {
      if (pattern.test(content)) {
        this.currentTopic = topic;
        break;
      }
    }

    // Use intent as topic if available
    if (intent && !this.currentTopic) {
      this.currentTopic = intent;
    }
  }

  /**
   * Prune messages to stay within limits
   */
  private pruneMessages(): void {
    // Remove oldest messages if exceeding total limit
    while (this.messages.length > this.config.maxTotalMessages) {
      this.messages.shift();
    }

    // Ensure we don't exceed per-role limits
    const userMessages = this.messages.filter(m => m.role === 'user');
    const assistantMessages = this.messages.filter(m => m.role === 'assistant');

    if (userMessages.length > this.config.maxUserMessages) {
      const toRemove = userMessages.length - this.config.maxUserMessages;
      let removed = 0;
      this.messages = this.messages.filter(m => {
        if (m.role === 'user' && removed < toRemove) {
          removed++;
          return false;
        }
        return true;
      });
    }

    if (assistantMessages.length > this.config.maxAssistantMessages) {
      const toRemove = assistantMessages.length - this.config.maxAssistantMessages;
      let removed = 0;
      this.messages = this.messages.filter(m => {
        if (m.role === 'assistant' && removed < toRemove) {
          removed++;
          return false;
        }
        return true;
      });
    }
  }

  /**
   * Get recent messages for context
   */
  getRecentMessages(count?: number): ConversationMessage[] {
    const limit = count || this.config.contextWindowSize;
    return this.messages.slice(-limit);
  }

  /**
   * Get all messages
   */
  getAllMessages(): ConversationMessage[] {
    return [...this.messages];
  }

  /**
   * Get the last user message
   */
  getLastUserMessage(): ConversationMessage | undefined {
    return [...this.messages].reverse().find(m => m.role === 'user');
  }

  /**
   * Get the last assistant message
   */
  getLastAssistantMessage(): ConversationMessage | undefined {
    return [...this.messages].reverse().find(m => m.role === 'assistant');
  }

  /**
   * Get conversation context for intent model
   */
  getContext(): ConversationContext {
    const lastUserMessage = this.getLastUserMessage();
    
    return {
      recentMessages: this.getRecentMessages(),
      currentTopic: this.currentTopic,
      mentionedEntities: Array.from(this.mentionedEntities),
      lastUserIntent: lastUserMessage?.intent,
      sessionStartTime: this.sessionStartTime,
    };
  }

  /**
   * Generate context string for intent model injection
   */
  getContextString(): string {
    const context = this.getContext();
    const parts: string[] = [];

    if (context.currentTopic) {
      parts.push(`Current topic: ${context.currentTopic}`);
    }

    if (context.mentionedEntities.length > 0) {
      parts.push(`Mentioned entities: ${context.mentionedEntities.join(', ')}`);
    }

    if (context.recentMessages.length > 0) {
      const recentSummary = context.recentMessages
        .slice(-3)
        .map(m => `${m.role}: ${m.content.substring(0, 50)}...`)
        .join('\n');
      parts.push(`Recent conversation:\n${recentSummary}`);
    }

    const contextString = parts.join('\n');
    
    if (contextString) {
      console.log('[Memory] Injected context into intent model');
    }
    
    return contextString;
  }

  /**
   * Check if a topic was recently discussed
   */
  wasRecentlyDiscussed(topic: string): boolean {
    const recentMessages = this.getRecentMessages();
    const pattern = new RegExp(topic, 'i');
    return recentMessages.some(m => pattern.test(m.content));
  }

  /**
   * Get contextual response prefix based on conversation history
   */
  getContextualPrefix(): string | null {
    const messageCount = this.messages.length;
    
    if (messageCount === 0) return null;
    
    if (messageCount > 5 && this.currentTopic) {
      return "Following up on our discussion about " + this.currentTopic + ", ";
    }
    
    if (messageCount > 2) {
      const lastUserMessage = this.getLastUserMessage();
      if (lastUserMessage?.intent === this.getLastUserMessage()?.intent) {
        return "As I mentioned earlier, ";
      }
    }
    
    return null;
  }

  /**
   * Clear all memory
   */
  clear(): void {
    this.messages = [];
    this.mentionedEntities.clear();
    this.currentTopic = undefined;
    this.sessionStartTime = Date.now();
    this.clearStorage();
    console.log('[Memory] Conversation memory cleared');
  }

  /**
   * Save to local storage
   */
  private saveToStorage(): void {
    if (!this.config.persistToStorage) return;
    if (typeof window === 'undefined') return;

    try {
      const data = {
        messages: this.messages,
        mentionedEntities: Array.from(this.mentionedEntities),
        currentTopic: this.currentTopic,
        sessionStartTime: this.sessionStartTime,
      };
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('[Memory] Error saving to storage:', error);
    }
  }

  /**
   * Load from local storage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.messages = data.messages || [];
        this.mentionedEntities = new Set(data.mentionedEntities || []);
        this.currentTopic = data.currentTopic;
        this.sessionStartTime = data.sessionStartTime || Date.now();
        console.log('[Memory] Loaded conversation from storage');
      }
    } catch (error) {
      console.error('[Memory] Error loading from storage:', error);
    }
  }

  /**
   * Clear local storage
   */
  private clearStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.config.storageKey);
    } catch (error) {
      console.error('[Memory] Error clearing storage:', error);
    }
  }

  /**
   * Get message count
   */
  getMessageCount(): number {
    return this.messages.length;
  }

  /**
   * Get session duration in milliseconds
   */
  getSessionDuration(): number {
    return Date.now() - this.sessionStartTime;
  }
}

// Singleton instance
let conversationMemory: ConversationMemoryImpl | null = null;

/**
 * Get the ConversationMemory singleton instance
 */
export function getConversationMemory(): ConversationMemoryImpl {
  if (!conversationMemory) {
    conversationMemory = new ConversationMemoryImpl();
  }
  return conversationMemory;
}

/**
 * Create a new ConversationMemory with custom config
 */
export function createConversationMemory(config?: Partial<ConversationMemoryConfig>): ConversationMemoryImpl {
  return new ConversationMemoryImpl(config);
}

export default {
  getConversationMemory,
  createConversationMemory,
};
