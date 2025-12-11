/**
 * CopilotDialogueManager - Conversation State Management
 * 
 * Phase 2 Conversational Engine
 * 
 * Responsibilities:
 * - Track conversation state across turns
 * - Provide short-term memory (3-5 turns)
 * - Handle follow-up questions
 * - Detect references like "this," "here," "that chart"
 * - Maintain topic continuity
 * - Provide natural transitions ("Building on that...")
 * - Ask clarifying questions when user intent is unclear
 * - Summarize context when needed
 * 
 * This is an ADDITIVE module - does NOT modify existing Copilot logic.
 */

export interface DialogueTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  intent?: string;
  pageContext?: string;
  entities?: string[];
  tone?: string;
}

export interface DialogueState {
  turns: DialogueTurn[];
  currentTopic: string | null;
  lastModuleMentioned: string | null;
  mentionedEntities: Set<string>;
  followUpContext: FollowUpContext | null;
  sessionStartTime: number;
  turnCount: number;
}

export interface FollowUpContext {
  previousIntent: string;
  previousResponse: string;
  referencedEntities: string[];
  pageAtTime: string;
}

export interface DialogueManagerConfig {
  maxTurns: number;
  contextWindowSize: number;
  enableFollowUpDetection: boolean;
  enableReferenceResolution: boolean;
}

const DEFAULT_CONFIG: DialogueManagerConfig = {
  maxTurns: 5,
  contextWindowSize: 3,
  enableFollowUpDetection: true,
  enableReferenceResolution: true,
};

// Reference patterns for detecting contextual references
const REFERENCE_PATTERNS = {
  this: /\b(this|these)\b/i,
  that: /\b(that|those)\b/i,
  here: /\b(here|on this page|on this screen)\b/i,
  it: /\b(it|its)\b/i,
  chart: /\b(the chart|this chart|that chart|the graph|this graph)\b/i,
  number: /\b(the number|this number|that number|the score|this score)\b/i,
  entity: /\b(the entity|this entity|that entity|the wallet|this wallet)\b/i,
  previous: /\b(earlier|before|previously|last time|you said|you mentioned)\b/i,
};

// Follow-up question patterns
const FOLLOW_UP_PATTERNS = [
  /^(and|but|also|what about|how about|tell me more|more about|explain|why|how)\b/i,
  /^(can you|could you|would you)\s+(explain|tell|show|elaborate)/i,
  /\b(more detail|go deeper|expand on|elaborate)\b/i,
  /^(so|okay|alright|got it|i see)\s*[,.]?\s*(but|and|what|how|why)/i,
  /\b(follow.?up|related|similar|same)\b/i,
];

// Clarification needed patterns
const UNCLEAR_PATTERNS = [
  /^(um|uh|hmm|well)\s*[,.]?\s*$/i,
  /^(i|we)\s*(want|need|would like)\s*$/i,
  /^(show|tell|explain)\s*$/i,
  /^\?\s*$/,
  /^(what|how|why|where|when)\s*$/i,
];

class CopilotDialogueManagerImpl {
  private config: DialogueManagerConfig;
  private state: DialogueState;

  constructor(config: Partial<DialogueManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = this.createInitialState();
    console.log('[CopilotPhase2] DialogueManager initialized');
  }

  /**
   * Create initial dialogue state
   */
  private createInitialState(): DialogueState {
    return {
      turns: [],
      currentTopic: null,
      lastModuleMentioned: null,
      mentionedEntities: new Set(),
      followUpContext: null,
      sessionStartTime: Date.now(),
      turnCount: 0,
    };
  }

