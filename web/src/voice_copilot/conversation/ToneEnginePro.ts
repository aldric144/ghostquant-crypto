/**
 * ToneEnginePro.ts - Dynamic tone selection engine
 * 
 * Supported tones:
 * - calm
 * - friendly
 * - teaching
 * - excited
 * - serious
 * - investor-demo
 * - conversational
 * 
 * Tone is selected based on:
 * - Sentiment of user input
 * - Type of question
 * - Context-memory cues
 */

import { getConversationMemory } from './ConversationMemory';

export type ToneType = 
  | 'calm'
  | 'friendly'
  | 'teaching'
  | 'excited'
  | 'serious'
  | 'investor-demo'
  | 'conversational';

export interface ToneProfile {
  type: ToneType;
  speechRate: number; // 0.5 to 2.0
  pitch: number; // 0.5 to 2.0
  volume: number; // 0.0 to 1.0
  pauseDuration: number; // ms between sentences
  emphasisLevel: number; // 0 to 1
  voiceStyle?: string; // For ElevenLabs voice settings
}

export interface ToneSelectionResult {
  tone: ToneType;
  confidence: number;
  reason: string;
  profile: ToneProfile;
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral' | 'urgent' | 'curious';
  confidence: number;
  keywords: string[];
}

// Tone profiles with speech parameters
const TONE_PROFILES: Record<ToneType, ToneProfile> = {
  calm: {
    type: 'calm',
    speechRate: 0.9,
    pitch: 0.95,
    volume: 0.8,
    pauseDuration: 400,
    emphasisLevel: 0.3,
    voiceStyle: 'calm',
  },
  friendly: {
    type: 'friendly',
    speechRate: 1.0,
    pitch: 1.05,
    volume: 0.9,
    pauseDuration: 300,
    emphasisLevel: 0.5,
    voiceStyle: 'friendly',
  },
  teaching: {
    type: 'teaching',
    speechRate: 0.85,
    pitch: 1.0,
    volume: 0.9,
    pauseDuration: 500,
    emphasisLevel: 0.6,
    voiceStyle: 'educational',
  },
  excited: {
    type: 'excited',
    speechRate: 1.15,
    pitch: 1.1,
    volume: 1.0,
    pauseDuration: 200,
    emphasisLevel: 0.8,
    voiceStyle: 'enthusiastic',
  },
  serious: {
    type: 'serious',
    speechRate: 0.9,
    pitch: 0.9,
    volume: 0.85,
    pauseDuration: 450,
    emphasisLevel: 0.4,
    voiceStyle: 'serious',
  },
  'investor-demo': {
    type: 'investor-demo',
    speechRate: 0.95,
    pitch: 1.0,
    volume: 0.95,
    pauseDuration: 350,
    emphasisLevel: 0.7,
    voiceStyle: 'professional',
  },
  conversational: {
    type: 'conversational',
    speechRate: 1.0,
    pitch: 1.0,
    volume: 0.9,
    pauseDuration: 300,
    emphasisLevel: 0.5,
    voiceStyle: 'conversational',
  },
};

