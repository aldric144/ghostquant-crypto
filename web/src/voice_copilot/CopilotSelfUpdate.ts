/**
 * CopilotSelfUpdate - Self-Updating Intelligence System
 * 
 * Capabilities:
 * 1. Check for changes in GhostQuant platform metadata
 * 2. Automatically update knowledge base sections when new pages/features appear
 * 3. Autogenerate simple explanations for newly added UI components
 * 4. Expand intents when new modules are added
 * 5. Store user preference data (preferred depth/tone)
 */

import { KnowledgeCategory, KnowledgeEntry } from './CopilotKnowledgeBase';
import { IntentPattern, IntentCategory } from './CopilotIntentModel';
import { ToneState } from './CopilotToneEngine';

// ============================================
// TYPES
// ============================================

export interface PlatformMetadata {
  version: string;
  lastUpdated: number;
  pages: PageMetadata[];
  features: FeatureMetadata[];
  components: ComponentMetadata[];
}

export interface PageMetadata {
  path: string;
  name: string;
  category: KnowledgeCategory;
  description: string;
  addedAt: number;
  isNew: boolean;
}

export interface FeatureMetadata {
  id: string;
  name: string;
  category: KnowledgeCategory;
  description: string;
  addedAt: number;
  isNew: boolean;
}

export interface ComponentMetadata {
  id: string;
  name: string;
  type: 'chart' | 'metric' | 'panel' | 'button' | 'input' | 'table' | 'graph';
  parentPage: string;
  description: string;
  addedAt: number;
}

export interface UserPreferences {
  userId: string;
  preferredDepth: 'simple' | 'standard' | 'technical';
  preferredTone: ToneState;
  showFollowUps: boolean;
  autoPlayVoice: boolean;
  favoriteTopics: string[];
  lastInteraction: number;
  totalQuestions: number;
  helpfulResponses: number;
  unhelpfulResponses: number;
}

export interface KnowledgeUpdate {
  type: 'add' | 'modify' | 'remove';
  category: KnowledgeCategory;
  entryId: string;
  entry?: Partial<KnowledgeEntry>;
  timestamp: number;
  source: 'auto' | 'manual';
}

export interface IntentUpdate {
  type: 'add' | 'modify' | 'remove';
  category: IntentCategory;
  pattern?: IntentPattern;
  timestamp: number;
  source: 'auto' | 'manual';
}

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
  PLATFORM_METADATA: 'ghostquant_copilot_platform_metadata',
  USER_PREFERENCES: 'ghostquant_copilot_user_preferences',
  KNOWLEDGE_UPDATES: 'ghostquant_copilot_knowledge_updates',
  INTENT_UPDATES: 'ghostquant_copilot_intent_updates',
  LAST_SYNC: 'ghostquant_copilot_last_sync',
};

// ============================================
// DEFAULT PLATFORM METADATA
// ============================================

