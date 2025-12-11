/**
 * NaturalExpansionEngine - Conversational Variation Generator
 * 
 * Phase 2 Conversational Engine
 * 
 * Responsibilities:
 * - Provide conversational variation so Copilot does NOT repeat itself
 * - Generate different phrasings dynamically
 * - Provide intros, transitions, conversational cues
 * 
 * Features:
 * - Synonym sets for technical phrases
 * - Sentence templates
 * - Human-like elaboration modes
 * - Short mode vs. detailed mode
 * - Context-aware openings ("Great question. Here's what you're looking at...")
 * 
 * Called from: CopilotResponseBuilder BEFORE TTS.
 * 
 * This is an ADDITIVE module - does NOT modify existing Copilot logic.
 */

export type ExpansionMode = 'short' | 'standard' | 'detailed';
export type OpeningStyle = 'direct' | 'acknowledging' | 'transitional' | 'contextual';

export interface ExpansionConfig {
  mode: ExpansionMode;
  enableSynonyms: boolean;
  enableVariation: boolean;
  enableOpenings: boolean;
  variationSeed?: number;
}

const DEFAULT_CONFIG: ExpansionConfig = {
  mode: 'standard',
  enableSynonyms: true,
  enableVariation: true,
  enableOpenings: true,
};

// Synonym sets for technical phrases
const SYNONYM_SETS: Record<string, string[]> = {
  'shows': ['displays', 'indicates', 'reveals', 'presents'],
  'detects': ['identifies', 'spots', 'finds', 'recognizes'],
  'analyzes': ['examines', 'evaluates', 'assesses', 'reviews'],
  'monitors': ['tracks', 'watches', 'observes', 'keeps an eye on'],
  'high': ['elevated', 'increased', 'significant', 'notable'],
  'low': ['reduced', 'minimal', 'limited', 'decreased'],
  'risk': ['threat', 'danger', 'concern', 'exposure'],
  'activity': ['movement', 'action', 'behavior', 'transactions'],
  'wallet': ['address', 'account', 'entity'],
  'suspicious': ['concerning', 'unusual', 'questionable', 'anomalous'],
  'manipulation': ['market abuse', 'fraudulent activity', 'deceptive behavior'],
  'currently': ['right now', 'at the moment', 'presently'],
  'significant': ['notable', 'substantial', 'considerable', 'important'],
};

// Context-aware opening phrases
const OPENING_PHRASES: Record<OpeningStyle, string[]> = {
  direct: [
    '',
    'Here\'s what I found:',
    'Let me explain:',
  ],
  acknowledging: [
    'Great question.',
    'Good thinking.',
    'That\'s an important question.',
    'I understand what you\'re asking.',
    'Excellent question.',
  ],
  transitional: [
    'Building on that,',
    'To add to what I mentioned,',
    'Following up on that,',
    'Related to that,',
    'On a similar note,',
  ],
  contextual: [
    'Based on what you\'re looking at,',
    'Given the current data,',
    'Looking at this page,',
    'From what I can see here,',
  ],
};

// Sentence templates for common responses
const RESPONSE_TEMPLATES: Record<string, string[]> = {
  explanation: [
    '{subject} {verb} {object}.',
    'What you\'re seeing is {subject} {verb} {object}.',
    'This {verb} {object} through {subject}.',
  ],
  status: [
    '{subject} is currently {status}.',
    'Right now, {subject} shows {status}.',
    'The {subject} indicates {status}.',
  ],
  comparison: [
    '{subject} is {comparison} compared to {baseline}.',
    'Compared to {baseline}, {subject} is {comparison}.',
    'Looking at {baseline}, {subject} appears {comparison}.',
  ],
  recommendation: [
    'I\'d recommend {action}.',
    'You might want to {action}.',
    'Consider {action}.',
    'It would be helpful to {action}.',
  ],
};

// Elaboration phrases for detailed mode
const ELABORATION_PHRASES = [
  'To give you more context,',
  'In more detail,',
  'Breaking this down further,',
  'Let me elaborate:',
  'Here\'s the deeper picture:',
  'To expand on that,',
];

