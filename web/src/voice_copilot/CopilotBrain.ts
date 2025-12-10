/**
 * CopilotBrain - The intelligence layer for GhostQuant Voice Copilot
 * Contains GhostQuant-specific knowledge and generates natural language responses
 */

import { CopilotContextState } from './CopilotContext';

export interface CopilotAnswer {
  text: string;
  category: 'hydra' | 'constellation' | 'analytics' | 'whales' | 'widb' | 'demo' | 'ecoscan' | 'onboarding' | 'investor' | 'general';
  contextSummary?: string;
  suggestedActions?: string[];
  mode: 'informational' | 'navigation' | 'explanation';
}

// GhostQuant Knowledge Base
const KNOWLEDGE_BASE = {
  hydra: {
    keywords: ['hydra', 'multi-head', 'detection', 'threat', 'heads', 'manipulation detection'],
    description: 'Hydra is GhostQuant\'s multi-head threat detection engine. It uses parallel analysis streams called "heads" to detect different types of market manipulation simultaneously. Each head specializes in a specific threat pattern like wash trading, spoofing, or coordinated pump-and-dump schemes.',
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
    features: [
      'Real-time threat detection',
      'Entity and wallet intelligence',
      'Market manipulation alerts',
      'Compliance and risk tools',
    ],
    investorPitch: 'GhostQuant is the Bloomberg Terminal for crypto intelligence. We help institutions navigate the complex and often opaque world of cryptocurrency markets with confidence.',
  },
};

// Context-aware response templates
const CONTEXT_TEMPLATES: Record<string, string> = {
  '/terminal/hydra': 'You\'re viewing the Hydra Console, our multi-head threat detection engine.',
  '/terminal/constellation': 'You\'re on the Constellation page, which shows entity relationships and cluster analysis.',
  '/terminal/analytics': 'You\'re viewing the Analytics Dashboard with real-time market intelligence.',
  '/terminal/whales': 'You\'re on the Whale Intelligence page, tracking large holder movements.',
  '/terminal/whale-intel': 'You\'re viewing the Whale Intelligence Database (WIDB) with entity profiles.',
  '/terminal/graph': 'You\'re on the Influence Graph, visualizing entity connections.',
  '/terminal/map': 'You\'re viewing the Global Threat Map with geographic risk distribution.',
  '/terminal/ghostmind': 'You\'re in the GhostMind AI Console for conversational intelligence.',
  '/terminal/predict': 'You\'re on the Prediction page for market forecasting.',
  '/terminal/entity': 'You\'re viewing entity details and risk profiles.',
};

// Investor presentation responses
const INVESTOR_RESPONSES: Record<string, string> = {
  briefing: `Here's your 30-second intelligence briefing: GhostQuant is currently monitoring elevated market activity with our Hydra engine detecting multiple coordination patterns. Whale movements are above average, with significant accumulation in major assets. Our Constellation engine has identified several new entity clusters that warrant attention. Overall market risk is moderate with localized high-risk zones in emerging DeFi protocols.`,
  
  explain: `GhostQuant is a next-generation crypto intelligence platform designed for institutional investors and compliance teams. We combine real-time blockchain analysis with advanced machine learning to detect market manipulation, track whale movements, and assess entity risk. Our platform processes millions of transactions daily, providing actionable intelligence that helps our clients make informed decisions and maintain regulatory compliance.`,
  
  hydraSimple: `Think of Hydra as a security system with multiple cameras, each watching for different types of suspicious activity. One camera watches for wash trading, another for spoofing, another for pump-and-dump schemes. When any camera detects something, Hydra alerts you immediately with a confidence score.`,
  
  constellationWalkthrough: `Constellation maps the hidden connections in crypto markets. Imagine a social network graph, but for wallets and entities. When you see a cluster light up, that means we've identified wallets that are likely controlled by the same entity or are coordinating their activity. This is crucial for detecting manipulation and understanding market dynamics.`,
};