const DEFAULT_PLATFORM_METADATA: PlatformMetadata = {
  version: '1.0.0',
  lastUpdated: Date.now(),
  pages: [
    { path: '/terminal/hydra', name: 'Hydra Console', category: 'hydra', description: 'Multi-head threat detection', addedAt: 0, isNew: false },
    { path: '/terminal/constellation', name: 'Constellation Map', category: 'constellation', description: 'Entity fusion and mapping', addedAt: 0, isNew: false },
    { path: '/terminal/analytics', name: 'Analytics Dashboard', category: 'analytics', description: 'Market intelligence overview', addedAt: 0, isNew: false },
    { path: '/terminal/whales', name: 'Whale Intelligence', category: 'whale_intel', description: 'Large holder tracking', addedAt: 0, isNew: false },
    { path: '/whale-intelligence', name: 'Whale Intelligence V2', category: 'whale_intel', description: 'Advanced whale tracking with metrics, heatmap, and live movements', addedAt: 0, isNew: false },
    { path: '/terminal/whale-intel', name: 'WIDB', category: 'whale_intel', description: 'Whale Intelligence Database', addedAt: 0, isNew: false },
    { path: '/terminal/entity', name: 'Entity Scanner', category: 'ecoscan', description: 'Entity risk assessment', addedAt: 0, isNew: false },
    { path: '/ecoscan', name: 'EcoScan', category: 'ecoscan', description: 'Wallet scanning tool', addedAt: 0, isNew: false },
    { path: '/influence-graph', name: 'Influence Graph', category: 'constellation', description: 'Entity relationship visualization', addedAt: 0, isNew: false },
    { path: '/threat-map', name: 'Threat Map', category: 'analytics', description: 'Geographic threat visualization', addedAt: 0, isNew: false },
  ],
  features: [
    { id: 'hydra_detection', name: 'Threat Detection', category: 'hydra', description: 'Real-time manipulation detection', addedAt: 0, isNew: false },
    { id: 'entity_clustering', name: 'Entity Clustering', category: 'constellation', description: 'Wallet grouping analysis', addedAt: 0, isNew: false },
    { id: 'risk_scoring', name: 'Risk Scoring', category: 'risk_scoring', description: 'Entity risk assessment', addedAt: 0, isNew: false },
    { id: 'whale_tracking', name: 'Whale Tracking', category: 'whale_intel', description: 'Large holder monitoring', addedAt: 0, isNew: false },
  ],
  components: [],
};

// ============================================
// DEFAULT USER PREFERENCES
// ============================================

const DEFAULT_USER_PREFERENCES: UserPreferences = {
  userId: 'default',
  preferredDepth: 'standard',
  preferredTone: 'conversational',
  showFollowUps: true,
  autoPlayVoice: true,
  favoriteTopics: [],
  lastInteraction: 0,
  totalQuestions: 0,
  helpfulResponses: 0,
  unhelpfulResponses: 0,
};

// ============================================
// STORAGE FUNCTIONS
// ============================================

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get item from storage
 */
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isStorageAvailable()) return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Set item in storage
 */
