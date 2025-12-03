'use client';

import React, { useState, useEffect } from 'react';
import { demoClient, DemoEntity } from '@/lib/demoClient';
import styles from '@/styles/demo/demo-panels.scss';

export default function DemoEntityViewer() {
  const [data, setData] = useState<DemoEntity | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await demoClient.getEntity();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch entity:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
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
        <div className={styles.panelTitle}>Entity Explorer</div>
        <div className={`${styles.panelBadge} ${styles.active}`}>
          {data.entity_type}
        </div>
      </div>
      <div className={styles.panelContent}>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Risk Score</div>
          <div className={`${styles.metricValue} ${styles.critical}`}>
            {data.risk_score}
          </div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Confidence</div>
          <div className={`${styles.metricValue} ${styles.cyan}`}>
            {(data.confidence * 100).toFixed(0)}%
          </div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Connections</div>
          <div className={styles.metricValue}>
            {data.connections}
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
