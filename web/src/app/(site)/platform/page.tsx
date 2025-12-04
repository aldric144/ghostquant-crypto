'use client';

import React from 'react';
import AuroraStream from '@/components/AuroraStream';
import IntelligenceCard from '@/components/IntelligenceCard';
import StarfieldBackground from '@/components/StarfieldBackground';
import styles from './page.module.scss';

export default function PlatformPage() {
  const modules = [
    { title: 'UltraFusion', description: 'Meta-intelligence fusion across all detection engines', variant: 'intel' as const, icon: '⚡' },
    { title: 'Operation Hydra', description: 'Coordinated attack detection and relay network mapping', variant: 'risk' as const, icon: '🐉' },
    { title: 'Constellation', description: 'Global threat mapping with supernova event detection', variant: 'intel' as const, icon: '🌌' },
    { title: 'Sentinel', description: 'Real-time command console for 24/7 threat monitoring', variant: 'system' as const, icon: '🛡️' },
    { title: 'Cortex', description: '30-day memory engine with pattern recognition', variant: 'intel' as const, icon: '🧠' },
    { title: 'Genesis', description: 'Immutable forensic ledger for chain-of-custody', variant: 'system' as const, icon: '📜' },
    { title: 'Profiler', description: 'Entity behavioral profiling and risk scoring', variant: 'risk' as const, icon: '👤' },
    { title: 'Oracle Eye', description: 'Predictive threat intelligence and forecasting', variant: 'intel' as const, icon: '🔮' },
    { title: 'Behavioral DNA', description: 'Unique behavioral fingerprinting across chains', variant: 'intel' as const, icon: '🧬' },
    { title: 'Radar Engine', description: 'Market manipulation and anomaly detection', variant: 'risk' as const, icon: '📡' },
    { title: 'Chain Pressure', description: 'Network stress analysis and congestion monitoring', variant: 'system' as const, icon: '⚙️' },
    { title: 'Ring Intelligence', description: 'Circular flow detection and wash trading analysis', variant: 'risk' as const, icon: '🔄' },
  ];

  return (
    <div className={styles.platformPage}>
      <StarfieldBackground />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroHologram}></div>
            <h1 className={styles.heroTitle}>
              <span className={styles.titleGhost}>GHOST</span>
              <span className={styles.titleQuant}>QUANT</span>
              <span className={styles.titlePlatform}>PLATFORM</span>
            </h1>
            <p className={styles.heroSubtitle}>
              The World's First Financial Intelligence Fusion Engine
            </p>
            <p className={styles.heroDescription}>
              A unified intelligence platform that fuses 12 specialized detection engines into a single,
              comprehensive threat detection and analysis system. Real-time monitoring, behavioral profiling,
              and predictive intelligence for cryptocurrency markets.
            </p>
            <button className={styles.heroButton}>Explore Live Intelligence</button>
          </div>
        </div>
      </section>

      {/* Aurora Strip */}
      <AuroraStream />

      {/* Intelligence Modules Grid */}
      <section className={styles.modulesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>12 Intelligence Modules</h2>
            <p className={styles.sectionSubtitle}>
              Specialized detection engines working in concert to provide comprehensive threat intelligence
            </p>
          </div>

          <div className={styles.modulesGrid}>
            {modules.map((module, idx) => (
              <IntelligenceCard
                key={idx}
                title={module.title}
                description={module.description}
                variant={module.variant}
                icon={module.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Engine Flow Diagram */}
      <section className={styles.flowSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Intelligence Flow Architecture</h2>
            <p className={styles.sectionSubtitle}>
              Data flows through specialized engines, each contributing unique intelligence signals
            </p>
          </div>

          <div className={styles.flowDiagram}>
            <div className={styles.flowLayer}>
              <div className={styles.flowNode}>
                <span className={styles.flowNodeIcon}>📥</span>
                <span className={styles.flowNodeLabel}>Data Ingestion</span>
              </div>
              <div className={styles.flowArrow}>→</div>
              <div className={styles.flowNode}>
                <span className={styles.flowNodeIcon}>🔍</span>
                <span className={styles.flowNodeLabel}>Detection Engines</span>
              </div>
              <div className={styles.flowArrow}>→</div>
              <div className={styles.flowNode}>
                <span className={styles.flowNodeIcon}>⚡</span>
                <span className={styles.flowNodeLabel}>UltraFusion</span>
              </div>
              <div className={styles.flowArrow}>→</div>
              <div className={styles.flowNode}>
                <span className={styles.flowNodeIcon}>🎯</span>
                <span className={styles.flowNodeLabel}>Intelligence Output</span>
              </div>
            </div>

            <div className={styles.flowEngines}>
              <div className={styles.flowEngine}>Hydra</div>
              <div className={styles.flowEngine}>Constellation</div>
              <div className={styles.flowEngine}>Sentinel</div>
              <div className={styles.flowEngine}>Cortex</div>
              <div className={styles.flowEngine}>Genesis</div>
              <div className={styles.flowEngine}>Profiler</div>
              <div className={styles.flowEngine}>Oracle Eye</div>
              <div className={styles.flowEngine}>Behavioral DNA</div>
              <div className={styles.flowEngine}>Radar</div>
              <div className={styles.flowEngine}>Chain Pressure</div>
              <div className={styles.flowEngine}>Ring Intelligence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Platform Capabilities</h2>
          </div>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔄</div>
              <h3 className={styles.featureTitle}>Real-Time Processing</h3>
              <p className={styles.featureDescription}>
                Process millions of events per second with sub-second latency for immediate threat detection
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🧠</div>
              <h3 className={styles.featureTitle}>AI-Powered Analysis</h3>
              <p className={styles.featureDescription}>
                Machine learning models trained on billions of transactions to identify complex patterns
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🌐</div>
              <h3 className={styles.featureTitle}>Multi-Chain Coverage</h3>
              <p className={styles.featureDescription}>
                Monitor Bitcoin, Ethereum, and 50+ blockchain networks from a single platform
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3 className={styles.featureTitle}>Comprehensive Dashboards</h3>
              <p className={styles.featureDescription}>
                Customizable intelligence dashboards with real-time alerts and historical analysis
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔐</div>
              <h3 className={styles.featureTitle}>Enterprise Security</h3>
              <p className={styles.featureDescription}>
                SOC 2, FedRAMP, and CJIS compliant with zero-trust architecture
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚙️</div>
              <h3 className={styles.featureTitle}>API-First Design</h3>
              <p className={styles.featureDescription}>
                RESTful and WebSocket APIs for seamless integration with existing systems
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Deploy Intelligence?</h2>
            <p className={styles.ctaDescription}>
              Join government agencies and Fortune 500 companies using GhostQuant for financial intelligence
            </p>
            <div className={styles.ctaButtons}>
              <button className={styles.ctaPrimary}>Explore Live Intelligence</button>
              <button className={styles.ctaSecondary}>Request Enterprise Demo</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
