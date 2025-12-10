/**
 * CopilotUIResponses - UI Dialogue Pack and Investor Demo Scripts
 * 
 * Contains:
 * - Hover hints
 * - Encouraging prompts
 * - Clarifying prompts
 * - Error-recovery prompts
 * - Guidance prompts
 * - Micro-interactions
 * - Modal interaction lines
 * - Welcome scripts (new user, returning user, investor, casual user)
 * - 3-minute professional GhostQuant demo script
 * - Feature-specific demo scripts
 */

// ============================================
// TYPES
// ============================================

export type UserType = 'new' | 'returning' | 'investor' | 'casual' | 'expert';
export type InteractionContext = 'hover' | 'click' | 'focus' | 'blur' | 'scroll' | 'idle';

export interface UIResponse {
  id: string;
  text: string;
  context?: string;
  userType?: UserType[];
  priority?: number;
}

export interface DemoScript {
  id: string;
  title: string;
  duration: string;
  sections: DemoSection[];
}

export interface DemoSection {
  id: string;
  title: string;
  duration: string;
  script: string;
  visualCues?: string[];
  transitionTo?: string;
}

// ============================================
// HOVER HINTS
// ============================================

export const HOVER_HINTS: Record<string, UIResponse[]> = {
  risk_score: [
    { id: 'risk_hover_1', text: 'This score shows overall risk level. Tap for details.' },
    { id: 'risk_hover_2', text: 'Risk scores range from 0 (safe) to 100 (critical).' },
    { id: 'risk_hover_3', text: 'Click to see what factors contribute to this score.' },
  ],
  confidence_score: [
    { id: 'conf_hover_1', text: 'Confidence shows how certain we are about this detection.' },
    { id: 'conf_hover_2', text: 'Higher confidence means stronger evidence.' },
    { id: 'conf_hover_3', text: 'Above 80% is high confidence, 50-80% warrants attention.' },
  ],
  entity_node: [
    { id: 'entity_hover_1', text: 'This represents a wallet or entity. Click to explore.' },
    { id: 'entity_hover_2', text: 'Node size indicates transaction volume.' },
    { id: 'entity_hover_3', text: 'Color shows risk level - green is safe, red is high risk.' },
  ],
  connection_edge: [
    { id: 'edge_hover_1', text: 'This line shows a connection between entities.' },
    { id: 'edge_hover_2', text: 'Thicker lines mean stronger relationships.' },
    { id: 'edge_hover_3', text: 'Click to see transaction details.' },
  ],
  alert_item: [
    { id: 'alert_hover_1', text: 'This alert was triggered by our detection system.' },
    { id: 'alert_hover_2', text: 'Click to see full details and recommended actions.' },
    { id: 'alert_hover_3', text: 'Red alerts are high priority, yellow are warnings.' },
  ],
  whale_indicator: [
    { id: 'whale_hover_1', text: 'This indicates whale activity - large holder movement.' },
    { id: 'whale_hover_2', text: 'Whale movements can signal market shifts.' },
    { id: 'whale_hover_3', text: 'Click to see the whale\'s full profile.' },
  ],
  chart_element: [
    { id: 'chart_hover_1', text: 'Hover over data points for specific values.' },
    { id: 'chart_hover_2', text: 'Click and drag to zoom into a time range.' },
    { id: 'chart_hover_3', text: 'Double-click to reset the view.' },
  ],
};

// ============================================
// ENCOURAGING PROMPTS
// ============================================

export const ENCOURAGING_PROMPTS: UIResponse[] = [
  { id: 'enc_1', text: 'Great question! Let me help you with that.' },
  { id: 'enc_2', text: 'You\'re exploring the right areas. Here\'s what I found.' },
  { id: 'enc_3', text: 'Good thinking! This is an important feature to understand.' },
  { id: 'enc_4', text: 'Excellent observation. Let me explain further.' },
  { id: 'enc_5', text: 'You\'re getting the hang of this! Here\'s more detail.' },
  { id: 'enc_6', text: 'That\'s exactly the right question to ask.' },
  { id: 'enc_7', text: 'You\'re on the right track. Let me clarify.' },
  { id: 'enc_8', text: 'Smart move checking this. Here\'s what you need to know.' },
  { id: 'enc_9', text: 'You\'re asking the questions that matter. Here\'s the answer.' },
  { id: 'enc_10', text: 'Great instinct! This is worth understanding deeply.' },
];

