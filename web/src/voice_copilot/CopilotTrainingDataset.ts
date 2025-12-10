/**
 * CopilotTrainingDataset - 100+ Q&A Examples for Semantic Matching
 * 
 * Organized by:
 * A. Basic platform questions
 * B. Hydra questions
 * C. Constellation questions
 * D. EcoScan questions
 * E. Risk Score questions
 * F. Beginner mode
 * G. Technical mode
 * H. Investor mode
 * I. Vague question handling
 * J. Confusion recovery
 */

export interface TrainingExample {
  id: string;
  category: string;
  question: string;
  intent: string;
  expectedResponse: string;
  depth: 'simple' | 'standard' | 'technical';
  tags: string[];
}

// ============================================
// A. BASIC PLATFORM QUESTIONS
// ============================================

const BASIC_PLATFORM_EXAMPLES: TrainingExample[] = [
  {
    id: 'basic_001',
    category: 'basic',
    question: 'What is GhostQuant?',
    intent: 'general',
    expectedResponse: 'GhostQuant is a private crypto-native research and signal platform. We provide institutional-grade market intelligence, threat detection, and entity analysis for cryptocurrency markets.',
    depth: 'standard',
    tags: ['overview', 'introduction', 'platform'],
  },
  {
    id: 'basic_002',
    category: 'basic',
    question: 'What can you help me with?',
    intent: 'help',
    expectedResponse: 'I can help you understand market intelligence, explain threat detection, analyze entities, track whale movements, and navigate the platform. What would you like to explore?',
    depth: 'standard',
    tags: ['help', 'capabilities', 'introduction'],
  },
  {
    id: 'basic_003',
    category: 'basic',
    question: 'How do I get started?',
    intent: 'onboarding',
    expectedResponse: 'Start with the Analytics Dashboard for a market overview, then explore specific tools like Hydra for threat detection or Whale Intelligence for tracking large holders. I\'m here to guide you!',
    depth: 'simple',
    tags: ['onboarding', 'getting_started', 'navigation'],
  },
  {
    id: 'basic_004',
    category: 'basic',
    question: 'Where should I start?',
    intent: 'onboarding',
    expectedResponse: 'The Analytics Dashboard is a great starting point - it gives you the big picture of market conditions. From there, you can dive into specific areas that interest you.',
    depth: 'simple',
    tags: ['onboarding', 'navigation'],
  },
  {
    id: 'basic_005',
    category: 'basic',
    question: 'What features does GhostQuant have?',
    intent: 'general',
    expectedResponse: 'GhostQuant includes Hydra for threat detection, Constellation for entity mapping, EcoScan for wallet analysis, Whale Intelligence for tracking big players, and an Analytics Dashboard for market overview.',
    depth: 'standard',
    tags: ['features', 'overview'],
  },
  {
    id: 'basic_006',
    category: 'basic',
    question: 'How does GhostQuant work?',
    intent: 'general',
    expectedResponse: 'GhostQuant analyzes blockchain data in real-time, using AI and graph analysis to detect threats, map entity relationships, and provide actionable intelligence for crypto markets.',
    depth: 'standard',
    tags: ['overview', 'how_it_works'],
  },
  {
    id: 'basic_007',
    category: 'basic',
    question: 'Is GhostQuant free?',
    intent: 'general',
    expectedResponse: 'GhostQuant offers different subscription tiers. You can explore the demo features, and premium features are available with a subscription.',
    depth: 'standard',
    tags: ['pricing', 'subscription'],
  },
  {
    id: 'basic_008',
    category: 'basic',
    question: 'Who uses GhostQuant?',
    intent: 'general',
    expectedResponse: 'GhostQuant is used by institutional investors, compliance teams, crypto funds, and sophisticated traders who need deep market intelligence and risk assessment.',
    depth: 'standard',
    tags: ['users', 'audience'],
  },
  {
    id: 'basic_009',
    category: 'basic',
    question: 'What makes GhostQuant different?',
    intent: 'general',
    expectedResponse: 'GhostQuant combines real-time threat detection, entity relationship mapping, and whale tracking in one platform. Our multi-head Hydra engine catches manipulation that single-focus tools miss.',
    depth: 'standard',
    tags: ['differentiation', 'value_prop'],
  },
  {
    id: 'basic_010',
    category: 'basic',
    question: 'Can you explain the dashboard?',
    intent: 'dashboard',
    expectedResponse: 'The Analytics Dashboard shows real-time market intelligence including risk indices, whale activity, anomaly feeds, and AI-generated market narratives. It\'s your command center for market health.',
    depth: 'standard',
    tags: ['dashboard', 'analytics'],
  },
];

// ============================================
// B. HYDRA QUESTIONS
// ============================================

