'use client';

import React, { useState, useEffect } from 'react';
import { demoClient } from '@/lib/demoClient';
import styles from '@/styles/demo/demo-panels.scss';

export default function DemoChainViewer() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await demoClient.getFeed(1);
      if (result && result.length > 0) {
        setData({
          chain: result[0].chain,
          threat_level: result[0].risk_score,
          active_threats: Math.floor(Math.random() * 50) + 10,
        });
      }
    } catch (error) {
      console.error('Failed to fetch chain:', error);
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
        <div className={styles.panelTitle}>Chain Monitor</div>
        <div className={`${styles.panelBadge} ${styles.active}`}>
          {data.chain}
        </div>
      </div>
      <div className={styles.panelContent}>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Threat Level</div>
          <div className={`${styles.metricValue} ${styles.high}`}>
            {data.threat_level}
          </div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Active Threats</div>
          <div className={`${styles.metricValue} ${styles.critical}`}>
            {data.active_threats}
          </div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Status</div>
          <div className={`${styles.metricValue} ${styles.cyan}`}>
            Monitoring
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
