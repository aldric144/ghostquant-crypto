/**
 * CopilotKnowledgeBase - Comprehensive GhostQuant Knowledge Repository
 * 
 * Contains ALL structured knowledge about GhostQuant systems:
 * - Hydra detection knowledge
 * - Constellation Fusion Engine knowledge
 * - EcoScan anomaly logic
 * - Whale Intelligence database logic
 * - Risk Scoring system
 * - Analytics Dashboard components
 * - Full behavior explanations
 * - Beginner-level simplified explanations
 * - Advanced-level technical explanations
 */

export type KnowledgeDepth = 'simple' | 'standard' | 'technical' | 'investor';
export type KnowledgeCategory = 
  | 'hydra' 
  | 'constellation' 
  | 'ecoscan' 
  | 'whale_intel' 
  | 'risk_scoring' 
  | 'analytics' 
  | 'general' 
  | 'navigation'
  | 'onboarding';

export interface KnowledgeEntry {
  id: string;
  category: KnowledgeCategory;
  keywords: string[];
  simple: string;
  standard: string;
  technical: string;
  investor: string;
  relatedTopics: string[];
  pageContext?: string[];
}

export interface KnowledgeQuery {
  category?: KnowledgeCategory;
  depth: KnowledgeDepth;
  pageContext?: string;
  entityType?: string;
  keywords?: string[];
}

