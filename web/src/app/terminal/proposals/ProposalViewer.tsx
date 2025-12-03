'use client';

import React from 'react';

interface ProposalVolume {
  volume_id: string;
  volume_name: string;
  volume_number: number;
  total_words: number;
  page_estimate: number;
}

interface ProposalDocument {
  document_id: string;
  title: string;
  agency: string;
  rfp_number: string;
  total_pages: number;
  total_words: number;
  persona: string;
  generated_at: string;
  volumes: ProposalVolume[];
}

interface ProposalViewerProps {
  document: ProposalDocument;
  htmlContent?: string;
}

export default function ProposalViewer({ document, htmlContent }: ProposalViewerProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="proposal-viewer">
      <div className="mb-6 p-6 bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border border-emerald-500/30 rounded-lg">
        <h2 className="text-2xl font-bold text-emerald-400 mb-2">{document.title}</h2>
        <p className="text-slate-300 mb-4">{document.agency}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">RFP Number:</span>
            <span className="ml-2 text-slate-200">{document.rfp_number}</span>
          </div>
          <div>
            <span className="text-slate-500">Document ID:</span>
            <span className="ml-2 text-slate-200 font-mono text-xs">{document.document_id}</span>
          </div>
          <div>
            <span className="text-slate-500">Total Pages:</span>
            <span className="ml-2 text-emerald-400 font-semibold">{document.total_pages}</span>
          </div>
          <div>
            <span className="text-slate-500">Total Words:</span>
            <span className="ml-2 text-cyan-400 font-semibold">{document.total_words.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500">Persona:</span>
            <span className="ml-2 text-slate-200">{document.persona.toUpperCase()}</span>
          </div>
          <div>
            <span className="text-slate-500">Generated:</span>
            <span className="ml-2 text-slate-200">{formatDate(document.generated_at)}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-emerald-400 mb-4">Proposal Volumes</h3>
        <div className="space-y-2">
          {document.volumes.map((volume) => (
            <div
              key={volume.volume_id}
              className="p-4 bg-slate-800/50 border border-slate-700 rounded hover:border-emerald-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-emerald-500">{volume.volume_number}</span>
                    <h4 className="text-slate-200 font-medium">{volume.volume_name}</h4>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-400">
                    <span>{volume.total_words.toLocaleString()} words</span>
                    <span>~{volume.page_estimate} pages</span>
                  </div>
                </div>
                <div className="w-16 h-16 flex items-center justify-center bg-emerald-900/20 border border-emerald-500/30 rounded">
                  <span className="text-xs text-emerald-400 font-mono">{volume.page_estimate}p</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {htmlContent && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Preview</h3>
          <div 
            className="p-6 bg-white text-slate-900 rounded border border-slate-700 overflow-auto max-h-96"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      )}

      <div className="p-4 bg-slate-800/30 border border-slate-700 rounded text-center">
        <p className="text-slate-400 text-sm">
          Full proposal content available via export options
        </p>
      </div>
    </div>
  );
}