// ============================================
// CLARIFYING PROMPTS
// ============================================

export const CLARIFYING_PROMPTS: UIResponse[] = [
  { id: 'clar_1', text: 'Just to make sure I help you correctly - are you asking about {topic_a} or {topic_b}?' },
  { id: 'clar_2', text: 'I want to give you the best answer. Could you tell me more about what you\'re looking for?' },
  { id: 'clar_3', text: 'I can help with a few things here. Which aspect interests you most?' },
  { id: 'clar_4', text: 'Let me make sure I understand - you want to know about {topic}, right?' },
  { id: 'clar_5', text: 'There are several ways I can help. What would be most useful?' },
  { id: 'clar_6', text: 'I see a few possibilities. Are you interested in {option_a}, {option_b}, or something else?' },
  { id: 'clar_7', text: 'To give you the most relevant information, could you specify which part?' },
  { id: 'clar_8', text: 'I\'d love to help! Are you looking for a quick overview or detailed explanation?' },
];

// ============================================
// ERROR RECOVERY PROMPTS
// ============================================

export const ERROR_RECOVERY_PROMPTS: UIResponse[] = [
  { id: 'err_1', text: 'Let me try a different approach to help you with that.' },
  { id: 'err_2', text: 'I\'ll find another way to get you that information.' },
  { id: 'err_3', text: 'No worries - let\'s tackle this from a different angle.' },
  { id: 'err_4', text: 'I hit a small snag, but I can still help. What would you like to know?' },
  { id: 'err_5', text: 'Let me work around that and get you an answer.' },
  { id: 'err_6', text: 'That didn\'t work as expected, but I\'ve got other ways to help.' },
  { id: 'err_7', text: 'Small hiccup on my end - let me try something else.' },
  { id: 'err_8', text: 'I\'ll approach this differently to get you what you need.' },
];

// ============================================
// GUIDANCE PROMPTS
// ============================================

export const GUIDANCE_PROMPTS: UIResponse[] = [
  { id: 'guide_1', text: 'Try clicking on any entity to see its detailed profile.' },
  { id: 'guide_2', text: 'You can use the search bar to find specific wallets or assets.' },
  { id: 'guide_3', text: 'The sidebar has quick access to all major features.' },
  { id: 'guide_4', text: 'Hover over any metric to see what it means.' },
  { id: 'guide_5', text: 'Use the filters to narrow down what you\'re looking at.' },
  { id: 'guide_6', text: 'The timeline at the bottom lets you explore historical data.' },
  { id: 'guide_7', text: 'Click the export button to save this data for your records.' },
  { id: 'guide_8', text: 'The legend explains what each color and symbol means.' },
  { id: 'guide_9', text: 'You can zoom in on the graph by scrolling or pinching.' },
  { id: 'guide_10', text: 'Double-click any node to center the view on it.' },
];

// ============================================
// MICRO-INTERACTIONS
// ============================================

export const MICRO_INTERACTIONS: Record<InteractionContext, UIResponse[]> = {
  hover: [
    { id: 'micro_hover_1', text: 'Click to explore' },
    { id: 'micro_hover_2', text: 'Tap for details' },
    { id: 'micro_hover_3', text: 'Select to expand' },
  ],
  click: [
    { id: 'micro_click_1', text: 'Loading details...' },
    { id: 'micro_click_2', text: 'Expanding view...' },
    { id: 'micro_click_3', text: 'Fetching data...' },
  ],
  focus: [
    { id: 'micro_focus_1', text: 'Ready for input' },
    { id: 'micro_focus_2', text: 'Type to search' },
    { id: 'micro_focus_3', text: 'Enter address or keyword' },
  ],
  blur: [
    { id: 'micro_blur_1', text: 'Search saved' },
    { id: 'micro_blur_2', text: 'Input recorded' },
  ],
  scroll: [
    { id: 'micro_scroll_1', text: 'Scroll for more' },
    { id: 'micro_scroll_2', text: 'More items below' },
  ],
  idle: [
    { id: 'micro_idle_1', text: 'Need help? Just ask!' },
    { id: 'micro_idle_2', text: 'I\'m here if you have questions.' },
    { id: 'micro_idle_3', text: 'Explore or ask me anything.' },
  ],
};

