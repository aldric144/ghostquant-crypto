'use client';

import React, { useState } from 'react';

interface ProposalWizardProps {
  onGenerate: (config: any) => void;
  isGenerating: boolean;
}

export default function ProposalWizard({ onGenerate, isGenerating }: ProposalWizardProps) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    rfp_id: '',
    agency: '',
    title: '',
    persona_type: 'dod',
    volumes: [] as string[]
  });

  const agencies = [
    { code: 'dod', name: 'Department of Defense' },
    { code: 'dhs', name: 'Department of Homeland Security' },
    { code: 'fbi', name: 'Federal Bureau of Investigation' },
    { code: 'doj', name: 'Department of Justice' },
    { code: 'treasury', name: 'Department of Treasury' },
    { code: 'sec', name: 'Securities and Exchange Commission' },
    { code: 'cia', name: 'Intelligence Community' },
    { code: 'nist', name: 'NIST' },
    { code: 'fdic', name: 'FDIC' },
    { code: 'state', name: 'Department of State' }
  ];

  const industries = [
    { code: 'banking', name: 'Banking' },
    { code: 'insurance', name: 'Insurance' },
    { code: 'stock_exchange', name: 'Stock Exchanges' },
    { code: 'fortune100', name: 'Fortune-100 Corporate' },
    { code: 'tech_integrator', name: 'Technology Integrators' },
    { code: 'energy_utilities', name: 'Energy & Utilities' },
    { code: 'healthcare', name: 'Healthcare' }
  ];

  const allVolumes = [
    'Executive Volume',
    'Technical Volume',
    'Program Management Volume',
    'Security & Compliance Volume',
    'Data Protection & Privacy Volume',
    'Implementation Volume',
    'Staffing & Personnel Volume',
    'Past Performance Volume',
    'Corporate Capability Volume',
    'Financial Proposal Volume',
    'Risk Management Volume',
    'Quality Assurance Volume',
    'Innovation Volume',
    'Cybersecurity Volume',
    'Federal Acquisition Requirements Volume'
  ];

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGenerate = () => {
    onGenerate(config);
  };

  const toggleVolume = (volume: string) => {
    setConfig(prev => ({
      ...prev,
      volumes: prev.volumes.includes(volume)
        ? prev.volumes.filter(v => v !== volume)
        : [...prev.volumes, volume]
    }));
  };

  const selectAllVolumes = () => {
    setConfig(prev => ({ ...prev, volumes: [...allVolumes] }));
  };

  const clearVolumes = () => {
    setConfig(prev => ({ ...prev, volumes: [] }));
  };

  return (
    <div className="proposal-wizard">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-emerald-400">Proposal Builder</h3>
          <span className="text-sm text-slate-400">Step {step} of 5</span>
        </div>
        
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded ${
                s <= step ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="min-h-96">
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-slate-200 mb-4">RFP Information</h4>
            
            <div>
              <label className="block text-sm text-slate-400 mb-2">RFP ID</label>
              <input
                type="text"
                value={config.rfp_id}
                onChange={(e) => setConfig({ ...config, rfp_id: e.target.value })}
                placeholder="RFP-2024-001"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Proposal Title</label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="Cryptocurrency Intelligence Platform"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded">
              <p className="text-sm text-cyan-300">
                Enter the RFP identification number and proposal title. These will appear on the title page and throughout the document.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-slate-200 mb-4">Select Persona</h4>
            
            <div>
              <label className="block text-sm text-slate-400 mb-2">Government Agency</label>
              <div className="grid grid-cols-2 gap-2">
                {agencies.map((agency) => (
                  <button
                    key={agency.code}
                    onClick={() => setConfig({ ...config, agency: agency.name, persona_type: agency.code })}
                    className={`p-3 rounded border text-left transition-all ${
                      config.persona_type === agency.code
                        ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-emerald-600'
                    }`}
                  >
                    <div className="font-medium text-sm">{agency.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{agency.code.toUpperCase()}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm text-slate-400 mb-2">Industry Persona</label>
              <div className="grid grid-cols-2 gap-2">
                {industries.map((industry) => (
                  <button
                    key={industry.code}
                    onClick={() => setConfig({ ...config, agency: industry.name, persona_type: industry.code })}
                    className={`p-3 rounded border text-left transition-all ${
                      config.persona_type === industry.code
                        ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-cyan-600'
                    }`}
                  >
                    <div className="font-medium text-sm">{industry.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{industry.code.toUpperCase()}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded">
              <p className="text-sm text-cyan-300">
                Select the target agency or industry. The proposal will be tailored to match their tone, priorities, and compliance requirements.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-slate-200">Configure Volumes</h4>
              <div className="flex gap-2">
                <button
                  onClick={selectAllVolumes}
                  className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={clearVolumes}
                  className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
              {allVolumes.map((volume, index) => (
                <button
                  key={volume}
                  onClick={() => toggleVolume(volume)}
                  className={`p-3 rounded border text-left transition-all ${
                    config.volumes.includes(volume)
                      ? 'bg-emerald-900/30 border-emerald-500'
                      : 'bg-slate-800 border-slate-700 hover:border-emerald-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      config.volumes.includes(volume)
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-600'
                    }`}>
                      {config.volumes.includes(volume) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-slate-200">{index + 1}. {volume}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded">
              <p className="text-sm text-cyan-300">
                Selected: {config.volumes.length} of {allVolumes.length} volumes. All volumes are recommended for complete proposals.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-slate-200 mb-4">Review Configuration</h4>
            
            <div className="space-y-3">
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded">
                <div className="text-sm text-slate-400 mb-1">RFP ID</div>
                <div className="text-slate-200 font-medium">{config.rfp_id || 'Not set'}</div>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded">
                <div className="text-sm text-slate-400 mb-1">Title</div>
                <div className="text-slate-200 font-medium">{config.title || 'Not set'}</div>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded">
                <div className="text-sm text-slate-400 mb-1">Agency / Industry</div>
                <div className="text-slate-200 font-medium">{config.agency || 'Not set'}</div>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded">
                <div className="text-sm text-slate-400 mb-1">Persona</div>
                <div className="text-emerald-400 font-medium">{config.persona_type.toUpperCase()}</div>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded">
                <div className="text-sm text-slate-400 mb-1">Volumes</div>
                <div className="text-slate-200 font-medium">
                  {config.volumes.length > 0 ? `${config.volumes.length} volumes selected` : 'All 15 volumes (default)'}
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded">
              <p className="text-sm text-emerald-300">
                Ready to generate! This will create a complete 40-120 page proposal with all selected volumes.
              </p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-slate-200 mb-4">Generate Proposal</h4>
            
            {isGenerating ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mb-4"></div>
                <p className="text-slate-300 mb-2">Generating proposal...</p>
                <p className="text-sm text-slate-500">This may take a few moments</p>
              </div>
            ) : (
              <>
                <div className="p-6 bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border border-emerald-500/30 rounded-lg text-center">
                  <div className="text-6xl mb-4">📄</div>
                  <h5 className="text-xl font-semibold text-emerald-400 mb-2">Ready to Generate</h5>
                  <p className="text-slate-300 mb-4">
                    Click the button below to generate your complete proposal package
                  </p>
                  <button
                    onClick={handleGenerate}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Generate Proposal
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="p-3 bg-slate-800/50 rounded">
                    <div className="text-2xl font-bold text-emerald-400">15</div>
                    <div className="text-slate-400">Volumes</div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded">
                    <div className="text-2xl font-bold text-cyan-400">40-120</div>
                    <div className="text-slate-400">Pages</div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded">
                    <div className="text-2xl font-bold text-emerald-400">6K+</div>
                    <div className="text-slate-400">Words</div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
        
        <div className="text-sm text-slate-500">
          Step {step} of 5
        </div>

        {step < 5 ? (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => setStep(1)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
          >
            Start Over
          </button>
        )}
      </div>
    </div>
  );
}
