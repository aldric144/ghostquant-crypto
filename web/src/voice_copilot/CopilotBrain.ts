/**
 * CopilotBrain - The Orchestrator for GhostQuant Voice Copilot Cognitive Engine
 * 
 * This is the central intelligence layer that coordinates all cognitive modules:
 * 
 * Pipeline: Answer = ToneEngine(Personality(KnowledgeBase(Intent(Context))))
 * 
 * Modules Integrated:
 * 1. CopilotKnowledgeBase - Comprehensive GhostQuant knowledge repository
 * 2. CopilotIntentModel - Natural language intent recognition
 * 3. CopilotPersonality - Hybrid personality engine
 * 4. CopilotToneEngine - Dynamic tone selection and transformation
 * 5. CopilotContextEngine - Contextual awareness system
 * 6. CopilotErrorRecovery - Intelligent error recovery
 * 7. CopilotTrainingDataset - 100+ Q&A examples for semantic matching
 * 8. CopilotSelfUpdate - Self-updating intelligence system
 * 9. CopilotUIResponses - UI dialogue pack and investor demo scripts
 */

import { CopilotContextState } from './CopilotContext';
import {
  PersonalityConfig,
  generatePersonalityConfig,
  interpretVagueQuestion,
  generateFriendlyFallback,
  shapeResponse,
  isVagueQuestion,
  getClarificationRequest,
  generatePersonalizedGreeting,
} from './CopilotPersonality';

// Import new cognitive modules
import {
  queryKnowledge,
  getKnowledgeByPageContext,
  getKnowledgeResponse,
  searchKnowledge,
  KnowledgeDepth,
} from './CopilotKnowledgeBase';

import {
  recognizeIntent,
  isModeSwitch,
  isNavigationRequest,
  isVagueQuery,
  RecognizedIntent,
} from './CopilotIntentModel';

import {
  selectTone,
  transformResponse,
  createToneContext,
  detectUserMood,
  ToneConfig,
  ToneState,
} from './CopilotToneEngine';

import {
  createInitialContextState,
  updatePageContext,
  extractContextClues,
  getContextDescription,
  getSuggestedQuestions,
  inferQuerySubject,
  ContextState,
} from './CopilotContextEngine';

import {
  getRecoveryResponse,
  formatRecoveryResponse,
  isRoboticResponse,
  humanizeResponse,
  detectUserConfusion,
  getProactiveHelp,
} from './CopilotErrorRecovery';

import {
  searchExamples,
  getExamplesByIntent,
  TRAINING_DATASET,
} from './CopilotTrainingDataset';

import {
  getUserPreferences,
  updateUserPreferences,
  recordQuestion,
  recordFeedback,
} from './CopilotSelfUpdate';

import {
  getWelcomeScript,
  getEncouragingPrompt,
  getHoverHint,
  getGuidancePrompt,
  getDemoScript,
  getFullDemoScript,
  UserType,
} from './CopilotUIResponses';

export interface CopilotAnswer {
  text: string;
  category: 'hydra' | 'constellation' | 'analytics' | 'whales' | 'widb' | 'demo' | 'ecoscan' | 'onboarding' | 'investor' | 'general';
  contextSummary?: string;
  suggestedActions?: string[];
  mode: 'informational' | 'navigation' | 'explanation';
  followUp?: string;
  personalityConfig?: PersonalityConfig;
}