const HYDRA_EXAMPLES: TrainingExample[] = [
  {
    id: 'hydra_001',
    category: 'hydra',
    question: 'What is Hydra?',
    intent: 'hydra',
    expectedResponse: 'Hydra is GhostQuant\'s multi-head threat detection engine. It uses parallel analysis streams to detect different types of market manipulation simultaneously, like wash trading and spoofing.',
    depth: 'standard',
    tags: ['hydra', 'overview', 'threat_detection'],
  },
  {
    id: 'hydra_002',
    category: 'hydra',
    question: 'How does Hydra detect manipulation?',
    intent: 'hydra',
    expectedResponse: 'Hydra uses multiple detection "heads," each specialized for different manipulation patterns. They analyze transaction patterns, timing, and behavior to flag suspicious activity.',
    depth: 'standard',
    tags: ['hydra', 'detection', 'manipulation'],
  },
  {
    id: 'hydra_003',
    category: 'hydra',
    question: 'What are detection heads?',
    intent: 'hydra',
    expectedResponse: 'Detection heads are specialized analysis modules that run in parallel. Each head is trained to spot a specific type of manipulation - one for wash trading, one for spoofing, and so on.',
    depth: 'standard',
    tags: ['hydra', 'heads', 'architecture'],
  },
  {
    id: 'hydra_004',
    category: 'hydra',
    question: 'What is wash trading?',
    intent: 'hydra',
    expectedResponse: 'Wash trading is when someone trades with themselves to fake volume. It makes an asset look more popular than it is. Hydra detects this by analyzing transaction patterns.',
    depth: 'simple',
    tags: ['hydra', 'wash_trading', 'manipulation'],
  },
  {
    id: 'hydra_005',
    category: 'hydra',
    question: 'What is spoofing?',
    intent: 'hydra',
    expectedResponse: 'Spoofing is placing fake orders to trick others into thinking the price will move, then canceling before they execute. Hydra monitors order book dynamics to catch this.',
    depth: 'simple',
    tags: ['hydra', 'spoofing', 'manipulation'],
  },
  {
    id: 'hydra_006',
    category: 'hydra',
    question: 'What does the confidence score mean?',
    intent: 'hydra',
    expectedResponse: 'The confidence score shows how certain Hydra is about a detection. Above 80 is high confidence, 50-80 warrants attention, and below 50 is an early warning.',
    depth: 'standard',
    tags: ['hydra', 'confidence', 'scoring'],
  },
  {
    id: 'hydra_007',
    category: 'hydra',
    question: 'How accurate is Hydra?',
    intent: 'hydra',
    expectedResponse: 'Hydra has been validated against known manipulation events with over 90% precision at high-confidence thresholds. When we flag something with high confidence, it\'s almost certainly real.',
    depth: 'standard',
    tags: ['hydra', 'accuracy', 'validation'],
  },
  {
    id: 'hydra_008',
    category: 'hydra',
    question: 'What is a pump and dump?',
    intent: 'hydra',
    expectedResponse: 'A pump and dump is when bad actors artificially inflate an asset\'s price through coordinated buying and hype, then sell at the peak, leaving others with losses. Hydra tracks these patterns.',
    depth: 'simple',
    tags: ['hydra', 'pump_dump', 'manipulation'],
  },
  {
    id: 'hydra_009',
    category: 'hydra',
    question: 'Why is this threat flagged?',
    intent: 'hydra',
    expectedResponse: 'Threats are flagged when multiple detection heads identify suspicious patterns. The specific reason depends on which heads triggered - it could be unusual volume, timing patterns, or coordinated behavior.',
    depth: 'standard',
    tags: ['hydra', 'alerts', 'explanation'],
  },
  {
    id: 'hydra_010',
    category: 'hydra',
    question: 'How do I use Hydra?',
    intent: 'hydra',
    expectedResponse: 'Enter an address or asset in the Hydra console to scan for threats. You\'ll see which detection heads are active and any alerts they\'ve generated with confidence scores.',
    depth: 'standard',
    tags: ['hydra', 'usage', 'tutorial'],
  },
];

// ============================================
// C. CONSTELLATION QUESTIONS
// ============================================

const CONSTELLATION_EXAMPLES: TrainingExample[] = [
  {
    id: 'constellation_001',
    category: 'constellation',
    question: 'What is Constellation?',
    intent: 'constellation',
    expectedResponse: 'Constellation is GhostQuant\'s entity fusion engine. It maps relationships between wallets and entities, revealing hidden connections and coordinated behavior through graph analysis.',
    depth: 'standard',
    tags: ['constellation', 'overview', 'entity_mapping'],
  },
  {
    id: 'constellation_002',
    category: 'constellation',
    question: 'How does entity clustering work?',
    intent: 'constellation',
    expectedResponse: 'Entity clustering groups wallets that are likely controlled by the same person or organization. We analyze transaction patterns, timing, and behavioral similarities to identify connections.',
    depth: 'standard',
    tags: ['constellation', 'clustering', 'entities'],
  },
  {
    id: 'constellation_003',
    category: 'constellation',
    question: 'What is risk propagation?',
    intent: 'constellation',
    expectedResponse: 'Risk propagation shows how risk spreads through connections. If a wallet is connected to a known bad actor, some of that risk "spreads" to connected wallets based on relationship strength.',
    depth: 'standard',
    tags: ['constellation', 'risk', 'propagation'],
  },
  {
    id: 'constellation_004',
    category: 'constellation',
    question: 'How are these wallets connected?',
    intent: 'constellation',
    expectedResponse: 'Wallets can be connected through direct transactions, shared patterns, or behavioral similarities. The graph shows these relationships with lines indicating connection strength.',
    depth: 'standard',
    tags: ['constellation', 'connections', 'relationships'],
  },
  {
    id: 'constellation_005',
    category: 'constellation',
    question: 'What does this cluster mean?',
    intent: 'constellation',
    expectedResponse: 'A cluster represents a group of wallets that are likely controlled by the same entity. They share patterns that suggest coordinated control, even if they appear separate.',
    depth: 'standard',
    tags: ['constellation', 'clusters', 'explanation'],
  },
  {
    id: 'constellation_006',
    category: 'constellation',
    question: 'Can you show me the entity graph?',
    intent: 'navigation',
    expectedResponse: 'The entity graph is available in the Constellation view. It visualizes wallet relationships as a network where nodes are entities and edges show connections.',
    depth: 'standard',
    tags: ['constellation', 'navigation', 'graph'],
  },
  {
    id: 'constellation_007',
    category: 'constellation',
    question: 'Why are these entities grouped together?',
    intent: 'constellation',
    expectedResponse: 'Entities are grouped when they show similar transaction patterns, timing correlations, or direct fund flows. The clustering algorithm identifies these behavioral fingerprints.',
    depth: 'standard',
    tags: ['constellation', 'clustering', 'explanation'],
  },
  {
    id: 'constellation_008',
    category: 'constellation',
    question: 'What is behavioral fingerprinting?',
    intent: 'constellation',
    expectedResponse: 'Behavioral fingerprinting identifies unique patterns in how a wallet operates - transaction timing, gas preferences, contract interactions. It helps link wallets to the same controller.',
    depth: 'standard',
    tags: ['constellation', 'fingerprinting', 'behavior'],
  },
  {
    id: 'constellation_009',
    category: 'constellation',
    question: 'How do I find related wallets?',
    intent: 'constellation',
    expectedResponse: 'Enter a wallet address in Constellation to see its connections. The graph will show related entities, and you can click on any node to explore further relationships.',
    depth: 'standard',
    tags: ['constellation', 'usage', 'tutorial'],
  },
  {
    id: 'constellation_010',
    category: 'constellation',
    question: 'What do the colors mean in the graph?',
    intent: 'constellation',
    expectedResponse: 'Colors typically indicate risk levels - green for low risk, yellow for moderate, orange for elevated, and red for high risk. The intensity shows confidence in the assessment.',
    depth: 'standard',
    tags: ['constellation', 'visualization', 'colors'],
  },
];

