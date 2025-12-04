'use client';

import React from 'react';
import AuroraStream from '@/components/AuroraStream';
import StarfieldBackground from '@/components/StarfieldBackground';
import styles from './page.module.scss';

export default function CortexPage() {
  const timelineEvents = [
    { day: 1, events: 47, patterns: 3, anomalies: 2 },
    { day: 7, events: 312, patterns: 12, anomalies: 8 },
    { day: 14, events: 589, patterns: 24, anomalies: 15 },
    { day: 21, events: 823, patterns: 31, anomalies: 19 },
    { day: 30, events: 1247, patterns: 47, anomalies: 28 },
  ];

  const detectedPatterns = [
    { name: 'Recurring Wash Trading', frequency: 'Daily', confidence: 94 },
    { name: 'Coordinated Pump Cycles', frequency: 'Weekly', confidence: 89 },
    { name: 'Cross-Chain Relay Pattern', frequency: 'Hourly', confidence: 96 },
    { name: 'Manipulation Signature A7', frequency: 'Daily', confidence: 87 },
  ];

  return (
    <div className={styles.cortexPage}>
      <StarfieldBackground />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroIcon}>🧠</div>
            <h1 className={styles.heroTitle}>Cortex Memory Engine</h1>
            <p className={styles.heroSubtitle}>
              30-Day Behavioral Memory & Pattern Recognition System
            </p>
            <p className={styles.heroDescription}>
              Cortex maintains a 30-day rolling memory of all entity behaviors, transactions, and
              interactions. Advanced pattern recognition algorithms identify recurring behaviors,
              evolving attack signatures, and behavioral drift. The memory engine enables temporal
              analysis that reveals patterns invisible to point-in-time detection systems.
            </p>
          </div>
        </div>
      </section>

      <AuroraStream />

      {/* Timeline Preview */}
      <section className={styles.timelineSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>30-Day Memory Timeline</h2>
            <p className={styles.sectionSubtitle}>
              Cumulative behavioral data and pattern detection over time
            </p>
          </div>

          <div className={styles.timelineChart}>
            {timelineEvents.map((event, idx) => (
              <div key={idx} className={styles.timelinePoint}>
                <div className={styles.timelineBar}>
                  <div
                    className={styles.timelineBarFill}
                    style={{ height: `${(event.events / 1247) * 100}%` }}
                  ></div>
                </div>
                <div className={styles.timelineLabel}>Day {event.day}</div>
                <div className={styles.timelineStats}>
                  <div className={styles.timelineStat}>
                    <span className={styles.timelineStatValue}>{event.events}</span>
                    <span className={styles.timelineStatLabel}>Events</span>
                  </div>
                  <div className={styles.timelineStat}>
                    <span className={styles.timelineStatValue}>{event.patterns}</span>
                    <span className={styles.timelineStatLabel}>Patterns</span>
                  </div>
                  <div className={styles.timelineStat}>
                    <span className={styles.timelineStatValue}>{event.anomalies}</span>
                    <span className={styles.timelineStatLabel}>Anomalies</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pattern Detection */}
      <section className={styles.patternsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Detected Behavioral Patterns</h2>
            <p className={styles.sectionSubtitle}>
              Recurring behaviors identified through temporal analysis
            </p>
          </div>

          <div className={styles.patternsGrid}>
            {detectedPatterns.map((pattern, idx) => (
              <div key={idx} className={styles.patternCard}>
                <div className={styles.patternHeader}>
                  <span className={styles.patternName}>{pattern.name}</span>
                  <span className={styles.patternFrequency}>{pattern.frequency}</span>
                </div>
                <div className={styles.patternConfidence}>
                  <span className={styles.confidenceLabel}>Confidence</span>
                  <div className={styles.confidenceBar}>
                    <div
                      className={styles.confidenceBarFill}
                      style={{ width: `${pattern.confidence}%` }}
                    ></div>
                  </div>
                  <span className={styles.confidenceValue}>{pattern.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Example */}
      <section className={styles.apiSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Cortex Memory API</h2>
            <p className={styles.sectionSubtitle}>
              Query behavioral memory and pattern detection
            </p>
          </div>

          <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
              <span className={styles.codeLanguage}>TypeScript</span>
            </div>
            <pre className={styles.codeContent}>
{`// Query 30-day behavioral memory for an entity
const memory = await ghostquant.cortex.queryMemory({
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  timeframe: '30d',
  includePatterns: true
});

{
  entity: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  memoryPeriod: '30d',
  totalEvents: 1247,
  detectedPatterns: [
    {
      name: 'Recurring Wash Trading',
      frequency: 'daily',
      confidence: 0.94,
      firstSeen: '2025-11-02T00:00:00Z',
      lastSeen: '2025-12-02T23:44:14Z'
    }
  ],
  behavioralDrift: 0.23,
  anomalyScore: 87
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>View Memory Timeline</h2>
            <p className={styles.ctaDescription}>
              Explore the full 30-day behavioral memory and pattern detection system
            </p>
            <button className={styles.ctaButton}>Launch Cortex Console</button>
          </div>
        </div>
      </section>
    </div>
  );
}