// GhostQuant Knowledge Base with beginner and expert descriptions
const KNOWLEDGE_BASE = {
  hydra: {
    keywords: ['hydra', 'multi-head', 'detection', 'threat', 'heads', 'manipulation detection'],
    description: 'Hydra is GhostQuant\'s multi-head threat detection engine. It uses parallel analysis streams called "heads" to detect different types of market manipulation simultaneously. Each head specializes in a specific threat pattern like wash trading, spoofing, or coordinated pump-and-dump schemes.',
    simpleDescription: 'Hydra is like having multiple security cameras, each watching for different types of suspicious activity. One watches for fake trading, another for market tricks, and so on. When any camera spots something, you get an alert.',
    expertDetail: 'Hydra employs a multi-head attention architecture with each head trained on specific manipulation signatures. The system processes transaction graphs in real-time, applying behavioral heuristics and statistical anomaly detection across multiple timeframes. Confidence scores are computed using ensemble methods combining rule-based and ML-driven classifiers.',
    features: [
      'Multi-head parallel threat analysis',
      'Real-time manipulation detection',
      'Confidence scoring for each threat type',
      'Cross-chain threat correlation',
    ],
    investorPitch: 'Hydra is our flagship detection engine that processes millions of transactions in real-time, identifying manipulation patterns that traditional systems miss. It\'s like having multiple expert analysts working simultaneously.',
  },
  
  constellation: {
    keywords: ['constellation', 'fusion', 'entity', 'cluster', 'network', 'graph', 'connection'],
    description: 'Constellation is GhostQuant\'s entity fusion engine. It maps relationships between wallets, exchanges, and entities across multiple blockchains, revealing hidden connections and coordinated behavior patterns.',
    simpleDescription: 'Think of Constellation as a social network map for crypto wallets. It shows you which wallets are connected and might be controlled by the same person or group, even if they\'re trying to hide it.',
    expertDetail: 'Constellation uses graph neural networks combined with temporal analysis to identify entity clusters. The system applies community detection algorithms on transaction graphs, then validates clusters using behavioral fingerprinting. Risk propagation is modeled using belief propagation on the entity graph.',
    features: [
      'Cross-chain entity mapping',
      'Cluster detection and analysis',
      'Behavioral pattern recognition',
      'Risk propagation modeling',
    ],
    investorPitch: 'Constellation reveals the hidden network of relationships in crypto markets. It can identify when seemingly unrelated wallets are actually controlled by the same entity, exposing coordinated manipulation.',
  },
  
  analytics: {
    keywords: ['analytics', 'dashboard', 'metrics', 'risk index', 'market', 'trends', 'heatmap'],
    description: 'The Analytics Dashboard provides real-time market intelligence including global risk indices, whale activity metrics, entity classifications, anomaly feeds, and AI-generated narrative summaries.',
    simpleDescription: 'The Analytics Dashboard is your command center - one screen showing everything important: market health, big player activity, and any unusual patterns. Think of it as your crypto weather report.',
    expertDetail: 'The dashboard aggregates signals from all GhostQuant subsystems, applying weighted scoring to compute composite risk indices. Market narratives are generated using fine-tuned LLMs with retrieval-augmented generation from our proprietary intelligence database.',
    features: [
      'Global risk index monitoring',
      'Whale activity tracking',
      'Entity classification summaries',
      'Real-time anomaly detection',
      'AI-generated market narratives',
    ],
    investorPitch: 'Our Analytics Dashboard gives institutional clients a single pane of glass view into market health, combining multiple intelligence streams into actionable insights.',
  },
  
  whales: {
    keywords: ['whale', 'whales', 'large holder', 'big wallet', 'whale tracking', 'whale movement'],
    description: 'GhostQuant\'s Whale Intelligence system tracks large cryptocurrency holders and their movements. It identifies whale wallets, monitors their transactions, and predicts potential market impact.',
    simpleDescription: 'Whale tracking is like following the big fish in the ocean. When someone with millions in crypto moves their money, it can affect prices. We watch these big players so you know what\'s coming.',
    expertDetail: 'Whale identification uses clustering on transaction volumes and wallet balances, with dynamic thresholds adjusted per asset. Movement prediction employs time-series analysis and order flow modeling to estimate market impact using microstructure metrics.',
    features: [
      'Whale wallet identification',
      'Movement tracking and alerts',
      'Impact prediction modeling',
      'Historical behavior analysis',
    ],
    investorPitch: 'Whale movements often precede major market moves. Our system identifies and tracks these large holders, giving our clients early warning of potential market shifts.',
  },
  
  widb: {
    keywords: ['widb', 'whale intelligence database', 'database', 'wallet database', 'entity database'],
    description: 'WIDB (Whale Intelligence Database) is GhostQuant\'s comprehensive database of known entities, wallets, and their risk profiles. It includes sanctions screening, behavioral scoring, and historical activity records.',
    simpleDescription: 'WIDB is our address book of crypto wallets - we know who\'s who, their history, and their risk level. It\'s like a credit report for crypto addresses.',
    expertDetail: 'WIDB maintains entity profiles with behavioral fingerprints, transaction histories, and risk scores computed using gradient-boosted models. Sanctions screening uses fuzzy matching against OFAC, EU, and other watchlists with configurable similarity thresholds.',
    features: [
      'Comprehensive entity profiles',
      'Risk scoring and classification',
      'Sanctions and watchlist screening',
      'Historical activity tracking',
    ],
    investorPitch: 'WIDB is our proprietary intelligence database containing profiles on thousands of crypto entities. It\'s the foundation that powers our risk assessment capabilities.',
  },
  
  ecoscan: {
    keywords: ['ecoscan', 'scan', 'entity scan', 'wallet scan', 'address scan', 'risk scan'],
    description: 'EcoScan is GhostQuant\'s entity scanning tool. Enter any wallet address or entity identifier to get a comprehensive risk assessment, including behavioral analysis, connection mapping, and threat indicators.',
    simpleDescription: 'EcoScan is like running a background check on any crypto address. Paste an address, and we\'ll tell you if it\'s trustworthy, who it\'s connected to, and any red flags.',
    expertDetail: 'EcoScan performs real-time graph traversal to map entity connections, applies behavioral classifiers to transaction patterns, and cross-references against WIDB and external threat intelligence feeds. Results are returned with confidence intervals and supporting evidence.',
    features: [
      'Instant wallet risk assessment',
      'Behavioral pattern analysis',
      'Connection and cluster mapping',
      'Threat indicator detection',
    ],
    investorPitch: 'EcoScan provides instant due diligence on any crypto address. Compliance teams use it to screen counterparties and assess transaction risk in seconds.',
  },
  
  demo: {
    keywords: ['demo', 'demonstration', 'try', 'test', 'sample', 'preview'],
    description: 'GhostQuant\'s Demo Mode lets you experience our intelligence capabilities with synthetic data. Try our prediction engine, entity scanner, and risk map without needing live data access.',
    simpleDescription: 'Demo Mode lets you test drive GhostQuant with sample data. Everything works just like the real thing, but with made-up data so you can explore freely.',
    expertDetail: 'Demo mode uses procedurally generated synthetic data that maintains statistical properties of real market data while ensuring no actual entity information is exposed.',
    features: [
      'Synthetic data demonstrations',
      'Full feature preview',
      'No account required',
      'Interactive exploration',
    ],
    investorPitch: 'Our demo mode showcases the full power of GhostQuant using realistic synthetic data, perfect for evaluating our capabilities before committing to a subscription.',
  },
  
  investor: {
    keywords: ['investor', 'pitch', 'presentation', 'funding', 'investment'],
    description: 'GhostQuant is a next-generation crypto intelligence platform designed for institutional investors and compliance teams. We combine real-time blockchain analysis with advanced machine learning to detect market manipulation, track whale movements, and assess entity risk.',
    simpleDescription: 'GhostQuant helps big investors and compliance teams understand what\'s really happening in crypto markets. We spot manipulation, track big players, and assess risk - all in real-time.',
    expertDetail: 'GhostQuant processes over 10 million transactions daily across 15+ blockchains, with sub-second latency for threat detection. Our API serves institutional clients including hedge funds, exchanges, and compliance providers.',
    features: [
      'Institutional-grade intelligence',
      'Real-time threat detection',
      'Compliance automation',
      'Enterprise API access',
    ],
    investorPitch: 'GhostQuant is the Bloomberg Terminal for crypto intelligence. We help institutions navigate cryptocurrency markets with confidence through real-time threat detection and entity analysis.',
  },
  
  onboarding: {
    keywords: ['onboarding', 'getting started', 'how to use', 'tutorial', 'guide'],
    description: 'Welcome to GhostQuant! Start by exploring the Analytics Dashboard for market overview, then dive into specific tools like Hydra for threat detection or Whale Intelligence for tracking large holders.',
    simpleDescription: 'New here? Start with the Analytics Dashboard to see the big picture, then explore specific tools as you get curious. I\'m here to help explain anything!',
    expertDetail: 'Onboarding includes role-based tutorials optimized for different user personas with progressive disclosure of advanced features.',
    features: [
      'Interactive tutorials',
      'Guided feature tours',
      'Quick start guides',
      'Support documentation',
    ],
    investorPitch: 'Our onboarding process gets new users productive within minutes, with comprehensive documentation and guided tours of all platform features.',
  },
  
  general: {
    keywords: ['ghostquant', 'platform', 'what is', 'how does', 'explain', 'help'],
    description: 'GhostQuant is a private crypto-native research and signal platform. We provide institutional-grade market intelligence, threat detection, and entity analysis for cryptocurrency markets.',
    simpleDescription: 'GhostQuant is your crypto intelligence partner. We help you understand what\'s happening in the market, spot risks, and make better decisions.',
    expertDetail: 'GhostQuant combines on-chain analytics, behavioral modeling, and graph analysis to provide comprehensive market intelligence. Our tech stack includes custom blockchain indexers, graph databases, and ML pipelines running on distributed infrastructure.',
    features: [
      'Real-time threat detection',
      'Entity and wallet intelligence',
      'Market manipulation alerts',
      'Compliance and risk tools',
    ],
    investorPitch: 'GhostQuant is the Bloomberg Terminal for crypto intelligence. We help institutions navigate the complex and often opaque world of cryptocurrency markets with confidence.',
  },
};