// ============================================
// HYDRA DETECTION KNOWLEDGE
// ============================================
const HYDRA_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'hydra_overview',
    category: 'hydra',
    keywords: ['hydra', 'detection', 'threat', 'manipulation', 'multi-head'],
    simple: 'Hydra is like having multiple security cameras, each watching for different types of suspicious activity in crypto markets. When any camera spots something fishy, you get an alert.',
    standard: 'Hydra is GhostQuant\'s multi-head threat detection engine. It uses parallel analysis streams called "heads" to detect different types of market manipulation simultaneously. Each head specializes in a specific threat pattern like wash trading, spoofing, or coordinated pump-and-dump schemes.',
    technical: 'Hydra employs a multi-head attention architecture with each head trained on specific manipulation signatures. The system processes transaction graphs in real-time, applying behavioral heuristics and statistical anomaly detection across multiple timeframes. Confidence scores are computed using ensemble methods combining rule-based and ML-driven classifiers with cross-validation against historical manipulation events.',
    investor: 'Hydra is our flagship detection engine that processes millions of transactions in real-time, identifying manipulation patterns that traditional systems miss. It\'s like having multiple expert analysts working simultaneously, each specialized in different threat types.',
    relatedTopics: ['wash_trading', 'spoofing', 'pump_dump', 'confidence_scores'],
    pageContext: ['/terminal/hydra'],
  },
  {
    id: 'hydra_heads',
    category: 'hydra',
    keywords: ['heads', 'detection heads', 'parallel', 'streams'],
    simple: 'Each "head" in Hydra is like a specialist detective. One looks for fake trades, another watches for price tricks, and so on. They all work at the same time to catch bad actors faster.',
    standard: 'Hydra\'s detection heads are independent analysis modules that run in parallel. Each head is optimized for a specific manipulation pattern: wash trading detection, spoofing identification, pump-and-dump recognition, and coordinated behavior analysis. When multiple heads flag the same entity, confidence increases.',
    technical: 'Detection heads implement specialized feature extractors and classifiers. The wash trading head analyzes circular transaction patterns and self-dealing signatures. The spoofing head monitors order book dynamics and cancellation rates. The pump-dump head tracks volume anomalies correlated with social media sentiment. Cross-head consensus is computed using weighted voting with dynamic confidence calibration.',
    investor: 'Our multi-head architecture means we catch manipulation that single-focus systems miss. Each head brings specialized expertise, and when they agree, we have high confidence in our alerts.',
    relatedTopics: ['hydra_overview', 'confidence_scores', 'alert_system'],
    pageContext: ['/terminal/hydra'],
  },
  {
    id: 'hydra_confidence',
    category: 'hydra',
    keywords: ['confidence', 'score', 'accuracy', 'reliability'],
    simple: 'The confidence score tells you how sure Hydra is about what it found. Higher numbers mean we\'re more certain something suspicious is happening.',
    standard: 'Confidence scores in Hydra range from 0 to 100 and represent the system\'s certainty about detected threats. Scores above 80 indicate high-confidence detections with strong evidence. Scores between 50-80 warrant attention but may need additional investigation. Below 50 are early warnings.',
    technical: 'Confidence is computed as a weighted ensemble of individual head scores, adjusted for historical precision at each threshold. The scoring function incorporates Bayesian updating based on entity history, network position, and temporal patterns. False positive rates are calibrated against labeled datasets with regular backtesting.',
    investor: 'Our confidence scoring has been validated against known manipulation events with over 90% precision at the high-confidence threshold. This means when we flag something with high confidence, it\'s almost certainly real.',
    relatedTopics: ['hydra_heads', 'alert_system', 'risk_scoring'],
    pageContext: ['/terminal/hydra'],
  },
  {
    id: 'wash_trading',
    category: 'hydra',
    keywords: ['wash', 'trading', 'fake', 'volume', 'self-dealing'],
    simple: 'Wash trading is when someone trades with themselves to make it look like there\'s more activity than there really is. It\'s like clapping for yourself to make others think you\'re popular.',
    standard: 'Wash trading involves executing trades where the same entity is effectively both buyer and seller, artificially inflating volume metrics. Hydra detects this by analyzing transaction patterns, timing correlations, and wallet clustering to identify self-dealing behavior.',
    technical: 'Wash trading detection uses graph analysis to identify circular transaction flows and temporal correlation analysis to detect coordinated self-trades. The algorithm computes transaction graph cycles, analyzes maker-taker patterns, and applies statistical tests for volume anomalies relative to organic trading baselines.',
    investor: 'Wash trading is one of the most common manipulation tactics in crypto. Our detection helps you avoid assets with artificially inflated volumes, protecting your investment decisions.',
    relatedTopics: ['hydra_heads', 'spoofing', 'manipulation'],
    pageContext: ['/terminal/hydra'],
  },
  {
    id: 'spoofing',
    category: 'hydra',
    keywords: ['spoof', 'spoofing', 'fake orders', 'order book'],
    simple: 'Spoofing is when traders place fake orders they never intend to fill, just to trick others into thinking the price will move. Then they cancel the fake orders and profit from the confusion.',
    standard: 'Spoofing involves placing large orders to create false impressions of supply or demand, then canceling before execution. Hydra monitors order book dynamics, cancellation rates, and timing patterns to identify spoofing behavior.',
    technical: 'Spoofing detection analyzes order-to-trade ratios, cancellation velocity, and order book imbalance dynamics. The system tracks order placement patterns across multiple venues, computing statistical signatures of spoofing behavior including layering patterns and quote stuffing.',
    investor: 'Spoofing distorts price discovery and can lead to significant losses for legitimate traders. Our detection helps identify markets where spoofing is prevalent so you can trade with confidence.',
    relatedTopics: ['hydra_heads', 'wash_trading', 'manipulation'],
    pageContext: ['/terminal/hydra'],
  },
];

