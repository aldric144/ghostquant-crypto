'use client';

import React, { useState, useEffect } from 'react';
import styles from './AnimatedMap.module.scss';

interface MapNode {
  id: number;
  x: number;
  y: number;
  label: string;
  threat: 'low' | 'medium' | 'high';
  active: boolean;
}

interface MapConnection {
  from: number;
  to: number;
  active: boolean;
}

export default function AnimatedMap() {
  const [nodes, setNodes] = useState<MapNode[]>([
    { id: 1, x: 20, y: 30, label: 'New York', threat: 'low', active: true },
    { id: 2, x: 15, y: 50, label: 'London', threat: 'medium', active: true },
    { id: 3, x: 45, y: 35, label: 'Dubai', threat: 'high', active: true },
    { id: 4, x: 70, y: 45, label: 'Singapore', threat: 'low', active: true },
    { id: 5, x: 80, y: 25, label: 'Tokyo', threat: 'medium', active: true },
    { id: 6, x: 50, y: 65, label: 'Mumbai', threat: 'low', active: true },
    { id: 7, x: 30, y: 70, label: 'São Paulo', threat: 'high', active: true },
    { id: 8, x: 85, y: 60, label: 'Sydney', threat: 'low', active: true },
  ]);

  const [connections, setConnections] = useState<MapConnection[]>([
    { from: 1, to: 2, active: false },
    { from: 2, to: 3, active: false },
    { from: 3, to: 4, active: false },
    { from: 4, to: 5, active: false },
    { from: 3, to: 6, active: false },
    { from: 1, to: 7, active: false },
    { from: 4, to: 8, active: false },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnections((prev) =>
        prev.map((conn, idx) => ({
          ...conn,
          active: Math.random() > 0.5,
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getThreatColor = (threat: string) => {
    switch (threat) {
      case 'low':
        return '#37FFB0';
      case 'medium':
        return '#F25F4C';
      case 'high':
        return '#FF1E44';
      default:
        return '#22E0FF';
    }
  };

  return (
    <div className={styles.mapContainer}>
      {/* Grid Background */}
      <div className={styles.gridBackground}></div>

      {/* Map SVG */}
      <svg className={styles.mapSvg} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* Connections */}
        <g className={styles.connections}>
          {connections.map((conn, idx) => {
            const fromNode = nodes.find((n) => n.id === conn.from);
            const toNode = nodes.find((n) => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            return (
              <line
                key={idx}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                className={`${styles.connection} ${conn.active ? styles.active : ''}`}
                stroke="#22E0FF"
                strokeWidth="0.2"
                opacity={conn.active ? 0.8 : 0.2}
              />
            );
          })}
        </g>

        {/* Arc Connections (Animated) */}
        <g className={styles.arcs}>
          {connections.map((conn, idx) => {
            const fromNode = nodes.find((n) => n.id === conn.from);
            const toNode = nodes.find((n) => n.id === conn.to);
            if (!fromNode || !toNode || !conn.active) return null;

            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2 - 10;

            return (
              <path
                key={`arc-${idx}`}
                d={`M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY} ${toNode.x} ${toNode.y}`}
                className={styles.arc}
                fill="none"
                stroke="#22E0FF"
                strokeWidth="0.3"
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g className={styles.nodes}>
          {nodes.map((node) => (
            <g key={node.id} className={styles.nodeGroup}>
              {/* Pulse Ring */}
              <circle
                cx={node.x}
                cy={node.y}
                r="2"
                className={styles.pulseRing}
                fill="none"
                stroke={getThreatColor(node.threat)}
                strokeWidth="0.2"
              />
              
              {/* Node Circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r="1"
                className={styles.node}
                fill={getThreatColor(node.threat)}
              />
              
              {/* Glow */}
              <circle
                cx={node.x}
                cy={node.y}
                r="1.5"
                className={styles.nodeGlow}
                fill={getThreatColor(node.threat)}
                opacity="0.3"
              />
            </g>
          ))}
        </g>
      </svg>

      {/* Node Labels */}
      <div className={styles.labels}>
        {nodes.map((node) => (
          <div
            key={node.id}
            className={styles.label}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
            }}
          >
            <span className={styles.labelText}>{node.label}</span>
            <span className={`${styles.labelThreat} ${styles[node.threat]}`}>
              {node.threat.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Stats Overlay */}
      <div className={styles.statsOverlay}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>ACTIVE NODES</span>
          <span className={styles.statValue}>{nodes.filter((n) => n.active).length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>LIVE CONNECTIONS</span>
          <span className={styles.statValue}>{connections.filter((c) => c.active).length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>THREAT LEVEL</span>
          <span className={styles.statValue}>MEDIUM</span>
        </div>
      </div>
    </div>
  );
}
