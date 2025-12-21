/**
 * CopilotIntentModel - Natural Language Intent Recognition
 * 
 * Maps vague or unclear questions to correct internal intents using
 * pattern matching and contextual inference.
 * 
 * INTENT GROUPS:
 * 1. Hydra Questions
 * 2. Constellation Map Questions
 * 3. EcoScan Questions
 * 4. Risk Score Questions
 * 5. Whale Intelligence Questions
 * 6. Dashboard Explanation Questions
 * 7. Beginner Mode Requests
 * 8. Advanced Mode Requests
 * 9. Summary/Recap Requests
 * 10. Navigation Intents
 * 11. Vagueness Recovery Intents
 * 12. Contextual Inference Intents
 * 
 * Phase 1 Intelligence Expansion:
 * - Added 30+ new intent categories for all GhostQuant modules
 * - Integrated with GhostQuantModuleRegistry for module-based intent matching
 */

import { findBestMatch, MODULE_REGISTRY, type ModuleEntry } from './knowledge/GhostQuantModuleRegistry';

export type IntentCategory = 
  | 'hydra'
  | 'constellation'
  | 'ecoscan'
  | 'risk_score'
  | 'whale_intel'
  | 'dashboard'
  | 'beginner_mode'
  | 'advanced_mode'
  | 'summary'
  | 'navigation'
  | 'vague_recovery'
  | 'contextual'
  | 'greeting'
  | 'help'
  | 'unknown'
  // Phase 3 Real-Time Intelligence Awareness - New Intent Categories
  | 'ui_explanation'
  | 'intelligence_summary'
  | 'alert_explanation'
  | 'fusion_engine'
  | 'entity_query'
  // Phase 1 Intelligence Expansion - New Intent Categories
  | 'sentinel'
  | 'predict'
  | 'radar'
  | 'rings'
  | 'ultrafusion'
  | 'valkyrie'
  | 'phantom'
  | 'map'
  | 'timeline'
  | 'graph'
  | 'entity'
  | 'token'
  | 'contracts'
  | 'binder'
  | 'exporter'
  | 'dataroom'
  | 'compliance'
  | 'home'
  | 'ghostmind'
  | 'copilot'
  | 'settings'
  | 'billing'
  | 'pricing'
  | 'licenses'
  | 'config'
  | 'secrets'
  | 'partners'
  | 'deck'
  | 'pitchdeck'
  | 'proposals'
  | 'rfp'
  | 'demo_mode'
  | 'health';

export interface IntentPattern {
  pattern: RegExp;
  intent: IntentCategory;
  subIntent?: string;
  confidence: number;
  requiresContext?: boolean;
}

export interface RecognizedIntent {
  category: IntentCategory;
  subIntent?: string;
  confidence: number;
  originalQuery: string;
  extractedEntities: ExtractedEntity[];
  requiresContext: boolean;
  suggestedDepth: 'simple' | 'standard' | 'technical';
}

export interface ExtractedEntity {
  type: 'address' | 'asset' | 'number' | 'timeframe' | 'action' | 'page';
  value: string;
  position: number;
}

// ============================================
// INTENT PATTERNS
// ============================================

const HYDRA_PATTERNS: IntentPattern[] = [
  { pattern: /hydra/i, intent: 'hydra', confidence: 0.9 },
  { pattern: /threat\s*detection/i, intent: 'hydra', confidence: 0.85 },
  { pattern: /manipulation\s*detect/i, intent: 'hydra', confidence: 0.85 },
  { pattern: /multi.?head/i, intent: 'hydra', confidence: 0.8 },
  { pattern: /wash\s*trad/i, intent: 'hydra', subIntent: 'wash_trading', confidence: 0.9 },
  { pattern: /spoof/i, intent: 'hydra', subIntent: 'spoofing', confidence: 0.9 },
  { pattern: /pump.?and.?dump|pump.?dump/i, intent: 'hydra', subIntent: 'pump_dump', confidence: 0.9 },
  { pattern: /detection\s*head/i, intent: 'hydra', subIntent: 'heads', confidence: 0.85 },
  { pattern: /confidence\s*score/i, intent: 'hydra', subIntent: 'confidence', confidence: 0.8 },
  { pattern: /alert|warning|flag/i, intent: 'hydra', subIntent: 'alerts', confidence: 0.6, requiresContext: true },
];

const CONSTELLATION_PATTERNS: IntentPattern[] = [
  { pattern: /constellation/i, intent: 'constellation', confidence: 0.9 },
  { pattern: /entity\s*(map|graph|network|fusion)/i, intent: 'constellation', confidence: 0.85 },
  { pattern: /cluster/i, intent: 'constellation', subIntent: 'clustering', confidence: 0.8 },
  { pattern: /connection|connected|relationship/i, intent: 'constellation', subIntent: 'connections', confidence: 0.7, requiresContext: true },
  { pattern: /graph\s*(view|visual|map)/i, intent: 'constellation', confidence: 0.8 },
  { pattern: /risk\s*propagat/i, intent: 'constellation', subIntent: 'risk_propagation', confidence: 0.85 },
  { pattern: /entity\s*link/i, intent: 'constellation', confidence: 0.8 },
  { pattern: /wallet\s*(network|graph|map)/i, intent: 'constellation', confidence: 0.8 },
];

const ECOSCAN_PATTERNS: IntentPattern[] = [
  { pattern: /ecoscan/i, intent: 'ecoscan', confidence: 0.9 },
  { pattern: /scan\s*(this|an?)?\s*(address|wallet|entity)/i, intent: 'ecoscan', confidence: 0.85 },
  { pattern: /check\s*(this|an?)?\s*(address|wallet)/i, intent: 'ecoscan', confidence: 0.8 },
  { pattern: /background\s*check/i, intent: 'ecoscan', confidence: 0.8 },
  { pattern: /due\s*diligence/i, intent: 'ecoscan', confidence: 0.8 },
  { pattern: /anomal/i, intent: 'ecoscan', subIntent: 'anomaly', confidence: 0.75, requiresContext: true },
  { pattern: /suspicious\s*activit/i, intent: 'ecoscan', subIntent: 'suspicious', confidence: 0.8 },
  { pattern: /entity\s*(scan|check|analys)/i, intent: 'ecoscan', confidence: 0.85 },
];

const RISK_SCORE_PATTERNS: IntentPattern[] = [
  { pattern: /risk\s*score/i, intent: 'risk_score', confidence: 0.9 },
  { pattern: /risk\s*(level|rating|assessment)/i, intent: 'risk_score', confidence: 0.85 },
  { pattern: /how\s*risky/i, intent: 'risk_score', confidence: 0.85 },
  { pattern: /is\s*(this|it)\s*(safe|risky|dangerous)/i, intent: 'risk_score', confidence: 0.8 },
  { pattern: /risk\s*factor/i, intent: 'risk_score', subIntent: 'factors', confidence: 0.85 },
  { pattern: /why\s*(is|was)\s*(the|this)?\s*risk/i, intent: 'risk_score', subIntent: 'explanation', confidence: 0.85 },
  { pattern: /score\s*(mean|indicate|show)/i, intent: 'risk_score', subIntent: 'explanation', confidence: 0.8 },
];

