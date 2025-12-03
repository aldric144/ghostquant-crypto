'use client';

import React from 'react';
import HeroCinematic from '@/components/HeroCinematic';
import AuroraStream from '@/components/AuroraStream';
import IntelligenceCard from '@/components/IntelligenceCard';
import AnimatedMap from '@/components/AnimatedMap';
import StarfieldBackground from '@/components/StarfieldBackground';
import styles from './page.module.scss';

export default function HomePage() {
  return (
    <div className={styles.homePage}>
      {/* Starfield Background */}
      <StarfieldBackground />

      {/* Cinematic Hero Section */}
      <section className={styles.heroSection}>
        <HeroCinematic />
      </section>

      {/* Aurora Intelligence Strip */}
      <section className={styles.auroraSection}>
        <AuroraStream />
      </section>

      {/* 3-Card Intelligence Row */}
      <section className={styles.intelligenceCardsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Intelligence Modules</h2>
            <p className={styles.sectionSubtitle}>
              Advanced AI-powered detection systems for financial intelligence
            </p>
          </div>

          <div className={styles.cardsGrid}>
            <IntelligenceCard
              title="Behavioral DNA"
              description="Track and analyze behavioral patterns across blockchain networks. Detect anomalies, identify manipulation tactics, and build comprehensive behavioral profiles."
              variant="intel"
              icon="🧬"
            />
            <IntelligenceCard
              title="UltraFusion Meta-Engine"
              description="Fuse intelligence from multiple sources into a unified threat landscape. Real-time correlation of events, entities, and risk signals."
              variant="system"
              icon="⚡"
            />
            <IntelligenceCard
              title="Global Manipulation Radar"
              description="Detect coordinated market manipulation across chains. Advanced pattern recognition identifies pump-and-dump schemes, wash trading, and collusion."
              variant="risk"
              icon="🎯"
            />
          </div>
        </div>
      </section>

      {/* Animated Global Map Section */}
      <section className={styles.mapSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Global Intelligence Network</h2>
            <p className={styles.sectionSubtitle}>
              Real-time threat detection across major financial centers worldwide
            </p>
          </div>

          <AnimatedMap />
        </div>
      </section>

      {/* Enterprise Trust Strip */}
      <section className={styles.trustSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Enterprise-Grade Security</h2>
            <p className={styles.sectionSubtitle}>
              Trusted by government agencies and Fortune 500 companies
            </p>
          </div>

          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>🔒</div>
              <h3 className={styles.trustTitle}>Zero-Trust Architecture</h3>
              <p className={styles.trustDescription}>
                Military-grade encryption and air-gapped deployment options
              </p>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>✓</div>
              <h3 className={styles.trustTitle}>SOC 2 Type II Certified</h3>
              <p className={styles.trustDescription}>
                Independently audited security and compliance controls
              </p>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>🛡️</div>
              <h3 className={styles.trustTitle}>FedRAMP Ready</h3>
              <p className={styles.trustDescription}>
                Federal security standards for government deployment
              </p>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>🔐</div>
              <h3 className={styles.trustTitle}>CJIS Compliant</h3>
              <p className={styles.trustDescription}>
                Criminal Justice Information Services security policy
              </p>
            </div>
          </div>

          <div className={styles.complianceBadges}>
            <div className={styles.badge}>SOC 2</div>
            <div className={styles.badge}>ISO 27001</div>
            <div className={styles.badge}>FedRAMP</div>
            <div className={styles.badge}>CJIS</div>
            <div className={styles.badge}>NIST 800-53</div>
            <div className={styles.badge}>GDPR</div>
          </div>
        </div>
      </section>

      {/* Developer/API Section */}
      <section className={styles.apiSection}>
        <div className={styles.container}>
          <div className={styles.apiContent}>
            <div className={styles.apiLeft}>
              <h2 className={styles.apiTitle}>Developer-First API</h2>
              <p className={styles.apiDescription}>
                Integrate GhostQuant intelligence into your applications with our comprehensive REST API.
                Real-time threat detection, behavioral analysis, and risk scoring at your fingertips.
              </p>

              <div className={styles.apiFeatures}>
                <div className={styles.apiFeature}>
                  <span className={styles.apiFeatureIcon}>⚡</span>
                  <span className={styles.apiFeatureText}>Real-time WebSocket feeds</span>
                </div>
                <div className={styles.apiFeature}>
                  <span className={styles.apiFeatureIcon}>📊</span>
                  <span className={styles.apiFeatureText}>Historical data access</span>
                </div>
                <div className={styles.apiFeature}>
                  <span className={styles.apiFeatureIcon}>🔍</span>
                  <span className={styles.apiFeatureText}>Advanced query filters</span>
                </div>
                <div className={styles.apiFeature}>
                  <span className={styles.apiFeatureIcon}>🔐</span>
                  <span className={styles.apiFeatureText}>Secure API key authentication</span>
                </div>
              </div>

              <button className={styles.apiButton}>View API Console</button>
            </div>

            <div className={styles.apiRight}>
              <div className={styles.codeBlock}>
                <div className={styles.codeHeader}>
                  <span className={styles.codeLanguage}>TypeScript</span>
                  <span className={styles.codeCopy}>Copy</span>
                </div>
                <pre className={styles.codeContent}>
{`// Initialize GhostQuant API
import { GhostQuantAPI } from '@ghostquant/sdk';

const api = new GhostQuantAPI({
  apiKey: process.env.GHOSTQUANT_API_KEY
});

const threats = await api.intelligence.getThreats({
  chain: 'ethereum',
  severity: 'high',
  timeframe: '24h'
});

const profile = await api.behavioral.analyze({
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  depth: 'comprehensive'
});

api.alerts.subscribe((alert) => {
  console.log('New threat detected:', alert);
});`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerLeft}>
              <div className={styles.footerLogo}>
                <span className={styles.footerLogoGhost}>GHOST</span>
                <span className={styles.footerLogoQuant}>QUANT</span>
              </div>
              <p className={styles.footerTagline}>
                The World's First Financial Intelligence Fusion Engine
              </p>
              <p className={styles.footerCopyright}>
                © 2025 GhostQuant. All rights reserved.
              </p>
            </div>

            <div className={styles.footerLinks}>
              <div className={styles.footerColumn}>
                <h4 className={styles.footerColumnTitle}>Product</h4>
                <a href="/products" className={styles.footerLink}>Intelligence Modules</a>
                <a href="/pricing" className={styles.footerLink}>Pricing</a>
                <a href="/enterprise" className={styles.footerLink}>Enterprise</a>
                <a href="/government" className={styles.footerLink}>Government</a>
              </div>

              <div className={styles.footerColumn}>
                <h4 className={styles.footerColumnTitle}>Resources</h4>
                <a href="/lab" className={styles.footerLink}>Intelligence Lab</a>
                <a href="/cases" className={styles.footerLink}>Case Studies</a>
                <a href="/blog" className={styles.footerLink}>Ghost Files</a>
                <a href="/status" className={styles.footerLink}>System Status</a>
              </div>

              <div className={styles.footerColumn}>
                <h4 className={styles.footerColumnTitle}>Company</h4>
                <a href="/about" className={styles.footerLink}>About</a>
                <a href="/contact" className={styles.footerLink}>Contact</a>
                <a href="/demo" className={styles.footerLink}>Request Demo</a>
              </div>

              <div className={styles.footerColumn}>
                <h4 className={styles.footerColumnTitle}>Legal</h4>
                <a href="/privacy" className={styles.footerLink}>Privacy Policy</a>
                <a href="/terms" className={styles.footerLink}>Terms of Service</a>
                <a href="/compliance" className={styles.footerLink}>Compliance</a>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.footerBottomLeft}>
              <span className={styles.footerStatus}>
                <span className={styles.footerStatusDot}></span>
                All Systems Operational
              </span>
            </div>
            <div className={styles.footerBottomRight}>
              <span className={styles.footerSocial}>Follow Intelligence Updates</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