// ============================================
// MODAL INTERACTION LINES
// ============================================

export const MODAL_INTERACTIONS: Record<string, UIResponse[]> = {
  open: [
    { id: 'modal_open_1', text: 'Here\'s the detailed view you requested.' },
    { id: 'modal_open_2', text: 'Let me show you the full picture.' },
    { id: 'modal_open_3', text: 'Expanding for more details.' },
  ],
  close: [
    { id: 'modal_close_1', text: 'Closing detail view.' },
    { id: 'modal_close_2', text: 'Returning to main view.' },
    { id: 'modal_close_3', text: 'Back to overview.' },
  ],
  confirm: [
    { id: 'modal_confirm_1', text: 'Got it! Processing your request.' },
    { id: 'modal_confirm_2', text: 'Confirmed. Making it happen.' },
    { id: 'modal_confirm_3', text: 'Done! Changes applied.' },
  ],
  cancel: [
    { id: 'modal_cancel_1', text: 'No problem, cancelled.' },
    { id: 'modal_cancel_2', text: 'Action cancelled. No changes made.' },
    { id: 'modal_cancel_3', text: 'Understood. Nothing changed.' },
  ],
};

// ============================================
// WELCOME SCRIPTS
// ============================================

export const WELCOME_SCRIPTS: Record<UserType, UIResponse[]> = {
  new: [
    {
      id: 'welcome_new_1',
      text: 'Welcome to GhostQuant! I\'m your Voice Copilot, here to help you navigate crypto intelligence. Would you like a quick tour?',
      priority: 1,
    },
    {
      id: 'welcome_new_2',
      text: 'Hello! First time here? GhostQuant helps you understand crypto markets with threat detection, entity mapping, and whale tracking. Where would you like to start?',
      priority: 2,
    },
    {
      id: 'welcome_new_3',
      text: 'Welcome aboard! I can help you explore GhostQuant\'s features. The Analytics Dashboard is a great starting point - want me to show you around?',
      priority: 3,
    },
  ],
  returning: [
    {
      id: 'welcome_return_1',
      text: 'Welcome back! Ready to dive into the latest market intelligence?',
      priority: 1,
    },
    {
      id: 'welcome_return_2',
      text: 'Good to see you again! There have been some interesting developments since your last visit. Want a quick update?',
      priority: 2,
    },
    {
      id: 'welcome_return_3',
      text: 'Hey there! Back for more insights? Let me know what you\'d like to explore today.',
      priority: 3,
    },
  ],
  investor: [
    {
      id: 'welcome_investor_1',
      text: 'Welcome to GhostQuant. I\'m prepared to walk you through our institutional-grade crypto intelligence platform. Shall we begin with an overview?',
      priority: 1,
    },
    {
      id: 'welcome_investor_2',
      text: 'Good to have you here. GhostQuant provides the market intelligence that institutions need. I can demonstrate our key capabilities whenever you\'re ready.',
      priority: 2,
    },
    {
      id: 'welcome_investor_3',
      text: 'Welcome. Our platform combines threat detection, entity analysis, and whale tracking into one comprehensive solution. Would you like the executive summary or a detailed walkthrough?',
      priority: 3,
    },
  ],
  casual: [
    {
      id: 'welcome_casual_1',
      text: 'Hey! Welcome to GhostQuant. I\'m here to help you understand what\'s happening in crypto. What are you curious about?',
      priority: 1,
    },
    {
      id: 'welcome_casual_2',
      text: 'Hi there! Ready to explore some crypto intelligence? Just ask me anything or click around - I\'ll explain what you\'re seeing.',
      priority: 2,
    },
    {
      id: 'welcome_casual_3',
      text: 'Welcome! Think of me as your crypto guide. I can explain anything you see here in plain terms. What catches your eye?',
      priority: 3,
    },
  ],
  expert: [
    {
      id: 'welcome_expert_1',
      text: 'Welcome to GhostQuant. Full technical documentation is available, or I can provide detailed explanations of any system. What would you like to explore?',
      priority: 1,
    },
    {
      id: 'welcome_expert_2',
      text: 'Good to have you. Our multi-head detection architecture, entity fusion engine, and whale intelligence systems are all accessible. Where shall we start?',
      priority: 2,
    },
    {
      id: 'welcome_expert_3',
      text: 'Welcome. I can provide technical deep-dives on any component - from our ML models to our graph analysis algorithms. What interests you?',
      priority: 3,
    },
  ],
};

