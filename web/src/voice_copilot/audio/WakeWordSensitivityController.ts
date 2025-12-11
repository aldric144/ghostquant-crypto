/**
 * WakeWordSensitivityController.ts
 * 
 * Phase 4: Continuous Listening + Wake-Word Loop Engine
 * 
 * Purpose: Allow dynamic sensitivity tuning for noisy environments.
 * 
 * Capabilities:
 * - High / Medium / Low sensitivity modes
 * - Auto-adjust if false positives detected
 * - Auto-boost if wake word repeatedly missed
 * - STT input confidence scoring fallback
 * 
 * Logging prefix: [WakeSensitivity]
 */

// ============================================================
// Types
// ============================================================

export type SensitivityLevel = 'high' | 'medium' | 'low';

export interface SensitivityConfig {
  level: SensitivityLevel;
  confidenceThreshold: number;
  fuzzyMatchThreshold: number;
  minAudioLevel: number;
  maxFalsePositivesBeforeAdjust: number;
  maxMissesBeforeBoost: number;
  autoAdjustEnabled: boolean;
  autoBoostEnabled: boolean;
}

export interface SensitivityStats {
  currentLevel: SensitivityLevel;
  falsePositiveCount: number;
  missedWakeCount: number;
  totalDetections: number;
  totalRejections: number;
  autoAdjustments: number;
  autoBoosts: number;
  averageConfidence: number;
  lastAdjustmentTime: number | null;
}

export interface DetectionResult {
  detected: boolean;
  confidence: number;
  rawScore: number;
  threshold: number;
  adjustedThreshold: number;
  reason: string;
}

// ============================================================
// Sensitivity Presets
// ============================================================

const SENSITIVITY_PRESETS: Record<SensitivityLevel, Omit<SensitivityConfig, 'autoAdjustEnabled' | 'autoBoostEnabled' | 'maxFalsePositivesBeforeAdjust' | 'maxMissesBeforeBoost'>> = {
  high: {
    level: 'high',
    confidenceThreshold: 0.5,
    fuzzyMatchThreshold: 0.6,
    minAudioLevel: 0.01,
  },
  medium: {
    level: 'medium',
    confidenceThreshold: 0.65,
    fuzzyMatchThreshold: 0.7,
    minAudioLevel: 0.02,
  },
  low: {
    level: 'low',
    confidenceThreshold: 0.8,
    fuzzyMatchThreshold: 0.85,
    minAudioLevel: 0.05,
  },
};

const DEFAULT_CONFIG: SensitivityConfig = {
  ...SENSITIVITY_PRESETS.medium,
  maxFalsePositivesBeforeAdjust: 3,
  maxMissesBeforeBoost: 5,
  autoAdjustEnabled: true,
  autoBoostEnabled: true,
};

// ============================================================
// WakeWordSensitivityController Implementation
// ============================================================

class WakeWordSensitivityControllerImpl {
  private config: SensitivityConfig;
  private stats: SensitivityStats;
  private confidenceHistory: number[] = [];
  private readonly maxHistorySize = 50;

  constructor(config: Partial<SensitivityConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = {
      currentLevel: this.config.level,
      falsePositiveCount: 0,
      missedWakeCount: 0,
      totalDetections: 0,
      totalRejections: 0,
      autoAdjustments: 0,
      autoBoosts: 0,
      averageConfidence: 0,
      lastAdjustmentTime: null,
    };
    console.log('[WakeSensitivity] Initialized with level:', this.config.level);
  }

  // ============================================================
  // Sensitivity Level Management
  // ============================================================

  /**
   * Set sensitivity level manually
   */
  setSensitivityLevel(level: SensitivityLevel): void {
    const preset = SENSITIVITY_PRESETS[level];
    this.config = {
      ...this.config,
      ...preset,
    };
    this.stats.currentLevel = level;
    console.log('[WakeSensitivity] Level set to:', level);
  }

  /**
   * Get current sensitivity level
   */
  getSensitivityLevel(): SensitivityLevel {
    return this.config.level;
  }

