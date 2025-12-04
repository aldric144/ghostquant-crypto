'use client';

import React from 'react';
import styles from './AuroraStream.module.scss';

interface AuroraStreamProps {
  className?: string;
}

export default function AuroraStream({ className = '' }: AuroraStreamProps) {
  return (
    <div className={`${styles.auroraContainer} ${className}`}>
      {/* Multiple Aurora Wave Layers */}
      <div className={styles.auroraWave1}></div>
      <div className={styles.auroraWave2}></div>
      <div className={styles.auroraWave3}></div>
      <div className={styles.auroraWave4}></div>
      
      {/* Particle Effects */}
      <div className={styles.particles}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          ></div>
        ))}
      </div>
      
      {/* Glow Overlay */}
      <div className={styles.glowOverlay}></div>
    </div>
  );
}