function setStorageItem<T>(key: string, value: T): boolean {
  if (!isStorageAvailable()) return false;
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ============================================
// PLATFORM METADATA FUNCTIONS
// ============================================

/**
 * Get current platform metadata
 */
export function getPlatformMetadata(): PlatformMetadata {
  return getStorageItem(STORAGE_KEYS.PLATFORM_METADATA, DEFAULT_PLATFORM_METADATA);
}

/**
 * Update platform metadata
 */
export function updatePlatformMetadata(updates: Partial<PlatformMetadata>): PlatformMetadata {
  const current = getPlatformMetadata();
  const updated = {
    ...current,
    ...updates,
    lastUpdated: Date.now(),
  };
  setStorageItem(STORAGE_KEYS.PLATFORM_METADATA, updated);
  return updated;
}

/**
 * Register a new page
 */
export function registerNewPage(page: Omit<PageMetadata, 'addedAt' | 'isNew'>): PageMetadata {
  const metadata = getPlatformMetadata();
  
  // Check if page already exists
  const existingIndex = metadata.pages.findIndex(p => p.path === page.path);
  
  const newPage: PageMetadata = {
    ...page,
    addedAt: Date.now(),
    isNew: true,
  };
  
  if (existingIndex >= 0) {
    metadata.pages[existingIndex] = newPage;
  } else {
    metadata.pages.push(newPage);
  }
  
  updatePlatformMetadata({ pages: metadata.pages });
  
  // Auto-generate knowledge entry
  autoGenerateKnowledgeEntry(newPage);
  
  return newPage;
}

/**
 * Register a new feature
 */
export function registerNewFeature(feature: Omit<FeatureMetadata, 'addedAt' | 'isNew'>): FeatureMetadata {
  const metadata = getPlatformMetadata();
  
  const existingIndex = metadata.features.findIndex(f => f.id === feature.id);
  
  const newFeature: FeatureMetadata = {
    ...feature,
    addedAt: Date.now(),
    isNew: true,
  };
  
  if (existingIndex >= 0) {
    metadata.features[existingIndex] = newFeature;
  } else {
    metadata.features.push(newFeature);
  }
  
  updatePlatformMetadata({ features: metadata.features });
  
  // Auto-generate intent patterns
  autoGenerateIntentPatterns(newFeature);
  
  return newFeature;
}

/**
 * Register a new UI component
 */
export function registerNewComponent(component: Omit<ComponentMetadata, 'addedAt'>): ComponentMetadata {
  const metadata = getPlatformMetadata();
  
  const newComponent: ComponentMetadata = {
    ...component,
    addedAt: Date.now(),
  };
  
  const existingIndex = metadata.components.findIndex(c => c.id === component.id);
  
  if (existingIndex >= 0) {
    metadata.components[existingIndex] = newComponent;
  } else {
    metadata.components.push(newComponent);
  }
  
  updatePlatformMetadata({ components: metadata.components });
  
  return newComponent;
}

/**
 * Get new pages (added recently)
 */
export function getNewPages(sinceDays: number = 7): PageMetadata[] {
  const metadata = getPlatformMetadata();
  const cutoff = Date.now() - (sinceDays * 24 * 60 * 60 * 1000);
  return metadata.pages.filter(p => p.addedAt > cutoff || p.isNew);
}

/**
 * Get new features (added recently)
 */
export function getNewFeatures(sinceDays: number = 7): FeatureMetadata[] {
  const metadata = getPlatformMetadata();
  const cutoff = Date.now() - (sinceDays * 24 * 60 * 60 * 1000);
  return metadata.features.filter(f => f.addedAt > cutoff || f.isNew);
}

/**
 * Mark pages as no longer new
 */
export function acknowledgeNewPages(): void {
  const metadata = getPlatformMetadata();
  metadata.pages = metadata.pages.map(p => ({ ...p, isNew: false }));
  updatePlatformMetadata({ pages: metadata.pages });
}

/**
 * Mark features as no longer new
 */
export function acknowledgeNewFeatures(): void {
  const metadata = getPlatformMetadata();
  metadata.features = metadata.features.map(f => ({ ...f, isNew: false }));
  updatePlatformMetadata({ features: metadata.features });
}

// ============================================
// USER PREFERENCES FUNCTIONS
// ============================================

/**
 * Get user preferences
 */
export function getUserPreferences(userId: string = 'default'): UserPreferences {
  const allPrefs = getStorageItem<Record<string, UserPreferences>>(
    STORAGE_KEYS.USER_PREFERENCES,
    { default: DEFAULT_USER_PREFERENCES }
  );
  return allPrefs[userId] || { ...DEFAULT_USER_PREFERENCES, userId };
}

/**
 * Update user preferences
 */
export function updateUserPreferences(
  userId: string,
  updates: Partial<UserPreferences>
): UserPreferences {
  const allPrefs = getStorageItem<Record<string, UserPreferences>>(
    STORAGE_KEYS.USER_PREFERENCES,
    { default: DEFAULT_USER_PREFERENCES }
  );
  
  const current = allPrefs[userId] || { ...DEFAULT_USER_PREFERENCES, userId };
  const updated = {
    ...current,
    ...updates,
    lastInteraction: Date.now(),
  };
  
  allPrefs[userId] = updated;
  setStorageItem(STORAGE_KEYS.USER_PREFERENCES, allPrefs);
  
  return updated;
}

/**
 * Record question asked
 */
export function recordQuestion(userId: string = 'default'): void {
  const prefs = getUserPreferences(userId);
  updateUserPreferences(userId, {
    totalQuestions: prefs.totalQuestions + 1,
    lastInteraction: Date.now(),
  });
}

/**
 * Record response feedback
 */
export function recordFeedback(userId: string, wasHelpful: boolean): void {
  const prefs = getUserPreferences(userId);
  updateUserPreferences(userId, {
    helpfulResponses: prefs.helpfulResponses + (wasHelpful ? 1 : 0),
    unhelpfulResponses: prefs.unhelpfulResponses + (wasHelpful ? 0 : 1),
  });
}

/**
 * Add favorite topic
 */
export function addFavoriteTopic(userId: string, topic: string): void {
  const prefs = getUserPreferences(userId);
  if (!prefs.favoriteTopics.includes(topic)) {
    updateUserPreferences(userId, {
      favoriteTopics: [...prefs.favoriteTopics, topic],
    });
  }
}

/**
 * Get user satisfaction rate
 */
export function getUserSatisfactionRate(userId: string = 'default'): number {
  const prefs = getUserPreferences(userId);
  const total = prefs.helpfulResponses + prefs.unhelpfulResponses;
  if (total === 0) return 1; // Default to 100% if no feedback
  return prefs.helpfulResponses / total;
}

// ============================================
// AUTO-GENERATION FUNCTIONS
// ============================================

/**
 * Auto-generate knowledge entry for new page
 */
function autoGenerateKnowledgeEntry(page: PageMetadata): KnowledgeUpdate {
  const update: KnowledgeUpdate = {
    type: 'add',
    category: page.category,
    entryId: `auto_${page.path.replace(/\//g, '_')}`,
    entry: {
      id: `auto_${page.path.replace(/\//g, '_')}`,
      category: page.category,
      keywords: [page.name.toLowerCase(), ...page.path.split('/').filter(Boolean)],
      simple: `${page.name} is a new feature in GhostQuant. ${page.description}.`,
      standard: `The ${page.name} provides ${page.description}. This is a recently added feature to enhance your GhostQuant experience.`,
      technical: `${page.name} (${page.path}) implements ${page.description}. This module was added to extend platform capabilities.`,
      investor: `${page.name} demonstrates our continued platform development, adding ${page.description} to our feature set.`,
      relatedTopics: [],
      pageContext: [page.path],
    },
    timestamp: Date.now(),
    source: 'auto',
  };
  
  // Store the update
  const updates = getStorageItem<KnowledgeUpdate[]>(STORAGE_KEYS.KNOWLEDGE_UPDATES, []);
  updates.push(update);
  setStorageItem(STORAGE_KEYS.KNOWLEDGE_UPDATES, updates);
  
  return update;
}

/**
 * Auto-generate intent patterns for new feature
 */
function autoGenerateIntentPatterns(feature: FeatureMetadata): IntentUpdate {
  const nameWords = feature.name.toLowerCase().split(/\s+/);
  const pattern = new RegExp(nameWords.join('.*'), 'i');
  
  const update: IntentUpdate = {
    type: 'add',
    category: feature.category as IntentCategory,
    pattern: {
      pattern,
      intent: feature.category as IntentCategory,
      confidence: 0.7,
      requiresContext: false,
    },
    timestamp: Date.now(),
    source: 'auto',
  };
  
  // Store the update
  const updates = getStorageItem<IntentUpdate[]>(STORAGE_KEYS.INTENT_UPDATES, []);
  updates.push(update);
  setStorageItem(STORAGE_KEYS.INTENT_UPDATES, updates);
  
  return update;
}

/**
 * Generate simple explanation for component
 */
export function generateComponentExplanation(component: ComponentMetadata): string {
  const typeDescriptions: Record<ComponentMetadata['type'], string> = {
    chart: 'visual representation of data',
    metric: 'key performance indicator',
    panel: 'information display section',
    button: 'action trigger',
    input: 'data entry field',
    table: 'structured data display',
    graph: 'relationship visualization',
  };
  
  const typeDesc = typeDescriptions[component.type] || 'interface element';
  return `The ${component.name} is a ${typeDesc} that ${component.description}. You can find it on the ${component.parentPage} page.`;
}

// ============================================
// SYNC FUNCTIONS
// ============================================

/**
 * Get last sync timestamp
 */
export function getLastSyncTime(): number {
  return getStorageItem(STORAGE_KEYS.LAST_SYNC, 0);
}

/**
 * Update last sync timestamp
 */
export function updateLastSyncTime(): void {
  setStorageItem(STORAGE_KEYS.LAST_SYNC, Date.now());
}

/**
 * Check if sync is needed
 */
export function isSyncNeeded(maxAgeHours: number = 24): boolean {
  const lastSync = getLastSyncTime();
  const maxAge = maxAgeHours * 60 * 60 * 1000;
  return Date.now() - lastSync > maxAge;
}

/**
 * Get pending knowledge updates
 */
export function getPendingKnowledgeUpdates(): KnowledgeUpdate[] {
  return getStorageItem<KnowledgeUpdate[]>(STORAGE_KEYS.KNOWLEDGE_UPDATES, []);
}

/**
 * Get pending intent updates
 */
export function getPendingIntentUpdates(): IntentUpdate[] {
  return getStorageItem<IntentUpdate[]>(STORAGE_KEYS.INTENT_UPDATES, []);
}

/**
 * Clear pending updates after processing
 */
export function clearPendingUpdates(): void {
  setStorageItem(STORAGE_KEYS.KNOWLEDGE_UPDATES, []);
  setStorageItem(STORAGE_KEYS.INTENT_UPDATES, []);
  updateLastSyncTime();
}

// ============================================
// ANALYTICS FUNCTIONS
// ============================================

/**
 * Get usage statistics
 */
export function getUsageStats(): {
  totalUsers: number;
  totalQuestions: number;
  averageSatisfaction: number;
  popularTopics: string[];
} {
  const allPrefs = getStorageItem<Record<string, UserPreferences>>(
    STORAGE_KEYS.USER_PREFERENCES,
    {}
  );
  
  const users = Object.values(allPrefs);
  const totalQuestions = users.reduce((sum, u) => sum + u.totalQuestions, 0);
  const totalHelpful = users.reduce((sum, u) => sum + u.helpfulResponses, 0);
  const totalUnhelpful = users.reduce((sum, u) => sum + u.unhelpfulResponses, 0);
  const totalFeedback = totalHelpful + totalUnhelpful;
  
  // Count topic frequency
  const topicCounts: Record<string, number> = {};
  for (const user of users) {
    for (const topic of user.favoriteTopics) {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }
  }
  
  const popularTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic]) => topic);
  
  return {
    totalUsers: users.length,
    totalQuestions,
    averageSatisfaction: totalFeedback > 0 ? totalHelpful / totalFeedback : 1,
    popularTopics,
  };
}

