'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
;

/**
 * GhostQuant™ — Full Compliance Documentation Exporter System
 * Module: page.tsx
 * Purpose: Compliance Export Console
 * 
 * SECURITY NOTICE:
 * - Read-only view (NO editing)
 * - No sensitive information displayed
 * - Only metadata and documentation
 * - Comprehensive export management
 */

import React, { useEffect, useState } from 'react';
import {
  getDocumentTypes,
  generateDocument,
  listExports,
  getHealth,
  getStatistics,
  downloadExport,
  clearExports,
  formatFileSize,
  formatDate,
  type DocumentType,
  type ComplianceDocument,
  type ExportFile,
  type ExporterHealth,
  type ExportStatistics,
} from './exporterClient';

export default function ComplianceExporterPage() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [generatedDocument, setGeneratedDocument] = useState<ComplianceDocument | null>(null);
  const [exports, setExports] = useState<ExportFile[]>([]);
  const [health, setHealth] = useState<ExporterHealth | null>(null);
  const [statistics, setStatistics] = useState<ExportStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [typesData, exportsData, healthData, statsData] = await Promise.all([
        getDocumentTypes(),
        listExports(),
        getHealth(),
        getStatistics(),
      ]);

      if (typesData.success && typesData.document_types) {
        setDocumentTypes(typesData.document_types);
      }

      if (exportsData.success && exportsData.exports) {
        setExports(exportsData.exports);
      }

      if (healthData.success && healthData.health) {
        setHealth(healthData.health);
      }

      if (statsData.success && statsData.statistics) {
        setStatistics(statsData.statistics);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDocument = async () => {
    if (!selectedDocType) {
      setError('Please select a document type');
      return;
    }

    try {
      setGenerating(true);
      setError('');
      setSuccessMessage('');

      const result = await generateDocument(selectedDocType);

      if (result.success && result.document) {
        setGeneratedDocument(result.document);
        setSuccessMessage(`Document generated successfully: ${result.document.name}`);
        
        await loadData();
      } else {
        setError(result.error || 'Failed to generate document');
      }
    } catch (error) {
      console.error('Error generating document:', error);
      setError('Failed to generate document');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      await downloadExport(filename);
      setSuccessMessage(`Downloaded: ${filename}`);
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download file');
    }
  };

  const handleClearExports = async () => {
    if (!confirm('Are you sure you want to clear all exports?')) {
      return;
    }

    try {
      const result = await clearExports();
      
      if (result.success) {
        setSuccessMessage(result.message || 'Exports cleared');
        await loadData();
      } else {
        setError(result.error || 'Failed to clear exports');
      }
    } catch (error) {
      console.error('Error clearing exports:', error);
      setError('Failed to clear exports');
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

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'json':
        return 'text-blue-400';
      case 'markdown':
        return 'text-purple-400';
      case 'text':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <TerminalBackButton className="mb-4" />
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">
          📄 Compliance Documentation Exporter
        </h1>
        <p className="text-gray-400">
          Automated regulator-grade documentation generator for GhostQuant™ compliance frameworks
        </p>
      </div>

      {/* Health Status Banner */}
      {health && (
        <div className="mb-6 p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-cyan-400">System Health</h2>
            <div className={`text-2xl font-bold ${getHealthColor(health.status)}`}>
              {health.status}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-black rounded">
              <div className="text-gray-400 text-sm">Total Exports</div>
              <div className="text-xl font-bold text-white">{health.total_exports}</div>
            </div>
            <div className="p-4 bg-black rounded">
              <div className="text-gray-400 text-sm">Total Size</div>
              <div className="text-xl font-bold text-cyan-400">{formatFileSize(health.total_size_bytes)}</div>
            </div>
            <div className="p-4 bg-black rounded">
              <div className="text-gray-400 text-sm">Successful</div>
              <div className="text-xl font-bold text-green-400">{health.manifest.successful_exports}</div>
            </div>
            <div className="p-4 bg-black rounded">
              <div className="text-gray-400 text-sm">Failed</div>
              <div className="text-xl font-bold text-red-400">{health.manifest.failed_exports}</div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-500 rounded-lg text-green-400">
          {successMessage}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Panel - Document Selector */}
        <div className="col-span-1 space-y-6">
          <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Document Generator</h3>
            
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Select Document Type</label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full p-3 bg-black border border-gray-700 rounded text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="">-- Select Document Type --</option>
                {documentTypes.map((docType) => (
                  <option key={docType.type} value={docType.type}>
                    {docType.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedDocType && (
              <div className="mb-4 p-4 bg-black rounded">
                {documentTypes
                  .filter((dt) => dt.type === selectedDocType)
                  .map((docType) => (
                    <div key={docType.type}>
                      <div className="text-sm text-gray-400 mb-2">{docType.description}</div>
                      <div className="text-xs text-gray-500">
                        <div className="mb-1">Sections: {docType.sections_count}</div>
                        <div>Frameworks: {docType.frameworks.join(', ')}</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <button
              onClick={handleGenerateDocument}
              disabled={!selectedDocType || generating}
              className="w-full p-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded font-bold transition-colors"
            >
              {generating ? 'Generating...' : 'Generate Document'}
            </button>

            <div className="mt-4 text-xs text-gray-500">
              Exports to JSON, Markdown, and TXT formats
            </div>
          </div>

          {/* Document Types List */}
          <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Available Documents ({documentTypes.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {documentTypes.map((docType) => (
                <div
                  key={docType.type}
                  onClick={() => setSelectedDocType(docType.type)}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedDocType === docType.type
                      ? 'bg-cyan-900/30 border border-cyan-500'
                      : 'bg-black hover:bg-gray-800 border border-gray-700'
                  }`}
                >
                  <div className="font-bold text-sm text-white">{docType.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{docType.type.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Panel - Document Preview / Exports List */}
        <div className="col-span-1 space-y-6">
          {generatedDocument && (
            <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Generated Document</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-gray-400 text-sm">Document Name</div>
                  <div className="font-bold text-white">{generatedDocument.name}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Document ID</div>
                  <div className="font-mono text-sm text-cyan-400">{generatedDocument.doc_id}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Type</div>
                  <div className="text-white">{generatedDocument.doc_type.toUpperCase()}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Version</div>
                  <div className="text-white">{generatedDocument.version}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Sections</div>
                  <div className="text-white">{generatedDocument.sections_count}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Generated</div>
                  <div className="text-white">{formatDate(generatedDocument.generated_at)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Compliance Frameworks</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {generatedDocument.compliance_frameworks.map((framework, idx) => (
                      <div key={idx}>• {framework}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-cyan-400">Exported Files ({exports.length})</h3>
              {exports.length > 0 && (
                <button
                  onClick={handleClearExports}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-bold transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {exports.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No exports yet</div>
              ) : (
                exports.map((exportFile, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-black rounded border border-gray-700 hover:border-cyan-500 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-mono text-sm text-white truncate flex-1">
                        {exportFile.filename}
                      </div>
                      <button
                        onClick={() => handleDownload(exportFile.filename)}
                        className="ml-2 px-2 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-xs font-bold transition-colors"
                      >
                        Download
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold ${getFormatColor(exportFile.format)}`}>
                        {exportFile.format.toUpperCase()}
                      </span>
                      <span className="text-gray-400">{formatFileSize(exportFile.file_size)}</span>
                      <span className="text-gray-500">{formatDate(exportFile.modified_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Metadata & Health */}
        <div className="col-span-1 space-y-6">
          {statistics && (
            <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Export Statistics</h3>
              <div className="space-y-4">
                <div className="p-4 bg-black rounded">
                  <div className="text-gray-400 text-sm mb-2">Total Exports</div>
                  <div className="text-2xl font-bold text-white">{statistics.total_exports}</div>
                </div>
                <div className="p-4 bg-black rounded">
                  <div className="text-gray-400 text-sm mb-2">Total Size</div>
                  <div className="text-2xl font-bold text-cyan-400">
                    {formatFileSize(statistics.total_size_bytes)}
                  </div>
                </div>

                {Object.keys(statistics.by_format).length > 0 && (
                  <div className="p-4 bg-black rounded">
                    <div className="text-gray-400 text-sm mb-2">By Format</div>
                    {Object.entries(statistics.by_format).map(([format, data]) => (
                      <div key={format} className="flex justify-between text-sm mb-1">
                        <span className={getFormatColor(format)}>{format.toUpperCase()}</span>
                        <span className="text-white">{data.count} files</span>
                      </div>
                    ))}
                  </div>
                )}

                {Object.keys(statistics.by_doc_type).length > 0 && (
                  <div className="p-4 bg-black rounded">
                    <div className="text-gray-400 text-sm mb-2">By Document Type</div>
                    <div className="max-h-48 overflow-y-auto">
                      {Object.entries(statistics.by_doc_type).map(([docType, data]) => (
                        <div key={docType} className="flex justify-between text-sm mb-1">
                          <span className="text-cyan-400">{docType.toUpperCase()}</span>
                          <span className="text-white">{data.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {statistics.newest_export && (
                  <div className="p-4 bg-black rounded">
                    <div className="text-gray-400 text-sm mb-2">Latest Export</div>
                    <div className="text-xs text-white">{statistics.newest_export.filename}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(statistics.newest_export.modified_at)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">System Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-400">System</div>
                <div className="text-white">GhostQuant™ Compliance Exporter</div>
              </div>
              <div>
                <div className="text-gray-400">Version</div>
                <div className="text-white">1.0.0</div>
              </div>
              <div>
                <div className="text-gray-400">Export Formats</div>
                <div className="text-white">JSON, Markdown, TXT</div>
              </div>
              <div>
                <div className="text-gray-400">Document Types</div>
                <div className="text-white">{documentTypes.length} available</div>
              </div>
              {health && (
                <>
                  <div>
                    <div className="text-gray-400">Export Directory</div>
                    <div className="text-white font-mono text-xs break-all">
                      {health.export_directory}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Directory Status</div>
                    <div className="text-white">
                      {health.directory_exists ? '✓ Exists' : '✗ Not Found'} • {' '}
                      {health.directory_writable ? '✓ Writable' : '✗ Read-Only'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Compliance Frameworks</h3>
            <div className="space-y-1 text-xs text-gray-400 max-h-64 overflow-y-auto">
              <div>• CJIS Security Policy v5.9</div>
              <div>• NIST 800-53 Rev 5</div>
              <div>• SOC 2 Type II</div>
              <div>• FedRAMP LITE</div>
              <div>• FinCEN / Bank Secrecy Act</div>
              <div>• FATF Recommendations</div>
              <div>• GDPR / CCPA</div>
              <div>• NIST Privacy Framework</div>
              <div>• NIST 800-61 / ISO 27035</div>
              <div>• NIST 800-207 (Zero Trust)</div>
              <div>• NIST 800-218 / OWASP SAMM</div>
              <div>• ISO 27034</div>
              <div>• NIST 800-57 / FIPS 140-2</div>
              <div>• CIS Benchmarks</div>
              <div>• DISA STIGs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>GhostQuant™ Compliance Documentation Exporter • Regulator-Grade Documentation</p>
        <p className="mt-1">
          Automated compliance documentation for CJIS, NIST, SOC 2, FedRAMP, AML/KYC, and more
        </p>
      </div>
    </div>
  );
}