// Context-aware response templates with page elements
const CONTEXT_TEMPLATES: Record<string, { description: string; elements: string[] }> = {
  '/terminal/hydra': {
    description: 'You\'re viewing the Hydra Console, our multi-head threat detection engine.',
    elements: ['threat detection heads', 'confidence scores', 'active alerts', 'detection history'],
  },
  '/terminal/constellation': {
    description: 'You\'re on the Constellation page, which shows entity relationships and cluster analysis.',
    elements: ['entity clusters', 'connection graph', 'risk propagation', 'entity details'],
  },
  '/terminal/analytics': {
    description: 'You\'re viewing the Analytics Dashboard with real-time market intelligence.',
    elements: ['risk index', 'whale activity', 'market trends', 'anomaly feed', 'narrative summary'],
  },
  '/analytics-dashboard': {
    description: 'You\'re on the Analytics Dashboard V2 with 7 analytics panels and live auto-refresh.',
    elements: ['risk analytics', 'whale analytics', 'entity analytics', 'trend analytics', 'geographic map', 'anomaly detection', 'narrative engine'],
  },
  '/terminal/whales': {
    description: 'You\'re on the Whale Intelligence page, tracking large holder movements.',
    elements: ['whale list', 'movement alerts', 'impact predictions', 'activity timeline'],
  },
  '/whale-intelligence': {
    description: 'You\'re on the Whale Intelligence V2 page with advanced whale tracking features.',
    elements: ['whale metrics', 'top 50 whales', 'influence heatmap', 'live movements', 'whale search'],
  },
  '/terminal/whale-intel': {
    description: 'You\'re viewing the Whale Intelligence Database (WIDB) with entity profiles.',
    elements: ['entity profiles', 'risk scores', 'transaction history', 'watchlist status'],
  },
  '/influence-graph': {
    description: 'You\'re on the Influence Graph, visualizing entity connections.',
    elements: ['connection nodes', 'relationship edges', 'cluster highlights', 'risk indicators'],
  },
  '/threat-map': {
    description: 'You\'re viewing the Global Threat Map with geographic risk distribution.',
    elements: ['regional risk levels', 'threat hotspots', 'activity density', 'trend indicators'],
  },
  '/terminal/ghostmind': {
    description: 'You\'re in the GhostMind AI Console for conversational intelligence.',
    elements: ['chat interface', 'query history', 'suggested questions', 'context panel'],
  },
  '/terminal/predict': {
    description: 'You\'re on the Prediction page for market forecasting.',
    elements: ['prediction models', 'confidence intervals', 'historical accuracy', 'trend projections'],
  },
  '/terminal/entity': {
    description: 'You\'re viewing entity details and risk profiles.',
    elements: ['entity profile', 'risk breakdown', 'connection map', 'activity log'],
  },
};

