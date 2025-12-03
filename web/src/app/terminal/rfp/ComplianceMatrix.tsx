'use client';

/**
 * Compliance Matrix Component
 * 
 * Tabular compliance matrix viewer with green/yellow/red coding.
 */

import React from 'react';
import { ComplianceMatrix as ComplianceMatrixType } from './RFPClient';

interface ComplianceMatrixProps {
  matrix: ComplianceMatrixType | null;
}

export default function ComplianceMatrix({ matrix }: ComplianceMatrixProps) {
  if (!matrix) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <div className="text-xl">No compliance matrix available</div>
          <div className="text-sm mt-2">Generate a proposal with requirements to see compliance</div>
        </div>
      </div>
    );
  }

  const { summary, risk_level, requirements } = matrix;

  return (
    <div className="h-full overflow-y-auto bg-black p-6">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border border-emerald-500/30 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Compliance Matrix</h2>

        {/* Overall Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Overall Compliance Score</span>
            <span className="text-3xl font-bold text-emerald-400">
              {summary.compliance_percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-500"
              style={{ width: `${summary.compliance_percentage}%` }}
            />
          </div>
        </div>

        {/* Risk Level */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="text-gray-300">Risk Level:</span>
            <RiskBadge level={risk_level} />
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="EXCEEDS" value={summary.exceeds_count} color="emerald" />
          <StatCard label="MEETS" value={summary.meets_count} color="green" />
          <StatCard label="PARTIAL" value={summary.partial_count} color="yellow" />
          <StatCard label="DOES NOT MEET" value={summary.does_not_meet_count} color="red" />
          <StatCard label="OUT OF SCOPE" value={summary.out_of_scope_count} color="gray" />
        </div>
      </div>

      {/* Requirements Table */}
      <div className="bg-gray-900/50 border border-emerald-500/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 border-b border-emerald-500/30">
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Section</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Description</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-white">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-white">Risk</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((req: any, idx: number) => (
                <RequirementRow key={idx} requirement={req} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  color: 'emerald' | 'green' | 'yellow' | 'red' | 'gray';
}

function StatCard({ label, value, color }: StatCardProps) {
  const colorClasses = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    green: 'text-green-400 bg-green-500/10 border-green-500/30',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    red: 'text-red-400 bg-red-500/10 border-red-500/30',
    gray: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  };

  return (
    <div className={`border rounded-lg p-3 ${colorClasses[color]}`}>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs uppercase">{label}</div>
    </div>
  );
}

interface RiskBadgeProps {
  level: string;
}

function RiskBadge({ level }: RiskBadgeProps) {
  const levelColors = {
    low: 'text-green-400 bg-green-500/10 border-green-500/30',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  const color = levelColors[level as keyof typeof levelColors] || levelColors.medium;

  return (
    <span className={`px-3 py-1 rounded border text-sm font-semibold uppercase ${color}`}>
      {level}
    </span>
  );
}

interface RequirementRowProps {
  requirement: any;
}

function RequirementRow({ requirement }: RequirementRowProps) {
  const statusColors = {
    EXCEEDS: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    MEETS: 'text-green-400 bg-green-500/10 border-green-500/30',
    PARTIAL: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    'DOES NOT MEET': 'text-red-400 bg-red-500/10 border-red-500/30',
    'OUT OF SCOPE': 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  };

  const riskColors = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400',
  };

  const status = requirement.compliance_status || 'UNSCORED';
  const statusColor = statusColors[status as keyof typeof statusColors] || 'text-gray-400';
  const riskColor = riskColors[requirement.risk_level as keyof typeof riskColors] || 'text-gray-400';

  return (
    <tr className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-300 font-mono">{requirement.requirement_id}</td>
      <td className="px-4 py-3 text-sm text-gray-400">{requirement.section}</td>
      <td className="px-4 py-3 text-sm text-gray-300">{requirement.description}</td>
      <td className="px-4 py-3 text-center">
        <span className={`px-2 py-1 rounded border text-xs font-semibold uppercase ${statusColor}`}>
          {status}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`text-xs font-semibold uppercase ${riskColor}`}>
          {requirement.risk_level}
        </span>
      </td>
    </tr>
  );
}