// Classify the question category
function classifyQuestion(question: string): CopilotAnswer['category'] {
  const lowerQuestion = question.toLowerCase();
  
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

// Generate contextual response
function generateContextResponse(context: CopilotContextState): string {
  const template = CONTEXT_TEMPLATES[context.currentPath];
  if (template) {
    let response = template;
    
    if (context.selectedAddress) {
      response += ` You're currently examining address ${context.selectedAddress.slice(0, 10)}...`;
    }
    
    if (context.selectedClusterId) {
      response += ` Cluster ${context.selectedClusterId} is selected.`;
    }
    
    return response;
  }
  
  return 'You\'re using the GhostQuant Intelligence Terminal.';
}

// Main brain processing function
export function processQuestion(question: string, context: CopilotContextState): CopilotAnswer {
  const lowerQuestion = question.toLowerCase();
  const category = classifyQuestion(question);
  
  // Handle investor presentation queries
  if (lowerQuestion.includes('briefing') || lowerQuestion.includes('30 second') || lowerQuestion.includes('30-second')) {
    return {
      text: INVESTOR_RESPONSES.briefing,
      category: 'investor',
      mode: 'informational',
      suggestedActions: ['View Analytics Dashboard', 'Check Whale Activity'],
    };
  }
  
  if (lowerQuestion.includes('explain ghostquant to investor') || lowerQuestion.includes('explain to investor')) {
    return {
      text: INVESTOR_RESPONSES.explain,
      category: 'investor',
      mode: 'explanation',
    };
  }
  
  if (lowerQuestion.includes('hydra') && (lowerQuestion.includes('simple') || lowerQuestion.includes('explain'))) {
    return {
      text: INVESTOR_RESPONSES.hydraSimple,
      category: 'hydra',
      mode: 'explanation',
    };
  }
  
  if (lowerQuestion.includes('constellation') && (lowerQuestion.includes('walk') || lowerQuestion.includes('through'))) {
    return {
      text: INVESTOR_RESPONSES.constellationWalkthrough,
      category: 'constellation',
      mode: 'explanation',
    };
  }
  
  // Handle context-aware queries
  if (lowerQuestion.includes('this screen') || lowerQuestion.includes('this page') || 
      lowerQuestion.includes('where am i') || lowerQuestion.includes('what am i looking at')) {
    return {
      text: generateContextResponse(context),
      category: 'general',
      contextSummary: context.currentPath,
      mode: 'informational',
    };
  }
  
  // Handle "what does X do" queries
  if (lowerQuestion.includes('what does') || lowerQuestion.includes('what is') || lowerQuestion.includes('explain')) {
    const knowledge = KNOWLEDGE_BASE[category] || KNOWLEDGE_BASE.general;
    return {
      text: knowledge.description,
      category,
      mode: 'explanation',
      suggestedActions: knowledge.features.slice(0, 2),
    };
  }
  
  // Handle feature queries
  if (lowerQuestion.includes('feature') || lowerQuestion.includes('can it') || lowerQuestion.includes('capabilities')) {
    const knowledge = KNOWLEDGE_BASE[category] || KNOWLEDGE_BASE.general;
    const featureList = knowledge.features.join(', ');
    return {
      text: `Key features include: ${featureList}. Would you like me to explain any of these in detail?`,
      category,
      mode: 'informational',
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
      path = '/terminal/whales';
    } else if (lowerQuestion.includes('constellation') || lowerQuestion.includes('graph')) {
      destination = 'Constellation Graph';
      path = '/terminal/constellation';
    } else if (lowerQuestion.includes('map') || lowerQuestion.includes('anomaly')) {
      destination = 'Threat Map';
      path = '/terminal/map';
    }
    
    if (destination) {
      return {
        text: `I'll take you to the ${destination}. You can find it in the terminal sidebar, or I can navigate there for you.`,
        category,
        mode: 'navigation',
        suggestedActions: [`Navigate to ${path}`],
      };
    }
  }
  
  // Handle risk/score queries
  if (lowerQuestion.includes('risk') && (lowerQuestion.includes('score') || lowerQuestion.includes('explain'))) {
    return {
      text: 'Risk scores in GhostQuant range from 0 to 100. Scores below 30 indicate low risk, 30-60 is moderate risk, 60-80 is high risk, and above 80 is critical. These scores are calculated based on behavioral patterns, transaction history, entity connections, and known threat indicators.',
      category: 'general',
      mode: 'explanation',
    };
  }
  
  // Handle summarization requests
  if (lowerQuestion.includes('summarize') || lowerQuestion.includes('summary')) {
    if (lowerQuestion.includes('whale')) {
      return {
        text: 'Based on current intelligence, whale activity is elevated with several large holders showing accumulation patterns. Net flows are slightly positive, indicating more capital entering than leaving major assets. Three whale clusters are showing coordinated movement patterns that warrant monitoring.',
        category: 'whales',
        mode: 'informational',
      };
    }
    
    return {
      text: 'Current market intelligence shows moderate overall risk with localized high-risk zones. Hydra has detected several manipulation patterns in smaller cap assets. Whale activity is above average. The Analytics Dashboard has the full breakdown of current metrics.',
      category: 'analytics',
      mode: 'informational',
      suggestedActions: ['View Analytics Dashboard'],
    };
  }
  
  // Default response based on category
  const knowledge = KNOWLEDGE_BASE[category] || KNOWLEDGE_BASE.general;
  return {
    text: knowledge.description,
    category,
    mode: 'informational',
    contextSummary: generateContextResponse(context),
  };
}

// Generate greeting based on context
export function generateGreeting(context: CopilotContextState): string {
  const contextInfo = generateContextResponse(context);
  return `Hello! I'm your GhostQuant Voice Copilot. ${contextInfo} How can I help you today? You can ask me about any GhostQuant feature, request a briefing, or ask me to explain what you're looking at.`;
}

// Export for use in provider
export default {
  processQuestion,
  generateGreeting,
};