// ============================================
// CONSTELLATION FUSION ENGINE KNOWLEDGE
// ============================================
const CONSTELLATION_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'constellation_overview',
    category: 'constellation',
    keywords: ['constellation', 'fusion', 'entity', 'cluster', 'network', 'graph', 'connection', 'map'],
    simple: 'Think of Constellation as a social network map for crypto wallets. It shows you which wallets are connected and might be controlled by the same person or group, even if they\'re trying to hide it.',
    standard: 'Constellation is GhostQuant\'s entity fusion engine. It maps relationships between wallets, exchanges, and entities across multiple blockchains, revealing hidden connections and coordinated behavior patterns through advanced graph analysis.',
    technical: 'Constellation uses graph neural networks combined with temporal analysis to identify entity clusters. The system applies community detection algorithms (Louvain, label propagation) on transaction graphs, then validates clusters using behavioral fingerprinting. Risk propagation is modeled using belief propagation on the entity graph with iterative message passing.',
    investor: 'Constellation reveals the hidden network of relationships in crypto markets. It can identify when seemingly unrelated wallets are actually controlled by the same entity, exposing coordinated manipulation that would otherwise be invisible.',
    relatedTopics: ['entity_clustering', 'risk_propagation', 'behavioral_fingerprinting'],
    pageContext: ['/terminal/constellation', '/terminal/graph'],
  },
  {
    id: 'entity_clustering',
    category: 'constellation',
    keywords: ['cluster', 'entity', 'grouping', 'related', 'connected'],
    simple: 'Entity clustering is like finding out which wallets belong to the same person or group. If wallets always move money together or share patterns, they\'re probably connected.',
    standard: 'Entity clustering groups wallets and addresses that are likely controlled by the same entity. Constellation uses transaction patterns, timing analysis, and behavioral similarities to identify clusters, even when entities try to obscure their connections.',
    technical: 'Clustering employs hierarchical agglomerative methods on feature vectors derived from transaction graphs. Features include temporal transaction patterns, gas price preferences, contract interaction signatures, and network centrality metrics. Cluster validation uses silhouette scoring and cross-chain consistency checks.',
    investor: 'Understanding entity clusters is crucial for risk assessment. A single entity controlling multiple wallets can coordinate manipulation across them. Our clustering reveals these hidden connections.',
    relatedTopics: ['constellation_overview', 'behavioral_fingerprinting', 'risk_propagation'],
    pageContext: ['/terminal/constellation', '/terminal/entity'],
  },
  {
    id: 'risk_propagation',
    category: 'constellation',
    keywords: ['risk', 'propagation', 'spread', 'contagion', 'network'],
    simple: 'Risk propagation shows how risk spreads through connections. If a wallet is connected to a known bad actor, some of that risk "spreads" to connected wallets too.',
    standard: 'Risk propagation models how risk flows through the entity network. When one entity is flagged as high-risk, connected entities receive elevated risk scores based on the strength and nature of their connections.',
    technical: 'Risk propagation uses belief propagation on the entity graph with edge weights derived from transaction volume, frequency, and recency. The algorithm iteratively updates risk beliefs until convergence, with damping factors to prevent oscillation. Risk decay is modeled as a function of graph distance and connection strength.',
    investor: 'Risk propagation helps you understand not just direct risks, but also exposure through connections. An entity might look clean individually but have dangerous connections that our system reveals.',
    relatedTopics: ['constellation_overview', 'entity_clustering', 'risk_scoring'],
    pageContext: ['/terminal/constellation', '/terminal/graph'],
  },
];

