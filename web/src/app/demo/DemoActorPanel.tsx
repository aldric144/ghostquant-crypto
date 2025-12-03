'use client';

import React, { useState, useEffect } from 'react';
import { demoClient, DemoActorProfile } from '@/lib/demoClient';
import styles from '@/styles/demo/demo-panels.scss';

export default function DemoActorPanel() {
  const [data, setData] = useState<DemoActorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await demoClient.getActor();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch actor:', error);
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
    <div className={`${styles.demoPanel} ${styles[data.risk_category]}`}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>Actor Profile</div>
        <div className={`${styles.panelBadge} ${styles[data.risk_category]}`}>
          {data.risk_category}
        </div>
      </div>
      <div className={styles.panelContent}>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Type</div>
          <div className={styles.metricValue}>{data.actor_type}</div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Threat Level</div>
          <div className={`${styles.metricValue} ${styles.critical}`}>
            {data.threat_level}
          </div>
        </div>
        <div className={styles.panelMetric}>
          <div className={styles.metricLabel}>Associations</div>
          <div className={styles.metricValue}>
            {data.known_associations.length}
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
