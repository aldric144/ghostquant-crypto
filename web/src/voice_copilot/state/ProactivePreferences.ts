/**
 * ProactivePreferences.ts
 * 
 * Phase 5: Proactive Intelligence & Autonomous Alerting Engine
 * 
 * Features:
 * - Enable/disable proactive alerts
 * - Choose alert categories
 * - Choose briefing frequency
 * - LocalStorage persistence
 * 
 * Defaults:
 * - Proactive alerts ON
 * - Briefings every 60 minutes
 * 
 * Logging prefix: [ProactivePrefs]
 */

import type { EventCategory, SeverityLevel } from '../proactive/IntelEventClassifier';
import type { BriefingType } from '../proactive/IntelBriefingScheduler';

// ============================================================
// Types
// ============================================================

export interface AlertCategoryPreference {
  category: EventCategory;
  enabled: boolean;
  minSeverity: SeverityLevel;
}

export interface BriefingPreference {
  type: BriefingType;
  enabled: boolean;
  intervalMinutes: number;
}

export interface ProactivePreferencesData {
  // Master toggles
  proactiveAlertsEnabled: boolean;
  briefingsEnabled: boolean;
  
  // Alert preferences
  alertCategories: AlertCategoryPreference[];
  globalMinSeverity: SeverityLevel;
  muteAlertsDuringBriefings: boolean;
  
  // Briefing preferences
  briefings: BriefingPreference[];
  defaultBriefingIntervalMinutes: number;
  
  // Rate limiting
  maxAlertsPerHour: number;
  minAlertIntervalSeconds: number;
  criticalBypassRateLimit: boolean;
  
  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:MM format
  quietHoursEnd: string; // HH:MM format
  quietHoursAllowCritical: boolean;
  
  // Voice preferences
  alertVoiceEnabled: boolean;
  briefingVoiceEnabled: boolean;
  alertVolume: number; // 0-1
  
  // Metadata
  lastUpdated: number;
  version: number;
}

export interface PreferencesConfig {
  enableLogging: boolean;
  storageKey: string;
  autoSave: boolean;
  version: number;
}

type PreferencesChangeCallback = (prefs: ProactivePreferencesData) => void;

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: PreferencesConfig = {
  enableLogging: true,
  storageKey: 'ghostquant_proactive_preferences',
  autoSave: true,
  version: 1,
};

// ============================================================
// Default Preferences
// ============================================================

const DEFAULT_ALERT_CATEGORIES: AlertCategoryPreference[] = [
  { category: 'WHALE_SPIKE', enabled: true, minSeverity: 'medium' },
  { category: 'MANIPULATION_RING', enabled: true, minSeverity: 'medium' },
  { category: 'MARKET_VOLATILITY', enabled: true, minSeverity: 'high' },
  { category: 'HIGH_RISK_ENTITY', enabled: true, minSeverity: 'high' },
  { category: 'CONSTELLATION_ANOMALY', enabled: true, minSeverity: 'high' },
  { category: 'BOT_CLUSTER_EXPANSION', enabled: false, minSeverity: 'high' },
  { category: 'STABLECOIN_DEPEG_WARNING', enabled: true, minSeverity: 'medium' },
  { category: 'ECOSCORE_WARNING', enabled: true, minSeverity: 'high' },
  { category: 'GLOBAL_RISK_LEVEL_CHANGE', enabled: true, minSeverity: 'medium' },
  { category: 'HYDRA_ACTIVITY_SURGE', enabled: true, minSeverity: 'high' },
  { category: 'ORACLE_EYE_SPOOFING_DETECTED', enabled: true, minSeverity: 'medium' },
];

const DEFAULT_BRIEFINGS: BriefingPreference[] = [
  { type: 'hourly_summary', enabled: true, intervalMinutes: 60 },
  { type: 'market_open', enabled: true, intervalMinutes: 0 }, // Time-based, not interval
  { type: 'market_close', enabled: true, intervalMinutes: 0 },
  { type: 'whale_overview', enabled: true, intervalMinutes: 240 },
  { type: 'risk_report', enabled: true, intervalMinutes: 120 },
  { type: 'constellation_update', enabled: false, intervalMinutes: 360 },
];