/**
 * Export all data for backup
 */
export function exportAllData(): {
  metadata: PlatformMetadata;
  preferences: Record<string, UserPreferences>;
  knowledgeUpdates: KnowledgeUpdate[];
  intentUpdates: IntentUpdate[];
} {
  return {
    metadata: getPlatformMetadata(),
    preferences: getStorageItem(STORAGE_KEYS.USER_PREFERENCES, {}),
    knowledgeUpdates: getPendingKnowledgeUpdates(),
    intentUpdates: getPendingIntentUpdates(),
  };
}

/**
 * Import data from backup
 */
export function importData(data: ReturnType<typeof exportAllData>): void {
  if (data.metadata) {
    setStorageItem(STORAGE_KEYS.PLATFORM_METADATA, data.metadata);
  }
  if (data.preferences) {
    setStorageItem(STORAGE_KEYS.USER_PREFERENCES, data.preferences);
  }
  if (data.knowledgeUpdates) {
    setStorageItem(STORAGE_KEYS.KNOWLEDGE_UPDATES, data.knowledgeUpdates);
  }
  if (data.intentUpdates) {
    setStorageItem(STORAGE_KEYS.INTENT_UPDATES, data.intentUpdates);
  }
}

// Export storage keys for testing
export { STORAGE_KEYS, DEFAULT_PLATFORM_METADATA, DEFAULT_USER_PREFERENCES };
