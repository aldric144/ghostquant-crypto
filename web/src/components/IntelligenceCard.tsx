'use client';

import React from 'react';
import styles from './IntelligenceCard.module.scss';

interface IntelligenceCardProps {
  title: string;
  description: string;
  variant?: 'intel' | 'risk' | 'system';
  icon?: string;
  className?: string;
}

export default function IntelligenceCard({
  title,
  description,
  variant = 'intel',
  icon,
  className = '',
}: IntelligenceCardProps) {
  return (
    <div className={`${styles.card} ${styles[variant]} ${className}`}>
      {/* Animated Border */}
      <div className={styles.borderGlow}></div>
      
      {/* Corner Accents */}
      <div className={styles.cornerTopLeft}></div>
      <div className={styles.cornerTopRight}></div>
      <div className={styles.cornerBottomLeft}></div>
      <div className={styles.cornerBottomRight}></div>
      
      {/* Content */}
      <div className={styles.content}>
        {icon && (
          <div className={styles.iconWrapper}>
            <div className={styles.icon}>{icon}</div>
            <div className={styles.iconGlow}></div>
          </div>
        )}
        
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        
        {/* Status Indicator */}
        <div className={styles.statusBar}>
          <div className={styles.statusDot}></div>
          <span className={styles.statusText}>ACTIVE</span>
        </div>
      </div>
      
      {/* Hologram Shimmer */}
      <div className={styles.shimmer}></div>
      
      {/* Scanline Effect */}
      <div className={styles.scanline}></div>
    </div>
  );
}
