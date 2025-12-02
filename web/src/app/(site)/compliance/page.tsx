'use client';

import React from 'react';
import AuroraStream from '@/components/AuroraStream';
import StarfieldBackground from '@/components/StarfieldBackground';
import styles from './page.module.scss';

export default function CompliancePage() {
  const complianceBadges = [
    { name: 'CJIS', description: 'Criminal Justice Information Services', status: 'Certified' },
    { name: 'NIST 800-53', description: 'Federal Security Controls', status: 'Compliant' },
    { name: 'SOC 2 Type II', description: 'Service Organization Control', status: 'Certified' },
    { name: 'FedRAMP', description: 'Federal Risk Authorization', status: 'In Progress' },
    { name: 'ISO 27001', description: 'Information Security Management', status: 'Certified' },
    { name: 'GDPR', description: 'General Data Protection Regulation', status: 'Compliant' },
  ];

  const zeroTrustPrinciples = [
    { title: 'Verify Explicitly', description: 'Always authenticate and authorize based on all available data points' },
    { title: 'Least Privilege Access', description: 'Limit user access with Just-In-Time and Just-Enough-Access' },
    { title: 'Assume Breach', description: 'Minimize blast radius and segment access. Verify end-to-end encryption' },
  ];

  return (
    <div className={styles.compliancePage}>
      <StarfieldBackground />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroIcon}>🔒</div>
            <h1 className={styles.heroTitle}>Compliance & Security Center</h1>
            <p className={styles.heroSubtitle}>
              Federal-Grade Security & Regulatory Compliance
            </p>
            <p className={styles.heroDescription}>
              GhostQuant meets the highest standards for government and enterprise security.
              Our platform is built on Zero-Trust architecture with comprehensive compliance
              certifications including CJIS, NIST 800-53, SOC 2, and FedRAMP authorization.
            </p>
          </div>
        </div>
      </section>

      <AuroraStream />

      {/* Compliance Badges */}
      <section className={styles.badgesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Compliance Certifications</h2>
            <p className={styles.sectionSubtitle}>
              Industry-leading security and compliance standards
            </p>
          </div>

          <div className={styles.badgesGrid}>
            {complianceBadges.map((badge, idx) => (
              <div key={idx} className={styles.badgeCard}>
                <div className={styles.badgeName}>{badge.name}</div>
                <div className={styles.badgeDescription}>{badge.description}</div>
                <div className={`${styles.badgeStatus} ${styles[badge.status.toLowerCase().replace(' ', '-')]}`}>
                  {badge.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zero-Trust Architecture */}
      <section className={styles.zeroTrustSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Zero-Trust Architecture</h2>
            <p className={styles.sectionSubtitle}>
              Never trust, always verify - security at every layer
            </p>
          </div>

          <div className={styles.architectureDiagram}>
            <div className={styles.architectureLayer}>
              <div className={styles.layerTitle}>Identity & Access</div>
              <div className={styles.layerContent}>
                Multi-factor authentication, role-based access control, continuous verification
              </div>
            </div>
            <div className={styles.architectureArrow}>↓</div>
            <div className={styles.architectureLayer}>
              <div className={styles.layerTitle}>Network Security</div>
              <div className={styles.layerContent}>
                Micro-segmentation, encrypted tunnels, intrusion detection
              </div>
            </div>
            <div className={styles.architectureArrow}>↓</div>
            <div className={styles.architectureLayer}>
              <div className={styles.layerTitle}>Data Protection</div>
              <div className={styles.layerContent}>
                End-to-end encryption, data loss prevention, secure key management
              </div>
            </div>
            <div className={styles.architectureArrow}>↓</div>
            <div className={styles.architectureLayer}>
              <div className={styles.layerTitle}>Application Security</div>
              <div className={styles.layerContent}>
                Secure development lifecycle, vulnerability scanning, penetration testing
              </div>
            </div>
          </div>

          <div className={styles.principlesGrid}>
            {zeroTrustPrinciples.map((principle, idx) => (
              <div key={idx} className={styles.principleCard}>
                <h3 className={styles.principleTitle}>{principle.title}</h3>
                <p className={styles.principleDescription}>{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Governance */}
      <section className={styles.governanceSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Data Governance Summary</h2>
            <p className={styles.sectionSubtitle}>
              Comprehensive data management and protection policies
            </p>
          </div>

          <div className={styles.governanceGrid}>
            <div className={styles.governanceCard}>
              <div className={styles.governanceIcon}>🗄️</div>
              <h3 className={styles.governanceTitle}>Data Classification</h3>
              <p className={styles.governanceDescription}>
                All data is classified by sensitivity level with appropriate handling procedures
                for public, internal, confidential, and classified information.
              </p>
            </div>
            <div className={styles.governanceCard}>
              <div className={styles.governanceIcon}>🔐</div>
              <h3 className={styles.governanceTitle}>Encryption Standards</h3>
              <p className={styles.governanceDescription}>
                AES-256 encryption at rest, TLS 1.3 in transit, with FIPS 140-2 validated
                cryptographic modules for government deployments.
              </p>
            </div>
            <div className={styles.governanceCard}>
              <div className={styles.governanceIcon}>📋</div>
              <h3 className={styles.governanceTitle}>Retention Policies</h3>
              <p className={styles.governanceDescription}>
                Configurable data retention with automated archival, secure deletion, and
                compliance with legal hold requirements.
              </p>
            </div>
            <div className={styles.governanceCard}>
              <div className={styles.governanceIcon}>👁️</div>
              <h3 className={styles.governanceTitle}>Access Logging</h3>
              <p className={styles.governanceDescription}>
                Comprehensive audit logs of all data access with tamper-proof storage and
                real-time anomaly detection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory Readiness */}
      <section className={styles.regulatorySection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Regulatory Readiness Panel</h2>
            <p className={styles.sectionSubtitle}>
              Continuous compliance monitoring and reporting
            </p>
          </div>

          <div className={styles.regulatoryPanel}>
            <div className={styles.regulatoryMetric}>
              <div className={styles.metricValue}>100%</div>
              <div className={styles.metricLabel}>Control Coverage</div>
            </div>
            <div className={styles.regulatoryMetric}>
              <div className={styles.metricValue}>99.9%</div>
              <div className={styles.metricLabel}>Uptime SLA</div>
            </div>
            <div className={styles.regulatoryMetric}>
              <div className={styles.metricValue}>24/7</div>
              <div className={styles.metricLabel}>Security Monitoring</div>
            </div>
            <div className={styles.regulatoryMetric}>
              <div className={styles.metricValue}>< 1hr</div>
              <div className={styles.metricLabel}>Incident Response</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Download Compliance Packet</h2>
            <p className={styles.ctaDescription}>
              Get detailed compliance documentation, certifications, and security whitepapers
            </p>
            <button className={styles.ctaButton}>Download Documentation</button>
          </div>
        </div>
      </section>
    </div>
  );
}