// ============================================
// ECOSCAN ANOMALY KNOWLEDGE
// ============================================
const ECOSCAN_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'ecoscan_overview',
    category: 'ecoscan',
    keywords: ['ecoscan', 'scan', 'entity scan', 'wallet scan', 'address scan', 'risk scan'],
    simple: 'EcoScan is like running a background check on any crypto address. Paste an address, and we\'ll tell you if it\'s trustworthy, who it\'s connected to, and any red flags.',
    standard: 'EcoScan is GhostQuant\'s entity scanning tool. Enter any wallet address or entity identifier to get a comprehensive risk assessment, including behavioral analysis, connection mapping, and threat indicators.',
    technical: 'EcoScan performs real-time graph traversal to map entity connections, applies behavioral classifiers to transaction patterns, and cross-references against WIDB and external threat intelligence feeds. Results include confidence intervals, supporting evidence, and historical risk trajectory.',
    investor: 'EcoScan provides instant due diligence on any crypto address. Compliance teams use it to screen counterparties and assess transaction risk in seconds, replacing hours of manual investigation.',
    relatedTopics: ['risk_scoring', 'entity_clustering', 'whale_intel'],
    pageContext: ['/terminal/entity', '/ecoscan'],
  },
  {
    id: 'ecoscan_anomaly',
    category: 'ecoscan',
    keywords: ['anomaly', 'unusual', 'suspicious', 'abnormal', 'deviation'],
    simple: 'An anomaly is when something doesn\'t fit the normal pattern. If a wallet suddenly starts behaving differently, that\'s an anomaly worth investigating.',
    standard: 'EcoScan detects anomalies by comparing entity behavior against established baselines. Sudden changes in transaction volume, timing patterns, or connection behavior trigger anomaly alerts with severity ratings.',
    technical: 'Anomaly detection uses isolation forests and autoencoders trained on normal behavior distributions. Z-score analysis identifies statistical outliers in transaction features. Temporal anomalies are detected using change-point detection algorithms on behavioral time series.',
    investor: 'Anomaly detection catches behavioral changes that might indicate compromised accounts, insider trading, or preparation for manipulation. Early detection gives you time to react.',
    relatedTopics: ['ecoscan_overview', 'risk_scoring', 'hydra_overview'],
    pageContext: ['/terminal/entity', '/ecoscan'],
  },
];

// ============================================
// WHALE INTELLIGENCE KNOWLEDGE
// ============================================
const WHALE_INTEL_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'whale_overview',
    category: 'whale_intel',
    keywords: ['whale', 'whales', 'large holder', 'big wallet', 'whale tracking', 'whale movement'],
    simple: 'Whale tracking is like following the big fish in the ocean. When someone with millions in crypto moves their money, it can affect prices. We watch these big players so you know what\'s coming.',
    standard: 'GhostQuant\'s Whale Intelligence system tracks large cryptocurrency holders and their movements. It identifies whale wallets, monitors their transactions, and predicts potential market impact based on historical patterns.',
    technical: 'Whale identification uses clustering on transaction volumes and wallet balances, with dynamic thresholds adjusted per asset. Movement prediction employs time-series analysis and order flow modeling to estimate market impact using Kyle\'s lambda and similar microstructure metrics.',
    investor: 'Whale movements often precede major market moves. Our system identifies and tracks these large holders, giving our clients early warning of potential market shifts before they happen.',
    relatedTopics: ['whale_movement', 'market_impact', 'widb'],
    pageContext: ['/terminal/whales', '/terminal/whale-intel'],
  },
  {
    id: 'whale_movement',
    category: 'whale_intel',
    keywords: ['movement', 'transfer', 'flow', 'accumulation', 'distribution'],
    simple: 'Whale movements are when big holders move their crypto around. If they\'re buying more (accumulating), prices might go up. If they\'re selling (distributing), prices might drop.',
    standard: 'Whale movement tracking monitors large transfers and identifies patterns like accumulation (buying) or distribution (selling). The system alerts on significant movements and provides context on historical behavior.',
    technical: 'Movement analysis tracks on-chain flows with volume-weighted directional indicators. Accumulation/distribution is computed using modified OBV (On-Balance Volume) adapted for on-chain data. Exchange flow analysis distinguishes between internal transfers and market-impacting movements.',
    investor: 'Understanding whale movements gives you an edge. When whales accumulate, it often signals confidence in an asset. When they distribute, it may signal upcoming selling pressure.',
    relatedTopics: ['whale_overview', 'market_impact', 'analytics_dashboard'],
    pageContext: ['/terminal/whales', '/terminal/whale-intel'],
  },
  {
    id: 'widb',
    category: 'whale_intel',
    keywords: ['widb', 'whale intelligence database', 'database', 'wallet database', 'entity database'],
    simple: 'WIDB is our address book of crypto wallets - we know who\'s who, their history, and their risk level. It\'s like a credit report for crypto addresses.',
    standard: 'WIDB (Whale Intelligence Database) is GhostQuant\'s comprehensive database of known entities, wallets, and their risk profiles. It includes sanctions screening, behavioral scoring, and historical activity records.',
    technical: 'WIDB maintains entity profiles with behavioral fingerprints, transaction histories, and risk scores computed using gradient-boosted models. Sanctions screening uses fuzzy matching against OFAC, EU, and other watchlists with configurable similarity thresholds and phonetic matching.',
    investor: 'WIDB is our proprietary intelligence database containing profiles on thousands of crypto entities. It\'s the foundation that powers our risk assessment capabilities and compliance screening.',
    relatedTopics: ['whale_overview', 'ecoscan_overview', 'risk_scoring'],
    pageContext: ['/terminal/whale-intel', '/terminal/whales'],
  },
];

