'use client';

import React from 'react';
import AuroraStream from '@/components/AuroraStream';
import StarfieldBackground from '@/components/StarfieldBackground';
import AnimatedMap from '@/components/AnimatedMap';
import styles from './page.module.scss';

export default function ConstellationPage() {
  const threatClusters = [
    { name: 'Supernova Alpha', type: 'supernova', entities: 47, risk: 94, region: 'Global' },
    { name: 'Wormhole Beta', type: 'wormhole', entities: 23, risk: 87, region: 'Asia-Pacific' },
    { name: 'Nebula Gamma', type: 'nebula', entities: 156, risk: 62, region: 'Europe' },
    { name: 'Supernova Delta', type: 'supernova', entities: 31, risk: 91, region: 'North America' },
  ];

  return (
    <div className={styles.constellationPage}>
      <StarfieldBackground />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroIcon}>🌌</div>
            <h1 className={styles.heroTitle}>Global Threat Constellation Map</h1>
            <p className={styles.heroSubtitle}>
              3D Visualization of Global Threat Networks & Entity Clusters
            </p>
            <p className={styles.heroDescription}>
              The Constellation Map visualizes global threat networks as cosmic structures. Supernovas
              represent explosive coordinated attacks, wormholes show cross-chain manipulation tunnels,
              and nebulas indicate diffuse threat clouds. Real-time 3D visualization reveals hidden
              connections across the entire cryptocurrency ecosystem.
            </p>
          </div>
        </div>
      </section>

      <AuroraStream />

      {/* 3D Constellation Viewer */}
      <section className={styles.viewerSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Live Constellation Viewer</h2>
            <p className={styles.sectionSubtitle}>
              Interactive 3D map of global threat networks
            </p>
          </div>

          <div className={styles.constellationViewer}>
            <AnimatedMap />
            <div className={styles.viewerOverlay}>
              <div className={styles.viewerStats}>
                <div className={styles.viewerStat}>
                  <span className={styles.statValue}>2,847</span>
                  <span className={styles.statLabel}>Active Entities</span>
                </div>
                <div className={styles.viewerStat}>
                  <span className={styles.statValue}>47</span>
                  <span className={styles.statLabel}>Threat Clusters</span>
                </div>
                <div className={styles.viewerStat}>
                  <span className={styles.statValue}>12</span>
                  <span className={styles.statLabel}>Supernovas</span>
                </div>
                <div className={styles.viewerStat}>
                  <span className={styles.statValue}>8</span>
                  <span className={styles.statLabel}>Wormholes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Threat Clusters */}
      <section className={styles.clustersSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Active Threat Clusters</h2>
            <p className={styles.sectionSubtitle}>
              High-priority threat networks requiring immediate attention
            </p>
          </div>

          <div className={styles.clustersGrid}>
            {threatClusters.map((cluster, idx) => (
              <div key={idx} className={styles.clusterCard}>
                <div className={styles.clusterHeader}>
                  <div className={styles.clusterIcon}>
                    {cluster.type === 'supernova' && '💥'}
                    {cluster.type === 'wormhole' && '🌀'}
                    {cluster.type === 'nebula' && '☁️'}
                  </div>
                  <div className={styles.clusterInfo}>
                    <h3 className={styles.clusterName}>{cluster.name}</h3>
                    <span className={styles.clusterType}>{cluster.type}</span>
                  </div>
                </div>
                <div className={styles.clusterStats}>
                  <div className={styles.clusterStat}>
                    <span className={styles.clusterStatLabel}>Entities</span>
                    <span className={styles.clusterStatValue}>{cluster.entities}</span>
                  </div>
                  <div className={styles.clusterStat}>
                    <span className={styles.clusterStatLabel}>Risk Score</span>
                    <span className={styles.clusterStatValue} style={{ color: cluster.risk > 85 ? '#FF1E44' : '#F25F4C' }}>
                      {cluster.risk}
                    </span>
                  </div>
                  <div className={styles.clusterStat}>
                    <span className={styles.clusterStatLabel}>Region</span>
                    <span className={styles.clusterStatValue}>{cluster.region}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Risk Gauge */}
      <section className={styles.gaugeSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Global Risk Gauge</h2>
            <p className={styles.sectionSubtitle}>
              Real-time assessment of systemic threat levels
            </p>
          </div>

          <div className={styles.riskGauge}>
            <div className={styles.gaugeCircle}>
              <svg className={styles.gaugeSvg} viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#FF1E44"
                  strokeWidth="20"
                  strokeDasharray="502.4"
                  strokeDashoffset="125.6"
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className={styles.gaugeValue}>
                <span className={styles.gaugeNumber}>75</span>
                <span className={styles.gaugeLabel}>Risk Level</span>
              </div>
            </div>
            <div className={styles.gaugeDescription}>
              <p>
                Current global risk level indicates elevated threat activity across multiple regions.
                12 active supernovas and 8 wormholes detected in the past 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Open Full Constellation Map</h2>
            <p className={styles.ctaDescription}>
              Access the complete 3D constellation viewer in the Terminal
            </p>
            <button className={styles.ctaButton}>Launch Terminal Viewer</button>
          </div>
        </div>
      </section>
    </div>
  );
}