// ============================================
// D. ECOSCAN QUESTIONS
// ============================================

const ECOSCAN_EXAMPLES: TrainingExample[] = [
  {
    id: 'ecoscan_001',
    category: 'ecoscan',
    question: 'What is EcoScan?',
    intent: 'ecoscan',
    expectedResponse: 'EcoScan is GhostQuant\'s entity scanning tool. Enter any wallet address to get a comprehensive risk assessment, behavioral analysis, and connection mapping.',
    depth: 'standard',
    tags: ['ecoscan', 'overview', 'scanning'],
  },
  {
    id: 'ecoscan_002',
    category: 'ecoscan',
    question: 'How do I scan a wallet?',
    intent: 'ecoscan',
    expectedResponse: 'Paste the wallet address into the EcoScan input field and hit scan. You\'ll get a risk score, behavioral profile, and connection analysis within seconds.',
    depth: 'standard',
    tags: ['ecoscan', 'usage', 'tutorial'],
  },
  {
    id: 'ecoscan_003',
    category: 'ecoscan',
    question: 'Is this address safe?',
    intent: 'ecoscan',
    expectedResponse: 'I can help assess that. The risk score and behavioral analysis will show if there are any red flags. Low scores (under 30) generally indicate safer addresses.',
    depth: 'standard',
    tags: ['ecoscan', 'risk', 'assessment'],
  },
  {
    id: 'ecoscan_004',
    category: 'ecoscan',
    question: 'What does the anomaly indicator mean?',
    intent: 'ecoscan',
    expectedResponse: 'An anomaly indicator flags unusual behavior compared to the entity\'s baseline. It could be sudden volume changes, new connection patterns, or timing irregularities.',
    depth: 'standard',
    tags: ['ecoscan', 'anomaly', 'explanation'],
  },
  {
    id: 'ecoscan_005',
    category: 'ecoscan',
    question: 'Can I check multiple addresses?',
    intent: 'ecoscan',
    expectedResponse: 'Yes, you can scan addresses one at a time, or use batch scanning for multiple addresses. Each gets its own risk assessment and profile.',
    depth: 'standard',
    tags: ['ecoscan', 'batch', 'usage'],
  },
  {
    id: 'ecoscan_006',
    category: 'ecoscan',
    question: 'What are threat indicators?',
    intent: 'ecoscan',
    expectedResponse: 'Threat indicators are specific red flags like connections to known bad actors, suspicious transaction patterns, or matches against watchlists. They contribute to the overall risk score.',
    depth: 'standard',
    tags: ['ecoscan', 'threats', 'indicators'],
  },
  {
    id: 'ecoscan_007',
    category: 'ecoscan',
    question: 'How recent is this data?',
    intent: 'ecoscan',
    expectedResponse: 'EcoScan data is updated in real-time. When you scan an address, you\'re seeing the latest available information from the blockchain.',
    depth: 'standard',
    tags: ['ecoscan', 'data', 'freshness'],
  },
  {
    id: 'ecoscan_008',
    category: 'ecoscan',
    question: 'What chains does EcoScan support?',
    intent: 'ecoscan',
    expectedResponse: 'EcoScan supports major chains including Ethereum, Bitcoin, Solana, and several others. The supported chains are shown in the scanner interface.',
    depth: 'standard',
    tags: ['ecoscan', 'chains', 'support'],
  },
  {
    id: 'ecoscan_009',
    category: 'ecoscan',
    question: 'Can I export the scan results?',
    intent: 'ecoscan',
    expectedResponse: 'Yes, scan results can be exported for compliance documentation or further analysis. Look for the export option in the results panel.',
    depth: 'standard',
    tags: ['ecoscan', 'export', 'compliance'],
  },
  {
    id: 'ecoscan_010',
    category: 'ecoscan',
    question: 'Why is this address flagged?',
    intent: 'ecoscan',
    expectedResponse: 'Addresses are flagged based on behavioral analysis, connection patterns, and threat indicators. The risk breakdown shows which factors contributed to the flag.',
    depth: 'standard',
    tags: ['ecoscan', 'flags', 'explanation'],
  },
];