  /**
   * Generate unique turn ID
   */
  private generateTurnId(): string {
    return `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update dialogue state with new user message and copilot response
   */
  updateState(
    userMessage: string,
    copilotResponse: string,
    intent?: string,
    pageContext?: string
  ): void {
    const userTurn: DialogueTurn = {
      id: this.generateTurnId(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
      intent,
      pageContext,
      entities: this.extractEntitiesFromText(userMessage),
    };

    const assistantTurn: DialogueTurn = {
      id: this.generateTurnId(),
      role: 'assistant',
      content: copilotResponse,
      timestamp: Date.now(),
    };

    this.state.turns.push(userTurn, assistantTurn);
    this.state.turnCount += 2;

    // Update topic tracking
    if (intent) {
      this.state.currentTopic = intent;
    }

    // Update mentioned entities
    userTurn.entities?.forEach(entity => this.state.mentionedEntities.add(entity));

    // Update follow-up context
    this.state.followUpContext = {
      previousIntent: intent || 'unknown',
      previousResponse: copilotResponse,
      referencedEntities: userTurn.entities || [],
      pageAtTime: pageContext || '',
    };

    // Update last module mentioned
    const moduleMention = this.detectModuleMention(userMessage);
    if (moduleMention) {
      this.state.lastModuleMentioned = moduleMention;
    }

    // Prune old turns
    this.pruneTurns();

    console.log('[CopilotPhase2] DialogueManager state updated:', {
      turnCount: this.state.turnCount,
      currentTopic: this.state.currentTopic,
      lastModule: this.state.lastModuleMentioned,
    });
  }

  /**
   * Get current dialogue context
   */
  getContext(): {
    recentTurns: DialogueTurn[];
    currentTopic: string | null;
    lastModuleMentioned: string | null;
    mentionedEntities: string[];
    followUpContext: FollowUpContext | null;
  } {
    return {
      recentTurns: this.state.turns.slice(-this.config.contextWindowSize * 2),
      currentTopic: this.state.currentTopic,
      lastModuleMentioned: this.state.lastModuleMentioned,
      mentionedEntities: Array.from(this.state.mentionedEntities),
      followUpContext: this.state.followUpContext,
    };
  }

  /**
   * Clear dialogue context
   */
  clearContext(): void {
    this.state = this.createInitialState();
    console.log('[CopilotPhase2] DialogueManager context cleared');
  }

  /**
   * Detect if user message is a follow-up question
   */
  detectFollowUp(userMessage: string): {
    isFollowUp: boolean;
    followUpType: 'continuation' | 'elaboration' | 'clarification' | 'new_topic' | null;
    confidence: number;
  } {
    if (!this.config.enableFollowUpDetection || this.state.turns.length === 0) {
      return { isFollowUp: false, followUpType: null, confidence: 0 };
    }

    const lowerMessage = userMessage.toLowerCase().trim();

    // Check for explicit follow-up patterns
    for (const pattern of FOLLOW_UP_PATTERNS) {
      if (pattern.test(lowerMessage)) {
        return {
          isFollowUp: true,
          followUpType: 'continuation',
          confidence: 0.85,
        };
      }
    }

    // Check for reference patterns (this, that, it, etc.)
    const hasReference = Object.values(REFERENCE_PATTERNS).some(pattern => 
      pattern.test(lowerMessage)
    );

    if (hasReference) {
      return {
        isFollowUp: true,
        followUpType: 'elaboration',
        confidence: 0.8,
      };
    }

    // Check if message is very short (likely a follow-up)
    if (lowerMessage.split(/\s+/).length <= 3 && this.state.turns.length > 0) {
      return {
        isFollowUp: true,
        followUpType: 'clarification',
        confidence: 0.6,
      };
    }

    return { isFollowUp: false, followUpType: null, confidence: 0 };
  }

  /**
   * Resolve contextual references in user message
   */
  resolveReference(
    userMessage: string,
    currentPage: string,
    lastModuleMentioned?: string
  ): {
    resolvedMessage: string;
    resolvedReferences: Array<{ original: string; resolved: string }>;
    needsClarification: boolean;
  } {
    if (!this.config.enableReferenceResolution) {
      return {
        resolvedMessage: userMessage,
        resolvedReferences: [],
        needsClarification: false,
      };
    }

    let resolvedMessage = userMessage;
    const resolvedReferences: Array<{ original: string; resolved: string }> = [];
    let needsClarification = false;

    // Resolve "this page" / "here" references
    if (REFERENCE_PATTERNS.here.test(userMessage)) {
      const pageRef = this.getPageDescription(currentPage);
      if (pageRef) {
        resolvedReferences.push({ original: 'here/this page', resolved: pageRef });
      }
    }

    // Resolve "this" / "that" references to last mentioned module
    if (REFERENCE_PATTERNS.this.test(userMessage) || REFERENCE_PATTERNS.that.test(userMessage)) {
      const moduleRef = lastModuleMentioned || this.state.lastModuleMentioned;
      if (moduleRef) {
        resolvedReferences.push({ original: 'this/that', resolved: moduleRef });
      } else {
        needsClarification = true;
      }
    }

    // Resolve entity references
    if (REFERENCE_PATTERNS.entity.test(userMessage)) {
      const lastEntity = Array.from(this.state.mentionedEntities).pop();
      if (lastEntity) {
        resolvedReferences.push({ original: 'the entity', resolved: lastEntity });
      } else {
        needsClarification = true;
      }
    }

    // Check for unclear messages that need clarification
    if (UNCLEAR_PATTERNS.some(pattern => pattern.test(userMessage.trim()))) {
      needsClarification = true;
    }

    console.log('[CopilotPhase2] Reference resolution:', {
      original: userMessage,
      resolved: resolvedReferences,
      needsClarification,
    });

    return {
      resolvedMessage,
      resolvedReferences,
      needsClarification,
    };
  }

  /**
   * Get natural transition phrase based on conversation context
   */
  getTransitionPhrase(): string | null {
    if (this.state.turns.length === 0) {
      return null;
    }

    const transitions = [
      'Building on that,',
      'To add to what I mentioned,',
      'Following up on that,',
      'Continuing from there,',
      'Related to that,',
      'On a similar note,',
    ];

    // Only use transition if this is a follow-up
    if (this.state.turns.length >= 2) {
      return transitions[Math.floor(Math.random() * transitions.length)];
    }

    return null;
  }

  /**
   * Get clarifying question when intent is unclear
   */
  getClarifyingQuestion(userMessage: string): string | null {
    const lowerMessage = userMessage.toLowerCase().trim();

    // Check for vague "this" without context
    if (/^(what('s| is)? this|explain this|tell me about this)\??$/i.test(lowerMessage)) {
      if (this.state.lastModuleMentioned) {
        return `Are you asking about ${this.state.lastModuleMentioned}?`;
      }
      return 'Could you be more specific about what you\'d like to know?';
    }

    // Check for incomplete questions
    if (/^(show|tell|explain|what|how|why)\s*$/i.test(lowerMessage)) {
      return 'What would you like me to help you with?';
    }

    // Check for ambiguous references
    if (/\b(it|that|this)\b/i.test(lowerMessage) && this.state.mentionedEntities.size === 0) {
      return 'I\'m not sure what you\'re referring to. Could you clarify?';
    }

    return null;
  }

  /**
   * Get context summary for long conversations
   */
  getContextSummary(): string | null {
    if (this.state.turns.length < 4) {
      return null;
    }

    const topics = new Set<string>();
    const entities = Array.from(this.state.mentionedEntities).slice(0, 3);

    this.state.turns.forEach(turn => {
      if (turn.intent) {
        topics.add(turn.intent);
      }
    });

    const topicList = Array.from(topics).slice(0, 3);

    if (topicList.length === 0 && entities.length === 0) {
      return null;
    }

    let summary = 'So far we\'ve discussed';
    if (topicList.length > 0) {
      summary += ` ${topicList.join(', ')}`;
    }
    if (entities.length > 0) {
      summary += ` involving ${entities.join(', ')}`;
    }
    summary += '.';

    return summary;
  }

  /**
   * Extract entities from text
   */
  private extractEntitiesFromText(text: string): string[] {
    const entities: string[] = [];

    // Extract crypto mentions
    const cryptoPatterns = [
      /\b(bitcoin|btc)\b/gi,
      /\b(ethereum|eth)\b/gi,
      /\b(solana|sol)\b/gi,
    ];

    // Extract wallet addresses
    const addressPattern = /\b0x[a-fA-F0-9]{6,}\b/g;

    // Extract module mentions
    const modulePatterns = [
      /\b(hydra|constellation|ecoscan|sentinel|radar|ultrafusion)\b/gi,
    ];

    for (const pattern of [...cryptoPatterns, ...modulePatterns]) {
      const matches = text.match(pattern);
      if (matches) {
        entities.push(...matches.map(m => m.toLowerCase()));
      }
    }

    const addressMatches = text.match(addressPattern);
    if (addressMatches) {
      entities.push(...addressMatches);
    }

    return Array.from(new Set(entities));
  }

  /**
   * Detect module mention in text
   */
  private detectModuleMention(text: string): string | null {
    const modules = [
      'hydra', 'constellation', 'ecoscan', 'sentinel', 'radar',
      'ultrafusion', 'valkyrie', 'phantom', 'predict', 'rings',
      'whale', 'dashboard', 'analytics',
    ];

    const lowerText = text.toLowerCase();
    for (const module of modules) {
      if (lowerText.includes(module)) {
        return module;
      }
    }

    return null;
  }

  /**
   * Get page description for reference resolution
   */
  private getPageDescription(pagePath: string): string | null {
    const pageDescriptions: Record<string, string> = {
      '/terminal/hydra': 'Hydra threat detection console',
      '/terminal/constellation': 'Constellation entity map',
      '/terminal/ecoscan': 'EcoScan wallet scanner',
      '/terminal/sentinel': 'Sentinel monitoring dashboard',
      '/terminal/radar': 'Radar market scanner',
      '/terminal/ultrafusion': 'UltraFusion analytics',
      '/terminal/analytics': 'Analytics dashboard',
      '/terminal/whales': 'Whale Intelligence database',
    };

    return pageDescriptions[pagePath] || null;
  }

  /**
   * Prune old turns to stay within limit
   */
  private pruneTurns(): void {
    const maxTurns = this.config.maxTurns * 2; // User + assistant pairs
    while (this.state.turns.length > maxTurns) {
      this.state.turns.shift();
    }
  }

  /**
   * Get turn count
   */
  getTurnCount(): number {
    return this.state.turnCount;
  }

  /**
   * Check if conversation has context
   */
  hasContext(): boolean {
    return this.state.turns.length > 0;
  }
}

// Singleton instance
let dialogueManager: CopilotDialogueManagerImpl | null = null;

/**
 * Get the DialogueManager singleton instance
 */
export function getDialogueManager(): CopilotDialogueManagerImpl {
  if (!dialogueManager) {
    dialogueManager = new CopilotDialogueManagerImpl();
  }
  return dialogueManager;
}

/**
 * Create a new DialogueManager with custom config
 */
export function createDialogueManager(
  config?: Partial<DialogueManagerConfig>
): CopilotDialogueManagerImpl {
  return new CopilotDialogueManagerImpl(config);
}

export default {
  getDialogueManager,
  createDialogueManager,
};