// ============================================
// RISK SCORING KNOWLEDGE
// ============================================
const RISK_SCORING_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'risk_score_overview',
    category: 'risk_scoring',
    keywords: ['risk', 'score', 'rating', 'assessment', 'level'],
    simple: 'Risk scores go from 0 to 100. Under 30 is safe (green light), 30-60 is worth watching (yellow light), 60-80 needs attention (orange), and above 80 is a red flag.',
    standard: 'Risk scores in GhostQuant range from 0 to 100. Scores below 30 indicate low risk, 30-60 is moderate risk, 60-80 is high risk, and above 80 is critical. These scores are calculated based on behavioral patterns, transaction history, entity connections, and known threat indicators.',
    technical: 'Risk scoring uses a gradient-boosted ensemble model trained on labeled entity data. Features include transaction graph metrics, behavioral anomaly scores, network centrality measures, and sanctions proximity. The model is calibrated to maintain consistent precision-recall characteristics across score thresholds.',
    investor: 'Our risk scoring provides a single, actionable metric for entity assessment. It combines multiple intelligence sources into one number that compliance teams and traders can use for quick decisions.',
    relatedTopics: ['risk_factors', 'risk_propagation', 'ecoscan_overview'],
    pageContext: ['/terminal/entity', '/ecoscan', '/terminal/analytics'],
  },
  {
    id: 'risk_factors',
    category: 'risk_scoring',
    keywords: ['factors', 'components', 'contributors', 'breakdown'],
    simple: 'Risk factors are the different things we look at to calculate risk: transaction patterns, who you\'re connected to, past behavior, and any red flags in your history.',
    standard: 'Risk scores are composed of multiple factors: behavioral risk (unusual transaction patterns), network risk (connections to flagged entities), historical risk (past suspicious activity), and compliance risk (sanctions and watchlist matches).',
    technical: 'Factor contributions are computed using SHAP (SHapley Additive exPlanations) values from the ensemble model. Each factor category has sub-components with individual weights learned from training data. Factor importance is recalibrated quarterly based on new labeled data.',
    investor: 'Understanding risk factors helps you make informed decisions. Our breakdown shows exactly why an entity received its score, so you can assess whether the risk is relevant to your use case.',
    relatedTopics: ['risk_score_overview', 'ecoscan_anomaly', 'hydra_confidence'],
    pageContext: ['/terminal/entity', '/ecoscan'],
  },
];

