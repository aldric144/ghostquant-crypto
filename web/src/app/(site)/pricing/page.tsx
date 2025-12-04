'use client';

import React from 'react';
import AuroraStream from '@/components/AuroraStream';
import StarfieldBackground from '@/components/StarfieldBackground';
import styles from './page.module.scss';

export default function PricingPage() {
  const pricingTiers = [
    {
      name: 'Developer',
      price: '$499',
      period: '/month',
      description: 'For individual developers and small teams',
      features: [
        '5,000 API calls/month',
        'Access to 6 core engines',
        'Basic threat intelligence',
        'Email support',
        'Community access',
      ],
      cta: 'Start Free Trial',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$2,499',
      period: '/month',
      description: 'For growing organizations and security teams',
      features: [
        '50,000 API calls/month',
        'Access to all 11 engines',
        'Advanced threat intelligence',
        'Priority support',
        'Custom integrations',
        'Dedicated account manager',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: '$9,999',
      period: '/month',
      description: 'For large organizations and institutions',
      features: [
        'Unlimited API calls',
        'Full platform access',
        'Real-time intelligence feeds',
        '24/7 premium support',
        'Custom deployment options',
        'SLA guarantees',
        'Compliance reporting',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
    {
      name: 'Government',
      price: 'Custom',
      period: '',
      description: 'For federal, state, and local agencies',
      features: [
        'Unlimited API calls',
        'Government-grade security',
        'CJIS/FedRAMP compliance',
        'On-premise deployment',
        'Dedicated infrastructure',
        'Classified data handling',
        'Federal support team',
      ],
      cta: 'Request Access',
      highlighted: false,
    },
  ];

  return (
    <div className={styles.pricingPage}>
      <StarfieldBackground />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Pricing & Plans</h1>
            <p className={styles.heroSubtitle}>
              Choose the right intelligence platform for your organization
            </p>
            <p className={styles.heroDescription}>
              From individual developers to federal agencies, GhostQuant scales to meet your
              threat intelligence needs. All plans include core detection capabilities with
              flexible scaling options.
            </p>
          </div>
        </div>
      </section>

      <AuroraStream />

      {/* Pricing Tiers */}
      <section className={styles.tiersSection}>
        <div className={styles.container}>
          <div className={styles.tiersGrid}>
            {pricingTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`${styles.tierCard} ${tier.highlighted ? styles.highlighted : ''}`}
              >
                {tier.highlighted && <div className={styles.popularBadge}>Most Popular</div>}
                <div className={styles.tierHeader}>
                  <h3 className={styles.tierName}>{tier.name}</h3>
                  <div className={styles.tierPrice}>
                    <span className={styles.priceAmount}>{tier.price}</span>
                    <span className={styles.pricePeriod}>{tier.period}</span>
                  </div>
                  <p className={styles.tierDescription}>{tier.description}</p>
                </div>
                <div className={styles.tierFeatures}>
                  {tier.features.map((feature, fidx) => (
                    <div key={fidx} className={styles.tierFeature}>
                      <span className={styles.featureIcon}>✓</span>
                      <span className={styles.featureText}>{feature}</span>
                    </div>
                  ))}
                </div>
                <button className={styles.tierButton}>{tier.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Comparison */}
      <section className={styles.comparisonSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Enterprise Feature Comparison</h2>
            <p className={styles.sectionSubtitle}>
              Detailed breakdown of capabilities across all plans
            </p>
          </div>

          <div className={styles.comparisonTable}>
            <div className={styles.comparisonRow}>
              <div className={styles.comparisonFeature}>Detection Engines</div>
              <div className={styles.comparisonValue}>6 engines</div>
              <div className={styles.comparisonValue}>11 engines</div>
              <div className={styles.comparisonValue}>11 engines</div>
              <div className={styles.comparisonValue}>11 engines</div>
            </div>
            <div className={styles.comparisonRow}>
              <div className={styles.comparisonFeature}>API Rate Limit</div>
              <div className={styles.comparisonValue}>5K/month</div>
              <div className={styles.comparisonValue}>50K/month</div>
              <div className={styles.comparisonValue}>Unlimited</div>
              <div className={styles.comparisonValue}>Unlimited</div>
            </div>
            <div className={styles.comparisonRow}>
              <div className={styles.comparisonFeature}>Real-time Alerts</div>
              <div className={styles.comparisonValue}>Basic</div>
              <div className={styles.comparisonValue}>Advanced</div>
              <div className={styles.comparisonValue}>Premium</div>
              <div className={styles.comparisonValue}>Premium</div>
            </div>
            <div className={styles.comparisonRow}>
              <div className={styles.comparisonFeature}>Support Level</div>
              <div className={styles.comparisonValue}>Email</div>
              <div className={styles.comparisonValue}>Priority</div>
              <div className={styles.comparisonValue}>24/7</div>
              <div className={styles.comparisonValue}>Federal</div>
            </div>
            <div className={styles.comparisonRow}>
              <div className={styles.comparisonFeature}>Compliance Reporting</div>
              <div className={styles.comparisonValue}>—</div>
              <div className={styles.comparisonValue}>Basic</div>
              <div className={styles.comparisonValue}>Full</div>
              <div className={styles.comparisonValue}>Government</div>
            </div>
          </div>
        </div>
      </section>

      {/* Volume Discounts */}
      <section className={styles.volumeSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Volume Discounts</h2>
            <p className={styles.sectionSubtitle}>
              Save more with higher API usage tiers
            </p>
          </div>

          <div className={styles.volumeGrid}>
            <div className={styles.volumeCard}>
              <div className={styles.volumeAmount}>100K calls/month</div>
              <div className={styles.volumeDiscount}>10% discount</div>
            </div>
            <div className={styles.volumeCard}>
              <div className={styles.volumeAmount}>500K calls/month</div>
              <div className={styles.volumeDiscount}>20% discount</div>
            </div>
            <div className={styles.volumeCard}>
              <div className={styles.volumeAmount}>1M+ calls/month</div>
              <div className={styles.volumeDiscount}>30% discount</div>
            </div>
          </div>
        </div>
      </section>

      {/* API Usage Pricing */}
      <section className={styles.apiSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>API Usage Pricing</h2>
            <p className={styles.sectionSubtitle}>
              Pay-as-you-go pricing for additional API calls
            </p>
          </div>

          <div className={styles.apiPricing}>
            <div className={styles.apiTier}>
              <div className={styles.apiTierName}>Standard Endpoints</div>
              <div className={styles.apiTierPrice}>$0.01 per call</div>
            </div>
            <div className={styles.apiTier}>
              <div className={styles.apiTierName}>Advanced Analytics</div>
              <div className={styles.apiTierPrice}>$0.05 per call</div>
            </div>
            <div className={styles.apiTier}>
              <div className={styles.apiTierName}>Real-time Intelligence</div>
              <div className={styles.apiTierPrice}>$0.10 per call</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Start Your Free Trial</h2>
            <p className={styles.ctaDescription}>
              Try GhostQuant free for 14 days. No credit card required.
            </p>
            <button className={styles.ctaButton}>Start Now</button>
          </div>
        </div>
      </section>
    </div>
  );
}