const DEFAULT_PREFERENCES: ProactivePreferencesData = {
  proactiveAlertsEnabled: true,
  briefingsEnabled: true,
  alertCategories: DEFAULT_ALERT_CATEGORIES,
  globalMinSeverity: 'medium',
  muteAlertsDuringBriefings: true,
  briefings: DEFAULT_BRIEFINGS,
  defaultBriefingIntervalMinutes: 60,
  maxAlertsPerHour: 5,
  minAlertIntervalSeconds: 15,
  criticalBypassRateLimit: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  quietHoursAllowCritical: true,
  alertVoiceEnabled: true,
  briefingVoiceEnabled: true,
  alertVolume: 1.0,
  lastUpdated: Date.now(),
  version: 1,
};

// ============================================================
// ProactivePreferences Implementation
// ============================================================

class ProactivePreferencesImpl {
  private config: PreferencesConfig;
  private preferences: ProactivePreferencesData;
  private changeCallbacks: Set<PreferencesChangeCallback> = new Set();
  private isInitialized: boolean = false;

  constructor(config: Partial<PreferencesConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.log('ProactivePreferences initialized');
  }

  // ============================================================
  // Logging
  // ============================================================

  private log(message: string, data?: unknown): void {
    if (this.config.enableLogging) {
      if (data) {
        console.log(`[ProactivePrefs] ${message}`, data);
      } else {
        console.log(`[ProactivePrefs] ${message}`);
      }
    }
  }

  // ============================================================
  // Initialization
  // ============================================================

  /**
   * Initialize preferences from storage
   */
  initialize(): void {
    if (this.isInitialized) {
      this.log('Already initialized');
      return;
    }

    this.loadFromStorage();
    this.isInitialized = true;
    this.log('Preferences loaded');
  }

  /**
   * Load preferences from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      this.log('localStorage not available');
      return;
    }

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as ProactivePreferencesData;
        
        // Version migration if needed
        if (parsed.version !== this.config.version) {
          this.log('Migrating preferences from version', parsed.version);
          this.preferences = this.migratePreferences(parsed);
        } else {
          this.preferences = { ...DEFAULT_PREFERENCES, ...parsed };
        }
        
        this.log('Loaded preferences from storage');
      }
    } catch (error) {
      this.log('Error loading preferences:', error);
    }
  }

  /**
   * Save preferences to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      this.log('localStorage not available');
      return;
    }

    try {
      this.preferences.lastUpdated = Date.now();
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.preferences));
      this.log('Saved preferences to storage');
    } catch (error) {
      this.log('Error saving preferences:', error);
    }
  }

  /**
   * Migrate preferences from older version
   */
  private migratePreferences(old: ProactivePreferencesData): ProactivePreferencesData {
    // For now, just merge with defaults
    return {
      ...DEFAULT_PREFERENCES,
      ...old,
      version: this.config.version,
    };
  }

  // ============================================================
  // Change Callbacks
  // ============================================================

  /**
   * Register a change callback
   */
  onChange(callback: PreferencesChangeCallback): () => void {
    this.changeCallbacks.add(callback);
    return () => this.changeCallbacks.delete(callback);
  }

  /**
   * Notify all change callbacks
   */
  private notifyChange(): void {
    if (this.config.autoSave) {
      this.saveToStorage();
    }
    
    this.changeCallbacks.forEach(callback => {
      try {
        callback(this.preferences);
      } catch (error) {
        this.log('Callback error:', error);
      }
    });
  }

  // ============================================================
  // Master Toggles
  // ============================================================

  /**
   * Enable proactive alerts
   */
  enableProactiveAlerts(): void {
    this.preferences.proactiveAlertsEnabled = true;
    this.log('Proactive alerts enabled');
    this.notifyChange();
  }

