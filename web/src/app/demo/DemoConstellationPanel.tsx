'use client';

import React, { useState, useEffect } from 'react';
import { demoClient, DemoConstellation } from '@/lib/demoClient';
import styles from '@/styles/demo/demo-panels.scss';

export default function DemoConstellationPanel() {
  const [data, setData] = useState<DemoConstellation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await demoClient.getConstellation();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch constellation:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className={styles.demoPanel}>
        <div className={styles.panelLoading}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.demoPanel}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>Constellation Map</div>
        <div className={`${styles.panelBadge} ${styles.active}`}>
          {data.global_risk_level}
        </div>
      </div>
      <div className={styles.panelContent}>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Entities</div>
          <div className={`${styles.metricValue} ${styles.cyan}`}>
            {data.total_entities.toLocaleString()}
          </div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Supernovas</div>
          <div className={`${styles.metricValue} ${styles.critical}`}>
            {data.supernovas}
          </div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Wormholes</div>
          <div className={`${styles.metricValue} ${styles.high}`}>
            {data.wormholes}
          </div>
        </div>
        <div className={styles.panelActions}>
          <button className={styles.panelButton} onClick={fetchData}>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
