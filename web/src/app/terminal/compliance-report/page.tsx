'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
;

/**
 * GhostQuant™ — Executive Compliance Report Generator
 * Module: page.tsx
 * Purpose: 3-panel executive compliance report console
 */

import { useState, useEffect } from 'react';
import {
  generateReport,
  getSummary,
  getMarkdown,
  getHTML,
  getHealth,
  downloadReport,
  type ExecutiveReport,
  type ExecutiveSummary,
  type HealthResponse,
} from '@/lib/executiveReportClient';

export default function ComplianceReportPage() {
  const [report, setReport] = useState<ExecutiveReport | null>(null);
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('executive_summary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadHealth();
    loadSummary();
  }, []);

  const loadHealth = async () => {
    const result = await getHealth();
    if (result.success) {
      setHealth(result);
    }
  };

  const loadSummary = async () => {
    const result = await getSummary();
    if (result.success && result.summary) {
      setSummary(result.summary);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await generateReport();

    if (result.success && result.report) {
      setReport(result.report);
      setSummary(result.report.executive_summary);
      setSuccess('Executive compliance report generated successfully');
      await loadHealth();
    } else {
      setError(result.error || 'Failed to generate report');
    }

    setLoading(false);
  };

  const handleExportMarkdown = async () => {
    setLoading(true);
    setError(null);

    const result = await getMarkdown();

    if (result.success && result.content) {
      downloadReport(
        result.content,
        `ghostquant-compliance-report-${new Date().toISOString().split('T')[0]}.md`,
        'markdown'
      );
      setSuccess('Markdown report downloaded successfully');
    } else {
      setError(result.error || 'Failed to export Markdown');
    }

    setLoading(false);
  };

  const handleExportHTML = async () => {
    setLoading(true);
    setError(null);

    const result = await getHTML();

    if (result.success && result.content) {
      downloadReport(
        result.content,
        `ghostquant-compliance-report-${new Date().toISOString().split('T')[0]}.html`,
        'html'
      );
      setSuccess('HTML report downloaded successfully');
    } else {
      setError(result.error || 'Failed to export HTML');
    }

    setLoading(false);
  };

  const handleExportJSON = async () => {
    if (!report) {
      setError('Generate report first before exporting JSON');
      return;
    }

    downloadReport(
      JSON.stringify(report, null, 2),
      `ghostquant-compliance-report-${new Date().toISOString().split('T')[0]}.json`,
      'json'
    );
    setSuccess('JSON report downloaded successfully');
  };

  const renderSectionContent = () => {
    if (!report) {
      return (
        <div className="text-center text-gray-500 py-20">
          <p>Generate a report to view detailed sections</p>
        </div>
      );
    }

    switch (selectedSection) {
      case 'executive_summary':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-cyan-400">Executive Summary</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <p>{report.executive_summary.overview}</p>
              <div>
                <h4 className="font-bold text-cyan-400 mb-2">Compliance Posture</h4>
                <p>{report.executive_summary.compliance_posture}</p>
              </div>
              <div>
                <h4 className="font-bold text-cyan-400 mb-2">Key Strengths</h4>
                <ul className="list-disc list-inside space-y-1">
                  {report.executive_summary.key_strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-cyan-400 mb-2">Identified Gaps</h4>
                <ul className="list-disc list-inside space-y-1">
                  {report.executive_summary.identified_gaps.map((gap, idx) => (
                    <li key={idx}>{gap}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case 'regulatory_alignment':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-cyan-400">Regulatory Alignment</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <p>{report.regulatory_alignment.overview}</p>
              <div>
                <h4 className="font-bold text-cyan-400 mb-2">U.S. Federal Agencies</h4>
                <div className="space-y-2">
                  {Object.entries(report.regulatory_alignment.us_federal_agencies).map(
                    ([key, agency]: [string, any]) => (
                      <div key={key} className="bg-gray-800 p-3 rounded">
                        <div className="font-bold text-cyan-400">{agency.agency}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Framework: {agency.framework}
                        </div>
                        <div className="text-xs text-gray-400">Status: {agency.status}</div>
                        <div className="text-xs text-gray-400">
                          Score: {agency.compliance_score}/100
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'security_posture':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-cyan-400">Security Posture</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-lg font-bold text-cyan-400">
                  Overall Score: {report.security_posture.summary.overall_score}/100
                </div>
                <div className="text-gray-400">
                  Maturity: {report.security_posture.summary.maturity_level}
                </div>
              </div>
              <div className="space-y-2">
                {Object.entries(report.security_posture.domains).map(
                  ([key, domain]: [string, any]) => (
                    <div key={key} className="bg-gray-800 p-3 rounded">
                      <div className="font-bold text-cyan-400">{domain.domain}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Score: {domain.score}/100 | Maturity: {domain.maturity_level}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        );

      case 'risk_assessment':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-cyan-400">Risk Assessment</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-lg font-bold text-cyan-400">
                  Overall Risk: {report.risk_assessment.risk_summary.overall_risk_level}
                </div>
                <div className="text-gray-400">
                  Average Score: {report.risk_assessment.risk_summary.average_risk_score}/10
                </div>
                <div className="text-gray-400">
                  Trend: {report.risk_assessment.risk_summary.risk_trend}
                </div>
              </div>
              <div className="space-y-2">
                {Object.entries(report.risk_assessment.risk_categories).map(
                  ([key, risk]: [string, any]) => (
                    <div key={key} className="bg-gray-800 p-3 rounded">
                      <div className="font-bold text-cyan-400">{risk.category}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Level: {risk.risk_level} | Score: {risk.risk_score}/10
                      </div>
                      <div className="text-xs text-gray-400">
                        Residual: {risk.residual_risk}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        );

      case 'governance_score':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-cyan-400">Governance Maturity</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-lg font-bold text-cyan-400">
                  Score: {report.governance_score.overall_score}/100
                </div>
                <div className="text-gray-400">
                  Maturity: {report.governance_score.maturity_level}
                </div>
              </div>
              <p>{report.governance_score.narrative}</p>
              <div className="space-y-2">
                {Object.entries(report.governance_score.governance_components).map(
                  ([key, component]: [string, any]) => (
                    <div key={key} className="bg-gray-800 p-3 rounded">
                      <div className="font-bold text-cyan-400">{component.component}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Score: {component.score}/100
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        );

      case 'compliance_matrix':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-cyan-400">Compliance Matrix</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-lg font-bold text-cyan-400">
                  {report.compliance_matrix.summary.total_frameworks} Frameworks
                </div>
                <div className="text-gray-400">
                  {report.compliance_matrix.summary.total_controls} Controls
                </div>
                <div className="text-gray-400">
                  Implementation: {report.compliance_matrix.summary.implementation_rate}
                </div>
              </div>
              <div className="space-y-2">
                {Object.entries(report.compliance_matrix.frameworks).map(
                  ([key, framework]: [string, any]) => (
                    <div key={key} className="bg-gray-800 p-3 rounded">
                      <div className="font-bold text-cyan-400">{framework.framework}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Status: {framework.status}
                      </div>
                      <div className="text-xs text-gray-400">
                        Controls: {framework.controls_implemented}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        );

      case 'remediation_roadmap':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-cyan-400">Remediation Roadmap</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-lg font-bold text-cyan-400">
                  {report.remediation_roadmap.summary.total_initiatives} Initiatives
                </div>
                <div className="text-gray-400">
                  Total Effort: {report.remediation_roadmap.summary.total_effort_hours} hours
                </div>
              </div>
              <div>
                <h4 className="font-bold text-cyan-400 mb-2">
                  {report.remediation_roadmap.immediate.phase}
                </h4>
                <div className="space-y-2">
                  {report.remediation_roadmap.immediate.initiatives.map(
                    (initiative: any, idx: number) => (
                      <div key={idx} className="bg-gray-800 p-3 rounded">
                        <div className="font-bold text-cyan-400">{initiative.initiative}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {initiative.description}
                        </div>
                        <div className="text-xs text-gray-400">
                          Impact: {initiative.impact} | Status: {initiative.status}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-gray-500">Select a section to view details</div>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-cyan-400 p-6">
      {/* Header */}
      <div className="mb-6">
        <TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold mb-2">
          <span className="text-cyan-400">EXECUTIVE COMPLIANCE</span>{' '}
          <span className="text-gray-500">REPORT</span>
        </h1>
        <p className="text-gray-400">
          Comprehensive 30-60 page executive compliance assessment
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-900/20 border border-green-500 rounded">
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {/* 3-Panel Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Overview & Actions */}
        <div className="col-span-3 space-y-6">
          {/* Global Score */}
          {summary && (
            <div className="bg-gray-900 border border-cyan-900 rounded p-4">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">COMPLIANCE SCORE</h2>
              <div className="text-center">
                <div className="text-5xl font-bold text-cyan-400 mb-2">
                  {summary.compliance_score}
                </div>
                <div className="text-sm text-gray-400">out of 100</div>
                <div className="mt-4 bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full transition-all duration-500"
                    style={{ width: `${summary.compliance_score}%` }}
                  />
                </div>
                <div className="mt-4 text-sm">
                  <div className="text-cyan-400 font-bold">{summary.readiness_tier}</div>
                  <div className="text-gray-400">{summary.overall_rating}</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-gray-900 border border-cyan-900 rounded p-4">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">ACTIONS</h2>
            <div className="space-y-2">
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full px-4 py-2 bg-cyan-900 hover:bg-cyan-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-cyan-400 rounded transition-colors"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
              <button
                onClick={handleExportMarkdown}
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-cyan-400 rounded transition-colors"
              >
                Export Markdown
              </button>
              <button
                onClick={handleExportHTML}
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-cyan-400 rounded transition-colors"
              >
                Export HTML
              </button>
              <button
                onClick={handleExportJSON}
                disabled={loading || !report}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-cyan-400 rounded transition-colors"
              >
                Export JSON
              </button>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="bg-gray-900 border border-cyan-900 rounded p-4">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">SECTIONS</h2>
            <div className="space-y-1">
              {[
                { id: 'executive_summary', label: 'Executive Summary' },
                { id: 'regulatory_alignment', label: 'Regulatory Alignment' },
                { id: 'security_posture', label: 'Security Posture' },
                { id: 'risk_assessment', label: 'Risk Assessment' },
                { id: 'governance_score', label: 'Governance Score' },
                { id: 'compliance_matrix', label: 'Compliance Matrix' },
                { id: 'remediation_roadmap', label: 'Remediation Roadmap' },
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${
                    selectedSection === section.id
                      ? 'bg-cyan-900/30 border border-cyan-700 text-cyan-400'
                      : 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Panel - Report Viewer */}
        <div className="col-span-6 bg-gray-900 border border-cyan-900 rounded p-4">
          <h2 className="text-xl font-bold mb-4 text-cyan-400">REPORT VIEWER</h2>
          <div className="max-h-[800px] overflow-y-auto">{renderSectionContent()}</div>
        </div>

        {/* Right Panel - Quick Insights */}
        <div className="col-span-3 space-y-6">
          {/* System Health */}
          {health && health.success && (
            <div className="bg-gray-900 border border-cyan-900 rounded p-4">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">SYSTEM HEALTH</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`font-bold ${
                      health.status === 'healthy' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {health.status?.toUpperCase()}
                  </span>
                </div>
                {health.statistics && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Frameworks:</span>
                      <span className="text-cyan-400">
                        {health.statistics.frameworks_covered}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Agencies:</span>
                      <span className="text-cyan-400">
                        {health.statistics.regulatory_agencies}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Controls:</span>
                      <span className="text-cyan-400">
                        {health.statistics.compliance_controls}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Top Strengths */}
          {summary && (
            <div className="bg-gray-900 border border-cyan-900 rounded p-4">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">TOP STRENGTHS</h2>
              <div className="space-y-2 text-xs text-gray-300">
                {summary.key_strengths.slice(0, 3).map((strength, idx) => (
                  <div key={idx} className="bg-gray-800 p-2 rounded">
                    {strength.substring(0, 100)}...
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Actions */}
          {summary && (
            <div className="bg-gray-900 border border-cyan-900 rounded p-4">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">REQUIRED ACTIONS</h2>
              <div className="space-y-2 text-xs text-gray-300">
                {summary.identified_gaps.slice(0, 3).map((gap, idx) => (
                  <div key={idx} className="bg-gray-800 p-2 rounded border-l-2 border-yellow-500">
                    {gap.substring(0, 100)}...
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Frameworks */}
          <div className="bg-gray-900 border border-cyan-900 rounded p-4">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">FRAMEWORKS</h2>
            <div className="space-y-1 text-xs max-h-[300px] overflow-y-auto">
              {[
                'CJIS Security Policy v5.9',
                'NIST 800-53 Rev 5',
                'SOC 2 Type II',
                'FedRAMP LITE',
                'AML/KYC (BSA/FinCEN)',
                'Data Governance (GDPR/CCPA)',
                'Incident Response (NIST 800-61)',
                'Audit Logging (NIST 800-53 AU)',
                'Zero-Trust (NIST 800-207)',
                'Privacy Shield',
                'SSDLC (NIST 800-218)',
                'Key Management (NIST 800-57)',
                'Environment Isolation',
                'Configuration Management',
              ].map((framework, idx) => (
                <div key={idx} className="text-gray-400 py-1 border-b border-gray-800">
                  {framework}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
