'use client';

import React from 'react';

interface Proposal {
  package_id: string;
  document: {
    title: string;
    agency: string;
    rfp_number: string;
    total_pages: number;
    total_words: number;
    generated_at: string;
  };
  status: string;
  created_at: string;
}

interface ProposalListProps {
  proposals: Proposal[];
  onSelect: (proposalId: string) => void;
  selectedId?: string;
}

export default function ProposalList({ proposals, onSelect, selectedId }: ProposalListProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'text-yellow-400';
      case 'final':
        return 'text-emerald-400';
      case 'submitted':
        return 'text-cyan-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="proposal-list">
      <h3 className="text-lg font-semibold text-emerald-400 mb-4">Saved Proposals</h3>
      
      {proposals.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p>No proposals yet</p>
          <p className="text-sm mt-2">Generate your first proposal to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {proposals.map((proposal) => (
            <div
              key={proposal.package_id}
              onClick={() => onSelect(proposal.package_id)}
              className={`p-4 rounded border cursor-pointer transition-all ${
                selectedId === proposal.package_id
                  ? 'bg-emerald-900/20 border-emerald-500'
                  : 'bg-slate-800/50 border-slate-700 hover:border-emerald-600'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-200 mb-1">{proposal.document.title}</h4>
                  <p className="text-sm text-slate-400">{proposal.document.agency}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(proposal.status)}`}>
                  {proposal.status.toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-2">
                <div>
                  <span className="text-slate-600">RFP:</span> {proposal.document.rfp_number}
                </div>
                <div>
                  <span className="text-slate-600">Pages:</span> {proposal.document.total_pages}
                </div>
                <div>
                  <span className="text-slate-600">Words:</span> {proposal.document.total_words.toLocaleString()}
                </div>
                <div>
                  <span className="text-slate-600">Created:</span> {formatDate(proposal.created_at)}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">ID: {proposal.package_id}</span>
                <span className="text-emerald-500">→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
