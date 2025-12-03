'use client';

/**
 * RFP Wizard Component
 * 
 * 4-step proposal builder UI with animated transitions.
 */

import React, { useState } from 'react';
import { RFPClient, RFPRequirement } from './RFPClient';

interface RFPWizardProps {
  onComplete: (proposalId: string) => void;
  onCancel: () => void;
}

type WizardStep = 1 | 2 | 3 | 4;

export default function RFPWizard({ onComplete, onCancel }: RFPWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [rfpId, setRfpId] = useState('');
  const [agency, setAgency] = useState('');
  const [title, setTitle] = useState('');
  const [requirements, setRequirements] = useState<RFPRequirement[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new RFPClient();

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      if (requirements.length > 0) {
        await client.uploadRequirements(rfpId, requirements);
      }

      const result = await client.generateProposal(rfpId, agency, title);

      if (result.success) {
        onComplete(result.proposal.proposal_id);
      } else {
        setError('Failed to generate proposal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-emerald-500/30 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 border-b border-emerald-500/30 p-6">
          <h2 className="text-2xl font-bold text-white mb-2">RFP Proposal Generator</h2>
          <div className="text-emerald-400">Step {currentStep} of 4</div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-800/50 h-2">
          <div
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-500"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400">
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <Step1
              rfpId={rfpId}
              setRfpId={setRfpId}
              agency={agency}
              setAgency={setAgency}
              title={title}
              setTitle={setTitle}
            />
          )}

          {currentStep === 2 && (
            <Step2 requirements={requirements} setRequirements={setRequirements} />
          )}

          {currentStep === 3 && (
            <Step3 rfpId={rfpId} agency={agency} title={title} requirements={requirements} />
          )}

          {currentStep === 4 && <Step4 isGenerating={isGenerating} />}
        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 border-t border-gray-700/50 p-6 flex justify-between">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            {currentStep > 1 && currentStep < 4 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Back
              </button>
            )}

            {currentStep < 3 && (
              <button
                onClick={handleNext}
                disabled={currentStep === 1 && (!rfpId || !agency || !title)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}

            {currentStep === 3 && (
              <button
                onClick={() => {
                  handleNext();
                  handleGenerate();
                }}
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded transition-colors font-semibold"
              >
                Generate Proposal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step1({
  rfpId,
  setRfpId,
  agency,
  setAgency,
  title,
  setTitle,
}: {
  rfpId: string;
  setRfpId: (v: string) => void;
  agency: string;
  setAgency: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">Basic Information</h3>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">RFP ID *</label>
        <input
          type="text"
          value={rfpId}
          onChange={(e) => setRfpId(e.target.value)}
          placeholder="e.g., RFP-2025-001"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Agency *</label>
        <input
          type="text"
          value={agency}
          onChange={(e) => setAgency(e.target.value)}
          placeholder="e.g., Department of Justice"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Proposal Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Cryptocurrency Intelligence Platform"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

function Step2({
  requirements,
  setRequirements,
}: {
  requirements: RFPRequirement[];
  setRequirements: (v: RFPRequirement[]) => void;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">Requirements (Optional)</h3>
      <p className="text-gray-400 mb-4">
        Add specific RFP requirements to track compliance. This step is optional.
      </p>

      <div className="text-center text-gray-500 py-8">
        <div className="text-4xl mb-3">📋</div>
        <div>Requirements upload coming soon</div>
        <div className="text-sm mt-2">Skip this step to use default proposal structure</div>
      </div>
    </div>
  );
}

function Step3({
  rfpId,
  agency,
  title,
  requirements,
}: {
  rfpId: string;
  agency: string;
  title: string;
  requirements: RFPRequirement[];
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">Review & Confirm</h3>

      <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 space-y-4">
        <div>
          <div className="text-sm text-gray-400 mb-1">RFP ID</div>
          <div className="text-white font-mono">{rfpId}</div>
        </div>

        <div>
          <div className="text-sm text-gray-400 mb-1">Agency</div>
          <div className="text-white">{agency}</div>
        </div>

        <div>
          <div className="text-sm text-gray-400 mb-1">Proposal Title</div>
          <div className="text-white">{title}</div>
        </div>

        <div>
          <div className="text-sm text-gray-400 mb-1">Requirements</div>
          <div className="text-white">
            {requirements.length > 0 ? `${requirements.length} requirements` : 'Using default structure'}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700/50">
          <div className="text-sm text-gray-400 mb-1">Proposal will include</div>
          <div className="text-emerald-400">
            12 fully-written sections with government-ready content
          </div>
        </div>
      </div>

      <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
        <div className="text-cyan-400 font-semibold mb-2">✓ Ready to Generate</div>
        <div className="text-sm text-gray-300">
          Click "Generate Proposal" to create your complete RFP response package.
        </div>
      </div>
    </div>
  );
}

function Step4({ isGenerating }: { isGenerating: boolean }) {
  return (
    <div className="space-y-6 text-center py-8">
      <h3 className="text-xl font-bold text-white mb-4">
        {isGenerating ? 'Generating Proposal...' : 'Proposal Generated!'}
      </h3>

      {isGenerating ? (
        <>
          <div className="flex justify-center">
            <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
          <div className="text-gray-400">
            Creating your government-grade RFP response with 12 fully-written sections...
          </div>
        </>
      ) : (
        <>
          <div className="text-6xl mb-4">✓</div>
          <div className="text-emerald-400 text-xl font-semibold">Success!</div>
          <div className="text-gray-400">Your proposal has been generated and saved.</div>
        </>
      )}
    </div>
  );
}