// ============================================
// E. RISK SCORE QUESTIONS
// ============================================

const RISK_SCORE_EXAMPLES: TrainingExample[] = [
  {
    id: 'risk_001',
    category: 'risk',
    question: 'What does the risk score mean?',
    intent: 'risk_score',
    expectedResponse: 'Risk scores range from 0 to 100. Under 30 is low risk, 30-60 is moderate, 60-80 is high, and above 80 is critical. The score combines multiple risk factors.',
    depth: 'standard',
    tags: ['risk', 'scoring', 'explanation'],
  },
  {
    id: 'risk_002',
    category: 'risk',
    question: 'How is the risk score calculated?',
    intent: 'risk_score',
    expectedResponse: 'Risk scores combine behavioral patterns, transaction history, entity connections, and threat indicators. Each factor contributes to the overall score based on its severity.',
    depth: 'standard',
    tags: ['risk', 'calculation', 'factors'],
  },
  {
    id: 'risk_003',
    category: 'risk',
    question: 'Is this risk score bad?',
    intent: 'risk_score',
    expectedResponse: 'It depends on the score level. Under 30 is generally safe, 30-60 warrants attention, 60-80 needs careful consideration, and above 80 is a significant red flag.',
    depth: 'simple',
    tags: ['risk', 'assessment', 'interpretation'],
  },
  {
    id: 'risk_004',
    category: 'risk',
    question: 'What factors affect the risk score?',
    intent: 'risk_score',
    expectedResponse: 'Risk factors include behavioral risk (unusual patterns), network risk (bad connections), historical risk (past activity), and compliance risk (watchlist matches).',
    depth: 'standard',
    tags: ['risk', 'factors', 'breakdown'],
  },
  {
    id: 'risk_005',
    category: 'risk',
    question: 'Why did the risk score change?',
    intent: 'risk_score',
    expectedResponse: 'Risk scores update based on new activity. Changes could be from new transactions, connection changes, or updated threat intelligence. Check the activity log for details.',
    depth: 'standard',
    tags: ['risk', 'changes', 'updates'],
  },
  {
    id: 'risk_006',
    category: 'risk',
    question: 'Can risk scores go down?',
    intent: 'risk_score',
    expectedResponse: 'Yes, risk scores can decrease over time if an entity shows consistent clean behavior and no new red flags appear. The score reflects current risk assessment.',
    depth: 'standard',
    tags: ['risk', 'changes', 'improvement'],
  },
  {
    id: 'risk_007',
    category: 'risk',
    question: 'What is a safe risk score?',
    intent: 'risk_score',
    expectedResponse: 'Generally, scores under 30 are considered low risk. However, context matters - even low-risk entities should be monitored for changes.',
    depth: 'simple',
    tags: ['risk', 'thresholds', 'safety'],
  },
  {
    id: 'risk_008',
    category: 'risk',
    question: 'Should I be worried about this score?',
    intent: 'risk_score',
    expectedResponse: 'Let me help you understand it. Scores above 60 warrant attention. I can break down the specific factors contributing to the score so you can make an informed decision.',
    depth: 'standard',
    tags: ['risk', 'concern', 'assessment'],
  },
  {
    id: 'risk_009',
    category: 'risk',
    question: 'What does high risk mean?',
    intent: 'risk_score',
    expectedResponse: 'High risk (60-80) means significant red flags have been detected. This could include connections to known bad actors, suspicious patterns, or compliance concerns.',
    depth: 'standard',
    tags: ['risk', 'high_risk', 'explanation'],
  },
  {
    id: 'risk_010',
    category: 'risk',
    question: 'How do I reduce risk exposure?',
    intent: 'risk_score',
    expectedResponse: 'To reduce risk exposure, avoid interacting with high-risk entities, use EcoScan to check addresses before transacting, and monitor your connections regularly.',
    depth: 'standard',
    tags: ['risk', 'mitigation', 'advice'],
  },
];

// ============================================
// F. BEGINNER MODE EXAMPLES
// ============================================

