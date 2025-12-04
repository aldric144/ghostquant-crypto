'use client';

import React, { useState, useEffect } from 'react';
import { demoClient, DemoCortexPattern } from '@/lib/demoClient';
import styles from '@/styles/demo/demo-panels.scss';

export default function DemoCortexPanel() {
  const [data, setData] = useState<DemoCortexPattern | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await demoClient.getCortex();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch cortex:', error);
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
        <div className={styles.panelTitle}>Cortex Memory</div>
        <div className={`${styles.panelBadge} ${styles.active}`}>
          {data.occurrences}
        </div>
      </div>
      <div className={styles.panelContent}>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Pattern</div>
          <div className={styles.metricValue}>{data.pattern_name}</div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Frequency</div>
          <div className={`${styles.metricValue} ${styles.cyan}`}>
            {data.frequency}
          </div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Confidence</div>
          <div className={styles.metricValue}>
            {(data.confidence * 100).toFixed(0)}%
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
