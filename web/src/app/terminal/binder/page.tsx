'use client';

/**
 * GhostQuant™ — Regulatory Audit Binder Generator
 * Module: page.tsx
 * Purpose: 3-panel audit binder console
 */

import { useState, useEffect } from 'react';
import {
  generateBinder,
  getLatestBinder,
  listBinders,
  downloadBinderFile,
  getBinderHealth,
  getBinderStatistics,
  deleteBinder,
  type BinderMetadata,
  type BinderListItem,
  type BinderSection,
  type BinderAttachment,
} from './binderClient';

export default function BinderPage() {
  const [binders, setBinders] = useState<BinderListItem[]>([]);
  const [selectedBinder, setSelectedBinder] = useState<BinderMetadata | null>(null);
  const [selectedSection, setSelectedSection] = useState<BinderSection | null>(null);
  const [sectionContent, setSectionContent] = useState<string>('');
  const [health, setHealth] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadBinders();
    loadHealth();
    loadStatistics();
  }, []);

  const loadBinders = async () => {
    const result = await listBinders();
    if (result.success && result.binders) {
      setBinders(result.binders);
    }
  };

  const loadHealth = async () => {
    const result = await getBinderHealth();
    if (result.success && result.health) {
      setHealth(result.health);
    }
  };

  const loadStatistics = async () => {
    const result = await getBinderStatistics();
    if (result.success && result.statistics) {
      setStatistics(result.statistics);
    }
  };

  const handleGenerateBinder = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await generateBinder();
    
    if (result.success) {
      setSuccess(`Binder generated successfully: ${result.binder_name}`);
      await loadBinders();
      await loadHealth();
      await loadStatistics();
      
      const latestResult = await getLatestBinder();
      if (latestResult.success && latestResult.data) {
        setSelectedBinder(latestResult.data);
      }
    } else {
      setError(result.error || 'Failed to generate binder');
    }

    setLoading(false);
  };

  const handleSelectBinder = async (binder: BinderListItem) => {
    setLoading(true);
    setError(null);

    const result = await getLatestBinder();
    if (result.success && result.data && result.data.binder_id === binder.binder_id) {
      setSelectedBinder(result.data);
      setSelectedSection(null);
      setSectionContent('');
    } else {
      setError('Failed to load binder details');
    }

    setLoading(false);
  };

  const handleSelectSection = async (section: BinderSection) => {
    if (!selectedBinder) return;

    setLoading(true);
    setError(null);
    setSelectedSection(section);

    const result = await downloadBinderFile(
      selectedBinder.binder_id,
      `sections/${section.filename}`
    );

    if (result.success && result.content) {
      setSectionContent(result.content);
    } else {
      setError(result.error || 'Failed to load section content');
      setSectionContent('');
    }

    setLoading(false);
  };

  const handleSelectAttachment = async (attachment: BinderAttachment) => {
    if (!selectedBinder) return;

    setLoading(true);
    setError(null);

    const result = await downloadBinderFile(
      selectedBinder.binder_id,
      `attachments/${attachment.filename}`
    );

    if (result.success && result.content) {
      setSectionContent(result.content);
      setSelectedSection(null);
    } else {
      setError(result.error || 'Failed to load attachment content');
      setSectionContent('');
    }

    setLoading(false);
  };

  const handleDeleteBinder = async (binderId: string) => {
    if (!confirm('Are you sure you want to delete this binder?')) return;

    setLoading(true);
    setError(null);

    const result = await deleteBinder(binderId);
    
    if (result.success) {
      setSuccess('Binder deleted successfully');
      await loadBinders();
      await loadHealth();
      await loadStatistics();
      
      if (selectedBinder?.binder_id === binderId) {
        setSelectedBinder(null);
        setSelectedSection(null);
        setSectionContent('');
      }
    } else {
      setError(result.error || 'Failed to delete binder');
    }

    setLoading(false);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([loadBinders(), loadHealth(), loadStatistics()]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-cyan-400 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-cyan-400">AUDIT BINDER</span>{' '}
          <span className="text-gray-500">GENERATOR</span>
        </h1>
        <p className="text-gray-400">
          Automated regulatory audit binder generation with PDF-ready folder structure
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
        {/* Left Panel - Actions & Binder List */}
        <div className="col-span-3 space-y-6">
          {/* Actions */}
          <div className="bg-gray-900 border border-cyan-900 rounded p-4">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">ACTIONS</h2>
            <div className="space-y-2">
              <button
                onClick={handleGenerateBinder}
                disabled={loading}
                className="w-full px-4 py-2 bg-cyan-900 hover:bg-cyan-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-cyan-400 rounded transition-colors"
              >
                {loading ? 'Generating...' : 'Generate Binder'}
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-cyan-400 rounded transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Binder List */}
          <div className="bg-gray-900 border border-cyan-900 rounded p-4">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">
              BINDERS ({binders.length})
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {binders.length === 0 ? (
                <p className="text-gray-500 text-sm">No binders generated yet</p>
              ) : (
                binders.map((binder) => (
                  <div
                    key={binder.binder_id}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      selectedBinder?.binder_id === binder.binder_id
                        ? 'bg-cyan-900/30 border border-cyan-700'
                        : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                    }`}
                    onClick={() => handleSelectBinder(binder)}
                  >
                    <div className="text-sm font-mono">
                      <div className="text-cyan-400 truncate">{binder.name}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        {new Date(binder.generated_at).toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {binder.section_count} sections • {binder.attachment_count} attachments
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBinder(binder.binder_id);
                      }}
                      className="mt-2 text-xs text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Middle Panel - Binder Preview */}
        <div className="col-span-6 bg-gray-900 border border-cyan-900 rounded p-4">
          <h2 className="text-xl font-bold mb-4 text-cyan-400">BINDER PREVIEW</h2>
          
          {!selectedBinder ? (
            <div className="text-center text-gray-500 py-20">
              <p>Select a binder to view details</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Binder Info */}
              <div className="bg-gray-800 border border-gray-700 rounded p-4">
                <h3 className="text-lg font-bold text-cyan-400 mb-2">
                  {selectedBinder.name}
                </h3>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>ID: {selectedBinder.binder_id}</p>
                  <p>Generated: {new Date(selectedBinder.generated_at).toLocaleString()}</p>
                  <p>Sections: {selectedBinder.section_count}</p>
                  <p>Attachments: {selectedBinder.attachment_count}</p>
                </div>
              </div>

              {/* Sections */}
              <div className="bg-gray-800 border border-gray-700 rounded p-4">
                <h3 className="text-lg font-bold text-cyan-400 mb-3">SECTIONS</h3>
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {selectedBinder.sections.map((section) => (
                    <div
                      key={section.id}
                      className={`p-2 rounded cursor-pointer transition-colors text-sm ${
                        selectedSection?.id === section.id
                          ? 'bg-cyan-900/30 border border-cyan-700'
                          : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                      }`}
                      onClick={() => handleSelectSection(section)}
                    >
                      <span className="text-gray-400">{section.order}.</span>{' '}
                      <span className="text-cyan-400">{section.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              <div className="bg-gray-800 border border-gray-700 rounded p-4">
                <h3 className="text-lg font-bold text-cyan-400 mb-3">ATTACHMENTS</h3>
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {selectedBinder.attachments.length === 0 ? (
                    <p className="text-gray-500 text-sm">No attachments</p>
                  ) : (
                    selectedBinder.attachments.map((attachment, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded cursor-pointer transition-colors text-sm bg-gray-700 hover:bg-gray-600 border border-gray-600"
                        onClick={() => handleSelectAttachment(attachment)}
                      >
                        <div className="text-cyan-400">{attachment.filename}</div>
                        <div className="text-gray-500 text-xs">{attachment.description}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Content Preview */}
              {sectionContent && (
                <div className="bg-gray-800 border border-gray-700 rounded p-4">
                  <h3 className="text-lg font-bold text-cyan-400 mb-3">CONTENT</h3>
                  <div className="bg-black border border-gray-700 rounded p-4 max-h-[400px] overflow-y-auto">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                      {sectionContent}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Metadata & Health */}
        <div className="col-span-3 space-y-6">
          {/* Statistics */}
          {statistics && (
            <div className="bg-gray-900 border border-cyan-900 rounded p-4">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">STATISTICS</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Binders:</span>
                  <span className="text-cyan-400">{statistics.total_binders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Sections:</span>
                  <span className="text-cyan-400">{statistics.total_sections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Attachments:</span>
                  <span className="text-cyan-400">{statistics.total_attachments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Sections:</span>
                  <span className="text-cyan-400">
                    {statistics.average_sections_per_binder.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Attachments:</span>
                  <span className="text-cyan-400">
                    {statistics.average_attachments_per_binder.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Health Status */}
          {health && (
            <div className="bg-gray-900 border border-cyan-900 rounded p-4">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">HEALTH</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-400 mb-1">System Status:</div>
                  <div
                    className={`font-bold ${
                      health.status === 'healthy' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {health.status.toUpperCase()}
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 mb-1">Engine:</div>
                  <div className="text-cyan-400">
                    {health.engine.builder_initialized && health.engine.exporter_initialized
                      ? 'Operational'
                      : 'Error'}
                  </div>
                </div>

                {health.exporter && (
                  <>
                    <div>
                      <div className="text-gray-400 mb-1">Export Directory:</div>
                      <div className="text-cyan-400 text-xs break-all">
                        {health.exporter.base_export_dir}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 mb-1">Storage:</div>
                      <div className="text-cyan-400">
                        {health.exporter.total_size_mb} MB
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 mb-1">Binder Count:</div>
                      <div className="text-cyan-400">{health.exporter.binder_count}</div>
                    </div>
                  </>
                )}

                <div>
                  <div className="text-gray-400 mb-1">Last Updated:</div>
                  <div className="text-cyan-400 text-xs">
                    {new Date(health.timestamp).toLocaleString()}
                  </div>
                </div>
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