const BEGINNER_EXAMPLES: TrainingExample[] = [
  {
    id: 'beginner_001',
    category: 'beginner',
    question: 'Explain this simply',
    intent: 'beginner_mode',
    expectedResponse: 'Of course! Let me break this down in simple terms. What specific part would you like me to explain?',
    depth: 'simple',
    tags: ['beginner', 'simplification'],
  },
  {
    id: 'beginner_002',
    category: 'beginner',
    question: 'I\'m new to crypto',
    intent: 'beginner_mode',
    expectedResponse: 'Welcome! GhostQuant helps you understand what\'s happening in crypto markets. Think of it as a security system that watches for suspicious activity and helps you make safer decisions.',
    depth: 'simple',
    tags: ['beginner', 'onboarding', 'crypto'],
  },
  {
    id: 'beginner_003',
    category: 'beginner',
    question: 'What is a wallet?',
    intent: 'beginner_mode',
    expectedResponse: 'A wallet is like a bank account for crypto. It has an address (like an account number) where you can receive and send cryptocurrency. Each wallet has a unique identifier.',
    depth: 'simple',
    tags: ['beginner', 'wallet', 'basics'],
  },
  {
    id: 'beginner_004',
    category: 'beginner',
    question: 'Dumb it down for me',
    intent: 'beginner_mode',
    expectedResponse: 'No problem! I\'ll keep it simple. What would you like me to explain in plain terms?',
    depth: 'simple',
    tags: ['beginner', 'simplification'],
  },
  {
    id: 'beginner_005',
    category: 'beginner',
    question: 'I don\'t understand any of this',
    intent: 'beginner_mode',
    expectedResponse: 'That\'s okay! Let\'s start from the basics. GhostQuant is like a security guard for crypto - it watches for bad actors and helps you stay safe. What part confuses you most?',
    depth: 'simple',
    tags: ['beginner', 'confusion', 'support'],
  },
  {
    id: 'beginner_006',
    category: 'beginner',
    question: 'What is blockchain?',
    intent: 'beginner_mode',
    expectedResponse: 'Think of blockchain as a public record book that everyone can see but no one can erase. Every transaction is recorded permanently, which is how we can track and analyze activity.',
    depth: 'simple',
    tags: ['beginner', 'blockchain', 'basics'],
  },
  {
    id: 'beginner_007',
    category: 'beginner',
    question: 'Explain like I\'m five',
    intent: 'beginner_mode',
    expectedResponse: 'Sure! Imagine crypto is like digital money, and GhostQuant is like a detective that watches for bad guys trying to cheat. We help you know who\'s trustworthy!',
    depth: 'simple',
    tags: ['beginner', 'eli5', 'simplification'],
  },
  {
    id: 'beginner_008',
    category: 'beginner',
    question: 'What are whales in crypto?',
    intent: 'beginner_mode',
    expectedResponse: 'Whales are people or organizations that hold huge amounts of crypto - so much that when they buy or sell, it can move the whole market. We track them so you know what the big players are doing.',
    depth: 'simple',
    tags: ['beginner', 'whales', 'basics'],
  },
  {
    id: 'beginner_009',
    category: 'beginner',
    question: 'Why does this matter?',
    intent: 'beginner_mode',
    expectedResponse: 'Great question! Understanding market activity helps you make better decisions. Knowing about threats and whale movements can help you avoid scams and time your trades better.',
    depth: 'simple',
    tags: ['beginner', 'relevance', 'value'],
  },
  {
    id: 'beginner_010',
    category: 'beginner',
    question: 'Can you use simpler words?',
    intent: 'beginner_mode',
    expectedResponse: 'Absolutely! I\'ll avoid the technical jargon. Just let me know what you\'d like explained and I\'ll keep it straightforward.',
    depth: 'simple',
    tags: ['beginner', 'simplification', 'language'],
  },
];

// ============================================
// G. TECHNICAL MODE EXAMPLES
// ============================================

const TECHNICAL_EXAMPLES: TrainingExample[] = [
  {
    id: 'technical_001',
    category: 'technical',
    question: 'How does the detection algorithm work?',
    intent: 'advanced_mode',
    expectedResponse: 'Hydra uses a multi-head attention architecture with each head trained on specific manipulation signatures. The system processes transaction graphs in real-time using ensemble methods combining rule-based and ML-driven classifiers.',
    depth: 'technical',
    tags: ['technical', 'algorithm', 'hydra'],
  },
  {
    id: 'technical_002',
    category: 'technical',
    question: 'What ML models do you use?',
    intent: 'advanced_mode',
    expectedResponse: 'We use gradient-boosted ensembles for risk scoring, graph neural networks for entity clustering, and isolation forests with autoencoders for anomaly detection. Models are calibrated quarterly against labeled datasets.',
    depth: 'technical',
    tags: ['technical', 'ml', 'models'],
  },
  {
    id: 'technical_003',
    category: 'technical',
    question: 'Explain the clustering methodology',
    intent: 'advanced_mode',
    expectedResponse: 'Clustering employs hierarchical agglomerative methods on feature vectors derived from transaction graphs. Features include temporal patterns, gas preferences, contract signatures, and network centrality metrics with silhouette scoring validation.',
    depth: 'technical',
    tags: ['technical', 'clustering', 'methodology'],
  },
  {
    id: 'technical_004',
    category: 'technical',
    question: 'How is risk propagation computed?',
    intent: 'advanced_mode',
    expectedResponse: 'Risk propagation uses belief propagation on the entity graph with edge weights from transaction volume, frequency, and recency. The algorithm iteratively updates beliefs until convergence with damping factors to prevent oscillation.',
    depth: 'technical',
    tags: ['technical', 'risk', 'propagation'],
  },
  {
    id: 'technical_005',
    category: 'technical',
    question: 'What\'s the confidence calibration method?',
    intent: 'advanced_mode',
    expectedResponse: 'Confidence is computed as a weighted ensemble of individual head scores, adjusted using Bayesian updating based on entity history and network position. Calibration uses Platt scaling against historical precision-recall curves.',
    depth: 'technical',
    tags: ['technical', 'confidence', 'calibration'],
  },
  {
    id: 'technical_006',
    category: 'technical',
    question: 'How do you handle false positives?',
    intent: 'advanced_mode',
    expectedResponse: 'False positive rates are managed through threshold tuning on precision-recall curves, ensemble voting requirements, and temporal consistency checks. High-confidence alerts require multi-head consensus.',
    depth: 'technical',
    tags: ['technical', 'false_positives', 'accuracy'],
  },
  {
    id: 'technical_007',
    category: 'technical',
    question: 'What\'s the data pipeline architecture?',
    intent: 'advanced_mode',
    expectedResponse: 'The pipeline uses custom blockchain indexers feeding into a graph database with real-time streaming. ML inference runs on distributed infrastructure with sub-second latency for alert generation.',
    depth: 'technical',
    tags: ['technical', 'architecture', 'pipeline'],
  },
  {
    id: 'technical_008',
    category: 'technical',
    question: 'How does wash trading detection work technically?',
    intent: 'advanced_mode',
    expectedResponse: 'Wash trading detection uses graph analysis to identify circular transaction flows and temporal correlation analysis for coordinated self-trades. We compute transaction graph cycles and apply statistical tests against organic trading baselines.',
    depth: 'technical',
    tags: ['technical', 'wash_trading', 'detection'],
  },
  {
    id: 'technical_009',
    category: 'technical',
    question: 'What features are used for entity classification?',
    intent: 'advanced_mode',
    expectedResponse: 'Entity classification uses transaction graph metrics, behavioral anomaly scores, network centrality measures, sanctions proximity, temporal activity patterns, and cross-chain consistency indicators.',
    depth: 'technical',
    tags: ['technical', 'features', 'classification'],
  },
  {
    id: 'technical_010',
    category: 'technical',
    question: 'How do you validate model accuracy?',
    intent: 'advanced_mode',
    expectedResponse: 'Model validation uses backtesting against labeled manipulation events, cross-validation with stratified sampling, and ongoing monitoring of precision-recall metrics at various confidence thresholds.',
    depth: 'technical',
    tags: ['technical', 'validation', 'accuracy'],
  },
];

