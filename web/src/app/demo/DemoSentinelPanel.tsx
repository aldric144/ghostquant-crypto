'use client';

import React, { useState, useEffect } from 'react';
import { demoClient, DemoSentinel } from '@/lib/demoClient';
import styles from '@/styles/demo/demo-panels.scss';

export default function DemoSentinelPanel() {
  const [data, setData] = useState<DemoSentinel | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await demoClient.getSentinel();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch sentinel:', error);
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
        <div className={styles.panelTitle}>Sentinel Console</div>
        <div className={`${styles.panelBadge} ${styles.active}`}>
          {data.active_alerts}
        </div>
      </div>
      <div className={styles.panelContent}>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Critical</div>
          <div className={`${styles.metricValue} ${styles.critical}`}>
            {data.critical_alerts}
          </div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>High</div>
          <div className={`${styles.metricValue} ${styles.high}`}>
            {data.high_alerts}
          </div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>System Health</div>
          <div className={`${styles.metricValue} ${styles.low}`}>
            {(data.system_health * 100).toFixed(1)}%
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
