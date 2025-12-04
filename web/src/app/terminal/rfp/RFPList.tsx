'use client';

/**
 * RFP List Component
 * 
 * Displays saved RFP proposals in a table.
 */

import React from 'react';
import { RFPProposal } from './RFPClient';

interface RFPListProps {
  proposals: RFPProposal[];
  selectedProposal: RFPProposal | null;
  onSelectProposal: (proposal: RFPProposal) => void;
}

export default function RFPList({ proposals, selectedProposal, onSelectProposal }: RFPListProps) {
  if (proposals.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-3">📋</div>
          <div className="text-lg">No proposals yet</div>
          <div className="text-sm mt-2">Generate your first proposal to get started</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-2 p-4">
        {proposals.map((proposal) => (
          <ProposalCard
            key={proposal.proposal_id}
            proposal={proposal}
            isSelected={selectedProposal?.proposal_id === proposal.proposal_id}
            onClick={() => onSelectProposal(proposal)}
          />
        ))}
      </div>
    </div>
  );
}

interface ProposalCardProps {
  proposal: RFPProposal;
  isSelected: boolean;
  onClick: () => void;
}

function ProposalCard({ proposal, isSelected, onClick }: ProposalCardProps) {
  const statusColors = {
    draft: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    submitted: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    approved: 'text-green-400 bg-green-500/10 border-green-500/30',
    rejected: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  const statusColor = statusColors[proposal.status as keyof typeof statusColors] || statusColors.draft;

  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer rounded-lg border p-4 transition-all
        ${
          isSelected
            ? 'bg-emerald-900/30 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
            : 'bg-gray-900/50 border-gray-700/50 hover:border-emerald-500/30 hover:bg-gray-900/70'
        }
      `}
    >
      {/* Title */}
      <h3 className="text-white font-semibold mb-2 line-clamp-1">{proposal.title}</h3>

      {/* Agency */}
      <div className="text-sm text-emerald-400 mb-3">{proposal.agency}</div>

      {/* Metadata */}
      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">ID:</span>
          <span className="font-mono">{proposal.proposal_id.substring(0, 12)}...</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Sections:</span>
          <span>{proposal.metadata.total_sections}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Words:</span>
          <span>{proposal.metadata.total_words.toLocaleString()}</span>
        </div>
      </div>

      {/* Status & Date */}
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded border ${statusColor} uppercase font-semibold`}>
          {proposal.status}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(proposal.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Compliance Score (if available) */}
      {proposal.compliance_matrix && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Compliance Score</span>
            <span className="text-cyan-400 font-semibold">
              {proposal.compliance_matrix.summary.compliance_percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