// ============================================
// H. INVESTOR MODE EXAMPLES
// ============================================

const INVESTOR_EXAMPLES: TrainingExample[] = [
  {
    id: 'investor_001',
    category: 'investor',
    question: 'Give me the 30-second pitch',
    intent: 'summary',
    expectedResponse: 'GhostQuant is the Bloomberg Terminal for crypto intelligence. We detect manipulation in real-time, map hidden entity relationships, and track whale movements - giving institutions the edge they need in crypto markets.',
    depth: 'standard',
    tags: ['investor', 'pitch', 'summary'],
  },
  {
    id: 'investor_002',
    category: 'investor',
    question: 'What\'s the competitive advantage?',
    intent: 'general',
    expectedResponse: 'Our multi-head Hydra engine catches manipulation that single-focus tools miss. Combined with entity fusion and whale tracking, we provide comprehensive intelligence no competitor matches.',
    depth: 'standard',
    tags: ['investor', 'competitive', 'advantage'],
  },
  {
    id: 'investor_003',
    category: 'investor',
    question: 'Who are your target customers?',
    intent: 'general',
    expectedResponse: 'We serve institutional investors, crypto funds, compliance teams, and sophisticated traders who need deep market intelligence. Our clients manage billions in crypto assets.',
    depth: 'standard',
    tags: ['investor', 'customers', 'market'],
  },
  {
    id: 'investor_004',
    category: 'investor',
    question: 'What\'s the business model?',
    intent: 'general',
    expectedResponse: 'SaaS subscription model with tiered pricing based on features and API access. Enterprise clients get custom integrations and dedicated support.',
    depth: 'standard',
    tags: ['investor', 'business', 'model'],
  },
  {
    id: 'investor_005',
    category: 'investor',
    question: 'How does this help compliance?',
    intent: 'general',
    expectedResponse: 'GhostQuant provides instant due diligence on any crypto address, sanctions screening, and audit trails. Compliance teams use it to screen counterparties and document risk assessments.',
    depth: 'standard',
    tags: ['investor', 'compliance', 'value'],
  },
  {
    id: 'investor_006',
    category: 'investor',
    question: 'What\'s the market opportunity?',
    intent: 'general',
    expectedResponse: 'The crypto intelligence market is growing rapidly as institutional adoption increases. Regulatory requirements are driving demand for compliance tools, and our platform addresses both needs.',
    depth: 'standard',
    tags: ['investor', 'market', 'opportunity'],
  },
  {
    id: 'investor_007',
    category: 'investor',
    question: 'Show me the key metrics',
    intent: 'dashboard',
    expectedResponse: 'The Analytics Dashboard shows real-time market health, threat detection rates, and whale activity. These metrics demonstrate our platform\'s comprehensive market coverage.',
    depth: 'standard',
    tags: ['investor', 'metrics', 'dashboard'],
  },
  {
    id: 'investor_008',
    category: 'investor',
    question: 'How do you validate accuracy?',
    intent: 'general',
    expectedResponse: 'Our detection has been validated against known manipulation events with over 90% precision at high-confidence thresholds. We continuously backtest against new labeled data.',
    depth: 'standard',
    tags: ['investor', 'validation', 'accuracy'],
  },
  {
    id: 'investor_009',
    category: 'investor',
    question: 'What makes the technology defensible?',
    intent: 'general',
    expectedResponse: 'Our proprietary multi-head architecture, extensive training data, and entity intelligence database create significant barriers. The network effects of our entity graph strengthen over time.',
    depth: 'standard',
    tags: ['investor', 'technology', 'moat'],
  },
  {
    id: 'investor_010',
    category: 'investor',
    question: 'Walk me through a demo',
    intent: 'summary',
    expectedResponse: 'I\'d be happy to! Let\'s start with the Analytics Dashboard for market overview, then I\'ll show you Hydra\'s threat detection, Constellation\'s entity mapping, and Whale Intelligence tracking.',
    depth: 'standard',
    tags: ['investor', 'demo', 'walkthrough'],
  },
];

