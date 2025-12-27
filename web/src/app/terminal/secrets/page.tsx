'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
;

/**
 * GhostQuant™ — Secure Key Management & Secrets Governance
 * Module: page.tsx
 * Purpose: Read-only admin panel for secrets monitoring
 * 
 * SECURITY NOTICE:
 * - Read-only view (NO editing)
 * - No raw secret values are ever displayed
 * - Only metadata and audit logs are shown
 * - Comprehensive monitoring and governance display
 */

import React, { useEffect, useState } from 'react';
import {
  getSecrets,
  getGovernance,
  getViolations,
  getLogs,
  health,
  getRotationReport,
  getStaleKeys,
  type SecretMetadata,
  type PolicyViolation,
  type AccessLog,
  type HealthStatus,
} from './secretsClient';

export default function SecretsManagementPage() {
  const [showGuide, setShowGuide] = useState(false)
  const [secrets, setSecrets] = useState<SecretMetadata[]>([]);
  const [violations, setViolations] = useState<PolicyViolation[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [governanceReport, setGovernanceReport] = useState<any>(null);
  const [rotationReport, setRotationReport] = useState<any>(null);
  const [staleKeys, setStaleKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'secrets' | 'governance' | 'violations' | 'logs' | 'rotation'>('overview');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        secretsData,
        violationsData,
        logsData,
        healthData,
        governanceData,
        rotationData,
        staleData,
      ] = await Promise.all([
        getSecrets(),
        getViolations(),
        getLogs(50),
        health(),
        getGovernance(),
        getRotationReport(),
        getStaleKeys(),
      ]);

      setSecrets(secretsData);
      setViolations(violationsData);
      setLogs(logsData);
      setHealthStatus(healthData);
      setGovernanceReport(governanceData);
      setRotationReport(rotationData);
      setStaleKeys(staleData);
    } catch (error) {
      console.error('Error loading secrets data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'text-green-400';
      case 'WARNING':
        return 'text-yellow-400';
      case 'ERROR':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-900/20';
      case 'HIGH':
        return 'text-orange-400 bg-orange-900/20';
      case 'MODERATE':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'LOW':
        return 'text-blue-400 bg-blue-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'CRITICAL':
        return 'text-red-400';
      case 'HIGH':
        return 'text-orange-400';
      case 'MODERATE':
        return 'text-yellow-400';
      case 'LOW':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatDaysAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} days ago`;
    } catch {
      return 'Unknown';
    }
  };

  if (loading && !healthStatus) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-cyan-400 text-xl">Loading Secrets Management...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <TerminalBackButton className="mb-4" />
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">
          🔐 Secrets Management & Governance
        </h1>
        <p className="text-gray-400">
          Read-only monitoring panel for GhostQuant™ key management system
        </p>
      </div>

      {/* Health Status Banner */}
      {healthStatus && (
        <div className="mb-6 p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-cyan-400">System Health</h2>
            <div className={`text-2xl font-bold ${getHealthColor(healthStatus.status)}`}>
              {healthStatus.status}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-black rounded">
              <div className="text-gray-400 text-sm">Total Secrets</div>
              <div className="text-2xl font-bold text-white">{healthStatus.secrets.total}</div>
            </div>
            <div className="p-4 bg-black rounded">
              <div className="text-gray-400 text-sm">Active Secrets</div>
              <div className="text-2xl font-bold text-green-400">{healthStatus.secrets.active}</div>
            </div>
            <div className="p-4 bg-black rounded">
              <div className="text-gray-400 text-sm">Stale Secrets</div>
              <div className="text-2xl font-bold text-yellow-400">{healthStatus.secrets.stale}</div>
            </div>
            <div className="p-4 bg-black rounded">
              <div className="text-gray-400 text-sm">Critical Secrets</div>
              <div className="text-2xl font-bold text-red-400">{healthStatus.secrets.critical}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-black rounded">
              <div className="text-gray-400 text-sm">Total Rotations</div>
              <div className="text-xl font-bold text-white">{healthStatus.rotation.total_rotations}</div>
            </div>
            <div className="p-4 bg-black rounded">
              <div className="text-gray-400 text-sm">Policy Violations</div>
              <div className="text-xl font-bold text-orange-400">{healthStatus.governance.total_violations}</div>
            </div>
            <div className="p-4 bg-black rounded">
              <div className="text-gray-400 text-sm">Compliance Score</div>
              <div className="text-xl font-bold text-cyan-400">{healthStatus.governance.compliance_percentage}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex space-x-2 border-b border-gray-700">
        {['overview', 'secrets', 'governance', 'violations', 'logs', 'rotation'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === tab
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && governanceReport && (
          <div className="space-y-6">
            <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Governance Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Total Policies</div>
                  <div className="text-2xl font-bold">{governanceReport.summary?.total_policies || 0}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Active Policies</div>
                  <div className="text-2xl font-bold text-green-400">{governanceReport.summary?.active_policies || 0}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Secrets with Policies</div>
                  <div className="text-2xl font-bold text-cyan-400">{governanceReport.summary?.secrets_with_policies || 0}</div>
                </div>
              </div>
            </div>

            {staleKeys.length > 0 && (
              <div className="p-6 bg-gray-900 rounded-lg border border-yellow-500/30">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">⚠️ Stale Keys Requiring Rotation</h3>
                <div className="space-y-2">
                  {staleKeys.slice(0, 5).map((key, idx) => (
                    <div key={idx} className="p-3 bg-black rounded flex justify-between items-center">
                      <div>
                        <div className="font-mono text-white">{key.name}</div>
                        <div className="text-sm text-gray-400">
                          Overdue by {key.days_overdue} days • {key.classification}
                        </div>
                      </div>
                      <div className="text-red-400 font-bold">{key.days_since_rotation} days old</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Secrets Tab */}
        {activeTab === 'secrets' && (
          <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">All Secrets ({secrets.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 text-gray-400">Name</th>
                    <th className="text-left p-3 text-gray-400">Classification</th>
                    <th className="text-left p-3 text-gray-400">Environment</th>
                    <th className="text-left p-3 text-gray-400">Last Rotated</th>
                    <th className="text-left p-3 text-gray-400">Rotations</th>
                    <th className="text-left p-3 text-gray-400">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {secrets.map((secret, idx) => (
                    <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-3 font-mono text-sm">{secret.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getClassificationColor(secret.classification)}`}>
                          {secret.classification}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{secret.environment}</td>
                      <td className="p-3 text-sm text-gray-400">{formatDaysAgo(secret.last_rotated)}</td>
                      <td className="p-3 text-sm">{secret.rotations_count}</td>
                      <td className="p-3 text-sm text-gray-400">{secret.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Governance Tab */}
        {activeTab === 'governance' && governanceReport && (
          <div className="space-y-6">
            <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Compliance by Classification</h3>
              <div className="space-y-3">
                {Object.entries(governanceReport.compliance_by_classification || {}).map(([classification, data]: [string, any]) => (
                  <div key={classification} className="p-4 bg-black rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-bold ${getClassificationColor(classification)}`}>{classification}</span>
                      <span className="text-gray-400">
                        {data.compliant} / {data.total} compliant
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-cyan-400 h-2 rounded-full"
                        style={{ width: `${data.total > 0 ? (data.compliant / data.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Active Policies</h3>
              <div className="space-y-3">
                {(governanceReport.policies || []).map((policy: any, idx: number) => (
                  <div key={idx} className="p-4 bg-black rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-white">{policy.policy_id}</div>
                        <div className="text-sm text-gray-400 font-mono">{policy.secret_pattern}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getClassificationColor(policy.classification)}`}>
                        {policy.classification}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Rotation: {policy.rotation_frequency_days} days • 
                      Frameworks: {policy.compliance_frameworks.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Violations Tab */}
        {activeTab === 'violations' && (
          <div className="p-6 bg-gray-900 rounded-lg border border-orange-500/30">
            <h3 className="text-xl font-bold text-orange-400 mb-4">Policy Violations ({violations.length})</h3>
            <div className="space-y-3">
              {violations.map((violation, idx) => (
                <div key={idx} className={`p-4 rounded ${getSeverityColor(violation.severity)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold">{violation.violation_id}</div>
                      <div className="text-sm font-mono">{violation.secret_name}</div>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-bold bg-black">
                      {violation.severity}
                    </span>
                  </div>
                  <div className="text-sm mb-2">{violation.description}</div>
                  <div className="text-xs text-gray-400">
                    Type: {violation.violation_type} • Policy: {violation.policy_id} • 
                    Detected: {formatDate(violation.detected_at)}
                  </div>
                </div>
              ))}
              {violations.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  ✅ No policy violations detected
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Access Logs (Last 50)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2 text-gray-400">Timestamp</th>
                    <th className="text-left p-2 text-gray-400">Secret</th>
                    <th className="text-left p-2 text-gray-400">Actor</th>
                    <th className="text-left p-2 text-gray-400">Action</th>
                    <th className="text-left p-2 text-gray-400">IP</th>
                    <th className="text-left p-2 text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-2 text-gray-400">{formatDate(log.timestamp)}</td>
                      <td className="p-2 font-mono">{log.name}</td>
                      <td className="p-2">{log.actor}</td>
                      <td className="p-2">
                        <span className="px-2 py-1 rounded text-xs bg-cyan-900/30 text-cyan-400">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-2 text-gray-400">{log.ip}</td>
                      <td className="p-2">
                        {log.success ? (
                          <span className="text-green-400">✓</span>
                        ) : (
                          <span className="text-red-400">✗</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rotation Tab */}
        {activeTab === 'rotation' && rotationReport && (
          <div className="space-y-6">
            <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Rotation Summary</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-black rounded">
                  <div className="text-gray-400 text-sm">Total Secrets</div>
                  <div className="text-2xl font-bold">{rotationReport.summary?.total_secrets || 0}</div>
                </div>
                <div className="p-4 bg-black rounded">
                  <div className="text-gray-400 text-sm">Stale Secrets</div>
                  <div className="text-2xl font-bold text-yellow-400">{rotationReport.summary?.stale_secrets || 0}</div>
                </div>
                <div className="p-4 bg-black rounded">
                  <div className="text-gray-400 text-sm">Critical Stale</div>
                  <div className="text-2xl font-bold text-red-400">{rotationReport.summary?.critical_stale || 0}</div>
                </div>
                <div className="p-4 bg-black rounded">
                  <div className="text-gray-400 text-sm">High Stale</div>
                  <div className="text-2xl font-bold text-orange-400">{rotationReport.summary?.high_stale || 0}</div>
                </div>
              </div>
            </div>

            {rotationReport.recommendations && rotationReport.recommendations.length > 0 && (
              <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {rotationReport.recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className={`p-4 rounded ${getSeverityColor(rec.priority)}`}>
                      <div className="font-bold mb-1">{rec.message}</div>
                      <div className="text-sm">Action: {rec.action}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>GhostQuant™ Secrets Management • Read-Only Monitoring Panel</p>
        <p className="mt-1">
          Compliant with NIST 800-53 SC-12/SC-13/AC-3/AU-2 • SOC 2 CC6/CC7 • FedRAMP
        </p>
      </div>
    
      {/* Module Guide Panel */}
      <ModuleGuide
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        content={getModuleGuideContent('Secrets')}
      />
    </div>
  );
}