const WHALE_INTEL_PATTERNS: IntentPattern[] = [
  { pattern: /whale/i, intent: 'whale_intel', confidence: 0.9 },
  { pattern: /large\s*holder/i, intent: 'whale_intel', confidence: 0.85 },
  { pattern: /big\s*(wallet|player|holder)/i, intent: 'whale_intel', confidence: 0.85 },
  { pattern: /widb/i, intent: 'whale_intel', subIntent: 'database', confidence: 0.9 },
  { pattern: /whale\s*(movement|activit|track)/i, intent: 'whale_intel', subIntent: 'movements', confidence: 0.9 },
  { pattern: /accumulation|distribution/i, intent: 'whale_intel', subIntent: 'flow', confidence: 0.8 },
  { pattern: /market\s*impact/i, intent: 'whale_intel', subIntent: 'impact', confidence: 0.75 },
];

const DASHBOARD_PATTERNS: IntentPattern[] = [
  { pattern: /dashboard/i, intent: 'dashboard', confidence: 0.9 },
  { pattern: /analytics/i, intent: 'dashboard', confidence: 0.85 },
  { pattern: /market\s*(overview|summary|health)/i, intent: 'dashboard', confidence: 0.85 },
  { pattern: /risk\s*index/i, intent: 'dashboard', subIntent: 'risk_index', confidence: 0.85 },
  { pattern: /global\s*risk/i, intent: 'dashboard', subIntent: 'risk_index', confidence: 0.85 },
  { pattern: /anomaly\s*feed/i, intent: 'dashboard', subIntent: 'anomaly_feed', confidence: 0.9 },
  { pattern: /alert\s*feed/i, intent: 'dashboard', subIntent: 'anomaly_feed', confidence: 0.85 },
];