// ============================================
// I. VAGUE QUESTION HANDLING
// ============================================

const VAGUE_EXAMPLES: TrainingExample[] = [
  {
    id: 'vague_001',
    category: 'vague',
    question: 'What\'s this?',
    intent: 'vague_recovery',
    expectedResponse: 'Based on where you are, I think you\'re looking at {context}. Would you like me to explain how it works?',
    depth: 'standard',
    tags: ['vague', 'context', 'clarification'],
  },
  {
    id: 'vague_002',
    category: 'vague',
    question: 'What am I looking at?',
    intent: 'vague_recovery',
    expectedResponse: 'You\'re on the {page_name}. This shows {page_description}. What aspect would you like to know more about?',
    depth: 'standard',
    tags: ['vague', 'orientation', 'context'],
  },
  {
    id: 'vague_003',
    category: 'vague',
    question: 'Explain this',
    intent: 'vague_recovery',
    expectedResponse: 'I\'d be happy to explain! Are you asking about {options}? Let me know which part interests you.',
    depth: 'standard',
    tags: ['vague', 'clarification', 'options'],
  },
  {
    id: 'vague_004',
    category: 'vague',
    question: 'Is this good or bad?',
    intent: 'vague_recovery',
    expectedResponse: 'Let me help you interpret that. Based on the context, {assessment}. Would you like more details on what this means?',
    depth: 'standard',
    tags: ['vague', 'assessment', 'interpretation'],
  },
  {
    id: 'vague_005',
    category: 'vague',
    question: 'Why is this high?',
    intent: 'vague_recovery',
    expectedResponse: 'The elevated value you\'re seeing is due to {reason}. This typically indicates {interpretation}. Want me to break it down further?',
    depth: 'standard',
    tags: ['vague', 'explanation', 'values'],
  },
  {
    id: 'vague_006',
    category: 'vague',
    question: 'Do I need to worry?',
    intent: 'vague_recovery',
    expectedResponse: 'Let me assess that for you. Based on what I see, {assessment}. I can explain the specific factors if that would help.',
    depth: 'standard',
    tags: ['vague', 'concern', 'assessment'],
  },
  {
    id: 'vague_007',
    category: 'vague',
    question: 'What does that mean?',
    intent: 'vague_recovery',
    expectedResponse: 'I think you\'re asking about {subject}. This means {explanation}. Does that answer your question?',
    depth: 'standard',
    tags: ['vague', 'meaning', 'explanation'],
  },
  {
    id: 'vague_008',
    category: 'vague',
    question: 'Tell me about this',
    intent: 'vague_recovery',
    expectedResponse: 'Sure! You\'re looking at {subject}. {description}. What specific aspect would you like to explore?',
    depth: 'standard',
    tags: ['vague', 'description', 'context'],
  },
  {
    id: 'vague_009',
    category: 'vague',
    question: 'What should I do?',
    intent: 'vague_recovery',
    expectedResponse: 'Based on what you\'re viewing, I\'d suggest {recommendation}. Would you like me to explain why or show you how?',
    depth: 'standard',
    tags: ['vague', 'recommendation', 'action'],
  },
  {
    id: 'vague_010',
    category: 'vague',
    question: 'Help',
    intent: 'help',
    expectedResponse: 'I\'m here to help! You\'re currently on {page_name}. Would you like an overview of what you can do here, or do you have a specific question?',
    depth: 'standard',
    tags: ['vague', 'help', 'support'],
  },
];

// ============================================
// J. CONFUSION RECOVERY
// ============================================

