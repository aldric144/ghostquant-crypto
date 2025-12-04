'use client';

import React from 'react';
import AuroraStream from '@/components/AuroraStream';
import StarfieldBackground from '@/components/StarfieldBackground';
import styles from './page.module.scss';

export default function SentinelPage() {
  const engines = [
    { name: 'UltraFusion', status: 'active', alerts: 3, uptime: 99.9 },
    { name: 'Hydra', status: 'active', alerts: 7, uptime: 99.8 },
    { name: 'Constellation', status: 'active', alerts: 2, uptime: 100 },
    { name: 'Profiler', status: 'active', alerts: 5, uptime: 99.7 },
    { name: 'Oracle Eye', status: 'active', alerts: 1, uptime: 99.9 },
    { name: 'Behavioral DNA', status: 'active', alerts: 4, uptime: 99.8 },
    { name: 'Radar', status: 'active', alerts: 6, uptime: 99.9 },
    { name: 'Chain Pressure', status: 'active', alerts: 2, uptime: 100 },
  ];

  const alertClassifications = [
    { level: 'Critical', count: 12, color: '#FF1E44' },
    { level: 'High', count: 28, color: '#F25F4C' },
    { level: 'Medium', count: 47, color: '#3A8DFF' },
    { level: 'Low', count: 93, color: '#37FFB0' },
  ];

  return (
    <div className={styles.sentinelPage}>
      <StarfieldBackground />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroIcon}>🛡️</div>
            <h1 className={styles.heroTitle}>Sentinel Command Console</h1>
            <p className={styles.heroSubtitle}>
              Unified Command Center for All Detection Engines
            </p>
            <p className={styles.heroDescription}>
              Sentinel is the command-and-control hub that monitors all 11 detection engines in real-time.
              A single pane of glass for threat intelligence, alert management, and engine orchestration.
              Monitor system health, triage alerts, and coordinate responses across the entire GhostQuant
              intelligence platform.
            </p>
          </div>
        </div>
      </section>

      <AuroraStream />

      {/* Engine Monitoring Strip */}
      <section className={styles.monitoringSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Engine Status Monitor</h2>
            <p className={styles.sectionSubtitle}>
              Real-time health and performance metrics for all detection engines
            </p>
          </div>

          <div className={styles.engineGrid}>
            {engines.map((engine, idx) => (
              <div key={idx} className={styles.engineCard}>
                <div className={styles.engineHeader}>
                  <span className={styles.engineName}>{engine.name}</span>
                  <span className={`${styles.engineStatus} ${styles[engine.status]}`}>
                    {engine.status}
                  </span>
                </div>
                <div className={styles.engineMetrics}>
                  <div className={styles.engineMetric}>
                    <span className={styles.metricLabel}>Active Alerts</span>
                    <span className={styles.metricValue}>{engine.alerts}</span>
                  </div>
                  <div className={styles.engineMetric}>
                    <span className={styles.metricLabel}>Uptime</span>
                    <span className={styles.metricValue}>{engine.uptime}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alert Classifications */}
      <section className={styles.alertsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Alert Classifications</h2>
            <p className={styles.sectionSubtitle}>
              Current alert distribution across severity levels
            </p>
          </div>

          <div className={styles.alertsGrid}>
            {alertClassifications.map((alert, idx) => (
              <div key={idx} className={styles.alertCard}>
                <div className={styles.alertLevel} style={{ color: alert.color }}>
                  {alert.level}
                </div>
                <div className={styles.alertCount} style={{ color: alert.color }}>
                  {alert.count}
                </div>
                <div className={styles.alertLabel}>Active Alerts</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Console Screenshot */}
      <section className={styles.screenshotSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Sentinel Console Interface</h2>
            <p className={styles.sectionSubtitle}>
              Command-center style interface for threat intelligence operations
            </p>
          </div>

          <div className={styles.consoleMock}>
            <div className={styles.consoleHeader}>
              <div className={styles.consoleTitle}>SENTINEL COMMAND CONSOLE</div>
              <div className={styles.consoleTime}>2025-12-02 23:44:14 UTC</div>
            </div>
            <div className={styles.consoleBody}>
              <div className={styles.consolePanel}>
                <div className={styles.panelTitle}>THREAT OVERVIEW</div>
                <div className={styles.panelContent}>
                  <div className={styles.threatMetric}>
                    <span>Active Threats</span>
                    <span className={styles.threatValue}>47</span>
                  </div>
                  <div className={styles.threatMetric}>
                    <span>Critical Alerts</span>
                    <span className={styles.threatValue}>12</span>
                  </div>
                  <div className={styles.threatMetric}>
                    <span>Entities Monitored</span>
                    <span className={styles.threatValue}>2,847</span>
                  </div>
                </div>
              </div>
              <div className={styles.consolePanel}>
                <div className={styles.panelTitle}>RECENT ALERTS</div>
                <div className={styles.panelContent}>
                  <div className={styles.alertItem}>
                    <span className={styles.alertTime}>23:42:18</span>
                    <span className={styles.alertText}>Hydra: Coordinated attack detected</span>
                  </div>
                  <div className={styles.alertItem}>
                    <span className={styles.alertTime}>23:41:05</span>
                    <span className={styles.alertText}>Profiler: High-risk entity identified</span>
                  </div>
                  <div className={styles.alertItem}>
                    <span className={styles.alertTime}>23:39:42</span>
                    <span className={styles.alertText}>Constellation: Supernova cluster formed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Launch Sentinel Console</h2>
            <p className={styles.ctaDescription}>
              Access the full command center with real-time monitoring and alert management
            </p>
            <button className={styles.ctaButton}>Open Command Console</button>
          </div>
        </div>
      </section>
    </div>
  );
}
