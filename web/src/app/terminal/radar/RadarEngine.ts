/**
 * Radar Engine - Client-side aggregator for heatmap layers
 */

export interface HeatmapLayer {
  name: string;
  data: Record<string, number>;
  max_score: number;
  min_score: number;
  avg_score: number;
}

export interface AggregatedHeatmap {
  chains: HeatmapLayer;
  entities: HeatmapLayer;
  tokens: HeatmapLayer;
  networks: HeatmapLayer;
  global_risk: number;
  timestamp: string;
}

export class RadarEngine {
  /**
   * Aggregate heatmap data into layers
   */
  static aggregateHeatmap(heatmapData: any): AggregatedHeatmap {
    const chains = this.createLayer('Chains', heatmapData.chains || {});
    const entities = this.createLayer('Entities', heatmapData.entities || {});
    const tokens = this.createLayer('Tokens', heatmapData.tokens || {});
    const networks = this.createLayer('Networks', heatmapData.networks || {});

    const allScores = [
      ...Object.values(chains.data),
      ...Object.values(entities.data),
      ...Object.values(tokens.data),
      ...Object.values(networks.data)
    ];
    
    const global_risk = allScores.length > 0
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length
      : 0;

    return {
      chains,
      entities,
      tokens,
      networks,
      global_risk,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a heatmap layer from data
   */
  private static createLayer(name: string, data: Record<string, number>): HeatmapLayer {
    const scores = Object.values(data);
    
    return {
      name,
      data,
      max_score: scores.length > 0 ? Math.max(...scores) : 0,
      min_score: scores.length > 0 ? Math.min(...scores) : 0,
      avg_score: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    };
  }

  /**
   * Get color for risk score
   */
  static getRiskColor(score: number): string {
    if (score >= 0.90) return '#9333ea'; // Purple - critical
    if (score >= 0.70) return '#ef4444'; // Red - high
    if (score >= 0.40) return '#f59e0b'; // Yellow - moderate
    if (score >= 0.15) return '#10b981'; // Green - low
    return '#6b7280'; // Gray - minimal
  }

  /**
   * Get risk level text
   */
  static getRiskLevel(score: number): string {
    if (score >= 0.90) return 'CRITICAL';
    if (score >= 0.70) return 'HIGH';
    if (score >= 0.40) return 'MODERATE';
    if (score >= 0.15) return 'LOW';
    return 'MINIMAL';
  }

  /**
   * Format score for display
   */
  static formatScore(score: number): string {
    return (score * 100).toFixed(1) + '%';
  }

  /**
   * Get top N items from layer
   */
  static getTopItems(layer: HeatmapLayer, limit: number = 5): Array<{ key: string; score: number }> {
    return Object.entries(layer.data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, score]) => ({ key, score }));
  }

  /**
   * Detect risk spikes (score increase > 20% in short time)
   */
  static detectSpikes(
    currentData: Record<string, number>,
    previousData: Record<string, number>
  ): Array<{ key: string; current: number; previous: number; change: number }> {
    const spikes: Array<{ key: string; current: number; previous: number; change: number }> = [];

    for (const [key, currentScore] of Object.entries(currentData)) {
      const previousScore = previousData[key] || 0;
      const change = currentScore - previousScore;

      if (change > 0.20) {
        spikes.push({
          key,
          current: currentScore,
          previous: previousScore,
          change
        });
      }
    }

    return spikes.sort((a, b) => b.change - a.change);
  }

  /**
   * Generate sparkline data for risk over time
   */
  static generateSparkline(history: number[], maxPoints: number = 20): number[] {
    if (history.length <= maxPoints) {
      return history;
    }
    
    const step = history.length / maxPoints;
    const sparkline: number[] = [];
    
    for (let i = 0; i < maxPoints; i++) {
      const index = Math.floor(i * step);
      sparkline.push(history[index]);
    }
    
    return sparkline;
  }
}
