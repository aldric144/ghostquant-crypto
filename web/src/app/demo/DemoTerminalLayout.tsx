'use client';

import React, { useState, useEffect } from 'react';
import { demoClient, DemoEvent } from '@/lib/demoClient';
import DemoPredictionPanel from './DemoPredictionPanel';
import DemoFusionPanel from './DemoFusionPanel';
import DemoHydraPanel from './DemoHydraPanel';
import DemoConstellationPanel from './DemoConstellationPanel';
import DemoSentinelPanel from './DemoSentinelPanel';
import DemoCortexPanel from './DemoCortexPanel';
import DemoActorPanel from './DemoActorPanel';
import DemoDNAPanel from './DemoDNAPanel';
import DemoEventGenerator from './DemoEventGenerator';
import DemoTokenViewer from './DemoTokenViewer';
import DemoEntityViewer from './DemoEntityViewer';
import DemoChainViewer from './DemoChainViewer';
import '@/styles/demo/demo.scss';
import '@/styles/demo/demo-panels.scss';
import '@/styles/demo/demo-grid.scss';

interface DemoTerminalLayoutProps {
  onRequestAccess: () => void;
}

export default function DemoTerminalLayout({ onRequestAccess }: DemoTerminalLayoutProps) {
  const [feed, setFeed] = useState<DemoEvent[]>([]);
  const [riskLevel, setRiskLevel] = useState(75);

  const fetchFeed = async () => {
    try {
      const result = await demoClient.getFeed(10);
      setFeed(result);
      const avgRisk = result.reduce((sum, event) => sum + event.risk_score, 0) / result.length;
      setRiskLevel(Math.round(avgRisk));
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    }
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getSeverityClass = (severity: string) => {
    return severity.toLowerCase();
  };

  return (
    <div className="demoGrid">
      {/* Left Sidebar */}
      <div className="demoLeftSidebar">
        {/* Global Risk Gauge */}
        <div className="demoRiskGauge">
          <div className="riskGaugeTitle">Global Risk Level</div>
          <div className="riskGaugeCircle">
            <svg className="riskGaugeSvg" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(51, 65, 85, 0.3)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#22E0FF"
                strokeWidth="8"
                strokeDasharray={`${(riskLevel / 100) * 251.2} 251.2`}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 10px #22E0FF)' }}
              />
            </svg>
            <div className="riskGaugeValue">
              <div className="riskGaugeNumber">{riskLevel}</div>
              <div className="riskGaugeLabel">Risk Score</div>
            </div>
          </div>
          <div className="riskGaugeStats">
            <div className="riskStat">
              <span className="riskStatLabel">Active Threats</span>
              <span className="riskStatValue">{Math.floor(Math.random() * 50) + 20}</span>
            </div>
            <div className="riskStat">
              <span className="riskStatLabel">Monitored Entities</span>
              <span className="riskStatValue">{(Math.floor(Math.random() * 5000) + 2000).toLocaleString()}</span>
            </div>
            <div className="riskStat">
              <span className="riskStatLabel">Detection Rate</span>
              <span className="riskStatValue">99.{Math.floor(Math.random() * 10)}%</span>
            </div>
          </div>
        </div>

        {/* Demo Alerts */}
        <div className="demoAlerts">
          <div className="alertsTitle">⚠️ Live Alerts</div>
          <div className="alertsList">
            {feed.slice(0, 5).filter(e => e.severity === 'critical' || e.severity === 'high').map((event, idx) => (
              <div key={idx} className="alertItem">
                <span className={`alertSeverity ${event.severity}`}>{event.severity}</span>
                {event.description}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center Panel - 8 Intelligence Panels */}
      <div className="demoCenterPanel">
        <div className="demoPanelsGrid">
          <DemoPredictionPanel />
          <DemoFusionPanel />
          <DemoHydraPanel />
          <DemoConstellationPanel />
          <DemoSentinelPanel />
          <DemoCortexPanel />
          <DemoActorPanel />
          <DemoDNAPanel />
        </div>

        {/* Additional Panels */}
        <div className="demoPanelsGrid">
          <DemoEventGenerator />
          <DemoTokenViewer />
          <DemoEntityViewer />
          <DemoChainViewer />
        </div>
      </div>

      {/* Right Panel - Live Intelligence Feed */}
      <div className="demoRightPanel">
        <div className="demoFeed">
          <div className="feedTitle">
            <span>Intelligence Feed</span>
            <span className="feedLive">
              <span className="liveDot"></span>
              LIVE
            </span>
          </div>
          <div className="feedList">
            {feed.map((event, idx) => (
              <div key={idx} className={`feedCard ${getSeverityClass(event.severity)}`}>
                <div className="feedCardHeader">
                  <span className="feedCardType">{event.event_type}</span>
                  <span className="feedCardTime">{formatTime(event.timestamp)}</span>
                </div>
                <div className="feedCardContent">{event.description}</div>
                <div className="feedCardMeta">
                  <span className="feedCardMetaItem">
                    <strong>Chain:</strong> {event.chain}
                  </span>
                  <span className="feedCardMetaItem">
                    <strong>Risk:</strong> {event.risk_score}
                  </span>
                  <span className="feedCardMetaItem">
                    <strong>Token:</strong> {event.token}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