// ============================================
// ANALYTICS DASHBOARD KNOWLEDGE
// ============================================
const ANALYTICS_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'analytics_overview',
    category: 'analytics',
    keywords: ['analytics', 'dashboard', 'metrics', 'overview', 'summary'],
    simple: 'The Analytics Dashboard is your command center - one screen showing everything important: market health, big player activity, and any unusual patterns. Think of it as your crypto weather report.',
    standard: 'The Analytics Dashboard provides real-time market intelligence including global risk indices, whale activity metrics, entity classifications, anomaly feeds, and AI-generated narrative summaries of market conditions.',
    technical: 'The dashboard aggregates signals from all GhostQuant subsystems, applying weighted scoring to compute composite risk indices. Market narratives are generated using fine-tuned LLMs with retrieval-augmented generation from our proprietary intelligence database.',
    investor: 'Our Analytics Dashboard gives institutional clients a single pane of glass view into market health, combining multiple intelligence streams into actionable insights that would take hours to compile manually.',
    relatedTopics: ['risk_index', 'whale_activity', 'anomaly_feed'],
    pageContext: ['/terminal/analytics'],
  },
  {
    id: 'risk_index',
    category: 'analytics',
    keywords: ['risk index', 'market risk', 'global risk', 'index'],
    simple: 'The risk index shows overall market health. Low numbers mean things are calm, high numbers mean there\'s more suspicious activity happening across the market.',
    standard: 'The Global Risk Index aggregates threat signals across all monitored assets and entities. It provides a single metric for overall market manipulation risk, updated in real-time as new data arrives.',
    technical: 'The index is computed as a weighted average of normalized threat scores across asset classes, with weights derived from market capitalization and trading volume. Temporal smoothing prevents noise while maintaining responsiveness to genuine risk changes.',
    investor: 'The Global Risk Index gives you an instant read on market conditions. When it spikes, it\'s time to be cautious. When it\'s low, market conditions are relatively clean.',
    relatedTopics: ['analytics_overview', 'risk_score_overview', 'anomaly_feed'],
    pageContext: ['/terminal/analytics'],
  },
  {
    id: 'anomaly_feed',
    category: 'analytics',
    keywords: ['anomaly', 'feed', 'alerts', 'notifications', 'events'],
    simple: 'The anomaly feed is like a news ticker for suspicious activity. It shows you the latest unusual events as they happen, so you\'re always in the loop.',
    standard: 'The Anomaly Feed displays real-time alerts from all GhostQuant detection systems. Each alert includes severity, affected entities, and recommended actions. Alerts are prioritized by potential market impact.',
    technical: 'The feed aggregates alerts from Hydra, EcoScan, and Whale Intelligence with deduplication and correlation. Alert ranking uses a multi-factor scoring model considering severity, confidence, market impact potential, and user relevance.',
    investor: 'The Anomaly Feed keeps you informed of market events as they happen. Our clients use it to stay ahead of market-moving events and adjust their strategies in real-time.',
    relatedTopics: ['analytics_overview', 'hydra_overview', 'ecoscan_anomaly'],
    pageContext: ['/terminal/analytics'],
  },
];

// ============================================
// GENERAL KNOWLEDGE
// ============================================
const GENERAL_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'ghostquant_overview',
    category: 'general',
    keywords: ['ghostquant', 'platform', 'what is', 'about', 'overview'],
    simple: 'GhostQuant is your crypto intelligence partner. We help you understand what\'s happening in the market, spot risks, and make better decisions.',
    standard: 'GhostQuant is a private crypto-native research and signal platform. We provide institutional-grade market intelligence, threat detection, and entity analysis for cryptocurrency markets.',
    technical: 'GhostQuant combines on-chain analytics, behavioral modeling, and graph analysis to provide comprehensive market intelligence. Our tech stack includes custom blockchain indexers, graph databases, and ML pipelines running on distributed infrastructure.',
    investor: 'GhostQuant is the Bloomberg Terminal for crypto intelligence. We help institutions navigate the complex and often opaque world of cryptocurrency markets with confidence through real-time threat detection and entity analysis.',
    relatedTopics: ['hydra_overview', 'constellation_overview', 'analytics_overview'],
    pageContext: ['/'],
  },
  {
    id: 'getting_started',
    category: 'onboarding',
    keywords: ['start', 'begin', 'new', 'tutorial', 'guide', 'help'],
    simple: 'New here? Start with the Analytics Dashboard to see the big picture, then explore specific tools as you get curious. I\'m here to help explain anything!',
    standard: 'Welcome to GhostQuant! Start by exploring the Analytics Dashboard for market overview, then dive into specific tools like Hydra for threat detection or Whale Intelligence for tracking large holders.',
    technical: 'The platform offers multiple entry points depending on your use case. For threat monitoring, start with Hydra. For entity research, use EcoScan. For market overview, the Analytics Dashboard provides aggregated intelligence.',
    investor: 'Our onboarding process gets new users productive within minutes. Start with the Analytics Dashboard for the big picture, then explore specific tools based on your investment focus.',
    relatedTopics: ['analytics_overview', 'hydra_overview', 'ecoscan_overview'],
    pageContext: ['/terminal/home'],
  },
];

