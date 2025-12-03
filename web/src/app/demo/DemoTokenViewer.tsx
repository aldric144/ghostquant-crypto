'use client';

import React, { useState, useEffect } from 'react';
import { demoClient, DemoToken } from '@/lib/demoClient';
import styles from '@/styles/demo/demo-panels.scss';

export default function DemoTokenViewer() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await demoClient.getFeed(1);
      if (result && result.length > 0) {
        setData(result[0]);
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
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
        <div className={styles.panelTitle}>Token Monitor</div>
        <div className={`${styles.panelBadge} ${styles.active}`}>
          {data.token}
        </div>
      </div>
      <div className={styles.panelContent}>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Amount</div>
          <div className={`${styles.metricValue} ${styles.cyan}`}>
            {data.amount?.toFixed(2)}
          </div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Chain</div>
          <div className={styles.metricValue}>{data.chain}</div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Risk</div>
          <div className={`${styles.metricValue} ${styles.high}`}>
            {data.risk_score}
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
