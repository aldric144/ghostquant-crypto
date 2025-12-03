'use client';

import React, { useState, useEffect } from 'react';
import { demoClient, DemoHydra } from '@/lib/demoClient';
import styles from '@/styles/demo/demo-panels.scss';

export default function DemoHydraPanel() {
  const [data, setData] = useState<DemoHydra | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await demoClient.getHydra();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch hydra:', error);
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
    <div className={`${styles.demoPanel} ${styles[data.severity]}`}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>Operation Hydra</div>
        <div className={`${styles.panelBadge} ${styles[data.severity]}`}>
          {data.severity}
        </div>
      </div>
      <div className={styles.panelContent}>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Attack Type</div>
          <div className={styles.metricValue}>{data.attack_type}</div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Relay Hops</div>
          <div className={`${styles.metricValue} ${styles.critical}`}>
            {data.relay_chain.length}
          </div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Coordination</div>
          <div className={styles.metricValue}>
            {(data.coordination_score * 100).toFixed(0)}%
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