// Investor presentation responses
const INVESTOR_RESPONSES: Record<string, string> = {
  briefing: `Here's your 30-second intelligence briefing: GhostQuant is currently monitoring elevated market activity with our Hydra engine detecting multiple coordination patterns. Whale movements are above average, with significant accumulation in major assets. Our Constellation engine has identified several new entity clusters that warrant attention. Overall market risk is moderate with localized high-risk zones in emerging DeFi protocols.`,
  
  explain: `GhostQuant is a next-generation crypto intelligence platform designed for institutional investors and compliance teams. We combine real-time blockchain analysis with advanced machine learning to detect market manipulation, track whale movements, and assess entity risk. Our platform processes millions of transactions daily, providing actionable intelligence that helps our clients make informed decisions and maintain regulatory compliance.`,
  
  hydraSimple: `Think of Hydra as a security system with multiple cameras, each watching for different types of suspicious activity. One camera watches for wash trading, another for spoofing, another for pump-and-dump schemes. When any camera detects something, Hydra alerts you immediately with a confidence score.`,
  
  constellationWalkthrough: `Constellation maps the hidden connections in crypto markets. Imagine a social network graph, but for wallets and entities. When you see a cluster light up, that means we've identified wallets that are likely controlled by the same entity or are coordinating their activity. This is crucial for detecting manipulation and understanding market dynamics.`,
};