  /**
   * Get current configuration
   */
  getConfig(): SensitivityConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SensitivityConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.level) {
      this.stats.currentLevel = config.level;
    }
    console.log('[WakeSensitivity] Config updated');
  }

  // ============================================================
  // Detection Evaluation
  // ============================================================

  /**
   * Evaluate a potential wake word detection
   */
  evaluateDetection(
    rawScore: number,
    audioLevel: number,
    sttConfidence?: number
  ): DetectionResult {
    const threshold = this.config.confidenceThreshold;
    const adjustedThreshold = this.getAdjustedThreshold();

    // Check minimum audio level
    if (audioLevel < this.config.minAudioLevel) {
      return {
        detected: false,
        confidence: rawScore,
        rawScore,
        threshold,
        adjustedThreshold,
        reason: 'Audio level too low',
      };
    }

    // Use STT confidence as fallback if available
    const effectiveScore = sttConfidence !== undefined
      ? Math.max(rawScore, sttConfidence)
      : rawScore;

    // Evaluate against adjusted threshold
    const detected = effectiveScore >= adjustedThreshold;

    // Record confidence for averaging
    this.recordConfidence(effectiveScore);

    const result: DetectionResult = {
      detected,
      confidence: effectiveScore,
      rawScore,
      threshold,
      adjustedThreshold,
      reason: detected ? 'Threshold met' : 'Below threshold',
    };

    // Update stats
    if (detected) {
      this.stats.totalDetections++;
      console.log('[WakeSensitivity] Detection accepted:', effectiveScore.toFixed(3));
    } else {
      this.stats.totalRejections++;
      console.log('[WakeSensitivity] Detection rejected:', effectiveScore.toFixed(3), '<', adjustedThreshold.toFixed(3));
    }

    return result;
  }

  /**
   * Get dynamically adjusted threshold based on history
   */
  private getAdjustedThreshold(): number {
    let threshold = this.config.confidenceThreshold;

    // Adjust based on false positive rate
    if (this.stats.falsePositiveCount > 0) {
      const fpRate = this.stats.falsePositiveCount / Math.max(1, this.stats.totalDetections);
      if (fpRate > 0.2) {
        threshold = Math.min(threshold + 0.1, 0.95);
      }
    }

    // Adjust based on average confidence
    if (this.stats.averageConfidence > 0) {
      const avgDiff = this.stats.averageConfidence - threshold;
      if (avgDiff > 0.2) {
        // Detections are consistently high, can be more strict
        threshold = Math.min(threshold + 0.05, 0.9);
      } else if (avgDiff < -0.1) {
        // Detections are consistently low, be more lenient
        threshold = Math.max(threshold - 0.05, 0.4);
      }
    }

    return threshold;
  }

  // ============================================================
  // False Positive / Miss Tracking
  // ============================================================

  /**
   * Report a false positive detection
   */
  reportFalsePositive(): void {
    this.stats.falsePositiveCount++;
    console.log('[WakeSensitivity] False positive reported, count:', this.stats.falsePositiveCount);

    // Auto-adjust if enabled and threshold reached
    if (this.config.autoAdjustEnabled && 
        this.stats.falsePositiveCount >= this.config.maxFalsePositivesBeforeAdjust) {
      this.autoReduceSensitivity();
    }
  }

  /**
   * Report a missed wake word (user had to repeat)
   */
  reportMissedWake(): void {
    this.stats.missedWakeCount++;
    console.log('[WakeSensitivity] Missed wake reported, count:', this.stats.missedWakeCount);

    // Auto-boost if enabled and threshold reached
    if (this.config.autoBoostEnabled && 
        this.stats.missedWakeCount >= this.config.maxMissesBeforeBoost) {
      this.autoBoostSensitivity();
    }
  }

  /**
   * Report successful detection (reset miss counter)
   */
  reportSuccessfulDetection(): void {
    this.stats.missedWakeCount = 0;
    console.log('[WakeSensitivity] Successful detection, miss count reset');
  }

  // ============================================================
  // Auto-Adjustment
  // ============================================================

  /**
   * Automatically reduce sensitivity (more strict)
   */
  private autoReduceSensitivity(): void {
    const currentLevel = this.config.level;
    let newLevel: SensitivityLevel = currentLevel;

    if (currentLevel === 'high') {
      newLevel = 'medium';
    } else if (currentLevel === 'medium') {
      newLevel = 'low';
    }

    if (newLevel !== currentLevel) {
      console.log('[WakeSensitivity] Auto-adjusting sensitivity:', currentLevel, '->', newLevel);
      this.setSensitivityLevel(newLevel);
      this.stats.autoAdjustments++;
      this.stats.falsePositiveCount = 0;
      this.stats.lastAdjustmentTime = Date.now();
    }
  }

  /**
   * Automatically boost sensitivity (more lenient)
   */
  private autoBoostSensitivity(): void {
    const currentLevel = this.config.level;
    let newLevel: SensitivityLevel = currentLevel;

    if (currentLevel === 'low') {
      newLevel = 'medium';
    } else if (currentLevel === 'medium') {
      newLevel = 'high';
    }

    if (newLevel !== currentLevel) {
      console.log('[WakeSensitivity] Auto-boosting sensitivity:', currentLevel, '->', newLevel);
      this.setSensitivityLevel(newLevel);
      this.stats.autoBoosts++;
      this.stats.missedWakeCount = 0;
      this.stats.lastAdjustmentTime = Date.now();
    }
  }

  // ============================================================
  // Confidence Tracking
  // ============================================================

  /**
   * Record confidence score for averaging
   */
  private recordConfidence(confidence: number): void {
    this.confidenceHistory.push(confidence);
    
    // Trim history if too large
    if (this.confidenceHistory.length > this.maxHistorySize) {
      this.confidenceHistory.shift();
    }

    // Update average
    this.stats.averageConfidence = this.confidenceHistory.reduce((a, b) => a + b, 0) / this.confidenceHistory.length;
  }

  /**
   * Get confidence score for STT input
   */
  getSTTConfidenceScore(transcript: string, expectedWakeWords: string[]): number {
    if (!transcript || transcript.trim().length === 0) {
      return 0;
    }

    const normalizedTranscript = transcript.toLowerCase().trim();
    let maxScore = 0;

    for (const wakeWord of expectedWakeWords) {
      const normalizedWake = wakeWord.toLowerCase().trim();
      
      // Exact match
      if (normalizedTranscript.includes(normalizedWake)) {
        return 1.0;
      }

      // Fuzzy match using Levenshtein-like scoring
      const score = this.calculateFuzzyScore(normalizedTranscript, normalizedWake);
      maxScore = Math.max(maxScore, score);
    }

    return maxScore;
  }

  /**
   * Calculate fuzzy match score between two strings
   */
  private calculateFuzzyScore(input: string, target: string): number {
    // Simple character overlap scoring
    const inputChars = new Set(input.split(''));
    const targetCharsArray = target.split('');
    const targetCharsSet = new Set(targetCharsArray);
    
    let matches = 0;
    targetCharsArray.forEach(char => {
      if (inputChars.has(char)) {
        matches++;
      }
    });

    const charScore = matches / targetCharsSet.size;

    // Word overlap scoring
    const inputWords = input.split(/\s+/);
    const targetWords = target.split(/\s+/);
    
    let wordMatches = 0;
    for (const targetWord of targetWords) {
      for (const inputWord of inputWords) {
        if (inputWord.includes(targetWord) || targetWord.includes(inputWord)) {
          wordMatches++;
          break;
        }
      }
    }

    const wordScore = wordMatches / targetWords.length;

    // Combined score
    return (charScore * 0.4) + (wordScore * 0.6);
  }

  // ============================================================
  // Stats & Reset
  // ============================================================

  /**
   * Get current statistics
   */
  getStats(): SensitivityStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      currentLevel: this.config.level,
      falsePositiveCount: 0,
      missedWakeCount: 0,
      totalDetections: 0,
      totalRejections: 0,
      autoAdjustments: 0,
      autoBoosts: 0,
      averageConfidence: 0,
      lastAdjustmentTime: null,
    };
    this.confidenceHistory = [];
    console.log('[WakeSensitivity] Stats reset');
  }

  /**
   * Reset to default configuration
   */
  resetToDefaults(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.resetStats();
    console.log('[WakeSensitivity] Reset to defaults');
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let sensitivityController: WakeWordSensitivityControllerImpl | null = null;

/**
 * Get the WakeWordSensitivityController singleton instance
 */
export function getWakeWordSensitivityController(): WakeWordSensitivityControllerImpl {
  if (!sensitivityController) {
    sensitivityController = new WakeWordSensitivityControllerImpl();
  }
  return sensitivityController;
}

/**
 * Create a new WakeWordSensitivityController instance
 */
export function createWakeWordSensitivityController(
  config?: Partial<SensitivityConfig>
): WakeWordSensitivityControllerImpl {
  return new WakeWordSensitivityControllerImpl(config);
}

export default {
  getWakeWordSensitivityController,
  createWakeWordSensitivityController,
};
