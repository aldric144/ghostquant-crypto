'use client';

import React, { useState, useEffect } from 'react';
import { demoClient, DemoPrediction } from '@/lib/demoClient';
import styles from '@/styles/demo/demo-panels.scss';

export default function DemoPredictionPanel() {
  const [data, setData] = useState<DemoPrediction | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await demoClient.getPrediction();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch prediction:', error);
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
    <div className={`${styles.demoPanel} ${styles[data.risk_level]}`}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>Prediction Engine</div>
        <div className={`${styles.panelBadge} ${styles[data.risk_level]}`}>
          {data.risk_level}
        </div>
      </div>
      <div className={styles.panelContent}>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Confidence</div>
          <div className={`${styles.metricValue} ${styles.cyan}`}>
            {(data.confidence * 100).toFixed(0)}%
          </div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Timeframe</div>
          <div className={styles.metricValue}>{data.timeframe}</div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Type</div>
          <div className={styles.metricValue}>{data.prediction_type}</div>
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