// ============================================
// NAVIGATION KNOWLEDGE
// ============================================
const NAVIGATION_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'nav_hydra',
    category: 'navigation',
    keywords: ['go to hydra', 'show hydra', 'open hydra', 'navigate hydra'],
    simple: 'I can take you to the Hydra Console where you can see threat detection in action.',
    standard: 'The Hydra Console is located in the terminal sidebar. It shows real-time threat detection across all monitored assets.',
    technical: 'Navigate to /terminal/hydra to access the Hydra Console with full threat detection interface.',
    investor: 'The Hydra Console showcases our flagship threat detection technology.',
    relatedTopics: ['hydra_overview'],
    pageContext: ['/terminal/hydra'],
  },
  {
    id: 'nav_constellation',
    category: 'navigation',
    keywords: ['go to constellation', 'show constellation', 'open constellation', 'navigate constellation', 'show graph', 'entity map'],
    simple: 'I can take you to the Constellation map where you can see how entities are connected.',
    standard: 'The Constellation page shows entity relationships and cluster analysis. Access it from the terminal sidebar.',
    technical: 'Navigate to /terminal/constellation for the entity fusion interface with graph visualization.',
    investor: 'The Constellation map reveals hidden relationships that traditional analysis misses.',
    relatedTopics: ['constellation_overview'],
    pageContext: ['/terminal/constellation'],
  },
  {
    id: 'nav_analytics',
    category: 'navigation',
    keywords: ['go to analytics', 'show analytics', 'open analytics', 'navigate analytics', 'dashboard', 'show dashboard'],
    simple: 'I can take you to the Analytics Dashboard where you can see the market overview.',
    standard: 'The Analytics Dashboard provides real-time market intelligence. Access it from the terminal sidebar.',
    technical: 'Navigate to /terminal/analytics for the aggregated intelligence dashboard.',
    investor: 'The Analytics Dashboard is your command center for market intelligence.',
    relatedTopics: ['analytics_overview'],
    pageContext: ['/terminal/analytics'],
  },
  {
    id: 'nav_whales',
    category: 'navigation',
    keywords: ['go to whales', 'show whales', 'open whales', 'navigate whales', 'whale intel', 'whale intelligence'],
    simple: 'I can take you to Whale Intelligence where you can track big players.',
    standard: 'The Whale Intelligence page tracks large holders and their movements. Access it from the terminal sidebar.',
    technical: 'Navigate to /terminal/whales or /terminal/whale-intel for whale tracking interfaces.',
    investor: 'Whale Intelligence gives you early warning of major market moves.',
    relatedTopics: ['whale_overview'],
    pageContext: ['/terminal/whales', '/terminal/whale-intel'],
  },
];

// ============================================
// COMBINED KNOWLEDGE BASE
// ============================================
const ALL_KNOWLEDGE: KnowledgeEntry[] = [
  ...HYDRA_KNOWLEDGE,
  ...CONSTELLATION_KNOWLEDGE,
  ...ECOSCAN_KNOWLEDGE,
  ...WHALE_INTEL_KNOWLEDGE,
  ...RISK_SCORING_KNOWLEDGE,
  ...ANALYTICS_KNOWLEDGE,
  ...GENERAL_KNOWLEDGE,
  ...NAVIGATION_KNOWLEDGE,
];

// ============================================
// KNOWLEDGE BASE FUNCTIONS
// ============================================

/**
 * Search knowledge base by keywords
 */
export function searchKnowledge(keywords: string[], depth: KnowledgeDepth = 'standard'): KnowledgeEntry[] {
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  
  return ALL_KNOWLEDGE.filter(entry => {
    return lowerKeywords.some(keyword => 
      entry.keywords.some(k => k.toLowerCase().includes(keyword)) ||
      entry.id.toLowerCase().includes(keyword)
    );
  });
}

