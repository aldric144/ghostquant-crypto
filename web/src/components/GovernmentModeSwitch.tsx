'use client';

import React, { useState } from 'react';
import styles from './GovernmentModeSwitch.module.scss';

type ViewMode = 'public' | 'analyst' | 'government';

interface GovernmentModeSwitchProps {
  onModeChange?: (mode: ViewMode) => void;
  className?: string;
}

export default function GovernmentModeSwitch({ onModeChange, className = '' }: GovernmentModeSwitchProps) {
  const [activeMode, setActiveMode] = useState<ViewMode>('public');

  const modes = [
    {
      id: 'public' as ViewMode,
      label: 'Public View',
      description: 'Standard intelligence overview',
      icon: '👁️',
      color: '#22E0FF',
    },
    {
      id: 'analyst' as ViewMode,
      label: 'Analyst Mode',
      description: 'Enhanced threat analysis',
      icon: '🔍',
      color: '#3A8DFF',
    },
    {
      id: 'government' as ViewMode,
      label: 'Government Clearance',
      description: 'Full intelligence access',
      icon: '🛡️',
      color: '#7F5AF0',
    },
  ];

  const handleModeChange = (mode: ViewMode) => {
    setActiveMode(mode);
    if (onModeChange) {
      onModeChange(mode);
    }
  };

  return (
    <div className={`${styles.switchContainer} ${className}`}>
      {/* Mode Selector */}
      <div className={styles.modeSelector}>
        {modes.map((mode) => (
          <button
            key={mode.id}
            className={`${styles.modeButton} ${activeMode === mode.id ? styles.active : ''}`}
            onClick={() => handleModeChange(mode.id)}
            style={{
              '--mode-color': mode.color,
            } as React.CSSProperties}
          >
            <span className={styles.modeIcon}>{mode.icon}</span>
            <div className={styles.modeInfo}>
              <span className={styles.modeLabel}>{mode.label}</span>
              <span className={styles.modeDescription}>{mode.description}</span>
            </div>
            {activeMode === mode.id && <div className={styles.activeIndicator}></div>}
          </button>
        ))}
      </div>

      {/* Current Mode Display */}
      <div className={styles.currentMode}>
        <div className={styles.currentModeHeader}>
          <span className={styles.currentModeLabel}>ACTIVE MODE</span>
          <span className={styles.currentModeBadge}>
            {modes.find((m) => m.id === activeMode)?.label.toUpperCase()}
          </span>
        </div>
        
        <div className={styles.currentModeDetails}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Access Level</span>
            <span className={styles.detailValue}>
              {activeMode === 'public' && 'Level 1'}
              {activeMode === 'analyst' && 'Level 2'}
              {activeMode === 'government' && 'Level 3'}
            </span>
          </div>
          
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Data Visibility</span>
            <span className={styles.detailValue}>
              {activeMode === 'public' && 'Standard'}
              {activeMode === 'analyst' && 'Enhanced'}
              {activeMode === 'government' && 'Full Spectrum'}
            </span>
          </div>
          
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Threat Intelligence</span>
            <span className={styles.detailValue}>
              {activeMode === 'public' && 'Basic'}
              {activeMode === 'analyst' && 'Advanced'}
              {activeMode === 'government' && 'Classified'}
            </span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className={styles.securityNotice}>
        <div className={styles.noticeIcon}>🔒</div>
        <div className={styles.noticeText}>
          {activeMode === 'public' && 'Public access mode - Limited intelligence data'}
          {activeMode === 'analyst' && 'Analyst mode - Enhanced threat detection enabled'}
          {activeMode === 'government' && 'Government clearance - Full intelligence access granted'}
        </div>
      </div>
    </div>
  );
}
