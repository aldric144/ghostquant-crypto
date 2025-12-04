'use client';

import React from 'react';

interface ComplianceRequirement {
  req_id: string;
  requirement: string;
  status: string;
  evidence: string;
  confidence: number;
}

interface ComplianceMatrixProps {
  matrixId: string;
  requirements: ComplianceRequirement[];
  overallScore: number;
  complianceSummary: {
    total_requirements: number;
    compliant: number;
    in_progress: number;
    non_compliant: number;
    compliance_percentage: number;
  };
}

export default function ComplianceMatrix({ 
  matrixId, 
  requirements, 
  overallScore, 
  complianceSummary 
}: ComplianceMatrixProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'compliant':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500';
      case 'in progress':
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'non_compliant':
      case 'non-compliant':
        return 'bg-red-500/20 text-red-400 border-red-500';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-cyan-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="compliance-matrix">
      <div className="mb-6 p-6 bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border border-emerald-500/30 rounded-lg">
        <h3 className="text-xl font-semibold text-emerald-400 mb-4">Compliance Overview</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-4 bg-slate-800/50 rounded">
            <div className={`text-4xl font-bold mb-1 ${getScoreColor(overallScore)}`}>
              {overallScore.toFixed(1)}%
            </div>
            <div className="text-sm text-slate-400">Overall Score</div>
          </div>
          
          <div className="text-center p-4 bg-slate-800/50 rounded">
            <div className="text-4xl font-bold text-slate-200 mb-1">
              {complianceSummary.total_requirements}
            </div>
            <div className="text-sm text-slate-400">Total Requirements</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="p-3 bg-emerald-900/20 border border-emerald-500/30 rounded text-center">
            <div className="text-2xl font-bold text-emerald-400">{complianceSummary.compliant}</div>
            <div className="text-xs text-slate-400">Compliant</div>
          </div>
          
          <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded text-center">
            <div className="text-2xl font-bold text-yellow-400">{complianceSummary.in_progress}</div>
            <div className="text-xs text-slate-400">In Progress</div>
          </div>
          
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-center">
            <div className="text-2xl font-bold text-red-400">{complianceSummary.non_compliant}</div>
            <div className="text-xs text-slate-400">Non-Compliant</div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-slate-300 mb-3">Requirements Detail</h4>
        <div className="space-y-2">
          {requirements.map((req) => (
            <div
              key={req.req_id}
              className="p-4 bg-slate-800/50 border border-slate-700 rounded hover:border-emerald-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-500">{req.req_id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(req.status)}`}>
                      {req.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 mb-2">{req.requirement}</p>
                  <p className="text-xs text-slate-400">{req.evidence}</p>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-lg font-bold text-emerald-400">
                    {(req.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-slate-500">Confidence</div>
                </div>
              </div>
              
              <div className="mt-2 h-1 bg-slate-700 rounded overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${req.confidence * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-800/30 border border-slate-700 rounded text-xs text-slate-500 text-center">
        Matrix ID: {matrixId}
      </div>
    </div>
  );
}
