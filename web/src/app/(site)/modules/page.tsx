'use client';

import React, { useState } from 'react';
import IntelligenceCard from '@/components/IntelligenceCard';
import StarfieldBackground from '@/components/StarfieldBackground';
import styles from './page.module.scss';

type Category = 'all' | 'behavioral' | 'predictive' | 'fusion' | 'forensics' | 'government';

interface Module {
  title: string;
  description: string;
  category: Category[];
  variant: 'intel' | 'risk' | 'system';
  icon: string;
  details: string;
}

export default function ModulesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const modules: Module[] = [
    {
      title: 'UltraFusion',
      description: 'Meta-intelligence fusion across all detection engines',
      category: ['fusion', 'predictive'],
      variant: 'intel',
      icon: '⚡',
      details: 'UltraFusion combines intelligence from all 11 specialized engines into unified threat assessments. Real-time correlation of behavioral patterns, network anomalies, and predictive signals creates comprehensive risk profiles.'
    },
    {
      title: 'Operation Hydra',
      description: 'Coordinated attack detection and relay network mapping',
      category: ['behavioral', 'government'],
      variant: 'risk',
      icon: '🐉',
      details: 'Detects multi-entity coordinated attacks through relay networks. Maps proxy chains, identifies attack signatures, and tracks behavioral coordination across blockchain networks.'
    },
    {
      title: 'Constellation',
      description: 'Global threat mapping with supernova event detection',
      category: ['predictive', 'fusion'],
      variant: 'intel',
      icon: '🌌',
      details: 'Visualizes global threat landscape as an interactive constellation. Identifies supernova events (major threats), wormholes (hidden connections), and tracks threat evolution over time.'
    },
    {
      title: 'Sentinel',
      description: 'Real-time command console for 24/7 threat monitoring',
      category: ['government', 'fusion'],
      variant: 'system',
      icon: '🛡️',
      details: 'Command center for continuous threat monitoring. Aggregates alerts from all engines, provides real-time dashboards, and enables rapid response to emerging threats.'
    },
    {
      title: 'Cortex',
      description: '30-day memory engine with pattern recognition',
      category: ['behavioral', 'predictive'],
      variant: 'intel',
      icon: '🧠',
      details: 'Maintains 30-day rolling memory of all events and patterns. Identifies recurring behaviors, detects pattern evolution, and provides historical context for current threats.'
    },
    {
      title: 'Genesis',
      description: 'Immutable forensic ledger for chain-of-custody',
      category: ['forensics', 'government'],
      variant: 'system',
      icon: '📜',
      details: 'Cryptographically sealed forensic ledger maintaining complete chain-of-custody. Every intelligence event is permanently recorded with SHA-256 integrity verification.'
    },
    {
      title: 'Profiler',
      description: 'Entity behavioral profiling and risk scoring',
      category: ['behavioral', 'predictive'],
      variant: 'risk',
      icon: '👤',
      details: 'Builds comprehensive behavioral profiles for entities. Tracks transaction patterns, network relationships, and assigns dynamic risk scores based on observed behavior.'
    },
    {
      title: 'Oracle Eye',
      description: 'Predictive threat intelligence and forecasting',
      category: ['predictive', 'fusion'],
      variant: 'intel',
      icon: '🔮',
      details: 'Machine learning models predict future threats based on historical patterns. Forecasts market manipulation attempts, identifies emerging attack vectors, and provides early warning signals.'
    },
    {
      title: 'Behavioral DNA',
      description: 'Unique behavioral fingerprinting across chains',
      category: ['behavioral', 'forensics'],
      variant: 'intel',
      icon: '🧬',
      details: 'Creates unique behavioral fingerprints for entities across multiple chains. Tracks behavioral consistency, identifies pattern deviations, and links related entities through behavioral similarity.'
    },
    {
      title: 'Radar Engine',
      description: 'Market manipulation and anomaly detection',
      category: ['predictive', 'behavioral'],
      variant: 'risk',
      icon: '📡',
      details: 'Detects market manipulation schemes including pump-and-dump, wash trading, and spoofing. Real-time anomaly detection identifies suspicious trading patterns and coordinated market activity.'
    },
    {
      title: 'Chain Pressure',
      description: 'Network stress analysis and congestion monitoring',
      category: ['predictive', 'fusion'],
      variant: 'system',
      icon: '⚙️',
      details: 'Monitors blockchain network health and congestion levels. Predicts network stress events, identifies bottlenecks, and tracks systemic pressure indicators across chains.'
    },
    {
      title: 'Ring Intelligence',
      description: 'Circular flow detection and wash trading analysis',
      category: ['behavioral', 'forensics'],
      variant: 'risk',
      icon: '🔄',
      details: 'Detects circular transaction flows and wash trading patterns. Maps ring structures, identifies self-dealing, and tracks value circulation through complex entity networks.'
    },
  ];

  const categories = [
    { id: 'all' as Category, label: 'All Modules', count: modules.length },
    { id: 'behavioral' as Category, label: 'Behavioral', count: modules.filter(m => m.category.includes('behavioral')).length },
    { id: 'predictive' as Category, label: 'Predictive', count: modules.filter(m => m.category.includes('predictive')).length },
    { id: 'fusion' as Category, label: 'Fusion', count: modules.filter(m => m.category.includes('fusion')).length },
    { id: 'forensics' as Category, label: 'Forensics', count: modules.filter(m => m.category.includes('forensics')).length },
    { id: 'government' as Category, label: 'Government', count: modules.filter(m => m.category.includes('government')).length },
  ];

  const filteredModules = activeCategory === 'all' 
    ? modules 
    : modules.filter(m => m.category.includes(activeCategory));

  return (
    <div className={styles.modulesPage}>
      <StarfieldBackground />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>Intelligence Modules Library</h1>
          <p className={styles.heroSubtitle}>
            12 specialized detection engines working in concert to provide comprehensive threat intelligence
          </p>
        </div>
      </section>

      {/* Category Filters */}
      <section className={styles.filtersSection}>
        <div className={styles.container}>
          <div className={styles.filters}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.filterButton} ${activeCategory === cat.id ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className={styles.filterLabel}>{cat.label}</span>
                <span className={styles.filterCount}>{cat.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className={styles.modulesSection}>
        <div className={styles.container}>
          <div className={styles.modulesGrid}>
            {filteredModules.map((module, idx) => (
              <div key={idx} onClick={() => setSelectedModule(module)}>
                <IntelligenceCard
                  title={module.title}
                  description={module.description}
                  variant={module.variant}
                  icon={module.icon}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module Details Modal */}
      {selectedModule && (
        <div className={styles.modal} onClick={() => setSelectedModule(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedModule(null)}>×</button>
            
            <div className={styles.modalHeader}>
              <span className={styles.modalIcon}>{selectedModule.icon}</span>
              <h2 className={styles.modalTitle}>{selectedModule.title}</h2>
            </div>

            <div className={styles.modalCategories}>
              {selectedModule.category.map((cat) => (
                <span key={cat} className={styles.modalCategory}>{cat}</span>
              ))}
            </div>

            <p className={styles.modalDescription}>{selectedModule.description}</p>
            <p className={styles.modalDetails}>{selectedModule.details}</p>

            <div className={styles.modalActions}>
              <button className={styles.modalButton}>View Documentation</button>
              <button className={styles.modalButtonSecondary}>Try in Lab</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
