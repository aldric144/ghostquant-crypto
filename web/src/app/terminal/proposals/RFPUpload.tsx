'use client';

import React, { useState } from 'react';

interface RFPUploadProps {
  onUpload: (rfpData: any) => void;
}

export default function RFPUpload({ onUpload }: RFPUploadProps) {
  const [rfpId, setRfpId] = useState('');
  const [agency, setAgency] = useState('');
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [requirements, setRequirements] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rfpData = {
      rfp_id: rfpId || `RFP-${Date.now()}`,
      agency: agency || 'Federal Agency',
      title: title || 'Cryptocurrency Intelligence Platform',
      deadline: deadline || '2024-12-31',
      requirements: requirements ? requirements.split('\n').filter(r => r.trim()).map((r, i) => ({
        id: `REQ-${i + 1}`,
        text: r.trim(),
        priority: 'medium'
      })) : [],
      evaluation_criteria: [],
      compliance_requirements: []
    };

    onUpload(rfpData);
  };

  return (
    <div className="rfp-upload">
      <h3 className="text-lg font-semibold text-emerald-400 mb-4">Upload RFP Requirements</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">RFP ID</label>
          <input
            type="text"
            value={rfpId}
            onChange={(e) => setRfpId(e.target.value)}
            placeholder="RFP-2024-001"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Agency</label>
          <select
            value={agency}
            onChange={(e) => setAgency(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Select Agency</option>
            <option value="Department of Defense">Department of Defense</option>
            <option value="Department of Homeland Security">Department of Homeland Security</option>
            <option value="Federal Bureau of Investigation">Federal Bureau of Investigation</option>
            <option value="Department of Justice">Department of Justice</option>
            <option value="Department of Treasury">Department of Treasury</option>
            <option value="Securities and Exchange Commission">Securities and Exchange Commission</option>
            <option value="Intelligence Community">Intelligence Community</option>
            <option value="NIST">NIST</option>
            <option value="FDIC">FDIC</option>
            <option value="Department of State">Department of State</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Cryptocurrency Intelligence Platform"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Requirements (one per line)</label>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="NIST 800-53 compliance&#10;24/7 support&#10;FedRAMP authorization"
            rows={6}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition-colors"
        >
          Upload RFP
        </button>
      </form>
    </div>
  );
}
