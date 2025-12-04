'use client';

import React, { useState, useEffect } from 'react';
import { demoClient, DemoFusion } from '@/lib/demoClient';
import styles from '@/styles/demo/demo-panels.scss';

export default function DemoFusionPanel() {
  const [data, setData] = useState<DemoFusion | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await demoClient.getFusion();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch fusion:', error);
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
        <div className={styles.panelTitle}>UltraFusion</div>
        <div className={`${styles.panelBadge} ${styles.active}`}>
          {data.unified_risk_score}
        </div>
      </div>
      <div className={styles.panelContent}>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Behavioral</div>
          <div className={`${styles.metricValue} ${styles.cyan}`}>
            {data.meta_signals.behavioral_anomaly?.toFixed(0) || 0}
          </div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Network Threat</div>
          <div className={`${styles.metricValue} ${styles.high}`}>
            {data.meta_signals.network_threat?.toFixed(0) || 0}
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