// ============================================
// INVESTOR DEMO SCRIPTS
// ============================================

export const INVESTOR_DEMO_FULL: DemoScript = {
  id: 'investor_demo_3min',
  title: 'GhostQuant 3-Minute Executive Demo',
  duration: '3 minutes',
  sections: [
    {
      id: 'intro',
      title: 'Introduction',
      duration: '20 seconds',
      script: `Welcome to GhostQuant - the Bloomberg Terminal for crypto intelligence. In the next three minutes, I'll show you how we help institutions navigate cryptocurrency markets with confidence. Our platform combines real-time threat detection, entity relationship mapping, and whale movement tracking into one comprehensive solution.`,
      visualCues: ['Show main dashboard', 'Highlight key metrics'],
      transitionTo: 'hydra_demo',
    },
    {
      id: 'hydra_demo',
      title: 'Hydra Threat Detection',
      duration: '45 seconds',
      script: `This is Hydra, our flagship threat detection engine. Unlike single-focus tools, Hydra uses multiple detection "heads" running in parallel - each specialized for different manipulation patterns like wash trading, spoofing, and pump-and-dump schemes. When multiple heads flag the same activity, confidence increases. We've validated our detection against known manipulation events with over 90% precision at high-confidence thresholds. This means when we flag something, it's almost certainly real.`,
      visualCues: ['Navigate to Hydra Console', 'Show detection heads', 'Highlight confidence scores', 'Show sample alert'],
      transitionTo: 'constellation_demo',
    },
    {
      id: 'constellation_demo',
      title: 'Constellation Entity Mapping',
      duration: '45 seconds',
      script: `Constellation is our entity fusion engine. It reveals the hidden network of relationships in crypto markets. Watch as we map connections between wallets - even when bad actors try to hide their tracks using multiple addresses. Our graph analysis identifies entity clusters, showing which wallets are likely controlled by the same person or organization. Risk propagates through these connections, so you can see not just direct risks, but exposure through relationships.`,
      visualCues: ['Navigate to Constellation', 'Show entity graph', 'Highlight cluster', 'Demonstrate risk propagation'],
      transitionTo: 'whale_demo',
    },
    {
      id: 'whale_demo',
      title: 'Whale Intelligence',
      duration: '40 seconds',
      script: `Whale movements often precede major market shifts. Our Whale Intelligence system tracks large holders across multiple chains, identifying accumulation and distribution patterns before they impact prices. When a whale moves, you'll know about it. We also maintain WIDB - our Whale Intelligence Database - with profiles on thousands of known entities, including risk scores and behavioral fingerprints.`,
      visualCues: ['Navigate to Whale Intelligence', 'Show whale list', 'Highlight movement alert', 'Show entity profile'],
      transitionTo: 'analytics_demo',
    },
    {
      id: 'analytics_demo',
      title: 'Analytics Dashboard',
      duration: '30 seconds',
      script: `The Analytics Dashboard brings it all together. Real-time risk indices, whale activity metrics, and AI-generated market narratives - all in one view. Compliance teams use this for instant due diligence. Traders use it for market timing. Fund managers use it for portfolio risk assessment.`,
      visualCues: ['Navigate to Analytics', 'Show risk index', 'Highlight anomaly feed', 'Show market narrative'],
      transitionTo: 'closing',
    },
    {
      id: 'closing',
      title: 'Closing',
      duration: '20 seconds',
      script: `GhostQuant gives institutions the intelligence edge they need in crypto markets. Our clients include crypto funds, compliance teams, and sophisticated traders managing billions in assets. I'd be happy to dive deeper into any feature or discuss how GhostQuant can address your specific needs.`,
      visualCues: ['Return to main dashboard', 'Show contact information'],
    },
  ],
};