/**
 * Get knowledge by category
 */
export function getKnowledgeByCategory(category: KnowledgeCategory): KnowledgeEntry[] {
  return ALL_KNOWLEDGE.filter(entry => entry.category === category);
}

/**
 * Get knowledge by page context
 */
export function getKnowledgeByPageContext(path: string): KnowledgeEntry[] {
  return ALL_KNOWLEDGE.filter(entry => 
    entry.pageContext?.some(p => path.includes(p) || p.includes(path))
  );
}

/**
 * Get specific knowledge entry by ID
 */
export function getKnowledgeById(id: string): KnowledgeEntry | undefined {
  return ALL_KNOWLEDGE.find(entry => entry.id === id);
}

/**
 * Get knowledge response at specified depth
 */
export function getKnowledgeResponse(entry: KnowledgeEntry, depth: KnowledgeDepth): string {
  switch (depth) {
    case 'simple':
      return entry.simple;
    case 'technical':
      return entry.technical;
    case 'investor':
      return entry.investor;
    case 'standard':
    default:
      return entry.standard;
  }
}

/**
 * Query knowledge base with full context
 */
export function queryKnowledge(query: KnowledgeQuery): { entry: KnowledgeEntry; response: string }[] {
  let results: KnowledgeEntry[] = [];
  
  // Filter by category if specified
  if (query.category) {
    results = getKnowledgeByCategory(query.category);
  } else if (query.pageContext) {
    results = getKnowledgeByPageContext(query.pageContext);
  } else if (query.keywords && query.keywords.length > 0) {
    results = searchKnowledge(query.keywords, query.depth);
  } else {
    results = ALL_KNOWLEDGE;
  }
  
  // Further filter by keywords if both category and keywords specified
  if (query.keywords && query.keywords.length > 0 && query.category) {
    const lowerKeywords = query.keywords.map(k => k.toLowerCase());
    results = results.filter(entry =>
      lowerKeywords.some(keyword =>
        entry.keywords.some(k => k.toLowerCase().includes(keyword))
      )
    );
  }
  
  return results.map(entry => ({
    entry,
    response: getKnowledgeResponse(entry, query.depth),
  }));
}

/**
 * Get related knowledge entries
 */
export function getRelatedKnowledge(entryId: string): KnowledgeEntry[] {
  const entry = getKnowledgeById(entryId);
  if (!entry) return [];
  
  return entry.relatedTopics
    .map(id => getKnowledgeById(id))
    .filter((e): e is KnowledgeEntry => e !== undefined);
}

/**
 * Get all categories
 */
export function getAllCategories(): KnowledgeCategory[] {
  return ['hydra', 'constellation', 'ecoscan', 'whale_intel', 'risk_scoring', 'analytics', 'general', 'navigation', 'onboarding'];
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: KnowledgeCategory): string {
  const names: Record<KnowledgeCategory, string> = {
    hydra: 'Hydra Threat Detection',
    constellation: 'Constellation Entity Mapping',
    ecoscan: 'EcoScan Entity Analysis',
    whale_intel: 'Whale Intelligence',
    risk_scoring: 'Risk Scoring',
    analytics: 'Analytics Dashboard',
    general: 'General',
    navigation: 'Navigation',
    onboarding: 'Getting Started',
  };
  return names[category];
}

// Export all knowledge arrays for direct access if needed
export {
  HYDRA_KNOWLEDGE,
  CONSTELLATION_KNOWLEDGE,
  ECOSCAN_KNOWLEDGE,
  WHALE_INTEL_KNOWLEDGE,
  RISK_SCORING_KNOWLEDGE,
  ANALYTICS_KNOWLEDGE,
  GENERAL_KNOWLEDGE,
  NAVIGATION_KNOWLEDGE,
  ALL_KNOWLEDGE,
};