  /**
   * Disable proactive alerts
   */
  disableProactiveAlerts(): void {
    this.preferences.proactiveAlertsEnabled = false;
    this.log('Proactive alerts disabled');
    this.notifyChange();
  }

  /**
   * Toggle proactive alerts
   */
  toggleProactiveAlerts(): boolean {
    this.preferences.proactiveAlertsEnabled = !this.preferences.proactiveAlertsEnabled;
    this.log('Proactive alerts toggled:', this.preferences.proactiveAlertsEnabled);
    this.notifyChange();
    return this.preferences.proactiveAlertsEnabled;
  }

  /**
   * Check if proactive alerts are enabled
   */
  isProactiveAlertsEnabled(): boolean {
    return this.preferences.proactiveAlertsEnabled;
  }

  /**
   * Enable briefings
   */
  enableBriefings(): void {
    this.preferences.briefingsEnabled = true;
    this.log('Briefings enabled');
    this.notifyChange();
  }

  /**
   * Disable briefings
   */
  disableBriefings(): void {
    this.preferences.briefingsEnabled = false;
    this.log('Briefings disabled');
    this.notifyChange();
  }

  /**
   * Toggle briefings
   */
  toggleBriefings(): boolean {
    this.preferences.briefingsEnabled = !this.preferences.briefingsEnabled;
    this.log('Briefings toggled:', this.preferences.briefingsEnabled);
    this.notifyChange();
    return this.preferences.briefingsEnabled;
  }

  /**
   * Check if briefings are enabled
   */
  isBriefingsEnabled(): boolean {
    return this.preferences.briefingsEnabled;
  }

  // ============================================================
  // Alert Category Preferences
  // ============================================================

  /**
   * Get alert category preferences
   */
  getAlertCategories(): AlertCategoryPreference[] {
    return [...this.preferences.alertCategories];
  }

  /**
   * Enable an alert category
   */
  enableAlertCategory(category: EventCategory): void {
    const pref = this.preferences.alertCategories.find(p => p.category === category);
    if (pref) {
      pref.enabled = true;
      this.log('Alert category enabled:', category);
      this.notifyChange();
    }
  }

  /**
   * Disable an alert category
   */
  disableAlertCategory(category: EventCategory): void {
    const pref = this.preferences.alertCategories.find(p => p.category === category);
    if (pref) {
      pref.enabled = false;
      this.log('Alert category disabled:', category);
      this.notifyChange();
    }
  }

  /**
   * Set minimum severity for a category
   */
  setAlertCategoryMinSeverity(category: EventCategory, severity: SeverityLevel): void {
    const pref = this.preferences.alertCategories.find(p => p.category === category);
    if (pref) {
      pref.minSeverity = severity;
      this.log('Alert category min severity set:', { category, severity });
      this.notifyChange();
    }
  }

  /**
   * Check if an alert should be shown based on preferences
   */
  shouldShowAlert(category: EventCategory, severity: SeverityLevel): boolean {
    if (!this.preferences.proactiveAlertsEnabled) return false;
    
    // Check quiet hours
    if (this.isInQuietHours()) {
      if (!this.preferences.quietHoursAllowCritical || severity !== 'critical') {
        return false;
      }
    }

    const pref = this.preferences.alertCategories.find(p => p.category === category);
    if (!pref || !pref.enabled) return false;

    // Check severity
    const severityOrder: SeverityLevel[] = ['low', 'medium', 'high', 'critical'];
    const minIndex = severityOrder.indexOf(pref.minSeverity);
    const actualIndex = severityOrder.indexOf(severity);

    return actualIndex >= minIndex;
  }

  /**
   * Set global minimum severity
   */
  setGlobalMinSeverity(severity: SeverityLevel): void {
    this.preferences.globalMinSeverity = severity;
    this.log('Global min severity set:', severity);
    this.notifyChange();
  }

