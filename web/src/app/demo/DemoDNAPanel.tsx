'use client';

import React, { useState, useEffect } from 'react';
import { demoClient, DemoDNA } from '@/lib/demoClient';
import styles from '@/styles/demo/demo-panels.scss';

export default function DemoDNAPanel() {
  const [data, setData] = useState<DemoDNA | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await demoClient.getDNA();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch DNA:', error);
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
        <div className={styles.panelTitle}>Behavioral DNA</div>
        <div className={`${styles.panelBadge} ${styles.active}`}>
          {data.classification}
        </div>
      </div>
      <div className={styles.panelContent}>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Signature</div>
          <div className={styles.metricValue}>{data.behavioral_signature}</div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Consistency</div>
          <div className={`${styles.metricValue} ${styles.cyan}`}>
            {(data.pattern_consistency * 100).toFixed(0)}%
          </div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Anomalies</div>
          <div className={`${styles.metricValue} ${styles.high}`}>
            {data.anomaly_detection.length}
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
