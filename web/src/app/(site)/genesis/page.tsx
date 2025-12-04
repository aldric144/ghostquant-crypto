'use client';

import React from 'react';
import AuroraStream from '@/components/AuroraStream';
import StarfieldBackground from '@/components/StarfieldBackground';
import styles from './page.module.scss';

export default function GenesisPage() {
  const ledgerBlocks = [
    { block: 1, timestamp: '2025-01-01 00:00:00', events: 47, hash: 'a3f2...9d8c' },
    { block: 2, timestamp: '2025-01-01 00:15:00', events: 52, hash: 'b7e4...2a1f' },
    { block: 3, timestamp: '2025-01-01 00:30:00', events: 38, hash: 'c9d6...5b3e' },
    { block: 4, timestamp: '2025-01-01 00:45:00', events: 61, hash: 'd2a8...7c4d' },
  ];

  return (
    <div className={styles.genesisPage}>
      <StarfieldBackground />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroIcon}>📜</div>
            <h1 className={styles.heroTitle}>Genesis Archive</h1>
            <p className={styles.heroSubtitle}>
              Immutable Ledger of All Intelligence Events & Detections
            </p>
            <p className={styles.heroDescription}>
              Genesis is the immutable archive that records every intelligence event, detection, and
              analysis performed by GhostQuant. Built on cryptographic integrity verification, the
              Genesis ledger ensures complete auditability and tamper-proof evidence chains for
              regulatory compliance, legal proceedings, and government oversight.
            </p>
          </div>
        </div>
      </section>

      <AuroraStream />

      {/* Ledger Block Diagram */}
      <section className={styles.ledgerSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Ledger Block Structure</h2>
            <p className={styles.sectionSubtitle}>
              Cryptographically linked blocks forming an immutable audit trail
            </p>
          </div>

          <div className={styles.ledgerChain}>
            {ledgerBlocks.map((block, idx) => (
              <React.Fragment key={idx}>
                <div className={styles.ledgerBlock}>
                  <div className={styles.blockHeader}>
                    <span className={styles.blockNumber}>Block #{block.block}</span>
                  </div>
                  <div className={styles.blockContent}>
                    <div className={styles.blockField}>
                      <span className={styles.blockFieldLabel}>Timestamp</span>
                      <span className={styles.blockFieldValue}>{block.timestamp}</span>
                    </div>
                    <div className={styles.blockField}>
                      <span className={styles.blockFieldLabel}>Events</span>
                      <span className={styles.blockFieldValue}>{block.events}</span>
                    </div>
                    <div className={styles.blockField}>
                      <span className={styles.blockFieldLabel}>Hash</span>
                      <span className={styles.blockFieldValue}>{block.hash}</span>
                    </div>
                  </div>
                </div>
                {idx < ledgerBlocks.length - 1 && (
                  <div className={styles.blockConnector}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Integrity Verification */}
      <section className={styles.verificationSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Integrity Verification</h2>
            <p className={styles.sectionSubtitle}>
              Cryptographic proof of ledger integrity and tamper detection
            </p>
          </div>

          <div className={styles.verificationPanel}>
            <div className={styles.verificationStep}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Event Recording</h3>
                <p className={styles.stepDescription}>
                  Every intelligence event is recorded with timestamp, source engine, and full context
                </p>
              </div>
            </div>
            <div className={styles.verificationStep}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>SHA-256 Hashing</h3>
                <p className={styles.stepDescription}>
                  Each block is hashed using SHA-256, including the previous block's hash
                </p>
              </div>
            </div>
            <div className={styles.verificationStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Chain Verification</h3>
                <p className={styles.stepDescription}>
                  Continuous verification ensures no blocks have been altered or removed
                </p>
              </div>
            </div>
            <div className={styles.verificationStep}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Audit Export</h3>
                <p className={styles.stepDescription}>
                  Complete audit trails can be exported for regulatory review and legal proceedings
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHA-256 Chain Visualization */}
      <section className={styles.chainSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>SHA-256 Chain Visualization</h2>
            <p className={styles.sectionSubtitle}>
              Cryptographic linking ensures immutability
            </p>
          </div>

          <div className={styles.chainVisualization}>
            <div className={styles.chainBlock}>
              <div className={styles.chainBlockTitle}>Block N-1</div>
              <div className={styles.chainBlockHash}>Hash: a3f2...9d8c</div>
            </div>
            <div className={styles.chainArrow}>→</div>
            <div className={styles.chainBlock}>
              <div className={styles.chainBlockTitle}>Block N</div>
              <div className={styles.chainBlockField}>
                <span>Prev Hash:</span>
                <span>a3f2...9d8c</span>
              </div>
              <div className={styles.chainBlockField}>
                <span>Data:</span>
                <span>47 events</span>
              </div>
              <div className={styles.chainBlockHash}>Hash: b7e4...2a1f</div>
            </div>
            <div className={styles.chainArrow}>→</div>
            <div className={styles.chainBlock}>
              <div className={styles.chainBlockTitle}>Block N+1</div>
              <div className={styles.chainBlockField}>
                <span>Prev Hash:</span>
                <span>b7e4...2a1f</span>
              </div>
              <div className={styles.chainBlockField}>
                <span>Data:</span>
                <span>52 events</span>
              </div>
              <div className={styles.chainBlockHash}>Hash: c9d6...5b3e</div>
            </div>
          </div>
        </div>
      </section>

      {/* Governance & Regulatory */}
      <section className={styles.governanceSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Governance & Regulatory Compliance</h2>
            <p className={styles.sectionSubtitle}>
              Genesis Archive meets federal evidence and audit requirements
            </p>
          </div>

          <div className={styles.governanceGrid}>
            <div className={styles.governanceCard}>
              <div className={styles.governanceIcon}>⚖️</div>
              <h3 className={styles.governanceTitle}>Legal Evidence Chain</h3>
              <p className={styles.governanceDescription}>
                Tamper-proof audit trails admissible in legal proceedings and regulatory investigations
              </p>
            </div>
            <div className={styles.governanceCard}>
              <div className={styles.governanceIcon}>🏛️</div>
              <h3 className={styles.governanceTitle}>Government Oversight</h3>
              <p className={styles.governanceDescription}>
                Complete transparency for federal agencies with full audit export capabilities
              </p>
            </div>
            <div className={styles.governanceCard}>
              <div className={styles.governanceIcon}>📋</div>
              <h3 className={styles.governanceTitle}>Regulatory Compliance</h3>
              <p className={styles.governanceDescription}>
                Meets CJIS, FedRAMP, and SOC 2 requirements for audit logging and data integrity
              </p>
            </div>
            <div className={styles.governanceCard}>
              <div className={styles.governanceIcon}>🔒</div>
              <h3 className={styles.governanceTitle}>Data Retention</h3>
              <p className={styles.governanceDescription}>
                Configurable retention policies with automatic archival and compliance reporting
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>View Ledger Snapshot</h2>
            <p className={styles.ctaDescription}>
              Access the Genesis Archive and explore the immutable intelligence ledger
            </p>
            <button className={styles.ctaButton}>Open Genesis Archive</button>
          </div>
        </div>
      </section>
    </div>
  );
}
