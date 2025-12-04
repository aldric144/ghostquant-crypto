'use client';

/**
 * RFP Command Center
 * 
 * 3-column UI for enterprise RFP generation:
 * - Left: RFP Library (saved proposals)
 * - Middle: RFP Builder Wizard / Preview
 * - Right: Metadata, Export, Compliance
 */

import React, { useState, useEffect } from 'react';
import { RFPClient, RFPProposal } from './RFPClient';
import RFPList from './RFPList';
import RFPViewer from './RFPViewer';
import RFPWizard from './RFPWizard';
import ComplianceMatrix from './ComplianceMatrix';

type ViewMode = 'viewer' | 'compliance';

export default function RFPCommandCenter() {
  const [proposals, setProposals] = useState<RFPProposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<RFPProposal | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('viewer');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const client = new RFPClient();

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await client.list(100, 0);
      if (result.success) {
        setProposals(result.proposals);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load proposals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWizardComplete = async (proposalId: string) => {
    setShowWizard(false);
    await loadProposals();

    try {
      const result = await client.getProposal(proposalId);
      if (result.success) {
        setSelectedProposal(result.proposal);
      }
    } catch (err) {
      console.error('Failed to load new proposal:', err);
    }
  };

  const handleExport = async (format: 'html' | 'markdown' | 'json' | 'zip') => {
    if (!selectedProposal) return;

    try {
      let blob: Blob;
      let filename: string;

      switch (format) {
        case 'html':
          blob = await client.exportHTML(selectedProposal.proposal_id);
          filename = `proposal_${selectedProposal.proposal_id}.html`;
          break;
        case 'markdown':
          blob = await client.exportMarkdown(selectedProposal.proposal_id);
          filename = `proposal_${selectedProposal.proposal_id}.md`;
          break;
        case 'json':
          blob = await client.exportJSON(selectedProposal.proposal_id);
          filename = `proposal_${selectedProposal.proposal_id}.json`;
          break;
        case 'zip':
          blob = await client.exportZIP(selectedProposal.proposal_id);
          filename = `proposal_${selectedProposal.proposal_id}.zip`;
          break;
      }

      client.downloadFile(blob, filename);
    } catch (err) {
      console.error(`Failed to export ${format}:`, err);
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 border-b border-emerald-500/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">RFP Command Center</h1>
            <p className="text-emerald-400 text-sm">Enterprise RFP Generator™</p>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded font-semibold transition-all"
          >
            + New Proposal
          </button>
        </div>
      </div>

      {/* Main Content - 3 Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN - RFP Library */}
        <div className="w-80 border-r border-emerald-500/20 bg-gray-900/50 flex flex-col">
          <div className="bg-gray-800/50 border-b border-gray-700/50 px-4 py-3">
            <h2 className="text-white font-semibold">RFP Library</h2>
            <p className="text-xs text-gray-400 mt-1">{proposals.length} proposals</p>
          </div>

          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-400">{error}</div>
              </div>
            ) : (
              <RFPList
                proposals={proposals}
                selectedProposal={selectedProposal}
                onSelectProposal={setSelectedProposal}
              />
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN - Content Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* View Mode Tabs */}
          {selectedProposal && (
            <div className="bg-gray-800/50 border-b border-gray-700/50 px-4 py-2 flex gap-2">
              <button
                onClick={() => setViewMode('viewer')}
                className={`px-4 py-2 rounded transition-colors ${
                  viewMode === 'viewer'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Proposal
              </button>
              <button
                onClick={() => setViewMode('compliance')}
                className={`px-4 py-2 rounded transition-colors ${
                  viewMode === 'compliance'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Compliance Matrix
              </button>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            {viewMode === 'viewer' ? (
              <RFPViewer proposal={selectedProposal} />
            ) : (
              <ComplianceMatrix matrix={selectedProposal?.compliance_matrix || null} />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - Metadata & Actions */}
        <div className="w-80 border-l border-emerald-500/20 bg-gray-900/50 flex flex-col overflow-y-auto">
          {selectedProposal ? (
            <>
              {/* Metadata Section */}
              <div className="border-b border-gray-700/50 p-4">
                <h3 className="text-white font-semibold mb-4">Proposal Metadata</h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">Proposal ID</div>
                    <div className="text-white font-mono text-xs">{selectedProposal.proposal_id}</div>
                  </div>

                  <div>
                    <div className="text-gray-400 mb-1">RFP ID</div>
                    <div className="text-white font-mono text-xs">{selectedProposal.rfp_id}</div>
                  </div>

                  <div>
                    <div className="text-gray-400 mb-1">Status</div>
                    <div className="text-cyan-400 uppercase font-semibold">{selectedProposal.status}</div>
                  </div>

                  <div>
                    <div className="text-gray-400 mb-1">Created</div>
                    <div className="text-white">{new Date(selectedProposal.created_at).toLocaleString()}</div>
                  </div>

                  <div>
                    <div className="text-gray-400 mb-1">Last Updated</div>
                    <div className="text-white">{new Date(selectedProposal.updated_at).toLocaleString()}</div>
                  </div>

                  <div>
                    <div className="text-gray-400 mb-1">Total Sections</div>
                    <div className="text-white">{selectedProposal.metadata.total_sections}</div>
                  </div>

                  <div>
                    <div className="text-gray-400 mb-1">Total Words</div>
                    <div className="text-white">{selectedProposal.metadata.total_words.toLocaleString()}</div>
                  </div>

                  <div>
                    <div className="text-gray-400 mb-1">Generator Version</div>
                    <div className="text-white">{selectedProposal.metadata.generator_version}</div>
                  </div>
                </div>
              </div>

              {/* Compliance Summary */}
              {selectedProposal.compliance_matrix && (
                <div className="border-b border-gray-700/50 p-4">
                  <h3 className="text-white font-semibold mb-4">Compliance Summary</h3>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Overall Score</span>
                        <span className="text-emerald-400 font-bold text-lg">
                          {selectedProposal.compliance_matrix.summary.compliance_percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full"
                          style={{
                            width: `${selectedProposal.compliance_matrix.summary.compliance_percentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-sm mb-2">Risk Level</div>
                      <div
                        className={`px-3 py-1 rounded border text-sm font-semibold uppercase inline-block ${
                          selectedProposal.compliance_matrix.risk_level === 'low'
                            ? 'text-green-400 bg-green-500/10 border-green-500/30'
                            : selectedProposal.compliance_matrix.risk_level === 'medium'
                            ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                            : selectedProposal.compliance_matrix.risk_level === 'high'
                            ? 'text-orange-400 bg-orange-500/10 border-orange-500/30'
                            : 'text-red-400 bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        {selectedProposal.compliance_matrix.risk_level}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-2">
                        <div className="text-emerald-400 font-bold">
                          {selectedProposal.compliance_matrix.summary.exceeds_count}
                        </div>
                        <div className="text-gray-400">EXCEEDS</div>
                      </div>
                      <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
                        <div className="text-green-400 font-bold">
                          {selectedProposal.compliance_matrix.summary.meets_count}
                        </div>
                        <div className="text-gray-400">MEETS</div>
                      </div>
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
                        <div className="text-yellow-400 font-bold">
                          {selectedProposal.compliance_matrix.summary.partial_count}
                        </div>
                        <div className="text-gray-400">PARTIAL</div>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
                        <div className="text-red-400 font-bold">
                          {selectedProposal.compliance_matrix.summary.does_not_meet_count}
                        </div>
                        <div className="text-gray-400">DOES NOT MEET</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Export Actions */}
              <div className="border-b border-gray-700/50 p-4">
                <h3 className="text-white font-semibold mb-4">Export Proposal</h3>

                <div className="space-y-2">
                  <button
                    onClick={() => handleExport('html')}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm flex items-center justify-between"
                  >
                    <span>Download HTML</span>
                    <span className="text-emerald-400">↓</span>
                  </button>

                  <button
                    onClick={() => handleExport('markdown')}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm flex items-center justify-between"
                  >
                    <span>Download Markdown</span>
                    <span className="text-emerald-400">↓</span>
                  </button>

                  <button
                    onClick={() => handleExport('json')}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm flex items-center justify-between"
                  >
                    <span>Download JSON</span>
                    <span className="text-emerald-400">↓</span>
                  </button>

                  <button
                    onClick={() => handleExport('zip')}
                    className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded transition-colors text-sm font-semibold flex items-center justify-between"
                  >
                    <span>Download ZIP Bundle</span>
                    <span>↓</span>
                  </button>
                </div>
              </div>

              {/* Notes Section */}
              <div className="p-4">
                <h3 className="text-white font-semibold mb-4">Notes</h3>
                <textarea
                  placeholder="Add notes about this proposal..."
                  className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <div>Select a proposal to view details</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <RFPWizard onComplete={handleWizardComplete} onCancel={() => setShowWizard(false)} />
      )}
    </div>
  );
}
