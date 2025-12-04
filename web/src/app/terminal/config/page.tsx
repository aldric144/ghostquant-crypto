'use client';

/**
 * GhostQuant™ — System-Wide Configuration Security & Environment Isolation
 * Module: page.tsx
 * Purpose: Read-only configuration inspector
 * 
 * SECURITY NOTICE:
 * - Read-only view (NO editing)
 * - No raw configuration values are ever displayed
 * - Only metadata and validation status
 * - Comprehensive monitoring and governance display
 */

import React, { useEffect, useState } from 'react';
import {
  getConfig,
  getEnvironment,
  getItems,
  validate,
  isolation,
  governance,
  health,
  getMisconfigurations,
  getGovernanceViolations,
  getIsolationViolations,
  type ConfigItem,
  type PolicyViolation,
  type IsolationViolation,
} from './configClient';

export default function ConfigurationInspectorPage() {
  const [configSummary, setConfigSummary] = useState<any>(null);
  const [environment, setEnvironment] = useState<any>(null);
  const [items, setItems] = useState<ConfigItem[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isolationReport, setIsolationReport] = useState<any>(null);
  const [governanceReport, setGovernanceReport] = useState<any>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [misconfigurations, setMisconfigurations] = useState<ConfigItem[]>([]);
  const [governanceViolations, setGovernanceViolations] = useState<PolicyViolation[]>([]);
  const [isolationViolations, setIsolationViolations] = useState<IsolationViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'validation' | 'isolation' | 'governance' | 'health'>('overview');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        configData,
        envData,
        itemsData,
        validationData,
        isolationData,
        governanceData,
        healthData,
        misconfigData,
        govViolationsData,
        isoViolationsData,
      ] = await Promise.all([
        getConfig(),
        getEnvironment(),
        getItems(),
        validate(),
        isolation(),
        governance(),
        health(),
        getMisconfigurations(),
        getGovernanceViolations(),
        getIsolationViolations(50),
      ]);

      setConfigSummary(configData);
      setEnvironment(envData);
      setItems(itemsData);
      setValidationResult(validationData);
      setIsolationReport(isolationData);
      setGovernanceReport(governanceData);
      setHealthStatus(healthData);
      setMisconfigurations(misconfigData);
      setGovernanceViolations(govViolationsData);
      setIsolationViolations(isoViolationsData);
    } catch (error) {
      console.error('Error loading configuration data:', error);
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
      case 'ERROR':
        return 'text-orange-400 bg-orange-900/20';
      case 'WARNING':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'INFO':
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

  if (loading && !healthStatus) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-cyan-400 text-xl">Loading Configuration Inspector...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">
          ⚙️ Configuration Security Inspector
        </h1>
        <p className="text-gray-400">
          Read-only monitoring panel for GhostQuant™ configuration management system
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
              <div className="text-gray-400 text-sm">Environment</div>
              <div className="text-xl font-bold text-cyan-400">{healthStatus.environment?.name || 'Unknown'}</div>
            </div>
            <div className="p-4 bg-black rounded">
              <div className="text-gray-400 text-sm">Total Configs</div>
              <div className="text-xl font-bold text-white">{healthStatus.configuration?.total_configs || 0}</div>
            </div>
            <div className="p-4 bg-black rounded">
              <div className="text-gray-400 text-sm">Valid Configs</div>
              <div className="text-xl font-bold text-green-400">{healthStatus.configuration?.valid_configs || 0}</div>
            </div>
            <div className="p-4 bg-black rounded">
              <div className="text-gray-400 text-sm">Misconfigurations</div>
              <div className="text-xl font-bold text-red-400">{healthStatus.configuration?.misconfigurations || 0}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-black rounded">
              <div className="text-gray-400 text-sm">Compliance Score</div>
              <div className="text-xl font-bold text-cyan-400">{healthStatus.governance?.compliance_score || 0}%</div>
            </div>
            <div className="p-4 bg-black rounded">
              <div className="text-gray-400 text-sm">Governance Violations</div>
              <div className="text-xl font-bold text-orange-400">{healthStatus.governance?.total_violations || 0}</div>
            </div>
            <div className="p-4 bg-black rounded">
              <div className="text-gray-400 text-sm">Isolation Violations</div>
              <div className="text-xl font-bold text-yellow-400">{healthStatus.isolation?.total_violations || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex space-x-2 border-b border-gray-700">
        {['overview', 'items', 'validation', 'isolation', 'governance', 'health'].map((tab) => (
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
        {activeTab === 'overview' && environment && (
          <div className="space-y-6">
            <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Environment Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Current Environment</div>
                  <div className="text-2xl font-bold text-cyan-400">{environment.environment || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Health Status</div>
                  <div className={`text-2xl font-bold ${getHealthColor(environment.health?.status || 'UNKNOWN')}`}>
                    {environment.health?.status || 'UNKNOWN'}
                  </div>
                </div>
              </div>
            </div>

            {misconfigurations.length > 0 && (
              <div className="p-6 bg-gray-900 rounded-lg border border-yellow-500/30">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">⚠️ Misconfigurations ({misconfigurations.length})</h3>
                <div className="space-y-2">
                  {misconfigurations.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="p-3 bg-black rounded flex justify-between items-center">
                      <div>
                        <div className="font-mono text-white">{item.key}</div>
                        <div className="text-sm text-gray-400">
                          {item.validation_errors.join(', ')}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getClassificationColor(item.classification)}`}>
                        {item.classification}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {governanceViolations.length > 0 && (
              <div className="p-6 bg-gray-900 rounded-lg border border-orange-500/30">
                <h3 className="text-xl font-bold text-orange-400 mb-4">🚨 Governance Violations ({governanceViolations.length})</h3>
                <div className="space-y-2">
                  {governanceViolations.slice(0, 5).map((violation, idx) => (
                    <div key={idx} className={`p-3 rounded ${getSeverityColor(violation.severity)}`}>
                      <div className="font-bold">{violation.config_key}</div>
                      <div className="text-sm">{violation.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Configuration Items ({items.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 text-gray-400">Key</th>
                    <th className="text-left p-3 text-gray-400">Type</th>
                    <th className="text-left p-3 text-gray-400">Classification</th>
                    <th className="text-left p-3 text-gray-400">Environment</th>
                    <th className="text-left p-3 text-gray-400">Status</th>
                    <th className="text-left p-3 text-gray-400">Last Loaded</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-3 font-mono text-sm">{item.key}</td>
                      <td className="p-3 text-sm">{item.value_type}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getClassificationColor(item.classification)}`}>
                          {item.classification}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{item.environment}</td>
                      <td className="p-3">
                        {item.is_valid ? (
                          <span className="text-green-400">✓ Valid</span>
                        ) : (
                          <span className="text-red-400">✗ Invalid</span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-400">{formatDate(item.last_loaded)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Validation Tab */}
        {activeTab === 'validation' && validationResult && (
          <div className="space-y-6">
            <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Validation Summary</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-black rounded">
                  <div className="text-gray-400 text-sm">Total Items</div>
                  <div className="text-2xl font-bold">{validationResult.total_items || 0}</div>
                </div>
                <div className="p-4 bg-black rounded">
                  <div className="text-gray-400 text-sm">Set Items</div>
                  <div className="text-2xl font-bold text-green-400">{validationResult.set_items || 0}</div>
                </div>
                <div className="p-4 bg-black rounded">
                  <div className="text-gray-400 text-sm">Missing Required</div>
                  <div className="text-2xl font-bold text-red-400">{validationResult.missing_required || 0}</div>
                </div>
                <div className="p-4 bg-black rounded">
                  <div className="text-gray-400 text-sm">Valid</div>
                  <div className="text-2xl font-bold">
                    {validationResult.valid ? (
                      <span className="text-green-400">YES</span>
                    ) : (
                      <span className="text-red-400">NO</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {validationResult.issues && validationResult.issues.length > 0 && (
              <div className="p-6 bg-gray-900 rounded-lg border border-orange-500/30">
                <h3 className="text-xl font-bold text-orange-400 mb-4">Validation Issues ({validationResult.issues.length})</h3>
                <div className="space-y-3">
                  {validationResult.issues.map((issue: any, idx: number) => (
                    <div key={idx} className={`p-4 rounded ${getSeverityColor(issue.severity)}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold">{issue.key}</div>
                          <div className="text-sm">{issue.message}</div>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-bold bg-black">
                          {issue.severity}
                        </span>
                      </div>
                      {issue.resolution && (
                        <div className="text-xs text-gray-400 mt-2">
                          Resolution: {issue.resolution}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Isolation Tab */}
        {activeTab === 'isolation' && isolationReport && (
          <div className="space-y-6">
            <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Environment Isolation Status</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-black rounded">
                  <div className="text-gray-400 text-sm">Current Environment</div>
                  <div className="text-2xl font-bold text-cyan-400">{isolationReport.current_environment || 'Unknown'}</div>
                </div>
                <div className="p-4 bg-black rounded">
                  <div className="text-gray-400 text-sm">Isolation Status</div>
                  <div className="text-2xl font-bold text-green-400">{isolationReport.isolation_status || 'UNKNOWN'}</div>
                </div>
                <div className="p-4 bg-black rounded">
                  <div className="text-gray-400 text-sm">Total Violations</div>
                  <div className="text-2xl font-bold text-yellow-400">{isolationReport.total_violations || 0}</div>
                </div>
              </div>
            </div>

            {isolationViolations.length > 0 && (
              <div className="p-6 bg-gray-900 rounded-lg border border-yellow-500/30">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">Recent Isolation Violations ({isolationViolations.length})</h3>
                <div className="space-y-3">
                  {isolationViolations.map((violation, idx) => (
                    <div key={idx} className="p-4 bg-black rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-orange-400">{violation.violation_type}</div>
                          <div className="text-sm text-gray-400">
                            {violation.source_environment} → {violation.target_environment} • {violation.action}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">{formatDate(violation.timestamp)}</div>
                      </div>
                      <div className="text-sm">{violation.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Governance Tab */}
        {activeTab === 'governance' && governanceReport && (
          <div className="space-y-6">
            <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Governance Summary</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-black rounded">
                  <div className="text-gray-400 text-sm">Total Configs</div>
                  <div className="text-2xl font-bold">{governanceReport.summary?.total_configs || 0}</div>
                </div>
                <div className="p-4 bg-black rounded">
                  <div className="text-gray-400 text-sm">Total Policies</div>
                  <div className="text-2xl font-bold text-cyan-400">{governanceReport.summary?.total_policies || 0}</div>
                </div>
                <div className="p-4 bg-black rounded">
                  <div className="text-gray-400 text-sm">Violations</div>
                  <div className="text-2xl font-bold text-orange-400">{governanceReport.summary?.total_violations || 0}</div>
                </div>
                <div className="p-4 bg-black rounded">
                  <div className="text-gray-400 text-sm">Compliance</div>
                  <div className="text-2xl font-bold text-green-400">{governanceReport.summary?.compliance_percentage || 0}%</div>
                </div>
              </div>
            </div>

            {governanceReport.policies && governanceReport.policies.length > 0 && (
              <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">Active Policies ({governanceReport.policies.length})</h3>
                <div className="space-y-3">
                  {governanceReport.policies.slice(0, 10).map((policy: any, idx: number) => (
                    <div key={idx} className="p-4 bg-black rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-white">{policy.key}</div>
                          <div className="text-sm text-gray-400">{policy.description}</div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getClassificationColor(policy.classification)}`}>
                          {policy.classification}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Type: {policy.value_type} • Frameworks: {policy.compliance_frameworks.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && healthStatus && (
          <div className="space-y-6">
            <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Overall Health Status</h3>
              <div className={`text-4xl font-bold text-center py-8 ${getHealthColor(healthStatus.status)}`}>
                {healthStatus.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
                <h4 className="text-lg font-bold text-cyan-400 mb-4">Configuration Health</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Configs:</span>
                    <span className="font-bold">{healthStatus.configuration?.total_configs || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Valid Configs:</span>
                    <span className="font-bold text-green-400">{healthStatus.configuration?.valid_configs || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Missing Required:</span>
                    <span className="font-bold text-red-400">{healthStatus.configuration?.missing_required || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Misconfigurations:</span>
                    <span className="font-bold text-yellow-400">{healthStatus.configuration?.misconfigurations || 0}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
                <h4 className="text-lg font-bold text-cyan-400 mb-4">Governance Health</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Compliance Score:</span>
                    <span className="font-bold text-cyan-400">{healthStatus.governance?.compliance_score || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="font-bold">{healthStatus.governance?.status || 'UNKNOWN'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Violations:</span>
                    <span className="font-bold text-orange-400">{healthStatus.governance?.total_violations || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Critical Violations:</span>
                    <span className="font-bold text-red-400">{healthStatus.governance?.critical_violations || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>GhostQuant™ Configuration Security Inspector • Read-Only Monitoring Panel</p>
        <p className="mt-1">
          Compliant with NIST 800-53 CM-2/CM-6/CM-7/AC-3 • SOC 2 CC6/CC7 • FedRAMP
        </p>
      </div>
    </div>
  );
}