// Check if question is contextual (referring to current page)
function isContextualQuestion(question: string): boolean {
  const contextualPatterns = [
    /this/i, /here/i, /current/i, /looking at/i, /seeing/i,
    /the (chart|graph|score|number|metric)/i, /what('s| is) (this|that)/i,
  ];
  return contextualPatterns.some(pattern => pattern.test(question));
}

// Classify the question category with context awareness
function classifyQuestion(question: string, context: CopilotContextState): CopilotAnswer['category'] {
  const lowerQuestion = question.toLowerCase();
  
  // First, check if context strongly suggests a category
  if (context.currentPath) {
    if (context.currentPath.includes('hydra') && isContextualQuestion(lowerQuestion)) {
      return 'hydra';
    }
    if (context.currentPath.includes('constellation') && isContextualQuestion(lowerQuestion)) {
      return 'constellation';
    }
    if (context.currentPath.includes('analytics') && isContextualQuestion(lowerQuestion)) {
      return 'analytics';
    }
    if ((context.currentPath.includes('whale') || context.currentPath.includes('widb')) && isContextualQuestion(lowerQuestion)) {
      return 'whales';
    }
  }
  
  // Then check keywords
  for (const [category, data] of Object.entries(KNOWLEDGE_BASE)) {
    if (data.keywords.some(keyword => lowerQuestion.includes(keyword))) {
      return category as CopilotAnswer['category'];
    }
  }
  
  // Check for investor-specific queries
  if (lowerQuestion.includes('investor') || lowerQuestion.includes('pitch') || 
      lowerQuestion.includes('briefing') || lowerQuestion.includes('simple terms')) {
    return 'investor';
  }
  
  return 'general';
}

// Get description based on depth level
function getDescriptionForDepth(category: string, depth: string): string {
  const knowledge = KNOWLEDGE_BASE[category as keyof typeof KNOWLEDGE_BASE] || KNOWLEDGE_BASE.general;
  
  if (depth === 'beginner' && knowledge.simpleDescription) {
    return knowledge.simpleDescription;
  }
  
  if ((depth === 'expert' || depth === 'advanced') && knowledge.expertDetail) {
    return knowledge.expertDetail;
  }
  
  return knowledge.description;
}

// Generate contextual response with personality config
function generateContextResponse(context: CopilotContextState, config: PersonalityConfig): string {
  const template = CONTEXT_TEMPLATES[context.currentPath];
  if (template) {
    let response = template.description;
    
    if (context.selectedAddress) {
      response += ` You're currently examining address ${context.selectedAddress.slice(0, 10)}...`;
    }
    
    if (context.selectedClusterId) {
      response += ` Cluster ${context.selectedClusterId} is selected.`;
    }
    
    // Add element hints based on depth
    if (config.depth === 'beginner') {
      response += ` The main things to look at here are: ${template.elements.slice(0, 2).join(' and ')}.`;
    }
    
    return response;
  }
  
  return 'You\'re using the GhostQuant Intelligence Terminal.';
}

// Handle vague questions with context awareness
function handleVagueQuestion(question: string, context: CopilotContextState, config: PersonalityConfig): CopilotAnswer | null {
  if (!isVagueQuestion(question)) {
    return null;
  }
  
  const interpretation = interpretVagueQuestion(question, context);
  const category = classifyQuestion(question, context);
  
  // Generate response based on interpretation
  let responseText = '';
  
  if (interpretation.confidence === 'high' || interpretation.confidence === 'medium') {
    // We're confident about what they're asking
    const contextTemplate = CONTEXT_TEMPLATES[context.currentPath];
    if (contextTemplate) {
      responseText = contextTemplate.description;
      
      // Add depth-appropriate explanation
      const knowledge = KNOWLEDGE_BASE[category as keyof typeof KNOWLEDGE_BASE];
      if (knowledge) {
        responseText += ' ' + getDescriptionForDepth(category, config.depth);
      }
    } else {
      responseText = generateFriendlyFallback(question, context, interpretation);
    }
  } else {
    // Low confidence - offer clarification
    responseText = getClarificationRequest(context);
  }
  
  const shaped = shapeResponse(responseText, config, context);
  
  return {
    text: shaped.text,
    category,
    contextSummary: context.currentPath,
    mode: 'explanation',
    followUp: shaped.followUp,
    personalityConfig: config,
  };
}

// Handle "is this good/bad" type questions
function handleAssessmentQuestion(question: string, context: CopilotContextState, config: PersonalityConfig): CopilotAnswer | null {
  const assessmentPatterns = [
    /is (this|that|it) (good|bad|okay|ok|normal|concerning|worrying)/i,
    /should i (worry|be concerned|be worried)/i,
    /is (this|that) (high|low|normal)/i,
    /what does (this|that) (mean|indicate|suggest)/i,
  ];
  
  if (!assessmentPatterns.some(pattern => pattern.test(question))) {
    return null;
  }
  
  let responseText = '';
  
  // Use context to provide relevant assessment
  if (context.lastRiskScore !== null) {
    const score = context.lastRiskScore;
    if (score < 30) {
      responseText = config.depth === 'beginner' 
        ? `This risk score of ${score} is low - that's good news! It means this entity shows normal, healthy behavior patterns.`
        : `The risk score of ${score} indicates low risk. The entity exhibits behavioral patterns consistent with legitimate market activity, with no significant threat indicators detected.`;
    } else if (score < 60) {
      responseText = config.depth === 'beginner'
        ? `This score of ${score} is moderate - not alarming, but worth keeping an eye on. Think of it as a yellow light, not a red one.`
        : `A risk score of ${score} represents moderate risk. Some behavioral patterns warrant attention, but no immediate threat indicators are present. Continued monitoring is recommended.`;
    } else if (score < 80) {
      responseText = config.depth === 'beginner'
        ? `This score of ${score} is elevated - it's flagging some concerning patterns. I'd recommend looking closer at what's triggering this.`
        : `The risk score of ${score} indicates elevated risk. Multiple behavioral indicators suggest potential concerning activity. Detailed analysis of contributing factors is recommended.`;
    } else {
      responseText = config.depth === 'beginner'
        ? `This score of ${score} is high - our system is seeing significant red flags here. This definitely warrants a closer look.`
        : `A risk score of ${score} represents critical risk. Strong indicators of potentially malicious or manipulative behavior have been detected. Immediate review and potential action may be warranted.`;
    }
  } else if (context.currentPath.includes('analytics')) {
    responseText = config.depth === 'beginner'
      ? 'Looking at the current metrics, things are within normal ranges. The market is showing typical activity patterns.'
      : 'Current analytics indicate market conditions within expected parameters. No significant anomalies detected in the primary risk indicators.';
  } else {
    responseText = 'To give you a proper assessment, I\'d need to know which specific metric or element you\'re asking about. Could you point me to the specific number or chart?';
  }
  
  const shaped = shapeResponse(responseText, config, context);
  
  return {
    text: shaped.text,
    category: 'general',
    contextSummary: context.currentPath,
    mode: 'explanation',
    followUp: shaped.followUp,
    personalityConfig: config,
  };
}

// Handle "why is this high/low" type questions
function handleWhyQuestion(question: string, context: CopilotContextState, config: PersonalityConfig): CopilotAnswer | null {
  const whyPatterns = [
    /why is (this|that|it) (high|low|red|green|elevated|critical)/i,
    /what('s| is) causing (this|that|it)/i,
    /why (did|does) (this|that|it)/i,
  ];
  
  if (!whyPatterns.some(pattern => pattern.test(question))) {
    return null;
  }
  
  let responseText = '';
  const category = classifyQuestion(question, context);
  
  if (context.currentPath.includes('hydra')) {
    responseText = config.depth === 'beginner'
      ? 'The detection heads are flagging this because they\'ve spotted patterns that match known manipulation techniques. Each head watches for different tricks - when multiple heads agree, we get higher confidence.'
      : 'Elevated threat scores result from multiple detection heads identifying behavioral patterns consistent with manipulation signatures. The confidence level reflects the degree of consensus across independent detection algorithms and the strength of the pattern match.';
  } else if (context.currentPath.includes('analytics')) {
    responseText = config.depth === 'beginner'
      ? 'This metric is elevated because we\'re seeing unusual activity in the market - either more volume, more whale movements, or patterns that don\'t match normal trading.'
      : 'The elevated reading reflects aggregated signals from multiple data sources including transaction volume anomalies, whale activity deviations, and behavioral pattern matches that exceed baseline thresholds.';
  } else if (context.currentPath.includes('whale') || context.currentPath.includes('widb')) {
    responseText = config.depth === 'beginner'
      ? 'This is flagged because we\'ve seen this wallet behave in ways that match risky patterns - maybe unusual transaction timing, connections to flagged addresses, or activity that looks like market manipulation.'
      : 'The risk elevation stems from behavioral indicators including transaction pattern anomalies, network connections to flagged entities, and activity signatures that correlate with known manipulation or illicit behavior patterns.';
  } else {
    responseText = 'The elevated reading is based on our analysis of multiple factors. Would you like me to break down the specific contributors?';
  }
  
  const shaped = shapeResponse(responseText, config, context);
  
  return {
    text: shaped.text,
    category,
    contextSummary: context.currentPath,
    mode: 'explanation',
    followUp: shaped.followUp,
    personalityConfig: config,
  };
}

// Main brain processing function with personality integration
export function processQuestion(question: string, context: CopilotContextState): CopilotAnswer {
  const lowerQuestion = question.toLowerCase();
  
  // Generate personality configuration based on user input
  const config = generatePersonalityConfig(question, context);
  
  // Try to handle vague questions first
  const vagueResponse = handleVagueQuestion(question, context, config);
  if (vagueResponse) {
    return vagueResponse;
  }
  
  // Handle assessment questions ("is this good/bad")
  const assessmentResponse = handleAssessmentQuestion(question, context, config);
  if (assessmentResponse) {
    return assessmentResponse;
  }
  
  // Handle "why" questions
  const whyResponse = handleWhyQuestion(question, context, config);
  if (whyResponse) {
    return whyResponse;
  }
  
  const category = classifyQuestion(question, context);
  
  // Handle investor presentation queries
  if (lowerQuestion.includes('briefing') || lowerQuestion.includes('30 second') || lowerQuestion.includes('30-second')) {
    const shaped = shapeResponse(INVESTOR_RESPONSES.briefing, config, context);
    return {
      text: shaped.text,
      category: 'investor',
      mode: 'informational',
      suggestedActions: ['View Analytics Dashboard', 'Check Whale Activity'],
      followUp: shaped.followUp,
      personalityConfig: config,
    };
  }
  
  if (lowerQuestion.includes('explain ghostquant to investor') || lowerQuestion.includes('explain to investor')) {
    const shaped = shapeResponse(INVESTOR_RESPONSES.explain, config, context);
    return {
      text: shaped.text,
      category: 'investor',
      mode: 'explanation',
      followUp: shaped.followUp,
      personalityConfig: config,
    };
  }
  
  if (lowerQuestion.includes('hydra') && (lowerQuestion.includes('simple') || lowerQuestion.includes('explain'))) {
    const description = getDescriptionForDepth('hydra', config.depth);
    const shaped = shapeResponse(description, config, context);
    return {
      text: shaped.text,
      category: 'hydra',
      mode: 'explanation',
      followUp: shaped.followUp,
      personalityConfig: config,
    };
  }
  
  if (lowerQuestion.includes('constellation') && (lowerQuestion.includes('walk') || lowerQuestion.includes('through'))) {
    const description = getDescriptionForDepth('constellation', config.depth);
    const shaped = shapeResponse(description, config, context);
    return {
      text: shaped.text,
      category: 'constellation',
      mode: 'explanation',
      followUp: shaped.followUp,
      personalityConfig: config,
    };
  }
  
  // Handle context-aware queries
  if (lowerQuestion.includes('this screen') || lowerQuestion.includes('this page') || 
      lowerQuestion.includes('where am i') || lowerQuestion.includes('what am i looking at')) {
    const contextResponse = generateContextResponse(context, config);
    const shaped = shapeResponse(contextResponse, config, context);
    return {
      text: shaped.text,
      category: 'general',
      contextSummary: context.currentPath,
      mode: 'informational',
      followUp: shaped.followUp,
      personalityConfig: config,
    };
  }
  
  // Handle "what does X do" queries
  if (lowerQuestion.includes('what does') || lowerQuestion.includes('what is') || lowerQuestion.includes('explain')) {
    const description = getDescriptionForDepth(category, config.depth);
    const knowledge = KNOWLEDGE_BASE[category as keyof typeof KNOWLEDGE_BASE] || KNOWLEDGE_BASE.general;
    const shaped = shapeResponse(description, config, context);
    return {
      text: shaped.text,
      category,
      mode: 'explanation',
      suggestedActions: knowledge.features.slice(0, 2),
      followUp: shaped.followUp,
      personalityConfig: config,
    };
  }
  
  // Handle feature queries
  if (lowerQuestion.includes('feature') || lowerQuestion.includes('can it') || lowerQuestion.includes('capabilities')) {
    const knowledge = KNOWLEDGE_BASE[category as keyof typeof KNOWLEDGE_BASE] || KNOWLEDGE_BASE.general;
    const featureList = knowledge.features.join(', ');
    const baseResponse = `Key features include: ${featureList}. Would you like me to explain any of these in detail?`;
    const shaped = shapeResponse(baseResponse, config, context);
    return {
      text: shaped.text,
      category,
      mode: 'informational',
      followUp: shaped.followUp,
      personalityConfig: config,
    };
  }
  
  // Handle navigation requests
  if (lowerQuestion.includes('show me') || lowerQuestion.includes('go to') || lowerQuestion.includes('navigate')) {
    let destination = '';
    let path = '';
    
    if (lowerQuestion.includes('analytics') || lowerQuestion.includes('dashboard')) {
      destination = 'Analytics Dashboard';
      path = '/terminal/analytics';
    } else if (lowerQuestion.includes('hydra')) {
      destination = 'Hydra Console';
      path = '/terminal/hydra';
    } else if (lowerQuestion.includes('whale')) {
      destination = 'Whale Intelligence';
      path = '/whale-intelligence';
    }else if (lowerQuestion.includes('constellation') || lowerQuestion.includes('graph')) {
      destination = 'Constellation Graph';
      path = '/terminal/constellation';
    } else if (lowerQuestion.includes('map') || lowerQuestion.includes('anomaly')) {
      destination = 'Threat Map';
      path = '/threat-map';
    }
    
    if (destination) {
      const baseResponse = `I'll take you to the ${destination}. You can find it in the terminal sidebar, or I can navigate there for you.`;
      const shaped = shapeResponse(baseResponse, config, context);
      return {
        text: shaped.text,
        category,
        mode: 'navigation',
        suggestedActions: [`Navigate to ${path}`],
        followUp: shaped.followUp,
        personalityConfig: config,
      };
    }
  }
  
  // Handle risk/score queries
  if (lowerQuestion.includes('risk') && (lowerQuestion.includes('score') || lowerQuestion.includes('explain'))) {
    const baseResponse = config.depth === 'beginner'
      ? 'Risk scores go from 0 to 100. Under 30 is safe (green light), 30-60 is worth watching (yellow light), 60-80 needs attention (orange), and above 80 is a red flag. The score combines transaction patterns, connections, and known threat indicators.'
      : 'Risk scores in GhostQuant range from 0 to 100. Scores below 30 indicate low risk, 30-60 is moderate risk, 60-80 is high risk, and above 80 is critical. These scores are calculated based on behavioral patterns, transaction history, entity connections, and known threat indicators using ensemble ML models.';
    const shaped = shapeResponse(baseResponse, config, context);
    return {
      text: shaped.text,
      category: 'general',
      mode: 'explanation',
      followUp: shaped.followUp,
      personalityConfig: config,
    };
  }
  
  // Handle summarization requests
  if (lowerQuestion.includes('summarize') || lowerQuestion.includes('summary')) {
    if (lowerQuestion.includes('whale')) {
      const baseResponse = config.depth === 'beginner'
        ? 'The big players are active today - we\'re seeing more movement than usual. Several large wallets are accumulating, which often signals they expect prices to rise. Three groups of connected whales are moving together, which we\'re watching closely.'
        : 'Based on current intelligence, whale activity is elevated with several large holders showing accumulation patterns. Net flows are slightly positive, indicating more capital entering than leaving major assets. Three whale clusters are showing coordinated movement patterns that warrant monitoring.';
      const shaped = shapeResponse(baseResponse, config, context);
      return {
        text: shaped.text,
        category: 'whales',
        mode: 'informational',
        followUp: shaped.followUp,
        personalityConfig: config,
      };
    }
    
    const baseResponse = config.depth === 'beginner'
      ? 'Overall, the market looks okay with some areas to watch. Our threat detection found some suspicious activity in smaller coins. Big players are more active than usual. Check the Analytics Dashboard for the full picture.'
      : 'Current market intelligence shows moderate overall risk with localized high-risk zones. Hydra has detected several manipulation patterns in smaller cap assets. Whale activity is above average. The Analytics Dashboard has the full breakdown of current metrics.';
    const shaped = shapeResponse(baseResponse, config, context);
    return {
      text: shaped.text,
      category: 'analytics',
      mode: 'informational',
      suggestedActions: ['View Analytics Dashboard'],
      followUp: shaped.followUp,
      personalityConfig: config,
    };
  }
  
  // Handle help/confused requests with extra support
  if (lowerQuestion.includes('help') || lowerQuestion.includes('confused') || lowerQuestion.includes('lost')) {
    const contextTemplate = CONTEXT_TEMPLATES[context.currentPath];
    let baseResponse = '';
    
    if (contextTemplate) {
      baseResponse = `No worries, I've got you! ${contextTemplate.description} The key things to focus on here are: ${contextTemplate.elements.slice(0, 3).join(', ')}. What would you like to know more about?`;
    } else {
      baseResponse = 'No worries, I\'m here to help! GhostQuant has several tools: Hydra for threat detection, Constellation for entity mapping, Analytics for market overview, and Whale Intelligence for tracking big players. Where would you like to start?';
    }
    
    const shaped = shapeResponse(baseResponse, config, context);
    return {
      text: shaped.text,
      category: 'general',
      mode: 'informational',
      suggestedActions: ['View Analytics Dashboard', 'Explore Hydra Console'],
      followUp: shaped.followUp,
      personalityConfig: config,
    };
  }
  
  // Default response based on category with personality
  const description = getDescriptionForDepth(category, config.depth);
  const shaped = shapeResponse(description, config, context);
  return {
    text: shaped.text,
    category,
    mode: 'informational',
    contextSummary: generateContextResponse(context, config),
    followUp: shaped.followUp,
    personalityConfig: config,
  };
}

// Generate greeting based on context with personality
export function generateGreeting(context: CopilotContextState): string {
  return generatePersonalizedGreeting(context);
}

// ============================================
// COGNITIVE ENGINE ORCHESTRATION PIPELINE
// ============================================

/**
 * Internal context state for the cognitive engine
 */
let cognitiveContextState: ContextState = createInitialContextState();

/**
 * Convert CopilotContextState to ContextState for the cognitive engine
 */
function convertToContextState(context: CopilotContextState): ContextState {
  // Update the cognitive context with the current page
  if (context.currentPath) {
    cognitiveContextState = updatePageContext(cognitiveContextState, context.currentPath);
  }
  
  // Update selected entity if available
  if (context.selectedAddress) {
    cognitiveContextState = {
      ...cognitiveContextState,
      selectedEntity: {
        type: 'wallet',
        id: context.selectedAddress,
        label: context.selectedAddress.slice(0, 10) + '...',
        riskScore: context.lastRiskScore ?? undefined,
      },
    };
  }
  
  return cognitiveContextState;
}

/**
 * Map PersonalityConfig depth to KnowledgeDepth
 */
function mapDepthToKnowledge(depth: string): KnowledgeDepth {
  switch (depth) {
    case 'beginner':
      return 'simple';
    case 'expert':
    case 'advanced':
      return 'technical';
    default:
      return 'standard';
  }
}

/**
 * Full Cognitive Engine Pipeline
 * 
 * Pipeline: Answer = ToneEngine(Personality(KnowledgeBase(Intent(Context))))
 * 
 * Steps:
 * 1. Capture user's voice → converts to text (handled by STT engine)
 * 2. Pass text to Intent Model
 * 3. Add Context clues via Context Engine
 * 4. Knowledge Base generates skeleton answer
 * 5. Personality Engine shapes answer
 * 6. Tone Engine transforms voice style
 * 7. Error Recovery invoked if needed
 * 8. Output final text
 * 9. Pass to TTS voice output (handled by TTS engine)
 */
export function processWithCognitiveEngine(
  question: string,
  context: CopilotContextState,
  userId: string = 'default'
): CopilotAnswer {
  // Record the question for analytics
  recordQuestion(userId);
  
  // Step 1: Convert context to cognitive engine format
  const cognitiveContext = convertToContextState(context);
  
  // Step 2: Intent Recognition
  const intent = recognizeIntent(question, context.currentPath);
  
  // Step 3: Extract context clues
  const contextClues = extractContextClues(cognitiveContext);
  
  // Step 4: Generate personality configuration
  const personalityConfig = generatePersonalityConfig(question, context);
  
  // Step 5: Create tone context and select tone
  const toneContext = createToneContext(question, intent, context.currentPath, undefined);
  const toneConfig = selectTone(toneContext);
  
  // Step 6: Get user preferences for depth
  const userPrefs = getUserPreferences(userId);
  const knowledgeDepth = mapDepthToKnowledge(personalityConfig.depth);
  
  // Step 7: Query knowledge base based on intent
  let skeletonAnswer = '';
  
  // Check if this is a demo request
  if (intent.category === 'summary' && question.toLowerCase().includes('demo')) {
    const demoScript = getFullDemoScript('investor_demo_3min');
    if (demoScript) {
      skeletonAnswer = demoScript;
    }
  }
  
  // If no demo, query knowledge base
  if (!skeletonAnswer) {
    // Extract action keywords from entities
    const actionEntities = intent.extractedEntities.filter(e => e.type === 'action');
    const keywords = actionEntities.length > 0 ? actionEntities.map(e => e.value) : [];
    
    const knowledgeQuery = queryKnowledge({
      keywords,
      category: intent.category as any,
      pageContext: context.currentPath,
      depth: knowledgeDepth,
    });
    
    if (knowledgeQuery.length > 0) {
      // queryKnowledge returns { entry, response } objects
      skeletonAnswer = knowledgeQuery[0].response;
    } else {
      // Try searching by the question itself
      const searchResults = searchKnowledge(question.split(' '), knowledgeDepth);
      if (searchResults.length > 0) {
        skeletonAnswer = getKnowledgeResponse(searchResults[0], knowledgeDepth);
      }
    }
  }
  
  // Step 8: If no knowledge found, check training dataset
  if (!skeletonAnswer) {
    const trainingExamples = searchExamples(question);
    if (trainingExamples.length > 0) {
      skeletonAnswer = trainingExamples[0].expectedResponse;
    }
  }
  
  // Step 9: If still no answer, use error recovery
  if (!skeletonAnswer) {
    const recovery = getRecoveryResponse(
      isVagueQuery(question) ? 'vague_question' : 'unclear_intent',
      cognitiveContext,
      { intent }
    );
    skeletonAnswer = formatRecoveryResponse(recovery, {
      addEncouragement: true,
      addExploration: true,
    });
  }
  
  // Step 10: Shape response with personality
  const shapedResponse = shapeResponse(skeletonAnswer, personalityConfig, context);
  
  // Step 11: Transform with tone engine
  let finalText = transformResponse(shapedResponse.text, toneConfig);
  
  // Step 12: Ensure response is not robotic
  if (isRoboticResponse(finalText)) {
    finalText = humanizeResponse(finalText, cognitiveContext);
  }
  
  // Step 13: Check for user confusion and offer proactive help
  if (detectUserConfusion(cognitiveContext)) {
    finalText = getProactiveHelp(cognitiveContext) + ' ' + finalText;
  }
  
  // Determine category from intent
  const categoryMap: Record<string, CopilotAnswer['category']> = {
    'hydra': 'hydra',
    'constellation': 'constellation',
    'ecoscan': 'ecoscan',
    'risk_score': 'general',
    'whale_intel': 'whales',
    'dashboard': 'analytics',
    'beginner_mode': 'general',
    'advanced_mode': 'general',
    'summary': 'analytics',
    'navigation': 'general',
    'vague_recovery': 'general',
    'contextual': 'general',
    'greeting': 'general',
    'help': 'onboarding',
  };
  
  const category = categoryMap[intent.category] || 'general';
  
  // Get suggested questions for follow-up
  const suggestedQuestions = getSuggestedQuestions(cognitiveContext);
  
  return {
    text: finalText,
    category,
    contextSummary: getContextDescription(cognitiveContext),
    suggestedActions: suggestedQuestions.slice(0, 3),
    mode: isNavigationRequest(question) ? 'navigation' : 'explanation',
    followUp: shapedResponse.followUp,
    personalityConfig,
  };
}

/**
 * Get welcome message based on user type
 */
export function getWelcomeMessage(userType: UserType = 'new'): string {
  return getWelcomeScript(userType);
}

/**
 * Get hover hint for UI element
 */
export function getUIHoverHint(elementType: string): string {
  return getHoverHint(elementType);
}

/**
 * Get guidance prompt for user
 */
export function getUIGuidancePrompt(): string {
  return getGuidancePrompt();
}

/**
 * Get encouraging prompt
 */
export function getUIEncouragingPrompt(): string {
  return getEncouragingPrompt();
}

/**
 * Record user feedback on response
 */
export function recordResponseFeedback(userId: string, wasHelpful: boolean): void {
  recordFeedback(userId, wasHelpful);
}

/**
 * Get investor demo script
 */
export function getInvestorDemoScript(scriptId: string = 'investor_demo_3min'): string {
  return getFullDemoScript(scriptId);
}

// Export for use in provider
export default {
  processQuestion,
  processWithCognitiveEngine,
  generateGreeting,
  getWelcomeMessage,
  getUIHoverHint,
  getUIGuidancePrompt,
  getUIEncouragingPrompt,
  recordResponseFeedback,
  getInvestorDemoScript,
};
