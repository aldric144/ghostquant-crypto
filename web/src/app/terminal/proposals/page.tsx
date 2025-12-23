'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
;

import React, { useState, useEffect } from 'react';
import { proposalClient } from './ProposalClient';
import RFPUpload from './RFPUpload';
import ProposalList from './ProposalList';
import ProposalWizard from './ProposalWizard';
import ProposalViewer from './ProposalViewer';
import ComplianceMatrix from './ComplianceMatrix';
import CostTable from './CostTable';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'compliance' | 'cost'>('preview');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      const response = await proposalClient.list(100, 0);
      setProposals(response.proposals || []);
    } catch (err) {
      console.error('Failed to load proposals:', err);
    }
  };

  const handleUploadRFP = async (rfpData: any) => {
    try {
      await proposalClient.uploadRFP(rfpData);
      alert('RFP uploaded successfully!');
    } catch (err) {
      setError(`Failed to upload RFP: ${err}`);
    }
  };

  const handleGenerateProposal = async (config: any) => {
    setIsGenerating(true);
    setError(null);

    try {
      const request = {
        rfp_id: config.rfp_id || `RFP-${Date.now()}`,
        agency: config.agency || 'Federal Agency',
        title: config.title || 'Cryptocurrency Intelligence Platform',
        persona_type: config.persona_type || 'dod',
        requirements: []
      };

      const response = await proposalClient.generateProposal(request);
      
      await loadProposals();
      
      if (response.package_id) {
        const proposal = await proposalClient.getProposal(response.package_id);
        setSelectedProposal(proposal);
      }

      alert(`Proposal generated successfully! ${response.total_pages} pages, ${response.total_words.toLocaleString()} words`);
    } catch (err) {
      setError(`Failed to generate proposal: ${err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectProposal = async (proposalId: string) => {
    try {
      const proposal = await proposalClient.getProposal(proposalId);
      setSelectedProposal(proposal);
      setActiveTab('preview');
    } catch (err) {
      setError(`Failed to load proposal: ${err}`);
    }
  };

  const handleExport = async (format: 'html' | 'markdown' | 'json' | 'zip') => {
    if (!selectedProposal) return;

    try {
      if (format === 'zip') {
        proposalClient.downloadZIP(selectedProposal.package_id);
      } else if (format === 'html') {
        const html = await proposalClient.exportHTML(selectedProposal.package_id);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `proposal_${selectedProposal.package_id}.html`;
        a.click();
      } else if (format === 'markdown') {
        const md = await proposalClient.exportMarkdown(selectedProposal.package_id);
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `proposal_${selectedProposal.package_id}.md`;
        a.click();
      } else if (format === 'json') {
        const json = await proposalClient.exportJSON(selectedProposal.package_id);
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `proposal_${selectedProposal.package_id}.json`;
        a.click();
      }
    } catch (err) {
      setError(`Failed to export: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <TerminalBackButton className="mb-4" />
          <h1 className="text-2xl font-bold text-emerald-400">Proposal Auto-Writer™</h1>
              <p className="text-sm text-slate-400 mt-1">Government & Fortune-100 Proposal Generation Engine</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-400">Total Proposals</div>
                <div className="text-xl font-bold text-emerald-400">{proposals.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-red-300">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-400 hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[1920px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <RFPUpload onUpload={handleUploadRFP} />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-h-[600px] overflow-y-auto">
              <ProposalList
                proposals={proposals}
                onSelect={handleSelectProposal}
                selectedId={selectedProposal?.package_id}
              />
            </div>
          </div>

          <div className="col-span-5">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <ProposalWizard
                onGenerate={handleGenerateProposal}
                isGenerating={isGenerating}
              />
            </div>
          </div>

          <div className="col-span-4 space-y-6">
            {selectedProposal ? (
              <>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-emerald-400">Preview & Export</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExport('html')}
                        className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                        title="Export HTML"
                      >
                        HTML
                      </button>
                      <button
                        onClick={() => handleExport('markdown')}
                        className="px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors"
                        title="Export Markdown"
                      >
                        MD
                      </button>
                      <button
                        onClick={() => handleExport('json')}
                        className="px-3 py-1 text-xs bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
                        title="Export JSON"
                      >
                        JSON
                      </button>
                      <button
                        onClick={() => handleExport('zip')}
                        className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                        title="Download ZIP Package"
                      >
                        ZIP
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`flex-1 px-4 py-2 rounded transition-colors ${
                        activeTab === 'preview'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => setActiveTab('compliance')}
                      className={`flex-1 px-4 py-2 rounded transition-colors ${
                        activeTab === 'compliance'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Compliance
                    </button>
                    <button
                      onClick={() => setActiveTab('cost')}
                      className={`flex-1 px-4 py-2 rounded transition-colors ${
                        activeTab === 'cost'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Cost
                    </button>
                  </div>

                  <div className="max-h-[700px] overflow-y-auto">
                    {activeTab === 'preview' && (
                      <ProposalViewer document={selectedProposal.document} />
                    )}

                    {activeTab === 'compliance' && selectedProposal.compliance_matrix && (
                      <ComplianceMatrix
                        matrixId={selectedProposal.compliance_matrix.matrix_id}
                        requirements={[
                          {
                            req_id: 'REQ-001',
                            requirement: 'NIST 800-53 compliance',
                            status: 'Compliant',
                            evidence: 'All controls implemented and documented',
                            confidence: 0.95
                          },
                          {
                            req_id: 'REQ-002',
                            requirement: 'FedRAMP authorization',
                            status: 'In Progress',
                            evidence: 'Authorization package under review',
                            confidence: 0.85
                          },
                          {
                            req_id: 'REQ-003',
                            requirement: '24/7 support',
                            status: 'Compliant',
                            evidence: 'Dedicated support team with 24/7 coverage',
                            confidence: 1.0
                          }
                        ]}
                        overallScore={selectedProposal.compliance_matrix.overall_score}
                        complianceSummary={{
                          total_requirements: selectedProposal.compliance_matrix.requirements_count,
                          compliant: 2,
                          in_progress: 1,
                          non_compliant: 0,
                          compliance_percentage: selectedProposal.compliance_matrix.overall_score
                        }}
                      />
                    )}

                    {activeTab === 'cost' && selectedProposal.cost_breakdown && (
                      <CostTable
                        costId={selectedProposal.cost_breakdown.cost_id}
                        totalCost={selectedProposal.cost_breakdown.total_cost}
                        costRiskLevel={selectedProposal.cost_breakdown.cost_risk_level}
                        laborCosts={{ total_annual: 2652000 }}
                        odcCosts={{ total: 350000 }}
                        travelCosts={{ total_annual: 50000 }}
                        costByYear={[
                          { year: 1, labor: 884000, odc: 116667, travel: 16667, total: 1017334 },
                          { year: 2, labor: 884000, odc: 116667, travel: 16667, total: 1017333 },
                          { year: 3, labor: 884000, odc: 116666, travel: 16666, total: 1017332 }
                        ]}
                        fteBreakdown={{
                          program_manager: 1,
                          technical_lead: 1,
                          senior_engineer: 2,
                          engineer: 2,
                          security_specialist: 1,
                          qa_engineer: 1,
                          support_engineer: 2
                        }}
                      />
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">No Proposal Selected</h3>
                <p className="text-slate-500">
                  Generate a new proposal or select an existing one from the list
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
