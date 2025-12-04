'use client';

import React, { useState, useEffect } from 'react';
import styles from './HeroCinematic.module.scss';

interface HeroCinematicProps {
  className?: string;
}

const taglines = [
  "THE WORLD'S FIRST FINANCIAL INTELLIGENCE FUSION ENGINE",
  "SEE THE INVISIBLE.",
  "FOLLOW THE TRUTH IN THE DARK."
];

export default function HeroCinematic({ className = '' }: HeroCinematicProps) {
  const [currentTagline, setCurrentTagline] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentTagline((prev) => (prev + 1) % taglines.length);
        setIsVisible(true);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${styles.hero} ${className}`}>
      {/* Starfield Background Layers */}
      <div className={styles.starfieldLayer1}></div>
      <div className={styles.starfieldLayer2}></div>
      <div className={styles.starfieldLayer3}></div>

      {/* 3D Planet Ring Hologram */}
      <div className={styles.planetRing}>
        <div className={styles.ringOuter}></div>
        <div className={styles.ringMiddle}></div>
        <div className={styles.ringInner}></div>
        <div className={styles.planetCore}></div>
      </div>

      {/* Neon Grid Lines */}
      <div className={styles.gridOverlay}></div>

      {/* Main Content */}
      <div className={styles.content}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>
            <span className={styles.titleGhost}>GHOST</span>
            <span className={styles.titleQuant}>QUANT</span>
          </h1>
          <div className={styles.titleUnderline}></div>
        </div>

        {/* Animated Tagline */}
        <div className={styles.taglineWrapper}>
          <p className={`${styles.tagline} ${isVisible ? styles.visible : styles.hidden}`}>
            {taglines[currentTagline]}
          </p>
        </div>

        {/* Mission Text */}
        <p className={styles.mission}>
          The world's first AI-powered financial intelligence platform that detects market manipulation,
          tracks behavioral anomalies, and reveals hidden patterns across blockchain networks.
        </p>

        {/* CTA Buttons */}
        <div className={styles.ctaButtons}>
          <button className={styles.primaryButton}>
            <span className={styles.buttonText}>Enter Intelligence Network</span>
            <span className={styles.buttonGlow}></span>
          </button>
          <button className={styles.secondaryButton}>
            <span className={styles.buttonText}>View Intelligence Demo</span>
          </button>
        </div>

        {/* Intelligence Indicators */}
        <div className={styles.indicators}>
          <div className={styles.indicator}>
            <div className={styles.indicatorDot}></div>
            <span className={styles.indicatorText}>LIVE INTELLIGENCE FEED</span>
          </div>
          <div className={styles.indicator}>
            <div className={styles.indicatorDot}></div>
            <span className={styles.indicatorText}>24/7 THREAT DETECTION</span>
          </div>
          <div className={styles.indicator}>
            <div className={styles.indicatorDot}></div>
            <span className={styles.indicatorText}>REAL-TIME ANALYSIS</span>
          </div>
        </div>
      </div>

      {/* Scanline Effect */}
      <div className={styles.scanline}></div>
    </div>
  );
}