// Sentiment patterns for analysis
const SENTIMENT_PATTERNS = {
  positive: [
    /\b(great|awesome|amazing|excellent|fantastic|wonderful|love|like|good|nice|cool|thanks|thank you)\b/i,
    /\b(excited|happy|pleased|glad|delighted)\b/i,
    /!+$/,
  ],
  negative: [
    /\b(bad|terrible|awful|horrible|hate|dislike|wrong|broken|error|fail|issue|problem)\b/i,
    /\b(frustrated|annoyed|angry|upset|confused)\b/i,
    /\b(doesn't work|not working|can't|won't)\b/i,
  ],
  urgent: [
    /\b(urgent|emergency|asap|immediately|now|quick|fast|hurry)\b/i,
    /\b(critical|important|priority|alert)\b/i,
    /!{2,}/,
  ],
  curious: [
    /\b(what|why|how|when|where|who|which)\b/i,
    /\b(explain|tell me|show me|help me understand)\b/i,
    /\?+$/,
  ],
};

// Question type patterns for tone selection
const QUESTION_TYPE_PATTERNS = {
  howTo: /\b(how\s+(do|can|to)|what's the (way|best way))\b/i,
  whatIs: /\b(what\s+(is|are|does)|define|explain)\b/i,
  whyIs: /\b(why\s+(is|are|does|do)|reason|cause)\b/i,
  showMe: /\b(show\s+me|display|visualize|see)\b/i,
  analyze: /\b(analyze|analysis|track|monitor|detect)\b/i,
  navigate: /\b(go\s+to|navigate|open|take\s+me)\b/i,
  demo: /\b(demo|demonstrate|presentation|investor|pitch)\b/i,
};

class ToneEngineProImpl {
  private currentTone: ToneType = 'conversational';
  private toneHistory: ToneType[] = [];
  private maxHistorySize: number = 10;

  constructor() {
    console.log('[ToneEngine] ToneEnginePro initialized');
  }

  /**
   * Analyze sentiment of user input
   */
  analyzeSentiment(text: string): SentimentAnalysis {
    const keywords: string[] = [];
    let sentiment: SentimentAnalysis['sentiment'] = 'neutral';
    let confidence = 0.5;

    // Check for urgent sentiment first (highest priority)
    for (const pattern of SENTIMENT_PATTERNS.urgent) {
      const match = text.match(pattern);
      if (match) {
        sentiment = 'urgent';
        confidence = 0.9;
        keywords.push(match[0]);
      }
    }

    // Check for curious sentiment (questions)
    if (sentiment === 'neutral') {
      for (const pattern of SENTIMENT_PATTERNS.curious) {
        const match = text.match(pattern);
        if (match) {
          sentiment = 'curious';
          confidence = 0.8;
          keywords.push(match[0]);
        }
      }
    }

    // Check for positive sentiment
    if (sentiment === 'neutral') {
      for (const pattern of SENTIMENT_PATTERNS.positive) {
        const match = text.match(pattern);
        if (match) {
          sentiment = 'positive';
          confidence = 0.75;
          keywords.push(match[0]);
        }
      }
    }

    // Check for negative sentiment
    if (sentiment === 'neutral') {
      for (const pattern of SENTIMENT_PATTERNS.negative) {
        const match = text.match(pattern);
        if (match) {
          sentiment = 'negative';
          confidence = 0.8;
          keywords.push(match[0]);
        }
      }
    }

    return { sentiment, confidence, keywords };
  }

  /**
   * Detect question type from user input
   */
  detectQuestionType(text: string): string | null {
    for (const [type, pattern] of Object.entries(QUESTION_TYPE_PATTERNS)) {
      if (pattern.test(text)) {
        return type;
      }
    }
    return null;
  }

  /**
   * Select appropriate tone based on user input and context
   */
  selectTone(userInput: string, intent?: string): ToneSelectionResult {
    const sentiment = this.analyzeSentiment(userInput);
    const questionType = this.detectQuestionType(userInput);
    const memory = getConversationMemory();
    const context = memory.getContext();

    let selectedTone: ToneType = 'conversational';
    let confidence = 0.5;
    let reason = 'Default conversational tone';

    // Check for demo/investor context
    if (questionType === 'demo' || intent === 'demo' || 
        userInput.toLowerCase().includes('investor') ||
        userInput.toLowerCase().includes('pitch')) {
      selectedTone = 'investor-demo';
      confidence = 0.95;
      reason = 'Investor/demo context detected';
    }
    // Check for teaching context (how-to, what-is, why-is questions)
    else if (questionType === 'howTo' || questionType === 'whatIs' || questionType === 'whyIs') {
      selectedTone = 'teaching';
      confidence = 0.85;
      reason = `Educational question type: ${questionType}`;
    }
    // Check for urgent sentiment
    else if (sentiment.sentiment === 'urgent') {
      selectedTone = 'serious';
      confidence = 0.9;
      reason = 'Urgent sentiment detected';
    }
    // Check for negative sentiment
    else if (sentiment.sentiment === 'negative') {
      selectedTone = 'calm';
      confidence = 0.85;
      reason = 'Negative sentiment - using calm tone to de-escalate';
    }
    // Check for positive/excited sentiment
    else if (sentiment.sentiment === 'positive') {
      selectedTone = 'friendly';
      confidence = 0.8;
      reason = 'Positive sentiment detected';
    }
    // Check for curious sentiment (questions)
    else if (sentiment.sentiment === 'curious') {
      selectedTone = 'friendly';
      confidence = 0.75;
      reason = 'Curious/questioning sentiment';
    }
    // Check conversation context
    else if (context.currentTopic) {
      // Use topic-appropriate tone
      if (context.currentTopic === 'threat_detection' || context.currentTopic === 'risk') {
        selectedTone = 'serious';
        confidence = 0.7;
        reason = 'Threat/risk topic context';
      } else if (context.currentTopic === 'help') {
        selectedTone = 'teaching';
        confidence = 0.7;
        reason = 'Help topic context';
      }
    }

    // Update current tone and history
    this.currentTone = selectedTone;
    this.toneHistory.push(selectedTone);
    if (this.toneHistory.length > this.maxHistorySize) {
      this.toneHistory.shift();
    }

    const result: ToneSelectionResult = {
      tone: selectedTone,
      confidence,
      reason,
      profile: TONE_PROFILES[selectedTone],
    };

    console.log(`[ToneEngine] Selected tone: ${selectedTone} (${reason})`);
    return result;
  }

  /**
   * Get tone profile for a specific tone
   */
  getToneProfile(tone: ToneType): ToneProfile {
    return TONE_PROFILES[tone];
  }

  /**
   * Get current tone
   */
  getCurrentTone(): ToneType {
    return this.currentTone;
  }

  /**
   * Get current tone profile
   */
  getCurrentToneProfile(): ToneProfile {
    return TONE_PROFILES[this.currentTone];
  }

  /**
   * Set tone manually
   */
  setTone(tone: ToneType): void {
    this.currentTone = tone;
    this.toneHistory.push(tone);
    if (this.toneHistory.length > this.maxHistorySize) {
      this.toneHistory.shift();
    }
    console.log(`[ToneEngine] Tone manually set to: ${tone}`);
  }

  /**
   * Get tone history
   */
  getToneHistory(): ToneType[] {
    return [...this.toneHistory];
  }

  /**
   * Get most frequent tone in history
   */
  getMostFrequentTone(): ToneType {
    if (this.toneHistory.length === 0) return 'conversational';

    const counts: Record<string, number> = {};
    for (const tone of this.toneHistory) {
      counts[tone] = (counts[tone] || 0) + 1;
    }

    let maxCount = 0;
    let mostFrequent: ToneType = 'conversational';
    for (const [tone, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = tone as ToneType;
      }
    }

    return mostFrequent;
  }

  /**
   * Apply tone profile to TTS settings
   */
  applyToTTS(profile: ToneProfile): Record<string, number | string> {
    return {
      rate: profile.speechRate,
      pitch: profile.pitch,
      volume: profile.volume,
      style: profile.voiceStyle || 'default',
    };
  }

  /**
   * Get all available tones
   */
  getAvailableTones(): ToneType[] {
    return Object.keys(TONE_PROFILES) as ToneType[];
  }

  /**
   * Reset tone engine
   */
  reset(): void {
    this.currentTone = 'conversational';
    this.toneHistory = [];
    console.log('[ToneEngine] Reset to default');
  }
}

// Singleton instance
let toneEnginePro: ToneEngineProImpl | null = null;

/**
 * Get the ToneEnginePro singleton instance
 */
export function getToneEnginePro(): ToneEngineProImpl {
  if (!toneEnginePro) {
    toneEnginePro = new ToneEngineProImpl();
  }
  return toneEnginePro;
}

/**
 * Create a new ToneEnginePro instance
 */
export function createToneEnginePro(): ToneEngineProImpl {
  return new ToneEngineProImpl();
}

// Convenience exports
export const selectTone = (userInput: string, intent?: string) => 
  getToneEnginePro().selectTone(userInput, intent);

export const getCurrentTone = () => getToneEnginePro().getCurrentTone();

export const setTone = (tone: ToneType) => getToneEnginePro().setTone(tone);

export default {
  getToneEnginePro,
  createToneEnginePro,
  selectTone,
  getCurrentTone,
  setTone,
  TONE_PROFILES,
};