// Closing phrases for natural endings
const CLOSING_PHRASES = [
  'Let me know if you\'d like more details.',
  'Feel free to ask if anything\'s unclear.',
  'Want me to dive deeper into any of this?',
  'I can explain more if needed.',
  '',
];

// Phrases to avoid repetition
const USED_PHRASES_CACHE: Set<string> = new Set();
const MAX_CACHE_SIZE = 50;

class NaturalExpansionEngineImpl {
  private config: ExpansionConfig;
  private lastUsedOpening: string = '';
  private lastUsedClosing: string = '';
  private variationCounter: number = 0;

  constructor(config: Partial<ExpansionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('[CopilotPhase2] NaturalExpansionEngine initialized');
  }

  /**
   * Apply natural expansion to a response
   */
  expand(
    response: string,
    context?: {
      isFollowUp?: boolean;
      previousResponse?: string;
      questionType?: string;
    }
  ): string {
    let expanded = response;

    // Apply synonym variation
    if (this.config.enableSynonyms) {
      expanded = this.applySynonyms(expanded);
    }

    // Add opening phrase
    if (this.config.enableOpenings) {
      const openingStyle = this.determineOpeningStyle(context);
      const opening = this.getOpening(openingStyle, context?.isFollowUp);
      if (opening) {
        expanded = `${opening} ${expanded}`;
      }
    }

    // Add closing phrase for detailed mode
    if (this.config.mode === 'detailed') {
      const closing = this.getClosing();
      if (closing) {
        expanded = `${expanded} ${closing}`;
      }
    }

    // Apply variation to avoid repetition
    if (this.config.enableVariation && context?.previousResponse) {
      expanded = this.ensureVariation(expanded, context.previousResponse);
    }

    console.log('[CopilotPhase2] NaturalExpansionEngine expanded response');
    return expanded;
  }

  /**
   * Apply synonym substitution
   */
  private applySynonyms(text: string): string {
    let result = text;

    for (const [word, synonyms] of Object.entries(SYNONYM_SETS)) {
      const pattern = new RegExp(`\\b${word}\\b`, 'gi');
      if (pattern.test(result)) {
        // Only replace sometimes to maintain natural variation
        if (Math.random() > 0.5) {
          const synonym = this.selectVariation(synonyms);
          result = result.replace(pattern, synonym);
        }
      }
    }

    return result;
  }

  /**
   * Determine appropriate opening style based on context
   */
  private determineOpeningStyle(context?: {
    isFollowUp?: boolean;
    questionType?: string;
  }): OpeningStyle {
    if (context?.isFollowUp) {
      return 'transitional';
    }

    if (context?.questionType === 'vague_recovery') {
      return 'contextual';
    }

    // Vary between acknowledging and direct
    return Math.random() > 0.6 ? 'acknowledging' : 'direct';
  }

  /**
   * Get an opening phrase that hasn't been used recently
   */
  private getOpening(style: OpeningStyle, isFollowUp?: boolean): string {
    const phrases = OPENING_PHRASES[style];
    let opening = this.selectVariation(phrases, this.lastUsedOpening);

    // Don't use opening for follow-ups if it's empty or direct
    if (isFollowUp && style === 'direct') {
      opening = this.selectVariation(OPENING_PHRASES.transitional, this.lastUsedOpening);
    }

    this.lastUsedOpening = opening;
    return opening;
  }

  /**
   * Get a closing phrase that hasn't been used recently
   */
  private getClosing(): string {
    const closing = this.selectVariation(CLOSING_PHRASES, this.lastUsedClosing);
    this.lastUsedClosing = closing;
    return closing;
  }

  /**
   * Select a variation that hasn't been used recently
   */
  private selectVariation(options: string[], lastUsed?: string): string {
    // Filter out last used and empty options
    const available = options.filter(opt => opt !== lastUsed && opt !== '');

    if (available.length === 0) {
      return options[0] || '';
    }

    // Use variation counter for deterministic but varied selection
    this.variationCounter++;
    const index = this.variationCounter % available.length;
    return available[index];
  }

