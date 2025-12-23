'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
;

import { useState } from 'react';
import { partnerClient, PartnerProgram } from './PartnerClient';

export default function PartnersPage() {
  const [selectedProgram, setSelectedProgram] = useState<PartnerProgram | null>(null);
  const [programs, setPrograms] = useState<PartnerProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tiers' | 'commissions' | 'agreement'>('overview');

  const [partnerName, setPartnerName] = useState('');
  const [partnerType, setPartnerType] = useState('reseller');
  const [targetTier, setTargetTier] = useState('silver');
  const [territory, setTerritory] = useState('United States');
  const [targetRevenue, setTargetRevenue] = useState('150000');

  const handleGenerateProgram = async () => {
    if (!partnerName) {
      setError('Partner name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const program = await partnerClient.generatePartnerProgram({
        partner_name: partnerName,
        partner_type: partnerType,
        target_tier: targetTier,
        territory: territory.split(',').map(t => t.trim()),
        target_revenue: parseFloat(targetRevenue),
      });

      setSelectedProgram(program);
      setPrograms([program, ...programs]);
      
      setPartnerName('');
      setTargetRevenue('150000');
    } catch (err: any) {
      setError(err.message || 'Failed to generate partner program');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPrograms = async () => {
    setLoading(true);
    setError(null);

    try {
      const loadedPrograms = await partnerClient.listPartnerPrograms();
      setPrograms(loadedPrograms);
    } catch (err: any) {
      setError(err.message || 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <TerminalBackButton className="mb-4" />
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Partner Program Generator
          </h1>
          <p className="text-gray-400">
            Generate comprehensive partner programs, reseller agreements, and channel playbooks
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Partner Library & Generator */}
          <div className="space-y-6">
            {/* Generator Form */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-emerald-400">
                Generate Partner Program
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Partner Name
                  </label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="Acme Corporation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Partner Type
                  </label>
                  <select
                    value={partnerType}
                    onChange={(e) => setPartnerType(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="reseller">Reseller</option>
                    <option value="var">Value-Added Reseller (VAR)</option>
                    <option value="msp">Managed Service Provider (MSP)</option>
                    <option value="si">Systems Integrator (SI)</option>
                    <option value="distributor">Distributor</option>
                    <option value="oem">OEM</option>
                    <option value="referral">Referral Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Target Tier
                  </label>
                  <select
                    value={targetTier}
                    onChange={(e) => setTargetTier(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                    <option value="elite">Elite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Territory
                  </label>
                  <input
                    type="text"
                    value={territory}
                    onChange={(e) => setTerritory(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="United States, Canada"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Target Annual Revenue ($)
                  </label>
                  <input
                    type="number"
                    value={targetRevenue}
                    onChange={(e) => setTargetRevenue(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="150000"
                  />
                </div>

                <button
                  onClick={handleGenerateProgram}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                >
                  {loading ? 'Generating...' : 'Generate Partner Program'}
                </button>
              </div>
            </div>

            {/* Partner Library */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-emerald-400">
                  Partner Library
                </h2>
                <button
                  onClick={handleLoadPrograms}
                  disabled={loading}
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  Refresh
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {programs.length === 0 ? (
                  <p className="text-gray-500 text-sm">No programs generated yet</p>
                ) : (
                  programs.map((program) => (
                    <button
                      key={program.package_id}
                      onClick={() => setSelectedProgram(program)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedProgram?.package_id === program.package_id
                          ? 'bg-emerald-500/20 border-emerald-500'
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-medium text-white">{program.partner_name}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {program.tier.charAt(0).toUpperCase() + program.tier.slice(1)} • {program.partner_type}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(program.generated_at).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN: Program Details */}
          <div className="lg:col-span-2">
            {selectedProgram ? (
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                {/* Program Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedProgram.partner_name}
                  </h2>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                      {selectedProgram.tier.charAt(0).toUpperCase() + selectedProgram.tier.slice(1)} Tier
                    </span>
                    <span className="text-gray-400">
                      {selectedProgram.partner_type.toUpperCase()}
                    </span>
                    <span className="text-gray-500">
                      {new Date(selectedProgram.generated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-800">
                  {(['overview', 'tiers', 'commissions', 'agreement'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 font-medium transition-all ${
                        activeTab === tab
                          ? 'text-emerald-400 border-b-2 border-emerald-400'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-4">
                  {activeTab === 'overview' && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Program Summary</h3>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300 whitespace-pre-wrap">{selectedProgram.summary}</p>
                      </div>

                      {selectedProgram.metadata && (
                        <div className="mt-6 grid grid-cols-2 gap-4">
                          <div className="bg-black/50 p-4 rounded-lg">
                            <div className="text-sm text-gray-400 mb-1">Target Revenue</div>
                            <div className="text-xl font-semibold text-white">
                              ${selectedProgram.metadata.target_revenue?.toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-black/50 p-4 rounded-lg">
                            <div className="text-sm text-gray-400 mb-1">Territory</div>
                            <div className="text-xl font-semibold text-white">
                              {selectedProgram.metadata.territory?.join(', ')}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'tiers' && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Tier Structure</h3>
                      <p className="text-gray-400">
                        Tier details will be loaded from the API endpoint.
                      </p>
                    </div>
                  )}

                  {activeTab === 'commissions' && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Commission Model</h3>
                      <p className="text-gray-400">
                        Commission details will be loaded from the API endpoint.
                      </p>
                    </div>
                  )}

                  {activeTab === 'agreement' && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Reseller Agreement</h3>
                      <p className="text-gray-400">
                        Agreement details will be loaded from the API endpoint.
                      </p>
                    </div>
                  )}
                </div>

                {/* Export Actions */}
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Export Options</h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-all">
                      Download PDF
                    </button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-all">
                      Export JSON
                    </button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-all">
                      Export Markdown
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-12 text-center">
                <div className="text-gray-500 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-lg">No partner program selected</p>
                  <p className="text-sm mt-2">
                    Generate a new program or select one from the library
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