  // ============================================================
  // Briefing Preferences
  // ============================================================

  /**
   * Get briefing preferences
   */
  getBriefingPreferences(): BriefingPreference[] {
    return [...this.preferences.briefings];
  }

  /**
   * Enable a briefing type
   */
  enableBriefingType(type: BriefingType): void {
    const pref = this.preferences.briefings.find(p => p.type === type);
    if (pref) {
      pref.enabled = true;
      this.log('Briefing type enabled:', type);
      this.notifyChange();
    }
  }

  /**
   * Disable a briefing type
   */
  disableBriefingType(type: BriefingType): void {
    const pref = this.preferences.briefings.find(p => p.type === type);
    if (pref) {
      pref.enabled = false;
      this.log('Briefing type disabled:', type);
      this.notifyChange();
    }
  }

  /**
   * Set briefing interval
   */
  setBriefingInterval(type: BriefingType, intervalMinutes: number): void {
    const pref = this.preferences.briefings.find(p => p.type === type);
    if (pref) {
      pref.intervalMinutes = intervalMinutes;
      this.log('Briefing interval set:', { type, intervalMinutes });
      this.notifyChange();
    }
  }

  /**
   * Check if a briefing type is enabled
   */
  isBriefingTypeEnabled(type: BriefingType): boolean {
    if (!this.preferences.briefingsEnabled) return false;
    
    const pref = this.preferences.briefings.find(p => p.type === type);
    return pref?.enabled ?? false;
  }

  /**
   * Set default briefing interval
   */
  setDefaultBriefingInterval(intervalMinutes: number): void {
    this.preferences.defaultBriefingIntervalMinutes = intervalMinutes;
    this.log('Default briefing interval set:', intervalMinutes);
    this.notifyChange();
  }

  // ============================================================
  // Rate Limiting Preferences
  // ============================================================

  /**
   * Set max alerts per hour
   */
  setMaxAlertsPerHour(max: number): void {
    this.preferences.maxAlertsPerHour = max;
    this.log('Max alerts per hour set:', max);
    this.notifyChange();
  }

  /**
   * Get max alerts per hour
   */
  getMaxAlertsPerHour(): number {
    return this.preferences.maxAlertsPerHour;
  }

  /**
   * Set min alert interval
   */
  setMinAlertInterval(seconds: number): void {
    this.preferences.minAlertIntervalSeconds = seconds;
    this.log('Min alert interval set:', seconds);
    this.notifyChange();
  }

  /**
   * Get min alert interval
   */
  getMinAlertInterval(): number {
    return this.preferences.minAlertIntervalSeconds;
  }

  /**
   * Set critical bypass rate limit
   */
  setCriticalBypassRateLimit(bypass: boolean): void {
    this.preferences.criticalBypassRateLimit = bypass;
    this.log('Critical bypass rate limit set:', bypass);
    this.notifyChange();
  }

  // ============================================================
  // Quiet Hours
  // ============================================================

  /**
   * Enable quiet hours
   */
  enableQuietHours(): void {
    this.preferences.quietHoursEnabled = true;
    this.log('Quiet hours enabled');
    this.notifyChange();
  }

  /**
   * Disable quiet hours
   */
  disableQuietHours(): void {
    this.preferences.quietHoursEnabled = false;
    this.log('Quiet hours disabled');
    this.notifyChange();
  }

  /**
   * Set quiet hours
   */
  setQuietHours(start: string, end: string): void {
    this.preferences.quietHoursStart = start;
    this.preferences.quietHoursEnd = end;
    this.log('Quiet hours set:', { start, end });
    this.notifyChange();
  }