const CONFUSION_EXAMPLES: TrainingExample[] = [
  {
    id: 'confusion_001',
    category: 'confusion',
    question: 'I\'m confused',
    intent: 'vague_recovery',
    expectedResponse: 'No worries, I\'ve got you! Let me explain where you are and what you\'re looking at. {context_explanation}. What part would you like me to clarify?',
    depth: 'simple',
    tags: ['confusion', 'support', 'clarification'],
  },
  {
    id: 'confusion_002',
    category: 'confusion',
    question: 'I\'m lost',
    intent: 'vague_recovery',
    expectedResponse: 'Let me help you get oriented! You\'re on the {page_name}, which {page_purpose}. Would you like a quick tour or do you have something specific in mind?',
    depth: 'simple',
    tags: ['confusion', 'orientation', 'navigation'],
  },
  {
    id: 'confusion_003',
    category: 'confusion',
    question: 'This doesn\'t make sense',
    intent: 'beginner_mode',
    expectedResponse: 'Let\'s break it down together. Which part is confusing you? I can explain it in simpler terms.',
    depth: 'simple',
    tags: ['confusion', 'simplification', 'support'],
  },
  {
    id: 'confusion_004',
    category: 'confusion',
    question: 'I don\'t get it',
    intent: 'beginner_mode',
    expectedResponse: 'That\'s okay! Let me try explaining it differently. {simplified_explanation}. Does that make more sense?',
    depth: 'simple',
    tags: ['confusion', 'simplification', 'retry'],
  },
  {
    id: 'confusion_005',
    category: 'confusion',
    question: 'What?',
    intent: 'vague_recovery',
    expectedResponse: 'Let me clarify! I was explaining {topic}. Would you like me to break it down more simply?',
    depth: 'simple',
    tags: ['confusion', 'clarification', 'retry'],
  },
  {
    id: 'confusion_006',
    category: 'confusion',
    question: 'You lost me',
    intent: 'beginner_mode',
    expectedResponse: 'Sorry about that! Let me start over with the basics. {basic_explanation}. Better?',
    depth: 'simple',
    tags: ['confusion', 'restart', 'basics'],
  },
  {
    id: 'confusion_007',
    category: 'confusion',
    question: 'Too complicated',
    intent: 'beginner_mode',
    expectedResponse: 'Let me simplify! Think of it this way: {analogy}. Does that help?',
    depth: 'simple',
    tags: ['confusion', 'simplification', 'analogy'],
  },
  {
    id: 'confusion_008',
    category: 'confusion',
    question: 'Start over',
    intent: 'beginner_mode',
    expectedResponse: 'Fresh start! Let\'s begin with the basics. {basic_overview}. Ready to continue?',
    depth: 'simple',
    tags: ['confusion', 'restart', 'basics'],
  },
  {
    id: 'confusion_009',
    category: 'confusion',
    question: 'Huh?',
    intent: 'vague_recovery',
    expectedResponse: 'Let me try that again more clearly. {clearer_explanation}. Does that make sense now?',
    depth: 'simple',
    tags: ['confusion', 'clarification', 'retry'],
  },
  {
    id: 'confusion_010',
    category: 'confusion',
    question: 'I still don\'t understand',
    intent: 'beginner_mode',
    expectedResponse: 'No problem, let\'s approach this differently. {alternative_explanation}. Would an example help?',
    depth: 'simple',
    tags: ['confusion', 'alternative', 'example'],
  },
];

// ============================================
// COMBINED DATASET
// ============================================

export const TRAINING_DATASET: TrainingExample[] = [
  ...BASIC_PLATFORM_EXAMPLES,
  ...HYDRA_EXAMPLES,
  ...CONSTELLATION_EXAMPLES,
  ...ECOSCAN_EXAMPLES,
  ...RISK_SCORE_EXAMPLES,
  ...BEGINNER_EXAMPLES,
  ...TECHNICAL_EXAMPLES,
  ...INVESTOR_EXAMPLES,
  ...VAGUE_EXAMPLES,
  ...CONFUSION_EXAMPLES,
];

// ============================================
// DATASET FUNCTIONS
// ============================================

/**
 * Get examples by category
 */
export function getExamplesByCategory(category: string): TrainingExample[] {
  return TRAINING_DATASET.filter(ex => ex.category === category);
}

/**
 * Get examples by intent
 */
export function getExamplesByIntent(intent: string): TrainingExample[] {
  return TRAINING_DATASET.filter(ex => ex.intent === intent);
}

/**
 * Get examples by depth
 */
export function getExamplesByDepth(depth: TrainingExample['depth']): TrainingExample[] {
  return TRAINING_DATASET.filter(ex => ex.depth === depth);
}

/**
 * Get examples by tag
 */
export function getExamplesByTag(tag: string): TrainingExample[] {
  return TRAINING_DATASET.filter(ex => ex.tags.includes(tag));
}

/**
 * Search examples by question similarity
 */
export function searchExamples(query: string): TrainingExample[] {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/);
  
  return TRAINING_DATASET.filter(ex => {
    const lowerQuestion = ex.question.toLowerCase();
    return words.some(word => lowerQuestion.includes(word));
  }).sort((a, b) => {
    // Sort by number of matching words
    const aMatches = words.filter(w => a.question.toLowerCase().includes(w)).length;
    const bMatches = words.filter(w => b.question.toLowerCase().includes(w)).length;
    return bMatches - aMatches;
  });
}

/**
 * Get random example from category
 */
export function getRandomExample(category?: string): TrainingExample {
  const pool = category ? getExamplesByCategory(category) : TRAINING_DATASET;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get dataset statistics
 */
export function getDatasetStats(): {
  total: number;
  byCategory: Record<string, number>;
  byDepth: Record<string, number>;
  byIntent: Record<string, number>;
} {
  const byCategory: Record<string, number> = {};
  const byDepth: Record<string, number> = {};
  const byIntent: Record<string, number> = {};
  
  for (const ex of TRAINING_DATASET) {
    byCategory[ex.category] = (byCategory[ex.category] || 0) + 1;
    byDepth[ex.depth] = (byDepth[ex.depth] || 0) + 1;
    byIntent[ex.intent] = (byIntent[ex.intent] || 0) + 1;
  }
  
  return {
    total: TRAINING_DATASET.length,
    byCategory,
    byDepth,
    byIntent,
  };
}

// Export individual category arrays
export {
  BASIC_PLATFORM_EXAMPLES,
  HYDRA_EXAMPLES,
  CONSTELLATION_EXAMPLES,
  ECOSCAN_EXAMPLES,
  RISK_SCORE_EXAMPLES,
  BEGINNER_EXAMPLES,
  TECHNICAL_EXAMPLES,
  INVESTOR_EXAMPLES,
  VAGUE_EXAMPLES,
  CONFUSION_EXAMPLES,
};