  /**
   * Ensure response is different from previous response
   */
  private ensureVariation(current: string, previous: string): string {
    // Check for exact match
    if (current === previous) {
      // Add variation phrase
      const variationPhrases = [
        'To put it another way,',
        'In other words,',
        'Let me rephrase that:',
      ];
      const phrase = this.selectVariation(variationPhrases);
      return `${phrase} ${this.applySynonyms(current)}`;
    }

    // Check for high similarity (simple check)
    const currentWords = new Set(current.toLowerCase().split(/\s+/));
    const previousWords = new Set(previous.toLowerCase().split(/\s+/));
    const intersection = Array.from(currentWords).filter(w => previousWords.has(w));
    const similarity = intersection.length / Math.max(currentWords.size, previousWords.size);

    if (similarity > 0.7) {
      // Apply more aggressive synonym substitution
      return this.applySynonyms(this.applySynonyms(current));
    }

    return current;
  }

  /**
   * Generate a response using a template
   */
  generateFromTemplate(
    templateType: keyof typeof RESPONSE_TEMPLATES,
    variables: Record<string, string>
  ): string {
    const templates = RESPONSE_TEMPLATES[templateType];
    if (!templates || templates.length === 0) {
      return '';
    }

    const template = this.selectVariation(templates);
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }

    return result;
  }

  /**
   * Add elaboration for detailed mode
   */
  addElaboration(response: string, elaboration: string): string {
    if (this.config.mode !== 'detailed') {
      return response;
    }

    const phrase = this.selectVariation(ELABORATION_PHRASES);
    return `${response} ${phrase} ${elaboration}`;
  }

  /**
   * Shorten response for short mode
   */
  shorten(response: string): string {
    if (this.config.mode !== 'short') {
      return response;
    }

    // Remove elaboration phrases
    let shortened = response;
    for (const phrase of ELABORATION_PHRASES) {
      shortened = shortened.replace(phrase, '');
    }

    // Remove closing phrases
    for (const phrase of CLOSING_PHRASES) {
      if (phrase) {
        shortened = shortened.replace(phrase, '');
      }
    }

    // Trim and clean up
    shortened = shortened.replace(/\s+/g, ' ').trim();

    return shortened;
  }

  /**
   * Set expansion mode
   */
  setMode(mode: ExpansionMode): void {
    this.config.mode = mode;
    console.log(`[CopilotPhase2] NaturalExpansionEngine mode set to: ${mode}`);
  }

  /**
   * Get current mode
   */
  getMode(): ExpansionMode {
    return this.config.mode;
  }

  /**
   * Update configuration
   */
  configure(config: Partial<ExpansionConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[CopilotPhase2] NaturalExpansionEngine configuration updated');
  }

  /**
   * Clear phrase cache
   */
  clearCache(): void {
    USED_PHRASES_CACHE.clear();
    this.lastUsedOpening = '';
    this.lastUsedClosing = '';
    this.variationCounter = 0;
    console.log('[CopilotPhase2] NaturalExpansionEngine cache cleared');
  }
}

// Singleton instance
let expansionEngine: NaturalExpansionEngineImpl | null = null;

/**
 * Get the NaturalExpansionEngine singleton instance
 */
export function getNaturalExpansionEngine(): NaturalExpansionEngineImpl {
  if (!expansionEngine) {
    expansionEngine = new NaturalExpansionEngineImpl();
  }
  return expansionEngine;
}

/**
 * Create a new NaturalExpansionEngine with custom config
 */
export function createNaturalExpansionEngine(
  config?: Partial<ExpansionConfig>
): NaturalExpansionEngineImpl {
  return new NaturalExpansionEngineImpl(config);
}

export default {
  getNaturalExpansionEngine,
  createNaturalExpansionEngine,
};
