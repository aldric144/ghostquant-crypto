/**
 * AnnotateWalletForm - Form component for adding analyst notes
 * 
 * Allows analysts to add notes, tags, and update entity classification
 * for a wallet profile.
 * This is a NEW isolated component - does NOT modify any existing code.
 */

'use client';

import { useState, FormEvent } from 'react';

export interface AnnotateRequest {
  address: string;
  notes: string;
  tags?: string[];
  entity_type?: string;
  risk_score?: number;
}

export interface AnnotateWalletFormProps {
  address: string;
  onSubmit: (data: AnnotateRequest) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export default function AnnotateWalletForm({
  address,
  onSubmit,
  isLoading = false,
  className = '',
}: AnnotateWalletFormProps) {
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [entityType, setEntityType] = useState('');
  const [riskScore, setRiskScore] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!notes.trim()) {
      setError('Notes are required');
      return;
    }

    try {
      const data: AnnotateRequest = {
        address,
        notes: notes.trim(),
      };

      if (tagsInput.trim()) {
        data.tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
      }

      if (entityType) {
        data.entity_type = entityType;
      }

      if (riskScore) {
        const score = parseFloat(riskScore);
        if (!isNaN(score) && score >= 0 && score <= 1) {
          data.risk_score = score;
        }
      }

      await onSubmit(data);
      setSuccess(true);
      setNotes('');
      setTagsInput('');
      setEntityType('');
      setRiskScore('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to annotate wallet');
    }
  };

  return (
    <div className={`bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Add Annotation</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Notes */}
        <div>
          <label className="block text-gray-400 text-sm mb-1">Notes *</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter analyst notes..."
            disabled={isLoading}
            rows={3}
            className="w-full px-3 py-2 bg-slate-900/70 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/60 disabled:opacity-50 text-sm"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-gray-400 text-sm mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="tag1, tag2, tag3"
            disabled={isLoading}
            className="w-full px-3 py-2 bg-slate-900/70 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/60 disabled:opacity-50 text-sm"
          />
        </div>

        {/* Entity Type and Risk Score */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Entity Type</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-900/70 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/60 disabled:opacity-50 text-sm"
            >
              <option value="">Select type...</option>
              <option value="whale">Whale</option>
              <option value="exchange">Exchange</option>
              <option value="mixer">Mixer</option>
              <option value="exploit">Exploit</option>
              <option value="normal">Normal</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Risk Score (0-1)</label>
            <input
              type="number"
              value={riskScore}
              onChange={(e) => setRiskScore(e.target.value)}
              placeholder="0.5"
              min="0"
              max="1"
              step="0.1"
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-900/70 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/60 disabled:opacity-50 text-sm"
            />
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
        {success && (
          <p className="text-green-400 text-sm">Annotation added successfully!</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !notes.trim()}
          className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Saving...' : 'Save Annotation'}
        </button>
      </form>
    </div>
  );
}