export const HYDRA_DEMO: DemoScript = {
  id: 'hydra_demo_detailed',
  title: 'Hydra Threat Detection Deep Dive',
  duration: '2 minutes',
  sections: [
    {
      id: 'hydra_intro',
      title: 'Introduction to Hydra',
      duration: '30 seconds',
      script: `Hydra is named after the mythological creature with multiple heads - and for good reason. Our detection engine runs multiple specialized analysis streams simultaneously, each trained to identify specific manipulation patterns. This multi-head architecture catches threats that single-focus tools miss.`,
      visualCues: ['Show Hydra Console', 'Highlight detection heads panel'],
    },
    {
      id: 'hydra_heads',
      title: 'Detection Heads Explained',
      duration: '45 seconds',
      script: `Each detection head is an expert in its domain. The wash trading head analyzes circular transaction patterns and self-dealing signatures. The spoofing head monitors order book dynamics and cancellation rates. The pump-dump head tracks volume anomalies correlated with social signals. When multiple heads agree, we have high confidence in our detection.`,
      visualCues: ['Show individual head details', 'Demonstrate head activation'],
    },
    {
      id: 'hydra_confidence',
      title: 'Confidence Scoring',
      duration: '30 seconds',
      script: `Our confidence scores aren't arbitrary. They're computed using ensemble methods, calibrated against historical manipulation events. Above 80% is high confidence - when we flag something at this level, it's almost certainly real. 50-80% warrants attention. Below 50% are early warnings worth monitoring.`,
      visualCues: ['Show confidence score breakdown', 'Highlight threshold indicators'],
    },
    {
      id: 'hydra_action',
      title: 'Taking Action',
      duration: '15 seconds',
      script: `When Hydra detects a threat, you get actionable intelligence - not just an alert. We show you the evidence, the entities involved, and recommended actions. You can drill down into any detection for full details.`,
      visualCues: ['Show alert details', 'Demonstrate drill-down'],
    },
  ],
};