const BEGINNER_MODE_PATTERNS: IntentPattern[] = [
  { pattern: /simple|simplify|simpler/i, intent: 'beginner_mode', confidence: 0.85 },
  { pattern: /easy|easier/i, intent: 'beginner_mode', confidence: 0.8 },
  { pattern: /beginner|basic/i, intent: 'beginner_mode', confidence: 0.9 },
  { pattern: /explain\s*(like|as\s*if)\s*(i'?m|a)\s*(5|five|new|beginner)/i, intent: 'beginner_mode', confidence: 0.95 },
  { pattern: /dumb\s*(it\s*)?down/i, intent: 'beginner_mode', confidence: 0.9 },
  { pattern: /i'?m\s*(new|confused|lost)/i, intent: 'beginner_mode', confidence: 0.85 },
  { pattern: /don'?t\s*understand/i, intent: 'beginner_mode', confidence: 0.85 },
  { pattern: /what\s*does\s*(this|that)\s*mean/i, intent: 'beginner_mode', confidence: 0.75, requiresContext: true },
  { pattern: /in\s*plain\s*(english|terms)/i, intent: 'beginner_mode', confidence: 0.9 },
];

const ADVANCED_MODE_PATTERNS: IntentPattern[] = [
  { pattern: /technical|technically/i, intent: 'advanced_mode', confidence: 0.85 },
  { pattern: /advanced|expert/i, intent: 'advanced_mode', confidence: 0.9 },
  { pattern: /deep\s*dive|go\s*deeper/i, intent: 'advanced_mode', confidence: 0.9 },
  { pattern: /more\s*detail/i, intent: 'advanced_mode', confidence: 0.85 },
  { pattern: /how\s*does\s*(it|this)\s*(actually|really)\s*work/i, intent: 'advanced_mode', confidence: 0.85 },
  { pattern: /under\s*the\s*hood/i, intent: 'advanced_mode', confidence: 0.9 },
  { pattern: /algorithm|methodology/i, intent: 'advanced_mode', confidence: 0.8 },
  { pattern: /quant|quantitative/i, intent: 'advanced_mode', confidence: 0.85 },
];

const SUMMARY_PATTERNS: IntentPattern[] = [
  { pattern: /summar|recap/i, intent: 'summary', confidence: 0.9 },
  { pattern: /brief(ing)?/i, intent: 'summary', confidence: 0.85 },
  { pattern: /overview/i, intent: 'summary', confidence: 0.8 },
  { pattern: /what'?s\s*(happening|going\s*on)/i, intent: 'summary', confidence: 0.8 },
  { pattern: /catch\s*me\s*up/i, intent: 'summary', confidence: 0.9 },
  { pattern: /quick\s*(update|summary|overview)/i, intent: 'summary', confidence: 0.9 },
  { pattern: /30\s*second/i, intent: 'summary', subIntent: 'briefing', confidence: 0.9 },
  { pattern: /tldr|tl;?dr/i, intent: 'summary', confidence: 0.9 },
];

const NAVIGATION_PATTERNS: IntentPattern[] = [
  { pattern: /go\s*to|take\s*me\s*to|navigate\s*to|open/i, intent: 'navigation', confidence: 0.9 },
  { pattern: /show\s*(me)?\s*(the)?/i, intent: 'navigation', confidence: 0.7, requiresContext: true },
  { pattern: /where\s*(is|can\s*i\s*find)/i, intent: 'navigation', confidence: 0.85 },
  { pattern: /how\s*do\s*i\s*(get\s*to|access|find)/i, intent: 'navigation', confidence: 0.85 },
];

const VAGUE_RECOVERY_PATTERNS: IntentPattern[] = [
  { pattern: /^what'?s?\s*this\??$/i, intent: 'vague_recovery', subIntent: 'this', confidence: 0.9, requiresContext: true },
  { pattern: /^what\s*(is|are)\s*(this|that|these|those)\??$/i, intent: 'vague_recovery', subIntent: 'this', confidence: 0.9, requiresContext: true },
  { pattern: /^explain\s*(this|that)\.?$/i, intent: 'vague_recovery', subIntent: 'explain', confidence: 0.9, requiresContext: true },
  { pattern: /^what\s*am\s*i\s*looking\s*at\??$/i, intent: 'vague_recovery', subIntent: 'looking_at', confidence: 0.95, requiresContext: true },
  { pattern: /^what\s*does\s*(this|that)\s*(do|mean)\??$/i, intent: 'vague_recovery', subIntent: 'meaning', confidence: 0.9, requiresContext: true },
  { pattern: /^why\s*(is|are)\s*(this|that|it)\s*(high|low|red|green|elevated)\??$/i, intent: 'vague_recovery', subIntent: 'why_value', confidence: 0.9, requiresContext: true },
  { pattern: /^is\s*(this|that|it)\s*(good|bad|okay|normal)\??$/i, intent: 'vague_recovery', subIntent: 'assessment', confidence: 0.9, requiresContext: true },
  { pattern: /^should\s*i\s*(worry|be\s*concerned)\??$/i, intent: 'vague_recovery', subIntent: 'concern', confidence: 0.9, requiresContext: true },
  { pattern: /^help\.?$/i, intent: 'vague_recovery', subIntent: 'help', confidence: 0.9 },
  { pattern: /^i'?m\s*(confused|lost)\.?$/i, intent: 'vague_recovery', subIntent: 'confused', confidence: 0.9 },
  // Phase 2 Conversational Engine - Extended vague question patterns
  { pattern: /^what\s*(is\s*)?(happening|going\s*on)\s*(here)?\??$/i, intent: 'vague_recovery', subIntent: 'happening', confidence: 0.9, requiresContext: true },
  { pattern: /^(can\s*you\s*)?(simplify|make\s*it\s*simpler)\s*(that|this)?\??$/i, intent: 'vague_recovery', subIntent: 'simplify', confidence: 0.9, requiresContext: true },
  { pattern: /^tell\s*me\s*more\.?$/i, intent: 'vague_recovery', subIntent: 'elaborate', confidence: 0.9, requiresContext: true },
  { pattern: /^(go\s*on|continue|and\??)\s*$/i, intent: 'vague_recovery', subIntent: 'continue', confidence: 0.85, requiresContext: true },
  { pattern: /^compare\s*(this|that|it)\s*to\s*(yesterday|last\s*week|before)\.?$/i, intent: 'vague_recovery', subIntent: 'compare', confidence: 0.9, requiresContext: true },
  { pattern: /^(what|how)\s*about\s*(this|that|the\s*other)\.?$/i, intent: 'vague_recovery', subIntent: 'about', confidence: 0.85, requiresContext: true },
  { pattern: /^(so|okay|alright)\s*(what|now)\??$/i, intent: 'vague_recovery', subIntent: 'next', confidence: 0.8, requiresContext: true },
  { pattern: /^(huh|what|sorry)\??$/i, intent: 'vague_recovery', subIntent: 'repeat', confidence: 0.85, requiresContext: true },
  { pattern: /^(say\s*that\s*again|repeat\s*that|come\s*again)\.?$/i, intent: 'vague_recovery', subIntent: 'repeat', confidence: 0.9 },
  { pattern: /^(why|how\s*come)\??$/i, intent: 'vague_recovery', subIntent: 'why', confidence: 0.8, requiresContext: true },
];

const CONTEXTUAL_PATTERNS: IntentPattern[] = [
  { pattern: /this\s*(page|screen|view)/i, intent: 'contextual', subIntent: 'current_page', confidence: 0.9, requiresContext: true },
  { pattern: /where\s*am\s*i/i, intent: 'contextual', subIntent: 'location', confidence: 0.9 },
  { pattern: /what\s*(page|screen)\s*(is\s*this|am\s*i\s*on)/i, intent: 'contextual', subIntent: 'location', confidence: 0.9 },
  { pattern: /the\s*(chart|graph|number|metric|score)/i, intent: 'contextual', subIntent: 'element', confidence: 0.8, requiresContext: true },
  { pattern: /this\s*(entity|wallet|address|cluster)/i, intent: 'contextual', subIntent: 'selected_entity', confidence: 0.85, requiresContext: true },
];

// ============================================
// PHASE 3 REAL-TIME INTELLIGENCE AWARENESS - NEW PATTERNS
// ============================================

const UI_EXPLANATION_PATTERNS: IntentPattern[] = [
  // "What am I looking at?" patterns
  { pattern: /^what\s*(am\s*i|are\s*we)\s*(looking\s*at|seeing)\??$/i, intent: 'ui_explanation', subIntent: 'explain_view', confidence: 0.95, requiresContext: true },
  { pattern: /^what\s*(is\s*this|does\s*this\s*show)\??$/i, intent: 'ui_explanation', subIntent: 'explain_view', confidence: 0.9, requiresContext: true },
  { pattern: /^explain\s*(this|what\s*i'?m\s*seeing)\.?$/i, intent: 'ui_explanation', subIntent: 'explain_view', confidence: 0.95, requiresContext: true },
  
  // "Explain this chart" patterns
  { pattern: /^explain\s*(this\s*)?(chart|graph|visualization)\.?$/i, intent: 'ui_explanation', subIntent: 'explain_chart', confidence: 0.95, requiresContext: true },
  { pattern: /^what\s*(does\s*)?(this\s*)?(chart|graph)\s*(show|mean)\??$/i, intent: 'ui_explanation', subIntent: 'explain_chart', confidence: 0.9, requiresContext: true },
  { pattern: /^(describe|interpret)\s*(this\s*)?(chart|graph)\.?$/i, intent: 'ui_explanation', subIntent: 'explain_chart', confidence: 0.9, requiresContext: true },
  
  // "Explain this spike" patterns
  { pattern: /^explain\s*(this\s*)?(spike|jump|drop|dip|surge)\.?$/i, intent: 'ui_explanation', subIntent: 'explain_spike', confidence: 0.95, requiresContext: true },
  { pattern: /^what\s*(caused|is)\s*(this\s*)?(spike|jump|drop|dip|surge)\??$/i, intent: 'ui_explanation', subIntent: 'explain_spike', confidence: 0.9, requiresContext: true },
  { pattern: /^why\s*(did\s*)?(it|this)\s*(spike|jump|drop|dip|surge)\??$/i, intent: 'ui_explanation', subIntent: 'explain_spike', confidence: 0.9, requiresContext: true },
  
  // "Why is this risk level high?" patterns
  { pattern: /^why\s*(is\s*)?(this\s*)?(risk|threat)\s*(level\s*)?(high|elevated|critical)\??$/i, intent: 'ui_explanation', subIntent: 'explain_risk', confidence: 0.95, requiresContext: true },
  { pattern: /^what\s*(makes|caused)\s*(this\s*)?(risk|threat)\s*(level\s*)?(high|elevated)\??$/i, intent: 'ui_explanation', subIntent: 'explain_risk', confidence: 0.9, requiresContext: true },
  { pattern: /^explain\s*(the\s*)?(high\s*)?(risk|threat)\s*(level)?\.?$/i, intent: 'ui_explanation', subIntent: 'explain_risk', confidence: 0.85, requiresContext: true },
  
  // "What is this map showing?" patterns
  { pattern: /^what\s*(is\s*)?(this\s*)?(map|heatmap)\s*(showing|displaying)\??$/i, intent: 'ui_explanation', subIntent: 'explain_heatmap', confidence: 0.95, requiresContext: true },
  { pattern: /^explain\s*(this\s*)?(heat)?map\.?$/i, intent: 'ui_explanation', subIntent: 'explain_heatmap', confidence: 0.9, requiresContext: true },
  { pattern: /^(describe|interpret)\s*(the\s*)?(heat)?map\.?$/i, intent: 'ui_explanation', subIntent: 'explain_heatmap', confidence: 0.85, requiresContext: true },
  
  // "Interpret this dashboard" patterns
  { pattern: /^(interpret|explain)\s*(this\s*)?dashboard\.?$/i, intent: 'ui_explanation', subIntent: 'explain_dashboard', confidence: 0.95, requiresContext: true },
  { pattern: /^what\s*(does\s*)?(this\s*)?dashboard\s*(show|mean)\??$/i, intent: 'ui_explanation', subIntent: 'explain_dashboard', confidence: 0.9, requiresContext: true },
  { pattern: /^walk\s*me\s*through\s*(this\s*)?dashboard\.?$/i, intent: 'ui_explanation', subIntent: 'explain_dashboard', confidence: 0.9, requiresContext: true },
];

const INTELLIGENCE_SUMMARY_PATTERNS: IntentPattern[] = [
  // "Summarize the current picture" patterns
  { pattern: /^summarize\s*(the\s*)?(current\s*)?(picture|situation|status)\.?$/i, intent: 'intelligence_summary', subIntent: 'summarize', confidence: 0.95 },
  { pattern: /^give\s*me\s*(a\s*)?(the\s*)?(high[- ]?level\s*)?(summary|overview)\.?$/i, intent: 'intelligence_summary', subIntent: 'summarize', confidence: 0.95 },
  { pattern: /^what'?s\s*(the\s*)?(current\s*)?(situation|status|picture)\??$/i, intent: 'intelligence_summary', subIntent: 'summarize', confidence: 0.9 },
  { pattern: /^(brief|quick)\s*me\.?$/i, intent: 'intelligence_summary', subIntent: 'summarize', confidence: 0.85 },
  
  // "What's happening right now?" patterns
  { pattern: /^what'?s\s*happening\s*(right\s*now|currently|at\s*the\s*moment)\??$/i, intent: 'intelligence_summary', subIntent: 'current_activity', confidence: 0.95 },
  { pattern: /^what\s*(is|are)\s*(going\s*on|the\s*latest)\??$/i, intent: 'intelligence_summary', subIntent: 'current_activity', confidence: 0.9 },
  { pattern: /^(any|what)\s*(new\s*)?(activity|developments|updates)\??$/i, intent: 'intelligence_summary', subIntent: 'current_activity', confidence: 0.85 },
];

const ALERT_EXPLANATION_PATTERNS: IntentPattern[] = [
  // "What does this alert mean?" patterns
  { pattern: /^what\s*(does\s*)?(this\s*)?alert\s*(mean|indicate)\??$/i, intent: 'alert_explanation', subIntent: 'explain_alert', confidence: 0.95, requiresContext: true },
  { pattern: /^explain\s*(this\s*)?alert\.?$/i, intent: 'alert_explanation', subIntent: 'explain_alert', confidence: 0.95, requiresContext: true },
  { pattern: /^(describe|interpret)\s*(this\s*)?alert\.?$/i, intent: 'alert_explanation', subIntent: 'explain_alert', confidence: 0.9, requiresContext: true },
  { pattern: /^why\s*(am\s*i|are\s*we)\s*(seeing\s*)?(this\s*)?alert\??$/i, intent: 'alert_explanation', subIntent: 'explain_alert', confidence: 0.9, requiresContext: true },
  
  // Alert severity patterns
  { pattern: /^(how\s*)?(serious|critical|urgent)\s*(is\s*)?(this\s*)?alert\??$/i, intent: 'alert_explanation', subIntent: 'alert_severity', confidence: 0.9, requiresContext: true },
  { pattern: /^should\s*i\s*(be\s*)?(worried|concerned)\s*(about\s*)?(this\s*)?alert\??$/i, intent: 'alert_explanation', subIntent: 'alert_severity', confidence: 0.85, requiresContext: true },
];

const FUSION_ENGINE_PATTERNS: IntentPattern[] = [
  // "Explain the Fusion Engine activity" patterns
  { pattern: /^explain\s*(the\s*)?(fusion\s*engine|constellation)\s*(activity)?\??$/i, intent: 'fusion_engine', subIntent: 'fusion', confidence: 0.95 },
  { pattern: /^what\s*(is\s*)?(the\s*)?(fusion\s*engine|constellation)\s*(detecting|showing|doing)\??$/i, intent: 'fusion_engine', subIntent: 'fusion', confidence: 0.95 },
  { pattern: /^(describe|interpret)\s*(the\s*)?(fusion\s*engine|constellation)\.?$/i, intent: 'fusion_engine', subIntent: 'fusion', confidence: 0.9 },
  { pattern: /^what\s*(patterns|connections|clusters)\s*(is\s*)?(the\s*)?(fusion\s*engine|constellation)\s*(finding|detecting)\??$/i, intent: 'fusion_engine', subIntent: 'fusion_patterns', confidence: 0.9 },
];

const ENTITY_EXPLANATION_PATTERNS: IntentPattern[] = [
  // "Why is this entity high-risk?" patterns
  { pattern: /^why\s*(is\s*)?(this\s*)?(entity|wallet|address)\s*(high[- ]?risk|risky|flagged)\??$/i, intent: 'entity_query', subIntent: 'entity_risk', confidence: 0.95, requiresContext: true },
  { pattern: /^what\s*(makes|caused)\s*(this\s*)?(entity|wallet|address)\s*(high[- ]?risk|risky)\??$/i, intent: 'entity_query', subIntent: 'entity_risk', confidence: 0.9, requiresContext: true },
  { pattern: /^explain\s*(the\s*)?(risk\s*for\s*)?(this\s*)?(entity|wallet|address)\.?$/i, intent: 'entity_query', subIntent: 'entity_risk', confidence: 0.85, requiresContext: true },
  
  // Entity description patterns
  { pattern: /^(describe|explain|tell\s*me\s*about)\s*(this\s*)?(entity|wallet|address)\.?$/i, intent: 'entity_query', subIntent: 'entity_description', confidence: 0.9, requiresContext: true },
  { pattern: /^what\s*(do\s*we\s*know\s*about|is)\s*(this\s*)?(entity|wallet|address)\??$/i, intent: 'entity_query', subIntent: 'entity_description', confidence: 0.85, requiresContext: true },
  { pattern: /^who\s*(is|owns)\s*(this\s*)?(entity|wallet|address)\??$/i, intent: 'entity_query', subIntent: 'entity_identity', confidence: 0.85, requiresContext: true },
];

const GREETING_PATTERNS: IntentPattern[] = [
  { pattern: /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening))\.?$/i, intent: 'greeting', confidence: 0.95 },
  { pattern: /^how\s*are\s*you\??$/i, intent: 'greeting', confidence: 0.9 },
  { pattern: /^what'?s\s*up\??$/i, intent: 'greeting', confidence: 0.85 },
];

const HELP_PATTERNS: IntentPattern[] = [
  { pattern: /^help\s*me\.?$/i, intent: 'help', confidence: 0.9 },
  { pattern: /what\s*can\s*you\s*(do|help\s*with)/i, intent: 'help', confidence: 0.9 },
  { pattern: /how\s*do\s*i\s*use\s*(this|you|ghostquant)/i, intent: 'help', confidence: 0.85 },
  { pattern: /getting\s*started/i, intent: 'help', confidence: 0.85 },
  { pattern: /tutorial/i, intent: 'help', confidence: 0.8 },
];

// ============================================
// PHASE 1 INTELLIGENCE EXPANSION - NEW PATTERNS
// ============================================

const SENTINEL_PATTERNS: IntentPattern[] = [
  { pattern: /sentinel/i, intent: 'sentinel', confidence: 0.9 },
  { pattern: /command\s*console/i, intent: 'sentinel', confidence: 0.85 },
  { pattern: /global\s*threat\s*level/i, intent: 'sentinel', confidence: 0.9 },
  { pattern: /active\s*engines/i, intent: 'sentinel', confidence: 0.8 },
  { pattern: /system\s*status/i, intent: 'sentinel', confidence: 0.75 },
  { pattern: /fusion\s*score/i, intent: 'sentinel', confidence: 0.85 },
];

const PREDICT_PATTERNS: IntentPattern[] = [
  { pattern: /predict/i, intent: 'predict', confidence: 0.9 },
  { pattern: /prediction/i, intent: 'predict', confidence: 0.9 },
  { pattern: /forecast/i, intent: 'predict', confidence: 0.85 },
  { pattern: /price\s*direction/i, intent: 'predict', confidence: 0.85 },
  { pattern: /manipulation\s*risk/i, intent: 'predict', confidence: 0.8 },
  { pattern: /champion\s*model/i, intent: 'predict', confidence: 0.9 },
];

const RADAR_PATTERNS: IntentPattern[] = [
  { pattern: /radar/i, intent: 'radar', confidence: 0.9 },
  { pattern: /manipulation\s*radar/i, intent: 'radar', confidence: 0.95 },
  { pattern: /heatmap/i, intent: 'radar', confidence: 0.85 },
  { pattern: /manipulation\s*spike/i, intent: 'radar', confidence: 0.9 },
  { pattern: /volatility\s*spike/i, intent: 'radar', confidence: 0.85 },
];

const RINGS_PATTERNS: IntentPattern[] = [
  { pattern: /ring\s*detect/i, intent: 'rings', confidence: 0.9 },
  { pattern: /manipulation\s*ring/i, intent: 'rings', confidence: 0.95 },
  { pattern: /coordinated\s*(wallet|cluster)/i, intent: 'rings', confidence: 0.9 },
  { pattern: /ring\s*severity/i, intent: 'rings', confidence: 0.85 },
];

const ULTRAFUSION_PATTERNS: IntentPattern[] = [
  { pattern: /ultrafusion/i, intent: 'ultrafusion', confidence: 0.95 },
  { pattern: /ultra\s*fusion/i, intent: 'ultrafusion', confidence: 0.95 },
  { pattern: /multi.?source\s*fusion/i, intent: 'ultrafusion', confidence: 0.9 },
  { pattern: /unified\s*threat/i, intent: 'ultrafusion', confidence: 0.85 },
];

const VALKYRIE_PATTERNS: IntentPattern[] = [
  { pattern: /valkyrie/i, intent: 'valkyrie', confidence: 0.95 },
  { pattern: /threat\s*response/i, intent: 'valkyrie', confidence: 0.85 },
  { pattern: /mitigation/i, intent: 'valkyrie', confidence: 0.8 },
];

const PHANTOM_PATTERNS: IntentPattern[] = [
  { pattern: /phantom/i, intent: 'phantom', confidence: 0.95 },
  { pattern: /stealth\s*monitor/i, intent: 'phantom', confidence: 0.9 },
  { pattern: /dark\s*pool/i, intent: 'phantom', confidence: 0.85 },
  { pattern: /hidden\s*transaction/i, intent: 'phantom', confidence: 0.85 },
  { pattern: /obfuscated/i, intent: 'phantom', confidence: 0.8 },
];

const MAP_PATTERNS: IntentPattern[] = [
  { pattern: /threat\s*map/i, intent: 'map', confidence: 0.9 },
  { pattern: /global\s*map/i, intent: 'map', confidence: 0.85 },
  { pattern: /geographic/i, intent: 'map', confidence: 0.8 },
  { pattern: /globe/i, intent: 'map', confidence: 0.8 },
  { pattern: /regional\s*hotspot/i, intent: 'map', confidence: 0.85 },
];

const TIMELINE_PATTERNS: IntentPattern[] = [
  { pattern: /timeline/i, intent: 'timeline', confidence: 0.9 },
  { pattern: /ai\s*timeline/i, intent: 'timeline', confidence: 0.95 },
  { pattern: /event\s*stream/i, intent: 'timeline', confidence: 0.85 },
  { pattern: /chronological/i, intent: 'timeline', confidence: 0.8 },
  { pattern: /recent\s*events/i, intent: 'timeline', confidence: 0.8 },
];

const GRAPH_PATTERNS: IntentPattern[] = [
  { pattern: /influence\s*graph/i, intent: 'graph', confidence: 0.95 },
  { pattern: /network\s*graph/i, intent: 'graph', confidence: 0.9 },
  { pattern: /node\s*connection/i, intent: 'graph', confidence: 0.85 },
  { pattern: /entity\s*graph/i, intent: 'graph', confidence: 0.9 },
];

const ENTITY_PATTERNS_INTENT: IntentPattern[] = [
  { pattern: /entity\s*scanner/i, intent: 'entity', confidence: 0.9 },
  { pattern: /entity\s*analysis/i, intent: 'entity', confidence: 0.9 },
  { pattern: /entity\s*breakdown/i, intent: 'entity', confidence: 0.85 },
  { pattern: /activity\s*log/i, intent: 'entity', confidence: 0.8 },
];

const TOKEN_PATTERNS: IntentPattern[] = [
  { pattern: /token\s*intelligence/i, intent: 'token', confidence: 0.9 },
  { pattern: /token\s*analysis/i, intent: 'token', confidence: 0.9 },
  { pattern: /token\s*metrics/i, intent: 'token', confidence: 0.85 },
  { pattern: /token\s*risk/i, intent: 'token', confidence: 0.85 },
];

const CONTRACTS_PATTERNS: IntentPattern[] = [
  { pattern: /smart\s*contract/i, intent: 'contracts', confidence: 0.9 },
  { pattern: /contract\s*analysis/i, intent: 'contracts', confidence: 0.9 },
  { pattern: /contract\s*vulnerabilit/i, intent: 'contracts', confidence: 0.9 },
  { pattern: /malicious\s*code/i, intent: 'contracts', confidence: 0.85 },
];

const BINDER_PATTERNS: IntentPattern[] = [
  { pattern: /data\s*binder/i, intent: 'binder', confidence: 0.9 },
  { pattern: /bind\s*data/i, intent: 'binder', confidence: 0.85 },
  { pattern: /aggregate\s*report/i, intent: 'binder', confidence: 0.8 },
];

const EXPORTER_PATTERNS: IntentPattern[] = [
  { pattern: /export/i, intent: 'exporter', confidence: 0.85 },
  { pattern: /download\s*report/i, intent: 'exporter', confidence: 0.9 },
  { pattern: /csv/i, intent: 'exporter', confidence: 0.8 },
  { pattern: /compliance\s*export/i, intent: 'exporter', confidence: 0.9 },
];

const DATAROOM_PATTERNS: IntentPattern[] = [
  { pattern: /data\s*room/i, intent: 'dataroom', confidence: 0.9 },
  { pattern: /dataroom/i, intent: 'dataroom', confidence: 0.95 },
  { pattern: /share\s*report/i, intent: 'dataroom', confidence: 0.8 },
  { pattern: /stored\s*intelligence/i, intent: 'dataroom', confidence: 0.85 },
];

const COMPLIANCE_PATTERNS: IntentPattern[] = [
  { pattern: /compliance\s*report/i, intent: 'compliance', confidence: 0.95 },
  { pattern: /regulatory/i, intent: 'compliance', confidence: 0.85 },
  { pattern: /audit\s*trail/i, intent: 'compliance', confidence: 0.9 },
  { pattern: /compliance\s*document/i, intent: 'compliance', confidence: 0.9 },
];

const HOME_PATTERNS: IntentPattern[] = [
  { pattern: /terminal\s*home/i, intent: 'home', confidence: 0.9 },
  { pattern: /home\s*page/i, intent: 'home', confidence: 0.85 },
  { pattern: /main\s*dashboard/i, intent: 'home', confidence: 0.8 },
  { pattern: /quick\s*action/i, intent: 'home', confidence: 0.75 },
];

const GHOSTMIND_PATTERNS: IntentPattern[] = [
  { pattern: /ghostmind/i, intent: 'ghostmind', confidence: 0.95 },
  { pattern: /ghost\s*mind/i, intent: 'ghostmind', confidence: 0.95 },
  { pattern: /ai\s*chat/i, intent: 'ghostmind', confidence: 0.8 },
  { pattern: /ai\s*assistant/i, intent: 'ghostmind', confidence: 0.8 },
];

const COPILOT_PATTERNS: IntentPattern[] = [
  { pattern: /voice\s*copilot/i, intent: 'copilot', confidence: 0.95 },
  { pattern: /copilot/i, intent: 'copilot', confidence: 0.9 },
  { pattern: /wake\s*word/i, intent: 'copilot', confidence: 0.85 },
  { pattern: /hey\s*ghost/i, intent: 'copilot', confidence: 0.9 },
  { pattern: /voice\s*command/i, intent: 'copilot', confidence: 0.85 },
];

const SETTINGS_PATTERNS: IntentPattern[] = [
  { pattern: /settings/i, intent: 'settings', confidence: 0.9 },
  { pattern: /preferences/i, intent: 'settings', confidence: 0.85 },
  { pattern: /configuration/i, intent: 'settings', confidence: 0.8 },
  { pattern: /customize/i, intent: 'settings', confidence: 0.75 },
];

const BILLING_PATTERNS: IntentPattern[] = [
  { pattern: /billing/i, intent: 'billing', confidence: 0.9 },
  { pattern: /subscription/i, intent: 'billing', confidence: 0.85 },
  { pattern: /payment/i, intent: 'billing', confidence: 0.85 },
  { pattern: /upgrade\s*plan/i, intent: 'billing', confidence: 0.9 },
];

const PRICING_PATTERNS: IntentPattern[] = [
  { pattern: /pricing/i, intent: 'pricing', confidence: 0.9 },
  { pattern: /price/i, intent: 'pricing', confidence: 0.8 },
  { pattern: /cost/i, intent: 'pricing', confidence: 0.75 },
  { pattern: /plans?\s*available/i, intent: 'pricing', confidence: 0.85 },
];

const LICENSES_PATTERNS: IntentPattern[] = [
  { pattern: /license/i, intent: 'licenses', confidence: 0.9 },
  { pattern: /api\s*key/i, intent: 'licenses', confidence: 0.85 },
  { pattern: /access\s*token/i, intent: 'licenses', confidence: 0.85 },
];

const CONFIG_PATTERNS: IntentPattern[] = [
  { pattern: /config/i, intent: 'config', confidence: 0.85 },
  { pattern: /advanced\s*settings/i, intent: 'config', confidence: 0.9 },
  { pattern: /system\s*config/i, intent: 'config', confidence: 0.9 },
];

const SECRETS_PATTERNS: IntentPattern[] = [
  { pattern: /secrets?\s*manager/i, intent: 'secrets', confidence: 0.9 },
  { pattern: /credentials/i, intent: 'secrets', confidence: 0.85 },
  { pattern: /vault/i, intent: 'secrets', confidence: 0.8 },
];

const PARTNERS_PATTERNS: IntentPattern[] = [
  { pattern: /partner/i, intent: 'partners', confidence: 0.85 },
  { pattern: /channel\s*partner/i, intent: 'partners', confidence: 0.9 },
  { pattern: /reseller/i, intent: 'partners', confidence: 0.85 },
  { pattern: /affiliate/i, intent: 'partners', confidence: 0.8 },
];

const DECK_PATTERNS: IntentPattern[] = [
  { pattern: /pitch\s*deck/i, intent: 'deck', confidence: 0.95 },
  { pattern: /presentation/i, intent: 'deck', confidence: 0.8 },
  { pattern: /investor\s*materials/i, intent: 'deck', confidence: 0.9 },
  { pattern: /slides/i, intent: 'deck', confidence: 0.75 },
];

const PITCHDECK_PATTERNS: IntentPattern[] = [
  { pattern: /deck\s*builder/i, intent: 'pitchdeck', confidence: 0.9 },
  { pattern: /build\s*deck/i, intent: 'pitchdeck', confidence: 0.85 },
  { pattern: /create\s*presentation/i, intent: 'pitchdeck', confidence: 0.85 },
];

const PROPOSALS_PATTERNS: IntentPattern[] = [
  { pattern: /proposal/i, intent: 'proposals', confidence: 0.9 },
  { pattern: /quote/i, intent: 'proposals', confidence: 0.8 },
  { pattern: /enterprise\s*sales/i, intent: 'proposals', confidence: 0.85 },
];

const RFP_PATTERNS: IntentPattern[] = [
  { pattern: /rfp/i, intent: 'rfp', confidence: 0.9 },
  { pattern: /request\s*for\s*proposal/i, intent: 'rfp', confidence: 0.95 },
  { pattern: /bid/i, intent: 'rfp', confidence: 0.75 },
  { pattern: /tender/i, intent: 'rfp', confidence: 0.8 },
];

const DEMO_MODE_PATTERNS: IntentPattern[] = [
  { pattern: /demo\s*mode/i, intent: 'demo_mode', confidence: 0.95 },
  { pattern: /demonstration/i, intent: 'demo_mode', confidence: 0.85 },
  { pattern: /show\s*me\s*a\s*demo/i, intent: 'demo_mode', confidence: 0.9 },
  { pattern: /trial/i, intent: 'demo_mode', confidence: 0.75 },
];

const HEALTH_PATTERNS: IntentPattern[] = [
  { pattern: /system\s*health/i, intent: 'health', confidence: 0.9 },
  { pattern: /service\s*status/i, intent: 'health', confidence: 0.85 },
  { pattern: /uptime/i, intent: 'health', confidence: 0.8 },
  { pattern: /diagnostics/i, intent: 'health', confidence: 0.85 },
  { pattern: /is\s*everything\s*working/i, intent: 'health', confidence: 0.85 },
];

// Combine all patterns
const ALL_PATTERNS: IntentPattern[] = [
  ...HYDRA_PATTERNS,
  ...CONSTELLATION_PATTERNS,
  ...ECOSCAN_PATTERNS,
  ...RISK_SCORE_PATTERNS,
  ...WHALE_INTEL_PATTERNS,
  ...DASHBOARD_PATTERNS,
  ...BEGINNER_MODE_PATTERNS,
  ...ADVANCED_MODE_PATTERNS,
  ...SUMMARY_PATTERNS,
  ...NAVIGATION_PATTERNS,
  ...VAGUE_RECOVERY_PATTERNS,
  ...CONTEXTUAL_PATTERNS,
  // Phase 3 Real-Time Intelligence Awareness - New Patterns
  ...UI_EXPLANATION_PATTERNS,
  ...INTELLIGENCE_SUMMARY_PATTERNS,
  ...ALERT_EXPLANATION_PATTERNS,
  ...FUSION_ENGINE_PATTERNS,
  ...ENTITY_EXPLANATION_PATTERNS,
  ...GREETING_PATTERNS,
  ...HELP_PATTERNS,
  // Phase 1 Intelligence Expansion - New Patterns
  ...SENTINEL_PATTERNS,
  ...PREDICT_PATTERNS,
  ...RADAR_PATTERNS,
  ...RINGS_PATTERNS,
  ...ULTRAFUSION_PATTERNS,
  ...VALKYRIE_PATTERNS,
  ...PHANTOM_PATTERNS,
  ...MAP_PATTERNS,
  ...TIMELINE_PATTERNS,
  ...GRAPH_PATTERNS,
  ...ENTITY_PATTERNS_INTENT,
  ...TOKEN_PATTERNS,
  ...CONTRACTS_PATTERNS,
  ...BINDER_PATTERNS,
  ...EXPORTER_PATTERNS,
  ...DATAROOM_PATTERNS,
  ...COMPLIANCE_PATTERNS,
  ...HOME_PATTERNS,
  ...GHOSTMIND_PATTERNS,
  ...COPILOT_PATTERNS,
  ...SETTINGS_PATTERNS,
  ...BILLING_PATTERNS,
  ...PRICING_PATTERNS,
  ...LICENSES_PATTERNS,
  ...CONFIG_PATTERNS,
  ...SECRETS_PATTERNS,
  ...PARTNERS_PATTERNS,
  ...DECK_PATTERNS,
  ...PITCHDECK_PATTERNS,
  ...PROPOSALS_PATTERNS,
  ...RFP_PATTERNS,
  ...DEMO_MODE_PATTERNS,
  ...HEALTH_PATTERNS,
];

// ============================================
// ENTITY EXTRACTION
// ============================================

const ENTITY_PATTERNS = {
  address: /\b(0x[a-fA-F0-9]{40})\b/g,
  asset: /\b(BTC|ETH|SOL|USDT|USDC|BNB|XRP|ADA|DOGE|DOT|MATIC|AVAX|LINK|UNI|AAVE)\b/gi,
  number: /\b(\d+(?:\.\d+)?)\b/g,
  timeframe: /\b(today|yesterday|this\s*week|last\s*week|this\s*month|last\s*month|\d+\s*(hour|day|week|month)s?\s*ago)\b/gi,
  action: /\b(buy|sell|transfer|swap|stake|unstake|deposit|withdraw)\b/gi,
  page: /\b(hydra|constellation|analytics|dashboard|whale|widb|ecoscan|entity|graph|map)\b/gi,
};

function extractEntities(query: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  
  for (const [type, pattern] of Object.entries(ENTITY_PATTERNS)) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(query)) !== null) {
      entities.push({
        type: type as ExtractedEntity['type'],
        value: match[1] || match[0],
        position: match.index,
      });
    }
  }
  
  return entities.sort((a, b) => a.position - b.position);
}

// ============================================
// INTENT RECOGNITION FUNCTIONS
// ============================================

/**
 * Recognize intent from user query
 */
export function recognizeIntent(query: string, pageContext?: string): RecognizedIntent {
  const normalizedQuery = query.trim();
  const extractedEntities = extractEntities(normalizedQuery);
  
  // Find all matching patterns
  const matches: { pattern: IntentPattern; match: RegExpMatchArray }[] = [];
  
  for (const intentPattern of ALL_PATTERNS) {
    const match = normalizedQuery.match(intentPattern.pattern);
    if (match) {
      matches.push({ pattern: intentPattern, match });
    }
  }
  
  // Sort by confidence and select best match
  matches.sort((a, b) => b.pattern.confidence - a.pattern.confidence);
  
  if (matches.length === 0) {
    // No pattern matched - return unknown with context requirement
    return {
      category: 'unknown',
      confidence: 0,
      originalQuery: normalizedQuery,
      extractedEntities,
      requiresContext: true,
      suggestedDepth: 'standard',
    };
  }
  
  const bestMatch = matches[0];
  
  // Determine suggested depth based on intent
  let suggestedDepth: 'simple' | 'standard' | 'technical' = 'standard';
  if (bestMatch.pattern.intent === 'beginner_mode') {
    suggestedDepth = 'simple';
  } else if (bestMatch.pattern.intent === 'advanced_mode') {
    suggestedDepth = 'technical';
  }
  
  // Boost confidence if page context matches intent
  let confidence = bestMatch.pattern.confidence;
  if (pageContext) {
    if (
      (bestMatch.pattern.intent === 'hydra' && pageContext.includes('hydra')) ||
      (bestMatch.pattern.intent === 'constellation' && (pageContext.includes('constellation') || pageContext.includes('graph'))) ||
      (bestMatch.pattern.intent === 'ecoscan' && (pageContext.includes('ecoscan') || pageContext.includes('entity'))) ||
      (bestMatch.pattern.intent === 'whale_intel' && pageContext.includes('whale')) ||
      (bestMatch.pattern.intent === 'dashboard' && pageContext.includes('analytics'))
    ) {
      confidence = Math.min(1, confidence + 0.1);
    }
  }
  
  return {
    category: bestMatch.pattern.intent,
    subIntent: bestMatch.pattern.subIntent,
    confidence,
    originalQuery: normalizedQuery,
    extractedEntities,
    requiresContext: bestMatch.pattern.requiresContext || false,
    suggestedDepth,
  };
}

/**
 * Check if query is a mode switch request
 */
export function isModeSwitch(query: string): { isSwitch: boolean; mode?: 'simple' | 'technical' } {
  const beginnerMatch = BEGINNER_MODE_PATTERNS.some(p => p.pattern.test(query));
  const advancedMatch = ADVANCED_MODE_PATTERNS.some(p => p.pattern.test(query));
  
  if (beginnerMatch) {
    return { isSwitch: true, mode: 'simple' };
  }
  if (advancedMatch) {
    return { isSwitch: true, mode: 'technical' };
  }
  
  return { isSwitch: false };
}

/**
 * Check if query is a navigation request
 */
export function isNavigationRequest(query: string): { isNavigation: boolean; destination?: string } {
  const navMatch = NAVIGATION_PATTERNS.some(p => p.pattern.test(query));
  
  if (!navMatch) {
    return { isNavigation: false };
  }
  
  // Extract destination - Phase 1 Intelligence Expansion: Added all 40+ module destinations
  const destinations: Record<string, string> = {
    // Core Intelligence Engines
    hydra: '/terminal/hydra',
    constellation: '/terminal/constellation',
    ecoscan: '/ecoscan',
    whale: '/terminal/whales',
    widb: '/terminal/whale-intel',
    sentinel: '/terminal/sentinel',
    predict: '/terminal/predict',
    radar: '/terminal/radar',
    rings: '/ring-detector',
    ultrafusion: '/terminal/ultrafusion',
    valkyrie: '/terminal/valkyrie',
    phantom: '/terminal/phantom',
    // Market + Blockchain Intelligence
    analytics: '/terminal/analytics',
    dashboard: '/terminal/analytics',
    map: '/threat-map',
    timeline: '/ai-timeline',
    graph: '/influence-graph',
    entity: '/entity-explorer',
    entityexplorer: '/entity-explorer',
    token: '/terminal/token',
    contracts: '/terminal/contracts',
    binder: '/terminal/binder',
    exporter: '/terminal/exporter',
    dataroom: '/terminal/dataroom',
    compliance: '/terminal/compliance-report',
    // UI-Driven Systems
    home: '/terminal/home',
    ghostmind: '/terminal/ghostmind',
    settings: '/terminal/settings',
    billing: '/terminal/billing',
    pricing: '/terminal/pricing',
    licenses: '/terminal/licenses',
    config: '/terminal/config',
    // System Intelligence + Diagnostics
    secrets: '/terminal/secrets',
    partners: '/terminal/partners',
    deck: '/terminal/deck',
    pitchdeck: '/terminal/pitchdeck',
    proposals: '/terminal/proposals',
    rfp: '/terminal/rfp',
  };
  
  for (const [keyword, path] of Object.entries(destinations)) {
    if (query.toLowerCase().includes(keyword)) {
      return { isNavigation: true, destination: path };
    }
  }
  
  return { isNavigation: true };
}

/**
 * Check if query is vague and needs context
 */
export function isVagueQuery(query: string): boolean {
  return VAGUE_RECOVERY_PATTERNS.some(p => p.pattern.test(query));
}

/**
 * Get intent category display name
 */
export function getIntentDisplayName(category: IntentCategory): string {
  const names: Record<IntentCategory, string> = {
    hydra: 'Hydra Threat Detection',
    constellation: 'Constellation Entity Mapping',
    ecoscan: 'EcoScan Analysis',
    risk_score: 'Risk Scoring',
    whale_intel: 'Whale Intelligence',
    dashboard: 'Analytics Dashboard',
    beginner_mode: 'Beginner Mode',
    advanced_mode: 'Advanced Mode',
    summary: 'Summary Request',
    navigation: 'Navigation',
    vague_recovery: 'Clarification Needed',
    contextual: 'Context-Based Query',
    greeting: 'Greeting',
    help: 'Help Request',
    unknown: 'Unknown Intent',
    // Phase 3 Real-Time Intelligence Awareness - New Intent Display Names
    ui_explanation: 'UI Explanation',
    intelligence_summary: 'Intelligence Summary',
    alert_explanation: 'Alert Explanation',
    fusion_engine: 'Fusion Engine Query',
    entity_query: 'Entity Query',
    // Phase 1 Intelligence Expansion - New Intent Display Names
    sentinel: 'Sentinel Command Console',
    predict: 'Prediction Console',
    radar: 'Global Manipulation Radar',
    rings: 'Ring Detector',
    ultrafusion: 'UltraFusion',
    valkyrie: 'Valkyrie',
    phantom: 'Phantom',
    map: 'Global Threat Map',
    timeline: 'AI Timeline',
    graph: 'Influence Graph',
    entity: 'Entity Scanner',
    token: 'Token Intelligence',
    contracts: 'Smart Contracts',
    binder: 'Data Binder',
    exporter: 'Data Exporter',
    dataroom: 'Data Room',
    compliance: 'Compliance Report',
    home: 'Terminal Home',
    ghostmind: 'GhostMind AI',
    copilot: 'Voice Copilot',
    settings: 'Settings',
    billing: 'Billing',
    pricing: 'Pricing',
    licenses: 'Licenses',
    config: 'Configuration',
    secrets: 'Secrets Manager',
    partners: 'Partners',
    deck: 'Pitch Deck',
    pitchdeck: 'Pitch Deck Builder',
    proposals: 'Proposals',
    rfp: 'RFP Manager',
    demo_mode: 'Demo Mode',
    health: 'System Health',
  };
  return names[category];
}

/**
 * Suggest follow-up intents based on current intent
 */
export function suggestFollowUpIntents(currentIntent: IntentCategory): IntentCategory[] {
  const followUps: Partial<Record<IntentCategory, IntentCategory[]>> = {
    hydra: ['risk_score', 'constellation', 'summary'],
    constellation: ['ecoscan', 'risk_score', 'whale_intel'],
    ecoscan: ['risk_score', 'constellation', 'whale_intel'],
    risk_score: ['ecoscan', 'hydra', 'constellation'],
    whale_intel: ['constellation', 'risk_score', 'dashboard'],
    dashboard: ['hydra', 'whale_intel', 'summary'],
    beginner_mode: ['help', 'summary', 'dashboard'],
    advanced_mode: ['hydra', 'constellation', 'risk_score'],
    summary: ['dashboard', 'hydra', 'whale_intel'],
    navigation: ['help', 'summary'],
    vague_recovery: ['help', 'beginner_mode'],
    contextual: ['summary', 'help'],
    greeting: ['help', 'summary', 'dashboard'],
    help: ['beginner_mode', 'summary', 'navigation'],
    unknown: ['help', 'beginner_mode'],
    // Phase 3 Real-Time Intelligence Awareness - New Follow-up Suggestions
    ui_explanation: ['intelligence_summary', 'help', 'contextual'],
    intelligence_summary: ['ui_explanation', 'dashboard', 'alert_explanation'],
    alert_explanation: ['intelligence_summary', 'risk_score', 'help'],
    fusion_engine: ['constellation', 'intelligence_summary', 'entity_query'],
    entity_query: ['constellation', 'risk_score', 'whale_intel'],
    // Phase 1 Intelligence Expansion - New Follow-up Suggestions
    sentinel: ['hydra', 'radar', 'health'],
    predict: ['dashboard', 'risk_score', 'timeline'],
    radar: ['hydra', 'rings', 'map'],
    rings: ['constellation', 'hydra', 'graph'],
    ultrafusion: ['hydra', 'constellation', 'sentinel'],
    valkyrie: ['sentinel', 'hydra', 'health'],
    phantom: ['whale_intel', 'map', 'rings'],
    map: ['radar', 'timeline', 'dashboard'],
    timeline: ['dashboard', 'sentinel', 'summary'],
    graph: ['constellation', 'entity', 'rings'],
    entity: ['ecoscan', 'constellation', 'risk_score'],
    token: ['predict', 'dashboard', 'risk_score'],
    contracts: ['ecoscan', 'entity', 'risk_score'],
    binder: ['exporter', 'dataroom', 'compliance'],
    exporter: ['binder', 'dataroom', 'compliance'],
    dataroom: ['exporter', 'compliance', 'binder'],
    compliance: ['exporter', 'dataroom', 'entity'],
    home: ['dashboard', 'sentinel', 'help'],
    ghostmind: ['copilot', 'help', 'summary'],
    copilot: ['ghostmind', 'help', 'settings'],
    settings: ['config', 'billing', 'licenses'],
    billing: ['pricing', 'licenses', 'settings'],
    pricing: ['billing', 'licenses', 'settings'],
    licenses: ['billing', 'settings', 'config'],
    config: ['settings', 'secrets', 'licenses'],
    secrets: ['config', 'licenses', 'settings'],
    partners: ['proposals', 'rfp', 'deck'],
    deck: ['pitchdeck', 'proposals', 'partners'],
    pitchdeck: ['deck', 'proposals', 'dataroom'],
    proposals: ['rfp', 'partners', 'deck'],
    rfp: ['proposals', 'partners', 'compliance'],
    demo_mode: ['home', 'dashboard', 'help'],
    health: ['sentinel', 'config', 'settings'],
  };
  
  return followUps[currentIntent] || ['help'];
}

// Export pattern arrays for testing/extension
export {
  HYDRA_PATTERNS,
  CONSTELLATION_PATTERNS,
  ECOSCAN_PATTERNS,
  RISK_SCORE_PATTERNS,
  WHALE_INTEL_PATTERNS,
  DASHBOARD_PATTERNS,
  BEGINNER_MODE_PATTERNS,
  ADVANCED_MODE_PATTERNS,
  SUMMARY_PATTERNS,
  NAVIGATION_PATTERNS,
  VAGUE_RECOVERY_PATTERNS,
  CONTEXTUAL_PATTERNS,
  GREETING_PATTERNS,
  HELP_PATTERNS,
  ALL_PATTERNS,
};
