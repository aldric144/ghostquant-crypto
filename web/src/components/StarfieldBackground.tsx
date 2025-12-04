'use client';

import React from 'react';
import styles from './StarfieldBackground.module.scss';

interface StarfieldBackgroundProps {
  className?: string;
}

export default function StarfieldBackground({ className = '' }: StarfieldBackgroundProps) {
  const generateStars = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.5,
      animationDelay: Math.random() * 5,
    }));
  };

  const layer1Stars = generateStars(50);
  const layer2Stars = generateStars(30);
  const layer3Stars = generateStars(20);

  return (
    <div className={`${styles.starfield} ${className}`}>
      {/* Layer 1 - Distant Stars (Slow) */}
      <div className={styles.layer1}>
        {layer1Stars.map((star) => (
          <div
            key={star.id}
            className={styles.star}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.animationDelay}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Layer 2 - Mid-distance Stars (Medium) */}
      <div className={styles.layer2}>
        {layer2Stars.map((star) => (
          <div
            key={star.id}
            className={styles.star}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size * 1.2}px`,
              height: `${star.size * 1.2}px`,
              opacity: star.opacity,
              animationDelay: `${star.animationDelay}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Layer 3 - Close Stars (Fast) */}
      <div className={styles.layer3}>
        {layer3Stars.map((star) => (
          <div
            key={star.id}
            className={styles.star}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size * 1.5}px`,
              height: `${star.size * 1.5}px`,
              opacity: star.opacity,
              animationDelay: `${star.animationDelay}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Floating Particles */}
      <div className={styles.floatingParticles}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className={styles.floatingParticle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