  /**
   * Check if currently in quiet hours
   */
  isInQuietHours(): boolean {
    if (!this.preferences.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const start = this.preferences.quietHoursStart;
    const end = this.preferences.quietHoursEnd;

    // Handle overnight quiet hours (e.g., 22:00 - 07:00)
    if (start > end) {
      return currentTime >= start || currentTime < end;
    }
    
    return currentTime >= start && currentTime < end;
  }

  /**
   * Set quiet hours allow critical
   */
  setQuietHoursAllowCritical(allow: boolean): void {
    this.preferences.quietHoursAllowCritical = allow;
    this.log('Quiet hours allow critical set:', allow);
    this.notifyChange();
  }

  // ============================================================
  // Voice Preferences
  // ============================================================

  /**
   * Enable alert voice
   */
  enableAlertVoice(): void {
    this.preferences.alertVoiceEnabled = true;
    this.log('Alert voice enabled');
    this.notifyChange();
  }

  /**
   * Disable alert voice
   */
  disableAlertVoice(): void {
    this.preferences.alertVoiceEnabled = false;
    this.log('Alert voice disabled');
    this.notifyChange();
  }

  /**
   * Check if alert voice is enabled
   */
  isAlertVoiceEnabled(): boolean {
    return this.preferences.alertVoiceEnabled;
  }

  /**
   * Enable briefing voice
   */
  enableBriefingVoice(): void {
    this.preferences.briefingVoiceEnabled = true;
    this.log('Briefing voice enabled');
    this.notifyChange();
  }

  /**
   * Disable briefing voice
   */
  disableBriefingVoice(): void {
    this.preferences.briefingVoiceEnabled = false;
    this.log('Briefing voice disabled');
    this.notifyChange();
  }

  /**
   * Check if briefing voice is enabled
   */
  isBriefingVoiceEnabled(): boolean {
    return this.preferences.briefingVoiceEnabled;
  }

  /**
   * Set alert volume
   */
  setAlertVolume(volume: number): void {
    this.preferences.alertVolume = Math.max(0, Math.min(1, volume));
    this.log('Alert volume set:', this.preferences.alertVolume);
    this.notifyChange();
  }

  /**
   * Get alert volume
   */
  getAlertVolume(): number {
    return this.preferences.alertVolume;
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Get all preferences
   */
  getPreferences(): ProactivePreferencesData {
    return { ...this.preferences };
  }

  /**
   * Set all preferences
   */
  setPreferences(prefs: Partial<ProactivePreferencesData>): void {
    this.preferences = { ...this.preferences, ...prefs };
    this.log('Preferences updated');
    this.notifyChange();
  }

  /**
   * Reset to defaults
   */
  resetToDefaults(): void {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.log('Preferences reset to defaults');
    this.notifyChange();
  }

  /**
   * Export preferences as JSON
   */
  exportPreferences(): string {
    return JSON.stringify(this.preferences, null, 2);
  }

  /**
   * Import preferences from JSON
   */
  importPreferences(json: string): boolean {
    try {
      const parsed = JSON.parse(json) as ProactivePreferencesData;
      this.preferences = { ...DEFAULT_PREFERENCES, ...parsed };
      this.log('Preferences imported');
      this.notifyChange();
      return true;
    } catch (error) {
      this.log('Error importing preferences:', error);
      return false;
    }
  }

  /**
   * Force save to storage
   */
  save(): void {
    this.saveToStorage();
  }

  /**
   * Force reload from storage
   */
  reload(): void {
    this.loadFromStorage();
    this.notifyChange();
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let proactivePreferences: ProactivePreferencesImpl | null = null;

/**
 * Get the ProactivePreferences singleton instance
 */
export function getProactivePreferences(): ProactivePreferencesImpl {
  if (!proactivePreferences) {
    proactivePreferences = new ProactivePreferencesImpl();
    proactivePreferences.initialize();
  }
  return proactivePreferences;
}

/**
 * Create a new ProactivePreferences instance
 */
export function createProactivePreferences(
  config?: Partial<PreferencesConfig>
): ProactivePreferencesImpl {
  const instance = new ProactivePreferencesImpl(config);
  instance.initialize();
  return instance;
}

export default {
  getProactivePreferences,
  createProactivePreferences,
};
