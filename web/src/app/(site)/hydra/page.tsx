'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AuroraStream from '@/components/AuroraStream';
import StarfieldBackground from '@/components/StarfieldBackground';
import styles from './page.module.scss';

export default function HydraPage() {
  const router = useRouter();
  const attackSignatures = [
    { name: 'Coordinated Relay Attack', severity: 'critical', confidence: 94 },
    { name: 'Multi-Hop Proxy Chain', severity: 'high', confidence: 87 },
    { name: 'Distributed Wash Trading', severity: 'high', confidence: 91 },
    { name: 'Synchronized Pump Pattern', severity: 'critical', confidence: 96 },
    { name: 'Cross-Chain Manipulation', severity: 'medium', confidence: 78 },
    { name: 'Layered Obfuscation', severity: 'high', confidence: 89 },
  ];

  return (
    <div className={styles.hydraPage}>
      <StarfieldBackground />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroIcon}>🐉</div>
            <h1 className={styles.heroTitle}>Operation Hydra Engine</h1>
            <p className={styles.heroSubtitle}>
              Coordinated Attack Detection & Relay Network Mapping
            </p>
            <p className={styles.heroDescription}>
              Operation Hydra detects multi-entity coordinated attacks through relay networks. Like the
              mythical hydra with many heads working in concert, this engine identifies when multiple
              entities are acting in coordination to manipulate markets, obscure transactions, or execute
              sophisticated attack patterns.
            </p>
          </div>
        </div>
      </section>

      <AuroraStream />

      {/* Hydra Heads Visualization */}
      <section className={styles.headsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Hydra Detection Heads</h2>
            <p className={styles.sectionSubtitle}>
              Multiple detection layers working in coordination to identify attack patterns
            </p>
          </div>

          <div className={styles.headsVisualization}>
            <div className={styles.hydraCore}>
              <div className={styles.hydraCoreIcon}>🐉</div>
              <div className={styles.hydraCoreLabel}>Hydra Core</div>
            </div>
            
            <div className={styles.hydraHeads}>
              <div className={styles.hydraHead}>
                <span className={styles.headIcon}>👁️</span>
                <span className={styles.headLabel}>Relay Detection</span>
              </div>
              <div className={styles.hydraHead}>
                <span className={styles.headIcon}>🔗</span>
                <span className={styles.headLabel}>Chain Mapping</span>
              </div>
              <div className={styles.hydraHead}>
                <span className={styles.headIcon}>🎯</span>
                <span className={styles.headLabel}>Coordination Analysis</span>
              </div>
              <div className={styles.hydraHead}>
                <span className={styles.headIcon}>⚡</span>
                <span className={styles.headLabel}>Timing Correlation</span>
              </div>
              <div className={styles.hydraHead}>
                <span className={styles.headIcon}>🌐</span>
                <span className={styles.headLabel}>Network Topology</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Relay/Proxy Diagram */}
      <section className={styles.diagramSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Relay Network Mapping</h2>
            <p className={styles.sectionSubtitle}>
              Visualizing multi-hop proxy chains and relay patterns
            </p>
          </div>

          <div className={styles.relayDiagram}>
            <div className={styles.relayNode}>
              <span className={styles.relayNodeLabel}>Origin</span>
              <span className={styles.relayNodeAddress}>0x1a2b...</span>
            </div>
            <div className={styles.relayArrow}>→</div>
            <div className={styles.relayNode}>
              <span className={styles.relayNodeLabel}>Relay 1</span>
              <span className={styles.relayNodeAddress}>0x3c4d...</span>
            </div>
            <div className={styles.relayArrow}>→</div>
            <div className={styles.relayNode}>
              <span className={styles.relayNodeLabel}>Relay 2</span>
              <span className={styles.relayNodeAddress}>0x5e6f...</span>
            </div>
            <div className={styles.relayArrow}>→</div>
            <div className={styles.relayNode}>
              <span className={styles.relayNodeLabel}>Relay 3</span>
              <span className={styles.relayNodeAddress}>0x7g8h...</span>
            </div>
            <div className={styles.relayArrow}>→</div>
            <div className={styles.relayNode}>
              <span className={styles.relayNodeLabel}>Target</span>
              <span className={styles.relayNodeAddress}>0x9i0j...</span>
            </div>
          </div>

          <div className={styles.relayStats}>
            <div className={styles.relayStat}>
              <span className={styles.relayStatLabel}>Relay Hops</span>
              <span className={styles.relayStatValue}>4</span>
            </div>
            <div className={styles.relayStat}>
              <span className={styles.relayStatLabel}>Total Entities</span>
              <span className={styles.relayStatValue}>5</span>
            </div>
            <div className={styles.relayStat}>
              <span className={styles.relayStatLabel}>Obfuscation Level</span>
              <span className={styles.relayStatValue}>High</span>
            </div>
            <div className={styles.relayStat}>
              <span className={styles.relayStatLabel}>Threat Score</span>
              <span className={styles.relayStatValue}>94</span>
            </div>
          </div>
        </div>
      </section>

      {/* Attack Signatures */}
      <section className={styles.signaturesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Attack Signature Library</h2>
            <p className={styles.sectionSubtitle}>
              Known coordinated attack patterns detected by Hydra
            </p>
          </div>

          <div className={styles.signaturesGrid}>
            {attackSignatures.map((sig, idx) => (
              <div key={idx} className={styles.signatureCard}>
                <div className={styles.signatureHeader}>
                  <span className={styles.signatureName}>{sig.name}</span>
                  <span className={`${styles.signatureSeverity} ${styles[sig.severity]}`}>
                    {sig.severity}
                  </span>
                </div>
                <div className={styles.signatureConfidence}>
                  <span className={styles.confidenceLabel}>Confidence</span>
                  <div className={styles.confidenceBar}>
                    <div
                      className={styles.confidenceBarFill}
                      style={{ width: `${sig.confidence}%` }}
                    ></div>
                  </div>
                  <span className={styles.confidenceValue}>{sig.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Detect Coordinated Attacks</h2>
            <p className={styles.ctaDescription}>
              Deploy Hydra to identify multi-entity coordination and relay network manipulation
            </p>
            <button className={styles.ctaButton} onClick={() => router.push('/terminal/hydra')}>Launch Hydra Detection</button>
          </div>
        </div>
      </section>
    </div>
  );
}