export const CONSTELLATION_DEMO: DemoScript = {
  id: 'constellation_demo_detailed',
  title: 'Constellation Entity Mapping Deep Dive',
  duration: '2 minutes',
  sections: [
    {
      id: 'const_intro',
      title: 'Introduction to Constellation',
      duration: '30 seconds',
      script: `Constellation reveals what's hidden in plain sight. Crypto transactions are public, but understanding who controls what - that's where the real intelligence lies. Our entity fusion engine maps relationships across wallets, exchanges, and entities, exposing coordinated behavior that would otherwise be invisible.`,
      visualCues: ['Show Constellation graph', 'Highlight entity clusters'],
    },
    {
      id: 'const_clustering',
      title: 'Entity Clustering',
      duration: '40 seconds',
      script: `Our clustering algorithm identifies wallets that are likely controlled by the same entity. We analyze transaction patterns, timing correlations, and behavioral fingerprints. Even when someone uses dozens of wallets to hide their activity, Constellation can often link them together.`,
      visualCues: ['Demonstrate cluster selection', 'Show behavioral similarity indicators'],
    },
    {
      id: 'const_risk',
      title: 'Risk Propagation',
      duration: '30 seconds',
      script: `Risk doesn't exist in isolation. When one entity is flagged as high-risk, that risk propagates through connections. Constellation shows you not just direct risks, but your exposure through relationships. An entity might look clean individually but have dangerous connections.`,
      visualCues: ['Show risk propagation animation', 'Highlight connection strengths'],
    },
    {
      id: 'const_explore',
      title: 'Exploration',
      duration: '20 seconds',
      script: `Click any node to see its full profile. Drag to explore the network. Zoom in on areas of interest. The graph is fully interactive, letting you follow the money wherever it leads.`,
      visualCues: ['Demonstrate interactive features', 'Show node profile'],
    },
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get random response from array
 */
export function getRandomResponse(responses: UIResponse[]): UIResponse {
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Get hover hint for element type
 */
export function getHoverHint(elementType: string): string {
  const hints = HOVER_HINTS[elementType];
  if (!hints || hints.length === 0) {
    return 'Click to learn more.';
  }
  return getRandomResponse(hints).text;
}

/**
 * Get encouraging prompt
 */
export function getEncouragingPrompt(): string {
  return getRandomResponse(ENCOURAGING_PROMPTS).text;
}

/**
 * Get clarifying prompt with topic substitution
 */
export function getClarifyingPrompt(topicA?: string, topicB?: string): string {
  const prompt = getRandomResponse(CLARIFYING_PROMPTS).text;
  let result = prompt;
  if (topicA) result = result.replace('{topic_a}', topicA).replace('{topic}', topicA);
  if (topicB) result = result.replace('{topic_b}', topicB);
  if (topicA && topicB) result = result.replace('{option_a}', topicA).replace('{option_b}', topicB);
  return result;
}

/**
 * Get error recovery prompt
 */
export function getErrorRecoveryPrompt(): string {
  return getRandomResponse(ERROR_RECOVERY_PROMPTS).text;
}

/**
 * Get guidance prompt
 */
export function getGuidancePrompt(): string {
  return getRandomResponse(GUIDANCE_PROMPTS).text;
}

/**
 * Get micro-interaction text
 */
export function getMicroInteraction(context: InteractionContext): string {
  const interactions = MICRO_INTERACTIONS[context];
  if (!interactions || interactions.length === 0) {
    return '';
  }
  return getRandomResponse(interactions).text;
}

/**
 * Get modal interaction text
 */
export function getModalInteraction(action: 'open' | 'close' | 'confirm' | 'cancel'): string {
  const interactions = MODAL_INTERACTIONS[action];
  if (!interactions || interactions.length === 0) {
    return '';
  }
  return getRandomResponse(interactions).text;
}

/**
 * Get welcome script for user type
 */
export function getWelcomeScript(userType: UserType): string {
  const scripts = WELCOME_SCRIPTS[userType];
  if (!scripts || scripts.length === 0) {
    return 'Welcome to GhostQuant!';
  }
  // Sort by priority and get highest priority
  const sorted = [...scripts].sort((a, b) => (a.priority || 99) - (b.priority || 99));
  return sorted[0].text;
}

/**
 * Get demo script by ID
 */
export function getDemoScript(scriptId: string): DemoScript | undefined {
  const scripts: Record<string, DemoScript> = {
    'investor_demo_3min': INVESTOR_DEMO_FULL,
    'hydra_demo_detailed': HYDRA_DEMO,
    'constellation_demo_detailed': CONSTELLATION_DEMO,
  };
  return scripts[scriptId];
}

/**
 * Get demo section script
 */
export function getDemoSectionScript(scriptId: string, sectionId: string): string | undefined {
  const demo = getDemoScript(scriptId);
  if (!demo) return undefined;
  
  const section = demo.sections.find(s => s.id === sectionId);
  return section?.script;
}

/**
 * Get full demo script as single text
 */
export function getFullDemoScript(scriptId: string): string {
  const demo = getDemoScript(scriptId);
  if (!demo) return '';
  
  return demo.sections.map(s => s.script).join('\n\n');
}

/**
 * Get all available demo scripts
 */
export function getAvailableDemos(): { id: string; title: string; duration: string }[] {
  return [
    { id: 'investor_demo_3min', title: INVESTOR_DEMO_FULL.title, duration: INVESTOR_DEMO_FULL.duration },
    { id: 'hydra_demo_detailed', title: HYDRA_DEMO.title, duration: HYDRA_DEMO.duration },
    { id: 'constellation_demo_detailed', title: CONSTELLATION_DEMO.title, duration: CONSTELLATION_DEMO.duration },
  ];
}

// Export all response collections
export const ALL_UI_RESPONSES = {
  HOVER_HINTS,
  ENCOURAGING_PROMPTS,
  CLARIFYING_PROMPTS,
  ERROR_RECOVERY_PROMPTS,
  GUIDANCE_PROMPTS,
  MICRO_INTERACTIONS,
  MODAL_INTERACTIONS,
  WELCOME_SCRIPTS,
};

export const ALL_DEMO_SCRIPTS = {
  INVESTOR_DEMO_FULL,
  HYDRA_DEMO,
  CONSTELLATION_DEMO,
};
