'use client';

import React, { useState, useEffect } from 'react';
import { demoClient, DemoEvent } from '@/lib/demoClient';
import styles from '@/styles/demo/demo-panels.scss';

export default function DemoEventGenerator() {
  const [data, setData] = useState<DemoEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await demoClient.getEvent();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
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
    <div className={`${styles.demoPanel} ${styles[data.severity]}`}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>Event Stream</div>
        <div className={`${styles.panelBadge} ${styles[data.severity]}`}>
          {data.severity}
        </div>
      </div>
      <div className={styles.panelContent}>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Type</div>
          <div className={styles.metricValue}>{data.event_type}</div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Chain</div>
          <div className={`${styles.metricValue} ${styles.cyan}`}>
            {data.chain}
          </div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Risk Score</div>
          <div className={`${styles.metricValue} ${styles.critical}`}>
            {data.risk_score}
          </div>
        </div>
        <div className={styles.panelActions}>
          <button className={styles.panelButton} onClick={fetchData}>
            Generate New
          </button>
        </div>
      </div>
    </div>
  );
}
